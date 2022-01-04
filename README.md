## Kindle Viewer website [![Build Status](https://travis-ci.org/clippingkk/web.svg?branch=master)](https://travis-ci.org/clippingkk/web) [![Coverage Status](https://coveralls.io/repos/github/clippingkk/web/badge.svg?branch=master)](https://coveralls.io/github/clippingkk/web?branch=master)

kindle viewer website

## Notes

```bash
$ apollo client:download-schema --endpoint="http://localhost:19654/api/v2/graphql" --header="Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIifQ.fKL6TTl9POtMymFl7EEkobMvnzAODPZy97MxjgKL3Io"
$ mv schema.json src/schema/
$ apollo codegen:generate --target=typescript --localSchemaFile="./src/schema/schema.json" --includes="./src/schema/**/*.graphql" --useReadOnlyTypes
```

esbuild 有问题报错 ENOENT: 执行: `node ./node_modules/esbuild/install.js`
