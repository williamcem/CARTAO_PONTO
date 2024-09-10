import { badRequest, badRequestNovo, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./criar-agrupamento-localidade-protocols";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { CriarAgrupamentoLocalidadePostgresRepository } from "@infra/db/postgresdb/criar-agrupamento-localidade/criar-agrupamento-localidade";

export class CriarAgrupamentoLocalidadeController implements Controller {
  constructor(private readonly criarAgrupamentoLocalidadePostgresRepository: CriarAgrupamentoLocalidadePostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const {
        localidades,
        nome,
      }: {
        localidades: { codigo: string }[];
        nome: string;
      } = httpRequest.body;

      if (!nome) return badRequestNovo({ message: "Falta nome!" });

      if (!localidades) return badRequestNovo({ message: "Falta localidades!" });

      if (!localidades?.length) return badRequestNovo({ message: "Localidades é um Array!" });

      if (localidades?.length <= 1) return badRequestNovo({ message: "Favor passar mais de uma localidade para agrupar!" });

      for (const localidade of localidades) {
        const existLocalidade = await this.criarAgrupamentoLocalidadePostgresRepository.findFisrtLocalidade({
          codigo: localidade.codigo,
        });

        if (!existLocalidade) return notFoundRequest(new FuncionarioParamError(`Código de localidade ${localidade} não existe!`));
      }

      const existeAgrupamento = await this.criarAgrupamentoLocalidadePostgresRepository.findFisrtAgrupamento({ nome });

      if (existeAgrupamento) return badRequestNovo({ message: `Já existe um agrupamento com o nome ${nome}!` });

      const result = await this.criarAgrupamentoLocalidadePostgresRepository.createAgrupamentoLocalidade({
        codigos: localidades.map((localidade) => localidade.codigo),
        nome,
      });

      if (!result) return serverError();

      return ok({
        message: {
          agrupamentoLocalidade: {
            id: result.id,
          },
        },
      });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
