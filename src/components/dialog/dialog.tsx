import React from 'react'
import ReactDOM from 'react-dom'
import Card from '../card/card';
const styles = require('./dialog.css')

type dialogProps = {
  onCancel: (e: React.MouseEvent) => void,
  onOk: (e: React.MouseEvent) => void,
  title: string,
}

class Dialog extends React.PureComponent<dialogProps> {

  stopBuble = (e: React.MouseEvent) => {
    e.stopPropagation()
  }
  render() {
    return (
      <div className={styles.mask} onClick={this.props.onCancel}>
        <Card className={styles.dialog} onClick={this.stopBuble}>
          {this.props.children}
        </Card>
      </div>
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
