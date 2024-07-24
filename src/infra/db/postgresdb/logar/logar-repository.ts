import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../database/Prisma";

export class LogarPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }
}
