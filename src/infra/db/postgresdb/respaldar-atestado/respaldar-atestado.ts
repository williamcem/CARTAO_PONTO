import { PrismaClient } from "@prisma/client";
import { prisma, prismaPromise } from "../../../database/Prisma";
import { RespaldarAtestado } from "../../../../data/usecase/respaldar-atestado/respaldar-atestado";

export class RespaldarAtestadoPostgresRepository implements RespaldarAtestado {
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

  public async findManyAtestados(input: {
    funcionarioId: number;
    statusId: number;
    abono: { inicio: Date; fim: Date };
  }): Promise<
    { abonos: { id: number }[]; fim: Date | null; id: number; inicio: Date | null; observacao: string; statusId: number }[]
  > {
    const output: {
      abonos: { id: number }[];
      fim: Date | null;
      id: number;
      inicio: Date | null;
      observacao: string;
      statusId: number;
    }[] = [];
    const result = await this.prisma.atestado_funcionario.findMany({
      where: {
        funcionarioId: input.funcionarioId,
        statusId: input.statusId,
      },
      include: {
        atestado_abonos: {
          where: {
            cartao_dia: { AND: [{ data: { lte: input.abono.fim } }, { data: { gte: input.abono.inicio } }] },
          },
        },
      },
    });

    result.map((atestado) =>
      output.push({
        id: atestado.id,
        fim: atestado.fim,
        inicio: atestado.inicio,
        observacao: atestado.observacao || "",
        statusId: atestado.statusId,
        abonos: atestado.atestado_abonos.map((abono) => ({ id: abono.id })),
      }),
    );
    return output;
  }

  public async findManyAbono(input: { atestadoId: number }): Promise<{ id: number }[]> {
    const output: {
      id: number;
    }[] = [];
    const result = await this.prisma.atestado_abono.findMany({
      where: {
        atestadoId: input.atestadoId,
      },
    });

    result.map((atestado) =>
      output.push({
        id: atestado.id,
      }),
    );

    return output;
  }

  public async deleteManyAbono(ids: number[]): Promise<boolean> {
    const query: prismaPromise[] = [];
    ids.map((id) => {
      query.push(this.prisma.atestado_abono.delete({ where: { id } }));
    });

    return Boolean(await this.prisma.$transaction(query));
  }
}
