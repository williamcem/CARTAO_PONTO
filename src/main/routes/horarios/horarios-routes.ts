import { Router } from "express";
import { makeHorariosController } from "../../factories/horarios";
import { adaptRoute } from "../../adapters/express-route-adapter";

export default (router: Router): void => {
  router.post("/semana", adaptRoute(makeHorariosController()));
  console.log(router.stack)
};
