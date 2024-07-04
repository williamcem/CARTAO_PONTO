import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeDescricacoController } from "../../factories/listar-descricacao";

const route = (router: Router): void => {
  router.get("/descricacao", adaptRoute(makeDescricacoController()));
};

export default route;