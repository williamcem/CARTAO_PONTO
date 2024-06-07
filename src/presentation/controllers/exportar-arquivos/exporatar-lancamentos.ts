import fs from "fs";

import { exportarDadosParaArquivo } from "../../../main/exportacoes/exportar-dados";
import { Controller, HttpResponse } from "./export-protocols";

export class ExportarController implements Controller {
  async handle(): Promise<HttpResponse> {
    return new Promise((resolve) => {
      exportarDadosParaArquivo((err: Error | null, filename?: string) => {
        if (err) {
          console.error("Erro ao exportar dados:", err);
          return resolve({
            statusCode: 500,
            body: "Erro ao exportar dados.",
          });
        }

        // Enviar o arquivo como resposta
        resolve({
          statusCode: 200,
          body: { filename },
        });

/*         // Excluir o arquivo após a resposta (opcional, ou você pode fazer isso em outra parte do código se necessário)
        fs.unlink(filename!, (err: NodeJS.ErrnoException | null) => {
          if (err) {
            console.error("Erro ao excluir arquivo:", err);
          } else {
            console.log(`Arquivo ${filename} excluído.`);
          }
        }); */
      });
    });
  }
}
