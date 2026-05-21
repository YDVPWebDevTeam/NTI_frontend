import { TeamWorkspace } from 'components/student-dashboard/team-workspace';

export default function TeamPage() {
  return (
    <TeamWorkspace
      title="Team"
      description="Non-leads stay read-only, while team leads can rename the team, manage invitations, remove members, and transfer leadership."
    />
  );
}
