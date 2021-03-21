import React from 'react'

interface Props {
  size: string
}

export const IconArbitrator = (props: Props) => (
  <svg fill="none" height={props.size} viewBox="0 0 24 24" width={props.size} xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0)">
      <path
        d="M12 5.17999C7.45455 5.17999 3.57273 8.00727 2 11.9982C3.57273 15.9891 7.45455 18.8164 12 18.8164C16.5455 18.8164 20.4273 15.9891 22 11.9982C20.4273 8.00727 16.5455 5.17999 12 5.17999ZM12 16.5436C9.49091 16.5436 7.45455 14.5073 7.45455 11.9982C7.45455 9.48908 9.49091 7.45272 12 7.45272C14.5091 7.45272 16.5455 9.48908 16.5455 11.9982C16.5455 14.5073 14.5091 16.5436 12 16.5436ZM12 9.2709C10.4909 9.2709 9.27273 10.4891 9.27273 11.9982C9.27273 13.5073 10.4909 14.7254 12 14.7254C13.5091 14.7254 14.7273 13.5073 14.7273 11.9982C14.7273 10.4891 13.5091 9.2709 12 9.2709Z"
        fill="#7986CB"
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect fill="white" height="20" transform="translate(2 2)" width="20" />
      </clipPath>
    </defs>
  </svg>
)
