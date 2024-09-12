import moment from "moment";
import { exportarDadosParaArquivo } from "../../../main/exportacoes-geral/exportar-dados";
import { Controller, HttpResponse } from "./export-protocols";
import { Request, Response } from "express";

export class ExportarController {
  async handle(req: Request, res: Response) {
    if (!req.query.referencia) return res.send({ message: "Falta referência!" });

    const referencia = moment(String(req.query.referencia));

    if (!referencia.isValid()) return res.send({ message: "Data referência inválida!" });

    const result = await exportarDadosParaArquivo({ referencia: referencia.toDate() });

    return { body: result, statusCode: 200, type: "txt" };
  }
}
