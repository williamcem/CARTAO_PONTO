import { AlterarLocalidadePostgresRepository } from "@infra/db/postgresdb/alterar-localidade/alterar-localidade";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./alterar-localidade-protocols";

export class AlterarLocalidadeController implements Controller {
  constructor(private readonly alterarLocalidadePostgresRepository: AlterarLocalidadePostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { funcionarioId, localidadeId, turnoId } = httpRequest?.body;

      if (!funcionarioId) return badRequest(new FuncionarioParamError("Falta funcionário!"));

      const funcionario = await this.alterarLocalidadePostgresRepository.findFisrtFuncionario({ id: Number(funcionarioId) });

      if (!funcionario) return notFoundRequest(new FuncionarioParamError("Funcionário inexistente!"));

      if (localidadeId) {
        const localidade = await this.alterarLocalidadePostgresRepository.findFisrtLocalidade({
          id: localidadeId,
        });

        if (!localidade) return notFoundRequest(new FuncionarioParamError(`Localidade ${localidadeId} não existe!`));
      }

      if (turnoId) {
        const turno = await this.alterarLocalidadePostgresRepository.findFisrtTurno({
          id: turnoId,
        });

        if (!turno) return notFoundRequest(new FuncionarioParamError(`Turno ${localidadeId} não existe!`));
      }

      console.log({ id: funcionario.id, localidadeId, turnoId: turnoId ? Number(turnoId) : undefined });
      const saved = await this.alterarLocalidadePostgresRepository.updateFuncionario({
        id: funcionario.id,
        localidadeId,
        turnoId: turnoId ? Number(turnoId) : undefined,
      });

      if (!saved) serverError();

      return ok({ message: "Funcionário alterado com sucesso!" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
