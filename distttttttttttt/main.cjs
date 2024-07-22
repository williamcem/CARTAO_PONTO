"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main.ts
var import_config = require("dotenv/config");

// src/main/config/app.ts
var import_cors = __toESM(require("cors"), 1);
var import_express3 = __toESM(require("express"), 1);

// src/main/middlewares/body-parser.ts
var import_express = require("express");
var bodyParser = (0, import_express.json)();

// src/main/middlewares/content-type.ts
var contentType = (req, res, next) => {
  res.type("json");
  next();
};

// src/main/middlewares/cors.ts
var cors = (req, res, next) => {
  res.set("access-control-allow-origin", "*");
  res.set("access-control-allow-methods", "*");
  res.set("access-control-allow-headers", "*");
  next();
};

// src/main/config/middlewares.ts
var middlewares_default = (app2) => {
  app2.use(bodyParser);
  app2.use(cors);
  app2.use(contentType);
};

// src/main/config/routes.ts
var import_express2 = require("express");

// src/main/adapters/express-route-adapter.ts
var adaptRoute = (controller) => {
  return async (req, res) => {
    const HttpRequest = {
      body: req.body,
      query: req.query,
      params: req.params
    };
    const httpResponse = await controller.handle(HttpRequest);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  };
};

// src/infra/database/Prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// src/infra/db/postgresdb/buscar-todos-funcionarios.ts/buscas-todos-repository.ts
var BuscarTodosPostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async listAll(funcionarioData) {
    try {
      const funcionarios = await this.prisma.funcionario.findMany({
        include: {
          turno: true,
          // Inclui a tabela 'turno' nos resultados
          localidade: true,
          centro_custo: true,
          funcao: true,
          contatos: true,
          emails: true,
          endereco: true,
          afastamento: {
            include: { funcionarios_afastados_status: true }
          }
        },
        where: {
          identificacao: { endsWith: funcionarioData.identificacao },
          localidadeId: funcionarioData.localidade?.codigo
        }
      });
      return funcionarios.map((funcionario) => ({
        ...funcionario,
        periodoDeTrabalho: {
          id: funcionario.turno.id,
          descricaoDoTurno: funcionario.turno.nome
          // Renomeia o campo 'nome' para 'periodo'
        },
        turno: void 0
        // Remove o campo turno original
      }));
    } catch (error) {
      console.error("Erro ao buscar funcion\xE1rios", error);
      throw error;
    }
  }
};

// src/presentation/errors/server-error.ts
var ServerError = class extends Error {
  constructor() {
    super("Erro do servidor interno");
    this.name = "ServerError";
  }
};

// src/presentation/helpers/http-helpers.ts
var badRequest = (error) => ({
  statusCode: 400,
  body: error
});
var notFoundRequest = (error) => ({
  statusCode: 404,
  body: error
});
var serverError = () => ({
  statusCode: 500,
  body: new ServerError()
});
var ok = (data) => ({
  statusCode: 200,
  body: data
});

// src/presentation/controllers/buscar-todos-funcionarios/buscar-todos-controller.ts
var BuscarTodosFuncionarioController = class {
  constructor(funcionarioPostgresRepository) {
    this.funcionarioPostgresRepository = funcionarioPostgresRepository;
  }
  async handle(req) {
    try {
      const { localidade, identificacao } = req.query;
      const funcionarios = await this.funcionarioPostgresRepository.listAll({
        identificacao,
        localidade: { codigo: localidade }
      });
      return ok({ message: "Funcion\xE1rios encontrados com sucesso", data: funcionarios });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/decorators/log.ts
var LogControllerDecorator = class {
  controller;
  constructor(controller) {
    this.controller = controller;
  }
  async handle(httRequest) {
    const httPResponse = await this.controller.handle(httRequest);
    return httPResponse;
  }
};

// src/main/factories/buscar-todos-funcionarios.ts
var makeBuscarTodosController = () => {
  const buscarTodosPostgresRepository = new BuscarTodosPostgresRepository();
  const buscarTodosFuncionarioController = new BuscarTodosFuncionarioController(buscarTodosPostgresRepository);
  return new LogControllerDecorator(buscarTodosFuncionarioController);
};

// src/main/routes/horarios/buscar-todos-funcionarios-routes.ts
var route = (router) => {
  router.get("/todosfuncionario", adaptRoute(makeBuscarTodosController()));
};
var buscar_todos_funcionarios_routes_default = route;

// src/infra/db/postgresdb/atestado-repository/atestado-repository.ts
var DataAtestadoInvalida = class extends Error {
  constructor(message) {
    super(message);
    this.name = "DataAtestadoInvalida";
  }
};
var AtestadoRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async add(input) {
    try {
      const primeiroDiaCartao = await this.prisma.cartao_dia.findFirst({
        where: {
          cartao: {
            funcionarioId: input.funcionarioId
          }
          // Acrescentar verificação de sttaus do cartão, se estiver importado faz os fechados não
        },
        orderBy: {
          data: "asc"
        },
        select: {
          data: true
        }
      });
      console.log("Data achada:", primeiroDiaCartao?.data);
      console.log("Data de cadastro:", input.data);
      if (primeiroDiaCartao && new Date(input.data) < new Date(primeiroDiaCartao.data)) {
        throw new DataAtestadoInvalida(
          "A data do atestado n\xE3o pode ser anterior \xE0 primeira data de registro no cart\xE3o do funcion\xE1rio."
        );
      }
      const savedAtestado = await this.prisma.atestado_funcionario.create({
        data: {
          data: input.data,
          inicio: input.inicio,
          fim: input.fim,
          descricao: input.descricao,
          userName: input.userName,
          acidente_trabalho: input.acidente_trabalho,
          acao: input.acao,
          idade_paciente: input.idade_paciente,
          grupo_cid: input.grupo_cid,
          tipoAcompanhanteId: input.tipoAcompanhanteId,
          funcionarioId: input.funcionarioId,
          ocupacaoId: input.ocupacaoId,
          tipoId: input.tipoId,
          statusId: 1
        }
      });
      return !!savedAtestado;
    } catch (error) {
      if (error instanceof DataAtestadoInvalida) {
        throw error;
      }
      console.error("Erro ao criar atestado:", error);
      throw new Error("Erro ao criar atestado.");
    }
  }
};

// src/presentation/errors/Funcionario-param-error.ts
var FuncionarioParamError = class extends Error {
  constructor(paramName) {
    super();
    this.name = paramName;
  }
};

// src/presentation/controllers/cadastrar-atestado/cadastrar-atestado.ts
var AtestadoController = class {
  constructor(atestadoRepository) {
    this.atestadoRepository = atestadoRepository;
  }
  async handle(httpRequest) {
    try {
      const {
        inicio,
        fim,
        grupo_cid,
        descricao,
        userName,
        funcionarioId,
        tipoId,
        ocupacaoId,
        tipoAcompanhanteId,
        idade_paciente,
        acidente_trabalho,
        acao,
        observacao,
        statusId,
        data,
        sintomas
      } = httpRequest.body;
      if (!userName)
        return badRequest(new FuncionarioParamError("Falta Usu\xE1rio!"));
      if (!tipoId)
        return badRequest(new FuncionarioParamError("Falta o tipo do atestado!"));
      if (!funcionarioId)
        return badRequest(new FuncionarioParamError("Falta funcion\xE1rioId!"));
      if (!acao)
        return badRequest(new FuncionarioParamError("Falta escolher a a\xE7\xE3o caso seja recusado!"));
      if (!data)
        return badRequest(new FuncionarioParamError("Falta a data do atestado!"));
      if (!sintomas && !grupo_cid)
        return badRequest(new FuncionarioParamError("Falta o diagn\xF3stico ou o grupo CID!"));
      const atestadoSalvo = await this.atestadoRepository.add({
        inicio,
        fim,
        grupo_cid,
        descricao,
        userName,
        funcionarioId,
        tipoId,
        ocupacaoId,
        tipoAcompanhanteId,
        idade_paciente,
        acidente_trabalho,
        acao,
        statusId,
        data,
        observacao,
        sintomas
      });
      if (!atestadoSalvo)
        throw new Error("Erro ao salvar atestado!");
      return ok({ message: "Atestado salvo com sucesso" });
    } catch (error) {
      if (error instanceof DataAtestadoInvalida) {
        return badRequest(new FuncionarioParamError(error.message));
      }
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/cadastrar-atestado.ts
var makeCadastrarAtestadosController = () => {
  const atestadoRepository = new AtestadoRepository();
  const atestadoController = new AtestadoController(atestadoRepository);
  return new LogControllerDecorator(atestadoController);
};

// src/main/routes/horarios/cadastrar-atestado.ts
var route2 = (router) => {
  router.post("/cadastrar-atestado", adaptRoute(makeCadastrarAtestadosController()));
};
var cadastrar_atestado_default = route2;

// src/infra/db/postgresdb/atestado-aprovado-repository/atestado-aprovado-repository.ts
var AtestadoAprovadoRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async addInicioFim(input) {
    try {
      const savedAtestado = await this.prisma.atestado_funcionario.update({
        where: {
          id: input.id
        },
        data: {
          inicio: input.inicio,
          fim: input.fim,
          statusId: 2
        }
      });
      return !!savedAtestado;
    } catch (error) {
      console.error("Erro ao atualizar atestado:", error);
      return false;
    }
  }
};

// src/presentation/controllers/cadastrar-atestado-aprovado/cadastrar-atestado-aprovado.ts
var AtestadoAprovadoController = class {
  constructor(atestadoAprovadoRepository) {
    this.atestadoAprovadoRepository = atestadoAprovadoRepository;
  }
  async handle(httpRequest) {
    try {
      const { id, inicio, fim, statusId } = httpRequest.body;
      if (!id)
        return badRequest(new FuncionarioParamError("Falta o ID do atestado!"));
      if (!inicio)
        return badRequest(new FuncionarioParamError("Falta a data de in\xEDcio!"));
      if (!fim)
        return badRequest(new FuncionarioParamError("Falta a data de fim!"));
      const result = await this.atestadoAprovadoRepository.addInicioFim({ id, inicio, fim, statusId });
      if (!result)
        throw new Error("Erro ao atualizar atestado!");
      return ok({ message: "Atestado atualizado com sucesso" });
    } catch (error) {
      console.error("Erro ao atualizar atestado:", error);
      return serverError();
    }
  }
};

// src/main/factories/cadastrar-atestado-aprovado.ts
var makeCadastrarAtestadoAprovadoController = () => {
  const atestadoAprovadoRepository = new AtestadoAprovadoRepository();
  const atestadoAprovadoController = new AtestadoAprovadoController(atestadoAprovadoRepository);
  return new LogControllerDecorator(atestadoAprovadoController);
};

// src/main/routes/horarios/cadastrar-atestado-aprovado-routes.ts
var route3 = (router) => {
  router.put("/cadastrar-atestado-aprovado", adaptRoute(makeCadastrarAtestadoAprovadoController()));
};
var cadastrar_atestado_aprovado_routes_default = route3;

// src/infra/db/postgresdb/atestado-recusado-repository/atestado-recusado-repository.ts
var AtestadoRecusadoRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async addObservacao(input) {
    try {
      const savedAtestado = await this.prisma.atestado_funcionario.update({
        where: {
          id: input.id
        },
        data: {
          inicio: input.inicio,
          fim: input.fim,
          statusId: 3,
          observacao: input.observacao
        }
      });
      return !!savedAtestado;
    } catch (error) {
      console.error("Erro ao atualizar atestado:", error);
      return false;
    }
  }
};

// src/presentation/controllers/cadastrar-atestado-recusado/cadastrar-atestado-recusado.ts
var AtestadoRecusadoController = class {
  constructor(atestadoAprovadoRepository) {
    this.atestadoAprovadoRepository = atestadoAprovadoRepository;
  }
  async handle(httpRequest) {
    try {
      const { id, inicio, fim, statusId, observacao } = httpRequest.body;
      if (!id)
        return badRequest(new FuncionarioParamError("Falta o ID do atestado!"));
      if (!observacao)
        return badRequest(new FuncionarioParamError("Falta a data de fim!"));
      const result = await this.atestadoAprovadoRepository.addObservacao({ id, inicio, fim, statusId, observacao });
      if (!result)
        throw new Error("Erro ao atualizar atestado!");
      return ok({ message: "Atestado atualizado com sucesso" });
    } catch (error) {
      console.error("Erro ao atualizar atestado:", error);
      return serverError();
    }
  }
};

// src/main/factories/cadastrar-atestado-recusado.ts
var makeCadastrarAtestadoRecusadoController = () => {
  const atestadoRecusadoRepository = new AtestadoRecusadoRepository();
  const atestadoRecusadoController = new AtestadoRecusadoController(atestadoRecusadoRepository);
  return new LogControllerDecorator(atestadoRecusadoController);
};

// src/main/routes/horarios/cadastrar-atestado-recusado-routes.ts
var route4 = (router) => {
  router.put("/cadastrar-atestado-recusado", adaptRoute(makeCadastrarAtestadoRecusadoController()));
};
var cadastrar_atestado_recusado_routes_default = route4;

// src/infra/db/postgresdb/calcular-resumo/utils.ts
var import_moment = __toESM(require("moment"), 1);
function arredondarParteDecimalHoras(numero) {
  const parteInteira = Math.trunc(numero);
  const decimalParte = Math.abs(numero - parteInteira);
  if (decimalParte >= 0.6) {
    return numero > 0 ? Math.ceil(numero) : Math.ceil(numero) - 1;
  } else {
    return parteInteira;
  }
}
function arredondarParteDecimal(numero) {
  const inteiro = Math.floor(numero);
  const decimal = numero - inteiro;
  if (decimal >= 0.6) {
    return inteiro + 1;
  } else {
    return inteiro;
  }
}

// src/infra/db/postgresdb/calcular-resumo/calcular-resumo-repository.ts
var CalcularResumoPostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  calcularResumo(funcionario) {
    let somaMovimentacao60 = 0;
    let somaMovimentacao100 = 0;
    let somaMovimentacaoNoturna60 = 0;
    let somaMovimentacaoNoturna100 = 0;
    const saldoAnterior = { sessenta: 0, cem: 0 };
    let horasDiurno60 = 0;
    let horasDiurno100 = 0;
    let horasNoturno60 = 0;
    let horasNoturno100 = 0;
    for (const cartao of funcionario.cartao) {
      for (const cartao_dia of cartao.dias) {
        const resumoDia = cartao_dia.ResumoDia || {
          movimentacao60: 0,
          movimentacao100: 0,
          movimentacaoNoturna60: 0,
          movimentacaoNoturna100: 0
        };
        if (typeof resumoDia.movimentacao60 === "number" && typeof resumoDia.movimentacao100 === "number" && typeof resumoDia.movimentacaoNoturna60 === "number" && typeof resumoDia.movimentacaoNoturna100 === "number") {
          if (!isNaN(resumoDia.movimentacao60))
            somaMovimentacao60 += resumoDia.movimentacao60;
          if (!isNaN(resumoDia.movimentacao100))
            somaMovimentacao100 += resumoDia.movimentacao100;
          if (!isNaN(resumoDia.movimentacaoNoturna60))
            somaMovimentacaoNoturna60 += resumoDia.movimentacaoNoturna60;
          if (!isNaN(resumoDia.movimentacaoNoturna100))
            somaMovimentacaoNoturna100 += resumoDia.movimentacaoNoturna100;
        }
      }
    }
    horasDiurno60 = arredondarParteDecimalHoras(somaMovimentacao60 / 60);
    horasDiurno100 = arredondarParteDecimalHoras(somaMovimentacao100 / 60);
    horasNoturno60 = arredondarParteDecimalHoras(somaMovimentacaoNoturna60 / 60);
    horasNoturno100 = arredondarParteDecimalHoras(somaMovimentacaoNoturna100 / 60);
    return {
      movimentacao: {
        sessenta: somaMovimentacao60 + somaMovimentacaoNoturna60,
        cem: somaMovimentacao100 + somaMovimentacaoNoturna100
      },
      soma: {
        sessenta: saldoAnterior.sessenta + somaMovimentacao60 + somaMovimentacaoNoturna60,
        cem: saldoAnterior.cem + somaMovimentacao100 + somaMovimentacaoNoturna100
      },
      horas: {
        diurnas: { sessenta: horasDiurno60, cem: horasDiurno100 },
        noturnas: { sessenta: horasNoturno60, cem: horasNoturno100 }
      },
      saldoAnterior
    };
  }
  async calc(identificacao) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { identificacao },
      include: {
        cartao: {
          include: {
            cartao_dia: {
              orderBy: { id: "asc" },
              include: {
                eventos: true,
                atestado_abonos: true
                // Inclui atestado_abono relacionado ao cartaoDiaId
              }
            }
          },
          orderBy: { id: "asc" }
        }
      }
    });
    if (!funcionario) {
      throw new Error("Funcion\xE1rio n\xE3o encontrado");
    }
    const cartoes = funcionario.cartao.map((cartao) => {
      const diasFiltrados = cartao.cartao_dia.filter((cartao_dia) => {
        if (!cartao_dia)
          return false;
        const eventosCriticos = cartao_dia.eventos.filter((evento) => evento.tipoId === 2 && !evento.tratado);
        const eventosTipo8 = cartao_dia.eventos.filter((evento) => evento.tipoId === 8 && !evento.tratado);
        if (eventosCriticos.length > 0 || eventosTipo8.length > 1) {
          return true;
        }
        const eventosDiurnos = cartao_dia.eventos.filter(
          (evento) => evento.tipoId !== 2 && evento.tipoId !== 8 && evento.tipoId !== 4
        );
        return eventosDiurnos.length !== 0 || cartao_dia.atestado_abonos.length !== 0;
      });
      const dias = diasFiltrados.map((cartao_dia) => {
        const eventosCriticos = cartao_dia.eventos.filter((evento) => evento.tipoId === 2 && !evento.tratado);
        const eventosTipo8 = cartao_dia.eventos.filter((evento) => evento.tipoId === 8 && !evento.tratado);
        if (eventosCriticos.length > 0 || eventosTipo8.length > 1) {
          return {
            data: cartao_dia.data.toISOString(),
            // Convertendo Date para string
            periodoDescanso: cartao_dia.periodoDescanso,
            cargaHor: cartao_dia.cargaHor,
            cargaHorariaCompleta: cartao_dia.cargaHorariaCompleta,
            cargaHorariaNoturna: cartao_dia.cargaHorariaNoturna,
            ResumoDia: {
              movimentacao60: "-",
              movimentacao100: "-",
              movimentacaoNoturna60: "-",
              movimentacaoNoturna100: "-"
            }
          };
        }
        const eventosNoturnos = cartao_dia.eventos.filter((evento) => evento.tipoId === 4);
        const eventosDiurnos = cartao_dia.eventos.filter(
          (evento) => evento.tipoId !== 2 && evento.tipoId !== 8 && evento.tipoId !== 4
        );
        const totalMinutos = eventosDiurnos.reduce((sum, evento) => sum + evento.minutos, 0) + cartao_dia.atestado_abonos.reduce((sum, abono) => sum + abono.minutos, 0);
        let movimentacao60 = totalMinutos - cartao_dia.cargaHor;
        let movimentacao100 = 0;
        let movimentacaoNoturna60 = eventosNoturnos.reduce((sum, evento) => sum + evento.minutos, 0);
        if (movimentacao60 > 120) {
          movimentacao100 = movimentacao60 - 120;
          movimentacao60 = 120;
        }
        return {
          data: cartao_dia.data.toISOString(),
          // Convertendo Date para string
          periodoDescanso: cartao_dia.periodoDescanso,
          cargaHor: cartao_dia.cargaHor,
          cargaHorariaCompleta: cartao_dia.cargaHorariaCompleta,
          cargaHorariaNoturna: cartao_dia.cargaHorariaNoturna,
          ResumoDia: {
            movimentacao60,
            movimentacao100,
            movimentacaoNoturna60,
            movimentacaoNoturna100: 0
            // Aqui pode adicionar a lógica correspondente
          }
        };
      });
      return {
        referencia: cartao.referencia.toISOString(),
        // Convertendo Date para string
        dias
      };
    });
    let resumoCalculado = this.calcularResumo({ cartao: cartoes });
    let saldoSessenta = resumoCalculado.movimentacao.sessenta;
    const cartoesAtualizados = cartoes.map((cartao) => {
      const dias = cartao.dias.map((cartao_dia) => {
        if (typeof cartao_dia.ResumoDia.movimentacao60 === "number" && cartao_dia.ResumoDia.movimentacao60 < 0) {
          const diferenca = Math.abs(cartao_dia.ResumoDia.movimentacao60);
          if (saldoSessenta > 0) {
            cartao_dia.ResumoDia.movimentacao60 /= 1.6;
            cartao_dia.ResumoDia.movimentacao60 = arredondarParteDecimal(cartao_dia.ResumoDia.movimentacao60);
            saldoSessenta -= diferenca;
          }
        }
        return cartao_dia;
      });
      return { ...cartao, dias };
    });
    resumoCalculado = this.calcularResumo({ cartao: cartoesAtualizados });
    return {
      identificacao: funcionario.identificacao,
      cartao: cartoesAtualizados,
      Resumo: resumoCalculado
    };
  }
};

