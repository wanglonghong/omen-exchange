import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import twitter from './twitter-square.svg'
import telegram from './telegram-plane.svg'
import discord from './discord.svg'
import medium from './medium-m.svg'

import { ConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { getLogger } from '../../../../util/logger'
import { networkIds } from '../../../../util/networks'
import { RemoteData } from '../../../../util/remote_data'
import {
  CategoryDataItem,
  CurationSource,
  MarketFilters,
  MarketMakerDataItem,
  MarketStates,
  MarketTypes,
  MarketsSortCriteria,
} from '../../../../util/types'
import { ButtonCircle, ButtonConnectWallet, ButtonDisconnectWallet, ButtonRound } from '../../../button'
import { DateField } from '../../../common'
import {
  Dropdown,
  DropdownDirection,
  DropdownItemProps,
  DropdownPosition,
  DropdownVariant,
} from '../../../common/form/dropdown'
import { IconAdd } from '../../../common/icons/IconAdd'
import { IconFilter } from '../../../common/icons/IconFilter'
import { IconSearch } from '../../../common/icons/IconSearch'
import { InlineLoading } from '../../../loading'
import { AdvancedFilters } from '../../common/advanced_filters'
import { ListCard } from '../../common/list_card'
import { ListItem } from '../../common/list_item'
import { Search } from '../../common/search'

const TopContents = styled.div`
  padding: 24px;
`

const FiltersWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  flex-direction: column;

  @media (min-width: ${props => props.theme.themeBreakPoints.sm}) {
    flex-direction: row;
  }
`

const FiltersControls = styled.div<{ disabled?: boolean }>`
  align-items: center;
  display: flex;
  margin-left: auto;
  margin-right: auto;
  pointer-events: ${props => (props.disabled ? 'none' : 'initial')};

  @media (min-width: ${props => props.theme.themeBreakPoints.sm}) {
    margin-left: 0;
    margin-right: 0;
    padding-left: 10px;
  }
`

const ButtonRoundStyled = styled(ButtonRound)<{
  disabled?: boolean
}>`
  width: auto;
  color: ${({ theme }) => theme.colors.textColorDark};
  svg {
    filter: ${props =>
      props.disabled
        ? 'invert(46%) sepia(0%) saturate(1168%) hue-rotate(183deg) brightness(99%) contrast(89%)'
        : 'none'};
  }
`

const ButtonSearchStyled = styled(ButtonRoundStyled as any)`
  width: 40px;
  padding: 0;
`

const FilterBadgeLabel = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.clickable};
  color: ${({ theme }) => theme.colors.mainBodyBackground};
  font-size: ${({ theme }) => theme.fonts.defaultSize};
  line-height: 16px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ButtonFilterStyled = styled(ButtonRoundStyled as any)`
  padding: 0 17px;
  span {
    font-size: 14px;
    line-height: 16px;
  }
  & > * + * {
    margin-left: 10px;
  }
  & > svg {
    width: 24px;
    height: 24px;
  }
`

const ListWrapper = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  flex-direction: column;
  min-height: 355px;
`

const NoMarketsAvailable = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  margin: auto 0;
  text-align: center;
`

const NoOwnMarkets = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  margin: auto 0;
  text-align: center;
`

const LoadMoreWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 0 25px 0 15px;

  & > * + * {
    margin-left: 12px;
  }
`

const CustomDropdownItem = styled.div`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;

  .dropdownItems & .sortBy {
    display: none;
  }
`

const SortDropdown = styled(Dropdown)`
  min-width: 170px;
`

const MarketsDropdown = styled(Dropdown)`
  width: 100%;
`

const MarketsTypeDropdown = styled(Dropdown)`
  width: 100%;
`

const MarketsFilterDropdown = styled(Dropdown)`
  width: 100%;
`

const Actions = styled.div`
  margin: 0 auto 25px;
  max-width: 100%;
  width: ${props => props.theme.mainContainer.maxWidth};
  > div:first-child {
    margin-bottom: 14px;
  }
  > div:nth-child(2) {
    margin-bottom: 14px;
  }
  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: flex;
    justify-content: center;
    > div:first-child {
      margin-right: 14px;
      margin-bottom: 0;
    }
    > div:nth-child(2) {
      margin-right: 14px;
      margin-bottom: 0;
    }
  }
`

const Display = styled.span`
  color: ${props => props.theme.colors.textColorLighter};
  font-size: 14px;
  line-height: 1.2;
  margin-right: 6px;
