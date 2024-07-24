import { CriarUsuarioPostgresRepository } from "@infra/db/postgresdb/criar-usuario/criar-usuario-repository";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./criar-usuario-protocols";
import bcrypt from "bcrypt";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";

export class CriarUsuarioController implements Controller {
  constructor(private readonly criarUsuarioPostgresRepository: CriarUsuarioPostgresRepository) {}

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidadeCodigo, perfilId, senha, userName } = httRequest?.body;

      if (!localidadeCodigo) return badRequest(new FuncionarioParamError("Localidade não informada"));
      if (!perfilId) return badRequest(new FuncionarioParamError("perfil não informado"));
      if (!senha) return badRequest(new FuncionarioParamError("Senha não informada"));
      if (!userName) return badRequest(new FuncionarioParamError("Username não informado"));

      const localidade = await this.criarUsuarioPostgresRepository.findFisrtLocalidade({
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
