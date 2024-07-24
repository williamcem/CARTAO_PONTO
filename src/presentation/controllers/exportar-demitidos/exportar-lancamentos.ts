import { exportarDadosDemitidosParaArquivo } from "../../../main/expotações-demitidos/exportar-dados";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./export-protocols";

export class ExportarDemitidosController implements Controller {
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { identificacao, localidade } = httpRequest.query;

      if (!identificacao) return badRequest(new FuncionarioParamError("identificacao não fornecido!"));
      if (!localidade) return badRequest(new FuncionarioParamError("localidade não fornecido!"));

      return new Promise((resolve) => {
        exportarDadosDemitidosParaArquivo(
          (err: Error | null, filename?: string) => {
            if (err) {
              console.error("Erro ao exportar dados:", err);
              return resolve({
                statusCode: 500,
                body: "Erro ao exportar dados.",
              });
            }

            resolve({
              statusCode: 200,
              body: "Arquivo exportado com sucesso",
            });
          },
          identificacao,
          localidade,
        );
      });
    } catch (error) {
      console.error("Erro no controller:", error);
      return {
        statusCode: 500,
        body: "Erro no servidor.",
      };
    }
  }
}
