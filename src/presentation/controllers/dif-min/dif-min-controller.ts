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

      const existDia = await this.difMinPostgresRepository.buscarPorId({ id });

      if (!existDia) {
        return badRequest({ message: "Id inexistente!", name: "Erro" });
      }

      let manha = undefined;
      let tarde = undefined;

      if (!existDia.entradaManha && !existDia.saidaManha) manha = "FALTA";

      if (!existDia.entradaTarde && !existDia.saidaTarde) tarde = "FALTA";

      // Atualiza o dia específico para falta
      const update = await this.difMinPostgresRepository.atualizarDiaParaFalta({
        id: existDia.id,
        entradaManha: manha,
        saidaManha: manha,
        entradaTarde: tarde,
        saidaTarde: tarde,
      });

      if (!update) return badRequest({ message: "Erro ao atualizar dia para falta", name: "Error" });

      return ok({ message: "Dia atualizado com sucesso como falta" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
