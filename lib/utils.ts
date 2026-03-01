import { PROGRESS_OPTIONS } from "./constants";

export function formatDate(date: Date | string | null): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getProgressLabel(progress: string): string {
  const option = PROGRESS_OPTIONS.find((opt) => opt.value === progress);
  return option?.label || progress;
}
