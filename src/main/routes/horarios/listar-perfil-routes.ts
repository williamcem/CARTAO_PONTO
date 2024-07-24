import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarPerfilController } from "../../factories/listar-perfil";

const route = (router: Router): void => {
  router.get("/listar-perfil", adaptRoute(makeListarPerfilController()));
};

export default route;
