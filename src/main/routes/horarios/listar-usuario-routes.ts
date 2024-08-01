import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarUsuarioController } from "../../factories/listar-usuario";

const route = (router: Router): void => {
  router.get("/usuario", adaptRoute(makeListarUsuarioController()));
};

export default route;
