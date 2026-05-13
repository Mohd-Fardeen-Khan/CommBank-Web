import { BaseEmoji, Picker } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'
import React from 'react'
import { useAppSelector } from '../../store/hooks'
import { selectMode } from '../../store/themeSlice'

// Props: onClick receives the selected emoji and the mouse event
type Props = { onClick: (emoji: BaseEmoji, event: React.MouseEvent) => void }

export default function EmojiPicker(props: Props) {
  const theme = useAppSelector(selectMode)

  return (
    <Picker
      theme={theme}
      showPreview={false}
      showSkinTones={false}
      // FIX: cast to 'any' to avoid emoji-mart v3 internal type conflict
      onSelect={props.onClick as any}
      color="primary"
    />
  )
}
