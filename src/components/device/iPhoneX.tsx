import React from 'react'

type DeviceIPhoneXProps = {
  className?: string
  children: React.ReactNode
}

function DeviceIPhoneX(props: DeviceIPhoneXProps) {
  return (
    <div className={'marvel-device iphone-x ' + (props.className ?? '')}>
      <div className="notch">
        <div className="camera"></div>
        <div className="speaker"></div>
      </div>
      <div className="top-bar"></div>
      <div className="sleep"></div>
      <div className="bottom-bar"></div>
      <div className="volume"></div>
      <div className="overflow">
        <div className="shadow-sm shadow--tr"></div>
        <div className="shadow-sm shadow--tl"></div>
        <div className="shadow-sm shadow--br"></div>
        <div className="shadow-sm shadow--bl"></div>
      </div>
      <div className="inner-shadow"></div>
      <div className="screen">
        {props.children}
      </div>
    </div>
  )
}

export default DeviceIPhoneX
