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
    const sessentaDiasAtras = new Date();
    const comFormato = moment(sessentaDiasAtras.setDate(hoje.getDate() - 60))
      .utc(true)
      .toDate();
    console.log("Aquiiiii", comFormato);

    const atestados = await this.prisma.atestado_funcionario.findMany({
      where: {
        funcionarioId: funcionarioId,
        statusId: {
          in: [1, 2],
        },
        data: {
          gte: comFormato,
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
      nome: atestado.funcionario?.nome,
      identificacao: atestado.funcionario?.identificacao,
      nomeAcao: atestado.tipo_eventos?.nome,
      nomeAcompanhante: atestado.tipo_acompanhante?.nome,
      nomeOcupacao: atestado.tipo_ocupacao?.nome,
      nomeStatus: atestado.tipo_status?.nome,
      nomeDocumento: atestado.tipos_documentos?.nome,
    }));
  }
}