import Big from 'big.js'
import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { getOutcomeColor } from '../../../../theme/utils'
import { IconDragonBall } from '../../../common/icons'

const Wrapper = styled.div<{ outcomeIndex: number }>`
  align-items: center;
  display: flex;
  white-space: nowrap;

  .dragonBallIcon {
    margin: 0 8px 0 0;
  }

  .fill {
    fill: ${props =>
      getOutcomeColor(props.outcomeIndex).darker ? getOutcomeColor(props.outcomeIndex).darker : '#333'};
  }
`

const Text = styled.div<{ outcomeIndex: number }>`
  color: ${props => (getOutcomeColor(props.outcomeIndex).darker ? getOutcomeColor(props.outcomeIndex).darker : '#333')};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  index: number
  outcomeName?: string
  payouts: Maybe<Big[]>
  showPayout?: boolean
}

export const WinningBadge: React.FC<Props> = props => {
  const { index, outcomeName = 'Winning Outcome', payouts, showPayout = true, ...restProps } = props

  if (!showPayout) {
    return (
      <Wrapper outcomeIndex={index} {...restProps}>
        <IconDragonBall />
        <Text outcomeIndex={index}>{outcomeName}</Text>
      </Wrapper>
    )
  }

  return (
    payouts && (
      <Wrapper outcomeIndex={index} {...restProps}>
        <IconDragonBall />
        <Text outcomeIndex={index}>
          {payouts[index].lt(1) ? `${payouts[index].mul(100).toFixed(2)}% ` : ''} {outcomeName}
        </Text>
      </Wrapper>
    )
  )
}
