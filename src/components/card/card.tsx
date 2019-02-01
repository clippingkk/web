import React from 'react'
const styles = require('./card.css')

class Card extends React.PureComponent {
  render() {
    return (
      <section className={styles.card}>
        { this.props.children }
      </section>
    )

  }

}

export default Card
