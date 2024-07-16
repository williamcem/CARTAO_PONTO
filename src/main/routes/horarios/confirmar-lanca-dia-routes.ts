import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeConfirmarLancarDiaController } from "../../factories/confirmar-lancar-dia";

const route = (router: Router): void => {
  router.put("/confirmar-lanca-dia", adaptRoute(makeConfirmarLancarDiaController()));
};

export default route;
