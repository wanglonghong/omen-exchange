import { stripIndents } from 'common-tags'
import { Zero } from 'ethers/constants'
import { BigNumber, parseUnits } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import {
  useAsyncDerivedValue,
  useCollateralBalance,
  useConnectedCPKContext,
  useConnectedWeb3Context,
  useContracts,
  useCpkAllowance,
  useCpkProxy,
} from '../../../../hooks'
import { MarketMakerService } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { getNativeAsset, getWrapToken, pseudoNativeAssetAddress } from '../../../../util/networks'
import { RemoteData } from '../../../../util/remote_data'
import {
  calcPrediction,
  calcXValue,
  computeBalanceAfterTrade,
  formatBigNumber,
  formatNumber,
  getUnit,
  mulBN,
} from '../../../../util/tools'
import { MarketDetailsTab, MarketMakerData, Status, Ternary, Token } from '../../../../util/types'
import { Button, ButtonContainer, ButtonTab } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
import { CurrenciesWrapper, GenericError, TabsGrid } from '../../common/common_styled'
import { CurrencySelector } from '../../common/currency_selector'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { MarketScale } from '../../common/market_scale'
import { SetAllowance } from '../../common/set_allowance'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { WarningMessage } from '../../common/warning_message'

const StyledButtonContainer = styled(ButtonContainer)`
  justify-content: space-between;
  border-top: 1px solid ${props => props.theme.borders.borderDisabled};
  margin-left: -25px;
  margin-right: -25px;
  padding-left: 25px;
  padding-right: 25px;
`

const logger = getLogger('Scalar Market::Buy')

interface Props {
  fetchGraphMarketMakerData: () => Promise<void>
  fetchGraphMarketUserTxData: () => Promise<void>
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
}

