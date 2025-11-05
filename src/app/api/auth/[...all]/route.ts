import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "~/lib/auth";

// Export handlers untuk semua HTTP methods
const handler = toNextJsHandler(auth);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const HEAD = handler;
export const OPTIONS = handler;
