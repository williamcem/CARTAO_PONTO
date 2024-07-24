import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeLogarController } from "../../factories/criar-usuario";

const route = (router: Router): void => {
  router.post("/logar", adaptRoute(makeLogarController()));
};

export default route;
