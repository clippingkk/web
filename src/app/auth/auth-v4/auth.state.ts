import {
  assign,
  type EventFromLogic,
  fromCallback,
  fromPromise,
  type SnapshotFrom,
  setup,
} from 'xstate'
import type { AuthLoginResponseFragment } from '@/schema/generated'
import type { AppleAuthResponse } from '@/services/apple'
import { AuthV4ManualAuthSchema } from './schema'

type Context = {
  email?: string
  otp?: string
  password?: string
  turnstileToken?: string
  resendOTPReminds: number
  appleData?: AppleAuthResponse['authorization']
  metamaskData?: {
    address: string
    signature: string
    text: string
  }
  errorMessages?: string
  authData?: AuthLoginResponseFragment
}

type Event =
  | { type: 'EMAIL_TYPING'; email: string }
  | { type: 'CF_VERIFIED'; turnstileToken: string }
  | { type: 'APPLE_DATA_SUCCESS'; data: Required<Context>['appleData'] }
  | { type: 'OTP_TYPING'; otp: string }
  | { type: 'PWD_TYPING'; pwd: string }
  | { type: 'METAMASK_LOGIN_AUTH' }
  | { type: 'GITHUB_LOGIN' }
  | { type: 'RESEND' }
  | { type: 'CHANGE_TO_OTP' }
  | { type: 'SEND' }
  | { type: 'CHANGE_TO_PASSWORD' }
  | { type: 'SENT' }
  | { type: 'MANUAL_LOGIN' }
  | { type: 'WALLET_CONNECTED' }
  | { type: 'SIGNED' }
  | { type: 'SIGN' }
  | { type: 'APPLE_LOGIN' }
  | { type: 'LOGGED' }
  | { type: 'TICK' }
  | { type: 'REVERT_TO_IDLE' }

