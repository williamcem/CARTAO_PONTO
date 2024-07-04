import { PrismaClient } from "@prisma/client";

import { prisma } from "@infra/database/Prisma";
import { AddGrupoTrabalhoUpersetModel } from "@domain/usecases/grupo-trabalho";

import { GrupoTrabalhoRepository } from "../../../../data/usecase/grupo-trabalho/grupo-trabalho-repository";

export class GrupoDeTrabalhoRepositoryPrisma implements GrupoTrabalhoRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async upsert(grupo: AddGrupoTrabalhoUpersetModel): Promise<boolean> {
    const saveGrupo = await this.prisma.grupo_trabalho.upsert({
      where: {
        id: (grupo.id = 0),
      },
      create: {
        cod_turno: grupo.cod_turno,
        descri_turno: grupo.descri_turno,
        dia_semana: grupo.dia_semana,
        hora_1_entrada: grupo.hora_1_entrada,
        hora_1_saida: grupo.hora_1_saida,
        hora_2_entrada: grupo.hora_2_entrada,
        hora_2_saida: grupo.hora_2_saida,
        hora_3_entrada: grupo.hora_3_entrada,
        hora_3_saida: grupo.hora_3_saida,
        hora_4_entrada: grupo.hora_4_entrada,
        hora_4_saida: grupo.hora_4_saida,
        status_turno: grupo.status_turno,
        tipo_dia: grupo.tipo_dia,
        total_horas_1_periodo: grupo.total_horas_1_periodo,
        total_horas_2_periodo: grupo.total_horas_2_periodo,
        total_horas_3_periodo: grupo.total_horas_3_periodo,
        total_horas_4_periodo: grupo.total_horas_4_periodo,
        total_horas_1_intervalo: grupo.total_horas_1_intervalo,
        total_horas_2_intervalo: grupo.total_horas_2_intervalo,
        total_horas_3_intervalo: grupo.total_horas_3_intervalo,
        total_horas_dia: grupo.total_horas_dia,
        total_horas_intervalo: grupo.total_horas_intervalo,
        total_horas_trabalhadas: grupo.total_horas_trabalhadas,
        userName: grupo.userName,
      },
      update: {
        cod_turno: grupo.cod_turno,
        descri_turno: grupo.descri_turno,
        dia_semana: grupo.dia_semana,
        hora_1_entrada: grupo.hora_1_entrada,
        hora_1_saida: grupo.hora_1_saida,
        hora_2_entrada: grupo.hora_2_entrada,
        hora_2_saida: grupo.hora_2_saida,
        hora_3_entrada: grupo.hora_3_entrada,
        hora_3_saida: grupo.hora_3_saida,
        hora_4_entrada: grupo.hora_4_entrada,
        hora_4_saida: grupo.hora_4_saida,
        status_turno: grupo.status_turno,
        tipo_dia: grupo.tipo_dia,
        total_horas_1_periodo: grupo.total_horas_1_periodo,
        total_horas_2_periodo: grupo.total_horas_2_periodo,
        total_horas_3_periodo: grupo.total_horas_3_periodo,
        total_horas_4_periodo: grupo.total_horas_4_periodo,
        total_horas_1_intervalo: grupo.total_horas_1_intervalo,
        total_horas_2_intervalo: grupo.total_horas_2_intervalo,
        total_horas_3_intervalo: grupo.total_horas_3_intervalo,
        total_horas_dia: grupo.total_horas_dia,
        total_horas_intervalo: grupo.total_horas_intervalo,
        total_horas_trabalhadas: grupo.total_horas_trabalhadas,
        userName: grupo.userName,
      },
    });
    return Boolean(saveGrupo);
  }
}
