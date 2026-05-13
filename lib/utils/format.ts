import { format } from 'date-fns';

/**
 * Formats an ISO date string into HH:mm:ss-dd/MM/yyyy format in the user's local timezone.
 * @param dateString The ISO date string (e.g., "2026-05-12T09:08:32.091Z")
 * @returns The formatted date string or '—' if the input is invalid.
 */
export function formatCustomDateTime(dateString?: string): string {
  if (!dateString) {
    return '—';
  }
  try {
    // new Date() parses the ISO string (with 'Z' for UTC) and holds it.
    // format() then displays this date in the browser's local timezone by default.
    return format(new Date(dateString), 'HH:mm:ss-dd/MM/yyyy');
  } catch (error) {
    console.error("Invalid date string provided:", dateString, error);
    return dateString; // Fallback to the original string if formatting fails
  }
}

/**
 * Legacy alias for formatCustomDateTime
 */
export function formatDate(dateString?: string): string {
  return formatCustomDateTime(dateString);
}

/**
 * Formats owner email with a fallback
 */
export function formatOwnerEmail(owner?: { email?: string; name?: string } | null, fallback: string = "—"): string {
  return owner?.email ?? owner?.name ?? fallback;
}

