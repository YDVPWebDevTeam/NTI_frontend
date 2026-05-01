import { z } from 'zod';

import { OrganizationStatus } from '../types';
import { organizationReviewStatuses } from './types';

export const updateOrganizationStatusSchema = z
  .object({
    status: z.enum(organizationReviewStatuses),
    rejectionReason: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (value.status === OrganizationStatus.REJECTED && !value.rejectionReason) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rejectionReason'],
        message: `Rejection reason is required when status is ${OrganizationStatus.REJECTED}.`,
      });
    }
  });

export type UpdateOrganizationStatusSchema = z.infer<typeof updateOrganizationStatusSchema>;
