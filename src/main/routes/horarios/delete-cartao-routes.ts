import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeDeleteCartaoController } from "../../factories/delete-cartao";

// Rota para deletar dados
const route = (router: Router): void => {
  router.delete("/deletar-cartao", adaptRoute(makeDeleteCartaoController()));
};

export default route;
