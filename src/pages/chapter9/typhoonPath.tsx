import { useState, useEffect, ChangeEvent } from 'react';
import styles from './realTimeRainfallSituation.module.scss'
import { useDispatch } from "react-redux";
import { setTyphoonPathList } from '@/store/typhoonPathSlice';
import { useSelector } from 'react-redux';

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
    label: '时间',
    key: 'TM',
    width: 200,
  },
  {
    label: '风力',
    key: 'WINDFORCE',
    width: 80
  },
  {
    label: '风速',
    key: 'WINDFORCEVEL',
    width: 80
  },
  {
    label: '气压',
    key: 'WINDPRESS',
    width: 80
  }
]

const columnFilter = [
  {
    label: '选择',
    type: 'checkbox',
    key: 'checkbox',
    width: 80,
  },
  {
    label: '台风编号',
    key: 'NO',
    width: 100
  },
  {
    label: '台风名',
    key: 'NAME',
    width: 180
  },
  {
    label: '英文名',
    key: 'ENGNAME',
    width: 180
  }
]

type dataType = {
  [key: string]: string
}
const defaultType: dataType = {}
typeList.forEach(item => {
  defaultType[item.key] = ''
})

function padStr(value: string | number, num: number, str: string) {
  return value.toString().padStart(num, str)
}

export default function () {
  const [dataList, setDataList] = useState([])
  const [dataFilter, setDataFilter] = useState([])

  const typhoonPathStore = useSelector((state) => {
    return state.typhoonPathStore.value.typhoonPathList
  })

  const dispatch = useDispatch()

  function getDataFilter() {
    const now = new Date()
    axios({
      url: `/waterConservancy/gxsl/api/v0.1/common/typhoon/getWthTyphoonList/${now.getFullYear()}`,
      method: 'get',
    }).then(res => {
      if (res.data && Array.isArray(res.data.result)) {
        setDataFilter(res.data.result)
      }
    })
  }

  function getDataList(data) {
    axios({
      url: `/waterConservancy/gxsl/api/v0.1/common/typhoon/getWthTyphoonPathList/${data.NO}`,
      method: 'get',
    }).then(res => {
      if (res.data && Array.isArray(res.data.result)) {
        setDataList(res.data.result)
        const tempList = JSON.parse(JSON.stringify(typhoonPathStore))
        tempList.push({
          ...data,
          path: res.data.result
        })
        dispatch(setTyphoonPathList(tempList))
      }
    })
  }

  useEffect(() => {
    getDataFilter()
  }, [])

  function onChange(data: ChangeEvent<HTMLInputElement>, value) {
    const isChecked = data.target.checked
    const tempList = JSON.parse(JSON.stringify(typhoonPathStore))
    const index = tempList.findIndex(item => item.NO === value)
    if (index === -1 && isChecked) {
      getDataList(value)
    }
    if (index !== -1 && !isChecked) {
      tempList.splice(index, 1)
      dispatch(setTyphoonPathList(tempList))
    }
  }
  return <div className={styles['detail-content']}>
  <table className={styles['data-content']} style={{ width: `${columnFilter.reduce((a, b) => a + b.width, 0)}px` }}>
    <thead>
      <tr>
        {columnFilter.map(column => <th key={column.key} style={{ width: `${column.width}px` }}>{column.label}</th>)}
      </tr>
    </thead>
    <tbody>
      {dataFilter.map(data => <tr key={data.NO}>
        {columnFilter.map(column => <td key={column.key}>{column.type === 'checkbox' ? <input type="checkbox" value="${data[column.key]}}" onChange={(event) => onChange(event, data)} /> : data[column.key]}</td>)}
      </tr>)}
    </tbody>
  </table>
    <div className={styles['type-item']}>
      <div className={styles['type-header']}>台风路径</div>
      <table className={styles['data-content']} style={{ width: `${columnList.reduce((a, b) => a + b.width, 0)}px` }}>
        <thead>
          <tr>
            {columnList.map(column => <th key={column.key} style={{ width: `${column.width}px` }}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {dataList.map((data, index) => <tr key={index}>
            {columnList.map(column => <td key={column.key}>{data[column.key]}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
  </div>
}