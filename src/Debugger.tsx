import React, { PureComponent } from 'react'
import { Bridge, Document, Toolbar, Typer, Images, buildBridge, buildEmptyDocument } from '@typeskill/typer'
import {
  KeyboardAvoidingView,
  View,
  StyleSheet,
  Switch,
  Text,
  Clipboard,
  YellowBox,
  Dimensions,
  ScaledSize,
  Platform,
} from 'react-native'
import { WToast } from 'react-native-smart-tip'
import { DocumentSourceView, DocumentSourceViewProps } from './DocumentSourceView'
import SideMenu from 'react-native-side-menu'

// Suppress warning from react-native-side-menu
YellowBox.ignoreWarnings(['SideMenu'])

interface State {
  document: Document
  highlightFocus: boolean
  editMode: boolean
  isSourceVisible: boolean
  windowWidth: number
}

const FONT_SIZE = 16
const SECONDARY_COLOR = 'rgb(230, 230, 230)'
const monospace = Platform.select({ ios: 'Courier', android: 'monospace' })

const styles = StyleSheet.create({
  documentStyle: {
    maxWidth: 500,
  },
  textStyle: {
    fontSize: FONT_SIZE,
  },
  headerTitleContainer: {
    padding: 5,
    justifyContent: 'center',
  },
  headerControlsContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  headerTitle: {
    fontFamily: monospace,
    textAlign: 'center',
    fontSize: 8,
  },
  headerControlText: {
    fontFamily: monospace,
    fontSize: 8,
    marginRight: 1,
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

export enum DebuggerActions {
  COPY_DOCUMENT_SOURCE = 'COPY_DOCUMENT_SOURCE',
  ERASE_DOCUMENT = 'ERASE_DOCUMENT',
}

interface ImageSource {
  uri: string
  name: string
}

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
  private bridge: Bridge<ImageSource> = buildBridge()
  private imageHooks: Images.Hooks<ImageSource> = {
    onImageAddedEvent: desc => {
      this.toast(`${desc.source.name} successfully added.`)
    },
    onImageRemovedEvent: desc => {
      this.toast(`${desc.source.name} successfully removed.`)
    },
  }
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

  private toast(text: string) {
    WToast.show({ data: text, backgroundColor: SECONDARY_COLOR, textColor: 'black' })
  }

  private handleOnPressDocSource = () => {
    Clipboard.setString(JSON.stringify(this.state.document, null, 2))
    this.toast('Document source copied to clipboard')
  }

  private handleOnPressCustomControl = (actionType: any) => {
    if (actionType === DebuggerActions.COPY_DOCUMENT_SOURCE) {
      this.handleOnPressDocSource()
    }
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

  private renderTyper() {
    return (
      <Typer
        onDocumentUpdate={this.handleOnDocumentUpdate}
        document={this.state.document}
        style={[styles.body, { flex: 1 }]}
        documentStyle={[styles.documentStyle]}
        textStyle={styles.textStyle}
        readonly={!this.state.editMode}
        debug={this.state.highlightFocus}
        spacing={10}
        imageHooks={this.imageHooks}
        bridge={this.bridge}
        {...this.props.typerProps}
      />
    )
  }

  private renderDocSource() {
    return (
      <View style={{ flex: 1 }}>
        {this.renderDocHeader()}
        <DocumentSourceView
          document={this.state.document}
          style={styles.body}
          {...this.props.documentSourceViewProps}
        />
      </View>
    )
  }

  private renderToolbar() {
    return (
      <Toolbar
        onPressCustomControl={this.handleOnPressCustomControl}
        pickOneImage={this.props.pickOneImage}
        layout={this.props.toolbarLayout}
        document={this.state.document}
        bridge={this.bridge}
        iconSize={24}
        style={{ backgroundColor: SECONDARY_COLOR }}
        {...this.props.toolbarProps}
      />
    )
  }

  private renderControls() {
    const { highlightFocus: debug, editMode, isSourceVisible } = this.state
    return (
      <View style={styles.headerControlsContainer}>
        <View style={styles.headerControl}>
          <Text style={styles.headerControlText}>Show source?</Text>
          <Switch
            value={isSourceVisible}
            onValueChange={(isSourceVisible: boolean) => this.setState({ isSourceVisible })}
          />
        </View>
        <View style={styles.headerControl}>
          <Text style={styles.headerControlText}>Edit?</Text>
          <Switch value={editMode} onValueChange={(editMode: boolean) => this.setState({ editMode })} />
        </View>
        <View style={styles.headerControl}>
          <Text style={styles.headerControlText}>Highlight focus?</Text>
          <Switch value={debug} onValueChange={(highlightFocus: boolean) => this.setState({ highlightFocus })} />
        </View>
      </View>
    )
  }

  private renderDocHeader() {
    const { isSourceVisible } = this.state
    return (
      <View style={styles.header}>
        <View style={styles.headerControlsContainer}>
          <View style={styles.headerControl}>
            <Text style={styles.headerControlText}>Show source?</Text>
            <Switch
              value={isSourceVisible}
              onValueChange={(isSourceVisible: boolean) => this.setState({ isSourceVisible })}
            />
          </View>
        </View>
      </View>
    )
  }

  private renderMainHeader() {
    return <View style={styles.header}>{this.renderControls()}</View>
  }

  private handleOpenSide = (isSourceVisible: boolean) => {
    this.setState({ isSourceVisible })
  }

  private renderBottomControls() {
    const { editMode } = this.state
    return editMode && this.renderToolbar()
  }

  private renderBody() {
    return (
      <View style={[{ flex: 1, backgroundColor: 'rgba(255,255,255,0.85)' }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'android' ? undefined : 'padding'} style={{ flex: 1 }}>
          {this.renderMainHeader()}
          {this.renderTyper()}
          {this.renderBottomControls()}
        </KeyboardAvoidingView>
      </View>
    )
  }

  public onComponentDidMount() {
    Dimensions.addEventListener('change', this.handleOnWindowChange)
  }

  public onComponentWillUnmount() {
    Dimensions.removeEventListener('change', this.handleOnWindowChange)
  }

  render() {
    return (
      <SideMenu
        openMenuOffset={(this.state.windowWidth * 9) / 10}
        isOpen={this.state.isSourceVisible}
        onChange={this.handleOpenSide}
        menu={this.renderDocSource()}
      >
        {this.renderBody()}
      </SideMenu>
    )
  }
}
