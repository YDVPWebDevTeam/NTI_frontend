'use client';

export type DraftRegistryEntry = {
  applicationId: string;
  callId: string;
  teamId: string;
  updatedAt: string;
};

type DraftRegistryStore = Record<string, DraftRegistryEntry>;

const DRAFT_REGISTRY_KEY = 'nti:program-a-draft-registry';

function buildDraftRegistryKey(teamId: string, callId: string) {
  return `${teamId}:${callId}`;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readDraftRegistry(): DraftRegistryStore {
  if (!canUseStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(DRAFT_REGISTRY_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as DraftRegistryStore;

    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function writeDraftRegistry(store: DraftRegistryStore) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(DRAFT_REGISTRY_KEY, JSON.stringify(store));
}

export function saveDraftRegistryEntry(applicationId: string, teamId: string, callId: string) {
  const store = readDraftRegistry();
  const key = buildDraftRegistryKey(teamId, callId);

  store[key] = {
    applicationId,
    teamId,
    callId,
    updatedAt: new Date().toISOString(),
  };

  writeDraftRegistry(store);
}

export function getDraftRegistryEntry(teamId: string, callId: string) {
  return readDraftRegistry()[buildDraftRegistryKey(teamId, callId)] ?? null;
}

export function listDraftRegistryEntries(teamId?: string | null) {
  const store = readDraftRegistry();
  const entries = Object.values(store);

  if (!teamId) {
    return entries;
  }

  return entries.filter((entry) => entry.teamId === teamId);
}
