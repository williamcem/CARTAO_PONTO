import moment from "moment";

export function calcularAusencias(retorno: any) {
  retorno.data.forEach((item: any) => {
    const cargaHorariaCompleta = item.cargaHorariaCompleta.split(";");
    const lancamentos = item.cartao_dia_lancamentos;
    const ausenciaPeriodo: { [key: string]: any } = {};
    let saidaManha: moment.Moment | undefined;
    let entradaTarde: moment.Moment | undefined;
    let encontradoPeriodo2 = false;
    let encontradoPeriodo1 = false;

    lancamentos.forEach((lancamento: any) => {
      const periodoId = lancamento.periodoId;
      const entrada = moment.utc(lancamento.entrada);
      const saida = moment.utc(lancamento.saida);

      if (periodoId === 1) {
        encontradoPeriodo1 = true;
        saidaManha = saida;
        const entradaEsperada = moment.utc().set({
          year: entrada.year(),
          month: entrada.month(),
          date: entrada.date(),
          hour: parseInt(cargaHorariaCompleta[0].split(".")[0], 10),
          minute: parseInt(cargaHorariaCompleta[0].split(".")[1], 10),
          second: 0,
          millisecond: 0,
        });
        if (entrada.isAfter(entradaEsperada)) {
          const diferenca = entrada.diff(entradaEsperada, "minutes");
          ausenciaPeriodo.ausenciaPeriodo1 = {
            descricao: `${entradaEsperada.format("HH:mm")} às ${entrada.format("HH:mm")}`,
            cartao_dia_id: lancamento.cartao_dia_id,
            periodoId: lancamento.periodoId,
            diferenca: -diferenca,
            statusId: 1,
          };
        } else {
          ausenciaPeriodo.ausenciaPeriodo1 = {
            descricao: "",
            cartao_dia_id: lancamento.cartao_dia_id,
            periodoId: lancamento.periodoId,
            diferenca: 0,
            statusId: 1,
          };
        }
      }

      if (periodoId === 2) {
        encontradoPeriodo2 = true;
        entradaTarde = entrada;
        const saidaEsperadaPeriodo2 = moment.utc().set({
          year: saida.year(),
          month: saida.month(),
          date: saida.date(),
          hour: parseInt(cargaHorariaCompleta[3].split(".")[0], 10),
          minute: parseInt(cargaHorariaCompleta[3].split(".")[1], 10),
          second: 0,
          millisecond: 0,
        });
        if (saida.isBefore(saidaEsperadaPeriodo2)) {
          const diferenca = saidaEsperadaPeriodo2.diff(saida, "minutes");
          ausenciaPeriodo.ausenciaPeriodo2 = {
            descricao: `${saida.format("HH:mm")} às ${saidaEsperadaPeriodo2.format("HH:mm")}`,
            cartao_dia_id: lancamento.cartao_dia_id,
            periodoId: lancamento.periodoId,
            diferenca: -diferenca,
            statusId: 1,
          };
        } else if (saida.isSame(saidaEsperadaPeriodo2, "minute")) {
          ausenciaPeriodo.ausenciaPeriodo2 = {
            descricao: "",
            cartao_dia_id: lancamento.cartao_dia_id,
            periodoId: lancamento.periodoId,
            diferenca: 0,
            statusId: 1,
          }; // Verifica igualdade até os minutos
        } else {
          ausenciaPeriodo.ausenciaPeriodo2 = {
            descricao: "",
            cartao_dia_id: lancamento.cartao_dia_id,
            periodoId: lancamento.periodoId,
            diferenca: 0,
            statusId: 1,
          }; // Se saída depois, também mantém vazio
        }
      }
    });

    // Se não foi encontrado períodoId: 1, preenche ausenciaPeriodo.ausenciaPeriodo1 com o horário do período 2
    if (!encontradoPeriodo1 && entradaTarde) {
      const entradaEsperada = moment.utc().set({
        year: entradaTarde.year(),
        month: entradaTarde.month(),
        date: entradaTarde.date(),
        hour: parseInt(cargaHorariaCompleta[0].split(".")[0], 10),
        minute: parseInt(cargaHorariaCompleta[0].split(".")[1], 10),
        second: 0,
        millisecond: 0,
      });
      const descricao = `${entradaEsperada.format("HH:mm")} às ${entradaTarde.format("HH:mm")}`;
      const diferenca = entradaTarde.diff(entradaEsperada, "minutes");
      if (descricao !== "") {
        ausenciaPeriodo.ausenciaPeriodo1 = {
          descricao,
          cartao_dia_id: item.id,
          periodoId: 1,
          diferenca: -diferenca,
          statusId: 1,
        };
      }
    }

    // Se não foi encontrado períodoId: 2, preenche ausenciaPeriodo.ausenciaPeriodo2 com o período 1
    if (!encontradoPeriodo2 && saidaManha) {
      const saidaEsperadaPeriodo2 = moment.utc().set({
        year: saidaManha.year(),
        month: saidaManha.month(),
        date: saidaManha.date(),
        hour: parseInt(cargaHorariaCompleta[3].split(".")[0], 10),
        minute: parseInt(cargaHorariaCompleta[3].split(".")[1], 10),
        second: 0,
        millisecond: 0,
      });
      const descricao = `${saidaManha.format("HH:mm")} às ${saidaEsperadaPeriodo2.format("HH:mm")}`;
      const diferenca = saidaEsperadaPeriodo2.diff(saidaManha, "minutes");
      if (descricao !== "") {
        ausenciaPeriodo.ausenciaPeriodo2 = {
          descricao,
          cartao_dia_id: item.id,
          periodoId: 2,
          diferenca: -diferenca,
          statusId: 1,
        };
      }
    }

    if (saidaManha && entradaTarde) {
      const retornoEsperado = saidaManha.clone().add(1, "hours");
      if (entradaTarde.isAfter(retornoEsperado, "minute")) {
        const excedidoInicio = retornoEsperado.format("HH:mm");
        const excedidoFim = entradaTarde.format("HH:mm");
        const diferenca = entradaTarde.diff(retornoEsperado, "minutes");
        ausenciaPeriodo.periodoAlmocoExcedido = {
          descricao: `${excedidoInicio} às ${excedidoFim}`,
          diferenca: -diferenca,
        };
      } else {
        ausenciaPeriodo.periodoAlmocoExcedido = {
          descricao: "",
          diferenca: 0,
        };
      }
    }

    // Remover propriedades de ausência com descrições vazias
    if (ausenciaPeriodo.ausenciaPeriodo1?.descricao === "") {
      delete ausenciaPeriodo.ausenciaPeriodo1;
    }
    if (ausenciaPeriodo.ausenciaPeriodo2?.descricao === "") {
      delete ausenciaPeriodo.ausenciaPeriodo2;
    }
    if (ausenciaPeriodo.periodoAlmocoExcedido?.descricao === "") {
      delete ausenciaPeriodo.periodoAlmocoExcedido;
    }

    item.funcionarioInfo = { ...item.funcionarioInfo, ...ausenciaPeriodo };
  });

  return retorno;
}
