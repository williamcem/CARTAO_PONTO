import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../database/Prisma";
import { RespaldarAtestado } from "../../../../data/usecase/respaldar-atestado/respaldar-atestado";

export class RespaldarAtestadoRecusadoPostgresRepository implements RespaldarAtestado {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findfirst(input: {
    id: number;
  }): Promise<{ id: number; documentoId: number; statusId: number; funcionarioId: number } | undefined> {
    const result = await this.prisma.atestado_funcionario.findFirst({
      where: { id: input.id },
    });

    if (!result) return;

    return {
      id: result.id,
      documentoId: result.tipoId,
      statusId: result.statusId,
      funcionarioId: result.funcionarioId,
    };
  }

  public async findManyCartaoDia(input: { inicio: Date; fim: Date; funcionarioId: number }): Promise<
    {
      id: number;
      data: Date;
      cargaHoraria: number;
      cargaHorariaPrimeiroPeriodo: number;
      cargaHorariaSegundoPeriodo: number;
      cargaHorariaCompleta: string;
      descanso: number;
    }[]
  > {
    const result = await this.prisma.cartao_dia.findMany({
      where: { data: { lte: input.fim, gte: input.inicio }, cartao: { funcionarioId: input.funcionarioId } },
    });

    return result.map((dia) => ({
      id: dia.id,
      cargaHoraria: dia.cargaHor,
      cargaHorariaPrimeiroPeriodo: dia.cargaHorPrimeiroPeriodo,
      cargaHorariaSegundoPeriodo: dia.cargaHorSegundoPeriodo,
      data: dia.data,
      cargaHorariaCompleta: dia.cargaHorariaCompleta,
      descanso: dia.periodoDescanso,
    }));
  }

  public async updateAtestado(input: {
    id: number;
    statusId: number;
    inicio: Date;
    fim: Date;
    userName: string;
    observacao?: string;
    abonos: { cartaoDiaId: number; minutos: number }[];
  }): Promise<boolean> {
    return Boolean(
      await this.prisma.atestado_funcionario.update({
        where: { id: input.id },
        data: {
          statusId: input.statusId,
          userName: input.userName,
          inicio: input.inicio,
          fim: input.fim,
          observacao: input.observacao,
          atestado_abonos: {
            upsert: input.abonos.map((abono) => ({
              where: { cartaoDiaId_atestadoId: { atestadoId: input.id, cartaoDiaId: abono.cartaoDiaId } },
              create: { cartaoDiaId: abono.cartaoDiaId, minutos: abono.minutos, userName: input.userName },
              update: { cartaoDiaId: abono.cartaoDiaId, minutos: abono.minutos, userName: input.userName },
            })),
          },
        },
      }),
    );
  }
}
