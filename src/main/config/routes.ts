import { Express, Router } from "express";

import AlterarUsuario from "../routes/horarios/alterar-usuario-routes";
import todosfuncionarios from "../routes/horarios/buscar-todos-funcionarios-routes";
import cadastrarAtestado from "../routes/horarios/cadastrar-atestado";
import calcularresumo from "../routes/horarios/calcular-resumo-routes";
import confirmarLancaDia from "../routes/horarios/confirmar-lanca-dia-routes";
import eventos from "../routes/horarios/criar-eventos";
import deletecartao from "../routes/horarios/delete-cartao-routes";
import deletar from "../routes/horarios/delete-dia-horarios-routes";
import exportarDemitidoslancamentos from "../routes/horarios/export-demitidos-routes";
import exportarlancamentos from "../routes/horarios/export-geral-routes";
import funcionarioAtestado from "../routes/horarios/funcionario-atestado";
import funcionarioImpressaoCalculo from "../routes/horarios/get-funcionario-impressao-calculo-routes";
import funcionarioImpressao from "../routes/horarios/get-funcionario-impressao-routes";
import funcionario from "../routes/horarios/get-funcionario-routes";
import lancarDia from "../routes/horarios/lancar-dia-routes";
import lancarDiaNovo from "../routes/horarios/lancar-dia-novo-routes";
import listarAcompanhante from "../routes/horarios/listar-acompanhante-routes";
import listarAtestados60Dias from "../routes/horarios/listar-atestados-60-dias-routes";
import listarAtestado from "../routes/horarios/listar-atestados-não-tratados";
import listarCertidaoObito from "../routes/horarios/listar-certidao-obito";
import listarComprovantes from "../routes/horarios/listar-comprovantes";
import listarDocumento from "../routes/horarios/listar-documento-routes";
import listarFilial from "../routes/horarios/listar-filial-routes";
import ocorrenciageral from "../routes/horarios/listar-ocorrencia-geral-routes";
import geralSolucionadas from "../routes/horarios/listar-ocorrencia-geral-solucionada-routes";
import ocorrencia from "../routes/horarios/listar-ocorrencia-routes";
import ocorrenciaSolucionadas from "../routes/horarios/listar-ocorrencia-solucionadas-routes";
import listarOcupacao from "../routes/horarios/listar-ocupacao-routes";
import listarPerfil from "../routes/horarios/listar-perfil-routes";
import tipoevento from "../routes/horarios/listar-solucoes-eventos-routes";
import listarStatusDocumento from "../routes/horarios/listar-status-documento-routes";
import listarSolucaoAtestado from "../routes/horarios/listar-status-solucao-atestado";
import listarTodosAtestado from "../routes/horarios/listar-todos-atestados-routes";
import listarUsuario from "../routes/horarios/listar-usuario-routes";
import procurarLocalidade from "../routes/horarios/procurar-localidade-routes";
import respaldarAtestado from "../routes/horarios/respaldar-atestado-routes";
import retornarsolucao from "../routes/horarios/retornar-solucao-routes";
import solucaoeventos from "../routes/horarios/solucao-eventos-routes";
import upload from "../routes/horarios/upload-routes-routes";
import criarUsuario from "../routes/horarios/criar-usuario-routes";
import login from "../routes/horarios/fazer-login-routes";
import alterarFuncionario from "../routes/horarios/altrera-localidade-routes";
import buscarAtestados from "../routes/horarios/buscar-atestados-routes";
import buscarReferenciaAgrupada from "../routes/horarios/buscar-referencia-agrupada-routes";
import buscarFuncionarioReferenciaLocalidade from "../routes/horarios/buscar-funcionario-referencia-localidade-routes";
import listarTurnos from "../routes/horarios/listar-turnos-routes";
import lancarFalta from "../routes/horarios/lancar-falta-routes";
import recalcularTurnos from "../routes/horarios/recalcular-turnos-routes";
import buscarAlteracaoTurno from "../routes/horarios/buscar-alteracao-turno";
import buscarCid from "../routes/horarios/buscar-cid";
import finalizarCartao from "../routes/horarios/finalizar-cartao";
import criarAgrupamentoLocalidade from "../routes/horarios/criar-agrupamento-localidade";
import excluirAgrupamentoLocalidade from "../routes/horarios/excluir-agrupamento-localidade";
import consultarAgrupamentoLocalidade from "../routes/horarios/consultar-agrupamento-localidade";
import associarOcorrenciaComAtestado from "../routes/horarios/associar-ocorrencia-com-atestado";
import desligarFuncionario from "../routes/horarios/desligar-funcionario";
import mudarStatusCartaoAfastado from "../routes/horarios/mudar-status-cartao-afastado";
import gerarArquivoFechamentoCartao from "../routes/horarios/gerar-arquivo-fechamento-cartao";
import buscarOcorrenciaMinutosAusencia from "../routes/horarios/buscar-ocorrencia-minuto-ausente";
import validarDiaComLancamentoValidado from "../routes/horarios/validar-dia-com-lancamento-validado";

export const setupRoutes = (app: Express): void => {
  const router = Router();
  app.use("/api", router);
  upload(router);
  deletar(router);
  funcionario(router);
  todosfuncionarios(router);
  lancarDia(router);
  lancarDiaNovo(router);
  procurarLocalidade(router);
  deletecartao(router);
  ocorrencia(router);
  exportarlancamentos(router);
  exportarDemitidoslancamentos(router);
  cadastrarAtestado(router);
  listarAtestado(router);
  eventos(router);
  solucaoeventos(router);
  tipoevento(router);
  ocorrenciageral(router);
  retornarsolucao(router);
  listarFilial(router);
  confirmarLancaDia(router);
  listarAcompanhante(router);
  listarDocumento(router);
  listarOcupacao(router);
  listarStatusDocumento(router);
  listarSolucaoAtestado(router);
  listarTodosAtestado(router);
  respaldarAtestado(router);
  listarAtestados60Dias(router);
  funcionarioAtestado(router);
  calcularresumo(router);
  listarComprovantes(router);
  criarUsuario(router);
  login(router);
  listarPerfil(router);
  listarCertidaoObito(router);
  funcionarioImpressao(router);
  funcionarioImpressaoCalculo(router);
  listarUsuario(router);
  AlterarUsuario(router);
  ocorrenciaSolucionadas(router);
  geralSolucionadas(router);
  alterarFuncionario(router);
  buscarAtestados(router);
  buscarReferenciaAgrupada(router);
  buscarFuncionarioReferenciaLocalidade(router);
  listarTurnos(router);
  lancarFalta(router);
  recalcularTurnos(router);
  buscarAlteracaoTurno(router);
  buscarCid(router);
  finalizarCartao(router);
  criarAgrupamentoLocalidade(router);
  excluirAgrupamentoLocalidade(router);
  consultarAgrupamentoLocalidade(router);
  associarOcorrenciaComAtestado(router);
  desligarFuncionario(router);
  mudarStatusCartaoAfastado(router);
  gerarArquivoFechamentoCartao(router);
  buscarOcorrenciaMinutosAusencia(router);
  validarDiaComLancamentoValidado(router);
};