`

const BottomContents = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0px 25px 0px;
  border-top: 1px solid ${props => props.theme.borders.borderColor};
`

const ButtonCreateDesktop = styled(ButtonRound)`
  display: none;
  background-color: blue;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  padding: 5px 40px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: flex;
  }
`

const ButtonCreateMobile = styled(ButtonCircle)`
  display: flex;
  margin-left: auto;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: none;
  }
`

const DisplayButtonWrapper = styled.div`
  padding: 0 15px 0 25px;
`

const DisplayDropdown = styled(Dropdown)`
  .dropdownItems {
    min-width: auto;
  }
`

const FiltersLeftWrapper = styled.div`
  display: flex;
  align-items: center;
  & > * + * {
    margin-left: 10px;
  }
  @media (max-width: ${props => props.theme.themeBreakPoints.sm}) {
    margin-bottom: 12px;
  }
`

const Grid3AutoColumns = styled.div`
  display: grid;
  grid-template-columns: 300px 300px 300px;
  grid-template-rows: 200px 200px;
  grid-auto-flow: row;
  column-gap: 10px;
  row-gap: 25px;
  & > a {
    background-color: #fff;
    border-radius: 10px;
  }
  & > a:nth-child(-n + 3) {
    border: 2px solid #0857e0;
  }
`

const CreateWrapper = styled.div`
  background: linear-gradient(180deg, #011134, #032066);
  border-radius: 10px;
  width: 920px;
  text-align: center;
  padding: 30px;
  color: white;
`

const MarketHomeWrapper = styled.div`
  background-color: #f6f6f6;
`

interface Props {
  context: ConnectedWeb3Context
  count: number
  currentFilter: any
  isFiltering?: boolean
  fetchMyMarkets: boolean
  markets: RemoteData<MarketMakerDataItem[]>
  categories: RemoteData<CategoryDataItem[]>
  moreMarkets: boolean
  pageIndex: number
  ideaAccounts: string[]
  onFilterChange: (filter: MarketFilters) => void
  onUpdatePageSize: (size: number) => void
  onLoadNextPage: () => void
  onLoadPrevPage: () => void
}

const logger = getLogger('MarketHome')

