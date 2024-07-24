import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeCIDController } from "../../factories/listar-CID";

const route = (router: Router): void => {
  router.get("/status-lancamento", adaptRoute(makeCIDController()));
};

export default route;
