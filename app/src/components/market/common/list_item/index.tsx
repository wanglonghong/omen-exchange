import moment from 'moment'
import React, { HTMLAttributes, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { useConnectedWeb3Context, useSymbol } from '../../../../hooks'
import { ERC20Service } from '../../../../services'
import { getLogger } from '../../../../util/logger'
import { getTokenFromAddress } from '../../../../util/networks'
import {
  calcPrediction,
  calcPrice,
  formatBigNumber,
  formatNumber,
  formatToShortNumber,
  getScalarTitle,
  getUnit,
  isScalarMarket,
} from '../../../../util/tools'
import { MarketMakerDataItem, Token } from '../../../../util/types'
import { IconStar } from '../../../common/icons/IconStar'

import { IdeaAccount } from './idea_account'

const Wrapper = styled(NavLink)`
  border: 2px solid #eae5e5;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 22px 25px;
  text-decoration: none;
  position: relative;

  &:active,
  &:hover {
    background-color: ${props => props.theme.colors.activeListItemBackground};
  }
`

const Title = styled.h2`
  color: ${props => props.theme.colors.textColorDarker};
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0 0 10px 0;
`

const Info = styled.div`
  font-family: 'Roboto';
  align-items: center;
  color: ${props => props.theme.colors.textColorLighter};
  display: flex;
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  overflow-wrap: break-word;
  white-space: normal;
  word-break: break-all;
`

const Outcome = styled.span`
  color: ${props => props.theme.colors.primaryLight};
  margin-left: 8px;
  font-weight: 500;
`

const Separator = styled.span`
  font-size: 18px;
  margin: 0 8px;
  color: ${props => props.theme.colors.verticalDivider};
`

const FeatureTitle = styled.div`
  position: absolute;
  top: -20px;
  color: black;
  left: 0;
`

const FeatureSpan = styled.span`
  background: blue;
  border-radius: 3px;
  padding: 1px 4px;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  border-bottom: none;
`

const AccountsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  market: MarketMakerDataItem
  currentFilter: any
  count: number
}

const logger = getLogger('Market::ListItem')

export const ListItem: React.FC<Props> = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { account, library: provider } = context

  const { count, currentFilter, market } = props
  const { category } = market

  const {
    address,
    collateralToken,
    collateralVolume,
    creationTimestamp,
    lastActiveDay,
    openingTimestamp,
    oracle,
    outcomeTokenAmounts,
    outcomeTokenMarginalPrices,
    outcomes,
    runningDailyVolumeByHour,
    scalarHigh,
    scalarLow,
    scaledLiquidityParameter,
    title,
  } = market

  console.log('market', market)

  let token: Token | undefined
  try {
    const tokenInfo = getTokenFromAddress(context.networkId, collateralToken)
    const volume = formatBigNumber(collateralVolume, tokenInfo.decimals)
    token = { ...tokenInfo, volume }
  } catch (err) {
    logger.debug(err.message)
  }

  const [details, setDetails] = useState(token || { decimals: 0, symbol: '', volume: '' })
  const { decimals, volume } = details
  const symbol = useSymbol(details as Token)
  const now = moment()
  const endDate = openingTimestamp
  const endsText = moment(endDate).fromNow(true)
  const resolutionDate = moment(endDate).format('MMM Do, YYYY')

  const creationDate = new Date(1000 * parseInt(creationTimestamp))
  const formattedCreationDate = moment(creationDate).format('MMM Do, YYYY')

  const formattedLiquidity: string = scaledLiquidityParameter.toFixed(2)

  useEffect(() => {
    const setToken = async () => {
      if (!token) {
        // fallback to token service if unknown token
        const erc20Service = new ERC20Service(provider, account, collateralToken)
        const { decimals, symbol } = await erc20Service.getProfileSummary()
        const volume = formatBigNumber(collateralVolume, decimals)

        setDetails({ symbol, decimals, volume })
      }
    }

    setToken()
  }, [account, collateralToken, collateralVolume, provider, context.networkId, token])

  const percentages = calcPrice(outcomeTokenAmounts)
  const indexMax = percentages.indexOf(Math.max(...percentages))

  const isScalar = isScalarMarket(oracle || '', context.networkId || 0)

  let currentPrediction
  let unit
  let scalarTitle

  if (isScalar) {
    unit = getUnit(title)
    scalarTitle = getScalarTitle(title)

    if (outcomeTokenMarginalPrices && scalarLow && scalarHigh) {
      currentPrediction = calcPrediction(outcomeTokenMarginalPrices[1], scalarLow, scalarHigh)
    }
  }

  const [first, , , second] = title.split(' ')

  return (
    <Wrapper to={`/${address}`}>
      {count < 3 && (
        <FeatureTitle>
          <FeatureSpan>Featured</FeatureSpan>
        </FeatureTitle>
      )}
      {/* <Title>{isScalar ? scalarTitle : title}</Title> */}
      <AccountsWrapper>
        <IdeaAccount category={category} name={first} price={outcomeTokenMarginalPrices[0]} />
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
        <IdeaAccount category={category} name={second} price={outcomeTokenMarginalPrices[1]} />
      </AccountsWrapper>

      <div style={{ textAlign: 'center', color: 'grey', fontWeight: 500, fontSize: '0.8rem', marginTop: '5px' }}>
        Volume
      </div>
      <div style={{ textAlign: 'center', fontWeight: 'bold', color: 'black' }}>
        {`${formatToShortNumber(volume || '')} ${symbol}`}
      </div>

      {/*<Info>*/}
      {/*  <IconStar></IconStar>*/}
      {/*  <Outcome>*/}
      {/*    {isScalar*/}
      {/*      ? `${currentPrediction && formatNumber(currentPrediction.toString())} ${unit}`*/}
      {/*      : outcomes && `${outcomes[indexMax]} (${(percentages[indexMax] * 100).toFixed(2)}%)`}*/}
      {/*  </Outcome>*/}
      {/*  <Separator>|</Separator>*/}
      {/*  <span>{moment(endDate).isAfter(now) ? `${endsText} remaining` : `Closed ${endsText} ago`}</span>*/}
      {/*  <Separator>|</Separator>*/}
      {/*  <span>*/}
      {/*    {currentFilter.sortBy === 'usdVolume' && `${formatToShortNumber(volume || '')} ${symbol} - Volume`}*/}
      {/*    {currentFilter.sortBy === 'openingTimestamp' &&*/}
      {/*      `${resolutionDate} - ${moment(endDate).isAfter(now) ? 'Closing' : 'Closed'}`}*/}
      {/*    {currentFilter.sortBy === `sort24HourVolume${Math.floor(Date.now() / (1000 * 60 * 60)) % 24}` &&*/}
      {/*      `${*/}
      {/*        Math.floor(Date.now() / 86400000) === lastActiveDay && runningDailyVolumeByHour && decimals*/}
      {/*          ? formatToShortNumber(*/}
      {/*              formatBigNumber(runningDailyVolumeByHour[Math.floor(Date.now() / (1000 * 60 * 60)) % 24], decimals),*/}
      {/*            )*/}
      {/*          : 0*/}
      {/*      } ${symbol} - 24h Volume`}*/}
      {/*    {currentFilter.sortBy === 'usdLiquidityParameter' &&*/}
      {/*      `${formatToShortNumber(formattedLiquidity)} ${symbol} - Liquidity`}*/}
      {/*    {currentFilter.sortBy === 'creationTimestamp' && `${formattedCreationDate} - Created`}*/}
      {/*  </span>*/}
      {/*</Info>*/}
    </Wrapper>
  )
}