export const MarketHome: React.FC<Props> = (props: Props) => {
  const {
    categories,
    context,
    count,
    currentFilter,
    fetchMyMarkets,
    ideaAccounts,
    isFiltering = false,
    markets,
    moreMarkets,
    onFilterChange,
    onLoadNextPage,
    onLoadPrevPage,
    onUpdatePageSize,
    pageIndex,
  } = props
  const [counts, setCounts] = useState({
    open: 0,
    closed: 0,
    total: 0,
  })
  const [state, setState] = useState<MarketStates>(currentFilter.state)
  const [category, setCategory] = useState(currentFilter.category)
  const [title, setTitle] = useState(currentFilter.title)
  const [sortBy, setSortBy] = useState<Maybe<MarketsSortCriteria>>(currentFilter.sortBy)
  const [sortByDirection, setSortByDirection] = useState<'asc' | 'desc'>(currentFilter.sortByDirection)
  const [showSearch, setShowSearch] = useState<boolean>(currentFilter.title.length > 0 ? true : false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(
    currentFilter.currency || currentFilter.arbitrator || currentFilter.curationSource !== CurationSource.ALL_SOURCES,
  )
  const [arbitrator, setArbitrator] = useState<Maybe<string>>(currentFilter.arbitrator)
  const [currency, setCurrency] = useState<Maybe<string> | null>(currentFilter.currency)
  const [templateId, setTemplateId] = useState<Maybe<string>>(currentFilter.templateId)
  const [curationSource, setCurationSource] = useState<CurationSource>(currentFilter.curationSource)

  const advancedFilterSelectedCount = [currency, arbitrator, curationSource !== CurationSource.ALL_SOURCES].filter(
    element => element,
  ).length

  const filters = [
    {
      state: MarketStates.open,
      title: 'Open',
      active: state === MarketStates.open,
      onClick: () => setState(MarketStates.open),
    },
    {
      state: MarketStates.pending,
      title: 'Pending',
      active: state === MarketStates.pending,
      onClick: () => setState(MarketStates.pending),
    },
    {
      state: MarketStates.finalizing,
      title: 'Finalizing',
      active: state === MarketStates.finalizing,
      onClick: () => setState(MarketStates.finalizing),
    },
    {
      state: MarketStates.arbitrating,
      title: 'Arbitrating',
      active: state === MarketStates.arbitrating,
      onClick: () => setState(MarketStates.arbitrating),
    },
    {
      state: MarketStates.closed,
      title: 'Closed',
      active: state === MarketStates.closed,
      onClick: () => setState(MarketStates.closed),
    },
  ]

  const marketTypes = [
    {
      type: MarketTypes.all,
      title: 'All',
      active: templateId === null,
      onClick: () => setTemplateId(MarketTypes.all),
    },
    {
      type: MarketTypes.categorical,
      title: 'Categorical',
      active: templateId === MarketTypes.categorical,
      onClick: () => setTemplateId(MarketTypes.categorical),
    },
    {
      type: MarketTypes.scalar,
      title: 'Scalar',
      active: templateId === MarketTypes.scalar,
      onClick: () => setTemplateId(MarketTypes.scalar),
    },
  ]

  // Only allow to filter myMarkets when the user is connected
  if (context.account) {
    filters.push({
      state: MarketStates.myMarkets,
      title: 'My Markets',
      active: state === MarketStates.myMarkets,
      onClick: () => {
        setState(MarketStates.myMarkets)
        setSortBy('openingTimestamp')
        setSortByDirection('asc')
      },
    })
  }

  useEffect(() => {
    if (state === MarketStates.myMarkets && !context.account) {
      logger.log(`User disconnected, update filter`)
      setState(MarketStates.open)
    }
  }, [context.account, state])

  useEffect(() => {
    if (RemoteData.hasData(categories)) {
      const index = categories.data.findIndex(i => i.id === decodeURI(category))
      const item = categories.data[index]
      !!item && setCounts({ open: item.numOpenConditions, closed: item.numClosedConditions, total: item.numConditions })
      if (category === 'All') setCounts({ open: 0, closed: 0, total: 0 })
    }
  }, [category, categories])

  useEffect(() => {
    onFilterChange({
      arbitrator,
      curationSource,
      templateId,
      currency,
      category,
      sortBy,
      sortByDirection,
      state,
      title,
    })
  }, [
    arbitrator,
    curationSource,
    templateId,
    currency,
    category,
    sortBy,
    sortByDirection,
    state,
    title,
    onFilterChange,
  ])

  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = true
    } else {
      setShowAdvancedFilters(
        currentFilter.currency ||
          currentFilter.arbitrator ||
          currentFilter.curationSource !== CurationSource.ALL_SOURCES,
      )
    }
  }, [currentFilter, fetchMyMarkets])

  const toggleSearch = useCallback(() => {
    setShowAdvancedFilters(false)
    setShowSearch(!showSearch)
  }, [showSearch])

  const toggleFilters = useCallback(() => {
    setShowSearch(false)
    setShowAdvancedFilters(!showAdvancedFilters)
  }, [showAdvancedFilters])

  const sortOptions = [
    {
      title: '24h volume',
      sortBy: `sort24HourVolume${Math.floor(Date.now() / (1000 * 60 * 60)) % 24}` as MarketsSortCriteria,
      direction: 'desc',
    },
    {
      title: 'Total volume',
      sortBy: 'usdVolume',
      direction: 'desc',
    },
    {
      title: 'Highest liquidity',
      sortBy: 'usdLiquidityParameter',
      direction: 'desc',
    },
    {
      title: 'Newest',
      sortBy: 'creationTimestamp',
      direction: 'desc',
    },
    {
      title: 'Closing soon',
      sortBy: 'openingTimestamp',
      direction: 'asc',
    },
  ] as const

  const myMarketsSortOptions = [
    {
      title: 'Newest',
      sortBy: 'creationTimestamp',
      direction: 'desc',
    },
    {
      title: 'Ending soon',
      sortBy: 'openingTimestamp',
      direction: 'asc',
    },
  ] as const

  const sortItems: Array<DropdownItemProps> = sortOptions.map(item => {
    return {
      content: <CustomDropdownItem>{item.title}</CustomDropdownItem>,
      onClick: () => {
        setSortBy(item.sortBy)
        setSortByDirection(item.direction)
      },
    }
  })

  const myMarketsSortItems: Array<DropdownItemProps> = myMarketsSortOptions.map(item => {
    return {
      content: <CustomDropdownItem>{item.title}</CustomDropdownItem>,
      onClick: () => {
        setSortBy(item.sortBy)
        setSortByDirection(item.direction)
      },
    }
  })

  const filterItems: Array<DropdownItemProps> = filters.map((item, index) => {
    const count = index === 0 ? counts.open : index === 3 ? counts.closed : 0
    return {
      content: <CustomDropdownItem>{item.title}</CustomDropdownItem>,
      secondaryText: count > 0 && count.toString(),
      onClick: item.onClick,
    }
  })

  const [ideaAccount1, setIdeaAccount1] = useState('')
  const [ideaAccount2, setIdeaAccount2] = useState('')
  const ideaAccountItems1: Array<DropdownItemProps> = ideaAccounts.map(ac => ({
    content: ac,
    onClick: () => setIdeaAccount1(ac),
  }))
  const ideaAccountItems2: Array<DropdownItemProps> = ideaAccounts.map(ac => ({
    content: ac,
    onClick: () => setIdeaAccount2(ac),
  }))

  // useEffect(() => {
  //   setIdeaAccount1(ideaAccounts[0])
  //   setIdeaAccount2(ideaAccounts[1])
  // }, [ideaAccounts])

  const marketTypeItems: Array<DropdownItemProps> = marketTypes.map(item => {
    return {
      content: <CustomDropdownItem>{item.title} Markets</CustomDropdownItem>,
      onClick: item.onClick,
    }
  })

  const history = useHistory()

  const [selectedDate, setSelectedDate] = useState(null)

  const createButtonProps = {
    disabled: false,
    onClick: () => history.push({ pathname: '/create', state: { selectedDate, ideaAccount1, ideaAccount2 } }),
  }

  const categoryItems: Array<DropdownItemProps> = [
    {
      content: <CustomDropdownItem>{'twitter'}</CustomDropdownItem>,
      onClick: () => {
        setCategory('twitter')
      },
    },
    {
      content: <CustomDropdownItem>{'substack'}</CustomDropdownItem>,
      onClick: () => {
        setCategory('substack')
      },
    },
  ]
  // RemoteData.hasData(categories) && categories.data.length > 0
  //   ? (
  //       ...categories.data.map((item: CategoryDataItem) => {
  //         return {
  //           content: <CustomDropdownItem>{item.id}</CustomDropdownItem>,
  //           onClick: () => {
  //             setCategory(item.id)
  //           },
  //         }
  //       }),
  //     ] as Array<DropdownItemProps>)
  //   : [
  //       {
  //         content: <CustomDropdownItem>{'Twitter'}</CustomDropdownItem>,
  //       },
  //     ]

  const sizeOptions = [4, 8, 12]

  const sizeItems: Array<DropdownItemProps> = sizeOptions.map(item => {
    return {
      content: (
        <CustomDropdownItem>
          <Display className="display">Display</Display> {item}
        </CustomDropdownItem>
      ),
      onClick: () => {
        onUpdatePageSize(item)
      },
    }
  })

  const noOwnMarkets = RemoteData.is.success(markets) && markets.data.length === 0 && state === MarketStates.myMarkets
  const noMarketsAvailable =
    RemoteData.is.success(markets) && markets.data.length === 0 && state !== MarketStates.myMarkets
  const showFilteringInlineLoading =
    (!noMarketsAvailable && !noOwnMarkets && isFiltering) ||
    RemoteData.is.loading(markets) ||
    RemoteData.is.reloading(markets)
  const disableLoadNextButton = !moreMarkets || RemoteData.is.loading(markets) || RemoteData.is.reloading(markets)
  const disableLoadPrevButton = pageIndex === 0 || RemoteData.is.loading(markets) || RemoteData.is.reloading(markets)

  return (
    <MarketHomeWrapper>
      <CreateWrapper>
        <h1>Go head-to-head against your critics</h1>
        <Actions>
          {/* <MarketsTypeDropdown
          currentItem={marketTypes.findIndex(i => i.type === templateId)}
          dirty={true}
          dropdownDirection={DropdownDirection.downwards}
          dropdownVariant={DropdownVariant.card}
          items={marketTypeItems}
        /> */}
          <div style={{ display: 'flex', alignItems: 'center' }}>Market </div>
          <img alt="twitter" src={twitter} style={{ margin: '0 5px 0 10px' }} width="30px" />
          <img alt="telegram" src={telegram} style={{ margin: '0 5px' }} width="30px" />
          <img alt="discord" src={discord} style={{ margin: '0 5px' }} width="30px" />
          <img alt="medium" src={medium} style={{ margin: '0 5px' }} width="30px" />
        </Actions>
        <Actions>
          <SortDropdown
            currentItem={ideaAccountItems1.findIndex(i => i.content === ideaAccount1) || undefined}
            items={ideaAccountItems1}
            placeholder="Select Account"
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>will outrank </div>
          <SortDropdown
            currentItem={ideaAccountItems1.findIndex(i => i.content === ideaAccount2) || undefined}
            items={ideaAccountItems2}
            placeholder="Select Account"
          />
        </Actions>
        <Actions>
          <div style={{ display: 'flex', alignItems: 'center', width: '20px' }}>on </div>
          <div style={{ width: '200px' }}>
            <DateField
              name="resolution"
              onChange={(date: any) => setSelectedDate(date)}
              placeholder="Select closing date"
              selected={selectedDate}
            />
          </div>
        </Actions>
        <Actions>
          <ButtonCreateDesktop {...createButtonProps}>Create</ButtonCreateDesktop>
          <ButtonCreateMobile {...createButtonProps}>
            <IconAdd />
          </ButtonCreateMobile>
        </Actions>
      </CreateWrapper>

      <ListCard>
        {/* <TopContents>
          <FiltersWrapper>
            <FiltersLeftWrapper>
              <ButtonFilterStyled active={showAdvancedFilters} onClick={toggleFilters}>
                {advancedFilterSelectedCount > 0 ? (
                  <FilterBadgeLabel>{advancedFilterSelectedCount}</FilterBadgeLabel>
                ) : (
                  <IconFilter />
                )}
                <span>Filters</span>
              </ButtonFilterStyled>
              <ButtonSearchStyled active={showSearch} onClick={toggleSearch}>
                <IconSearch />
              </ButtonSearchStyled>
            </FiltersLeftWrapper>
            <FiltersControls>
              <SortDropdown
                currentItem={
                  fetchMyMarkets
                    ? myMarketsSortOptions.findIndex(i => i.sortBy === sortBy)
                    : sortOptions.findIndex(i => i.sortBy === sortBy)
                }
                dirty={true}
                dropdownPosition={DropdownPosition.center}
                items={fetchMyMarkets ? myMarketsSortItems : sortItems}
              />
            </FiltersControls>
          </FiltersWrapper>
        </TopContents> */}
        {/* {showSearch && <Search onChange={setTitle} value={title} />}
        {showAdvancedFilters && (
          <AdvancedFilters
            arbitrator={arbitrator}
            curationSource={curationSource}
            currency={currency}
            disableCurationFilter={fetchMyMarkets || context.networkId === networkIds.XDAI ? true : false}
            onChangeArbitrator={setArbitrator}
            onChangeCurationSource={setCurationSource}
            onChangeCurrency={setCurrency}
            onChangeTemplateId={setTemplateId}
          />
        )} */}
        <ListWrapper>
          {!isFiltering && RemoteData.hasData(markets) && RemoteData.is.success(markets) && markets.data.length > 0 && (
            <Grid3AutoColumns>
              {markets.data.slice(0, count).map((item, idx) => {
                return <ListItem count={idx} currentFilter={currentFilter} key={item.address} market={item}></ListItem>
              })}
            </Grid3AutoColumns>
          )}
          {noOwnMarkets && <NoOwnMarkets>You have not created or participated in any markets yet.</NoOwnMarkets>}
          {noMarketsAvailable && <NoMarketsAvailable>No markets available.</NoMarketsAvailable>}
          {showFilteringInlineLoading && <InlineLoading message="Loading Markets..." />}
        </ListWrapper>
        {/* <BottomContents>
          <DisplayButtonWrapper>
            <DisplayDropdown
              currentItem={0}
              dirty={true}
              dropdownPosition={DropdownPosition.center}
              items={sizeItems}
              placeholder={<Display>Display</Display>}
            />
          </DisplayButtonWrapper>
          <LoadMoreWrapper>
            <ButtonRoundStyled disabled={disableLoadPrevButton} onClick={onLoadPrevPage}>
              Prev
            </ButtonRoundStyled>
            <ButtonRoundStyled disabled={disableLoadNextButton} onClick={onLoadNextPage}>
              Next
            </ButtonRoundStyled>
          </LoadMoreWrapper>
        </BottomContents> */}
      </ListCard>
    </MarketHomeWrapper>
  )
}
