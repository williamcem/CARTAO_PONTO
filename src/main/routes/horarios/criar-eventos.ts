import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeCriarEventosController } from "../../factories/criar-eventos";

const route = (router: Router): void => {
  router.post("/eventos", adaptRoute(makeCriarEventosController()));
};

export default route;
