import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeCriarEventoOnibusController } from "../../factories/criar-evento-onibus";

const route = (router: Router): void => {
  router.post("/evento-onibus", adaptRoute(makeCriarEventoOnibusController()));
};

export default route;
