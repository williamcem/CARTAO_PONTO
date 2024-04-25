import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeSaldoController } from "../../factories/saldo-factore";

const route = (router: Router): void => {
  router.post("/saldo", adaptRoute(makeSaldoController()));
};

export default route;
