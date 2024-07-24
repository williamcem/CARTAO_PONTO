import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeSolucaoEventosController } from "../../factories/solucao-eventos";

const route = (router: Router): void => {
  router.post("/solucao-eventos", adaptRoute(makeSolucaoEventosController()));
};

export default route;
