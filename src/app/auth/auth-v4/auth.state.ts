import { EventFromLogic, SnapshotFrom, assign, fromPromise, setup } from "xstate"
import { AppleAuthResponse } from "../../../services/apple"

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
    doMetamaskLogin: fromPromise(async (_: { input: { data: Context['metamaskData'] } }): Promise<any> => {
      throw new Error('not implemented')
    }),
    doManualLogin: fromPromise(async (_: { input: { email?: string, password?: string, otp?: string } }): Promise<any> => {
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
    manualLoginDataValid: (ctx) => {
      const { email, password, otp } = ctx.context
      console.log('mmmm', email, password, otp, ctx)
      if (!email) {
        return false
      }
      if (!password && !otp) {
        return false
      }
      return true
    },
    validatedOnly: (ctx) => true
  },
  actions: {
    coolingOTP: (ctx) => {
      console.log('coolingOTP', ctx)
      return assign({ resendOTPReminds: ctx.context.resendOTPReminds - 1 })
    },
    appleDataSuccess: (_, params: { data: Required<Context>['appleData'] }) => assign({ appleData: params.data }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgMQDYHsB3AOgEsJcwBiAcQEkAVACQFUAhAfQBkB5egOQDaABgC6iUAAd8sUulL4AdhJAAPRAEYAHAFZiAZgBsRwxv0B2LRo0AWAEzmANCACeiALT79G4obtabLQBOMw1DAJt9AF8o5zQsPCIyCmoAUQBZZDouDgBhHn5sOgAldNSAERFxJBBpWXklFXUEdw0g-WIgwx1hIJ0dKyCtQydXD3MbG2JhOz8Qru8NXpi4jBwCEnJKKjKGZEyAZQBpbj46fg5kFmYqlTq5BWUa5vc7PuI7G1NhcMNDG2E3mcbgQGjsHXCOgcwnMOkM7TswhsKxA8XWSS21GQAAVsVxUqcBLcavcGk9QM0vMJOhMvgMlks3qMQWYOv1tP8tOZurDbCi0YlNilkttctgOAA1VLFOhFCrEqQyB6NZ4eDTmOzTbo2Ppw-rCAL6YEefQw6a9HRLbz+RFaflrQXEbEAQ1gsAAxvgINRMvwWMgcrwiWI7kqyU1EFYOnY4VojF1dF8jWMWuZvMQdEFzLygoFc9FYqiHRsna6PV6wKW3YR8AAnCBUXJMZD8GgEhg8Dg8BjYhW1MOPCMtazU+Y2HrmDk2cw-Y3Dhx6YRg7ReLxaN7IwsCksut2e71V2A1+tUbEAdXKHAYAE1secaH3SYPVS17Jq46bPjP9EFhEjkyCrT+OYxDqn+k76HSSzmPaCQ7mW+6Vt22KNs2rbtp22LIAcBxnjwxSVCGJIDiqFJqvoWgZnCYRxm8cx-HOrRgh0GrWFo7H6HC06bqscFJLu5YHshIrUMUqQHKk-CEdUir1M+ZEINCGYxp8OgUTosK9Ix1jgsQrHaBxXETLB6IkAJiHEMJmJUBJUmPiR5JqIgxgsf0k6-gCaYWNpMaLnYiJrlydE8UWfFmQhFaWT2IlUMhV63ve9lyaRTkIF4UwasIcKWGCWbmH02lfFMITZdy2ZLFmJmOuZkXCbAYCKBApCKFAVAQEolbNQAbvgADWlbbvxEVCdF9WNc1UAIN1+Dus6ZJVElyqOc0ASGHppoDIYS48uq2nqpqMzcjMwz+ZxVXwXutXRchBwNegVCqLA6BzZWzoAGboGAtYABRLH+ACUVCDeFl0jdiUXYrdijoIt4YvlYIHgllGrsTogTroVwwGEE-mZvCAQOAWvGmcQAC2YDPekrq9Vw+BQFAE1tR1ZCKD1-XEMDZMU86VOwDTdMMy1U2szNc2PAtRGyUtQ40QY9j5QEYIAkE7RznGa0auO3gAmpMYhZz5OU9TtP04zX21nWxCSLgc1vXWpMc8WSSGzzxsCxNws9bN81iLD8mpe4W2ai56s-P4WZaHOYJ6Noal-rYXwfnaW5OyQLuk27pstXQihM4onUi+zBvcxnfMm4LUA557os+6Ifspc01j6JqXS0mppr-FpKY2EsekhBRCLqiEfIp2FXPPaX-NZ5Xufm5b1u2-bjtj+nmcV1X03e+LvuS-2yXLWqvRaj+gKZvlfQMd3sK+LMXRdHCfSAudSQM1gqAAEblxNOd5wXbMDanYgr9MAfy-tnRQ1ct5KAljJPe0sXzZhAgaU+4R7CcWZB4KE0xpzch7uOXosJjKjxJsA0B7twFUDnrWK2Nt0B21rA7TmpDP7kJnpAsW0Cd6wKfA3ZyAwDCIjctYSYM5I4pncJ5D4DhOTtG5DjSYz807OkUKgZ0uAwEz1-izf+y8SYZxUWojRG8RZQMUDA0M+8hzsSmDqMEfw-x2DMHGRikQgi+B+F5NS0dhiKLJso1R6jWE-yoTQxeDDdGOn0QEoxEDN4cLMVwix8CFJqRsfYKEOoDTZkvoBNM1ICF+DBMEeEyxiGOmdJIa2YAYlaOmkXQBFSqkxPYbXeuB8EDtCmBoLxbQzDgjTGIkEiI3EWC0ICQIthgI6F8Y0ygNSQkLzoUvTmszqlBNiSY+J5jiKWJfLMECkQlamm6WM7phg5x-D0O3AeP5fxFJmZUygaJGY4jxAScoyA9gcAOCwXIuRxIHDaUON4McKI6nsH+UwAw5z2A1rSGEWV9lwkMDEQsigKzwBqMDJJcMFKBx6L4NcRgw7BEsNpCYlFgiOP+NmHUt9fGYhxf7F4nxKL3xGJOLKkw9QuLjMQPMGlxw6l0EuaZZSSyYhEky3hLRESjm6BypYaNxzdEYj+PQQw+iWGnJ8K0KLxUYmFO6N6EovqkDeqQSA0r2nuC5KBNSIwqUTEZDYNV7xNVbVMCEbafRfE1W9NaocEiZzEA-DMacgJfz-m0n8HwP5HFdB7ltdoydibVWGpWASx4ICBpfK8EYGZJm5gcBC8Ie12jTDRltCwkwAgwj9RmiGuaFL+U1FCDJaldCaSCNpDSHQqX+TGRpWYPwG2gyQtFRlOzkmpX+D4NBkI2j+S+HYbSXhNThwND3LMfxLBjsEhO8GY0motWbalTMlFHFjOnGYO+rrxHWBDVCdcVovDZjsPuiywkbp3TPStEIekYROMcWYQI5yH3AVAjObpb7tppl8eXSAOc-2IBxpqfKmZATfHVeBwCXgfB+ACMEUIqDIi+JdrzKeFcUPDndexRxGkDSZnHBghAcYMpLnAvlREbQYIGrTiXNe39HI8PaWpNxKtfzyLeBVNWkFAN-WzDjJclV+NALkCAlh09kPTtxee94Aw8lpivZCqO8nbAUTBA4X8fwLDkf8YY9ZNGuSjlhN0E+UINSsfcAMPQwxtCIs+DCfwDymlOd08yxAVbQ0xnUpxQIk4NAXJ+OtIY-h7A6TFWmksqznmnoizK+Lla-q2FsJYRE96hmmH5e5EY45ca5lRVEIAA */
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
          actions: assign({
            email: (ctx) => ctx.event.email
          })
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
              actions: assign({
                turnstileToken: (ctx) => ctx.event.turnstileToken
              }),
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
                  actions: "coolingOTP"
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
            otp: ctx.context.otp
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
