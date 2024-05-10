import { PrismaClient } from "@prisma/client";
import { AddHorariosMemoryRepository } from "../../../../data/usecase/add-horarios-memory/add-horarios-memory-repository";
import { AddHorariosMemoryModel } from "../../../../domain/usecases/add-horarios-memory";
import { HorariosMemoryModel } from "../../../../domain/models/horariosMemory";

const prisma = new PrismaClient();

export class HorariosMemoryRepository implements AddHorariosMemoryRepository {
  private horarios: HorariosMemoryModel[] = [];

  async adicionarHorarioMemoria(horarioData: AddHorariosMemoryModel): Promise<HorariosMemoryModel> {
    const novoHorario: HorariosMemoryModel = {
      id: horarioData.id,
      entradaManha: horarioData.entradaManha,
      saidaManha: horarioData.saidaManha,
      entradaTarde: horarioData.entradaTarde || undefined,
      saidaTarde: horarioData.saidaTarde || undefined,
      entradaExtra: horarioData.entradaExtra || undefined,
      saidaExtra: horarioData.saidaExtra || undefined,
      dif_min: horarioData.dif_min || 0,
      saldoAnt: this.calcularSaldoAnterior(horarioData.id, horarioData.dif_min || 0),
    };

    this.horarios.push(novoHorario);
    return novoHorario;
  }

  // Método para obter todos os horários registrados
  async getAllHorariosOrderedByDate(): Promise<HorariosMemoryModel[]> {
    try {
      // Consultar todos os registros da tabela dia usando o Prisma
      const dias = await prisma.dia.findMany({ include: { receberdados: true } });

      // Mapear os resultados para o formato esperado de HorariosMemoryModel
      const horarios = dias.map((dia) => ({
        id: dia.id,
        entradaManha: dia.entradaManha,
        saidaManha: dia.saidaManha,
        entradaTarde: dia.entradaTarde ?? undefined, // Usando ?? para converter null para undefined
        saidaTarde: dia.saidaTarde ?? undefined,
        entradaExtra: dia.entradaExtra ?? undefined,
        saidaExtra: dia.saidaExtra ?? undefined,
        dif_min: dia.dif_min,
        saldoAnt: dia.saldoAnt ?? undefined,
        recebeDia: { saldoAnt: dia.receberdados.saldoanterior },
      }));

      /* console.log("Horários recuperados do banco de dados:", horarios); */
      return horarios;
    } catch (error) {
      console.error("Erro ao recuperar os horários do banco de dados:", error);
      throw error;
    }
  }

  calcularSaldoAnterior(id: string, dif_min: number | undefined): number {
    const horariosAnteriores = this.horarios.filter(
      (horario) => horario.id !== id && typeof horario.dif_min === "number" && typeof horario.dif_min !== "undefined",
    );
    const saldoAnterior = horariosAnteriores.reduce((saldo, horario) => saldo + (horario.dif_min || 0), 0);
    return saldoAnterior + (dif_min || 0);
  }

  /*   // Método para obter o último horário registrado
  getUltimoHorario(): HorariosMemoryModel | undefined | number {
    return this.horarios.length > 0 ? this.horarios[this.horarios.length - 1] : undefined;
  } */
}
