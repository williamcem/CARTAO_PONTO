import { PrismaClient } from "@prisma/client";

import { AddCartaoUpsertModel, AddCartoes } from "../../../../domain/usecases/add-cartao";
import { prisma } from "../../../database/Prisma";

export class CartaoPostgresRepository implements AddCartoes {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async upsert(input: AddCartaoUpsertModel): Promise<
    | {
        id: number;
        funcionarioId: number;
        dias: {
          id: number;
          data: Date;
          descanso: number;
          cargaHoraria: number;
          cargaHorariaCompleta: string;
          cargaHorariaPrimeiroPeriodo: number;
          cargaHorariaSegundoPeriodo: number;
        }[];
      }
    | undefined
  > {
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

    if (input.anterior) {
      await this.prisma.cartao_horario_anterior.upsert({
        create: {
          ext1: input.anterior.diurno.ext1,
          ext2: input.anterior.diurno.ext2,
          ext3: input.anterior.diurno.ext3,
          cartaoId: saved.id,
          periodoId: 1,
        },
        update: {
          ext1: input.anterior.diurno.ext1,
          ext2: input.anterior.diurno.ext2,
          ext3: input.anterior.diurno.ext3,
          cartaoId: saved.id,
          periodoId: 1,
        },
        where: {
          cartaoId_periodoId: { cartaoId: saved.id, periodoId: 1 },
        },
      });
      await this.prisma.cartao_horario_anterior.upsert({
        create: {
          ext1: input.anterior.noturno.ext1,
          ext2: input.anterior.noturno.ext2,
          ext3: input.anterior.noturno.ext3,
          cartaoId: saved.id,
          periodoId: 2,
        },
        update: {
          ext1: input.anterior.noturno.ext1,
          ext2: input.anterior.noturno.ext2,
          ext3: input.anterior.noturno.ext3,
          cartaoId: saved.id,
          periodoId: 2,
        },
        where: {
          cartaoId_periodoId: { cartaoId: saved.id, periodoId: 2 },
        },
      });
    }

    const output:
      | {
          id: number;
          dias: {
            id: number;
            data: Date;
            descanso: number;
            cargaHoraria: number;
            cargaHorariaCompleta: string;
            cargaHorariaPrimeiroPeriodo: number;
            cargaHorariaSegundoPeriodo: number;
          }[];
          funcionarioId: number;
        }
      | undefined = {
      id: saved.id,
      dias: [],
      funcionarioId: saved.funcionarioId,
    };

    for (const dia of input.dias) {
      const diaSalvo = await this.prisma.cartao_dia.upsert({
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
      output.dias.push({
        id: diaSalvo.id,
        data: diaSalvo.data,
        cargaHoraria: diaSalvo.cargaHor,
        cargaHorariaCompleta: diaSalvo.cargaHorariaCompleta,
        cargaHorariaPrimeiroPeriodo: diaSalvo.cargaHorPrimeiroPeriodo,
        cargaHorariaSegundoPeriodo: diaSalvo.cargaHorSegundoPeriodo,
        descanso: diaSalvo.periodoDescanso,
      });
    }

    if (!saved) return undefined;

    return output;
  }

  public async findFisrt(input: { referencia: Date; funcionarioId: number }) {
    return await this.prisma.cartao.findFirst({
      select: {
        id: true,
        cartao_horario_compensado: true,
      },
      where: { referencia: input.referencia, funcionarioId: input.funcionarioId },
    });
  }
}
