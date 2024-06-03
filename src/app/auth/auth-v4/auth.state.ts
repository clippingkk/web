import { EventFromLogic, SnapshotFrom, assign, fromPromise, setup } from "xstate"
import { AppleAuthResponse } from "../../../services/apple"
import { AuthV4ManualAuthSchema } from "./schema"
import { AuthLoginResponseFragment, AuthResponse } from "../../../schema/generated"

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
    doGithubLogin: fromPromise(async (ctx) => {
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
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgMQDYHsB3AOgEsJcwBiAcQEkAVACQFUAhAfQBkB5egOQDaABgC6iUAAd8sUulL4AdhJAAPRAEYAHAFZiAZgBsRwxv0B2LRo0AWAEzmANCACeiALT79G4obtabLQBOMw1DAJt9AF8o5zQsPCIyCmoAWQBRBmRU5ABlAGluPjp+DmQWZhFxJBBpWXklFXUEdzsgvTsbU2Fww0MbYW9nNwQNO31fXQdhcx1DIP07YRsYuIwcAhJySipkAAU9rnSigSqVOrkFZRrmr2FiIPMbLp0rYQ1hNqdXTS9iHR02n6WnMhh0s1sqxA8Q2SW21HSOToXA4DAAmnsSjQzjULg1rqBmu4dINiEthEFlnYPgMHMMPEYJhodEEbHMdPoAnYHFCYYktilkjsAMLYDgANXSACU6Ng6OkACI4qQyS6NG4eDTmOzEHo6GztdkkgL6ektfQzXUUwGDMZaJZaXnrfnEPYAQ1gsAAxvgIGlkPwWMgUbxTmJzqr8U1EFYJnY5lojEFwvrjGb3OZvP9HhDWcFIk6EptXR7vb6wCXPYR8AAnCBUYVMAM0Y4MHgcHgMPbK2qRq7RlrWe4hVkk8xAmzmHrpsazXVjbReLz21mF2Ekd2en1+yuwat1qh7ADqCtRGKxPbx-Y1LXsOsTFs6U-0lOWpp+g-85mIWuEMzMLwfOYa4upuZY7p2ewNk2-Atqi7Z7HkuRHjwUpKuGuJ9uqhKapy-xzGEiZtH4yaGDOYwTNq1haDR+hzJOKyxNCzrFmB24VpBQrUFK6S5Ok-DodUKr1NeOEINM-zxp0HK6LMFLkeMxBUdotH0U8IGsaW7HEJx8JUHxAmXlhBJqIgxiUQC46UgMmYWDO8Z6J8SzLiCxGMWsRZJGx5Y6V2XFUJBZ6YrBRkidhpkIF4NhKUscyWGMObtDOXTRSEcWguY44UsBTF8ppW4+ZxsBgIoECkIoUBUBASgVuVABu+AANYVnlXlaYVfnFaV5VQAg9X4F6br4lUoVqiZzQBIYSkWq8hjvGC47fCM7jWNquoOHN-h+OMOgaW1BUQX5kG5CV6BUKosDoENFZugAZugYA1gAFB8f4AJS7Cx+3gRxR1didijoKNUY3lY37jMI4L+LogT2slWhTS+3IsvMXKZntJAALZgFdqQeo1XD4FAUA9VVNVkIoDXNcQrVYzjbp47ABNEyTFV9ZTA1DVcI0YcJY0DoRBj2OYQQBGMAxBAsZqJlN2pst4AwcvG7nMZ5dO4-jhPE6Tj01rWxCSLgQ23bWmM0196sM5rLM9ezDWDcNYjA6JEXuJtvjLkYPT+I8WhmmMejaByf62F0D6OrlFvENjV2Y9b2sVXQihk4otUc9TtPR-TcdM1rrNQEnduc47ojO+FzTWIsDyGE88sWv08kfjYHxKSEnILNSIvWCrmcx26OfMwnBfJ7r+uG8bpvm2rWex-H+eF-1Dvc07vO9mF42ahSurGJSdGPJLcxkU3c5+PMZ9zO0gwY8QJNYKgABGec9UnKdp1TLVR7fmAP0-ieKEXS8lA8yEmvfmN5MrfmEFoQYCZ7B0SWh4HQOpliZX6LYEkjxwQ90-nIb+j8bZ-yoKPGsBsjboBNjWM2mcv4-wIcPABXMgErxAVecuZlXgGFiuCbuk4oHphsmSDagQFigiCJ0bB0846KFQG6XAv9h6vwpu-Ke65o5umkbI+RC8OaAMUMAiM68Bw0WigaMYfQ-zUk5O+ZakQgi+B6LZDkAcEbXykTIuRdCX7ENIRPShKiXRuM0Z4-+i9GF6OYQYsBYkOQmPsEgg0UDUFH2Wpme42U-B2mTJSII183SSENmALRydqqpyUU1D+088kFKKQwkuZcN4IAWNFZk3gNBt3GJmP2H4lh2IsNA-QgRbBfl2pHSp+TKBFKITWPWJDx7kMnpnKpEzgm1OXqXVerCGl2BrsQSI4sLTMmgcyZJZkwT-CXMEF8lI7S5PGWAGEpN9iHGOAqZAWQOC5BYMKYUvFcj1IHG0QOnIDT2D-KYV4Zp7Cy1rjMSG2zZh9Gvnpf5N4Vrjl1JlbkO8uiZjTB+DMbQhaWFha8d4cwYhMUUOWeANRaaRJBmJN2JIPZWLmn4YIlgZxPC0MQYI1Iwhd1ZIYJFKR6UuyJJ0HlyZ0ofH1GyME-DEy7OCDXOiAzjHo1Gao+EXExVsJaOSauMrIbPHZOmF8ehRbtEsJOToHwjAisoMQL0t1xSPVILdUgkA9UNPcCCH8HIa58qeB8To5r2gPBVT0NpHwwjtGvt5P0PqBzuF4byu4T5BivkiDOPoPgkbchjeOJYEjVGJorGBfcEBk2ovhf8IZrIHCgvCORBYupUyDFrgEGYCb2qHT2DWsS3IdRIPiTJcEGCZzggmHy5kbJMxSQjh5Mtfbfp7F1ZhQxN40G7PGCmNp3Iuh2BnF4HUPsoHN0eH0SwvaDpruIF1MqFVB0RRZDy6k0DJxmCyTYciU5JL2ntV4TFt6fq+XXcdU6L6JohCUv+Tk-L1UnM-P638LSLDzU1cul0edIBJ2gzGE+9pQTxNsKHc1xhJj+DMAEccKrhVaoCfTRmg984EcHBG0WgHwRQJZPO6WAy4OvUymI94jxXHZzns-EymyBwcjsZLbJnQ2gfCCAJ6KU5hMiyWG0nK2Hiw0PwUPfDm6omvoja8VJC7tBgv9oJ2wnIxgOEpH0Cwrj1HuKKexkEw4EXybhdqBBLRXh6ARjZpBnQZj+FudU4J7HUy8vjJyDk+oQTWDNGy6aot-D2GsPGGLlAHnPtMwyiKdFoqQ1emRyc9plhmm2T4L9yYngRb4xSqIQA */
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
                  }
                },
                onDone: {
                  target: "OTPSent",
                  actions: assign({ resendOTPReminds: (ctx) => 60 }),
                  reenter: true
                }
              },
            },
            OTPSent: {
              after: {
                "1000": {
                  target: 'idle',
                  reenter: true,
                  guard: "onlyTimeReset",
                  actions: assign({ resendOTPReminds: (ctx) => ctx.context.resendOTPReminds - 1 })
                }
              }
            },
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
        onDone: 'LoggedIn',
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
          reenter: true
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
        onDone: 'LoggedIn',
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
