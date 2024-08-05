import { Prisma, PrismaClient } from "@prisma/client";

const db = new PrismaClient();

db.$extends({
  query: {
    funcionario: {
      $allOperations({ model, operation, args, query }) {
        if (operation == "update")
          triggerSalvarHistoricoFuncionario({
            centroCusto: args.data.centro_custo?.connectOrCreate?.where.nome,
            createAt: args.data.createAt,
            dataAdmissao: args.data.dataAdmissao,
            dataDemissao: args.data.dataDemissao,
            dataNascimento: args.data.dataNascimento,
            filial: args.data.filial,
            funcao: args.data.funcao?.connectOrCreate?.where.nome,
            id: args.where.id,
            identificacao: args.data.identificacao,
            localidade: args.data.localidade?.connectOrCreate?.where.codigo,
            nome: args.data.nome,
            turno: args.data.turno?.connectOrCreate?.where.nome,
            updateAt: args.data.updateAt,
            userName: args.data.userName,
          });
        if (operation == "upsert") {
          triggerSalvarHistoricoFuncionario({
            centroCusto: args.create.centro_custo?.connectOrCreate?.where.nome,
            createAt: args.create.createAt,
            dataAdmissao: args.create.dataAdmissao,
            dataDemissao: args.create.dataDemissao,
            dataNascimento: args.create.dataNascimento,
            filial: args.create.filial,
            funcao: args.create.funcao?.connectOrCreate?.where.nome,
            id: args.where.id,
            identificacao: args.create.identificacao,
            localidade: args.create.localidade?.connectOrCreate?.where.codigo,
            nome: args.create.nome,
            turno: args.create.turno?.connectOrCreate?.where.cod_turno,
            updateAt: args.create.updateAt,
            userName: args.create.userName,
          });
        }

        return query(args);
      },
    },
  },
});

export const prisma = db;

export type prismaPromise = Prisma.PrismaPromise<any>;

const triggerSalvarHistoricoFuncionario = async (input: Funcionario) => {
  const funcionario = await prisma.funcionario.findFirst({
    where: { identificacao: input.identificacao },
    include: {
      centro_custo: true,
      funcao: true,
      turno: true,
      localidade: true,
    },
  });

  if (!funcionario) return;

  let diferente = false;

  const centroCusto = await prisma.centro_custo.findFirst({ where: { nome: input.centroCusto } });
  const turno = await prisma.turno.findFirst({ where: { cod_turno: input.turno } });
  const funcao = await prisma.funcao.findFirst({ where: { nome: input.funcao } });

  const inputDataDemissao = new Date(input.dataDemissao).getTime() || false;
  const funcDataDemissao = new Date(funcionario?.dataDemissao == null ? undefined : funcionario?.dataDemissao).getTime() || false;

  if (funcao?.nome != funcionario.funcao.nome) diferente = true;
  if (turno?.cod_turno != funcionario.turno.cod_turno) diferente = true;
  if (centroCusto?.nome != funcionario.centro_custo.nome) diferente = true;
  if (inputDataDemissao != funcDataDemissao) diferente = true;
  if (input.nome != funcionario.nome) diferente = true;
  if (new Date(input.dataAdmissao).getTime() != new Date(funcionario.dataAdmissao).getTime()) diferente = true;
  if (new Date(input.dataNascimento).getTime() != new Date(funcionario.dataNascimento).getTime()) diferente = true;
  if (input.filial != funcionario.filial) diferente = true;
  if (input.localidade != funcionario.localidade.codigo) diferente = true;

  if (diferente) {
    await prisma.funcionario_historico.create({
      data: {
        dataAdmissao: funcionario.dataAdmissao,
        dataNascimento: funcionario.dataNascimento,
        filial: funcionario.filial,
        identificacao: funcionario.identificacao,
        nome: funcionario.nome,
        centroCustoId: funcionario.centroCustoId,
        funcaoId: funcionario.funcaoId,
        localidadeId: funcionario.localidadeId,
        id: funcionario.id,
        turnoId: funcionario.turnoId,
        createAt: funcionario.createAt,
        dataDemissao: funcionario.dataDemissao,
        updateAt: funcionario.updateAt,
        userName: funcionario.userName,
      },
    });
  }
};

type Funcionario = {
  dataAdmissao?: any;
  dataNascimento?: any;
  filial?: any;
  identificacao?: any;
  nome?: any;
  centroCusto?: any;
  funcao?: any;
  localidade?: any;
  id?: any;
  turno?: any;
  createAt?: any;
  dataDemissao?: any;
  updateAt?: any;
  userName?: any;
};
