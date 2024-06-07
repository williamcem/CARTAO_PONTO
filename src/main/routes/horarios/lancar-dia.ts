import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeLancarDiaController } from "../../factories/lancar-dia";

const route = (router: Router): void => {
  router.post("/lancar-dia", adaptRoute(makeLancarDiaController()));
};

export default route;
