import React, { DOMAttributes, useCallback, useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import { CardCSS } from '../../card'
import { CommonDisabledCSS } from '../common_styled'

import { ChevronDown } from './img/ChevronDown'
import { ChevronUp } from './img/ChevronUp'

export enum DropdownPosition {
  left,
  right,
  center,
}
export enum DropdownVariant {
  pill,
  card,
}

export enum DropdownDirection {
  downwards,
  upwards,
}

const DropdownOpenCSS = css`
  &,
  &:hover {
    background: ${props => props.theme.colors.mainBodyBackground};
    border-color: ${props => props.theme.dropdown.buttonBorderColorActive};
    z-index: 12345;
  }
  .chevronUp {
    display: block;
  }
  .chevronDown {
    display: none;
  }
`

const DropdownVariantCardOpenCSS = css`
  &,
  &:hover {
    border-color: ${props => props.theme.textfield.borderColorActive};
    z-index: 12345;
  }
  .chevronUp {
    display: block;
  }
  .chevronDown {
    display: none;
  }
`

const DropdownDisabledCSS = css`
  ${CommonDisabledCSS}
  &:disabled,
  &[disabled],
  &[disabled]:hover,
  &:disabled:hover {
    .currentItem {
      color: ${props => props.theme.form.common.disabled.color};
    }
  }
`

const DropdownVariantPillCSS = css`
  border-radius: 8px;
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.dropdown.buttonBorderColor};
`

const DropdownVariantCardCSS = css`
  ${CardCSS};
  flex: 1;
  padding: 14px 25px;
  position: relative;
  border: 1px solid ${props => props.theme.dropdown.buttonBorderColor};
  text-transform: capitalize;
`

const Wrapper = styled.div<{ isOpen: boolean; disabled: boolean; dropdownVariant?: DropdownVariant }>`
  background-color: ${props => props.theme.dropdown.buttonBackgroundColor};
  box-sizing: border-box;
  color: ${props => props.theme.dropdown.buttonColor};
  cursor: pointer;
  outline: none;
  pointer-events: ${props => (props.disabled ? 'none' : 'initial')};
  position: relative;
  transition: border-color 0.15s ease-out;
  user-select: none;

  .chevronUp {
    display: none;
  }

  &:hover {
    background-color: ${props => props.theme.dropdown.buttonBackgroundColor};
    border-color: ${props =>
      props.dropdownVariant === DropdownVariant.card
        ? props.theme.textfield.borderColorActive
        : props.theme.dropdown.buttonBorderColorHover};
    color: ${props => props.theme.dropdown.buttonColorHover};
  }

  ${props =>
    props.isOpen ? (props.dropdownVariant === DropdownVariant.card ? DropdownVariantCardOpenCSS : DropdownOpenCSS) : ''}
  ${props => (props.disabled ? DropdownDisabledCSS : '')}
  ${props => (props.dropdownVariant === DropdownVariant.pill ? DropdownVariantPillCSS : '')}
  ${props => (props.dropdownVariant === DropdownVariant.card ? DropdownVariantCardCSS : '')}
 
`

const DropdownButton = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: space-between;

  & > * + * {
    margin-left: 10px;
  }
`

const DropdownButtonRight = styled.div<{ omitRightButtonMargin?: boolean }>`
  display: flex;
  align-items: center;

  & > * + * {
    ${props => !props.omitRightButtonMargin && 'margin-left:10px;'};
  }
`

const CurrentItem = styled.div`
  align-items: center;
  justify-content: space-between;
  color: ${props => props.theme.dropdown.buttonColor};
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: normal;
  height: 22px;
  line-height: 1.2;
  margin: 0;
  max-width: calc(100% - 20px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  & {
    svg,
    img {
      width: 22px;
      height: 22px;
    }
  }
`

const CurrentItemExtra = styled.p`
  margin: 0;
  color: ${props => props.theme.buttonSecondaryLine.colorDisabled};
`

const DropdownPositionLeftCSS = css`
  top: calc(100% + 8px);
  left: 0;
`

const DropdownPositionRightCSS = css`
  top: calc(100% + 8px);
  right: 0;
`

const DropdownPositionCenterCSS = css`
  left: -1px;
  right: -1px;
  top: calc(100% + 8px);
`

const DropdownDirectionDownwardsCSS = css`
  top: calc(100% + 8px);
`

const DropdownDirectionUpwardsCSS = css`
  bottom: calc(100% + 8px);
`

const DropdownVariantPillItemsCSS = css`
  border: 0;
`
const DropdownVariantCardItemsCSS = css`
  max-height: 218px;
  overflow-y: auto;
`
const DropdownVariantCardItemsContainerCSS = css`
  border-radius: 8px;
  border: 1px solid ${props => props.theme.dropdown.buttonBorderColor};
  width: 100%;
  left: 0;
`

const DropdownMaxHeightCSS = css`
  max-height: 172px;
  overflow-y: auto;
`

const ItemsContainer = styled.div<{
  isOpen: boolean
  dropdownPosition?: DropdownPosition
  dropdownDirection?: DropdownDirection
  dropdownVariant?: DropdownVariant
}>`
  background-color: ${props => props.theme.dropdown.dropdownItems.backgroundColor};
  border-radius: ${props => props.theme.dropdown.dropdownItems.borderRadius};
  border: solid 1px ${props => props.theme.dropdown.dropdownItems.borderColor};
  box-shadow: ${props => props.theme.dropdown.dropdownItems.boxShadow};
  display: ${props => (props.isOpen ? 'block' : 'none')};
  min-width: 164px;
  padding: ${props => (props.dropdownVariant === DropdownVariant.card ? '9px' : '9px')};
  position: absolute;
  ${props => (props.dropdownVariant === DropdownVariant.card ? DropdownVariantCardItemsContainerCSS : '')};
  ${props => (props.dropdownPosition === DropdownPosition.left ? DropdownPositionLeftCSS : '')};
  ${props => (props.dropdownPosition === DropdownPosition.right ? DropdownPositionRightCSS : '')};
  ${props => (props.dropdownPosition === DropdownPosition.center ? DropdownPositionCenterCSS : '')};
  ${props => (props.dropdownDirection === DropdownDirection.downwards ? DropdownDirectionDownwardsCSS : '')};
  ${props => (props.dropdownDirection === DropdownDirection.upwards ? DropdownDirectionUpwardsCSS : '')};
`

const DropdownScrollbarCSS = css`
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.slider.idle};
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.slider.active};
    border-radius: 2px;
  }
  &::-webkit-scrollbar {
    width: 4px;
  }
