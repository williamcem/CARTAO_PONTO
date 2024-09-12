import { AssociarOcorrenciaComAtestadoPostgresRepository } from "@infra/db/postgresdb/associar-ocorrencia-com-atestado/associar-ocorrencia-com-atestado";
import { badRequestNovo, notFoundNovo, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./associar-ocorrencia-com-atestado-protocols";
import { SolucaoEventoRepository } from "@infra/db/postgresdb/solucao-eventos-repository/solucao-eventos-repository";

export class AssociarOcorrenciaComAtestadoController implements Controller {
  constructor(
    private readonly associarOcorrenciaComAtestadoPostgresRepository: AssociarOcorrenciaComAtestadoPostgresRepository,
    private readonly solucaoEventoRepository: SolucaoEventoRepository,
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

      let ocorrenciasLocal: {
        id: number;
        cartaoDiaId: number;
        hora: string;
        funcionarioId: number;
        minutos: number;
        tipoId: number | null;
        tratado: boolean;
        atestadoFuncionarioId: number | null;
      }[] = [];

      for (const ocorrencia of ocorrencias) {
        const ocorrenciaLocal = await this.associarOcorrenciaComAtestadoPostgresRepository.findFisrtOcorrencia({
          id: Number(ocorrencia.id),
        });

        if (!ocorrenciaLocal) return notFoundNovo({ message: "Ocorrência não existe!" });

        if (atestado.funcionarioId !== ocorrenciaLocal.funcionarioId)
          return badRequestNovo({ message: "O atestado não pertence a mesma pessoa da ocorrência!" });

        ocorrenciasLocal.push(ocorrenciaLocal);
      }

      const eventos: {
        updateMany: { id: number; tratado: boolean }[];
        createMany: {
          cartaoDiaId: number;
          funcionarioId: number;
          hora: string;
          minutos: number;
          tipoId: number;
          tratado: boolean;
          atestadoFuncionarioId?: number | null;
        }[];
      } = { createMany: [], updateMany: [] };

      if (atestado.statusId === 3) {
        ocorrenciasLocal.map((evento) => {
          if (evento.tratado || evento.tipoId !== 2) return;

          let minutos = this.solucaoEventoRepository.calcularMinutosBaseadoNaAcao({
            minutosOriginal: evento.minutos,
            tipoId: atestado.acao,
          });

          eventos.updateMany.push({ id: evento.id, tratado: true });

          eventos.createMany.push({
            tratado: true,
            tipoId: atestado.acao,
            minutos,
            cartaoDiaId: evento.cartaoDiaId,
            funcionarioId: evento.funcionarioId,
            hora: evento.hora,
            atestadoFuncionarioId: atestado.id,
          });
        });
      }

      const salvo = await this.associarOcorrenciaComAtestadoPostgresRepository.updateManyOcorrencia({
        atestadoId: atestado.id,
        ids: ocorrencias.map((ocorrencia) => ocorrencia.id),
        eventos,
      });

      if (!salvo) return serverError();

      return ok({ message: salvo });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
