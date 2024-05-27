import { Express, Router } from "express";

import todosfuncionarios from "../routes/horarios/buscar-todos-funcionarios";
import deletar from "../routes/horarios/delete-routes";
import falta from "../routes/horarios/dif-min-routes";
import funcionario from "../routes/horarios/get-funcionario";
import horarios from "../routes/horarios/horarios-routes";
import horariosMemory from "../routes/horarios/horraio-memory-routes";
import lista from "../routes/horarios/lista-routes";
import saldo from "../routes/horarios/saldo-routes";
import upload from "../routes/horarios/upload-routes";
import lancarDia from "../routes/horarios/lancar-dia";
import procurarLocalidade from "../routes/horarios/procurar-localidade";
/* import uploadfuncionario from "../routes/horarios/upload-routes";
import uploadcartao from "../routes/horarios/upload-routes"; */

export const setupRoutes = (app: Express): void => {
  const router = Router();
  app.use("/api", router);
  horarios(router);
  lista(router);
  saldo(router);
  upload(router);
  deletar(router);
  falta(router);
  horariosMemory(router);
  funcionario(router);
  todosfuncionarios(router);
  lancarDia(router);
  procurarLocalidade(router);
};
