import { defineFeature, loadFeature } from 'jest-cucumber';
import * as fs from 'fs-extra';
import * as os from 'os';
import { join } from 'path';
import Command from '@oclif/command';
import { FileService } from '../../../src/service/file.service';
import { GetController } from '../../../src/controller/get.controller';
import { GetView } from '../../../src/view/get.view';

beforeAll(() => {
  jest.resetAllMocks();
});

jest.mock('../../../src/service/faas.service', () =>
  jest.requireActual('../../__mocks__/faas.service.ts'),
);
jest.mock('../../../src/service/faasFactory.service', () =>
  jest.requireActual('../../__mocks__/faasFactory.service.ts'),
);

const feature = loadFeature('test/commands/get/get.feature');

const testDir = join(__dirname, 'test');
const fileService = new FileService({ cwd: testDir });

defineFeature(feature, (test) => {
  let consoleSpy;

  beforeEach(() => {
    fs.ensureDirSync(testDir);
    consoleSpy = jest.spyOn(global.console, 'log').mockImplementation();
    jest.spyOn(os, 'tmpdir').mockReturnValue(testDir);
  });

  afterEach(() => {
    jest.resetAllMocks();
    consoleSpy = undefined;
  });

  afterAll(() => {
    fs.removeSync(testDir);
  });

  test('Run the Get command for all resources', ({ given, when, then }) => {
    const cliUx = {
      table: jest.fn(),
    };
    const command = ({
      error: jest.fn(),
    } as unknown) as Command;
    const getView = new GetView({ command, cliUx });

    given('I am authorized', async () => {
      await fileService.writeTempFile({
        '123456789': {
          token: '454545478787',
          userId: 'userId_123456789',
          username: 'testUser@liveperson.com',
          active: true,
        },
      });
    });

    when(
      'I run the get command with functions/deployments/account/events parameter',
      async () => {
        const getController = new GetController({ getView, command });
        await getController.get({
          domains: ['functions', 'deployments', 'account', 'events'],
        });
      },
    );

    then(
      'It should display information about functions/deployments/account/events',
      () => {
        expect(JSON.stringify(cliUx.table.mock.calls[0])).toContain(
          'TestFunction1',
        );
        expect(JSON.stringify(cliUx.table.mock.calls[0])).toContain('Draft');
        expect(JSON.stringify(cliUx.table.mock.calls[0])).toContain(
          'bot_connectors_error_hook',
        );
        expect(JSON.stringify(cliUx.table.mock.calls[1])).toContain(
          'TestFunction2',
        );
        expect(JSON.stringify(cliUx.table.mock.calls[1])).toContain(
          'Undeployed changes from',
        );
        expect(consoleSpy).toBeCalledWith(
          expect.stringMatching(/0% \(Invocations since/),
        );
      },
    );
  });

  test('Run the Get command for a non existing resource', ({
    given,
    when,
    then,
  }) => {
    const command = ({
      error: jest.fn(),
    } as unknown) as Command;

    given('I am authorized', async () => {
      await fileService.writeTempFile({
        '123456789': {
          token: '454545478787',
          userId: 'userId_123456789',
          username: 'testUser@liveperson.com',
          active: true,
        },
      });
    });

    when('I run the get command with an incorrect parameter', async () => {
      const getController = new GetController({ command });
      await getController.get({ domains: ['incorrectParam'] });
    });

    then('It should display an error', () => {
      expect(command.error).toHaveBeenCalledWith('Unsupported domain found.', {
        code: 'FAAS_CLI_GET_DOMAIN_NOT_FOUND',
        exit: 1,
        ref: 'https://github.com/LivePersonInc/faas-cli#get',
        suggestions: ['Functions, deployments, account or events.'],
      });
    });
  });

  test('Run the Get command with no domain provided', ({
    given,
    when,
    then,
  }) => {
    const command = ({
      error: jest.fn(),
    } as unknown) as Command;

    given('I am authorized', async () => {
      await fileService.writeTempFile({
        '123456789': {
          token: '454545478787',
          userId: 'userId_123456789',
          username: 'testUser@liveperson.com',
          active: true,
        },
      });
    });

    when('I run the get command with no domain provided', async () => {
      const getController = new GetController({ command });
      await getController.get({ domains: [] });
    });

    then('It should display an error', () => {
      expect(command.error).toHaveBeenCalledWith('No domain provided.', {
        code: 'FAAS_CLI_GET_DOMAIN_NOT_PASSED',
        exit: 1,
        ref: 'https://github.com/LivePersonInc/faas-cli#get',
        suggestions: ['Functions, deployments, account or events.'],
      });
    });
  });

  test('Run the Get command for all resources for an account without lambdas', ({
    given,
    when,
    then,
  }) => {
    const command = ({
      error: jest.fn(),
    } as unknown) as Command;

    given('I am authorized', async () => {
      await fileService.writeTempFile({
        '1234567890': {
          token: '454545478787',
          userId: 'userId_1234_NoLambdas',
          username: 'testUser@liveperson.com',
          active: true,
        },
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    given('I have no lambdas in my account', () => {});

    when(
      'I run the get command with functions/deployments/account/events parameter',
      async () => {
        const getController = new GetController({ command });
        await getController.get({ domains: ['account'] });
      },
    );

    then('It should display an error', () => {
      expect(command.error).toHaveBeenCalledWith(
        'There are no functions created on your account!.',
        {
          code: 'FAAS_CLI_GET_NO_FUNCTION_FOUND',
          exit: 1,
          suggestions: ['Create a function on the Functions platform.'],
        },
      );
    });
  });

  test('Run the Get command for all resources for an account but the endpoint is faulty', ({
    given,
    when,
    then,
  }) => {
    const command = ({
      error: jest.fn(),
    } as unknown) as Command;

    given('I am authorized', async () => {
      await fileService.writeTempFile({
        le123456789: {
          token: '454545478787',
          userId: 'userId_1234_error',
          username: 'testUser@liveperson.com',
          active: true,
        },
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    given('I have no lambdas in my account', () => {});

    when(
      'I run the get command with functions/deployments/account/events parameter',
      async () => {
        const getController = new GetController({ command });
        await getController.get({ domains: ['account'] });
      },
    );

    then('It should display an error', () => {
      expect(command.error).toHaveBeenCalledWith('401 (Unauthorized)', {
        code: 'FAAS_CLI_GENERAL_ERROR',
        exit: 1,
      });
    });
  });
});
