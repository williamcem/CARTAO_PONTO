import { HttpResponse, Controller, HttpRequest } from "./dif-min-protocols";
import { DifMinPostgresRepository } from "@infra/db/postgresdb/dif-min-repository/dif-min-repository";
import { serverError, ok, badRequest } from "../../../presentation/helpers/http-helpers";

export class DifMinController implements Controller {
  constructor(private readonly difMinPostgresRepository: DifMinPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id } = httpRequest.body;

      if (!id) {
        return badRequest(new Error("ID é requirido"));
      }

      // Calcula a diferença de minutos negativos para o dia específico
      let dif_min = -calcularMinutosTrabalho("07:12", "17:00");
      dif_min = dif_min + 60;

      // Prepara os dados para atualização
      const diaUpdate = {
        id,
        dif_min,
        entradaManha: "FALTA",
        saidaManha: "FALTA",
        entradaTarde: "FALTA",
        saidaTarde: "FALTA",
        entradaExtra: "FALTA",
        saidaExtra: "FALTA",
      };

      // Atualiza o dia específico para falta
      const update = await this.difMinPostgresRepository.atualizarDiaParaFalta(diaUpdate);

      if (!update) return badRequest({ message: "Erro ao atualizar dia para falta", name: "Error" });

      return ok({ message: "Dia atualizado com sucesso como falta" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}

// função para calcular e negativar o dia não trabalhado
function calcularMinutosTrabalho(inicio: string, fim: string): number {
  const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
  const [horaFim, minutoFim] = fim.split(":").map(Number);

  const minutosInicio = horaInicio * 60 + minutoInicio;
  const minutosFim = horaFim * 60 + minutoFim;

  return minutosFim - minutosInicio;
}
