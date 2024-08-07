import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeLogarController } from "../../factories/logar";

const route = (router: Router): void => {
  router.post("/usuario/logar", adaptRoute(makeLogarController()));
};

export default route;
