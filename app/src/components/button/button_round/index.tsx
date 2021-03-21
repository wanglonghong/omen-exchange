import React, { ButtonHTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

import { CommonDisabledCSS } from '../../common/form/common_styled'

const ActiveCSS = css`
  &,
  &:hover {
    border-color: ${props => props.theme.colors.borderColorDark};

    > svg path {
      fill: ${props => props.theme.colors.textColorDark};
    }
  }
`

const Wrapper = styled.button<{ active?: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.mainBodyBackground};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: ${props => props.theme.buttonRound.height};
  justify-content: center;
  outline: none;
  padding: ${props => props.theme.buttonRound.padding};
  font-size: ${props => props.theme.buttonRound.fontSize};
  line-height: ${props => props.theme.buttonRound.lineHeight};
  color: ${({ theme }) => theme.colors.textColorDark};
  transition: border-color 0.15s linear;
  user-select: none;
  border: none;

  &:hover {
    border-color: ${props => props.theme.colors.tertiaryDark};
  }

  ${props => (props.active ? ActiveCSS : '')};

  ${CommonDisabledCSS}
`

Wrapper.defaultProps = {
  active: false,
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  ref?: any
}

export const ButtonRound: React.FC<Props> = props => {
  const { children, ref, ...restProps } = props

  return (
    <Wrapper ref={ref} {...restProps}>
      {children}
    </Wrapper>
  )
}
