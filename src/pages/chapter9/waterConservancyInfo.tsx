import { useEffect, useState } from "react";
import styles from './waterConservancyInfo.module.scss'

import HighCharts from 'highcharts'
import Highcharts3d from 'highcharts/highcharts-3d';
Highcharts3d(HighCharts)

import axios from 'axios'
// 获取水位标注详情
function getWaterSituationInfo(id: string, callback: Function) {
  axios.get(`/waterConservancy/gxsl/api/sl323/realtime/river/gcx/${id}`).then(res => {
    if (res.data && Array.isArray(res.data.result)) {
      callback(res.data.result)
    }
  })
}
type waterSituation = {
  Z: number,
  TM: string,
  Q: number | null
}

// 获取雨量标注详情
function getRainfallInfo(id: string, startTime: string | undefined, endTime: string | undefined, callback: Function) {
  axios({
    url: `/waterConservancy/gxsl/api/sl323/realtime/rain/historyChart`,
    method: 'post',
    data: {
      stcd: id,
      startTime: startTime,
      endTime: endTime,
      intv: 60
    }
  }).then(res => {
    if (res.data && Array.isArray(res.data.result)) {
      callback(res.data.result)
    }
  })
}
type rainfall = {
  dm: string,
  rain: string
}
type waterConservancyInfoType = {
  waterLevel?: string | number,
  time?: string,
  flow?: string | number | null
}

// 图表基本配置
const option = {
  chart: {
    renderTo: 'chart',
    type: 'column',
    options3d: {
      enabled: true,
      alpha: 15,
      beta: 15,
      depth: 50,
      viewDistance: 25
    }
  },
  xAxis: {
    type: 'category'
  },
  yAxis: {
    title: {
      enabled: false
    }
  },
  tooltip: {
    headerFormat: '<b>{point.key}</b><br>',
    pointFormat: '水位: {point.y}'
  },
  title: {
    text: '水位信息',
    align: 'left'
  },
  legend: {
    enabled: false
  },
  plotOptions: {
    column: {
      depth: 25
    },
    pie: {
      depth: 25
    }
  },
  series: [{
    data: []
  }]
}

type infoType ={
  type?: string,
  id?: string,
  name?: string,
  startTime?: string,
  endTime?: string,
  address?: string
}
type propsType = {
  info: infoType
}
export default function (props: propsType) {
  const [waterConservancyInfo, setWaterConservancyInfo] = useState({} as waterConservancyInfoType)

  useEffect(() => {
    if (!props.info.id) return;
    props.info.type === 'water' ? getWaterSituationInfo(props.info.id, (data: Array<waterSituation>) => {
      option.title.text = props.info.name + '水位信息'
      option.series[0].data = data.map(item => ({ y: item.Z, name: item.TM } as never))
      HighCharts.chart(option)
      if (data.length > 0) {
        let index = data.length - 1
        setWaterConservancyInfo({
          waterLevel: data[index].Z,
          time: data[index].TM,
          flow: data[index].Q
        })
      }
    }) : getRainfallInfo(props.info.id, props.info.startTime, props.info.endTime, (data: Array<rainfall>) => {
      option.title.text = props.info.name + '雨量信息'
      option.series[0].data = data.map(item => ({ y: parseFloat(item.rain), name: item.dm } as never))
      option.chart.type = 'line'
      option.chart.options3d.enabled = false
      HighCharts.chart(option)
      if (data.length > 0) {
        let index = data.length - 1
        setWaterConservancyInfo({
          waterLevel: data[index].rain,
          time: data[index].dm
        })
      }
    })
  }, [props.info.id])
  return <div id="popup" className={styles['popup-box']}>
    <div id="chart" className={styles['chart-box']}></div>
    {waterConservancyInfo ? 
      (props.info.type === 'water' ? <>
      <div className={styles['water-conservancy-info']}>最新水位：{waterConservancyInfo.waterLevel}</div>
      <div className={styles['water-conservancy-info']}>时间：{waterConservancyInfo.time}</div>
      <div className={styles['water-conservancy-info']}>流量：{waterConservancyInfo.flow}</div>
    </> : <>
      <div className={styles['water-conservancy-info']}>最新雨量：{waterConservancyInfo.waterLevel}</div>
      <div className={styles['water-conservancy-info']}>时间：{waterConservancyInfo.time}</div>
      <div className={styles['water-conservancy-info']}>地址：{props.info.address}</div>
    </>) : <></>}

  </div>
}