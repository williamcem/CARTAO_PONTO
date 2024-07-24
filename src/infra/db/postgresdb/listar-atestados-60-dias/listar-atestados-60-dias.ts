import { PrismaClient } from "@prisma/client";
import moment from "moment";

import { ListarAtestados60Dias } from "../../../../data/usecase/add-listar-atestados/add-listar-atestados";
import { prisma } from "../../../database/Prisma";

export class ListarAtestados60DiasRepository implements ListarAtestados60Dias {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async listar60Dias(funcionarioId: number): Promise<any[]> {
    const hoje = new Date();
    const parametros = (await this.prisma.parametros.findFirst()) || { qtdeDiasAnteriorAtestado: 60 };
    const sessentaDiasAtras = moment(hoje).add(-parametros.qtdeDiasAnteriorAtestado, "d").toDate();

    const atestados = await this.prisma.atestado_funcionario.findMany({
      where: {
        funcionarioId: Number(funcionarioId),
        statusId: {
          in: [1, 2],
        },
        data: {
          gte: sessentaDiasAtras,
          lte: hoje,
        },
      },
      include: {
        funcionario: true,
        tipo_acompanhante: true,
        tipo_ocupacao: true,
        tipo_status: true,
        tipos_documentos: true,
        tipo_eventos: true,
        funcao: true,
      },
      orderBy: {
        data: "desc",
      },
    });

    return atestados.map((atestado) => ({
      data: atestado.data,
      id: atestado.id,
      inicio: atestado.inicio,
      fim: atestado.fim,
      grupo_cid: atestado.grupo_cid,
      acidente_trabalho: atestado.acidente_trabalho,
      descricao: atestado.descricao,
      userName: atestado.userName,
      funcionarioId: atestado.funcionarioId,
      idade_paciente: atestado.idade_paciente,
      sintomas: atestado.sintomas,
      nome: atestado.nomeFuncionario,
      identificacao: atestado.funcionario?.identificacao,
      nomeAcao: atestado.tipo_eventos?.nome,
      nomeAcompanhante: atestado.tipo_acompanhante?.nome,
      nomeOcupacao: atestado.tipo_ocupacao?.nome,
      nomeStatus: atestado.tipo_status?.nome,
      nomeDocumento: atestado.tipos_documentos?.nome,
      dias: atestado?.inicio && atestado.fim ? moment(atestado.fim).diff(moment(atestado.inicio), "d") : 0,
      funcaoFuncionario: atestado.funcao.nome,
    }));
  }
}
