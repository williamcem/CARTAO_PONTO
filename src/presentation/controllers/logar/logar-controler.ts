import { badRequest, notAuthorized, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./logar-protocols";
import bcrypt from "bcrypt";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { LogarPostgresRepository } from "@infra/db/postgresdb/logar/logar-repository";
import jwt from "jsonwebtoken";

export class LogarController implements Controller {
  constructor(private readonly logarPostgresRepository: LogarPostgresRepository) {}

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidadeCodigo, perfilId, senha } = httRequest?.body;

      if (!localidadeCodigo) return badRequest(new FuncionarioParamError("Localidade não informada"));
      if (!perfilId) return badRequest(new FuncionarioParamError("Perfil não informado"));
      if (!senha) return badRequest(new FuncionarioParamError("Senha não informada"));

      const usuario = await this.logarPostgresRepository.findFisrtUsuario({ localidadeCodigo, usuarioPerfilId: perfilId });

      if (!usuario) return notAuthorized(new FuncionarioParamError("Usuário ou senha errado!"));

      const validate = bcrypt.compareSync(senha, usuario.senha);

      if (!validate) return notAuthorized(new FuncionarioParamError("Usuário ou senha errado!"));

      const perfil = await this.logarPostgresRepository.findFisrtPerfil({ id: perfilId });

      if (!perfil) return badRequest(new FuncionarioParamError("Perfil não cadastrado!"));

      const token = jwt.sign({ ...usuario, ...{ perfil } }, String(process.env.JWTSECRET), {
        expiresIn: Number(process.env.JWTEXPIREIN),
        algorithm: "HS512",
      });

      return ok({ ...{ id: usuario.id, perfil, token, localidade: localidadeCodigo } });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
