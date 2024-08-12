import 'ol/ol.css'
import { Map, View } from 'ol'
import { OSM, XYZ, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { useEffect, ChangeEvent } from "react"

import { Attribution } from 'ol/control'
import { defaults as defaultsControl } from 'ol/control/defaults'
import { Style, Fill, Stroke, Circle } from 'ol/style'

import styles from './drawFeature.module.scss'
import Draw, { createRegularPolygon, GeometryFunction, SketchCoordType } from 'ol/interaction/Draw'
import { Polygon, SimpleGeometry } from 'ol/geom'
import { Type } from 'ol/geom/Geometry'
import { Coordinate } from 'ol/coordinate'

let map: Map | null
let osmSource = new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' })

let verctorSource: VectorSource | null = new VectorSource({ wrapX: false })
let vectorLayer = new VectorLayer({
  source: verctorSource,
  style: new Style({
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
    })
  })
})

let typeList = [
  {
    label: '无',
    value: 'None'
  },
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
  },
  {
    label: '圆',
    value: 'Circle'
  },
  {
    label: '正方形',
    value: 'Square'
  },
  {
    label: '长方形',
    value: 'Box'
  }
]

let drawInfo: Draw | null
function changeType(event: ChangeEvent<HTMLSelectElement>) {
  map && drawInfo && map.removeInteraction(drawInfo)
  let type = event.target.value

  if (type === 'None') {
    verctorSource = null
    vectorLayer.setSource(verctorSource)
    return
  }

  if (verctorSource === null) {
    verctorSource = new VectorSource({ wrapX: false })
    vectorLayer.setSource(verctorSource)
  }

  let value = type, geometryFunction = null, maxPoints = 0;
  switch (type) {
    case 'Square':
      value = 'Circle'
      geometryFunction = createRegularPolygon(4)
      break;
    case 'Box':
      value = 'LineString'
      maxPoints = 4
      geometryFunction = function(coordinates:SketchCoordType, geometry: SimpleGeometry) {
        if (!geometry) {
          geometry = new Polygon([])
        }
        const dealCoordinates = coordinates as Coordinate[]
        const start = dealCoordinates[0]
        const end = dealCoordinates[1]
        geometry.setCoordinates([
          [start, [start[0], end[1]], end, [end[0], start[1]], start]
        ])
        return geometry
      }
      break;

    default:
      break;
  }
  interface optionObj {
    source: VectorSource,
    type: Type,
    maxPoints?: number,
    geometryFunction?: GeometryFunction
  }
  let option: optionObj = {
    source: verctorSource,
    type: value as Type,
  }
  if (geometryFunction) {
    option.geometryFunction = geometryFunction
  }
  if (maxPoints) {
    option.maxPoints = maxPoints
  }
  drawInfo = new Draw(option)
  map && map.addInteraction(drawInfo)
}

export default function () {
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
        center: [12900000, 4900000],
        zoom: 8
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
  })
  return (
    <div id="map" className={styles['map-box']}>
      <div className={styles['menu']}>
        <label htmlFor="menuList">几何图形类型：&nbsp;</label>
        <select name='menuList' onChange={changeType}>
          {typeList.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}
        </select>
      </div>
    </div>
  )
}