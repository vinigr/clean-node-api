import { LogErrorRepository } from '../../data/protocols/log-error-repository'
import { serverError } from '../../presentation/helpers/http-helper'
import {
  Controller,
  HttpRequest,
  HttpResponse
} from '../../presentation/protocols'
import { LogControllerDecorator } from './log'

const makeController = (): Controller => {
  class ControllerStub {
    async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
      const httpResponse: HttpResponse = {
        statusCode: 200,
        body: {
          name: 'Vinícios'
        }
      }

      return new Promise(resolve => resolve(httpResponse))
    }
  }

  return new ControllerStub()
}

const makeLogErrorRepository = (): LogErrorRepository => {
  class LogErrorRepositoryStub implements LogErrorRepository {
    async logError (stack: string): Promise<void> {
      return new Promise(resolve => resolve())
    }
  }

  return new LogErrorRepositoryStub()
}

interface SutTypes {
  sut: LogControllerDecorator
  controllerStub: Controller
  logErrorReposityStub: LogErrorRepository
}

const makeSut = (): SutTypes => {
  const controllerStub = makeController()
  const logErrorReposityStub = makeLogErrorRepository()
  const sut = new LogControllerDecorator(controllerStub, logErrorReposityStub)

  return {
    sut,
    controllerStub,
    logErrorReposityStub
  }
}

describe('LogController Decorator', () => {
  test('should call controller handle', async () => {
    const { sut, controllerStub } = makeSut()
    const handleSpy = jest.spyOn(controllerStub, 'handle')

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    await sut.handle(httpRequest)
    expect(handleSpy).toHaveBeenCalledWith(httpRequest)
  })

  test('should return the same result of the controller', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual({
      statusCode: 200,
      body: {
        name: 'Vinícios'
      }
    })
  })

  test('should call LogErrorRepository with correct error if controller returns a server error', async () => {
    const { sut, controllerStub, logErrorReposityStub } = makeSut()

    const fakeError = new Error()
    fakeError.stack = 'any_stack'

    const error = serverError(fakeError)

    const logSpy = jest.spyOn(logErrorReposityStub, 'logError')

    jest
      .spyOn(controllerStub, 'handle')
      .mockReturnValueOnce(new Promise(resolve => resolve(error)))

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    await sut.handle(httpRequest)
    expect(logSpy).toHaveBeenCalledWith(fakeError.stack)
  })
})
