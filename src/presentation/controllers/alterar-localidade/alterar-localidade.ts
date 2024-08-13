import { AlterarLocalidadePostgresRepository } from "@infra/db/postgresdb/alterar-localidade/alterar-localidade";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./alterar-localidade-protocols";
import moment from "moment";

export class AlterarLocalidadeController implements Controller {
  constructor(private readonly alterarLocalidadePostgresRepository: AlterarLocalidadePostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { funcionarioId, localidadeId, turnoId, inicioVigencia, fimVigencia } = httpRequest?.body;

      if (!funcionarioId) return badRequest(new FuncionarioParamError("Falta funcionário!"));
      if (!inicioVigencia) return badRequest(new FuncionarioParamError("Falta inicio vigência!"));
      if (!fimVigencia) return badRequest(new FuncionarioParamError("Falta fim vigência!"));

      if (!moment(inicioVigencia).isValid()) return badRequest(new FuncionarioParamError("Início vigência não é válido!"));
      if (!moment(fimVigencia).isValid()) return badRequest(new FuncionarioParamError("Fim vigência não é válido!"));

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

      const dias = await this.alterarLocalidadePostgresRepository.findManyDias({
        fim: new Date(fimVigencia),
        inicio: new Date(inicioVigencia),
        funcionarioId: funcionario.id,
      });

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
