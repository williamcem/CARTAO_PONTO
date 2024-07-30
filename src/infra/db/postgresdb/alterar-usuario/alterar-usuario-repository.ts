import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../database/Prisma";

export class AlterarUsuarioRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrt(input: { id: number }): Promise<{ id: number } | undefined> {
    const result = await this.prisma.usuario.findFirst({ where: { id: input.id } });

    if (!result) return undefined;

    return {
      id: result.id,
    };
  }

  public async update(input: { id: number; senha: string }): Promise<boolean> {
    return Boolean(await this.prisma.usuario.update({ where: { id: input.id }, data: { senha: input.senha } }));
  }
}
