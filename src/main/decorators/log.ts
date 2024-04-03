import { Controller, HttpRequest, HttpResponse } from "../../presentation/protocols";

export class LogControllerDecorator implements Controller {
  private readonly controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }
  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    const httPResponse = await this.controller.handle(httRequest);
    return httPResponse;
  }
}
