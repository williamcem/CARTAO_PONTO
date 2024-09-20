import { PrismaClient } from "@prisma/client";

import { GetFuncionarioAtestado } from "../../../../data/usecase/procurar-funcionario/find-procurar-funcionario";
import { prisma } from "../../../database/Prisma";

export class BuscarOcorrenciaMinutoAusentePostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrtFuncionario(input: { identificacao: string }) {
    return await this.prisma.funcionario.findFirst({
      where: { identificacao: input.identificacao },
      select: {
        id: true,
        nome: true,
      },
    });
  }

  public async findFisrtCartao(input: { funcionarioId: number; referencia: Date }) {
    return await this.prisma.cartao.findFirst({
      where: { funcionarioId: input.funcionarioId, referencia: input.referencia },
      select: {
        id: true,
      },
    });
  }

  public async findManyDias(input: { cartaoId: number; date: { lte: Date } }) {
    return await this.prisma.cartao_dia.findMany({
      where: {
        cartaoId: input.cartaoId,
        data: { lte: input.date.lte },
      },
      select: {
        id: true,
        data: true,
        cargaHor: true,
        eventos: {
          select: {
            minutos: true,
            tipoId: true,
          },
        },
        cartao_dia_lancamentos: {
          select: {
            entrada: true,
            saida: true,
            periodoId: true,
          },
        },
        cargaHorariaCompleta: true,
        cargaHorPrimeiroPeriodo: true,
        cargaHorSegundoPeriodo: true,
        periodoDescanso: true,
        statusId: true,
      },
      orderBy: {
        data: "asc",
      },
    });
  }

  public async findManyAbonosAtestado(input: { cartaoDiaId: { in: number[] } }) {
    return await this.prisma.atestado_abono.findMany({
      where: {
        cartaoDiaId: input.cartaoDiaId,
      },
      select: { cartaoDiaId: true, minutos: true },
    });
  }

  public async findManyAtestado(input: { statusId?: number; funcionarioId: number }) {
    return await this.prisma.atestado_funcionario.findMany({
      where: {
        statusId: input.statusId,
        funcionarioId: input.funcionarioId,
      },
      select: { data: true, diasAusencia: true },
    });
  }

  public async findManyEventos(input: { cartaoDiaId: number }) {
    return await this.prisma.eventos.findMany({
      where: {
        cartaoDiaId: input.cartaoDiaId,
      },
      select: { inicio: true, fim: true, minutos: true },
    });
  }
}
