import { HttpResponse, Controller } from "../horarios/horarios-protocols";
import { serverError, ok } from "../../helpers/http-helpers";
import { ListaPostgresRepository } from "@infra/db/postgresdb/lista-repository/lista-horarios";

export class ListaHorariosController implements Controller {
  constructor(private readonly listaPostgresRepository: ListaPostgresRepository) {}
  async handle(): Promise<HttpResponse> {
    try {
      const horarios = await this.listaPostgresRepository.list({ data: "10/04/2024" }); // Chama o serviço de listagem

      return ok(horarios);
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
