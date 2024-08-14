import { PrismaClient } from "@prisma/client";

import { prisma } from "../../../database/Prisma";

export class AlterarLocalidadePostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrtFuncionario(input: { id: number }): Promise<
    | {
        id: number;
        localidadeId: string;
        turnoId: number;
      }
    | undefined
  > {
    const result = await this.prisma.funcionario.findFirst({ where: { id: input.id } });

    if (!result) return undefined;

    return {
      id: result.id,
      localidadeId: result.localidadeId,
      turnoId: result.turnoId,
    };
  }

  public async findFisrtLocalidade(input: { id: string }): Promise<
    | {
        id: string;
        nome: string;
      }
    | undefined
  > {
    const result = await this.prisma.localidade.findFirst({ where: { codigo: input.id } });

    if (!result) return undefined;

    return {
      id: result.codigo,
      nome: result.nome,
    };
  }

  public async findFisrtTurno(input: { id: number }): Promise<
    | {
        id: number;
        nome: string;
      }
    | undefined
  > {
    const result = await this.prisma.turno.findFirst({ where: { id: input.id } });

    if (!result) return undefined;

    return {
      id: result.id,
      nome: result.nome,
    };
  }

  public async updateFuncionario(input: { id: number; turnoId?: number; localidadeId?: string }): Promise<boolean> {
    const result = await this.prisma.funcionario.update({
      where: { id: input.id },
      data: { localidadeId: input.localidadeId, turnoId: input.turnoId },
    });

    return Boolean(result);
  }

  public async findManyDias(input: { inicio: Date; fim: Date; funcionarioId: number }) {
    return await this.prisma.cartao_dia.findMany({
      where: { data: { gte: input.inicio, lte: input.fim }, cartao: { funcionarioId: input.funcionarioId } },
    });
  }
}
