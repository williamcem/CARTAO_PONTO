import stream from "stream";
import csv from "csv-parser";
import { UploadPostgresRepository } from "@infra/db/postgresdb/uplod-repository/upload-protheus";
import { randomUUID } from "crypto";
import { MissingParamError } from "../../presentation/errors";
import { Response } from "express";
import { FuncionarioPostgresRepository } from "@infra/db/postgresdb/funcionario/funcionario-repository";

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

export async function importarArquivoFuncionario(req: { file?: Express.Multer.File | undefined }, res: Response) {
  try {
    if (!req.file?.buffer) {
      return new MissingParamError("Falta arquivo!");
    }

    const arquivo = Buffer.from(req.file.buffer).toString("utf-8");

    const funcionarios = arquivo.split("\n");
    const funcionarioRepository = new FuncionarioPostgresRepository();

    const errors: { identificacao: string; nome: string }[] = [];

    Promise.all(
      funcionarios.map(async (funcionario, i) => {
        const [
          ,
          ,
          filial,
          ,
          identificacao,
          nome,
          ,
          ,
          codTurno,
          descricaoTurno,
          codCentroCusto,
          descricaoCentroCusto,
          codFuncao,
          descricaoFuncao,
          dataNascimento,
          dataAdmissao,
          dataDemissao,
          rua,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          cep,
          ddd,
          telefone,
          email,
        ] = funcionario.split(";");

        if (i === 1) if (!nome) throw "Arquivo inválido!";

        if (!identificacao) return funcionario;

        const novaDataAdmissao = new Date(`${dataAdmissao.slice(0, 4)}-${dataAdmissao.slice(4, 6)}-${dataAdmissao.slice(6, 8)}`);
        const novaDataDemissao = new Date(`${dataDemissao.slice(0, 4)}-${dataDemissao.slice(4, 6)}-${dataDemissao.slice(6, 8)}`);
        const novaDataNascimento = new Date(
          `${dataNascimento.slice(0, 4)}-${dataNascimento.slice(4, 6)}-${dataNascimento.slice(6, 8)}`,
        );

        const saved = await funcionarioRepository.upsert({
          nome,
          centroCusto: { nome: descricaoCentroCusto },
          contato: ddd && telefone ? { numero: `${ddd} ${telefone}` } : undefined,
          dataAdmissao: novaDataAdmissao,
          dataDemissao: dataDemissao ? novaDataDemissao : undefined,
          dataNascimento: novaDataNascimento,
          email: email ? { nome: email } : undefined,
          endereco: { cep, bairro, cidade, complemento, estado, numero, rua },
          filial,
          funcao: { nome: descricaoFuncao },
          identificacao,
          turno: { nome: descricaoTurno },
        });

        if (!saved) {
          errors.push({ identificacao, nome });
        }

        return undefined;
      }),
    );

    return res.json({ message: "Arquivo importado com sucesso", errors });
  } catch (error) {
    return res.send({ error }).status(400);
  }
}
