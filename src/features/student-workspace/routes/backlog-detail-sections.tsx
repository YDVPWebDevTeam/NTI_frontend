'use client';

import { t } from '@lingui/core/macro';
import type { ReactNode } from 'react';
import {
  ProgramBTeamApplicationResponseDtoStatus,
  type ProgramBBacklogItemDto,
  type ProgramBTeamApplicationResponseDto,
} from 'lib/api';

import { Button, Textarea } from 'components/shadcn';
import { FileUploader } from 'components/files/file-uploader';
import { StudentSectionCard } from 'components/student-dashboard/page-shell-primitives';
import { formatUnknownDate } from 'lib/student-dashboard/normalizers';

const ACTIVE_APPLICATION_STATUSES: ProgramBTeamApplicationResponseDtoStatus[] = [
  ProgramBTeamApplicationResponseDtoStatus.SUBMITTED,
  ProgramBTeamApplicationResponseDtoStatus.SHORTLISTED,
];

export function isActiveApplication(
  application: ProgramBTeamApplicationResponseDto | null,
): boolean {
  return Boolean(application && ACTIVE_APPLICATION_STATUSES.includes(application.status));
}

export function DocumentsSection({
  item,
  onOpenDocument,
}: {
  item: Pick<ProgramBBacklogItemDto, 'documents'> | null | undefined;
  onOpenDocument: (documentId: string) => Promise<void>;
}) {
  return (
    <StudentSectionCard title={t`Documents`}>
      <div className="space-y-3">
        {(item?.documents ?? []).map((document) => (
          <div
            key={document.id}
            className="border-border bg-muted flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-foreground font-semibold">{document.name}</p>
              <p className="text-muted-foreground text-sm">
                {document.category} · {document.status}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => void onOpenDocument(document.id)}>
              {t`Open document`}
            </Button>
          </div>
        ))}
      </div>
    </StudentSectionCard>
  );
}

export function TeamApplicationSection({
  existingApplication,
  isLead,
  isLocked,
  team,
  motivation,
  proposalText,
  cvFiles,
  setMotivation,
  setProposalText,
  setCvFiles,
  onSubmit,
  onWithdraw,
  isSubmitting,
  isWithdrawing,
}: {
  existingApplication: ProgramBTeamApplicationResponseDto | null;
  isLead: boolean;
  isLocked: boolean;
  team: { id: string } | null;
  motivation: string;
  proposalText: string;
  cvFiles: File[];
  setMotivation: (value: string) => void;
  setProposalText: (value: string) => void;
  setCvFiles: (value: File[]) => void;
  onSubmit: () => Promise<void>;
  onWithdraw: () => Promise<void>;
  isSubmitting: boolean;
  isWithdrawing: boolean;
}) {
  const lockedTooltip = t`This team is locked and can no longer submit or withdraw applications.`;
  const hasActiveApplication = isActiveApplication(existingApplication);
  const isTerminalApplication =
    existingApplication != null &&
    (existingApplication.status === ProgramBTeamApplicationResponseDtoStatus.ACCEPTED ||
      existingApplication.status === ProgramBTeamApplicationResponseDtoStatus.PROJECT_CREATED);

  let content: ReactNode;

  if (hasActiveApplication && existingApplication) {
    content = (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          {t`Current status:`}{' '}
          <span className="text-foreground font-semibold">{existingApplication.status}</span>
        </p>
        <p className="text-muted-foreground text-sm">
          {t`Submitted:`}{' '}
          <span className="text-foreground font-semibold">
            {formatUnknownDate(existingApplication.submittedAt)}
          </span>
        </p>
        <Button
          size="sm"
          variant="outline"
          disabled={!isLead || isLocked || isWithdrawing}
          title={isLocked ? lockedTooltip : undefined}
          onClick={() => void onWithdraw()}
        >
          {t`Withdraw application`}
        </Button>
      </div>
    );
  } else if (isTerminalApplication && existingApplication) {
    content = (
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          {t`Current status:`}{' '}
          <span className="text-foreground font-semibold">{existingApplication.status}</span>
        </p>
        <p className="text-muted-foreground text-sm">
          {t`This application has been finalized and can no longer be changed.`}
        </p>
      </div>
    );
  } else if (isLead) {
    content = (
      <div className="space-y-4">
        {existingApplication ? (
          <p className="text-muted-foreground text-sm">
            {t`Your previous application is ${existingApplication.status}. You can submit a new application below.`}
          </p>
        ) : null}
        <Textarea
          value={motivation}
          onChange={(event) => setMotivation(event.target.value)}
          placeholder={t`Motivation`}
          rows={4}
        />
        <Textarea
          value={proposalText}
          onChange={(event) => setProposalText(event.target.value)}
          placeholder={t`Proposal text`}
          rows={5}
        />
        <FileUploader
          id="program-b-application-cv"
          value={cvFiles}
          onChange={setCvFiles}
          accept=".pdf,.doc,.docx"
          placeholder={t`Upload CVs for your team (PDF or Word).`}
          buttonLabel={t`Upload CV`}
        />
        <Button
          disabled={
            !team ||
            isLocked ||
            !motivation.trim() ||
            !proposalText.trim() ||
            cvFiles.length === 0 ||
            isSubmitting
          }
          title={isLocked ? lockedTooltip : undefined}
          onClick={() => void onSubmit()}
        >
          {t`Submit application`}
        </Button>
      </div>
    );
  } else {
    content = (
      <p className="text-muted-foreground text-sm">
        {t`Only the current team lead can apply or withdraw for Program B opportunities.`}
      </p>
    );
  }

  return (
    <StudentSectionCard
      title={t`Team application`}
      description={t`Lead-only apply and withdraw actions use the generated team application endpoints.`}
    >
      {isLocked ? (
        <div
          role="status"
          className="border-warning/30 bg-warning/10 text-warning mb-4 rounded-2xl border p-4 text-sm"
        >
          <p className="font-semibold">{t`Team locked`}</p>
          <p className="mt-1">
            {t`This team is locked, so applications can no longer be submitted or withdrawn.`}
          </p>
        </div>
      ) : null}
      {content}
    </StudentSectionCard>
  );
}
