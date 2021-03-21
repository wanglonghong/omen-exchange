import { BigNumber } from 'ethers/utils'
import React, { useEffect, useState } from 'react'
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom'
// import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { Nav, NavItem, NavLink } from 'reactstrap'
import styled from 'styled-components'

import { useCompoundService, useConnectedCPKContext, useGraphMarketUserTxData } from '../../../../../hooks'
import { WhenConnected, useConnectedWeb3Context } from '../../../../../hooks/connectedWeb3'
import { useRealityLink } from '../../../../../hooks/useRealityLink'
import { getNativeAsset, getToken } from '../../../../../util/networks'
import { getSharesInBaseToken, getUnit, isDust } from '../../../../../util/tools'
import {
  BalanceItem,
  CompoundTokenType,
  MarketDetailsTab,
  MarketMakerData,
  OutcomeTableValue,
  Token,
} from '../../../../../util/types'
import { Button, ButtonContainer } from '../../../../button'
import { ButtonType } from '../../../../button/button_styling_types'
import { Card } from '../../../../common'
import { MarketScale } from '../../../common/market_scale'
import { MarketTopDetailsOpen } from '../../../common/market_top_details_open'
import { OutcomeTable } from '../../../common/outcome_table'
import { ViewCard } from '../../../common/view_card'
import { WarningMessage } from '../../../common/warning_message'
import { MarketBondContainer } from '../../market_bond/market_bond_container'
import { MarketBuyContainer } from '../../market_buy/market_buy_container'
import { MarketHistoryContainer } from '../../market_history/market_history_container'
import { MarketNavigation } from '../../market_navigation'
import { MarketPoolLiquidityContainer } from '../../market_pooling/market_pool_liquidity_container'
import { MarketSellContainer } from '../../market_sell/market_sell_container'
import { MarketVerifyContainer } from '../../market_verify/market_verify_container'
import './tab.scss'
import { IdeaAccount } from '../../../common/list_item/idea_account'

import 'react-tabs/style/react-tabs.scss'

import classnames from 'classnames'

export const TopCard = styled(ViewCard)`
  padding: 24px;
  padding-bottom: 0;
  margin-bottom: 24px;
`

export const BottomCard = styled(ViewCard)``

const MessageWrapper = styled.div`
  border-radius: 4px;
  border: ${({ theme }) => theme.borders.borderLineDisabled};
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 20px 25px;
`

const MainContainer = styled.div`
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

const ChartWrapper = styled(Card)`
  width: 58%;
  padding: 0 5px 0 5px;

  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    width: 100%;
  }
`

const BuySellWrapper = styled(Card)`
  width: 40%;
  @media (max-width: ${props => props.theme.themeBreakPoints.md}) {
    width: 100%;
  }
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
  line-height: 1.2;
  margin: 0 0 8px;
`

const Text = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  font-weight: normal;
  letter-spacing: 0.2px;
  line-height: 1.5;
  margin: 0;
`

export const StyledButtonContainer = styled(ButtonContainer)`
  margin: 0 -24px;
  margin-bottom: -1px;
  padding: 20px 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &.border {
    border-top: 1px solid ${props => props.theme.colors.verticalDivider};
  }
`

const MarketBottomNavGroupWrapper = styled.div`
  display: flex;
  align-items: center;

  & > * + * {
    margin-left: 12px;
  }
`

const MarketBottomFinalizeNavGroupWrapper = styled.div`
  display: flex;
  align-items: center;

  & > * + * {
    margin-left: 12px;
  }
`

const WarningMessageStyled = styled(WarningMessage)`
  margin-top: 20px;
`

interface Props extends RouteComponentProps<Record<string, string | undefined>> {
  account: Maybe<string>
  isScalar: boolean
  marketMakerData: MarketMakerData
  fetchGraphMarketMakerData: () => Promise<void>
}

