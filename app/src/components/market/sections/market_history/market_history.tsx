import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import { MarketMakerData } from '../../../../util/types'
import { HistorySelectContainer } from '../../common/history_section'

interface Props extends RouteComponentProps<any> {
  marketMakerData: MarketMakerData
}

const MarketHistoryWrapper: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props
  const {
    address: marketMakerAddress,
    answerFinalizedTimestamp,
    collateral,
    fee,
    oracle,
    question,
    scalarHigh,
    scalarLow,
  } = marketMakerData

  return (
    <>
      <HistorySelectContainer
        answerFinalizedTimestamp={answerFinalizedTimestamp}
        currency={collateral.symbol}
        decimals={collateral.decimals}
        fee={fee}
        hidden={false}
        marketMakerAddress={marketMakerAddress}
        oracle={oracle}
        outcomes={question.outcomes}
        scalarHigh={scalarHigh}
        scalarLow={scalarLow}
        unit={question.title && question.title.includes('[') ? question.title.split('[')[1].split(']')[0] : ''}
      />
    </>
  )
}

export const MarketHistory = withRouter(MarketHistoryWrapper)
