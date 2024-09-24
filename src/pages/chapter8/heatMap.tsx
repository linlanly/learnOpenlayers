import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import { StadiaMaps, Vector as VectorSource } from 'ol/source'
import { Heatmap, Tile as TileLayer } from 'ol/layer'
import { ChangeEvent, useEffect, useState } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'

import styles from './addPopup.module.scss'
import { KML } from 'ol/format'

let map: Map | null

const typeList = [
  {
    label: '热定半径（radius size）',
    key: 'radius',
    value: 10
  },
  {
    label: '模糊尺寸（blur size）',
    key: 'blur',
    value: 15
  },
]
type valueType = {
  [key: string]: number
}
const valueInfoDefault: valueType = {}
typeList.forEach(type => valueInfoDefault[type.key] = type.value)

const vector = new Heatmap({
  source: new VectorSource({
    url: 'src/assets/kml/2012_Earthquakes_Mag5.kml',
    format: new KML({
      extractStyles: false
    })
  }),
  radius: 10,
  blur: 15
})
vector.getSource()?.on('addfeature', function (event) {
  if (!event || !event.feature) return;
  const name = event.feature.get('name')
  const magnitude = parseFloat(name.substr(2))
  event.feature.set('weight', magnitude - 5)
})

const raster = new TileLayer({
  source: new StadiaMaps({
    layer: 'stamen_toner'
  })
})

export default function () {
  const [valueInfo, setValueInfo] = useState(valueInfoDefault)

  function changeHeatStyle(event: ChangeEvent<HTMLInputElement>, key: string) {
    let value = Number(event.target.value)
    setValueInfo({
      ...valueInfo,
      [key]: value
    })
    let methodName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
    type methodNameLimit = 'setBlur' | 'setRadius'
    vector[methodName as methodNameLimit](value)
  }

  // 
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [raster, vector],
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
  }, [])
  return (
    <div id="map" className={styles['map-box']}>
      <ul className={styles['menu']}>
        {typeList.map(type =>
          <li key={type.key}>
            <label htmlFor={type.key}>
              {type.label}:
              <input type="range" name={type.key} min="1" max="50" step="1" value={valueInfo[type.key]} onChange={(data) => { changeHeatStyle(data, type.key) }} />
            </label>
          </li>)}
      </ul>
    </div>
  )
}