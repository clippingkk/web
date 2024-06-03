import { EventFromLogic, SnapshotFrom, assign, fromPromise, setup } from "xstate"
import { AppleAuthResponse } from "../../../services/apple"
import { AuthV4ManualAuthSchema } from "./schema"
import { AuthLoginResponseFragment } from "../../../schema/generated"

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
  },
  errorMessages?: string
  authData?: AuthLoginResponseFragment
}

type Event =
  | { type: 'EMAIL_TYPING', email: string }
  | { type: 'CF_VERIFIED', turnstileToken: string }
  | { type: 'APPLE_DATA_SUCCESS', data: Required<Context>['appleData'] }
  | { type: 'OTP_TYPING', otp: string }
  | { type: 'PWD_TYPING', pwd: string }
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

const authMachine = setup({
  types: {
    context: {} as Context,
    events: {} as Event,
  },
  actors: {
    doGithubLogin: fromPromise(async (_: { input: unknown }): Promise<any> => {
      throw new Error('not implemented')
    }),
    doSendOTP: fromPromise(async (_: { input: { email?: string, turnstileToken?: string } }): Promise<any> => {
      throw new Error('not implemented')
    }),
    doMetamaskLogin: fromPromise(async (_: { input: { data: Context['metamaskData'] } }): Promise<AuthLoginResponseFragment | undefined> => {
      throw new Error('not implemented')
    }),
    doManualLogin: fromPromise(async (_: { input: { email?: string, password?: string, otp?: string, turnstileToken?: string } }): Promise<AuthLoginResponseFragment | undefined> => {
      throw new Error('not implemented')
    }),
    doAppleLogin: fromPromise(async (_: { input: { data: Context['appleData'] } }): Promise<AuthLoginResponseFragment | undefined> => {
      throw new Error('not implemented')
    }),
    connectWeb3Wallet: fromPromise(async (_: { input: unknown }): Promise<Required<Context>['metamaskData']> => {
      throw new Error('not implemented')
    }),
    setLocalState: fromPromise(async (_: { input: unknown }): Promise<Required<Context>['metamaskData']> => {
      throw new Error('not implemented')
    })
  },
  guards: {
    isEmailValid: (ctx) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(ctx.context.email ?? ''),
    onlyOnOTPTimeReset: (ctx) => ctx.context.resendOTPReminds === 0,
    onlyTimeReset: (ctx) => ctx.context.resendOTPReminds === 0,
    // TODO: implement it
    manualLoginDataValid: (ctx) => {
      const { email, password, otp, turnstileToken } = ctx.context
      const parsed = AuthV4ManualAuthSchema.safeParse({ email, password, otp, turnstileToken })
      return parsed.success
    },
    validatedOnly: (ctx) => true
  },
  actions: {
    appleDataSuccess: (_, params: { data: Required<Context>['appleData'] }) => assign({ appleData: params.data }),
    onAuthSuccess: (_, params: { data?: AuthLoginResponseFragment }) => assign({ authData: params.data }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgMQDYHsB3AOgEsJcwBiAcQEkAVACQFUAhAfQBkB5egOQDaABgC6iUAAd8sUulL4AdhJAAPRAEYAHAFZiAZgBsRwxv0B2LRo0AWAEzmANCACeiALT79G4obtabLQBOMw1DAJt9AF8o5zQsPCIyCmoAWQBRBmRU5ABlAGluPjp+DmQWZhFxJBBpWXklFXUEdzsgvTsbU2Fww0MbYW9nNwQNO31fXQdhcx1DIP07YRsYuIwcAhJySipkAAU9rnSigSqVOrkFZRrmr2FiIPMbLp0rYQ1hNqdXTS9iHR02n6WnMhh0s1sqxA8Q2SW21HSOToXA4DAAmnsSjQzjULg1rqBmu4dINiEthEFlnYPgMHMMPEYJhodEEbHMdPoAnYHFCYYktikqDipDJLo0bh4NOYfDNzNzjKzDOZGfSWnKggYbJYZsJXu85rz1vzkpQTdQAMLYDgANXSACU6Ng6OkACLC2qi-FNSVy4g9HQ2drskkBfSqzwzP0UwGDMZaJZaQ0JTbEPYAQ1gsAAxvgIGlkPwWMgUbxTmJzp6rt6EFYJnY5kEQrNBoMbOGQT5jOZo3Y-F0vEnYSR05mc3nUxnYIR8AAnCBUc1MAs0Y4MHgcHgMPbuvFViUtaz3EKsknSrT9buGcNjWZ+sbaLxeeOswfGkfZ3NgCeZ6dzqh7AB1F1UQxLEd0rcVCQ8ew7GILQ7k6bt9EpZYwx+A9-HMYgpWEGYzBeD5zFfFN3zHL9Nz2Bcl34FdUXXPY8lyACeDtN1y1xCCCTUSVOX+OYwngto-CCPprzGCY5WsLRpP0OYtRWWJoSNEjJzI4gKLNKg7XSXJ0n4NjqhFeo9yghBpn+etOg5XRmyCMTxmISTtBkuSnmIpJSM-dSt003T9PA4zIO4hBjAkgFpUpAZlQsa96z0T4lifEEhIUtZkw81SvI0+EqAokDMRogKxS4259BsRyljmSwxkecx2mvLpypCKrQXMaUKSIxS+RU0csp82AwEUCBSEUKAqAgJQvxGgA3fAAGsv26jLevHDSBqGkaoAQGb8CzNN8SqIqvX3AJDEc-RdXPd4wWlb4RncaxfU+UFPnPblZPc4dMtW-rBuG0aqDAGcZ1nYhJFwfaADNZwAW2IJavpW8jfo20btsUWa9oOsQjpM4KIT9Cx4JmcYgmk2LAmIQJ4w0R4zGsz7vw-H69m8vZckG9AqFUWB0H2r800h9AgYACg+XCAEpdmU5bmeR1mKI5xR0FxoLmnFvQRL8MxqRJAYr3Qh77AmMr7GeT42WeIJGZhsA+dSDM5q4fAoCgTbxsmsgMfmxaZZIW37cd53Xc29HMf2q5DvYoziurATNQcMmbDGAZGzQkZ4LOuU2W8AYOXrVKlPS-27bTB3YCdl23YBoGQZnMGIfQaGZzhhHiADsug6r0OdqxyOcejj1ApKjxDE+XwnyMHp-EeLRVTGPRtA5XDbC6eDORt0uYa7kPRroRQPcUKbvYW+G-fbred+rqB97D3aI6UKPDKH2P92sRYHiVZ4OQu-oKVVZO9w6pmGCIsKUIRIRdXPh3beFdg7X33oDYGoNwZQ1hmfYuF8+awMrrvG+ig7590fgPZ+u41aSgpH6BUgwWR1XaKJdCWo9B+HmKwhsJJohQMwW7LAqAABG8DNqIImkfL2s1T5tx4Zgfhgi94EN7g-RQT8KzD2rG1LCwgtA0PCMbcE4YdCwWWG1fotgSSPHBIXSRchpECO7nIpBdcG5oJbhgocxApEyLsfgwhijlEcVUfuMEWgDCVXBNYZ43Y56GyimSBwwIFigiCJ0Sx0C0yKFQGmXAsj8GH2PuI32mDt7pMydk2+CjsaiFViPGsAQqYhCMJhKU4R9GdF8AGPooIATUisDbNJGSsleMQbXFBjdm6t1ScUgZeCyneyIUokhKjX6mTmBJdoCxHiaN0How2IJ7hmEkvGRkfQ7CMzTJIcGYBSkHxEXkn2rjjRnIuVcnxFSqnVgWOVZk3haY6wsJyVUSwNRE1bFYewIIdCnPOZQK5DiRnOPGZgx50LBnyNmb4hZ-ilnBV7FhSIKcLrMi0cyA2Iw+h6B-pydZlI4yQouTCd2+xDjHBdMgLIHBcgsHNOaHSuQ3n7jaIvTkgZ7C4VMK8ABvZHJPCirqHFcxDCM08izNmSsuZ8tMocqmiFGzjA+NJDQDVZL-BYXhUwVhLAxEUooT88AagI0WcdUy7gwT3FCpnaewRLDXjlLi5kHItSXn8JwtKbj4QOrxkSTowSRItQ+AGNkYJwyBAmIEESyp-XSS1MGouoaUhmnDeQlo5JP6xt1N-RNhtkKa2COCAI2cPhGEZvCYgWZIbWiBqQSGpBIAFuqe4EE2EORKmCA4QBnRwxVoeMEMepgQjXXaIq76YBe3VncFqe468LZIRQpEa8CoHjEuQjWrR-hF1IyZr+CAK79ytCVP8WwbR7BPCWM0w21gFh+naYMaVAQZhnrlmza9pluSwQMQYnONkzHXi6VTP1coAS01kicrhbilXy3zZix1wUTFaqMLoWm3Iuh2GvF4WCM9NHJ0eB0xMKG3xLrZsQda-0oBAeCiyYJ3SjFmBEqyMS3YLI00GF4NqyGQ10fPRpRWnNWPNGCD4bs0pOTUnwueWKA6cJfIsNdZUjN4GQH3jJxA4LJhxPA7YVeE7jAmdrHW7QWtN6BzgV4wzB52hTppuCTRLI2R3SM2VRy7xcJtSSe8R4Dm0w4KuS5jkGpGyUiSfYOddl0LwXKt2cWwWli006mJlMHjbHTK4mQ6pLJyUggusqTjPR57+dsJyMYicehdl6ZMqLmGI1Gf4+Yp47xkJ1SMOGcIGotHhAcBYB93JaXIsK9FrocF6ycg5AGDsBr0IzvOmTfw9hrD1im2Aelo0XOyXKrqcW5mtTxmWAC0wVMIpfwMfWF8lqgA */
  initial: "idle",

  context: {
    resendOTPReminds: 0
  },

  states: {
    idle: {
      on: {
        GITHUB_LOGIN: {
          target: "githubLoggingIn",
          reenter: true
        },

        METAMASK_LOGIN_AUTH: "metaMaskLogging",

        APPLE_LOGIN: {
          target: "appleAuthing",
          reenter: true
        },

        EMAIL_TYPING: {
          target: "idle",
          actions: assign({
            email: (ctx) => ctx.event.email
          })
        }
      },

      states: {
        idle: {
          on: {
            CF_VERIFIED: {
              target: "cfVerified",
              actions: assign({
                turnstileToken: (ctx) => ctx.event.turnstileToken
              }),
              reenter: true
            }
          }
        },

        cfVerified: {}
      },

      initial: "idle",

      always: {
        target: "Passcode",
        reenter: true,
        guard: "isEmailValid"
      }
    },

    Passcode: {
      states: {
        Password: {
          on: {
            CHANGE_TO_OTP: "OTP",
            PWD_TYPING: {
              target: 'Password',
              actions: assign({ password: (ctx) => ctx.event.pwd })
            }
          }
        },

        OTP: {
          on: {
            CHANGE_TO_PASSWORD: {
              target: "Password",
              reenter: true
            }
          },
          states: {
            idle: {
              on: {
                RESEND: {
                  target: "sending",
                  guard: "onlyOnOTPTimeReset",
                  reenter: true
                },
                SEND: {
                  target: "sending",
                  reenter: true
                },
                OTP_TYPING: {
                  target: 'idle',
                  actions: assign({ otp: (ctx) => ctx.event.otp })
                }
              }
            },

            sending: {
              invoke: {
                src: "doSendOTP",
                input: (ctx) => {
                  return {
                    email: ctx.context.email,
                    turnstileToken: ctx.context.turnstileToken
                  }
                },
                onDone: {
                  target: "OTPSent",
                  actions: assign({ resendOTPReminds: (ctx) => 60 }),
                  reenter: true
                },
                onError: {
                  target: "idle",
                  reenter: true
                }
              },
            },

            OTPSent: {
              always: {
                target: "idle",
                reenter: true,
                guard: "onlyTimeReset"
              },

              after: {
                "1000": {
                  target: "OTPSent",
                  actions: assign({ resendOTPReminds: (ctx) => ctx.context.resendOTPReminds - 1 })
                }
              }
            }
          },
          initial: "idle"
        }
      },

      initial: "Password",

      on: {
        MANUAL_LOGIN: {
          target: "manualLoggingIn",
          guard: "manualLoginDataValid"
        }
      }
    },

    LoggedIn: {
      invoke: {
        src: "setLocalState"
      }
    },

    metaMaskLogging: {
      invoke: {
        src: "connectWeb3Wallet",
        onDone: {
          target: "metamaskLoggingIn",
          actions: assign({ metamaskData: ({ event }) => event.output }),
          reenter: true
        },
        onError: {
          target: "idle",
        }
      }
    },

    metamaskLoggingIn: {
      invoke: {
        src: "doMetamaskLogin",
        input: (ctx) => {
          return { data: ctx.context.metamaskData }
        },
        onDone: {
          target: "LoggedIn",
          actions: {
            type: 'onAuthSuccess',
            params({ context, event }) {
              return { data: event.output }
            },
          },
        },
        onError: {
          target: "idle",
        }
      }
    },

    githubLoggingIn: {
      invoke: {
        src: "doGithubLogin",
        onDone: {
          target: "LoggedIn",
          // actions: {
          //   type: 'onAuthSuccess',
          //   params({ context, event }) {
          //     return { data: event.output }
          //   },
          // },
        },
        onError: {
          target: "idle",
        }
      },
    },

    manualLoggingIn: {
      invoke: {
        src: "doManualLogin",
        input: (ctx) => {
          return {
            email: ctx.context.email,
            password: ctx.context.password,
            otp: ctx.context.otp,
            turnstileToken: ctx.context.turnstileToken,
          }
        },
        onDone: {
          target: "LoggedIn",
          actions: {
            type: 'onAuthSuccess',
            params({ context, event }) {
              return { data: event.output }
            },
          },
          reenter: true
        },
        onError: {
          target: "Passcode",
        }
      }
    },

    appleLoggingIn: {
      invoke: {
        src: "doAppleLogin",
        input: (ctx) => {
          return {
            data: ctx.context.appleData
          }
        },
        onDone: {
          target: "LoggedIn",
          actions: {
            type: 'onAuthSuccess',
            params({ context, event }) {
              return { data: event.output }
            },
          },
        },
        onError: {
          target: "idle",
        }
      }
    },

    appleAuthing: {
      on: {
        APPLE_DATA_SUCCESS: {
          target: "appleLoggingIn",
          actions: {
            type: 'appleDataSuccess',
            params({ event }) {
              return { data: event.data }
            },
          },
          reenter: true
        }
      }
    }
  },
  id: "AuthFlow"
})

export type AuthMachine = SnapshotFrom<typeof authMachine>
export type AuthEvents = EventFromLogic<typeof authMachine>
export default authMachine
