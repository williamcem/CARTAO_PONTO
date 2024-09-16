import { MudarStatusCartaoAfastadoPostgresRepository } from "@infra/db/postgresdb/mudar-status-cartao-afastado/mudar-status-cartao-afastado";
import { Controller, HttpResponse } from "./mudar-status-cartao-afastado-protocols";
import { ok, serverError } from "../../helpers/http-helpers";

export class MudarStatusCartaoAfastadoController implements Controller {
  constructor(private mudarStatusCartaoAfastadoPostgresRepository: MudarStatusCartaoAfastadoPostgresRepository) {}

  async handle(): Promise<HttpResponse> {
    try {
      const afastados = await this.mudarStatusCartaoAfastadoPostgresRepository.findManyFuncionariosAfastado();

      const cartoesParaAlterar: { id: number; statusId: number }[] = [];

      for (const afastado of afastados) {
        if (afastado.funcionario?.cartao) {
          for (const cartao of afastado.funcionario.cartao) {
            const existeDiaComStatusDiferenteFerias = cartao.cartao_dia.some((dia) => dia.statusId !== 11);

            if (!existeDiaComStatusDiferenteFerias) cartoesParaAlterar.push({ id: cartao.id, statusId: 2 });
          }
        }
      }

      const result = await this.mudarStatusCartaoAfastadoPostgresRepository.updateManyCartao(cartoesParaAlterar);

      return ok({ message: { cartoes: result } });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
