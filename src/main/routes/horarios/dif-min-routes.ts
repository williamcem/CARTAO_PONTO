import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeDifMinController } from "../../factories/dif-min-factore";

const route = (router: Router): void => {
  router.post("/falta", adaptRoute(makeDifMinController()));
};

export default route;
