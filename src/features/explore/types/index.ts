// Our internal Stock interface
export interface Stock {
  id: string
  ticker: string
  companyName: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  sector: string
  description?: string
}

// Polygon.io API response interfaces (based on actual API structure)
export interface PolygonTicker {
  ticker: string
  name: string
  market: string
  locale: string
  primary_exchange: string
  type: string
  active: boolean
  currency_name?: string
  cik?: string
  composite_figi?: string
  share_class_figi?: string
  last_updated_utc?: string
}

export interface PolygonTickersResponse {
  results?: PolygonTicker[]
  status: string
  request_id?: string
  count?: number
  next_url?: string
}

export interface PolygonQuote {
  c: number // close
  h: number // high
  l: number // low
  o: number // open
  v: number // volume
  vw: number // volume weighted average price
  t: number // timestamp
}

export interface PolygonQuoteResponse {
  ticker: string
  queryCount: number
  resultsCount: number
  adjusted: boolean
  results: PolygonQuote[]
  status: string
  request_id: string
  count: number
  next_url?: string
}

export interface StockSearchParams {
  query: string
  limit: number
  offset: number
}

export interface StockListResponse {
  stocks: Stock[]
  total: number
  hasMore: boolean
}
