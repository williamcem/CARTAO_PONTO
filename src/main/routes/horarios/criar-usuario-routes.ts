import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeCriarUsuarioController } from "../../factories/criar-usuario";

const route = (router: Router): void => {
  router.post("/usuario", adaptRoute(makeCriarUsuarioController()));
};

export default route;
