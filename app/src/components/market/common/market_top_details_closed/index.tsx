import { BigNumber } from 'ethers/utils'
import React, { useState } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'

import { useConnectedWeb3Context } from '../../../../hooks'
import { useGraphMarketsFromQuestion } from '../../../../hooks/useGraphMarketsFromQuestion'
import { useWindowDimensions } from '../../../../hooks/useWindowDimensions'
import { CompoundService } from '../../../../services'
import theme from '../../../../theme'
import { getContractAddress, getNativeAsset, getWrapToken } from '../../../../util/networks'
import { getMarketRelatedQuestionFilter, onChangeMarketCurrency } from '../../../../util/tools'
import { MarketMakerData, MarketState, Token } from '../../../../util/types'
import { SubsectionTitleWrapper } from '../../../common'
import { AdditionalMarketData } from '../additional_market_data'
import { CurrencySelector } from '../currency_selector'
import { MarketData } from '../market_data'
import { ProgressBar } from '../progress_bar'
import { ProgressBarToggle } from '../progress_bar/toggle'

const SubsectionTitleLeftWrapper = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    flex-grow: 1;
  }
  & > * + * {
    margin-left: 12px;
  }
`

const MarketCurrencySelector = styled(CurrencySelector)`
  .dropdownItems {
    min-width: auto;
  }
`
interface Props {
  marketMakerData: MarketMakerData
  collateral: BigNumber
  compoundService: CompoundService | null
}

const MarketTopDetailsClosed: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { compoundService, marketMakerData } = props
  const history = useHistory()

  const { width } = useWindowDimensions()
  const isMobile = width <= parseInt(theme.themeBreakPoints.sm)

  const {
    address,
    answerFinalizedTimestamp,
    arbitrator,
    collateral,
    collateralVolume,
    creationTimestamp,
    curatedByDxDao,
    curatedByDxDaoOrKleros,
    lastActiveDay,
    question,
    runningDailyVolumeByHour,
    scaledLiquidityParameter,
    submissionIDs,
  } = marketMakerData
  const { title } = question
  const ovmAddress = getContractAddress(context.networkId, 'omenVerifiedMarkets')

  const [showingProgressBar, setShowingProgressBar] = useState(false)

  const creationDate = new Date(1000 * parseInt(creationTimestamp))

  const formattedLiquidity: string = scaledLiquidityParameter ? scaledLiquidityParameter.toFixed(2) : '0'

  const isPendingArbitration = question.isPendingArbitration
  const arbitrationOccurred = question.arbitrationOccurred

  const { markets: marketsRelatedQuestion } = useGraphMarketsFromQuestion(question.id)

  const toggleProgressBar = () => {
    setShowingProgressBar(!showingProgressBar)
  }

  const nativeAssetAddress = getNativeAsset(context.networkId).address.toLowerCase()
  const wrapTokenAddress = getWrapToken(context.networkId).address.toLowerCase()
  const filter = getMarketRelatedQuestionFilter(marketsRelatedQuestion, context.networkId)

  return (
    <>
      <SubsectionTitleWrapper>
        <SubsectionTitleLeftWrapper>
          {marketsRelatedQuestion.length > 1 && (
            <MarketCurrencySelector
              addNativeAsset
              context={context}
              currency={collateral.address === wrapTokenAddress ? nativeAssetAddress : collateral.address}
              disabled={false}
              filters={filter}
              onSelect={(currency: Token | null) =>
                onChangeMarketCurrency(marketsRelatedQuestion, currency, collateral, context.networkId, history)
              }
              placeholder=""
            />
          )}
          {(!isMobile || marketsRelatedQuestion.length === 1) && (
            <ProgressBarToggle
              active={showingProgressBar}
              state={'closed'}
              templateId={question.templateId}
              toggleProgressBar={toggleProgressBar}
            ></ProgressBarToggle>
          )}
        </SubsectionTitleLeftWrapper>
      </SubsectionTitleWrapper>
      {showingProgressBar && (
        <ProgressBar
          answerFinalizedTimestamp={answerFinalizedTimestamp}
          arbitrationOccurred={arbitrationOccurred}
          bondTimestamp={question.currentAnswerTimestamp}
          creationTimestamp={creationDate}
          pendingArbitration={isPendingArbitration}
          resolutionTimestamp={question.resolution}
          state={MarketState.closed}
        ></ProgressBar>
      )}
      <MarketData
        answerFinalizedTimestamp={marketMakerData.answerFinalizedTimestamp}
        collateralVolume={collateralVolume}
        compoundService={compoundService}
        currency={collateral}
        lastActiveDay={lastActiveDay}
        liquidity={formattedLiquidity}
        resolutionTimestamp={question.resolution}
        runningDailyVolumeByHour={runningDailyVolumeByHour}
      ></MarketData>
      <AdditionalMarketData
        address={address}
        arbitrator={arbitrator}
        category={question.category}
        collateral={collateral}
        curatedByDxDao={curatedByDxDao}
        curatedByDxDaoOrKleros={curatedByDxDaoOrKleros}
        id={question.id}
        oracle="Reality.eth"
        ovmAddress={ovmAddress}
        submissionIDs={submissionIDs}
        title={title}
      ></AdditionalMarketData>
    </>
  )
}

export { MarketTopDetailsClosed }
