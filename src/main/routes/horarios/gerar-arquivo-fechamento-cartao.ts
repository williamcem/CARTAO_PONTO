import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeGerarArquivoFechamentoCartaoController } from "../../factories/gerar-arquivo-fechamento-cartao";

const route = (router: Router): void => {
  router.get("/exportacao/cartao/fechado", adaptRoute(makeGerarArquivoFechamentoCartaoController()));
};

export default route;
