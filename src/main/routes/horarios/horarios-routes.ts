import { Router } from "express";
import { makeHorariosController } from "../../factories/horarios";
import { adaptRoute } from "../../adapters/express-route-adapter";

// Rota para adicionar dados
const route = (router: Router): void => {
  router.put("/semana", adaptRoute(makeHorariosController()));
};

export default route;
