import React from 'react'
import styled from 'styled-components'

import { DISCLAIMER_TEXT } from '../../../common/constants'

const Wrapper = styled.div`
  align-items: center;
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  justify-content: center;
  flex-direction: column;
  flex-shrink: 0;
  margin: 0 auto;
  max-width: 100%;
  padding: 10px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    padding-left: 100px;
    padding-right: 100px;
  }
`

const Text = styled.span`
  color: ${props => props.theme.colors.textColor};
  font-size: 11px;
  font-weight: 400;
  text-align: center;
`

export const Disclaimer = () => {
  return (
    <Wrapper>
      <Text>{DISCLAIMER_TEXT}</Text>
    </Wrapper>
  )
}
