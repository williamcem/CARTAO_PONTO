import fs from "fs";

import { exportarDadosParaArquivo } from "../../../main/exportacoes-geral/exportar-dados";
import { Controller, HttpResponse } from "./export-protocols";

export class ExportarController implements Controller {
  async handle(): Promise<HttpResponse> {
    const result = await exportarDadosParaArquivo();

    return { body: result, statusCode: 200, type: "txt" };
  }
}
