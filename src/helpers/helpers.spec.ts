import { Helpers } from './helpers';

describe('Helpers - stringToSlug', () => {
  it('should low case strings', () => {
    expect(new Helpers().stringToSlug('ASTRING')).toBe('astring');
  });

  it('should remove spaces', () => {
    expect(new Helpers().stringToSlug('A string')).toBe('a-string');
  });

  it('should remove special characters', () => {
    expect(new Helpers().stringToSlug('A/* s$étring)')).toBe('a-setring');
  });
});
