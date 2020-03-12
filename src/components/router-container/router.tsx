import React from 'react'
import { Router, Location } from "@reach/router";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { AnimateOnChange } from '@nearform/react-animation'
const styles = require('./router.css')

function RouterContainer(props: any) {
  return (
    <Location>
      {({ location }) => (
        <TransitionGroup className={styles.transitionGroup}>
          <CSSTransition key={location.key} classNames="slide" timeout={5000}>
            <Router location={location} className={styles.router}>
              {props.children}
            </Router>
          </CSSTransition>
        </TransitionGroup>
      )}
    </Location>
  )
}

function _RouterContainer(props: any) {
  return (
    <Location>
      {({ location }) => (
        // <AnimateOnChange
        //   className={styles.transitionGroup}
        // >
          <Router location={location} className={styles.router}>
            {props.children}
          </Router>
        // </AnimateOnChange>
      )}
    </Location>
  )
}

export default _RouterContainer
