import { Response } from "express";
import moment from "moment";

import { AfastamentoRepository } from "@infra/db/postgresdb/afastamento/afastamento -repository";
import { CartaoPostgresRepository } from "@infra/db/postgresdb/funcionario/cartao-repository";
import { FuncionarioPostgresRepository } from "@infra/db/postgresdb/funcionario/funcionario-repository";
import { GrupoDeTrabalhoRepositoryPrisma } from "@infra/db/postgresdb/grupo-trabalho/grupo-trabalho-repository";
import { RespaldarAtestadoPostgresRepository } from "@infra/db/postgresdb/respaldar-atestado/respaldar-atestado";

import { BuscarHorarioNortunoEmMinutos } from "../../presentation/controllers/get-funcionário/utils";
import { RespaldarController } from "../../presentation/controllers/respaldar-atestado/respaldar-atestado";

export async function importarArquivoGrupoTrabalho(
  req: { file?: Express.Multer.File | undefined; body: { userName: string } },
  res: Response,
) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).send({ error: "Falta arquivo" });
    }

    if (!req?.body?.userName) return res.status(400).send({ error: "Falta usuário" });

    const arquivo = Buffer.from(req.file.buffer).toString("utf-8");
    const grupos = arquivo.split("\n");
    const grupoDeTrabalhoRepositoryPrisma = new GrupoDeTrabalhoRepositoryPrisma();

    for (const grupo of grupos) {
      const [
        ,
        ,
        codigoTurno,
        descricaoTurno,
        statusTurno,
        ,
        diaSemana,
        tipoDia,
        HoraPrimeiraEntrada,
        HoraPrimeirasaida,
        HoraSegundaEntrada,
        HoraSegundaSaida,
        HoraTerceiraEntrada,
        HoraTerceiraSaida,
        HoraQuartaEntrada,
        HoraQuartaSaida,
        TotalHorasPrimeiroPeriodo,
        TotalHorasSegundoPeriodo,
        TotalHorasTerceiroPeriodo,
        TotalHorasQuartoPeriodo,
        TotalHorasPrimeiroIntervalo,
        TotalHorasSegundoIntervalo,
        TotalHorasTerceiroIntervalo,
        TotalHorasTrabalhadas,
        TotalHorasIntervalo,
        TotalHorasDia,
      ] = grupo.split(";");

      if (!codigoTurno) continue;

      const saved = await grupoDeTrabalhoRepositoryPrisma.upsert({
        cod_turno: codigoTurno,
        descri_turno: descricaoTurno,
        status_turno: statusTurno,
        dia_semana: diaSemana,
        tipo_dia: tipoDia,
        hora_1_entrada: HoraPrimeiraEntrada,
        hora_1_saida: HoraPrimeirasaida,
        hora_2_entrada: HoraSegundaEntrada,
        hora_2_saida: HoraSegundaSaida,
        hora_3_entrada: HoraTerceiraEntrada,
        hora_3_saida: HoraTerceiraSaida,
        hora_4_entrada: HoraQuartaEntrada,
        hora_4_saida: HoraQuartaSaida,
        total_horas_1_periodo: TotalHorasPrimeiroPeriodo,
        total_horas_2_periodo: TotalHorasSegundoPeriodo,
        total_horas_3_periodo: TotalHorasTerceiroPeriodo,
        total_horas_4_periodo: TotalHorasQuartoPeriodo,
        total_horas_1_intervalo: TotalHorasPrimeiroIntervalo,
        total_horas_2_intervalo: TotalHorasSegundoIntervalo,
        total_horas_3_intervalo: TotalHorasTerceiroIntervalo,
        total_horas_trabalhadas: TotalHorasTrabalhadas,
        total_horas_intervalo: TotalHorasIntervalo,
        total_horas_dia: TotalHorasDia,
        userName: (req?.body?.userName || "").toUpperCase(),
      });
    }

    return res.json({ message: "Arquivo importado com sucesso" });
  } catch (error) {
    console.error("Erro importar arquivo:", error);
    return res.status(400).json({ error: "Erro ao importar arquivo" });
  }
}

