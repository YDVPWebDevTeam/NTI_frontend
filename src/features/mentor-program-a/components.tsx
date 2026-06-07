'use client';

import { t } from '@lingui/core/macro';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ProgramAStatusBadge } from 'features/admin-program-a/components/program-a-status-badge';
import {
  findProgramAMentorProject,
  type ProgramAMentorProject,
  type ProgramAMentorProjectMember,
  useCreateProgramAMentorshipNote,
  useProgramAMentorProjectDetail,
  useProgramAMentorProjectNotes,
  useProgramAMentorProjects,
  useProgramAMentorProjectSections,
} from 'features/mentor-program-a/api';
import {
  CompanyDashboardLoadingCard,
  CompanyDashboardStatus,
} from 'components/company-dashboard/program-b-company-dashboard-primitives';
import {
  Button,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from 'components/shadcn';
import { ROUTES } from 'lib/constants';
import {
  formatPersonName,
  formatUnknownDate,
  normalizeUnknownText,
} from 'lib/student-dashboard/normalizers';
import { formatEnumLabel } from 'lib/utils';

type ProgramAMentorProjectsListProps = {
  compact?: boolean;
};

const JSON_PREVIEW_INDENT = 2;
const COMPACT_PROJECT_LIMIT = 4;

function getProjectLifecycle(project: ProgramAMentorProject) {
  return normalizeUnknownText(project.lifecycleStage) ?? formatEnumLabel(project.status);
}

function formatMember(member: ProgramAMentorProjectMember) {
  const fullName = `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim();

  return fullName || member.email || t`Team member`;
}

function renderJsonValue(value: unknown): string {
  const normalizedText = normalizeUnknownText(value);

  if (normalizedText) {
    return normalizedText;
  }

  try {
    return JSON.stringify(value, null, JSON_PREVIEW_INDENT);
  } catch {
    return t`Not available`;
  }
}

export function ProgramAMentorProjectsList({ compact = false }: ProgramAMentorProjectsListProps) {
  const projectsQuery = useProgramAMentorProjects();
  const projects = projectsQuery.data ?? [];

  if (projectsQuery.isLoading && !projectsQuery.data) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <CompanyDashboardLoadingCard />
        <CompanyDashboardLoadingCard />
      </div>
    );
  }

  if (projectsQuery.isError && !projectsQuery.data) {
    return (
      <CompanyDashboardStatus
        title={t`Unable to load Program A projects`}
        description={t`Assigned Program A projects could not be loaded right now.`}
        tone="danger"
      />
    );
  }

  if (projects.length === 0) {
    return (
      <CompanyDashboardStatus
        title={t`No assigned Program A projects`}
        description={t`Program A applications where you are the assigned mentor will appear here.`}
      />
    );
  }

  const visibleProjects = compact ? projects.slice(0, COMPACT_PROJECT_LIMIT) : projects;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {visibleProjects.map((project) => (
        <article
          key={project.id}
          className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-[#10213d]">
                {normalizeUnknownText(project.teamName) || t`Program A project`}
              </p>
              <p className="mt-2 text-sm text-[#60718d]">
                {project.callTitle ? project.callTitle : t`Program A application`}
              </p>
            </div>
            <ProgramAStatusBadge status={project.status} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#60718d]">
            <span>
              {t`Lifecycle:`} {getProjectLifecycle(project)}
            </span>
            <span>{t`Updated ${formatUnknownDate(project.updatedAt)}`}</span>
          </div>
          <Link
            href={ROUTES.MENTOR.programAProjectDetail(project.id)}
            className="mt-4 inline-flex text-sm font-medium text-[#1e58d5]"
          >
            {t`Open project`}
          </Link>
        </article>
      ))}
    </div>
  );
}

export function ProgramAMentorProjectsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <h1 className="text-2xl font-semibold text-[#10213d]">{t`Program A projects`}</h1>
        <p className="mt-2 text-sm text-[#60718d]">
          {t`Program A applications where you provide mentoring support.`}
        </p>
      </section>

      <ProgramAMentorProjectsList />
    </div>
  );
}

export function ProgramAMentorProjectDetailPage({ applicationId }: { applicationId: string }) {
  const [noteBody, setNoteBody] = useState('');
  const projectsQuery = useProgramAMentorProjects();
  const applicationQuery = useProgramAMentorProjectDetail(applicationId);
  const sectionsQuery = useProgramAMentorProjectSections(applicationId);
  const notesQuery = useProgramAMentorProjectNotes(applicationId);
  const createNote = useCreateProgramAMentorshipNote(applicationId);

  const application = applicationQuery.data;
  const project = useMemo(
    () => findProgramAMentorProject(projectsQuery.data, application, applicationId),
    [application, applicationId, projectsQuery.data],
  );
  const sections = sectionsQuery.data ?? [];
  const notes = notesQuery.data ?? [];
  const teamMembers = project?.teamMembers ?? [];
  let sectionsContent;
  let notesContent;

  if (sectionsQuery.isError) {
    sectionsContent = (
      <p className="text-sm text-[#60718d]">{t`Sections are unavailable right now.`}</p>
    );
  } else if (sections.length === 0) {
    sectionsContent = <p className="text-sm text-[#60718d]">{t`No application sections yet.`}</p>;
  } else {
    sectionsContent = sections.map((section) => (
      <div key={section.id} className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-[#10213d]">{formatEnumLabel(section.key)}</p>
          <span className="text-xs text-[#60718d]">
            {t`Updated ${formatUnknownDate(section.updatedAt)}`}
          </span>
        </div>
        <pre className="mt-3 text-sm leading-6 break-words whitespace-pre-wrap text-[#60718d]">
          {renderJsonValue(section.valueJson)}
        </pre>
      </div>
    ));
  }

  if (notesQuery.isError) {
    notesContent = <p className="text-sm text-[#60718d]">{t`Notes are unavailable right now.`}</p>;
  } else if (notes.length === 0) {
    notesContent = <p className="text-sm text-[#60718d]">{t`No mentorship notes yet.`}</p>;
  } else {
    notesContent = notes.map((note) => (
      <div key={note.id} className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
        <p className="text-sm leading-7 text-[#60718d]">{note.content}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#94a3c4]">
          <span>{formatPersonName(note.author) ?? t`Mentor`}</span>
          <span>{formatUnknownDate(note.createdAt)}</span>
        </div>
      </div>
    ));
  }

  const handleCreateNote = async () => {
    const content = noteBody.trim();

    if (!content) {
      toast.error(t`Note cannot be empty.`);

      return;
    }

    try {
      await createNote.mutateAsync({ content });
      toast.success(t`Mentorship note added.`);
      setNoteBody('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to add mentorship note.`);
    }
  };

  if (applicationQuery.isLoading && !application) {
    return (
      <CompanyDashboardStatus
        title={t`Loading Program A project`}
        description={t`Resolving the Program A project detail.`}
      />
    );
  }

  if (applicationQuery.isError || !application || !project) {
    return (
      <CompanyDashboardStatus
        title={t`Program A project is unavailable`}
        description={t`We could not load this Program A project right now.`}
        tone="danger"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-[#10213d]">
                {normalizeUnknownText(project.teamName) || t`Program A project`}
              </h1>
              <ProgramAStatusBadge status={application.status} />
            </div>
            <p className="mt-3 text-sm text-[#60718d]">
              {t`Lifecycle:`} {getProjectLifecycle(project)}
            </p>
          </div>
          <Link
            href={ROUTES.MENTOR.PROGRAM_A_PROJECTS}
            className="text-sm font-medium text-[#1e58d5]"
          >
            {t`Back to projects`}
          </Link>
        </div>
      </section>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t`Overview`}</TabsTrigger>
          <TabsTrigger value="sections">{t`Application sections`}</TabsTrigger>
          <TabsTrigger value="notes">{t`Mentorship notes`}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold text-[#10213d]">{t`Team`}</h2>
            <div className="mt-4 grid gap-2 text-sm text-[#60718d] md:grid-cols-2">
              <p>
                {t`Team name:`}{' '}
                <span className="font-medium text-[#10213d]">
                  {normalizeUnknownText(project.teamName) || t`Unknown team`}
                </span>
              </p>
              <p>
                {t`Call:`}{' '}
                <span className="font-medium text-[#10213d]">
                  {project.callTitle || project.callId}
                </span>
              </p>
              <p>
                {t`Created:`}{' '}
                <span className="font-medium text-[#10213d]">
                  {formatUnknownDate(application.createdAt)}
                </span>
              </p>
              <p>
                {t`Updated:`}{' '}
                <span className="font-medium text-[#10213d]">
                  {formatUnknownDate(application.updatedAt)}
                </span>
              </p>
            </div>
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-[#10213d]">{t`Members`}</h3>
              {teamMembers.length === 0 ? (
                <p className="mt-2 text-sm text-[#60718d]">{t`No team members were returned.`}</p>
              ) : (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4"
                    >
                      <p className="font-medium text-[#10213d]">{formatMember(member)}</p>
                      {member.email ? (
                        <p className="mt-1 text-sm text-[#60718d]">{member.email}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>
        </TabsContent>

        <TabsContent value="sections">
          <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold text-[#10213d]">{t`Application sections`}</h2>
            <div className="mt-4 space-y-3">{sectionsContent}</div>
          </article>
        </TabsContent>

        <TabsContent value="notes">
          <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold text-[#10213d]">{t`Mentorship notes`}</h2>
            <div className="mt-4 space-y-3">{notesContent}</div>

            <div className="mt-5 space-y-3 rounded-2xl border border-dashed border-[#c4d4f5] bg-white/70 p-4">
              <div className="space-y-2">
                <Label htmlFor="program-a-mentorship-note">{t`Add a mentorship note`}</Label>
                <Textarea
                  id="program-a-mentorship-note"
                  rows={4}
                  maxLength={5000}
                  value={noteBody}
                  onChange={(event) => setNoteBody(event.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  disabled={createNote.isPending}
                  onClick={() => void handleCreateNote()}
                >
                  {createNote.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t`Add note`}
                </Button>
              </div>
            </div>
          </article>
        </TabsContent>
      </Tabs>
    </div>
  );
}
