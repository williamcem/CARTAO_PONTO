import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";
import { ConfirmarLancaDia } from "../../../../data/usecase/confirmar-lanca-dia/confirmar-lancar-dia";

export class ConfirmarLancaDiaPostgresRepository implements ConfirmarLancaDia {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrt(input: { id: number }): Promise<
    | {
        id: number;
        lancamentos: { id: number; entrada: Date | null; saida: Date | null; validadoPeloOperador: boolean; periodoId: number }[];
      }
    | undefined
  > {
    const result = await this.prisma.cartao_dia.findFirst({ where: { id: input.id }, include: { cartao_dia_lancamentos: true } });

    if (!result) return undefined;

    return {
      id: result.id,
      lancamentos: result.cartao_dia_lancamentos.map((lancamento) => ({
        id: lancamento.id,
        entrada: lancamento.entrada,
        saida: lancamento.saida,
        validadoPeloOperador: lancamento.validadoPeloOperador,
        periodoId: lancamento.periodoId,
      })),
    };
  }

  public async update(input: { id: number }[]): Promise<boolean> {
    const query: prismaPromise[] = [];
    input.map((a) => {
      query.push(this.prisma.cartao_dia_lancamento.update({ where: { id: a.id }, data: { validadoPeloOperador: true } }));
    });

    return Boolean((await this.prisma.$transaction(query)).length);
  }

  public async findManyLancamento(input: { cartaoDiaId: number }) {
    return await this.prisma.cartao_dia_lancamento.findMany({
      where: { cartao_dia_id: input.cartaoDiaId },
      select: {
        validadoPeloOperador: true,
      },
    });
  }

  public async updateDia(input: { id: number; validadoOperador: boolean }) {
    return await this.prisma.cartao_dia.update({
      where: { id: input.id },
      data: { validadoPeloOperador: input.validadoOperador },
    });
  }
}
