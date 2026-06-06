import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  ApplicationDetailDto,
  ApplicationSectionDto,
  CreateMentorshipNoteDto,
  ProgramAMentoredTeamMemberDto,
  ProgramAMentorshipNoteDto,
} from 'lib/api';
import {
  applicationsControllerCreateMentorshipNote,
  applicationsControllerFindById,
  applicationsControllerListMentorshipNotes,
  applicationsControllerListSections,
  useApplicationsControllerListMyMentoredProgramAApplications,
} from 'lib/api';

export type ProgramAMentorProjectMember = ProgramAMentoredTeamMemberDto;
export type ProgramAMentorProject = {
  id: string;
  status: string;
  lifecycleStage?: string;
  teamId: string;
  teamName: string;
  teamMembers?: ProgramAMentorProjectMember[];
  callId: string;
  callTitle?: string;
  mentorUserId?: string;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export function useProgramAMentorProjects() {
  return useApplicationsControllerListMyMentoredProgramAApplications<ProgramAMentorProject[]>();
}

export function useProgramAMentorProjectDetail(applicationId: string) {
  return useQuery({
    queryKey: ['/applications', applicationId, 'mentor-detail'],
    queryFn: () => applicationsControllerFindById(applicationId),
    enabled: Boolean(applicationId),
  });
}

export function useProgramAMentorProjectSections(applicationId: string) {
  return useQuery<ApplicationSectionDto[]>({
    queryKey: ['/applications', applicationId, 'sections'],
    queryFn: () => applicationsControllerListSections(applicationId),
    enabled: Boolean(applicationId),
  });
}

export function useProgramAMentorProjectNotes(applicationId: string) {
  return useQuery<ProgramAMentorshipNoteDto[]>({
    queryKey: ['/applications', applicationId, 'mentorship-notes'],
    queryFn: () => applicationsControllerListMentorshipNotes(applicationId),
    enabled: Boolean(applicationId),
  });
}

export function useCreateProgramAMentorshipNote(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMentorshipNoteDto) =>
      applicationsControllerCreateMentorshipNote(applicationId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['/applications', applicationId, 'mentorship-notes'],
      });
    },
  });
}

export function findProgramAMentorProject(
  projects: ProgramAMentorProject[] | undefined,
  application: ApplicationDetailDto | undefined,
  applicationId: string,
): ProgramAMentorProject | undefined {
  return (
    projects?.find((project) => project.id === applicationId) ?? applicationToProject(application)
  );
}

function applicationToProject(application: ApplicationDetailDto | undefined) {
  if (!application) {
    return undefined;
  }

  return {
    id: application.id,
    status: application.status,
    teamId: application.teamId,
    teamName: '',
    callId: application.callId,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  } satisfies ProgramAMentorProject;
}
