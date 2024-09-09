import { badRequest, badRequestNovo, notFoundRequest, ok, serverError, serverErrorNovo } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./finalizar-cartao-protocols";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { FinalizarCartaoPostgresRepository } from "@infra/db/postgresdb/finalizar-cartao/finalizar-cartao";
import moment from "moment";
import { GetFuncionarioImpressaoCalculoController } from "../get-funcionário-impressao-calculo/procurar-funcionário-impressao-calculo";

export class FinalizarCartaoController implements Controller {
  constructor(
    private readonly finalizarCartaoPostgresRepository: FinalizarCartaoPostgresRepository,
    private readonly getFuncionarioImpressaoCalculoController: GetFuncionarioImpressaoCalculoController,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const {
        id,
        userName,
        pago,
        compensado,
      }: {
        id: number;
        userName: string;
        pago: { diurno: { ext1: number; ext2: number; ext3: number }; noturno: { ext1: number; ext2: number; ext3: number } };
        compensado: {
          diurno: { ext1: number; ext2: number; ext3: number };
          noturno: { ext1: number; ext2: number; ext3: number };
        };
      } = httpRequest.body;

      if (!id) return badRequest(new FuncionarioParamError("Falta id do cartão!"));
      if (!userName) return badRequest(new FuncionarioParamError("Falta usuário!"));

      //Verifica pago
      {
        console.log(pago);
        if (!pago) return badRequest(new FuncionarioParamError("Falta o que será pago!"));
        if (!pago.diurno) return badRequest(new FuncionarioParamError("Falta pago diurno!"));
        if (!Number.isInteger(pago.diurno.ext1)) return badRequest(new FuncionarioParamError("Falta extra 1 pago diurno!"));
        if (!Number.isInteger(pago.diurno.ext2)) return badRequest(new FuncionarioParamError("Falta extra 2 pago diurno!"));
        if (!Number.isInteger(pago.diurno.ext3)) return badRequest(new FuncionarioParamError("Falta extra 3 pago diurno!"));

        if (!pago.noturno) return badRequest(new FuncionarioParamError("Falta pago noturno!"));
        if (!Number.isInteger(pago.noturno.ext1)) return badRequest(new FuncionarioParamError("Falta extra 1 pago noturno!"));
        if (!Number.isInteger(pago.noturno.ext2)) return badRequest(new FuncionarioParamError("Falta extra 2 pago noturno!"));
        if (!Number.isInteger(pago.noturno.ext3)) return badRequest(new FuncionarioParamError("Falta extra 3 pago noturno!"));
      }

      //Verifica compensado
      {
        if (!compensado) return badRequest(new FuncionarioParamError("Falta o que será compensado!"));
        if (!compensado.diurno) return badRequest(new FuncionarioParamError("Falta compensado diurno!"));
        if (!Number.isInteger(compensado.diurno.ext1))
          return badRequest(new FuncionarioParamError("Falta extra 1 compensado diurno!"));
        if (!Number.isInteger(compensado.diurno.ext2))
          return badRequest(new FuncionarioParamError("Falta extra 2 compensado diurno!"));
        if (!Number.isInteger(compensado.diurno.ext3))
          return badRequest(new FuncionarioParamError("Falta extra 3 compensado diurno!"));

        if (!compensado.noturno) return badRequest(new FuncionarioParamError("Falta compensado noturno!"));
        if (!Number.isInteger(compensado.noturno.ext1))
          return badRequest(new FuncionarioParamError("Falta extra 1 compensado noturno!"));
        if (!Number.isInteger(compensado.noturno.ext2))
          return badRequest(new FuncionarioParamError("Falta extra 2 compensado noturno!"));
        if (!Number.isInteger(compensado.noturno.ext3))
          return badRequest(new FuncionarioParamError("Falta extra 3 compensado noturno!"));
      }

      const cartao = await this.finalizarCartaoPostgresRepository.findFisrt({
        id: Number(id),
      });

      if (!cartao) return notFoundRequest(new FuncionarioParamError("Cartão não localizado!"));

      if (cartao.statusId != 1) return badRequest(new FuncionarioParamError("Cartão já está finalizado!"));

      const { diasSemLancamento, lancamentosNaoValidado, ocorrenciasNaoTratada } = this.buscarPendenciaCartao({
        cartao: {
          dias: cartao.cartao_dia.map((dia) => ({
            cargaHor: dia.cargaHor,
            data: dia.data,
            id: dia.id,
            eventos: dia.eventos,
            lancamentos: dia.cartao_dia_lancamentos,
          })),
        },
      });

      const atestados = await this.finalizarCartaoPostgresRepository.findManyAtestado({
        funcionarioId: cartao.funcionarioId,
        statusId: 1,
      });

      const atestadosEmAnalise = atestados.map((atestado) => ({
        id: atestado.id,
        data: atestado.data,
        tipo: atestado.tipos_documentos.nome,
      }));

      if (atestados.length || lancamentosNaoValidado.length || ocorrenciasNaoTratada.length || diasSemLancamento.length)
        return badRequestNovo({
          message: { lancamentosNaoValidado, ocorrenciasNaoTratada, diasSemLancamento, atestadosEmAnalise },
        });

      let errors = {
        diurno: { ext1: "", ext2: "", ext3: "" },
        noturno: { ext1: "", ext2: "", ext3: "" },
      };

      let sendError = false;

      if (pago.diurno.ext1 < 0) {
        errors.diurno.ext1 = "Não é possível pagar diurno extra 1 negativo!";
        sendError = true;
      }
      if (pago.diurno.ext2 < 0) {
        errors.diurno.ext2 = "Não é possível pagar diurno extra 2 negativo!";
        sendError = true;
      }
      if (pago.diurno.ext3 < 0) {
        errors.diurno.ext3 = "Não é possível pagar diurno extra 3 negativo!";
        sendError = true;
      }
      if (pago.noturno.ext1 < 0) {
        errors.noturno.ext1 = "Não é possível pagar noturno extra 1 negativo!";
        sendError = true;
      }
      if (pago.noturno.ext2 < 0) {
        errors.noturno.ext2 = "Não é possível pagar noturno extra 2 negativo!";
        sendError = true;
      }
      if (pago.noturno.ext3 < 0) {
        errors.noturno.ext3 = "Não é possível pagar noturno extra 3 negativo!";
        sendError = true;
      }

      if (sendError) return badRequestNovo({ message: errors });

      const result: {
        statusCode: number;
        body: {
          data: [
            {
              resumo: {
                atual: {
                  diurno: { ext1: number | string; ext2: number | string; ext3: number | string };
                  noturno: { ext1: number | string; ext2: number | string; ext3: number | string };
                };
              };
            },
          ];
        };
      } = await this.getFuncionarioImpressaoCalculoController.handle({
        query: { cartaoId: cartao.id, cartaoStatusId: 1, showSummary: 1, localidade: cartao.funcionario.localidadeId },
      });

      if (result.statusCode !== 200)
        return serverErrorNovo({ message: "Erro ao calcular resumo\nEntrar em contato com o suporte!" });

      const { atual } = result.body.data[0].resumo;

      errors.diurno.ext1 = this.mensagemMinutosDivergente({
        nome: "extra 1",
        periodo: "diurno",
        somaDoInformado: pago.diurno.ext1 + compensado.diurno.ext1,
        resumoSistema: Number(atual.diurno.ext1),
      });
      if (errors.diurno.ext1) sendError = true;

      errors.diurno.ext2 = this.mensagemMinutosDivergente({
        nome: "extra 2",
        periodo: "diurno",
        somaDoInformado: pago.diurno.ext2 + compensado.diurno.ext2,
        resumoSistema: Number(atual.diurno.ext2),
      });
      if (errors.diurno.ext2) sendError = true;

      errors.diurno.ext3 = this.mensagemMinutosDivergente({
        nome: "extra 3",
        periodo: "diurno",
        somaDoInformado: pago.diurno.ext3 + compensado.diurno.ext3,
        resumoSistema: Number(atual.diurno.ext3),
      });
      if (errors.diurno.ext3) sendError = true;

      errors.noturno.ext1 = this.mensagemMinutosDivergente({
        nome: "extra 1",
        periodo: "noturno",
        somaDoInformado: pago.noturno.ext1 + compensado.noturno.ext1,
        resumoSistema: Number(atual.noturno.ext1),
      });
      if (errors.noturno.ext1) sendError = true;

      errors.noturno.ext2 = this.mensagemMinutosDivergente({
        nome: "extra 2",
        periodo: "noturno",
        somaDoInformado: pago.noturno.ext2 + compensado.noturno.ext2,
        resumoSistema: Number(atual.noturno.ext2),
      });
      if (errors.noturno.ext2) sendError = true;

      errors.noturno.ext3 = this.mensagemMinutosDivergente({
        nome: "extra 3",
        periodo: "noturno",
        somaDoInformado: pago.noturno.ext3 + compensado.noturno.ext3,
        resumoSistema: Number(atual.noturno.ext3),
      });
      if (errors.noturno.ext3) sendError = true;

      if (sendError) return badRequestNovo({ message: errors });

      const referenciaPosterior = new Date(cartao.referencia);
      referenciaPosterior.setMonth(referenciaPosterior.getMonth() + 1);

      const existeCartaoPosterior = await this.finalizarCartaoPostgresRepository.findFisrt({
        funcionarioId: cartao.funcionarioId,
        referencia: referenciaPosterior,
      });

      let cartaoPosterior:
        | {
            id: number;
            anterior: {
              diurno: {
                ext1: number;
                ext2: number;
                ext3: number;
              };
              noturno: {
                ext1: number;
                ext2: number;
                ext3: number;
              };
            };
          }
        | undefined = undefined;

      if (existeCartaoPosterior)
        cartaoPosterior = {
          id: existeCartaoPosterior.id,
          anterior: compensado,
        };

      const saved = await this.finalizarCartaoPostgresRepository.update({
        id: cartao.id,
        statusId: 2, //finalizado
        updateAt: moment().utc(false).toDate(),
        userName,
        compensado,
        pago,
        cartaoPosterior,
      });

      if (!saved) serverError();

      return ok({ message: saved });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }

