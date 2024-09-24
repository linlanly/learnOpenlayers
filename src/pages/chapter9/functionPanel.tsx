import { ChangeEvent, useEffect, useState } from "react";
import { MenuUnfoldOutlined, MenuFoldOutlined, CloseOutlined } from '@ant-design/icons'

import { useDispatch } from "react-redux";
import { functionTypes } from "./data";
import { setType } from '@/store/typeSlice'

import styles from './functionPanel.module.scss'
export default function () {
  const [showPanel, setShowPanel] = useState(true);
  const dispatch = useDispatch();

  const [selectedType, setSelectedType] = useState(['realTimeWaterSituation']);

  function changeShowPanel(status: boolean) {
    setShowPanel(status)
  }

  function changeContent(data: ChangeEvent<HTMLInputElement>) {
    let value = data.target.value
    let temp = JSON.parse(JSON.stringify(selectedType))
    let index = temp.findIndex((item: string) => item === value)
    if (temp.includes(value) && !data.target.checked) {
      temp.splice(index, 1)
    } else {
      temp.push(value)
    }
    setSelectedType(temp)
    dispatch(setType(temp))
  }

  useEffect(() => {
    dispatch(setType(['realTimeWaterSituation']))
  }, [])

  return (<div className={styles["out-border"]}>
    {showPanel ? <>
      <MenuFoldOutlined title="隐藏" className={styles["icon"]} onClick={() => changeShowPanel(false)} />
      <div className={styles["panel"]}>
        <div className={styles["header-box"]}>

          <div>综合应用</div>
          <CloseOutlined title="隐藏" onClick={() => changeShowPanel(false)} />
        </div>
        <ul className={styles["content"]}>
          {functionTypes.map(item =>
            <li key={item.key}>
              <input type="checkbox" name="type" onChange={changeContent} checked={selectedType.includes(item.key)} value={item.key} />{item.label}
            </li>)}
        </ul>
      </div>
    </> : <MenuUnfoldOutlined title="展示" className={styles["icon"]} onClick={() => changeShowPanel(true)} />}
  </div>)
}