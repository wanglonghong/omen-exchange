import React from 'react'

interface Props {
  size: string
}

export const IconCategory = (props: Props) => (
  <svg fill="none" height={props.size} viewBox="0 0 24 24" width={props.size} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9.25" stroke="#7986CB" strokeWidth="1.5" />
    <path
      d="M13.8844 14.2006L8.32683 16.0531C8.0923 16.1313 7.86918 15.9081 7.94736 15.6736L9.79988 10.116C9.84965 9.96674 9.96681 9.84958 10.1161 9.79981L15.6737 7.94729C15.9082 7.86911 16.1313 8.09223 16.0532 8.32676L14.2006 13.8843C14.1509 14.0336 14.0337 14.1508 13.8844 14.2006Z"
      fill="#7986CB"
    />
    <path d="M13.4144 13.4144L10.5859 10.586L9.17172 14.8286L13.4144 13.4144Z" fill="white" />
    <path d="M10.5861 10.586L13.4146 13.4144L14.8288 9.17176L10.5861 10.586Z" fill="#7986CB" />
  </svg>
)
