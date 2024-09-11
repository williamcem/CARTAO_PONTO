import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeExcluirAgrupamentoLocalidadeController } from "../../factories/excluir-agrupamento-localidade";

const route = (router: Router): void => {
  router.delete("/localidade/agrupamento/:id", adaptRoute(makeExcluirAgrupamentoLocalidadeController()));
};

export default route;
