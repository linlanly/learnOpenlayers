import styles from './typhoonDetail.module.scss'
import { CloseOutlined } from '@ant-design/icons'
const foldList= [
  { label: '过去时间', key: 'TM' },
  { label: '经度', key: 'LON' },
  { label: '纬度', key: 'LAT' },
  { label: '风力', key: 'WINDFORCE', unit: '级' },
  { label: '风速', key: 'WINDFORCEVEL', unit: '米/秒' },
  { label: '中心气压', key: 'WINDPRESS', unit: '百帕' },
  { label: '等级', key: 'LVLNAME' },
  { label: '七级风力圈', key: 'WINDR7', unit: '公里' },
  { label: '十级风力圈', key: 'WINDR10', unit: '公里' },
]
export default function ({info, onClose}) {
  return <div className={styles["typhoon-info"]} id="typhoonDetail">
    <div className={styles["header-box"]}>
      <div>详细信息</div>
      <CloseOutlined onClick={() => onClose(true)} />
    </div>
    <div className={styles["fold-list"]}>
      {foldList.map(item =>
        <div className={styles["fold-item"]} key={item.key}>
          <div className={styles["fold-label"]}>{item.label}：</div>
          <div className={styles["fold-value"]}>{info[item.key]}{item.unit || ''}</div>
        </div>)}
    </div>
  </div>
}