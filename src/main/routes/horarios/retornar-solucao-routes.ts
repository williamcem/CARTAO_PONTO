import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeRetornarSolucaoController } from "../../factories/retornar-solucao";

const route = (router: Router): void => {
  router.post("/retornar-solucao", adaptRoute(makeRetornarSolucaoController()));
};

export default route;
