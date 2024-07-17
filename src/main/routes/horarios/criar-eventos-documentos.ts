import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import {  } from "../../factories/criar-eventos";

const route = (router: Router): void => {
  router.post("/eventos-documentos", adaptRoute(()));
};

export default route;
