import React, { Component } from 'react'
import { Document } from '@typeskill/typer'
import { ScrollView, View, StyleProp, ViewStyle } from 'react-native'
import SyntaxHighlighter from 'react-native-syntax-highlighter'
import { solarizedLight } from 'react-syntax-highlighter/styles/hljs'

export interface DocumentSourceViewProps {
  document: Document
  style?: StyleProp<ViewStyle>
}

export class DocumentSourceView extends Component<DocumentSourceViewProps> {
  render() {
    const { children } = this.props
    return (
      <>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, backgroundColor: solarizedLight.hljs.background }}
          keyboardShouldPersistTaps="always"
          style={this.props.style}
        >
          <View>
            <SyntaxHighlighter
              language="json"
              style={solarizedLight}
              fontSize={14}
              wrapLines={true}
              highlighter={'hljs'}
              selectable={true}
            >
              {JSON.stringify(this.props.document, null, 2)}
            </SyntaxHighlighter>
          </View>
        </ScrollView>
        {children}
      </>
    )
  }
}
