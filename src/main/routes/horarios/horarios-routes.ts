import { Router } from "express";
import { makeHorariosController } from "../../factories/horarios";
import { adaptRoute } from "../../adapters/express-route-adapter";

const route = (router: Router): void => {
  router.post("/semana", adaptRoute(makeHorariosController()));
};

export default route;
