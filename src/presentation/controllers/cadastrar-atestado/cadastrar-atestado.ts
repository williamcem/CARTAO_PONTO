import { AtestadoRepository, DataAtestadoInvalida } from "@infra/db/postgresdb/atestado-repository/atestado-repository";

import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./cadastrar-atestado-protocols";

export class AtestadoController implements Controller {
  constructor(private readonly atestadoRepository: AtestadoRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const {
        inicio,
        fim,
        grupo_cid,
        descricao,
        userName,
        funcionarioId,
        tipoId,
        ocupacaoId,
        tipoAcompanhanteId,
        idade_paciente,
        acidente_trabalho,
        acao,
        observacao,
        statusId,
        data,
        sintomas,
      } = httpRequest.body;

      if (!userName) return badRequest(new FuncionarioParamError("Falta Usuário!"));
      if (!tipoId) return badRequest(new FuncionarioParamError("Falta o tipo do atestado!"));
      if (!funcionarioId) return badRequest(new FuncionarioParamError("Falta funcionárioId!"));
      if (!acao) return badRequest(new FuncionarioParamError("Falta escolher a ação caso seja recusado!"));
      if (!data) return badRequest(new FuncionarioParamError("Falta a data do atestado!"));
      if (!sintomas && !grupo_cid) return badRequest(new FuncionarioParamError("Faltam os sintomas ou o grupo CID!"));

      const atestadoSalvo = await this.atestadoRepository.add({
        inicio,
        fim,
        grupo_cid,
        descricao,
        userName,
        funcionarioId,
        tipoId,
        ocupacaoId,
        tipoAcompanhanteId,
        idade_paciente,
        acidente_trabalho,
        acao,
        statusId,
        data,
        observacao,
        sintomas,
      });

      if (!atestadoSalvo) throw new Error("Erro ao salvar atestado!");

      return ok({ message: "Atestado salvo com sucesso" });
    } catch (error) {
      if (error instanceof DataAtestadoInvalida) {
        return badRequest(new FuncionarioParamError(error.message));
      }
      console.error(error);
      return serverError();
    }
  }
}
