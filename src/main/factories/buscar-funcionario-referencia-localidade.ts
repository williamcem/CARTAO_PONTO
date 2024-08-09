import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { BuscarFuncionarioReferenciaLocalidadeAgrupadaController } from "../../presentation/controllers/buscar-funcionarios-referencia-localidade/buscar-funcionarios-referencia-localidade";
import { BuscarFuncionarioReferenciaLocalidadePostgresRepository } from "@infra/db/postgresdb/buscar-funcionario-referencia-localidade/buscar-funcionario-referencia-localidade";

export const makeBuscarFuncionarioReferenciaLocalidadeController = (): Controller => {
  const buscarFuncionarioReferenciaLocalidadePostgresRepository = new BuscarFuncionarioReferenciaLocalidadePostgresRepository();
  const buscarFuncionarioReferenciaLocalidadeAgrupadaController = new BuscarFuncionarioReferenciaLocalidadeAgrupadaController(
    buscarFuncionarioReferenciaLocalidadePostgresRepository,
  );
  return new LogControllerDecorator(buscarFuncionarioReferenciaLocalidadeAgrupadaController);
};
