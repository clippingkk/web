import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useStore } from 'react-redux'
import Dialog from '../../../../components/dialog/dialog'
import q from '../../../../schema/claimAPIToken.graphql'
import { claimCliAPIToken, claimCliAPITokenVariables } from '../../../../schema/__generated__/claimCliAPIToken'
import { getLocalToken } from '../../../../services/ajax'

type CliApiTokenProps = {
}

function CliApiToken(props: CliApiTokenProps) {
  const [doClaim, { data }] = useMutation<claimCliAPIToken, claimCliAPITokenVariables>(q)
  // TODO: request publick api token
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!visible) {
      return
    }
    const t = getLocalToken()
    // impossible. just tell the compiler
    if (!t) {
      return
    }
    doClaim({
      variables: {
        token: t
      }
    })
  }, [visible, doClaim])

  return (
    <div>
      <button
        onClick={() => {
          setVisible(true)
        }}
      >
        获取命令行的 API Token
      </button>
      {visible && (
        <Dialog
          onCancel={() => {
            setVisible(false)
          }}
          onOk={() => {
            setVisible(false)
          }}
          title='cli api token'
        >
          <div>
            1. download cli and set it executable

            2. run `ck-cli --token={data?.claimAPIKey} parse --input My\ Clippings.txt --out http`

            3. refresh and wait it sync
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default CliApiToken
