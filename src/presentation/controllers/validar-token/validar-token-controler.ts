import { notAuthorized, serverError } from "../../helpers/http-helpers";
import { HttpRequest, HttpResponse } from "./validar-token-protocols";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import jwt from "jsonwebtoken";

export class ValidarToken {
  async handle(httRequest: HttpRequest): Promise<HttpResponse | undefined> {
    try {
      if (!httRequest.headers?.authorization) return notAuthorized(new FuncionarioParamError("Não autorizado!"));

      const token = httRequest.headers.authorization.split(" ")[1];

      const result = jwt.verify(token, String(process.env.JWTSECRET), { algorithms: ["HS512"] });

      if (!result) return notAuthorized(new FuncionarioParamError("Não autorizado!"));

      return undefined;
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
