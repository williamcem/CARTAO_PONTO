export class FuncionarioParamError extends Error {
  constructor(paramName: string) {
    super();
    this.name = paramName;
  }
}

export class DataAtestadoInvalida extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataAtestadoInvalida";
  }
}

export class ComprimentoDeArray extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComprimentoDeArray";
  }
}

export class FormatoArray extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormatoArray";
  }
}

export class OcorrenciasNull extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormatoArray";
  }
}
