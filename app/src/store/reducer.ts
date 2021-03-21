import { createSlice } from '@reduxjs/toolkit'
import { BigNumber } from 'ethers/utils'

import { ERC20Service } from '../services'
import { getLogger } from '../util/logger'
import { pseudoNativeAssetAddress } from '../util/networks'

export type BalanceState = {
  balance: Maybe<BigNumber>
}

const logger = getLogger('Store::BalanceReducer')
const initialState: BalanceState = {
  balance: null,
}

const balanceSlice = createSlice({
  name: 'balance',
  initialState,
  reducers: {
    setBalance(state, action) {
      const { balance } = action.payload
      state.balance = balance
    },
  },
})
export const { setBalance } = balanceSlice.actions
export default balanceSlice.reducer

export const fetchAccountBalance = (account: any, provider: any, collateral: any) => async (dispatch: any) => {
  try {
    if (account) {
      if (collateral.address === pseudoNativeAssetAddress) {
        const balance = await provider.getBalance(account)
        dispatch(setBalance({ balance: balance.toString() }))
      } else {
        const collateralService = new ERC20Service(provider, account, collateral.address)
        const balance = await collateralService.getCollateral(account)
        dispatch(setBalance({ balance: balance.toString() }))
      }
    } else {
      dispatch(setBalance({ balance: null }))
    }
  } catch (err) {
    logger.error(err)
  }
}
