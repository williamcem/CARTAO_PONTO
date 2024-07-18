import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarStatusDocumentoController } from "../../factories/listar-tipos-status-documento";

const route = (router: Router): void => {
  router.get("/listar-status-documento", adaptRoute(makeListarStatusDocumentoController()));
};

export default route;
