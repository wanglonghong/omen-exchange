import styled, { css } from 'styled-components'

import { getOutcomeColor } from '../../../../theme/utils'
import { ButtonContainer } from '../../../button'
import { TD, TH } from '../../../common'

interface StatefulRadioButton {
  selected?: boolean
  disabled?: boolean
}

export const ButtonContainerFullWidth = styled(ButtonContainer)`
  margin-left: -${props => props.theme.cards.paddingHorizontal};
  margin-right: -${props => props.theme.cards.paddingHorizontal};
  padding-left: ${props => props.theme.cards.paddingHorizontal};
  padding-right: ${props => props.theme.cards.paddingHorizontal};
`

export const OutcomesTableWrapper = styled.div<{ borderBottom?: boolean }>`
  margin-left: -${props => props.theme.cards.paddingHorizontal};
  margin-right: -${props => props.theme.cards.paddingHorizontal};
  min-height: 50px;
  overflow-x: visiable;
  position: relative;
  z-index: 999;
  ${({ borderBottom, theme }) =>
    borderBottom &&
    `border-bottom: ${`1px solid ${theme.borders.borderDisabled}`};
  padding-bottom: 24px;`}
`

export const OutcomesTable = styled.table`
  border-collapse: collapse;
  min-width: 100%;
`

export const OutcomesTHead = styled.thead``

export const OutcomesTBody = styled.tbody``

export const OutcomesTH = styled.th<{ textAlign?: string }>`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  padding: 0px 15px 6px 0;
  text-align: ${props => props.textAlign};
  white-space: nowrap;
`

OutcomesTH.defaultProps = {
  textAlign: 'left',
}

export const OutcomesTR = styled.tr`
  height: fit-content;

  &:last-child > td {
    border-bottom: none;
  }

  > th:first-child,
  > td:first-child {
    padding-left: ${props => props.theme.cards.paddingHorizontal};
  }

  > th:last-child,
  > td:last-child {
    padding-right: ${props => props.theme.cards.paddingHorizontal};
  }
`

export const OutcomesTD = styled.td<{ textAlign?: string }>`
  color: ${props => props.theme.colors.textColorLighter};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  padding: 6px 15px 6px 0;
  text-align: ${props => props.textAlign};
  white-space: nowrap;
`

OutcomesTH.defaultProps = {
  textAlign: 'left',
}

export const OutcomeItemTextWrapper = styled.div`
  align-items: center;
  display: flex;
`
export const commonWrapperCSS = css`
  // border-top: 1px solid ${props => props.theme.borders.borderDisabled};
  margin-left: -${props => props.theme.cards.paddingHorizontal};
  margin-right: -${props => props.theme.cards.paddingHorizontal};
  width: auto;
`

export const RowWrapper = styled.div`
  align-items: center;
  display: flex;
`

const OutcomeItemWrapperReadOnlyCSS = css`
  background-color: ${({ theme }) => theme.form.common.disabled.backgroundColor};
  border-color: ${({ theme }) => theme.form.common.disabled.borderColor};
  color: ${({ theme }) => theme.form.common.disabled.color};
  cursor: not-allowed !important;
  user-select: none !important;
  label {
    cursor: not-allowed !important;
    user-select: none !important;
  }
`

const OutcomeItemWrapperActiveCSS = css`
  &:hover {
    border-color: ${({ theme }) => theme.textfield.borderColorOnHover};
  }
  &:active,
  &:focus-within,
  &:focus {
    border-color: ${({ theme }) => theme.textfield.borderColorActive};
  }
`

export const OutcomeItemWrapper = styled.div<{ readOnly: boolean }>`
  align-items: center;
  display: flex;
  background-color: ${props => props.theme.textfield.backgroundColor};
  border-color: ${props => props.theme.textfield.borderColor};
  // border-style: ${props => props.theme.textfield.borderStyle};
  border-style: none;
  border-width: ${props => props.theme.textfield.borderWidth};
  border-radius: ${props => props.theme.textfield.borderRadius};
  padding: 0 ${props => props.theme.textfield.paddingHorizontal};
  transition: border-color 0.15s ease-in-out;
  width: 100%;

  ${({ readOnly }) => readOnly && OutcomeItemWrapperReadOnlyCSS};
  ${({ readOnly }) => !readOnly && OutcomeItemWrapperActiveCSS};
`

