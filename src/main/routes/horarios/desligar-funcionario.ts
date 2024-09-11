import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeDesligarFuncionarioController } from "../../factories/desligar-funcionario";

const route = (router: Router): void => {
  router.put("/funcionario/desligar", adaptRoute(makeDesligarFuncionarioController()));
};

export default route;
