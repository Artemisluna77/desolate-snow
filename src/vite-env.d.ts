/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 强制使用 mock 数据源:'mock' */
  readonly VITE_DATA_SOURCE?: 'mock'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
