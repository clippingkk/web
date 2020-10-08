import React from 'react'
import './loading.styl'

const percents = [0.25, 0.5, 0.75, 1]
type UploadLoadingProps = {
  percent: number // percent must % 25 = 0
  title: string
  progress: number
  message?: string
}

function UploadLoading(props: UploadLoadingProps) {
  return (
    <div>
      <div className="progress-container">
        <div className="progress-box">
          <div className="progress-fill" style={{ transform: `scaleY(${percents[props.percent]})` }} />
        </div>
        <div className="progress-state state-load">
          <h3>{props.title}</h3>
          <h4>{props.progress}</h4>
          <p>{props.message}</p>
        </div>
        <div className="progress-state state-finish">Complete!</div>
      </div>
      <div className="dump-truck">
        <div className="front"></div>
        <div className="bucket"></div>
        <div className="dirt">
          <div className="dirt-spill"></div>
        </div>
        <div className="base"></div>
        <div className="wheel wheel-front"></div>
        <div className="wheel wheel-middle"></div>
        <div className="wheel wheel-back"></div>
      </div>
      <div className="dump-truck">
        <div className="front"></div>
        <div className="bucket"></div>
        <div className="dirt">
          <div className="dirt-spill"></div>
        </div>
        <div className="base"></div>
        <div className="wheel wheel-front"></div>
        <div className="wheel wheel-middle"></div>
        <div className="wheel wheel-back"></div>
      </div>
    </div>
  )
}

export default UploadLoading
