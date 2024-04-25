import { ListaPostgresRepository } from "../../infra/db/postgresdb/lista-repository/lista-horarios";
import { LogControllerDecorator } from "../decorators/log";
import { Controller } from "../../presentation/protocols";
import { ListaHorariosController } from "../../presentation/controllers/lista/lista-horarios";

export const makeListaHorarioController = (): Controller => {
  const listaPostgresRepository = new ListaPostgresRepository();
  const listacontroller = new ListaHorariosController(listaPostgresRepository);
  return new LogControllerDecorator(listacontroller);
};
