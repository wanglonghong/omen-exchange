import { Zero } from 'ethers/constants'
import { BigNumber, bigNumberify } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { useConnectedWeb3Context, useContracts } from '../../../../hooks'
import {
  FpmmTradeDataType,
  HistoryType,
  useGraphFpmmTransactionsFromQuestion,
} from '../../../../hooks/useGraphFpmmTransactionsFromQuestion'
import { calcPrice, calcSellAmountInCollateral, formatBigNumber, formatTimestampToDate } from '../../../../util/tools'
import { HistoricData, Period } from '../../../../util/types'
import { ButtonRound, ButtonSelectable } from '../../../button'
import { Dropdown, DropdownPosition } from '../../../common/form/dropdown'
import { commonWrapperCSS } from '../common_styled'
import { HistoryChart } from '../history_chart'
import { HistoryTable } from '../history_table'

const DropdownMenu = styled(Dropdown)`
  margin-left: auto;
  min-width: 164px;
`

const ChartWrapper = styled.div`
  ${commonWrapperCSS}
`

const TitleWrapper = styled.div`
  align-items: center;
  // border-bottom: 1px solid ${props => props.theme.borders.borderDisabled};
  display: flex;
  margin: 0;
  padding: 20px 24px;
`

const ButtonsWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: flex-end;
`

const SelectWrapper = styled.div`
  display: flex;
`

type Props = {
  holdingSeries: Maybe<HistoricData>
  onChange: (s: Period) => void
  options: Period[]
  outcomes: string[]
  value: Period
  currency: string
  marketMakerAddress: string
  decimals: number
  fee: BigNumber
  scalarHigh?: Maybe<BigNumber>
  scalarLow?: Maybe<BigNumber>
  unit: string
  isScalar?: Maybe<boolean>
}

const ButtonSelectableStyled = styled(ButtonSelectable)<{ active?: boolean }>`
  color: ${props => (props.active ? props.theme.colors.primary : props.theme.colors.clickable)};
  font-weight: 500;

  width: 43px;
`
const ButtonSelect = styled(ButtonRound)`
  margin-right: 10px;
  padding: 20px 15px;
