import moment from "moment";
import { BuscarTodosPostgresRepository } from "../../../infra/db/postgresdb/buscar-todos-funcionarios.ts/buscas-todos-repository";
import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./buscar-todos-protocols";

export class BuscarTodosFuncionarioController implements Controller {
  constructor(private readonly funcionarioPostgresRepository: BuscarTodosPostgresRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidade, identificacao } = req.query;

      const funcionarios = await this.funcionarioPostgresRepository.listAll({
        identificacao,
        localidade: { codigo: localidade },
      });

      const output = [];
      //Busca a % preencida do cartão
      for (let index = 0; index < funcionarios.length; index++) {
        console.log(funcionarios);
        const funcionario = funcionarios[index];
        const cartoes = [];

        for (const cartao of funcionario.cartao) {
          let andamento = 0;
          if (cartao?.cartao_dia) {
            const dias = cartao.cartao_dia.filter((dia) => moment(dia.data).isBefore(moment()) && dia.cargaHor != 0);
            let totalDiasParaTrabalhar = dias.length;
            let totalDiasTrabalhados = 0;

            for await (const dia of dias) {
              if (dia.cartao_dia_lancamentos.some((lancamento) => lancamento.validadoPeloOperador)) {
                totalDiasTrabalhados = totalDiasTrabalhados + 1;
                continue;
              }

              const abono = await this.funcionarioPostgresRepository.findFisrtAtestado({
                funcionarioId: funcionario.id,
                cartaoDiaId: dia.id,
              });

              if (abono) {
                totalDiasTrabalhados = totalDiasTrabalhados + 1;
                continue;
              }
            }

            andamento = Number(((totalDiasTrabalhados * 100) / totalDiasParaTrabalhar).toFixed(2));
          }

          cartoes.push({ andamento });
        }

        output.push({ ...funcionario, ...{ cartoes } });
      }

      // Retorna um array contendo todos os funcionários juntamente com a mensagem
      return ok({ message: "Funcionários encontrados com sucesso", data: output });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
