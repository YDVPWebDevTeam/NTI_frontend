'use client';

import { t } from '@lingui/core/macro';
import { useState } from 'react';

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/shadcn';
import { CreateAdminCallDtoType, type CreateAdminCallDto } from 'lib/api';
import type { AdminCall } from 'lib/api-client/admin/calls';

const DATE_TIME_LOCAL_LENGTH = 16;
const MAX_PROFILE_SUBJECTS_AVERAGE = 5;

type CreateRequiredDocumentType = NonNullable<CreateAdminCallDto['requiredDocumentTypes']>[number];

type AdminCallFormSubmitValues = Pick<
  CreateAdminCallDto,
  | 'title'
  | 'type'
  | 'opensAt'
  | 'closesAt'
  | 'requiredDocumentTypes'
  | 'minTeamSize'
  | 'maxTransferredSubjects'
  | 'maxProfileSubjectsAverage'
>;

type AdminCallFormValues = {
  title: string;
  type: CreateAdminCallDtoType;
  opensAt: string;
  closesAt: string;
  minTeamSize: string;
  maxTransferredSubjects: string;
  maxProfileSubjectsAverage: string;
  requiredDocumentType: CreateRequiredDocumentType;
};

type AdminCallFormErrors = Partial<Record<keyof AdminCallFormValues, string>>;

type AdminCallFormProps = {
  initialCall?: AdminCall;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: AdminCallFormSubmitValues) => void;
};

const REQUIRED_DOCUMENT_TYPE_OPTIONS = [
  'EXECUTIVE_SUMMARY',
  'TECHNICAL_ARCHITECTURE',
  'ROADMAP',
  'BUDGET',
  'RISK_ANALYSIS',
  'MONETIZATION_MODEL',
  'CV',
  'MOTIVATION_LETTER',
  'SOLUTION_PROPOSAL',
  'OTHER',
] as const satisfies readonly CreateRequiredDocumentType[];

function toDateTimeLocal(value?: string | null) {
  if (!value) {
    return '';
  }

  return value.slice(0, DATE_TIME_LOCAL_LENGTH);
}

function optionalNumber(value: string) {
  if (value.trim().length === 0) {
    return undefined;
  }

  return Number(value);
}

function optionalDate(value: string) {
  if (value.trim().length === 0) {
    return undefined;
  }

  return new Date(value).toISOString();
}

function formatRequiredDocumentTypeLabel(documentType: CreateRequiredDocumentType) {
  switch (documentType) {
    case 'EXECUTIVE_SUMMARY':
      return t`Executive summary`;

    case 'TECHNICAL_ARCHITECTURE':
      return t`Technical architecture`;

    case 'ROADMAP':
      return t`Roadmap`;

    case 'BUDGET':
      return t`Budget`;

    case 'RISK_ANALYSIS':
      return t`Risk analysis`;

    case 'MONETIZATION_MODEL':
      return t`Monetization model`;

    case 'CV':
      return t`CV`;

    case 'MOTIVATION_LETTER':
      return t`Motivation letter`;

    case 'SOLUTION_PROPOSAL':
      return t`Solution proposal`;

    case 'OTHER':
      return t`Other`;

    default:
      return documentType;
  }
}

