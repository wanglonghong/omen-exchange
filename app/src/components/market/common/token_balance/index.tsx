import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 20px;
  height: 40px;
  border-radius: 8px;
  border: ${({ theme }) => theme.borders.borderLineDisabled};
`

const Title = styled.h3`
  color: ${props => props.theme.colors.textColorDark};
  font-size: ${props => props.theme.fonts.defaultSize};
  font-weight: 400;
  line-height: 16px;
`

const Value = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: ${props => props.theme.fonts.defaultSize};
  font-weight: 400;
  line-height: 16px;
  margin: 0;
  text-transform: capitalize;
`

interface Props {
  text?: string
  value: string
}

export const TokenBalance: React.FC<Props> = props => {
  const { text = 'Wallet Balance', value, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Title>{text}</Title>
      <Value>{value}</Value>
    </Wrapper>
  )
}
