import React from 'react'
import styled from 'styled-components'

import { ButtonCSS, ButtonProps, ButtonType } from '../button_styling_types'

const Wrapper = styled.button<ButtonSelectableProps>`
  ${ButtonCSS};

  border-color: transparent !important;
  border-radius: 6px;
  font-weight: ${props => (props.active ? '500' : '400')};
  padding-left: 8px;
  padding-right: 8px;

  &:hover {
    color: ${props => props.theme.buttonSecondary.color};
  }
`

interface ButtonSelectableProps extends ButtonProps {
  active?: boolean
}

export const ButtonSelectable: React.FC<ButtonSelectableProps> = (props: ButtonSelectableProps) => {
  const { active = false, children, ...restProps } = props

  return (
    <Wrapper active={active} buttonType={active ? ButtonType.secondary : ButtonType.secondaryLine} {...restProps}>
      {children}
    </Wrapper>
  )
}
