import { Controller, HttpRequest, HttpResponse } from "./horarios-memory-protocols";
import { AddMemoryHorarios } from "../../../domain/usecases/add-horarios-memory";
import { HorariosMemoryRepository } from "../../../infra/db/postgresdb/horarios-memory-repository/horarios-memory-repository";
import { calcularTotalMinutos, arredondarParteDecimal } from "./utils";
import { HorariosMemoryModel } from "../../../domain/models/horariosMemory";

const horariosRepository = new HorariosMemoryRepository(); // Crie uma instância do repositório

// Escala de trabalho padrão em minutos (8 horas e 48 minutos)
const escalaDiariaMin = 8 * 60 + 48;

export class HorariosMemoryController implements Controller {
  private readonly addMemoryHorarios: AddMemoryHorarios;

  constructor(addMemoryHorarios: AddMemoryHorarios) {
    this.addMemoryHorarios = addMemoryHorarios;
  }

  async handle(_httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      // 1. Recuperar os horários do banco de dados e ordená-los pela data
      let horarios = await horariosRepository.getAllHorariosOrderedByDate();

      // Log para verificar se os horários estão sendo retornados corretamente
      console.log("Horários recuperados do banco de dados:", horarios);

      // 2. Calcular a diferença em minutos e o saldo anterior para cada horário
      let saldoAcumulado = 0;
      let saldoAnt = 0; // Inicializa o saldo anterior
      const horariosComCalculos: HorariosMemoryModel[] = [];
      for (const horario of horarios) {
        let dif_min = 0;

        const totalManhaMin = calcularTotalMinutos(horario.entradaManha, horario.saidaManha);
        dif_min += totalManhaMin;

        if (horario.entradaTarde && horario.saidaTarde) {
          const totalTardeMin = calcularTotalMinutos(horario.entradaTarde, horario.saidaTarde);
          dif_min += totalTardeMin;
        }

        if (horario.entradaExtra && horario.saidaExtra) {
          const totalExtraMin = calcularTotalMinutos(horario.entradaExtra, horario.saidaExtra);
          dif_min += totalExtraMin;
        }

        // Calcula a diferença em relação à escala de trabalho padrão
        dif_min -= escalaDiariaMin;

        // Ajustar dif_min para 0 se estiver dentro do intervalo -10 e 10
        if (dif_min >= -10 && dif_min <= 10) {
          dif_min = 0;
        }

        // Verifica se deve dividir dif_min por 1.6 e se a operação já foi realizada
        if (saldoAnt > 0 && dif_min < 0) {
          dif_min = dif_min / 1.6;
          dif_min = arredondarParteDecimal(dif_min); // Arredonda a parte decimal de dif_min
          saldoAnt += dif_min; // Subtrai o dif_min dividido do saldo anterior
        }

        // Adiciona o saldo atual ao saldo acumulado
        saldoAcumulado += dif_min;

        // Atualizando o saldo anterior
        saldoAnt = saldoAcumulado;

        // Adicionando os cálculos ao horário atual
        const horarioComCalculo: HorariosMemoryModel = {
          ...horario,
          dif_min,
          saldoAnt,
        };

        horariosComCalculos.push(horarioComCalculo);
      }

      // 3. Retornar os horários com os cálculos para o cliente
      return {
        statusCode: 200,
        body: { message: "Horários com cálculos adicionados em memória com sucesso", horarios: horariosComCalculos },
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: { message: "Erro interno do servidor" },
      };
    }
  }
}
