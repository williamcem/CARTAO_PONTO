import { AtestadoRepository } from "@infra/db/postgresdb/atestado-repository/atestado-repository";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./cadastrar-atestado-protocols";

export class AtestadoController implements Controller {
  constructor(private readonly atestadoRepository: AtestadoRepository) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const {
        nome_funcionario,
        identificacao,
        inicio,
        fim,
        saida,
        retorno,
        tipo,
        grupo_cid,
        descricao,
        userName,
        funcionarioId
      } = httpRequest?.body;

      if (!nome_funcionario) return badRequest(new FuncionarioParamError("Falta nome do funcionário!"));
      if (!identificacao) return badRequest(new FuncionarioParamError("Falta identificação!"));
      if (!inicio) return badRequest(new FuncionarioParamError("Falta inicio!"));
      if (!fim) return badRequest(new FuncionarioParamError("Falta fim!"));
      if (!tipo) return badRequest(new FuncionarioParamError("Falta tipo!"));
      if (!grupo_cid) return badRequest(new FuncionarioParamError("Falta grupo CID!"));
      if (!descricao) return badRequest(new FuncionarioParamError("Falta descrição!"));
      if (!userName) return badRequest(new FuncionarioParamError("Falta usuário!"));

      const inicioDate = new Date(inicio);
      const fimDate = new Date(fim);

      if (isNaN(inicioDate.getTime())) {
        return badRequest(new FuncionarioParamError("Formato de data inválido!"));
      }
      if (isNaN(fimDate.getTime())) {
        return badRequest(new FuncionarioParamError("Formato de data inválido!"));
      }

      const atestado = await this.atestadoRepository.add({
        nome_funcionario,
        identificacao,
        inicio: inicioDate,
        fim: fimDate,
        saida,
        retorno,
        tipo,
        grupo_cid,
        descricao,
        userName,
        funcionarioId,
      });

      if (!atestado) throw "Erro ao salvar atestado!";

      return ok({ message: "Atestado salvo com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
