import { PrismaClient } from "@prisma/client";

import { AddCartaoUpsertModel, AddCartoes } from "../../../../domain/usecases/add-cartao";
import { prisma } from "../../../database/Prisma";

export class CartaoPostgresRepository implements AddCartoes {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async upsert(input: AddCartaoUpsertModel): Promise<boolean> {
    const saved = await this.prisma.cartao.upsert({
      create: {
        referencia: input.referencia,
        saldoAnterior100: input.saldoAnterior100,
        saldoAnterior60: input.saldoAnterior60,
        funcionarioId: input.funcionarioId,
        statusId: input.status.id,
        userName: input.userName,
      },
      update: {
        referencia: input.referencia,
        saldoAnterior100: input.saldoAnterior100,
        saldoAnterior60: input.saldoAnterior60,
        funcionarioId: input.funcionarioId,
        statusId: input.status.id,
        userName: input.userName,
      },
      where: { funcionarioId_referencia: { referencia: input.referencia, funcionarioId: input.funcionarioId } },
    });

    for (const dia of input.dias) {
      await this.prisma.cartao_dia.upsert({
        where: { cartaoId_data: { cartaoId: saved.id, data: dia.data } },
        create: {
          cargaHor: dia.cargaHor,
          cargaHorariaCompleta: dia.cargaHorariaCompleta,
          cargaHorPrimeiroPeriodo: dia.cargaHorPrimeiroPeriodo,
          cargaHorSegundoPeriodo: dia.cargaHorSegundoPeriodo,
          data: dia.data,
          periodoDescanso: dia.periodoDescanso,
          cargaHorariaNoturna: dia.cargaHorNoturna,
          cartao_dia_status: {
            connectOrCreate: {
              create: { id: dia.status.id, nome: dia.status.descricao },
              where: { id: dia.status.id },
            },
          },
          cartao: { connect: { id: saved.id } },
        },
        update: {
          cargaHor: dia.cargaHor,
          cargaHorariaCompleta: dia.cargaHorariaCompleta,
          cargaHorPrimeiroPeriodo: dia.cargaHorPrimeiroPeriodo,
          cargaHorSegundoPeriodo: dia.cargaHorSegundoPeriodo,
          data: dia.data,
          periodoDescanso: dia.periodoDescanso,
          cargaHorariaNoturna: dia.cargaHorNoturna,
          cartao_dia_status: {
            connectOrCreate: {
              create: { id: dia.status.id, nome: dia.status.descricao },
              where: { id: dia.status.id },
            },
          },
          cartao: { connect: { id: saved.id } },
        },
      });
    }

    return Boolean(saved);
  }
}
