import type { RoomRegistry } from '../../modules/pairing/roomRegistry';
import type { SlipSocket } from '../types';

/**
 * Relays WebRTC handshake messages to the other member of the room. The
 * server only forwards opaque SDP/ICE blobs — it never inspects or stores
 * them, and media/data never flows through here.
 */
export function registerSignalingHandlers(socket: SlipSocket, registry: RoomRegistry): void {
  socket.on('signal:description', (payload) => {
    const peer = registry.getPeer(socket.id);
    if (peer) socket.to(peer.socketId).emit('signal:description', payload);
  });

  socket.on('signal:candidate', (payload) => {
    const peer = registry.getPeer(socket.id);
    if (peer) socket.to(peer.socketId).emit('signal:candidate', payload);
  });
}
