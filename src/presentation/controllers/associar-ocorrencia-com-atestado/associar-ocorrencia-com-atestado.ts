import { AssociarOcorrenciaComAtestadoPostgresRepository } from "@infra/db/postgresdb/associar-ocorrencia-com-atestado/associar-ocorrencia-com-atestado";
import { badRequestNovo, notFoundNovo, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./associar-ocorrencia-com-atestado-protocols";

export class AssociarOcorrenciaComAtestadoController implements Controller {
  constructor(
    private readonly associarOcorrenciaComAtestadoPostgresRepository: AssociarOcorrenciaComAtestadoPostgresRepository,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { ocorrenciaId, atestadoId }: { ocorrenciaId: number; atestadoId: number } = httpRequest.body;

      if (!ocorrenciaId) return badRequestNovo({ message: "Falta sequência da ocorrência!" });
      if (!atestadoId) return badRequestNovo({ message: "Falta sequência da atestado!" });

      const atestado = await this.associarOcorrenciaComAtestadoPostgresRepository.findFisrtAtestado({ id: Number(atestadoId) });

      if (!atestado) return notFoundNovo({ message: "Atestado não existe!" });

      const ocorrencia = await this.associarOcorrenciaComAtestadoPostgresRepository.findFisrtOcorrencia({
        id: Number(ocorrenciaId),
      });

      if (!ocorrencia) return notFoundNovo({ message: "Ocorrência não existe!" });

      if (atestado.funcionarioId !== ocorrencia.funcionarioId)
        return badRequestNovo({ message: "O atestado não pertence a mesma pessoa da ocorrência!" });

      const salvo = this.associarOcorrenciaComAtestadoPostgresRepository.updateOcorrencia({
        atestadoId: atestado.id,
        id: ocorrencia.id,
      });
      if (!salvo) return serverError();

      return ok({ message: salvo });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