export const OutcomeItemText = styled.div`
  color: ${props => props.theme.colors.textColorDark};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  text-align: left;
  white-space: nowrap;
`

export const OutcomeItemLittleBallOfJoyAndDifferentColors = styled.div<{ outcomeIndex: number }>`
  background-color: ${props => getOutcomeColor(props.outcomeIndex).medium};
  border-radius: 50%;
  height: 12px;
  margin: 0 16px 0 0;
  width: 12px;
`

export const OutcomeItemProbability = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

export const OutcomeItemProbabilityText = styled.div`
  margin: 0 25px 0 0;
`

export const ErrorsWrapper = styled.div`
  margin: 0 0 20px;
`

export const GenericError = styled.p<{ margin?: string }>`
  color: ${props => props.theme.colors.error};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  margin: ${props => props.margin};
  padding: 0;
  text-align: left;
`

GenericError.defaultProps = {
  margin: '10px 0 0',
}

export const TDFlexDiv = styled.div<{ textAlign?: string }>`
  align-items: center;
  display: flex;
  justify-content: ${props =>
    props.textAlign && 'right' ? 'flex-end' : props.textAlign && 'center' ? 'center' : 'flex-start'};
`
export const SubsectionTitleActionWrapper = styled.div`
  align-items: center;
  display: flex;
  padding-top: 5px;
  width: 100%;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-left: auto;
    padding-top: 0;
    width: auto;
  }
`
export const Breaker = styled.div`
  &::before {
    content: '|';
    margin: 0 10px;
    color: ${props => props.theme.colors.verticalDivider};
  }
  &:last-child {
    display: none;
  }
`

export const PercentWrapper = styled.label`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  line-height: 16px;
`

export const CurrenciesWrapper = styled.div`
  padding: 0 0 20px 0;
  width: 100%;
`
export const CurationRow = styled.div`
  border-bottom: ${props => props.theme.cards.border};
  margin: 0 -25px;
  padding: 20px 25px;
  position: relative;
`
export const CurationSubRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: nowrap;
  position: relative;
`
export const CurationLeftColumn = styled.div`
  margin-right: 16px;
`

export const CurationCenterColumn = styled.div``

export const CurationRightColumn = styled.div`
  margin-left: auto;
  text-align: right;
  color: ${props => props.theme.colors.textColorDar};
  font-weight: 500;
`

export const CurationLogoWrapper = styled.div`
  padding: 11px;
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.tertiary};
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const CurationRadioWrapper = styled.div<StatefulRadioButton>`
  border-radius: 50%;
  border: ${props => (props.selected ? '' : `1px solid ${props.theme.buttonPrimaryLine.borderColorDisabled}`)};
  cursor: ${props => (props.disabled ? 'initial' : 'pointer')};
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.selected && props.theme.colors.clickable};

  &:hover {
    border-color: ${props => !props.disabled && props.theme.colors.tertiary};
  }
`

export const CurationOption = styled.div`
  color: ${props => props.theme.colors.textColorDarker};
  font-weight: 500;
`

export const CurationOptionDetails = styled.div`
  color: ${props => props.theme.colors.textColorLighter};
  font-weight: 400;
`

export const TabsGrid = styled.div`
  display: grid;
  grid-column-gap: 13px;
  grid-template-columns: 1fr 1fr;
  margin: 0 0 20px;
`

export const PaddingCSS = css`
  padding-left: 25px;
  padding-right: 0;

  &:last-child {
    padding-right: 25px;
  }
`

export const THStyled = styled(TH as any)`
  ${PaddingCSS}
`

export const TDStyled = styled(TD as any)`
  ${PaddingCSS}
`

export const Circle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 8px;
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.tertiary};
  transition: border-color 0.15s linear;
  cursor: pointer;
  height: 18px;
  width: 18px;

  path {
    transition: fill 0.15s linear;
    fill: ${props => props.theme.colors.textColorLightish};
  }

  &:hover {
    border-color: ${props => props.theme.colors.tertiaryDark};
    path {
      fill: ${props => props.theme.colors.textColorDark};
    }
  }
`

export const SCALE_HEIGHT = '20px'
export const VALUE_BOXES_MARGIN = '12px'
