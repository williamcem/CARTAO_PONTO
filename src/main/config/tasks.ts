import { CronAdapter } from "@infra/tasks/CronAdapter";
import { TasksCron } from "@infra/tasks/cron/mudar-status-cartao-afastado-cron";
import { makeMudarStatusCartaoAfastadoController } from "../factories/mudar-status-cartao-afastado";
import { makeValidarDiaComLancamentoValidadoController } from "../factories/validar-dia-com-lancamento-validado";

export const setupTask = async (): Promise<void> => {
  const cronAdapter = new CronAdapter();

  new TasksCron(cronAdapter).execute([
    {
      interval: "0 * * * *",
      name: "mudar-status-cartao-afastado",
      task: async () => {
        return makeMudarStatusCartaoAfastadoController().handle();
      },
    },
    {
      interval: "0 * * * *",
      name: "validar-dia-com-lancamento-validado",
      task: async () => {
        return makeValidarDiaComLancamentoValidadoController().handle();
      },
    },
  ]);
};
