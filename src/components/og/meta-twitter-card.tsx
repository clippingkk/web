import React from 'react'

export enum TwitterCardType {
  summary = 'summary',
  summaryLargeImage = 'summary_large_image',
}

type MetaTwitterCardProps = {
  card: TwitterCardType
  site: string
  creator: string
  url: string
  title: string
  image: string
  description: string
}

function MetaTwitterCard(props: MetaTwitterCardProps) {
  return (
    <React.Fragment>
      <meta name="twitter:card" content={props.card} />
      <meta name="twitter:site" content={'@' + props.site} />
      <meta name="twitter:creator" content={`@${props.creator}`} />
      <meta name="twitter:url" content={props.url} />
      <meta name="twitter:title" content={props.title} />
      <meta name="twitter:description" content={props.description} />
      <meta name="twitter:image" content={props.image} />
      <meta name="twitter:image:alt" content={props.title} />
    </React.Fragment>
  )
}

export default MetaTwitterCard
