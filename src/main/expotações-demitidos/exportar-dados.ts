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
                eventos: true,
                atestado_abonos: true,
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
        return cartao.cartao_dia.flatMap((dia) => {
          // Filtrar os eventos com tipoId igual a 5
          const eventosFiltrados = dia.eventos.filter((evento) => evento.tipoId === 5);
          const minutosInjustificados = eventosFiltrados.reduce((total, evento) => total + evento.minutos, 0);

          // Filtrar os abonos justificados
          const abonosJustificados = dia.atestado_abonos;
          const minutosJustificados = abonosJustificados.reduce((total, abono) => total + abono.minutos, 0);

          const linhasDia = [];

          if (minutosInjustificados > 0) {
            linhasDia.push(`${funcionario.identificacao};${formatarData(dia.data)};FALTA INJUSTIFICADA ${minutosInjustificados}`);
          }

          if (minutosJustificados > 0) {
            linhasDia.push(`${funcionario.identificacao};${formatarData(dia.data)};FALTA JUSTIFICADA ${minutosJustificados}`);
          }

          return linhasDia;
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

// Função para formatar a data sem hífens
const formatarData = (data: Date): string => {
  return moment.utc(data).format("YYYYMMDD");
};
