import { lock, queue } from './Symbols';

export class Synchronizable {
  private [lock] = false;
  private [queue]: Array<() => void> = [];

  public async synchronized<T>(fn: () => Promise<T>): Promise<T> {
    while (true) {
      if (this[lock]) await new Promise(resolve => this[queue].push(resolve));
      else {
        this[lock] = true;
        try {
          return await fn();
        } finally {
          this[lock] = false;
          const tmp = this[queue];
          this[queue] = [];
          tmp.forEach(e => e());
        }
      }
    }
  }
}
