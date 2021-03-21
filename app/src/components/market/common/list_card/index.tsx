import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Card } from '../../../common/card'

const CardStyled = styled(Card)`
  margin: 40px auto;
  max-width: 100%;
  width: 920px;
  // min-height: 530px;
  background-color: #f6f6f6;
  min-width: ${props => props.theme.mainContainer.maxWidth};
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const ListCard: React.FC<Props> = (props: Props) => {
  const { children, ...restProps } = props
  return (
    <CardStyled noPadding={true} {...restProps}>
      {children}
    </CardStyled>
  )
}
