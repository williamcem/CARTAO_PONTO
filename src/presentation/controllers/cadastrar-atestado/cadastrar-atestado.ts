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
        trabalhou_dia,
        horario_trabalhado_inicio,
        horario_trabalhado_fim,
        tipo_comprovanteId,
        nome_acompanhante,
        exame,
      } = httpRequest.body;

      if (!userName) return badRequest(new FuncionarioParamError("Falta Usuário!"));
      if (!tipoId) return badRequest(new FuncionarioParamError("Falta o tipo do atestado!"));
      if (!funcionarioId) return badRequest(new FuncionarioParamError("Falta funcionárioId!"));
      if (!acao) return badRequest(new FuncionarioParamError("Falta escolher a ação caso seja recusado!"));
      if (!data) return badRequest(new FuncionarioParamError("Falta a data do atestado!"));

      if (tipoId === 1 && !sintomas && !grupo_cid) {
        return badRequest(new FuncionarioParamError("Faltam os sintomas ou o grupo CID"));
      }

      if (trabalhou_dia === true && !horario_trabalhado_inicio && !horario_trabalhado_fim) {
        return badRequest(new FuncionarioParamError("Falta inserir o horario em que o funcionario trabalhou"));
      }

      const funcionario = await this.atestadoRepository.findFisrtFuncionario({ id: Number(funcionarioId) });

      if (!funcionario) return badRequest(new FuncionarioParamError("Funcionário inexistente!"));

      const atestadoSalvo = await this.atestadoRepository.add({
        inicio,
        fim,
        grupo_cid: grupo_cid ? grupo_cid.toUpperCase() : undefined,
        descricao: descricao ? descricao.toUpperCase() : undefined,
        userName: userName ? userName.toUpperCase() : undefined,
        funcionarioId,
        tipoId,
        ocupacaoId,
        tipoAcompanhanteId,
        idade_paciente,
        acidente_trabalho,
        acao,
        statusId,
        data,
        observacao: observacao ? observacao.toUpperCase() : undefined,
        sintomas: sintomas ? sintomas.toUpperCase() : undefined,
        trabalhou_dia,
        horario_trabalhado_inicio,
        horario_trabalhado_fim,
        tipo_comprovanteId,
        funcionarioFuncaoId: funcionario.funcaoId,
        nomeFuncionario: funcionario.nome,
        nome_acompanhante: nome_acompanhante ? nome_acompanhante.toUpperCase() : undefined,
        exame: exame ? exame.toUpperCase() : undefined,
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
