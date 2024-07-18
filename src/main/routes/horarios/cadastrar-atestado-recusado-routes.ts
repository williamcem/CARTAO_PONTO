import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeCadastrarAtestadoRecusadoController } from "../../factories/cadastrar-atestado-recusado";

const route = (router: Router): void => {
  router.put("/cadastrar-atestado-recusado", adaptRoute(makeCadastrarAtestadoRecusadoController()));
};

export default route;
