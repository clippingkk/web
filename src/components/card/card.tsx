import React from 'react'

type cardProps = {
  className?: string
  style?: Object
  onClick?: (e: React.MouseEvent) => void
  children?: React.ReactElement
  glow?: boolean
}

function Card(props: cardProps) {
  const { className = '', style, onClick, glow, children } = props
  const cls = `m-4 p-4 rounded shadow bg-gray-400 bg-opacity-50 ${className}`
  return (
    <section
      className={cls}
      onClick={onClick}
      style={style}
      data-glow={glow}
    >
      {children}
    </section>
  )
}

export default Card
