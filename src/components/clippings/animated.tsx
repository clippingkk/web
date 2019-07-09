import React, { useRef } from 'react'
import { useChain, animated, useSpring, useTransition, config } from 'react-spring'
import { IClippingListPropTypes } from './types';
import ClippingItem from '../clipping-item/clipping-item';

const values = {
  config: config.stiff,
  from: { size: '20%', background: 'hotpink' },
  to: { size: '100%' }
}

function AnimatedClippings(p: IClippingListPropTypes) {
  return null
// const springRef = useRef()
// const props = useSpring({...values, ref: springRef})
// // Build a transition and catch its ref
// const transitionRef = useRef()
// const transitions = useTransition({...values, ref: transitionRef})
// // First run the spring, when it concludes run the transition
// useChain([springRef, transitionRef])
// Use the animated props like always
// return (
//   <animated.div style={props}>
//     {transitions.map(({item, key, props}) => (
//       <animated.div key={key} style={props}>
//         <ClippingItem item={item} userid={p.userid} />
//       </animated.div>
//     ))}
//   </animated.div>
// )
  
}
export default AnimatedClippings
