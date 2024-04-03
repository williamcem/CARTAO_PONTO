import { HorariosController } from "../../presentation/controllers/horarios/horarios";
import { DbAddHorarios } from "../../data/usecase/add-horarios/db-add-horarios";
import { HorariosPostgresRepository } from "../../infra/db/postgresdb/horarios-repository/horarios";
import { LogControllerDecorator } from "../decorators/log";
import { Controller } from "../../presentation/protocols";

export const makeHorariosController = (): Controller => {
  const horraiosPostgresRepository = new HorariosPostgresRepository();
  const dbAddHorarios = new DbAddHorarios(horraiosPostgresRepository);
  const horariosController = new HorariosController(dbAddHorarios);
  return new LogControllerDecorator(horariosController);
};
