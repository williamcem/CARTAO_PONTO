import { PrismaClient } from "@prisma/client";

import { LancarDia } from "../../../../data/usecase/lancar-dia/lancar-dia";
import { prisma } from "../../../database/Prisma";

export class LancarDiaPostgresRepositoryNovo implements LancarDia {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  // Função para criar ou atualizar lançamentos
  public async upsert(input: {
    periodoId: number;
    entrada: Date | undefined;
    saida: Date | undefined;
    cartao_dia_id: number;
    statusId: number;
    userName: string;
  }): Promise<boolean> {
    const existingLancamento = await this.prisma.cartao_dia_lancamento.findUnique({
      where: { cartao_dia_id_periodoId: { cartao_dia_id: input.cartao_dia_id, periodoId: input.periodoId } },
    });

    if (existingLancamento) {
      return false;
    }

    return Boolean(
      await this.prisma.cartao_dia_lancamento.upsert({
        where: { cartao_dia_id_periodoId: { cartao_dia_id: input.cartao_dia_id, periodoId: input.periodoId } },
        create: {
          entrada: input.entrada,
          saida: input.saida,
          periodoId: input.periodoId,
          cartao_dia_id: input.cartao_dia_id,
          statusId: input.statusId,
          userName: input.userName,
        },
        update: {
          entrada: input.entrada,
          saida: input.saida,
          periodoId: input.periodoId,
          cartao_dia_id: input.cartao_dia_id,
          statusId: input.statusId,
          userName: input.userName,
        },
      }),
    );
  }

  // Função para buscar lançamentos por ID de cartão dia --- Comentado por hora verificar a necesidade
  /*   public async getLancamentosByCartaoDiaId(cartao_dia_id: number): Promise<any[]> {
    const result = await this.prisma.cartao_dia_lancamento.findMany({
      where: {
        cartao_dia_id: cartao_dia_id, // Filtrar por ID do cartão dia
      },
      orderBy: {
        periodoId: "asc", // Ordenar por período
      },
    });

    // Log para verificar os lançamentos encontrados
    console.log("Lançamentos encontrados no banco:", result);

    return result;
  } */

  // Função para encontrar períodos conflitantes
  public async findConflictingPeriodos(entrada: Date, saida: Date, cartao_dia_id: number, periodoId: number): Promise<any[]> {
    const result = await this.prisma.cartao_dia_lancamento.findMany({
      where: {
        cartao_dia_id,
        periodoId: { not: periodoId },
        AND: [{ entrada: { lt: saida } }, { saida: { gt: entrada } }],
      },
    });

    console.log("Períodos conflitantes encontrados:", result);

    return result;
  }

  // Função para encontrar um cartão dia pelo ID
  public async findCartaoDiaById(cartao_dia_id: number): Promise<any> {
    const result = await this.prisma.cartao_dia.findUnique({
      where: { id: cartao_dia_id },
      include: { cartao: true },
    });
    return result;
  }

  public async isCartaoFinalizado(cartao_dia_id: number): Promise<boolean> {
    const cartaoDia = await this.findCartaoDiaById(cartao_dia_id);

    if (!cartaoDia) return false; // Se o cartão não existir lança o erro do controler

    if (cartaoDia.cartao.statusId === 1) {
      return false;
    }

    return cartaoDia.statusId === 2 || cartaoDia.statusId === 6 || cartaoDia.statusId === 7 || cartaoDia.statusId === 11;
  }
}
