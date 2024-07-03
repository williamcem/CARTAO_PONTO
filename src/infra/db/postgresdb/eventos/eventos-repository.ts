import { PrismaClient } from "@prisma/client";
import moment from "moment";
import { AdicionarEventos } from "../../../../data/usecase/add-eventos/add-eventos";
import { prisma } from "@infra/database/Prisma";
import { criarEventoAdicionalNoturno } from "./adicionalNoturno";

export class CriarEventosPostgresRepository implements AdicionarEventos {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async add(): Promise<boolean> {
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
    });

    const eventosData = lancamentos.flatMap((lancamento) => {
      const entrada = lancamento.entrada ? moment.utc(lancamento.entrada) : null;
      const saida = lancamento.saida ? moment.utc(lancamento.saida) : null;

      if (!entrada || !saida) return [];

      const eventos = [
        {
          data: entrada.format("YYYY-MM-DD"),
          hora: `${entrada.format("HH:mm")} - ${saida.format("HH:mm")}`,
          tipoId: 1,
          identificacao: lancamento.cartao_dia.cartao.funcionario.identificacao,
          minutos: saida.diff(entrada, "minutes"),
        },
      ];

      const cargaHorariaCompletaArray = lancamento.cartao_dia.cargaHorariaCompleta.split(";");
      const horarioEntradaEsperado1 = moment(lancamento.cartao_dia.data).set({
        date: moment(lancamento.cartao_dia.data).utc(true).date(),
        months: moment(lancamento.cartao_dia.data).utc(true).month(),
        years: moment(lancamento.cartao_dia.data).utc(true).year(),
        hour: Number(cargaHorariaCompletaArray[0].split(".")[0]),
        minute: Number(cargaHorariaCompletaArray[0].split(".")[1]),
      });

      const periodos = lancamentos.filter((l) => l.cartao_dia.id === lancamento.cartao_dia.id).map((l) => l.periodoId);
      const temSomenteSegundoPeriodo = periodos.length === 1 && periodos[0] === 2;

      if (temSomenteSegundoPeriodo) {
        const horarioEntradaReal = entrada;
        const diferencaEntrada = horarioEntradaEsperado1.utc(true).diff(horarioEntradaReal, "minutes");

        console.log(`Entrada esperada 1: ${horarioEntradaEsperado1.format("YYYY-MM-DD HH:mm:ss")}`);
        console.log(`Entrada real: ${entrada.format("YYYY-MM-DD HH:mm:ss")}`);
        console.log(`Diferença de minutos: ${diferencaEntrada}`);

        if (diferencaEntrada !== 0) {
          eventos.push({
            data: entrada.format("YYYY-MM-DD"),
            hora: `${horarioEntradaEsperado1.utc(true).format("HH:mm")} - ${horarioEntradaReal.format("HH:mm")}`,
            tipoId: 2,
            identificacao: lancamento.cartao_dia.cartao.funcionario.identificacao,
            minutos: diferencaEntrada,
          });
        }

        const eventoAdicionalNoturnoPrimeiroPeriodo = criarEventoAdicionalNoturno(
          horarioEntradaEsperado1,
          horarioEntradaReal,
          0,
          lancamento,
        );
        if (eventoAdicionalNoturnoPrimeiroPeriodo) {
          eventoAdicionalNoturnoPrimeiroPeriodo.minutos = -eventoAdicionalNoturnoPrimeiroPeriodo.minutos;
          eventos.push(eventoAdicionalNoturnoPrimeiroPeriodo);
        }

        // Verificar saída antecipada
        const index = cargaHorariaCompletaArray.length - 2;
        let horarioSaidaEsperado = moment.utc(lancamento.cartao_dia.data).set({
          hour: Number(cargaHorariaCompletaArray[index].split(".")[0]),
          minute: Number(cargaHorariaCompletaArray[index].split(".")[1]),
          second: 0,
        });

        if (horarioSaidaEsperado.isBefore(horarioEntradaEsperado1.utc(true))) {
          horarioSaidaEsperado.add(1, "day");
        }

        const horarioSaidaReal = saida;
        const diferencaSaida = horarioSaidaReal.diff(horarioSaidaEsperado, "minutes");

        console.log(`Saída esperada: ${horarioSaidaEsperado.format("YYYY-MM-DD HH:mm:ss")}`);
        console.log(`Saída real: ${saida.format("YYYY-MM-DD HH:mm:ss")}`);
        console.log(`Diferença de minutos: ${diferencaSaida}`);

        if (diferencaSaida !== 0) {
          eventos.push({
            data: saida.format("YYYY-MM-DD"),
            hora: `${horarioSaidaEsperado.format("HH:mm")} - ${horarioSaidaReal.format("HH:mm")}`,
            tipoId: 2,
            identificacao: lancamento.cartao_dia.cartao.funcionario.identificacao,
            minutos: diferencaSaida,
          });
        }

        const minutosTotaisEsperados = horarioSaidaEsperado.diff(horarioEntradaEsperado1.utc(true), "minutes");

        const eventoAdicionalNoturno = criarEventoAdicionalNoturno(
          horarioSaidaEsperado,
          horarioSaidaReal,
          minutosTotaisEsperados,
          lancamento,
        );
        if (eventoAdicionalNoturno) {
          eventos.push(eventoAdicionalNoturno);
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
          eventos.push({
            data: entrada.format("YYYY-MM-DD"),
            hora: `${horarioEntradaEsperado1.format("HH:mm")} - ${horarioEntradaReal.format("HH:mm")}`,
            tipoId: 2,
            identificacao: lancamento.cartao_dia.cartao.funcionario.identificacao,
            minutos: diferencaEntrada,
          });
        }
      }

      const lastPeriodId = Math.max(...periodos);

      if (lancamento.periodoId === lastPeriodId) {
        const index = cargaHorariaCompletaArray.length - 2;
        let horarioSaidaEsperado = moment.utc(lancamento.cartao_dia.data).set({
          hour: Number(cargaHorariaCompletaArray[index].split(".")[0]),
          minute: Number(cargaHorariaCompletaArray[index].split(".")[1]),
          second: 0,
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
          eventos.push({
            data: saida.format("YYYY-MM-DD"),
            hora: `${horarioSaidaEsperado.format("HH:mm")} - ${horarioSaidaReal.format("HH:mm")}`,
            tipoId: 2,
            identificacao: lancamento.cartao_dia.cartao.funcionario.identificacao,
            minutos: diferencaSaida,
          });
        }

        const minutosTotaisEsperados = horarioSaidaEsperado.diff(horarioEntradaEsperado1, "minutes");

        const eventoAdicionalNoturno = criarEventoAdicionalNoturno(
          horarioSaidaEsperado,
          horarioSaidaReal,
          minutosTotaisEsperados,
          lancamento,
        );
        if (eventoAdicionalNoturno) {
          eventos.push(eventoAdicionalNoturno);
        }
      }

      return eventos;
    });

    const validEventosData = eventosData.filter((evento) => evento.data && evento.hora);

    const existingEvents = await this.prisma.eventos.findMany({
      where: {
        OR: validEventosData.map((evento) => ({
          data: evento.data,
          identificacao: evento.identificacao,
          hora: evento.hora,
        })),
      },
    });

    const newEventosData = validEventosData.filter((evento) => {
      return !existingEvents.some(
        (existingEvent) =>
          existingEvent.data === evento.data &&
          existingEvent.identificacao === evento.identificacao &&
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
}
