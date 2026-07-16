/**
 * In-memory registry mapping a claimed username to the socket currently
 * representing it. Mirrors RoomRegistry's shape/lifecycle.
 *
 * Deliberate v1 simplification: last-write-wins per username, no
 * multi-device fan-out — registering on a second device just takes over
 * presence for that username.
 */
export class PresenceRegistry {
  private readonly usernameToSocket = new Map<string, string>();
  private readonly socketToUsername = new Map<string, string>();

  register(username: string, socketId: string): void {
    const previous = this.socketToUsername.get(socketId);
    if (previous) this.usernameToSocket.delete(previous);
    this.usernameToSocket.set(username, socketId);
    this.socketToUsername.set(socketId, username);
  }

  getSocketId(username: string): string | undefined {
    return this.usernameToSocket.get(username);
  }

  removeSocket(socketId: string): void {
    const username = this.socketToUsername.get(socketId);
    if (!username) return;
    this.socketToUsername.delete(socketId);
    // Only clear the username's mapping if it still points at this socket
    // (a newer connection for the same username may have already taken over).
    if (this.usernameToSocket.get(username) === socketId) {
      this.usernameToSocket.delete(username);
    }
  }

  get size(): number {
    return this.usernameToSocket.size;
  }
}
