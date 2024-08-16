import { PrismaClient } from "@prisma/client";
import moment from "moment";

import { prisma } from "@infra/database/Prisma";

import { AdicionarEventos } from "../../../../data/usecase/add-eventos/add-eventos";
import { criarEventoAdicionalNoturno } from "./adicionalNoturno";
import { criarEventoIntervaloEntrePeriodos } from "./intervaloEntrePeriodos";
import { RecalcularTurnoController } from "../../../../presentation/controllers/recalcular-turno/recalcular-turno";
import { arredondarParteDecimal } from "./utils";
export class CriarEventosPostgresRepository implements AdicionarEventos {
  private prisma: PrismaClient;

  constructor(private readonly recalcularTurnoController: RecalcularTurnoController) {
    this.prisma = prisma;
  }
  public porcentagemAdicionalNoturno = 0.14;

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
        cartao_dia: { cartao: { funcionario: { identificacao: input?.identificacao }, statusId: 1 } },
      },
      orderBy: [{ cartao_dia: { cartao: { funcionarioId: "asc" } } }, { cartao_dia_id: "asc" }, { periodoId: "asc" }],
    });

    const eventosData = await this.gerarEventos({ lancamentos });

    const abonosRegra: {
      cartaoDiaId: number;
      minutos: { minutos: number; periodoId: number }[];
    }[] = [];

    eventosData.map((evento) => {
      if (evento.tipoId === 9) {
        const existeIndexAbono = abonosRegra.findIndex((abono) => abono.cartaoDiaId === evento.cartaoDiaId);

        if (existeIndexAbono === -1) {
          abonosRegra.push({
            cartaoDiaId: evento.cartaoDiaId,
            minutos: [{ minutos: evento.minutos, periodoId: evento.periodoId }],
          });
        } else {
          abonosRegra[existeIndexAbono].minutos.push({ minutos: evento.minutos, periodoId: evento.periodoId });
        }
      }
      return undefined;
    });

    const validEventosData = eventosData.filter((evento) => evento.cartaoDiaId && evento.hora);

    const indexParaRemover: number[] = [];

    for (let index = 0; index < validEventosData.length; index++) {
      const evento = validEventosData[index];

      const exist = await this.prisma.eventos.findFirst({
        where: {
          cartaoDiaId: evento.cartaoDiaId,
          funcionarioId: evento.funcionarioId,
          hora: evento.hora,
        },
      });

      if (exist) indexParaRemover.push(index);
    }

    let newEventosData = [];

    newEventosData = validEventosData.filter((evento, index) => {
      const exist = indexParaRemover.some((i) => i === index);
      if (!exist) return evento;
    });

    if (newEventosData.length === 0) {
      console.log("Eventos já existem para as datas fornecidas.");
      return false;
    }

    await this.prisma.eventos.createMany({
      data: newEventosData.map((evento) => {
        delete evento.periodoId;
        return evento;
      }),
    });

    return true;
  }

  public async gerarEventos(input: {
    lancamentos: {
      entrada: Date | null;
      saida: Date | null;
      periodoId: number;
      cartao_dia: {
        id: number;
        data: Date;
        cargaHorariaCompleta: string;
        cargaHorSegundoPeriodo: number;
        cartao: {
          funcionario: {
            id: number;
          };
        };
        periodoDescanso: number;
      };
    }[];
  }) {
    let eventos: any[] = [];
    let eventosExcendentes: any[] = [];

    // VERIFICAR SE EXISTE EXCEDENTE EM ALGUM PERIODO
    let excedeu = false;
    input.lancamentos.forEach((lancamento, index, lancamentosArray) => {
      if (index === 0 || input.lancamentos[index - 1].cartao_dia.id !== lancamento.cartao_dia.id) {
        excedeu = false;
        eventosExcendentes = [];
      }

      if (!lancamento.entrada || !lancamento.saida) return;

      const entrada = this.pegarLancamento({ data: lancamento.entrada });
      const saida = this.pegarLancamento({ data: lancamento.saida });

      console.log(`Entrada: ${entrada.format("HH:mm")} - Saída: ${saida.format("HH:mm")}`);

      const cargaHorariaCompletaArray = this.pegarCargaHorarioCompleta(lancamento.cartao_dia.cargaHorariaCompleta);
      const horarioEntradaEsperado1 = this.pegarHorarioCargaHoraria({
        data: lancamento.cartao_dia.data,
        hora: cargaHorariaCompletaArray[0].hora,
        minuto: cargaHorariaCompletaArray[0].minuto,
        utc: false,
      });
      const horarioSaidaEsperado = lancamento.cartao_dia.cargaHorSegundoPeriodo
        ? this.pegarHorarioCargaHoraria({
            data: lancamento.cartao_dia.data,
            hora: cargaHorariaCompletaArray[cargaHorariaCompletaArray.length - 2].hora,
            minuto: cargaHorariaCompletaArray[cargaHorariaCompletaArray.length - 2].minuto,
            utc: false,
          })
        : this.pegarHorarioCargaHoraria({
            data: lancamento.cartao_dia.data,
            hora: cargaHorariaCompletaArray[1].hora,
            minuto: cargaHorariaCompletaArray[1].minuto,
            utc: false,
          });

      console.log(`Horário Entrada Esperado: ${horarioEntradaEsperado1.format("HH:mm")}`);
      console.log(`Horário Saída Esperado: ${horarioSaidaEsperado.format("HH:mm")}`);
      console.log(`Saída Real: ${saida.format("HH:mm")}`);

      const resultado = this.extrairEventosPeriodo(
        lancamento,
        entrada,
        saida,
        horarioEntradaEsperado1,
        horarioSaidaEsperado,
        eventos,
        eventosExcendentes,
        index === lancamentosArray.length - 1,
      );

      if (resultado) excedeu = true;

      if (index < lancamentosArray.length - 1) {
        const proximoLancamento = lancamentosArray[index + 1];
        if (proximoLancamento.periodoId === lancamento.periodoId + 1) {
          const horarioSaidaPeriodoAtual = saida;
          const horarioEntradaProximoPeriodo = moment.utc(proximoLancamento.entrada);
          this.extrairIntervalosEntrePeriodos(
            horarioSaidaPeriodoAtual,
            horarioEntradaProximoPeriodo,
            lancamento,
            eventos,
            lancamento.cartao_dia.periodoDescanso,
          );
        }
      }

      eventosExcendentes.forEach((value) => {
        const novoEventos: any[] = [];

        eventos.map((evento) => {
          if (evento.cartaoDiaId === value.cartaoDiaId && evento.hora === value.hora && evento.tipoId === 9) {
            console.log("entuo");
          } else {
            novoEventos.push(evento);
          }

          return undefined;
        });

        novoEventos.push(value);

        eventos = novoEventos;

        //eventos.push(value);
      });

      eventosExcendentes = [];
    });

    {
      //eventos = await this.aplicarEventosHorarioNaoTrabalhado({ eventos });
    }

    {
      eventos = await this.removerEventosNegativoIncorreto({ eventos });
    }

    //Cria eventos adicional nortuno
    {
      eventos = await this.criarAdicionalNoturno({ eventos });
    }

    //APLICAR REGRA +10 -10
    {
      eventos = await this.aplicarTolerancia10Minutos({ eventos });
    }

    return eventos;
  }

  private extrairEventosPeriodo(
    lancamento: any,
    entrada: moment.Moment,
    saida: moment.Moment,
    horarioEntradaEsperado1: moment.Moment,
    horarioSaidaEsperado: moment.Moment,
    eventos: any[],
    eventosExcendentes: any[],
    isUltimoPeriodo: boolean,
  ) {
    let excedeu = false;
    const periodoId = lancamento.periodoId;
    if (horarioSaidaEsperado.isBefore(horarioEntradaEsperado1)) {
      horarioSaidaEsperado.add(1, "day");
    }

    if (periodoId === 1) {
      const resultado1 = this.criarEventoPeriodo1(
        lancamento,
        entrada,
        saida,
        horarioEntradaEsperado1,
        eventos,
        eventosExcendentes,
      );

      if (resultado1) excedeu = true;
    } else if (periodoId === 2) {
      const resultado2 = this.criarEventoPeriodo2(lancamento, entrada, saida, horarioSaidaEsperado, eventos, eventosExcendentes);
      if (resultado2) excedeu = true;
    } else if (periodoId === 3) this.criarEventoPeriodo3(lancamento, entrada, saida, eventos);

    if (isUltimoPeriodo) {
      const eventoAdicionalNoturno = criarEventoAdicionalNoturno(horarioSaidaEsperado, saida, lancamento);
      if (eventoAdicionalNoturno) {
        eventos.push({ ...eventoAdicionalNoturno, ...{ periodoId: lancamento.periodoId } });
        console.log(
          `Evento Adicional Noturno criado: ${eventoAdicionalNoturno.hora} - Tipo: ${eventoAdicionalNoturno.tipoId} - Minutos: ${eventoAdicionalNoturno.minutos}`,
        );
      }
    }

    return excedeu;
  }

  private criarEventoPeriodo1(
    lancamento: any,
    entrada: moment.Moment,
    saida: moment.Moment,
    horarioEntradaEsperado1: moment.Moment,
    eventos: any[],
    eventosExcendentes: any[],
  ) {
    let excedeu = false;

    // Verificar se todos os horários são zero
    const cargaHorariaCompletaArray = this.pegarCargaHorarioCompleta(lancamento.cartao_dia.cargaHorariaCompleta);
    const isFolga = cargaHorariaCompletaArray.every((horario) => horario.hora === 0 && horario.minuto === 0);

    if (entrada.isBefore(horarioEntradaEsperado1)) {
      const eventoPeriodoReal = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${horarioEntradaEsperado1.format("HH:mm")} - ${saida.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(horarioEntradaEsperado1, "minutes"),
      };
      eventos.push({ ...eventoPeriodoReal, ...{ periodoId: 1 } });
      console.log(
        `Evento criado: ${eventoPeriodoReal.hora} - Tipo: ${eventoPeriodoReal.tipoId} - Minutos: ${eventoPeriodoReal.minutos}`,
      );
    } else {
      const eventoPeriodo1 = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${entrada.format("HH:mm")} - ${saida.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(entrada, "minutes"),
      };

      eventos.push({ ...eventoPeriodo1, ...{ periodoId: 1 } });
      console.log(`Evento criado: ${eventoPeriodo1.hora} - Tipo: ${eventoPeriodo1.tipoId} - Minutos: ${eventoPeriodo1.minutos}`);
    }

    const eventoExcedentePositivo = {
      cartaoDiaId: lancamento.cartao_dia.id,
      hora: `${entrada.format("HH:mm")} - ${horarioEntradaEsperado1.format("HH:mm")}`,
      tipoId: 1,
      funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
      minutos: horarioEntradaEsperado1.diff(entrada, "minutes"),
    };

    if (eventoExcedentePositivo.minutos < 0 && !isFolga) {
      eventoExcedentePositivo.tipoId = 2;
    }

    if (eventoExcedentePositivo.minutos < 0) {
      eventoExcedentePositivo.hora = `${horarioEntradaEsperado1.format("HH:mm")} - ${entrada.format("HH:mm")}`;
    }

    if (Math.abs(eventoExcedentePositivo.minutos) > 5) {
      excedeu = true;
    }

    if (Math.abs(eventoExcedentePositivo.minutos) > 0 && !(isFolga && eventoExcedentePositivo.minutos < 0)) {
      eventosExcendentes.push({ ...eventoExcedentePositivo, ...{ periodoId: 1 } });
    }

    if (excedeu) {
      console.log(
        `Evento criado: ${eventoExcedentePositivo.hora} - Tipo: ${eventoExcedentePositivo.tipoId} - Minutos: ${eventoExcedentePositivo.minutos}`,
      );
    } else if (eventoExcedentePositivo.minutos < 0 && !isFolga) {
    }

    return excedeu;
  }

  private criarEventoPeriodo2(
    lancamento: any,
    entrada: moment.Moment,
    saida: moment.Moment,
    horarioSaidaEsperado: moment.Moment,
    eventos: any[],
    eventosExcendentes: any[],
  ) {
    let excedeu = false;

    // Verificar se todos os horários são zero
    const cargaHorariaCompletaArray = this.pegarCargaHorarioCompleta(lancamento.cartao_dia.cargaHorariaCompleta);
    const isFolga = cargaHorariaCompletaArray.every((horario) => horario.hora === 0 && horario.minuto === 0);

    if (saida.isBefore(horarioSaidaEsperado)) {
      const eventoPeriodoReal = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${entrada.format("HH:mm")} - ${saida.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(entrada, "minutes"),
      };
      eventos.push({ ...eventoPeriodoReal, ...{ periodoId: 2 } });
      console.log(
        `Evento criado: ${eventoPeriodoReal.hora} - Tipo: ${eventoPeriodoReal.tipoId} - Minutos: ${eventoPeriodoReal.minutos}`,
      );

      const eventoExcedentePositivo = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${horarioSaidaEsperado.format("HH:mm")} - ${saida.format("HH:mm")}`,
        tipoId: 2,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(horarioSaidaEsperado, "minutes"),
      };

      console.log(eventoExcedentePositivo.minutos, "minutos");

      if (Math.abs(eventoExcedentePositivo.minutos) > 5) {
        excedeu = true;
      }

      if (Math.abs(eventoExcedentePositivo.minutos) > 0 && !(isFolga && eventoExcedentePositivo.minutos < 0)) {
        eventosExcendentes.push({ ...eventoExcedentePositivo, ...{ periodoId: 2 } });
      }

      if (eventoExcedentePositivo.minutos < 0) {
        eventoExcedentePositivo.hora = `${saida.format("HH:mm")} - ${horarioSaidaEsperado.format("HH:mm")}`;
      }

      if (excedeu) {
        console.log(
          `Evento criado000000000: ${eventoExcedentePositivo.hora} - Tipo: ${eventoExcedentePositivo.tipoId} - Minutos: ${eventoExcedentePositivo.minutos}`,
        );
      } else if (eventoExcedentePositivo.minutos < 0 && !isFolga) {
      }
    } else {
      const eventoPeriodoEsperado = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${entrada.format("HH:mm")} - ${horarioSaidaEsperado.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: horarioSaidaEsperado.diff(entrada, "minutes"),
      };
      eventos.push({ ...eventoPeriodoEsperado, ...{ periodoId: 2 } });
      console.log(
        `Evento criado: ${eventoPeriodoEsperado.hora} - Tipo: ${eventoPeriodoEsperado.tipoId} - Minutos: ${eventoPeriodoEsperado.minutos}`,
      );

      const eventoExcedentePositivo = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${horarioSaidaEsperado.format("HH:mm")} - ${saida.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(horarioSaidaEsperado, "minutes"),
      };

      if (Math.abs(eventoExcedentePositivo.minutos) > 5) {
        excedeu = true;
      }

      if (Math.abs(eventoExcedentePositivo.minutos) > 0 && !(isFolga && eventoExcedentePositivo.minutos < 0)) {
        eventosExcendentes.push({ ...eventoExcedentePositivo, ...{ periodoId: 2 } });
      }

      if (excedeu) {
        console.log(
          `Evento criado: ${eventoExcedentePositivo.hora} - Tipo: ${eventoExcedentePositivo.tipoId} - Minutos: ${eventoExcedentePositivo.minutos}`,
        );
      } else if (eventoExcedentePositivo.minutos < 0 && !isFolga) {
      }
    }

    return excedeu;
  }

  private criarEventoPeriodo3(lancamento: any, entrada: moment.Moment, saida: moment.Moment, eventos: any[]) {
    const minutos = saida.diff(entrada, "minutes");

    const eventoTrabalhado = {
      cartaoDiaId: lancamento.cartao_dia.id,
      hora: `${entrada.format("HH:mm")} - ${saida.format("HH:mm")}`,
      tipoId: 1,
      funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
      minutos: minutos,
    };

    eventos.push(eventoTrabalhado);
  }

  public extrairIntervalosEntrePeriodos(
    horarioSaidaPeriodoAtual: moment.Moment,
    horarioEntradaProximoPeriodo: moment.Moment,
    lancamento: any,
    eventos: any[],
    descanso: number,
  ) {
    const eventoIntervalo = criarEventoIntervaloEntrePeriodos(
      horarioSaidaPeriodoAtual,
      horarioEntradaProximoPeriodo,
      lancamento,
      eventos.length,
    );

    if (eventoIntervalo) {
      const inicioHorarioDescansoPrevisto = this.pegarCargaHorarioCompleta(lancamento.cartao_dia.cargaHorariaCompleta)[2];
      const dataInicioHorarioDescansoPrevisto = this.pegarHorarioCargaHoraria({
        data: lancamento.cartao_dia.data,
        hora: inicioHorarioDescansoPrevisto.hora,
        minuto: inicioHorarioDescansoPrevisto.minuto,
        utc: false,
      });

      const saiuAntesDescansoProgramado = dataInicioHorarioDescansoPrevisto.isSameOrAfter(horarioSaidaPeriodoAtual);
      eventos.push({ ...eventoIntervalo, ...{ periodoId: saiuAntesDescansoProgramado ? 1 : 2 } });

      const execenteDescanso = descanso - eventoIntervalo.minutos;

      if (execenteDescanso < 0) {
        const carga = this.pegarCargaHorarioCompleta(lancamento.cartao_dia.cargaHorariaCompleta);
        const inicioDescanso = this.pegarHorarioCargaHoraria({
          data: lancamento.cartao_dia.data,
          hora: carga[1].hora,
          minuto: carga[1].minuto,
        });

        eventos.push({
          cartaoDiaId: lancamento.cartao_dia.id,
          hora: `${moment(horarioSaidaPeriodoAtual).format("HH:mm")} - ${moment(horarioEntradaProximoPeriodo).format("HH:mm")}`,
          tipoId: 11,
          funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
          minutos: execenteDescanso,
          periodoId: inicioDescanso.isAfter(lancamento.saida) ? 1 : 2,
        });
      }
      console.log(`Evento Intervalo: ${eventoIntervalo.hora} - Minutos: ${eventoIntervalo.minutos}`);
    }
  }

  public pegarLancamento(input: { data: Date }) {
    return moment.utc(input.data);
  }

  public pegarCargaHorarioCompleta(input: string) {
    const horaMinutos = input.replaceAll(".", ":").split(";");
    return horaMinutos.map((a) => {
      const [hora, minuto] = a.split(":");
      return { hora: Number(hora), minuto: Number(minuto) };
    });
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

  public acharRegraMinutosResiduais(input: { primeiroPeriodo: number; segundoPeriodo: number }) {
    let regra: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 = 0;

    if (
      (input.primeiroPeriodo >= -5 && input.primeiroPeriodo <= 5 && input.segundoPeriodo <= -6) ||
      (input.segundoPeriodo >= -5 && input.segundoPeriodo <= 5 && input.primeiroPeriodo >= 6)
    )
      regra = 1;

    if (input.primeiroPeriodo >= -5 && input.primeiroPeriodo <= 5 && input.segundoPeriodo >= -5 && input.segundoPeriodo <= 5)
      regra = 2;

    if (
      (input.primeiroPeriodo <= 0 && input.segundoPeriodo <= 0 && input.primeiroPeriodo + input.segundoPeriodo <= -11) ||
      (input.primeiroPeriodo >= 0 && input.segundoPeriodo >= 0 && input.primeiroPeriodo + input.segundoPeriodo >= 11)
    )
      regra = 3;

    return regra;
  }

  //VALIDAR MINUTOS RESIDUAIS
  private async aplicarMinutosResiduais(input: { eventos: any[] }) {
    const eventosAgrupadosPorDia: {
      cartaoDiaId: number;
      funcionarioId: number;
      eventos: { hora: string; tipoId: number; minutos: number; periodoId: number }[];
    }[] = [];

    input.eventos.map((evento) => {
      const existIndex = eventosAgrupadosPorDia.findIndex((eventoAgrupado) => eventoAgrupado.cartaoDiaId === evento.cartaoDiaId);

      if (existIndex === -1) {
        eventosAgrupadosPorDia.push({
          cartaoDiaId: evento.cartaoDiaId,
          funcionarioId: evento.funcionarioId,
          eventos: [{ hora: evento.hora, minutos: evento.minutos, tipoId: evento.tipoId, periodoId: evento.periodoId }],
        });
      } else {
        eventosAgrupadosPorDia[existIndex].eventos.push({
          hora: evento.hora,
          minutos: evento.minutos,
          tipoId: evento.tipoId,
          periodoId: evento.periodoId,
        });
      }
    });

    for (const eventoAgrupado of eventosAgrupadosPorDia) {
      const dia = await this.prisma.cartao_dia.findFirst({ where: { id: eventoAgrupado.cartaoDiaId } });
      if (dia?.cargaHor) {
        let minutosTrabalhados = 0;
        let minutosTrabalhadosPrimeiroPeriodo = 0;
        let minutosTrabalhadosSegundoPeriodo = 0;

        eventoAgrupado.eventos.map((evento) => {
          if (evento.tipoId === 1) {
            minutosTrabalhados += evento.minutos;
            if (evento.periodoId === 1) minutosTrabalhadosPrimeiroPeriodo += evento.minutos;
            if (evento.periodoId === 2) minutosTrabalhadosSegundoPeriodo += evento.minutos;
          }
        });

        const diferencaMinutosTrabalhosPrimeiroPeriodo = minutosTrabalhadosPrimeiroPeriodo - dia.cargaHorPrimeiroPeriodo;
        const diferencaMinutosTrabalhosSegundoPeriodo = minutosTrabalhadosSegundoPeriodo - dia.cargaHorSegundoPeriodo;

        const somaMinutosResiduais = diferencaMinutosTrabalhosPrimeiroPeriodo + diferencaMinutosTrabalhosSegundoPeriodo;
        const regra = this.acharRegraMinutosResiduais({
          primeiroPeriodo: diferencaMinutosTrabalhosPrimeiroPeriodo,
          segundoPeriodo: diferencaMinutosTrabalhosSegundoPeriodo,
        });

        switch (regra) {
          case 1:
            {
              let valorMaior = 0;
              if (Math.abs(diferencaMinutosTrabalhosPrimeiroPeriodo) > Math.abs(diferencaMinutosTrabalhosSegundoPeriodo))
                valorMaior = diferencaMinutosTrabalhosPrimeiroPeriodo; //maior
              else valorMaior = diferencaMinutosTrabalhosSegundoPeriodo; //maior

              if (valorMaior < 0) {
                input.eventos.map((evento, index) => {
                  if (evento.cartaoDiaId === eventoAgrupado.cartaoDiaId && evento.tipoId === 11) input.eventos[index].tipoId = 2;
                });
              }
            }
            break;
          case 2:
            break;
          case 3:
            break;

          default:
            break;
        }
      }
    }

    return input.eventos;
  }

  private async aplicarTolerancia10Minutos(input: { eventos: any[] }) {
    const eventosAgrupadosPorDia: {
      cartaoDiaId: number;
      funcionarioId: number;
      eventos: { hora: string; tipoId: number; minutos: number; periodoId: number }[];
    }[] = [];

    input.eventos.map((evento) => {
      const existIndex = eventosAgrupadosPorDia.findIndex((eventoAgrupado) => eventoAgrupado.cartaoDiaId === evento.cartaoDiaId);

      if (existIndex === -1) {
        eventosAgrupadosPorDia.push({
          cartaoDiaId: evento.cartaoDiaId,
          funcionarioId: evento.funcionarioId,
          eventos: [{ hora: evento.hora, minutos: evento.minutos, tipoId: evento.tipoId, periodoId: evento.periodoId }],
        });
      } else {
        eventosAgrupadosPorDia[existIndex].eventos.push({
          hora: evento.hora,
          minutos: evento.minutos,
          tipoId: evento.tipoId,
          periodoId: evento.periodoId,
        });
      }
    });

    for (const eventoAgrupado of eventosAgrupadosPorDia) {
      const dia = await this.prisma.cartao_dia.findFirst({ where: { id: eventoAgrupado.cartaoDiaId } });
      if (dia?.cargaHor) {
        let minutosTrabalhados = 0;
        let minutosTrabalhadosPrimeiroPeriodo = 0;
        let minutosTrabalhadosSegundoPeriodo = 0;

        eventoAgrupado.eventos.map((evento) => {
          if (evento.tipoId === 1 || evento.tipoId === 4 || evento.tipoId === 12) {
            minutosTrabalhados += evento.minutos;
            if (evento.periodoId === 1) minutosTrabalhadosPrimeiroPeriodo += evento.minutos;
            if (evento.periodoId === 2) minutosTrabalhadosSegundoPeriodo += evento.minutos;
          }
        });

        let diferencaComCargaHoraria = dia?.cargaHor - minutosTrabalhados;

        if (diferencaComCargaHoraria >= -10 && diferencaComCargaHoraria <= 10) {
          const removerNegativoIndex: number[] = [];
          input.eventos.map((evento, index) => {
            if (evento.cartaoDiaId === eventoAgrupado.cartaoDiaId && (evento.minutos < 0 || evento.tipoId === 4)) {
              if (evento.tipoId === 4) {
                diferencaComCargaHoraria += evento.minutos;
              }
              removerNegativoIndex.push(index);
            }
          });
          input.eventos = input.eventos.filter((_, index) => !removerNegativoIndex.find((negativo) => negativo === index));

          if (diferencaComCargaHoraria !== 0) {
            input.eventos.push({
              funcionarioId: eventoAgrupado.funcionarioId,
              cartaoDiaId: eventoAgrupado.cartaoDiaId,
              minutos: diferencaComCargaHoraria,
              tipoId: 12,
              hora: "ABONO",
            });
          }
        }
      }
    }

    return input.eventos;
  }

  private async aplicarEventosHorarioNaoTrabalhado(input: { eventos: any[] }) {
    const eventosAgrupadosPorDia: {
      cartaoDiaId: number;
      funcionarioId: number;
      eventos: { hora: string; tipoId: number; minutos: number; periodoId: number }[];
    }[] = [];

    input.eventos.map((evento) => {
      const existIndex = eventosAgrupadosPorDia.findIndex((eventoAgrupado) => eventoAgrupado.cartaoDiaId === evento.cartaoDiaId);

      if (existIndex === -1) {
        eventosAgrupadosPorDia.push({
          cartaoDiaId: evento.cartaoDiaId,
          funcionarioId: evento.funcionarioId,
          eventos: [{ hora: evento.hora, minutos: evento.minutos, tipoId: evento.tipoId, periodoId: evento.periodoId }],
        });
      } else {
        eventosAgrupadosPorDia[existIndex].eventos.push({
          hora: evento.hora,
          minutos: evento.minutos,
          tipoId: evento.tipoId,
          periodoId: evento.periodoId,
        });
      }
    });

    for (const eventoAgrupado of eventosAgrupadosPorDia) {
      const dia = await this.prisma.cartao_dia.findFirst({ where: { id: eventoAgrupado.cartaoDiaId } });
      if (dia?.cargaHor) {
        let minutosTrabalhados = 0;
        let minutosTrabalhadosPrimeiroPeriodo = 0;
        let minutosTrabalhadosSegundoPeriodo = 0;

        eventoAgrupado.eventos.map((evento) => {
          if (evento.tipoId === 1) {
            minutosTrabalhados += evento.minutos;
            if (evento.periodoId === 1) minutosTrabalhadosPrimeiroPeriodo += evento.minutos;
            if (evento.periodoId === 2) minutosTrabalhadosSegundoPeriodo += evento.minutos;
          }
        });

        const diferencaComCargaHoraria = dia?.cargaHor - minutosTrabalhados;

        //Verificar se contêm evento negativo
        if (diferencaComCargaHoraria > 10) {
          let totalNegativo = 0;
          eventoAgrupado.eventos.map((evento) => {
            if (evento.tipoId === 2) totalNegativo += evento.minutos;
          });

          if (Math.abs(diferencaComCargaHoraria) > Math.abs(totalNegativo)) {
            const diferencaHorarioNaoTrabalhoComEventoGerado = totalNegativo + diferencaComCargaHoraria;
            if (diferencaHorarioNaoTrabalhoComEventoGerado) {
              input.eventos.push({
                funcionarioId: eventoAgrupado.funcionarioId,
                cartaoDiaId: eventoAgrupado.cartaoDiaId,
                minutos: -diferencaHorarioNaoTrabalhoComEventoGerado,
                tipoId: 2,
                hora: "NÃO TRABALHADO",
              });
            }
          }
        }
      }
    }

    return input.eventos;
  }

  private async removerEventosNegativoIncorreto(input: { eventos: any[] }) {
    const eventosAgrupadosPorDia: {
      cartaoDiaId: number;
      funcionarioId: number;
      eventos: { hora: string; tipoId: number; minutos: number; periodoId: number }[];
    }[] = [];

    input.eventos.map((evento) => {
      const existIndex = eventosAgrupadosPorDia.findIndex((eventoAgrupado) => eventoAgrupado.cartaoDiaId === evento.cartaoDiaId);

      if (existIndex === -1) {
        eventosAgrupadosPorDia.push({
          cartaoDiaId: evento.cartaoDiaId,
          funcionarioId: evento.funcionarioId,
          eventos: [{ hora: evento.hora, minutos: evento.minutos, tipoId: evento.tipoId, periodoId: evento.periodoId }],
        });
      } else {
        eventosAgrupadosPorDia[existIndex].eventos.push({
          hora: evento.hora,
          minutos: evento.minutos,
          tipoId: evento.tipoId,
          periodoId: evento.periodoId,
        });
      }
    });

    for (const eventoAgrupado of eventosAgrupadosPorDia) {
      const dia = await this.prisma.cartao_dia.findFirst({ where: { id: eventoAgrupado.cartaoDiaId } });
      if (dia?.cargaHor) {
        let minutosTrabalhados = 0;
        let minutosTrabalhadosPrimeiroPeriodo = 0;
        let minutosTrabalhadosSegundoPeriodo = 0;

        eventoAgrupado.eventos.map((evento) => {
          if (evento.tipoId === 1) {
            minutosTrabalhados += evento.minutos;
            if (evento.periodoId === 1) minutosTrabalhadosPrimeiroPeriodo += evento.minutos;
            if (evento.periodoId === 2) minutosTrabalhadosSegundoPeriodo += evento.minutos;
          }
        });

        const diferencaComCargaHoraria = dia?.cargaHor - minutosTrabalhados;

        if (diferencaComCargaHoraria < -10) {
          const eventosNegativosIndex: number[] = [];
          input.eventos.map((evento, index) => {
            if (evento.tipoId == 2 && evento.cartaoDiaId === eventoAgrupado.cartaoDiaId) eventosNegativosIndex.push(index);
          });

          input.eventos = input.eventos.filter(
            (evento, index) => !eventosNegativosIndex.find((indexNegativo) => index === indexNegativo),
          );
        }
      }
    }

    return input.eventos;
  }

  private async criarAdicionalNoturno(input: { eventos: any[] }) {
    const eventosAgrupadosPorDia: {
      cartaoDiaId: number;
      funcionarioId: number;
      eventos: { hora: string; tipoId: number; minutos: number; periodoId: number }[];
    }[] = [];

    input.eventos.map((evento) => {
      const existIndex = eventosAgrupadosPorDia.findIndex((eventoAgrupado) => eventoAgrupado.cartaoDiaId === evento.cartaoDiaId);

      if (existIndex === -1) {
        eventosAgrupadosPorDia.push({
          cartaoDiaId: evento.cartaoDiaId,
          funcionarioId: evento.funcionarioId,
          eventos: [{ hora: evento.hora, minutos: evento.minutos, tipoId: evento.tipoId, periodoId: evento.periodoId }],
        });
      } else {
        eventosAgrupadosPorDia[existIndex].eventos.push({
          hora: evento.hora,
          minutos: evento.minutos,
          tipoId: evento.tipoId,
          periodoId: evento.periodoId,
        });
      }
    });

    for (const eventoAgrupado of eventosAgrupadosPorDia) {
      const dia = await this.prisma.cartao_dia.findFirst({
        where: { id: eventoAgrupado.cartaoDiaId },
        include: { cartao_dia_lancamentos: true },
      });
      if (dia?.cargaHor) {
        let minutosTrabalhados = 0;
        let minutosTrabalhadosPrimeiroPeriodo = 0;
        let minutosTrabalhadosSegundoPeriodo = 0;

        eventoAgrupado.eventos.map((evento) => {
          if (evento.tipoId === 1) {
            minutosTrabalhados += evento.minutos;
            if (evento.periodoId === 1) minutosTrabalhadosPrimeiroPeriodo += evento.minutos;
            if (evento.periodoId === 2) minutosTrabalhadosSegundoPeriodo += evento.minutos;
          }
        });

        dia.cartao_dia_lancamentos.map((lancamento) => {
          if (!lancamento.entrada || !lancamento.saida) return undefined;

          const horariosForaJornada = this.localizarHorarioForaDaJornadaPrevista({
            entrada: lancamento.entrada,
            saida: lancamento.saida,
            dia: {
              cargaHor: dia.cargaHor,
              cargaHorariaCompleta: dia.cargaHorariaCompleta,
              cargaHorSegundoPeriodo: dia.cargaHorSegundoPeriodo,
              data: dia.data,
            },
          });

          if (!horariosForaJornada.length) return undefined;

          horariosForaJornada.map((horario) => {
            const noturno = this.recalcularTurnoController.localizarMinutosNoturno({
              inicio: horario.inicio,
              fim: horario.fim,
              data: dia.data,
            });

            if (!noturno.minutos) return undefined;

            const hora = `${moment.utc(lancamento.entrada).format("HH:mm")} - ${moment.utc(lancamento.saida).format("HH:mm")}`;

            const existeIndex = input.eventos.findIndex(
              (evento) => evento.cartaoDiaId === dia.id && evento.tipoId === 1 && evento.hora === hora,
            );

            if (existeIndex !== -1) {
              input.eventos[existeIndex].minutos -= noturno.minutos;
              minutosTrabalhados -= noturno.minutos;
            } else {
              const existeIndex = input.eventos.findIndex(
                (evento) => evento.cartaoDiaId === dia.id && evento.tipoId === 1 && evento.minutos === noturno.minutos,
              );

              if (existeIndex !== -1) {
                minutosTrabalhados -= input.eventos[existeIndex].minutos;
                input.eventos[existeIndex].minutos = 0;
              }
            }

            const diferencaComCargaHoraria = minutosTrabalhados - dia?.cargaHor;
            let minutos = 0;

            //Se a diferença da carga horaria for negativa
            if (diferencaComCargaHoraria < 0) {
              minutos = noturno.minutos + diferencaComCargaHoraria;
              //Se a soma do resto da carga horaria com adicionar for positivo adiciona 1.14
              if (minutos > 0) {
                minutos = arredondarParteDecimal(minutos * 1.14);
                //Abona os minutos não trabalhados na jornada
                input.eventos.push({
                  funcionarioId: eventoAgrupado.funcionarioId,
                  cartaoDiaId: eventoAgrupado.cartaoDiaId,
                  minutos: Math.abs(diferencaComCargaHoraria),
                  tipoId: 12,
                  hora: `ABONO`,
                  periodoId: lancamento.periodoId,
                });

                //Gera evento adicional noturno
                input.eventos.push({
                  funcionarioId: eventoAgrupado.funcionarioId,
                  cartaoDiaId: eventoAgrupado.cartaoDiaId,
                  minutos: minutos,
                  tipoId: 4,
                  hora: `${moment.utc(noturno.inicio).format("HH:mm")} - ${moment.utc(noturno.final).format("HH:mm")}`,
                  periodoId: lancamento.periodoId,
                });
              } else {
                //Cria evento de horas trabalhadas pois o noturno não supriu o total faltante da carga horaria
                input.eventos.push({
                  funcionarioId: eventoAgrupado.funcionarioId,
                  cartaoDiaId: eventoAgrupado.cartaoDiaId,
                  minutos: noturno.minutos,
                  tipoId: 1,
                  hora: `${moment.utc(noturno.inicio).format("HH:mm")} - ${moment.utc(noturno.final).format("HH:mm")}`,
                  periodoId: lancamento.periodoId,
                });
              }
            } else {
              minutos = arredondarParteDecimal(noturno.minutos * 1.14);
              //Gera evento adicional noturno
              input.eventos.push({
                funcionarioId: eventoAgrupado.funcionarioId,
                cartaoDiaId: eventoAgrupado.cartaoDiaId,
                minutos: minutos,
                tipoId: 4,
                hora: `${moment.utc(noturno.inicio).format("HH:mm")} - ${moment.utc(noturno.final).format("HH:mm")}`,
                periodoId: lancamento.periodoId,
              });
            }
          });
        });
      }
    }

    return input.eventos;
  }

  public localizarHorarioForaDaJornadaPrevista(input: {
    entrada: Date;
    saida: Date;
    dia: { cargaHor: number; cargaHorariaCompleta: string; data: Date; cargaHorSegundoPeriodo: number };
  }) {
    const output: { inicio: Date; fim: Date }[] = [];

    if ((input.dia.cargaHor = 0)) {
      return output;
    }

    const horarios = this.pegarCargaHorarioCompleta(input.dia.cargaHorariaCompleta);

    const entradaPrimeiroPeriodo = this.pegarHorarioCargaHoraria({
      data: input.dia.data,
      hora: horarios[0].hora,
      minuto: horarios[0].minuto,
      utc: false,
    });

    const saidaUltimoPeriodo = this.pegarHorarioCargaHoraria({
      data: input.dia.data,
      hora: input.dia.cargaHorSegundoPeriodo ? horarios[3].hora : horarios[1].hora,
      minuto: input.dia.cargaHorSegundoPeriodo ? horarios[3].minuto : horarios[1].minuto,
      utc: false,
    });

    entradaPrimeiroPeriodo.add(1, "second");
    saidaUltimoPeriodo.subtract(1, "second");

    if (saidaUltimoPeriodo.isBefore(entradaPrimeiroPeriodo)) saidaUltimoPeriodo.add(1, "d");

    //Se o entrada está antes do inicio da jornada e o saida está depois do fim da jornada
    {
      const inicioAntesJornada = moment.utc(input.entrada).isBefore(entradaPrimeiroPeriodo);
      const fimEstaDepoisJornada = moment.utc(input.saida).isAfter(saidaUltimoPeriodo);

      if (inicioAntesJornada && fimEstaDepoisJornada) {
        output.push({
          inicio: input.entrada,
          fim: entradaPrimeiroPeriodo.subtract(1, "seconds").toDate(),
        });

        output.push({
          inicio: saidaUltimoPeriodo.add(1, "seconds").toDate(),
          fim: input.saida,
        });

        return output;
      }
    }

    //Se lancamento não está entre o horario da jornada
    {
      const entradaNaoEstaEntrePrevista = moment.utc(input.entrada).isBetween(entradaPrimeiroPeriodo, saidaUltimoPeriodo);
      const saidaNaoEstaEntrePrevista = moment.utc(input.saida).isBetween(entradaPrimeiroPeriodo, saidaUltimoPeriodo);

      if (!entradaNaoEstaEntrePrevista && !saidaNaoEstaEntrePrevista) {
        output.push({
          inicio: input.entrada,
          fim: input.saida,
        });
        return output;
      }
    }

    //Se a entrada está antes do inicio da jornada e a saida está entre a jornada
    {
      const inicioAntesJornada = moment.utc(input.entrada).isBefore(entradaPrimeiroPeriodo);
      const fimEstaEntreJornada = moment.utc(input.saida).isBetween(entradaPrimeiroPeriodo, saidaUltimoPeriodo);

      if (inicioAntesJornada && fimEstaEntreJornada) {
        output.push({
          fim: entradaPrimeiroPeriodo.subtract(1, "seconds").toDate(),
          inicio: input.entrada,
        });
      }
    }

    //Se a entrada está entre a jornada e o saida está após o fim da jornada
    {
      const inicioEstaEntreJornada = moment(input.entrada).isBetween(entradaPrimeiroPeriodo, saidaUltimoPeriodo);
      const fimEstaAposJornada = moment(input.saida).isAfter(saidaUltimoPeriodo);

      if (inicioEstaEntreJornada && fimEstaAposJornada) {
        output.push({
          inicio: saidaUltimoPeriodo.add(1, "seconds").toDate(),
          fim: input.saida,
        });

        return output;
      }
    }

    return output;
  }
}
