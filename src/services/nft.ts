export interface NFTMetadataAttribute {
  trait_type: string
  value: string
  display_type?: string
}

export interface NFTMetadata {
  name: string
  description: string
  external_url: string
  image: string
  attributes: NFTMetadataAttribute[]
  is_normalized?: boolean
  name_length?: number
  segment_length?: number
  url?: string
  version?: number
  background_image?: string
  image_url?: string
}
