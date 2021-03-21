import React from 'react'
import styled from 'styled-components'

import { version as appVersion } from '../../../../../package.json'
import { DISCLAIMER_TEXT, DOCUMENT_FAQ, DOCUMENT_VALIDITY_RULES, SHOW_FOOTER } from '../../../../common/constants'
import { useConnectedWeb3Context, useContracts } from '../../../../hooks'

import discord from './discord.svg'
import medium from './medium-m.svg'
import telegram from './telegram-plane.svg'
import twitter from './twitter-square.svg'

const Wrapper = styled.div<{ paddingBottomSmall?: boolean }>`
  align-items: center;
  color: ${props => props.theme.colors.textColorDarker};
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  font-size: 14px;
  justify-content: center;
  line-height: 1.2;
  padding-bottom: ${props => (props.paddingBottomSmall ? '10px' : '30px')};
  padding-top: 10px;
  width: 100%;
  position: relative;
`

const FooterInner = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 100%;
  justify-content: center;
  margin: 0 auto;
  max-width: 100%;
  padding: 0 10px;
  position: relative;
  width: ${props => props.theme.mainContainer.maxWidth};

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    padding: 0 ${props => props.theme.paddings.mainPadding};
  }
`

const Link = styled.a`
  color: ${props => props.theme.colors.textColor};
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`

const Break = styled.span`
  font-weight: 700;
  margin: 0 8px;

  &:last-child {
    display: none;
  }
`

export const Footer = () => {
  const context = useConnectedWeb3Context()
  const { marketMakerFactory } = useContracts(context)
  return SHOW_FOOTER ? (
    <>
      <Wrapper paddingBottomSmall={DISCLAIMER_TEXT ? true : false}>
        <FooterInner>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <div>
                <span style={{ color: '#011134', fontWeight: 'bold', fontSize: '1.1rem', marginRight: '10px' }}>
                  Mouth.is
                </span>
              </div>
              <div style={{ marginTop: '16px' }}>
                <span style={{ color: '#323b87', fontWeight: 'bold', fontSize: '0.9rem', marginRight: '18px' }}>
                  How it Works
                </span>
                <span style={{ color: '#323b87', fontWeight: 'bold', fontSize: '0.9rem', marginRight: '18px' }}>
                  MFAQ
                </span>
                <span style={{ color: '#323b87', fontWeight: 'bold', fontSize: '0.9rem', marginRight: '18px' }}>
                  Blog
                </span>
              </div>
              <div style={{ marginTop: '16px' }}>
                <span style={{ color: '#323b87', fontWeight: 'bold', fontSize: '0.9rem', marginRight: '18px' }}>
                  ContactUs
                </span>
                <span style={{ color: '#323b87', fontWeight: 'bold', fontSize: '0.9rem', marginRight: '18px' }}>
                  Privacy Policy
                </span>
                <span style={{ color: '#323b87', fontWeight: 'bold', fontSize: '0.9rem', marginRight: '18px' }}>
                  How It Works
                </span>
              </div>
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'grey' }}>
                  Built on <span style={{ color: 'blue' }}>Etherium</span>
                </span>
              </div>
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'grey' }}>2021 ideaMarkets</span>
                <img alt="twitter" src={twitter} style={{ margin: '0 5px 0 10px' }} width="20px" />
                <img alt="telegram" src={telegram} style={{ margin: '0 5px' }} width="20px" />
                <img alt="discord" src={discord} style={{ margin: '0 5px' }} width="20px" />
                <img alt="medium" src={medium} style={{ margin: '0 5px' }} width="20px" />
              </div>
            </div>
            <div style={{ flex: 1, margin: 'auto' }}>
              <div style={{ color: '#011134', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>
                Disclaimer
              </div>
              <div style={{ lineHeight: '20px' }}>
                animi rerum ad distinctio maxime. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat
                voluptas possimus odio temporibus debitis perspiciatis eveniet optio sint maxime. Atque corrupti nisi
                maiores laboriosam, optio omnis quas laudantium similique quisquam.
              </div>
            </div>
            <div></div>
          </div>
        </FooterInner>
      </Wrapper>
    </>
  ) : null
}