  mensagemMinutosDivergente(input: {
    periodo: "diurno" | "noturno";
    nome: "extra 1" | "extra 2" | "extra 3";
    resumoSistema: number;
    somaDoInformado: number;
  }) {
    let message = "";

    if (input.resumoSistema === input.somaDoInformado) {
    } else if (input.resumoSistema > input.somaDoInformado) {
      message = `Está faltando ${input.resumoSistema - input.somaDoInformado} minutos no ${input.nome} ${input.periodo}!`;
    } else {
      message = `Está sobrando ${input.somaDoInformado - input.resumoSistema} minutos no ${input.nome} ${input.periodo}!`;
    }

    return message;
  }

  buscarPendenciaCartao(input: {
    cartao: {
      dias: {
        id: number;
        data: Date;
        cargaHor: number;
        eventos: { id: number; hora: string; tipoId: number | null; tratado: boolean }[];
        lancamentos: { periodoId: number; validadoPeloOperador: boolean }[];
      }[];
    };
  }) {
    const diasSemLancamento: { id: number; data: Date }[] = [];
    const lancamentosNaoValidado: { id: number; data: Date; lancamentos: { periodoId: number }[] }[] = [];
    const ocorrenciasNaoTratada: { id: number; data: Date; eventos: { id: number; hora: string }[] }[] = [];

    input.cartao.dias.map((dia) => {
      if (dia.cargaHor === 0) return;

      if (!dia.eventos.length) {
        diasSemLancamento.push({ data: dia.data, id: dia.id });
      }

      dia.lancamentos.map((lancamento) => {
        if (lancamento.validadoPeloOperador) return undefined;

        const existIndex = lancamentosNaoValidado.findIndex((lancErro) => lancErro.id === dia.id);
        if (existIndex !== -1) lancamentosNaoValidado[existIndex].lancamentos.push({ periodoId: lancamento.periodoId });
        else
          lancamentosNaoValidado.push({
            id: dia.id,
            data: dia.data,
            lancamentos: [{ periodoId: lancamento.periodoId }],
          });
      });

      dia.eventos.map((evento) => {
        if (evento.tipoId === 2 && !evento.tratado) {
          const existeIndexDia = ocorrenciasNaoTratada.findIndex((eve) => eve.id === dia.id);

          if (existeIndexDia !== -1) ocorrenciasNaoTratada[existeIndexDia].eventos.push({ id: evento.id, hora: evento.hora });
          else
            ocorrenciasNaoTratada.push({
              id: dia.id,
              data: dia.data,
              eventos: [{ id: evento.id, hora: evento.hora }],
            });
        }
      });
    });

    return { diasSemLancamento, lancamentosNaoValidado, ocorrenciasNaoTratada };
  }
}
