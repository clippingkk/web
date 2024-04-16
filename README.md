## Kindle Viewer website [![Build Status](https://travis-ci.org/clippingkk/web.svg?branch=master)](https://travis-ci.org/clippingkk/web) [![Coverage Status](https://coveralls.io/repos/github/clippingkk/web/badge.svg?branch=master)](https://coveralls.io/github/clippingkk/web?branch=master)

## package manager

we use pnpm

## Notes

```bash
$ apollo client:download-schema --endpoint="http://localhost:19654/api/v2/graphql" --header="Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJleHAiOjE2ODAyMzg5NTUsImlhdCI6MTY2NDY4Njk1NSwiaXNzIjoiY2stc2VydmVyQCJ9.n5DKJnhACf65Cu-yYZP700rOLgadgLTBHPIxmAo8lAo"
$ mv schema.json src/schema/
$ apollo codegen:generate --target=typescript --localSchemaFile="./src/schema/schema.json" --includes="./src/schema/**/*.graphql" --useReadOnlyTypes
```

## Deploy

### Docker

```bash
podman run -d --restart=always -e PORT=3333 -e HOSTNAME=0.0.0.0 -e OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp.uptrace.dev" -e OTEL_EXPORTER_OTLP_HEADERS="uptrace-dsn=https://PASSWORD@api.uptrace.dev/123456" -e OTEL_EXPORTER_OTLP_COMPRESSION=gzip -e OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION=BASE2_EXPONENTIAL_BUCKET_HISTOGRAM -e OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE=DELTA -e REDIS_URL=redis://:PASSWORD@localhost:6379/7 --network=host registry.cn-shanghai.aliyuncs.com/annatarhe/clippingkk-web:5.10.6
```

### Kraft

```bash
kraft cloud deploy -p 443:3000 -M 1024 .
```
