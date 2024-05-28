import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeProcurarLocalidadeController } from "../../factories/procurar-localidade";

const route = (router: Router): void => {
  router.get("/localidades", adaptRoute(makeProcurarLocalidadeController()));
};

export default route;
