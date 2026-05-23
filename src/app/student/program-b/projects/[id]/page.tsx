import { StudentProgramBProjectDetailPage } from 'features/student-workspace/routes/program-b-project-detail-page';

export default function StudentProgramBProjectDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <StudentProgramBProjectDetailPage params={params} />;
}
