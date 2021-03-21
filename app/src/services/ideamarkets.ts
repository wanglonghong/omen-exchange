/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios'
import { Web3Provider } from 'ethers/providers'

import { getIdeaMarketGraphUri } from '../util/networks'

class IdeaMarketService {
  httpUri: string
  provider: Web3Provider
  constructor(provider: Web3Provider) {
    this.provider = provider
    provider.connection
    const networkId = provider.network ? provider.network.chainId : 1
    const { httpUri } = getIdeaMarketGraphUri(networkId)
    this.httpUri = httpUri
  }

  public async getIdeaMarketAccounts(category: string) {
    const query = `
      query ideaMarkets($marketID: Int!) {
        ideaMarkets(where:{marketID:$marketID}) {
          tokens(skip:0, first:10, orderBy:rank, orderDirection:asc) {
            id
            tokenID
            name
            supply
            holders
            marketCap
            rank
            tokenOwner
            daiInToken
            invested
            listedAt
            lockedAmount
            lockedPercentage
            latestPricePoint {
              timestamp
              counter
              oldPrice
              price
            }
            earliestPricePoint: pricePoints(first:1, orderBy:"timestamp", orderDirection:"asc", where:{timestamp_gt:"1614796698"}) {
              counter
              timestamp
              oldPrice
              price
            }
            dayVolume
            dayChange
          }
        }
      }
      `
    const response = await axios.post(this.httpUri, { query, variables: { marketID: category === 'twitter' ? 1 : 2 } })
    const { data: responseData } = response || {}
    const { data } = responseData || {}
    const { ideaMarkets } = data || {}
    const { tokens } = ideaMarkets[0] || []
    const names = tokens.map((t: any) => t.name)
    return { names }
  }
}

export { IdeaMarketService }
