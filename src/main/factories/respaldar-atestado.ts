import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { RespaldarController } from "../../presentation/controllers/respaldar-atestado/respaldar-atestado";
import { RespaldarAtestadoPostgresRepository } from "@infra/db/postgresdb/respaldar-atestado/respaldar-atestado";
import { SolucaoEventoRepository } from "@infra/db/postgresdb/solucao-eventos-repository/solucao-eventos-repository";

export const makeRespaldarAtestadoController = (): Controller => {
  const respaldarAtestadoPostgresRepository = new RespaldarAtestadoPostgresRepository();
  const respaldarController = new RespaldarController(respaldarAtestadoPostgresRepository, new SolucaoEventoRepository());
  return new LogControllerDecorator(respaldarController);
};
