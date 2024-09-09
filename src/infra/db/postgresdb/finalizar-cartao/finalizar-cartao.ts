import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class FinalizarCartaoPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrt(input: { id: number }) {
    return await this.prisma.cartao.findFirst({
      where: {
        id: input.id,
      },
      include: {
        cartao_dia: {
          include: {
            eventos: true,
            cartao_dia_lancamentos: true,
          },
        },
        funcionario: { select: { localidadeId: true } },
      },
    });
  }

  public async update(input: {
    id: number;
    userName: string;
    updateAt: Date;
    statusId: number;
    compensado: { diurno: { ext1: number; ext2: number; ext3: number }; noturno: { ext1: number; ext2: number; ext3: number } };
    pago: { diurno: { ext1: number; ext2: number; ext3: number }; noturno: { ext1: number; ext2: number; ext3: number } };
  }) {
    return await this.prisma.cartao.update({
      where: {
        id: input.id,
      },
      data: {
        statusId: input.statusId,
        userName: input.userName,
        updateAt: input.updateAt,
        cartao_horario_compensado: {
          upsert: [
            {
              create: {
                periodoId: 1,
                ext1: input.compensado.diurno.ext1,
                ext2: input.compensado.diurno.ext2,
                ext3: input.compensado.diurno.ext3,
              },
              update: {
                periodoId: 1,
                ext1: input.compensado.diurno.ext1,
                ext2: input.compensado.diurno.ext2,
                ext3: input.compensado.diurno.ext3,
              },
              where: { cartaoId_periodoId: { cartaoId: input.id, periodoId: 1 } },
            },
            {
              create: {
                periodoId: 2,
                ext1: input.compensado.noturno.ext1,
                ext2: input.compensado.noturno.ext2,
                ext3: input.compensado.noturno.ext3,
              },
              update: {
                periodoId: 2,
                ext1: input.compensado.noturno.ext1,
                ext2: input.compensado.noturno.ext2,
                ext3: input.compensado.noturno.ext3,
              },
              where: { cartaoId_periodoId: { cartaoId: input.id, periodoId: 2 } },
            },
          ],
        },
        cartao_horario_pago: {
          upsert: [
            {
              create: {
                periodoId: 1,
                ext1: input.pago.diurno.ext1,
                ext2: input.pago.diurno.ext2,
                ext3: input.pago.diurno.ext3,
              },
              update: {
                periodoId: 1,
                ext1: input.pago.diurno.ext1,
                ext2: input.pago.diurno.ext2,
                ext3: input.pago.diurno.ext3,
              },
              where: { cartaoId_periodoId: { cartaoId: input.id, periodoId: 1 } },
            },
            {
              create: {
                periodoId: 2,
                ext1: input.pago.noturno.ext1,
                ext2: input.pago.noturno.ext2,
                ext3: input.pago.noturno.ext3,
              },
              update: {
                periodoId: 2,
                ext1: input.pago.noturno.ext1,
                ext2: input.pago.noturno.ext2,
                ext3: input.pago.noturno.ext3,
              },
              where: { cartaoId_periodoId: { cartaoId: input.id, periodoId: 2 } },
            },
          ],
        },
      },
    });
  }

  public async findManyAtestado(input: { funcionarioId: number; statusId: number }) {
    return await this.prisma.atestado_funcionario.findMany({
      where: {
        funcionarioId: input.funcionarioId,
        statusId: input.statusId,
      },
      select: { id: true, tipos_documentos: true, data: true },
    });
  }
}
