declare var __DEV__: boolean
declare var __VERSION__: string

// graphql.d.ts file
declare module '*.graphql' {
    import {DocumentNode} from 'graphql'

    const value: DocumentNode
    export default value
}

declare module 'react-dark-mode-toggle';
declare module 'colorthief';
