// src/server/repositories/project-repository.ts

import type { Prisma } from "@prisma/client";

import { db } from "~/server/db";

export type CreateProjectInput = Prisma.ProjectCreateArgs["data"];

export const createProject = async (input: CreateProjectInput) =>
  db.project.create({
    data: input,
  });

export const findProjectsByUserId = async (userId: string) =>
  db.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
