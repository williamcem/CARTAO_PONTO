import { HttpResponse, HttpRequest, Controller, AddHorarios } from "./horarios-protocols";
import { MissingParamError } from "../../errors";
import { badRequest, serverError, ok } from "../../helpers/http-helpers";
import { randomUUID } from "crypto";
import { listHorarios } from "@infra/db/postgresdb/lista-repository/lista-horarios";

export class getHorariosController implements Controller {
  async handle(): Promise<HttpResponse> {
    try {
      const horarios = await listHorarios(); // Chama o serviço de listagem

      return ok(horarios);
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
