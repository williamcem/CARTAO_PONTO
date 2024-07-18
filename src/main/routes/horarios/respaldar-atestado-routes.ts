import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeRespaldarAtestadoController } from "../../factories/respaldar-atestado";

const route = (router: Router): void => {
  router.put("/atestado/respaldar", adaptRoute(makeRespaldarAtestadoController()));
};

export default route;
