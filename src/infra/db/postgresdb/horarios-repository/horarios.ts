import { PrismaClient } from "@prisma/client";
import { AddHorariosRepository } from "../../../../data/usecase/protocols/add-horarios-repository";
import { AddHorariosModel } from "../../../../domain/usecases/add-horarios";
import { HorariosModel } from "../../../../domain/models/horarios";

export class HorariosPostgresRepository implements AddHorariosRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async add(horarioData: AddHorariosModel): Promise<HorariosModel> {
    // Salvar dados do horário no banco de dados
    const insertHorarios = await this.prisma.dia.create({
      data: {
        id: horarioData.id,
        data: horarioData.data,
        entradaManha: horarioData.entradaManha,
        saidaManha: horarioData.saidaManha,
        entradaTarde: horarioData.entradaTarde,
        saidaTarde: horarioData.saidaTarde,
        entradaExtra: horarioData.entradaExtra,
        saidaExtra: horarioData.saidaExtra,
        dif_min: horarioData.dif_min,
        saldoAnt: horarioData.saldoAnt,
      },
    });

    // Retornar modelo de horários
    const HorariosModel: HorariosModel = {
      id: insertHorarios.id,
      data: insertHorarios.data,
      entradaManha: insertHorarios.entradaManha,
      saidaManha: insertHorarios.saidaManha,
      entradaTarde: insertHorarios.entradaTarde,
      saidaTarde: insertHorarios.saidaTarde,
      entradaExtra: insertHorarios.entradaExtra || undefined,
      saidaExtra: insertHorarios.saidaExtra || undefined,
      dif_min: insertHorarios.dif_min,
      saldoAnt: insertHorarios.saldoAnt,
    };
    return HorariosModel;
  }
}
