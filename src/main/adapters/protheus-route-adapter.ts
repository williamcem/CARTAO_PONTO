import stream from "stream";
import csv from "csv-parser";
import { UploadPostgresRepository } from "@infra/db/postgresdb/uplod-repository/upload-protheus";
import { randomUUID } from "crypto";
import { MissingParamError } from "../../presentation/errors";
import { Response } from "express";

export async function processarArquivo(req: { file?: Express.Multer.File | undefined }, res: Response) {
  if (!req.file?.buffer) {
    return new MissingParamError("Falta arquivo!");
  }

  const arquivo = Buffer.from(req.file.buffer);
  const bufferStream = new stream.PassThrough();

  bufferStream.end(arquivo);

  const dadosExtraidos: {
    MES: string;
    DATA: string;
    STATUS: string;
    NOME: string;
    MATRÍCULA: string;
    SETOR: string;
    EXPEDIENTE: string;
    SALDOANTERIOR: string;
  }[] = []; // Define o tipo explícito para dadosExtraidos como um array de objetos

  bufferStream
    .pipe(
      csv({
        separator: "!",
        mapHeaders: ({ header, index }) => {
          return header.trim();
        },
        mapValues({ header, index, value }) {
          value = String(value).trim();
          return value;
        },
      }),
    )
    .on("data", (row) => {
      dadosExtraidos.push(row);
    })
    .on("end", async () => {
      const uploadPostgresRepository = new UploadPostgresRepository();

      const novoDados: {
        id: string;
        mes: string;
        data: Date;
        diaSemana: string;
        status: string;
        nome: string;
        matricula: string;
        setor: string;
        expediente: string;
        saldoanterior: number;
      }[] = [];

      dadosExtraidos.map((item, i, array) => {
        if (i !== array.length - 1) {
          const [date, diaSemana] = item.DATA.split(" ");
          const [dia, mes, ano] = date.split("/");
          novoDados.push({
            mes: item.MES,
            data: new Date(`${ano}-${mes}-${dia}`),
            diaSemana,
            status: item.STATUS,
            nome: item.NOME,
            matricula: item.MATRÍCULA,
            setor: item.SETOR,
            expediente: item.EXPEDIENTE,
            saldoanterior: Number(item.SALDOANTERIOR),
            id: randomUUID(),
          });
        }
        return item;
      });

      return res.send(await uploadPostgresRepository.add(novoDados));
    })
    .on("error", (error) => {});
}
