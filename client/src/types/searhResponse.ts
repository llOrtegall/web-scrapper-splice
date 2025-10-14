export interface DataResponse {
  data: Data
}

export interface Data {
  assetsSearch: AssetsSearch
}

export interface AssetsSearch {
  items: Item[]
  __typename: string
  tag_summary: TagSummary[]
  device_summary: any[]
  pagination_metadata: PaginationMetadata
  response_metadata: ResponseMetadata
}

export interface Item {
  asset_prices: AssetPrice[]
  uuid: string
  name: string
  liked: boolean
  licensed: boolean
  asset_type: AssetType
  asset_type_slug: string
  tags: Tag[]
  files: File[]
  __typename: string
  parents: Parents
  bpm?: number
  chord_type?: string
  duration: number
  instrument: any
  key: string
  asset_category_slug: string
  has_similar_sounds: any
  has_coso: boolean
  attributes: string[]
  coso_playback_metadata: any
  catalog_uuid: string
}

export interface AssetPrice {
  amount: number
  currency: string
  __typename: string
}

export interface AssetType {
  label: string
  __typename: string
}

export interface Tag {
  uuid: string
  label: string
  taxonomy: any
  __typename: string
}

export interface File {
  name: string
  hash: string
  path: string
  asset_file_type_slug: string
  url: string
  __typename: string
}

export interface Parents {
  items: Item2[]
  __typename: string
}

export interface Item2 {
  __typename: string
  uuid: string
  name: string
  permalink_base_url: string
  asset_type_slug: string
  files: File2[]
  permalink_slug: string
  child_asset_counts: ChildAssetCount[]
  main_genre: string
}

export interface File2 {
  path: string
  asset_file_type_slug: string
  url: string
  __typename: string
}

export interface ChildAssetCount {
  type: string
  count: number
  __typename: string
}

export interface TagSummary {
  tag: Tag2
  count: number
  __typename: string
}

export interface Tag2 {
  uuid: string
  label: string
  taxonomy: Taxonomy
  __typename: string
}

export interface Taxonomy {
  uuid: string
  name: string
  __typename: string
}

export interface PaginationMetadata {
  currentPage: number
  totalPages: number
  __typename: string
}

export interface ResponseMetadata {
  next: string
  previous: string
  records: number
  __typename: string
}
