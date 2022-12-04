## Kindle Viewer website [![Build Status](https://travis-ci.org/clippingkk/web.svg?branch=master)](https://travis-ci.org/clippingkk/web) [![Coverage Status](https://coveralls.io/repos/github/clippingkk/web/badge.svg?branch=master)](https://coveralls.io/github/clippingkk/web?branch=master)

## package manager

we use yarn

kindle viewer website

## Notes

```bash
$ apollo client:download-schema --endpoint="http://localhost:19654/api/v2/graphql" --header="Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJleHAiOjE2ODAyMzg5NTUsImlhdCI6MTY2NDY4Njk1NSwiaXNzIjoiY2stc2VydmVyQCJ9.n5DKJnhACf65Cu-yYZP700rOLgadgLTBHPIxmAo8lAo"
$ mv schema.json src/schema/
$ apollo codegen:generate --target=typescript --localSchemaFile="./src/schema/schema.json" --includes="./src/schema/**/*.graphql" --useReadOnlyTypes
```

esbuild 有问题报错 ENOENT: 执行: `node ./node_modules/esbuild/install.js`
