import { HttpResponse, HttpRequest, Controller, AddHorarios } from "./horarios-protocols";
import { MissingParamError } from "../../errors";
import { badRequest, serverError, ok } from "../../helpers/http-helpers";

export class HorariosController implements Controller {
  private readonly addHorarios: AddHorarios;

  constructor(addHorarios: AddHorarios) {
    this.addHorarios = addHorarios;
  }

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const camposRequiridos = ["entradaManha", "saidaManha", "entradaTarde", "saidaTarde", "dif_min", "tipoUm", "tipoDois"];

      for (const campo of camposRequiridos) {
        if (!httRequest.body[campo]) {
          return badRequest(new MissingParamError(campo));
        }
      }

      const { entradaManha, entradaTarde, saidaManha, saidaTarde, dif_min, tipoUm, tipoDois } = httRequest.body;

      const horario = await this.addHorarios.add({
        entradaManha,
        saidaManha,
        entradaTarde,
        saidaTarde,
        dif_min,
        tipoUm,
        tipoDois,
      });
      return ok(horario);
    } catch (error) {
      console.log(error);
      return serverError();
    }
  }
}
