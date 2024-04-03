export class ServerError extends Error {
  constructor() {
    super("Erro do servidor interno");
    this.name = "ServerError";
  }
}
