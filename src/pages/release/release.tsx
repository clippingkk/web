import React from 'react'
import { getVersions, IVersionItem } from '../../services/release'
const styles = require('./release')

interface IReleasePageState {
  versionList: IVersionItem[]
}

class ReleasePage extends React.PureComponent<any, IReleasePageState> {

  state = {
    versionList: []
  }

  componentDidMount() {
    getVersions(this.props.platform).then(res => {
      this.setState({
        versionList: res.data
      })
    })

  }
  render() {
    return (
      <section className={styles.releasePage}>
        <h2 className={styles.platformTitle}>{this.props.platform}</h2>
        <hr />

        <ul className={styles.versionList}>
          {this.state.versionList.map((versionInfo: IVersionItem) => (
            <li>
              <a href={versionInfo.url} download>{versionInfo.version}</a>
              <p>{versionInfo.info}</p>
            </li>
          ))}
        </ul>
      </section>
    )
  }
}

export default ReleasePage
