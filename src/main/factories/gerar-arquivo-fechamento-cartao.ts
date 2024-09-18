import { GerarArquivoFechamentoCartaoPostgresRepository } from "@infra/db/postgresdb/gerar-arquivo-fechamento-cartao/gerar-arquivo-fechamento-cartao";
import { GerarArquivoFechamentoCartaoController } from "../../presentation/controllers/gerar-arquivo-fechamento-cartao/gerar-arquivo-fechamento-cartao";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeGerarArquivoFechamentoCartaoController = (): Controller => {
  const gerarArquivoFechamentoCartaoPostgresRepository = new GerarArquivoFechamentoCartaoPostgresRepository();
  const mudarStatusCartaoAfastadoController = new GerarArquivoFechamentoCartaoController(
    gerarArquivoFechamentoCartaoPostgresRepository,
  );

  return new LogControllerDecorator(mudarStatusCartaoAfastadoController);
};
