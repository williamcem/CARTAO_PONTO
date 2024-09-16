import { ITask, addTaskInput } from "../ITask";

export class TasksCron {
  constructor(private task: ITask) {}
  public execute(tasks: addTaskInput[]) {
    tasks.map((task) => {
      this.task.add({
        interval: task.interval,
        name: task.name,
        async task() {
          try {
            console.log(task.name);
            return await task.task();
          } catch (error) {
            console.log(error);
          }
        },
      });
    });
  }
}

