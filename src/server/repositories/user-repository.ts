// src/server/repositories/user-repository.ts

import type { Prisma } from "@prisma/client";

import { db } from "~/server/db";

export const selectUserCredits = async (userId: string) =>
  db.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

export const updateUserCredits = async (
  userId: string,
  data: Prisma.UserUpdateInput,
) =>
  db.user.update({
    where: { id: userId },
    data,
    select: { credits: true },
  });
