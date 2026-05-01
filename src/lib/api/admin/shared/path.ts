export const buildPathWithId = (basePath: string, id: string) =>
  `${basePath}/${encodeURIComponent(id)}`;
