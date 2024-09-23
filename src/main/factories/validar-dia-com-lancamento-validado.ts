import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { ValidarDiaComLancamentoValidadoPostgresRepository } from "@infra/db/postgresdb/validar-dia-com-lancamento-validado/validar-dia-com-lancamento-validado";
import { ValidarDiaComLancamentoValidadoController } from "../../presentation/controllers/validar-dia-com-lancamento-validado/validar-dia-com-lancamento-validado";

export const makeValidarDiaComLancamentoValidadoController = (): Controller => {
  const validarDiaComLancamentoValidadoPostgresRepository = new ValidarDiaComLancamentoValidadoPostgresRepository();
  const mudarStatusCartaoAfastadoController = new ValidarDiaComLancamentoValidadoController(
    validarDiaComLancamentoValidadoPostgresRepository,
  );

  return new LogControllerDecorator(mudarStatusCartaoAfastadoController);
};
