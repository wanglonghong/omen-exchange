import React from 'react'
import styled from 'styled-components'

import { Alert } from './img/Alert'

const Wrapper = styled.div<{ margin?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 4px;
  border: ${({ theme }) => theme.borders.borderLineDisabled};
  align-content: center;
  padding: 4px 20px;
  margin-bottom: ${props => (!props.margin ? '20px' : '0')};
`

const AlertWrapper = styled.div`
  align-items: center;
  display: flex;
  padding-right: 16px;

  &.grayscale {
    filter: invert(50%) sepia(0%) saturate(0%) hue-rotate(211deg) brightness(92%) contrast(93%);
  }
`

const Description = styled.p`
  color: ${props => props.theme.colors.textColorLightish};
  font-size: 14px;
  line-height: 1.4;
  letter-spacing: 0.1px;
  width: 100%;

  &.danger {
    color: ${props => props.theme.message.colors.error};
  }
`

const Hyperlink = styled.a`
  color: ${props => props.theme.colors.hyperlink};
`

interface Props {
  description: string
  hyperlinkDescription?: string
  href?: string
  additionalDescription?: string
  danger?: boolean
  grayscale?: boolean
  style?: React.CSSProperties
  marginBottom?: boolean
}

export const WarningMessage = (props: Props) => {
  const {
    additionalDescription,
    danger,
    description,
    grayscale,
    href,
    hyperlinkDescription,
    marginBottom,
    ...restProps
  } = props
  return (
    <Wrapper margin={marginBottom} {...restProps}>
      <AlertWrapper className={grayscale ? 'grayscale' : ''}>
        <Alert />
      </AlertWrapper>
      <Description className={danger ? 'danger' : ''}>
        {description}{' '}
        {href && hyperlinkDescription && (
          <Hyperlink href={href} rel="noopener noreferrer" target="_blank">
            {hyperlinkDescription}
          </Hyperlink>
        )}
        {additionalDescription && <span>{additionalDescription}</span>}
      </Description>
    </Wrapper>
  )
}
