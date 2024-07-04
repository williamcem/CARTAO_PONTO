import { NotificacaoPostgresRepository } from "../../../infra/db/postgresdb/listar-notificacao/listar-notificacao-repository";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { GetFuncionarioController } from "../procurar-funcionário/procurar-funcionário";
import { calcularAusenciasNotificacoes } from "./calcularAusencias";
import { Controller, HttpRequest, HttpResponse } from "./listar-notificacao-protocols";

export class NotController implements Controller {
  constructor(
    private readonly notificacaoPostgresRepository: NotificacaoPostgresRepository,
    private readonly getFuncionarioController: GetFuncionarioController,
  ) {}

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidade } = httRequest?.query;

      if (!localidade) return badRequest(new FuncionarioParamError("localidade não fornecido!"));

      const ocorrencias = await this.notificacaoPostgresRepository.find(localidade);

      if (!ocorrencias || ocorrencias.funcionarios.length === 0) {
        return notFoundRequest({ message: "Localidade não encontrada", name: "Error" });
      }

      const ids: number[] = [];
      const funcionarioMap: {
        [key: number]: {
          identificacao: string;
          data: Date;
          movimentacao60: number;
          nome: string;
          id: number;
          tratado: boolean;
          periodoAusente?: { [key: string]: string };
          diferenca?: number;
        };
      } = {};

      for (const funcionario of ocorrencias.funcionarios) {
        const response = await this.getFuncionarioController.handle({
          query: { identificacao: funcionario.identificacao, localidade, mostraSaldo: true },
        });

        const data = response.body.data;

        for (const cartao of data.cartao) {
          for (const cartao_dia of cartao.cartao_dia) {
            if (cartao_dia.movimentacao100 > 0 || cartao_dia.movimentacaoNoturna100 > 0) {
              let diferenca = 0;
              let periodoId = 0;
              if (cartao_dia.cartao_dia_lancamentos && cartao_dia.cartao_dia_lancamentos.length > 0) {
                diferenca = cartao_dia.cartao_dia_lancamentos[0].diferenca;
                periodoId = cartao_dia.cartao_dia_lancamentos[0].periodoId;
              }

              const info = {
                identificacao: funcionario.identificacao,
                data: cartao_dia.data,
                movimentacao60: cartao_dia.movimentacao60,
                nome: funcionario.nome,
                id: cartao_dia.id,
                tratado: cartao_dia.tratado,
                diferenca,
              };
              ids.push(cartao_dia.id);
              funcionarioMap[cartao_dia.id] = info;
              console.log(`Adicionado ao funcionarioMap: ${JSON.stringify(info)}`); // Verificação de depuração
            }
          }
        }
      }

      if (ids.length > 0) {
        const cartaoDias = await this.notificacaoPostgresRepository.findCartaoDiaByIds(ids);
        const cartaoDiasWithInfo = cartaoDias.map((cartaoDia) => ({
          ...cartaoDia,
          funcionarioInfo: {
            ...funcionarioMap[cartaoDia.id],
            diferenca: funcionarioMap[cartaoDia.id]?.diferenca,
          },
        }));

        // Chamada para calcular ausências
        const retornoComAusencias = calcularAusenciasNotificacoes({ message: "Localidade encontrada com sucesso", data: cartaoDiasWithInfo });

        console.log(`Retorno com ausências: ${JSON.stringify(retornoComAusencias)}`); // Verificação de depuração

        return ok(retornoComAusencias);
      }

      // Se nenhum período ocupado foi encontrado, chamar calcularAusencias com um array vazio
      const retornoComAusencias = calcularAusenciasNotificacoes({ message: "Localidade encontrada com sucesso", data: [] });
      return ok(retornoComAusencias);
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
