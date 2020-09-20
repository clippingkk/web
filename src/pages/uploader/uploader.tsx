import React, { useCallback } from 'react'
import { Link } from '@reach/router'
import swal from 'sweetalert'
import { useDispatch } from 'react-redux'
import { syncClippings } from '../../store/clippings/type'
import { usePageTrack, useActionTrack } from '../../hooks/tracke'
import { extraFile } from '../../store/clippings/creator'
import ClippingTextParser, { TClippingItem } from '../../store/clippings/parser'
import { useMutation } from '@apollo/client'
import createClippingsQuery from '../../schema/mutations/create-clippings.graphql'
import { createClippings, createClippingsVariables } from '../../schema/mutations/__generated__/createClippings'
import { wenquRequest, WenquSearchResponse } from '../../services/wenqu'
const styles = require('./uploader.css')

function useUploadData() {
  const [exec, { data, error }] = useMutation<createClippings, createClippingsVariables>(createClippingsQuery)
  const cb = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.items[0]

    if (file.kind !== 'file' || file.type !== 'text/plain') {
      swal({
        title: 'Oops',
        text: '请务必提供 kindle 中的 My Clipping.txt 哦',
        icon: 'error',
      })
      return
    }

    const str = await extraFile(file)

    swal({
      title: '解析中',
      text: '正在拼命解析中，请稍等...',
      icon: 'info',
      buttons: [false],
      closeOnClickOutside: false,
      closeOnEsc: false,
    })

    const parser = new ClippingTextParser(str)
    const parsedData = parser.execute()

    for (let i of parsedData) {
      try {
        const resp = await wenquRequest<WenquSearchResponse>(`/books/search?query=${i.title}`)
        if (resp.count > 0) {
          i.bookId = resp.books[0].doubanId.toString()
        }
      } catch (e) {
        console.log(e)
      }
    }

    // TODO: search bookID
    const chunkedData = parsedData.reduce((result: (TClippingItem[])[], item: TClippingItem, index: number) => {
      if (result[result.length - 1].length % 20 === 0 && index !== 0) {
        result.push([item])
      } else {
        result[result.length - 1].push(item)
      }
      return result
    }, [[]] as TClippingItem[][])


    try {
      for (let i = 0; i < chunkedData.length; i++) {
        await exec({
          variables: {
            payload: chunkedData[i].map(x => ({ ...x, bookID: x.bookId }))
          }
        })
      }
      swal({
        title: 'Yes!',
        text: '牛逼！你上传完成了！',
        icon: 'success'
      })

    } catch (e) {
      swal({
        title: e.toString(),
        text: '哎呀呀，上传失败了，重试一下。实在不行联系程序员吧 \n iamhele1994@gmail.com',
        icon: 'error'
      })
    }

  }, [])

  return cb
}

function UploaderPage() {
  usePageTrack('uploader')
  const onUploadData = useUploadData()
  const onUpload = useActionTrack('upload')
  const dispatch = useDispatch()
  const onDropEnd = useCallback((e: React.DragEvent) => {
    onUpload()
    onUploadData(e)
  }, [onUpload, onUploadData])

  const stopDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])
  return (
    <section className={styles.uploader}>
      <div
        className={`flex flex-col items-center justify-center py-32 w-10/12 my-8 mx-auto shadow-2xl rounded-sm ${styles.box}`}
        onDragOver={stopDragOver}
        onDrop={onDropEnd}
      >
        {/* <FontAwesomeIcon icon="cloud-upload-alt" color="#ffffff" size="8x" /> */}
        <span className='text-6xl'>🎈</span>
        <h3 className='text-2xl'>把 My Clippings.txt 拖进来</h3>
      </div>
      <div className='w-full flex items-center justify-center my-8'>
        <Link to="/" className='text-center text-gray-900 text-lg hover:text-red-300'>
          什么是 My Clippings.txt
          </Link>
      </div>
    </section>
  )
}

export default UploaderPage
