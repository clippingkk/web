import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from '@reach/router'
import swal from 'sweetalert'
import { connect } from 'react-redux'
import { syncClippings } from '../../store/clippings/type'
const styles = require('./uploader.css')

// @ts-ignore
@connect(
  null,
  dispatch => ({
    sync(file: DataTransferItem) {
      return dispatch(syncClippings(file))
    },
  })
)
class UploaderPage extends React.PureComponent<any> {
  onDropEnd = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.items[0]

    if (file.kind !== 'file' || file.type !== 'text/plain') {
      swal({
        title: 'Oops',
        text: '请务必提供 kindle 中的 My Clipping.txt 哦',
        icon: 'error',
      })
      return
    }

    this.props.sync(file)
  }

  stopDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  render() {
    return (
      <section className={styles.uploader}>
        <div
          className={`flex flex-col items-center justify-center py-32 w-10/12 my-8 mx-auto shadow-2xl rounded-sm ${styles.box}`}
          onDragOver={this.stopDragOver}
          onDrop={this.onDropEnd}
        >
          {/* <FontAwesomeIcon icon="cloud-upload-alt" color="#ffffff" size="8x" /> */}
          <span className='text-6xl'>🎈</span>
          <h3 className='text-2xl'>把 My Clippings.txt 拖进来</h3>
        </div>
        <div className='w-full flex items-center justify-center my-8'>
          <Link to="/" className='text-center text-gray-900 text-lg hover:text-red-300'>
            什么是 My Clippings.txt
          </Link>
        </div>
      </section>
    )
  }
}

export default UploaderPage
