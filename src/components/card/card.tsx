import React from 'react'
const styles = require('./card.css')

type cardProps = {
  className?: string
}

class Card extends React.PureComponent<cardProps> {
  render() {
    const cls = `${styles.card} ${this.props.className || ''}`
    return (
      <section className={cls}>
        { this.props.children }
      </section>
    )
  }
}

export default Card