export async function importarArquivoFuncionario(
  req: { file?: Express.Multer.File | undefined; body: { userName: string } },
  res: Response,
) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).send({ error: "Falta arquivo" });
    }

    if (!req?.body?.userName) return res.status(400).send({ error: "Falta usuário" });

    const arquivo = Buffer.from(req.file.buffer).toString("utf-8");

    const funcionarios = arquivo.split("\n");
    const funcionarioRepository = new FuncionarioPostgresRepository();

    const errors: { identificacao: string; nome: string }[] = [];

    let i = 0;
    for (const funcionario of funcionarios) {
      const [
        ,
        ,
        filial,
        ,
        identificacao,
        nome,
        codigoLocalidade,
        descricaoLocalidade,
        codigoTurnoTrabalho,
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

      i++;
      if (!identificacao) continue;

      const novaDataAdmissao = new Date(`${dataAdmissao.slice(0, 4)}-${dataAdmissao.slice(4, 6)}-${dataAdmissao.slice(6, 8)}`);
      const novaDataDemissao = new Date(`${dataDemissao.slice(0, 4)}-${dataDemissao.slice(4, 6)}-${dataDemissao.slice(6, 8)}`);
      const novaDataNascimento = new Date(
        `${dataNascimento.slice(0, 4)}-${dataNascimento.slice(4, 6)}-${dataNascimento.slice(6, 8)}`,
      );

      const codigoTurnoFormatado = "009" + codigoTurnoTrabalho.padStart(3, "0");

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
        identificacao: identificacao.trim(),
        turno: {
          nome: descricaoTurno,
          cod_turno: codigoTurnoFormatado,
        },
        localidade: {
          codigo: codigoLocalidade,
          nome: descricaoLocalidade,
        },
        userName: (req?.body?.userName || "").toUpperCase(),
      });
      console.log(saved, "Identificação:", identificacao, "Nome:", nome);

      if (!saved) {
        errors.push({ identificacao, nome });
      }
    }

    return res.json({ message: "Arquivo importado com sucesso", errors });
  } catch (error) {
    return res.send({ error }).status(400);
  }
}

export async function importarArquivoCartao(
  req: { file?: Express.Multer.File | undefined; body: { userName: string } },
  res: Response,
) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).send({ error: "Falta arquivo" });
    }

    if (!req?.body?.userName) return res.status(400).send({ error: "Falta usuário" });

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
      userName: string;
      anterior?: {
        diurno: { ext1: number; ext2: number; ext3: number };
        noturno: { ext1: number; ext2: number; ext3: number };
      };
    } = {
      identificacao: "",
      funcionarioId: 0,
      referencia: new Date(),
      saldoAnterior60: 0,
      saldoAnterior100: 0,
      status: { id: 1, descricao: "IMPORTADO" },
      dias: [],
      userName: (req?.body?.userName || "").toUpperCase(),
    };

    const ultimaIdentificacao = cartaoDias[cartaoDias.length - 2].split(";")[2];
    const ultimaDia = cartaoDias[cartaoDias.length - 2].split(";")[4];

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
          const referenciaAnterior = new Date(cartao.referencia);
          referenciaAnterior.setMonth(referenciaAnterior.getMonth() - 1);

          const cartaoAnterior = await cartaoPostgresRepository.findFisrt({
            funcionarioId: cartao.funcionarioId,
            referencia: referenciaAnterior,
          });

          let anterior = {
            diurno: {
              ext1: 0,
              ext2: 0,
              ext3: 0,
            },
            noturno: {
              ext1: 0,
              ext2: 0,
              ext3: 0,
            },
          };
          if (cartaoAnterior) {
            cartaoAnterior.cartao_horario_compensado.map((compensado) => {
              if (compensado.periodoId === 1)
                anterior.diurno = { ext1: compensado.ext1, ext2: compensado.ext2, ext3: compensado.ext3 };

              if (compensado.periodoId === 2)
                anterior.noturno = { ext1: compensado.ext1, ext2: compensado.ext2, ext3: compensado.ext3 };
            });
          }
          await salvarCartao({ cartao: { ...cartao, ...{ anterior } } });
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

      cargaHor = cargaHorPrimeiroPeriodo + cargaHorSegundoPeriodo;

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

      if (ultimaDia === data && ultimaIdentificacao === identificacao) await salvarCartao({ cartao });
    }

    return res.json({ message: "Arquivo importado com sucesso", errors });
  } catch (error) {
    console.log("error", error);
    return res.send(error).status(400);
  }
}

