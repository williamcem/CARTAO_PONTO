import { PrismaClient } from "@prisma/client";

import { ListarTodosAtestados } from "../../../../data/usecase/add-listar-atestados/add-listar-atestados";
import { prisma } from "../../../database/Prisma";

export class ListarTodosAtestadoRepsository implements ListarTodosAtestados {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async listarTodos(funcionarioId: number): Promise<any[]> {
    const funcionarioIdConvertido = Number(funcionarioId);
    console.log("funcionarioId Original:", funcionarioId, typeof funcionarioId); // Valor original
    console.log("funcionarioId Valor Convertido:", funcionarioIdConvertido, typeof funcionarioIdConvertido); // Verificar a conversão

    const atestados = await this.prisma.atestado_funcionario.findMany({
      where: {
        funcionarioId: funcionarioIdConvertido,
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
      sintomas: atestado.sintomas,
      trabalhou_dia: atestado.trabalhou_dia,
      horario_trabalhado_inicio: atestado.horario_trabalhado_inicio,
      horario_trabalhado_fim: atestado.horario_trabalhado_fim,
      nome: atestado.funcionario?.nome,
      identificacao: atestado.funcionario?.identificacao,
      nomeAcao: atestado.tipo_eventos?.nome,
      nomeAcompanhante: atestado.tipo_acompanhante?.nome,
      nomeOcupacao: atestado.tipo_ocupacao?.nome,
      nomeStatus: atestado.tipo_status?.nome,
      nomeDocumento: atestado.tipos_documentos?.nome,
      nomeComprovante: atestado.tipo_acompanhante?.nome,
    }));
  }
}
