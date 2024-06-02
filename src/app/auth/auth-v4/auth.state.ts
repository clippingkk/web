import { EventFromLogic, SnapshotFrom, assign, createMachine, fromPromise, setup } from "xstate";
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
  },
  errorMessages?: string
}

type Event =
  | { type: 'EMAIL_CONFIRMED', email: string }
  | { type: 'CF_VERIFIED', turnstileToken: string }
  | { type: 'APPLE_DATA_SUCCESS', data: Required<Context>['appleData'] }
  // | { type: 'METAMASK_LOGIN', data: Required<Context>['metamaskData'] }
  | { type: 'OTP_TYPING', otp: string }
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
    connectWeb3Wallet: fromPromise(async (_: { input: unknown }): Promise<Required<Context>['metamaskData']> => {
      throw new Error('not implemented')
    })
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
    coolingOTP: (ctx) => {
      console.log('coolingOTP', ctx)
      return assign({ resendOTPReminds: ctx.context.resendOTPReminds - 1 })
    },
    onCFVerified: (_, params: { turnstileToken: string }) => assign({ turnstileToken: params.turnstileToken }),
    appleDataSuccess: (_, params: { data: Required<Context>['appleData'] }) => assign({ appleData: params.data }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgMQDYHsB3AOgEsJcwBiAcQEkAVACQFUAhAfQBkB5egOQDaABgC6iUAAd8sUulL4AdhJAAPRACYAnABZiAZg0aArAHYdANi3Gdw-foA0IAJ6IAtBdPEAHKfs2ARlNTMw1vbwBfCKc0LDwiMgpqAFEAWWQ6Lg4AYR5+bDoAJVTkgBERcSQQaVl5JRV1BDcArX1iLQtjYWtjbxbvTydXJvM9YQ0LbRaLfQCA7qiYjBwCEnJKKhKGZHSAZQBpbj46fg5kFmYKlRq5BWUqxrdtY2INS3mLAYtbWaHEAI0bU+xg0pmEISshmEOkWIFiKwS62oyAACiiuMkjgIrlUbnV7qBGgF9HpvCZjMYAr5jJDoX8EAEdN5XhZ5nYNHYaWDTLD4fE1klEhtstgOAA1ZKFOgFMo4qQyW71B7uIIaYjCTo6HqdLreHSOFzufTg9XdSl2AFk4SRaJw5b84gogCGsFgAGN8BBqOl+CxkFleNixNcFfiGog+m0TJ99FZgZYDcM3H4AsRjFpgpTdN5dPpefbVo6Xe7PWAi67CPgAE4QKjZJjIfg0TEMHgcHgMFFy6qhu7hppzYTtFo6LqmKnfMEWenNUEvYQAqn2exk3T5uKF52uj1e4gdlF1htNlttlHIXa7ADqPEK5WDuN7SsJKv0zIprJj2kmHWnhoHALaUwNDmcJvH0GkdHMdcERILcS13fchWoQpkl2ZJ+DvSp5VqPtlQQUEhxBEFR1fMwui0Gc5kBYggJA8JwMnGFbT5Tdix3MtEKRKg0Iw7s8Vw58EBmQCKXHLRoXBexTEo8l1SMOxX18L8mKWDcEjg9i907JCqH3DgGAATRRE4aD4x8CTURB7D0IDhC5PptGCaxKMsPQtACLlTE8cduh5ZiC3UtjSy0lFiFgMBFAgUhFCgKgICUMtooAN3wABrMsWMC7dgsQ8LIuiqAEGS-A3SdfEKjMnCn0shA9QsGjjV6CwF06cdpL-ZpVTkrzxgGIxwOgh0NJy7T912CL0CoVRYHQMqyydAAzdAwCrAAKNlhAASioTLYKChDRs7cbFHQSrFQsxo+i8QE7KA8IbHCDQXIGAwtCMdMrD1UE838tSSAAWzAWbUhdVKuHwKAoAKuKErIRQUvS4hduIQHgdB8HIYKor4ZKsq7gq+9sPO-svx8bRxP0XQqOeelX2u6E-H1AE7BmYxBsLVGnRB2AwYhqGYqoFaq2rYhJFwMqFurf6kYCgGga59G+ax4rSvKsQzrDPCPHGYhhLA5rJhzUxvHpAEXipYxjQXHRLDA192YSTn-sVzGYroRQYcURKccR5GnZd-moHd7GUtV-H1cJnsqou-4FPaVp5mCa0bGNmcORecDR1sww6qMB2SChrBUAAIwxwP3c972EYy2XiELzAS7Lgrg5VvGlAJrCo+JvCZj0G7em6AEtDAk2OvTgwbFCdlc-zlGnUUVAnVwJu3Y9+Kvbh6uZb+ueF6Xleg8UEPcbV0QNYEmqBi8CxvxCY2dA5UcZ31NpwT18FiW6Abfpg4gnUkMWYAD4V3XlXNKNcd7-0AcAo+rdT7n2qpdHQqYwhvQ8nqcwLM052QnlnDkOdLAaFnlAyg8JoaonRJiUoyBtgcF2CwbI2RUK7AQTHBANgtDEAfiCMEWhdAZi8qbEwrw9Q2zsN4GkJhDBRFtIoUs8Aqi7RDNHfsHgui6xXLGDUqDU4dSCEyHwaDJzmDelYWeSJlHd0Ek8AxHRPLzBsKOToz8wJcJzGYUcWoJELjZj-B0SIkKWM1tYjkQ47HeQcTbGkxgZyUxeMPaw98gLIJZuYwUboFpihWqQBapBIBBIvo8XwxAPKxmNm9cw8w3ixOsO0HMBsWjzACFYXxqlf7DS9AUxBRoPJpkZNoB+5gOSfEojfVMlNgIdGQc1VoNo2lDX2mWOClYaxdLYU8TwfSH66FBA-DUo8kxzFaOqGwzV9CjD1OCWeHSOKdjWSTIwaYTBvEthIkI3RKJmDaDmIwYRboTA1NcxZIVAkPhUT3ZBXDATAhaEYQhlF7BqlQdaZBGYb7GyBdlA6oU8pRRivcvC6ZmTAW8AzYkHRdCUSCIRMIwEFLnKApi+CtzQpjQmgSwSOZUzcmJGSOYJIBgyWKdS0p5yWp+FnmXSA7sOWX06DRM0Vtk7Gyeh1HOULDaiQXFJWenNua81dlAWVjxtDMlsJMEkltjYzHasMc5nDSUdAtuYVk4kVJ2h3v7HmMDjURmJBPZplTPjaNtVZGYCrbC+GtMBMwWhZ710bkrVevqhIchooyYedtmoYJnO5AwjMHF8PHCuXV89F7LyTYfFNEi9CMhMQudBFoZy9DVB5CCYEPKf3dcjEhQDK0yrBVYy+oIaJ+Hsoi9yqrhgAhsjMywxt+k6mIQA0hywCopvAmqTwrNhALlaKCQVf5GTErncEG+4FXxMSiEAA */
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

                OTP_TYPING: "idle"
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
                  actions: "coolingOTP"
                }
              }
            },
          },
          initial: "idle"
        },
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

export type AuthMachine = SnapshotFrom<typeof authMachine>
export type AuthEvents = EventFromLogic<typeof authMachine>
export default authMachine
