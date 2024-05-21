export class FuncionarioParamError extends Error {
  constructor(paramName: string) {
    super("Identificador não encontrado: ${paramName}");
    this.name = "Identificador não encontrado";
  }
}
