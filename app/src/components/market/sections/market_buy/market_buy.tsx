import { stripIndents } from 'common-tags'
import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { DOCUMENT_VALIDITY_RULES } from '../../../../common/constants'
import {
  useAsyncDerivedValue,
  useCollateralBalance,
  useCompoundService,
  useConnectedCPKContext,
  useConnectedWeb3Context,
  useContracts,
  useCpkAllowance,
  useCpkProxy,
  useSymbol,
} from '../../../../hooks'
import { MarketMakerService } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { getNativeAsset, getWrapToken, pseudoNativeAssetAddress } from '../../../../util/networks'
import { RemoteData } from '../../../../util/remote_data'
import {
  computeBalanceAfterTrade,
  formatBigNumber,
  formatNumber,
  getInitialCollateral,
  getSharesInBaseToken,
  mulBN,
} from '../../../../util/tools'
import {
  CompoundTokenType,
  MarketDetailsTab,
  MarketMakerData,
  OutcomeTableValue,
  Status,
  Ternary,
  Token,
} from '../../../../util/types'
import { Button, ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
import { CurrenciesWrapper, GenericError } from '../../common/common_styled'
import { CurrencySelector } from '../../common/currency_selector'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { IdeaAccount } from '../../common/list_item/idea_account'
import { OutcomeTable } from '../../common/outcome_table'
import { SetAllowance } from '../../common/set_allowance'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { WarningMessage } from '../../common/warning_message'

const WarningMessageStyled = styled(WarningMessage)`
  margin-top: 20px;
  margin-bottom: 0;
`

const StyledButtonContainer = styled(ButtonContainer)`
  justify-content: space-between;
  margin: 0 -24px;
  padding: 20px 24px 0;
  margin-top: ${({ theme }) => theme.borders.borderLineDisabled};
`

const AccountsWrapper = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const logger = getLogger('Market::Buy')

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
  fetchGraphMarketMakerData: () => Promise<void>
}

