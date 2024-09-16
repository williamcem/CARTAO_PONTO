import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./buscar-funcionarios-referencia-localidade-protocols";
import moment from "moment";
import "moment/locale/pt-br";
import { BuscarFuncionarioReferenciaLocalidadePostgresRepository } from "@infra/db/postgresdb/buscar-funcionario-referencia-localidade/buscar-funcionario-referencia-localidade";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { BuscarTodosPostgresRepository } from "@infra/db/postgresdb/buscar-todos-funcionarios.ts/buscas-todos-repository";
import { FinalizarCartaoPostgresRepository } from "@infra/db/postgresdb/finalizar-cartao/finalizar-cartao";
import { FinalizarCartaoController } from "../finalizar-cartao/finalizar-cartao";
import { GetFuncionarioImpressaoCalculoController } from "../get-funcionário-impressao-calculo/procurar-funcionário-impressao-calculo";

export class BuscarFuncionarioReferenciaLocalidadeAgrupadaController implements Controller {
  constructor(
    private readonly buscarFuncionarioReferenciaLocalidadePostgresRepository: BuscarFuncionarioReferenciaLocalidadePostgresRepository,
    private readonly buscarTodosPostgresRepository: BuscarTodosPostgresRepository,
    private readonly finalizarCartaoController: FinalizarCartaoController,
    private readonly finalizarCartaoPostgresRepository: FinalizarCartaoPostgresRepository,
    private readonly getFuncionarioImpressaoCalculoController: GetFuncionarioImpressaoCalculoController,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidadeId, referencia, showProgress, mostrarPendencias, cartaoStatusIds, showSummary } = httpRequest?.query;

      if (!localidadeId) return badRequest(new FuncionarioParamError("Falta localidade!"));

      if (!referencia) return badRequest(new FuncionarioParamError("Falta referência!"));

      if (!moment(referencia).isValid()) return badRequest(new FuncionarioParamError("Data da referência inválida!"));

      let cartaoStatusIdsFormatado = [];
      if (cartaoStatusIds) {
        if (!JSON.parse(cartaoStatusIds)?.length) return badRequest(new FuncionarioParamError("Cartão status ids é um array!"));
        for (const cartaoStatusId of JSON.parse(cartaoStatusIds)) {
          if (!Number.isInteger(Number(cartaoStatusId)))
            return badRequest(new FuncionarioParamError("Status do cartão é número!"));

          cartaoStatusIdsFormatado.push(Number(cartaoStatusId));
        }
      }

      const localidade = await this.buscarFuncionarioReferenciaLocalidadePostgresRepository.findFisrtLocalidade({ localidadeId });
      if (!localidade) return notFoundRequest(new FuncionarioParamError(`Localidade ${localidadeId} não encontrada!`));

      const cartao = await this.buscarFuncionarioReferenciaLocalidadePostgresRepository.findFisrtReferencia({
        referencia: new Date(referencia),
      });

      if (!cartao)
        return notFoundRequest(
          new FuncionarioParamError(`Não foi encontrado cartões para a referncia ${moment.utc(referencia).toDate()}!`),
        );

      let funcionarios = await this.buscarFuncionarioReferenciaLocalidadePostgresRepository.findManyFuncionarios({
        data: new Date(referencia),
        localidadeId,
        statusIds: cartaoStatusIds ? cartaoStatusIdsFormatado : undefined,
      });

      const output: {
        id: number;
        nome: string;
        filial: string;
        identificacao: string;
        andamento?: number;
        cartaoId: number;
        turno: { id: number; nome: string };
        diasSemLancamento?: [];
        lancamentosNaoValidado?: [];
        ocorrenciasNaoTratada?: [];
        resumo?: { diurno: { ext1: number; ext2: number; ext3: number }; noturno: { ext1: number; ext2: number; ext3: number } };
        pendencias?: any;
        cartao: {
          status: { nome: string };
          statusId: number;
        };
      }[] = [];

