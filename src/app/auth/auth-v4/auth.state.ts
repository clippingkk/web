import { EventFromLogic, SnapshotFrom, assign, fromCallback, fromPromise, setup } from "xstate"
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
  | { type: 'TICK' }

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
    setLocalState: fromPromise(async (_: { input: unknown }): Promise<any> => {
      throw new Error('not implemented')
    }),
    tickTimer: fromCallback(({ sendBack }) => {
      const timer = setInterval(() => sendBack({ type: 'TICK' }), 1000)
      return () => clearInterval(timer)
    })
  },
  guards: {
    isEmailValid: (ctx) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(ctx.context.email ?? ''),
    onlyOnOTPTimeReset: (ctx) => ctx.context.resendOTPReminds === 0,
    onlyTimeReset: (ctx) => ctx.context.resendOTPReminds <= 0,
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
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgMQDYHsB3AOgEsJcwBiAcQEkAVACQFUAhAfQBkB5egOQDaABgC6iUAAd8sUulL4AdhJAAPRAEYAHAFZiAZgBsRwxv0B2LRo0AWAEzmANCACeiALT79G4obtabLQBOMw1DAJt9AF8o5zQsPCIyCmoAWQBRBmRU5ABlAGluPjp+DmQWZhFxJBBpWXklFXUEdzsgvTsbU2Fww0MbYW9nNwQNO31fXQdhcx1DIP07YRsYuIwcAhJySipkAAU9rnSigSqVOrkFZRrmr2FiIPMbLp0rYQ1hNqdXTS9iHR02n6WnMhh0s1sqxA8Q2SW21HSOToXA4DAAmnsSjQzjULg1rqBmu4dINiEthEFlnYPgMHMMPEYJhodEEbHMdPoAnYHFCYYktikqDipDJLo0bh4NOYfDNzNzjKzDOZGfSWnKggYbJYZsJXu85rz1vzkpQTdQAMLYDgANXSACU6Ng6OkACLC2qi-FNSVy4g9HQ2drskkBfSqzwzP0UwGDMZaJZaQ0JTbEPYAQ1gsAAxvgIGlkPwWMgUbxTmJzp6rt6EFYJnY5kEQrNBoMbOGQT5jOZo3Y-F0vEnYSR05mc3nUxnYIR8AAnCBUc1MAs0Y4MHgcHgMPbuvFViUtaz3EKsknSrT9buGcNjWZ+sbaLxeeOswfGkfZ3NgCeZ6dzqh7AB1F1UQxLEd0rcVCQ8ew7GILQ7k6bt9EpZYwx+A9-HMYgpWEGYzBeD5zFfFN3zHL9Nz2Bcl34FdUXXPY8lyACeDtN1y1xCCCTUSVOX+OYwngto-CCPprzGCY5WsLRpP0OYtRWWJoSNEjJzI4gKLNKg7XSXJ0n4NjqhFeo9yghBpn+etOg5XRmyCMTxmISTtBkuSnmIpJSM-dSt003T9PA4zIO4hBjAkgFpUpAZlQsa96z0T4lifEEhIUtZkw81SvI0+EqAokDMRogKxS4259BsRyljmSwxkecx2mvLpypCKrQXMaUKSIxS+RU0csp82AwEUCBSEUKAqAgJQvxGgA3fAAGsv26jLevHDSBqGkaoAQGb8CzNN8SqIqvX3AJDEc-RdXPd4wWlb4RncaxfU+UFPnPblZPc4dMtW-rBuG0aqDAGcZ1nYhJFwfaADNZwAW2IJavpW8jfo20btsUWa9oOsQjpM4KIT9Cx4JmcYgmk2LAmIQJ4w0R4zGsz7vw-H69m8vZckG9AhXYoziureMJnsLVG3GD5pI0BrZP+PxDDw0wrEsRnPJZtmOcULmGDoc18lxoLmjFrCRPrC7wg+cI0Pu2xmV8MrtE+UwBJ0RmYbAdA01SDM5q4fAoCgTbxsmsgMfmxblKSF23Y92AvZ9v20Z2rGrkOnmPUCkrNHCTUHDJmwxgGRsLcQeCzrlNlvAGDl61SpT0pICP3c973ff9oGQZnMGIfQaGZzhhHiHrqOY+b+Pg8TpRk8M1O+f3dxZdg0Li56fxHi0VUxj0bQOVw2wungzlnddtMYcb2PNroRQA8UKbg4W+Gw7rw-j+jpu46gc-0cx-ak5xlPdz1zQzCwREk8MuJt86qlzvcOqZhgiLClCESEXV7790fifYeb8L6t1BuDKGsM761xQW7J+Q9X7vwTl-ceP9J5-3TgeCkfoFSDBZHVdool0Jaj0DLESIkGwkmiEgghfssCoAAEYvzPhfCaV8g6zVvn3IRmBRHiNGmQ0eFDFATwrGnasbUsLCC0Ew8I9hZJ3Q8DoWCyw2r9FsCSR44Jq7yLkIosRp8VGYOBtgzu3de7IIUUo1xGCP67XUZoji2j9xgi0AYSq4JrDPG7KvdC7gopkgcMCBYoIgidAccg4+ihUBplwMojBl9r6yNDgQvJBSikBNUZ-bGohda0OkuVQMZg-AdlBIk+65jypgi6EqME5jtAaGdmmfJhTinn0Bh49uOCu54L7lUyZtTFBBLHhoqhWjp6mTmBJdoCxHj6N0OCds3ZsIWGpALYwfQ7CMzTJIcGYApmSMDjtORyCHlPJeeskJWywk7OCgscqzJvC00ARYTkqolgaiJq2Kw9gQROwEUOYgXzKAvJmW3DuuCe74NRei55qzfkNKadWXsWFIh5wusyAxzIrzoT6HoDkT5DmUjjPcx5lAYT+32IcY4LpkBZA4LkFg5pzQ6VyGS-cbQN6ckDPYXCphXgQN7I5EBOpzFKjmIYGIilFCfngDUBG2zjqmVniSG2nIjBL2CJYa8cpKX0siGk1hdyUXGnhKavGRJOhRJ4UqdqAY2RgnDIEQWwQwSslOoEAMjN4Rmm9f-Fo5IHhgkDR8YN7JwzIT0GTdolgtSdA+EYeNKRiBZkhtaIGpBIakEgEm2h7gQTYQ5EqYIDhIGdBze0B4kaejguuu0JW30wCNurMk85e9PhakGChSI14FQPHpQCWshb+FpVRcrL875fwQHHTPCl-xbBtHsE8JY4QxILD9AGWWFhngBBmCOpGbMD2mW5LBcxvTrLglsdeAEsFc46qVGyeJz7mbI1Zl6gFZrgrWKpuMcIgIsmdD8NeLwsFl76Nzo8PoisPU9Qg2zYg61-pQDfcFFkUSrmWLMNwtsSTHr3HMTTQYXg2rus3W+UdxGKJq3QBR5owQfDdmlJyak+FzyxRbThUFFhrrKkZi-SA59BNF1vOENJvSrbPBzcYSY-gYFam0CJXVBHw6H0HsUtTB5e1kxpuCfRLI2SmJrGVRy7xcJtSye8R4B8iFoNIVxGh1YOQakbJSLJ9gQgUlVPBcq3YPiyh87TTqXGUx+Jceg1TMGfWIBZMykEF1lQ0Z6GvdzthORjGzj0LsYyJk1Oy8Fzi-Nzl2KeO8ZCdUjDhnCBqAxmnlTShgpxmuBKuVEqazZ29cFja6FkoEaUEtGU9HOmTfw9hrD1k5U8nlo0bMLZvUlnTlglgMZGL2HwxngFsm5M5vVUQgA */
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

              invoke: {
                src: "tickTimer",
                onDone: {
                  target: "idle",
                  actions: assign({ resendOTPReminds: 60 })
                }
              },

              on: {
                TICK: {
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
