import { Checkbox } from 'antd';
import type { GetProp } from 'antd';
import { useState, useEffect } from 'react';
import styles from './realTimeWaterSituation.module.scss'
import { useDispatch } from "react-redux";
import { setReservoir, setRiver, setWaterConservancyInfo } from '@/store/realTimeWaterSituationSlice';

import axios from 'axios'

const typeList = [
  {
    label: '水库',
    value: 'reservoir'
  },
  {
    label: '河流',
    value: 'rivers'
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
    label: '水位',
    key: 'Z',
    width: 80
  },
  {
    label: '警戒/汛眼',
    key: 'WRZ',
    width: 100
  },
  {
    label: '保证/正常高',
    key: 'LGTD',
    width: 100
  },
  {
    label: '流量',
    key: 'Q',
    width: 50
  },
  {
    label: '时间',
    key: 'TM',
    width: 100
  },
  {
    label: '地址',
    key: 'RVNM',
    width: 100
  }
]

function dealDate(value: number) {
  const time = new Date(value)
  return `${time.getFullYear()}-${padStr(time.getMonth() + 1, 2, '0')}-${padStr(time.getDate(), 2, '0')}`
}

function padStr(value: string | number, num: number, str: string) {
  return value.toString().padStart(num, str)
}

export default function () {
  const [selectedType, setSelectedType] = useState([] as Array<string>)
  const [dataList, setDataList] = useState([])

  const dispatch = useDispatch()

  function getDataList() {
    axios.get(`/waterConservancy/gxsl/api/sl323/realtime/river/`).then(res => {
      if (res.data && Array.isArray(res.data.result)) {
        setDataList(res.data.result)
      }
    })
  }

  useEffect(() => {
    getDataList()
  }, [])

  const onChange: GetProp<typeof Checkbox.Group, 'onChange'> = (checkedValues) => {
    setSelectedType(checkedValues as Array<string>)

    if (checkedValues.includes('reservoir') && Array.isArray(dataList) && dataList.length > 0) {
      dispatch(setReservoir(dataList.filter(data => !data.STNM.includes('水文'))))
    } else {
      dispatch(setReservoir([]))
    }
    if (checkedValues.includes('rivers') && Array.isArray(dataList) && dataList.length > 0) {
      dispatch(setRiver(dataList.filter(data => data.STNM.includes('水文'))))
    } else {
      dispatch(setRiver([]))
    }
  };

  function showWaterConservancyInfo(id: string, name: string, longitude: number, latitude: number) {
    dispatch(setWaterConservancyInfo({id, name, longitude, latitude}))
  }
  return <div className={styles['detail-content']}>
    <Checkbox.Group  className={styles['type-show']} options={typeList} defaultValue={selectedType} onChange={onChange} />
    {typeList.map(item => !selectedType.includes(item.value) ? null : <div className={styles['type-item']} key={item.value}>
      <div className={styles['type-header']}>{item.label}信息（单位：m）</div>
      <table className={styles['data-content']} style={{ width: `${columnList.reduce((a, b) => a + b.width, 0)}px` }}>
        <thead>
          <tr>
            {columnList.map(column => <th key={column.key} style={{ width: `${column.width}px` }}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {dataList.filter(data => item.value === 'reservoir' ? !data.STNM.includes('水文') : data.STNM.includes('水文'))
            .map(data => <tr key={data.STCD} onClick={() => showWaterConservancyInfo(data.STCD, data.STNM, data.LGTD, data.LTTD)}>
            {columnList.map(column => <td key={column.key}>{column.key === 'TM' ? dealDate(data[column.key]) : data[column.key]}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>)}
  </div>
}