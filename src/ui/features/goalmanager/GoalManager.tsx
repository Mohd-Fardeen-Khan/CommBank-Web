import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons'
import { faDollarSign, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import { BaseEmoji } from 'emoji-mart'   // TASK-3: import BaseEmoji type
import 'date-fns'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { updateGoal as updateGoalApi } from '../../../api/lib'  // TASK-3: import PUT request function
import { Goal } from '../../../api/types'
import { selectGoalsMap, updateGoal as updateGoalRedux } from '../../../store/goalsSlice'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import DatePicker from '../../components/DatePicker'
import EmojiPicker from '../../components/EmojiPicker'
import { Theme } from '../../components/Theme'
import AddIconButton from './AddIconButton'
import GoalIcon from './GoalIcon'

type Props = { goal: Goal }

export function GoalManager(props: Props) {
  const dispatch = useAppDispatch()

  const goal = useAppSelector(selectGoalsMap)[props.goal.id]

  const [name, setName] = useState<string | null>(null)
  const [targetDate, setTargetDate] = useState<Date | null>(null)
  const [targetAmount, setTargetAmount] = useState<number | null>(null)

  // TASK-2: track the emoji icon in local state
  const [icon, setIcon] = useState<string | null>(null)

  // TASK-2: track whether the emoji picker popup is open or closed
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false)

  useEffect(() => {
    setName(props.goal.name)
    setTargetDate(props.goal.targetDate)
    setTargetAmount(props.goal.targetAmount)
  }, [
    props.goal.id,
    props.goal.name,
    props.goal.targetDate,
    props.goal.targetAmount,
  ])

  // TASK-2: separate useEffect just for icon — loads icon when goal opens
  useEffect(() => {
    setIcon(props.goal.icon ?? null)
  }, [props.goal.id, props.goal.icon])

  useEffect(() => {
    setName(goal.name)
  }, [goal.name])

  // helper: returns true if goal currently has an icon
  const hasIcon = () => icon != null

  const updateNameOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextName = event.target.value
    setName(nextName)
    const updatedGoal: Goal = {
      ...props.goal,
      name: nextName,
    }
    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(props.goal.id, updatedGoal)
  }

  const updateTargetAmountOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTargetAmount = parseFloat(event.target.value)
    setTargetAmount(nextTargetAmount)
    const updatedGoal: Goal = {
      ...props.goal,
      name: name ?? props.goal.name,
      targetDate: targetDate ?? props.goal.targetDate,
      targetAmount: nextTargetAmount,
    }
    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(props.goal.id, updatedGoal)
  }

  const pickDateOnChange = (date: MaterialUiPickersDate) => {
    if (date != null) {
      setTargetDate(date)
      const updatedGoal: Goal = {
        ...props.goal,
        name: name ?? props.goal.name,
        targetDate: date ?? props.goal.targetDate,
        targetAmount: targetAmount ?? props.goal.targetAmount,
      }
      dispatch(updateGoalRedux(updatedGoal))
      updateGoalApi(props.goal.id, updatedGoal)
    }
  }

  // TASK-2: opens the emoji picker when "Add icon" or existing icon is clicked
  const addIconOnClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsEmojiPickerOpen(true)
  }

  // TASK-3: pickEmojiOnClick — fires when user selects an emoji from the picker
  // Step 1: Stop click from bubbling up
  // Step 2: Save emoji to local state
  // Step 3: Close the emoji picker
  // Step 4: Build updated goal object with new icon
  // Step 5: Update Redux store (instant UI update)
  // Step 6: Call updateGoalApi = PUT request → saves emoji to database (persists after refresh)
  const pickEmojiOnClick = (emoji: BaseEmoji, event: React.MouseEvent) => {
    event.stopPropagation()                         // Step 1

    setIcon(emoji.native)                           // Step 2
    setIsEmojiPickerOpen(false)                     // Step 3

    const updatedGoal: Goal = {                     // Step 4
      ...props.goal,
      icon: emoji.native ?? props.goal.icon,
      name: name ?? props.goal.name,
      targetDate: targetDate ?? props.goal.targetDate,
      targetAmount: targetAmount ?? props.goal.targetAmount,
    }

    dispatch(updateGoalRedux(updatedGoal))          // Step 5: update Redux
    updateGoalApi(props.goal.id, updatedGoal)       // Step 6: TASK-3 save to DB
  }

  return (
    <GoalManagerContainer>

      {/* TASK-2: "Add icon" button — hidden via CSS when goal already has an icon */}
      <AddIconButtonContainer hasIcon={hasIcon()}>
        <AddIconButton hasIcon={hasIcon()} onClick={addIconOnClick} />
      </AddIconButtonContainer>

      {/* TASK-2: Emoji display — shown via CSS only when goal HAS an icon */}
      <GoalIconContainer shouldShow={hasIcon()}>
        <GoalIcon icon={goal.icon ?? null} onClick={addIconOnClick} />
      </GoalIconContainer>

      {/* TASK-2: Emoji picker popup — shown/hidden based on isEmojiPickerOpen */}
      <EmojiPickerContainer
        isOpen={isEmojiPickerOpen}
        hasIcon={hasIcon()}
        onClick={(event) => event.stopPropagation()}
      >
        <EmojiPicker onClick={pickEmojiOnClick} />
      </EmojiPickerContainer>

      <NameInput value={name ?? ''} onChange={updateNameOnChange} />

      <Group>
        <Field name="Target Date" icon={faCalendarAlt} />
        <Value>
          <DatePicker value={targetDate} onChange={pickDateOnChange} />
        </Value>
      </Group>

      <Group>
        <Field name="Target Amount" icon={faDollarSign} />
        <Value>
          <StringInput value={targetAmount ?? ''} onChange={updateTargetAmountOnChange} />
        </Value>
      </Group>

      <Group>
        <Field name="Balance" icon={faDollarSign} />
        <Value>
          <StringValue>{props.goal.balance}</StringValue>
        </Value>
      </Group>

      <Group>
        <Field name="Date Created" icon={faCalendarAlt} />
        <Value>
          <StringValue>{new Date(props.goal.created).toLocaleDateString()}</StringValue>
        </Value>
      </Group>

    </GoalManagerContainer>
  )
}

