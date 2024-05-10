import { HorariosMemoryRepository } from "../../infra/db/postgresdb/horarios-memory-repository/horarios-memory-repository";
import { HorariosMemoryController } from "../../presentation/controllers/horarios-memory/HorariosMemoriaController";
import { LogControllerDecorator } from "../decorators/log";
import { Controller } from "../../presentation/protocols";

export const makeHorariosMemoryController = (): Controller => {
  const horariosRepository = new HorariosMemoryRepository();
  const horariosMemoryController = new HorariosMemoryController(horariosRepository);
  return new LogControllerDecorator(horariosMemoryController);
};
