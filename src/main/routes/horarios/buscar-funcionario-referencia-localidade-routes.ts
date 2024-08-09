import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeBuscarFuncionarioReferenciaLocalidadeController } from "../../factories/buscar-funcionario-referencia-localidade";

const route = (router: Router): void => {
  router.get("/funcionarios/referencia", adaptRoute(makeBuscarFuncionarioReferenciaLocalidadeController()));
};

export default route;
