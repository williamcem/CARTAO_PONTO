import { OcorrenciaPostgresRepository } from "../../../infra/db/postgresdb/listar-ocorrencias/listar-ocorrencias-repository";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { GetFuncionarioController } from "../procurar-funcionário/procurar-funcionário";
import { Controller, HttpRequest, HttpResponse } from "./listar-ocorrencia-protocols";

export class OcorrenciaController implements Controller {
  constructor(
    private readonly ocorrenciaPostgresRepository: OcorrenciaPostgresRepository,
    private readonly getFuncionarioController: GetFuncionarioController,
  ) {}

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidade } = httRequest?.query;

      if (!localidade) return badRequest(new FuncionarioParamError("localidade não fornecido!"));

      const ocorrencias = await this.ocorrenciaPostgresRepository.find(localidade);

      if (!ocorrencias || ocorrencias.funcionarios.length === 0) {
        return notFoundRequest({ message: "Localidade não encontrada", name: "Error" });
      }

      const output: { identificacao: string; data: Date; movimentacao60: number; nome: string; id: number; tratado: boolean }[] =
        [];
      const ids: number[] = [];
      const funcionarioMap: {
        [key: number]: {
          identificacao: string;
          data: Date;
          movimentacao60: number;
          nome: string;
          id: number;
          tratado: boolean;
        };
      } = {};

      for (const funcionario of ocorrencias.funcionarios) {
        const response = await this.getFuncionarioController.handle({
          query: { identificacao: funcionario.identificacao, localidade, mostraSaldo: true },
        });

        const data = response.body.data;

        for (const cartao of data.cartao) {
          for (const cartao_dia of cartao.cartao_dia) {
            if (cartao_dia.movimentacao60 < 0 && cartao_dia.tratado === false) {
              const info = {
                identificacao: funcionario.identificacao,
                data: cartao_dia.data,
                movimentacao60: cartao_dia.movimentacao60,
                nome: funcionario.nome,
                id: cartao_dia.id,
                tratado: cartao_dia.tratado,
              };
              output.push(info);
              ids.push(cartao_dia.id);
              funcionarioMap[cartao_dia.id] = info;
            }
          }
        }
      }

      if (ids.length > 0) {
        const cartaoDias = await this.ocorrenciaPostgresRepository.findCartaoDiaByIds(ids);
        const cartaoDiasWithInfo = cartaoDias.map((cartaoDia) => ({
          ...cartaoDia,
          funcionarioInfo: funcionarioMap[cartaoDia.id],
        }));
        return ok({ message: "Localidade encontrada com sucesso", data: cartaoDiasWithInfo });
      }

      return ok({ message: "Localidade encontrada com sucesso", data: output });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
