import { cartao } from "@prisma/client";
import { describe, expect, test } from "vitest";

import { CriarEventosPostgresRepository } from "./eventos-repository";

describe("Gerar Eventos", () => {
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository();

  test("Teste carga 18.00;23.30;00.30;01.54;01.09 -- Somente o segundo periodo, cargaHor 414", async () => {
    const lancamentos = [
      {
        periodoId: 2,
        entrada: new Date("2024-05-27T00:00:00.000Z"),
        saida: new Date("2024-05-27T01:24:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "00:00 - 01:24",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 84,
      },
      {
        hora: "18:00 - 00:00",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -360,
      },
      {
        hora: "18:00 - 00:00",
        tipoId: 4,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -17,
      },
      {
        hora: "01:54 - 01:24",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -30,
      },
      {
        hora: "01:24 - 01:54",
        tipoId: 4,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -4,
      },
    ]);
  });

  test("Teste carga 18.00;23.30;00.30;01.54;01.09 -- Somente o primeiro, cargaHor 414", async () => {
    const lancamentos = [
      {
        periodoId: 1,
        entrada: new Date("2024-05-26T18:20:00.000Z"),
        saida: new Date("2024-05-26T23:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "18:20 - 23:00",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 280,
      },
      {
        hora: "18:00 - 18:20",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -20,
      },
      {
        hora: "23:00 - 01:54",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -174,
      },
      {
        hora: "23:00 - 01:54",
        tipoId: 4,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -24,
      },
    ]);
  });

  test("Teste carga 18.00;23.30;00.30;01.54;01.09 -- Os dois com diferenças menores, cargaHor 414", async () => {
    const lancamentos = [
      {
        periodoId: 1,
        entrada: new Date("2024-05-26T18:20:00.000Z"),
        saida: new Date("2024-05-26T23:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
      {
        periodoId: 2,
        entrada: new Date("2024-05-27T00:00:00.000Z"),
        saida: new Date("2024-05-27T01:24:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "18:20 - 23:00",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 280,
      },
      {
        hora: "18:00 - 18:20",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -20,
      },
      {
        hora: "00:00 - 01:24",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 84,
      },
      {
        hora: "01:24 - 01:54",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -30,
      },
      {
        hora: "01:24 - 01:54",
        tipoId: 4,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -4,
      },
    ]);
  });

  test("Teste carga 18.00;23.30;00.30;01.54;01.09 -- O segundo com diferença maior, cargaHor 414", async () => {
    const lancamentos = [
      {
        periodoId: 1,
        entrada: new Date("2024-05-26T18:20:00.000Z"),
        saida: new Date("2024-05-26T23:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
      {
        periodoId: 2,
        entrada: new Date("2024-05-27T00:00:00.000Z"),
        saida: new Date("2024-05-27T03:54:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "18:20 - 23:00",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 280,
      },
      {
        hora: "18:00 - 18:20",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -20,
      },
      {
        hora: "00:00 - 03:54",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 234,
      },
      {
        hora: "01:54 - 03:54",
        tipoId: 4,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 17,
      },
    ]);
  });

  test("Teste carga 18.00;23.30;00.30;01.54;01.09 -- O segundo com diferença MUITOOO maior, cargaHor 414", async () => {
    const lancamentos = [
      {
        periodoId: 1,
        entrada: new Date("2024-05-26T18:20:00.000Z"),
        saida: new Date("2024-05-26T23:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
      {
        periodoId: 2,
        entrada: new Date("2024-05-27T00:00:00.000Z"),
        saida: new Date("2024-05-27T07:54:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "18:20 - 23:00",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 280,
      },
      {
        hora: "18:00 - 18:20",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -20,
      },
      {
        hora: "00:00 - 07:54",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 474,
      },
      {
        hora: "01:54 - 07:54",
        tipoId: 4,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 26,
      },
    ]);
  });

  test("Teste carga 07.12;12.30;13.30;17.00;01.00 -- Os dois com diferenças menores, cargaHor 528", async () => {
    const lancamentos = [
      {
        periodoId: 1,
        entrada: new Date("2024-05-26T07:32:00.000Z"),
        saida: new Date("2024-05-26T12:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
      {
        periodoId: 2,
        entrada: new Date("2024-05-26T13:00:00.000Z"),
        saida: new Date("2024-05-26T16:30:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "07:32 - 12:00",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 268,
      },
      {
        hora: "07:12 - 07:32",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -20,
      },
      {
        hora: "13:00 - 16:30",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 210,
      },
      {
        hora: "16:30 - 17:00",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -30,
      },
    ]);
  });

  test("Teste carga 07.12;12.30;13.30;17.00;01.00 -- Somente o priemiro periodo, cargaHor 528", async () => {
    const lancamentos = [
      {
        periodoId: 1,
        entrada: new Date("2024-05-26T07:32:00.000Z"),
        saida: new Date("2024-05-26T12:30:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "07:32 - 12:30",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 298,
      },
      {
        hora: "07:12 - 07:32",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -20,
      },
      {
        hora: "12:30 - 17:00",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -270,
      },
    ]);
  });

  test("Teste carga 07.12;12.30;13.30;17.00;01.00 -- Somente o segundo periodo, cargaHor 528", async () => {
    const lancamentos = [
      {
        periodoId: 2,
        entrada: new Date("2024-05-26T12:00:00.000Z"),
        saida: new Date("2024-05-26T16:40:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "12:00 - 16:40",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 280,
      },
      {
        hora: "07:12 - 12:00",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -288,
      },
      {
        hora: "17:00 - 16:40",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -20,
      },
    ]);
  });

  test("Teste carga 03.30;07.52;00.00;00.00;00.00 -- Somente o primeiro periodo -- SÓ EXISTE ESSE, cargaHor 262", async () => {
    const lancamentos = [
      {
        periodoId: 1,
        entrada: new Date("2024-06-01T03:00:00.000Z"),
        saida: new Date("2024-06-01T07:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-06-01T00:00:00.000Z"),
          cargaHorariaCompleta: "03.30;07.52;00.00;00.00;00.00",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "03:00 - 07:00",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 240,
      },
      {
        hora: "03:00 - 03:30",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 30,
      },
      {
        hora: "03:00 - 03:30",
        tipoId: 4,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 4,
      },
      {
        hora: "07:00 - 07:52",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -52,
      },
    ]);
  });

  test("Teste carga 22.53;00.15;01.30;05.56;01.26 -- Os dois com diferenças menores -- cargaHor 348, Domingo", async () => {
    const lancamentos = [
      {
        periodoId: 1,
        entrada: new Date("2024-06-02T22:23:00.000Z"),
        saida: new Date("2024-06-03T00:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-06-02T00:00:00.000Z"),
          cargaHorariaCompleta: "22.53;00.15;01.30;05.56;01.26",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
      {
        periodoId: 2,
        entrada: new Date("2024-06-03T01:15:00.000Z"),
        saida: new Date("2024-06-03T05:26:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-06-02T00:00:00.000Z"),
          cargaHorariaCompleta: "22.53;00.15;01.30;05.56;01.26",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "22:23 - 00:00",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 97,
      },
      {
        hora: "22:23 - 22:53",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 30,
      },
      {
        hora: "22:23 - 22:53",
        tipoId: 4,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 4,
      },
      {
        hora: "00:00 - 05:26",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 326,
      },
      {
        hora: "05:26 - 05:56",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -30,
      },
    ]);
  });

  test("Teste carga 07.00;12.45;13.45;15.20;01.00 -- Os dois com diferenças menores -- cargaHor 440", async () => {
    const lancamentos = [
      {
        periodoId: 1,
        entrada: new Date("2024-05-26T07:12:00.000Z"),
        saida: new Date("2024-05-26T11:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "07.00;12.45;13.45;15.20;01.00",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
      {
        periodoId: 2,
        entrada: new Date("2024-06-01T12:00:00.000Z"),
        saida: new Date("2024-06-01T14:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "07.00;12.45;13.45;15.20;01.00",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "07:12 - 11:00",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 228,
      },
      {
        hora: "07:00 - 07:12",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -12,
      },
      {
        hora: "12:00 - 14:00",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 120,
      },
      {
        hora: "14:00 - 15:20",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -80,
      },
    ]);
  });

  test("Teste carga 07.00;12.45;13.45;15.20;01.00 -- O Segundo com diferença maior -- cargaHor 440", async () => {
    const lancamentos = [
      {
        periodoId: 1,
        entrada: new Date("2024-05-26T07:12:00.000Z"),
        saida: new Date("2024-05-26T11:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "07.00;12.45;13.45;15.20;01.00",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
      {
        periodoId: 2,
        entrada: new Date("2024-05-26T12:00:00.000Z"),
        saida: new Date("2024-05-26T17:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "07.00;12.45;13.45;15.20;01.00",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "07:12 - 11:00",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 228,
      },
      {
        hora: "07:00 - 07:12",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -12,
      },

      {
        hora: "12:00 - 17:00",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 300,
      },
    ]);
  });

  test("Teste carga 07.00;12.45;13.45;15.20;01.00 -- Somente o Priemiro -- cargaHor 440", async () => {
    const lancamentos = [
      {
        periodoId: 1,
        entrada: new Date("2024-05-26T07:12:00.000Z"),
        saida: new Date("2024-05-26T11:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "07.00;12.45;13.45;15.20;01.00",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "07:12 - 11:00",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 228,
      },
      {
        hora: "07:00 - 07:12",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -12,
      },
      {
        hora: "11:00 - 15:20",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -260,
      },
    ]);
  });

  test("Teste carga 07.00;12.45;13.45;15.20;01.00 -- Somente o Segundo -- cargaHor 440", async () => {
    const lancamentos = [
      {
        periodoId: 1,
        entrada: new Date("2024-05-26T11:00:00.000Z"),
        saida: new Date("2024-05-26T15:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "07.00;12.45;13.45;15.20;01.00",
          cartao: {
            funcionario: {
              id: 1,
            },
          },
        },
      },
    ];

    const eventos = criarEventosPostgresRepository.gerarEventos({
      lancamentos,
    });

    expect(eventos).toStrictEqual([
      {
        hora: "11:00 - 15:00",
        tipoId: 1,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: 240,
      },
      {
        hora: "07:00 - 11:00",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -240,
      },
      {
        hora: "15:00 - 15:20",
        tipoId: 2,
        cartaoDiaId: 6121,
        funcionarioId: 1,
        minutos: -20,
      },
    ]);
  });
});


/* import { PrismaClient } from "@prisma/client";
import moment from "moment";
import { prisma } from "@infra/database/Prisma";
import { AdicionarEventos } from "../../../../data/usecase/add-eventos/add-eventos";
import { criarEventoIntervaloEntrePeriodos } from "./intervaloEntrePeriodos";
import { criarEventoAdicionalNoturno } from "./adicionalNoturno";

export class CriarEventosPostgresRepository implements AdicionarEventos {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async add(input: { identificacao?: string }): Promise<boolean> {
    const lancamentos = await this.prisma.cartao_dia_lancamento.findMany({
      include: {
        cartao_dia: {
          include: {
            cartao: {
              include: {
                funcionario: true,
              },
            },
          },
        },
      },
      where: {
        cartao_dia: { cartao: { funcionario: { identificacao: input?.identificacao } } },
      },
    });

    const eventosData = this.gerarEventos({ lancamentos });

    const validEventosData = eventosData.filter((evento) => evento.cartaoDiaId && evento.hora);

    const existingEvents = await this.prisma.eventos.findMany({
      where: {
        OR: validEventosData.map((evento) => ({
          cartaoDiaId: evento.cartaoDiaId,
          funcionarioId: evento.funcionarioId,
          hora: evento.hora,
        })),
      },
    });

    const newEventosData = validEventosData.filter((evento) => {
      return !existingEvents.some(
        (existingEvent) =>
          existingEvent.cartaoDiaId === evento.cartaoDiaId &&
          existingEvent.funcionarioId === evento.funcionarioId &&
          existingEvent.hora === evento.hora,
      );
    });

    if (newEventosData.length === 0) {
      console.log("Eventos já existem para as datas fornecidas.");
      return false;
    }

    await this.prisma.eventos.createMany({
      data: newEventosData,
    });

    return true;
  }

  public gerarEventos(input: {
    lancamentos: {
      entrada: Date | null;
      saida: Date | null;
      periodoId: number;
      cartao_dia: {
        id: number;
        data: Date;
        cargaHorariaCompleta: string;
        cartao: {
          funcionario: {
            id: number;
          };
        };
      };
    }[];
  }) {
    const eventos: any[] = [];
    let excedenteForaDoIntervalo = false;

    input.lancamentos.forEach((lancamento, index, lancamentosArray) => {
      if (!lancamento.entrada || !lancamento.saida) return;

      const entrada = this.pegarLancamento({ data: lancamento.entrada });
      const saida = this.pegarLancamento({ data: lancamento.saida });

      console.log(`Entrada: ${entrada.format("HH:mm")} - Saída: ${saida.format("HH:mm")}`);

      const cargaHorariaCompletaArray = this.pegarCargaHorarioCompleta(lancamento.cartao_dia.cargaHorariaCompleta);
      const horarioEntradaEsperado1 = this.pegarHorarioCargaHoraria({
        data: lancamento.cartao_dia.data,
        hora: cargaHorariaCompletaArray[0].hora,
        minuto: cargaHorariaCompletaArray[0].minuto,
        utc: false,
      });
      const horarioSaidaEsperado = this.pegarHorarioCargaHoraria({
        data: lancamento.cartao_dia.data,
        hora: cargaHorariaCompletaArray[cargaHorariaCompletaArray.length - 2].hora,
        minuto: cargaHorariaCompletaArray[cargaHorariaCompletaArray.length - 2].minuto,
        utc: false,
      });

      console.log(`Horário Entrada Esperado: ${horarioEntradaEsperado1.format("HH:mm")}`);
      console.log(`Horário Saída Esperado: ${horarioSaidaEsperado.format("HH:mm")}`);
      console.log(`Saída Real: ${saida.format("HH:mm")}`);

      this.extrairEventosPeriodo(
        lancamento,
        entrada,
        saida,
        horarioEntradaEsperado1,
        horarioSaidaEsperado,
        eventos,
        index === lancamentosArray.length - 1,
        excedenteForaDoIntervalo,
      );

      if (index < lancamentosArray.length - 1) {
        const proximoLancamento = lancamentosArray[index + 1];
        if (proximoLancamento.periodoId === lancamento.periodoId + 1) {
          const horarioSaidaPeriodoAtual = saida;
          const horarioEntradaProximoPeriodo = moment.utc(proximoLancamento.entrada);
          this.extrairIntervalosEntrePeriodos(horarioSaidaPeriodoAtual, horarioEntradaProximoPeriodo, lancamento, eventos);
        }
      }

      if (!excedenteForaDoIntervalo) {
        const excedentePositivo = saida.diff(horarioSaidaEsperado, "minutes");
        if (Math.abs(excedentePositivo) > 5) {
          excedenteForaDoIntervalo = true;
        }
      }
    });

    return eventos;
  }

  private extrairEventosPeriodo(
    lancamento: any,
    entrada: moment.Moment,
    saida: moment.Moment,
    horarioEntradaEsperado1: moment.Moment,
    horarioSaidaEsperado: moment.Moment,
    eventos: any[],
    isUltimoPeriodo: boolean,
    excedenteForaDoIntervalo: boolean,
  ) {
    const periodoId = lancamento.periodoId;
    if (horarioSaidaEsperado.isBefore(horarioEntradaEsperado1)) {
      horarioSaidaEsperado.add(1, "day");
    }

    if (periodoId === 1) {
      this.criarEventoPeriodo1(lancamento, entrada, saida, horarioEntradaEsperado1, eventos, excedenteForaDoIntervalo);
    } else if (periodoId === 2) {
      this.criarEventoPeriodo2(lancamento, entrada, saida, horarioSaidaEsperado, eventos, excedenteForaDoIntervalo);
    }

    if (isUltimoPeriodo) {
      const eventoAdicionalNoturno = criarEventoAdicionalNoturno(horarioSaidaEsperado, saida, lancamento);
      if (eventoAdicionalNoturno) {
        eventos.push(eventoAdicionalNoturno);
        console.log(
          `Evento Adicional Noturno criado: ${eventoAdicionalNoturno.hora} - Tipo: ${eventoAdicionalNoturno.tipoId} - Minutos: ${eventoAdicionalNoturno.minutos}`,
        );
      }
    }
  }

  private criarEventoPeriodo1(
    lancamento: any,
    entrada: moment.Moment,
    saida: moment.Moment,
    horarioEntradaEsperado1: moment.Moment,
    eventos: any[],
    excedenteForaDoIntervalo: boolean,
  ) {
    const eventoPeriodo1 = {
      cartaoDiaId: lancamento.cartao_dia.id,
      hora: `${horarioEntradaEsperado1.format("HH:mm")} - ${saida.format("HH:mm")}`,
      tipoId: 1,
      funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
      minutos: saida.diff(horarioEntradaEsperado1, "minutes"),
    };
    eventos.push(eventoPeriodo1);
    console.log(`Evento criado: ${eventoPeriodo1.hora} - Tipo: ${eventoPeriodo1.tipoId} - Minutos: ${eventoPeriodo1.minutos}`);

    const eventoExcedentePositivo = {
      cartaoDiaId: lancamento.cartao_dia.id,
      hora: `${entrada.format("HH:mm")} - ${horarioEntradaEsperado1.format("HH:mm")}`,
      tipoId: 1,
      funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
      minutos: horarioEntradaEsperado1.diff(entrada, "minutes"),
    };
    if (eventoExcedentePositivo.minutos < 0) {
      eventoExcedentePositivo.hora = `${horarioEntradaEsperado1.format("HH:mm")} - ${entrada.format("HH:mm")}`;
    }

    if (excedenteForaDoIntervalo || Math.abs(eventoExcedentePositivo.minutos) > 5) {
      eventos.push(eventoExcedentePositivo);
      console.log(
        `Evento criado: ${eventoExcedentePositivo.hora} - Tipo: ${eventoExcedentePositivo.tipoId} - Minutos: ${eventoExcedentePositivo.minutos}`,
      );
    }
  }

  private criarEventoPeriodo2(
    lancamento: any,
    entrada: moment.Moment,
    saida: moment.Moment,
    horarioSaidaEsperado: moment.Moment,
    eventos: any[],
    excedenteForaDoIntervalo: boolean,
  ) {
    if (saida.isBefore(horarioSaidaEsperado)) {
      const eventoPeriodoReal = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${saida.format("HH:mm")} - ${entrada.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(entrada, "minutes"),
      };
      eventos.push(eventoPeriodoReal);
      console.log(
        `Evento criado: ${eventoPeriodoReal.hora} - Tipo: ${eventoPeriodoReal.tipoId} - Minutos: ${eventoPeriodoReal.minutos}`,
      );

      const eventoExcedentePositivo = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${horarioSaidaEsperado.format("HH:mm")} - ${saida.format("HH:mm")}`,
        tipoId: 2,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(horarioSaidaEsperado, "minutes"),
      };

      if (excedenteForaDoIntervalo || Math.abs(eventoExcedentePositivo.minutos) > 5) {
        eventos.push(eventoExcedentePositivo);
        console.log(
          `Evento criado: ${eventoExcedentePositivo.hora} - Tipo: ${eventoExcedentePositivo.tipoId} - Minutos: ${eventoExcedentePositivo.minutos}`,
        );
      }
    } else {
      const eventoPeriodoEsperado = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${entrada.format("HH:mm")} - ${horarioSaidaEsperado.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: horarioSaidaEsperado.diff(entrada, "minutes"),
      };
      eventos.push(eventoPeriodoEsperado);
      console.log(
        `Evento criado: ${eventoPeriodoEsperado.hora} - Tipo: ${eventoPeriodoEsperado.tipoId} - Minutos: ${eventoPeriodoEsperado.minutos}`,
      );

      const eventoExcedentePositivo = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${horarioSaidaEsperado.format("HH:mm")} - ${saida.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(horarioSaidaEsperado, "minutes"),
      };

      if (excedenteForaDoIntervalo || Math.abs(eventoExcedentePositivo.minutos) > 5) {
        eventos.push(eventoExcedentePositivo);
        console.log(
          `Evento criado: ${eventoExcedentePositivo.hora} - Tipo: ${eventoExcedentePositivo.tipoId} - Minutos: ${eventoExcedentePositivo.minutos}`,
        );
      }
    }
  }

  public extrairIntervalosEntrePeriodos(
    horarioSaidaPeriodoAtual: moment.Moment,
    horarioEntradaProximoPeriodo: moment.Moment,
    lancamento: any,
    eventos: any[],
  ) {
    const eventoIntervalo = criarEventoIntervaloEntrePeriodos(
      horarioSaidaPeriodoAtual,
      horarioEntradaProximoPeriodo,
      lancamento,
      eventos.length,
    );
    if (eventoIntervalo) {
      eventos.push(eventoIntervalo);
      console.log(`Evento Intervalo: ${eventoIntervalo.hora} - Minutos: ${eventoIntervalo.minutos}`);
    }
  }

  public pegarLancamento(input: { data: Date }) {
    return moment.utc(input.data);
  }

  public pegarCargaHorarioCompleta(input: string) {
    const horaMinutos = input.replaceAll(".", ":").split(";");
    return horaMinutos.map((a) => {
      const [hora, minuto] = a.split(":");
      return { hora: Number(hora), minuto: Number(minuto) };
    });
  }

  public pegarHorarioCargaHoraria(input: { data: Date; hora: number; minuto: number; utc?: boolean }) {
    return moment.utc(input.data).set({
      hours: input.hora,
      minutes: input.minuto,
      date: moment(input.data).utc(input.utc).date(),
      months: moment(input.data).utc(input.utc).month(),
      years: moment(input.data).utc(input.utc).year(),
      second: 0,
    });
  }

  public formatarDataCartao(input: { data: Date }) {
    return moment.utc(input.data).format("YYYY-MM-DD");
  }
}
 */
