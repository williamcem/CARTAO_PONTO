import * as cron from "cron";

import { addTaskInput, ITask } from "./ITask";

export class CronAdapter implements ITask {
  public job: typeof cron;
  public executePriority: boolean;

  constructor() {
    this.job = cron;
    this.executePriority = false;
  }

  public async add(input: addTaskInput) {
    new this.job.CronJob(input.interval, input.task, null, true);
  }
}

