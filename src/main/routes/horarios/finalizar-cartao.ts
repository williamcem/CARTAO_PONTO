import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeFinalizarCartaoController } from "../../factories/finalizar-cartao";

const route = (router: Router): void => {
  router.put("/cartao/finalizar", adaptRoute(makeFinalizarCartaoController()));
};

export default route;
