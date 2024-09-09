import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeLancarDiaNovoController } from "../../factories/lancar-dia-novo";

const route = (router: Router): void => {
  router.post("/lancar-dia-novo", adaptRoute(makeLancarDiaNovoController()));
};

export default route;
