import { SearchQuery } from 'storefront-query-builder'
import config from 'config'

export function prepareRelatedQuery (series1, series2, series3) {
  let relatedProductsQuery = new SearchQuery()

  relatedProductsQuery = relatedProductsQuery
    .applyFilter({ key: 'series_1_value1', value: { 'in': [series1] } })
    .applyFilter({ key: 'series_2_value1', value: { 'in': [series2] } })
    .applyFilter({ key: 'series_3_value1', value: { 'in': [series3] } })
    .applyFilter({ key: 'visibility', value: { 'in': [2, 3, 4] } })
    .applyFilter({ key: 'status', value: { 'in': [1] } })

  if (config.products.listOutOfStockProducts === false) {
    relatedProductsQuery = relatedProductsQuery.applyFilter({ key: 'stock.is_in_stock', value: { 'eq': true } })
  }

  return relatedProductsQuery
}
