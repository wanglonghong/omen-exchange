import React, { useState } from 'react'
import styled from 'styled-components'
import { useIdeaAccounts } from '../../../../../../hooks/useMarkets'

import { ButtonCircle } from '../../../../../button'
import { Dropdown, FormRowLink, SimpleTextfield } from '../../../../../common'
import { DropdownItemProps } from '../../../../../common/form/dropdown'
import { IconAdd, IconRemove } from '../../../../../common/icons'
import {
  OutcomeItemLittleBallOfJoyAndDifferentColors,
  OutcomeItemWrapper,
  OutcomesTBody,
  OutcomesTD,
  OutcomesTH,
  OutcomesTHead,
  OutcomesTR,
  OutcomesTable,
  OutcomesTableWrapper,
  PercentWrapper,
  RowWrapper,
} from '../../../../common/common_styled'

const CustomButtonCircle = styled(ButtonCircle)`
  margin-left: 15px;
  border-radius: 8px;
  &[disabled] {
    border-color: ${props => props.theme.form.common.disabled.borderColor};
  }
`

const NoteTitle = styled.span`
  color: ${props => props.theme.colors.textColorDark};
`

const Note = styled.div`
  color: ${props => props.theme.colors.textColorLight};
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 20px;
  margin-top: -20px;
  padding: 10px 0 0 0;
`

const CustomButtonCircleAdd = styled(CustomButtonCircle as any)`
  margin-left: ${props => props.theme.cards.paddingHorizontal};
  margin-top: 6px;
`

const OutcomesTHTwoWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export interface Outcome {
  name: string
  probability: number
}

interface Props {
  canAddOutcome: boolean
  category: string
  disabled: boolean
  onChange: (newOutcomes: Outcome[]) => any
  outcomes: Outcome[]
  totalProbabilities: number
}

const Outcomes = (props: Props) => {
  const { category, disabled, outcomes } = props
  const [uniformProbabilities, setIsUniform] = useState<boolean>(true)

  const uniform = (outcomes: Outcome[]): Outcome[] => {
    return outcomes.map(o => ({
      ...o,
      probability: 100 / outcomes.length,
    }))
  }

  const addNewOutcome = () => {
    const newOutcome = {
      name: '',
      probability: 0,
    }
    const newOutcomes = outcomes.concat(newOutcome)
    props.onChange(uniformProbabilities ? uniform(newOutcomes) : newOutcomes)
  }

  const removeOutcome = (index: number) => {
    outcomes.splice(index, 1)
    props.onChange(uniformProbabilities ? uniform(outcomes) : outcomes)
  }

  const handleIsUniformChanged = () => {
    setIsUniform(value => !value)
    props.onChange(!uniformProbabilities ? uniform(outcomes) : outcomes)
  }

  const canRemove = outcomes.length > 2

  const possibleSelection = useIdeaAccounts(category).accounts.names

  console.log(outcomes)

  const outComeItems: Array<Array<DropdownItemProps>> = [
    possibleSelection.map(ps => ({
      content: ps,
      onClick: () => {
        props.onChange(props.outcomes.map((tcome, tIndex) => (0 !== tIndex ? tcome : { ...tcome, name: ps })))
      },
    })),
    possibleSelection.map(ps => ({
      content: ps,
      onClick: () => {
        props.onChange(props.outcomes.map((tcome, tIndex) => (1 !== tIndex ? tcome : { ...tcome, name: ps })))
      },
    })),
  ]

  const outcomeRender = (outcome: Outcome, index: number) => (
    <OutcomesTR key={index}>
      <OutcomesTD>
        <OutcomeItemWrapper readOnly={false}>
          <OutcomeItemLittleBallOfJoyAndDifferentColors outcomeIndex={index} />
          <Dropdown
            currentItem={outcome.name ? possibleSelection.findIndex(ps => ps === outcome.name) : undefined}
            items={outComeItems[index]}
            placeholder="Select Account"
          />
          {/* <SimpleTextfield
            onChange={e =>
              props.onChange(
                props.outcomes.map((tcome, tIndex) => (index !== tIndex ? tcome : { ...tcome, name: e.target.value })),
              )
            }
            placeholder="outcome..."
            style={{ flex: 1 }}
            type="text"
            value={outcome.name}
          /> */}
        </OutcomeItemWrapper>
      </OutcomesTD>
      <OutcomesTD>
        <RowWrapper>
          <OutcomeItemWrapper readOnly={!!uniformProbabilities}>
            <SimpleTextfield
              onChange={e => {
                const isEmpty = !e.target.value
                props.onChange(
                  props.outcomes.map((tcome, tIndex) =>
                    index !== tIndex
                      ? tcome
                      : isEmpty
                      ? ({ name: tcome.name } as Outcome)
                      : { ...tcome, probability: Number(e.target.value) },
                  ),
                )
              }}
              placeholder="50"
              readOnly={!!uniformProbabilities}
              type="number"
              value={uniformProbabilities ? outcome.probability?.toFixed(2) : outcome.probability}
            />
            <PercentWrapper>%</PercentWrapper>
          </OutcomeItemWrapper>
          <CustomButtonCircle
            disabled={disabled || !canRemove}
            onClick={() => {
              removeOutcome(index)
            }}
            title={`Remove outcome ${index + 1}`}
          >
            <IconRemove />
          </CustomButtonCircle>
        </RowWrapper>
      </OutcomesTD>
    </OutcomesTR>
  )

  const outcomesToRender = () => {
    const { outcomes } = props
    const toRender = []
    toRender.push(outcomeRender(outcomes[0], 0))
    toRender.push(
      <tr key="autorank">
        <td style={{ paddingLeft: '24px' }}>Will Outrank</td>
      </tr>,
    )
    toRender.push(outcomeRender(outcomes[1], 1))
    return toRender
  }

  const manualProbabilities = !uniformProbabilities
  const manualProbabilitiesAndNoOutcomes = manualProbabilities && outcomes.length === 0

  return (
    <>
      <OutcomesTableWrapper>
        <OutcomesTable>
          <OutcomesTHead>
            <OutcomesTR>
              <OutcomesTH style={{ width: '65%' }}>Outcome</OutcomesTH>
              <OutcomesTH>
                <OutcomesTHTwoWrapper>
                  <span>Probability</span>
                  {uniformProbabilities && (
                    <FormRowLink data-testid="toggle-manual-probabilities" onClick={handleIsUniformChanged}>
                      set manually
                    </FormRowLink>
                  )}
                  {!uniformProbabilities && (
                    <FormRowLink onClick={handleIsUniformChanged} title="Distribute uniformly">
                      set uniformly
                    </FormRowLink>
                  )}
                </OutcomesTHTwoWrapper>
              </OutcomesTH>
            </OutcomesTR>
          </OutcomesTHead>
          <OutcomesTBody>{outcomesToRender()}</OutcomesTBody>
        </OutcomesTable>
        {/* {canAddOutcome && (
          <CustomButtonCircleAdd data-testid="new-outcome-button" onClick={addNewOutcome} title="Add new outcome">
            <IconAdd />
          </CustomButtonCircleAdd>
        )} */}
      </OutcomesTableWrapper>
      {manualProbabilitiesAndNoOutcomes && (
        <Note>
          <NoteTitle>Note:</NoteTitle> The sum of all probabilities <strong>must be 100%.</strong>
        </Note>
      )}
    </>
  )
}

export { Outcomes }