export const ScalarMarketBuy = (props: Props) => {
  const { fetchGraphMarketMakerData, fetchGraphMarketUserTxData, marketMakerData, switchMarketTab } = props
  const context = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()

  const { library: provider, networkId } = context
  const signer = useMemo(() => provider.getSigner(), [provider])

  const {
    address: marketMakerAddress,
    balances,
    fee,
    outcomeTokenMarginalPrices,
    question,
    scalarHigh,
    scalarLow,
  } = marketMakerData
  const { buildMarketMaker } = useContracts(context)
  const marketMaker = useMemo(() => buildMarketMaker(marketMakerAddress), [buildMarketMaker, marketMakerAddress])

  const Tabs = {
    short: 'short',
    long: 'long',
  }

  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0))
  const [amountDisplay, setAmountDisplay] = useState<string>('')

  const wrapToken = getWrapToken(networkId)
  const nativeAsset = getNativeAsset(networkId)
  const initialCollateral =
    marketMakerData.collateral.address.toLowerCase() === wrapToken.address.toLowerCase()
      ? nativeAsset
      : marketMakerData.collateral
  const [collateral, setCollateral] = useState<Token>(initialCollateral)

  const [activeTab, setActiveTab] = useState(Tabs.short)
  const [positionIndex, setPositionIndex] = useState(0)
  const [status, setStatus] = useState<Status>(Status.Ready)
  const [isNegativeAmount, setIsNegativeAmount] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [tweet, setTweet] = useState('')
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)

  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const { allowance, unlock } = useCpkAllowance(signer, collateral.address)

  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amount))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())

  const { collateralBalance: maybeCollateralBalance, fetchCollateralBalance } = useCollateralBalance(
    collateral,
    context,
  )
  const collateralBalance = maybeCollateralBalance || Zero
  const walletBalance = formatNumber(formatBigNumber(collateralBalance, collateral.decimals, 5), 5)

  useEffect(() => {
    setIsNegativeAmount(formatBigNumber(amount, collateral.decimals).includes('-'))
  }, [amount, collateral.decimals])

  useEffect(() => {
    activeTab === Tabs.short ? setPositionIndex(0) : setPositionIndex(1)
  }, [activeTab, Tabs.short])

  const unlockCollateral = async () => {
    if (!cpk) {
      return
    }

    await unlock()
    setAllowanceFinished(true)
  }

  const [upgradeFinished, setUpgradeFinished] = useState(false)
  const { proxyIsUpToDate, updateProxy } = useCpkProxy()
  const isUpdated = RemoteData.hasData(proxyIsUpToDate) ? proxyIsUpToDate.data : true

  const showUpgrade =
    (!isUpdated && collateral.address === pseudoNativeAssetAddress) ||
    (upgradeFinished && collateral.address === pseudoNativeAssetAddress)

  const upgradeProxy = async () => {
    if (!cpk) {
      return
    }

    await updateProxy()
    setUpgradeFinished(true)
  }

  const calcBuyAmount = useMemo(
    () => async (amount: BigNumber): Promise<[BigNumber, number, BigNumber]> => {
      let tradedShares: BigNumber

      try {
        tradedShares = await marketMaker.calcBuyAmount(amount, positionIndex)
      } catch {
        tradedShares = new BigNumber(0)
      }

      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        positionIndex,
        amount,
        tradedShares,
      )
      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)

      const newPrediction = calcPrediction(
        pricesAfterTrade[1].toString(),
        scalarLow || new BigNumber(0),
        scalarHigh || new BigNumber(0),
      )

      return [tradedShares, newPrediction, amount]
    },
    [balances, marketMaker, positionIndex, scalarLow, scalarHigh],
  )

  const [tradedShares, newPrediction, debouncedAmount] = useAsyncDerivedValue(
    amount,
    [new BigNumber(0), 0, amount],
    calcBuyAmount,
  )

  const formattedNewPrediction =
    newPrediction &&
    calcXValue(
      parseUnits(newPrediction.toString(), 18),
      scalarLow || new BigNumber(0),
      scalarHigh || new BigNumber(0),
    ) / 100

  const feePaid = mulBN(debouncedAmount, Number(formatBigNumber(fee, 18, 4)))
  const feePercentage = Number(formatBigNumber(fee, 18, 4)) * 100

  const baseCost = debouncedAmount.sub(feePaid)
  const potentialProfit = tradedShares.isZero() ? new BigNumber(0) : tradedShares.sub(amount)

  const currentBalance = `${formatBigNumber(collateralBalance, collateral.decimals, 5)}`
  const feeFormatted = `${formatNumber(formatBigNumber(feePaid.mul(-1), collateral.decimals))} ${collateral.symbol}`
  const baseCostFormatted = `${formatNumber(formatBigNumber(baseCost, collateral.decimals))} ${collateral.symbol}`
  const potentialProfitFormatted = potentialProfit.gt(Zero)
    ? `${formatNumber(Number(formatBigNumber(potentialProfit, collateral.decimals)).toString())} ${collateral.symbol}`
    : `0.00 ${collateral.symbol}`
  const sharesTotal = formatNumber(formatBigNumber(tradedShares, collateral.decimals))
  const total = `${sharesTotal} Shares`

  const showSetAllowance =
    collateral.address !== pseudoNativeAssetAddress &&
    !cpk?.isSafeApp &&
    (allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False)

  const shouldDisplayMaxButton = collateral.address !== pseudoNativeAssetAddress

  const amountError =
    maybeCollateralBalance === null
      ? null
      : maybeCollateralBalance.isZero() && amount.gt(maybeCollateralBalance)
      ? `Insufficient balance`
      : amount.gt(maybeCollateralBalance)
      ? `Value must be less than or equal to ${currentBalance} ${collateral.symbol}`
      : null

  const isBuyDisabled =
    (status !== Status.Ready && status !== Status.Error) ||
    amount.isZero() ||
    (!cpk?.isSafeApp && collateral.address !== pseudoNativeAssetAddress && hasEnoughAllowance !== Ternary.True) ||
    amountError !== null ||
    isNegativeAmount

  const finish = async () => {
    const outcomeIndex = positionIndex
    try {
      if (!cpk) {
        return
      }

      const sharesAmount = formatBigNumber(tradedShares, collateral.decimals)

      setStatus(Status.Loading)
      setMessage(`Buying ${sharesAmount} shares ...`)

      await cpk.buyOutcomes({
        amount,
        collateral,
        outcomeIndex,
        marketMaker,
      })

      await fetchGraphMarketUserTxData()
      await fetchGraphMarketMakerData()
      await fetchCollateralBalance()

      setTweet(
        stripIndents(`${question.title}

      I predict ${balances[outcomeIndex].outcomeName}

      What do you think?`),
      )

      setAmount(new BigNumber(0))
      setStatus(Status.Ready)
      setMessage(`Successfully bought ${sharesAmount} '${balances[outcomeIndex].outcomeName}' shares.`)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to buy '${balances[outcomeIndex].outcomeName}' Shares.`)
      logger.error(`${message} - ${err.message}`)
    }
    setIsModalTransactionResultOpen(true)
  }

  const currencyFilters =
    collateral.address === wrapToken.address || collateral.address === pseudoNativeAssetAddress
      ? [wrapToken.address.toLowerCase(), pseudoNativeAssetAddress.toLowerCase()]
      : []

  return (
    <>
      <MarketScale
        amountShares={tradedShares}
        borderTop={true}
        collateral={collateral}
        currentPrediction={outcomeTokenMarginalPrices[1]}
        fee={feePaid}
        long={activeTab === Tabs.long}
        lowerBound={scalarLow || new BigNumber(0)}
        newPrediction={formattedNewPrediction}
        short={activeTab === Tabs.short}
        startingPointTitle={'Current prediction'}
        tradeAmount={amount}
        unit={getUnit(question.title)}
        upperBound={scalarHigh || new BigNumber(0)}
      />
      <GridTransactionDetails>
        <div>
          <TabsGrid>
            <ButtonTab active={activeTab === Tabs.short} onClick={() => setActiveTab(Tabs.short)}>
              Short
            </ButtonTab>
            <ButtonTab active={activeTab === Tabs.long} onClick={() => setActiveTab(Tabs.long)}>
              Long
            </ButtonTab>
          </TabsGrid>
          <CurrenciesWrapper>
            <CurrencySelector
              addBalances
              addNativeAsset
              balance={walletBalance}
              context={context}
              currency={collateral.address}
              disabled={currencyFilters.length ? false : true}
              filters={currencyFilters}
              onSelect={(token: Token | null) => {
                if (token) {
                  setCollateral(token)
                  setAmount(new BigNumber(0))
                }
              }}
            />
          </CurrenciesWrapper>
          <ReactTooltip id="walletBalanceTooltip" />
          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={collateral.decimals}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setAmount(e.value.gt(Zero) ? e.value : Zero)
                  setAmountDisplay('')
                }}
                style={{ width: 0 }}
                value={amount}
                valueToDisplay={amountDisplay}
              />
            }
            onClickMaxButton={() => {
              setAmount(collateralBalance)
              setAmountDisplay(formatBigNumber(collateralBalance, collateral.decimals, 5))
            }}
            shouldDisplayMaxButton={shouldDisplayMaxButton}
            symbol={collateral.symbol}
          />
          {amountError && <GenericError>{amountError}</GenericError>}
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow title={'Base Cost'} value={baseCostFormatted} />
            <TransactionDetailsRow
              title={'Fee'}
              tooltip={`A ${feePercentage}% fee goes to liquidity providers`}
              value={feeFormatted}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow
              title={'Max. Loss'}
              value={`${!amount.isZero() ? '-' : ''}${formatNumber(formatBigNumber(amount, collateral.decimals))} ${
                collateral.symbol
              }`}
            />
            <TransactionDetailsRow
              emphasizeValue={potentialProfit.gt(0)}
              state={ValueStates.success}
              title={'Max. Profit'}
              value={potentialProfitFormatted}
            />
            <TransactionDetailsRow title={'Total'} value={total} />
          </TransactionDetailsCard>
        </div>
      </GridTransactionDetails>
      {isNegativeAmount && (
        <WarningMessage
          additionalDescription={''}
          danger={true}
          description={`Your buy amount should not be negative.`}
          href={''}
          hyperlinkDescription={''}
        />
      )}
      {showSetAllowance && (
        <SetAllowance
          collateral={collateral}
          finished={allowanceFinished && RemoteData.is.success(allowance)}
          loading={RemoteData.is.asking(allowance)}
          onUnlock={unlockCollateral}
          style={{ marginBottom: 20 }}
        />
      )}
      {showUpgrade && (
        <SetAllowance
          collateral={nativeAsset}
          finished={upgradeFinished && RemoteData.is.success(proxyIsUpToDate)}
          loading={RemoteData.is.asking(proxyIsUpToDate)}
          onUnlock={upgradeProxy}
          style={{ marginBottom: 20 }}
        />
      )}
      <StyledButtonContainer>
        <Button buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab(MarketDetailsTab.swap)}>
          Cancel
        </Button>
        <Button buttonType={ButtonType.primaryAlternative} disabled={isBuyDisabled} onClick={finish}>
          Buy Position
        </Button>
      </StyledButtonContainer>
      <ModalTransactionResult
        isOpen={isModalTransactionResultOpen}
        onClose={() => setIsModalTransactionResultOpen(false)}
        shareUrl={`${window.location.protocol}//${window.location.hostname}/#/${marketMakerAddress}`}
        status={status}
        text={message}
        title={status === Status.Error ? 'Transaction Error' : 'Buy Shares'}
        tweet={tweet}
      />
      {status === Status.Loading && <FullLoading message={message} />}
    </>
  )
}
