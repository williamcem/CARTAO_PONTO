import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeBuscarReferenciaAgrupadaController } from "../../factories/buscar-referencia-agrupada";

const route = (router: Router): void => {
  router.get("/referencia", adaptRoute(makeBuscarReferenciaAgrupadaController()));
};

export default route;
