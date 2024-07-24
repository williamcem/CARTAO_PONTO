import fs from "fs";
import { PrismaClient } from "@prisma/client";
import moment from "moment";

const prisma = new PrismaClient();

export const exportarDadosDemitidosParaArquivo = async (
  callback: (err: Error | null, filename?: string) => void,
  identificacao?: string,
  localidadeId?: string,
) => {
  try {
    // Buscar todos os funcionários sem filtro para depuração
    const todosFuncionarios = await prisma.funcionario.findMany({
      include: {
        localidade: true,
      },
    });

    console.log("Todos os funcionários:", JSON.stringify(todosFuncionarios, null, 2));

    // Definir filtros de busca
    const where: any = {};
    if (identificacao) {
      where.identificacao = identificacao;
    }
    if (localidadeId) {
      where.localidadeId = localidadeId;
    }

    // Log para depuração
    console.log("Filtros de busca:", JSON.stringify(where, null, 2));

    // Buscar os dados das tabelas com filtros
    const funcionarios = await prisma.funcionario.findMany({
      where,
      include: {
        cartao: {
          include: {
            cartao_dia: {
              include: {
                cartao_dia_lancamentos: {
                  orderBy: {
                    entrada: "asc", // Ordena os lançamentos por entrada em ordem crescente
                  },
                },
              },
              orderBy: {
                data: "asc", // Ordena os dias de cartão por data em ordem crescente
              },
            },
          },
        },
      },
    });

    // Verificar se encontrou funcionários
    if (funcionarios.length === 0) {
      console.log("Nenhum funcionário encontrado com os critérios fornecidos.");
      return callback(null, "Nenhum funcionário encontrado com os critérios fornecidos.");
    }

    // Log para depuração
    console.log("Funcionários encontrados:", JSON.stringify(funcionarios, null, 2));

    // Preparar os dados para o arquivo
    const linhas = funcionarios.flatMap((funcionario) => {
      return funcionario.cartao.flatMap((cartao) => {
        return cartao.cartao_dia.map((dia) => {
          const lancamentos = dia.cartao_dia_lancamentos;
          // Verificar se há lançamentos para este dia
          if (lancamentos && lancamentos.length > 0) {
            const entradasSaidas = lancamentos
              .map((lancamento) => {
                // Ajustar para o fuso horário local antes de formatar o tempo
                const entradaLocal = ajustarFusoHorario(lancamento.entrada, 3); // Ajuste de 3 horas
                const saidaLocal = ajustarFusoHorario(lancamento.saida, 3); // Ajuste de 3 horas
                const entrada = formatarTempo(entradaLocal);
                const saida = formatarTempo(saidaLocal);
                return `${entrada};${saida}`;
              })
              .join(";");

            return `${funcionario.identificacao};${formatarData(dia.data)};${entradasSaidas}`;
          } else {
            // Se não houver lançamentos, retornar a identificação e a data sem lançamentos
            return `${funcionario.identificacao};${formatarData(dia.data)};`;
          }
        });
      });
    });

    const filename = "dados_da_tabela_filtrado.txt";
    const data = linhas.join("\n");

    // Verificar se há dados para escrever
    if (data.trim() === "") {
      console.log("Nenhum dado para exportar.");
      return callback(null, "Nenhum dado para exportar.");
    }

    // Escrever os dados em um arquivo de texto
    fs.writeFile(filename, data, "utf8", (err) => {
      if (err) {
        console.error("Erro ao escrever arquivo:", err);
        return callback(err);
      }
      console.log(`Os dados foram exportados para ${filename}.`);
      return callback(null, filename);
    });
  } catch (err) {
    console.error("Erro ao exportar dados:", err);
    const error = err instanceof Error ? err : new Error("Erro desconhecido");
    return callback(error);
  } finally {
    await prisma.$disconnect();
  }
};

// Função para formatar o tempo
const formatarTempo = (tempo: Date | null | undefined): string => {
  if (!tempo) return ""; // Retorna uma string vazia se o tempo for nulo ou indefinido

  const data = new Date(tempo);
  const horas = data.getHours().toString().padStart(2, "0");
  const minutos = data.getMinutes().toString().padStart(2, "0");
  return `${horas}:${minutos}`;
};

// Função para ajustar o fuso horário para o fuso horário local
const ajustarFusoHorario = (tempo: Date | null | undefined, ajuste: number): Date | null | undefined => {
  if (!tempo) return tempo; // Retorna o tempo original se for nulo ou indefinido

  // Converter o ajuste de horas para milissegundos
  const ajusteMs = ajuste * 60 * 60 * 1000;

  // Ajustar o tempo para o fuso horário local
  return new Date(tempo.getTime() + ajusteMs);
};

// Função para formatar a data sem hífens
const formatarData = (data: Date): string => {
  return moment.utc(data).format("YYYYMMDD");
};
