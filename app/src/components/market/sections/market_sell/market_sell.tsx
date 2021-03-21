import { Zero } from 'ethers/constants'
import { BigNumber } from 'ethers/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import {
  useAsyncDerivedValue,
  useCompoundService,
  useConnectedCPKContext,
  useConnectedWeb3Context,
  useContracts,
  useSymbol,
} from '../../../../hooks'
import { MarketMakerService } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { getNativeAsset, getWrapToken } from '../../../../util/networks'
import {
  calcSellAmountInCollateral,
  computeBalanceAfterTrade,
  formatBigNumber,
  formatNumber,
  getInitialCollateral,
  getSharesInBaseToken,
  mulBN,
} from '../../../../util/tools'
import {
  BalanceItem,
  CompoundTokenType,
  MarketDetailsTab,
  MarketMakerData,
  OutcomeTableValue,
  Status,
  Token,
} from '../../../../util/types'
import { Button, ButtonContainer } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { BigNumberInput, TextfieldCustomPlaceholder } from '../../../common'
import { BigNumberInputReturn } from '../../../common/form/big_number_input'
import { FullLoading } from '../../../loading'
import { ModalTransactionResult } from '../../../modal/modal_transaction_result'
import { GenericError } from '../../common/common_styled'
import { GridTransactionDetails } from '../../common/grid_transaction_details'
import { IdeaAccount } from '../../common/list_item/idea_account'
import { OutcomeTable } from '../../common/outcome_table'
import { SwitchTransactionToken } from '../../common/switch_transaction_token'
import { TokenBalance } from '../../common/token_balance'
import { TransactionDetailsCard } from '../../common/transaction_details_card'
import { TransactionDetailsLine } from '../../common/transaction_details_line'
import { TransactionDetailsRow, ValueStates } from '../../common/transaction_details_row'
import { WarningMessage } from '../../common/warning_message'

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

const logger = getLogger('Market::Sell')

interface Props extends RouteComponentProps<any> {
  fetchGraphMarketMakerData: () => Promise<void>
  marketMakerData: MarketMakerData
  switchMarketTab: (arg0: MarketDetailsTab) => void
}

