import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../database/Prisma";

export class ListarPerfilRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findMany(): Promise<{ id: number; nome: string }[]> {
    return await this.prisma.usuario_perfil.findMany();
  }
}
