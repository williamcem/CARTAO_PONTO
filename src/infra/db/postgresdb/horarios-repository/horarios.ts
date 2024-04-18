import { PrismaClient } from "@prisma/client";
import { AddHorariosRepository } from "../../../../data/usecase/add-horarios/add-horarios-repository";
import { AddHorariosModel } from "../../../../domain/usecases/add-horarios";
import { HorariosModel } from "../../../../domain/models/horarios";
import { HorarioData } from "../../../../presentation/controllers/horarios/horarios";

export class HorariosPostgresRepository implements AddHorariosRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async add(horarioData: AddHorariosModel): Promise<HorariosModel> {
    try {
      const date = new Date();
      date.setHours(date.getHours() - 3);

      const updateHorarios = await this.prisma.dia.update({
        where: { id: horarioData.id },
        data: {
          entradaManha: horarioData.entradaManha,
          saidaManha: horarioData.saidaManha,
          entradaTarde: horarioData.entradaTarde,
          saidaTarde: horarioData.saidaTarde,
          entradaExtra: horarioData.entradaExtra || undefined,
          saidaExtra: horarioData.saidaExtra || undefined,
          dif_min: horarioData.dif_min,
          saldoAnt: horarioData.saldoAnt,
          dataInicio: date,
        },
      });

      const HorariosModel: HorariosModel = {
        id: updateHorarios.id,
        entradaManha: updateHorarios.entradaManha,
        saidaManha: updateHorarios.saidaManha,
        entradaTarde: updateHorarios.entradaTarde,
        saidaTarde: updateHorarios.saidaTarde,
        entradaExtra: updateHorarios.entradaExtra || undefined,
        saidaExtra: updateHorarios.saidaExtra || undefined,
        dif_min: updateHorarios.dif_min,
        saldoAnt: updateHorarios.saldoAnt,
      };

      return HorariosModel;
    } catch (error) {
      console.error("Erro do Prisma:", error);
      throw new Error("Erro ao atualizar o horário");
    }
  }

  async getLastHorario(): Promise<HorarioData | null> {
    try {
      const lastHorario = await this.prisma.dia.findFirst({
        orderBy: { dataInicio: "desc" }, // Ordenar pelo ID em ordem decrescente para obter o último registro
      });

      if (lastHorario) {
        return {
          id: lastHorario.id,
          entradaManha: lastHorario.entradaManha,
          saidaManha: lastHorario.saidaManha,
          entradaTarde: lastHorario.entradaTarde,
          saidaTarde: lastHorario.saidaTarde,
          entradaExtra: lastHorario.entradaExtra || undefined,
          saidaExtra: lastHorario.saidaExtra || undefined,
          dif_min: lastHorario.dif_min,
          saldoAnt: lastHorario.saldoAnt,
        };
      }

      return null;
    } catch (error) {
      console.error("Erro do Prisma:", error);
      throw new Error("Erro ao buscar o último horário");
    }
  }
}
