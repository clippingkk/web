import { assign, createMachine, fromPromise, setup } from "xstate";
import { AppleAuthResponse } from "../../../services/apple";

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
}

type Event =
  | { type: 'EMAIL_CONFIRMED', email: string }
  | { type: 'CF_VERIFIED', turnstileToken: string }
  | { type: 'APPLE_DATA_SUCCESS', data: Required<Context>['appleData'] }
  | { type: 'METAMASK_LOGIN', data: Required<Context>['metamaskData'] }
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
    doMetamaskLogin: fromPromise(async (_: { input: { data: Context['metamaskData'] } }): Promise<any> => {
      throw new Error('not implemented')
    }),
    doManualLogin: fromPromise(async (ctx) => {
      throw new Error('not implemented')
    }),
    doAppleLogin: fromPromise(async (_: { input: { data: Context['appleData'] } }): Promise<any> => {
      throw new Error('not implemented')
    }),
  },
  guards: {
    onlyOnOTPTimeReset: (ctx) => ctx.context.resendOTPReminds === 0,
    onlyTimeReset: (ctx) => ctx.context.resendOTPReminds === 0,
    // TODO: implement it
    onDataValidated: () => true,
    validatedOnly: (ctx) => true
  },
  actions: {
    emailConfirmed: (ctx, params: { email: string }) => assign({ email: params.email }),
    coolingOTP: (ctx) => assign({ resendOTPReminds: ctx.context.resendOTPReminds - 1 }),
    onCFVerified: (_, params: { turnstileToken: string }) => assign({ turnstileToken: params.turnstileToken }),
    appleDataSuccess: (_, params: { data: Required<Context>['appleData'] }) => assign({ appleData: params.data }),
    metamaskDataSuccess: (_, params: { data: Required<Context>['metamaskData'] }) => params.data
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgMQDYHsB3AOgEsJcwBiAcQEkAVACQFUAhAfQBkB5egOQDaABgC6iUAAd8sUulL4AdhJAAPRACYAnABZiAZg0aArAHYdANi3Gdw-foA0IAJ6IAtBdPEAHKfs2ARlNTMw1vbwBfCKc0LDwiMgpqAFEAWWQ6Lg4AYR5+bDoAJVTkgBERcSQQaVl5JRV1BDcNUwDiC2EA42M7Tp1unSdXJuMtfWIgixMLCx19by0LfSiYjBwCEnJKKhKGZHSAZQBpbj46fg5kFmYKlRq5BWUqxubrYg1LYW8AgLtbb2MQ3cxmIphMYP0rSWOlsFhWIFi6wSW2oyAACmiuMlTgJblV7nUnqBGgF9HpvCZugFfMYrPphIMXIgAjpvO8LL87Bo7LTTMJTPDEfFNklEttstgOAA1ZKFOgFMp4qQyB71Z7ual6flLbz6Ty6nQBIxAppGLQ+fQ-GyLQJ6wVrYXENEAQ1gsAAxvgINR0vwWMgsrxcWI7irCQ1EN9xtNdVYLADLI4mU0-G1RsFjAFdAs5va4hsna6PV6wIW3YR8AAnCBUbJMZD8GjYhg8Dg8BhopXVMOPCOmgHEMz8imeWxzHSmE1ubxTAzCYzhBYM+waOHRBEOgsut2e73EdtoqiFZIHZL8coh-E9tXExCz3W636tTMc3xT0wz9o2D4-PwLgJ5kiJDbsWe4HlQp7nl2BK9uqCBdOM8xaD8WjIT0E4BBYU4zhoc4LuEWjLoYa6rPmCQgbupbgXWDZNhwLYcGiyAHAcADqPCFBelTKrUsG3k09LCKCVjWMOwh9O+n4WN+hpBPo-6AY6FElvuHYHGAijoFQqiwOgzroKWzoAGYGZWAAUnLCAAlFQQpbkWlGqWi6madB15EmoGr9AY3gThomEmKumaMsMbg-F0EydLMXzfEsC6KfZO4qZBpTnDQVAQEopakIoABu+AANalnZ5EOclZ6pY2CA5fl7r6Y8FRubxN6eQgq5tK05jhLCSahZyIK6F0wgtB+WhhAK64lSQAC2YB6akroFVw+BQFAOVQDsyR7IcJxBucTWqh5jRhEJ3h-GCWYPi0IWIHqehGCEgU6Mh44JQks3zYty2retxCEM6uCUOg2RKIoYDuvIigbaxAZYgwOR5PwyTZAwiqXjxh19m4kIgrF2p+KNwS9ZohE+DOqEmCOHI6G9M1zc6C2wEtK1rVDxCyFAijrRBdA0EjXGhs1R3uIY4xGgCaGrnMxgaCaMvjMNpLCDMWh8uEtPEB9DNfSzv3-YDc0g4oYMQ5APN8wd4ZwdjpITLY9IPcY9j2DdCCGl4MtWK0czaMIqEa1r006z9UN0IoGVZWQeWFcVm7vfTQdM99rNQGH1XR3VhKNej3ZC32vz2MQqGWvyas2B+U7ciC8n9GCXK+VMGga2tWCoAARsn61hxHYNR-lRXEFNxAt5g7ed6Hijp7V9VKNn3G55jcHQu89ILn7RpaA+lfzgYNihPXlhN5Ncczc6iioAD4+p+HmW9zVMeDyfmtnxfuBX2n9+Zw1YiW3xrUzl4GY2gQgfh0NyfoU45gK1MEseY-IlZjGMBrZ0khJCUHfjfSO98B5DxQWgsAGCp74C-rPH+OcYItUaL5NoYQxpdF8uYOwWFkzNB3jXfehgG5H1IkBYgeDKCIm5uiTE2JSjID2BwA4LBsjZBPAcX+lDEDWmIGAmWfJULPWCMw4YRoQRhBhPbAEUwnZH3XIoEs8AqhTUFovfibgnYDWpAaIwHwKSyxYRvISvwuh72esFCaPDHQohsVbOxq4hKq2ktJfyFJQGuzcLCAwPxVyWhZDAjQkINYojFGAEJf8Xj+VwpE2kMtqQtF8vEy0bJvhGgybo8SlokHHzIiKSgxB3RGSlGASspAjKkEgHkxRTRUITFmLyBkw05h2CnFUnwySei+T1H7cwGtlLekGcLJorIvDIXCGSFxrIMlTiNMNdoUUnZdHKQCVZZU9wgQrNWDZWM5jml2c4owhziZNF8EU-QY1IS+AZETG5SUwIdiedbKwEwcz9GsJ4XQ9hsKzlXouQiUDVwgtAlRNSGl0AQv4toNoo5PgZN8oS45ftxjGN+Dafo3VMWORSmlfFrUWgWGIF8CZJiuhK0nCwtFwkQj8lpL4VWNNmm8OTpAMOLKqHSVBH7J24kvhmApDMsIKjVxhG6HyUkmSJWOi1ozZmIcoCyvcGA8YeMYEEwWETE03JELkzAYRM6dISIbhaZremxqr5-QBkDI2JtIZmqvHna2er2h-KMGMjkkJLAOtJuEKwVJTBjSMAHH1wcU7s1IJzda5rhnstXN8dClpfZfLmIAsl2h5gshmPqwJBYjXZt+hzMGEBC1uF0O8EwPifkZO0O44Y8sOX+TJIacSajxVNvjp9JOus2b60DaDcGBlO1htsa1MKlpBwmMYZYTeZgvl6hBJyTCsxkL2A-B6oegdW0T0LWde6IQFilNJNSAIJo9TjD5P8NW-kzBaGbnIUeHdF3X0LVMIS3tN66iWQwqcyEDB+EnaMVWerIgGubS-S+EGZWbtCf-W2BEXE2GVvYLQU4zDso3jLTMqYAQAWwwkfhBD8MeQoZs2JoI-z6hXMhYdzIPjCT9pYD8LIgpNNnSQNjgioaFvkrhTwcVxJZkMDek0LI2ThN0FouK8xxVRCAA */
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

        EMAIL_CONFIRMED: {
          target: "Passcode",
          actions: {
            type: "emailConfirmed",
            params({ event }) {
              return { email: event.email }
            },
          }
        },

        METAMASK_LOGIN_AUTH: "metaMaskLogging",

        APPLE_LOGIN: {
          target: "appleAuthing",
          reenter: true
        }
      },

      states: {
        idle: {
          on: {
            CF_VERIFIED: {
              target: "cfVerified",
              actions: {
                type: "onCFVerified",
                params({ event }) {
                  return { turnstileToken: event.turnstileToken }
                },
              },

              reenter: true
            }
          }
        },

        cfVerified: {}
      },

      initial: "idle"
    },

    Passcode: {
      states: {
        Password: {
          on: {
            CHANGE_TO_OTP: "OTP"
          }
        },

        OTP: {
          on: {
            RESEND: {
              target: "SENDING",
              guard: "onlyOnOTPTimeReset",
              reenter: true
            },

            SEND: {
              target: "SENDING",
              reenter: true
            },

            CHANGE_TO_PASSWORD: {
              target: "Password",
              reenter: true
            }
          }
        },

        OTPSent: {
          after: {
            "1000": {
              target: "OTP",
              reenter: true,
              guard: "onlyTimeReset",
              actions: "coolingOTP"
            }
          }
        },

        SENDING: {
          invoke: {
            src: "doSendOTP",
            input: (ctx) => {
              return {
                email: ctx.context.email,
              }
            },
            onDone: {
              target: "OTPSent",
              reenter: true
            }
          }
        }
      },

      initial: "Password",

      on: {
        MANUAL_LOGIN: {
          target: "manualLoggingIn",
          guard: "onDataValidated"
        }
      }
    },

    LoggedIn: {},

    metaMaskLogging: {
      states: {
        walletConnecting: {
          on: {
            WALLET_CONNECTED: "walletConnected"
          }
        },

        signing: {
          on: {
            SIGNED: "signed"
          }
        },

        signed: {},

        walletConnected: {
          on: {
            SIGN: {
              target: "signing",
              reenter: true
            }
          }
        }
      },

      initial: "walletConnecting",

      on: {
        METAMASK_LOGIN: {
          target: "metamaskLoggingIn",
          reenter: true,
          guard: "validatedOnly",
          actions: {
            type: "metamaskDataSuccess",
            params({ context, event }) {
              return { data: event.data }
            },
          }
        }
      }
    },

    metamaskLoggingIn: {
      invoke: {
        src: "doMetamaskLogin",
        input: (ctx) => {
          return { data: ctx.context.metamaskData }
        },
        onDone: 'LoggedIn'
      }
    },

    githubLoggingIn: {
      invoke: {
        src: "doGithubLogin",
        onDone: {
          target: "LoggedIn",
          reenter: true
        },
      },
    },

    manualLoggingIn: {
      invoke: {
        src: "doManualLogin",
        onDone: {
          target: "LoggedIn",
          reenter: true
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
        onDone: 'LoggedIn'
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

export default authMachine
