import React from 'react'
const styles = require('./divider.css')

type TDividerProps = {
  title: string

}

function Divider({ title }: TDividerProps) {
  return (
    <div className={styles.divider}>
      <span className={styles.title}>{title}</span>
    </div>
  )
}

export default Divider
