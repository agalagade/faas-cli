export const ERROR_CODE_PREFIX = 'FAAS_CLI';

export const ERROR_CODE = Object.freeze({
  GET: {
    DOMAIN_NOT_FOUND: 'GET_DOMAIN_NOT_FOUND',
    NO_DOMAIN_PASSED: 'GET_DOMAIN_NOT_PASSED',
    NO_FUNCTION_FOUND: 'GET_NO_FUNCTION_FOUND',
  },
  GENERAL_ERROR: 'GENERAL_ERROR',
});

interface IPrettyPrintableErrorConfiguration {
  message: string;
  exit?: number;
  code: string;
  ref?: string;
  suggestions?: string[];
}

export class PrettyPrintableError {
  public readonly configuration: IPrettyPrintableErrorConfiguration;

  constructor(configuration: IPrettyPrintableErrorConfiguration) {
    this.configuration = configuration;
    this.setDefaults();
  }

  private setDefaults() {
    this.configuration.code = `${ERROR_CODE_PREFIX}_${this.configuration.code}`;
    /* istanbul ignore else */
    if (!this.configuration.exit) {
      this.configuration.exit = 1;
    }
  }
}
