import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./logar-protocols";
import bcrypt from "bcrypt";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { LogarPostgresRepository } from "@infra/db/postgresdb/logar/logar-repository";

export class LogarController implements Controller {
  constructor(private readonly logarPostgresRepository: LogarPostgresRepository) {}

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidadeCodigo, perfilId, senha } = httRequest?.body;

      if (!localidadeCodigo) return badRequest(new FuncionarioParamError("Localidade não informada"));
      if (!perfilId) return badRequest(new FuncionarioParamError("Perfil não informado"));
      if (!senha) return badRequest(new FuncionarioParamError("Senha não informada"));

      const localidade = await this.logarPostgresRepository.findFisrtLocalidade({
        codigo: localidadeCodigo,
      });

      if (!localidade) return notFoundRequest(new FuncionarioParamError(`Localidade ${localidadeCodigo} não existente!`));

      const perfil = await this.criarUsuarioPostgresRepository.findFisrtPerfil({ id: perfilId });

      if (!perfil) return notFoundRequest(new FuncionarioParamError(`Perfil ${perfilId} não existente!`));

      const usuario = await this.criarUsuarioPostgresRepository.findFisrtUsuario({
        localidadeCodigo: localidade.id,
        perfilId: perfil.id,
      });

      if (usuario)
        return badRequest(new FuncionarioParamError(`O perfil ${perfil.nome} já existe para a localidade ${localidade.nome}!`));

      const saltRounds = 10;
      const myPlaintextPassword = senha;

      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(myPlaintextPassword, salt);

      const created = await this.criarUsuarioPostgresRepository.create({
        localidadeCodigo: localidade.id,
        perfilId: perfil.id,
        senha: hash,
        userName,
      });

      if (!created) return serverError();

      return ok({
        localidade,
        perfil,
        userName,
        ...created,
      });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
