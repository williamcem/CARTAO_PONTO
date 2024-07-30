import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { ValidarToken } from "../../presentation/controllers/validar-token/validar-token-controler";

export const makeValidarTokenController = (): Controller => {
  const validarToken = new ValidarToken();
  return new LogControllerDecorator(validarToken);
};
