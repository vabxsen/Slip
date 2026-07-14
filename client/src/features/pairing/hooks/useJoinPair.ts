import type { PairJoinError } from '@slip/shared';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/router/paths';
import { peerSession } from '@/services/webrtc/peerSession';
import { useConnectionStore } from '@/store/connectionStore';
import { useDeviceStore } from '@/store/deviceStore';
import { showToast } from '@/store/toastStore';
import { joinRoom } from '../services/pairingClient';

export type JoinState = 'idle' | 'joining' | 'error';

const ERROR_MESSAGE: Record<PairJoinError, string> = {
  'not-found': 'No device is waiting with that code.',
  expired: 'That code has expired. Ask for a fresh one.',
  'room-full': 'That device is already paired with someone else.',
  'invalid-code': 'Enter the full 6-digit code.',
};

export function useJoinPair() {
  const navigate = useNavigate();
  const device = useDeviceStore((s) => s.device);
  const addPeer = useConnectionStore((s) => s.addPeer);
  const [state, setState] = useState<JoinState>('idle');
  const [error, setError] = useState<string | null>(null);

  const join = async (code: string) => {
    setState('joining');
    setError(null);
    try {
      const result = await joinRoom(code, device);
      if (result.ok) {
        addPeer({ ...result.peer, quality: 'unknown', connectedAt: Date.now() });
        // Joiner drives the WebRTC handshake (opens the data channel → offer).
        peerSession.start('initiator', result.peer);
        showToast(`Connected to ${result.peer.name}`, 'success');
        navigate(ROUTES.home);
        return;
      }
      setError(ERROR_MESSAGE[result.error]);
      setState('error');
    } catch {
      setError('Could not reach the server. Check your connection.');
      setState('error');
    }
  };

  return { join, state, error };
}
