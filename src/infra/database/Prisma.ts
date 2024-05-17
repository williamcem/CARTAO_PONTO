import { PrismaClient, Prisma } from "@prisma/client";

export const prisma = new PrismaClient();
export type prismaPromise = Prisma.PrismaPromise<any>;
