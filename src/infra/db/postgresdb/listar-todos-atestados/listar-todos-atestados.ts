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
        tipo_comprovante_ausencia: true,
        tipo_certidao_obito: true,
        funcao: true,
        entradas_saidas_atestado: true,
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
      observacao: atestado.observacao,
      exame: atestado.exame,
      nome_acompanhante: atestado.nome_acompanhante,
      horario_trabalhado_inicio: atestado.horario_trabalhado_inicio,
      horario_trabalhado_fim: atestado.horario_trabalhado_fim,
      nome: atestado.funcionario?.nome,
      identificacao: atestado.funcionario?.identificacao,
      nomeAcao: atestado.tipo_eventos?.nome,
      nomeAcompanhante: atestado.tipo_acompanhante?.nome,
      nomeOcupacao: atestado.tipo_ocupacao?.nome,
      nomeStatus: atestado.tipo_status?.nome,
      nomeDocumento: atestado.tipos_documentos?.nome,
      nomeComprovante: atestado.tipo_comprovante_ausencia?.nome,
      nomeCertidao: atestado.tipo_certidao_obito?.nome,
      funcao: atestado.funcao.nome,
      horarios: atestado.entradas_saidas_atestado.map((valor) => ({
        entrada: valor.entrada,
        saida: valor.saida,
      })),
      diasAusencia: atestado.diasAusencia,
    }));
  }
}
