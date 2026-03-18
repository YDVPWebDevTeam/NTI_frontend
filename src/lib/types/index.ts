// Shared TypeScript types. Add your domain types here.

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
