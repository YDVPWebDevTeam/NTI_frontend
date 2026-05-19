type MaybeWrappedData<T> = T | { data: T };

function hasDataProperty<T>(value: MaybeWrappedData<T>): value is { data: T } {
  return Boolean(value && typeof value === 'object' && 'data' in value);
}

export function unwrapAdminData<T>(value: MaybeWrappedData<T>): T {
  return hasDataProperty(value) ? value.data : value;
}
