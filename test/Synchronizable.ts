import 'mocha';
import { expect } from 'chai';

import { Synchronizable } from '../src/Synchronizable';

import { Parallel } from './Parallel';

class Racing extends Synchronizable {
  public i = 0;

  async inc() {
    const v = this.i;
    await new Promise(resolve =>
      setTimeout(() => {
        this.i = v + 1;
        resolve();
      }, 10)
    );
  }
}

describe('Foo', () => {
  it('should work', async () => {
    const c = new Racing();

    const para = new Parallel(4);
    for (const i of Array(10)) {
      await para.do(
        async () => await c.synchronized(async () => await c.inc())
      );
    }
    await para.waitAll();

    expect(c.i).to.equal(10);
  });

  it('should not work', async () => {
    const c = new Racing();

    const para = new Parallel(4);
    for (const i of Array(10)) await para.do(async () => await c.inc());
    await para.waitAll();

    expect(c.i).to.not.equal(10);
  });

  it('recursive', async () => {
    const c = new Synchronizable();
    await c.synchronized(() => c.synchronized(async () => void 0));
  });
});
