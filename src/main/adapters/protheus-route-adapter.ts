import { randomUUID } from "crypto";
import csv from "csv-parser";
import { Response } from "express";
import moment from "moment";
import stream from "stream";

import { CartaoPostgresRepository } from "@infra/db/postgresdb/funcionario/cartao-repository";
import { FuncionarioPostgresRepository } from "@infra/db/postgresdb/funcionario/funcionario-repository";
import { UploadPostgresRepository } from "@infra/db/postgresdb/uplod-repository/upload-protheus";

import { MissingParamError } from "../../presentation/errors";
import { BuscarHorarioNortunoEmMinutos } from "./../../presentation/controllers/horarios-memory/utils";

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
          ,
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
          email: email.replace("\r", "").trim() ? { nome: email.replace("\r", "").trim() } : undefined,
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

export async function importarArquivoCartao(req: { file?: Express.Multer.File | undefined }, res: Response) {
  try {
    if (!req.file?.buffer) {
      return new MissingParamError("Falta arquivo!");
    }

    const arquivo = Buffer.from(req.file.buffer).toString("utf-8");

    const cartaoDias = arquivo.split("\n");
    const funcionarioRepository = new FuncionarioPostgresRepository();

    const cartaoPostgresRepository = new CartaoPostgresRepository();
    const errors: { identificacao: string; descricao: string }[] = [];

    let cartao: {
      identificacao: string;
      funcionarioId: number;
      referencia: Date;
      saldoAnterior60: number;
      saldoAnterior100: number;
      status: { descricao: "IMPORTADO"; id: 1 };
      dias: {
        data: Date;
        periodoDescanso: number;
        cargaHor: number;
        cargaHorPrimeiroPeriodo: number;
        cargaHorSegundoPeriodo: number;
        cargaHorariaCompleta: string;
        cargaHorNoturna: number;
        status: {
          id: number;
          descricao: string;
        };
      }[];
    } = {
      identificacao: "",
      funcionarioId: 0,
      referencia: new Date(),
      saldoAnterior60: 0,
      saldoAnterior100: 0,
      status: { id: 1, descricao: "IMPORTADO" },
      dias: [],
    };

    for (const dia of cartaoDias) {
      const [
        ,
        ,
        identificacao,
        referencia,
        data,
        codStatus,
        descricaoStatus,
        primeiraEntrada,
        primeiraSaida,
        segundaEntrada,
        segundaSaida,
        descansoSemFormato,
      ] = dia.split(";");

      if (!identificacao) continue;
      const descanso = descansoSemFormato.replace("\r", "");

      if (identificacao !== cartao.identificacao) {
        if (cartao.identificacao !== "") {
          await cartaoPostgresRepository.upsert(cartao);
        }

        cartao.identificacao = identificacao;
        cartao.saldoAnterior100 = 0;
        cartao.saldoAnterior60 = 0;
        cartao.status = { id: 1, descricao: "IMPORTADO" };
        cartao.referencia = moment(`${referencia.slice(0, 4)}-${data.slice(4, 6)}-01`)
          .add(1, "M")
          .utc(true)
          .toDate();

        cartao.dias = [];

        const existeFuncionario = await funcionarioRepository.findFisrt({ identificacao });
        if (!existeFuncionario) {
          errors.push({ identificacao, descricao: `Funcionário não encontrado pela identificação ${identificacao}` });

          continue;
        }

        cartao.funcionarioId = existeFuncionario.id;
      }

      const dataAtual = moment(new Date(`${data.slice(0, 4)}-${data.slice(4, 6)}-${data.slice(6, 8)}`)).utc(false);

      const [hora, minutos] = descanso.split(".");

      let descansoEmMinutos = Number(hora) * 60 + Number(minutos);

      let cargaHor = 0,
        cargaHorPrimeiroPeriodo = 0,
        cargaHorSegundoPeriodo = 0,
        cargaHorNoturna = 0;

      //Acha carga horaria primeiro periodo
      {
        const [horaEntrada, minutosEntrada] = primeiraEntrada.split(".");
        const [horaSaida, minutosSaida] = primeiraSaida.split(".");
        const dataEntrada = moment(dataAtual).hour(Number(horaEntrada)).minutes(Number(minutosEntrada));
        const dataSaida = moment(dataAtual).hour(Number(horaSaida)).minutes(Number(minutosSaida));

        if (dataEntrada.isAfter(dataSaida)) dataSaida.add(1, "d");

        cargaHorPrimeiroPeriodo = dataSaida.diff(dataEntrada, "minutes");
        cargaHorNoturna += BuscarHorarioNortunoEmMinutos(moment(data), dataEntrada, dataSaida);
      }

      //Acha carga horaria segundo periodo
      {
        const [horaEntrada, minutosEntrada] = segundaEntrada.split(".");
        const [horaSaida, minutosSaida] = segundaSaida.split(".");
        const dataEntrada = moment(dataAtual).hour(Number(horaEntrada)).minutes(Number(minutosEntrada));
        const dataSaida = moment(dataAtual).hour(Number(horaSaida)).minutes(Number(minutosSaida));

        const dataPrimeiraEntrada = moment(dataAtual)
          .hour(Number(primeiraEntrada.split(".")[0]))
          .minutes(Number(primeiraEntrada.split(".")[1]));

        if (dataPrimeiraEntrada.isAfter(dataEntrada)) dataEntrada.add(1, "d");

        if (dataEntrada.isAfter(dataSaida)) dataSaida.add(1, "d");

        cargaHorSegundoPeriodo = dataSaida.diff(dataEntrada, "minutes");
        cargaHorNoturna += BuscarHorarioNortunoEmMinutos(moment(data), dataEntrada, dataSaida);
      }

      cartao.dias.push({
        status: { descricao: descricaoStatus, id: Number(codStatus) },
        data: dataAtual.toDate(),
        cargaHorariaCompleta: `${primeiraEntrada};${primeiraSaida};${segundaEntrada};${segundaSaida};${descanso}`,
        periodoDescanso: descansoEmMinutos,
        cargaHor,
        cargaHorPrimeiroPeriodo,
        cargaHorSegundoPeriodo,
        cargaHorNoturna,
      });
    }

    return res.json({ message: "Arquivo importado com sucesso", errors });
  } catch (error) {
    console.log("error", error);
    return res.send(error).status(400);
  }
}
