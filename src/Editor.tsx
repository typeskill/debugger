import React, { useCallback, useMemo, useRef } from 'react'
import { Bridge, Document, Toolbar, Typer, Images, buildBridge } from '@typeskill/typer'
import { StyleSheet, View, Keyboard } from 'react-native'
import { DebuggerActions } from './DebuggerActions'
import { useNavigation, useFocusEffect } from '@react-navigation/core'

interface EditorProps {
  document: Document
  highlightFocus: boolean
  editMode: boolean
  toolbarLayout: Toolbar.Layout
  toast: (text: string) => void
  pickOneImage?: (actionOptions?: any) => Promise<Images.Description<Images.StandardSource>>
  typerProps?: Partial<Typer.Props<any>>
  toolbarProps?: Partial<Toolbar.Props<any>>
  onDocumentUpdate?: (document: Document) => void
  onPressCustomControl?: (action: DebuggerActions) => void
}

const FONT_SIZE = 16
const SECONDARY_COLOR = 'rgb(230, 230, 230)'

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  documentStyle: {
    maxWidth: 500,
  },
  textStyle: {
    fontSize: FONT_SIZE,
  },
  body: {
    flex: 1,
  },
})

interface ImageSource {
  uri: string
  name: string
}

const Editor = React.memo(function Editor({
  document,
  onPressCustomControl,
  onDocumentUpdate,
  editMode,
  highlightFocus,
  typerProps,
  pickOneImage,
  toolbarLayout,
  toolbarProps,
  toast,
}: EditorProps) {
  const { navigate } = useNavigation()

  const bridge: Bridge<ImageSource> = useMemo<Bridge<ImageSource>>(buildBridge, [])
  const imageHooks: Images.Hooks<ImageSource> = useMemo(() => {
    return {
      onImageAddedEvent: desc => {
        toast(`${desc.source.name} successfully added.`)
      },
      onImageRemovedEvent: desc => {
        toast(`${desc.source.name} successfully removed.`)
      },
    }
  }, [])
  const handleOnPressCustomControl = useCallback(
    (action: DebuggerActions) => {
      if (action === DebuggerActions.OPEN_CONFIG) {
        navigate('config')
      } else if (action === DebuggerActions.VIEW_SOURCE) {
        navigate('source')
      }
      onPressCustomControl && onPressCustomControl(action)
    },
    [onPressCustomControl],
  )
  const ref = useRef<Typer<any>>()
  useFocusEffect(
    useCallback(() => {
      setTimeout(() => ref.current && ref.current.focus(), 100)
      return () => {
        Keyboard.dismiss()
      }
    }, []),
  )
  return (
    <View style={styles.root}>
      <Typer
        onDocumentUpdate={onDocumentUpdate}
        document={document}
        style={styles.body}
        documentStyle={styles.documentStyle}
        textStyle={styles.textStyle}
        readonly={!editMode}
        debug={highlightFocus}
        spacing={10}
        imageHooks={imageHooks}
        bridge={bridge}
        ref={ref as any}
        {...typerProps}
      />
      <Toolbar
        onPressCustomControl={handleOnPressCustomControl as any}
        pickOneImage={pickOneImage}
        layout={toolbarLayout}
        document={document}
        bridge={bridge}
        iconSize={24}
        style={{ backgroundColor: SECONDARY_COLOR }}
        {...toolbarProps}
      />
    </View>
  )
})

Editor.displayName = 'Editor'

export { Editor }
