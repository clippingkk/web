import React from 'react'
import { Link } from '@reach/router';
import { useTranslation } from 'react-i18next';
const styles = require('./no-content.css')

type TNoContentProps = {
  userid: number
}

function NoContentAlert({ userid }: TNoContentProps) {
  const { t } = useTranslation()
  return (
    <Link className={styles.none} to={`/dash/${userid}/upload`}>
      <h3 className={styles.tip}>{t('app.home.notfound')}</h3>
      <h3 className={styles.tip}>{t('app.home.uploadTip')}</h3>
    </Link>
  )
}

export default NoContentAlert
