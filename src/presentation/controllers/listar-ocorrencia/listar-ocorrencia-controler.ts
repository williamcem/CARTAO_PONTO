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

      const output: { nome: string; data: Date; movimentacao60: number }[] = [];

      for (const funcionario of ocorrencias.funcionarios) {
        const response = await this.getFuncionarioController.handle({
          query: { identificacao: funcionario.identificacao, localidade, mostraSaldo: true },
        });

        const data = response.body.data;

        for (const cartao of data.cartao) {
          for (const cartao_dia of cartao.cartao_dia) {
            if (cartao_dia.movimentacao60 === "-") {
              output.push({
                nome: funcionario.identificacao,
                data: cartao_dia.data,
                movimentacao60: cartao_dia.movimentacao60,
              });
            }
          }
        }
      }

      return ok({ message: "Localidade encontrada com sucesso", data: ocorrencias, output });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
