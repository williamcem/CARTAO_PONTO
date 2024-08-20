import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeAlteracaoTurnoController } from "../../factories/buscar-alteracao-turno";

const route = (router: Router): void => {
  router.get("/turno/alteracao", adaptRoute(makeAlteracaoTurnoController()));
};

export default route;
