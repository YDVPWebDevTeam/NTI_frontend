'use client';

import { t } from '@lingui/core/macro';

import { UserRole } from 'lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/shadcn';

import { ConversationPanel } from './conversation-panel';
import type { ConversationAnchor } from './types';

const COMPANY_ROLES: UserRole[] = [UserRole.COMPANY_OWNER, UserRole.COMPANY_EMPLOYEE];

/** Roles that may post to the PARTICIPANTS ("With client") channel. */
const PARTICIPANTS_WRITE_ROLES: UserRole[] = [
  UserRole.MENTOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

type ProjectConversationsProps = {
  anchor: ConversationAnchor;
  currentUserId: string | undefined;
  role: UserRole | undefined;
  /** False when the project/application is closed or archived (read-only). */
  canWrite?: boolean;
};

/**
 * Renders the conversation channels for a project anchor.
 * - Program B: a "With client" (PARTICIPANTS) channel plus, for non-company
 *   members, a private "Team & mentor" (INTERNAL) channel the client can't see.
 * - Program A: a single internal team/mentor channel.
 */
export function ProjectConversations({
  anchor,
  currentUserId,
  role,
  canWrite = true,
}: ProjectConversationsProps) {
  const isCompanyUser = role !== undefined && COMPANY_ROLES.includes(role);
  // Students and evaluators may read PARTICIPANTS but not write to it — only
  // the mentor, client company members, and admins post there.
  const canWriteParticipants =
    canWrite &&
    role !== undefined &&
    (COMPANY_ROLES.includes(role) || PARTICIPANTS_WRITE_ROLES.includes(role));

  if (anchor.kind === 'program-a') {
    return (
      <ConversationPanel
        anchor={anchor}
        channel="INTERNAL"
        currentUserId={currentUserId}
        canWrite={canWrite}
      />
    );
  }

  if (isCompanyUser) {
    return (
      <ConversationPanel
        anchor={anchor}
        channel="PARTICIPANTS"
        currentUserId={currentUserId}
        canWrite={canWrite}
      />
    );
  }

  return (
    <Tabs defaultValue="participants">
      <TabsList>
        <TabsTrigger value="participants">{t`With client`}</TabsTrigger>
        <TabsTrigger value="internal">{t`Team & mentor (private)`}</TabsTrigger>
      </TabsList>

      <TabsContent value="participants">
        <p className="text-muted-foreground mb-3 text-sm">
          {t`Visible to the team, the mentor, and the client company.`}
        </p>
        <ConversationPanel
          anchor={anchor}
          channel="PARTICIPANTS"
          currentUserId={currentUserId}
          canWrite={canWriteParticipants}
        />
      </TabsContent>

      <TabsContent value="internal">
        <p className="text-muted-foreground mb-3 text-sm">
          {t`Private to the team and the mentor. The client company cannot see this.`}
        </p>
        <ConversationPanel
          anchor={anchor}
          channel="INTERNAL"
          currentUserId={currentUserId}
          canWrite={canWrite}
        />
      </TabsContent>
    </Tabs>
  );
}
