import { ok } from "./../../presentation/helpers/http-helpers";
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
    PRCOPRO: string;
    PRGRUCOD: string;
    PRDESCR: string;
    PRUNID: string;
    PRPROC: string;
    PRUSANFAB: string;
  }[] = []; // Define o tipo explícito para dadosExtraidos como um array de objetos

  bufferStream
    .pipe(
      csv({
        separator: "!",
        mapHeaders: ({ header, index }) => {
          console.log(header);
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
        dado1: string;
        dado2: string;
        dado3: string;
        dado4: string;
        dado5: string;
        dado6: string;
      }[] = [];

      dadosExtraidos.map((item, i, array) => {
        if (i !== array.length - 1) {
          novoDados.push({
            dado1: item.PRCOPRO,
            dado2: item.PRGRUCOD,
            dado3: item.PRDESCR,
            dado4: item.PRUNID,
            dado5: item.PRPROC,
            dado6: item.PRUSANFAB,
            id: randomUUID(),
          });
        }
        return item;
      });

      return res.send(await uploadPostgresRepository.add(novoDados));
    })
    .on("error", (error) => {});
}
