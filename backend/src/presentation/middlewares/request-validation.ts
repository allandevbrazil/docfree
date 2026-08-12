import { AppError } from "./error-handler";

const UUID_V4_OR_GENERIC_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertUuid(value: string, fieldName: string): void {
  if (!UUID_V4_OR_GENERIC_REGEX.test(value)) {
    throw new AppError(400, `${fieldName} must be a valid UUID`);
  }
}

export function parseOptionalIsoDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(400, "sentAt must be a valid ISO date string");
  }

  return parsed;
}
