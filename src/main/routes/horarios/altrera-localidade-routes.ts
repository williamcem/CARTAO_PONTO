import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeAlterarLocalidadeontroller } from "../../factories/alterar-localidade";

const route = (router: Router): void => {
  router.put("/funcionario", adaptRoute(makeAlterarLocalidadeontroller()));
};

export default route;
