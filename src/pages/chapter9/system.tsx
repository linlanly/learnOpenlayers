import FunctionPanel from "./functionPanel"
import Map from './map'
import Detail from './detail'
import TyphoonLegend from "./typhoonLegend"
import ShowSatelliteCloundChart from "./showSatelliteCloundChart"

import styles from './system.module.scss'

import { useSelector } from 'react-redux';

export default function() {
  
  const typeStore = useSelector((state) => {
    return state.typeStore.value
  })

  return <div className={styles["system"]}>
    <div className={styles["header"]}>
      <img src="src/assets/images/earth.png" />
      水利信息在线分析服务系统
    </div>
    <FunctionPanel />
    <Map />
    <Detail />
    <ShowSatelliteCloundChart />
    {typeStore.includes('typhoonPath') ? <TyphoonLegend /> : <></>}
    
  </div>
}