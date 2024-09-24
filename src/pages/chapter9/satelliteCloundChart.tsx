import { useEffect, useState } from "react";
import { Select } from 'antd'
import axios from 'axios'

import styles from './satelliteCloundChart.module.scss'
import { useDispatch, useSelector } from "react-redux";
import { setImageList, setImageIndex, setIntervalInfo } from "@/store/satelliteCloundChartSlice";

const intervalList = [1, 2, 3, 5]
let interval = intervalList[0]

function changeInterval(data: number) {
  interval = data
}

function padStr(value: string | number, num: number = 2, str: string = '0') {
  return value.toString().padStart(num, str)
}
function dealDate(nowTime: Date) {
  return `${nowTime.getFullYear()}${padStr(nowTime.getMonth() + 1)}${padStr(nowTime.getDate())}${padStr(nowTime.getHours())}${padStr(nowTime.getMinutes())}`
}

function dealTime(value: string) {
  return value.substr(2, 12)
}

export default function () {
  const [timeList, setTimeList] = useState([])
  const dispatch = useDispatch()
  const imgIndex = useSelector(state => {
    return state.satelliteCloundChartStore.value.index
  })
  const [currentIndex, setCurrentIndex] = useState(-1)

  function getDataList() {
    const nowTime = new Date()
    const eTm = dealDate(nowTime)
    nowTime.setDate(nowTime.getDate() - 1)
    const sTm = dealDate(nowTime)
    axios({
      url: `/waterConservancy/gxsl/api/v0.1/common/img/getImgList/`,
      method: 'post',
      data: {
        sTm,
        eTm,
        typeKey: 'W1'
      }
    }).then(res => {
      if (res.data && Array.isArray(res.data.result)) {
        setTimeList(res.data.result)
        dispatch(setImageList(res.data.result))
      }
    })
  }

  function playImage() {
    dispatch(setIntervalInfo(interval))
  }

  
  function stopImage() {
    dispatch(setIntervalInfo(0))
  }

  useEffect(() => {
    getDataList()
  }, [])
  useEffect(() => {
    if (imgIndex !== -1) {
      setCurrentIndex(imgIndex)
    }
  }, [imgIndex])
  return <div className={styles['satellite-clound-chart']}>
    <Select onChange={changeInterval}>
      {intervalList.map(item => <Select.Option key={item} value={item}>{item}秒</Select.Option>)}
    </Select>
    <button onClick={playImage}>播放</button>
    <button onClick={stopImage}>停止</button>
    <div className={styles['time-list']}>
      {timeList.map((item, index) => <li key={item.name} className={currentIndex === index ? styles['active'] : ''} onClick={() => {dispatch(setImageIndex(index))}}>{dealTime(item.name)}</li>)}
    </div>
  </div>
}