import React from 'react'

type cardProps = {
  className?: string
  style?: Object
  onClick?: (e: React.MouseEvent) => void
  children?: React.ReactElement
}

class Card extends React.PureComponent<cardProps> {
  onCardClick = (e: React.MouseEvent) => {
    if (this.props.onClick) {
      this.props.onClick(e)
    }
  }

  render() {
    const cls = `m-4 p-4 rounded shadow bg-gray-400 bg-opacity-50 ${this.props.className || ''}`
    return (
      <section
        className={cls}
        onClick={this.onCardClick}
        style={this.props.style}
      >
        {this.props.children}
      </section>
    )
  }
}

export default Card