`

const Items = styled.div<{
  dropdownVariant?: DropdownVariant
  maxHeight?: boolean
}>`
  ${props => (props.dropdownVariant === DropdownVariant.pill ? DropdownVariantPillItemsCSS : '')};
  ${props => (props.dropdownVariant === DropdownVariant.card ? DropdownVariantCardItemsCSS : '')};
  ${DropdownScrollbarCSS}
  ${props => props.maxHeight && DropdownMaxHeightCSS};
  & > * + * {
    margin-top: 6px !important;
  }
`

const SecondaryText = styled.div`
  color: ${props => props.theme.colors.textColor};
  text-align: right;
`

Items.defaultProps = {
  dropdownVariant: DropdownVariant.pill,
}

const Item = styled.div<{ active: boolean; dropdownVariant?: DropdownVariant }>`
  align-items: center;
  justify-content: space-between;
  background-color: ${props =>
    props.active
      ? props.theme.dropdown.dropdownItems.item.backgroundColorActive
      : props.theme.dropdown.dropdownItems.item.backgroundColor};
  color: ${props => (props.active ? props.theme.colors.textColorDark : props.theme.colors.textColor)};
  cursor: pointer;
  display: flex;
  padding: ${props => (props.dropdownVariant === DropdownVariant.card ? '8px 12px' : '8px 12px')};
  margin: ${props => (props.dropdownVariant === DropdownVariant.card ? '0' : '0')};
  border-radius: ${props => (props.dropdownVariant === DropdownVariant.card ? '8px' : '8px')};

  &:hover {
    color: ${props => props.theme.dropdown.dropdownItems.item.color};
    background: ${props =>
      props.dropdownVariant === DropdownVariant.card
        ? props.theme.dropdown.dropdownItems.item.backgroundColorActive
        : props.theme.dropdown.dropdownItems.item.backgroundColorHover};
    div {
      color: ${props => props.theme.dropdown.buttonColor};
    }
  }

  & {
    svg,
    img {
      width: 24px;
      height: 24px;
    }
  }
`

const ChevronWrapper = styled.div`
  flex-shrink: 0;
