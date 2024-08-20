import { LancarFaltaPostgresRepository } from "@infra/db/postgresdb/lancar-falta/lancar-falta";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./lancar-falta-protocols";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";
import { RecalcularTurnoController } from "../recalcular-turno/recalcular-turno";

export class LancarFaltaController implements Controller {
  constructor(
    private readonly lancarFaltaPostgresRepository: LancarFaltaPostgresRepository,
    private readonly criarEventosPostgresRepository: CriarEventosPostgresRepository,
    private readonly recalcularTurnoController: RecalcularTurnoController,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { cartaoDiaId } = httpRequest.body;

      const dia = await this.lancarFaltaPostgresRepository.findFisrt({
        cartaoDiaId: Number(cartaoDiaId),
      });

      if (!dia) return badRequest(new FuncionarioParamError("Dia não encontrado!"));

      const eventosTrabalhados = dia?.eventos.filter((evento) => evento.tipoId == 1);

      const horariosDia = this.criarEventosPostgresRepository.pegarCargaHorarioCompleta(dia.cargaHorariaCompleta);

      const jornada = this.pegarPrimeiroEUltimoHorarioTrabalhado({
        horarios: horariosDia,
        cargaHorPrimeiroPeriodo: dia.cargaHorPrimeiroPeriodo,
        cargaHorSegundoPeriodo: dia.cargaHorSegundoPeriodo,
      });

      if (!dia.cargaHor)
        return badRequest(
          new FuncionarioParamError(`Não é possível criar falta com carga horária do dia de ${dia.cargaHor} minutos!`),
        );

      const eventos: { cartaoDiaId: number; funcionarioId: number; hora: string; minutos: number; tipoId: number }[] = [];

      //Se não houver eventos trabalhados, gerar evento da carga horaria completa como indefinido
      if (eventosTrabalhados?.length == 0) {
        eventos.push({
          cartaoDiaId,
          funcionarioId: dia.cartao.funcionarioId,
          hora: `${jornada.inicio.hora}:${jornada.inicio.minuto} - ${jornada.fim.hora}:${jornada.fim.minuto}`,
          minutos: -dia.cargaHor,
          tipoId: 2,
        });
      }

      let minutosTrabalho = 0;
      let minutosAusencia = 0;

      const saldoAtual = 0;
      dia.eventos.map((evento) => {
        if (evento.tipoId === 1) minutosTrabalho += evento.minutos;
        if (evento.tipoId === 2) minutosAusencia += evento.minutos;
      });

      let saldoDia = minutosTrabalho - minutosAusencia - dia.cargaHor;

      const existeLancamentoPeriodo1 = dia.cartao_dia_lancamentos.find((lancemento) => lancemento.periodoId == 1);
      const existeLancamentoPeriodo2 = dia.cartao_dia_lancamentos.find((lancemento) => lancemento.periodoId == 2);

      //Salva ausência primeiro período
      if (eventos.length === 0 && !existeLancamentoPeriodo1 && existeLancamentoPeriodo2) {
        const existeMinutosNoturno = this.existeMinutosNoturno({
          data: dia.data,
          inicio: { hora: horariosDia[0].hora, minutos: horariosDia[0].minuto },
          fim: { hora: horariosDia[1].hora, minutos: horariosDia[1].minuto },
        });

        if (existeMinutosNoturno.minutos !== 0) {
          eventos.push({
            cartaoDiaId,
            funcionarioId: dia.cartao.funcionarioId,
            hora: `${horariosDia[0].hora}:${horariosDia[0].minuto} - ${horariosDia[1].hora}:${horariosDia[1].minuto}`,
            minutos: 0,
            tipoId: 13,
          });
        }
        eventos.push({
          cartaoDiaId,
          funcionarioId: dia.cartao.funcionarioId,
          hora: `${horariosDia[0].hora}:${horariosDia[0].minuto} - ${horariosDia[1].hora}:${horariosDia[1].minuto}`,
          minutos: saldoDia,
          tipoId: 2,
        });
      }

      //Salva ausência segundo período
      if (eventos.length === 0 && !existeLancamentoPeriodo2) {
        if (!dia.cargaHorSegundoPeriodo) {
          return badRequest(
            new FuncionarioParamError(
              `Não é possível criar falta no segundo período com carga horária do mesmo de ${dia.cargaHorSegundoPeriodo} minutos!`,
            ),
          );
        }

        let existeMinutosNoturno = this.existeMinutosNoturno({
          data: dia.data,
          inicio: { hora: horariosDia[2].hora, minutos: horariosDia[2].minuto },
          fim: { hora: horariosDia[3].hora, minutos: horariosDia[3].minuto },
        });

        if (existeMinutosNoturno.minutos != 0) {
          eventos.push({
            cartaoDiaId,
            funcionarioId: dia.cartao.funcionarioId,
            hora: `${horariosDia[2].hora}:${horariosDia[2].minuto} - ${horariosDia[3].hora}:${horariosDia[3].minuto}`,
            minutos: 0,
            tipoId: 13,
          });
        }

        eventos.push({
          cartaoDiaId,
          funcionarioId: dia.cartao.funcionarioId,
          hora: `${horariosDia[2].hora}:${horariosDia[2].minuto} - ${horariosDia[3].hora}:${horariosDia[3].minuto}`,
          minutos: saldoDia,
          tipoId: 2,
        });
      }

      if (eventos.some((evento) => evento.minutos === 0))
        return badRequest(new FuncionarioParamError(`Evento de ausência já criado!`));

      if (eventos.some((evento) => evento.minutos > 0))
        return badRequest(new FuncionarioParamError(`Não é possível gerar evento de ausência para horário positivo!`));

      const saved = await this.salvarEvento(eventos);

      if (typeof saved === "boolean") return ok({ message: saved });
      else return badRequest(new FuncionarioParamError(saved));
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }

