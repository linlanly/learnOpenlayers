import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import { Vector as VectorSource, OSM } from 'ol/source'
import { Tile as TileLayer } from 'ol/layer'
import { ChangeEvent, useState, useEffect } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'

import styles from './hotSpots.module.scss'
import { Circle, Fill, Stroke, Style } from 'ol/style'
import VectorLayer from 'ol/layer/Vector'
import { Feature, MapBrowserEvent, Overlay } from 'ol'
import { Draw } from 'ol/interaction'
import { Polygon } from 'ol/geom'
import { notification, Modal, Input } from 'antd';

import FeatrureTable from '@/utils/featuresTable'
import { DrawEvent } from 'ol/interaction/Draw'
const featureTable = new FeatrureTable()

let map: Map | null
let popup: Overlay | null

const typeList = [
  {
    label: '显示热区',
    describe: '加载热区后请用鼠标移动到热区范围显示其信息',
    key: 'showReg',
  },
  {
    label: '绘制热区',
    describe: '单击绘制热区按钮请用鼠标在地图上绘制热区',
    key: 'drawReg',
  },
  {
    label: '删除热区',
    describe: '单击删除热区按钮后请用鼠标在地图上选中要删除的要素',
    key: 'deleteReg',
  },
]

let flashFeature, preFeature: Feature | null, flag = false, draw: Draw | null, currentFeature: Feature | null

const flashStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 102, 0, .2)'
  }),
  stroke: new Stroke({
    color: '#cc3300',
    width: 2
  }),
  image: new Circle({
    radius: 7,
    fill: new Fill({
      color: '#cc3300'
    })
  })
})

const vectSource = new VectorSource({})
const vectLayer = new VectorLayer({
  source: vectSource,
  style: flashFeature,
  opacity: .5
})

const hotSpotsSource = new VectorSource({})
const hotSpotsLayer = new VectorLayer({
  source: hotSpotsSource,
  style: flashStyle,
  opacity: 1
})

interface dataObj {
  [key: string]: string | number
}

interface resultOjb {
  code: number,
  msg: string,
  data: Array<dataObj> | undefined
}

let isDrawing = false


