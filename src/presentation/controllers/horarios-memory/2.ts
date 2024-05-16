/* import { Controller, HttpRequest, HttpResponse } from "./horarios-memory-protocols";
import { AddMemoryHorarios } from "../../../domain/usecases/add-horarios-memory";
import { HorariosMemoryRepository } from "../../../infra/db/postgresdb/horarios-memory-repository/horarios-memory-repository";
import { calcularTotalMinutos, arredondarParteDecimal } from "./utils";
import { HorariosMemoryModel } from "../../../domain/models/horariosMemory";
import moment from "moment";

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

      // 2. Calcular a diferença em minutos e o saldo anterior para cada horário
      let saldoAcumulado = 0;
      let saldoAtual = 0; // Inicializa o saldo anterior
      let somaDifMin100 = 0; // Inicializa a soma de dif_min100
      let somaAdicionalNoturno = 0; // Inicializa a soma do adicional noturno
      let somaDif_min = 0; // Inicializa a soma de dif_min entre dias
      let adicionalNoturno100 = 0; // Inicializa a soma de dif_min entre dias
      let somaAdicionalNoturno100 = 0; // Inicializa a soma de dif_min entre dias
      let dif_min100 = 0;

      const horariosComCalculos: HorariosMemoryModel[] = [];
      let contador = 0;
      let inf = {};

      for (const horario of horarios) {
        if (contador === 0) if (horario.recebeDia?.saldoAnterior) saldoAcumulado = horario.recebeDia.saldoAnterior;

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

        for (let index = 0; index <= 2; index++) {
          let horaEntrada = 0,
            horaSaida = 0,
            entradaData = undefined,
            saidaData = undefined;

          // Verifica se o horário está dentro do intervalo do adicional noturno (22h às 5h)
          if (index === 0) {
            if (horario.entradaManha === "" && horario.saidaManha === "") continue;
            horaEntrada = parseInt(horario.entradaManha.split(":")[0], 10);
            horaSaida = parseInt(horario.saidaManha.split(":")[0], 10);
            entradaData = moment(horario.recebeDia?.data).utc(false).add(horario.entradaManha);
            saidaData = moment(horario.recebeDia?.data).utc(false).add(horario.saidaManha);
          } else if (index === 1) {
            if (horario.entradaTarde === "" && horario.saidaTarde === "") continue;
            if (horario.entradaTarde && horario.saidaTarde) {
              horaEntrada = parseInt(horario.entradaTarde.split(":")[0], 10);
              horaSaida = parseInt(horario.saidaTarde.split(":")[0], 10);
              entradaData = moment(horario.recebeDia?.data).utc(false).add(horario.entradaTarde);
              saidaData = moment(horario.recebeDia?.data).utc(false).add(horario.saidaTarde);
            }
          } else if (index === 2) {
            if (horario.entradaExtra === "" && horario.saidaExtra === "") continue;
            if (horario.entradaExtra && horario.saidaExtra) {
              horaEntrada = parseInt(horario.entradaExtra.split(":")[0], 10);
              horaSaida = parseInt(horario.saidaExtra.split(":")[0], 10);
              entradaData = moment(horario.recebeDia?.data).utc(false).add(horario.entradaExtra);
              saidaData = moment(horario.recebeDia?.data).utc(false).add(horario.saidaExtra);
            }
          }

          if (saidaData?.isBefore(entradaData)) saidaData?.add(1, "d");

          //Se a primeira entrada for depois da entrada atual adiciona 1 dia
          if (entradaData?.isBefore(moment(horario.recebeDia?.data).utc(false).add(horario.entradaManha))) {
            entradaData?.add(1, "d");
          }

          //Se a primeira entrada for depois da saida atual adiciona 1 dia
          if (saidaData?.isBefore(moment(horario.recebeDia?.data).utc(false).add(horario.entradaManha))) {
            saidaData?.add(1, "d");
          }
          const inicioAdicional = moment(horario.recebeDia?.data).utc(false).minutes(0).seconds(0).hour(22);
          const finalAdicional = moment(horario.recebeDia?.data).utc(false).minutes(0).seconds(0).add(1, "d").hour(5);

          let difMinNotuno = 0;

          //Quando Entrada e saida estão no adicional
          if (entradaData?.isBetween(inicioAdicional, finalAdicional)) {
            if (entradaData.isAfter(inicioAdicional)) {
              if (saidaData?.isBefore(finalAdicional)) {
                difMinNotuno = saidaData.diff(entradaData, "minutes");
              }
            }
          }

          //Quando a saida está entre o adicional e a entrada está antes
          if (saidaData?.isBetween(inicioAdicional, finalAdicional) && entradaData?.isBefore(inicioAdicional)) {
            difMinNotuno = saidaData.diff(inicioAdicional, "minutes");
          }

          //Quando a entrada está entre o adicional e a saida depois
          if (entradaData?.isBetween(inicioAdicional, finalAdicional) && saidaData?.isAfter(finalAdicional)) {
            difMinNotuno = finalAdicional.diff(entradaData, "minutes");
          }

          //Quando inicio e final do adicional estão entre entrada e saida e entrada é antes do inicio do adicional e a saída é depois do fim do adicional
          if (
            inicioAdicional.isBetween(entradaData, saidaData) &&
            finalAdicional.isBetween(entradaData, saidaData) &&
            entradaData?.isBefore(inicioAdicional) &&
            saidaData?.isAfter(finalAdicional)
          ) {
            difMinNotuno = finalAdicional.diff(inicioAdicional, "minutes");
          }

          if (entradaData?.isSame(inicioAdicional)) {
            if (saidaData?.isBefore(finalAdicional)) {
              difMinNotuno = saidaData.diff(entradaData, "minutes");
            } else {
              difMinNotuno = finalAdicional.diff(entradaData, "minutes");
            }
          }

          if (saidaData?.isSame(finalAdicional)) {
            if (entradaData?.isBefore(inicioAdicional)) {
              difMinNotuno = saidaData.diff(inicioAdicional, "minutes");
            } else {
              difMinNotuno = saidaData.diff(entradaData, "minutes");
            }
          }

          //Após achar o adicionalNoturno tem que verificar se o dif_min já bateu os 120, se não bateu tem que completar, o que sobrar vira 100%
          if (difMinNotuno > 0) {
            adicionalNoturno = difMinNotuno * 1.14;
            adicionalNoturno = arredondarParteDecimal(adicionalNoturno);

            // Calcula o dif_min100 se o dif_min ultrapassar 120 minutos
            if (dif_min > 120) {
              dif_min = dif_min - difMinNotuno;
            }

            const faltaPara120 = 120 - dif_min;

            if (faltaPara120 > 0) {
              if (adicionalNoturno > faltaPara120) {
                // Se adicionalNoturno é maior do que o necessário para completar 120
                const partePara120 = faltaPara120;
                const parteRestante = adicionalNoturno - partePara120;

                // Atualiza dif_min e dif_min100
                dif_min += partePara120;
                dif_min100 = parteRestante;
                adicionalNoturno100 = parteRestante;
              }
            }

            // Verifica se deve dividir dif_min por 1.6 e se a operação já foi realizada
            if (saldoAtual > 0 && dif_min < 0) {
              dif_min = dif_min / 1.6;
              dif_min = arredondarParteDecimal(dif_min); // Arredonda a parte decimal de dif_min
              saldoAtual += dif_min; // Subtrai o dif_min dividido do saldo anterior
            }

            // Atualiza a soma de adicionalNoturno100
            somaAdicionalNoturno100 += adicionalNoturno100;

            // Adiciona ao adicionalNoturno sobre o resto de 120 (se houver)
            adicionalNoturno = faltaPara120;

            // Atualiza a soma de dif_min100
            somaDifMin100 += dif_min100;

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
              somaDif_min, // Adiciona a soma de dif_min entre dias ao objeto
              dif_min100, // Adiciona dif_min100 ao objeto
              somaDifMin100, // Adiciona a soma de dif_min100 ao objeto
              adicionalNoturno,
              somaAdicionalNoturno, // Adiciona a soma de Adicional Noturno ao objeto ao objeto
              adicionalNoturno100,
              somaAdicionalNoturno100,
            };

            horariosComCalculos.push(horarioComCalculo);
          }
        }

        if (horario.recebeDia.nome) {
          inf.matricula = horario.recebeDia.matricula;
          inf.nome = horario.recebeDia.nome;
          inf.setor = horario.recebeDia.setor;
          inf.expediente = horario.recebeDia.expediente;
          inf.mes = horario.recebeDia.mes;
          inf.saldoAnterior = horario.recebeDia.saldoAnterior;
        }
      }
      // 3. Retornar os horários com os cálculos para o cliente
      return {
        statusCode: 200,
        body: {
          message: "Horários com cálculos adicionados em memória com sucesso",
          horarios: horariosComCalculos,
          resumo: inf,
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
 */
