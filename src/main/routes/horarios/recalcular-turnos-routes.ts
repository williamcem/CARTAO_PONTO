import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeRecalcularTurnoController } from "../../factories/recalcular-turno";

const route = (router: Router): void => {
  router.patch("/turno/recalcular", adaptRoute(makeRecalcularTurnoController()));
};

export default route;
