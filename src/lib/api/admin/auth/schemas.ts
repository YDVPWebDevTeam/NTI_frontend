import { z } from 'zod';

const MIN_PASSWORD_LENGTH = 8;

export const adminLoginSchema = z.object({
  email: z.email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const forceChangePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, 'Password must be at least 8 characters long.')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter.')
      .regex(/\d/, 'Password must include at least one number.'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords do not match.',
  });

export type AdminLoginSchema = z.infer<typeof adminLoginSchema>;
export type ForceChangePasswordSchema = z.infer<typeof forceChangePasswordSchema>;
