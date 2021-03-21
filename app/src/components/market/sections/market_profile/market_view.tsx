import React from 'react'
import { Helmet } from 'react-helmet'
import styled from 'styled-components'

import { DOCUMENT_TITLE } from '../../../../common/constants'
import { useCompoundService } from '../../../../hooks'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { useGraphMarketsFromQuestion } from '../../../../hooks/useGraphMarketsFromQuestion'
import { getContractAddress } from '../../../../util/networks'
import { isScalarMarket } from '../../../../util/tools'
import { MarketMakerData, MarketState } from '../../../../util/types'
import { SectionTitle, TextAlign } from '../../../common/text/section_title'
import { MarketData } from '../../common/market_data'
import { MarketTopDetailsOpen } from '../../common/market_top_details_open'

import { ClosedMarketDetails } from './market_status/closed'
import { OpenMarketDetails } from './market_status/open'

interface Props {
  account: Maybe<string>
  marketMakerData: MarketMakerData
  fetchGraphMarketMakerData: () => Promise<void>
}

const HeaderContainer = styled.div`
  margin-top: 15px;
  max-width: 100%;
  width: ${props => props.theme.mainContainer.maxWidth};
  flex-direction: row;
  justify-content: space-between;
  display: flex;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    flex-direction: column;
    margin-bottom: 20px;
    & > * + * {
      margin-top: 13px;
      margin-left: 0;
    }
  }
`

const MarketView: React.FC<Props> = (props: Props) => {
  const { marketMakerData } = props

  const {
    address,
    answerFinalizedTimestamp,
    arbitrator,
    collateral,
    collateralVolume,
    creationTimestamp,
    curatedByDxDao,
    curatedByDxDaoOrKleros,
    isQuestionFinalized,
    lastActiveDay,
    oracle,
    question,
    runningDailyVolumeByHour,
    scaledLiquidityParameter,
    submissionIDs,
  } = marketMakerData

  const context = useConnectedWeb3Context()

  const renderView = () => {
    const isScalar = isScalarMarket(oracle || '', context.networkId || 0)

    if (isQuestionFinalized) {
      return <ClosedMarketDetails isScalar={isScalar} {...props} />
    } else {
      return <OpenMarketDetails isScalar={isScalar} {...props} />
    }
  }

  console.log('market view:', marketMakerData)

  const ovmAddress = getContractAddress(context.networkId, 'omenVerifiedMarkets')
  const creationDate = new Date(1000 * parseInt(creationTimestamp))

  const currentTimestamp = new Date().getTime()

  const formattedLiquidity: string = scaledLiquidityParameter ? scaledLiquidityParameter.toFixed(2) : '0'

  const { compoundService: CompoundService } = useCompoundService(collateral, context)
  const compoundService = CompoundService || null

  // const finalizedTimestampDate = answerFinalizedTimestamp && new Date(answerFinalizedTimestamp.toNumber() * 1000)
  const isPendingArbitration = question.isPendingArbitration
  const arbitrationOccurred = question.arbitrationOccurred

  const marketState =
    question.resolution.getTime() > currentTimestamp
      ? MarketState.open
      : question.resolution.getTime() < currentTimestamp &&
        (answerFinalizedTimestamp === null || answerFinalizedTimestamp.toNumber() * 1000 > currentTimestamp)
      ? MarketState.finalizing
      : isPendingArbitration
      ? MarketState.arbitration
      : answerFinalizedTimestamp && answerFinalizedTimestamp.toNumber() * 1000 < currentTimestamp
      ? MarketState.closed
      : MarketState.none

  const { markets: marketsRelatedQuestion } = useGraphMarketsFromQuestion(question.id)

  return (
    <>
      <Helmet>
        <title>{`${question.title} - ${DOCUMENT_TITLE}`}</title>
      </Helmet>
      <div></div>
      <HeaderContainer>
        <SectionTitle goBack={true} textAlign={TextAlign.left} title={question.title} />
        <MarketData
          answerFinalizedTimestamp={marketMakerData.answerFinalizedTimestamp}
          collateralVolume={collateralVolume}
          compoundService={compoundService}
          currency={collateral}
          isFinalize={marketState === MarketState.finalizing}
          lastActiveDay={lastActiveDay}
          liquidity={formattedLiquidity}
          resolutionTimestamp={question.resolution}
          runningDailyVolumeByHour={runningDailyVolumeByHour}
        />
      </HeaderContainer>

      {renderView()}
    </>
  )
}

export { MarketView }
