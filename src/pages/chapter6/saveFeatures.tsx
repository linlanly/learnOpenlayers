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
import { Type } from 'ol/geom/Geometry'
import { Select, Draw } from 'ol/interaction'
import FeatrureTable from '@/utils/featuresTable'

import { notification } from 'antd';
import { DrawEvent } from 'ol/interaction/Draw'
import { FeatureLike } from 'ol/Feature'

const featureTable = new FeatrureTable()
featureTable.open("features")
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
let active = 0, currentType = 'Point'
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
  [key: string]: string | number
}
let data: dataObj = {}
activeList[1].forEach(item => {
  data[item.key] = item.value
})

interface resultOjb {
  code: number,
  msg: string,
  data: Array<dataObj> | undefined
}


class SelectObj {
  select: null | Select = null
  init() {
    this.select = new Select()
    map?.addInteraction(this.select)
  }
}
const selectInfo = new SelectObj()
let deleteInfo: dataObj | null
export default function () {
  let [mapData, setMapData] = useState(data)
  let [showPanel, setShowPanel] = useState(false)
  let osmSource = new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' })
  let vectorSource = new VectorSource()
  let vectorLayer = createLayer(vectorSource)

  function changeData(data: ChangeEvent<HTMLSelectElement | HTMLInputElement>, key: string) {
    if (active === 1) {
      let tempVal = JSON.parse(JSON.stringify(mapData))
      tempVal[key] = data.target.value
      setMapData(tempVal)

    } else {
      currentType = data.target.value
    }
  }
  let drawInfo: Draw | null
  function drawShap() {
    setShowPanel(false)
    if (!map) return;
    drawInfo && map.removeInteraction(drawInfo);
    let option = {
      source: vectorSource,
      type: currentType as Type,
    }
    drawInfo = new Draw(option)
    map.addInteraction(drawInfo)
    drawInfo.on('drawend', drawEndCallBack)
  }

  function drawEndCallBack(event: DrawEvent) {
    map && drawInfo && map.removeInteraction(drawInfo);
    if (active === 0) {
      active = 1
    }
    setShowPanel(true)
    const currentFeature = event.feature
    const geom = currentFeature.getGeometry()
    const coordinates = (geom as Point | LineString | Polygon)!.getCoordinates()
    let geoStr = ''
    if (currentType === 'Polygon') {
      geoStr = JSON.stringify(coordinates[0])
    } else {
      geoStr = JSON.stringify(coordinates)
    }
    setMapData((data) => ({ ...data, type: currentType, geoJson: geoStr }))
  }

  function saveFeatures() {
    featureTable.add(mapData).then((res) => {
      let result = res as resultOjb
      if (result.code === 200) {
        notification['success']({
          message: result.msg
        })
        setShowPanel(false)
      } else {
        notification['error']({
          message: result.msg
        })
      }
    })
  }

  function beforeDrawFeature() {
    active = 0
    currentType = 'Point'
    setShowPanel(true)
  }



  function showSaveFeature() {
    featureTable.get().then((res) => {
      let result = res as resultOjb
      if (result.code === 200) {
        map && map.removeLayer(vectorLayer)
        if (Array.isArray(result.data)) {
          let features: Array<Feature> = [];
          result.data.forEach((item: dataObj) => {
            const feature = new Feature({
              name: item.name
            })
            let geoJson = JSON.parse(item.geoJson as string)
            if (Array.isArray(geoJson)) {
              geoJson = geoJson.map(item => Array.isArray(item) ? item.map(citem => Number(citem)) : Number(item))
            }
            switch (item.type) {
              case 'Point':
                feature.setGeometry(new Point(geoJson))
                break;
              case 'LineString':
                feature.setGeometry(new LineString(geoJson))
                break;
              case 'Polygon':
                feature.setGeometry(new Polygon([geoJson]))
                break;
              default:
                break;
            }
            feature.on('change', function () {
              deleteInfo = item
            })
            features.push(feature)
          })
          console.log('show', features)
          vectorLayer = createLayer(new VectorSource({
            features: features
          }))
          map && map.addLayer(vectorLayer)
        }
      } else {
        notification['error']({
          message: result.msg
        })
      }
    })
  }

  function createLayer(vectorSource: VectorSource) {
    return new VectorLayer({
      source: vectorSource,
      style: function (feature: FeatureLike) {
        return new Style({
          fill: new Fill({
            color: 'rgba(255,255,255,0.2)'
          }),
          stroke: new Stroke({
            color: '#ffcc33',
            width: 2
          }),
          image: new Circle({
            radius: 7,
            fill: new Fill({
              color: '#ffcc33'
            })
          }),
          text: new Text({
            text: feature.get('name'),
            fill: new Fill({
              color: '#ff00ff'
            }),
            stroke: new Stroke({
              color: '#FFFFFF',
              width: 2
            })
          })
        })
      }
    })
  }

  function deleteFeature() {
    if (!deleteInfo) {
      notification['info']({
        message: '请选择图形!'
      })
    } else {
      featureTable.delete(deleteInfo.id as number).then(res => {
        let result = res as resultOjb
        if (result.code === 200) {
          notification['success']({
            message: result.msg
          })
          showSaveFeature()
        } else {
          notification['error']({
            message: result.msg
          })
        }
      })
    }
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
    selectInfo.init()
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
                {item.list ? <select onChange={(data) => { changeData(data, item.key) }}>
                  {item.list.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}
                </select> : <input type="text" value={mapData[item.key]} onChange={(data) => { changeData(data, item.key) }} />}
              </li>)}
            </ul>
            <div className={styles['footer-btn']}>
              {active ? <><button onClick={saveFeatures}>提交</button><button onClick={() => setShowPanel(false)}>取消</button></> : <button onClick={drawShap}>确定</button>}
            </div>
          </div> : <></>
      }
      <div className={styles['button-list']}>
        <button onClick={beforeDrawFeature}>图形绘制</button>
        <button onClick={showSaveFeature}>图形反显</button>
        <button onClick={deleteFeature}>图形删除</button>
      </div>
    </div>
  )
}