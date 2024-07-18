import { Router } from "express";

import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeCadastrarAtestadoAprovadoController } from "../../factories/cadastrar-atestado-aprovado";

const route = (router: Router): void => {
  router.put("/cadastrar-atestado-aprovado", adaptRoute(makeCadastrarAtestadoAprovadoController()));
};

export default route;
