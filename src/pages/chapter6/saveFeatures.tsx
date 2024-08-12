import 'ol/ol.css'
import { Feature, Map, View } from 'ol'
import { OSM, Vector as VectorSource, XYZ } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { useEffect, ChangeEvent, useState } from "react"

import { Attribution } from 'ol/control'
import { defaults as defaultsControl } from 'ol/control/defaults'

import styles from './saveFeatures.module.scss'
import { LineString, Point, Polygon } from 'ol/geom'
import { Circle, Fill, Stroke, Style, Text } from 'ol/style'
import { StyleFunction, StyleLike } from 'ol/style/Style'
import { FeatureLike } from 'ol/Feature'
import { Select, Modify } from 'ol/interaction'

let map: Map | null
let shapeType = [
  {
    label: '点',
    value: 'Point'
  },
  {
    label: '线',
    value: 'LineString'
  },
  {
    label: '多边形',
    value: 'Polygon'
  }
]
let active = 0, showPanel = true
let activeList = [
  [
    {
      label: '几何图形类型',
      list: shapeType,
      key: 'type',
      value: 'Point'
    }
  ],
  [
    {
      label: '图形类型',
      list: shapeType,
      key: 'shape',
      value: 'Point'
    },
    {
      label: '信息类别',
      key: 'info',
      value: 'Point',
      list: [
        {
          label: '兴趣点',
          value: 'Point'
        },
        {
          label: '道路线',
          value: 'LineString'
        },
        {
          label: '高校区域',
          value: 'Polygon'
        }
      ]
    },
    {
      label: '名称',
      value: '',
      key: 'name'
    },
    {
      label: '省市',
      value: '武汉市',
      key: 'city'
    },
  ]
]

interface dataObj {
  [key:string]: string
}
let data: dataObj = {}
activeList[1].forEach(item => {
  data[item.key] = item.value
})
export default function () {
  let [mapData, setMapData] = useState(data)
  let osmSource = new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' })
  let vectorSource = new VectorSource()
  let vectorLayer = new VectorLayer({
    source: vectorSource
  })

  function changeData(data: ChangeEvent<HTMLSelectElement| HTMLInputElement>, key: string) {
    let tempVal = JSON.parse(JSON.stringify(mapData))
    tempVal[key] = data.target.value
    setMapData(tempVal)
  }

  function drawShap() {
    if (!map) return;
  }
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [
        new TileLayer({ source: osmSource }),
        new TileLayer({
          source: new XYZ({
            url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=get_your_own_D6rA4zTHduk6KOKTXzGB',
            tileSize: 512,
            maxZoom: 20
          })
        }),
        vectorLayer
      ],
      view: new View({
        center: [0, 0],
        zoom: 3
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
  }, [])
  return (
    <div id="map" className={styles['map-box']}>
      {
        showPanel ? 
      <div className={styles['active-panel']}>
        <div className={styles['active-title']}>{active === 0 ? '绘制类型' : '图形属性信息设置'}</div>
        <ul>
          {activeList[active].map(item => <li key={item.key}>
            <label>{item.label}：</label>
            {item.list ? <select onChange={(data) => {changeData(data, item.key)}}>
              {item.list.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}
            </select> : <input type="text" value={item.value}  onChange={(data) => {changeData(data, item.key)}} />}
          </li>)}
        </ul>
        <div className={styles['footer-btn']}>
          {active ? <><button>提交</button><button>取消</button></> : <button onClick={drawShap}>确定</button>}
        </div>
      </div> : <></>
      }
    </div>
  )
}