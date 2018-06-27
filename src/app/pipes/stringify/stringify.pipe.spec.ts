import { StringifyPipe } from './stringify.pipe';

describe('StringifyPipe', () => {
  it('create an instance', () => {
    const pipe = new StringifyPipe();
    expect(pipe).toBeTruthy();
  });
});
