import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeBuscarCidController } from "../../factories/buscar-cid";

const route = (router: Router): void => {
  router.get("/status-lancamento", adaptRoute(makeBuscarCidController()));
};

export default route;
