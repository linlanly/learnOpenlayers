import { useState } from "react";
import { ProductOutlined, CloseOutlined } from '@ant-design/icons'
import styles from './typhoonLegend.module.scss'
import {typhoonTypes} from './data'
export default function () {
  const [showPanel, setShowPanel] = useState(true)

  function changeShowPanel(status: boolean) {
    setShowPanel(status)
  }

  return (<div className={styles["out-border"]}>
    {showPanel ? <>
      <div className={styles["panel"]}>
        <div className={styles["header-box"]}>

          <div>台风图例</div>
          <CloseOutlined title="隐藏" onClick={() => changeShowPanel(false)} />
        </div>
        <ul className={styles["content"]}>
          {typhoonTypes.map(item =>
            <li key={item.color}>
              <div className={styles["color-box"]} style={{backgroundColor: item.color}}></div>
              {item.label}
            </li>)}
        </ul>
      </div>
    </> : <ProductOutlined title="展示" className={styles["icon"]} onClick={() => changeShowPanel(true)} />}
  </div>)
}