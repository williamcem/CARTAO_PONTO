export class FuncionarioParamError extends Error {
  constructor(paramName: string) {
    super();
    this.name = paramName;
  }
}
