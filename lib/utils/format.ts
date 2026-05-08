export function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatBoolean(value?: boolean | null) {
  if (value === undefined || value === null) {
    return "—";
  }

  return value ? "Yes" : "No";
}

export function formatOwnerEmail(owner?: { email?: string | null } | null, fallback?: string) {
  return owner?.email || fallback || "—";
}
