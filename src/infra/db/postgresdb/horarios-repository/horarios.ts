import { PrismaClient } from "@prisma/client";
import { AddHorariosRepository } from "../../../../data/usecase/add-horarios/add-horarios-repository";
import { AddHorariosModel } from "../../../../domain/usecases/add-horarios";
import { HorariosModel } from "../../../../domain/models/horarios";
import { prisma } from "../../../database/Prisma"

export class HorariosPostgresRepository implements AddHorariosRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async add(horarioData: AddHorariosModel): Promise<HorariosModel> {
    try {
      const date = new Date();
      date.setHours(date.getHours() - 3);

      // Verifica se os campos de entrada e saída extra estão presentes na requisição
      const dataToUpdate: any = {
        entradaManha: horarioData.entradaManha,
        saidaManha: horarioData.saidaManha,
        dataInicio: date,
      };

      if (horarioData.entradaTarde !== undefined) {
        dataToUpdate.entradaTarde = horarioData.entradaTarde;
      } else {
        dataToUpdate.entradaTarde = ""; // Define como vazio se não estiver presente
      }

      if (horarioData.saidaTarde !== undefined) {
        dataToUpdate.saidaTarde = horarioData.saidaTarde;
      } else {
        dataToUpdate.saidaTarde = ""; // Define como vazio se não estiver presente
      }

      if (horarioData.entradaExtra !== undefined) {
        dataToUpdate.entradaExtra = horarioData.entradaExtra;
      } else {
        dataToUpdate.entradaExtra = ""; // Define como vazio se não estiver presente
      }

      if (horarioData.saidaExtra !== undefined) {
        dataToUpdate.saidaExtra = horarioData.saidaExtra;
      } else {
        dataToUpdate.saidaExtra = ""; // Define como vazio se não estiver presente
      }

      const updateHorarios = await this.prisma.dia.update({
        where: { id: horarioData.id },
        data: dataToUpdate,
      });

      // Retornando o modelo atualizado
      const HorariosModel: HorariosModel = {
        id: updateHorarios.id,
        entradaManha: updateHorarios.entradaManha,
        saidaManha: updateHorarios.saidaManha,
        entradaTarde: updateHorarios.entradaTarde || undefined,
        saidaTarde: updateHorarios.saidaTarde || undefined,
        entradaExtra: updateHorarios.entradaExtra || undefined,
        saidaExtra: updateHorarios.saidaExtra || undefined,
      };

      return HorariosModel;
    } catch (error) {
      console.error("Erro do Prisma:", error);
      throw new Error("Erro ao atualizar o horário");
    }
  }
}
