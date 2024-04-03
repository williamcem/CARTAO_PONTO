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
    const insertHorarios = await this.prisma.dia.create({
      data: {
        entradaManha: horarioData.entradaManha,
        saidaManha: horarioData.saidaManha,
        entradaTarde: horarioData.entradaTarde,
        saidaTarde: horarioData.saidaTarde,
        dif_min: horarioData.dif_min,
        tipoUm: horarioData.tipoUm,
        tipoDois: horarioData.tipoDois,
      },
    });

    const HorariosModel: HorariosModel = {
      entradaManha: insertHorarios.entradaManha,
      saidaManha: insertHorarios.saidaManha,
      entradaTarde: insertHorarios.entradaTarde,
      saidaTarde: insertHorarios.saidaTarde,
      dif_min: insertHorarios.dif_min,
      tipoUm: insertHorarios.tipoUm,
      tipoDois: insertHorarios.tipoDois,
    };
    return HorariosModel;
  }
}
