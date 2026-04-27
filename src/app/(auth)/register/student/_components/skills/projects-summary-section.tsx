import { t } from '@lingui/core/macro';
import { Plus, Trash } from 'lucide-react';
import type { Control } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';

import { Button } from 'components/shadcn';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/shadcn';
import { Input } from 'components/shadcn';
import { Textarea } from 'components/shadcn';
import { parseCommaSeparatedList } from '../../_lib/form-value-utils';
import type { StudentRegistrationValues } from '../../schema';
import { RegistrationSectionCard } from '../registration-section-card';

type ProjectsSummarySectionProps = {
  control: Control<StudentRegistrationValues>;
};

export function ProjectsSummarySection({ control }: ProjectsSummarySectionProps) {
  const {
    fields: projectsFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({
    control,
    name: 'projects',
  });

  return (
    <RegistrationSectionCard
      title={t`Projects & Summary`}
      description={t`Showcase your best projects and tell us about yourself.`}
    >
      <div className="space-y-6">
        <div>
          <h4 className="mb-3 text-sm font-medium">{t`Projects`}</h4>

          <div className="space-y-4">
            {projectsFields.map((field, index) => (
              <div
                key={field.id}
                className="relative grid items-start gap-4 rounded-md border bg-neutral-50 p-4 md:grid-cols-2"
              >
                <div className="col-span-2 md:col-span-1">
                  <FormField
                    control={control}
                    name={`projects.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder={t`Project Title`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <FormField
                    control={control}
                    name={`projects.${index}.role`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder={t`Your Role (e.g., Frontend Dev)`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2">
                  <FormField
                    control={control}
                    name={`projects.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder={t`Short project description...`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2">
                  <FormField
                    control={control}
                    name={`projects.${index}.technologies`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={t`Technologies (comma separated)`}
                            value={field.value?.join(', ') ?? ''}
                            onChange={(event) =>
                              field.onChange(parseCommaSeparatedList(event.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2">
                  <FormField
                    control={control}
                    name={`projects.${index}.projectUrl`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="https://..." {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProject(index)}
                  className="absolute top-2 right-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendProject({
                  title: '',
                  role: '',
                  description: '',
                  technologies: [],
                  projectUrl: '',
                })
              }
              className="w-full border-dashed"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t`Add Project`}
            </Button>
          </div>
        </div>

        <FormField
          control={control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Professional Summary`}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t`Tell us a little about your goals and experience...`}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </RegistrationSectionCard>
  );
}
