## Kindle Viewer website [![Build Status](https://travis-ci.org/clippingkk/web.svg?branch=master)](https://travis-ci.org/clippingkk/web) [![Coverage Status](https://coveralls.io/repos/github/clippingkk/web/badge.svg?branch=master)](https://coveralls.io/github/clippingkk/web?branch=master)

kindle viewer website

## Notes

```bash
$ apollo schema:download --endpoint="http://localhost:9654/api/v2/graphql" --header="Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIifQ.fKL6TTl9POtMymFl7EEkobMvnzAODPZy97MxjgKL3Io"
$ mv schema.json src/schema/
$ apollo codegen:generate --target=typescript --localSchemaFile="./src/schema/schema.json" --includes="./src/schema/**/*.graphql" --useReadOnlyTypes
```
