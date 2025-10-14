export interface DataGenresResponse {
  data: Data
}

export interface Data {
  categories: Categories
}

export interface Categories {
  uuid: string
  permalink_slug: string
  name: string
  categories: Category[]
  __typename: string
}

export interface Category {
  uuid: string
  name: string
  permalink: string
  description: string
  altDescription: string
  altName: string
  tags: any[]
  subcategories: Subcategory[]
  __typename: string
}

export interface Subcategory {
  uuid: string
  name: string
  permalink: string
  description: string
  altDescription: string
  altName: string
  tags: Tag[]
  __typename: string
}

export interface Tag {
  uuid: string
  label: string
  __typename: string
}
