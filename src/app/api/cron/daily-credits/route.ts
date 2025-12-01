// Cron endpoint for sending daily credit emails
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendDailyCreditEmail } from "~/lib/email";
import { logger } from "~/lib/logger";

// Verify cron secret for security
function validateCronSecret(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

// GET handler for Vercel Cron
export async function GET(req: NextRequest) {
  try {
    if (!validateCronSecret(req)) {
      logger.warn({ msg: "Unauthorized cron access" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await fetchOptedInUsers();
    logger.info({ msg: "Cron job started", userCount: users.length });

    const { sent, failed } = await processBatchEmails(users);
    logger.info({ msg: "Cron job completed", sent, failed });

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    logger.error({ msg: "Cron job failed", err: error });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

async function fetchOptedInUsers() {
  return db.user.findMany({
    where: { emailOptIn: true },
    select: { id: true, email: true, name: true, credits: true },
  });
}

async function processBatchEmails(
  users: Array<{ email: string; name: string | null; credits: number }>,
) {
  const results = await Promise.allSettled(
    users.map((user) =>
      sendDailyCreditEmail(user.email, user.name || "", user.credits),
    ),
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;
  return { sent, failed };
}
