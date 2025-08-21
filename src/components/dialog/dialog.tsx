import React from 'react'
import ReactDOM from 'react-dom'
import Card from '../card/card'
import styles from './dialog.module.css'

type dialogProps = {
  onCancel: (e: React.MouseEvent) => void
  onOk?: (e: React.MouseEvent) => void
  title: string
  children: React.ReactElement
}

class InnerDialog extends React.PureComponent<dialogProps> {
  stopBuble = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  render() {
    return (
      <div className={styles.mask} onClick={this.props.onCancel}>
        <Card className='bg-gray-200 with-fade-in' onClick={this.stopBuble}>
          <>
            <h3 className='mb-4 text-2xl text-center'>{this.props.title}</h3>
            <hr />
            <div>{this.props.children}</div>
          </>
        </Card>
      </div>
    )
  }
}

function Dialog(props: dialogProps) {
  return ReactDOM.createPortal(
    <InnerDialog {...props} />,
    document.querySelector('#dialog') as Element
  )
}

export default Dialog
