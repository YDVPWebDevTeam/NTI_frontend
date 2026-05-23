import { StudentProgramBBacklogDetailPage } from 'features/student-workspace/routes/program-b-backlog-detail-page';

export default function StudentProgramBBacklogDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <StudentProgramBBacklogDetailPage params={params} />;
}
