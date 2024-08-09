import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarTurnosController } from "../../factories/listar-turnos";

const route = (router: Router): void => {
  router.get("/turnos", adaptRoute(makeListarTurnosController()));
};

export default route;
