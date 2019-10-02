import React, { memo, FunctionComponent } from 'react'
import { Document } from '@typeskill/typer'
import { View, StyleProp, ViewStyle } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import SyntaxHighlighter from 'react-native-syntax-highlighter'
import { solarizedLight } from 'react-syntax-highlighter/styles/hljs'

export interface DocumentSourceViewProps {
  document: Document
  style?: StyleProp<ViewStyle>
}

// eslint-disable-next-line react/prop-types
export const DocumentSourceView: FunctionComponent<DocumentSourceViewProps> = memo(({ children, document, style }) => {
  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: solarizedLight.hljs.background }}
        keyboardShouldPersistTaps="always"
        style={style}
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
            {JSON.stringify(document, null, 2)}
          </SyntaxHighlighter>
        </View>
      </ScrollView>
      {children}
    </>
  )
})

DocumentSourceView.displayName = 'DocumentSourceView'
