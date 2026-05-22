'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DraftRegistryEntry = {
  applicationId: string;
  callId: string;
  teamId: string;
  updatedAt: string;
};

type DraftRegistryEntries = Record<string, DraftRegistryEntry>;

type DraftRegistryState = {
  entries: DraftRegistryEntries;
  saveEntry: (applicationId: string, teamId: string, callId: string) => void;
};

const DRAFT_REGISTRY_KEY = 'nti:program-a-draft-registry';

function buildDraftRegistryKey(teamId: string, callId: string) {
  return `${teamId}:${callId}`;
}

export const useDraftRegistryStore = create<DraftRegistryState>()(
  persist(
    (set) => ({
      entries: {},
      saveEntry: (applicationId, teamId, callId) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [buildDraftRegistryKey(teamId, callId)]: {
              applicationId,
              callId,
              teamId,
              updatedAt: new Date().toISOString(),
            },
          },
        })),
    }),
    {
      name: DRAFT_REGISTRY_KEY,
      partialize: (state) => ({
        entries: state.entries,
      }),
    },
  ),
);

export function saveDraftRegistryEntry(applicationId: string, teamId: string, callId: string) {
  useDraftRegistryStore.getState().saveEntry(applicationId, teamId, callId);
}

export function getDraftRegistryEntry(teamId: string, callId: string) {
  return useDraftRegistryStore.getState().entries[buildDraftRegistryKey(teamId, callId)] ?? null;
}

export function listDraftRegistryEntries(teamId?: string | null) {
  const entries = Object.values(useDraftRegistryStore.getState().entries);

  if (!teamId) {
    return entries;
  }

  return entries.filter((entry) => entry.teamId === teamId);
}
