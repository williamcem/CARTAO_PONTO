import { badRequestNovo } from "../../helpers/http-helpers";
import { GerarArquivoFechamentoCartaoPostgresRepository } from "@infra/db/postgresdb/gerar-arquivo-fechamento-cartao/gerar-arquivo-fechamento-cartao";
import moment from "moment";
import { Request, Response } from "express";

export class GerarArquivoFechamentoCartaoController {
  constructor(private gerarArquivoFechamentoCartaoPostgresRepository: GerarArquivoFechamentoCartaoPostgresRepository) {}

  async handle(req: Request, res: Response) {
    if (!req?.query?.referencia) return res.send({ message: "Falta referência!" });

    const referencia = moment.utc(String(req.query.referencia));

    if (!referencia.isValid()) return badRequestNovo({ message: "Data referência inválida!" });

    const cartoes = await this.gerarArquivoFechamentoCartaoPostgresRepository.findManyCartao({
      referencia: referencia.toDate(),
      statusId: 2,
    });

    const cartoesParaExportar: {
      identificacao: string;
      data: string;
      pagar: {
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
      compensar: {
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
    }[] = [];

    if (!cartoes.length)
      return badRequestNovo({ message: `Nenhum cartão encontrado para a referência ${referencia.format("DD/MM/YYYY")}!` });

    cartoes.map((cartao) => {
      let fechamento = {
        identificacao: cartao.funcionario.identificacao,
        data: referencia.format("YYYYMM"),
        pagar: {
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
        },
        compensar: {
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
        },
      };

      cartao.cartao_horario_pago.map((pagar) => {
        if (pagar.periodoId === 1)
          fechamento.pagar.diurno = {
            ext1: pagar.ext1,
            ext2: pagar.ext2,
            ext3: pagar.ext3,
          };
        if (pagar.periodoId === 2)
          fechamento.pagar.noturno = {
            ext1: pagar.ext1,
            ext2: pagar.ext2,
            ext3: pagar.ext3,
          };
      });

      cartao.cartao_horario_compensado.map((compensar) => {
        if (compensar.periodoId === 1)
          fechamento.compensar.diurno = {
            ext1: compensar.ext1,
            ext2: compensar.ext2,
            ext3: compensar.ext3,
          };
        if (compensar.periodoId === 2)
          fechamento.compensar.noturno = {
            ext1: compensar.ext1,
            ext2: compensar.ext2,
            ext3: compensar.ext3,
          };
      });

      cartoesParaExportar.push(fechamento);
    });

    cartoesParaExportar.sort((a, b) => a.identificacao.localeCompare(b.identificacao));

    let data = "";

    cartoesParaExportar.map(
      (cartao) =>
        (data += `${cartao.identificacao};${cartao.data};PAGAR;DIURNO;${cartao.pagar.diurno.ext1};${cartao.pagar.diurno.ext2};${cartao.pagar.diurno.ext3};NOTURNO;${cartao.pagar.noturno.ext1};${cartao.pagar.noturno.ext2};${cartao.pagar.noturno.ext3}\n${cartao.identificacao};${cartao.data};COMPENSAR;DIURNO;${cartao.compensar.diurno.ext1};${cartao.compensar.diurno.ext2};${cartao.compensar.diurno.ext3};NOTURNO;${cartao.compensar.noturno.ext1};${cartao.compensar.noturno.ext2};${cartao.compensar.noturno.ext3}\n`),
    );

    return { body: Buffer.from(data, "utf-8"), statusCode: 200, type: "txt" };
  }
}
