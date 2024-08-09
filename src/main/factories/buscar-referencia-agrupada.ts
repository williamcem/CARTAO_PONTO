import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { BuscarReferenciaAgrupadaController } from "../../presentation/controllers/buscar-referencia-agrupada/buscar-referencia-agrupada";
import { BuscarReferenciaAgrupadaPostgresRepository } from "@infra/db/postgresdb/buscar-referencia-agrupada/buscar-referencia-agrupada";

export const makeBuscarReferenciaAgrupadaController = (): Controller => {
  const buscarReferenciaAgrupadaPostgresRepository = new BuscarReferenciaAgrupadaPostgresRepository();
  const buscarReferenciaAgrupadaController = new BuscarReferenciaAgrupadaController(buscarReferenciaAgrupadaPostgresRepository);
  return new LogControllerDecorator(buscarReferenciaAgrupadaController);
};
