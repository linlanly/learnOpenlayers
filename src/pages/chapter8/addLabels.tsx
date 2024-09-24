import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { ChangeEvent, useEffect } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'
import { fromLonLat } from 'ol/proj'
import { Vector as VectorSource } from 'ol/source'

import styles from './addLabels.module.scss'
import { Feature, Overlay } from 'ol'
import { Point } from 'ol/geom'
import { Vector as VectorLayer } from 'ol/layer'
import { Fill, Circle, Icon, Stroke, Text, Style } from 'ol/style'
import { FeatureLike } from 'ol/Feature'
import { Coordinate } from 'ol/coordinate'

let map: Map | null
let type = 'vector'

const createLabelStyle = function (feature: FeatureLike) {
  return new Style({
    image: new Icon({
      anchor: [.5, 60],
      anchorOrigin: 'top-right',
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      offsetOrigin: 'top-right',
      opacity: .75,
      src: 'src/assets/react.svg'
    }),
    text: new Text({
      textAlign: 'center',
      textBaseline: 'middle',
      font: 'normal 14px 微软雅黑',
      text: feature.get('name'),
      fill: new Fill({
        color: '#aa3300'
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2
      })
    })
  })
}
const beijing = fromLonLat([116.28, 39.54])
const wuhan = fromLonLat([114.21, 30.37])
const iconFeature = new Feature({
  geometry: new Point(beijing),
  name: '北京市',
  population: 2115
})
iconFeature.setStyle(createLabelStyle(iconFeature))

const vectorSource = new VectorSource({
  features: [iconFeature]
})

const vectorLayer = new VectorLayer({
  source: vectorSource
})

const typeList = [
  {
    label: 'Vector Labels',
    value: 'vector'
  },
  {
    label: 'Overlay Labels',
    value: 'overlay'
  },
]

function addVectorLabel(point: Coordinate) {
  const newFeature = new Feature({
    geometry: new Point(point),
    name: '标注点'
  })
  newFeature.setStyle(createLabelStyle(newFeature))
  vectorSource.addFeature(newFeature)
}

function addOverlayLabel(point: Coordinate) {
  // const elementDiv = document.createElement('div')
  // elementDiv.className = 'marker'
  // elementDiv.title = '标注点'
  // const overlay = document.getElementById('label')
  // overlay?.appendChild(elementDiv)
  // const elementA = document.createElement('a')
  // elementA.className = 'address'
  // elementA.href = '#'
  // setInnerText(elementA, elementDiv.title)
  // elementDiv.appendChild(elementA)
  const markerCopy = document.getElementById('marker')!.cloneNode(true)
  const elementDiv = markerCopy as HTMLElement
  const newMarker = new Overlay({
    position: point,
    positioning: 'center-center',
    element: elementDiv,
    stopEvent: false
  })
  map?.addOverlay(newMarker)
  // const newText = new Overlay({
  //   position: point,
  //   element: elementA
  // })
  // map?.addOverlay(newText)
}

function setInnerText(element: HTMLElement, text: string) {
  if (typeof element.textContent == 'string') {
    element.textContent = text
  } else {
    element.innerText = text
  }
}
export default function () {
  function changeType(data: ChangeEvent<HTMLInputElement>) {
    type = data.target.value
  }
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [
        new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) })
      ],
      view: new View({
        center: [11910000, 3860000],
        zoom: 4
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
    map.addLayer(vectorLayer)

    const markerCopy = document.getElementById('marker')!.cloneNode(true)
    const wuhanDoc = markerCopy as HTMLElement
    const marker = new Overlay({
      position: wuhan,
      positioning: 'center-center',
      element: wuhanDoc,
      stopEvent: false
    })
    
    // const text = new Overlay({
    //   position: wuhan,
    //   element: document.getElementById('address')!
    // })
    map.addOverlay(marker)
    marker.getElement()!.title = '武汉市'
    marker.getElement()!.getElementsByTagName('a')[0]!.innerText = '武汉市'

    // map.addOverlay(text)
    // marker.getElement()!.innerText ='武汉市'


    map.on('click', function (evnet) {
      const point = evnet.coordinate
      switch (type) {
        case 'vector':
          addVectorLabel(point)
          break;
        case 'overlay':
          addOverlayLabel(point)
          break;
        default:
          break;
      }
    })
  }, [])
  return (
    <div id="map" className={styles['map-box']}>
      <ul className={styles['menu']}>
        {typeList.map(item =>
          <li key={item.value}>
            <label className={styles['checkbox']}>
              <input type="radio" name="label" value={item.value} onChange={changeType} />{item.label}
            </label>
          </li>)}
      </ul>
      <div id="label" style={{display: 'none'}}>
        <div className='marker' id="marker" title='Marker'>
          <a className='address' id="address" target="_blenk" href='http://www.openlayers.org/'>标注点</a>
        </div>
      </div>
    </div>
  )
}