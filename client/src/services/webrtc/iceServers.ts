/**
 * ICE configuration. Public STUN handles most NAT traversal; a TURN relay
 * (for symmetric-NAT / restrictive networks) is a planned future addition and
 * would simply be appended here.
 */
export const ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
];

/** Label for the transfer data channel; both peers must agree on it. */
export const DATA_CHANNEL_LABEL = 'slip-transfer';
