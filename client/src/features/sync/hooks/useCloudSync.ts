import { useEffect, useRef } from 'react';
import { queryClient } from '@/app/queryClient';
import { useAuthStore } from '@/features/auth/store/authStore';
import { HISTORY_QUERY_KEY } from '@/features/history/hooks/useHistoryQuery';
import { subscribeToHistoryCollection } from '@/services/firestore/historyCloud';
import {
  fetchUserDocForMerge,
  pushUserDoc,
  subscribeToUserDoc,
  type UserSettingsDoc,
} from '@/services/firestore/settingsCloud';
import { saveHistoryRecord } from '@/services/storage/historyDb';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Mounts once at app startup. While signed in, keeps personal info, trusted
 * devices, and transfer history synced with this user's Firestore data —
 * reconciling once on sign-in, then mirroring live changes in both
 * directions. No-ops entirely while signed out; local Zustand/IndexedDB data
 * is left untouched as the offline/signed-out fallback.
 */
export function useCloudSync(): void {
  const uid = useAuthStore((state) => state.user?.uid);
  const isApplyingRemoteRef = useRef(false);

  useEffect(() => {
    if (!uid) return;

    let cancelled = false;
    let unsubscribeSettings: (() => void) | null = null;
    let unsubscribeHistory: (() => void) | null = null;

    const applyRemoteSettings = (remote: UserSettingsDoc) => {
      isApplyingRemoteRef.current = true;
      useSettingsStore.setState({
        personalInfo: remote.personalInfo,
        trustedDevices: remote.trustedDevices,
      });
      isApplyingRemoteRef.current = false;
    };

    void (async () => {
      const { personalInfo, trustedDevices, trustDevice, setPersonalInfo } = useSettingsStore.getState();
      const local: UserSettingsDoc = { personalInfo, trustedDevices };
      const cloud = await fetchUserDocForMerge(uid, local);
      if (cancelled) return;

      if (cloud) {
        // Merge non-destructively: cloud name wins if set, trusted devices
        // are unioned (never destroyed) via the existing dedupe-by-id logic
        // already built into trustDevice().
        isApplyingRemoteRef.current = true;
        const mergedFullName = cloud.personalInfo.fullName || local.personalInfo.fullName;
        if (mergedFullName !== local.personalInfo.fullName) setPersonalInfo({ fullName: mergedFullName });
        for (const device of cloud.trustedDevices) trustDevice(device);
        isApplyingRemoteRef.current = false;

        const merged = useSettingsStore.getState();
        await pushUserDoc(uid, {
          personalInfo: merged.personalInfo,
          trustedDevices: merged.trustedDevices,
        });
      }
      if (cancelled) return;

      unsubscribeSettings = await subscribeToUserDoc(uid, applyRemoteSettings);
      unsubscribeHistory = await subscribeToHistoryCollection(uid, (records) => {
        void Promise.all(records.map((record) => saveHistoryRecord(record))).then(() => {
          void queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
        });
      });
    })();

    const unsubscribePush = useSettingsStore.subscribe((state, prevState) => {
      if (isApplyingRemoteRef.current) return;
      if (state.personalInfo === prevState.personalInfo && state.trustedDevices === prevState.trustedDevices) {
        return;
      }
      void pushUserDoc(uid, {
        personalInfo: state.personalInfo,
        trustedDevices: state.trustedDevices,
      });
    });

    return () => {
      cancelled = true;
      unsubscribeSettings?.();
      unsubscribeHistory?.();
      unsubscribePush();
    };
  }, [uid]);
}
