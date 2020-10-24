import React from 'react'

const styles = require('./style.css').default

type TooltipProps = {
  placement: string
  overlay: React.ReactElement
  children: React.ReactElement
}

function Tooltip(props: TooltipProps) {
  return (
    <div className={'relative ' + styles['tooltip-container']}>
      <div
        className={'absolute top-0 left-0 translate-y-12 -translate-x-2  transform dar:bg-gray-700 bg-gray-200 p-1 rounded-sm whitespace-no-wrap opacity-0 ' + styles.tip}
      >
        {props.overlay}
      </div>
      {props.children}
    </div>
  )
}

export default Tooltip
