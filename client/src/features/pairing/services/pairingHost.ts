import { useDeviceStore } from '@/store/deviceStore';
import { usePairingStore } from '../store/pairingStore';
import { createRoom } from './pairingClient';

/**
 * Registers this device as a joinable host and stores the issued code.
 * Called on every socket (re)connect and by the "new code" button.
 */
export async function hostRoom(): Promise<void> {
  const { setStatus, setCode } = usePairingStore.getState();
  const { device } = useDeviceStore.getState();
  setStatus('creating');
  try {
    const { code, expiresAt } = await createRoom(device);
    setCode(code, expiresAt);
  } catch {
    setStatus('error');
  }
}
