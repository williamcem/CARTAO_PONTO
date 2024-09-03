import fs from "fs";
import { PrismaClient } from "@prisma/client";
import moment from "moment";

const prisma = new PrismaClient();

export const exportarDadosParaArquivo = async () => {
  try {
    // Buscar os dados das tabelas
    const funcionarios = await prisma.funcionario.findMany({
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

    // Buscar os tipos de faltas
    const tiposFaltas = await prisma.tipo_faltas_expotacao.findMany();
    const faltasMap: Record<string, string> = tiposFaltas.reduce(
      (map, falta) => {
        map[falta.nome] = falta.codigo;
        return map;
      },
      {} as Record<string, string>,
    );

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

          // Verificar e adicionar faltas injustificadas
          if (minutosInjustificados > 0) {
            if (minutosInjustificados === dia.cargaHor) {
              const tipoFalta = "FALTA INJUSTIFICADA TOTAL";
              linhasDia.push(
                `${funcionario.identificacao};${formatarData(dia.data)};${tipoFalta};${faltasMap[tipoFalta]};${minutosInjustificados}`,
              );
            } else if (minutosInjustificados < dia.cargaHor) {
              const tipoFalta = "FALTA INJUSTIFICADA PARCIAL";
              linhasDia.push(
                `${funcionario.identificacao};${formatarData(dia.data)};${tipoFalta};${faltasMap[tipoFalta]};${minutosInjustificados}`,
              );
            }
          }

          // Verificar e adicionar faltas justificadas
          if (minutosJustificados > 0) {
            if (minutosJustificados === dia.cargaHor) {
              const tipoFalta = "FALTA JUSTIFICADA TOTAL";
              linhasDia.push(
                `${funcionario.identificacao};${formatarData(dia.data)};${tipoFalta};${faltasMap[tipoFalta]};${minutosJustificados}`,
              );
            } else if (minutosJustificados < dia.cargaHor) {
              const tipoFalta = "FALTA JUSTIFICADA PARCIAL";
              linhasDia.push(
                `${funcionario.identificacao};${formatarData(dia.data)};${tipoFalta};${faltasMap[tipoFalta]};${minutosJustificados}`,
              );
            }
          }

          return linhasDia;
        });
      });
    });

    const filename = "dados_da_tabela.txt";
    const data = linhas.join("\n");

    // Escrever os dados em um arquivo de texto
    fs.writeFileSync(filename, data);

    return Buffer.from(data, "utf-8");
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
