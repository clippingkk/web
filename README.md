## Kindle Viewer website [![Build Status](https://travis-ci.org/clippingkk/web.svg?branch=master)](https://travis-ci.org/clippingkk/web) [![Coverage Status](https://coveralls.io/repos/github/clippingkk/web/badge.svg?branch=master)](https://coveralls.io/github/clippingkk/web?branch=master)

kindle viewer website

## Notes

```bash
$ apollo client:download-schema --endpoint="http://localhost:19654/api/v2/graphql" --header="Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMiLCJleHAiOjE2Nzk3MTgzNzYsImlhdCI6MTY2NDE2NjM3NiwiaXNzIjoiY2stc2VydmVyQCJ9.X1X-LZoGePwbUauCwUwDJa6aEsmKHiXWB7fkT2ht0TM"
$ mv schema.json src/schema/
$ apollo codegen:generate --target=typescript --localSchemaFile="./src/schema/schema.json" --includes="./src/schema/**/*.graphql" --useReadOnlyTypes
```

esbuild 有问题报错 ENOENT: 执行: `node ./node_modules/esbuild/install.js`
