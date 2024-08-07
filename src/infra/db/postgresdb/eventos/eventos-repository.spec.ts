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

describe("Achar Regra", () => {
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository();

  test("1ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: 5,
      segundoPeriodo: -8,
    });

    expect(regra).toStrictEqual(1);
  });

  test("2ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: 5,
      segundoPeriodo: -5,
    });

    expect(regra).toStrictEqual(2);
  });

  test("2ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: 3,
      segundoPeriodo: -5,
    });

    expect(regra).toStrictEqual(2);
  });

  test("3ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: -5,
      segundoPeriodo: -8,
    });

    expect(regra).toStrictEqual(3);
  });

  test("2ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: 5,
      segundoPeriodo: 5,
    });

    expect(regra).toStrictEqual(2);
  });

  test("2ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: 5,
      segundoPeriodo: 4,
    });

    expect(regra).toStrictEqual(2);
  });

  test("2ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: -5,
      segundoPeriodo: 0,
    });

    expect(regra).toStrictEqual(2);
  });

  test("1ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: 6,
      segundoPeriodo: -5,
    });

    expect(regra).toStrictEqual(1);
  });

  test("3ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: 6,
      segundoPeriodo: 5,
    });

    expect(regra).toStrictEqual(3);
  });

  test("2ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: 4,
      segundoPeriodo: 2,
    });

    expect(regra).toStrictEqual(2);
  });

  test("2ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: 4,
      segundoPeriodo: 2,
    });

    expect(regra).toStrictEqual(2);
  });

  test("2ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: -1,
      segundoPeriodo: 5,
    });

    expect(regra).toStrictEqual(2);
  });

  test("1ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: 4,
      segundoPeriodo: -8,
    });

    expect(regra).toStrictEqual(1);
  });

  test("1ª", async () => {
    const regra = criarEventosPostgresRepository.acharRegraMinutosResiduais({
      primeiroPeriodo: 4,
      segundoPeriodo: -20,
    });

    expect(regra).toStrictEqual(1);
  });
});
