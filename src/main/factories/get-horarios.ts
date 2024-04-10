import { LogControllerDecorator } from "../decorators/log";
import { Controller } from "../../presentation/protocols";
import { getHorariosController } from "../../presentation/controllers/horarios/getHorarios";

export const makeListaHorarioController = (): Controller => {
  const horariosController = new getHorariosController();
  return new LogControllerDecorator(horariosController);
};
