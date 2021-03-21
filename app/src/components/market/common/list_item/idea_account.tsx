import { rgba } from 'polished'
import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { getLogger } from '../../../../util/logger'
import { MarketBuy } from '../../sections/market_buy/market_buy'

interface Props extends HTMLAttributes<HTMLDivElement> {
  name: string
  order?: boolean
  category: string
  price: string
  checked?: boolean
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
`

const LogoImg = styled.img`
  height: 40px;
  border-radius: 50%;
`

const logger = getLogger('Market::IdeaAccount')

export const IdeaAccount: React.FC<Props> = (props: Props) => {
  const { category, checked, name, order, price } = props

  const nameItem = (
    <div key="name" style={{ fontWeight: 'bold', color: 'black', marginBottom: '5px' }}>
      {name}
    </div>
  )
  const logoItem = (
    <div key="logoImg">
      <LogoImg
        alt={name}
        key="logoimg"
        src={`https://unavatar.backend.ideamarket.io:8080/${category}/${name.replace('@', '')}`}
      />
    </div>
  )

  const contents = order ? [logoItem, nameItem] : [nameItem, logoItem]

  return (
    <Wrapper
      style={{
        width: '100%',
        borderRadius: '5px',
        borderColor: 'blue',
        borderWidth: checked ? '2px' : '0',
        borderStyle: 'solid',
        backgroundColor: checked ? rgba(229, 238, 252, 0.7) : 'transparent',
      }}
      {...props}
    >
      {contents}
      <div
        style={{
          color: order ? 'white' : 'blue',
          backgroundColor: order ? '#0358e9' : '#e5effd',
          padding: '2px 5px',
          borderRadius: '5px',
          marginTop: '5px',
        }}
      >
        {parseFloat(price).toFixed(2)}
      </div>
    </Wrapper>
  )
}
