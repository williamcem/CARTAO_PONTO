import { ListarAtestadoRepsository } from "@infra/db/postgresdb/listar-atestados-não-analisados/listar-atestados-nao-analisados";

import { badRequestNovo, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-atestados-nao-analisados-protocols";
import moment from "moment";

export class ListarAtestadoController implements Controller {
  constructor(private readonly AtestadoPostgresRepository: ListarAtestadoRepsository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { referencia } = httpRequest.query;

      if (!referencia) return badRequestNovo({ message: "Falta referência!" });

      if (!moment(referencia).isValid()) return badRequestNovo({ message: "Data referência inválida!" });

      const atestados = await this.AtestadoPostgresRepository.list({ referencia: moment.utc(referencia).toDate() });

      return ok({ atestados });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
