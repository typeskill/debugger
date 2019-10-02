import React, { useState, useCallback } from 'react'
import { Document, Toolbar, Typer, Images, buildEmptyDocument } from '@typeskill/typer'
import { DocumentSourceViewProps, DocumentSourceView } from './DocumentSourceView'
import { DebuggerActions } from './DebuggerActions'
import { NavigationNativeContainer } from '@react-navigation/native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { Editor } from './Editor'
import { Config } from './Config'
import { StyleSheet, SafeAreaView, Button, Clipboard, KeyboardAvoidingView, Platform } from 'react-native'
import { WToast } from 'react-native-smart-tip'

const Tabs = createMaterialTopTabNavigator()

interface State {
  document: Document
  highlightFocus: boolean
  editMode: boolean
  isSourceVisible: boolean
  windowWidth: number
}

const SECONDARY_COLOR = 'rgb(230, 230, 230)'

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  documentStyle: {
    maxWidth: 500,
  },
  textStyle: {
    fontSize: 14,
  },
  body: {
    borderTopColor: 'gray',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
})

export interface DebuggerProps {
  toolbarLayout: Toolbar.Layout
  pickOneImage?: (actionOptions?: any) => Promise<Images.Description<Images.StandardSource>>
  typerProps?: Partial<Typer.Props<any>>
  toolbarProps?: Partial<Toolbar.Props<any>>
  documentSourceViewProps?: Partial<DocumentSourceViewProps>
  initialDocument?: Document
  onDocumentUpdate?: (document: Document) => void
}

export const Debugger = React.memo(function Debugger({
  toolbarLayout,
  toolbarProps,
  documentSourceViewProps,
  initialDocument,
  onDocumentUpdate,
  pickOneImage,
  typerProps,
}: DebuggerProps) {
  const [document, setDocument] = useState<Document>(initialDocument || buildEmptyDocument())
  const [editMode, setEditMode] = useState<boolean>(true)
  const [highlightFocus, setHighlightFocus] = useState<boolean>(false)
  const toast = useCallback((text: string) => {
    WToast.show({ data: text, backgroundColor: SECONDARY_COLOR, textColor: 'black' })
  }, [])
  const handleOnDocumentUpdate = useCallback((nextDocument: Document) => {
    setDocument(nextDocument)
    onDocumentUpdate && onDocumentUpdate(nextDocument)
  }, [])
  const handleOnCopySource = useCallback(() => {
    Clipboard.setString(JSON.stringify(document, null, 2))
    toast('Document source copied to clipboard')
  }, [document])
  const handleOnPressCustomControl = useCallback((action: DebuggerActions) => {
    if (action === DebuggerActions.COPY_DOCUMENT_SOURCE) {
      handleOnCopySource()
    } else if (action === DebuggerActions.ERASE_DOCUMENT) {
      setDocument(buildEmptyDocument())
    }
  }, [])
  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView behavior={Platform.OS === 'android' ? undefined : 'padding'} style={styles.flex}>
        <NavigationNativeContainer>
          <Tabs.Navigator swipeEnabled={true}>
            <Tabs.Screen name="editor" options={{ title: 'Editor' }}>
              {() => (
                <Editor
                  toolbarLayout={toolbarLayout}
                  onDocumentUpdate={handleOnDocumentUpdate}
                  onPressCustomControl={handleOnPressCustomControl}
                  toolbarProps={toolbarProps}
                  typerProps={typerProps}
                  pickOneImage={pickOneImage}
                  document={document}
                  editMode={editMode}
                  highlightFocus={highlightFocus}
                  toast={toast}
                />
              )}
            </Tabs.Screen>
            <Tabs.Screen name="source" options={{ title: 'Source' }}>
              {() => (
                <DocumentSourceView document={document} style={styles.body} {...documentSourceViewProps}>
                  <Button title="copy source" onPress={handleOnCopySource} />
                </DocumentSourceView>
              )}
            </Tabs.Screen>
            <Tabs.Screen name="config" options={{ title: 'Config' }}>
              {() => (
                <Config
                  onHightlightFocusChange={setHighlightFocus}
                  onEditModeChange={setEditMode}
                  highlightFocus={highlightFocus}
                  editMode={editMode}
                />
              )}
            </Tabs.Screen>
          </Tabs.Navigator>
        </NavigationNativeContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
})

Debugger.displayName = 'Debugger'
