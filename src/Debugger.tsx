import React, { useState, useCallback, memo } from 'react'
import { StyleSheet, SafeAreaView, Button, Clipboard, KeyboardAvoidingView, Platform } from 'react-native'
import { WToast } from 'react-native-smart-tip'
import { Document, Toolbar, Typer, Images, buildEmptyDocument } from '@typeskill/typer'
import { NavigationContainer } from '@react-navigation/native'
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarOptions,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs'
import { Editor } from './Editor'
import { Config } from './Config'
import { DocumentSourceViewProps, DocumentSourceView } from './DocumentSourceView'
import { DebuggerActions } from './DebuggerActions'

const Tabs = createMaterialTopTabNavigator()

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

const topBarOptions: MaterialTopTabBarOptions = { scrollEnabled: false }
const editorScreenConfig: MaterialTopTabNavigationOptions = { title: 'Editor' }
const sourceScreenConfig: MaterialTopTabNavigationOptions = { title: 'Source' }
const configScreenConfig: MaterialTopTabNavigationOptions = { title: 'Config' }

export const Debugger = memo(function Debugger({
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
        <NavigationContainer>
          <Tabs.Navigator swipeEnabled={true} tabBarOptions={topBarOptions}>
            <Tabs.Screen name="editor" options={editorScreenConfig}>
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
            <Tabs.Screen name="source" options={sourceScreenConfig}>
              {() => (
                <DocumentSourceView document={document} style={styles.body} {...documentSourceViewProps}>
                  <Button title="copy source" onPress={handleOnCopySource} />
                </DocumentSourceView>
              )}
            </Tabs.Screen>
            <Tabs.Screen name="config" options={configScreenConfig}>
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
        </NavigationContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
})

Debugger.displayName = 'Debugger'
