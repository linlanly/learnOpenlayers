import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'
import { fromLonLat } from 'ol/proj'
import { Vector as VectorSource } from 'ol/source'

import styles from './addPopup.module.scss'
import { Feature, Overlay } from 'ol'
import { Point } from 'ol/geom'
import { Vector as VectorLayer } from 'ol/layer'
import { Fill, Icon, Stroke, Text, Style } from 'ol/style'
import { FeatureLike } from 'ol/Feature'
import { Coordinate } from 'ol/coordinate'

let map: Map | null
let popup: Overlay | null

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

interface attType {
  title: string,
  titleUrl: string,
  text: string,
  imgUrl: string
}
interface featureType {
  geo: Coordinate,
  att: attType
}
const featureInfo = {
  geo: beijing,
  att: {
    title: '北京市（中华人民共和国首都）',
    titleUrl: 'http://www.openlayers.org',
    text: '北京（Beijing），简称京，中华人民共和国首都、直辖市，中国的政治、文化和国际交流中心...',
    imgUrl: 'src/assets/images/beijing.png'
  }
}
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

function setInnerText(element: HTMLElement, text: string) {
  if (typeof element.textContent == 'string') {
    element.textContent = text
  } else {
    element.innerText = text
  }
}

function closePopup() {
  if (popup) {
    popup.setPosition(undefined)
  }
}

function addFeatureInfo(info: featureType, content: HTMLElement) {
  const elementA = document.createElement('a')
  elementA.className = "markerInfo"
  elementA.href = info.att.titleUrl
  setInnerText(elementA, info.att.title)
  content.append(elementA)

  const elementDiv = document.createElement('div')
  elementDiv.className = "markerText"
  setInnerText(elementDiv, info.att.text)
  content.append(elementDiv)
  
  const elementImg = document.createElement('img')
  elementImg.className = 'markerImg'
  elementImg.src = info.att.imgUrl
  content.append(elementImg)
}
export default function () {
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

    const container = document.getElementById('popup')
    popup = new Overlay({
      element: container!,
      positioning: 'bottom-center',
      stopEvent: false,
      autoPan: {
        animation: {
          duration: 250
        }
      }
    })

    map.addOverlay(popup)


    map.on('click', function (evnet) {
      const point = evnet.coordinate
      const feature = map?.forEachFeatureAtPixel(evnet.pixel, function(feature, layer) {
        return feature
      })
      if (feature) {
        const content = document.getElementById('popup-content')
        content!.innerHTML = ''
        addFeatureInfo(featureInfo, content!)
        if (popup?.getPosition() === undefined) {
          popup?.setPosition(point)
        }
      }
    })

    map.on('pointermove', function(event) {
      if (!map) return
      const pixel = map.getEventPixel(event.originalEvent)
      const hit = map.hasFeatureAtPixel(pixel)
      map.getTargetElement().style.cursor = hit ? 'pointer' : ''
    })
  }, [])
  return (
    <>
    <div id="menu">鼠标单击标注点弹出Popup标注</div>
    <div id="map" className={styles['map-box']}>
      <div id="popup" className={styles['ol-popup']}>
        <a href='#' id='popup-closer' className={styles['ol-popup-closer']} onClick={closePopup}></a>
        <div id="popup-content"></div>
      </div>
    </div>
    </>
  )
}