const abonarAtestado = async (input: { cartao: { dias: { data: Date }[]; funcionarioId: number }; userName: string }) => {
  const respaldarAtestadoPostgresRepository = new RespaldarAtestadoPostgresRepository();
  const respaldarController = new RespaldarController(respaldarAtestadoPostgresRepository);

  const atestados = await respaldarAtestadoPostgresRepository.findManyAtestados({
    statusId: 2,
    funcionarioId: input.cartao.funcionarioId,
    abono: { inicio: input.cartao.dias[0].data, fim: input.cartao.dias[input.cartao.dias.length - 1].data },
  });

  for (const atestado of atestados) {
    if (atestado.abonos.length === 0 && atestado.fim && atestado.inicio) {
      const dataInicio = moment.utc(atestado.inicio).set({ h: 0, minute: 0, second: 0, millisecond: 0 }).toDate();

      const dias = await respaldarAtestadoPostgresRepository.findManyCartaoDia({
        inicio: dataInicio,
        fim: atestado.fim,
        funcionarioId: input.cartao.funcionarioId,
      });

      await respaldarController.abonar({
        atestado: { ...atestado, ...{ fim: atestado.fim, inicio: atestado.inicio } },
        userName: input.userName,
        dias,
      });
    }
  }
};

export async function importarArquivosAfastamento(
  req: { file?: Express.Multer.File | undefined; body: { userName: string } },
  res: Response,
) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).send({ error: "falta arquivo" });
    }

    if (!req?.body.userName) return res.status(400).send({ error: "Falta usuário" });

    const arquivo = Buffer.from(req.file.buffer).toString("utf-8");

    const afastamento = arquivo.split("\n");
    const funcionarioPostgresRepository = new FuncionarioPostgresRepository();

    const afastamentoRepository = new AfastamentoRepository();
    const errors: { identificacao: string; descricao: string }[] = [];

    for (const afastado of afastamento) {
      const [, , identificacao, cadStatus, descricaoStatus, inicioAfastamento, fimAfastamento, totalAfastamento] =
        afastado.split(";");

      if (!identificacao) continue;

      const existeFuncionario = await funcionarioPostgresRepository.findFisrt({ identificacao });

      if (!existeFuncionario) {
        errors.push({ identificacao, descricao: `Funcionário não encontrado pela identificacao ${identificacao}` });

        continue;
      }

      let funcionarios_afastadaos: {
        identificacao: string;
        inicio: Date;
        fim: Date | undefined;
        total: number;
        funcionarioId: number;
        userName: string;
        status: {
          id: number;
          nome: string;
        };
      } = {
        identificacao,
        inicio: new Date(`${inicioAfastamento.slice(0, 4)}-${inicioAfastamento.slice(4, 6)}-${inicioAfastamento.slice(6, 8)}`),
        fim: !fimAfastamento
          ? undefined
          : new Date(`${fimAfastamento.slice(0, 4)}-${fimAfastamento.slice(4, 6)}-${fimAfastamento.slice(6, 8)}`),
        total: Number(totalAfastamento),
        funcionarioId: existeFuncionario.id,
        userName: (req?.body?.userName || "").toUpperCase(),
        status: {
          id: Number(cadStatus),
          nome: descricaoStatus.toUpperCase(),
        },
      };

      if (funcionarios_afastadaos.identificacao !== "") {
        await afastamentoRepository.add(funcionarios_afastadaos);
      }
    }

    return res.json({ message: "Arquivo importado com sucesso", errors });
  } catch (error) {
    console.log("error", error);
    return res.send(error).status(400);
  }
}

const salvarCartao = async (input: {
  cartao: {
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
    userName: string;
    anterior?: {
      diurno: {
        ext1: number;
        ext2: number;
        ext3: number;
      };
      noturno: {
        ext1: number;
        ext2: number;
        ext3: number;
      };
    };
  };
}) => {
  const cartaoPostgresRepository = new CartaoPostgresRepository();

  const cartaoSalvo = await cartaoPostgresRepository.upsert(input.cartao);
  console.log(cartaoSalvo?.id, "Linha exportada:", input.cartao.identificacao);
  if (cartaoSalvo) await abonarAtestado({ cartao: cartaoSalvo, userName: input.cartao.userName });
};
