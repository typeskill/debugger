<h1 align="center">
<code>
    @typeskill/debugger
</code>
</h1>
<p align="center">
  <em>
    A utility to inspect, reproduce and report bugs from <code>@typeskill/typer</code>.
  </em>
</p>
<p align="center">
    <a href="https://www.npmjs.com/package/@typeskill/debugger" alt="Npm Version">
        <img src="https://img.shields.io/npm/v/@typeskill/debugger.svg" /></a>
    <img src="https://img.shields.io/npm/l/@typeskill/typer.svg"/>
</p>
<p align="center">
  <img src="https://raw.githubusercontent.com/typeskill/debugger/HEAD/images/screenshot-unfold.png" width="300">
  <img src="https://raw.githubusercontent.com/typeskill/debugger/HEAD/images/screenshot-fold.png" width="300">
</p>
<p align="center">
    <a href="https://expo.io/@jsamr/typeskill-debugger">
        <strong>Give the debugger a try on Expo</strong>
    </a>
    <br/><br/>
    <a href="https://expo.io/@jsamr/typeskill-debugger">
        <img src="https://raw.githubusercontent.com/typeskill/debugger/HEAD/images/qr.png" alt="Expo QR code">
    </a>
    <br/>
    <a href="#trying-locally">You can also run it locally in seconds</a>
</p>

## Setup

> You must install the typeskill version you wish to test.

## Example (typescript)

```tsx
// App.tsx
import React, { PureComponent } from 'react'
import { PermissionsAndroid } from 'react-native'
import { DocumentControlAction, Toolbar, Images, GenericControlAction, buildVectorIconControlSpec } from '@typeskill/typer'
import { Debugger, DebuggerActions } from '@typeskill/debugger'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import ImagePicker from 'react-native-image-picker'

function buildMaterialControlSpec(actionType: GenericControlAction, name: string) {
  return buildVectorIconControlSpec(MaterialCommunityIcons, actionType, name)
}

const toolbarLayout: Toolbar.Layout = [
  buildMaterialControlSpec(DocumentControlAction.SELECT_TEXT_BOLD, 'format-bold'),
  buildMaterialControlSpec(DocumentControlAction.SELECT_TEXT_ITALIC, 'format-italic'),
  buildMaterialControlSpec(DocumentControlAction.SELECT_TEXT_UNDERLINE, 'format-underline'),
  buildMaterialControlSpec(DocumentControlAction.SELECT_TEXT_STRIKETHROUGH, 'format-strikethrough-variant'),
  buildMaterialControlSpec(DocumentControlAction.INSERT_IMAGE_AT_SELECTION, 'file-image'),
  buildMaterialControlSpec(DebuggerActions.COPY_DOCUMENT_SOURCE, 'clipboard-text-outline')
]

interface ImageSource {
  uri: string
  name: string
}

export default class App extends PureComponent {

  private pickOneImage = async () => {
    await PermissionsAndroid.request('android.permission.CAMERA')
    return new Promise<Images.Description<ImageSource>>((res, rej) => {
      ImagePicker.showImagePicker({}, (response) => {
        if (response.didCancel) {
          rej(new Error('User cancelled.'))
        }
        if (response.error) {
          rej(new Error(response.error))
        }
        res({
          source: {
            uri: response.uri,
            name: response.fileName,
          },
          width: response.width,
          height: response.height
        } as Images.Description<ImageSource>)
      })
    })
  }

  render() {
    return (
      <Debugger pickOneImage={this.pickOneImage} toolbarLayout={toolbarLayout} />
    )
  }
}
```