const MarketBuyWrapper: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()

  const { library: provider, networkId } = context
  const signer = useMemo(() => provider.getSigner(), [provider])

  const { buildMarketMaker } = useContracts(context)
  const { fetchGraphMarketMakerData, marketMakerData, switchMarketTab } = props
  const { address: marketMakerAddress, balances, fee, outcomeTokenMarginalPrices, question } = marketMakerData

  const { category, title } = question

  const [first, , , second] = title.split(' ')

  const marketMaker = useMemo(() => buildMarketMaker(marketMakerAddress), [buildMarketMaker, marketMakerAddress])

  const wrapToken = getWrapToken(networkId)
  const nativeAsset = getNativeAsset(networkId)
  const initialCollateral =
    marketMakerData.collateral.address.toLowerCase() === wrapToken.address.toLowerCase()
      ? nativeAsset
      : marketMakerData.collateral
  const [collateral, setCollateral] = useState<Token>(initialCollateral)
  const collateralSymbol = collateral.symbol.toLowerCase()

  const { compoundService: CompoundService } = useCompoundService(collateral, context)
  const compoundService = CompoundService || null

  const baseCollateral = getInitialCollateral(networkId, collateral)
  const [displayCollateral, setDisplayCollateral] = useState<Token>(baseCollateral)
  let displayBalances = balances
  if (
    baseCollateral.address !== collateral.address &&
    collateral.symbol.toLowerCase() in CompoundTokenType &&
    compoundService
  ) {
    displayBalances = getSharesInBaseToken(balances, compoundService, baseCollateral)
  }

  const symbol = useSymbol(displayCollateral)

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(0)
  const [amount, setAmount] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountToDisplay, setAmountToDisplay] = useState<string>('')
  const [isNegativeAmount, setIsNegativeAmount] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)
  const [tweet, setTweet] = useState('')
  const [newShares, setNewShares] = useState<Maybe<BigNumber[]>>(null)
  const [displayFundAmount, setDisplayFundAmount] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [allowanceFinished, setAllowanceFinished] = useState(false)
  const { allowance, unlock } = useCpkAllowance(signer, displayCollateral.address)

  const hasEnoughAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.gte(amount || Zero))
  const hasZeroAllowance = RemoteData.mapToTernary(allowance, allowance => allowance.isZero())

  const [upgradeFinished, setUpgradeFinished] = useState(false)
  const { proxyIsUpToDate, updateProxy } = useCpkProxy()
  const isUpdated = RemoteData.hasData(proxyIsUpToDate) ? proxyIsUpToDate.data : true
  const [isTransactionProcessing, setIsTransactionProcessing] = useState<boolean>(false)

  useEffect(() => {
    setIsNegativeAmount(formatBigNumber(amount || Zero, collateral.decimals).includes('-'))
  }, [amount, collateral.decimals])

  useEffect(() => {
    setCollateral(initialCollateral)
    setAmount(null)
    setAmountToDisplay('')
    // eslint-disable-next-line
  }, [marketMakerData.collateral.address])

  // get the amount of shares that will be traded and the estimated prices after trade
  const calcBuyAmount = useMemo(
    () => async (amount: BigNumber): Promise<[BigNumber, number[], BigNumber]> => {
      let tradedShares: BigNumber
      try {
        tradedShares = await marketMaker.calcBuyAmount(amount, outcomeIndex)
      } catch {
        tradedShares = new BigNumber(0)
      }
      const balanceAfterTrade = computeBalanceAfterTrade(
        balances.map(b => b.holdings),
        outcomeIndex,
        amount,
        tradedShares,
      )
      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)

      const probabilities = pricesAfterTrade.map(priceAfterTrade => priceAfterTrade * 100)
      setNewShares(
        balances.map((balance, i) => (i === outcomeIndex ? balance.shares.add(tradedShares) : balance.shares)),
      )
      return [tradedShares, probabilities, amount]
    },
    [balances, marketMaker, outcomeIndex],
  )

  const [tradedShares, probabilities, debouncedAmount] = useAsyncDerivedValue(
    amount || Zero,
    [new BigNumber(0), balances.map(() => 0), amount],
    calcBuyAmount,
  )

  const { collateralBalance: maybeCollateralBalance, fetchCollateralBalance } = useCollateralBalance(
    displayCollateral,
    context,
  )
  const collateralBalance = maybeCollateralBalance || Zero

  const unlockCollateral = async () => {
    if (!cpk) {
      return
    }

    await unlock()
    setAllowanceFinished(true)
  }

  const showUpgrade =
    (!isUpdated && displayCollateral.address === pseudoNativeAssetAddress) ||
    (upgradeFinished && displayCollateral.address === pseudoNativeAssetAddress)

  const shouldDisplayMaxButton = displayCollateral.address !== pseudoNativeAssetAddress

  const upgradeProxy = async () => {
    if (!cpk) {
      return
    }

    await updateProxy()
    setUpgradeFinished(true)
  }

  const finish = async () => {
    try {
      if (!cpk) {
        return
      }
      let displayTradedShares = tradedShares
      let useBaseToken = false
      let inputAmount = amount || Zero
      if (collateralSymbol in CompoundTokenType && compoundService && amount) {
        displayTradedShares = compoundService.calculateCTokenToBaseExchange(baseCollateral, tradedShares)
        if (collateral.symbol !== displayCollateral.symbol) {
          inputAmount = compoundService.calculateCTokenToBaseExchange(baseCollateral, amount)
          useBaseToken = true
        }
      }
      const sharesAmount = formatBigNumber(displayTradedShares, baseCollateral.decimals)

      setStatus(Status.Loading)
      setMessage(`Buying ${sharesAmount} shares ...`)
      setIsTransactionProcessing(true)
      await cpk.buyOutcomes({
        amount: inputAmount,
        collateral,
        compoundService,
        marketMaker,
        outcomeIndex,
        useBaseToken,
      })

      await fetchGraphMarketMakerData()
      await fetchCollateralBalance()

      setTweet(
        stripIndents(`${question.title}

      I predict ${balances[outcomeIndex].outcomeName}

      What do you think?`),
      )
      setDisplayAmountToFund(new BigNumber('0'))
      setStatus(Status.Ready)
      setMessage(`Successfully bought ${sharesAmount} '${balances[outcomeIndex].outcomeName}' shares.`)
      setIsTransactionProcessing(false)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to buy '${balances[outcomeIndex].outcomeName}' Shares.`)
      logger.error(`${message} - ${err.message}`)
      setIsTransactionProcessing(false)
    }
    setIsModalTransactionResultOpen(true)
  }

  const showSetAllowance =
    collateral.address !== pseudoNativeAssetAddress &&
    !cpk?.isSafeApp &&
    (allowanceFinished || hasZeroAllowance === Ternary.True || hasEnoughAllowance === Ternary.False)

  const feePaid = mulBN(debouncedAmount || Zero, Number(formatBigNumber(fee, 18, 4)))
  const feePercentage = Number(formatBigNumber(fee, 18, 4)) * 100

  const baseCost = debouncedAmount?.sub(feePaid)
  const potentialProfit = tradedShares.isZero() ? new BigNumber(0) : tradedShares.sub(amount || Zero)
  let displayFeePaid = feePaid
  let displayBaseCost = baseCost
  let displayPotentialProfit = potentialProfit
  let displayTradedShares = tradedShares
  if (collateralSymbol in CompoundTokenType && compoundService) {
    if (collateralSymbol !== displayCollateral.symbol.toLowerCase()) {
      displayFeePaid = compoundService.calculateCTokenToBaseExchange(displayCollateral, feePaid)
      if (baseCost && baseCost.gt(0)) {
        displayBaseCost = compoundService.calculateCTokenToBaseExchange(displayCollateral, baseCost)
      }
      if (potentialProfit && potentialProfit.gt(0)) {
        displayPotentialProfit = compoundService.calculateCTokenToBaseExchange(displayCollateral, potentialProfit)
      }
    }
    displayTradedShares = compoundService.calculateCTokenToBaseExchange(baseCollateral, tradedShares)
  }
  const currentBalance = `${formatBigNumber(collateralBalance, collateral.decimals, 5)}`
  const feeFormatted = `${formatNumber(formatBigNumber(displayFeePaid.mul(-1), displayCollateral.decimals))} ${symbol}`
  const baseCostFormatted = `${formatNumber(formatBigNumber(displayBaseCost || Zero, displayCollateral.decimals))}
    ${symbol}`
  const potentialProfitFormatted = `${formatNumber(
    formatBigNumber(displayPotentialProfit, displayCollateral.decimals),
  )} ${symbol}`
  const sharesTotal = formatNumber(formatBigNumber(displayTradedShares, baseCollateral.decimals))
  const total = `${sharesTotal} Shares`

  const amountError = isTransactionProcessing
    ? null
    : maybeCollateralBalance === null
    ? null
    : maybeCollateralBalance.isZero() && amount?.gt(maybeCollateralBalance)
    ? `Insufficient balance`
    : amount?.gt(maybeCollateralBalance)
    ? `Value must be less than or equal to ${currentBalance} ${symbol}`
    : null

  const isBuyDisabled =
    !amount ||
    Number(sharesTotal) == 0 ||
    (status !== Status.Ready && status !== Status.Error) ||
    amount?.isZero() ||
    (!cpk?.isSafeApp &&
      collateral.address !== pseudoNativeAssetAddress &&
      displayCollateral.address !== pseudoNativeAssetAddress &&
      hasEnoughAllowance !== Ternary.True) ||
    amountError !== null ||
    isNegativeAmount ||
    (!isUpdated && collateral.address === pseudoNativeAssetAddress)

  let currencyFilters =
    collateral.address === wrapToken.address || collateral.address === pseudoNativeAssetAddress
      ? [wrapToken.address.toLowerCase(), pseudoNativeAssetAddress.toLowerCase()]
      : []

  if (collateralSymbol in CompoundTokenType) {
    if (baseCollateral.symbol.toLowerCase() === 'eth') {
      currencyFilters = [collateral.address, pseudoNativeAssetAddress.toLowerCase()]
    } else {
      currencyFilters = [collateral.address, baseCollateral.address]
    }
  }

  const switchOutcome = (value: number) => {
    console.log('switchOutcome', value)
    setNewShares(balances.map((balance, i) => (i === outcomeIndex ? balance.shares.add(tradedShares) : balance.shares)))
    setOutcomeIndex(value)
  }

  const setBuyCollateral = (token: Token) => {
    if (token.address === pseudoNativeAssetAddress && !(collateral.symbol.toLowerCase() in CompoundTokenType)) {
      setCollateral(token)
      setDisplayCollateral(token)
    } else {
      setDisplayCollateral(token)
    }
  }
  let displayNewShares = newShares
  if (newShares && collateralSymbol in CompoundTokenType && compoundService) {
    displayNewShares = newShares.map(function(ns) {
      return compoundService.calculateCTokenToBaseExchange(baseCollateral, ns)
    })
  }

  const setDisplayAmountToFund = (value: BigNumber) => {
    const collateralSymbol = collateral.symbol.toLowerCase()
    if (collateral.address !== displayCollateral.address && collateralSymbol in CompoundTokenType && compoundService) {
      const baseAmount = compoundService.calculateBaseToCTokenExchange(displayCollateral, value)
      setAmount(baseAmount)
    } else {
      setAmount(value)
    }
    setDisplayFundAmount(value)
  }

  return (
    <>
      <AccountsWrapper>
        <IdeaAccount
          category={category}
          checked={outcomeIndex === 0}
          name={first}
          onClick={() => switchOutcome(0)}
          order
          price={outcomeTokenMarginalPrices[0]}
        />
        <div
          style={{
            width: '50px',
            textAlign: 'center',
            color: 'grey',
            fontWeight: 500,
            fontSize: '0.8rem',
            marginTop: '5px',
          }}
        >
          vs
        </div>
        <IdeaAccount
          category={category}
          checked={outcomeIndex === 1}
          name={second}
          onClick={() => switchOutcome(1)}
          order
          price={outcomeTokenMarginalPrices[1]}
        />
      </AccountsWrapper>

      {/*<OutcomeTable*/}
      {/*  balances={balances}*/}
      {/*  collateral={collateral}*/}
      {/*  disabledColumns={[*/}
      {/*    OutcomeTableValue.Payout,*/}
      {/*    OutcomeTableValue.Outcome,*/}
      {/*    OutcomeTableValue.Probability,*/}
      {/*    OutcomeTableValue.Bonded,*/}
      {/*  ]}*/}
      {/*  displayBalances={displayBalances}*/}
      {/*  displayCollateral={baseCollateral}*/}
      {/*  newShares={displayNewShares}*/}
      {/*  outcomeHandleChange={(value: number) => switchOutcome(value)}*/}
      {/*  outcomeSelected={outcomeIndex}*/}
      {/*  probabilities={probabilities}*/}
      {/*  showPriceChange={amount?.gt(0)}*/}
      {/*  showSharesChange={amount?.gt(0)}*/}
      {/*/>*/}
      <WarningMessageStyled
        additionalDescription={'. Be aware that market makers may remove liquidity from the market at any time!'}
        description={
          "Before trading on a market, make sure that its outcome will be known by its resolution date and it isn't an"
        }
        href={DOCUMENT_VALIDITY_RULES}
        hyperlinkDescription={'invalid market'}
      />
      <GridTransactionDetails>
        <div>
          <CurrenciesWrapper>
            <CurrencySelector
              addBalances
              addNativeAsset
              balance={formatBigNumber(maybeCollateralBalance || Zero, displayCollateral.decimals, 5)}
              context={context}
              currency={displayCollateral.address}
              disabled={currencyFilters.length ? false : true}
              filters={currencyFilters}
              onSelect={(token: Token | null) => {
                if (token) {
                  setBuyCollateral(token)
                  setAmount(new BigNumber(0))
                  setAmountToDisplay('')
                  setDisplayAmountToFund(new BigNumber(0))
                }
              }}
            />
          </CurrenciesWrapper>
          <ReactTooltip id="walletBalanceTooltip" />

          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={displayCollateral.decimals}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setDisplayAmountToFund(e.value)
                  setAmountToDisplay('')
                }}
                style={{ width: 0 }}
                value={displayFundAmount}
                valueToDisplay={amountToDisplay}
              />
            }
            onClickMaxButton={() => {
              setDisplayAmountToFund(collateralBalance)
              setAmountToDisplay(formatBigNumber(collateralBalance, displayCollateral.decimals, 5))
            }}
            shouldDisplayMaxButton={shouldDisplayMaxButton}
            symbol={displayCollateral.symbol}
          />
          {amountError && <GenericError>{amountError}</GenericError>}
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow title={'Base Cost'} value={baseCostFormatted} />
            <TransactionDetailsRow
              title={'Fee'}
              tooltip={`A ${feePercentage}% fee goes to liquidity providers.`}
              value={feeFormatted}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow
              emphasizeValue={potentialProfit.gt(0)}
              state={ValueStates.success}
              title={'Potential Profit'}
              value={potentialProfitFormatted}
            />
            <TransactionDetailsRow
              emphasizeValue={parseFloat(sharesTotal) > 0}
              state={(parseFloat(sharesTotal) > 0 && ValueStates.important) || ValueStates.normal}
              title={'Total'}
              value={total}
            />
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
          marginBottom={!showSetAllowance}
        />
      )}
      {showSetAllowance && (
        <SetAllowance
          collateral={displayCollateral}
          finished={allowanceFinished && RemoteData.is.success(allowance)}
          loading={RemoteData.is.asking(allowance)}
          onUnlock={unlockCollateral}
        />
      )}
      {showUpgrade && (
        <SetAllowance
          collateral={nativeAsset}
          finished={upgradeFinished && RemoteData.is.success(proxyIsUpToDate)}
          loading={RemoteData.is.asking(proxyIsUpToDate)}
          onUnlock={upgradeProxy}
        />
      )}
      <StyledButtonContainer borderTop={true} marginTop={showSetAllowance || showUpgrade || isNegativeAmount}>
        {/*<Button buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab(MarketDetailsTab.swap)}>*/}
        {/*  Cancel*/}
        {/*</Button>*/}
        <Button
          buttonType={ButtonType.secondaryLine}
          disabled={isBuyDisabled}
          onClick={() => finish()}
          style={{ width: '100%', backgroundColor: '#0357E9', color: 'white' }}
        >
          Submit
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

export const MarketBuy = withRouter(MarketBuyWrapper)
