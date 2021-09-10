import React, { useState, useEffect } from 'react'
import { getVersions, IVersionItem } from '../../services/release'
import { usePageTrack } from '../../hooks/tracke'
import styles from './release.module.css'

const isiPhone = process.browser ? /iPhone/.test(navigator.userAgent) : false

function ReleasePage({ platform }: any) {
  usePageTrack('legacy:release')
  const [versionList, setVersionList] = useState([])

  useEffect(() => {
    getVersions(platform).then(setVersionList as any)
  }, [platform])

  return (
    <section className={`${styles.releasePage} page`}>
      <h2 className={styles.platformTitle}>ClippingKK ❤️ {platform}</h2>
      <hr />

      <ul className={styles.versionList}>
        {versionList.map((versionInfo: IVersionItem) => (
          <li className={styles.version} key={versionInfo.id}>
            <a
              href={versionInfo.url}
              download={`clippingkk-${versionInfo.platform}-${versionInfo.version}.${isiPhone ? 'ipa' : 'apk'}`}
              className={styles.versionLink}
            >
              <p className={styles.versionNumber}>😁 {versionInfo.version}</p>
              <p>{versionInfo.info}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ReleasePage
