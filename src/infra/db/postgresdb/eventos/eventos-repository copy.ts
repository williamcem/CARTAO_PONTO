/* import { PrismaClient } from "@prisma/client";
import moment from "moment";
import { prisma } from "@infra/database/Prisma";
import { AdicionarEventos } from "../../../../data/usecase/add-eventos/add-eventos";
import { criarEventoAdicionalNoturno } from "./adicionalNoturno";
import { criarEventoIntervaloEntrePeriodos } from "./intervaloEntrePeriodos";

export class CriarEventosPostgresRepository implements AdicionarEventos {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async add(input: { identificacao?: string }): Promise<boolean> {
    const lancamentos = await this.prisma.cartao_dia_lancamento.findMany({
      include: {
        cartao_dia: {
          include: {
            cartao: {
              include: {
                funcionario: true,
              },
            },
          },
        },
      },
      where: {
        cartao_dia: { cartao: { funcionario: { identificacao: input?.identificacao } } },
      },
    });

    const eventosData = this.gerarEventos({ lancamentos });

    const validEventosData = eventosData.filter((evento) => evento.cartaoDiaId && evento.hora);

    const existingEvents = await this.prisma.eventos.findMany({
      where: {
        OR: validEventosData.map((evento) => ({
          cartaoDiaId: evento.cartaoDiaId,
          funcionarioId: evento.funcionarioId,
          hora: evento.hora,
        })),
      },
    });

    const newEventosData = validEventosData.filter((evento) => {
      return !existingEvents.some(
        (existingEvent) =>
          existingEvent.cartaoDiaId === evento.cartaoDiaId &&
          existingEvent.funcionarioId === evento.funcionarioId &&
          existingEvent.hora === evento.hora,
      );
    });

    if (newEventosData.length === 0) {
      console.log("Eventos já existem para as datas fornecidas.");
      return false;
    }

    await this.prisma.eventos.createMany({
      data: newEventosData,
    });

    return true;
  }

  public gerarEventos(input: {
    lancamentos: {
      entrada: Date | null;
      saida: Date | null;
      periodoId: number;
      cartao_dia: {
        id: number;
        data: Date;
        cargaHorariaCompleta: string;
        cartao: {
          funcionario: {
            id: number;
          };
        };
      };
    }[];
  }) {
    return input.lancamentos.flatMap((lancamento, index, lancamentosArray) => {
      if (!lancamento.entrada || !lancamento.saida) return [];

      const entrada = this.pegarLancamento({ data: lancamento.entrada });
      const saida = this.pegarLancamento({ data: lancamento.saida });

      const eventos = [
        {
          cartaoDiaId: lancamento.cartao_dia.id,
          hora: `${entrada.format("HH:mm")} - ${saida.format("HH:mm")}`,
          tipoId: 1,
          funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
          minutos: saida.diff(entrada, "minutes"),
        },
      ];

      console.log(`Evento criado: ${eventos[0].hora} - Tipo: ${eventos[0].tipoId} - Minutos: ${eventos[0].minutos}`);

      const cargaHorariaCompletaArray = this.pegarCargaHorarioCompleta(lancamento.cartao_dia.cargaHorariaCompleta);

      const horarioEntradaEsperado1 = this.pegarHorarioCargaHoraria({
        data: lancamento.cartao_dia.data,
        hora: cargaHorariaCompletaArray[0].hora,
        minuto: cargaHorariaCompletaArray[0].minuto,
        utc: false,
      });

      const periodos = input.lancamentos.filter((l) => l.cartao_dia.id === lancamento.cartao_dia.id).map((l) => l.periodoId);
      const temSomenteSegundoPeriodo = periodos.length === 1 && periodos[0] === 2;

      if (temSomenteSegundoPeriodo) {
        const horarioEntradaReal = entrada;
        const diferencaEntrada = horarioEntradaEsperado1.utc(true).diff(horarioEntradaReal, "minutes");

        console.log(`Entrada esperada 1: ${horarioEntradaEsperado1.format("YYYY-MM-DD HH:mm:ss")}`);
        console.log(`Entrada real: ${entrada.format("YYYY-MM-DD HH:mm:ss")}`);
        console.log(`Diferença de minutos: ${diferencaEntrada}`);

        if (diferencaEntrada !== 0) {
          const hora =
            diferencaEntrada > 0
              ? `${horarioEntradaReal.format("HH:mm")} - ${horarioEntradaEsperado1.utc(true).format("HH:mm")}`
              : `${horarioEntradaEsperado1.utc(true).format("HH:mm")} - ${horarioEntradaReal.format("HH:mm")}`;

          eventos.push({
            cartaoDiaId: lancamento.cartao_dia.id,
            hora,
            tipoId: 2,
            funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
            minutos: diferencaEntrada,
          });

          console.log(`Evento criado: ${hora} - Tipo: 2 - Minutos: ${diferencaEntrada}`);
        }

        const eventoAdicionalNoturnoPrimeiroPeriodo = criarEventoAdicionalNoturno(
          horarioEntradaEsperado1,
          horarioEntradaReal,
          lancamento,
        );
        if (eventoAdicionalNoturnoPrimeiroPeriodo) {
          eventoAdicionalNoturnoPrimeiroPeriodo.minutos = -eventoAdicionalNoturnoPrimeiroPeriodo.minutos;
          eventos.push(eventoAdicionalNoturnoPrimeiroPeriodo);
          console.log(
            `Evento Adicional Noturno: ${eventoAdicionalNoturnoPrimeiroPeriodo.hora} - Minutos: ${eventoAdicionalNoturnoPrimeiroPeriodo.minutos}`,
          );
        }

        // Verificar saída antecipada
        const index = cargaHorariaCompletaArray.length - 2;
        let horarioSaidaEsperado = this.pegarHorarioCargaHoraria({
          data: lancamento.cartao_dia.data,
          hora: cargaHorariaCompletaArray[index].hora,
          minuto: cargaHorariaCompletaArray[index].minuto,
        });

        if (horarioSaidaEsperado.isBefore(horarioEntradaEsperado1.utc(true))) {
          horarioSaidaEsperado.add(1, "day");
        }

        const horarioSaidaReal = saida;
        const diferencaSaida = horarioSaidaReal.diff(horarioSaidaEsperado, "minutes");

        console.log(`Saída esperada: ${horarioSaidaEsperado.format("YYYY-MM-DD HH:mm:ss")}`);
        console.log(`Saída real: ${saida.format("YYYY-MM-DD HH:mm:ss")}`);
        console.log(`Diferença de minutos: ${diferencaSaida}`);

        if (diferencaSaida < 0) {
          eventos.push({
            cartaoDiaId: lancamento.cartao_dia.id,
            hora: `${horarioSaidaEsperado.format("HH:mm")} - ${horarioSaidaReal.format("HH:mm")}`,
            tipoId: diferencaEntrada > 0 ? 1 : 2,
            funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
            minutos: diferencaSaida,
          });

          console.log(
            `Evento criado: ${horarioSaidaEsperado.format("HH:mm")} - ${horarioSaidaReal.format("HH:mm")} - Tipo: ${diferencaEntrada > 0 ? 1 : 2} - Minutos: ${diferencaSaida}`,
          );
        }

        const minutosTotaisEsperados = horarioSaidaEsperado.diff(horarioEntradaEsperado1.utc(true), "minutes");

        const eventoAdicionalNoturno = criarEventoAdicionalNoturno(horarioSaidaEsperado, horarioSaidaReal, lancamento);
        if (eventoAdicionalNoturno) {
          eventos.push(eventoAdicionalNoturno);
          console.log(`Evento Adicional Noturno: ${eventoAdicionalNoturno.hora} - Minutos: ${eventoAdicionalNoturno.minutos}`);
        }

        return eventos;
      }

      if (lancamento.periodoId === 1) {
        const horarioEntradaReal = entrada;
        const diferencaEntrada = horarioEntradaEsperado1.diff(horarioEntradaReal, "minutes");

        console.log(`Entrada esperada 1: ${horarioEntradaEsperado1.format("YYYY-MM-DD HH:mm:ss")}`);
        console.log(`Entrada real: ${entrada.format("YYYY-MM-DD HH:mm:ss")}`);
        console.log(`Diferença de minutos: ${diferencaEntrada}`);

        if (diferencaEntrada !== 0) {
          const hora =
            diferencaEntrada > 0
              ? `${horarioEntradaReal.format("HH:mm")} - ${horarioEntradaEsperado1.format("HH:mm")}`
              : `${horarioEntradaEsperado1.format("HH:mm")} - ${horarioEntradaReal.format("HH:mm")}`;

          eventos.push({
            cartaoDiaId: lancamento.cartao_dia.id,
            hora,
            tipoId: diferencaEntrada > 0 ? 1 : 2,
            funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
            minutos: diferencaEntrada,
          });

          console.log(`Evento criado: ${hora} - Tipo: ${diferencaEntrada > 0 ? 1 : 2} - Minutos: ${diferencaEntrada}`);

          const eventoAdicionalNoturno = criarEventoAdicionalNoturno(horarioEntradaEsperado1, horarioEntradaReal, lancamento);
          if (eventoAdicionalNoturno) {
            eventos.push(eventoAdicionalNoturno);
            console.log(`Evento Adicional Noturno: ${eventoAdicionalNoturno.hora} - Minutos: ${eventoAdicionalNoturno.minutos}`);
          }
        }
      }

      const lastPeriodId = Math.max(...periodos);

      if (lancamento.periodoId === lastPeriodId) {
        const index = cargaHorariaCompletaArray.length - 2;

        let horarioSaidaEsperado = this.pegarHorarioCargaHoraria({
          data: lancamento.cartao_dia.data,
          hora: cargaHorariaCompletaArray[index].hora,
          minuto: cargaHorariaCompletaArray[index].minuto,
        });

        if (horarioSaidaEsperado.isBefore(horarioEntradaEsperado1)) {
          horarioSaidaEsperado.add(1, "day");
        }

        const horarioSaidaReal = saida;
        const diferencaSaida = horarioSaidaReal.diff(horarioSaidaEsperado, "minutes");

        console.log(`Saída esperada: ${horarioSaidaEsperado.format("YYYY-MM-DD HH:mm:ss")}`);
        console.log(`Saída real: ${saida.format("YYYY-MM-DD HH:mm:ss")}`);
        console.log(`Diferença de minutos: ${diferencaSaida}`);

        if (diferencaSaida !== 0) {
          // Evento do início do segundo período até a saída esperada
          const eventoPeriodoEsperado = {
            cartaoDiaId: lancamento.cartao_dia.id,
            hora: `${entrada.format("HH:mm")} - ${horarioSaidaEsperado.format("HH:mm")}`,
            tipoId: 1,
            funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
            minutos: Math.abs(horarioSaidaEsperado.diff(entrada, "minutes")),
          };
          eventos.push(eventoPeriodoEsperado);
          console.log(
            `Evento criado: ${eventoPeriodoEsperado.hora} - Tipo: ${eventoPeriodoEsperado.tipoId} - Minutos: ${eventoPeriodoEsperado.minutos}`,
          );

          // Evento para o tempo excedente
          const eventoExcedente = {
            cartaoDiaId: lancamento.cartao_dia.id,
            hora: `${horarioSaidaEsperado.format("HH:mm")} - ${saida.format("HH:mm")}`,
            tipoId: 2,
            funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
            minutos: Math.abs(diferencaSaida),
          };
          eventos.push(eventoExcedente);
          console.log(
            `Evento criado: ${eventoExcedente.hora} - Tipo: ${eventoExcedente.tipoId} - Minutos: ${eventoExcedente.minutos}`,
          );

          if (this.isDentroDoPeriodoNoturno(horarioSaidaEsperado)) {
            const eventoAdicionalNoturno = criarEventoAdicionalNoturno(horarioSaidaEsperado, horarioSaidaReal, lancamento);
            if (eventoAdicionalNoturno) {
              eventos.push(eventoAdicionalNoturno);
              console.log(
                `Evento Adicional Noturno: ${eventoAdicionalNoturno.hora} - Minutos: ${eventoAdicionalNoturno.minutos}`,
              );
            }
          }
        }
      }

      // Verificar intervalos entre períodos
      const proximoLancamento = lancamentosArray[index + 1];
      if (proximoLancamento && proximoLancamento.periodoId === lancamento.periodoId + 1) {
        const horarioSaidaPeriodoAtual = saida;
        const horarioEntradaProximoPeriodo = moment.utc(proximoLancamento.entrada);

        const eventoIntervalo = criarEventoIntervaloEntrePeriodos(
          horarioSaidaPeriodoAtual,
          horarioEntradaProximoPeriodo,
          lancamento,
          periodos.length,
        );
        if (eventoIntervalo) {
          eventos.push(eventoIntervalo);
          console.log(`Evento Intervalo: ${eventoIntervalo.hora} - Minutos: ${eventoIntervalo.minutos}`);
        }
      }

      return eventos;
    });
  }

  public pegarLancamento(input: { data: Date }) {
    return moment.utc(input.data);
  }

  public pegarCargaHorarioCompleta(input: string) {
    const horaMinutos = input.replaceAll(".", ":").split(";");
    const newHoraMinutos = horaMinutos.map((a) => {
      const [hora, minuto] = a.split(":");
      return { hora: Number(hora), minuto: Number(minuto) };
    });

    return newHoraMinutos;
  }

  public pegarHorarioCargaHoraria(input: { data: Date; hora: number; minuto: number; utc?: boolean }) {
    return moment.utc(input.data).set({
      hours: input.hora,
      minutes: input.minuto,
      date: moment(input.data).utc(input.utc).date(),
      months: moment(input.data).utc(input.utc).month(),
      years: moment(input.data).utc(input.utc).year(),
      second: 0,
    });
  }

  public formatarDataCartao(input: { data: Date }) {
    return moment.utc(input.data).format("YYYY-MM-DD");
  }

  private isDentroDoPeriodoNoturno(horario: moment.Moment): boolean {
    const inicioAdicionalNoturno = moment.utc(horario).set({ hour: 22, minute: 0, second: 0 });
    const fimAdicionalNoturno = moment.utc(horario).set({ hour: 5, minute: 0, second: 0 }).add(1, "day");
    return horario.isBetween(inicioAdicionalNoturno, fimAdicionalNoturno);
  }
}
 */


