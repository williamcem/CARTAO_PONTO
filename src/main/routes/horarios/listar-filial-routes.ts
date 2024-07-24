import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarFilialController } from "../../factories/listar-filial";

const route = (router: Router): void => {
  router.get("/listar-funcionario-localidade", adaptRoute(makeListarFilialController()));
};

export default route;
