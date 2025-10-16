import type { DataResponse } from "../types/searhResponse";
import type { DataGenresResponse } from '../types/genresResponse';
import axios from "axios"

export function getGenresSplice(){
  return {
    operationName:"CategoryList",
    variables:{
      tagCategory:"genres"
    },
    query:"query CategoryList($tagCategory: String!) {\n  categories: tagCategoryList(permalink_slug: $tagCategory, v2Enabled: true) {\n    uuid\n    permalink_slug\n    name\n    categories {\n      uuid\n      name\n      permalink\n      description\n      altDescription\n      altName\n      tags {\n        uuid\n        label\n        __typename\n      }\n      subcategories {\n        uuid\n        name\n        permalink\n        description\n        altDescription\n        altName\n        tags {\n          uuid\n          label\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}"
  }
}

export function createSearchRequest(queryStr: string) {
  return {
    operationName: "SamplesSearch",
    variables: {
      order: "DESC",
      sort: "popularity",
      limit: 50,
      page: 1,
      tags: [],
      key: null,
      chord_type: null,
      bpm: null,
      min_bpm: null,
      max_bpm: null,
      asset_category_slug: null,
      random_seed: null,
      query: queryStr,
      ac_uuid: null
    },
    query: "query SamplesSearch($parent_asset_uuid: GUID, $query: String, $order: SortOrder = DESC, $sort: AssetSortType = popularity, $random_seed: String, $tags: [ID], $key: String, $chord_type: String, $bpm: String, $min_bpm: Int, $max_bpm: Int, $limit: Int = 50, $asset_category_slug: AssetCategorySlug, $page: Int = 1, $ac_uuid: String, $parent_asset_type: AssetTypeSlug) {\n  assetsSearch(\n    filter: {legacy: true, published: true, asset_type_slug: sample, query: $query, tag_ids: $tags, key: $key, chord_type: $chord_type, bpm: $bpm, min_bpm: $min_bpm, max_bpm: $max_bpm, asset_category_slug: $asset_category_slug, ac_uuid: $ac_uuid}\n    children: {parent_asset_uuid: $parent_asset_uuid}\n    pagination: {page: $page, limit: $limit}\n    sort: {sort: $sort, order: $order, random_seed: $random_seed}\n    legacy: {parent_asset_type: $parent_asset_type}\n  ) {\n    ...assetDetails\n    __typename\n  }\n}\n\nfragment assetDetails on AssetPage {\n  ...assetPageItems\n  ...assetTagSummaries\n  pagination_metadata {\n    currentPage\n    totalPages\n    __typename\n  }\n  response_metadata {\n    records\n    __typename\n  }\n  __typename\n}\n\nfragment assetPageItems on AssetPage {\n  items {\n    ... on IAsset {\n      asset_type_slug\n      asset_prices {\n        amount\n        currency\n        __typename\n      }\n      uuid\n      name\n      tags {\n        uuid\n        label\n        __typename\n      }\n      files {\n        uuid\n        name\n        hash\n        path\n        asset_file_type_slug\n        url\n        __typename\n      }\n      __typename\n    }\n    ... on IAssetChild {\n      parents(filter: {asset_type_slug: pack}) {\n        items {\n          ... on PackAsset {\n            permalink_slug\n            permalink_base_url\n            uuid\n            name\n            files {\n              uuid\n              path\n              asset_file_type_slug\n              url\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on SampleAsset {\n      bpm\n      chord_type\n      key\n      duration\n      uuid\n      name\n      asset_category_slug\n      __typename\n    }\n    ... on PresetAsset {\n      uuid\n      name\n      asset_devices {\n        uuid\n        device {\n          name\n          uuid\n          minimum_device_version\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on PackAsset {\n      uuid\n      name\n      provider {\n        name\n        permalink_slug\n        __typename\n      }\n      provider_uuid\n      uuid\n      permalink_slug\n      permalink_base_url\n      main_genre\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment assetTagSummaries on AssetPage {\n  tag_summary {\n    count\n    tag {\n      uuid\n      label\n      taxonomy {\n        uuid\n        name\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}"
  }
}

export async function postSearchRequest(query: string) {
  const request = createSearchRequest(query);
  try {
    const response = await axios.post<DataResponse>("/graphql", request);
    return response.data?.data;
  } catch (error) {
    return { error: "Error during request: " + (error as Error).message };
  }
}

export async function postGenresRequest() {
  const request = getGenresSplice();
  try {
    const response = await axios.post<DataGenresResponse>("/graphql", request);
    return response.data?.data.categories;
  } catch (error) {
    return { error: "Error during request: " + (error as Error).message };
  }
}