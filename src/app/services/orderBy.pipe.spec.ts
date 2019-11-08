import { orderByPipe } from './orderBy.pipe';

describe('SortPipePipe', () => {
  it('create an instance', () => {
    const pipe = new orderByPipe();
    expect(pipe).toBeTruthy();
  });
});