type FieldProps = { name: string; icon: IconDefinition }
type GoalIconContainerProps = { shouldShow: boolean }
type EmojiPickerContainerProps = { isOpen: boolean; hasIcon: boolean }
type AddIconButtonContainerProps = { hasIcon: boolean }

const Field = (props: FieldProps) => (
  <FieldContainer>
    <FontAwesomeIcon icon={props.icon} size="2x" />
    <FieldName>{props.name}</FieldName>
  </FieldContainer>
)

const GoalManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  width: 100%;
  position: relative;
`

/* TASK-2: hides the "Add icon" button using CSS when goal already has an icon */
const AddIconButtonContainer = styled.div<AddIconButtonContainerProps>`
  display: ${(props) => (props.hasIcon ? 'none' : 'flex')};
`

/* TASK-2: shows/hides the emoji icon using CSS */
const GoalIconContainer = styled.div<GoalIconContainerProps>`
  display: ${(props) => (props.shouldShow ? 'flex' : 'none')};
`

/* TASK-2: shows/hides emoji picker, positioned based on whether icon exists */
const EmojiPickerContainer = styled.div<EmojiPickerContainerProps>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: absolute;
  top: ${(props) => (props.hasIcon ? '10rem' : '2rem')};
  left: 0;
  z-index: 100;
`

const Group = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
`

const NameInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 4rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
`

const FieldName = styled.h1`
  font-size: 1.8rem;
  margin-left: 1rem;
  color: rgba(174, 174, 174, 1);
  font-weight: normal;
`

const FieldContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 20rem;

  svg {
    color: rgba(174, 174, 174, 1);
  }
`

const StringValue = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
`

const StringInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 1.8rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
`

const Value = styled.div`
  margin-left: 2rem;
`
