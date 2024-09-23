import { Controller, HttpResponse } from "./validar-dia-com-lancamento-validado-protocols";
import { ok, serverError } from "../../helpers/http-helpers";
import { ValidarDiaComLancamentoValidadoPostgresRepository } from "@infra/db/postgresdb/validar-dia-com-lancamento-validado/validar-dia-com-lancamento-validado";

export class ValidarDiaComLancamentoValidadoController implements Controller {
  constructor(private validarDiaComLancamentoValidadoPostgresRepository: ValidarDiaComLancamentoValidadoPostgresRepository) {}

  async handle(): Promise<HttpResponse> {
    try {
      let sair = false,
        skip = 0,
        take = 1000;

      const updateds: { id: number }[] = [];
      while (!sair) {
        const dias = await this.validarDiaComLancamentoValidadoPostgresRepository.findManyDia({
          skip,
          take,
        });

        if (dias.length === 0) sair = true;
        skip += 1000;

        for (let i = 0; i < dias.length; i += 50) {
          const diasLocal = dias.slice(i, i + 50); // Pegamos um bloco de 500 elementos

          await Promise.all(
            diasLocal.map(async (dia) => {
              if (dia.cartao_dia_lancamentos.length === 0 && !dia.eventos.length) return undefined;

              const existeNaoValidado = dia.cartao_dia_lancamentos.some((lancamento) => !lancamento.validadoPeloOperador);

              if (!existeNaoValidado) {
                if (!dia.eventos.length) return undefined;
              }

              const updated = await this.validarDiaComLancamentoValidadoPostgresRepository.update({
                id: dia.id,
                validadoPeloOperador: true,
              });

              updateds.push({ id: dia.id });

              return updated;
            }),
          );
        }
      }

      return ok({ message: { dias: updateds } });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
