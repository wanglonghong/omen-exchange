import { css } from 'styled-components'

export const DatepickerStylesOverride = css`
  .customCalendar {
    &.react-datepicker {
      background-color: #fff;
      border-radius: 16px;
      color: ${props => props.theme.colors.textColorDark};
      display: inline-block;
      font-family: ${props => props.theme.fonts.fontFamily};
      font-size: 13px;
      position: relative;

      .react-datepicker__header {
        background-color: transparent;
        border-bottom: ${({ theme }) => theme.borders.borderLineDisabled};
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        padding-top: 12px;
      }

      .react-datepicker__current-month,
      .react-datepicker-time__header,
      .react-datepicker-year-header {
        color: ${props => props.theme.colors.textColorDark};
        font-size: 14px;
        line-height: 1.2;
      }

      .react-datepicker__navigation {
        top: 13px;
      }

      .react-datepicker__navigation--previous {
        border-right-color: ${props => props.theme.colors.textColorDark};
        left: 13px;
      }

      .react-datepicker__navigation--next {
        border-left-color: ${props => props.theme.colors.textColorDark};
        right: 95px;
      }

      .react-datepicker__navigation--previous--disabled,
      .react-datepicker__navigation--previous--disabled:hover {
        border-right-color: ${props => props.theme.colors.textColorDark};
        opacity: 0.3;
      }

      .react-datepicker__navigation--next--disabled,
      .react-datepicker__navigation--next--disabled:hover {
        border-left-color: ${props => props.theme.colors.textColorDark};
        opacity: 0.3;
      }

      .react-datepicker__day-name,
      .react-datepicker__day,
      .react-datepicker__time-name {
        color: ${props => props.theme.colors.textColorDark};
        font-size: 12px;
      }

      .react-datepicker__month {
        margin: 8px 10px;
      }

      .react-datepicker__day-names,
      .react-datepicker__week {
        padding-bottom: 3px;
      }

      .customCalendar.react-datepicker .react-datepicker__day-name,
      .customCalendar.react-datepicker .react-datepicker__day,
      .customCalendar.react-datepicker .react-datepicker__time-name {
        color: ${props => props.theme.colors.textColor};
        font-size: 11px;
      }

      .react-datepicker__day--keyboard-selected,
      .react-datepicker__month-text--keyboard-selected,
      .react-datepicker__quarter-text--keyboard-selected {
        border-radius: 6px;
        background-color: ${props => props.theme.colors.primary};
        color: #fff;
      }

      .react-datepicker__day--selected,
      .react-datepicker__day--in-selecting-range,
      .react-datepicker__day--in-range,
      .react-datepicker__month-text--selected,
      .react-datepicker__month-text--in-selecting-range,
      .react-datepicker__month-text--in-range,
      .react-datepicker__quarter-text--selected,
      .react-datepicker__quarter-text--in-selecting-range,
      .react-datepicker__quarter-text--in-range {
        border-radius: 6px;
        background-color: ${props => props.theme.colors.primary};
        color: #fff;
      }

      .react-datepicker__day--disabled,
      .react-datepicker__month-text--disabled,
      .react-datepicker__quarter-text--disabled {
        color: ${props => props.theme.colors.textColorLight};
        cursor: not-allowed;
      }

      .react-datepicker__time-container {
        border-left: ${({ theme }) => theme.borders.borderLineDisabled};
        width: 88px;
      }

      .react-datepicker__time-container
        .react-datepicker__time
        .react-datepicker__time-box
        ul.react-datepicker__time-list
        li.react-datepicker__time-list-item {
        align-items: center;
        display: flex;
        font-size: 11px;
        height: 41px;
        justify-content: center;
        padding: 0 10px;
        white-space: nowrap;

        &:hover {
          background-color: ${props => props.theme.colors.secondary};
          color: ${props => props.theme.colors.primary};
        }
      }

      .react-datepicker__time-container .react-datepicker__time {
        background-color: ${props => props.theme.textfield.backgroundColor};
      }

      .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box {
        padding-bottom: 16px;
        width: 100%;

        ul.react-datepicker__time-list {
          height: calc(195px + (1.7rem / 2) - 8px) !important;
          ::-webkit-scrollbar {
            width: 4px;
          }
          ::-webkit-scrollbar-thumb {
            background-color: rgb(159, 168, 218);
            border-radius: 2px;
          }
          ::-webkit-scrollbar-track {
            background: rgb(232, 234, 246);
            border-radius: 2px;
          }
        }
      }
      .react-datepicker__time-container
        .react-datepicker__time
        .react-datepicker__time-box
        ul.react-datepicker__time-list
        li.react-datepicker__time-list-item--selected {
        background-color: ${props => props.theme.colors.primary};
        color: #fff;
      }
    }
  }

  .react-datepicker-popper[data-placement^='top'] .react-datepicker__triangle::before,
  .react-datepicker__year-read-view--down-arrow::before,
  .react-datepicker__month-read-view--down-arrow::before,
  .react-datepicker__month-year-read-view--down-arrow::before {
    border-top-color: ${props => props.theme.borders.borderDisabled};
    bottom: -1px;
  }
`
