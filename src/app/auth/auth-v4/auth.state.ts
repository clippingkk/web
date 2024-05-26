import { assign, createMachine, fromPromise, setup } from "xstate";

type Context = {
  email?: string
  otp?: string
  password?: string
  turnstileToken?: string
  resendOTPReminds: number
}

type Event =
  | { type: 'EMAIL_CONFIRMED', email: string }
  | { type: 'CF_VERIFIED', turnstileToken: string }
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
  | { type: 'METAMASK_LOGIN' }
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
    doMetamaskLogin: fromPromise(async (ctx) => {
      throw new Error('not implemented')
    }),
    doManualLogin: fromPromise(async (ctx) => {
      throw new Error('not implemented')
    }),
    doAppleLogin: fromPromise(async (ctx) => {
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
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgMQDYHsB3AOgEsJcwBiAcQEkAVACQFUAhAfQBkB5egOQDaABgC6iUAAd8sUulL4AdhJAAPRAEYNAJmLb9ADgDsAVgDMBiwDZtVqwBoQAT0QBaDcOIBOL9q3aAFnMAoKMAXzDHNCw8IjIKagBRAFlkOi4OAGEefmw6ACVkxIAREXEkEGlZeSUVdQRXbSMNYithDRMTYTN2oJMAxxcGky8zYg0jGxM7AIsvKzMIqIwcAhJySioihmRUgGUAaW4+On4OZBZmMpUquQVlCvrGrxM9ALaDLW6A4QMTQbcryM2hMwLMzQWIWEViWIGiqziG2oyAACiiuIljgJrhVbjUHqB6joxtpjCYOtMjMYvJ8AQgNBZvCZPi8zGYJlZRotInCVrF1gl4ptMtgOAA1RL5Oh5Eo4qQyO61R5uDQGALEYSTCxmKxUswBHTaOmNbReYiWLT9eb9Bkwnnw-nEFEAQ1gsAAxvgINRUvwWMgMrxsWIbgr8XVEJ8SdNLJyrH93mZjUZ2cQRkZTBovAEDNnucsYmsna6PV6wMW3YR8AAnCBUTJMZD8GiYhg8Dg8BgouWVMP3CMNUmvUGagy2Iw-WYBIzGgw2Yg9ZkGXPCWZmWywh1Fl1uz3e4idlFUfKJPaJfilEO4vtKwmIeeWC2ajoaKyqmfONxUqytfqBLQpsyGibny24lnu5aHlQZ4Xj2eL9sq9LmAuuZaD4HSrhCs7zouy4rmuG72qBcQ7qW+5QQ2TYthwbYcCiyB7HsADqPD5Je5TytUCF3g0PSeJMPhdFSwi9Mmc6-gE-4TGYQEgYWJHgWWB5dnsYCKOgVCqLA6DOug5bOgAZnp1YABQeCJACUVBbgpu5KYeqnqXBN4EmoKpBCh05+FMtjkgMn4NFoHTjO0Vg-Mur4yQYckIiQpEQcQMHFKcNBUBASjlqQigAG74AA1uWNlxYp+5JSlCBZbl7q6fcZTOVxt5uQgtgtM0E7Lj8CzGuZrzZhhTRUr4xgxY6AC2YA6ckrp5Vw+BQFAWVQFsiQ7PsRxBqc9WKq59QgmMCxGL8fjAl0Ql0iEYwhFoBqBNMOjAUR8kkONk3TbN82LcQhDOrglDoJkSiKGA7ryIoS1MQGGIMFkOT8IkmQMLKV6cdtA6uOCryfG0kwpoNGZJgFpqeMunK+MythvgEI1Fi9zpTbAM1zQtYPELIUCKIt0F0DQcPsaGDU7W465jDofxeB0tizCYRoBdLYzCH4PR2F4h3LtTcS0-TjMfSz32-RNAOKEDIOQFzPNbeGiHowy4w-D0+imGybL+UMBpGGmtgqxosxEz46vPRNzqjW9TOLXQihpRlZA5flhXEQHOnBwz73M1A4cVTH1X4nVyO9gLA4eN7egGMI0uvuLxgGN1OjEAEvi+Dm5hZtm4SPbFxALVgqAAEYp2HEfpUD0e5QVxBFR3ciYD3fdg+nlX4FntViBb3FNQsZp19mp2mCXarV7odemoEfzsj4QT+8QweKKgP0z2nA9R-Po-j1fN+4Hfc+ZzVSg5xxeeo4hOc7s7CmlMFSSSq5-gBVcGuDUWoLDPh6KMEwF9nSSEkJQD+D8h5Pzjk9YgaCMFgCwRnKq39FC-35gAnilhdCKwNHOcWmodT71rvXY+Tcz6tx5IoMs8AKhFSoZbHirhzC9VVJYSS+gcz6G6kTEKr4rB-jMH1C+SIhGryeLYTwKslFKL8GOcBLs3CdQXP4BY11JiBDUYKdR1585Wz8LoXR0wy6GLVMY3iqpzT+G0OyEEIl2QoLbo6JExB3QGTFGAaspADKkEgBoxqTwfDjDCpSVcCtZjdGNOyAwPidBdDVDqYQKsqYhLAnZb0iTBYNBzO7Cukj9DHz8XIhWrRQpN2llSP4F94pKVIlWWs1S0azDNA0-UTSZEEyGK4YwziVF+KpIdacKZeklUgl2YZVtOTjFzCEEYlI8zTLcHOXQuFlxeFXGyQiBZ259PIipNS6Atk8VNC0XUIQ2h+LVG87qJT9ogg8NaIIHU1mVPLGVZsLympNB-L8DJ5g-Dkh6B+GZlz1Q4yEjGIwpSL4p0gOHaF9Q5xAhKeYESvxQRjhyaSWutghwjgZOCC+msQ46ygESkxfifHY11OCXM+M6TaG6ChTkklLkl05GyFlgctZ3y+j9P6htjagw5fY6hTV3BslaAsyWd1wTvCFZc80jDOgTF8PoGVr1k6hxZmzDmYNOUNHmHoeMGFZg6EucchAsxgE-NNBYb2dhmXlI1rKtlqdWakHZgk9VwjNXZj0ICzocy-FHzpHLDU9CDQiS6WU25Y1w02vZQq-W-1AbAz0hAJ1WqWidHXBOVcnI-gpjpDqV45lFF1yZd+K1QcI39ydW0M0nR-lBrVJYVFiADRjINK+b23RmhjnzbyfBncp691tffIdwriDNE3tCLGUscnqkPiU-QrIVGgmCQWmmzpr63y3YSuNmjIw2wuU0-o0I2ReGNKCH8nrpbkhTKqckqD0GYKfa5eCST7ymjeBMU05IMLxjpJ6vQMZfgge-WFCIEQgA */
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
        APPLE_LOGIN: "appleLoggingIn"
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
          guard: "validatedOnly"
        }
      }
    },

    metamaskLoggingIn: {
      invoke: {
        src: "doMetamaskLogin",
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
        onDone: 'LoggedIn'
      }
    }
  },

  id: "AuthFlow"
})

export default authMachine
