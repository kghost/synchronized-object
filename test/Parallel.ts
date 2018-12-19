import * as promiseFinally from 'promise.prototype.finally';
promiseFinally.shim();

export class Parallel {
  private tasks: number = 0;
  private resolve: (() => any) | null = null;

  constructor(private readonly depth: number) {}

  public async do(f: () => Promise<any>) {
    while (this.tasks == this.depth) await this.wait();

    this.tasks++;
    // create and silently drop the promise.
    f().finally(() => {
      const tmp = this.resolve;
      this.resolve = null;
      this.tasks--;
      if (tmp) tmp();
    });
  }

  public async wait() {
    await new Promise(resolve => (this.resolve = resolve));
  }

  public async waitAll() {
    while (this.tasks != 0) await this.wait();
  }
}
