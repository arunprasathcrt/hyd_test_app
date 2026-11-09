export function parseCsv(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function pickEnumValue<T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
  fallback: T | '',
): T | '' {
  if (!value) return fallback;
  return (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function getCustomAttribute(
  customAttributes: Array<{key: string; value?: string | null}>,
  key: string,
): string | undefined {
  const value = customAttributes.find((attribute) => attribute.key === key)?.value;
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}
