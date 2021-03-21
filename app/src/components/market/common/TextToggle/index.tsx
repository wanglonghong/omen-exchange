import React, { MouseEventHandler } from 'react'
import styled from 'styled-components'

import { IconMiniDown, IconMiniUp } from '../../../common/icons'

interface Props {
  mainLabel: string
  alternativeLabel: string
  isMain?: boolean
  onClick?: MouseEventHandler
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 16px;
  color: ${({ theme }) => theme.colors.clickable};
  .text-toggle-label {
    margin-left: 10px;
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
  }

  &:hover {
    .text-toggle-label {
      color: ${props => props.theme.colors.primaryLight};
    }
    svg {
      circle {
        stroke: ${props => props.theme.colors.primaryLight};
      }
      path {
        fill: ${props => props.theme.colors.primaryLight};
      }
    }
  }
`

export const TextToggle = (props: Props) => {
  const { alternativeLabel, isMain, mainLabel, onClick } = props
  return (
    <Wrapper onClick={onClick}>
      {isMain ? <IconMiniDown /> : <IconMiniUp />}
      <div className="text-toggle-label">{isMain ? mainLabel : alternativeLabel}</div>
    </Wrapper>
  )
}
