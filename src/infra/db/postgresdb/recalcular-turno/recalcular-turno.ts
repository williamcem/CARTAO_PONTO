import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class RecalcularTurnoPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findMany() {
    return await this.prisma.turno.findMany();
  }

  public async delateMany(
    input: {
      turnoId: number;
      diaSemana: number;
      cargaHoraria: number;
      cargaHorariaPrimeiroPeriodo: number;
      cargaHorariaSegundoPeriodo: number;
      periodoDescanso: number;
      cargaHorariaNoturna: number;
      cargaHorariaCompleta: string;
    }[],
  ) {
    const queries: prismaPromise[] = [];

    queries.push(this.prisma.turno_dia.deleteMany());

    input.map((dia) => {
      queries.push(
        this.prisma.turno_dia.create({
          data: {
            cargaHoraria: dia.cargaHoraria,
            cargaHorariaPrimeiroPeriodo: dia.cargaHorariaPrimeiroPeriodo,
            cargaHorariaSegundoPeriodo: dia.cargaHorariaSegundoPeriodo,
            diaSemana: dia.diaSemana,
            periodoDescanso: dia.periodoDescanso,
            turnoId: dia.turnoId,
            cargaHorariaNoturna: dia.cargaHorariaNoturna,
            cargaHorariaCompleta: dia.cargaHorariaCompleta,
          },
        }),
      );
    });

    return Boolean((await this.prisma.$transaction(queries)).length);
  }
}
