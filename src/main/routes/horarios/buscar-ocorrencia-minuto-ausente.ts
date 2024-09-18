import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeGerarArquivoFechamentoCartaoController } from "../../factories/gerar-arquivo-fechamento-cartao";

const route = (router: Router): void => {
  router.get("/ocorrencia/minuto-ausente", adaptRoute(makeGerarArquivoFechamentoCartaoController()));
};

export default route;
