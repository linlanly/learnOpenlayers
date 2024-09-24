import styles from './detail.module.scss'
import { CaretRightOutlined, CaretLeftOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'

import RealTimeWaterSituation from './realTimeWaterSituation'
import RealTimeRainfallSituation from './realTimeRainfallSituation'
import TyphoonPath from './typhoonPath'
import SatelliteCloundChart from './satelliteCloundChart'
import { useSelector } from 'react-redux';

import { functionTypes } from "./data";

export default function () {
  const typeStore = useSelector((state) => {
    return state.typeStore.value
  })
  const [currentPanel, setCurrentPanel] = useState('')
  const [currentComponent, setCurrentComponent] = useState(<RealTimeWaterSituation />)
  useEffect(() => {
    if (!currentPanel && typeStore.length > 0 || !typeStore.includes(currentPanel) && typeStore.length > 0) {
      setCurrentPanel(typeStore[0])
    }
  }, [typeStore])
  useEffect(() => {
    let temp
    switch (currentPanel) {
      case functionTypes[0].key:
        temp = <RealTimeWaterSituation />
        break
      case functionTypes[1].key:
        temp = <RealTimeRainfallSituation />
        break
      case functionTypes[2].key:
        temp = <TyphoonPath />
        break
      default:
        temp = <SatelliteCloundChart />
        break
    }
    setCurrentComponent(temp)
  }, [currentPanel])

  const [isExtend, setIsExtend] = useState(true)

  return <div className={styles['detail-panel']}>
    {
      isExtend ? <><ul className={styles['selected-type']}>
        {functionTypes.filter(item => typeStore.includes(item.key))
          .map(item =>
            <li key={item.key} className={`${styles['type-item']}${currentPanel === item.key ? ' ' + styles['active'] : ''}`} onClick={() => { setCurrentPanel(item.key) }}>{item.label}</li>
          )}
      </ul>
        <div className={styles['filter-panel']}>
          <div className={styles['header-box']}>
            条件选择
          </div>
          {currentComponent}
        </div>
        <CaretRightOutlined className={styles['btn-fold']} onClick={() => setIsExtend(false)} />
      </>
        :
        <CaretLeftOutlined className={styles['btn-fold']} onClick={() => setIsExtend(true)} />
    }
  </div>
}