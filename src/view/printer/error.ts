import * as chalkDefault from 'chalk';
import Command from '@oclif/command';
import { PrettyPrintableError } from '../../shared/PrettyPrintableError';

export class ErrorMessage {
  private chalk: any;

  private readonly command: Command | undefined;

  constructor(command?: Command, chalk: any = chalkDefault) {
    this.chalk = chalk;
    this.command = command;
  }

  /**
   * Prints an error message with bold and red
   * @param {string} message - message
   * @param {...any[]} optionalParams - optionalParams
   * @memberof ErrorMessage
   */
  public print(message: string, ...optionalParams: any[]): void {
    const errorMessage = this.chalk.red.bold(message);
    // eslint-disable-next-line no-console
    console.log(errorMessage, ...optionalParams);
  }

  public printExtended(prettyError: PrettyPrintableError) {
    if (this.command) {
      const {
        message,
        exit,
        code,
        ref,
        suggestions,
      } = prettyError.configuration;
      this.command.error(message, {
        exit,
        ...(code && { code }),
        ...(ref && { ref }),
        ...(suggestions && { suggestions }),
      });
    }
  }
}
