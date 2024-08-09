import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./buscar-funcionarios-referencia-localidade-protocols";
import moment from "moment";
import "moment/locale/pt-br";
import { BuscarFuncionarioReferenciaLocalidadePostgresRepository } from "@infra/db/postgresdb/buscar-funcionario-referencia-localidade/buscar-funcionario-referencia-localidade";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";

export class BuscarFuncionarioReferenciaLocalidadeAgrupadaController implements Controller {
  constructor(
    private readonly buscarFuncionarioReferenciaLocalidadePostgresRepository: BuscarFuncionarioReferenciaLocalidadePostgresRepository,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidadeId, referencia } = httpRequest?.query;

      if (!localidadeId) return badRequest(new FuncionarioParamError("Falta localidade!"));

      if (!referencia) return badRequest(new FuncionarioParamError("Falta referência!"));

      if (!moment(referencia).isValid()) badRequest(new FuncionarioParamError("Data da referência inválida!"));

      const localidade = await this.buscarFuncionarioReferenciaLocalidadePostgresRepository.findFisrtLocalidade({ localidadeId });
      if (!localidade) return notFoundRequest(new FuncionarioParamError(`Localidade ${localidadeId} não encontrada!`));

      const cartao = await this.buscarFuncionarioReferenciaLocalidadePostgresRepository.findFisrtReferencia({
        referencia: new Date(referencia),
      });
      if (!cartao)
        return notFoundRequest(
          new FuncionarioParamError(`Não foi encontrado cartões para a referncia ${moment.utc(referencia).toDate()}!`),
        );

      const funcionarios = await this.buscarFuncionarioReferenciaLocalidadePostgresRepository.findManyFuncionarios({
        data: new Date(referencia),
        localidadeId,
      });

      return ok({ funcionarios });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
