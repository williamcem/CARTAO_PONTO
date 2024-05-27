import { PrismaClient } from "@prisma/client";
import { LancarDia } from "../../../../data/usecase/lancar-dia/lancar-dia";
import { prisma } from "../../../database/Prisma";

export class LancarDiaPostgresRepository implements LancarDia {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async upsert(input: {
    periodoId: number;
    entrada: Date;
    saida: Date;
    cartao_dia_id: number;
    statusId: number;
    diferenca: number;
  }): Promise<boolean> {
    return Boolean(
      await prisma.cartao_dia_lancamento.upsert({
        where: { cartao_dia_id_periodoId: { cartao_dia_id: input.cartao_dia_id, periodoId: input.periodoId } },
        create: {
          entrada: input.entrada,
          saida: input.saida,
          periodoId: input.periodoId,
          cartao_dia_id: input.cartao_dia_id,
          statusId: input.statusId,
          diferenca: input.diferenca,
        },
        update: {
          entrada: input.entrada,
          saida: input.saida,
          periodoId: input.periodoId,
          cartao_dia_id: input.cartao_dia_id,
          statusId: input.statusId,
          diferenca: input.diferenca,
        },
      }),
    );
  }

  public async findConflictingPeriodos(entrada: Date, saida: Date, cartao_dia_id: number, periodoId: number): Promise<any[]> {
    return await this.prisma.cartao_dia_lancamento.findMany({
      where: {
        cartao_dia_id,
        periodoId: { not: periodoId },
        AND: [{ entrada: { lt: saida } }, { saida: { gt: entrada } }],
      },
    });
  }
}
