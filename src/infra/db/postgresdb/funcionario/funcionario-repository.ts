import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../database/Prisma";
import { FuncionarioRepository } from "../../../../data/usecase/funcionario/funcionario-repository";
import { AddFuncionarioUpsertModel } from "@domain/usecases/funcionario";

export class FuncionarioPostgresRepository implements FuncionarioRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async upsert(funcionario: AddFuncionarioUpsertModel): Promise<boolean> {
    const saveFuncionario = await this.prisma.funcionario.upsert({
      where: {
        identificacao: funcionario.identificacao,
      },
      create: {
        dataAdmissao: funcionario.dataAdmissao,
        dataDemissao: funcionario.dataDemissao,
        dataNascimento: funcionario.dataNascimento,
        filial: funcionario.filial,
        identificacao: funcionario.identificacao,
        nome: funcionario.nome,
        centro_custo: {
          connectOrCreate: {
            create: { nome: funcionario.centroCusto.nome },
            where: { nome: funcionario.centroCusto.nome },
          },
        },
        funcao: {
          connectOrCreate: {
            create: { nome: funcionario.funcao.nome },
            where: { nome: funcionario.funcao.nome },
          },
        },
        turno: {
          connectOrCreate: {
            create: { nome: funcionario.turno.nome },
            where: { nome: funcionario.turno.nome },
          },
        },
        contatos: funcionario.contato
          ? {
              connectOrCreate: {
                where: { numero: funcionario.contato.numero },
                create: { numero: funcionario.contato.numero },
              },
            }
          : undefined,
        emails: funcionario.email
          ? {
              connectOrCreate: {
                create: { nome: funcionario.email.nome },
                where: { nome: funcionario.email.nome },
              },
            }
          : undefined,
        localidade: {
          connectOrCreate: {
            where: { codigo: funcionario.localidade.codigo },
            create: { codigo: funcionario.localidade.codigo, nome: funcionario.localidade.nome },
          },
        },
        userName: funcionario.userName,
      },
      update: {
        dataAdmissao: funcionario.dataAdmissao,
        dataDemissao: funcionario.dataDemissao,
        dataNascimento: funcionario.dataNascimento,
        filial: funcionario.filial,
        identificacao: funcionario.identificacao,
        nome: funcionario.nome,
        centro_custo: {
          connectOrCreate: {
            create: { nome: funcionario.centroCusto.nome },
            where: { nome: funcionario.centroCusto.nome },
          },
        },
        funcao: {
          connectOrCreate: {
            create: { nome: funcionario.funcao.nome },
            where: { nome: funcionario.funcao.nome },
          },
        },
        turno: {
          connectOrCreate: {
            create: { nome: funcionario.turno.nome },
            where: { nome: funcionario.turno.nome },
          },
        },
        contatos: funcionario.contato
          ? {
              connectOrCreate: {
                where: { numero: funcionario.contato.numero },
                create: { numero: funcionario.contato.numero },
              },
            }
          : undefined,
        emails: funcionario.email
          ? {
              connectOrCreate: {
                create: { nome: funcionario.email.nome },
                where: { nome: funcionario.email.nome },
              },
            }
          : undefined,
        userName: funcionario.userName,
      },
    });

    await prisma.endereco.upsert({
      where: { funcionarioId: saveFuncionario.id },
      create: {
        bairro: funcionario.endereco.bairro,
        cep: funcionario.endereco.cep,
        cidade: funcionario.endereco.cidade,
        complemento: funcionario.endereco.complemento,
        estado: funcionario.endereco.estado,
        numero: funcionario.endereco.numero,
        rua: funcionario.endereco.rua,
        funcionarioId: saveFuncionario.id,
      },
      update: {
        bairro: funcionario.endereco.bairro,
        cep: funcionario.endereco.cep,
        cidade: funcionario.endereco.cidade,
        complemento: funcionario.endereco.complemento,
        estado: funcionario.endereco.estado,
        numero: funcionario.endereco.numero,
        rua: funcionario.endereco.rua,
      },
    });

    return Boolean(saveFuncionario);
  }

  public async findFisrt(input: { identificacao: string }): Promise<{ id: number } | undefined> {
    const result = await this.prisma.funcionario.findFirst({ where: { identificacao: input.identificacao } });

    if (!result) return undefined;

    return {
      id: result.id,
    };
  }
}
