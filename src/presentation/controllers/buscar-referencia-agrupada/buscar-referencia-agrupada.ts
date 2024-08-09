import { BuscarReferenciaAgrupadaPostgresRepository } from "@infra/db/postgresdb/buscar-referencia-agrupada/buscar-referencia-agrupada";
import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./buscar-referencia-agrupada-protocols";
import moment from "moment";
import "moment/locale/pt-br";

export class BuscarReferenciaAgrupadaController implements Controller {
  constructor(private readonly buscarReferenciaAgrupadaPostgresRepository: BuscarReferenciaAgrupadaPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const parametros = await this.buscarReferenciaAgrupadaPostgresRepository.findFisrtParametros();

      const qtdeDiasAnteriorCartao = parametros?.qtdeDiasAnteriorCartao || 30;

      const dataMinCartao = moment().subtract(qtdeDiasAnteriorCartao, "d");

      const referencias = await this.buscarReferenciaAgrupadaPostgresRepository.findManyReferenciaAgrupada({
        dataInicial: dataMinCartao.toDate(),
      });

      const output = referencias.map((referencia) => {
        return { ...referencia, nome: moment.utc(referencia.referencia).format("MMMM/YYYY").toUpperCase() };
      });

      return ok({ meses: output });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
