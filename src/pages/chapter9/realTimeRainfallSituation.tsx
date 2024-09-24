import { Checkbox } from 'antd';
import type { GetProp } from 'antd';
import { useState, useEffect, ChangeEvent } from 'react';
import styles from './realTimeRainfallSituation.module.scss'
import { useDispatch } from "react-redux";
import { setRainfallList, setRainfallInfo } from '@/store/realTimeRainfallSituationSlice';
import { DatePicker } from 'antd'
import type { DatePickerProps } from 'antd';
const { RangePicker } = DatePicker;

import axios from 'axios'

const typeList = [
  {
    label: '0',
    value: '0',
    color: 'white',
    key: 'range1'
  },
  {
    label: '10',
    value: '10',
    color: '#95D971',
    key: 'range2'
  },
  {
    label: '25',
    value: '25',
    color: '#37A100',
    key: 'range3'
  },
  {
    label: '50',
    value: '50',
    color: '#8CCFFA',
    key: 'range4'
  },
  {
    label: '100',
    value: '100',
    color: '#048EEA',
    key: 'range5'
  },
  {
    label: '250',
    value: '250',
    color: '#FF8D8D',
    key: 'range6'
  },
  {
    label: '250以上',
    value: '250',
    color: '#FF0000',
    key: 'range7'
  }
]

const columnList = [
  {
    label: '站码',
    key: 'STCD',
    width: 100,
  },
  {
    label: '站名',
    key: 'STNM',
    width: 200
  },
  {
    label: '雨量',
    key: 'ACCP',
    width: 80
  },
  {
    label: '地址',
    key: 'STLC',
    width: 200
  }
]

type dataType = {
  [key: string]: string
}
const defaultType: dataType = {}
typeList.forEach(item => {
  defaultType[item.key] = ''
})

function dealDate(value: Date) {
  return `${value.getFullYear()}-${padStr(value.getMonth() + 1, 2, '0')}-${padStr(value.getDate(), 2, '0')} ${padStr(value.getHours(), 2, '0')}:${padStr(value.getMinutes(), 2, '0')}:${padStr(value.getSeconds(), 2, '0')}`
}

function padStr(value: string | number, num: number, str: string) {
  return value.toString().padStart(num, str)
}

export default function () {
  const now = new Date()
  const defaultStartTime = dealDate(new Date(now.getTime() - 2 * 60 * 60 * 1000))
  const defaultEndTime = dealDate(now)
  const [selectedType, setSelectedType] = useState(defaultType)
  const [dataList, setDataList] = useState([])

  const [dateInfo, setDateInfo] = useState({
    startTime: '',
    endTime: ''
  })

  const dispatch = useDispatch()

  function getDataList() {
    axios({
      url: `/waterConservancy/gxsl/api/sl323/realtime/rain/history`,
      method: 'post',
      data: {
        ...selectedType,
        startTime: dateInfo.startTime || defaultStartTime,
        endTime: dateInfo.endTime || defaultEndTime,
        adcd: '',
        stnm: ''
      }
    }).then(res => {
      if (res.data && Array.isArray(res.data.result)) {
        let dealList = res.data.result.map(item => {
          let temp = { ...item }
          typeList.forEach((citem, index) => {
            if (parseFloat(item.ACCP) <= parseFloat(citem.value)) {
              if (index === 0 || index > 0 && parseFloat(item.ACCP) > parseFloat(typeList[index - 1].value)) {
                temp.color = citem.color
              }
            }
            if (index === typeList.length && parseFloat(item.ACCP) > parseFloat(citem.value)) {
              temp.color = citem.color
            }
          })
          if (!item.color) {
            item.color = typeList[0].color
          }
          return temp
        })
        setDataList(dealList)
        dispatch(setRainfallList(dealList))
      }
    })
  }

  useEffect(() => {
    dispatch(setRainfallInfo({ startTime: defaultStartTime, endTime: defaultEndTime }))
    getDataList()
  }, [])

  function onChange(data: ChangeEvent<HTMLInputElement>, value: string, key: string) {
    const isChecked = data.target.checked
    setSelectedType((newVal) => {
      if (isChecked) {
        newVal[key] = value
      } else {
        newVal[key] = ''
      }
      return newVal
    })
    getDataList()
  }

  function changeDate(data: DatePickerProps, dateString: Array<string>) {
    setDateInfo({
      startTime: dateString[0],
      endTime: dateString[1]
    })
    getDataList()
    dispatch(setRainfallInfo({ startTime: dateString[0], endTime: dateString[1] }))
  }

  function showRainfallInfo(id: string, name: string, longitude: number, latitude: number, address: string) {
    dispatch(setRainfallInfo({
      id,
      name,
      longitude,
      latitude,
      startTime: dateInfo.startTime || defaultStartTime,
      endTime: dateInfo.endTime || defaultEndTime,
      address
    }))
  }
  return <div className={styles['detail-content']}>
    <RangePicker className={styles['filter-date']} showTime onChange={changeDate} format="YYYY-MM-DD HH:mm:ss" />
    <div className={styles['type-item']}>
      <div className={styles['type-header']}>雨量范围（单位：mm）</div>
      <div className={styles['rainfall-type-box']}>
        {typeList.map(item => <div className={styles['rainfall-item']} key={item.key}>
          <input type="checkbox" name='rainfall' value={item.value} onChange={(data) => onChange(data, item.value, item.key)} />
          <div className={styles['rainfall-item-color']} style={{ backgroundColor: item.color }}></div>
          {item.label}
        </div>)}
      </div>
    </div>

    <div className={styles['type-item']}>
      <div className={styles['type-header']}>雨量信息（单位：mm）</div>
      <table className={styles['data-content']} style={{ width: `${columnList.reduce((a, b) => a + b.width, 0)}px` }}>
        <thead>
          <tr>
            {columnList.map(column => <th key={column.key} style={{ width: `${column.width}px` }}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {dataList.map(data => <tr key={data.STCD} onClick={() => showRainfallInfo(data.STCD, data.STNM, data.LGTD, data.LTTD, data.STLC)}>
            {columnList.map(column => <td key={column.key}>{column.key === 'TM' ? dealDate(data[column.key]) : data[column.key]}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
  </div>
}