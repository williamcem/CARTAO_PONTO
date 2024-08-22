import { badRequest, badRequestNovo, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./finalizar-cartao-protocols";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { FinalizarCartaoPostgresRepository } from "@infra/db/postgresdb/finalizar-cartao/finalizar-cartao";
import moment from "moment";

export class FinalizarCartaoController implements Controller {
  constructor(private readonly finalizarCartaoPostgresRepository: FinalizarCartaoPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id, userName } = httpRequest.body;

      if (!id) return badRequest(new FuncionarioParamError("Falta id do cartão!"));
      if (!userName) return badRequest(new FuncionarioParamError("Falta usuário!"));

      const cartao = await this.finalizarCartaoPostgresRepository.findFisrt({
        id: Number(id),
      });

      if (!cartao) return notFoundRequest(new FuncionarioParamError("Cartão não localizado!"));

      if (cartao.statusId != 1) return badRequest(new FuncionarioParamError("Cartão já está finaliado!"));

      const diasSemLancamento: { id: number; data: Date }[] = [];
      const lancamentosNaoValidado: { id: number; data: Date; lancamentos: { periodoId: number }[] }[] = [];
      const ocorrenciasNaoTratada: { id: number; data: Date; eventos: { id: number; hora: string }[] }[] = [];

      cartao.cartao_dia.map((dia) => {
        if (dia.cargaHor === 0) return;

        if (!dia.eventos.length) {
          diasSemLancamento.push({ data: dia.data, id: dia.id });
        }

        dia.cartao_dia_lancamentos.map((lancamento) => {
          if (lancamento.validadoPeloOperador) return undefined;

          const existIndex = lancamentosNaoValidado.findIndex((lancErro) => lancErro.id === dia.id);
          if (existIndex !== -1) lancamentosNaoValidado[existIndex].lancamentos.push({ periodoId: lancamento.periodoId });
          else
            lancamentosNaoValidado.push({
              id: dia.id,
              data: dia.data,
              lancamentos: [{ periodoId: lancamento.periodoId }],
            });
        });

        dia.eventos.map((evento) => {
          if (evento.tipoId === 2 && !evento.tratado) {
            const existeIndexDia = ocorrenciasNaoTratada.findIndex((eve) => eve.id === dia.id);

            if (existeIndexDia !== -1) ocorrenciasNaoTratada[existeIndexDia].eventos.push({ id: evento.id, hora: evento.hora });
            else
              ocorrenciasNaoTratada.push({
                id: dia.id,
                data: dia.data,
                eventos: [{ id: evento.id, hora: evento.hora }],
              });
          }
        });
      });

      if (lancamentosNaoValidado.length || ocorrenciasNaoTratada.length || diasSemLancamento.length)
        return badRequestNovo({ message: { lancamentosNaoValidado, ocorrenciasNaoTratada, diasSemLancamento } });

      const saved = await this.finalizarCartaoPostgresRepository.update({
        id: cartao.id,
        statusId: 2, //finalizado
        updateAt: moment().utc(false).toDate(),
        userName,
      });

      if (!saved) serverError();

      return ok({ saved });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
