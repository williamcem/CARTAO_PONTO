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

      let evento = {
        cartaoDiaId,
        funcionarioId: dia.cartao.funcionarioId,
        hora: "",
        minutos: 0,
        tipoId: 2,
      };

      //Se não houver eventos trabalhados, gerar evento da carga horaria completa como indefinido
      if (eventosTrabalhados?.length == 0) {
        evento.hora = `${jornada.inicio.hora}:${jornada.fim.minuto} - ${jornada.fim.hora}:${jornada.fim.minuto}`;
        evento.minutos = -dia.cargaHor;
      }

      let minutosTrabalho = 0;
      let minutosAusencia = 0;

      dia.eventos.map((evento) => {
        if (evento.tipoId === 1) minutosTrabalho += evento.minutos;
        if (evento.tipoId === 2) minutosAusencia += evento.minutos;
      });

      const saldoDia = minutosTrabalho - minutosAusencia - dia.cargaHor;

      const existeLancamentoPeriodo1 = dia.cartao_dia_lancamentos.find((lancemento) => lancemento.periodoId == 1);
      const existeLancamentoPeriodo2 = dia.cartao_dia_lancamentos.find((lancemento) => lancemento.periodoId == 2);

      //Salva ausência primeiro período
      if (!evento.minutos && !existeLancamentoPeriodo1 && existeLancamentoPeriodo2) {
        const existeMinutosNoturno = this.existeMinutosNoturno({
          data: dia.data,
          fim: { hora: horariosDia[0].hora, minutos: horariosDia[0].minuto },
          inicio: { hora: horariosDia[1].hora, minutos: horariosDia[1].minuto },
        });

        evento.hora = `${horariosDia[0].hora}:${horariosDia[0].minuto} - ${horariosDia[1].hora}:${horariosDia[1].minuto}`;
        evento.minutos = existeMinutosNoturno ? saldoDia * 1.14 : saldoDia;
      }

      //Salva ausência segundo período
      if (!evento.minutos && !existeLancamentoPeriodo2) {
        if (!dia.cargaHorSegundoPeriodo) {
          return badRequest(
            new FuncionarioParamError(
              `Não é possível criar falta no segundo período com carga horária do mesmo de ${dia.cargaHorSegundoPeriodo} minutos!`,
            ),
          );
        }
        const existeMinutosNoturno = this.existeMinutosNoturno({
          data: dia.data,
          fim: { hora: horariosDia[2].hora, minutos: horariosDia[2].minuto },
          inicio: { hora: horariosDia[3].hora, minutos: horariosDia[3].minuto },
        });

        evento.minutos = existeMinutosNoturno ? saldoDia * 1.14 : saldoDia;
        evento.hora = `${horariosDia[2].hora}:${horariosDia[2].minuto} - ${horariosDia[3].hora}:${horariosDia[3].minuto}`;
      }

      if (evento.minutos === 0) return badRequest(new FuncionarioParamError(`Evento de ausência já criado!`));

      const saved = await this.salvarEvento(evento);

      if (typeof saved === "boolean") return ok({ message: saved });
      else return badRequest(new FuncionarioParamError(saved));
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }

  public pegarPrimeiroEUltimoHorarioTrabalhado(input: {
    horarios: { hora: number; minuto: number }[];
    cargaHorPrimeiroPeriodo: number;
    cargaHorSegundoPeriodo: number;
  }) {
    if (!input.cargaHorSegundoPeriodo) return { inicio: input.horarios[0], fim: input.horarios[1] };
    else return { inicio: input.horarios[0], fim: input.horarios[3] };
  }

  protected async salvarEvento(input: {
    cartaoDiaId: number;
    funcionarioId: number;
    hora: string;
    minutos: number;
    tipoId: number;
  }) {
    const existeEvento = await this.lancarFaltaPostgresRepository.findFisrtEvento(input);

    if (existeEvento) return "Ausência já aplicada!";

    return await this.lancarFaltaPostgresRepository.createEvento(input);
  }

  public existeMinutosNoturno(input: {
    inicio: { hora: number; minutos: number };
    fim: { hora: number; minutos: number };
    data: Date;
  }) {
    const inicio = this.criarEventosPostgresRepository
      .pegarHorarioCargaHoraria({
        data: input.data,
        utc: false,
        hora: input.inicio.hora,
        minuto: input.inicio.minutos,
      })
      .toDate();

    const fim = this.criarEventosPostgresRepository
      .pegarHorarioCargaHoraria({
        data: input.data,
        utc: false,
        hora: input.fim.hora,
        minuto: input.fim.minutos,
      })
      .toDate();

    const minutos = this.recalcularTurnoController.localizarMinutosNoturno({
      data: input.data,
      inicio,
      fim,
    }).minutos;

    return Boolean(minutos);
  }
}
