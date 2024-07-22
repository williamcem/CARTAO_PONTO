import { describe, expect, test } from "vitest";
import { RespaldarController } from "./respaldar-atestado";
import { RespaldarAtestadoPostgresRepository } from "@infra/db/postgresdb/respaldar-atestado/respaldar-atestado";

describe("Gerar abono de atestado", () => {
  const respaldarController = new RespaldarController(new RespaldarAtestadoPostgresRepository());

  test("1º Periodo", async () => {
    const atestado = {
      id: 2,
      documentoId: 1,
      statusId: 1,
      inicio: new Date("2024-07-16T07:15:00.000Z"),
      fim: new Date("2024-07-16T09:00:00.000Z"),
      funcionarioId: 1,
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, atestado);

    expect(abonos).toStrictEqual([{ data: new Date("2024-07-16T00:00:00.000Z"), minutos: 105, cartaoDiaId: 22 }]);
  });

  test("2º Periodo", async () => {
    const periodo = {
      fim: new Date("2024-07-16T17:00:00.000Z"),
      inicio: new Date("2024-07-16T15:00:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([{ data: new Date("2024-07-16T00:00:00.000Z"), minutos: 120, cartaoDiaId: 22 }]);
  });

  test("Dia inteiro carga horária integral", async () => {
    const periodo = {
      inicio: new Date("2024-07-16T07:12:00.000Z"),
      fim: new Date("2024-07-16T17:00:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([{ data: new Date("2024-07-16T00:00:00.000Z"), minutos: 528, cartaoDiaId: 22 }]);
  });

  test("Dia inteiro carga horária meio periodo", async () => {
    const periodo = {
      inicio: new Date("2024-07-16T07:12:00.000Z"),
      fim: new Date("2024-07-16T17:00:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 318,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;00.00;00.00;00.00",
        descanso: 0,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([{ data: new Date("2024-07-16T00:00:00.000Z"), minutos: 318, cartaoDiaId: 22 }]);
  });

  test("3 dias carga horária integral", async () => {
    const periodo = {
      inicio: new Date("2024-07-16T07:12:00.000Z"),
      fim: new Date("2024-07-18T17:00:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 0,
      },
      {
        id: 23,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-17T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 0,
      },
      {
        id: 24,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-18T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 0,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([
      { data: new Date("2024-07-16T00:00:00.000Z"), minutos: 528, cartaoDiaId: 22 },
      { data: new Date("2024-07-17T00:00:00.000Z"), minutos: 528, cartaoDiaId: 23 },
      { data: new Date("2024-07-18T00:00:00.000Z"), minutos: 528, cartaoDiaId: 24 },
    ]);
  });

  test("2 dias carga horária integral e 1 dia carga horária meio periodo", async () => {
    const periodo = {
      inicio: new Date("2024-07-16T07:12:00.000Z"),
      fim: new Date("2024-07-18T17:00:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 0,
      },
      {
        id: 23,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-17T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 0,
      },
      {
        id: 24,
        cargaHoraria: 318,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-18T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;00.00;00.00;00.00",
        descanso: 0,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([
      { data: new Date("2024-07-16T00:00:00.000Z"), minutos: 528, cartaoDiaId: 22 },
      { data: new Date("2024-07-17T00:00:00.000Z"), minutos: 528, cartaoDiaId: 23 },
      { data: new Date("2024-07-18T00:00:00.000Z"), minutos: 318, cartaoDiaId: 24 },
    ]);
  });

  test("3 dias carga horária integral, saiu no meio 1º periodo", async () => {
    const periodo = {
      inicio: new Date("2024-07-16T08:12:00.000Z"),
      fim: new Date("2024-07-18T17:00:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
        lancamentos: [{}],
      },
      {
        id: 23,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-17T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 24,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-18T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([
      { data: new Date("2024-07-16T00:00:00.000Z"), minutos: 468, cartaoDiaId: 22 },
      { data: new Date("2024-07-17T00:00:00.000Z"), minutos: 528, cartaoDiaId: 23 },
      { data: new Date("2024-07-18T00:00:00.000Z"), minutos: 528, cartaoDiaId: 24 },
    ]);
  });

  test("3 dias carga horária integral, saiu no meio 2º periodo", async () => {
    const periodo = {
      inicio: new Date("2024-07-16T15:00:00.000Z"),
      fim: new Date("2024-07-18T17:00:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 23,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-17T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 24,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-18T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([
      { data: new Date("2024-07-16T00:00:00.000Z"), minutos: 120, cartaoDiaId: 22 },
      { data: new Date("2024-07-17T00:00:00.000Z"), minutos: 528, cartaoDiaId: 23 },
      { data: new Date("2024-07-18T00:00:00.000Z"), minutos: 528, cartaoDiaId: 24 },
    ]);
  });

  //1º Periodo, virada dia
  {
    test("1/4 - 1º Periodo, virada dia", async () => {
      const periodo = {
        inicio: new Date("2024-07-16T19:00:00.000Z"),
        fim: new Date("2024-07-17T01:54:00.000Z"),
      };

      const dias = [
        {
          id: 22,
          cargaHoraria: 414,
          cargaHorariaPrimeiroPeriodo: 330,
          cargaHorariaSegundoPeriodo: 84,
          data: new Date("2024-07-16T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          descanso: 60,
        },
      ];

      const abonos = respaldarController.gerarAbono(dias, periodo);

      expect(abonos).toStrictEqual([{ data: new Date("2024-07-16T00:00:00.000Z"), minutos: 354, cartaoDiaId: 22 }]);
    });

    test("2/4 - 1º Periodo, virada dia", async () => {
      const periodo = {
        inicio: new Date("2024-07-16T19:50:00.000Z"),
        fim: new Date("2024-07-17T01:54:00.000Z"),
      };

      const dias = [
        {
          id: 22,
          cargaHoraria: 414,
          cargaHorariaPrimeiroPeriodo: 330,
          cargaHorariaSegundoPeriodo: 84,
          data: new Date("2024-07-16T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          descanso: 60,
        },
      ];

      const abonos = respaldarController.gerarAbono(dias, periodo);

      expect(abonos).toStrictEqual([{ data: new Date("2024-07-16T00:00:00.000Z"), minutos: 304, cartaoDiaId: 22 }]);
    });

    test("3/4 - 1º Periodo, virada dia", async () => {
      const periodo = {
        inicio: new Date("2024-07-16T23:00:00.000Z"),
        fim: new Date("2024-07-17T01:54:00.000Z"),
      };

      const dias = [
        {
          id: 22,
          cargaHoraria: 414,
          cargaHorariaPrimeiroPeriodo: 330,
          cargaHorariaSegundoPeriodo: 84,
          data: new Date("2024-07-16T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          descanso: 60,
        },
      ];

      const abonos = respaldarController.gerarAbono(dias, periodo);

      expect(abonos).toStrictEqual([{ data: new Date("2024-07-16T00:00:00.000Z"), minutos: 114, cartaoDiaId: 22 }]);
    });

    test("4/4 - 1º Periodo, virada dia", async () => {
      const periodo = {
        inicio: new Date("2024-07-16T23:29:00.000Z"),
        fim: new Date("2024-07-17T01:54:00.000Z"),
      };

      const dias = [
        {
          id: 22,
          cargaHoraria: 414,
          cargaHorariaPrimeiroPeriodo: 330,
          cargaHorariaSegundoPeriodo: 84,
          data: new Date("2024-07-16T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          descanso: 60,
        },
      ];

      const abonos = respaldarController.gerarAbono(dias, periodo);

      expect(abonos).toStrictEqual([{ data: new Date("2024-07-16T00:00:00.000Z"), minutos: 85, cartaoDiaId: 22 }]);
    });
  }

  //2º Periodo, virada dia
  {
    test("1/3 - 2º Periodo, virada dia", async () => {
      const periodo = {
        inicio: new Date("2024-07-17T00:31:00.000Z"),
        fim: new Date("2024-07-17T01:54:00.000Z"),
      };

      const dias = [
        {
          id: 22,
          cargaHoraria: 414,
          cargaHorariaPrimeiroPeriodo: 330,
          cargaHorariaSegundoPeriodo: 84,
          data: new Date("2024-07-16T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          descanso: 60,
        },
      ];

      const abonos = respaldarController.gerarAbono(dias, periodo);

      expect(abonos).toStrictEqual([{ data: new Date("2024-07-16T00:00:00.000Z"), minutos: 83, cartaoDiaId: 22 }]);
    });

    test("2/3 - 2º Periodo, virada dia", async () => {
      const periodo = {
        inicio: new Date("2024-07-17T01:53:00.000Z"),
        fim: new Date("2024-07-17T01:54:00.000Z"),
      };

      const dias = [
        {
          id: 22,
          cargaHoraria: 414,
          cargaHorariaPrimeiroPeriodo: 330,
          cargaHorariaSegundoPeriodo: 84,
          data: new Date("2024-07-16T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          descanso: 60,
        },
      ];

      const abonos = respaldarController.gerarAbono(dias, periodo);

      expect(abonos).toStrictEqual([{ data: new Date("2024-07-16T00:00:00.000Z"), minutos: 1, cartaoDiaId: 22 }]);
    });

    test("3/3 - 2º Periodo, virada dia", async () => {
      const periodo = {
        inicio: new Date("2024-07-17T01:00:00.000Z"),
        fim: new Date("2024-07-17T01:54:00.000Z"),
      };

      const dias = [
        {
          id: 22,
          cargaHoraria: 414,
          cargaHorariaPrimeiroPeriodo: 330,
          cargaHorariaSegundoPeriodo: 84,
          data: new Date("2024-07-16T00:00:00.000Z"),
          cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
          descanso: 60,
        },
      ];

      const abonos = respaldarController.gerarAbono(dias, periodo);

      expect(abonos).toStrictEqual([{ data: new Date("2024-07-16T00:00:00.000Z"), minutos: 54, cartaoDiaId: 22 }]);
    });
  }

  test("Dia inteiro carga horária periodo integral, virada dia", async () => {
    const periodo = {
      inicio: new Date("2024-07-16T18:00:00.000Z"),
      fim: new Date("2024-07-17T01:54:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 414,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 84,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([{ data: new Date("2024-07-16T00:00:00.000Z"), minutos: 414, cartaoDiaId: 22 }]);
  });

  test("Dia inteiro carga horária meio periodo, virada dia", async () => {
    const periodo = {
      inicio: new Date("2024-07-16T18:00:00.000Z"),
      fim: new Date("2024-07-17T01:54:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 330,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.00;00.00;00.00",
        descanso: 0,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([{ data: new Date("2024-07-16T00:00:00.000Z"), minutos: 330, cartaoDiaId: 22 }]);
  });

  test("3 dias carga horária integral, virada dia", async () => {
    const periodo = {
      inicio: new Date("2024-07-16T15:00:00.000Z"),
      fim: new Date("2024-07-19T02:54:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 414,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 84,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
        descanso: 60,
      },
      {
        id: 23,
        cargaHoraria: 414,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 84,
        data: new Date("2024-07-17T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
        descanso: 60,
      },
      {
        id: 24,
        cargaHoraria: 414,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 84,
        data: new Date("2024-07-18T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([
      { data: new Date("2024-07-16T00:00:00.000Z"), minutos: 414, cartaoDiaId: 22 },
      { data: new Date("2024-07-17T00:00:00.000Z"), minutos: 414, cartaoDiaId: 23 },
      { data: new Date("2024-07-18T00:00:00.000Z"), minutos: 414, cartaoDiaId: 24 },
    ]);
  });

  test("2 dias carga horária integral e 1 dia carga horária meio periodo, virada dia", async () => {
    const periodo = {
      inicio: new Date("2024-07-16T15:00:00.000Z"),
      fim: new Date("2024-07-19T02:54:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 330,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 23,
        cargaHoraria: 414,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 84,
        data: new Date("2024-07-17T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
        descanso: 60,
      },
      {
        id: 24,
        cargaHoraria: 414,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 84,
        data: new Date("2024-07-18T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([
      { data: new Date("2024-07-16T00:00:00.000Z"), minutos: 330, cartaoDiaId: 22 },
      { data: new Date("2024-07-17T00:00:00.000Z"), minutos: 414, cartaoDiaId: 23 },
      { data: new Date("2024-07-18T00:00:00.000Z"), minutos: 414, cartaoDiaId: 24 },
    ]);
  });

  test("3 dias carga horária integral, saiu no meio 1º periodo , virada dia", async () => {
    const periodo = {
      inicio: new Date("2024-07-16T19:00:00.000Z"),
      fim: new Date("2024-07-19T02:54:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 414,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 84,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
        descanso: 60,
      },
      {
        id: 23,
        cargaHoraria: 414,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 84,
        data: new Date("2024-07-17T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
        descanso: 60,
      },
      {
        id: 24,
        cargaHoraria: 414,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 84,
        data: new Date("2024-07-18T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([
      { data: new Date("2024-07-16T00:00:00.000Z"), minutos: 354, cartaoDiaId: 22 },
      { data: new Date("2024-07-17T00:00:00.000Z"), minutos: 414, cartaoDiaId: 23 },
      { data: new Date("2024-07-18T00:00:00.000Z"), minutos: 414, cartaoDiaId: 24 },
    ]);
  });

  test("3 dias carga horária integral, saiu no meio 2º periodo , virada dia", async () => {
    const periodo = {
      inicio: new Date("2024-07-17T01:00:00.000Z"),
      fim: new Date("2024-07-19T01:54:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 414,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 84,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
        descanso: 60,
      },
      {
        id: 23,
        cargaHoraria: 414,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 84,
        data: new Date("2024-07-17T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
        descanso: 60,
      },
      {
        id: 24,
        cargaHoraria: 414,
        cargaHorariaPrimeiroPeriodo: 330,
        cargaHorariaSegundoPeriodo: 84,
        data: new Date("2024-07-18T00:00:00.000Z"),
        cargaHorariaCompleta: "18.00;23.30;00.30;01.54;01.09",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([
      { data: new Date("2024-07-16T00:00:00.000Z"), minutos: 54, cartaoDiaId: 22 },
      { data: new Date("2024-07-17T00:00:00.000Z"), minutos: 414, cartaoDiaId: 23 },
      { data: new Date("2024-07-18T00:00:00.000Z"), minutos: 414, cartaoDiaId: 24 },
    ]);
  });

  test("30 dias", async () => {
    const atestado = {
      id: 2,
      documentoId: 1,
      statusId: 1,
      inicio: new Date("2024-07-16T07:12:00.000Z"),
      fim: new Date("2024-08-16T17:00:00.000Z"),
      funcionarioId: 1,
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 23,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-17T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 24,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-18T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 25,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-19T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 26,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-20T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 27,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-21T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 28,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-22T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 29,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-23T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 30,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-24T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 31,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-25T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 32,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-26T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 33,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-27T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 34,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-28T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 35,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-29T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 36,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-30T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 37,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-31T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 38,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-01T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 39,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-02T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 40,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-08-03T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 41,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-08-04T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 42,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-05T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 43,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-06T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 44,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-07T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 45,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-08T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 46,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-09T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 47,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-08-10T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 48,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-08-11T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 0,
      },
      {
        id: 49,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-12T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 50,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-13T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 51,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-14T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 52,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-15T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 53,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, atestado);

    expect(abonos).toStrictEqual([
      { data: new Date("2024-07-16T00:00:00.000Z"), minutos: 528, cartaoDiaId: 22 },
      { data: new Date("2024-07-17T00:00:00.000Z"), minutos: 528, cartaoDiaId: 23 },
      { data: new Date("2024-07-18T00:00:00.000Z"), minutos: 528, cartaoDiaId: 24 },
      { data: new Date("2024-07-19T00:00:00.000Z"), minutos: 528, cartaoDiaId: 25 },
      { data: new Date("2024-07-22T00:00:00.000Z"), minutos: 528, cartaoDiaId: 28 },
      { data: new Date("2024-07-23T00:00:00.000Z"), minutos: 528, cartaoDiaId: 29 },
      { data: new Date("2024-07-24T00:00:00.000Z"), minutos: 528, cartaoDiaId: 30 },
      { data: new Date("2024-07-25T00:00:00.000Z"), minutos: 528, cartaoDiaId: 31 },
      { data: new Date("2024-07-26T00:00:00.000Z"), minutos: 528, cartaoDiaId: 32 },
      { data: new Date("2024-07-29T00:00:00.000Z"), minutos: 528, cartaoDiaId: 35 },
      { data: new Date("2024-07-30T00:00:00.000Z"), minutos: 528, cartaoDiaId: 36 },
      { data: new Date("2024-07-31T00:00:00.000Z"), minutos: 528, cartaoDiaId: 37 },
      { data: new Date("2024-08-01T00:00:00.000Z"), minutos: 528, cartaoDiaId: 38 },
      { data: new Date("2024-08-02T00:00:00.000Z"), minutos: 528, cartaoDiaId: 39 },
      { data: new Date("2024-08-05T00:00:00.000Z"), minutos: 528, cartaoDiaId: 42 },
      { data: new Date("2024-08-06T00:00:00.000Z"), minutos: 528, cartaoDiaId: 43 },
      { data: new Date("2024-08-07T00:00:00.000Z"), minutos: 528, cartaoDiaId: 44 },
      { data: new Date("2024-08-08T00:00:00.000Z"), minutos: 528, cartaoDiaId: 45 },
      { data: new Date("2024-08-09T00:00:00.000Z"), minutos: 528, cartaoDiaId: 46 },
      { data: new Date("2024-08-12T00:00:00.000Z"), minutos: 528, cartaoDiaId: 49 },
      { data: new Date("2024-08-13T00:00:00.000Z"), minutos: 528, cartaoDiaId: 50 },
      { data: new Date("2024-08-14T00:00:00.000Z"), minutos: 528, cartaoDiaId: 51 },
      { data: new Date("2024-08-15T00:00:00.000Z"), minutos: 528, cartaoDiaId: 52 },
      { data: new Date("2024-08-16T00:00:00.000Z"), minutos: 528, cartaoDiaId: 53 },
    ]);
  });

  test("30 dias, saiu no meio do 1º periodo", async () => {
    const atestado = {
      id: 2,
      documentoId: 1,
      statusId: 1,
      inicio: new Date("2024-07-16T08:12:00.000Z"),
      fim: new Date("2024-08-16T17:00:00.000Z"),
      funcionarioId: 1,
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 23,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-17T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 24,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-18T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 25,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-19T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 26,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-20T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 27,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-21T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 28,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-22T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 29,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-23T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 30,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-24T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 31,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-25T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 32,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-26T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 33,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-27T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 34,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-28T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 35,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-29T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 36,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-30T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 37,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-31T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 38,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-01T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 39,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-02T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 40,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-08-03T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 41,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-08-04T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 42,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-05T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 43,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-06T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 44,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-07T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 45,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-08T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 46,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-09T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 47,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-08-10T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 48,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-08-11T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 0,
      },
      {
        id: 49,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-12T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 50,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-13T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 51,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-14T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 52,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-15T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 53,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, atestado);

    expect(abonos).toStrictEqual([
      { data: new Date("2024-07-16T00:00:00.000Z"), minutos: 468, cartaoDiaId: 22 },
      { data: new Date("2024-07-17T00:00:00.000Z"), minutos: 528, cartaoDiaId: 23 },
      { data: new Date("2024-07-18T00:00:00.000Z"), minutos: 528, cartaoDiaId: 24 },
      { data: new Date("2024-07-19T00:00:00.000Z"), minutos: 528, cartaoDiaId: 25 },
      { data: new Date("2024-07-22T00:00:00.000Z"), minutos: 528, cartaoDiaId: 28 },
      { data: new Date("2024-07-23T00:00:00.000Z"), minutos: 528, cartaoDiaId: 29 },
      { data: new Date("2024-07-24T00:00:00.000Z"), minutos: 528, cartaoDiaId: 30 },
      { data: new Date("2024-07-25T00:00:00.000Z"), minutos: 528, cartaoDiaId: 31 },
      { data: new Date("2024-07-26T00:00:00.000Z"), minutos: 528, cartaoDiaId: 32 },
      { data: new Date("2024-07-29T00:00:00.000Z"), minutos: 528, cartaoDiaId: 35 },
      { data: new Date("2024-07-30T00:00:00.000Z"), minutos: 528, cartaoDiaId: 36 },
      { data: new Date("2024-07-31T00:00:00.000Z"), minutos: 528, cartaoDiaId: 37 },
      { data: new Date("2024-08-01T00:00:00.000Z"), minutos: 528, cartaoDiaId: 38 },
      { data: new Date("2024-08-02T00:00:00.000Z"), minutos: 528, cartaoDiaId: 39 },
      { data: new Date("2024-08-05T00:00:00.000Z"), minutos: 528, cartaoDiaId: 42 },
      { data: new Date("2024-08-06T00:00:00.000Z"), minutos: 528, cartaoDiaId: 43 },
      { data: new Date("2024-08-07T00:00:00.000Z"), minutos: 528, cartaoDiaId: 44 },
      { data: new Date("2024-08-08T00:00:00.000Z"), minutos: 528, cartaoDiaId: 45 },
      { data: new Date("2024-08-09T00:00:00.000Z"), minutos: 528, cartaoDiaId: 46 },
      { data: new Date("2024-08-12T00:00:00.000Z"), minutos: 528, cartaoDiaId: 49 },
      { data: new Date("2024-08-13T00:00:00.000Z"), minutos: 528, cartaoDiaId: 50 },
      { data: new Date("2024-08-14T00:00:00.000Z"), minutos: 528, cartaoDiaId: 51 },
      { data: new Date("2024-08-15T00:00:00.000Z"), minutos: 528, cartaoDiaId: 52 },
      { data: new Date("2024-08-16T00:00:00.000Z"), minutos: 528, cartaoDiaId: 53 },
    ]);
  });

  test("30 dias, saiu no meio do 2º periodo", async () => {
    const atestado = {
      id: 2,
      documentoId: 1,
      statusId: 1,
      inicio: new Date("2024-07-16T16:00:00.000Z"),
      fim: new Date("2024-08-16T17:00:00.000Z"),
      funcionarioId: 1,
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 23,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-17T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 24,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-18T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 25,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-19T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 26,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-20T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 27,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-21T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 28,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-22T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 29,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-23T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 30,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-24T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 31,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-25T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 32,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-26T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 33,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-27T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 34,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-07-28T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 35,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-29T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 36,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-30T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 37,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-31T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 38,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-01T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 39,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-02T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 40,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-08-03T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 41,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-08-04T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 42,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-05T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 43,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-06T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 44,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-07T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 45,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-08T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 46,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-09T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 47,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-08-10T00:00:00.000Z"),
        cargaHorariaCompleta: "00.00;00.00;00.00;00.00;00.00",
        descanso: 0,
      },
      {
        id: 48,
        cargaHoraria: 0,
        cargaHorariaPrimeiroPeriodo: 0,
        cargaHorariaSegundoPeriodo: 0,
        data: new Date("2024-08-11T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 0,
      },
      {
        id: 49,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-12T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 50,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-13T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 51,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-14T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 52,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-15T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
      {
        id: 53,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-08-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, atestado);

    expect(abonos).toStrictEqual([
      { data: new Date("2024-07-16T00:00:00.000Z"), minutos: 60, cartaoDiaId: 22 },
      { data: new Date("2024-07-17T00:00:00.000Z"), minutos: 528, cartaoDiaId: 23 },
      { data: new Date("2024-07-18T00:00:00.000Z"), minutos: 528, cartaoDiaId: 24 },
      { data: new Date("2024-07-19T00:00:00.000Z"), minutos: 528, cartaoDiaId: 25 },
      { data: new Date("2024-07-22T00:00:00.000Z"), minutos: 528, cartaoDiaId: 28 },
      { data: new Date("2024-07-23T00:00:00.000Z"), minutos: 528, cartaoDiaId: 29 },
      { data: new Date("2024-07-24T00:00:00.000Z"), minutos: 528, cartaoDiaId: 30 },
      { data: new Date("2024-07-25T00:00:00.000Z"), minutos: 528, cartaoDiaId: 31 },
      { data: new Date("2024-07-26T00:00:00.000Z"), minutos: 528, cartaoDiaId: 32 },
      { data: new Date("2024-07-29T00:00:00.000Z"), minutos: 528, cartaoDiaId: 35 },
      { data: new Date("2024-07-30T00:00:00.000Z"), minutos: 528, cartaoDiaId: 36 },
      { data: new Date("2024-07-31T00:00:00.000Z"), minutos: 528, cartaoDiaId: 37 },
      { data: new Date("2024-08-01T00:00:00.000Z"), minutos: 528, cartaoDiaId: 38 },
      { data: new Date("2024-08-02T00:00:00.000Z"), minutos: 528, cartaoDiaId: 39 },
      { data: new Date("2024-08-05T00:00:00.000Z"), minutos: 528, cartaoDiaId: 42 },
      { data: new Date("2024-08-06T00:00:00.000Z"), minutos: 528, cartaoDiaId: 43 },
      { data: new Date("2024-08-07T00:00:00.000Z"), minutos: 528, cartaoDiaId: 44 },
      { data: new Date("2024-08-08T00:00:00.000Z"), minutos: 528, cartaoDiaId: 45 },
      { data: new Date("2024-08-09T00:00:00.000Z"), minutos: 528, cartaoDiaId: 46 },
      { data: new Date("2024-08-12T00:00:00.000Z"), minutos: 528, cartaoDiaId: 49 },
      { data: new Date("2024-08-13T00:00:00.000Z"), minutos: 528, cartaoDiaId: 50 },
      { data: new Date("2024-08-14T00:00:00.000Z"), minutos: 528, cartaoDiaId: 51 },
      { data: new Date("2024-08-15T00:00:00.000Z"), minutos: 528, cartaoDiaId: 52 },
      { data: new Date("2024-08-16T00:00:00.000Z"), minutos: 528, cartaoDiaId: 53 },
    ]);
  });
});
