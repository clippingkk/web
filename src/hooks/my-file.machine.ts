import { createMachine } from 'xstate'

type Event = { type: 'Next' } | { type: 'Error' } | { type: 'Reset' }

export const uploadProcessMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QFUAOAbA9gQwgBQCdMBjOWAWW2IAsBLAOzADp7NGBiAOTAA8AXANoAGALqJQqTLFp9abcSB6IAbAA4hTAEwAWTQEYArMoCcqnfuMAaEAE9EqvUwMBfZ9bRZchEmUo0GzKjYBLBgXLyCogqS0rLySIqIesYAzExCKXqaBtZ2CAb6TqopJaVlKa7uGDj4RKSwFFR0jExBIWEAogREBMJiCTEycvQKSgjJaRlZObaI2tppAOwubiAeNd71jf4tbaHsAEpwYJH9ElJD8aBjE+mZ2bmImkKaWitVnrU+DX7NzKHBHZQABCmEwAGtwvw+tELnERgkxs8NNohMoHrN8otXkJiuVypU1tUvHVfE0AkwAQQgaCIewuj0YQM4cNRnMDMYmMpFnpVMtHliUXplCLRWLFoT1iTvts-pSwIDmiCwZCjqFTrDYqzEezOdzefzMSlNBVVlKvltfhSAK7EiAMKBQjXMrVXRLjVJ3aYC1TKRzGYVioPKSV2zZknbMW2fB307qYXpRF2XBHXJKeqYYvImRyB4OiiVmsOkn7klrRmqxtUnJnnV2p923TMzPKLbSOfPB0OfcOlyNMCBsMI8WB8bB8ZjYABmE4IAAoUkIlwBKdjm3uyimDxi1kCDeFshDaDlcnl8lv2ZRpdud0XdjYlzctMDxgiHY7Ouspw-c16+s+GnkBiLEKt7cq4qysBAcAKOuj5WowmrfjqCAALTKAK6H3tKlplswrCIcmB4oYsxiLFomjKAYmSmOYyQCkYnLGAUKTqMxJoONhFoRnKexgEhxFpgg2JMMYyhCKkgGIAYElOPi+JcRuCH-Aq1JKrS4ICdqQmaGRTApMYaJZtJyjaE4inwXhTAVrgDpaW6Yy6D62icr6YGFh8D4yspA5DvZDZjCUGjYpRRjGQgvqvDeYEWd5Vkvj0-mHgYxT6QYhjohegqiXm+aFq4QA */
  id: 'UploadProcessMachine',
  types: {
    events: {} as Event
  },
  states: {
    none: {
      on: {
        Next: 'parse'
      }
    },

    parse: {
      on: {
        Next: 'searchingBook',
        Error: 'error',
        Reset: 'none'
      }
    },

    searchingBook: {
      on: {
        Next: 'uploading',
        Error: 'error',
        Reset: 'none'
      }
    },

    uploading: {
      on: {
        Next: 'done',
        Error: 'error',
        Reset: 'none'
      }
    },

    done: {
      after: {
        '3000': 'none'
      }
    },

    error: {
      on: {
        Reset: 'none'
      }
    },
  },

  initial: 'none',
})
