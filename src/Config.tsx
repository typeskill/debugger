import React from 'react'
import { StyleSheet, View, Text, Switch } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  root: {
    margin: 30,
    flex: 1,
    flexBasis: 500,
  },
  controlText: {
    //
  },
  control: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

export interface ConfigProps {
  editMode: boolean
  onEditModeChange: (editMode: boolean) => void
  highlightFocus: boolean
  onHightlightFocusChange: (highlightFocus: boolean) => void
}

export const Config = React.memo(function Config({
  editMode,
  onEditModeChange,
  highlightFocus,
  onHightlightFocusChange,
}: ConfigProps) {
  return (
    <View style={styles.container}>
      <View style={styles.root}>
        <View style={styles.control}>
          <Text style={styles.controlText}>Edit?</Text>
          <Switch value={editMode} onValueChange={onEditModeChange} />
        </View>
        <View style={styles.control}>
          <Text style={styles.controlText}>Highlight focus?</Text>
          <Switch value={highlightFocus} onValueChange={onHightlightFocusChange} />
        </View>
      </View>
    </View>
  )
})

Config.displayName = 'Config'
