import React, { PureComponent } from 'react'
import { Document, Toolbar, Typer, Images, buildEmptyDocument } from '@typeskill/typer'
import { DocumentSourceViewProps, DocumentSourceView } from './DocumentSourceView'
import { DebuggerActions } from './DebuggerActions'
import { NavigationNativeContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Editor } from './Editor'
import { Config } from './Config'
import { StyleSheet, Dimensions, ScaledSize, SafeAreaView } from 'react-native'

const Stack = createStackNavigator()

interface State {
  document: Document
  highlightFocus: boolean
  editMode: boolean
  isSourceVisible: boolean
  windowWidth: number
}

const SECONDARY_COLOR = 'rgb(230, 230, 230)'

const styles = StyleSheet.create({
  documentStyle: {
    maxWidth: 500,
  },
  textStyle: {
    fontSize: 14,
  },
  headerTitleContainer: {
    padding: 5,
    justifyContent: 'center',
  },
  headerControlsContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  header: {
    backgroundColor: SECONDARY_COLOR,
    flexDirection: 'column',
    minHeight: 30,
    justifyContent: 'center',
  },
  headerControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
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

export class Debugger extends PureComponent<DebuggerProps, State> {
  public state: State

  public constructor(props: DebuggerProps) {
    super(props)
    this.state = {
      document: props.initialDocument || buildEmptyDocument(),
      editMode: true,
      highlightFocus: false,
      isSourceVisible: false,
      windowWidth: Dimensions.get('window').width,
    }
  }

  private handleOnPressCustomControl = (actionType: any) => {
    if (actionType === DebuggerActions.ERASE_DOCUMENT) {
      this.setState({ document: buildEmptyDocument() })
    }
  }

  private handleOnWindowChange = ({ window }: { window: ScaledSize }) => {
    this.setState({ windowWidth: window.width })
  }

  private handleOnDocumentUpdate = (document: Document) => {
    this.setState({ document })
    const { onDocumentUpdate } = this.props
    onDocumentUpdate && onDocumentUpdate(document)
  }

  private handleOnHighlightFocusChange = (highlightFocus: boolean) => {
    this.setState({ highlightFocus })
  }

  private handleOnEditModeChange = (editMode: boolean) => {
    this.setState({ editMode })
  }

  public onComponentDidMount() {
    Dimensions.addEventListener('change', this.handleOnWindowChange)
  }

  public onComponentWillUnmount() {
    Dimensions.removeEventListener('change', this.handleOnWindowChange)
  }

  public render() {
    const { toolbarLayout, toolbarProps, typerProps, pickOneImage } = this.props
    const { editMode, highlightFocus } = this.state
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationNativeContainer>
          <Stack.Navigator>
            <Stack.Screen name="editor" options={{ title: 'Typeskill Debugger', header: null }}>
              {() => (
                <Editor
                  toolbarLayout={toolbarLayout}
                  {...this.state}
                  onDocumentUpdate={this.handleOnDocumentUpdate}
                  onPressCustomControl={this.handleOnPressCustomControl}
                  toolbarProps={toolbarProps}
                  typerProps={typerProps}
                  pickOneImage={pickOneImage}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="config" options={{ title: 'Configuration' }}>
              {() => (
                <Config
                  onHightlightFocusChange={this.handleOnHighlightFocusChange}
                  onEditModeChange={this.handleOnEditModeChange}
                  highlightFocus={highlightFocus}
                  editMode={editMode}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="source" options={{ title: 'Document Source' }}>
              {() => (
                <DocumentSourceView
                  document={this.state.document}
                  style={styles.body}
                  {...this.props.documentSourceViewProps}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationNativeContainer>
      </SafeAreaView>
    )
  }
}