      for (const funcionario of funcionarios) {
        let andamento = undefined;
        const dias = funcionario.cartao[0].cartao_dia.filter((dia) => {
          if (moment(dia.data).isBefore(moment()) && dia.cargaHor != 0 && dia.statusId !== 11) {
            const existeOcorrencia = dia.eventos.some((evento) => evento.tipoId === 2);
            if (!existeOcorrencia) return dia;
          }
        });
        let totalDiasParaTrabalhar = dias.length;
        let totalDiasTrabalhados = 0;
        let resumo:
          | {
              diurno: { ext1: number; ext2: number; ext3: number };
              noturno: { ext1: number; ext2: number; ext3: number };
            }
          | undefined = undefined;

        if (showProgress) {
          for await (const dia of funcionario.cartao[0].cartao_dia) {
            if (dia.cargaHor === 0 || dia.statusId === 11) continue;
            const existeOcorrencia = dia.eventos.some((evento) => evento.tipoId === 2);
            if (existeOcorrencia) continue;
            if (dia.cartao_dia_lancamentos.some((lancamento) => lancamento.validadoPeloOperador)) {
              totalDiasTrabalhados = totalDiasTrabalhados + 1;
              continue;
            }

            const abono = await this.buscarTodosPostgresRepository.findFisrtAtestado({
              funcionarioId: funcionario.id,
              cartaoDiaId: dia.id,
            });

            if (abono) {
              totalDiasTrabalhados = totalDiasTrabalhados + 1;
              continue;
            }
          }

          if (!totalDiasTrabalhados && !totalDiasParaTrabalhar) andamento = 100;
          else andamento = Number(((totalDiasTrabalhados * 100) / totalDiasParaTrabalhar).toFixed());
        }

        if (showSummary) {
          const result: {
            statusCode: number;
            body: {
              data: {
                resumo: {
                  diurno: { ext1: number; ext2: number; ext3: number };
                  noturno: { ext1: number; ext2: number; ext3: number };
                };
              }[];
            };
          } = await this.getFuncionarioImpressaoCalculoController.handle({
            query: { cartaoId: funcionario.cartao[0].id, localidade: localidadeId, referencia },
          });

          if (result.statusCode === 200 && result.body.data[0].resumo) resumo = result.body.data[0].resumo;
        }

        let pendencias = {};

        if (mostrarPendencias) {
          const dias = await this.finalizarCartaoPostgresRepository.findFisrt({ id: funcionario.cartao[0].id });
          if (dias) {
            pendencias = this.finalizarCartaoController.buscarPendenciaCartao({
              cartao: {
                dias: dias.cartao_dia.map((dia) => ({
                  cargaHor: dia.cargaHor,
                  data: dia.data,
                  id: dia.id,
                  eventos: dia.eventos,
                  lancamentos: dia.cartao_dia_lancamentos,
                  statusId: dia.statusId,
                })),
                statusId: cartao.statusId,
              },
            });
          }
          const atestados = await this.finalizarCartaoPostgresRepository.findManyAtestado({
            funcionarioId: funcionario.id,
            statusId: 1,
          });

          const atestadosEmAnalise = atestados.map((atestado) => ({
            id: atestado.id,
            data: atestado.data,
            tipo: atestado.tipos_documentos.nome,
          }));

          pendencias = { ...pendencias, ...{ atestadosEmAnalise } };
        }

        output.push({
          andamento,
          filial: funcionario.filial,
          id: funcionario.id,
          identificacao: funcionario.identificacao,
          nome: funcionario.nome,
          cartaoId: funcionario.cartao[0].id,
          turno: funcionario.turno,
          resumo,
          pendencias,
          cartao: { status: { nome: funcionario.cartao[0].cartao_status?.nome || "" }, statusId: funcionario.cartao[0].statusId },
        });
      }

      return ok({ funcionarios: output });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
