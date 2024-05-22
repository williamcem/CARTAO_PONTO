import { PrismaClient } from "@prisma/client";

import { prisma } from "../../../database/Prisma";
import { LancarDia } from "../../../../data/usecase/lancar-dia/lancar-dia";

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
        },
        update: {
          entrada: input.entrada,
          saida: input.saida,
          periodoId: input.periodoId,
          cartao_dia_id: input.cartao_dia_id,
          statusId: input.statusId,
        },
      }),
    );
  }
}
