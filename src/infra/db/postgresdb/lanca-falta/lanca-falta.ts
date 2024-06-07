import { PrismaClient } from "@prisma/client";

import { LancarFaltaIdent } from "../../../../data/usecase/lancar-falta/lancar-falta";
import { prisma } from "../../../database/Prisma";

export class LancamentoFaltaPostgresRepository implements LancarFaltaIdent {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async upsert(input: {
    periodoId: number;
    statusId: number;
    cartaoDiaId: number;
    userName: string;
  }): Promise<{ success: boolean; movimentacao60?: number }> {
    // Verifica se o statusId é igual a 3
    if (input.statusId === 3) {
      // Verifica se já existe um registro de falta para o período especificado
      const existingFalta = await this.prisma.cartao_dia_lancamento.findFirst({
        where: {
          cartao_dia_id: input.cartaoDiaId,
          periodoId: input.periodoId,
          statusId: 3, // Status de falta
          userName: input.userName,
        },
      });

      // Se já existe um registro de falta para o período, retorna false
      if (existingFalta) {
        console.log("Falta já existente para este período.");
        return { success: false };
      }

      // Calcula dif_total somando todas as diferenças de periodoId com o mesmo cartao_dia_id
      const difTotalResult = await this.prisma.cartao_dia_lancamento.aggregate({
        _sum: { diferenca: true },
        where: { cartao_dia_id: input.cartaoDiaId },
      });
      const difTotal = difTotalResult._sum?.diferenca || 0;

      // Obtém a cargaHor atual do cartao_dia
      const cartaoDia = await this.prisma.cartao_dia.findUnique({
        where: { id: input.cartaoDiaId },
        select: { cargaHor: true },
      });

      // Calcula movimentacao60 como a subtração entre dif_total e cargaHor
      const movimentacao60 = difTotal - (cartaoDia?.cargaHor || 0);
      console.log(movimentacao60);

      // Atualiza a diferença com o valor de movimentacao60
      const result = await this.prisma.cartao_dia_lancamento.upsert({
        where: { cartao_dia_id_periodoId: { cartao_dia_id: input.cartaoDiaId, periodoId: input.periodoId } },
        create: {
          cartao_dia_id: input.cartaoDiaId,
          periodoId: input.periodoId,
          statusId: input.statusId,
          userName: input.userName,
        },
        update: {
          cartao_dia_id: input.cartaoDiaId,
          periodoId: input.periodoId,
          statusId: input.statusId,
          userName: input.userName,
        },
      });

      await this.prisma.cartao_dia.update({
        where: { id: input.cartaoDiaId },
        data: { tratado: true, userName: input.userName },
      });

      // Retorna true se a operação upsert foi bem-sucedida
      return { success: Boolean(result), movimentacao60 };
    }

    // Se o statusId não for igual a 3, realiza a operação upsert como antes
    const result = await this.prisma.cartao_dia_lancamento.upsert({
      where: { cartao_dia_id_periodoId: { cartao_dia_id: input.cartaoDiaId, periodoId: input.periodoId } },
      create: {
        cartao_dia_id: input.cartaoDiaId,
        periodoId: input.periodoId,
        statusId: input.statusId,
        userName: input.userName,
      },
      update: {
        cartao_dia_id: input.cartaoDiaId,
        periodoId: input.periodoId,
        statusId: input.statusId,
        userName: input.userName,
      },
    });

    // Retorna true se a operação upsert foi bem-sucedida
    return { success: Boolean(result) };
  }
}
