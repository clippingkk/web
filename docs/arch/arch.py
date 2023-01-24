from diagrams import Diagram, Cluster
from diagrams.onprem.network import Nginx
from diagrams.onprem.vcs import Github
from diagrams.onprem.container import Docker
from diagrams.saas.cdn import Cloudflare
from diagrams.onprem.monitoring import Sentry
from diagrams.onprem.registry import Harbor
from diagrams.onprem.inmemory import Redis
from diagrams.onprem.compute import Server
from diagrams.onprem.database import Clickhouse, PostgreSQL
from diagrams.aws.storage import S3

graph_attr = {
    "fontsize": "45",
    "bgcolor": "transparent"
}

with Diagram("", show=False, direction="TB", outformat="png", graph_attr=graph_attr):
	with Cluster('FrontEnd'):
		s = Docker("server")
		Nginx("ingress") - s
		Github('github action') - s
		s - S3('cdn')

	s - Docker('url-to-image')
	s - Docker('web-widget')
	s - Docker('wenqu')
	s - Server('mixpanel')
	s - Sentry('sentry')
	s - Cloudflare('analytics')
	with Cluster('Backend'):
		b = Docker('backend')
		Github('github action') - Harbor('private harbor') - b
		b - Redis('redis')
		b - PostgreSQL('db')

	b - Sentry('sentry')
	b - Server('apple')
	b - Clickhouse('uptrace')
	b - Server('Infura')

	s - b
