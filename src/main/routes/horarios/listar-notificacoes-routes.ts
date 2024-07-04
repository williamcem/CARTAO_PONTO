import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeListarNotificacoesController } from "../../factories/listar-notificacoes";

const route = (router: Router): void => {
  router.get("/notificacoes", adaptRoute(makeListarNotificacoesController()));
};

export default route;
