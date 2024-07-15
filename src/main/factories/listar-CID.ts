import { ListarCidRepsository } from "@infra/db/postgresdb/listar-CID-repository/listar-CID-repository";

import { ListarCIDController } from "../../presentation/controllers/listar-CID/listar-CID-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeCIDController = (): Controller => {
  const listarCidRepsository = new ListarCidRepsository();
  const listarCIDController = new ListarCIDController(listarCidRepsository);
  return new LogControllerDecorator(listarCIDController);
};