`

export interface DropdownItemProps {
  content: React.ReactNode | string
  secondaryText?: React.ReactNode | string
  extraContent?: string
  onClick?: () => void
  visibility?: boolean
}

interface Props extends DOMAttributes<HTMLDivElement> {
  currentItem?: number | undefined
  dropdownVariant?: DropdownVariant | undefined
  dirty?: boolean
  disabled?: boolean
  dropdownPosition?: DropdownPosition | undefined
  dropdownDirection?: DropdownDirection | undefined
  items: any
  placeholder?: React.ReactNode | string | undefined
  maxHeight?: boolean
  omitRightButtonMargin?: boolean
}

export const Dropdown: React.FC<Props> = props => {
  const {
    currentItem = -1,
    dirty = false,
    disabled = false,
    dropdownVariant = DropdownVariant.pill,
    dropdownDirection,
    dropdownPosition,
    items,
    omitRightButtonMargin,
    placeholder,
    maxHeight = false,
    ...restProps
  } = props

  const getValidItemIndex = (itemIndex: number): number => {
    const outOfBounds = itemIndex && (itemIndex > items.length - 1 || itemIndex < 0)
    if (outOfBounds) {
      return 0
    }
    return itemIndex
  }

  const getItem = (itemIndex: number): any => {
    return items[getValidItemIndex(itemIndex)]
  }

  const getItemExtraContent = (itemIndex: number): any => {
    return items[getValidItemIndex(itemIndex)].extraContent
  }

  const [currentItemIndex, setCurrentItemIndex] = useState<number>(-1)
  const [isDirty, setIsDirty] = useState<boolean>(dirty)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [dropdownPaddingRight, setDropdownPaddingRight] = useState(8)

  const dropdownItemsRef = useRef<HTMLDivElement>(null)
  const dropdownContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const itemsHeight = dropdownItemsRef?.current?.scrollHeight
    const containerHeight = dropdownContainerRef?.current?.clientHeight
    if (itemsHeight && containerHeight) {
      const isScrollVisible = itemsHeight + 9 * 2 > containerHeight
      setDropdownPaddingRight(isScrollVisible ? 8 : 0)
    }
  }, [isOpen, dropdownItemsRef?.current?.scrollHeight, dropdownContainerRef?.current?.clientHeight])

  const optionClick = useCallback((onClick: (() => void) | undefined, itemIndex: number) => {
    if (!onClick) {
      return
    }

    setCurrentItemIndex(itemIndex)
    onClick()
    setIsDirty(true)
    setIsOpen(false)
  }, [])

  const onWrapperClick = useCallback(() => {
    if (isOpen) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }, [isOpen])

  useEffect(() => {
    if (currentItem > -1 && !isDirty) {
      setIsDirty(true)
    }
  }, [currentItem])

  const itemIndex = currentItem && currentItem > -1 ? currentItem : currentItemIndex
  const activeItem = getItem(itemIndex)
  const extraContent = getItemExtraContent(itemIndex)

  return (
    <>
      <Wrapper
        disabled={disabled}
        dropdownVariant={dropdownVariant}
        isOpen={isOpen}
        onBlur={() => {
          setIsOpen(false)
        }}
        onClick={onWrapperClick}
        tabIndex={-1}
        {...restProps}
      >
        <DropdownButton>
          <CurrentItem className="currentItem">
            {placeholder && !isDirty ? placeholder : activeItem.content}
            {!!activeItem.secondaryText && !extraContent && <SecondaryText>{activeItem.secondaryText}</SecondaryText>}
          </CurrentItem>

          <DropdownButtonRight omitRightButtonMargin={omitRightButtonMargin}>
            <CurrentItemExtra>{extraContent}</CurrentItemExtra>
            {!disabled && (
              <ChevronWrapper>
                <ChevronDown />
                <ChevronUp />
              </ChevronWrapper>
            )}
          </DropdownButtonRight>
        </DropdownButton>
        <ItemsContainer
          className="dropdownItems"
          dropdownDirection={dropdownDirection}
          dropdownPosition={dropdownPosition}
          dropdownVariant={dropdownVariant}
          isOpen={isOpen}
          ref={dropdownContainerRef}
        >
          <Items
            dropdownVariant={dropdownVariant}
            maxHeight={maxHeight}
            ref={dropdownItemsRef}
            style={{ paddingRight: dropdownPaddingRight }}
          >
            {items.map((item: DropdownItemProps, index: string) => {
              if (item.visibility) return
              return (
                <Item
                  active={parseInt(index) === itemIndex}
                  dropdownVariant={dropdownVariant}
                  key={index}
                  onClick={
                    item.onClick !== undefined
                      ? () => optionClick(item.onClick, parseInt(index))
                      : () => setIsOpen(false)
                  }
                >
                  {item.content}
                  {!!item.secondaryText && <SecondaryText>{item.secondaryText}</SecondaryText>}
                </Item>
              )
            })}
          </Items>
        </ItemsContainer>
      </Wrapper>
    </>
  )
}
