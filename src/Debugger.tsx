import React, { PureComponent } from 'react'
import { Bridge, Document, Toolbar, Typer, Images, buildBridge, buildEmptyDocument } from '@typeskill/typer'
import { KeyboardAvoidingView, View, StyleSheet, Switch, Text, Clipboard } from 'react-native'
import { WToast } from 'react-native-smart-tip'
import { DocumentSourceView, DocumentSourceViewProps } from 'DocumentSourceView'
import Drawer from 'react-native-drawer'

interface State {
  document: Document
  debug: boolean
  editMode: boolean
}

const FONT_SIZE = 20
const SECONDARY_COLOR = 'rgb(230, 230, 230)'

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
    padding: 5,
    alignSelf: 'flex-end',
  },
  headerTitle: {
    fontFamily: 'monospace',
    textAlign: 'center',
    fontSize: 18,
  },
  headerControlText: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginRight: 5,
  },
  header: {
    backgroundColor: SECONDARY_COLOR,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  headerControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  docSourceViewer: {
    flexGrow: 1,
    flexShrink: 1,
    borderTopColor: 'gray',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
})

export const COPY_DOCUMENT_SOURCE_ACTION = 'COPY_DOCUMENT_SOURCE'

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
  public state: State = {
    document: buildEmptyDocument(),
    editMode: true,
    debug: false,
  }

  private toast(text: string) {
    WToast.show({ data: text, backgroundColor: SECONDARY_COLOR, textColor: 'black' })
  }

  private handleOnPressDocSource = () => {
    Clipboard.setString(JSON.stringify(this.state.document, null, 2))
    this.toast('Document source copied to clipboard')
  }

  private handleOnPressCustomControl = (actionType: any) => {
    if (actionType === COPY_DOCUMENT_SOURCE_ACTION) {
      this.handleOnPressDocSource()
    }
  }

  private handleOnDocumentUpdate = (document: Document) => {
    this.setState({ document })
  }

  private renderTyper() {
    return (
      <Typer
        onDocumentUpdate={this.handleOnDocumentUpdate}
        document={this.state.document}
        style={{ flex: 1 }}
        documentStyle={[styles.documentStyle]}
        textStyle={styles.textStyle}
        readonly={!this.state.editMode}
        debug={this.state.debug}
        spacing={10}
        imageHooks={this.imageHooks}
        bridge={this.bridge}
        {...this.props.typerProps}
      />
    )
  }

  private renderDocSource() {
    return (
      <DocumentSourceView
        document={this.state.document}
        style={styles.docSourceViewer}
        {...this.props.documentSourceViewProps}
      />
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
        {...this.props.toolbarProps}
      />
    )
  }

  private renderControls() {
    const { debug, editMode } = this.state
    return (
      <View style={styles.headerControlsContainer}>
        <View style={styles.headerControl}>
          <Text style={styles.headerControlText}>Edit?</Text>
          <Switch value={editMode} onValueChange={(editMode: boolean) => this.setState({ editMode })} />
        </View>
        <View style={styles.headerControl}>
          <Text style={styles.headerControlText}>Debug?</Text>
          <Switch value={debug} onValueChange={(debug: boolean) => this.setState({ debug })} />
        </View>
      </View>
    )
  }

  private renderHeader() {
    return (
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>typeskill debugger</Text>
        </View>
        {this.renderControls()}
      </View>
    )
  }

  private renderBottomControls() {
    const { editMode } = this.state
    return editMode && this.renderToolbar()
  }

  render() {
    const { debug } = this.state
    return (
      <Drawer content={this.renderDocSource()}>
        <View style={{ flex: 1 }}>
          <KeyboardAvoidingView style={{ flex: 1 }}>
            {this.renderHeader()}
            {this.renderTyper()}
            {this.renderBottomControls()}
            {debug && this.renderDocSource()}
          </KeyboardAvoidingView>
        </View>
      </Drawer>
    )
  }
}
