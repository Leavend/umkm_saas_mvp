import "server-only";

import { Prisma } from "@prisma/client";

import type { Locale } from "~/lib/i18n";
import type { MetricKey } from "~/features/homepage/content-builder";
import { db } from "~/server/db";

const LOCALE_TAG: Record<Locale, string> = {
  en: "en-US",
  id: "id-ID",
};

const SECONDS_IN_DAY = 86_400;
const METRIC_UPTIME_WINDOW_SECONDS = 30 * SECONDS_IN_DAY;

type MetricValues = Partial<Record<MetricKey, string>>;

const numberFormatters = new Map<string, Intl.NumberFormat>();

const getFormatter = (
  locale: Locale,
  key: string,
  options: Intl.NumberFormatOptions,
) => {
  const mapKey = `${locale}-${key}`;
  const cached = numberFormatters.get(mapKey);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.NumberFormat(LOCALE_TAG[locale], options);
  numberFormatters.set(mapKey, formatter);
  return formatter;
};

const formatInteger = (locale: Locale, value: number) =>
  getFormatter(locale, "integer", { maximumFractionDigits: 0 }).format(value);

const formatCompact = (locale: Locale, value: number) =>
  getFormatter(locale, "compact", {
    notation: "compact",
    maximumFractionDigits: value >= 10 ? 0 : 1,
  }).format(value);

const formatCountWithPlus = (locale: Locale, value: number) => {
  const safeValue = Number.isFinite(value) && value >= 0 ? value : 0;

  if (safeValue >= 1_000) {
    return `${formatCompact(locale, safeValue)}+`;
  }

  return formatInteger(locale, safeValue);
};

const formatPercent = (locale: Locale, ratio: number) => {
  const safeRatio = Number.isFinite(ratio) ? ratio : 0;

  return getFormatter(locale, "percent", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.min(Math.max(safeRatio, 0), 1));
};

const formatRating = (locale: Locale, value: number) =>
  `${getFormatter(locale, "decimal", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}★`;

const toNumber = (value: unknown): number => {
  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export async function fetchHomePageMetricValues(
  locale: Locale,
): Promise<MetricValues> {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * SECONDS_IN_DAY * 1_000);
    const lastDay = new Date(now.getTime() - SECONDS_IN_DAY * 1_000);

    const totalProjects = await db.project.count();

    const activeUsersRow = await db.$queryRaw<{ count: unknown }[]>(
      Prisma.sql`
        WITH active_sessions AS (
          SELECT DISTINCT "userId"
          FROM "session"
          WHERE "expiresAt" >= ${now}
        ),
        recent_projects AS (
          SELECT DISTINCT "userId"
          FROM "project"
          WHERE "createdAt" >= ${thirtyDaysAgo}
        ),
        combined AS (
          SELECT "userId" FROM active_sessions
          UNION
          SELECT "userId" FROM recent_projects
        )
        SELECT COUNT(*)::bigint AS count FROM combined
      `,
    );

    const aiProcessingCount = await db.project.count({
      where: {
        createdAt: {
          gte: lastDay,
        },
      },
    });

    const uptimeRows = await db.$queryRaw<{ uptime_seconds: unknown }[]>(
      Prisma.sql`
        SELECT EXTRACT(EPOCH FROM NOW() - pg_postmaster_start_time())::double precision AS uptime_seconds
      `,
    );

    const processingRows = await db.$queryRaw<
      { average_processing_seconds: unknown }[]
    >(
      Prisma.sql`
        SELECT AVG(EXTRACT(EPOCH FROM "updatedAt" - "createdAt"))::double precision AS average_processing_seconds
        FROM "project"
        WHERE "createdAt" >= ${thirtyDaysAgo}
      `,
    );

    const activeUsersCount = toNumber(activeUsersRow?.[0]?.count ?? 0);
    const uptimeSeconds = toNumber(uptimeRows?.[0]?.uptime_seconds ?? 0);
    const rawAvgProcessingSeconds =
      processingRows?.[0]?.average_processing_seconds;
    const avgProcessingSeconds =
      rawAvgProcessingSeconds === null || rawAvgProcessingSeconds === undefined
        ? null
        : toNumber(rawAvgProcessingSeconds);

    const uptimeRatio = METRIC_UPTIME_WINDOW_SECONDS
      ? Math.min(uptimeSeconds / METRIC_UPTIME_WINDOW_SECONDS, 1)
      : 0;

    const ratingValue =
      avgProcessingSeconds !== null &&
      Number.isFinite(avgProcessingSeconds) &&
      avgProcessingSeconds >= 0
        ? Math.max(3.5, 5 - Math.min(avgProcessingSeconds / 120, 1.4))
        : totalProjects > 0
          ? 4.9
          : null;

    const metrics: MetricValues = {
      imagesProcessed: formatCountWithPlus(locale, totalProjects),
      activeUsers: formatCountWithPlus(locale, activeUsersCount),
      uptime: formatPercent(locale, uptimeRatio),
      userRating: ratingValue ? formatRating(locale, ratingValue) : "—",
      aiProcessing: `${formatInteger(locale, aiProcessingCount)} / 24h`,
    };

    return metrics;
  } catch (error) {
    console.error("Failed to fetch homepage metrics", error);
    return {};
  }
}
