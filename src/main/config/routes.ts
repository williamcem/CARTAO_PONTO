import { Express, Router } from "express";

import todosfuncionarios from "../routes/horarios/buscar-todos-funcionarios-routes";
import cadastrarAtestado from "../routes/horarios/cadastrar-atestado";
import eventos from "../routes/horarios/criar-eventos";
import deletecartao from "../routes/horarios/delete-cartao-routes";
import deletar from "../routes/horarios/delete-dia-horarios-routes";
import exportarDemitidoslancamentos from "../routes/horarios/export-demitidos-routes";
import exportarlancamentos from "../routes/horarios/export-geral-routes";
import funcionario from "../routes/horarios/get-funcionario-routes";
import lancarDia from "../routes/horarios/lancar-dia-routes";
import listarAtestado from "../routes/horarios/listar-atestados-routes";
import descricacao from "../routes/horarios/listar-descricacao-routes";
import ocorrenciageral from "../routes/horarios/listar-ocorrencia-geral-routes";
import ocorrencia from "../routes/horarios/listar-ocorrencia-routes";
import tipoevento from "../routes/horarios/listar-solucoes-eventos-routes";
import procurarLocalidade from "../routes/horarios/procurar-localidade-routes";
import solucaoeventos from "../routes/horarios/solucao-eventos";
import upload from "../routes/horarios/upload-routes-routes";

export const setupRoutes = (app: Express): void => {
  const router = Router();
  app.use("/api", router);
  upload(router);
  deletar(router);
  funcionario(router);
  todosfuncionarios(router);
  lancarDia(router);
  procurarLocalidade(router);
  deletecartao(router);
  ocorrencia(router);
  exportarlancamentos(router);
  exportarDemitidoslancamentos(router);
  descricacao(router);
  cadastrarAtestado(router);
  listarAtestado(router);
  eventos(router);
  solucaoeventos(router);
  tipoevento(router);
  ocorrenciageral(router);
};
