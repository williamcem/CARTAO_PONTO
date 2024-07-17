import { AtestadoRepository } from "@infra/db/postgresdb/atestado-repository/atestado-repository";

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
        proprio,
        aprovado,
        observacao,
        statusId,
      } = httpRequest.body;

      if (!inicio) return badRequest(new FuncionarioParamError("Falta inicio dio atestado!"));
      if (!fim) return badRequest(new FuncionarioParamError("Falta fim do atestado!"));
      if (!userName) return badRequest(new FuncionarioParamError("Falta Usuário!"));
      if (!tipoId) return badRequest(new FuncionarioParamError("Falta o tipo do atestado!"));
      if (!funcionarioId) return badRequest(new FuncionarioParamError("Falta funcionárioId!"));
      if (!observacao) return badRequest(new FuncionarioParamError("Falta observação!"));

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
        proprio,
        observacao,
        statusId,
      });

      if (!atestadoSalvo) throw "Erro ao salvar atestado!";

      return ok({ message: "Atestado salvo com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
