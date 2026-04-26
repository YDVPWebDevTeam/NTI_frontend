import { t } from '@lingui/core/macro';
import { useMyStudentProfileQuery } from 'lib/api';
import { Badge } from 'components/shadcn';
import { Card, CardContent, CardHeader, CardTitle } from 'components/shadcn';
import { Loader2 } from 'lucide-react';
import { formatEnumLabel } from 'lib/utils';

export function ReviewStep() {
  const { data, isLoading, error } = useMyStudentProfileQuery(true);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e58d5]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
        {t`Unable to load profile data for review.`}
      </div>
    );
  }

  const { user, profile, skills, projects } = data;

  return (
    <div className="space-y-6">
      <Card className="border-black/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-[#0c1a4f]">{t`Identity`}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-neutral-600">
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="font-medium text-neutral-900">{t`Name`}</span>
            <span>
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="font-medium text-neutral-900">{t`Email`}</span>
            <span>{user?.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-black/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-[#0c1a4f]">{t`Academic Information`}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-neutral-600">
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="font-medium text-neutral-900">{t`Degree Level`}</span>
            <span>{formatEnumLabel(profile?.degreeLevel || '')}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="font-medium text-neutral-900">{t`Study Mode`}</span>
            <span>{formatEnumLabel(profile?.studyMode || '')}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="font-medium text-neutral-900">{t`Study Year`}</span>
            <span>{profile?.studyYear}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-2">
            <span className="font-medium text-neutral-900">{t`Expected Graduation`}</span>
            <span>{profile?.expectedGraduationYear}</span>
          </div>
          {profile?.hasTransferredSubjects && (
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="font-medium text-neutral-900">{t`Transferred Subjects`}</span>
              <span>{profile.transferredSubjectsCount}</span>
            </div>
          )}
          {profile?.profileSubjectsAverage && (
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="font-medium text-neutral-900">{t`Subject Average`}</span>
              <span>{profile.profileSubjectsAverage}</span>
            </div>
          )}
          {profile?.relevantCourses && profile.relevantCourses.length > 0 && (
            <div className="flex flex-col border-b border-black/5 pb-2">
              <span className="mb-1 font-medium text-neutral-900">{t`Relevant Courses`}</span>
              <span className="text-xs">{profile.relevantCourses.join(', ')}</span>
            </div>
          )}
          {profile?.academicAchievements && (
            <div className="flex flex-col border-b border-black/5 pb-2">
              <span className="mb-1 font-medium text-neutral-900">{t`Academic Achievements`}</span>
              <span className="text-xs">{profile.academicAchievements}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-black/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-[#0c1a4f]">{t`Professional Skills`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-neutral-600">
          {profile?.bio && (
            <div>
              <h4 className="mb-1 font-medium text-neutral-900">{t`Bio`}</h4>
              <p className="text-xs">{profile.bio}</p>
            </div>
          )}
          <div>
            <h4 className="mb-2 font-medium text-neutral-900">{t`Focus Areas`}</h4>
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
            <h4 className="mt-4 mb-2 font-medium text-neutral-900">{t`Preferred Roles`}</h4>
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
            <h4 className="mt-4 mb-2 font-medium text-neutral-900">{t`Soft Skills`}</h4>
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
            <h4 className="mt-4 mb-2 font-medium text-neutral-900">{t`Technical Skills`}</h4>
            <div className="flex flex-wrap gap-2">
              {skills?.map((skill) => (
                <Badge key={skill.id} variant="outline" className="border-black/10 bg-white">
                  {skill.name} ({formatEnumLabel(skill.level)})
                </Badge>
              ))}
            </div>
          </div>
          {(profile?.githubUrl || profile?.linkedinUrl || profile?.portfolioUrl) && (
            <div className="mt-4 border-t border-black/5 pt-4">
              <h4 className="mb-2 font-medium text-neutral-900">{t`Links`}</h4>
              <div className="flex flex-col gap-1 text-xs">
                {profile?.githubUrl && (
                  <div>
                    <span className="font-semibold">GitHub:</span>{' '}
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
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
                      className="text-blue-600 hover:underline"
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
                      className="text-blue-600 hover:underline"
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
            <CardTitle className="text-xl text-[#0c1a4f]">{t`Projects`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-neutral-600">
            {projects.map((project) => (
              <div key={project.id} className="rounded-lg border border-black/5 bg-neutral-50 p-4">
                <h4 className="font-semibold text-neutral-900">{project.title}</h4>
                <p className="mt-1 text-xs text-neutral-500">{project.role}</p>
                <p className="mt-2">{project.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
