import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeBuscarAtestadoController } from "../../factories/buscar-atestado";

const route = (router: Router): void => {
  router.get("/atestado", adaptRoute(makeBuscarAtestadoController()));
};

export default route;
