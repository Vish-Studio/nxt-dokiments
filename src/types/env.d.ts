declare namespace NodeJS {
  interface ProcessEnv {
    /** App version from package.json, inlined at build time via next.config.ts. */
    readonly APP_VERSION: string;
  }
}
