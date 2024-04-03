import express, { Request, Response } from "express";

import { IHttpServer, OnInput } from "./IHttpServer";
import { corsMiddleware } from "./middleware/corsMiddleware";

export class ExpressAdapter implements IHttpServer {
  private app: express.Express;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(corsMiddleware);
    this.app.get("/health", (_, res: express.Response) => res.json("ok"));
  }

  on(input: OnInput): void {
    this.app[input.method](input.url, async (req: Request & { auth?: any }, res: Response) => {
      const output = await input.callback({
        params: req.params,
        body: req.body,
        auth: req.auth,
      });
      res.status(output.code).json({ data: output.data, error: output.error });
    });
  }

  listen(port: number): void {
    this.app.listen(port, () => console.log(`Express server is running at port :${port}`));
  }
}