export default function () {
  const [showDeleteModel, setShowDeleteModel] = useState(false);
  const [showComfrimModel, setShowComfirmModel] = useState(false)
  const [info, setInfo] = useState({
    name: '',
    city: '',
    geom: ''
  })
  const [moveInfo, setMoveInfo] = useState({
    name: '',
    city: ''
  })

  featureTable.open("hotSportsInfo")
  function triggerMehtod(methodName: string) {
    type methodNameLimit = 'showReg' | 'drawReg' | 'deleteReg'
    triggerMethodObj[methodName as methodNameLimit]()
  }

  const triggerMethodObj = {
    showReg: function () {
      if (map) {
        map.un('pointermove', pointerMoveFun)
        selectRegData()
      }
    },
    drawReg: function () {
      if (!map) return;
      isDrawing = true
      if (draw) {
        map.removeInteraction(draw)
      }
      map.un('singleclick', singleClickFun)
      draw = new Draw({
        source: vectLayer.getSource()!,
        type: "Polygon"
      })
      map.addInteraction(draw)
      draw.on('drawend', drawEndCallBack)
    },
    deleteReg: function () {
      if (!map) return;
      map.un('pointermove', pointerMoveFun)
      map.un('singleclick', singleClickFun)
      map.on('singleclick', singleClickFun)
    }
  }

  function selectRegData() {
    featureTable.get().then((res) => {
      let result = res as resultOjb
      if (result.code === 200) {
        showRegCallBack(result.data)
      } else {
        notification['error']({
          message: result.msg
        })
      }
    })
  }

  function showRegCallBack(dataList: Array<dataObj> | undefined) {
    if (!dataList || !map) return;
    preFeature = null
    flag = false
    hotSpotsSource.clear()
    hotSpotsLayer.setVisible(true)
    vectSource.clear()
    for (let i = 0; i < dataList.length; i++) {
      const polyCoords = JSON.parse(dataList[i].geom as string)
      const feature = new Feature({
        geometry: new Polygon(polyCoords),
        name: dataList[i].name,
        id: dataList[i].id,
        city: dataList[i].city
      })
      vectSource.addFeature(feature)
    }
    map.on('pointermove', pointerMoveFun)
  }

  function pointerMoveFun(e: MapBrowserEvent<PointerEvent>) {
    if (!map) return
    popup!.setPosition(undefined)
    const pixel = map?.getEventPixel(e.originalEvent)
    const hit = map?.hasFeatureAtPixel(pixel)
    map.getTargetElement()!.style.cursor = hit ? 'pointer' : ''
    if (hit) {
      const feature = map.forEachFeatureAtPixel(e.pixel, function (feature) {
        return feature
      })

      if (feature) {
        hotSpotsLayer.setVisible(true)
        if (preFeature !== null) {
          if (preFeature === feature) {
            flag = true
          } else {
            flag = false
            hotSpotsSource.removeFeature(preFeature)
            preFeature = feature as Feature
          }
        }
        if (!flag) {
          flashFeature = feature as Feature
          flashFeature.setStyle(flashStyle)
          hotSpotsSource.addFeature(flashFeature)
          hotSpotsLayer.setVisible(true)
          preFeature = flashFeature
        }
        if (!isDrawing) {
          popup!.setPosition(e.coordinate)
          setMoveInfo({
            name: feature.get('name'),
            city: feature.get('city')
          })
        }
      } else {
        hotSpotsSource.clear()
        flashFeature = null
        hotSpotsLayer.setVisible(false)
      }
    } else {
      hotSpotsLayer.setVisible(false)
    }
  }

  function drawEndCallBack(evt: DrawEvent) {
    isDrawing = false
    map?.removeInteraction(draw!)
    currentFeature = evt.feature
    const geo = currentFeature.getGeometry()
    const coordinates = (geo as Polygon).getCoordinates()
    setInfo((value) => ({ ...value, geom: JSON.stringify(coordinates) }))
    setShowComfirmModel(true)
    vectLayer.getSource()?.removeFeature(currentFeature)
  }
  function submitData() {
    if (!info.geom) {
      notification['error']({
        message: '未得到绘制图形几何信息！'
      })
    } else {
      saveData()
    }
  }

  function saveData() {

    featureTable.add(info).then((res) => {
      let result = res as resultOjb
      if (result.code === 200) {
        notification['success']({
          message: result.msg
        })
        selectRegData()
        setShowComfirmModel(false)

        currentFeature = null
      } else {
        notification['error']({
          message: result.msg
        })
      }
    })
  }

  function changeData(data: ChangeEvent<HTMLInputElement>, key: string) {
    setInfo((value) => ({ ...value, [key]: data.target.value }))
  }

  function singleClickFun(e: MapBrowserEvent<PointerEvent>) {
    if (!map) return;
    const pixel = map.getEventPixel(e.originalEvent)
    const hit = map.hasFeatureAtPixel(pixel)
    map.getTargetElement().style.cursor = hit ? 'pointer' : ''
    const feature = map.forEachFeatureAtPixel(e.pixel, function (feature) {
      return feature
    })
    if (feature) {
      setShowDeleteModel(true)
      currentFeature = feature as Feature
    }
  }

  function deleteData() {
    if (!currentFeature) {
      setShowDeleteModel(false)
      return notification['error']({ message: '未选择热区' })
    };
    const regID = currentFeature.get('id')
    if (!regID) {
      return notification['error']({ message: '未选择热区' })
    }
    featureTable.delete(regID as number).then(res => {
      let result = res as resultOjb
      if (result.code === 200) {
        setShowDeleteModel(false)
        notification['success']({
          message: result.msg
        })
        vectLayer.getSource()?.removeFeature(currentFeature!)
      } else {
        notification['error']({
          message: result.msg
        })
      }
    })
  }

  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) }), vectLayer, hotSpotsLayer],
      view: new View({
        center: [-8908887.277395891, 5381918.072437216],
        zoom: 2,
        maxZoom: 19,
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))

    let element = document.getElementById('popup')
    popup = new Overlay({
      element: element!,
      positioning: 'bottom-center',
      stopEvent: false
    })
    map.addOverlay(popup)
  }, [])
  return (
    <div id="map" className={styles['map-box']}>
      <Modal title="图形属性信息设置" open={showComfrimModel} onOk={submitData} onCancel={() => setShowComfirmModel(false)} cancelText="取消" okText="提交">
        <label>信息类别（infofType）：高效区域</label>
        <br />
        <label>名称（name）：</label>
        <Input type="text" value={info.name} id="name" onChange={(data) => changeData(data, 'name')} />
        <br />
        <label>省市（city）：</label>
        <Input type="text" value={info.city} id="city" onChange={(data) => changeData(data, 'city')} />
      </Modal>

      <Modal title="删除热区要素确认" open={showDeleteModel} onOk={deleteData} onCancel={() => setShowDeleteModel(false)} cancelText="取消" okText="确定"></Modal>
      <div className={styles['menu']}>
        <label>请确认是否删除该要素</label>
        {typeList.map(button => <button key={button.key} title={button.describe} onClick={() => triggerMehtod(button.key)}>{button.label}</button>)}
      </div>
      <div id="popup" className={styles['ol-popup']}>
        <div className={styles['ui-widget-header']}>{moveInfo.name}</div>
        <div className={styles['ui-widget']}>（{moveInfo.city}）</div>
      </div>
    </div>
  )
}