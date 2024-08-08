import { CalcularResumoPostgresRepository } from "@infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";
import { CalcularResumoImpressaoPostgresRepository } from "../../../infra/db/postgresdb/calcular-resumo-impressao/calcular-resumo-impressao-repository";
import { FuncionarioImpressaoCalculoPostgresRepository } from "../../../infra/db/postgresdb/get-funcionario-impressao-calculo/get-funcionario-impressao-calculo";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./procurra-funcionario-impressao-calculoprotocols";
import moment from "moment";
import "moment/locale/pt-br";

interface ResumoDoDiaOutput {
  diurno: { ext1: number; ext2: number; ext3: number };
  noturno: { ext1: number; ext2: number; ext3: number };
}

interface ResumoDoDiaInput {
  dia: {
    id: number;
    cargaHorariaTotal: number;
    eventos: { tipoId: number; minutos: number; tratado: boolean }[];
    abono: { minutos: number };
  };
}

export class GetFuncionarioImpressaoCalculoController implements Controller {
  constructor(private readonly funcionarioImpressaoCalculoPostgresRepository: FuncionarioImpressaoCalculoPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidade, funcionarioId, onlyDay } = httpRequest?.query;

      if (!localidade) return badRequest(new FuncionarioParamError("localidade não fornecido!"));

      const funcionarios = await this.funcionarioImpressaoCalculoPostgresRepository.findAllByLocalidade(
        localidade,
        funcionarioId ? Number(funcionarioId) : undefined,
      );

      // Verifica se nenhum funcionário foi encontrado
      if (!funcionarios || funcionarios.length === 0)
        return notFoundRequest({ message: "Nenhum funcionário encontrado!", name: "Error" });

      const output = funcionarios.map((funcionario) => {
        const cartoes = funcionario.cartao.map((cartao) => {
          const resumoCartao = {
            atual: { diurno: { ext1: 0, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
            anterior: { diurno: { ext1: 0, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
          };

          const dias = cartao.cartao_dia.map((dia) => {
            const eventos = dia.eventos.map((evento) => {
              return { minutos: evento.minutos, tipoId: evento.tipoId || 0, tratado: evento.tratado };
            });

            const abono = { minutos: 0 };

            dia.atestado_abonos.map((abono) => abono.minutos + abono.minutos);

            const resumo = this.calcularResumoPorDia({
              dia: { id: cartao.id, eventos, abono, cargaHorariaTotal: dia.cargaHor },
            });

            resumoCartao.atual.diurno.ext1 += resumo.diurno.ext1;
            resumoCartao.atual.diurno.ext2 += resumo.diurno.ext2;
            resumoCartao.atual.diurno.ext3 += resumo.diurno.ext3;

            resumoCartao.atual.noturno.ext1 += resumo.noturno.ext1;
            resumoCartao.atual.noturno.ext2 += resumo.noturno.ext2;
            resumoCartao.atual.noturno.ext3 += resumo.noturno.ext3;

            const periodos: { entrada: string; saida: string; periodoId: number }[] = [];

            dia.cartao_dia_lancamentos.map((lancamento) => {
              periodos.push({
                entrada: moment.utc(lancamento.entrada).format("HH:mm"),
                saida: moment.utc(lancamento.saida).format("HH:mm"),
                periodoId: lancamento.periodoId,
              });
            });

            let data = moment.utc(dia.data).format("DD/MM/YYYY ddd").toUpperCase();

            return { resumo, periodos, data };
          });

          return { ...{ id: cartao.id }, ...{ dias, resumo: resumoCartao, referencia: cartao.referencia } };
        });

        return {
          ...{
            id: funcionario.id,
            identificacao: funcionario.identificacao,
            localidade: funcionario.localidade,
            nome: funcionario.nome,
            turno: funcionario.turno.nome,
            centroCusto: funcionario.centro_custo.nome,
            filia: funcionario.filial,
          },
          ...{ cartoes },
        };
      });

      // Retorna o(s) funcionário(s) encontrado(s) juntamente com a mensagem e o resumo
      return ok({ data: output });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }

  calcularResumoPorDia(input: ResumoDoDiaInput): ResumoDoDiaOutput {
    const output: ResumoDoDiaOutput = {
      diurno: { ext1: 0, ext2: 0, ext3: 0 },
      noturno: { ext1: 0, ext2: 0, ext3: 0 },
    };

    if (!input.dia.cargaHorariaTotal) return output;

    let minutosDiurnos = 0;
    let minutosNoturnos = 0;

    input.dia.eventos.filter((evento) => {
      if (evento.tipoId !== 8 && evento.tipoId !== 11 && evento.tipoId !== 4) minutosDiurnos += evento.minutos;
    });

    input.dia.eventos.filter((evento) => {
      if (evento.tipoId === 4) minutosNoturnos += evento.minutos;
    });

    if (minutosDiurnos == 0 && minutosNoturnos == 0) return output;

    minutosDiurnos -= input.dia.cargaHorariaTotal;

    if (minutosDiurnos > 0) {
      const [ext1, ext2, ext3] = this.inserirRegraPorHoraExtra({ minutos: minutosDiurnos, parametros: [60, 60, 9999] });
      output.diurno = { ext1, ext2, ext3 };
    } else if (minutosDiurnos < 0) output.diurno = { ext1: minutosDiurnos, ext2: 0, ext3: 0 };

    if (minutosNoturnos > 0) {
      const [ext1, ext2, ext3] = this.inserirRegraPorHoraExtra({ minutos: minutosNoturnos, parametros: [60, 60, 9999] });
      output.noturno = { ext1, ext2, ext3 };
    } else if (minutosNoturnos < 0) output.noturno = { ext1: minutosNoturnos, ext2: 0, ext3: 0 };

    return output;
  }

  inserirRegraPorHoraExtra(input: { minutos: number; parametros: number[] }): number[] {
    const output = input.parametros.map((parametro) => {
      let minutos = 0;

      if (input.minutos <= parametro) minutos = input.minutos;
      else minutos = parametro;

      input.minutos = input.minutos - (input.minutos <= parametro ? input.minutos : parametro);

      return minutos;
    });

    return output.map((value) => Number(value));
  }
}