const MarketSellWrapper: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()
  const { buildMarketMaker, conditionalTokens } = useContracts(context)
  const { fetchGraphMarketMakerData, marketMakerData, switchMarketTab } = props
  const {
    address: marketMakerAddress,
    balances,
    collateral,
    fee,
    outcomeTokenMarginalPrices,
    question,
  } = marketMakerData

  console.log('MarketSellWrapper:', marketMakerData, fetchGraphMarketMakerData)

  const { category, title } = question

  const [first, , , second] = title.split(' ')

  let defaultOutcomeIndex = 0
  for (let i = 0; i < balances.length; i++) {
    const shares = parseInt(formatBigNumber(balances[i].shares, collateral.decimals))
    if (shares > 0) {
      defaultOutcomeIndex = i
      break
    }
  }

  const marketMaker = buildMarketMaker(marketMakerAddress)

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [outcomeIndex, setOutcomeIndex] = useState<number>(defaultOutcomeIndex)
  const [balanceItem, setBalanceItem] = useState<BalanceItem>(balances[outcomeIndex])
  const [amountShares, setAmountShares] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [amountSharesToDisplay, setAmountSharesToDisplay] = useState<string>('')
  const [displaySellShares, setDisplaySellShares] = useState<Maybe<BigNumber>>(new BigNumber(0))
  const [isNegativeAmountShares, setIsNegativeAmountShares] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const { networkId } = context
  const { compoundService: CompoundService } = useCompoundService(collateral, context)
  const compoundService = CompoundService || null

  const baseCollateral = getInitialCollateral(networkId, collateral)
  const [displayCollateral, setDisplayCollateral] = useState<Token>(baseCollateral)
  const [isModalTransactionResultOpen, setIsModalTransactionResultOpen] = useState(false)
  const [isTransactionProcessing, setIsTransactionProcessing] = useState<boolean>(false)
  const marketFeeWithTwoDecimals = Number(formatBigNumber(fee, 18))
  const collateralSymbol = collateral.symbol.toLowerCase()
  const symbol = useSymbol(displayCollateral)

  const wrapToken = getWrapToken(context.networkId)
  let displayTotalSymbol = symbol
  if (collateral.address === displayCollateral.address && collateral.address === wrapToken.address) {
    displayTotalSymbol = displayCollateral.symbol
  }
  useEffect(() => {
    setIsNegativeAmountShares(formatBigNumber(amountShares || Zero, collateral.decimals).includes('-'))
  }, [amountShares, collateral.decimals])
  useEffect(() => {
    setBalanceItem(balances[outcomeIndex])
    // eslint-disable-next-line
  }, [balances[outcomeIndex]])

  useEffect(() => {
    setOutcomeIndex(defaultOutcomeIndex)
    setBalanceItem(balances[defaultOutcomeIndex])
    setAmountShares(null)
    setAmountSharesToDisplay('')
    // eslint-disable-next-line
  }, [collateral.address])

  let displayBalances = balances
  if (
    baseCollateral.address !== collateral.address &&
    collateral.symbol.toLowerCase() in CompoundTokenType &&
    compoundService
  ) {
    displayBalances = getSharesInBaseToken(balances, compoundService, displayCollateral)
  }

  const calcSellAmount = useMemo(
    () => async (
      amountShares: BigNumber,
    ): Promise<[number[], Maybe<BigNumber>, Maybe<BigNumber>, Maybe<BigNumber>]> => {
      const holdings = balances.map(balance => balance.holdings)
      const holdingsOfSoldOutcome = holdings[outcomeIndex]
      const holdingsOfOtherOutcomes = holdings.filter((item, index) => {
        return index !== outcomeIndex
      })

      const amountToSell = calcSellAmountInCollateral(
        // If the transaction incur in some precision error, we need to multiply the amount by some factor, for example  amountShares.mul(99999).div(100000) , bigger the factor, less dust
        amountShares,
        holdingsOfSoldOutcome,
        holdingsOfOtherOutcomes,
        marketFeeWithTwoDecimals,
      )

      if (!amountToSell) {
        logger.warn(
          `Could not compute amount of collateral to sell for '${amountShares.toString()}' and '${holdingsOfSoldOutcome.toString()}'`,
        )
        return [[], null, null, null]
      }

      const balanceAfterTrade = computeBalanceAfterTrade(
        holdings,
        outcomeIndex,
        amountToSell.mul(-1), // negate amounts because it's a sale
        amountShares.mul(-1),
      )

      const pricesAfterTrade = MarketMakerService.getActualPrice(balanceAfterTrade)
      const potentialValue = mulBN(amountToSell, 1 / (1 - marketFeeWithTwoDecimals))
      const costFee = potentialValue.sub(amountToSell)
      const probabilities = pricesAfterTrade.map(priceAfterTrade => priceAfterTrade * 100)
      logger.log(`Amount to sell ${amountToSell}`)
      return [probabilities, costFee, amountToSell, potentialValue]
    },
    [outcomeIndex, balances, marketFeeWithTwoDecimals],
  )

  const [probabilities, costFee, tradedCollateral, potentialValue] = useAsyncDerivedValue(
    amountShares || Zero,
    [balances.map(() => 0), null, null, null],
    calcSellAmount,
  )

  let potentialValueNormalized = potentialValue
  let costFeeNormalized = costFee
  let normalizedTradedCollateral = tradedCollateral
  if (displayCollateral.address !== collateral.address && compoundService) {
    if (potentialValue && potentialValue.gt(0)) {
      potentialValueNormalized = compoundService.calculateCTokenToBaseExchange(displayCollateral, potentialValue)
    } else {
      potentialValueNormalized = new BigNumber('0')
    }
    if (costFee && costFee.gt(0)) {
      costFeeNormalized = compoundService.calculateCTokenToBaseExchange(displayCollateral, costFee)
    } else {
      costFeeNormalized = new BigNumber('0')
    }
    if (tradedCollateral && tradedCollateral.gt(0)) {
      normalizedTradedCollateral = compoundService.calculateCTokenToBaseExchange(displayCollateral, tradedCollateral)
    } else {
      normalizedTradedCollateral = new BigNumber('0')
    }
  }
  const finish = async () => {
    try {
      if (!tradedCollateral) {
        return
      }

      if (!cpk) {
        return
      }
      setIsTransactionProcessing(true)
      const sharesAmount = formatBigNumber(amountShares || Zero, collateral.decimals)
      let displaySharesAmount = sharesAmount
      if (collateral.symbol.toLowerCase() in CompoundTokenType && amountShares && compoundService) {
        const displaySharesAmountValue = compoundService.calculateCTokenToBaseExchange(baseCollateral, amountShares)
        displaySharesAmount = formatBigNumber(displaySharesAmountValue || Zero, baseCollateral.decimals)
      }
      setStatus(Status.Loading)
      setMessage(`Selling ${displaySharesAmount} shares...`)

      let useBaseToken = false
      if (collateral.address !== displayCollateral.address) {
        useBaseToken = true
      }
      await cpk.sellOutcomes({
        amount: tradedCollateral,
        compoundService,
        outcomeIndex,
        marketMaker,
        conditionalTokens,
        useBaseToken,
      })

      await fetchGraphMarketMakerData()
      setAmountSharesFromInput(new BigNumber('0'))
      setDisplaySellShares(null)
      setAmountShares(null)
      setStatus(Status.Ready)
      setMessage(`Successfully sold ${displaySharesAmount} '${balances[outcomeIndex].outcomeName}' shares.`)
      setIsTransactionProcessing(false)
    } catch (err) {
      setStatus(Status.Error)
      setMessage(`Error trying to sell '${balances[outcomeIndex].outcomeName}' shares.`)
      logger.error(`${message} - ${err.message}`)
      setIsTransactionProcessing(false)
    }
    setIsModalTransactionResultOpen(true)
  }

  const newShares = balances.map((balance, i) =>
    i === outcomeIndex ? balance.shares.sub(amountShares || Zero) : balance.shares,
  )
  let displayNewShares = newShares
  if (collateralSymbol in CompoundTokenType && compoundService) {
    displayNewShares = newShares.map(function(ns) {
      return compoundService.calculateCTokenToBaseExchange(baseCollateral, ns)
    })
  }
  const selectedOutcomeBalance = formatNumber(formatBigNumber(balanceItem.shares, collateral.decimals))
  let displaySelectedOutcomeBalance = selectedOutcomeBalance
  let displaySelectedOutcomeBalanceValue = balanceItem.shares
  if (collateralSymbol in CompoundTokenType && compoundService) {
    displaySelectedOutcomeBalanceValue = compoundService.calculateCTokenToBaseExchange(
      baseCollateral,
      balanceItem.shares,
    )
    displaySelectedOutcomeBalance = formatNumber(
      formatBigNumber(displaySelectedOutcomeBalanceValue, baseCollateral.decimals),
    )
  }

  const amountError = isTransactionProcessing
    ? null
    : balanceItem.shares === null
    ? null
    : balanceItem.shares.isZero() && amountShares?.gt(balanceItem.shares)
    ? `Insufficient balance`
    : amountShares?.gt(balanceItem.shares)
    ? `Value must be less than or equal to ${displaySelectedOutcomeBalance} shares`
    : null

  const setAmountSharesFromInput = (shares: BigNumber) => {
    if (collateralSymbol in CompoundTokenType && compoundService) {
      const actualAmountOfShares = compoundService.calculateBaseToCTokenExchange(baseCollateral, shares)
      setAmountShares(actualAmountOfShares)
    } else {
      setAmountShares(shares)
    }
    setDisplaySellShares(shares)
  }

  let sellAmountSharesDisplay = formatBigNumber(amountShares || Zero, collateral.decimals)
  if (collateralSymbol in CompoundTokenType && compoundService && amountShares) {
    const sellAmountSharesDisplayValue = compoundService.calculateCTokenToBaseExchange(baseCollateral, amountShares)
    sellAmountSharesDisplay = formatBigNumber(sellAmountSharesDisplayValue || Zero, baseCollateral.decimals)
  }

  const isSellButtonDisabled =
    !amountShares ||
    Number(sellAmountSharesDisplay) == 0 ||
    (status !== Status.Ready && status !== Status.Error) ||
    amountShares?.isZero() ||
    amountError !== null ||
    isNegativeAmountShares
  let toggleCollateral = collateral
  if (collateralSymbol in CompoundTokenType) {
    if (collateral.address === displayCollateral.address) {
      toggleCollateral = baseCollateral
    } else {
      toggleCollateral = collateral
    }
  } else {
    if (collateral.address === wrapToken.address) {
      if (displayCollateral.address === wrapToken.address) {
        toggleCollateral = getNativeAsset(context.networkId)
      } else {
        toggleCollateral = getWrapToken(context.networkId)
      }
    }
  }
  const setToggleCollateral = () => {
    if (collateralSymbol in CompoundTokenType) {
      if (displayCollateral.address === baseCollateral.address) {
        setDisplayCollateral(collateral)
      } else {
        setDisplayCollateral(baseCollateral)
      }
    } else {
      if (displayCollateral.address === wrapToken.address) {
        setDisplayCollateral(getNativeAsset(context.networkId))
      } else {
        setDisplayCollateral(getWrapToken(context.networkId))
      }
    }
  }

  const switchBalance = (value: number) => {
    console.log('switchBalance', value)

    setOutcomeIndex(value)
    setBalanceItem(balances[value])
  }

  return (
    <>
      <AccountsWrapper>
        <IdeaAccount
          category={category}
          checked={outcomeIndex === 0}
          name={first}
          onClick={() => switchBalance(0)}
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
          onClick={() => switchBalance(1)}
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
      {/*  displayCollateral={displayCollateral}*/}
      {/*  newShares={displayNewShares}*/}
      {/*  outcomeHandleChange={(value: number) => {*/}
      {/*    setOutcomeIndex(value)*/}
      {/*    setBalanceItem(balances[value])*/}
      {/*  }}*/}
      {/*  outcomeSelected={outcomeIndex}*/}
      {/*  probabilities={probabilities}*/}
      {/*  showPriceChange={amountShares?.gt(0)}*/}
      {/*  showSharesChange={amountShares?.gt(0)}*/}
      {/*/>*/}
      <GridTransactionDetails>
        <div>
          <TokenBalance text="Your Shares" value={formatNumber(displaySelectedOutcomeBalance)} />
          <ReactTooltip id="walletBalanceTooltip" />
          <TextfieldCustomPlaceholder
            formField={
              <BigNumberInput
                decimals={baseCollateral.decimals}
                name="amount"
                onChange={(e: BigNumberInputReturn) => {
                  setAmountSharesFromInput(e.value)
                  setAmountSharesToDisplay('')
                }}
                style={{ width: 0 }}
                value={displaySellShares}
                valueToDisplay={amountSharesToDisplay}
              />
            }
            onClickMaxButton={() => {
              setAmountSharesFromInput(displaySelectedOutcomeBalanceValue)
              setAmountSharesToDisplay(formatBigNumber(displaySelectedOutcomeBalanceValue, baseCollateral.decimals, 5))
            }}
            shouldDisplayMaxButton
            symbol={'Shares'}
          />
          {amountError && <GenericError>{amountError}</GenericError>}
        </div>
        <div>
          <TransactionDetailsCard>
            <TransactionDetailsRow title={'Sell Amount'} value={`${formatNumber(sellAmountSharesDisplay)} Shares`} />
            <TransactionDetailsRow
              emphasizeValue={potentialValueNormalized ? potentialValueNormalized.gt(0) : false}
              state={ValueStates.success}
              title={'Profit'}
              value={
                potentialValueNormalized
                  ? `${formatNumber(formatBigNumber(potentialValueNormalized, displayCollateral.decimals, 2))} 
                  ${symbol}`
                  : '0.00'
              }
            />
            <TransactionDetailsRow
              title={'Trading Fee'}
              value={`${
                costFeeNormalized
                  ? formatNumber(formatBigNumber(costFeeNormalized.mul(-1), displayCollateral.decimals, 2))
                  : '0.00'
              } ${symbol}`}
            />
            <TransactionDetailsLine />
            <TransactionDetailsRow
              emphasizeValue={
                (tradedCollateral && parseFloat(formatBigNumber(tradedCollateral, collateral.decimals, 2)) > 0) || false
              }
              state={
                (tradedCollateral &&
                  parseFloat(formatBigNumber(tradedCollateral, collateral.decimals, 2)) > 0 &&
                  ValueStates.important) ||
                ValueStates.normal
              }
              title={'Total'}
              value={`${
                normalizedTradedCollateral
                  ? formatNumber(formatBigNumber(normalizedTradedCollateral, displayCollateral.decimals, 2))
                  : '0.00'
              } ${displayTotalSymbol}`}
            />
            {collateral.address === wrapToken.address || collateralSymbol in CompoundTokenType ? (
              <SwitchTransactionToken onToggleCollateral={setToggleCollateral} toggleCollatral={toggleCollateral} />
            ) : (
              <span />
            )}
          </TransactionDetailsCard>
        </div>
      </GridTransactionDetails>
      {isNegativeAmountShares && (
        <WarningMessage
          additionalDescription={''}
          danger={true}
          description={`Your sell amount should not be negative.`}
          href={''}
          hyperlinkDescription={''}
          marginBottom={true}
        />
      )}
      <StyledButtonContainer borderTop={true} marginTop={isNegativeAmountShares}>
        {/*<Button buttonType={ButtonType.secondaryLine} onClick={() => switchMarketTab(MarketDetailsTab.swap)}>*/}
        {/*  Cancel*/}
        {/*</Button>*/}
        <Button
          buttonType={ButtonType.secondaryLine}
          disabled={isSellButtonDisabled}
          onClick={() => finish()}
          style={{ width: '100%', backgroundColor: '#0357E9', color: 'white' }}
        >
          Submit
        </Button>
      </StyledButtonContainer>
      <ModalTransactionResult
        isOpen={isModalTransactionResultOpen}
        onClose={() => setIsModalTransactionResultOpen(false)}
        status={status}
        text={message}
        title={status === Status.Error ? 'Transaction Error' : 'Sell Shares'}
      />
      {status === Status.Loading && <FullLoading message={message} />}
    </>
  )
}

export const MarketSell = withRouter(MarketSellWrapper)
