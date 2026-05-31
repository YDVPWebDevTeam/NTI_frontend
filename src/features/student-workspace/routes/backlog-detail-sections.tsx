'use client';

import { t } from '@lingui/core/macro';
import type { ReactNode } from 'react';
import type { ProgramBBacklogItemDto, ProgramBTeamApplicationResponseDto } from 'lib/api';

import { Button, Textarea } from 'components/shadcn';
import { FileUploader } from 'components/files/file-uploader';
import { StudentSectionCard } from 'components/student-dashboard/page-shell-primitives';
import { formatUnknownDate } from 'lib/student-dashboard/normalizers';

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
            className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-[#f7f8fa] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-neutral-950">{document.name}</p>
              <p className="text-sm text-neutral-600">
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
  let content: ReactNode;

  if (existingApplication) {
    content = (
      <div className="space-y-4">
        <p className="text-sm text-neutral-700">
          {t`Current status:`}{' '}
          <span className="font-semibold text-neutral-950">{existingApplication.status}</span>
        </p>
        <p className="text-sm text-neutral-700">
          {t`Submitted:`}{' '}
          <span className="font-semibold text-neutral-950">
            {formatUnknownDate(existingApplication.submittedAt)}
          </span>
        </p>
        <Button
          size="sm"
          variant="outline"
          disabled={!isLead || isWithdrawing}
          onClick={() => void onWithdraw()}
        >
          {t`Withdraw application`}
        </Button>
      </div>
    );
  } else if (isLead) {
    content = (
      <div className="space-y-4">
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
            !motivation.trim() ||
            !proposalText.trim() ||
            cvFiles.length === 0 ||
            isSubmitting
          }
          onClick={() => void onSubmit()}
        >
          {t`Submit application`}
        </Button>
      </div>
    );
  } else {
    content = (
      <p className="text-sm text-neutral-600">
        {t`Only the current team lead can apply or withdraw for Program B opportunities.`}
      </p>
    );
  }

  return (
    <StudentSectionCard
      title={t`Team application`}
      description={t`Lead-only apply and withdraw actions use the generated team application endpoints.`}
    >
      {content}
    </StudentSectionCard>
  );
}
