import { t } from '@lingui/core/macro';
import { useGetMyStudentProfile } from 'lib/api';
import { Badge } from 'components/shadcn';
import { Card, CardContent, CardHeader, CardTitle } from 'components/shadcn';
import { Loader2 } from 'lucide-react';
import { formatEnumLabel } from 'lib/utils';

export function ReviewStep() {
  const { data, isLoading, error } = useGetMyStudentProfile({
    query: {
      enabled: true,
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-6 text-center">
        {t`Unable to load profile data for review.`}
      </div>
    );
  }

  const { user, profile, skills, projects } = data;

  return (
    <div className="space-y-6">
      <Card className="border-black/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-xl">{t`Identity`}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground grid gap-2 text-sm">
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="text-foreground font-medium">{t`Name`}</span>
            <span>
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="text-foreground font-medium">{t`Email`}</span>
            <span>{user?.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-black/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-xl">{t`Academic Information`}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground grid gap-2 text-sm">
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="text-foreground font-medium">{t`Degree Level`}</span>
            <span>{formatEnumLabel(profile?.degreeLevel || '')}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="text-foreground font-medium">{t`Study Mode`}</span>
            <span>{formatEnumLabel(profile?.studyMode || '')}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="text-foreground font-medium">{t`Study Year`}</span>
            <span>{profile?.studyYear}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="text-foreground font-medium">{t`Expected Graduation`}</span>
            <span>{profile?.expectedGraduationYear}</span>
          </div>
          {profile?.hasTransferredSubjects && (
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-foreground font-medium">{t`Transferred Subjects`}</span>
              <span>{profile.transferredSubjectsCount}</span>
            </div>
          )}
          {profile?.profileSubjectsAverage && (
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-foreground font-medium">{t`Subject Average`}</span>
              <span>{profile.profileSubjectsAverage}</span>
            </div>
          )}
          {profile?.relevantCourses && profile.relevantCourses.length > 0 && (
            <div className="flex flex-col border-b border-black/5 pb-2">
              <span className="text-foreground mb-1 font-medium">{t`Relevant Courses`}</span>
              <span className="text-xs">{profile.relevantCourses.join(', ')}</span>
            </div>
          )}
          {profile?.academicAchievements && (
            <div className="flex flex-col border-b border-black/5 pb-2">
              <span className="text-foreground mb-1 font-medium">{t`Academic Achievements`}</span>
              <span className="text-xs">{profile.academicAchievements}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-black/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-xl">{t`Professional Skills`}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4 text-sm">
          {profile?.bio && (
            <div>
              <h4 className="text-foreground mb-1 font-medium">{t`Bio`}</h4>
              <p className="text-xs">{profile.bio}</p>
            </div>
          )}
          <div>
            <h4 className="text-foreground mb-2 font-medium">{t`Focus Areas`}</h4>
            <div className="flex flex-wrap gap-2">
              {profile?.focusAreas?.map((area) => (
                <Badge
                  key={area}
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {formatEnumLabel(area)}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-foreground mt-4 mb-2 font-medium">{t`Preferred Roles`}</h4>
            <div className="flex flex-wrap gap-2">
              {profile?.preferredRoles?.map((role) => (
                <Badge
                  key={role}
                  variant="secondary"
                  className="bg-purple-50 text-purple-700 hover:bg-purple-100"
                >
                  {formatEnumLabel(role)}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-foreground mt-4 mb-2 font-medium">{t`Soft Skills`}</h4>
            <div className="flex flex-wrap gap-2">
              {profile?.softSkills?.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-green-50 text-green-700 hover:bg-green-100"
                >
                  {formatEnumLabel(skill)}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-foreground mt-4 mb-2 font-medium">{t`Technical Skills`}</h4>
            <div className="flex flex-wrap gap-2">
              {skills?.map((skill) => (
                <Badge key={skill.id} variant="outline" className="border-border bg-card">
                  {skill.name} ({formatEnumLabel(skill.level)})
                </Badge>
              ))}
            </div>
          </div>
          {(profile?.githubUrl || profile?.linkedinUrl || profile?.portfolioUrl) && (
            <div className="mt-4 border-t border-black/5 pt-4">
              <h4 className="text-foreground mb-2 font-medium">{t`Links`}</h4>
              <div className="flex flex-col gap-1 text-xs">
                {profile?.githubUrl && (
                  <div>
                    <span className="font-semibold">GitHub:</span>{' '}
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.githubUrl}
                    </a>
                  </div>
                )}
                {profile?.linkedinUrl && (
                  <div>
                    <span className="font-semibold">LinkedIn:</span>{' '}
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.linkedinUrl}
                    </a>
                  </div>
                )}
                {profile?.portfolioUrl && (
                  <div>
                    <span className="font-semibold">Portfolio:</span>{' '}
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.portfolioUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {projects && projects.length > 0 && (
        <Card className="border-black/10 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-xl">{t`Projects`}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4 text-sm">
            {projects.map((project) => (
              <div key={project.id} className="border-border bg-muted rounded-lg border p-4">
                <h4 className="text-foreground font-semibold">{project.title}</h4>
                <p className="text-muted-foreground mt-1 text-xs">{project.role}</p>
                <p className="mt-2">{project.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