const authMachine = setup({
  types: {
    context: {} as Context,
    events: {} as Event,
  },
  actors: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doGithubLogin: fromPromise(async (_: { input: unknown }): Promise<any> => {
      throw new Error('not implemented')
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doSendOTP: fromPromise(
      async (_: {
        input: { email?: string; turnstileToken?: string }
      }): Promise<any> => {
        throw new Error('not implemented')
      }
    ),
    doMetamaskLogin: fromPromise(
      async (_: {
        input: { data: Context['metamaskData'] }
      }): Promise<AuthLoginResponseFragment | undefined> => {
        throw new Error('not implemented')
      }
    ),
    doManualLogin: fromPromise(
      async (_: {
        input: {
          email?: string
          password?: string
          otp?: string
          turnstileToken?: string
        }
      }): Promise<AuthLoginResponseFragment | undefined> => {
        throw new Error('not implemented')
      }
    ),
    doAppleLogin: fromPromise(
      async (_: {
        input: { data: Context['appleData'] }
      }): Promise<AuthLoginResponseFragment | undefined> => {
        throw new Error('not implemented')
      }
    ),
    connectWeb3Wallet: fromPromise(
      async (_: {
        input: unknown
      }): Promise<Required<Context>['metamaskData']> => {
        throw new Error('not implemented')
      }
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setLocalState: fromPromise(async (_: { input: unknown }): Promise<any> => {
      throw new Error('not implemented')
    }),
    tickTimer: fromCallback(({ sendBack }) => {
      const timer = setInterval(() => sendBack({ type: 'TICK' }), 1000)
      return () => clearInterval(timer)
    }),
  },
  guards: {
    isEmailValid: (ctx) =>
      /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(ctx.context.email ?? ''),
    onlyOnOTPTimeReset: (ctx) => ctx.context.resendOTPReminds === 0,
    onlyTimeReset: (ctx) => ctx.context.resendOTPReminds <= 0,
    // TODO: implement it
    manualLoginDataValid: (ctx) => {
      const { email, password, otp, turnstileToken } = ctx.context
      const parsed = AuthV4ManualAuthSchema.safeParse({
        email,
        password,
        otp,
        turnstileToken,
      })
      // console.log(parsed.error?.errors, parsed.success)
      return parsed.success
    },
    validatedOnly: () => true,
  },
  actions: {
    onAuthSuccess: (_, params: { data?: AuthLoginResponseFragment }) =>
      assign({ authData: params.data }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgMQDYHsB3AOgEsJcwBiAcQEkAVACQFUAhAfQBkB5egOQDaABgC6iUAAd8sUulL4AdhJAAPRAEYAHAFZiAZgBsRwxv0B2LRo0AWAEzmANCACeiALT79G4obtabLQBOMw1DAJt9AF8o5zQsPCIyCmoAWQBRBmRU5ABlAGluPjp+DmQWZhFxJBBpWXklFXUEdzsgvTsbU2Fww0MbYW9nNwQNO31fXQdhcx1DIP07YRsYuIwcAhJySipkAAU9rnSigSqVOrkFZRrmr3NfHQ0gvzabcyCtfWHNccmdJcMOmC5nGNiCqxA8Q2SW21HSOToXA4DAAmnsSjQzjULg1rqBmu4dINiEthEFlnYNMthA5vi0jBMNDogjY5jp9AE7A4IVDElsUlQsVIZJdGjcPBpzD4ZiC7MYWYZzAy6e4QUEDG8tDNhEDhEzDDz1nzkpQTdQAMLYDgANXSACU6Ng6OkACJC2oi3FNCUg4g9HRgnRsokBL6uDz6GZ+smPQZjLRLLSGhKbYh7ACGsFgAGN8BA0sh+CxkEjeKcxOdPVdvQgrBM7HMgiFZoNBjYVVopb4LDG5Z1jNFYpCjamM1nc-m05nYIR8AAnCBUc1MQs0Y4MHgcHgMPbunHV8UtazCYghFlEqVafrmHoqsazP1jbReLwJlnJ6EkMc5vNgKdZ2cFyoPYAHUXWRNEMT3KsxXxDx7DsYhPkjTob30clljDEZ3Hje5JWEGYzC6WNzA-Y1vwnP9tz2JcV34NdkU3PY8lyECeDtN0K2xGC8TUCUOWIINTHCRZnjaPo7zGCYQWsLQ5P0OY3hWIdeVHadKOIaizSoO10lydJ+E46phXqA84IQaZBIbTp2V0Fsgkk34ZO0eTFPMZS1hTJIKN-TSd20-TDOg0zYL4hAB2IWYdClckBiVCw7wbPQaSWV9O3Ejzhy8r91N8rTYSoaiIPRejgtFXjbn0GxIqWOZLDGIJzHeHQ7y6aqQjq8xFSlMlSJUkdvNyyctNgMBFAgUhFCgKgICUP9JoAN3wABrP9VMG8c8v80bxsmqAEEW-Bs3TXEqjKr1DwiU85XCLphC1MlJL8XwBmMGx7DMKw+s8z9-x-YbtrGiapqoMA5znediEkXAToAM3nABbYh1pyzaAb2YgduB-bDuO06xHOsywqVE9HgCf4liZYJEvZKzKSpcZ0IsJN+uyv6NK06jcjG9AZrmshFCW1bkYG1H-qo-yuZ5g7BaOk6rjOriTPKmsmsQ-wMpsawWQ+VraZmYFWV0LpBx+8iholjGpcUXmGDoc18kJ0Lmm1rRox1MJDEGDlIjvdCT1E1lKXCT45TItS0ctvy9m5m3BSVj0QoqxAE2qqxrEjK8OrvPw9DkpKpS96LLHDpIEbAdB01STNlq4fAoCgPa+cUebZeFlHiHLyvq9gWv68bqaZaWvGFYJhP92dzRwg1BwPi1zoyQWOlPkMGrWW8AZ2QbTKO67qua7rhum7BiG5yhmH0Hhuckd3iv997w+B5x2WR6URXjMTlXD3cL3EIHFeej+EaloOkYw9DaHZARWwXRkIszNqmPeCMD79z2nQRQzdW5CzWqLTud8kEPxQVNNBQ85b41EE7ZOowzCIWeO5dekZ+iPXDAgLWJ53ifQWJSdhthS4kEQcgo+RD0En0htDOGiMRZs34QQwRUBiG43lm-MeH8J6UJwmSP08pBjMneO0CSzC3h6D8PMExjYiSmyyr9RuWBUAACNH6oPQbNFuAssGSKsXITAdiHFCJIa-RQ79KxJ1Vk1P0WoFK3XGNFFU-w-RvC6lrVkvVoo7xwdYrx9jCFyOEeDURF8r43zSZ47xWT5Ev0UQE5RQSv7mUBG7RYOporWHejeEBzD3BxRJA4fowQLDzE6KkqR6ZFCoHTLgHx2SMGuJWtgoZIyxkTLKcPCpgTuLBMugEYgYIzB+E7JKcIMTOgPC6IqQE-xtAaF4Z3YZozxmlJyafc+4jr7uONEg+ZdzZFLNIaPch48eI1jmNJdoCxGr3V0NE9pnYTxmBkgmBkfQ7BXPTJIaGYBFlOP5odduOCUVooxX4lZVS1k1LCgsaqTJvBPGoRYDkdIljqmZm2Kw9hOw6GRaiygGLQa5LPmIy+EiO54q5fcwlZCKE1jlPcSIYxIh6l1PqOkfQ9DslfKC8k8YOVoqhE3fYhxjgumQFkDguQWDmnNHpXIErDyRh8FYL21I5SYXcnSBCp5bBUiat4OSeotWUB1SDXSto7QMEYhwOgLojjWvMmAkkfQNXMjmIi9szCpJ-ABIsIETItYxCHIoX88Aago2qRdcyP8iTdg5EYQBwI2nYRcvUhMuyqS2AWHAyxxpYQlqJgSTobtnidSpAGVkgIVSBAmIEAdcoExkgTN9DtqZYRmm7ZPFopJTyAm6kO96bIVToT0B8dolg3idCpEYK5S7syw2tGDUgsNSCQBXWozsxBKWKmCA4VhnQ93tFPMEL2pgQh6nmOy1mv0fL5ifTWDpN4kJeBpG8QYGFfbtO0ARJCCZHiRksPdewVyIN-m-IBCAUHv5SsErYV4n6AR1olE8CYOo7oWHegEGY+GLbR1I+ZLkiF-j-HXnZIkDlUNSgmByBsCltZeGsOxyO0dl0ktLWFfoPh7BGF0E8LkXQ7B+0WCSYIuGnhdXfbJ8W8msZ7S42FZkbtKRajeGYZ4LJJKwf+AmM9dwQSmY5pLHcsd0BWZdjSAOeogioSqlKWwiUX3zCquEdo+ylRXMfpANBgWU4PnCN0-jHr3p7uMJMfwn0HP-oNGBt5d8e591kelo8v6PjueivdZkrInDMM+NVG8VIZRhdC-O2+ld8HVafmlxTPbEDsnVE2ckYX7BAeEyMDrkU9QESar1ozVz0klK+bxVRgLf1AhJkqOzBFDCgKqq+yIVguTvB6MYfrOD3m3IxbV6Fp5ZjuT1Ohd4RgVTxaQj0OdFhKNcj9ei+5tWAyr0wxydkAY9kaCVT0SK6EEycmsA2MHAaoC1aqj4CL-hjMslQmd5hfZBIb2eIkpqQLc1RCAA */
  initial: 'idle',

  context: {
    resendOTPReminds: 0,
  },

  states: {
    idle: {
      on: {
        GITHUB_LOGIN: {
          target: 'githubLoggingIn',
          reenter: true,
        },

        METAMASK_LOGIN_AUTH: 'metaMaskLogging',

        APPLE_LOGIN: {
          target: 'appleAuthing',
          reenter: true,
        },

        EMAIL_TYPING: {
          target: 'idle',
          actions: assign({
            email: (ctx) => ctx.event.email,
          }),
        },
      },

      states: {
        idle: {
          on: {
            CF_VERIFIED: {
              target: 'cfVerified',
              actions: assign({
                turnstileToken: (ctx) => ctx.event.turnstileToken,
              }),
              reenter: true,
            },
          },
        },

        cfVerified: {},
      },

      initial: 'idle',

      always: {
        target: 'Passcode',
        reenter: true,
        guard: 'isEmailValid',
      },
    },

    Passcode: {
      states: {
        Password: {
          on: {
            CHANGE_TO_OTP: 'OTP',
            PWD_TYPING: {
              target: 'Password',
              actions: assign({ password: (ctx) => ctx.event.pwd }),
            },
          },
        },

        OTP: {
          on: {
            CHANGE_TO_PASSWORD: {
              target: 'Password',
              reenter: true,
            },
          },
          states: {
            idle: {
              on: {
                RESEND: {
                  target: 'sending',
                  guard: 'onlyOnOTPTimeReset',
                  reenter: true,
                },
                SEND: {
                  target: 'sending',
                  reenter: true,
                },
                OTP_TYPING: {
                  target: 'idle',
                  actions: assign({ otp: (ctx) => ctx.event.otp }),
                },
              },
            },

            sending: {
              invoke: {
                src: 'doSendOTP',
                input: (ctx) => {
                  return {
                    email: ctx.context.email,
                    turnstileToken: ctx.context.turnstileToken,
                  }
                },
                onDone: {
                  target: 'OTPSent',
                  actions: assign({ resendOTPReminds: () => 60 }),
                  reenter: true,
                },
                onError: {
                  target: 'idle',
                  reenter: true,
                },
              },
            },

            OTPSent: {
              always: {
                target: 'idle',
                reenter: true,
                guard: 'onlyTimeReset',
              },

              invoke: {
                src: 'tickTimer',
                onDone: {
                  target: 'idle',
                  actions: assign({ resendOTPReminds: 60 }),
                },
              },

              on: {
                TICK: {
                  target: 'OTPSent',
                  actions: assign({
                    resendOTPReminds: (ctx) => ctx.context.resendOTPReminds - 1,
                  }),
                },
              },
            },
          },
          initial: 'idle',
        },
      },

      initial: 'Password',

      on: {
        MANUAL_LOGIN: {
          target: 'manualLoggingIn',
          guard: 'manualLoginDataValid',
        },
      },
    },

    LoggedIn: {
      invoke: {
        src: 'setLocalState',
      },
    },

    metaMaskLogging: {
      invoke: {
        src: 'connectWeb3Wallet',
        onDone: {
          target: 'metamaskLoggingIn',
          actions: assign({ metamaskData: ({ event }) => event.output }),
          reenter: true,
        },
        onError: {
          target: 'idle',
        },
      },
    },

    metamaskLoggingIn: {
      invoke: {
        src: 'doMetamaskLogin',
        input: (ctx) => {
          return { data: ctx.context.metamaskData }
        },
        onDone: {
          target: 'LoggedIn',
          actions: {
            type: 'onAuthSuccess',
            params({ event }) {
              return { data: event.output }
            },
          },
        },
        onError: {
          target: 'idle',
        },
      },
    },

    githubLoggingIn: {
      invoke: {
        src: 'doGithubLogin',
        onDone: {
          target: 'LoggedIn',
          // actions: {
          //   type: 'onAuthSuccess',
          //   params({ context, event }) {
          //     return { data: event.output }
          //   },
          // },
        },
        onError: {
          target: 'idle',
        },
      },
    },

    manualLoggingIn: {
      invoke: {
        src: 'doManualLogin',
        input: (ctx) => {
          return {
            email: ctx.context.email,
            password: ctx.context.password,
            otp: ctx.context.otp,
            turnstileToken: ctx.context.turnstileToken,
          }
        },
        onDone: {
          target: 'LoggedIn',
          actions: {
            type: 'onAuthSuccess',
            params({ event }) {
              return { data: event.output }
            },
          },
          reenter: true,
        },
        onError: {
          target: 'Passcode',
        },
      },
    },

    appleLoggingIn: {
      invoke: {
        src: 'doAppleLogin',
        input: (ctx) => {
          return {
            data: ctx.context.appleData,
          }
        },
        onDone: {
          target: 'LoggedIn',
          actions: {
            type: 'onAuthSuccess',
            params({ event }) {
              return { data: event.output }
            },
          },
        },
        onError: {
          target: 'idle',
        },
      },
    },

    appleAuthing: {
      on: {
        APPLE_DATA_SUCCESS: {
          target: 'appleLoggingIn',
          actions: assign({ appleData: (ctx) => ctx.event.data }),
          reenter: true,
        },

        REVERT_TO_IDLE: {
          target: 'idle',
          reenter: true,
        },
      },
    },
  },
  id: 'AuthFlow',
})

export type AuthMachine = SnapshotFrom<typeof authMachine>
export type AuthEvents = EventFromLogic<typeof authMachine>
export default authMachine
