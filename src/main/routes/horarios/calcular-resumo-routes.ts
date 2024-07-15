import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeCalcularresumoController } from "../../factories/calcular-resumo";

const route = (router: Router): void => {
  router.get("/calcular-resumo", adaptRoute(makeCalcularresumoController()));
};

export default route;
