import { PrismaClient } from "@prisma/client";

import { ListarAtestado } from "../../../../data/usecase/add-listar-atestados/add-listar-atestados";
import { prisma } from "../../../database/Prisma";

export class ListarAtestadoRepsository implements ListarAtestado {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<any[]> {
    const atestados = await this.prisma.atestado_funcionario.findMany({
      where: {
        tipo_status: {
          id: 1,
        },
      },
      include: {
        funcionario: true,
        tipo_acompanhante: true,
        tipo_ocupacao: true,
        tipo_status: true,
        tipos_documentos: true,
        tipo_eventos: true,
        tipo_comprovante_ausencia: true,
        funcao: true,
        tipo_certidao_obito: true,
        entradas_saidas_atestado: true,
      },
      orderBy: {
        data: "asc",
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
      trabalhou_dia: atestado.trabalhou_dia,
      observacao: atestado.observacao,
      nome: atestado.nomeFuncionario,
      exame: atestado.exame,
      nome_acompanhante: atestado.nome_acompanhante,
      identificacao: atestado.funcionario?.identificacao,
      sintomas: atestado.sintomas,
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
    }));
  }
}
