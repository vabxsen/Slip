import { randomInt } from 'node:crypto';
import type { DeviceInfo, PairJoinError } from '@slip/shared';
import { PAIR_CODE_LENGTH, PAIR_CODE_TTL_MS } from '@slip/shared';
import { MAX_ROOM_MEMBERS } from '../../config/constants';

export interface RoomMember {
  socketId: string;
  device: DeviceInfo;
}

export interface Room {
  code: string;
  members: RoomMember[];
  /** After this instant the code stops accepting new joiners. */
  expiresAt: number;
}

export type JoinOutcome =
  | { ok: true; room: Room; host: RoomMember }
  | { ok: false; error: PairJoinError };

const CODE_MAX = 10 ** PAIR_CODE_LENGTH;
const CODE_PATTERN = new RegExp(`^\\d{${PAIR_CODE_LENGTH}}$`);

/**
 * In-memory registry of pairing rooms keyed by a short numeric code.
 *
 * Rooms live only in this process — horizontal scaling would swap this for a
 * shared store (e.g. Redis) behind the same interface, which is why every
 * lookup goes through these methods rather than touching a Map directly.
 */
export class RoomRegistry {
  private readonly rooms = new Map<string, Room>();
  private readonly socketToCode = new Map<string, string>();

  private allocateCode(): string {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const code = String(randomInt(0, CODE_MAX)).padStart(PAIR_CODE_LENGTH, '0');
      if (!this.rooms.has(code)) return code;
    }
    throw new Error('Unable to allocate a unique pair code');
  }

  /** Creates a room owned by `member` and returns its fresh code + expiry. */
  createRoom(member: RoomMember): Room {
    // A socket can only host one room; drop any previous one.
    this.removeSocket(member.socketId);
    const room: Room = {
      code: this.allocateCode(),
      members: [member],
      expiresAt: Date.now() + PAIR_CODE_TTL_MS,
    };
    this.rooms.set(room.code, room);
    this.socketToCode.set(member.socketId, room.code);
    return room;
  }

  /** Attempts to add `member` to the room named by `code`. */
  joinRoom(code: string, member: RoomMember): JoinOutcome {
    if (!CODE_PATTERN.test(code)) return { ok: false, error: 'invalid-code' };

    const room = this.rooms.get(code);
    if (!room) return { ok: false, error: 'not-found' };

    if (room.members.length >= MAX_ROOM_MEMBERS) return { ok: false, error: 'room-full' };
    if (Date.now() > room.expiresAt) {
      this.rooms.delete(code);
      return { ok: false, error: 'expired' };
    }

    const host = room.members[0];
    if (!host) {
      this.rooms.delete(code);
      return { ok: false, error: 'not-found' };
    }

    this.removeSocket(member.socketId);
    room.members.push(member);
    this.socketToCode.set(member.socketId, code);
    return { ok: true, room, host };
  }

  getRoomBySocket(socketId: string): Room | undefined {
    const code = this.socketToCode.get(socketId);
    return code ? this.rooms.get(code) : undefined;
  }

  /** The other member sharing a room with `socketId`, if any. */
  getPeer(socketId: string): RoomMember | undefined {
    return this.getRoomBySocket(socketId)?.members.find((m) => m.socketId !== socketId);
  }

  /**
   * Removes a socket from whatever room it belongs to. Returns the room and
   * the peer that should be notified, or null if the socket was in no room.
   */
  removeSocket(socketId: string): { room: Room; peer: RoomMember | null } | null {
    const code = this.socketToCode.get(socketId);
    if (!code) return null;
    this.socketToCode.delete(socketId);

    const room = this.rooms.get(code);
    if (!room) return null;

    room.members = room.members.filter((m) => m.socketId !== socketId);
    const peer = room.members[0] ?? null;
    if (room.members.length === 0) this.rooms.delete(code);
    return { room, peer };
  }

  /** Drops empty rooms and expired rooms that never completed pairing. */
  sweep(now: number = Date.now()): void {
    for (const [code, room] of this.rooms) {
      const staleUnpaired = room.members.length < MAX_ROOM_MEMBERS && now > room.expiresAt;
      if (room.members.length === 0 || staleUnpaired) {
        for (const member of room.members) this.socketToCode.delete(member.socketId);
        this.rooms.delete(code);
      }
    }
  }

  get size(): number {
    return this.rooms.size;
  }
}
