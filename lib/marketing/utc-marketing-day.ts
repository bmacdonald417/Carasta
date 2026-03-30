/** UTC calendar date for marketing rollups (Prisma `@db.Date`). */
export function utcMarketingDayFromDate(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}
