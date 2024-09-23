import { BuscarOcorrenciaMinutoAusentePostgresRepository } from "@infra/db/postgresdb/buscar-ocorrencia-minuto-ausente/buscar-ocorrencia-minuto-ausente";
import { badRequestNovo, notFoundNovo, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./buscar-ocorrencia-minuto-ausente-protocols";
import moment from "moment";
import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";
import { LancarFaltaController } from "../lancar-falta/lancar-falta";

export class BuscarOcorrenciaMinutoAusenteController implements Controller {
  constructor(
    private readonly buscarOcorrenciaMinutoAusentePostgresRepository: BuscarOcorrenciaMinutoAusentePostgresRepository,
    private readonly criarEventosPostgresRepository: CriarEventosPostgresRepository,
    private readonly lancarFaltaController: LancarFaltaController,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      if (!httpRequest?.query?.identificacao) return badRequestNovo({ message: "Falta Identificação do funcionário!" });
      if (!httpRequest?.query?.localidade) return badRequestNovo({ message: "Falta localidade!" });
      if (!httpRequest?.query?.referencia) return badRequestNovo({ message: "Falta referência!" });

      const referencia = moment(httpRequest?.query?.referencia);
      if (!referencia.isValid()) return badRequestNovo({ message: "Data referência inválida!" });

      const identificacao = httpRequest?.query?.identificacao;

      const funcionario = await this.buscarOcorrenciaMinutoAusentePostgresRepository.findFisrtFuncionario({
        identificacao,
      });

      if (!funcionario) return notFoundNovo({ message: `Funcionário não encontrado pela identificação ${identificacao}!` });

      const cartao = await this.buscarOcorrenciaMinutoAusentePostgresRepository.findFisrtCartao({
        funcionarioId: funcionario.id,
        referencia: referencia.toDate(),
      });

      if (!cartao)
        return notFoundNovo({
          message: `Cartão do funcionário ${funcionario.nome} da referência ${referencia.format("MMM/YYYY")}!`,
        });

      const date = moment.utc();

      const dias = await this.buscarOcorrenciaMinutoAusentePostgresRepository.findManyDias({
        cartaoId: cartao.id,
        date: { lte: date.toDate() },
      });

      const abonosAtestado = await this.buscarOcorrenciaMinutoAusentePostgresRepository.findManyAbonosAtestado({
        cartaoDiaId: { in: dias.map((dia) => dia.id) },
      });

      const atestados = await this.buscarOcorrenciaMinutoAusentePostgresRepository.findManyAtestado({
        funcionarioId: funcionario.id,
      });

      const diasAtestado: { data: Date }[] = [];

      atestados.map(async (atestado) => {
        const inicio = moment.utc(atestado.data);
        for (let index = 0; index < atestado.diasAusencia; index++) {
          const exist = diasAtestado.find((a) => a.data.getTime() === inicio.toDate().getTime());
          if (!exist) diasAtestado.push({ data: inicio.toDate() });
          inicio.add(1, "days");
        }
      });

      const diasComAusenciaMinutos: {
        cartaoDiaId: number;
        minutos: number;
        data: Date;
        inicio: Date;
        fim: Date;
        tipoId: number;
      }[] = [];

      for (const dia of dias) {
        //Se dia não for trabalhado passa próximo dia
        if (dia.statusId !== 1) continue;

        if (!dia.validadoPeloOperador) continue;

        //Se dia contêm atestado passa próximo dia
        const existAtestadoDia = diasAtestado.some((atestado) => atestado.data.getTime() === dia.data.getTime());
        if (existAtestadoDia) continue;

        const eventosRepositorio = await this.buscarOcorrenciaMinutoAusentePostgresRepository.findManyEventos({
          cartaoDiaId: dia.id,
        });

        const lancamentos: { entrada: Date; saida: Date; periodoId: number }[] = [];
        dia.cartao_dia_lancamentos.map(async (lanc) => {
          if (lanc.entrada && lanc.saida)
            lancamentos.push({ entrada: lanc.entrada, saida: lanc.saida, periodoId: lanc.periodoId });
        });

        //Localizar minutos de aussência
        {
          const eventos = await this.criarEventosPostgresRepository.gerarEventos({
            lancamentos: lancamentos.map((lancamento) => ({
              entrada: lancamento.entrada,
              saida: lancamento.saida,
              periodoId: lancamento.periodoId,
              cartao_dia: {
                id: dia.id,
                cargaHorariaCompleta: dia.cargaHorariaCompleta,
                cargaHorSegundoPeriodo: dia.cargaHorSegundoPeriodo,
                data: dia.data,
                periodoDescanso: dia.periodoDescanso,
                cartao: {
                  funcionario: { id: funcionario.id },
                },
              },
            })),
          });

          let abonado = abonosAtestado.find((abono) => abono.cartaoDiaId === dia.id)?.minutos || 0;

          if (eventos.length === 0) {
            //Se o dia foi abonado não mostra ocorrência
            if (abonado === dia.cargaHor) continue;

            const cargaCompleta = this.criarEventosPostgresRepository.pegarCargaHorarioCompleta(dia.cargaHorariaCompleta);

            const inicio = moment.utc(dia.data).hours(cargaCompleta[0].hora).minutes(cargaCompleta[0].minuto);
            let fim = moment(inicio).add(dia.cargaHor, "minutes").add(dia.periodoDescanso, "minutes");

            diasComAusenciaMinutos.push({
              minutos: -dia.cargaHor,
              cartaoDiaId: dia.id,
              data: dia.data,
              fim: fim.toDate(),
              inicio: inicio.toDate(),
              tipoId: 2,
            });
          } else {
            const contemMaisDe2Intervalos = eventos.filter((evento) => evento.tipoId === 8).length > 1;

            for (const evento of eventos) {
              const eTipoIntervaloEContemMaisDe2 = evento.tipoId === 8 && contemMaisDe2Intervalos;

              if (!eTipoIntervaloEContemMaisDe2 && evento.tipoId !== 2) continue;

              const existeEvento = eventosRepositorio.find(
                (e) =>
                  -e.minutos === evento.minutos &&
                  e.fim?.getTime() === evento.fim.getTime() &&
                  e.inicio?.getTime() === evento.inicio.getTime(),
              );

              if (existeEvento) continue;

              diasComAusenciaMinutos.push({
                minutos: evento.minutos,
                cartaoDiaId: dia.id,
                data: dia.data,
                fim: evento.fim,
                inicio: evento.inicio,
                tipoId: evento.tipoId,
              });
            }
          }
        }

        try {
          const eventosDeAusencia: {
            body: {
              data: {
                cartaoDiaId: 162572;
                funcionarioId: number;
                hora: string;
                minutos: number;
                tipoId: number;
                inicio: Date;
                fim: Date;
              }[];
            };
          } = await this.lancarFaltaController.handle({ body: { cartaoDiaId: dia.id, notSave: true } });

          eventosDeAusencia.body?.data?.map((evento) => {
            const existeEvento = eventosRepositorio.find(
              (e) =>
                -e.minutos === evento.minutos &&
                e.fim?.getTime() === evento.fim.getTime() &&
                e.inicio?.getTime() === evento.inicio.getTime(),
            );

            if (existeEvento) return undefined;

            diasComAusenciaMinutos.push({
              cartaoDiaId: evento.cartaoDiaId,
              data: dia.data,
              fim: evento.fim,
              inicio: evento.inicio,
              minutos: evento.minutos,
              tipoId: evento.tipoId,
            });
          });
        } catch (error) {}
      }

      return ok({ message: diasComAusenciaMinutos });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
