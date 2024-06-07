import { Express, Router } from "express";

import todosfuncionarios from "../routes/horarios/buscar-todos-funcionarios";
import deletecartao from "../routes/horarios/delete-cartao-routes";
import deletar from "../routes/horarios/delete-dia-horarios-routes";
import exportarlancamentos from "../routes/horarios/export-routes";
import funcionario from "../routes/horarios/get-funcionario";
import lancarDia from "../routes/horarios/lancar-dia";
import lancarfalta from "../routes/horarios/lancar-falta";
import ocorrencia from "../routes/horarios/listar-ocorrencia-routes";
import statuslancamento from "../routes/horarios/listar-status-lancamento-routes";
import procurarLocalidade from "../routes/horarios/procurar-localidade";
import upload from "../routes/horarios/upload-routes";

export const setupRoutes = (app: Express): void => {
  const router = Router();
  app.use("/api", router);
  upload(router);
  deletar(router);
  funcionario(router);
  todosfuncionarios(router);
  lancarDia(router);
  procurarLocalidade(router);
  lancarfalta(router);
  deletecartao(router);
  ocorrencia(router);
  statuslancamento(router);
  exportarlancamentos(router);
};
