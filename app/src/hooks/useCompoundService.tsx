import { useEffect, useMemo, useState } from 'react'

import { CompoundService } from '../services'
import { CompoundTokenType, Token } from '../util/types'

import { ConnectedWeb3Context } from './connectedWeb3'

export const useCompoundService = (
  collateral: Token,
  context: ConnectedWeb3Context,
): {
  compoundService: Maybe<CompoundService>
  fetchCompoundService: () => Promise<void>
} => {
  const { account, library: provider } = context

  const [compoundService, setCompoundService] = useState<Maybe<CompoundService>>(null)

  const fetchCompoundService = async () => {
    if (compoundService) {
      await compoundService.init()
      setCompoundService(compoundService)
    }
  }

  useMemo(() => {
    if (collateral.symbol.toLowerCase() in CompoundTokenType) {
      const compoundService = new CompoundService(collateral.address, collateral.symbol, provider, account)
      setCompoundService(compoundService)
      fetchCompoundService()
    }
    // eslint-disable-next-line
  }, [collateral.address, account, collateral.symbol, provider])

  useEffect(() => {
    if (collateral.symbol.toLowerCase() in CompoundTokenType) {
      const compoundService = new CompoundService(collateral.address, collateral.symbol, provider, account)
      setCompoundService(compoundService)
      fetchCompoundService()
    }
    // eslint-disable-next-line
  }, [])

  return { compoundService, fetchCompoundService }
}
