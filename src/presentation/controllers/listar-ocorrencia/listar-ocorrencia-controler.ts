import { OcorrenciaPostgresRepository } from "../../../infra/db/postgresdb/listar-ocorrencias/listar-ocorrencias-repository";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-ocorrencia-protocols";
import { GetFuncionarioController } from "../procurar-funcionário/procurar-funcionário";

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

      const output: { identificaccao: string; data: Date; movimentacao60: number; nome: string; id: number; tratado: boolean }[] =
        [];

      for (const funcionario of ocorrencias.funcionarios) {
        const response = await this.getFuncionarioController.handle({
          query: { identificacao: funcionario.identificacao, localidade, mostraSaldo: true },
        });

        const data = response.body.data;

        for (const cartao of data.cartao) {
          for (const cartao_dia of cartao.cartao_dia) {
            console.log("cartao_dia.tradado", cartao_dia.tratado);
            if (cartao_dia.movimentacao60 < 0 && cartao_dia.tratado === false) {
              output.push({
                identificaccao: funcionario.identificacao,
                data: cartao_dia.data,
                movimentacao60: cartao_dia.movimentacao60,
                nome: funcionario.nome,
                id: cartao_dia.id,
                tratado: cartao_dia.tratado,
              });
            }
          }
        }
      }

      return ok({ message: "Localidade encontrada com sucesso", data: output });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
