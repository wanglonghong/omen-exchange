import React, { HTMLAttributes, ReactNode } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div<{ borderTop?: boolean; marginTop?: boolean }>`
  align-items: center;
  border-top: ${props => (props.borderTop ? `1px solid ${props.theme.borders.borderDisabled}` : 'none')};
  margin-top: ${props => (props.marginTop ? `24px!important` : 'auto')};
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;

  /* It would be wise not to delete this  */
  > * {
    margin-left: 14px;

    &:first-child {
      margin-left: 0;
    }
  }
`

Wrapper.defaultProps = {
  borderTop: false,
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  borderTop?: boolean
  marginTop?: boolean
  children: ReactNode
}

export const ButtonContainer = (props: Props) => {
  const { children, ...restProps } = props

  return <Wrapper {...restProps}>{children}</Wrapper>
}
