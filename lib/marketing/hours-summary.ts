/** Collapsed summary for the "Where the hours go" panel, e.g. "3 picked · 13 h / week". */
export function hoursSummary(tasks: { hours: number; top: boolean }[]): string {
  const picked = tasks.filter((x) => x.top);
  const hours = picked.reduce((sum, x) => sum + x.hours, 0);
  return `${picked.length} picked · ${hours} h / week`;
}
