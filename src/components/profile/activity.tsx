import React, { useEffect, useMemo, useRef } from 'react'
import * as echarts from 'echarts'
import { ProfileQuery } from '../../schema/generated'
import dayjs from 'dayjs'

type PersonalActivityProps = {
  data: ProfileQuery['me']['analysis']['daily']
}

function PersonalActivity(props: PersonalActivityProps) {
  const opts = useMemo(() => {
    const startAt = dayjs().subtract(1, 'y')
    let ly = startAt.clone()

    const heatmapData: (string | number)[][] = []

    // TODO: 转 map
    const m = new Map(props.data.map(x => [x.date, x.count]))

    while (ly.isBefore(Date.now())) {
      const pat = ly.format('YYYY-MM-DD')
      let count = 0
      if (m.has(pat)) {
        count = m.get(pat)!
      }

      heatmapData.push([
        echarts.time.format(ly.clone().toDate(), '{yyyy}-{MM}-{dd}', false),
        count
      ])
      ly = ly.add(1, 'day')
    }

    const maxCount = Math.max(...props.data.map(x => x.count))

    // const heatmapData = props.data.map(x => [
    //   echarts.time.format(x.date, '{yyyy}-{MM}-{dd}', false),
    //   x.count
    // ])
    const option = {
      title: {},
      tooltip: {

    formatter: function (p:any) {
      const format = echarts.time.format(p.data[0], '{yyyy}-{MM}-{dd}', false);
      return format + ': ' + p.data[1];
    }
      },
      visualMap: {
        min: 0,
        max: maxCount,
        type: 'piecewise',
        orient: 'horizontal',
        left: 'center',
        show: false,
        inRange: {
          color: [
            'rgba(56, 189, 248, .1)',
            'rgba(66, 189, 248, .3)',
            'rgba(76, 189, 248, .5)',
            'rgba(86, 189, 248, .7)',
            'rgba(96, 189, 248, .9)',
          ]
        }
      },
      calendar: {
        top: 30,
        left: 30,
        right: 30,
        cellSize: ['auto', 13],
        range: [startAt.format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
        itemStyle: {
          borderColor: 'rgba(96, 189, 248, .9)',
          borderWidth: 0.5
        },
        splitLine: {
          show: false,
          lineStyle: {
          }
        },
        yearLabel: { show: false }
      },
      series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        emphasis: {
        },
        data: heatmapData
      }
    };
    return option
  }, [props.data])

  const dom = useRef<HTMLDivElement>(null)
  const ins = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    function onResize() {
      ins.current?.resize()
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    ins.current = echarts.init(dom.current!)
    ins.current.setOption(opts)
    ins.current.resize()
    return () => {
      ins.current?.dispose()
      ins.current = null
    }
  }, [])
  useEffect(() => {
    ins.current?.setOption(opts)
  }, [opts])

  return (
    <div className='h-48' ref={dom} />
  )
}

export default PersonalActivity
