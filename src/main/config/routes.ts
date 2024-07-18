import { Express, Router } from "express";

import todosfuncionarios from "../routes/horarios/buscar-todos-funcionarios-routes";
import cadastrarAtestado from "../routes/horarios/cadastrar-atestado";
import atestadoAprovado from "../routes/horarios/cadastrar-atestado-aprovado-routes";
import atestadoRecusado from "../routes/horarios/cadastrar-atestado-recusado-routes";
import calcularresumo from "../routes/horarios/calcular-resumo-routes";
import confirmarLancaDia from "../routes/horarios/confirmar-lanca-dia-routes";
import eventos from "../routes/horarios/criar-eventos";
import deletecartao from "../routes/horarios/delete-cartao-routes";
import deletar from "../routes/horarios/delete-dia-horarios-routes";
import exportarDemitidoslancamentos from "../routes/horarios/export-demitidos-routes";
import exportarlancamentos from "../routes/horarios/export-geral-routes";
import funcionario from "../routes/horarios/get-funcionario-routes";
import lancarDia from "../routes/horarios/lancar-dia-routes";
import listarAcompanhante from "../routes/horarios/listar-acompanhante-routes";
import listarAtestado from "../routes/horarios/listar-atestados-não-tratados";
import descricacao from "../routes/horarios/listar-descricacao-routes";
import listarDocumento from "../routes/horarios/listar-documento-routes";
import listarFilial from "../routes/horarios/listar-filial-routes";
import ocorrenciageral from "../routes/horarios/listar-ocorrencia-geral-routes";
import ocorrencia from "../routes/horarios/listar-ocorrencia-routes";
import listarOcupacao from "../routes/horarios/listar-ocupacao-routes";
import tipoevento from "../routes/horarios/listar-solucoes-eventos-routes";
import listarStatusDocumento from "../routes/horarios/listar-status-documento-routes";
import listarSolucaoAtestado from "../routes/horarios/listar-status-solucao-atestado";
import listarTodosAtestado from "../routes/horarios/listar-todos-atestados-routes";
import procurarLocalidade from "../routes/horarios/procurar-localidade-routes";
import retornarsolucao from "../routes/horarios/retornar-solucao-routes";
import solucaoeventos from "../routes/horarios/solucao-eventos-routes";
import upload from "../routes/horarios/upload-routes-routes";
import confirmarLancaDia from "../routes/horarios/confirmar-lanca-dia-routes";
import respaldarAtestado from "../routes/horarios/respaldar-atestado-routes";

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
  listarAcompanhante(router);
  listarDocumento(router);
  listarOcupacao(router);
  listarStatusDocumento(router);
  listarSolucaoAtestado(router);
  atestadoAprovado(router);
  atestadoRecusado(router);
  listarTodosAtestado(router);
  respaldarAtestado(router);
};