function validateForm(values: AdminCallFormValues) {
  const errors: AdminCallFormErrors = {};

  if (values.title.trim().length === 0) {
    errors.title = t`Title is required`;
  }

  if (values.minTeamSize.trim().length > 0) {
    const minTeamSize = Number(values.minTeamSize);

    if (!Number.isInteger(minTeamSize) || minTeamSize < 1) {
      errors.minTeamSize = t`Min team size must be a whole number greater than or equal to 1.`;
    }
  }

  if (values.maxTransferredSubjects.trim().length > 0) {
    const maxTransferredSubjects = Number(values.maxTransferredSubjects);

    if (!Number.isInteger(maxTransferredSubjects) || maxTransferredSubjects < 0) {
      errors.maxTransferredSubjects = t`Max transferred subjects must be a whole number greater than or equal to 0.`;
    }
  }

  if (values.maxProfileSubjectsAverage.trim().length > 0) {
    const maxProfileSubjectsAverage = Number(values.maxProfileSubjectsAverage);

    if (
      Number.isNaN(maxProfileSubjectsAverage) ||
      maxProfileSubjectsAverage < 0 ||
      maxProfileSubjectsAverage > MAX_PROFILE_SUBJECTS_AVERAGE
    ) {
      errors.maxProfileSubjectsAverage = t`Max profile subjects average must be between 0 and 5.`;
    }
  }

  if (values.opensAt && values.closesAt) {
    const opensAt = new Date(values.opensAt).getTime();
    const closesAt = new Date(values.closesAt).getTime();

    if (Number.isNaN(opensAt)) {
      errors.opensAt = t`Open date is invalid.`;
    }

    if (Number.isNaN(closesAt)) {
      errors.closesAt = t`Close date is invalid.`;
    }

    if (!Number.isNaN(opensAt) && !Number.isNaN(closesAt) && closesAt <= opensAt) {
      errors.closesAt = t`Close date must be after open date.`;
    }
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-600">{message}</p>;
}

export function AdminCallForm({
  initialCall,
  submitLabel,
  isSubmitting,
  onSubmit,
}: AdminCallFormProps) {
  const firstRequiredDocumentType = (initialCall?.requiredDocumentTypes?.[0]?.documentType ??
    'EXECUTIVE_SUMMARY') as CreateRequiredDocumentType;

  const [values, setValues] = useState<AdminCallFormValues>({
    title: initialCall?.title ?? '',
    type:
      (initialCall?.type as CreateAdminCallDtoType | undefined) ?? CreateAdminCallDtoType.PROGRAM_A,
    opensAt: toDateTimeLocal(initialCall?.opensAt),
    closesAt: toDateTimeLocal(initialCall?.closesAt),
    minTeamSize: initialCall?.minTeamSize?.toString() ?? '',
    maxTransferredSubjects: initialCall?.maxTransferredSubjects?.toString() ?? '',
    maxProfileSubjectsAverage: initialCall?.maxProfileSubjectsAverage?.toString() ?? '',
    requiredDocumentType: firstRequiredDocumentType,
  });

  const [errors, setErrors] = useState<AdminCallFormErrors>({});

  function updateField<TField extends keyof AdminCallFormValues>(
    field: TField,
    value: AdminCallFormValues[TField],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  return (
    <form
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();

        const validationErrors = validateForm(values);

        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);

          return;
        }

        onSubmit({
          title: values.title.trim(),
          type: values.type,
          opensAt: optionalDate(values.opensAt),
          closesAt: optionalDate(values.closesAt),
          minTeamSize: optionalNumber(values.minTeamSize),
          maxTransferredSubjects: optionalNumber(values.maxTransferredSubjects),
          maxProfileSubjectsAverage: optionalNumber(values.maxProfileSubjectsAverage),
          requiredDocumentTypes: [values.requiredDocumentType],
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t`Title`}</label>
          <Input
            value={values.title}
            onChange={(event) => updateField('title', event.target.value)}
            required
          />
          <FieldError message={errors.title} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t`Type`}</label>
          <Select
            value={values.type}
            onValueChange={(value) => updateField('type', value as CreateAdminCallDtoType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CreateAdminCallDtoType.PROGRAM_A}>{t`Program A`}</SelectItem>
              <SelectItem value={CreateAdminCallDtoType.PROGRAM_B}>{t`Program B`}</SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.type} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t`Required document type`}</label>
          <Select
            value={values.requiredDocumentType}
            onValueChange={(value) =>
              updateField('requiredDocumentType', value as CreateRequiredDocumentType)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REQUIRED_DOCUMENT_TYPE_OPTIONS.map((documentType) => (
                <SelectItem key={documentType} value={documentType}>
                  {formatRequiredDocumentTypeLabel(documentType)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.requiredDocumentType} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t`Opens at`}</label>
          <Input
            type="datetime-local"
            value={values.opensAt}
            onChange={(event) => updateField('opensAt', event.target.value)}
          />
          <FieldError message={errors.opensAt} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t`Closes at`}</label>
          <Input
            type="datetime-local"
            value={values.closesAt}
            onChange={(event) => updateField('closesAt', event.target.value)}
          />
          <FieldError message={errors.closesAt} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t`Min team size`}</label>
          <Input
            type="number"
            min="1"
            step="1"
            value={values.minTeamSize}
            onChange={(event) => updateField('minTeamSize', event.target.value)}
          />
          <FieldError message={errors.minTeamSize} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t`Max transferred subjects`}
          </label>
          <Input
            type="number"
            min="0"
            step="1"
            value={values.maxTransferredSubjects}
            onChange={(event) => updateField('maxTransferredSubjects', event.target.value)}
          />
          <FieldError message={errors.maxTransferredSubjects} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t`Max profile subjects average`}
          </label>
          <Input
            type="number"
            min="0"
            max="5"
            step="0.01"
            value={values.maxProfileSubjectsAverage}
            onChange={(event) => updateField('maxProfileSubjectsAverage', event.target.value)}
          />
          <FieldError message={errors.maxProfileSubjectsAverage} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
