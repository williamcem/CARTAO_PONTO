import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarAtestadosController } from "../../factories/listar-atestados-não-analisados";

const route = (router: Router): void => {
  router.get("/listar-atestado", adaptRoute(makeListarAtestadosController()));
};

export default route;
