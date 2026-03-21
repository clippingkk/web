import type React from 'react'

type DeviceIPhoneXProps = {
  className?: string
  children: React.ReactNode
}

function DeviceIPhoneX(props: DeviceIPhoneXProps) {
  return (
    <div className={`marvel-device iphone-x ${props.className ?? ''}`}>
      <div className="notch">
        <div className="camera"></div>
        <div className="speaker"></div>
      </div>
      <div className="top-bar"></div>
      <div className="sleep"></div>
      <div className="bottom-bar"></div>
      <div className="volume"></div>
      <div className="overflow">
        <div className="shadow--tr shadow-sm"></div>
        <div className="shadow--tl shadow-sm"></div>
        <div className="shadow--br shadow-sm"></div>
        <div className="shadow--bl shadow-sm"></div>
      </div>
      <div className="inner-shadow"></div>
      <div className="screen">{props.children}</div>
    </div>
  )
}

export default DeviceIPhoneX
