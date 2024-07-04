import { describe, expect, test } from "vitest";
import { CriarEventosPostgresRepository } from "./eventos-repository";

describe("Gerar Eventos", () => {
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository();

  test.only("Teste carga 18.00;23.30;00.30;01.54;01.09 -- Somente o segundo periodo, cargaHor 414", async () => {
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
              identificacao: "009003368",
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
        data: "2024-05-26",
        hora: "00:00 - 01:24",
        tipoId: 1,
        identificacao: "009003368",
        minutos: 84,
      },
      {
        data: "2024-05-26",
        hora: "18:00 - 00:00",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -360,
      },
      {
        data: "2024-05-26",
        hora: "18:00 - 00:00",
        tipoId: 5,
        identificacao: "009003368",
        minutos: -17,
      },
      {
        data: "2024-05-26",
        hora: "01:54 - 01:24",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -30,
      },
      {
        data: "2024-05-26",
        hora: "01:54 - 01:24",
        tipoId: 5,
        identificacao: "009003368",
        minutos: -4,
      },
    ]);

    /*     const { sut, addHorariosRepositoryStub } = makeSut();
    const addSpy = vi.spyOn(addHorariosRepositoryStub, "add");
    const horariosData = {
      id: "valid_id",
      data: "valid_data",
      entradaManha: "valid_entradaManha",
      saidaManha: "valid_saidaTarde",
      entradaTarde: "valid_entradaTarde",
      saidaTarde: "valid_saidaTarde",
      saldoAtual: 300,
      dif_min: 1,
      tipoUm: "valid_tipoUm",
      tipoDois: "valid_tipoDois",
    };
    await sut.add(horariosData);

    expect(addSpy).toStrictEqual({
      id: "valid_id",
      data: "valid_data",
      entradaManha: "valid_entradaManha",
      saidaManha: "valid_saidaTarde",
      entradaTarde: "valid_entradaTarde",
      saidaTarde: "valid_saidaTarde",
      saldoAtual: 300,
      dif_min: 1,
      tipoUm: "valid_tipoUm",
      tipoDois: "valid_tipoDois",
    }); */
  });

  test.only("Teste carga 18.00;23.30;00.30;01.54;01.09 -- Somente o primeiro, cargaHor 414", async () => {
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
              identificacao: "009003368",
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
        data: "2024-05-26",
        hora: "18:20 - 23:00",
        tipoId: 1,
        identificacao: "009003368",
        minutos: 280,
      },
      {
        data: "2024-05-26",
        hora: "18:00 - 18:20",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -20,
      },
      {
        data: "2024-05-26",
        hora: "01:54 - 23:00",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -174,
      },
      {
        data: "2024-05-26",
        hora: "01:54 - 23:00",
        tipoId: 5,
        identificacao: "009003368",
        minutos: -24,
      },
    ]);
  });

  test.only("Teste carga 18.00;23.30;00.30;01.54;01.09 -- Os dois com diferenças menores, cargaHor 414", async () => {
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
              identificacao: "009003368",
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
              identificacao: "009003368",
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
        data: "2024-05-26",
        hora: "18:20 - 23:00",
        tipoId: 1,
        identificacao: "009003368",
        minutos: 280,
      },
      {
        data: "2024-05-26",
        hora: "18:00 - 18:20",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -20,
      },
      {
        data: "2024-05-26",
        hora: "00:00 - 01:24",
        tipoId: 1,
        identificacao: "009003368",
        minutos: 84,
      },
      {
        data: "2024-05-26",
        hora: "01:54 - 01:24",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -30,
      },
      {
        data: "2024-05-26",
        hora: "01:54 - 01:24",
        tipoId: 5,
        identificacao: "009003368",
        minutos: -4,
      },
    ]);
  });

  test.only("Teste carga 07.12;12.30;13.30;17.00;01.00 -- Os dois com diferenças menores, cargaHor 528", async () => {
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
              identificacao: "009003368",
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
              identificacao: "009003368",
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
        data: "2024-05-26",
        hora: "07:32 - 12:00",
        tipoId: 1,
        identificacao: "009003368",
        minutos: 268,
      },
      {
        data: "2024-05-26",
        hora: "07:12 - 07:32",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -20,
      },
      {
        data: "2024-05-26",
        hora: "13:00 - 16:30",
        tipoId: 1,
        identificacao: "009003368",
        minutos: 210,
      },
      {
        data: "2024-05-26",
        hora: "17:00 - 16:30",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -30,
      },
    ]);
  });

  test.only("Teste carga 07.12;12.30;13.30;17.00;01.00 -- Somente o priemiro periodo, cargaHor 528", async () => {
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
              identificacao: "009003368",
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
        data: "2024-05-26",
        hora: "07:32 - 12:30",
        tipoId: 1,
        identificacao: "009003368",
        minutos: 298,
      },
      {
        data: "2024-05-26",
        hora: "07:12 - 07:32",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -20,
      },
      {
        data: "2024-05-26",
        hora: "17:00 - 12:30",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -270,
      },
    ]);
  });

  test.only("Teste carga 07.12;12.30;13.30;17.00;01.00 -- Somente o segundo periodo, cargaHor 528", async () => {
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
              identificacao: "009003368",
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
        data: "2024-05-26",
        hora: "12:00 - 16:40",
        tipoId: 1,
        identificacao: "009003368",
        minutos: 280,
      },
      {
        data: "2024-05-26",
        hora: "07:12 - 12:00",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -288,
      },
      {
        data: "2024-05-26",
        hora: "17:00 - 16:40",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -20,
      },
    ]);
  });

  test.only("Teste carga 03.30;07.52;00.00;00.00;00.00 -- Somente o primeiro periodo -- SÓ EXISTE ESSE, cargaHor 262", async () => {
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
              identificacao: "009003368",
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
        data: "2024-06-01",
        hora: "03:30 - 07:30",
        tipoId: 1,
        identificacao: "009003368",
        minutos: 218,
      },
      {
        data: "2024-06-01",
        hora: "03:00 - 03:30",
        tipoId: 1,
        identificacao: "009003368",
        minutos: 30,
      },
      {
        data: "2024-06-01",
        hora: "03:00 - 03:30",
        tipoId: 5,
        identificacao: "009003368",
        minutos: 4,
      },
      {
        data: "2024-06-01",
        hora: "07:30 - 07:52",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -22,
      },
      {
        data: "2024-06-01",
        hora: "03:00 - 03:30",
        tipoId: 5,
        identificacao: "009003368",
        minutos: 4,
      },
    ]);
  });

  test("Teste carga 22.53;00.15;01.30;05.56;01.26 -- Os dois com diferenças menores -- cargaHor 348, Domingo", async () => {
    const lancamentos = [
      {
        periodoId: 1,
        entrada: new Date("2024-06-01T23:23:00.000Z"),
        saida: new Date("2024-06-01T00:00:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          cartao: {
            funcionario: {
              identificacao: "009003368",
            },
          },
        },
      },
      {
        periodoId: 2,
        entrada: new Date("2024-06-01T01:15:00.000Z"),
        saida: new Date("2024-06-01T05:26:00.000Z"),
        cartao_dia: {
          id: 6121,
          data: new Date("2024-05-26T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          cartao: {
            funcionario: {
              identificacao: "009003368",
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
        data: "2024-05-26",
        hora: "23:23 - 22:53",
        tipoId: 2,
        identificacao: "009003368",
        minutos: -30,
      },
      {
        data: "2024-05-26",
        hora: "23:23 - 00:00",
        tipoId: 1,
        identificacao: "009003368",
        minutos: 37,
      },
      {
        data: "2024-05-26",
        hora: "00:00 - 05:26",
        tipoId: 1,
        identificacao: "009003368",
        minutos: 326,
      },
      {
        data: "2024-05-26",
        hora: "05:26 - 05:56",
        tipoId: 5,
        identificacao: "009003368",
        minutos: -30,
      },
      {
        data: "2024-05-26",
        hora: "23:23 - 22:53",
        tipoId: 5,
        identificacao: "009003368",
        minutos: -4,
      },
      {
        data: "2024-05-26",
        hora: "05:26 - 05:56",
        tipoId: 5,
        identificacao: "009003368",
        minutos: -4,
      },
    ]);
  });
});

