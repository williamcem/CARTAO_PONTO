import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class AlterarLocalidadePostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrtFuncionario(input: { id: number }) {
    const result = await this.prisma.funcionario.findFirst({
      where: { id: input.id },
      select: { id: true, localidadeId: true, turnoId: true, identificacao: true },
    });

    if (!result) return undefined;

    return result;
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

  public async findFisrtTurno(input: { id: number }) {
    const result = await this.prisma.turno.findFirst({ where: { id: input.id }, include: { turno_dias: true } });

    if (!result) return undefined;

    return result;
  }

  public async updateFuncionario(input: {
    id: number;
    localidadeId?: string;
    turnoId: number;
    dias: {
      id: number;
      statusId: number;
      periodoDescanso: number;
      cargaHor: number;
      cargaHorPrimeiroPeriodo: number;
      cargaHorSegundoPeriodo: number;
      cargaHorariaCompleta: string;
      cargaHorariaNoturna: number;
      updateAt: Date;
    }[];
    userName: string;
  }): Promise<boolean> {
    const queries: prismaPromise[] = [];
    queries.push(
      this.prisma.funcionario.update({
        where: { id: input.id },
        data: { localidadeId: input.localidadeId },
      }),
    );

    input.dias.map((dia) => {
      queries.push(
        this.prisma.cartao_dia.update({
          where: { id: dia.id },
          data: {
            cargaHor: dia.cargaHor,
            cargaHorPrimeiroPeriodo: dia.cargaHorPrimeiroPeriodo,
            cargaHorSegundoPeriodo: dia.cargaHorSegundoPeriodo,
            cargaHorariaCompleta: dia.cargaHorariaCompleta,
            cargaHorariaNoturna: dia.cargaHorariaNoturna,
            periodoDescanso: dia.periodoDescanso,
            statusId: dia.statusId,
            updateAt: dia.updateAt,
            userName: input.userName,
          },
        }),
      );
      queries.push(this.prisma.eventos.deleteMany({ where: { cartaoDiaId: dia.id } }));
    });

    queries.push(
      this.prisma.funcionario_alteracao_turno.create({
        data: {
          userName: input.userName,
          funcionarioId: input.id,
          turnoId: input.turnoId,
          dias: { connect: input.dias.map((dia) => ({ id: dia.id })) },
        },
      }),
    );

    return Boolean((await this.prisma.$transaction(queries)).length);
  }

  public async findManyDias(input: { inicio: Date; fim: Date; funcionarioId: number }) {
    return await this.prisma.cartao_dia.findMany({
      where: { data: { gte: input.inicio, lte: input.fim }, cartao: { funcionarioId: input.funcionarioId } },
    });
  }
}
