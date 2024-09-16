import { Router } from "express";
import { adaptRoute } from "../../adapters/express-route-adapter";
import { makeMudarStatusCartaoAfastadoController } from "../../factories/mudar-status-cartao-afastado";

const route = (router: Router): void => {
  router.put("/cartao/desligado/mudar", adaptRoute(makeMudarStatusCartaoAfastadoController()));
};

export default route;
