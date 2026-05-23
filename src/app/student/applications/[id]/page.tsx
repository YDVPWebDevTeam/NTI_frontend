import { StudentApplicationDetailPage } from 'features/student-workspace/routes/application-detail-page';

export default function StudentApplicationRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <StudentApplicationDetailPage params={params} />;
}
