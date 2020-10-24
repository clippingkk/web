declare var __DEV__: boolean

// graphql.d.ts file
declare module '*.graphql' {
    import {DocumentNode} from 'graphql'

    const value: DocumentNode
    export default value
}

declare module 'react-dark-mode-toggle';
