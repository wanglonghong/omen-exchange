import React from 'react'
import styled from 'styled-components'

import { CommonDisabledCSS } from '../common_styled'

interface Props {
  disabled?: boolean
  formField: any
  symbol: any
  shouldDisplayMaxButton?: boolean
  onClickMaxButton?: () => void
}

const FieldWrapper = styled.div`
  align-items: center;
  background-color: ${props => props.theme.textfield.backgroundColor};
  border-color: ${props => props.theme.textfield.borderColor};
  border-style: ${props => props.theme.textfield.borderStyle};
  border-width: ${props => props.theme.textfield.borderWidth};
  border-radius: ${props => props.theme.textfield.borderRadius};
  height: ${props => props.theme.textfield.height};
  display: flex;
  outline: none;
  padding: ${props => props.theme.textfield.paddingVertical + ' ' + props.theme.textfield.paddingHorizontal};
  width: 100%;

  &:hover {
    border-color: ${props => props.theme.textfield.borderColorOnHover};
    .btn--max {
      border-color: ${props => props.theme.textfield.borderColorOnHover};
    }
  }

  &:focus-within {
    border-color: ${props => props.theme.textfield.borderColorActive};
    .btn--max {
      border-color: ${props => props.theme.textfield.borderColorActive};
    }
  }

  ${CommonDisabledCSS}

  > input {
    background-color: transparent;
    border: none;
    color: ${props => props.theme.textfield.color};
    flex-grow: 1;
    font-family: ${props => props.theme.fonts.fontFamily};
    font-size: ${props => props.theme.textfield.fontSize};
    font-weight: ${props => props.theme.textfield.fontWeight};
    line-height: 1.2;
    margin: 0 5px 0 0;
    min-width: 0;
    outline: ${props => props.theme.textfield.outline};
    padding: 0;

    &::placeholder {
      color: ${props => props.theme.textfield.placeholderColor};
      font-size: ${props => props.theme.textfield.placeholderFontSize};
      font-size: ${props => props.theme.textfield.placeholderFontWeight};
    }

    &:read-only,
    [readonly] {
      cursor: not-allowed;
    }

    &.disabled,
    &.disabled:hover,
    &:disabled,
    &:disabled:hover,
    &[disabled],
    &[disabled]:hover {
      background-color: transparent;
      border-color: transparent;
      color: ${props => props.theme.form.common.disabled.color};
      cursor: default !important;
      pointer-events: none !important;
      user-select: none !important;
    }

    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
    }
  }
`

const Symbol = styled.span<{ marginRight?: boolean }>`
  color: ${props => props.theme.colors.primary};
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  text-align: right;
  ${({ marginRight }) => marginRight && 'margin-right: 20px;'};
  .disabled &,
  .disabled:hover &,
  :disabled &,
  :disabled:hover &,
  [disabled] &,
  [disabled]:hover & {
    color: ${props => props.theme.form.common.disabled.color};
  }
`

const MaxButton = styled.span`
  padding-left: 20px;
  padding-right: 20px;
  margin-right: -20px;
  border-left: 1px solid ${props => props.theme.textfield.borderColor};
  color: ${props => props.theme.textfield.color}
  white-space: nowrap;
  height: ${props => props.theme.textfield.height};
  font-size: 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
`

export const TextfieldCustomSymbol = (props: Props) => {
  const { disabled, formField, onClickMaxButton, shouldDisplayMaxButton, symbol, ...restProps } = props

  // eslint-disable-next-line no-warning-comments
  //TODO: use a input[text] instead of passing a <Textfield />
  return (
    <FieldWrapper className={disabled ? 'disabled' : ''} {...restProps}>
      {React.cloneElement(formField, { disabled: disabled })}
      <Symbol marginRight={shouldDisplayMaxButton}>{symbol}</Symbol>
      {shouldDisplayMaxButton && (
        <MaxButton className="btn--max" onClick={onClickMaxButton}>
          Max
        </MaxButton>
      )}
    </FieldWrapper>
  )
}
