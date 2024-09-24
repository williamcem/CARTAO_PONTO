import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { BuscarFuncionarioReferenciaLocalidadeAgrupadaController } from "../../presentation/controllers/buscar-funcionarios-referencia-localidade/buscar-funcionarios-referencia-localidade";
import { BuscarFuncionarioReferenciaLocalidadePostgresRepository } from "@infra/db/postgresdb/buscar-funcionario-referencia-localidade/buscar-funcionario-referencia-localidade";
import { BuscarTodosPostgresRepository } from "@infra/db/postgresdb/buscar-todos-funcionarios.ts/buscas-todos-repository";
import { FinalizarCartaoController } from "../../presentation/controllers/finalizar-cartao/finalizar-cartao";
import { FinalizarCartaoPostgresRepository } from "@infra/db/postgresdb/finalizar-cartao/finalizar-cartao";
import { GetFuncionarioImpressaoCalculoController } from "../../presentation/controllers/get-funcionário-impressao-calculo/procurar-funcionário-impressao-calculo";
import { FuncionarioImpressaoCalculoPostgresRepository } from "@infra/db/postgresdb/get-funcionario-impressao-calculo/get-funcionario-impressao-calculo";
import { RecalcularTurnoController } from "../../presentation/controllers/recalcular-turno/recalcular-turno";
import { RecalcularTurnoPostgresRepository } from "@infra/db/postgresdb/recalcular-turno/recalcular-turno";

export const makeBuscarFuncionarioReferenciaLocalidadeController = (): Controller => {
  const buscarFuncionarioReferenciaLocalidadePostgresRepository = new BuscarFuncionarioReferenciaLocalidadePostgresRepository();
  const buscarTodosPostgresRepository = new BuscarTodosPostgresRepository();
  const funcionarioImpressaoCalculoPostgresRepository = new FuncionarioImpressaoCalculoPostgresRepository();
  const recalcularTurnoPostgresRepository = new RecalcularTurnoPostgresRepository();
  const recalcularTurnoController = new RecalcularTurnoController(recalcularTurnoPostgresRepository);
  const getFuncionarioImpressaoCalculoController = new GetFuncionarioImpressaoCalculoController(
    funcionarioImpressaoCalculoPostgresRepository,
    recalcularTurnoController,
  );
  const finalizarCartaoPostgresRepository = new FinalizarCartaoPostgresRepository();
  const finalizarCartaoController = new FinalizarCartaoController(
    finalizarCartaoPostgresRepository,
    getFuncionarioImpressaoCalculoController,
  );

  const buscarFuncionarioReferenciaLocalidadeAgrupadaController = new BuscarFuncionarioReferenciaLocalidadeAgrupadaController(
    buscarFuncionarioReferenciaLocalidadePostgresRepository,
    buscarTodosPostgresRepository,
    finalizarCartaoController,
    finalizarCartaoPostgresRepository,
    getFuncionarioImpressaoCalculoController,
  );
  return new LogControllerDecorator(buscarFuncionarioReferenciaLocalidadeAgrupadaController);
};
