import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarAcompanhanteController } from "../../factories/listar-acompanhante";

const route = (router: Router): void => {
  router.get("/listar-acompanhante", adaptRoute(makeListarAcompanhanteController()));
};

export default route;
