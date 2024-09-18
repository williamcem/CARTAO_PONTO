import { BuscarOcorrenciaMinutoAusentePostgresRepository } from "@infra/db/postgresdb/buscar-ocorrencia-minuto-ausente/buscar-ocorrencia-minuto-ausente";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, badRequestNovo, notFoundNovo, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./buscar-ocorrencia-minuto-ausente-protocols";
import moment from "moment";

export class BuscarOcorrenciaMinutoAusenteController implements Controller {
  constructor(
    private readonly buscarOcorrenciaMinutoAusentePostgresRepository: BuscarOcorrenciaMinutoAusentePostgresRepository,
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

      // Retorna o(s) funcionário(s) encontrado(s)
      /* return ok({ message: "Identificador encontrado com sucesso", data: funcionario, resumo: resumoCalculado }); */
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