`

export const History_select: React.FC<Props> = ({
  currency,
  decimals,
  fee,
  holdingSeries,
  isScalar,
  marketMakerAddress,
  onChange,
  options,
  outcomes,
  scalarHigh,
  scalarLow,
  unit,
  value,
}) => {
  const context = useConnectedWeb3Context()

  const contracts = useContracts(context)
  const { buildMarketMaker } = contracts
  const marketMaker = buildMarketMaker(marketMakerAddress)
  const [sharesData, setSharesData] = useState<FpmmTradeDataType[]>([])
  const [sharesDataLoader, setSharesDataLoader] = useState<boolean>(true)

  const outcomeArray: string[] = outcomes.length ? outcomes : ['Short', 'Long']
  const data =
    holdingSeries &&
    holdingSeries
      .filter(h => !!h.block)
      .sort((a, b) => a.block.timestamp - b.block.timestamp)
      .map(h => {
        const prices = calcPrice(h.holdings.map(bigNumberify))
        const outcomesPrices: { [outcomeName: string]: number } = {}
        outcomeArray.forEach((k, i) => (outcomesPrices[k] = prices[i]))
        return { ...outcomesPrices, date: formatTimestampToDate(h.block.timestamp, value) }
      })
  const [toggleSelect, setToggleSelect] = useState(true)
  const [type, setType] = useState<HistoryType>(HistoryType.All)
  const DropdownItems = [
    {
      content: 'All Activities',
      onClick: () => {
        setType(HistoryType.All)
      },
    },
    {
      content: 'Liquidity',
      onClick: () => {
        setType(HistoryType.Liquidity)
      },
    },
    {
      content: 'Trades',
      onClick: () => {
        setType(HistoryType.Trades)
      },
    },
  ]
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(6)
  const marketFeeWithTwoDecimals = Number(formatBigNumber(fee, 18))
  const { fpmmTransactions, paginationNext, refetch, status } = useGraphFpmmTransactionsFromQuestion(
    marketMakerAddress,
    pageSize,
    pageIndex,
    type,
    decimals,
  )

  useEffect(() => {
    setSharesDataLoader(true)
    ;(async () => {
      if (fpmmTransactions) {
        const response: any[] = await Promise.all(
          fpmmTransactions.map(async item => {
            if (item.fpmmType === 'Liquidity') {
              const block: any = await marketMaker.getTransaction(item.transactionHash)

              return {
                blockNumber: block,
                id: item.id,
                amount: item.collateralTokenAmount,
                fpmmType: item.fpmmType,
                balances: await marketMaker.getBalanceInformationByBlock(
                  marketMakerAddress,
                  outcomeArray.length,
                  block.blockNumber,
                ),
                additionalShares: item.additionalSharesCost,
                collateralTokenAmount: new BigNumber(item.collateralTokenAmount),
              }
            }
            return {}
          }),
        )
        const newFpmmTradeArray: any[] = []
        fpmmTransactions.forEach(item => {
          if (item.fpmmType === 'Liquidity') {
            let sharesValue

            const findInResponse = response.find(element => element.id === item.id)
            if (findInResponse) {
              const { balances } = findInResponse
              let firstItem = balances[0]
              let outcomeIndex = 0

              balances.forEach((balance: BigNumber, index: number) => {
                if (balance.lt(firstItem)) {
                  firstItem = balance
                  outcomeIndex = index
                }
              })
              const holdingsOfOtherOutcomes = balances.filter((item: BigNumber, index: number) => {
                return index !== outcomeIndex
              })

              sharesValue = calcSellAmountInCollateral(
                item.additionalSharesCost,
                firstItem,
                holdingsOfOtherOutcomes,
                marketFeeWithTwoDecimals,
              )

              if (
                Number(item.additionalSharesCost) !== 0 &&
                sharesValue &&
                formatBigNumber(sharesValue, item.decimals, 3) !== '0.000'
              ) {
                newFpmmTradeArray.push({
                  sharesOrPoolTokenAmount: item.additionalSharesCost,
                  decimals: item.decimals,
                  collateralTokenAmount: sharesValue && sharesValue,
                  creationTimestamp: item.creationTimestamp,
                  id: item.id + 1,
                  transactionHash: item.transactionHash,
                  transactionType: 'Buy',
                  user: item.user,
                })
              }
            }

            const collateralBigNumber = new BigNumber(item.collateralTokenAmount)

            newFpmmTradeArray.push({
              sharesOrPoolTokenAmount: item.sharesOrPoolTokenAmount,
              decimals: item.decimals,
              creationTimestamp: item.creationTimestamp,
              id: item.id,
              collateralTokenAmount:
                sharesValue && collateralBigNumber.sub(sharesValue).gt(Zero)
                  ? collateralBigNumber.sub(sharesValue)
                  : collateralBigNumber,
              transactionHash: item.transactionHash,
              transactionType: item.transactionType,
              user: item.user,
            })
          } else {
            newFpmmTradeArray.push(item)
          }
        })

        setSharesDataLoader(false)
        setSharesData(newFpmmTradeArray)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fpmmTransactions])

  useEffect(() => {
    setPageIndex(0)
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])
  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const loadNextPage = () => {
    const newPageIndex = pageIndex + pageSize
    setSharesDataLoader(true)
    if (!paginationNext) {
      return
    }
    setPageIndex(newPageIndex)
  }
  const loadPrevPage = () => {
    if (pageIndex < 1) {
      return
    }
    const newPageIndex = pageIndex - pageSize
    setPageIndex(newPageIndex)
  }
  const notEnoughData = holdingSeries && holdingSeries.length <= 1 ? true : false

  return (
    <ChartWrapper>
      <TitleWrapper>
        {/*<SelectWrapper>*/}
        {/*  <ButtonSelect active={toggleSelect} onClick={() => setToggleSelect(true)}>*/}
        {/*    Activities*/}
        {/*  </ButtonSelect>*/}
        {/*  <ButtonSelect active={!toggleSelect} onClick={() => setToggleSelect(false)}>*/}
        {/*    Graph*/}
        {/*  </ButtonSelect>*/}
        {/*</SelectWrapper>*/}

        {/*{toggleSelect ? (*/}
        {/*  <DropdownMenu currentItem={type} dropdownPosition={DropdownPosition.right} items={DropdownItems} />*/}
        {/*) : (*/}
        {/*  <ButtonsWrapper>*/}
        {/*    {options.map((item, index) => {*/}
        {/*      return (*/}
        {/*        <ButtonSelectableStyled active={value === item} key={index} onClick={() => onChange(item)}>*/}
        {/*          {item}*/}
        {/*        </ButtonSelectableStyled>*/}
        {/*      )*/}
        {/*    })}*/}
        {/*  </ButtonsWrapper>*/}
        {/*)}*/}

        <ButtonsWrapper>
          {options.map((item, index) => {
            return (
              <ButtonSelectableStyled active={value === item} key={index} onClick={() => onChange(item)}>
                {item}
              </ButtonSelectableStyled>
            )
          })}
        </ButtonsWrapper>
      </TitleWrapper>

      <HistoryChart
        data={data}
        isScalar={isScalar}
        notEnoughData={notEnoughData}
        outcomes={outcomeArray}
        scalarHigh={scalarHigh}
        scalarLow={scalarLow}
        sharesDataLoader={sharesDataLoader}
        status={status}
        unit={unit}
      />

      {/*{toggleSelect ? (*/}
      {/*  <HistoryTable*/}
      {/*    currency={currency}*/}
      {/*    fpmmTrade={sharesData}*/}
      {/*    next={!paginationNext}*/}
      {/*    onLoadNextPage={loadNextPage}*/}
      {/*    onLoadPrevPage={loadPrevPage}*/}
      {/*    prev={pageIndex < 1}*/}
      {/*    sharesDataLoader={sharesDataLoader}*/}
      {/*    status={status}*/}
      {/*  />*/}
      {/*) : (*/}
      {/*  <HistoryChart*/}
      {/*    data={data}*/}
      {/*    isScalar={isScalar}*/}
      {/*    notEnoughData={notEnoughData}*/}
      {/*    outcomes={outcomeArray}*/}
      {/*    scalarHigh={scalarHigh}*/}
      {/*    scalarLow={scalarLow}*/}
      {/*    sharesDataLoader={sharesDataLoader}*/}
      {/*    status={status}*/}
      {/*    unit={unit}*/}
      {/*  />*/}
      {/*)}*/}
    </ChartWrapper>
  )
}
