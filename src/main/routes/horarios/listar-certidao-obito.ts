import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarCertidaoObitoController } from "../../factories/listar-certidao-obito";

const route = (router: Router): void => {
  router.get("/listar-certidao-obito", adaptRoute(makeListarCertidaoObitoController()));
};

export default route;
