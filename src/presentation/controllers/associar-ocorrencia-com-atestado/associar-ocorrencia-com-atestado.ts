import { AssociarOcorrenciaComAtestadoPostgresRepository } from "@infra/db/postgresdb/associar-ocorrencia-com-atestado/associar-ocorrencia-com-atestado";
import { badRequestNovo, notFoundNovo, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./associar-ocorrencia-com-atestado-protocols";

export class AssociarOcorrenciaComAtestadoController implements Controller {
  constructor(
    private readonly associarOcorrenciaComAtestadoPostgresRepository: AssociarOcorrenciaComAtestadoPostgresRepository,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { ocorrencias, atestadoId }: { ocorrencias: { id: number }[]; atestadoId: number } = httpRequest.body;

      if (!ocorrencias) return badRequestNovo({ message: "Falta ocorrência!" });

      if (!ocorrencias?.length) return badRequestNovo({ message: "Ocorrências é um array!" });

      for (const ocorrencia of ocorrencias) if (!ocorrencia?.id) return badRequestNovo({ message: "Falta id da ocorrência!" });

      if (!atestadoId) return badRequestNovo({ message: "Falta sequência da atestado!" });

      const atestado = await this.associarOcorrenciaComAtestadoPostgresRepository.findFisrtAtestado({ id: Number(atestadoId) });

      if (!atestado) return notFoundNovo({ message: "Atestado não existe!" });

      let ocorrenciasLocal: { id: number; funcionarioId: number }[] = [];

      for (const ocorrencia of ocorrencias) {
        const ocorrenciaLocal = await this.associarOcorrenciaComAtestadoPostgresRepository.findFisrtOcorrencia({
          id: Number(ocorrencia.id),
        });

        if (!ocorrenciaLocal) return notFoundNovo({ message: "Ocorrência não existe!" });

        if (atestado.funcionarioId !== ocorrenciaLocal.funcionarioId)
          return badRequestNovo({ message: "O atestado não pertence a mesma pessoa da ocorrência!" });

        ocorrenciasLocal.push(ocorrenciaLocal);
      }

      const salvo = await this.associarOcorrenciaComAtestadoPostgresRepository.updateManyOcorrencia({
        atestadoId: atestado.id,
        ids: ocorrencias.map((ocorrencia) => ocorrencia.id),
      });

      if (!salvo) return serverError();

      return ok({ message: salvo });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
