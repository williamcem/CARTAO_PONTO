import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeBuscarCidController } from "../../factories/buscar-cid";

const route = (router: Router): void => {
  router.get("/cid", adaptRoute(makeBuscarCidController()));
};

export default route;
