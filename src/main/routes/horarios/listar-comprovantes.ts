import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarComprovantesController } from "../../factories/listar-tipos-comprovantes";

const route = (router: Router): void => {
  router.get("/listar-comprovantes", adaptRoute(makeListarComprovantesController()));
};

export default route;
