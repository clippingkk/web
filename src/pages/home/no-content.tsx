import React from 'react'
import { Link } from '@reach/router';
const styles = require('./no-content.css')

type TNoContentProps = {
  userid: number
}

function NoContentAlert({ userid }: TNoContentProps) {
  return (
    <Link className={styles.none} to={`/dash/${userid}/upload`}>
      <h3 className={styles.tip}>什么！你竟然还没有读书笔记？</h3>
      <h3 className={styles.tip}>还不快点我上传</h3>
    </Link>
  )
}

export default NoContentAlert
