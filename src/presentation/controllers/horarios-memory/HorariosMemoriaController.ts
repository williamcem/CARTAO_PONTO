import { Controller, HttpRequest, HttpResponse } from "./horarios-memory-protocols";
import { AddMemoryHorarios } from "../../../domain/usecases/add-horarios-memory";
import { HorariosMemoryRepository } from "../../../infra/db/postgresdb/horarios-memory-repository/horarios-memory-repository";
import { calcularTotalMinutos, arredondarParteDecimal } from "./utils";
import { HorariosMemoryModel } from "../../../domain/models/horariosMemory";

const horariosRepository = new HorariosMemoryRepository(); // Crie uma instância do repositório

// Escala de trabalho padrão em minutos (8 horas e 48 minutos)
const escalaDiariaMin = 8 * 60 + 48;
const HORA_INICIO_ADICIONAL_NOTURNO = 22; // 22h
const HORA_FIM_ADICIONAL_NOTURNO = 5; // 5h

export class HorariosMemoryController implements Controller {
  private readonly addMemoryHorarios: AddMemoryHorarios;

  constructor(addMemoryHorarios: AddMemoryHorarios) {
    this.addMemoryHorarios = addMemoryHorarios;
  }

  async handle(_httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      // 1. Recuperar os horários do banco de dados e ordená-los pela data
      let horarios = await horariosRepository.getAllHorariosOrderedByDate();

      // 2. Calcular a diferença em minutos e o saldo anterior para cada horário
      let saldoAcumulado = 0;
      let saldoAtual = 0; // Inicializa o saldo anterior
      let somaDifMin100 = 0; // Inicializa a soma de dif_min100
      let somaAdicionalNoturno = 0; // Inicializa a soma do adicional noturno
      let somaDif_min = 0; // Inicializa a soma de dif_min entre dias
      const horariosComCalculos: HorariosMemoryModel[] = [];
      let contador = 0;
      for (const horario of horarios) {
        if (contador === 0) if (horario.recebeDia?.saldoAtual) saldoAcumulado = horario.recebeDia.saldoAtual;

        contador++;

        let dif_min = 0;
        let adicionalNoturno = 0; // Inicializa o adicional noturno

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

        // Calcula o dif_min100 se o dif_min ultrapassar 120 minutos
        let dif_min100 = 0;
        if (dif_min > 120) {
          dif_min100 = dif_min - 120;
          dif_min = 120;
        }

        // Atualiza a soma de dif_min100
        somaDifMin100 += dif_min100;

        for (let index = 0; index <= 2; index++) {
          let horaEntrada = 0,
            horaSaida = 0;

          // Verifica se o horário está dentro do intervalo do adicional noturno (22h às 5h)
          if (index === 0) {
            horaEntrada = parseInt(horario.entradaManha.split(":")[0], 10);
            horaSaida = parseInt(horario.saidaManha.split(":")[0], 10);
          } else if (index === 1) {
            if (horario.entradaTarde && horario.saidaTarde) {
              horaEntrada = parseInt(horario.entradaTarde.split(":")[0], 10);
              horaSaida = parseInt(horario.saidaTarde.split(":")[0], 10);
            }
          } else if (index === 2) {
            if (horario.entradaExtra && horario.saidaExtra) {
              horaEntrada = parseInt(horario.entradaExtra.split(":")[0], 10);
              horaSaida = parseInt(horario.saidaExtra.split(":")[0], 10);
            }
          }

          const isHorarioAdicionalNoturno =
            (horaEntrada >= HORA_INICIO_ADICIONAL_NOTURNO || horaEntrada < HORA_FIM_ADICIONAL_NOTURNO) &&
            (horaSaida >= HORA_INICIO_ADICIONAL_NOTURNO || horaSaida < HORA_FIM_ADICIONAL_NOTURNO);

          if (isHorarioAdicionalNoturno) {
            // Calcula o adicional noturno multiplicando a diferença em minutos por 0.14
            adicionalNoturno = dif_min * 0.14;
            adicionalNoturno = arredondarParteDecimal(adicionalNoturno);
            dif_min *= 1.14;
            dif_min = arredondarParteDecimal(dif_min); // Arredonda a parte decimal de dif_min
          }
        }

        // Verifica se deve dividir dif_min por 1.6 e se a operação já foi realizada
        if (saldoAtual > 0 && dif_min < 0) {
          dif_min = dif_min / 1.6;
          dif_min = arredondarParteDecimal(dif_min); // Arredonda a parte decimal de dif_min
          saldoAtual += dif_min; // Subtrai o dif_min dividido do saldo anterior
        }

        // Adiciona o saldo atual ao saldo acumulado
        saldoAcumulado += dif_min;

        // Atualizando o saldo anterior
        saldoAtual = saldoAcumulado;

        // Adiciona o adicional noturno ao total
        somaAdicionalNoturno += adicionalNoturno;

        // Adiciona dif_min à soma de dif_min entre dias
        somaDif_min += dif_min;

        // Adicionando os cálculos ao horário atual
        const horarioComCalculo: HorariosMemoryModel = {
          ...horario,
          dif_min,
          saldoAtual,
          adicionalNoturno,
          dif_min100, // Adiciona dif_min100 ao objeto
          somaDifMin100, // Adiciona a soma de dif_min100 ao objeto
          somaAdicionalNoturno, // Adiciona a soma de Adicional Noturno ao objeto ao objeto
          somaDif_min, // Adiciona a soma de dif_min entre dias ao objeto
        };

        horariosComCalculos.push(horarioComCalculo);
      }

      // 3. Retornar os horários com os cálculos para o cliente
      return {
        statusCode: 200,
        body: {
          message: "Horários com cálculos adicionados em memória com sucesso",
          horarios: horariosComCalculos,
        },
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
