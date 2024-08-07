import { ok, serverError, badRequest } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./alterar-usuario";
import { AlterarUsuarioRepository } from "@infra/db/postgresdb/alterar-usuario/alterar-usuario-repository";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import bcrypt from "bcrypt";

export class AlterarUsuarioController implements Controller {
  constructor(private readonly alterarUsuarioRepository: AlterarUsuarioRepository) {}

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { senha } = httRequest?.body;
      const { id } = httRequest?.query;

      if (!id) return badRequest(new FuncionarioParamError("Falta sequência do usuário!"));
      if (!senha) return badRequest(new FuncionarioParamError("Falta senha!"));

      const usuario = await this.alterarUsuarioRepository.findFisrt({ id: Number(id) });
      if (!usuario) return badRequest(new FuncionarioParamError("Usuário não encontrado!"));

      const saltRounds = Number(process.env.SALTS);
      const myPlaintextPassword = senha;

      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(myPlaintextPassword, salt);

      const result = await this.alterarUsuarioRepository.update({
        id: Number(id),
        senha: hash,
      });

      if (!result) serverError();

      return ok({ message: "Usuário alterado com sucesso!" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
