import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeDescricacoController } from "../../factories/listar-descricaco";

const route = (router: Router): void => {
  router.get("/descricaco", adaptRoute(makeDescricacoController()));
};

export default route;
