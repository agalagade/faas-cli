import Command from '@oclif/command';
import { GetView } from '../view/get.view';
import { factory } from '../service/faasFactory.service';
import {
  ERROR_CODE,
  PrettyPrintableError,
} from '../shared/PrettyPrintableError';

interface IGetControllerConfig {
  command: Command;
  getView?: GetView;
}

interface IGetConfig {
  domains?: string[];
}

export class GetController {
  private readonly getView: GetView;

  private readonly domains: string[];

  private readonly command: Command;

  constructor(
    /* istanbul ignore next */ { command, getView }: IGetControllerConfig,
  ) {
    this.getView = getView || new GetView({ command });
    this.domains = ['functions', 'deployments', 'account', 'events'];
    this.command = command;
  }

  /**
   * Returns the information about the passed domains.
   * @param {IGetConfig} - Passed domains
   * @returns {Promise<void>} - get view
   * @memberof GetController
   */
  public async get(
    /* istanbul ignore next */ { domains = [] }: IGetConfig,
  ): Promise<void> {
    try {
      if (domains.length === 0) {
        throw new PrettyPrintableError({
          message: 'No domain provided.',
          suggestions: ['Functions, deployments, account or events.'],
          ref: 'https://github.com/LivePersonInc/faas-cli#get',
          code: ERROR_CODE.GET.NO_DOMAIN_PASSED,
        });
      }

      /* istanbul ignore else */
      if (!domains.some((e) => this.domains.includes(e))) {
        throw new PrettyPrintableError({
          message: 'Unsupported domain found.',
          suggestions: ['Functions, deployments, account or events.'],
          ref: 'https://github.com/LivePersonInc/faas-cli#get',
          code: ERROR_CODE.GET.DOMAIN_NOT_FOUND,
        });
      }

      const faasService = await factory.get();

      const allLambdas = await faasService.getAllLambdas();

      /* istanbul ignore else */
      if (allLambdas.length === 0) {
        throw new PrettyPrintableError({
          message: 'There are no functions created on your account!.',
          suggestions: ['Create a function on the Functions platform.'],
          code: ERROR_CODE.GET.NO_FUNCTION_FOUND,
        });
      }

      const updatedLambdas = allLambdas.map((func) => {
        func.eventId = func.eventId ? func.eventId : 'No Event';
        return func;
      });

      /* istanbul ignore else */
      if (domains.includes('functions')) {
        this.getView.printFunctions(updatedLambdas);
      }

      /* istanbul ignore else */
      if (domains.includes('deployments')) {
        const productiveLambdas = updatedLambdas
          .filter(
            (lambda) =>
              lambda.state === 'Productive' || lambda.state === 'Modified',
          )
          .map((lambda) => ({
            ...lambda.lastDeployment,
            name: lambda.name,
            state:
              lambda.state === 'Productive' ? 'Up to date' : lambda.updatedAt,
          }));
        this.getView.printDeployments(productiveLambdas);
      }

      /* istanbul ignore else */
      if (domains.includes('account')) {
        const accountInfo = await faasService.getAccountStatistic();
        this.getView.printAccountInformation(accountInfo);
      }

      /* istanbul ignore else */
      if (domains.includes('events')) {
        const events = await faasService.getEvents();
        this.getView.printEvents(events);
      }
    } catch (error) {
      if (error instanceof PrettyPrintableError) {
        this.getView.showErrorMessage(error);
      } else {
        const prettyError = new PrettyPrintableError({
          message: error.message || error.errorMsg,
          code: ERROR_CODE.GENERAL_ERROR,
        });
        this.getView.showErrorMessage(prettyError);
      }
    }
  }
}
