import React from 'react'
import ReactDOM from 'react-dom'
const styles = require('./dialog.css')

type dialogProps = {
  onCancel: Function,
  onOk: Function,
  title: string,
  children?: object
}

class Dialog extends React.PureComponent<dialogProps> {

  render() {
    return (
      <mask>
        <dialog></dialog>
      </mask>
    )
  }
}

function exportDialog(props: dialogProps) {
  return (
    ReactDOM.createPortal(
      <Dialog {...props} />,
      document.querySelector('#dialog') as Element
    )
  )
}

export default exportDialog
