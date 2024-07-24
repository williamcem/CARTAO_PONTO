import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarDocumentoController } from "../../factories/listar-documento";

const route = (router: Router): void => {
  router.get("/listar-documento", adaptRoute(makeListarDocumentoController()));
};

export default route;
