import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

import { getOutcomeColor } from '../../../../theme/utils'

import { ArrowIcon } from './img/ArrowIcon'

const Wrapper = styled.div<{ outcomeIndex: number }>`
  align-items: center;
  color: ${props => getOutcomeColor(props.outcomeIndex).darker || props.theme.colors.textColor};
  display: flex;

  svg {
    fill: ${props => getOutcomeColor(props.outcomeIndex).darker || props.theme.colors.textColor};
    margin: 0 6px;
  }
`

const Value = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
`

interface Props extends DOMAttributes<HTMLDivElement> {
  outcomeIndex: number
  value: any
}

export const NewValue: React.FC<Props> = props => {
  const { value, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <ArrowIcon />
      <Value>{value}</Value>
    </Wrapper>
  )
}
