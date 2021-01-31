import React, { useState } from 'react'
import ReactDOM from 'react-dom';
import { usePopper } from 'react-popper';

const styles = require('./style.css').default

type TooltipProps = {
  placement: string
  className?: string
  overlay: React.ReactElement
  children: React.ReactElement
}

const toastDOM = document.querySelector('#toast')

function Tooltip2(props: TooltipProps) {
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement);
  return (
    <React.Fragment>
      <div className={props.className} ref={setReferenceElement}>
        {props.children}
      </div>
      {ReactDOM.createPortal(
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          {props.overlay}
        </div>,
        toastDOM!
      )}
    </React.Fragment>
  )
}

function Tooltip(props: TooltipProps) {
  return (
    <div className={'relative ' + styles['tooltip-container'] + ' ' + props.className}>
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
