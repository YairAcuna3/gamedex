export const PROGRESS_OPTIONS = [
  { value: "UNPLAYED", label: "Sin Jugar" },
  { value: "PLAYED", label: "Jugado" },
  { value: "IN_PROGRESS", label: "En Progreso" },
  { value: "COMPLETE", label: "Completado" },
  { value: "PLATINUM", label: "Platino" },
] as const;

export const AWARD_CODES = [
  { code: "GOLD", name: "Oro", emoji: "🥇", scope: "MONTHLY" },
  { code: "SILVER", name: "Plata", emoji: "🥈", scope: "MONTHLY" },
  { code: "BRONZE", name: "Bronce", emoji: "🥉", scope: "MONTHLY" },
  { code: "GOTY", name: "Game of the Year", emoji: "🏆", scope: "YEARLY" },
] as const;

export const MONTHS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
] as const;

export const SCOPE_OPTIONS = [
  { value: "MONTHLY", label: "Mensual" },
  { value: "YEARLY", label: "Anual" },
] as const;