  public atualizarSaldoSomandoMinutosNoturnos(input: { saldo: number; minutosNoturnos: number }) {}

  public pegarPrimeiroEUltimoHorarioTrabalhado(input: {
    horarios: { hora: number; minuto: number }[];
    cargaHorPrimeiroPeriodo: number;
    cargaHorSegundoPeriodo: number;
  }) {
    if (!input.cargaHorSegundoPeriodo) return { inicio: input.horarios[0], fim: input.horarios[1] };
    else return { inicio: input.horarios[0], fim: input.horarios[3] };
  }

  protected async salvarEvento(
    input: {
      cartaoDiaId: number;
      funcionarioId: number;
      hora: string;
      minutos: number;
      tipoId: number;
    }[],
  ) {
    for (const evento of input) {
      const existeEvento = await this.lancarFaltaPostgresRepository.findFisrtEvento(evento);

      if (existeEvento) return "Ausência já aplicada!";
    }

    return await this.lancarFaltaPostgresRepository.createEvento(input);
  }

  public existeMinutosNoturno(input: {
    inicio: { hora: number; minutos: number };
    fim: { hora: number; minutos: number };
    data: Date;
  }) {
    const inicio = this.criarEventosPostgresRepository.pegarHorarioCargaHoraria({
      data: input.data,
      utc: false,
      hora: input.inicio.hora,
      minuto: input.inicio.minutos,
    });

    let fim = this.criarEventosPostgresRepository.pegarHorarioCargaHoraria({
      data: input.data,
      utc: false,
      hora: input.fim.hora,
      minuto: input.fim.minutos,
    });

    if (fim.isBefore(inicio)) fim.add(1, "d");

    const minutosNoturno = this.recalcularTurnoController.localizarMinutosNoturno({
      data: input.data,
      inicio: inicio.toDate(),
      fim: fim.toDate(),
    });

    return minutosNoturno;
  }
}
