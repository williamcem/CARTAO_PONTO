import { Express, Router } from "express";

import todosfuncionarios from "../routes/horarios/buscar-todos-funcionarios";
import deletecartao from "../routes/horarios/delete-cartao-routes";
import deletar from "../routes/horarios/delete-routes";
import falta from "../routes/horarios/dif-min-routes";
import funcionario from "../routes/horarios/get-funcionario";
import horarios from "../routes/horarios/horarios-routes";
import horariosMemory from "../routes/horarios/horraio-memory-routes";
import lancarDia from "../routes/horarios/lancar-dia";
import lancarfalta from "../routes/horarios/lancar-falta";
import lista from "../routes/horarios/lista-routes";
import ocorrencia from "../routes/horarios/listar-ocorrencia-routes";
import statuslancamento from "../routes/horarios/listar-status-lancamento-routes";
import procurarLocalidade from "../routes/horarios/procurar-localidade";
import saldo from "../routes/horarios/saldo-routes";
import upload from "../routes/horarios/upload-routes";

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
  lancarfalta(router);
  deletecartao(router);
  ocorrencia(router);
  statuslancamento(router);
};
