import { CronAdapter } from "@infra/tasks/CronAdapter";
import { TasksCron } from "@infra/tasks/cron/mudar-status-cartao-afastado-cron";
import { makeMudarStatusCartaoAfastadoController } from "../factories/mudar-status-cartao-afastado";

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
  ]);
};
