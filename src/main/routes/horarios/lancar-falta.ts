import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeLancarFaltaController } from "../../factories/lancar-falta";

const route = (router: Router): void => {
  router.post("/lancar-falta", adaptRoute(makeLancarFaltaController()));
};

export default route;
