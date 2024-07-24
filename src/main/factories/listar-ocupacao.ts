import { ListarOcupacaoRepsository } from "@infra/db/postgresdb/listar-ocupacao/listar-ocupacao";

import { ListarOcupacaoController } from "../../presentation/controllers/listar-ocupacao/listar-ocupacao-controller";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarOcupacaoController = (): Controller => {
  const listarOcupacaoRepsository = new ListarOcupacaoRepsository();
  const listarOcupacaoController = new ListarOcupacaoController(listarOcupacaoRepsository);
  return new LogControllerDecorator(listarOcupacaoController);
};
