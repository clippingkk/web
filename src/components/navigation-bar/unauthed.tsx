import React from 'react'
const styles = require('./unauthed.css')

function Unauthed() {
  return null
  // 想了一下，似乎在移动端，顶上没有导航条更好一些，暂时先没有内容了
  return (
    <header className={styles.unauthed}>
      <h2></h2>
    </header>
  )
}

export default Unauthed

