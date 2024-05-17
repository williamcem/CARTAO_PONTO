import { HttpRequest, HttpResponse, Controller } from "./horarios-protocols";
import { AddHorarios } from "../../../domain/usecases/add-horarios";
import { serverError, ok, badRequest } from "../../../presentation/helpers/http-helpers";
import { ExtraParamError } from "../../errors/extra-erro";
import { TardeParamError } from "../../errors/tarde-erro";
import { ManhaParamError } from "../../errors/manha-erro";

export interface HorarioData {
  id: string;
  entradaManha?: string;
  saidaManha?: string;
  entradaTarde?: string;
  saidaTarde?: string;
  entradaExtra?: string;
  saidaExtra?: string;
}

export class HorariosController implements Controller {
  private readonly addHorarios: AddHorarios;

  constructor(addHorarios: AddHorarios) {
    this.addHorarios = addHorarios;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id, entradaManha, entradaTarde, saidaManha, saidaTarde, entradaExtra, saidaExtra } = httpRequest.body;

      // Verificação para entradaTarde e saidaTarde
      if ((entradaManha && !saidaManha) || (!entradaManha && saidaManha)) {
        return badRequest(new ManhaParamError("Se entrada Manhã ou saida Manhã for fornecido, ambos devem estar presentes."));
      }

      if ((entradaTarde && !saidaTarde) || (!entradaTarde && saidaTarde)) {
        return badRequest(new TardeParamError("Se entrada Tarde ou saida Tarde for fornecido, ambos devem estar presentes."));
      }

      // Verificação para entradaExtra e saidaExtra
      if ((entradaExtra && !saidaExtra) || (!entradaExtra && saidaExtra)) {
        return badRequest(new ExtraParamError("Se entrada Extra ou saida Extra for fornecido, ambos devem estar presentes."));
      }

      const horarioData = {
        id,
        entradaManha,
        saidaManha,
        entradaTarde,
        saidaTarde,
        entradaExtra,
        saidaExtra,
      };

      const horario = await this.addHorarios.add(horarioData);

      return ok({ dif_min: horario.dif_min, horarioData });
    } catch (error) {
      -console.log(error);
      return serverError();
    }
  }
}
