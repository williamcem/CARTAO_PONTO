import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarAtestadosController } from "../../factories/listar-atestados";

const route = (router: Router): void => {
  router.post("/listar-atestado", adaptRoute(makeListarAtestadosController()));
};

export default route;
