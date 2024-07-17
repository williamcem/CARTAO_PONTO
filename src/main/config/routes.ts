import { Express, Router } from "express";

import todosfuncionarios from "../routes/horarios/buscar-todos-funcionarios-routes";
import cadastrarAtestado from "../routes/horarios/cadastrar-atestado";
import calcularresumo from "../routes/horarios/calcular-resumo-routes";
import eventos from "../routes/horarios/criar-eventos";
import deletecartao from "../routes/horarios/delete-cartao-routes";
import deletar from "../routes/horarios/delete-dia-horarios-routes";
import exportarDemitidoslancamentos from "../routes/horarios/export-demitidos-routes";
import exportarlancamentos from "../routes/horarios/export-geral-routes";
import funcionario from "../routes/horarios/get-funcionario-routes";
import lancarDia from "../routes/horarios/lancar-dia-routes";
import listarAtestado from "../routes/horarios/listar-atestados-routes";
import descricacao from "../routes/horarios/listar-descricacao-routes";
import listarFilial from "../routes/horarios/listar-filial-routes";
import ocorrenciageral from "../routes/horarios/listar-ocorrencia-geral-routes";
import ocorrencia from "../routes/horarios/listar-ocorrencia-routes";
import tipoevento from "../routes/horarios/listar-solucoes-eventos-routes";
import procurarLocalidade from "../routes/horarios/procurar-localidade-routes";
import retornarsolucao from "../routes/horarios/retornar-solucao-routes";
import solucaoeventos from "../routes/horarios/solucao-eventos-routes";
import upload from "../routes/horarios/upload-routes-routes";
import confirmarLancaDia from "../routes/horarios/confirmar-lanca-dia-routes";

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
  calcularresumo(router);
  retornarsolucao(router);
  listarFilial(router);
  confirmarLancaDia(router);
};
