'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const ONE_SECOND_MS = 1000;

function readCooldownExpiry(storageKey: string) {
  if (typeof window === 'undefined') {
    return 0;
  }

  const rawValue = window.localStorage.getItem(storageKey);
  const parsedValue = rawValue ? Number(rawValue) : 0;

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function persistCooldownExpiry(storageKey: string, expiresAt: number) {
  if (typeof window === 'undefined') {
    return;
  }

  if (expiresAt <= Date.now()) {
    window.localStorage.removeItem(storageKey);

    return;
  }

  window.localStorage.setItem(storageKey, String(expiresAt));
}

export function useResendCooldown(storageKey: string, durationSeconds: number) {
  const [now, setNow] = useState(() => Date.now());
  const [overrideState, setOverrideState] = useState<{ key: string; expiresAt: number } | null>(
    null,
  );
  const storedExpiresAt = useMemo(() => readCooldownExpiry(storageKey), [storageKey]);
  const expiresAt = overrideState?.key === storageKey ? overrideState.expiresAt : storedExpiresAt;

  useEffect(() => {
    if (expiresAt <= now) {
      persistCooldownExpiry(storageKey, 0);

      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, ONE_SECOND_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [expiresAt, now, storageKey]);

  const remainingSeconds = useMemo(() => {
    if (expiresAt <= now) {
      return 0;
    }

    return Math.ceil((expiresAt - now) / ONE_SECOND_MS);
  }, [expiresAt, now]);

  const startCooldown = useCallback(() => {
    const nextExpiry = Date.now() + durationSeconds * ONE_SECOND_MS;

    setOverrideState({ key: storageKey, expiresAt: nextExpiry });
    setNow(Date.now());
    persistCooldownExpiry(storageKey, nextExpiry);
  }, [durationSeconds, storageKey]);

  const resetCooldown = useCallback(() => {
    setOverrideState({ key: storageKey, expiresAt: 0 });
    setNow(Date.now());
    persistCooldownExpiry(storageKey, 0);
  }, [storageKey]);

  return {
    isCoolingDown: remainingSeconds > 0,
    remainingSeconds,
    startCooldown,
    resetCooldown,
  };
}