// src/presentation/controllers/calcular-resumo/carcular-resumo-controller.ts
var CalcularResumoController = class {
  constructor(calcularResumoPostgresRepository) {
    this.calcularResumoPostgresRepository = calcularResumoPostgresRepository;
  }
  async handle(httpRequest) {
    try {
      const { identificacao } = httpRequest?.query;
      if (!identificacao)
        return badRequest(new FuncionarioParamError("identificacao n\xE3o fornecido!"));
      const funcionario = await this.calcularResumoPostgresRepository.calc(identificacao);
      if (!funcionario)
        return notFoundRequest({ message: "Funcion\xE1rio n\xE3o encontrado", name: "Error" });
      return ok({ message: "Identificador encontrado com sucesso", data: funcionario });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/calcular-resumo.ts
var makeCalcularresumoController = () => {
  const calcularResumoPostgresRepository = new CalcularResumoPostgresRepository();
  const calcularResumoController = new CalcularResumoController(calcularResumoPostgresRepository);
  return new LogControllerDecorator(calcularResumoController);
};

// src/main/routes/horarios/calcular-resumo-routes.ts
var route5 = (router) => {
  router.get("/calcular-resumo", adaptRoute(makeCalcularresumoController()));
};
var calcular_resumo_routes_default = route5;

// src/presentation/controllers/confirmar-lanca-dia/confirmar-lanca-dia.ts
var ConfirmarLancaDiaController = class {
  constructor(confirmarLancaDiaPostgresRepository) {
    this.confirmarLancaDiaPostgresRepository = confirmarLancaDiaPostgresRepository;
  }
  async handle(httpRequest) {
    try {
      const {
        cartao_dia_id,
        userName,
        cartao_dia_lancamentos
      } = httpRequest?.body;
      if (!cartao_dia_id)
        return badRequest(new FuncionarioParamError("Falta sequencia do cart\xE3o!"));
      if (!userName)
        return badRequest(new FuncionarioParamError("Falta usu\xE1rio para lan\xE7ar cart\xE3o"));
      if (!cartao_dia_lancamentos)
        return badRequest(new FuncionarioParamError("Falta objeto cartao_dia_lancamentos"));
      if (cartao_dia_lancamentos.length == 0)
        return badRequest(new FuncionarioParamError("Falta cartao_dia_lancamentos"));
      let error = "";
      cartao_dia_lancamentos.map((lancamento, index) => {
        console.log(lancamento.periodoId, !Number(lancamento.periodoId));
        console.log(lancamento.entrada, !new Date(lancamento.entrada).getTime());
        console.log(lancamento.saida, !new Date(lancamento.saida).getTime());
        if (!Number(lancamento.periodoId))
          error = `${error}
Falta periodo do lan\xE7amento no cartao_dia_lancamentos `;
        if (!new Date(lancamento.entrada).getTime())
          error = `${error}
Data do lan\xE7amento de entrada inv\xE1lida no cartao_dia_lancamentos`;
        if (!new Date(lancamento.saida).getTime())
          error = `${error}
Data do lan\xE7amento de sa\xEDda inv\xE1lida no cartao_dia_lancamentos`;
        cartao_dia_lancamentos[index].entrada = new Date(cartao_dia_lancamentos[index].entrada);
        cartao_dia_lancamentos[index].saida = new Date(cartao_dia_lancamentos[index].saida);
      });
      if (error)
        return badRequest(new FuncionarioParamError(error));
      const dia = await this.confirmarLancaDiaPostgresRepository.findFisrt({ id: Number(cartao_dia_id) });
      if (!dia)
        return badRequest(new FuncionarioParamError("Dia do cart\xE3o n\xE3o localizado!"));
      dia.lancamentos.map((lancamento) => {
        if (lancamento.validadoPeloOperador)
          error = "Lan\xE7amento j\xE1 validado!";
      });
      if (error)
        return badRequest(new FuncionarioParamError(error));
      cartao_dia_lancamentos.map((lancamento) => {
        const existDb = dia.lancamentos.find(
          (lancamentoDb) => lancamentoDb.entrada?.getTime() === lancamento.entrada.getTime() && lancamentoDb.saida?.getTime() === lancamento.saida.getTime() && lancamento.periodoId === lancamentoDb.periodoId
        );
        if (!existDb)
          error = `O ${lancamento.periodoId}\xBA per\xEDodo n\xE3o \xE9 igual do primeiro lan\xE7amento!`;
      });
      if (error)
        return badRequest(new FuncionarioParamError(error));
      dia.lancamentos.map((lancamentoDb) => {
        const exist = cartao_dia_lancamentos.find(
          (lancamento) => lancamento.entrada.getTime() === lancamentoDb.entrada?.getTime() && lancamento.saida.getTime() === lancamentoDb.saida?.getTime() && lancamento.periodoId === lancamentoDb.periodoId
        );
        if (!exist)
          error = `O lan\xE7amento do ${lancamentoDb.periodoId}\xBA periodo n\xE3o informado!`;
      });
      if (error)
        return badRequest(new FuncionarioParamError(error));
      const updated = await this.confirmarLancaDiaPostgresRepository.update(
        dia.lancamentos.map((lancamento) => ({
          id: lancamento.id
        }))
      );
      if (!updated)
        serverError();
      return ok({ message: "Hor\xE1rios confirmados com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/infra/db/postgresdb/confirmar-lanca-dia/confirmar-lancar-dia.ts
var ConfirmarLancaDiaPostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async findFisrt(input) {
    const result = await this.prisma.cartao_dia.findFirst({ where: { id: input.id }, include: { cartao_dia_lancamentos: true } });
    if (!result)
      return void 0;
    return {
      id: result.id,
      lancamentos: result.cartao_dia_lancamentos.map((lancamento) => ({
        id: lancamento.id,
        entrada: lancamento.entrada,
        saida: lancamento.saida,
        validadoPeloOperador: lancamento.validadoPeloOperador,
        periodoId: lancamento.periodoId
      }))
    };
  }
  async update(input) {
    const query = [];
    input.map((a) => {
      query.push(this.prisma.cartao_dia_lancamento.update({ where: { id: a.id }, data: { validadoPeloOperador: true } }));
    });
    return Boolean((await this.prisma.$transaction(query)).length);
  }
};

// src/main/factories/confirmar-lancar-dia.ts
var makeConfirmarLancarDiaController = () => {
  const confirmarLancaDiaPostgresRepository = new ConfirmarLancaDiaPostgresRepository();
  const confirmarLancaDiaController = new ConfirmarLancaDiaController(confirmarLancaDiaPostgresRepository);
  return new LogControllerDecorator(confirmarLancaDiaController);
};

// src/main/routes/horarios/confirmar-lanca-dia-routes.ts
var route6 = (router) => {
  router.put("/confirmar-lanca-dia", adaptRoute(makeConfirmarLancarDiaController()));
};
var confirmar_lanca_dia_routes_default = route6;

// src/infra/db/postgresdb/eventos/eventos-repository.ts
var import_moment4 = __toESM(require("moment"), 1);

// src/infra/db/postgresdb/eventos/utils.ts
var import_moment2 = __toESM(require("moment"), 1);
function arredondarParteDecimalHoras2(numero) {
  const inteiro = Math.floor(numero);
  const decimal = numero - inteiro;
  const terceiraCasa = Math.floor(decimal * 1e3 % 10);
  if (terceiraCasa >= 6) {
    return Math.round(numero * 100) / 100;
  } else {
    return Math.floor(numero * 100) / 100;
  }
}
function arredondarParteDecimal2(numero) {
  const inteiro = Math.floor(numero);
  const decimal = numero - inteiro;
  if (decimal >= 0.6) {
    return inteiro + 1;
  } else {
    return inteiro;
  }
}

// src/infra/db/postgresdb/eventos/intervaloEntrePeriodos.ts
function calcularIntervaloEntrePeriodos(horarioSaidaPrimeiroPeriodo, horarioEntradaSegundoPeriodo) {
  const diferenca = horarioEntradaSegundoPeriodo.diff(horarioSaidaPrimeiroPeriodo, "minutes");
  return diferenca;
}
function criarEventoIntervaloEntrePeriodos(horarioSaidaPrimeiroPeriodo, horarioEntradaSegundoPeriodo, lancamento, totalPeriodos) {
  const minutosIntervalo = calcularIntervaloEntrePeriodos(horarioSaidaPrimeiroPeriodo, horarioEntradaSegundoPeriodo);
  if (minutosIntervalo !== 0) {
    const hora = minutosIntervalo > 0 ? `${horarioSaidaPrimeiroPeriodo.format("HH:mm")} - ${horarioEntradaSegundoPeriodo.format("HH:mm")}` : `${horarioEntradaSegundoPeriodo.format("HH:mm")} - ${horarioSaidaPrimeiroPeriodo.format("HH:mm")}`;
    return {
      cartaoDiaId: lancamento.cartao_dia.id,
      hora,
      tipoId: 8,
      // Defina um tipoId apropriado para o intervalo entre períodos
      funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
      minutos: arredondarParteDecimal2(minutosIntervalo)
    };
  }
  return null;
}

// src/infra/db/postgresdb/eventos/adicionalNoturno.ts
var import_moment3 = __toESM(require("moment"), 1);
function calcularAdicionalNoturno(horarioEsperado, horarioReal, lancamento) {
  const inicioAdicionalNoturno = import_moment3.default.utc(lancamento.cartao_dia.data).set({ hour: 22, minute: 0, second: 0 });
  const fimAdicionalNoturno = import_moment3.default.utc(lancamento.cartao_dia.data).set({ hour: 5, minute: 0, second: 0 }).add(1, "day");
  let minutosAdicionalNoturno = 0;
  const esperadoEstaNorutno = horarioEsperado.isBetween(inicioAdicionalNoturno, fimAdicionalNoturno);
  const realEstaNorutno = horarioReal.isBetween(inicioAdicionalNoturno, fimAdicionalNoturno);
  if (!esperadoEstaNorutno && !realEstaNorutno) {
    return 0;
  }
  if (horarioReal.isAfter(horarioEsperado)) {
    const minutosExcedidos = horarioReal.diff(horarioEsperado, "minutes");
    if (horarioEsperado.isBefore(inicioAdicionalNoturno) && horarioReal.isAfter(inicioAdicionalNoturno)) {
      minutosAdicionalNoturno = Math.min(horarioReal.diff(inicioAdicionalNoturno, "minutes"), minutosExcedidos);
    } else if (horarioEsperado.isAfter(inicioAdicionalNoturno) || horarioEsperado.isBefore(fimAdicionalNoturno)) {
      minutosAdicionalNoturno = Math.min(minutosExcedidos, fimAdicionalNoturno.diff(horarioEsperado, "minutes"));
    }
  } else {
    const minutosFaltantes = horarioEsperado.diff(horarioReal, "minutes");
    if (horarioReal.isBefore(fimAdicionalNoturno) && horarioReal.isAfter(inicioAdicionalNoturno)) {
      minutosAdicionalNoturno = -Math.min(fimAdicionalNoturno.diff(horarioReal, "minutes"), minutosFaltantes);
    } else if (horarioEsperado.isAfter(inicioAdicionalNoturno) || horarioEsperado.isBefore(fimAdicionalNoturno)) {
      minutosAdicionalNoturno = -Math.min(minutosFaltantes, fimAdicionalNoturno.diff(horarioReal, "minutes"));
    }
  }
  const adicionalNoturno = minutosAdicionalNoturno * 0.14;
  return arredondarParteDecimal2(adicionalNoturno);
}
function criarEventoAdicionalNoturno(horarioEsperado, horarioReal, lancamento) {
  const minutosAdicionalNoturno = calcularAdicionalNoturno(horarioEsperado, horarioReal, lancamento);
  if (minutosAdicionalNoturno !== 0) {
    const hora = minutosAdicionalNoturno > 0 ? `${horarioEsperado.format("HH:mm")} - ${horarioReal.format("HH:mm")}` : `${horarioReal.format("HH:mm")} - ${horarioEsperado.format("HH:mm")}`;
    return {
      cartaoDiaId: lancamento.cartao_dia.id,
      hora,
      tipoId: 4,
      funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
      minutos: minutosAdicionalNoturno
    };
  }
  return null;
}

// src/infra/db/postgresdb/eventos/eventos-repository.ts
var CriarEventosPostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async add(input) {
    const lancamentos = await this.prisma.cartao_dia_lancamento.findMany({
      include: {
        cartao_dia: {
          include: {
            cartao: {
              include: {
                funcionario: true
              }
            }
          }
        }
      },
      where: {
        cartao_dia: { cartao: { funcionario: { identificacao: input?.identificacao } } }
      },
      orderBy: [{ cartao_dia: { cartao: { funcionarioId: "asc" } } }, { cartao_dia_id: "asc" }, { periodoId: "asc" }]
    });
    const eventosData = this.gerarEventos({ lancamentos });
    const validEventosData = eventosData.filter((evento) => evento.cartaoDiaId && evento.hora);
    const existingEvents = await this.prisma.eventos.findMany({
      where: {
        OR: validEventosData.map((evento) => ({
          cartaoDiaId: evento.cartaoDiaId,
          funcionarioId: evento.funcionarioId,
          hora: evento.hora
        }))
      }
    });
    const newEventosData = validEventosData.filter((evento) => {
      return !existingEvents.some(
        (existingEvent) => existingEvent.cartaoDiaId === evento.cartaoDiaId && existingEvent.funcionarioId === evento.funcionarioId && existingEvent.hora === evento.hora
      );
    });
    if (newEventosData.length === 0) {
      console.log("Eventos j\xE1 existem para as datas fornecidas.");
      return false;
    }
    await this.prisma.eventos.createMany({
      data: newEventosData
    });
    return true;
  }
  gerarEventos(input) {
    let eventos = [];
    let eventosExcendentes = [];
    let excedeu = false;
    input.lancamentos.forEach((lancamento, index, lancamentosArray) => {
      if (index === 0 || input.lancamentos[index - 1].cartao_dia.id !== lancamento.cartao_dia.id) {
        excedeu = false;
        eventosExcendentes = [];
      }
      if (!lancamento.entrada || !lancamento.saida)
        return;
      const entrada = this.pegarLancamento({ data: lancamento.entrada });
      const saida = this.pegarLancamento({ data: lancamento.saida });
      console.log(`Entrada: ${entrada.format("HH:mm")} - Sa\xEDda: ${saida.format("HH:mm")}`);
      const cargaHorariaCompletaArray = this.pegarCargaHorarioCompleta(lancamento.cartao_dia.cargaHorariaCompleta);
      const horarioEntradaEsperado1 = this.pegarHorarioCargaHoraria({
        data: lancamento.cartao_dia.data,
        hora: cargaHorariaCompletaArray[0].hora,
        minuto: cargaHorariaCompletaArray[0].minuto,
        utc: false
      });
      const horarioSaidaEsperado = this.pegarHorarioCargaHoraria({
        data: lancamento.cartao_dia.data,
        hora: cargaHorariaCompletaArray[cargaHorariaCompletaArray.length - 2].hora,
        minuto: cargaHorariaCompletaArray[cargaHorariaCompletaArray.length - 2].minuto,
        utc: false
      });
      console.log(`Hor\xE1rio Entrada Esperado: ${horarioEntradaEsperado1.format("HH:mm")}`);
      console.log(`Hor\xE1rio Sa\xEDda Esperado: ${horarioSaidaEsperado.format("HH:mm")}`);
      console.log(`Sa\xEDda Real: ${saida.format("HH:mm")}`);
      const resultado = this.extrairEventosPeriodo(
        lancamento,
        entrada,
        saida,
        horarioEntradaEsperado1,
        horarioSaidaEsperado,
        eventos,
        eventosExcendentes,
        index === lancamentosArray.length - 1
      );
      if (resultado)
        excedeu = true;
      if (index < lancamentosArray.length - 1) {
        const proximoLancamento = lancamentosArray[index + 1];
        if (proximoLancamento.periodoId === lancamento.periodoId + 1) {
          const horarioSaidaPeriodoAtual = saida;
          const horarioEntradaProximoPeriodo = import_moment4.default.utc(proximoLancamento.entrada);
          this.extrairIntervalosEntrePeriodos(horarioSaidaPeriodoAtual, horarioEntradaProximoPeriodo, lancamento, eventos);
        }
      }
      if (excedeu) {
        eventosExcendentes.forEach((value) => {
          const novoEventos = [];
          eventos.map((evento) => {
            if (evento.cartaoDiaId === value.cartaoDiaId && evento.hora === value.hora && evento.tipoId === 9) {
              console.log("entuo");
            } else {
              novoEventos.push(evento);
            }
            return void 0;
          });
          novoEventos.push(value);
          eventos = novoEventos;
        });
        eventosExcendentes = [];
      }
    });
    return eventos;
  }
  extrairEventosPeriodo(lancamento, entrada, saida, horarioEntradaEsperado1, horarioSaidaEsperado, eventos, eventosExcendentes, isUltimoPeriodo) {
    let excedeu = false;
    const periodoId = lancamento.periodoId;
    if (horarioSaidaEsperado.isBefore(horarioEntradaEsperado1)) {
      horarioSaidaEsperado.add(1, "day");
    }
    if (periodoId === 1) {
      const resultado1 = this.criarEventoPeriodo1(
        lancamento,
        entrada,
        saida,
        horarioEntradaEsperado1,
        eventos,
        eventosExcendentes
      );
      if (resultado1)
        excedeu = true;
    } else if (periodoId === 2) {
      const resultado2 = this.criarEventoPeriodo2(lancamento, entrada, saida, horarioSaidaEsperado, eventos, eventosExcendentes);
      if (resultado2)
        excedeu = true;
    }
    if (isUltimoPeriodo) {
      const eventoAdicionalNoturno = criarEventoAdicionalNoturno(horarioSaidaEsperado, saida, lancamento);
      if (eventoAdicionalNoturno) {
        eventos.push(eventoAdicionalNoturno);
        console.log(
          `Evento Adicional Noturno criado: ${eventoAdicionalNoturno.hora} - Tipo: ${eventoAdicionalNoturno.tipoId} - Minutos: ${eventoAdicionalNoturno.minutos}`
        );
      }
    }
    return excedeu;
  }
  criarEventoPeriodo1(lancamento, entrada, saida, horarioEntradaEsperado1, eventos, eventosExcendentes) {
    let excedeu = false;
    if (entrada.isBefore(horarioEntradaEsperado1)) {
      console.log("Entrou");
      const eventoPeriodoReal = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${horarioEntradaEsperado1.format("HH:mm")} - ${saida.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(horarioEntradaEsperado1, "minutes")
      };
      eventos.push(eventoPeriodoReal);
      console.log(
        `Evento criado: ${eventoPeriodoReal.hora} - Tipo: ${eventoPeriodoReal.tipoId} - Minutos: ${eventoPeriodoReal.minutos}`
      );
      const eventoExcedentePositivoReal = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${entrada.format("HH:mm")} - ${horarioEntradaEsperado1.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: horarioEntradaEsperado1.diff(entrada, "minutes")
      };
      eventos.push(eventoExcedentePositivoReal);
      console.log(
        `Evento criado: ${eventoPeriodoReal.hora} - Tipo: ${eventoPeriodoReal.tipoId} - Minutos: ${eventoPeriodoReal.minutos}`
      );
    } else {
      const eventoPeriodo1 = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${entrada.format("HH:mm")} - ${saida.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(entrada, "minutes")
      };
      eventos.push(eventoPeriodo1);
      console.log(`Evento criado: ${eventoPeriodo1.hora} - Tipo: ${eventoPeriodo1.tipoId} - Minutos: ${eventoPeriodo1.minutos}`);
    }
    const eventoExcedentePositivo = {
      cartaoDiaId: lancamento.cartao_dia.id,
      hora: `${entrada.format("HH:mm")} - ${horarioEntradaEsperado1.format("HH:mm")}`,
      tipoId: 1,
      funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
      minutos: horarioEntradaEsperado1.diff(entrada, "minutes")
    };
    if (eventoExcedentePositivo.minutos < 0) {
      eventoExcedentePositivo.tipoId = 2;
    }
    if (eventoExcedentePositivo.minutos < 0) {
      eventoExcedentePositivo.hora = `${horarioEntradaEsperado1.format("HH:mm")} - ${entrada.format("HH:mm")}`;
    }
    if (Math.abs(eventoExcedentePositivo.minutos) > 5) {
      excedeu = true;
    }
    if (Math.abs(eventoExcedentePositivo.minutos) > 0) {
      eventosExcendentes.push(eventoExcedentePositivo);
    }
    if (excedeu) {
      console.log(
        `Evento criado: ${eventoExcedentePositivo.hora} - Tipo: ${eventoExcedentePositivo.tipoId} - Minutos: ${eventoExcedentePositivo.minutos}`
      );
    } else if (eventoExcedentePositivo.minutos < 0) {
      const eventoPositivo = { ...eventoExcedentePositivo, tipoId: 9, minutos: Math.abs(eventoExcedentePositivo.minutos) };
      eventos.push(eventoPositivo);
      console.log(
        `Evento positivo criado: ${eventoPositivo.hora} - Tipo: ${eventoPositivo.tipoId} - Minutos: ${eventoPositivo.minutos}`
      );
    }
    return excedeu;
  }
  criarEventoPeriodo2(lancamento, entrada, saida, horarioSaidaEsperado, eventos, eventosExcendentes) {
    let excedeu = false;
    if (saida.isBefore(horarioSaidaEsperado)) {
      const eventoPeriodoReal = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${entrada.format("HH:mm")} - ${saida.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(entrada, "minutes")
      };
      eventos.push(eventoPeriodoReal);
      console.log(
        `Evento criado: ${eventoPeriodoReal.hora} - Tipo: ${eventoPeriodoReal.tipoId} - Minutos: ${eventoPeriodoReal.minutos}`
      );
      const eventoExcedentePositivo = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${horarioSaidaEsperado.format("HH:mm")} - ${saida.format("HH:mm")}`,
        tipoId: 2,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(horarioSaidaEsperado, "minutes")
      };
      console.log(eventoExcedentePositivo.minutos, "minutos");
      if (Math.abs(eventoExcedentePositivo.minutos) > 5) {
        excedeu = true;
      }
      if (Math.abs(eventoExcedentePositivo.minutos) > 0) {
        eventosExcendentes.push(eventoExcedentePositivo);
      }
      if (eventoExcedentePositivo.minutos < 0) {
        eventoExcedentePositivo.hora = `${saida.format("HH:mm")} - ${horarioSaidaEsperado.format("HH:mm")}`;
      }
      if (excedeu) {
        console.log(
          `Evento criado000000000: ${eventoExcedentePositivo.hora} - Tipo: ${eventoExcedentePositivo.tipoId} - Minutos: ${eventoExcedentePositivo.minutos}`
        );
      } else {
        const eventoPositivo = {
          ...eventoExcedentePositivo,
          tipoId: 9,
          minutos: Math.abs(eventoExcedentePositivo.minutos)
        };
        eventos.push(eventoPositivo);
      }
    } else {
      const eventoPeriodoEsperado = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${entrada.format("HH:mm")} - ${horarioSaidaEsperado.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: horarioSaidaEsperado.diff(entrada, "minutes")
      };
      eventos.push(eventoPeriodoEsperado);
      console.log(
        `Evento criado: ${eventoPeriodoEsperado.hora} - Tipo: ${eventoPeriodoEsperado.tipoId} - Minutos: ${eventoPeriodoEsperado.minutos}`
      );
      const eventoExcedentePositivo = {
        cartaoDiaId: lancamento.cartao_dia.id,
        hora: `${horarioSaidaEsperado.format("HH:mm")} - ${saida.format("HH:mm")}`,
        tipoId: 1,
        funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
        minutos: saida.diff(horarioSaidaEsperado, "minutes")
      };
      if (Math.abs(eventoExcedentePositivo.minutos) > 5) {
        excedeu = true;
      }
      if (Math.abs(eventoExcedentePositivo.minutos) > 0) {
        eventosExcendentes.push(eventoExcedentePositivo);
      }
      if (excedeu) {
        console.log(
          `Evento criado: ${eventoExcedentePositivo.hora} - Tipo: ${eventoExcedentePositivo.tipoId} - Minutos: ${eventoExcedentePositivo.minutos}`
        );
      } else {
        const eventoPositivo = {
          ...eventoExcedentePositivo,
          tipoId: 9,
          minutos: Math.abs(eventoExcedentePositivo.minutos)
        };
        eventos.push(eventoPositivo);
      }
    }
    return excedeu;
  }
  extrairIntervalosEntrePeriodos(horarioSaidaPeriodoAtual, horarioEntradaProximoPeriodo, lancamento, eventos) {
    const eventoIntervalo = criarEventoIntervaloEntrePeriodos(
      horarioSaidaPeriodoAtual,
      horarioEntradaProximoPeriodo,
      lancamento,
      eventos.length
    );
    if (eventoIntervalo) {
      eventos.push(eventoIntervalo);
      console.log(`Evento Intervalo: ${eventoIntervalo.hora} - Minutos: ${eventoIntervalo.minutos}`);
    }
  }
  pegarLancamento(input) {
    return import_moment4.default.utc(input.data);
  }
  pegarCargaHorarioCompleta(input) {
    const horaMinutos = input.replaceAll(".", ":").split(";");
    return horaMinutos.map((a) => {
      const [hora, minuto] = a.split(":");
      return { hora: Number(hora), minuto: Number(minuto) };
    });
  }
  pegarHorarioCargaHoraria(input) {
    return import_moment4.default.utc(input.data).set({
      hours: input.hora,
      minutes: input.minuto,
      date: (0, import_moment4.default)(input.data).utc(input.utc).date(),
      months: (0, import_moment4.default)(input.data).utc(input.utc).month(),
      years: (0, import_moment4.default)(input.data).utc(input.utc).year(),
      second: 0
    });
  }
  formatarDataCartao(input) {
    return import_moment4.default.utc(input.data).format("YYYY-MM-DD");
  }
};

// src/presentation/controllers/eventos/eventos-controller.ts
var CriarEventosController = class {
  constructor(criarEventosPostgresRepository) {
    this.criarEventosPostgresRepository = criarEventosPostgresRepository;
  }
  async handle(req) {
    try {
      console.log("req.query.identificacao", req.query.identificacao);
      const eventosCriados = await this.criarEventosPostgresRepository.add({ identificao: req.query.identificacao });
      if (!eventosCriados)
        throw "Erro ao criar eventos!";
      return ok({ message: "Eventos criados com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/criar-eventos.ts
var makeCriarEventosController = () => {
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository();
  const criarEventosController = new CriarEventosController(criarEventosPostgresRepository);
  return new LogControllerDecorator(criarEventosController);
};

// src/main/routes/horarios/criar-eventos.ts
var route7 = (router) => {
  router.post("/eventos", adaptRoute(makeCriarEventosController()));
};
var criar_eventos_default = route7;

// src/data/usecase/delete-cartao/db-add-dele-cartoa.ts
var DbAddDeleteCartao = class {
  delDeleteCartoaRepository;
  constructor(delDeleteCartoaRepository) {
    this.delDeleteCartoaRepository = delDeleteCartoaRepository;
  }
  async deleteByReferencia(deleteReferencia) {
    await this.delDeleteCartoaRepository.deleteByReferencia(deleteReferencia);
  }
};

// src/infra/db/postgresdb/delete-cartao-repository/delete-cartao-repository.ts
var DeleteCartaoPostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async deleteByReferencia(deleteReferencia) {
    try {
      const { referencia } = deleteReferencia;
      const referenceDate = new Date(referencia);
      const nextDay = new Date(referenceDate);
      nextDay.setDate(referenceDate.getDate() + 1);
      await this.prisma.cartao.deleteMany({
        where: {
          referencia: {
            gte: referenceDate,
            lt: nextDay
          }
        }
      });
    } catch (error) {
      console.error("Erro ao deletar o cart\xE3o do m\xEAs", error);
      throw new Error("Erro ao deletar o cart\xE3o do m\xEAs");
    }
  }
};

// src/presentation/controllers/delete-cartao/delete-cartao-controller.ts
var DeleteCartaoController = class {
  dbAddDeleteCartao;
  constructor(dbAddDeleteCartao) {
    this.dbAddDeleteCartao = dbAddDeleteCartao;
  }
  async handle(httpRequest) {
    try {
      const { referencia } = httpRequest.body;
      if (!referencia) {
        return badRequest(new FuncionarioParamError("Refer\xEAncia do m\xEAs n\xE3o encontrada"));
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(referencia)) {
        return badRequest(new FuncionarioParamError("Formato de refer\xEAncia inv\xE1lido. Use YYYY-MM-DD."));
      }
      await this.dbAddDeleteCartao.deleteByReferencia({ referencia });
      return ok({ message: "Cart\xE3o do m\xEAs deletado com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/delete-cartao.ts
var makeDeleteCartaoController = () => {
  const deleteCartaoPostgresRepository = new DeleteCartaoPostgresRepository();
  const dbAddDeleteCartao = new DbAddDeleteCartao(deleteCartaoPostgresRepository);
  const deleteCartaoController = new DeleteCartaoController(dbAddDeleteCartao);
  return new LogControllerDecorator(deleteCartaoController);
};

// src/main/routes/horarios/delete-cartao-routes.ts
var route8 = (router) => {
  router.delete("/deletar-cartao", adaptRoute(makeDeleteCartaoController()));
};
var delete_cartao_routes_default = route8;

// src/data/usecase/delete-dia-horarios/db-add-delete.ts
var DbAddDelete = class {
  deldeleteRepository;
  constructor(deldeleteRepository) {
    this.deldeleteRepository = deldeleteRepository;
  }
  async deleteById(deleteData) {
    await this.deldeleteRepository.deleteById(deleteData);
  }
};

// src/infra/db/postgresdb/delete-dia-horario-repository/delete-dia-horario-repository.ts
var DeletePostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async deleteById(deleteData) {
    try {
      const { cartao_dia_id } = deleteData;
      await this.prisma.cartao_dia_lancamento.deleteMany({
        where: {
          cartao_dia_id
        }
      });
      await this.prisma.eventos.deleteMany({
        where: {
          cartaoDiaId: cartao_dia_id
        }
      });
    } catch (error) {
      console.error("Erro ao deletar hor\xE1rio:", error);
      throw new Error("Erro ao deletar hor\xE1rio");
    }
  }
};

// src/presentation/controllers/deletar/delete-dia-horarios-controller.ts
var DeleteController = class {
  dbAddDelete;
  constructor(dbAddDelete) {
    this.dbAddDelete = dbAddDelete;
  }
  async handle(httpRequest) {
    try {
      const { cartao_dia_id } = httpRequest.body;
      if (!cartao_dia_id) {
        return badRequest(new FuncionarioParamError("ID do dia n\xE3o fornecido"));
      }
      await this.dbAddDelete.deleteById({ cartao_dia_id });
      return ok({ message: "Registro deletado com sucesso" });
    } catch (error) {
      console.log(error);
      return serverError();
    }
  }
};

// src/main/factories/delete-dia-horario.ts
var makeDeleteController = () => {
  const deletePostgresRepository = new DeletePostgresRepository();
  const dbAddDelete = new DbAddDelete(deletePostgresRepository);
  const deleteController = new DeleteController(dbAddDelete);
  return new LogControllerDecorator(deleteController);
};

// src/main/routes/horarios/delete-dia-horarios-routes.ts
var route9 = (router) => {
  router.delete("/deletar", adaptRoute(makeDeleteController()));
};
var delete_dia_horarios_routes_default = route9;

// src/main/expotações-demitidos/exportar-dados.ts
var import_fs = __toESM(require("fs"), 1);
var import_client2 = require("@prisma/client");
var prisma2 = new import_client2.PrismaClient();
var exportarDadosDemitidosParaArquivo = async (callback, identificacao, localidade) => {
  try {
    const where = {};
    if (identificacao) {
      where.identificacao = identificacao;
    }
    if (localidade) {
      where.localidade = {
        nome: localidade
      };
    }
    console.log("bateu");
    const funcionarios = await prisma2.funcionario.findMany({
      where,
      include: {
        cartao: {
          include: {
            cartao_dia: {
              include: {
                cartao_dia_lancamentos: {
                  orderBy: {
                    entrada: "asc"
                    // Ordena os lançamentos por entrada em ordem crescente
                  }
                }
              },
              orderBy: {
                data: "asc"
                // Ordena os dias de cartão por data em ordem crescente
              }
            }
          }
        }
      }
    });
    const linhas = funcionarios.flatMap((funcionario) => {
      return funcionario.cartao.flatMap((cartao) => {
        return cartao.cartao_dia.map((dia) => {
          const lancamentos = dia.cartao_dia_lancamentos;
          if (lancamentos && lancamentos.length > 0) {
            const entradasSaidas = lancamentos.map((lancamento) => {
              const entradaLocal = ajustarFusoHorario(lancamento.entrada, 3);
              const saidaLocal = ajustarFusoHorario(lancamento.saida, 3);
              const entrada = formatarTempo(entradaLocal);
              const saida = formatarTempo(saidaLocal);
              return `${entrada};${saida}`;
            }).join(";");
            return `${funcionario.identificacao};${formatarData(dia.data)};${entradasSaidas}`;
          } else {
            return "";
          }
        });
      });
    });
    const linhasFiltradas = linhas.filter((linha) => linha !== "");
    const filename = "dados_da_tabela_filtrado.txt";
    const data = linhasFiltradas.join("\n");
    import_fs.default.writeFile(filename, data, "utf8", (err) => {
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
    await prisma2.$disconnect();
  }
};
var formatarTempo = (tempo) => {
  if (!tempo)
    return "";
  const data = new Date(tempo);
  const horas = data.getHours().toString().padStart(2, "0");
  const minutos = data.getMinutes().toString().padStart(2, "0");
  return `${horas}:${minutos}`;
};
var ajustarFusoHorario = (tempo, ajuste) => {
  if (!tempo)
    return tempo;
  const ajusteMs = ajuste * 60 * 60 * 1e3;
  return new Date(tempo.getTime() + ajusteMs);
};
var formatarData = (data) => {
  const ano = data.getFullYear();
  const mes = (data.getMonth() + 1).toString().padStart(2, "0");
  const dia = data.getDate().toString().padStart(2, "0");
  return `${ano}${mes}${dia}`;
};

// src/presentation/controllers/exportar-demitidos/exportar-lancamentos.ts
var ExportarDemitidosController = class {
  async handle(httpRequest) {
    try {
      const { identificacao, localidade } = httpRequest.query;
      if (!identificacao)
        return badRequest(new FuncionarioParamError("identificacao n\xE3o fornecido!"));
      if (!localidade)
        return badRequest(new FuncionarioParamError("localidade n\xE3o fornecido!"));
      return new Promise((resolve) => {
        exportarDadosDemitidosParaArquivo(
          (err, filename) => {
            if (err) {
              console.error("Erro ao exportar dados:", err);
              return resolve({
                statusCode: 500,
                body: "Erro ao exportar dados."
              });
            }
            resolve({
              statusCode: 200,
              body: "Arquivo exportado com sucesso"
            });
          },
          identificacao,
          localidade
        );
      });
    } catch (error) {
      console.error("Erro no controller:", error);
      return {
        statusCode: 500,
        body: "Erro no servidor."
      };
    }
  }
};

// src/main/routes/horarios/export-demitidos-routes.ts
var route10 = (router) => {
  router.post("/exportarDemitidos-lancamentos", adaptRoute(new ExportarDemitidosController()));
};
var export_demitidos_routes_default = route10;

// src/main/exportacoes-geral/exportar-dados.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_client3 = require("@prisma/client");
var prisma3 = new import_client3.PrismaClient();
var exportarDadosParaArquivo = async (callback) => {
  try {
    const funcionarios = await prisma3.funcionario.findMany({
      include: {
        cartao: {
          include: {
            cartao_dia: {
              include: {
                cartao_dia_lancamentos: {
                  orderBy: {
                    entrada: "asc"
                    // Ordena os lançamentos por entrada em ordem crescente
                  }
                }
              },
              orderBy: {
                data: "asc"
                // Ordena os dias de cartão por data em ordem crescente
              }
            }
          }
        }
      }
    });
    const linhas = funcionarios.flatMap((funcionario) => {
      return funcionario.cartao.flatMap((cartao) => {
        return cartao.cartao_dia.map((dia) => {
          const lancamentos = dia.cartao_dia_lancamentos;
          if (lancamentos && lancamentos.length > 0) {
            const entradasSaidas = lancamentos.map((lancamento) => {
              const entradaLocal = ajustarFusoHorario2(lancamento.entrada, 3);
              const saidaLocal = ajustarFusoHorario2(lancamento.saida, 3);
              const entrada = formatarTempo2(entradaLocal);
              const saida = formatarTempo2(saidaLocal);
              return `${entrada};${saida}`;
            }).join(";");
            return `${funcionario.identificacao};${formatarData2(dia.data)};${entradasSaidas}`;
          } else {
            return "";
          }
        });
      });
    });
    const linhasFiltradas = linhas.filter((linha) => linha !== "");
    const filename = "dados_da_tabela.txt";
    const data = linhasFiltradas.join("\n");
    import_fs2.default.writeFile(filename, data, "utf8", (err) => {
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
    await prisma3.$disconnect();
  }
};
var formatarTempo2 = (tempo) => {
  if (!tempo)
    return "";
  const data = new Date(tempo);
  const horas = data.getHours().toString().padStart(2, "0");
  const minutos = data.getMinutes().toString().padStart(2, "0");
  return `${horas}:${minutos}`;
};
var ajustarFusoHorario2 = (tempo, ajuste) => {
  if (!tempo)
    return tempo;
  const ajusteMs = ajuste * 60 * 60 * 1e3;
  return new Date(tempo.getTime() + ajusteMs);
};
var formatarData2 = (data) => {
  const ano = data.getFullYear();
  const mes = (data.getMonth() + 1).toString().padStart(2, "0");
  const dia = data.getDate().toString().padStart(2, "0");
  return `${ano}${mes}${dia}`;
};

// src/presentation/controllers/exportar-arquivos-geral/exporatar-lancamentos.ts
var ExportarController = class {
  async handle() {
    return new Promise((resolve) => {
      exportarDadosParaArquivo((err, filename) => {
        if (err) {
          console.error("Erro ao exportar dados:", err);
          return resolve({
            statusCode: 500,
            body: "Erro ao exportar dados."
          });
        }
        resolve({
          statusCode: 200,
          body: "Arquivo exportado com sucesso"
        });
      });
    });
  }
};

// src/main/routes/horarios/export-geral-routes.ts
var route11 = (router) => {
  router.post("/exportar-lancamentos", adaptRoute(new ExportarController()));
};
var export_geral_routes_default = route11;

// src/infra/db/postgresdb/get-funcionario/get-funcionario.ts
var FuncionarioPostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async findFisrt(identificacao, localidade) {
    const funcionario = await this.prisma.funcionario.findFirst({
      where: { identificacao: { endsWith: identificacao }, localidadeId: localidade },
      include: {
        cartao: {
          include: {
            cartao_dia: {
              include: {
                cartao_dia_lancamentos: {
                  include: {
                    cartao_dia_lancamento_status: true
                    // Inclui a tabela 'cartao_dia_lancamento_status'
                  }
                },
                cartao_dia_status: true
              },
              orderBy: { id: "asc" }
            },
            cartao_status: true
          },
          orderBy: { id: "asc" }
        },
        turno: true,
        // Inclui a tabela 'turno' nos resultados
        localidade: true,
        // Inclui a tabela 'localidade' nos resultados
        afastamento: {
          include: { funcionarios_afastados_status: true }
        }
      },
      orderBy: { id: "asc" }
    });
    if (!funcionario)
      return void 0;
    return funcionario;
  }
};

// src/presentation/controllers/procurar-funcionário/procurar-funcionário.ts
var GetFuncionarioController = class {
  constructor(funcionarioPostgresRepository, calcularResumoPostgresRepository) {
    this.funcionarioPostgresRepository = funcionarioPostgresRepository;
    this.calcularResumoPostgresRepository = calcularResumoPostgresRepository;
  }
  async handle(httpRequest) {
    try {
      const { identificacao, localidade } = httpRequest?.query;
      if (!identificacao)
        return badRequest(new FuncionarioParamError("identificacao n\xE3o fornecido!"));
      if (!localidade)
        return badRequest(new FuncionarioParamError("localidade n\xE3o fornecido!"));
      const funcionario = await this.funcionarioPostgresRepository.findFisrt(identificacao, localidade);
      if (!funcionario)
        return notFoundRequest({ message: "Identificador n\xE3o encontrado", name: "Error" });
      const resumoCalculado = await this.calcularResumoPostgresRepository.calc(identificacao);
      return ok({ message: "Identificador encontrado com sucesso", data: funcionario, resumo: resumoCalculado });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/get-funcionario.ts
var makeGetFuncionarioController = () => {
  const funcionarioPostgresRepository = new FuncionarioPostgresRepository();
  const calcularResumoPostgresRepository = new CalcularResumoPostgresRepository();
  const getFuncionarioController = new GetFuncionarioController(funcionarioPostgresRepository, calcularResumoPostgresRepository);
  return new LogControllerDecorator(getFuncionarioController);
};

// src/main/routes/horarios/get-funcionario-routes.ts
var route12 = (router) => {
  router.get("/funcionario", adaptRoute(makeGetFuncionarioController()));
};
var get_funcionario_routes_default = route12;

// src/infra/db/postgresdb/lancar-dia/lancar-dia.ts
var LancarDiaPostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async upsert(input) {
    return Boolean(
      await this.prisma.cartao_dia_lancamento.upsert({
        where: { cartao_dia_id_periodoId: { cartao_dia_id: input.cartao_dia_id, periodoId: input.periodoId } },
        create: {
          entrada: input.entrada,
          saida: input.saida,
          periodoId: input.periodoId,
          cartao_dia_id: input.cartao_dia_id,
          statusId: input.statusId,
          diferenca: input.diferenca,
          userName: input.userName
        },
        update: {
          entrada: input.entrada,
          saida: input.saida,
          periodoId: input.periodoId,
          cartao_dia_id: input.cartao_dia_id,
          statusId: input.statusId,
          diferenca: input.diferenca,
          userName: input.userName
        }
      })
    );
  }
  async findConflictingPeriodos(entrada, saida, cartao_dia_id, periodoId) {
    return await this.prisma.cartao_dia_lancamento.findMany({
      where: {
        cartao_dia_id,
        periodoId: { not: periodoId },
        AND: [{ entrada: { lt: saida } }, { saida: { gt: entrada } }]
      }
    });
  }
  async findCartaoDiaById(cartao_dia_id) {
    return await this.prisma.cartao_dia.findUnique({
      where: { id: cartao_dia_id }
    });
  }
};

// src/presentation/controllers/lancar-dia/lancar-dia.ts
var LancarDiaController = class {
  constructor(lancarDiaPostgresRepository) {
    this.lancarDiaPostgresRepository = lancarDiaPostgresRepository;
  }
  async handle(httpRequest) {
    try {
      const { periodoId, entrada, saida, cartao_dia_id, userName } = httpRequest?.body;
      if (!periodoId)
        return badRequest(new FuncionarioParamError("Falta id do periodo!"));
      if (!entrada)
        return badRequest(new FuncionarioParamError("Falta entrada!"));
      if (!saida)
        return badRequest(new FuncionarioParamError("Falta saida!"));
      if (!cartao_dia_id)
        return badRequest(new FuncionarioParamError("Falta sequencia do cart\xE3o!"));
      if (!userName)
        return badRequest(new FuncionarioParamError("Falta usu\xE1rio para lan\xE7ar cart\xE3o"));
      const entradaDate = new Date(entrada);
      const saidaDate = new Date(saida);
      if (isNaN(entradaDate.getTime()) || isNaN(saidaDate.getTime())) {
        return badRequest(new FuncionarioParamError("Formato de data inv\xE1lido!"));
      }
      const cartaoDia = await this.lancarDiaPostgresRepository.findCartaoDiaById(cartao_dia_id);
      if (!cartaoDia) {
        return badRequest(new FuncionarioParamError("Cart\xE3o do dia n\xE3o encontrado!"));
      }
      const cartaoDiaDate = new Date(cartaoDia.data);
      const cartaoDiaDateStr = cartaoDiaDate.toISOString().split("T")[0];
      const entradaDateStr = entradaDate.toISOString().split("T")[0];
      const saidaDateStr = saidaDate.toISOString().split("T")[0];
      if (entradaDate < cartaoDiaDate || saidaDate < cartaoDiaDate) {
        return badRequest(new FuncionarioParamError("Data divergente entre o cart\xE3o do dia e o lan\xE7amento!"));
      }
      const conflictingPeriodos = await this.lancarDiaPostgresRepository.findConflictingPeriodos(
        entradaDate,
        saidaDate,
        cartao_dia_id,
        periodoId
      );
      if (conflictingPeriodos.length > 0) {
        return badRequest(new FuncionarioParamError("Per\xEDodo j\xE1 existente!"));
      }
      const diferenca = this.calcularDiferencaMinutos(entradaDate, saidaDate);
      const saved = await this.lancarDiaPostgresRepository.upsert({
        cartao_dia_id,
        entrada: entradaDate,
        periodoId,
        saida: saidaDate,
        statusId: 1,
        diferenca,
        userName
      });
      if (!saved)
        throw "Erro ao salvar lan\xE7amento!";
      return ok({ message: "Salvo com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
  calcularDiferencaMinutos(entrada, saida) {
    const diferencaMs = saida.getTime() - entrada.getTime();
    const diferencaMinutos = Math.ceil(diferencaMs / (1e3 * 60));
    return diferencaMinutos;
  }
};

// src/main/factories/lancar-dia.ts
var makeLancarDiaController = () => {
  const lancarDiaPostgresRepository = new LancarDiaPostgresRepository();
  const lancarDiaController = new LancarDiaController(lancarDiaPostgresRepository);
  return new LogControllerDecorator(lancarDiaController);
};

// src/main/routes/horarios/lancar-dia-routes.ts
var route13 = (router) => {
  router.post("/lancar-dia", adaptRoute(makeLancarDiaController()));
};
var lancar_dia_routes_default = route13;

// src/infra/db/postgresdb/listar-acompanhante/listar-acompanhante-repository.ts
var ListarAcompanahanteRepsository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async list() {
    return await this.prisma.tipo_acompanhante.findMany();
  }
};

// src/presentation/controllers/listar-acompanhante/listar-acompanhante-controler.ts
var ListarAcompanhanteController = class {
  constructor(localidadePostgresRepository) {
    this.localidadePostgresRepository = localidadePostgresRepository;
  }
  async handle() {
    try {
      const lancamentos = await this.localidadePostgresRepository.list();
      return ok({ lancamentos });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/listar-acompanhante.ts
var makeListarAcompanhanteController = () => {
  const listarAcompanahanteRepsository = new ListarAcompanahanteRepsository();
  const listarAcompanhanteController = new ListarAcompanhanteController(listarAcompanahanteRepsository);
  return new LogControllerDecorator(listarAcompanhanteController);
};

// src/main/routes/horarios/listar-acompanhante-routes.ts
var route14 = (router) => {
  router.get("/listar-acompanhante", adaptRoute(makeListarAcompanhanteController()));
};
var listar_acompanhante_routes_default = route14;

// src/infra/db/postgresdb/listar-atestados-60-dias/listar-atestados-60-dias.ts
var import_moment5 = __toESM(require("moment"), 1);
var ListarAtestados60DiasRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async listar60Dias(funcionarioId) {
    const hoje = /* @__PURE__ */ new Date();
    const sessentaDiasAtras = /* @__PURE__ */ new Date();
    const comFormato = (0, import_moment5.default)(sessentaDiasAtras.setDate(hoje.getDate() - 60)).utc(true).toDate();
    console.log("Aquiiiii", comFormato);
    const atestados = await this.prisma.atestado_funcionario.findMany({
      where: {
        funcionarioId,
        statusId: {
          in: [1, 2]
        },
        data: {
          gte: comFormato,
          lte: hoje
        }
      },
      include: {
        funcionario: true,
        tipo_acompanhante: true,
        tipo_ocupacao: true,
        tipo_status: true,
        tipos_documentos: true,
        tipo_eventos: true
      },
      orderBy: {
        data: "desc"
      }
    });
    return atestados.map((atestado) => ({
      data: atestado.data,
      id: atestado.id,
      inicio: atestado.inicio,
      fim: atestado.fim,
      grupo_cid: atestado.grupo_cid,
      acidente_trabalho: atestado.acidente_trabalho,
      descricao: atestado.descricao,
      userName: atestado.userName,
      funcionarioId: atestado.funcionarioId,
      idade_paciente: atestado.idade_paciente,
      nome: atestado.funcionario?.nome,
      identificacao: atestado.funcionario?.identificacao,
      nomeAcao: atestado.tipo_eventos?.nome,
      nomeAcompanhante: atestado.tipo_acompanhante?.nome,
      nomeOcupacao: atestado.tipo_ocupacao?.nome,
      nomeStatus: atestado.tipo_status?.nome,
      nomeDocumento: atestado.tipos_documentos?.nome
    }));
  }
};

// src/presentation/controllers/listar-atestados-60-dias/listar-atestados-60-dias-controler.ts
var ListarAtestado60DiasController = class {
  constructor(atestadoPostgresRepository) {
    this.atestadoPostgresRepository = atestadoPostgresRepository;
  }
  async handle(httpRequest) {
    try {
      const { funcionarioId } = httpRequest.query;
      if (!funcionarioId)
        return badRequest(new FuncionarioParamError("Falta a identifica\xE7\xE3o do funcion\xE1rio!"));
      const atestados = await this.atestadoPostgresRepository.listar60Dias(Number(funcionarioId));
      if (!atestados || atestados.length === 0) {
        return ok({ message: "Nenhum atestado encontrado para esta identifica\xE7\xE3o." });
      }
      return ok({ atestados });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/listar-atestados-60-dias.ts
var makeListarAtestados60DiasController = () => {
  const listarAtestados60DiasRepository = new ListarAtestados60DiasRepository();
  const listarAtestado60DiasController = new ListarAtestado60DiasController(listarAtestados60DiasRepository);
  return new LogControllerDecorator(listarAtestado60DiasController);
};

// src/main/routes/horarios/listar-atestados-60-dias-routes.ts
var route15 = (router) => {
  router.get("/listar-todosatestado-60dias", adaptRoute(makeListarAtestados60DiasController()));
};
var listar_atestados_60_dias_routes_default = route15;

// src/infra/db/postgresdb/listar-atestados-não-analisados/listar-atestados.ts
var ListarAtestadoRepsository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async list() {
    const atestados = await this.prisma.atestado_funcionario.findMany({
      where: {
        tipo_status: {
          id: 1
        }
      },
      include: {
        funcionario: true,
        tipo_acompanhante: true,
        tipo_ocupacao: true,
        tipo_status: true,
        tipos_documentos: true,
        tipo_eventos: true
      },
      orderBy: {
        data: "asc"
      }
    });
    return atestados.map((atestado) => ({
      data: atestado.data,
      id: atestado.id,
      inicio: atestado.inicio,
      fim: atestado.fim,
      grupo_cid: atestado.grupo_cid,
      acidente_trabalho: atestado.acidente_trabalho,
      descricao: atestado.descricao,
      userName: atestado.userName,
      funcionarioId: atestado.funcionarioId,
      idade_paciente: atestado.idade_paciente,
      nome: atestado.funcionario?.nome,
      identificacao: atestado.funcionario?.identificacao,
      nomeAcao: atestado.tipo_eventos?.nome,
      nomeAcompanhante: atestado.tipo_acompanhante?.nome,
      nomeOcupacao: atestado.tipo_ocupacao?.nome,
      nomeStatus: atestado.tipo_status?.nome,
      nomeDocumento: atestado.tipos_documentos?.nome
    }));
  }
};

// src/presentation/controllers/listar-atestados-não-analisados/listar-atestados-controler.ts
var ListarAtestadoController = class {
  constructor(AtestadoPostgresRepository) {
    this.AtestadoPostgresRepository = AtestadoPostgresRepository;
  }
  async handle() {
    try {
      const atestados = await this.AtestadoPostgresRepository.list();
      return ok({ atestados });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/listar-atestados-não-analisados.ts
var makeListarAtestadosController = () => {
  const listarAtestadoRepsository = new ListarAtestadoRepsository();
  const listarAtestadoController = new ListarAtestadoController(listarAtestadoRepsository);
  return new LogControllerDecorator(listarAtestadoController);
};

// src/main/routes/horarios/listar-atestados-não-tratados.ts
var route16 = (router) => {
  router.get("/listar-atestado", adaptRoute(makeListarAtestadosController()));
};
var listar_atestados_n_o_tratados_default = route16;

// src/infra/db/postgresdb/listar-descricao-repository/listar-descricao-repository.ts
var ListarDescricacoRepsository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async list() {
    return await this.prisma.descricaco_cid.findMany();
  }
};

// src/presentation/controllers/listar-descricao/listar-descricao-controler.ts
var ListarDescricacoController = class {
  constructor(CIDPostgresRepository) {
    this.CIDPostgresRepository = CIDPostgresRepository;
  }
  async handle() {
    try {
      const descricaco = await this.CIDPostgresRepository.list();
      return ok({ descricaco });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/listar-descricao.ts
var makeDescricacoController = () => {
  const listarDescricacoRepsository = new ListarDescricacoRepsository();
  const listarDescricacoController = new ListarDescricacoController(listarDescricacoRepsository);
  return new LogControllerDecorator(listarDescricacoController);
};

// src/main/routes/horarios/listar-descricacao-routes.ts
var route17 = (router) => {
  router.get("/descricacao", adaptRoute(makeDescricacoController()));
};
var listar_descricacao_routes_default = route17;

// src/infra/db/postgresdb/listar-documento/listar-documento.ts
var ListarDocumentoRepsository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async list() {
    return await this.prisma.tipos_documentos.findMany();
  }
};

// src/presentation/controllers/listar-documento/listar-documento-controller.ts
var ListarDocumentoController = class {
  constructor(localidadePostgresRepository) {
    this.localidadePostgresRepository = localidadePostgresRepository;
  }
  async handle() {
    try {
      const lancamentos = await this.localidadePostgresRepository.list();
      return ok({ lancamentos });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/listar-documento.ts
var makeListarDocumentoController = () => {
  const listarDocumentoRepsository = new ListarDocumentoRepsository();
  const listarDocumentoController = new ListarDocumentoController(listarDocumentoRepsository);
  return new LogControllerDecorator(listarDocumentoController);
};

// src/main/routes/horarios/listar-documento-routes.ts
var route18 = (router) => {
  router.get("/listar-documento", adaptRoute(makeListarDocumentoController()));
};
var listar_documento_routes_default = route18;

// src/infra/db/postgresdb/listar-filial-repository/listar-status-lancamento-repository.ts
var ListarFilialRepsository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  // Corrigido para retornar uma lista de filiais
  async listFilial() {
    return await this.prisma.funcionario.findMany({
      distinct: ["filial"],
      select: {
        filial: true
      }
    });
  }
  // Novo método para listar por localidade
  async listByLocalidade(localidade) {
    return await this.prisma.funcionario.findMany({
      where: {
        localidadeId: localidade
      },
      select: {
        id: true,
        identificacao: true,
        nome: true,
        funcao: {
          select: {
            nome: true
          }
        }
      }
    }).then(
      (funcionarios) => funcionarios.map((func) => ({
        id: func.id,
        identificacao: func.identificacao,
        nome: func.nome,
        funcao: func.funcao.nome
      }))
    );
  }
};

// src/presentation/controllers/listar-filial/listar-filial-controller.ts
var ListarStatusController = class {
  constructor(listarFilialRepsository) {
    this.listarFilialRepsository = listarFilialRepsository;
  }
  async handle(httpRequest) {
    try {
      const { localidade } = httpRequest.query;
      if (!localidade) {
        return badRequest(new FuncionarioParamError("Localidade n\xE3o fornecida"));
      }
      const funcionarios = await this.listarFilialRepsository.listByLocalidade(localidade);
      return ok({ funcionarios });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/listar-filial.ts
var makeListarFilialController = () => {
  const listarFilialRepsository = new ListarFilialRepsository();
  const listarStatusController = new ListarStatusController(listarFilialRepsository);
  return new LogControllerDecorator(listarStatusController);
};

// src/main/routes/horarios/listar-filial-routes.ts
var route19 = (router) => {
  router.get("/listar-filial", adaptRoute(makeListarFilialController()));
};
var listar_filial_routes_default = route19;

// src/infra/db/postgresdb/listar-ocorrencias-geral/listar-ocorrencias-repository.ts
var OcorrenciaGeralPostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async findOcorrencia(localidade) {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: {
        localidadeId: localidade,
        cartao: { some: { cartao_dia: { some: { cartao_dia_lancamentos: { some: { validadoPeloOperador: true } } } } } }
      },
      include: {
        cartao: {
          include: {
            cartao_dia: {
              include: {
                eventos: {
                  where: { tipoId: 2, tratado: false }
                }
              },
              orderBy: { id: "asc" }
            }
          },
          orderBy: { id: "asc" }
        }
      },
      orderBy: { id: "asc" }
    });
    if (!funcionarios)
      return { funcionarios: [] };
    return {
      funcionarios: funcionarios.map((funcionario) => {
        const hasValidEvent = funcionario.cartao.some(
          (cartao) => cartao.cartao_dia.some((cartao_dia) => cartao_dia.eventos.length > 0)
        );
        if (hasValidEvent) {
          return {
            identificacao: funcionario.identificacao,
            nome: funcionario.nome
          };
        }
        return null;
      }).filter((funcionario) => funcionario !== null)
    };
  }
};

// src/presentation/controllers/listar-ocorrencia-geral/listar-ocorrencia-geral-controler.ts
var OcorrenciaGeralController = class {
  constructor(ocorrenciaGeralPostgresRepository) {
    this.ocorrenciaGeralPostgresRepository = ocorrenciaGeralPostgresRepository;
  }
  async handle(httRequest) {
    try {
      const { localidade } = httRequest?.query;
      if (!localidade) {
        return badRequest(new Error("Localidade n\xE3o informada"));
      }
      const data = await this.ocorrenciaGeralPostgresRepository.findOcorrencia(localidade);
      if (data.funcionarios.length === 0) {
        return notFoundRequest(new Error("Nenhum funcion\xE1rio encontrado"));
      }
      const output = data.funcionarios.map((funcionario) => ({
        nome: funcionario.nome,
        identificacao: funcionario.identificacao
      }));
      return ok(output);
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/listar-ocorrencia-geral.ts
var makeListarOcorrenciaGeralController = () => {
  const ocorrenciaGeralPostgresRepository = new OcorrenciaGeralPostgresRepository();
  const ocorrenciaGeralController = new OcorrenciaGeralController(ocorrenciaGeralPostgresRepository);
  return new LogControllerDecorator(ocorrenciaGeralController);
};

// src/main/routes/horarios/listar-ocorrencia-geral-routes.ts
var route20 = (router) => {
  router.get("/ocorrencia-geral", adaptRoute(makeListarOcorrenciaGeralController()));
};
var listar_ocorrencia_geral_routes_default = route20;

// src/infra/db/postgresdb/listar-ocorrencias/listar-ocorrencias-repository.ts
var OcorrenciaPostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  calcularResumo(dias) {
    let somaMovimentacao60 = 0;
    let somaMovimentacao100 = 0;
    let somaMovimentacaoNoturna60 = 0;
    let somaMovimentacaoNoturna100 = 0;
    const saldoAnterior = { sessenta: 0, cem: 0 };
    let horasDiurno60 = 0;
    let horasDiurno100 = 0;
    let horasNoturno60 = 0;
    let horasNoturno100 = 0;
    for (const dia of dias) {
      const resumoDia = dia.ResumoDia || {
        movimentacao60: 0,
        movimentacao100: 0,
        movimentacaoNoturna60: 0,
        movimentacaoNoturna100: 0
      };
      if (typeof resumoDia.movimentacao60 === "number" && typeof resumoDia.movimentacao100 === "number" && typeof resumoDia.movimentacaoNoturna60 === "number" && typeof resumoDia.movimentacaoNoturna100 === "number") {
        if (resumoDia.movimentacao60)
          somaMovimentacao60 += resumoDia.movimentacao60;
        if (resumoDia.movimentacao100)
          somaMovimentacao100 += resumoDia.movimentacao100;
        if (resumoDia.movimentacaoNoturna60)
          somaMovimentacaoNoturna60 += resumoDia.movimentacaoNoturna60;
        if (resumoDia.movimentacaoNoturna100)
          somaMovimentacaoNoturna100 += resumoDia.movimentacaoNoturna100;
      }
    }
    horasDiurno60 = arredondarParteDecimalHoras2(somaMovimentacao60 / 60);
    horasDiurno100 = arredondarParteDecimalHoras2(somaMovimentacao100 / 60);
    horasNoturno60 = arredondarParteDecimalHoras2(somaMovimentacaoNoturna60 / 60);
    horasNoturno100 = arredondarParteDecimalHoras2(somaMovimentacaoNoturna100 / 60);
    return {
      movimentacao: {
        sessenta: somaMovimentacao60 + somaMovimentacaoNoturna60,
        cem: somaMovimentacao100 + somaMovimentacaoNoturna100
      },
      soma: {
        sessenta: saldoAnterior.sessenta + somaMovimentacao60 + somaMovimentacaoNoturna60,
        cem: saldoAnterior.cem + somaMovimentacao100 + somaMovimentacaoNoturna100
      },
      horas: {
        diurnas: { sessenta: horasDiurno60, cem: horasDiurno100 },
        noturnas: { sessenta: horasNoturno60, cem: horasNoturno100 }
      },
      saldoAnterior
    };
  }
  async find(identificacao, localidade) {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: {
        identificacao,
        localidadeId: localidade,
        cartao: { some: { cartao_dia: { some: { cartao_dia_lancamentos: { some: { validadoPeloOperador: true } } } } } }
      },
      include: {
        cartao: {
          select: {
            referencia: true,
            cartao_dia: {
              include: {
                eventos: true,
                // Aqui incluímos todos os eventos
                cartao_dia_lancamentos: {
                  select: {
                    periodoId: true,
                    entrada: true,
                    saida: true
                  }
                }
              },
              orderBy: { id: "asc" }
            }
          },
          orderBy: { id: "asc" }
        },
        turno: true,
        localidade: true,
        afastamento: {
          include: { funcionarios_afastados_status: true }
        }
      },
      orderBy: { id: "asc" }
    });
    if (!funcionarios)
      return { funcionarios: [] };
    return {
      funcionarios: funcionarios.map((funcionario) => {
        const diasComEventos = funcionario.cartao.flatMap(
          (cartao) => cartao.cartao_dia.map((cartao_dia) => {
            const eventos = cartao_dia.eventos.filter((evento) => {
              if (evento.tipoId === 2 && !evento.tratado)
                return true;
              if (evento.tipoId === 8 && !evento.tratado) {
                const countTipo8 = cartao_dia.eventos.filter((e) => e.tipoId === 8).length;
                return countTipo8 > 1;
              }
              return false;
            });
            return {
              data: cartao_dia.data,
              eventos,
              lancamentos: cartao_dia.cartao_dia_lancamentos.map((lancamento) => ({
                periodoId: lancamento.periodoId,
                entrada: lancamento.entrada,
                saida: lancamento.saida
              }))
            };
          }).filter((dia) => dia.eventos.length > 0)
          // Filtra dias sem eventos
        );
        const resumo = this.calcularResumo(diasComEventos);
        return {
          identificacao: funcionario.identificacao,
          nome: funcionario.nome,
          turno: funcionario.turno,
          localidade: funcionario.localidade,
          referencia: funcionario.cartao.length > 0 ? funcionario.cartao[0].referencia : null,
          dias: diasComEventos,
          Resumo: resumo
        };
      })
    };
  }
};

// src/presentation/controllers/listar-ocorrencia/listar-ocorrencia-controler.ts
var OcorrenciaController = class {
  constructor(ocorrenciaPostgresRepository, calcularResumoPostgresRepository) {
    this.ocorrenciaPostgresRepository = ocorrenciaPostgresRepository;
    this.calcularResumoPostgresRepository = calcularResumoPostgresRepository;
  }
  async handle(httRequest) {
    try {
      const { identificacao, localidade } = httRequest?.query;
      if (!localidade) {
        return badRequest(new FuncionarioParamError("Localidade n\xE3o fornecida"));
      }
      if (!identificacao) {
        return badRequest(new FuncionarioParamError("Identifica\xE7\xE3o n\xE3o fornecida"));
      }
      const data = await this.ocorrenciaPostgresRepository.find(identificacao, localidade);
      if (data.funcionarios.length === 0) {
        return notFoundRequest(new Error("Nenhum funcion\xE1rio encontrado"));
      }
      const output = [];
      for (const funcionario of data.funcionarios) {
        if (funcionario.dias.length === 0)
          continue;
        output.push({
          identificacao: funcionario.identificacao,
          nome: funcionario.nome,
          nomeTurno: funcionario.turno?.nome ?? "",
          codigoLocalidade: funcionario.localidade?.codigo ?? "",
          referencia: funcionario.referencia,
          dias: funcionario.dias.map((dia) => ({
            data: dia.data,
            eventos: dia.eventos,
            lancamentos: dia.lancamentos
          })),
          resumo: funcionario.Resumo
          // Usando o resumo calculado diretamente
        });
      }
      return ok(output);
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/listar-ocorrencia.ts
var makeListarOcorrenciasController = () => {
  const ocorrenciaPostgresRepository = new OcorrenciaPostgresRepository();
  const calcularResumoPostgresRepository = new CalcularResumoPostgresRepository();
  const ocorrenciaController = new OcorrenciaController(ocorrenciaPostgresRepository, calcularResumoPostgresRepository);
  return new LogControllerDecorator(ocorrenciaController);
};

// src/main/routes/horarios/listar-ocorrencia-routes.ts
var route21 = (router) => {
  router.get("/ocorrencia", adaptRoute(makeListarOcorrenciasController()));
};
var listar_ocorrencia_routes_default = route21;

// src/infra/db/postgresdb/listar-ocupacao/listar-ocupacao.ts
var ListarOcupacaoRepsository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async list() {
    return await this.prisma.tipo_ocupacao.findMany();
  }
};

// src/presentation/controllers/listar-ocupacao/listar-ocupacao-controller.ts
var ListarOcupacaoController = class {
  constructor(localidadePostgresRepository) {
    this.localidadePostgresRepository = localidadePostgresRepository;
  }
  async handle() {
    try {
      const lancamentos = await this.localidadePostgresRepository.list();
      return ok({ lancamentos });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/listar-ocupacao.ts
var makeListarOcupacaoController = () => {
  const listarOcupacaoRepsository = new ListarOcupacaoRepsository();
  const listarOcupacaoController = new ListarOcupacaoController(listarOcupacaoRepsository);
  return new LogControllerDecorator(listarOcupacaoController);
};

// src/main/routes/horarios/listar-ocupacao-routes.ts
var route22 = (router) => {
  router.get("/listar-ocupacao", adaptRoute(makeListarOcupacaoController()));
};
var listar_ocupacao_routes_default = route22;

// src/infra/db/postgresdb/listar-solucoes-eventos/listar-solucoes-eventos.ts
var SolucoesEventosPostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async list() {
    return await this.prisma.tipo_eventos.findMany({
      where: {
        id: {
          in: [3, 5, 7]
        }
      }
    });
  }
};

// src/presentation/controllers/listar-solucoes-eventos/listar-solucoes-eventos-controller.ts
var ListarSolucoesEventosController = class {
  constructor(solucoesEventosPostgresRepository) {
    this.solucoesEventosPostgresRepository = solucoesEventosPostgresRepository;
  }
  async handle() {
    try {
      return ok(await this.solucoesEventosPostgresRepository.list());
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/listar-solucoes-eventos.ts
var makeTiposSolucoesController = () => {
  const solucoesEventosPostgresRepository = new SolucoesEventosPostgresRepository();
  const listarSolucoesEventosController = new ListarSolucoesEventosController(solucoesEventosPostgresRepository);
  return new LogControllerDecorator(listarSolucoesEventosController);
};

// src/main/routes/horarios/listar-solucoes-eventos-routes.ts
var route23 = (router) => {
  router.get("/tipo-evento", adaptRoute(makeTiposSolucoesController()));
};
var listar_solucoes_eventos_routes_default = route23;

// src/infra/db/postgresdb/listar-status-documento/listar-status-documento.ts
var ListarStatusDocumentoRepsository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async list() {
    return await this.prisma.tipo_status.findMany({
      where: {
        id: {
          in: [2, 3]
        }
      }
    });
  }
};

// src/presentation/controllers/listar-status-documento/listar-status-documento-controller.ts
var ListarStatusDocumentoController = class {
  constructor(localidadePostgresRepository) {
    this.localidadePostgresRepository = localidadePostgresRepository;
  }
  async handle() {
    try {
      const lancamentos = await this.localidadePostgresRepository.list();
      return ok({ lancamentos });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/listar-tipos-status-documento.ts
var makeListarStatusDocumentoController = () => {
  const listarStatusDocumentoRepsository = new ListarStatusDocumentoRepsository();
  const listarStatusDocumentoController = new ListarStatusDocumentoController(listarStatusDocumentoRepsository);
  return new LogControllerDecorator(listarStatusDocumentoController);
};

// src/main/routes/horarios/listar-status-documento-routes.ts
var route24 = (router) => {
  router.get("/listar-status-documento", adaptRoute(makeListarStatusDocumentoController()));
};
var listar_status_documento_routes_default = route24;

// src/infra/db/postgresdb/listar-solucoes-atestado/listar-solucoes-atestado.ts
var SolucoesAtestadoPostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async list() {
    return await this.prisma.tipo_eventos.findMany({
      where: {
        id: {
          in: [3, 5]
        }
      }
    });
  }
};

// src/presentation/controllers/listar-solucoes-atestado/listar-solucoes-atestado-controller.ts
var ListarSolucoesAtestadoController = class {
  constructor(solucoesEventosPostgresRepository) {
    this.solucoesEventosPostgresRepository = solucoesEventosPostgresRepository;
  }
  async handle() {
    try {
      return ok(await this.solucoesEventosPostgresRepository.list());
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/solucao-eventos-atestado.ts
var makeSolucaoEventosAtestadoController = () => {
  const solucoesAtestadoPostgresRepository = new SolucoesAtestadoPostgresRepository();
  const listarSolucoesAtestadoController = new ListarSolucoesAtestadoController(solucoesAtestadoPostgresRepository);
  return new LogControllerDecorator(listarSolucoesAtestadoController);
};

// src/main/routes/horarios/listar-status-solucao-atestado.ts
var route25 = (router) => {
  router.get("/listar-solucao-atestado", adaptRoute(makeSolucaoEventosAtestadoController()));
};
var listar_status_solucao_atestado_default = route25;

// src/infra/db/postgresdb/listar-todos-atestados/listar-todos-atestados.ts
var ListarTodosAtestadoRepsository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async listarTodos(funcionarioId) {
    const atestados = await this.prisma.atestado_funcionario.findMany({
      where: {
        funcionarioId
      },
      include: {
        funcionario: true,
        tipo_acompanhante: true,
        tipo_ocupacao: true,
        tipo_status: true,
        tipos_documentos: true,
        tipo_eventos: true
      },
      orderBy: {
        data: "desc"
      }
    });
    return atestados.map((atestado) => ({
      data: atestado.data,
      id: atestado.id,
      inicio: atestado.inicio,
      fim: atestado.fim,
      grupo_cid: atestado.grupo_cid,
      acidente_trabalho: atestado.acidente_trabalho,
      descricao: atestado.descricao,
      userName: atestado.userName,
      funcionarioId: atestado.funcionarioId,
      idade_paciente: atestado.idade_paciente,
      nome: atestado.funcionario?.nome,
      identificacao: atestado.funcionario?.identificacao,
      nomeAcao: atestado.tipo_eventos?.nome,
      nomeAcompanhante: atestado.tipo_acompanhante?.nome,
      nomeOcupacao: atestado.tipo_ocupacao?.nome,
      nomeStatus: atestado.tipo_status?.nome,
      nomeDocumento: atestado.tipos_documentos?.nome
    }));
  }
};

// src/presentation/controllers/listar-todos-atestados/listar-todos-atestados-controler.ts
var ListarTodosAtestadoController = class {
  constructor(atestadoPostgresRepository) {
    this.atestadoPostgresRepository = atestadoPostgresRepository;
  }
  async handle(httpRequest) {
    try {
      const { funcionarioId } = httpRequest.query;
      if (!funcionarioId)
        return badRequest(new FuncionarioParamError("Falta a identifica\xE7\xE3o do funcion\xE1rio!"));
      const atestados = await this.atestadoPostgresRepository.listarTodos(funcionarioId);
      if (!atestados || atestados.length === 0) {
        return ok({ message: "Nenhum atestado encontrado para esta identifica\xE7\xE3o." });
      }
      return ok({ atestados });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/listar-todos-atestados.ts
var makeListarTodosAtestadosController = () => {
  const listarTodosAtestadoRepsository = new ListarTodosAtestadoRepsository();
  const listarTodosAtestadoController = new ListarTodosAtestadoController(listarTodosAtestadoRepsository);
  return new LogControllerDecorator(listarTodosAtestadoController);
};

// src/main/routes/horarios/listar-todos-atestados-routes.ts
var route26 = (router) => {
  router.get("/listar-todosatestado", adaptRoute(makeListarTodosAtestadosController()));
};
var listar_todos_atestados_routes_default = route26;

// src/infra/db/postgresdb/procurar-localidades/procurar-localidades.ts
var LocalidadePostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async findMany() {
    return await this.prisma.localidade.findMany();
  }
};

// src/presentation/controllers/procurar-localidades/procurar-localidades.ts
var ProcurarLocalidadeController = class {
  constructor(localidadePostgresRepository) {
    this.localidadePostgresRepository = localidadePostgresRepository;
  }
  async handle() {
    try {
      return ok(await this.localidadePostgresRepository.findMany());
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/procurar-localidade.ts
var makeProcurarLocalidadeController = () => {
  const localidadePostgresRepository = new LocalidadePostgresRepository();
  const getFuncionarioController = new ProcurarLocalidadeController(localidadePostgresRepository);
  return new LogControllerDecorator(getFuncionarioController);
};

// src/main/routes/horarios/procurar-localidade-routes.ts
var route27 = (router) => {
  router.get("/localidades", adaptRoute(makeProcurarLocalidadeController()));
};
var procurar_localidade_routes_default = route27;

// src/presentation/controllers/respaldar-atestado/respaldar-atestado.ts
var import_moment6 = __toESM(require("moment"), 1);
var RespaldarController = class {
  constructor(respaldarAtestadoPostgresRepository) {
    this.respaldarAtestadoPostgresRepository = respaldarAtestadoPostgresRepository;
  }
  async handle(httpRequest) {
    try {
      const {
        id,
        statusId,
        userName,
        inicio,
        fim,
        observacao
      } = httpRequest?.body;
      if (!id)
        return badRequest(new FuncionarioParamError("Falta id do periodo!"));
      if (!statusId)
        return badRequest(new FuncionarioParamError("Falta status!"));
      if (!userName)
        return badRequest(new FuncionarioParamError("Falta usu\xE1rio para lan\xE7ar cart\xE3o"));
      if (!inicio)
        return badRequest(new FuncionarioParamError("Falta inicio!"));
      if (!fim)
        return badRequest(new FuncionarioParamError("Falta fim!"));
      if (!new Date(inicio).getTime())
        return badRequest(new FuncionarioParamError("Data de in\xEDcio inv\xE1lida!"));
      if (!new Date(fim).getTime())
        return badRequest(new FuncionarioParamError("Data de fim inv\xE1lida!"));
      if ((0, import_moment6.default)(inicio).isAfter(fim))
        return badRequest(new FuncionarioParamError("Data inicial n\xE3o pode ser ap\xF3s o fim!"));
      const atestado = await this.respaldarAtestadoPostgresRepository.findfirst({ id });
      if (!atestado)
        return notFoundRequest(new FuncionarioParamError("Atestado n\xE3o encontrado!"));
      switch (statusId) {
        case 1:
          return badRequest(new FuncionarioParamError(`N\xE3o \xE9 poss\xEDvel resolver com status 1`));
        case 2:
          break;
        case 3:
          break;
        default:
          return badRequest(new FuncionarioParamError(`Status ${statusId} n\xE3o tratado!`));
      }
      switch (atestado.documentoId) {
        case 1:
          break;
        case 2:
          return badRequest(new FuncionarioParamError(`OUTROS COMPROVANTES n\xE3o tratado!`));
        case 3:
          return badRequest(new FuncionarioParamError(`ATESTADO OCUPACIONAL n\xE3o tratado`));
        default:
          return badRequest(new FuncionarioParamError(`Documento ${statusId} n\xE3o tratado!`));
      }
      if (atestado.statusId !== 1)
        return badRequest(new FuncionarioParamError("Atestado j\xE1 tratado!"));
      const dataInicio = import_moment6.default.utc(inicio).set({ h: 0, minute: 0, second: 0, millisecond: 0 }).toDate();
      const dias = await this.respaldarAtestadoPostgresRepository.findManyCartaoDia({
        inicio: dataInicio,
        fim,
        funcionarioId: atestado.funcionarioId
      });
      let message = "";
      switch (statusId) {
        case 2:
          {
            let abonos = [];
            abonos = this.gerarAbono(dias, { inicio, fim });
            const atualizado = await this.respaldarAtestadoPostgresRepository.updateAtestado({
              id: atestado.id,
              statusId,
              userName,
              abonos,
              observacao,
              fim,
              inicio
            });
            if (!atualizado)
              return serverError();
            message = "Abono aprovado com sucesso!";
          }
          break;
        case 3:
          {
            const atualizado = await this.respaldarAtestadoPostgresRepository.updateAtestado({
              id: atestado.id,
              statusId,
              userName,
              abonos: [],
              observacao,
              fim,
              inicio
            });
            if (!atualizado)
              return serverError();
            message = "Abono recusado com sucesso!";
          }
          break;
        default:
          return badRequest(new FuncionarioParamError(`Status ${atestado.statusId} n\xE3o tratado`));
      }
      return ok({ message });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
  transformarCargaHoraria(input) {
    const datas = [];
    const [entradaManha, saidaManha, entradaTarde, saidaTarde] = input.cargaHorariaCompleta.split(";");
    if (input.cargaHorariaPrimeiroPeriodo) {
      {
        const [hora, minuto] = entradaManha.split(".");
        datas.push(
          import_moment6.default.utc(input.data).set({ hour: Number(hora), minute: Number(minuto) }).toDate()
        );
      }
      {
        const [hora, minuto] = saidaManha.split(".");
        datas.push(
          import_moment6.default.utc(input.data).set({ hour: Number(hora), minute: Number(minuto) }).toDate()
        );
      }
    }
    if (input.cargaHorariaSegundoPeriodo) {
      {
        const [hora, minuto] = entradaTarde.split(".");
        datas.push(
          import_moment6.default.utc(input.data).set({ hour: Number(hora), minute: Number(minuto) }).toDate()
        );
      }
      {
        const [hora, minuto] = saidaTarde.split(".");
        datas.push(
          import_moment6.default.utc(input.data).set({ hour: Number(hora), minute: Number(minuto) }).toDate()
        );
      }
    }
    return datas;
  }
  gerarAbono(dias, itervalo) {
    const atestadoDia = [];
    dias.map((dia) => {
      if (dia.cargaHoraria === 0)
        return;
      const horariosTrabalho = this.transformarCargaHoraria({
        data: dia.data,
        cargaHorariaCompleta: dia.cargaHorariaCompleta,
        cargaHorariaPrimeiroPeriodo: dia.cargaHorariaPrimeiroPeriodo,
        cargaHorariaSegundoPeriodo: dia.cargaHorariaSegundoPeriodo
      });
      const eAntes = horariosTrabalho.findIndex((horarioTrabalho) => (0, import_moment6.default)(itervalo.inicio).isAfter(horarioTrabalho));
      const eDepois = horariosTrabalho.findIndex((horarioTrabalho) => (0, import_moment6.default)(itervalo.fim).isBefore(horarioTrabalho));
      if (eAntes === -1 && eDepois === -1) {
        atestadoDia.push({ data: dia.data, minutos: dia.cargaHoraria, cartaoDiaId: dia.id });
      } else {
        let minutos = 0;
        if (dia.cargaHorariaPrimeiroPeriodo && (0, import_moment6.default)(itervalo.inicio).isSameOrAfter(horariosTrabalho[0]) && (0, import_moment6.default)(itervalo.fim).isSameOrBefore(horariosTrabalho[1]) || dia.cargaHorariaSegundoPeriodo && (0, import_moment6.default)(itervalo.inicio).isSameOrAfter(horariosTrabalho[2]) && (0, import_moment6.default)(itervalo.fim).isSameOrBefore(horariosTrabalho[3])) {
          minutos = (0, import_moment6.default)(itervalo.fim).diff(itervalo.inicio, "minutes");
        } else if (dia.cargaHorariaPrimeiroPeriodo && dia.cargaHorariaSegundoPeriodo && (0, import_moment6.default)(itervalo.inicio).isSameOrAfter(horariosTrabalho[0]) && (0, import_moment6.default)(itervalo.fim).isSameOrBefore(horariosTrabalho[3])) {
          minutos = (0, import_moment6.default)(itervalo.fim).diff(itervalo.inicio, "minutes") - dia.descanso;
        } else if (dia.cargaHorariaSegundoPeriodo && (0, import_moment6.default)(itervalo.inicio).isAfter(horariosTrabalho[2]) && (0, import_moment6.default)(itervalo.fim).isAfter(horariosTrabalho[3])) {
          minutos = (0, import_moment6.default)(horariosTrabalho[3]).diff(itervalo.inicio, "minutes");
        } else if (dia.cargaHorariaPrimeiroPeriodo && (0, import_moment6.default)(itervalo.inicio).isAfter(horariosTrabalho[0]) && (0, import_moment6.default)(itervalo.fim).isAfter(horariosTrabalho[1])) {
          minutos = (0, import_moment6.default)(dia.cargaHorariaSegundoPeriodo ? horariosTrabalho[3] : horariosTrabalho[1]).diff(itervalo.inicio, "minutes") - (dia.cargaHorariaSegundoPeriodo ? dia.descanso : 0);
        }
        atestadoDia.push({
          data: dia.data,
          minutos,
          cartaoDiaId: dia.id
        });
      }
    });
    return atestadoDia;
  }
};

// src/infra/db/postgresdb/respaldar-atestado/respaldar-atestado.ts
var RespaldarAtestadoPostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async findfirst(input) {
    const result = await this.prisma.atestado_funcionario.findFirst({
      where: { id: input.id }
    });
    if (!result)
      return;
    return {
      id: result.id,
      documentoId: result.tipoId,
      statusId: result.statusId,
      funcionarioId: result.funcionarioId
    };
  }
  async findManyCartaoDia(input) {
    const result = await this.prisma.cartao_dia.findMany({
      where: { data: { lte: input.fim, gte: input.inicio }, cartao: { funcionarioId: input.funcionarioId } }
    });
    return result.map((dia) => ({
      id: dia.id,
      cargaHoraria: dia.cargaHor,
      cargaHorariaPrimeiroPeriodo: dia.cargaHorPrimeiroPeriodo,
      cargaHorariaSegundoPeriodo: dia.cargaHorSegundoPeriodo,
      data: dia.data,
      cargaHorariaCompleta: dia.cargaHorariaCompleta,
      descanso: dia.periodoDescanso
    }));
  }
  async updateAtestado(input) {
    return Boolean(
      await this.prisma.atestado_funcionario.update({
        where: { id: input.id },
        data: {
          statusId: input.statusId,
          userName: input.userName,
          inicio: input.inicio,
          fim: input.fim,
          observacao: input.observacao,
          atestado_abonos: {
            upsert: input.abonos.map((abono) => ({
              where: { cartaoDiaId_atestadoId: { atestadoId: input.id, cartaoDiaId: abono.cartaoDiaId } },
              create: { cartaoDiaId: abono.cartaoDiaId, minutos: abono.minutos, userName: input.userName },
              update: { cartaoDiaId: abono.cartaoDiaId, minutos: abono.minutos, userName: input.userName }
            }))
          }
        }
      })
    );
  }
};

// src/main/factories/respaldar-atestado.ts
var makeRespaldarAtestadoController = () => {
  const respaldarAtestadoPostgresRepository = new RespaldarAtestadoPostgresRepository();
  const respaldarController = new RespaldarController(respaldarAtestadoPostgresRepository);
  return new LogControllerDecorator(respaldarController);
};

// src/main/routes/horarios/respaldar-atestado-routes.ts
var route28 = (router) => {
  router.put("/atestado/respaldar", adaptRoute(makeRespaldarAtestadoController()));
};
var respaldar_atestado_routes_default = route28;

// src/infra/db/postgresdb/retorno-solucao/retorno-solucao-repository.ts
var RetornoSolucaoRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async resetTratado(input) {
    const { cartaoDiaId } = input;
    const eventosAtualizados = await this.prisma.eventos.updateMany({
      where: { cartaoDiaId },
      data: { tratado: false }
    });
    return eventosAtualizados.count > 0;
  }
};

// src/presentation/controllers/retornar-solucao/retornar-solucao-controller.ts
var RetornarSolucaoController = class {
  constructor(retornoSolucaoRepository) {
    this.retornoSolucaoRepository = retornoSolucaoRepository;
  }
  async handle(httpRequest) {
    const { cartaoDiaId } = httpRequest?.body;
    try {
      if (!cartaoDiaId)
        return badRequest(new FuncionarioParamError("Falta irformar o dia!"));
      const eventosResetados = await this.retornoSolucaoRepository.resetTratado({ cartaoDiaId });
      if (!eventosResetados)
        throw "Erro ao resetar eventos!";
      return ok({ message: "Eventos resetados com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/retornar-solucao.ts
var makeRetornarSolucaoController = () => {
  const retornoSolucaoRepository = new RetornoSolucaoRepository();
  const retornarSolucaoController = new RetornarSolucaoController(retornoSolucaoRepository);
  return new LogControllerDecorator(retornarSolucaoController);
};

// src/main/routes/horarios/retornar-solucao-routes.ts
var route29 = (router) => {
  router.post("/retornar-solucao", adaptRoute(makeRetornarSolucaoController()));
};
var retornar_solucao_routes_default = route29;

// src/infra/db/postgresdb/solucao-eventos-repository/solucao-eventos-repository.ts
var SolucaoEventoRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async add(input) {
    const { id, tipoId } = input;
    const eventoOriginal = await this.prisma.eventos.findUnique({
      where: { id }
    });
    if (!eventoOriginal) {
      throw new Error("Evento original n\xE3o encontrado");
    }
    let minutos;
    if (tipoId === 3 || tipoId === 7) {
      minutos = 0;
    } else if (tipoId === 5 || tipoId === 6) {
      minutos = Math.abs(eventoOriginal.minutos);
    } else {
      minutos = eventoOriginal.minutos;
    }
    await this.prisma.eventos.update({
      where: { id },
      data: { tratado: true }
    });
    const novoEvento = await this.prisma.eventos.create({
      data: {
        cartaoDiaId: eventoOriginal.cartaoDiaId,
        hora: eventoOriginal.hora,
        tipoId,
        funcionarioId: eventoOriginal.funcionarioId,
        minutos,
        tratado: true
        // Define tratado como true no novo evento
      }
    });
    if (tipoId === 3 || tipoId === 6 || tipoId === 5) {
      const eventosEntreMenos1EMenos5 = await this.prisma.eventos.findMany({
        where: {
          cartaoDiaId: eventoOriginal.cartaoDiaId,
          minutos: { gte: -5, lte: -1 },
          tratado: false
        }
      });
      for (const evento of eventosEntreMenos1EMenos5) {
        await this.prisma.eventos.update({
          where: { id: evento.id },
          data: { tratado: true }
        });
        console.log(`Hora do evento com minutos entre -1 e -5: ${evento.hora}`);
        await this.prisma.eventos.create({
          data: {
            cartaoDiaId: evento.cartaoDiaId,
            hora: evento.hora,
            tipoId,
            funcionarioId: evento.funcionarioId,
            minutos: tipoId === 3 ? 0 : Math.abs(evento.minutos),
            // Define minutos como 0 para tipoId 3 e positivo para tipoId 6 ou 5
            tratado: true
          }
        });
      }
    }
    return !!novoEvento;
  }
};

// src/presentation/controllers/solucao-eventos/solucao-eventos-controller.ts
var CriarEventoController = class {
  constructor(solucaoEventoRepository) {
    this.solucaoEventoRepository = solucaoEventoRepository;
  }
  async handle(httpRequest) {
    const { id, tipoId } = httpRequest?.body;
    try {
      if (!id)
        return badRequest(new FuncionarioParamError("Falta id do evento!"));
      if (!tipoId)
        return badRequest(new FuncionarioParamError("Falta o tipo de solu\xE7\xE3o!"));
      const eventoCriado = await this.solucaoEventoRepository.add({ id, tipoId });
      if (!eventoCriado)
        throw "Erro ao criar evento!";
      return ok({ message: "Evento criado com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
};

// src/main/factories/solucao-eventos.ts
var makeSolucaoEventosController = () => {
  const solucaoEventoRepository = new SolucaoEventoRepository();
  const criarEventoController = new CriarEventoController(solucaoEventoRepository);
  return new LogControllerDecorator(criarEventoController);
};

// src/main/routes/horarios/solucao-eventos-routes.ts
var route30 = (router) => {
  router.post("/solucao-eventos", adaptRoute(makeSolucaoEventosController()));
};
var solucao_eventos_routes_default = route30;

// src/main/routes/horarios/upload-routes-routes.ts
var import_multer = __toESM(require("multer"), 1);

// src/main/adapters/protheus-route-adapter.ts
var import_moment8 = __toESM(require("moment"), 1);

// src/infra/db/postgresdb/afastamento/afastamento -repository.ts
var AfastamentoRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async add(input) {
    try {
      const savedAfastamento = await this.prisma.funcionarios_afastados.upsert({
        where: {
          inicio_funcionarioId_statusId: {
            funcionarioId: input.funcionarioId,
            inicio: input.inicio,
            statusId: input.status.id
          }
        },
        create: {
          inicio: input.inicio,
          total: input.total,
          fim: input.fim,
          userName: input.userName,
          funcionarios_afastados_status: {
            connectOrCreate: {
              where: { id: input.status.id },
              create: { id: input.status.id, nome: input.status.nome }
            }
          },
          funcionario: { connect: { id: input.funcionarioId } }
        },
        update: {
          inicio: input.inicio,
          fim: input.fim,
          total: input.total,
          funcionario: { connect: { id: input.funcionarioId } },
          userName: input.userName,
          funcionarios_afastados_status: {
            connectOrCreate: {
              where: { nome: input.status.nome },
              create: { id: input.status.id, nome: input.status.nome }
            }
          }
        }
      });
      return !!savedAfastamento;
    } catch (error) {
      console.error("Erro ao criar afastamento:", error);
      return false;
    }
  }
};

// src/infra/db/postgresdb/funcionario/cartao-repository.ts
var CartaoPostgresRepository = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async upsert(input) {
    const saved = await this.prisma.cartao.upsert({
      create: {
        referencia: input.referencia,
        saldoAnterior100: input.saldoAnterior100,
        saldoAnterior60: input.saldoAnterior60,
        funcionarioId: input.funcionarioId,
        statusId: input.status.id,
        userName: input.userName
      },
      update: {
        referencia: input.referencia,
        saldoAnterior100: input.saldoAnterior100,
        saldoAnterior60: input.saldoAnterior60,
        funcionarioId: input.funcionarioId,
        statusId: input.status.id,
        userName: input.userName
      },
      where: { funcionarioId_referencia: { referencia: input.referencia, funcionarioId: input.funcionarioId } }
    });
    for (const dia of input.dias) {
      await this.prisma.cartao_dia.upsert({
        where: { cartaoId_data: { cartaoId: saved.id, data: dia.data } },
        create: {
          cargaHor: dia.cargaHor,
          cargaHorariaCompleta: dia.cargaHorariaCompleta,
          cargaHorPrimeiroPeriodo: dia.cargaHorPrimeiroPeriodo,
          cargaHorSegundoPeriodo: dia.cargaHorSegundoPeriodo,
          data: dia.data,
          periodoDescanso: dia.periodoDescanso,
          cargaHorariaNoturna: dia.cargaHorNoturna,
          cartao_dia_status: {
            connectOrCreate: {
              create: { id: dia.status.id, nome: dia.status.descricao },
              where: { id: dia.status.id }
            }
          },
          cartao: { connect: { id: saved.id } }
        },
        update: {
          cargaHor: dia.cargaHor,
          cargaHorariaCompleta: dia.cargaHorariaCompleta,
          cargaHorPrimeiroPeriodo: dia.cargaHorPrimeiroPeriodo,
          cargaHorSegundoPeriodo: dia.cargaHorSegundoPeriodo,
          data: dia.data,
          periodoDescanso: dia.periodoDescanso,
          cargaHorariaNoturna: dia.cargaHorNoturna,
          cartao_dia_status: {
            connectOrCreate: {
              create: { id: dia.status.id, nome: dia.status.descricao },
              where: { id: dia.status.id }
            }
          },
          cartao: { connect: { id: saved.id } }
        }
      });
    }
    return Boolean(saved);
  }
};

// src/infra/db/postgresdb/funcionario/funcionario-repository.ts
var FuncionarioPostgresRepository2 = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async upsert(funcionario) {
    const saveFuncionario = await this.prisma.funcionario.upsert({
      where: {
        identificacao: funcionario.identificacao
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
            where: { nome: funcionario.centroCusto.nome }
          }
        },
        funcao: {
          connectOrCreate: {
            create: { nome: funcionario.funcao.nome },
            where: { nome: funcionario.funcao.nome }
          }
        },
        turno: {
          connectOrCreate: {
            create: { nome: funcionario.turno.nome, cod_turno: funcionario.turno.cod_turno },
            where: { id: funcionario.turno.id, cod_turno: funcionario.turno.cod_turno }
          }
        },
        contatos: funcionario.contato ? {
          connectOrCreate: {
            where: { numero: funcionario.contato.numero },
            create: { numero: funcionario.contato.numero }
          }
        } : void 0,
        emails: funcionario.email ? {
          connectOrCreate: {
            create: { nome: funcionario.email.nome },
            where: { nome: funcionario.email.nome }
          }
        } : void 0,
        localidade: {
          connectOrCreate: {
            where: { codigo: funcionario.localidade.codigo },
            create: { codigo: funcionario.localidade.codigo, nome: funcionario.localidade.nome }
          }
        },
        userName: funcionario.userName
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
            where: { nome: funcionario.centroCusto.nome }
          }
        },
        funcao: {
          connectOrCreate: {
            create: { nome: funcionario.funcao.nome },
            where: { nome: funcionario.funcao.nome }
          }
        },
        turno: {
          connectOrCreate: {
            create: { nome: funcionario.turno.nome, cod_turno: funcionario.turno.cod_turno },
            where: { id: funcionario.turno.id, cod_turno: funcionario.turno.cod_turno }
          }
        },
        contatos: funcionario.contato ? {
          connectOrCreate: {
            where: { numero: funcionario.contato.numero },
            create: { numero: funcionario.contato.numero }
          }
        } : void 0,
        emails: funcionario.email ? {
          connectOrCreate: {
            create: { nome: funcionario.email.nome },
            where: { nome: funcionario.email.nome }
          }
        } : void 0,
        userName: funcionario.userName
      }
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
        funcionarioId: saveFuncionario.id
      },
      update: {
        bairro: funcionario.endereco.bairro,
        cep: funcionario.endereco.cep,
        cidade: funcionario.endereco.cidade,
        complemento: funcionario.endereco.complemento,
        estado: funcionario.endereco.estado,
        numero: funcionario.endereco.numero,
        rua: funcionario.endereco.rua
      }
    });
    return Boolean(saveFuncionario);
  }
  async findFisrt(input) {
    const result = await this.prisma.funcionario.findFirst({ where: { identificacao: input.identificacao } });
    if (!result)
      return void 0;
    return {
      id: result.id
    };
  }
};

// src/infra/db/postgresdb/grupo-trabalho/grupo-trabalho-repository.ts
var GrupoDeTrabalhoRepositoryPrisma = class {
  prisma;
  constructor() {
    this.prisma = prisma;
  }
  async upsert(grupo) {
    const saveGrupo = await this.prisma.grupo_trabalho.upsert({
      where: {
        id: grupo.id = 0
      },
      create: {
        cod_turno: grupo.cod_turno,
        descri_turno: grupo.descri_turno,
        dia_semana: grupo.dia_semana,
        hora_1_entrada: grupo.hora_1_entrada,
        hora_1_saida: grupo.hora_1_saida,
        hora_2_entrada: grupo.hora_2_entrada,
        hora_2_saida: grupo.hora_2_saida,
        hora_3_entrada: grupo.hora_3_entrada,
        hora_3_saida: grupo.hora_3_saida,
        hora_4_entrada: grupo.hora_4_entrada,
        hora_4_saida: grupo.hora_4_saida,
        status_turno: grupo.status_turno,
        tipo_dia: grupo.tipo_dia,
        total_horas_1_periodo: grupo.total_horas_1_periodo,
        total_horas_2_periodo: grupo.total_horas_2_periodo,
        total_horas_3_periodo: grupo.total_horas_3_periodo,
        total_horas_4_periodo: grupo.total_horas_4_periodo,
        total_horas_1_intervalo: grupo.total_horas_1_intervalo,
        total_horas_2_intervalo: grupo.total_horas_2_intervalo,
        total_horas_3_intervalo: grupo.total_horas_3_intervalo,
        total_horas_dia: grupo.total_horas_dia,
        total_horas_intervalo: grupo.total_horas_intervalo,
        total_horas_trabalhadas: grupo.total_horas_trabalhadas,
        userName: grupo.userName
      },
      update: {
        cod_turno: grupo.cod_turno,
        descri_turno: grupo.descri_turno,
        dia_semana: grupo.dia_semana,
        hora_1_entrada: grupo.hora_1_entrada,
        hora_1_saida: grupo.hora_1_saida,
        hora_2_entrada: grupo.hora_2_entrada,
        hora_2_saida: grupo.hora_2_saida,
        hora_3_entrada: grupo.hora_3_entrada,
        hora_3_saida: grupo.hora_3_saida,
        hora_4_entrada: grupo.hora_4_entrada,
        hora_4_saida: grupo.hora_4_saida,
        status_turno: grupo.status_turno,
        tipo_dia: grupo.tipo_dia,
        total_horas_1_periodo: grupo.total_horas_1_periodo,
        total_horas_2_periodo: grupo.total_horas_2_periodo,
        total_horas_3_periodo: grupo.total_horas_3_periodo,
        total_horas_4_periodo: grupo.total_horas_4_periodo,
        total_horas_1_intervalo: grupo.total_horas_1_intervalo,
        total_horas_2_intervalo: grupo.total_horas_2_intervalo,
        total_horas_3_intervalo: grupo.total_horas_3_intervalo,
        total_horas_dia: grupo.total_horas_dia,
        total_horas_intervalo: grupo.total_horas_intervalo,
        total_horas_trabalhadas: grupo.total_horas_trabalhadas,
        userName: grupo.userName
      }
    });
    return Boolean(saveGrupo);
  }
};

// src/presentation/controllers/procurar-funcionário/utils.ts
var import_moment7 = __toESM(require("moment"), 1);
var BuscarHorarioNortunoEmMinutos = (data, inicial, final) => {
  let difMinNotuno = 0;
  const inicioAdicional = (0, import_moment7.default)(data).utc(false).minutes(0).seconds(0).hour(22);
  const finalAdicional = (0, import_moment7.default)(data).utc(false).minutes(0).seconds(0).add(1, "d").hour(5);
  if (inicial.isBetween(inicioAdicional, finalAdicional)) {
    if (inicial.isAfter(inicioAdicional)) {
      if (final.isBefore(finalAdicional)) {
        difMinNotuno = final.diff(inicial, "minutes");
      }
    }
  }
  if (final.isBetween(inicioAdicional, finalAdicional) && inicial?.isBefore(inicioAdicional)) {
    difMinNotuno = final.diff(inicioAdicional, "minutes");
  }
  if (inicial.isBetween(inicioAdicional, finalAdicional) && final?.isAfter(finalAdicional)) {
    difMinNotuno = finalAdicional.diff(inicial, "minutes");
  }
  if (inicioAdicional.isBetween(inicial, final) && finalAdicional.isBetween(inicial, final) && inicial.isBefore(inicioAdicional) && final.isAfter(finalAdicional)) {
    difMinNotuno = finalAdicional.diff(inicioAdicional, "minutes");
  }
  if (inicial.isSame(inicioAdicional)) {
    if (final.isBefore(finalAdicional)) {
      difMinNotuno = final.diff(inicial, "minutes");
    } else {
      difMinNotuno = finalAdicional.diff(inicial, "minutes");
    }
  }
  if (final.isSame(finalAdicional)) {
    if (inicial.isBefore(inicioAdicional)) {
      difMinNotuno = final.diff(inicioAdicional, "minutes");
    } else {
      difMinNotuno = final.diff(inicial, "minutes");
    }
  }
  return difMinNotuno;
};

// src/main/adapters/protheus-route-adapter.ts
async function importarArquivoGrupoTrabalho(req, res) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).send({ error: "Falta arquivo" });
    }
    if (!req?.body?.userName)
      return res.status(400).send({ error: "Falta usu\xE1rio" });
    const arquivo = Buffer.from(req.file.buffer).toString("utf-8");
    const grupos = arquivo.split("\n");
    const grupoDeTrabalhoRepositoryPrisma = new GrupoDeTrabalhoRepositoryPrisma();
    for (const grupo of grupos) {
      const [
        ,
        ,
        codigoTurno,
        descricaoTurno,
        statusTurno,
        ,
        diaSemana,
        tipoDia,
        HoraPrimeiraEntrada,
        HoraPrimeirasaida,
        HoraSegundaEntrada,
        HoraSegundaSaida,
        HoraTerceiraEntrada,
        HoraTerceiraSaida,
        HoraQuartaEntrada,
        HoraQuartaSaida,
        TotalHorasPrimeiroPeriodo,
        TotalHorasSegundoPeriodo,
        TotalHorasTerceiroPeriodo,
        TotalHorasQuartoPeriodo,
        TotalHorasPrimeiroIntervalo,
        TotalHorasSegundoIntervalo,
        TotalHorasTerceiroIntervalo,
        TotalHorasTrabalhadas,
        TotalHorasIntervalo,
        TotalHorasDia
      ] = grupo.split(";");
      if (!codigoTurno)
        continue;
      const saved = await grupoDeTrabalhoRepositoryPrisma.upsert({
        cod_turno: codigoTurno,
        descri_turno: descricaoTurno,
        status_turno: statusTurno,
        dia_semana: diaSemana,
        tipo_dia: tipoDia,
        hora_1_entrada: HoraPrimeiraEntrada,
        hora_1_saida: HoraPrimeirasaida,
        hora_2_entrada: HoraSegundaEntrada,
        hora_2_saida: HoraSegundaSaida,
        hora_3_entrada: HoraTerceiraEntrada,
        hora_3_saida: HoraTerceiraSaida,
        hora_4_entrada: HoraQuartaEntrada,
        hora_4_saida: HoraQuartaSaida,
        total_horas_1_periodo: TotalHorasPrimeiroPeriodo,
        total_horas_2_periodo: TotalHorasSegundoPeriodo,
        total_horas_3_periodo: TotalHorasTerceiroPeriodo,
        total_horas_4_periodo: TotalHorasQuartoPeriodo,
        total_horas_1_intervalo: TotalHorasPrimeiroIntervalo,
        total_horas_2_intervalo: TotalHorasSegundoIntervalo,
        total_horas_3_intervalo: TotalHorasTerceiroIntervalo,
        total_horas_trabalhadas: TotalHorasTrabalhadas,
        total_horas_intervalo: TotalHorasIntervalo,
        total_horas_dia: TotalHorasDia,
        userName: (req?.body?.userName || "").toUpperCase()
      });
    }
    return res.json({ message: "Arquivo importado com sucesso" });
  } catch (error) {
    console.error("Erro importar arquivo:", error);
    return res.status(400).json({ error: "Erro ao importar arquivo" });
  }
}
async function importarArquivoFuncionario(req, res) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).send({ error: "Falta arquivo" });
    }
    if (!req?.body?.userName)
      return res.status(400).send({ error: "Falta usu\xE1rio" });
    const arquivo = Buffer.from(req.file.buffer).toString("utf-8");
    const funcionarios = arquivo.split("\n");
    const funcionarioRepository = new FuncionarioPostgresRepository2();
    const errors = [];
    let i = 0;
    for (const funcionario of funcionarios) {
      const [
        ,
        ,
        filial,
        ,
        identificacao,
        nome,
        codigoLocalidade,
        descricaoLocalidade,
        codigoTurnoTrabalho,
        descricaoTurno,
        codCentroCusto,
        descricaoCentroCusto,
        codFuncao,
        descricaoFuncao,
        dataNascimento,
        dataAdmissao,
        dataDemissao,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        ddd,
        telefone,
        email
      ] = funcionario.split(";");
      if (i === 1) {
        if (!nome)
          throw "Arquivo inv\xE1lido!";
      }
      i++;
      if (!identificacao)
        continue;
      const novaDataAdmissao = /* @__PURE__ */ new Date(`${dataAdmissao.slice(0, 4)}-${dataAdmissao.slice(4, 6)}-${dataAdmissao.slice(6, 8)}`);
      const novaDataDemissao = /* @__PURE__ */ new Date(`${dataDemissao.slice(0, 4)}-${dataDemissao.slice(4, 6)}-${dataDemissao.slice(6, 8)}`);
      const novaDataNascimento = /* @__PURE__ */ new Date(
        `${dataNascimento.slice(0, 4)}-${dataNascimento.slice(4, 6)}-${dataNascimento.slice(6, 8)}`
      );
      const codigoTurnoFormatado = "009" + codigoTurnoTrabalho.padStart(3, "0");
      const saved = await funcionarioRepository.upsert({
        nome,
        centroCusto: { nome: descricaoCentroCusto },
        contato: ddd && telefone ? { numero: `${ddd} ${telefone}` } : void 0,
        dataAdmissao: novaDataAdmissao,
        dataDemissao: dataDemissao ? novaDataDemissao : void 0,
        dataNascimento: novaDataNascimento,
        email: email.replace("\r", "").trim() ? { nome: email.replace("\r", "").trim() } : void 0,
        endereco: { cep, bairro, cidade, complemento, estado, numero, rua },
        filial,
        funcao: { nome: descricaoFuncao },
        identificacao,
        turno: {
          nome: descricaoTurno,
          cod_turno: codigoTurnoFormatado
        },
        localidade: {
          codigo: codigoLocalidade,
          nome: descricaoLocalidade
        },
        userName: (req?.body?.userName || "").toUpperCase()
      });
      console.log(codigoTurnoFormatado);
      if (!saved) {
        errors.push({ identificacao, nome });
      }
    }
    return res.json({ message: "Arquivo importado com sucesso", errors });
  } catch (error) {
    return res.send({ error }).status(400);
  }
}
async function importarArquivoCartao(req, res) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).send({ error: "Falta arquivo" });
    }
    if (!req?.body?.userName)
      return res.status(400).send({ error: "Falta usu\xE1rio" });
    const arquivo = Buffer.from(req.file.buffer).toString("utf-8");
    const cartaoDias = arquivo.split("\n");
    const funcionarioRepository = new FuncionarioPostgresRepository2();
    const cartaoPostgresRepository = new CartaoPostgresRepository();
    const errors = [];
    let cartao = {
      identificacao: "",
      funcionarioId: 0,
      referencia: /* @__PURE__ */ new Date(),
      saldoAnterior60: 0,
      saldoAnterior100: 0,
      status: { id: 1, descricao: "IMPORTADO" },
      dias: [],
      userName: (req?.body?.userName || "").toUpperCase()
    };
    for (const dia of cartaoDias) {
      const [
        ,
        ,
        identificacao,
        referencia,
        data,
        codStatus,
        descricaoStatus,
        primeiraEntrada,
        primeiraSaida,
        segundaEntrada,
        segundaSaida,
        descansoSemFormato
      ] = dia.split(";");
      if (!identificacao)
        continue;
      const descanso = descansoSemFormato.replace("\r", "");
      if (identificacao !== cartao.identificacao) {
        if (cartao.identificacao !== "") {
          await cartaoPostgresRepository.upsert(cartao);
        }
        cartao.identificacao = identificacao;
        cartao.saldoAnterior100 = 0;
        cartao.saldoAnterior60 = 0;
        cartao.status = { id: 1, descricao: "IMPORTADO" };
        cartao.referencia = (0, import_moment8.default)(`${referencia.slice(0, 4)}-${data.slice(4, 6)}-01`).add(1, "M").utc(true).toDate();
        cartao.dias = [];
        const existeFuncionario = await funcionarioRepository.findFisrt({ identificacao });
        if (!existeFuncionario) {
          errors.push({ identificacao, descricao: `Funcion\xE1rio n\xE3o encontrado pela identifica\xE7\xE3o ${identificacao}` });
          continue;
        }
        cartao.funcionarioId = existeFuncionario.id;
      }
      const dataAtual = (0, import_moment8.default)(/* @__PURE__ */ new Date(`${data.slice(0, 4)}-${data.slice(4, 6)}-${data.slice(6, 8)}`)).utc(false);
      const [hora, minutos] = descanso.split(".");
      let descansoEmMinutos = Number(hora) * 60 + Number(minutos);
      let cargaHor = 0, cargaHorPrimeiroPeriodo = 0, cargaHorSegundoPeriodo = 0, cargaHorNoturna = 0;
      {
        const [horaEntrada, minutosEntrada] = primeiraEntrada.split(".");
        const [horaSaida, minutosSaida] = primeiraSaida.split(".");
        const dataEntrada = (0, import_moment8.default)(dataAtual).hour(Number(horaEntrada)).minutes(Number(minutosEntrada));
        const dataSaida = (0, import_moment8.default)(dataAtual).hour(Number(horaSaida)).minutes(Number(minutosSaida));
        if (dataEntrada.isAfter(dataSaida))
          dataSaida.add(1, "d");
        cargaHorPrimeiroPeriodo = dataSaida.diff(dataEntrada, "minutes");
        cargaHorNoturna += BuscarHorarioNortunoEmMinutos((0, import_moment8.default)(data), dataEntrada, dataSaida);
      }
      {
        const [horaEntrada, minutosEntrada] = segundaEntrada.split(".");
        const [horaSaida, minutosSaida] = segundaSaida.split(".");
        const dataEntrada = (0, import_moment8.default)(dataAtual).hour(Number(horaEntrada)).minutes(Number(minutosEntrada));
        const dataSaida = (0, import_moment8.default)(dataAtual).hour(Number(horaSaida)).minutes(Number(minutosSaida));
        const dataPrimeiraEntrada = (0, import_moment8.default)(dataAtual).hour(Number(primeiraEntrada.split(".")[0])).minutes(Number(primeiraEntrada.split(".")[1]));
        if (dataPrimeiraEntrada.isAfter(dataEntrada))
          dataEntrada.add(1, "d");
        if (dataEntrada.isAfter(dataSaida))
          dataSaida.add(1, "d");
        cargaHorSegundoPeriodo = dataSaida.diff(dataEntrada, "minutes");
        cargaHorNoturna += BuscarHorarioNortunoEmMinutos((0, import_moment8.default)(data), dataEntrada, dataSaida);
      }
      cargaHor = cargaHorPrimeiroPeriodo + cargaHorSegundoPeriodo;
      cartao.dias.push({
        status: { descricao: descricaoStatus, id: Number(codStatus) },
        data: dataAtual.toDate(),
        cargaHorariaCompleta: `${primeiraEntrada};${primeiraSaida};${segundaEntrada};${segundaSaida};${descanso}`,
        periodoDescanso: descansoEmMinutos,
        cargaHor,
        cargaHorPrimeiroPeriodo,
        cargaHorSegundoPeriodo,
        cargaHorNoturna
      });
    }
    return res.json({ message: "Arquivo importado com sucesso", errors });
  } catch (error) {
    console.log("error", error);
    return res.send(error).status(400);
  }
}
async function importarArquivosAfastamento(req, res) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).send({ error: "falta arquivo" });
    }
    if (!req?.body.userName)
      return res.status(400).send({ error: "Falta usu\xE1rio" });
    const arquivo = Buffer.from(req.file.buffer).toString("utf-8");
    const afastamento = arquivo.split("\n");
    const funcionarioPostgresRepository = new FuncionarioPostgresRepository2();
    const afastamentoRepository = new AfastamentoRepository();
    const errors = [];
    for (const afastado of afastamento) {
      const [, , identificacao, cadStatus, descricaoStatus, inicioAfastamento, fimAfastamento, totalAfastamento] = afastado.split(";");
      if (!identificacao)
        continue;
      const existeFuncionario = await funcionarioPostgresRepository.findFisrt({ identificacao });
      if (!existeFuncionario) {
        errors.push({ identificacao, descricao: `Funcion\xE1rio n\xE3o encontrado pela identificacao ${identificacao}` });
        continue;
      }
      let funcionarios_afastadaos = {
        identificacao,
        inicio: /* @__PURE__ */ new Date(`${inicioAfastamento.slice(0, 4)}-${inicioAfastamento.slice(4, 6)}-${inicioAfastamento.slice(6, 8)}`),
        fim: !fimAfastamento ? void 0 : /* @__PURE__ */ new Date(`${fimAfastamento.slice(0, 4)}-${fimAfastamento.slice(4, 6)}-${fimAfastamento.slice(6, 8)}`),
        total: Number(totalAfastamento),
        funcionarioId: existeFuncionario.id,
        userName: (req?.body?.userName || "").toUpperCase(),
        status: {
          id: Number(cadStatus),
          nome: descricaoStatus.toUpperCase()
        }
      };
      if (funcionarios_afastadaos.identificacao !== "") {
        await afastamentoRepository.add(funcionarios_afastadaos);
      }
    }
    return res.json({ message: "Arquivo importado com sucesso", errors });
  } catch (error) {
    console.log("error", error);
    return res.send(error).status(400);
  }
}

// src/main/routes/horarios/upload-routes-routes.ts
var upload = (0, import_multer.default)();
var route31 = (router) => {
  router.post("/uploadfuncionario", upload.single("arquivo"), (req, res) => importarArquivoFuncionario(req, res));
  router.post("/uploadcartao", upload.single("arquivo"), (req, res) => importarArquivoCartao(req, res));
  router.post("/uploadafastamento", upload.single("arquivo"), (req, res) => importarArquivosAfastamento(req, res));
  router.post("/uploadagrupotrabalho", upload.single("arquivo"), (req, res) => importarArquivoGrupoTrabalho(req, res));
};
var upload_routes_routes_default = route31;

// src/main/config/routes.ts
var setupRoutes = (app2) => {
  const router = (0, import_express2.Router)();
  app2.use("/api", router);
  upload_routes_routes_default(router);
  delete_dia_horarios_routes_default(router);
  get_funcionario_routes_default(router);
  buscar_todos_funcionarios_routes_default(router);
  lancar_dia_routes_default(router);
  procurar_localidade_routes_default(router);
  delete_cartao_routes_default(router);
  listar_ocorrencia_routes_default(router);
  export_geral_routes_default(router);
  export_demitidos_routes_default(router);
  listar_descricacao_routes_default(router);
  cadastrar_atestado_default(router);
  listar_atestados_n_o_tratados_default(router);
  criar_eventos_default(router);
  solucao_eventos_routes_default(router);
  listar_solucoes_eventos_routes_default(router);
  listar_ocorrencia_geral_routes_default(router);
  calcular_resumo_routes_default(router);
  retornar_solucao_routes_default(router);
  listar_filial_routes_default(router);
  confirmar_lanca_dia_routes_default(router);
  listar_acompanhante_routes_default(router);
  listar_documento_routes_default(router);
  listar_ocupacao_routes_default(router);
  listar_status_documento_routes_default(router);
  listar_status_solucao_atestado_default(router);
  cadastrar_atestado_aprovado_routes_default(router);
  cadastrar_atestado_recusado_routes_default(router);
  listar_todos_atestados_routes_default(router);
  respaldar_atestado_routes_default(router);
  listar_atestados_60_dias_routes_default(router);
};

// src/main/config/app.ts
var app = (0, import_express3.default)();
app.use((0, import_cors.default)());
middlewares_default(app);
setupRoutes(app);
var app_default = app;

// src/main.ts
app_default.listen(Number(process.env.PORT), "0.0.0.0", () => console.log(`Server rodando em http://localhost:${process.env.PORT}`));
//# sourceMappingURL=main.cjs.map