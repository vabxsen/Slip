import type { PublicProfile } from '@slip/shared';
import { useState } from 'react';
import { fetchPublicProfileByUsername } from '@/services/firestore/publicProfileCloud';
import { useDeviceStore } from '@/store/deviceStore';
import { requestConnect } from '../services/connectRequestClient';
import { useConnectRequestStore } from '../store/connectRequestStore';

export type LookupStatus = 'idle' | 'looking-up' | 'found' | 'not-found';

/** Drives the "type a username, see who it is, send a request" flow. */
export function useConnectByUsername() {
  const device = useDeviceStore((s) => s.device);
  const outgoing = useConnectRequestStore((s) => s.outgoing);
  const setOutgoing = useConnectRequestStore((s) => s.setOutgoing);
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const lookup = async (username: string) => {
    setLookupStatus('looking-up');
    setSendError(null);
    const result = await fetchPublicProfileByUsername(username.trim());
    if (result) {
      setProfile(result);
      setLookupStatus('found');
    } else {
      setProfile(null);
      setLookupStatus('not-found');
    }
  };

  const send = async () => {
    if (!profile) return;
    setSendError(null);
    const result = await requestConnect(profile.username, device);
    if (result.ok) {
      setOutgoing({ requestId: result.requestId, status: 'pending', peerProfile: profile });
    } else {
      setSendError(result.reason === 'offline' ? `${profile.username} isn't online right now.` : 'Something went wrong — try again.');
    }
  };

  const reset = () => {
    setLookupStatus('idle');
    setProfile(null);
    setSendError(null);
    setOutgoing(null);
  };

  return { lookupStatus, profile, sendError, outgoing, lookup, send, reset };
}
