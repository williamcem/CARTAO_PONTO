import { PrismaClient } from "@prisma/client";
import moment from "moment";

import { prisma } from "@infra/database/Prisma";

import { AdicionarEventos } from "../../../../data/usecase/add-eventos/add-eventos";
import { RecalcularTurnoController } from "../../../../presentation/controllers/recalcular-turno/recalcular-turno";
/* import { CompensacaoEventoRepository } from "../compensacao-eventos-automaticos-repository/compensacao-eventos-automaticos-repository";
 */ import { criarEventoIntervaloEntrePeriodos } from "./intervaloEntrePeriodos";
export class CriarEventosPostgresRepository implements AdicionarEventos {
  private prisma: PrismaClient;

  constructor(
    private readonly recalcularTurnoController: RecalcularTurnoController,
    /*     private compensacaoEventoRepository: CompensacaoEventoRepository,
     */
  ) {
    this.prisma = prisma;
  }
  public porcentagemAdicionalNoturno = 0.14;

  public async add(input: { identificacao?: string }): Promise<boolean> {
    // Verifique se o valor de identificação é um número
    const cartaoDiaId = Number(input?.identificacao);
    if (isNaN(cartaoDiaId)) {
      console.error("Identificação inválida, não é um número:", input?.identificacao);
      return false;
    }

    // Busque os lançamentos pelo ID do cartão
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
        cartao_dia: {
          id: cartaoDiaId,
        },
      },
      orderBy: [{ cartao_dia: { cartao: { funcionarioId: "asc" } } }, { cartao_dia_id: "asc" }, { periodoId: "asc" }],
    });

    if (lancamentos.length === 0) {
      console.log("Nenhum lançamento encontrado para o cartão/dia.");
      return false;
    }

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

      // Converta as datas para strings no formato ISO
      const inicioDoDia = new Date(evento.entrada).setHours(0, 0, 0, 0);
      const fimDoDia = new Date(evento.saida).setHours(23, 59, 59, 999);

      // Filtrar por eventos no mesmo dia (início e fim do dia)
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

    // Compensar eventos após a criação dos novos eventos, comentadao no, pois a forma como será deverá ser discutida ainda
    /*     for (const evento of newEventosData) {
      await this.compensacaoEventoRepository.compensarEventos(evento.cartaoDiaId);
    } */

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

      if (!lancamento.entrada || !lancamento.saida) {
        console.log("Lançamento sem entrada ou saída:", lancamento);
        return;
      }

      const entrada = this.pegarLancamento({ data: lancamento.entrada });
      const saida = this.pegarLancamento({ data: lancamento.saida });

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

      const resultado = this.extrairEventosPeriodo(
        lancamento,
        entrada,
        saida,
        horarioEntradaEsperado1,
        horarioSaidaEsperado,
        eventos,
        eventosExcendentes,
        index === lancamentosArray.length - 1,
        lancamentosArray,
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
          } else {
            novoEventos.push(evento);
          }

          return undefined;
        });

        novoEventos.push(value);
        eventos = novoEventos;
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
    lancamentos: any,
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
        horarioSaidaEsperado,
        lancamentos,
      );

      if (resultado1) excedeu = true;
    } else if (periodoId === 2) {
      const horarioEntradaSegundoPeriodo = entrada; // Aqui defina o horário de entrada do segundo período

      const resultado2 = this.criarEventoPeriodo2(
        lancamento,
        entrada,
        saida,
        horarioSaidaEsperado,
        eventos,
        eventosExcendentes,
        lancamentos,
        horarioEntradaSegundoPeriodo,
      );
      if (resultado2) excedeu = true;
    } else if (periodoId === 3) this.criarEventoPeriodo3(lancamento, entrada, saida, eventos);

    return excedeu;
  }

  private criarEventoPeriodo1(
    lancamento: any,
    entrada: moment.Moment,
    saida: moment.Moment,
    horarioEntradaEsperado1: moment.Moment,
    eventos: any[],
    eventosExcendentes: any[],
    horarioSaidaEsperado: moment.Moment,
    lancamentos: any,
  ) {
    let excedeu = false;

    // Verificar se todos os horários são zero
    const cargaHorariaCompletaArray = this.pegarCargaHorarioCompleta(lancamento.cartao_dia.cargaHorariaCompleta);
    const horariosRelevantes = cargaHorariaCompletaArray.filter((horario) => horario.hora !== 0 || horario.minuto !== 0);

    const isFolga = horariosRelevantes.length === 0;

    // Verifica se o horário de saída esperado é antes da entrada (possível troca de dia)
    if (horarioSaidaEsperado.isBefore(horarioEntradaEsperado1)) {
      horarioSaidaEsperado.add(1, "day");
    }

    if (entrada.isBefore(horarioEntradaEsperado1)) {
      const eventoPeriodoReal = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: this.ordenarHorario({ inicio: horarioEntradaEsperado1, fim: saida }),
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(horarioEntradaEsperado1, "minutes"),
      };
      eventos.push({ ...eventoPeriodoReal, ...{ periodoId: 1 } });
    } else {
      const eventoPeriodo1 = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: this.ordenarHorario({ inicio: entrada, fim: saida }),
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(entrada, "minutes"),
      };

      eventos.push({ ...eventoPeriodo1, ...{ periodoId: 1 } });
    }

    // Extrai a quantidade de lamçamentos feito no dia
    const qtdeLancamento = lancamentos?.filter((lanc: any) => lanc.cartao_dia.id === lancamento.cartao_dia.id).length;

    // Verifica se a pessoa saiu mais cedo do que o horário esperado e se tem apenas um período no dia
    if (qtdeLancamento === 1) {
      const eventoSaidaAntecipada = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: this.ordenarHorario({ inicio: saida, fim: horarioSaidaEsperado }),
        tipoId: 2,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(horarioSaidaEsperado, "minutes"),
      };

      const contemMinutosNoturnoAusente = Boolean(
        this.recalcularTurnoController.localizarMinutosNoturno({
          data: lancamento.cartao_dia.data,
          inicio: saida.toDate(),
          fim: horarioSaidaEsperado.toDate(),
        }).minutos,
      );

      if (contemMinutosNoturnoAusente) {
        eventos.push({
          cartaoDiaId: lancamento.cartao_dia.id,
          hora: this.ordenarHorario({ inicio: saida, fim: horarioSaidaEsperado }),
          tipoId: 13,
          funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
          minutos: 0,
        });
      }

      // Se os minutos forem negativos (sinal de saída antecipada), adicione o evento
      if (eventoSaidaAntecipada.minutos < 0) {
        eventosExcendentes.push({ ...eventoSaidaAntecipada, periodoId: 1 });
      }
    }

    const eventoExcedentePositivo = {
      cartaoDiaId: lancamento.cartao_dia.id,
      hora: this.ordenarHorario({ inicio: entrada, fim: horarioEntradaEsperado1 }),
      tipoId: 1,
      funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
      minutos: horarioEntradaEsperado1.diff(entrada, "minutes"),
    };

    if (eventoExcedentePositivo.minutos < 0 && !isFolga) {
      eventoExcedentePositivo.tipoId = 2;
    }

    if (eventoExcedentePositivo.minutos < 0) {
      eventoExcedentePositivo.hora = this.ordenarHorario({ inicio: horarioEntradaEsperado1, fim: entrada });
    }

    if (Math.abs(eventoExcedentePositivo.minutos) > 5) {
      excedeu = true;
    }

    if (Math.abs(eventoExcedentePositivo.minutos) > 0 && !(isFolga && eventoExcedentePositivo.minutos < 0)) {
      eventosExcendentes.push({ ...eventoExcedentePositivo, ...{ periodoId: 1 } });
    }

    if (excedeu) {
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
    lancamentos: any,
    horarioEntradaSegundoPeriodo: moment.Moment,
  ) {
    let excedeu = false;

    // Verificar se todos os horários são zero
    const cargaHorariaCompletaArray = this.pegarCargaHorarioCompleta(lancamento.cartao_dia.cargaHorariaCompleta);
    const horariosRelevantes = cargaHorariaCompletaArray.filter((horario) => horario.hora !== 0 || horario.minuto !== 0);

    // Verifica se o dia tem apenas um período
    const temApenasUmPeriodo = horariosRelevantes.length <= 2; // Dois valores para entrada e saída do período único

    const isFolga = horariosRelevantes.length === 0;

    if (saida.isBefore(horarioSaidaEsperado)) {
      const eventoPeriodoReal = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: this.ordenarHorario({ inicio: entrada, fim: saida }),
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(entrada, "minutes"),
      };
      eventos.push({ ...eventoPeriodoReal, ...{ periodoId: 2 } });

      const eventoExcedentePositivo = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: this.ordenarHorario({ inicio: horarioSaidaEsperado, fim: saida }),
        tipoId: 2,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(horarioSaidaEsperado, "minutes"),
      };

      const contemMinutosNoturnoAusente = Boolean(
        this.recalcularTurnoController.localizarMinutosNoturno({
          data: lancamento.cartao_dia.data,
          inicio: horarioSaidaEsperado.toDate(),
          fim: saida.toDate(),
        }).minutos,
      );

      if (contemMinutosNoturnoAusente) {
        eventos.push({
          cartaoDiaId: lancamento.cartao_dia.id,
          hora: this.ordenarHorario({ inicio: horarioSaidaEsperado, fim: saida }),
          tipoId: 13,
          funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
          minutos: 0,
        });
      }

      if (Math.abs(eventoExcedentePositivo.minutos) > 5) {
        excedeu = true;
      }

      if (Math.abs(eventoExcedentePositivo.minutos) > 0 && !(isFolga && eventoExcedentePositivo.minutos < 0)) {
        eventosExcendentes.push({ ...eventoExcedentePositivo, ...{ periodoId: 2 } });
      }

      if (eventoExcedentePositivo.minutos < 0) {
        eventoExcedentePositivo.hora = this.ordenarHorario({ inicio: saida, fim: horarioSaidaEsperado });
      }

      if (excedeu) {
      } else if (eventoExcedentePositivo.minutos < 0 && !isFolga) {
      }
    } else {
      if (!temApenasUmPeriodo) {
        const eventoPeriodoEsperado = {
          cartaoDiaId: lancamento.cartao_dia.id,
          hora: this.ordenarHorario({ inicio: entrada, fim: horarioSaidaEsperado }),
          tipoId: 1,
          funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
          minutos: horarioSaidaEsperado.diff(entrada, "minutes"),
        };
        eventos.push({ ...eventoPeriodoEsperado, ...{ periodoId: 2 } });
      }
      // Aqui cria o evento excedente
      if (!temApenasUmPeriodo) {
        const eventoExcedentePositivo = {
          cartaoDiaId: lancamento.cartao_dia.id,
          hora: this.ordenarHorario({ inicio: entrada, fim: horarioSaidaEsperado }),
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
      }
      // Extrai a quantidade de lamçamentos feito no dia
      const qtdeLancamento = lancamentos?.filter((lanc: any) => lanc.cartao_dia.id === lancamento.cartao_dia.id).length;

      if (temApenasUmPeriodo && qtdeLancamento === 2) {
        const eventoPeriodoEsperado = {
          cartaoDiaId: lancamento.cartao_dia.id,
          hora: this.ordenarHorario({ inicio: horarioEntradaSegundoPeriodo, fim: saida }),
          tipoId: 1,
          funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
          minutos: saida.diff(horarioEntradaSegundoPeriodo, "minutes"),
        };
        eventos.push({ ...eventoPeriodoEsperado, ...{ periodoId: 2 } });
      }
    }

    return excedeu;
  }

  private criarEventoPeriodo3(lancamento: any, entrada: moment.Moment, saida: moment.Moment, eventos: any[]) {
    const minutos = saida.diff(entrada, "minutes");

    const eventoTrabalhado = {
      cartaoDiaId: lancamento.cartao_dia.id,
      hora: this.ordenarHorario({ inicio: entrada, fim: saida }),
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
          hora: this.ordenarHorario({ inicio: horarioSaidaPeriodoAtual, fim: horarioEntradaProximoPeriodo }),
          tipoId: 2,
          funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
          minutos: execenteDescanso,
          periodoId: inicioDescanso.isAfter(lancamento.saida) ? 1 : 2,
        });

        const contemMinutosNoturnoAusente = Boolean(
          this.recalcularTurnoController.localizarMinutosNoturno({
            data: lancamento.cartao_dia.data,
            inicio: horarioSaidaPeriodoAtual.toDate(),
            fim: horarioEntradaProximoPeriodo.toDate(),
          }).minutos,
        );

        if (contemMinutosNoturnoAusente) {
          eventos.push({
            cartaoDiaId: lancamento.cartao_dia.id,
            hora: this.ordenarHorario({ inicio: horarioSaidaPeriodoAtual, fim: horarioEntradaProximoPeriodo }),
            tipoId: 13,
            funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
            minutos: 0,
          });
        }
      }
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
    // Primeiro, buscar os lançamentos associados
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
        cartao_dia_id: input.eventos[0].cartaoDiaId, // Garantir que estamos buscando pelo cartaoDiaId correto
      },
      orderBy: [{ cartao_dia: { cartao: { funcionarioId: "asc" } } }, { cartao_dia_id: "asc" }, { periodoId: "asc" }],
    });

    if (lancamentos.length === 0) {
      console.error("Nenhum lançamento encontrado.");
      return input.eventos;
    }

    const eventosAgrupadosPorDia: {
      cartaoDiaId: number;
      funcionarioId: number;
      lancamento: any;
      eventos: {
        hora: string;
        tipoId: number;
        minutos: number;
        periodoId: number;
        entrada?: Date;
        saida?: Date;
      }[];
    }[] = [];

    // Agrupar eventos por dia e períodos
    input.eventos.forEach((evento) => {
      const index = eventosAgrupadosPorDia.findIndex((eventoAgrupado) => eventoAgrupado.cartaoDiaId === evento.cartaoDiaId);

      if (index === -1) {
        eventosAgrupadosPorDia.push({
          cartaoDiaId: evento.cartaoDiaId,
          funcionarioId: evento.funcionarioId,
          lancamento: lancamentos.find((l) => l.cartao_dia.id === evento.cartaoDiaId),
          eventos: [
            {
              hora: evento.hora,
              minutos: evento.minutos,
              tipoId: evento.tipoId,
              periodoId: evento.periodoId,
              entrada: evento.entrada,
              saida: evento.saida,
            },
          ],
        });
      } else {
        eventosAgrupadosPorDia[index].eventos.push({
          hora: evento.hora,
          minutos: evento.minutos,
          tipoId: evento.tipoId,
          periodoId: evento.periodoId,
          entrada: evento.entrada,
          saida: evento.saida,
        });
      }
    });

    // Processar os eventos agrupados e aplicar a tolerância de 10 minutos
    for (const eventoAgrupado of eventosAgrupadosPorDia) {
      const dia = await this.prisma.cartao_dia.findFirst({ where: { id: eventoAgrupado.cartaoDiaId } });
      if (dia?.cargaHor) {
        let minutosTrabalhados = 0;

        // Somar os minutos trabalhados
        eventoAgrupado.eventos.forEach((evento) => {
          if (evento.tipoId === 1 || /*  evento.tipoId === 4 || */ evento.tipoId === 12 || evento.tipoId === 14) {
            minutosTrabalhados += evento.minutos;
          }
        });

        let diferencaComCargaHoraria = dia?.cargaHor - minutosTrabalhados;

        if (diferencaComCargaHoraria >= -10 && diferencaComCargaHoraria <= 10) {
          // Remover eventos negativos se a diferença com a carga horária for aceitável
          const removerNegativoIndex: number[] = [];
          input.eventos.forEach((evento, index) => {
            if (evento.cartaoDiaId === eventoAgrupado.cartaoDiaId && (evento.minutos < 0 || evento.tipoId === 4)) {
              removerNegativoIndex.push(index);
            }
          });

          input.eventos = input.eventos.filter((_, index) => !removerNegativoIndex.includes(index));

          // Extraindo o primeiro e o último horário da cargaHorariaCompleta
          const cargaHorariaCompletaArray = dia.cargaHorariaCompleta.split(";").map((item) => item.replace(".", ":"));

          // Verificar se a pessoa tem dois períodos beseado com comprimnto do array se tiver mas de um 00:00
          const temDoisPeriodos = cargaHorariaCompletaArray[2] !== "00:00";

          // Filtrar os horários diferentes de '00:00'
          const horariosValidos = cargaHorariaCompletaArray.filter((horario) => horario !== "00:00");

          // Se houver apenas um período, pegar o último horário válido
          const primeiroHorario = horariosValidos[0]; // Exemplo: '07:12'
          const ultimoHorarioValido = temDoisPeriodos
            ? cargaHorariaCompletaArray[3] // Horário do segundo período, quando tem dois periodos
            : cargaHorariaCompletaArray[1]; // Horário de saída do primeiro período, quando só tiver um

          // Criar evento de abono com horários corretamente formatados
          if (diferencaComCargaHoraria !== 0) {
            input.eventos.push({
              funcionarioId: eventoAgrupado.funcionarioId,
              cartaoDiaId: eventoAgrupado.cartaoDiaId,
              minutos: diferencaComCargaHoraria,
              tipoId: 12, // Evento de Abono
              hora: `${primeiroHorario} - ${ultimoHorarioValido}`, // Definindo o horário do evento de abono
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
            if (evento.tipoId === 2 && evento.cartaoDiaId === eventoAgrupado.cartaoDiaId) eventosNegativosIndex.push(index);
            return undefined;
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

            //Removia a duplicidade de minutos onde foi adicional noturno
            /*             if (existeIndex !== -1) {
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
            } */

            const diferencaComCargaHoraria = minutosTrabalhados - dia?.cargaHor;
            let minutos = 0;

            //Se a diferença da carga horaria for negativa
            if (diferencaComCargaHoraria < 0) {
              minutos = noturno.minutos + diferencaComCargaHoraria;
              const horarios = this.pegarCargaHorarioCompleta(dia.cargaHorariaCompleta);

              const dataInicioJornada = this.pegarHorarioCargaHoraria({
                data: dia.data,
                hora: horarios[0].hora,
                minuto: horarios[0].minuto,
                utc: false,
              });

              let noturnoEAntesDoFimDaJornada =
                dataInicioJornada.isSameOrAfter(moment.utc(noturno.inicio)) &&
                dataInicioJornada.isSameOrAfter(moment.utc(noturno.final));

              //Se a soma do resto da carga horaria com adicional for positivo adiciona 1.14
              if (minutos > 0) {
                minutos = Number((minutos * 1.14).toFixed());
                //Abona os minutos não trabalhados na jornada
                input.eventos.push({
                  funcionarioId: eventoAgrupado.funcionarioId,
                  cartaoDiaId: eventoAgrupado.cartaoDiaId,
                  minutos: Math.abs(diferencaComCargaHoraria),
                  tipoId: 12,
                  hora: this.ordenarHorario({ inicio: moment.utc(noturno.inicio), fim: moment.utc(noturno.final) }),
                  periodoId: lancamento.periodoId,
                });

                //Gera evento adicional noturno
                input.eventos.push({
                  funcionarioId: eventoAgrupado.funcionarioId,
                  cartaoDiaId: eventoAgrupado.cartaoDiaId,
                  minutos: minutos,
                  tipoId: noturnoEAntesDoFimDaJornada ? 14 : 4,
                  hora: this.ordenarHorario({ inicio: moment.utc(noturno.inicio), fim: moment.utc(noturno.final) }),
                  periodoId: lancamento.periodoId,
                });
              } else {
                //Cria evento de horas trabalhadas pois o noturno não supriu o total faltante da carga horaria
                input.eventos.push({
                  funcionarioId: eventoAgrupado.funcionarioId,
                  cartaoDiaId: eventoAgrupado.cartaoDiaId,
                  minutos: noturno.minutos,
                  tipoId: noturnoEAntesDoFimDaJornada ? 14 : 4,
                  hora: this.ordenarHorario({ inicio: moment.utc(noturno.inicio), fim: moment.utc(noturno.final) }),
                  periodoId: lancamento.periodoId,
                });
              }
            } else {
              minutos = Number((noturno.minutos * 1.14).toFixed());

              const horarios = this.pegarCargaHorarioCompleta(dia.cargaHorariaCompleta);

              const dataInicioJornada = this.pegarHorarioCargaHoraria({
                data: dia.data,
                hora: horarios[0].hora,
                minuto: horarios[0].minuto,
                utc: false,
              });

              let noturnoEAntesDoFimDaJornada =
                dataInicioJornada.isSameOrAfter(moment.utc(noturno.inicio)) &&
                dataInicioJornada.isSameOrAfter(moment.utc(noturno.final));

              //Gera evento adicional noturno após fim da jornada
              input.eventos.push({
                funcionarioId: eventoAgrupado.funcionarioId,
                cartaoDiaId: eventoAgrupado.cartaoDiaId,
                minutos: minutos,
                tipoId: noturnoEAntesDoFimDaJornada ? 14 : 4,
                hora: this.ordenarHorario({ inicio: moment.utc(noturno.inicio), fim: moment.utc(noturno.final) }),
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

  ordenarHorario(input: { inicio: moment.Moment; fim: moment.Moment }): string {
    if (input.inicio.isBefore(input.fim)) {
      return `${input.inicio.format("HH:mm")} - ${input.fim.format("HH:mm")}`;
    } else {
      return `${input.fim.format("HH:mm")} - ${input.inicio.format("HH:mm")}`;
    }
  }
}
