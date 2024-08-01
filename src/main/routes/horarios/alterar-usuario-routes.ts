import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeAlterarUsuarioController } from "../../factories/alterar-usuario";

const route = (router: Router): void => {
  router.put("/usuario", adaptRoute(makeAlterarUsuarioController()));
};

export default route;
