import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./confirmar-lanca-dia-protocols";
import { ConfirmarLancaDiaPostgresRepository } from "@infra/db/postgresdb/confirmar-lanca-dia/confirmar-lancar-dia";

export class ConfirmarLancaDiaController implements Controller {
  constructor(private readonly confirmarLancaDiaPostgresRepository: ConfirmarLancaDiaPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const {
        cartao_dia_id,
        userName,
        cartao_dia_lancamentos,
      }: {
        cartao_dia_id: number;
        userName: string;
        cartao_dia_lancamentos: { entrada: Date; saida: Date; periodoId: number }[];
      } = httpRequest?.body;

      if (!cartao_dia_id) return badRequest(new FuncionarioParamError("Falta sequencia do cartão!"));
      if (!userName) return badRequest(new FuncionarioParamError("Falta usuário para lançar cartão"));

      if (!cartao_dia_lancamentos) return badRequest(new FuncionarioParamError("Falta objeto cartao_dia_lancamentos"));

      if (cartao_dia_lancamentos.length == 0) return badRequest(new FuncionarioParamError("Falta cartao_dia_lancamentos"));

      let error = "";

      cartao_dia_lancamentos.map((lancamento, index: number) => {
        console.log(lancamento.periodoId, !Number(lancamento.periodoId));
        console.log(lancamento.entrada, !new Date(lancamento.entrada).getTime());
        console.log(lancamento.saida, !new Date(lancamento.saida).getTime());
        if (!Number(lancamento.periodoId)) error = `${error}\nFalta periodo do lançamento no cartao_dia_lancamentos `;

        if (!new Date(lancamento.entrada).getTime())
          error = `${error}\nData do lançamento de entrada inválida no cartao_dia_lancamentos`;
        if (!new Date(lancamento.saida).getTime())
          error = `${error}\nData do lançamento de saída inválida no cartao_dia_lancamentos`;

        cartao_dia_lancamentos[index].entrada = new Date(cartao_dia_lancamentos[index].entrada);
        cartao_dia_lancamentos[index].saida = new Date(cartao_dia_lancamentos[index].saida);
      });

      if (error) return badRequest(new FuncionarioParamError(error));

      const dia = await this.confirmarLancaDiaPostgresRepository.findFisrt({ id: Number(cartao_dia_id) });

      if (!dia) return badRequest(new FuncionarioParamError("Dia do cartão não localizado!"));

      dia.lancamentos.map((lancamento) => {
        if (lancamento.validadoPeloOperado) error = "Lançamento já validado!";
      });

      if (error) return badRequest(new FuncionarioParamError(error));

      cartao_dia_lancamentos.map((lancamento) => {
        const existDb = dia.lancamentos.find(
          (lancamentoDb) =>
            lancamentoDb.entrada?.getTime() === lancamento.entrada.getTime() &&
            lancamentoDb.saida?.getTime() === lancamento.saida.getTime() &&
            lancamento.periodoId === lancamentoDb.periodoId,
        );

        if (!existDb) error = `O ${lancamento.periodoId}º período não é igual do primeiro lançamento!`;
      });

      if (error) return badRequest(new FuncionarioParamError(error));

      dia.lancamentos.map((lancamentoDb) => {
        const exist = cartao_dia_lancamentos.find(
          (lancamento) =>
            lancamento.entrada.getTime() === lancamentoDb.entrada?.getTime() &&
            lancamento.saida.getTime() === lancamentoDb.saida?.getTime() &&
            lancamento.periodoId === lancamentoDb.periodoId,
        );

        if (!exist) error = `O lançamento do ${lancamentoDb.periodoId}º periodo não informado!`;
      });

      if (error) return badRequest(new FuncionarioParamError(error));

      const updated = await this.confirmarLancaDiaPostgresRepository.update(
        dia.lancamentos.map((lancamento) => ({
          id: lancamento.id,
        })),
      );

      if (!updated) serverError();

      return ok({ message: "Salvo com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
