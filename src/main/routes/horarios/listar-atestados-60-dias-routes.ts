import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarAtestados60DiasController } from "../../factories/listar-atestados-60-dias";

const route = (router: Router): void => {
  router.get("/listar-todosatestado-60dias", adaptRoute(makeListarAtestados60DiasController()));
};

export default route;
