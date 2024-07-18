import { PrismaClient } from "@prisma/client";

import { ListarTodosAtestados } from "../../../../data/usecase/add-listar-atestados/add-listar-atestados";
import { prisma } from "../../../database/Prisma";

export class ListarTodosAtestadoRepsository implements ListarTodosAtestados {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async listarTodos(): Promise<any[]> {
    const atestados = await this.prisma.atestado_funcionario.findMany({
      include: {
        funcionario: true,
        tipo_acompanhante: true,
        tipo_ocupacao: true,
        tipo_status: true,
        tipos_documentos: true,
        tipo_eventos: true,
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
