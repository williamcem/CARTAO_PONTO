import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeCadastrarAtestadosController } from "../../factories/cadastrar-atestado";

const route = (router: Router): void => {
  router.post("/cadastrar-atestado", adaptRoute(makeCadastrarAtestadosController()));
};

export default route;
