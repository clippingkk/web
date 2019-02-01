import React from 'react'
const styles = require('./uploader.css')

class UploaderPage extends React.PureComponent {

  onDragEnd = (e: React.DragEvent<HTMLImageElement>) => {
    // TODO
    console.log('on drag end')
  }

  render() {
    return (
      <section className="uploader">
        <img src="" onDragEnd={this.onDragEnd} />
        <h3>drag</h3>
        <span>drag your clipping.txt</span>
      </section>
    )
  }
}

export default UploaderPage
