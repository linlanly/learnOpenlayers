import 'ol/ol.css'
import { Feature, Map, View, ImageTile, Tile } from 'ol'
import { OSM, TileArcGISRest, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { useEffect, ChangeEvent } from "react"

import { Attribution } from 'ol/control'
import { defaults as defaultsControl } from 'ol/control/defaults'
import { GeoJSON } from 'ol/format'

import styles from './multiData.module.scss'
let map: Map | null

interface mapType {
  number?: {
    [key: string]: number
  }
  label: string,
  value: string,
  map: TileLayer<OSM | TileArcGISRest> | VectorLayer<Feature>
}

let activeList = [
  {
    label: '是否可见',
    type: 'checkbox',
    key: 'visible',
    value: false
  },
  {
    label: '透明度',
    type: 'range',
    key: 'opacity',
    max: 1,
    min: 0,
    step: 0.01
  },
  {
    label: '色彩',
    type: 'range',
    key: 'hue',
    max: 1,
    min: 0,
    step: 0.01
  },
  {
    label: '饱和度',
    type: 'range',
    key: 'saturate',
    max: 1,
    min: 0,
    step: 0.01
  },
  {
    label: '对比度',
    type: 'range',
    key: 'contrast',
    max: 1,
    min: 0,
    step: 0.01
  },
  {
    label: '亮度',
    type: 'range',
    key: 'brightness',
    max: 1,
    min: 0,
    step: 0.01
  }
]

let filterKey = ['opacity', 'saturate', 'brightness', 'contrast', 'hue-rotate']

let tileLoadFunction = function (imageTile: Tile, src: string, filterStr: string = '') {
  // 直接imageTile的类型声明成ImageTile，在调用tileLoadFunction的地方会有错误提示
  let tempImageTile = imageTile as ImageTile
  let img = new Image()
  img.setAttribute('crossOrigin', 'anonymous')
  img.onload = function () {
    let canvas = document.createElement('canvas')
    let w = img.width
    let h = img.height
    canvas.width = w
    canvas.height = h

    let context = canvas.getContext('2d');
    (context as CanvasRenderingContext2D).filter = filterStr
    context?.drawImage(img, 0, 0, w, h, 0, 0, w, h)
    let imgDoc = tempImageTile.getImage() as HTMLImageElement
    imgDoc.src = canvas.toDataURL('image/png')
  }
  img.src = src
}

let typeList: Array<mapType> = [
  {
    label: 'OSM地图图层',
    value: 'osm',
    map: new TileLayer({
      source: new OSM({
        url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        crossOrigin: 'anonymous',
        tileLoadFunction
      })
    })
  },
  {
    label: 'GeoJson格式矢量图层',
    value: 'geojson',
    map: new VectorLayer({
      source: new VectorSource({
        url: 'src/assets/json/us-states.json',
        format: new GeoJSON()
      })
    })
  },
  {
    label: 'ArcGIS MapServer瓦片数据',
    value: 'arcgis',
    map: new TileLayer({
      source: new TileArcGISRest({
        url: 'https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/USA/MapServer',
        crossOrigin: 'anonymous',
        tileLoadFunction
      }),
      extent: [-13884991, 2870341, -7455066, 6338219]
    })
  }
]
typeList.forEach(item => {
  let keys = Object.keys(activeList[0])
  keys.forEach(key => {
    if (key !== 'visible') {
      item.number = {}
      item.number[key] = 1
    }
  })
})

function changeOptions(type: string, key: string, data: ChangeEvent<HTMLInputElement>) {
  let value = data.target.value
  let filterType = typeList.find(item => item.value === type)
  let currentType = filterType as mapType
  if (data.target.type === 'checkbox') {
    currentType.map.setVisible(data.target.checked)
  } else {
    currentType.number![key] = Number(value);
    map?.render()
    typeList.forEach(item => {
      // if (item.value !== 'geojson') {
        let filterStr = '';
        let keys = Object.keys(item.number!)
        filterKey.forEach(key => {
          let temp = keys.find(item => key.startsWith(item))
          if (temp) {
            let value = item.number![temp]
            filterStr += `${key}(${key.startsWith('hue') ? `${value * 100 * Math.PI}deg` : `${value * 100}%`}) `
          }
        });
        // let map = item.map;
        // (map.getSource() as OSM | TileArcGISRest).setTileLoadFunction(function (imageTile, src) {
        //   tileLoadFunction(imageTile, src, filterStr)
        // })
      // }
      item.map.on('prerender', (event) => {
        const ctx = event.context
        const context = ctx as CanvasRenderingContext2D
        context.filter = filterStr
      })
    })
  }
}

export default function () {
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: typeList.map(item => {
        item.map.setVisible(false)
        return item.map
      }),
      view: new View({
        center: [-10997148, 4569099],
        zoom: 3
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
  })
  return (
    <div id="map" className={styles['map-box']}>
      <div id="container"></div>
      <ul id="layertree">
        {typeList.map(item => <li key={item.value}>
          <span>{item.label}</span>
          {activeList.map((aitem) => <div key={aitem.key}>
            {aitem.type === 'checkbox' ? <input type={aitem.type} onChange={(data) => { changeOptions(item.value, aitem.key, data) }} /> : <input onChange={(data) => { changeOptions(item.value, aitem.key, data) }} type={aitem.type} min={aitem.min} max={aitem.max} step={aitem.step} />}
            {aitem.label}
          </div>)}
        </li>)}
      </ul>
    </div>
  )
}