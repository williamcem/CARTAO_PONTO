import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeCriarAgrupamentoLocalidadeController } from "../../factories/criar-agrupamento-localidade";

const route = (router: Router): void => {
  router.put("/localidade/agrupamento", adaptRoute(makeCriarAgrupamentoLocalidadeController()));
};

export default route;
