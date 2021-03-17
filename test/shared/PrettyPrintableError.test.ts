import { PrettyPrintableError } from '../../lib/shared/PrettyPrintableError';

describe('Pretty Printable Error', () => {
  it('should create a pretty printable error with default values', () => {
    const prettyPrintableError = new PrettyPrintableError({
      message: 'Test message',
      suggestions: ['a test message'],
      code: 'TEST',
      ref: 'www.liveperson.com',
    });

    expect(prettyPrintableError).toBeInstanceOf(PrettyPrintableError);
    expect(prettyPrintableError.configuration).toEqual({
      message: 'Test message',
      suggestions: ['a test message'],
      code: 'FAAS_CLI_TEST',
      ref: 'www.liveperson.com',
      exit: 1,
    });
  });

  it('should create a pretty printable error with all passed values', () => {
    const prettyPrintableError = new PrettyPrintableError({
      message: 'Test message',
      suggestions: ['a test message'],
      code: 'TEST',
      ref: 'www.liveperson.com',
      exit: 130,
    });

    expect(prettyPrintableError).toBeInstanceOf(PrettyPrintableError);
    expect(prettyPrintableError.configuration).toEqual({
      message: 'Test message',
      suggestions: ['a test message'],
      code: 'FAAS_CLI_TEST',
      ref: 'www.liveperson.com',
      exit: 130,
    });
  });
});