const Wrapper = (props: Props) => {
  const { fetchGraphMarketMakerData, isScalar, marketMakerData } = props
  const realitioBaseUrl = useRealityLink()
  const history = useHistory()
  const context = useConnectedWeb3Context()
  const cpk = useConnectedCPKContext()

  const {
    address: marketMakerAddress,
    balances,
    collateral,
    creator,
    fee,
    isQuestionFinalized,
    outcomeTokenMarginalPrices,
    payouts,
    question,
    scalarHigh,
    scalarLow,
    totalPoolShares,
  } = marketMakerData

  const [displayCollateral, setDisplayCollateral] = useState<Token>(collateral)
  const { networkId } = context
  const isQuestionOpen = question.resolution.valueOf() < Date.now()
  const { compoundService: CompoundService } = useCompoundService(collateral, context)
  const compoundService = CompoundService || null

  const [activeTab, setActiveTab] = useState('buy')

  const toggle = (tab: string) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const setCurrentDisplayCollateral = () => {
    // if collateral is a cToken then convert the collateral and balances to underlying token
    const collateralSymbol = collateral.symbol.toLowerCase()
    if (collateralSymbol in CompoundTokenType) {
      const baseCollateralSymbol = collateralSymbol.substring(1, collateralSymbol.length)
      let baseCollateralToken = collateral
      if (baseCollateralSymbol === 'eth') {
        baseCollateralToken = getNativeAsset(networkId)
      } else {
        baseCollateralToken = getToken(networkId, baseCollateralSymbol as KnownToken)
      }
      setDisplayCollateral(baseCollateralToken)
    } else {
      setDisplayCollateral(collateral)
    }
  }
  useEffect(() => {
    const timeDifference = new Date(question.resolution).getTime() - new Date().getTime()
    const maxTimeDifference = 86400000
    if (timeDifference > 0 && timeDifference < maxTimeDifference) {
      setTimeout(callAfterTimeout, timeDifference + 2000)
    }
    function callAfterTimeout() {
      fetchGraphMarketMakerData()
      setCurrentTab(MarketDetailsTab.finalize)
    }
    setCurrentDisplayCollateral()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setCurrentDisplayCollateral()
  }, [collateral.symbol]) // eslint-disable-line react-hooks/exhaustive-deps
  let displayBalances = balances
  if (
    compoundService &&
    collateral.address !== displayCollateral.address &&
    collateral.symbol.toLowerCase() in CompoundTokenType
  ) {
    displayBalances = getSharesInBaseToken(balances, compoundService, displayCollateral)
  }
  const userHasShares = balances.some((balanceItem: BalanceItem) => {
    const { shares } = balanceItem
    return shares && !isDust(shares, collateral.decimals)
  })

  const probabilities = balances.map(balance => balance.probability)
  const hasFunding = totalPoolShares.gt(0)

  const renderTableData = () => {
    const disabledColumns = [
      OutcomeTableValue.Payout,
      OutcomeTableValue.Outcome,
      OutcomeTableValue.Probability,
      OutcomeTableValue.Bonded,
    ]
    if (!userHasShares) {
      disabledColumns.push(OutcomeTableValue.Shares)
    }
    return (
      <OutcomeTable
        balances={balances}
        collateral={collateral}
        disabledColumns={disabledColumns}
        displayBalances={displayBalances}
        displayCollateral={displayCollateral}
        displayRadioSelection={false}
        probabilities={probabilities}
      />
    )
  }

  const renderFinalizeTableData = () => {
    const disabledColumns = [
      OutcomeTableValue.OutcomeProbability,
      OutcomeTableValue.Probability,
      OutcomeTableValue.CurrentPrice,
      OutcomeTableValue.Payout,
    ]

    return (
      <OutcomeTable
        balances={balances}
        bonds={question.bonds}
        collateral={collateral}
        disabledColumns={disabledColumns}
        displayRadioSelection={false}
        isBond
        payouts={payouts}
        probabilities={probabilities}
        withWinningOutcome
      />
    )
  }

  const openQuestionMessage = (
    <MessageWrapper>
      <Title>The question is being resolved.</Title>
      <Text>You will be able to redeem your winnings as soon as the market is resolved.</Text>
    </MessageWrapper>
  )

  const openInRealitioButton = (
    <Button
      buttonType={ButtonType.secondaryLine}
      onClick={() => {
        window.open(`${realitioBaseUrl}/#!/question/${question.id}`)
      }}
    >
      Answer on Reality.eth
    </Button>
  )

  const finalizeButtons = (
    <MarketBottomFinalizeNavGroupWrapper>
      <Button
        buttonType={ButtonType.secondaryLine}
        onClick={() => {
          window.open(`${realitioBaseUrl}/#!/question/${question.id}`)
        }}
      >
        Call Arbitrator
      </Button>
      <Button
        buttonType={ButtonType.primary}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.setOutcome)
        }}
      >
        Set Outcome
      </Button>
    </MarketBottomFinalizeNavGroupWrapper>
  )

  const buySellButtons = (
    <MarketBottomNavGroupWrapper>
      <Button
        buttonType={ButtonType.secondaryLine}
        disabled={!userHasShares || !hasFunding}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.sell)
        }}
      >
        Sell
      </Button>
      <Button
        buttonType={ButtonType.secondaryLine}
        disabled={!hasFunding}
        onClick={() => {
          setCurrentTab(MarketDetailsTab.buy)
        }}
      >
        Buy
      </Button>
    </MarketBottomNavGroupWrapper>
  )

  const isFinalizing = question.resolution < new Date() && !isQuestionFinalized

  const [currentTab, setCurrentTab] = useState(
    isQuestionFinalized || !isFinalizing ? MarketDetailsTab.swap : MarketDetailsTab.finalize,
  )

  const switchMarketTab = (newTab: MarketDetailsTab) => {
    setCurrentTab(newTab)
  }

  const isMarketCreator = cpk && creator === cpk.address.toLowerCase()

  const { fetchData: fetchGraphMarketUserTxData, liquidityTxs, status, trades } = useGraphMarketUserTxData(
    marketMakerAddress,
    cpk?.address.toLowerCase(),
    isMarketCreator || false,
    context.networkId,
  )

  useEffect(() => {
    if ((isQuestionFinalized || !isFinalizing) && currentTab === MarketDetailsTab.finalize) {
      setCurrentTab(MarketDetailsTab.buy)
    }
    // eslint-disable-next-line
  }, [isQuestionFinalized, isFinalizing])

  const [tabIndex, setTabIndex] = useState(0)

  return (
    <>
      {/*<TopCard>*/}
      {/*  <MarketTopDetailsOpen marketMakerData={marketMakerData} />*/}
      {/*</TopCard>*/}

      <MainContainer>
        <ChartWrapper>
          <MarketHistoryContainer marketMakerData={marketMakerData} />
        </ChartWrapper>

        <BuySellWrapper className="tabs tabs--justify tabs--bordered-bottom">
          <Nav tabs>
            <NavItem>
              <NavLink className={classnames({ active: tabIndex === 0 })} onClick={() => setTabIndex(0)}>
                Buy
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={classnames({ active: tabIndex === 1 })} onClick={() => setTabIndex(1)}>
                Sell
              </NavLink>
            </NavItem>
          </Nav>

          <Tabs selectedIndex={tabIndex}>
            <TabPanel>
              <MarketBuyContainer
                fetchGraphMarketMakerData={fetchGraphMarketMakerData}
                fetchGraphMarketUserTxData={fetchGraphMarketUserTxData}
                isScalar={isScalar}
                marketMakerData={marketMakerData}
                switchMarketTab={switchMarketTab}
              />
            </TabPanel>
            <TabPanel>
              <MarketSellContainer
                currentTab={currentTab}
                fetchGraphMarketMakerData={fetchGraphMarketMakerData}
                fetchGraphMarketUserTxData={fetchGraphMarketUserTxData}
                isScalar={isScalar}
                marketMakerData={marketMakerData}
                switchMarketTab={switchMarketTab}
              />
            </TabPanel>
          </Tabs>

          {/*{currentTab === MarketDetailsTab.buy && (*/}
          {/*  <MarketBuyContainer*/}
          {/*    fetchGraphMarketMakerData={fetchGraphMarketMakerData}*/}
          {/*    fetchGraphMarketUserTxData={fetchGraphMarketUserTxData}*/}
          {/*    isScalar={isScalar}*/}
          {/*    marketMakerData={marketMakerData}*/}
          {/*    switchMarketTab={switchMarketTab}*/}
          {/*  />*/}
          {/*)}*/}
          {/*{currentTab === MarketDetailsTab.sell && (*/}
          {/*  <MarketSellContainer*/}
          {/*    currentTab={currentTab}*/}
          {/*    fetchGraphMarketMakerData={fetchGraphMarketMakerData}*/}
          {/*    fetchGraphMarketUserTxData={fetchGraphMarketUserTxData}*/}
          {/*    isScalar={isScalar}*/}
          {/*    marketMakerData={marketMakerData}*/}
          {/*    switchMarketTab={switchMarketTab}*/}
          {/*  />*/}
          {/*)}*/}
        </BuySellWrapper>
      </MainContainer>

      <BottomCard>
        {/*<MarketNavigation*/}
        {/*  activeTab={currentTab}*/}
        {/*  marketMakerData={marketMakerData}*/}
        {/*  switchMarketTab={switchMarketTab}*/}
        {/*></MarketNavigation>*/}

        {/*{currentTab === MarketDetailsTab.swap && (*/}
        {/*  <>*/}
        {/*    {isScalar ? (*/}
        {/*      <>*/}
        {/*        <MarketScale*/}
        {/*          balances={balances}*/}
        {/*          borderTop={true}*/}
        {/*          collateral={collateral}*/}
        {/*          currentPrediction={outcomeTokenMarginalPrices ? outcomeTokenMarginalPrices[1] : null}*/}
        {/*          fee={fee}*/}
        {/*          liquidityTxs={liquidityTxs}*/}
        {/*          lowerBound={scalarLow || new BigNumber(0)}*/}
        {/*          positionTable={true}*/}
        {/*          startingPointTitle={'Current prediction'}*/}
        {/*          status={status}*/}
        {/*          trades={trades}*/}
        {/*          unit={getUnit(question.title)}*/}
        {/*          upperBound={scalarHigh || new BigNumber(0)}*/}
        {/*        />*/}
        {/*      </>*/}
        {/*    ) : (*/}
        {/*      renderTableData()*/}
        {/*    )}*/}
        {/*    {!hasFunding && !isQuestionOpen && (*/}
        {/*      <WarningMessageStyled*/}
        {/*        additionalDescription={''}*/}
        {/*        description={'Trading is disabled due to lack of liquidity.'}*/}
        {/*        grayscale={true}*/}
        {/*        href={''}*/}
        {/*        hyperlinkDescription={''}*/}
        {/*      />*/}
        {/*    )}*/}
        {/*    <WhenConnected>*/}
        {/*      <StyledButtonContainer className={!hasFunding || isQuestionOpen ? 'border' : ''}>*/}
        {/*        <Button*/}
        {/*          buttonType={ButtonType.secondaryLine}*/}
        {/*          onClick={() => {*/}
        {/*            history.goBack()*/}
        {/*          }}*/}
        {/*        >*/}
        {/*          Back*/}
        {/*        </Button>*/}
        {/*        {isQuestionOpen ? openInRealitioButton : buySellButtons}*/}
        {/*      </StyledButtonContainer>*/}
        {/*    </WhenConnected>*/}
        {/*  </>*/}
        {/*)}*/}
        {currentTab === MarketDetailsTab.finalize ? (
          !isScalar ? (
            <>
              {renderFinalizeTableData()}
              <WhenConnected>
                <StyledButtonContainer className={!hasFunding ? 'border' : ''}>
                  <Button
                    buttonType={ButtonType.secondaryLine}
                    onClick={() => {
                      history.goBack()
                    }}
                  >
                    Back
                  </Button>
                  {finalizeButtons}
                </StyledButtonContainer>
              </WhenConnected>
            </>
          ) : (
            <>
              <MarketScale
                borderTop={true}
                currentPrediction={outcomeTokenMarginalPrices ? outcomeTokenMarginalPrices[1] : null}
                lowerBound={scalarLow || new BigNumber(0)}
                startingPointTitle={'Current prediction'}
                unit={getUnit(question.title)}
                upperBound={scalarHigh || new BigNumber(0)}
              />
              {openQuestionMessage}
              <WhenConnected>
                <StyledButtonContainer className={!hasFunding || isQuestionOpen ? 'border' : ''}>
                  <Button
                    buttonType={ButtonType.secondaryLine}
                    onClick={() => {
                      history.goBack()
                    }}
                  >
                    Back
                  </Button>
                  {isQuestionOpen ? openInRealitioButton : buySellButtons}
                </StyledButtonContainer>
              </WhenConnected>
            </>
          )
        ) : null}
        {currentTab === MarketDetailsTab.setOutcome && (
          <MarketBondContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
        {currentTab === MarketDetailsTab.pool && (
          <MarketPoolLiquidityContainer
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            fetchGraphMarketUserTxData={fetchGraphMarketUserTxData}
            isScalar={isScalar}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}

        {currentTab === MarketDetailsTab.verify && (
          <MarketVerifyContainer
            context={context}
            fetchGraphMarketMakerData={fetchGraphMarketMakerData}
            marketMakerData={marketMakerData}
            switchMarketTab={switchMarketTab}
          />
        )}
      </BottomCard>
    </>
  )
}

export const OpenMarketDetails = withRouter(Wrapper)
