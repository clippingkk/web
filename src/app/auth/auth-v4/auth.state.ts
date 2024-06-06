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
      // console.log(parsed.error?.errors, parsed.success)
      return parsed.success
    },
    validatedOnly: (ctx) => true
  },
  actions: {
    onAuthSuccess: (_, params: { data?: AuthLoginResponseFragment }) => assign({ authData: params.data }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgMQDYHsB3AOgEsJcwBiAcQEkAVACQFUAhAfQBkB5egOQDaABgC6iUAAd8sUulL4AdhJAAPRAEYAHAFZiAZgBsRwxv0B2LRo0AWAEzmANCACeiALT79G4obtabLQBOMw1DAJt9AF8o5zQsPCIyCmoAWQBRBmRU5ABlAGluPjp+DmQWZhFxJBBpWXklFXUEdzsgvTsbU2Fww0MbYW9nNwQNO31fXQdhcx1DIP07YRsYuIwcAhJySipkAAU9rnSigSqVOrkFZRrmr2FiIPMbLp0rYQ1hNqdXTS9iHR02n6WnMhh0s1sqxA8Q2SW21HSOToXA4DAAmnsSjQzjULg1rqBmu4dINiEthEFlnYPgMHMMPEYJhodEEbHMdPoAnYHFCYYktikqDipDJLo0bh4NOYfDNzNzjKzDOZGfSWnKggYbJYZsJXu85rz1vzkpQTdQAMLYDgANXSACU6Ng6OkACLC2qi-FNSVy4g9HQ2drskkBfSqzwzP0UwGDMZaJZaQ0JTbEPYAQ1gsAAxvgIGlkPwWMgUbxTmJzp6rt6EFYJnY5kEQrNBoMbOGQT5jOZo3Y-F0vEnYSR05mc3nUxnYIR8AAnCBUc1MAs0Y4MHgcHgMPbuvFViUtaz3EKsknSrT9buGcNjWZ+sbaLxeeOswfGkfZ3NgCeZ6dzqh7AB1F1UQxLEd0rcVCQ8ew7GILQ7k6bt9EpZYwx+A9-HMYgpWEGYzBeD5zFfFN3zHL9Nz2Bcl34FdUXXPY8lyACeDtN1y1xCCCTUSVOX+OYwngto-CCPprzGCY5WsLRpP0OYtRWWJoSNEjJzI4gKLNKg7XSXJ0n4NjqhFeo9yghBpn+etOg5XRmyCMTxmISTtBkuSnmIpJSM-dSt003T9PA4zIO4hBjAkgFpUpAZlQsa96z0T4lifEEhIUtZkw81SvI0+EqAokDMRogKxS4259BsRyljmSwxkecx2mvLpypCKrQXMaUKSIxS+RU0csp82AwEUCBSEUKAqAgJQvxGgA3fAAGsv26jLevHDSBqGkaoAQGb8CzNN8SqIqvX3CIHl7cIumELRcLs9D3GsPxfAGYxnmpTkpXc4dMtW-rBuG0aqDAGcZ1nYhJFwfaADNZwAW2IJavpW8jfo20btsUWa9oOsQjpM4LlXuQEAh0bl9WCWKOQs6kPnGZCLETLrlOWj8fr2by9lyQb0HGyayAx+bFqZxGWeRtmKM5xR0HRzH9quQ72KM4rqza2D-BSmxrFZIItAaymZmCJ5XgDYxPu-EX2fZiXuYYOhzXyXGguaTWtCjXUwkMQZOUia9kPuRYT2pcJBMMU3PNZy2uaFBWPUCkrEHjcqrGsfQrvmZlrz8PRpLi6UPfBSxTZhsB0DTVIMzmrh8CgKBNp5xQpv5hb4aF4gi5LsvYArqua7RnasblnHo93R3NHCTUHG1jXOgpBZVXgwwKrZbwBg5etUqU9KSDb0vy8r6va6BkGZzBiH0Ghmc4YR1vi53zu957ra+9lpR5cMmOlf3dwPdg0L556fxHg63QmMPQ2gOS4VsF0eCnJC43xhrvbum06CKDrg3WaTcr7b3gXfRBo1kHS12s-RQr8Kyx2rMnWCIknhLxTv0CkqoNb3DqmYYIiwpQhEhIzTe18S7YK7vvPBKDD6g3BlDWGzduFYIQQIqA+Cn7Y1EA7OOB4KR+gVIMFkdV2iiXQlqPQfh5iGIbCSaIXChzEBrlgVAAAje+SCUETXrnzdBgtuGWMwDYuxgiCH9xfoPN+w9lFtSwldDRF1xjgnDCTP0WpQQazZB1cE68r7uM8bg2RQjgYiNPufS+LdUm2PSXI-mvjiH+NIR-UyYIXaLF1OCawzxuxAJGO4KKZIHDAgWKCIInRkkt3gYoVAaZcBeIyag5xAsJHmIGUMkZRTFA+KISQjiZCToBGIIGMwfgOygmaR4Em5UwRdCVGCEm2gNCFzTIM4ZozkGAyycfURZ9xGYKubM25Cz5ED0UUPTi1Y5gSXaAsR4V1dCRLuiCe4ZhJLxkZH0Owps0ySHBmAD54ydoYJbkilFHzFkKKUdWBY5VmTeA0CERYFhOSqiWBqemrYrD2BBDoRFyLKBouEY8nJLysWstRfMvF3yCX7l7FhSIYxIhk31FedCfQ9AcifMCykcYWUophLXfYhxjgumQFkDguQWDmnNDpXIQrTJtFAV7Vk5JTCvAYb2Ry1CdQkyVHMEOUJFCfngDUBGFTjqmS-iSXwT4jD-wNnsg80kanxhZM8eMoLTFpXMfCX1eMiSdBdiJFqHwAxsjBOGQIExAgiQfAhQMbrE3GnhGaFNI8WjkgeGCJU7Uc3snDMhPQ2t2iWC1J0D4RhTZVqzJDa0QNSCQ1IJAGtyj3AgmwhyJUwQHCMM6G29oDxgge1MCEd48xmVmLfN9MAU7qytO7HBUtSEULezutoXCcFo1xo1q8QIodD1m1-BAY9n8RX-FsG0ewTwljhDEgsP0xtBjUICDMV9SN2ZfrNdyCyBzrLghJLdFpUozAGGjYY94V0zAwfNtlFI8Hgr9B8PYIwugyXci6HYH2iwyTBCuhrR4fQC77p6kRlG-0oCkeaCyF21JrpajMCJVkYkz0k3jH2rwKtCNqQ0uLLm-HNCfD9u8HpWoyrSlsLFWd8wyrhHaFKJUCaN7mPvpAZBqmay3nCB0g5thIFtuMJMfwLDRMbvLRZ4028O78IfrZ+6a7tYyfBFdGN4KRjwXKt2D4soemac6hWlMUicEyJsysypwUOQakbJSLTbQPjofjmVRyeHEtLDJSl3zKYCkfNsyyOVIIU7KmE7haVIx8LYUiFYbkdUehdkudcuZmWuKBOrJCh4swnjvGQnVIw4ZjNwR6PGZU0oYIIs40kbFbL5lNa6HBesnIOQBg7BoVUm7HLIXjFyaw9YVWUDVaNWzslypuwgfEywSw2zoV7BRiKSo2TchjTEGIQA */
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
          actions: assign({ appleData: (ctx) => ctx.event.data }),
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
