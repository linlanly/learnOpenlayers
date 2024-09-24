import 'ol/ol.css'
import { Feature, Geolocation, Map, View } from 'ol'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect, useState, ChangeEvent } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'
import { Vector as VectorSource } from 'ol/source'


import { Coordinate } from 'ol/coordinate'

import styles from './geolocation.module.scss'
import { Vector as VectorLayer } from 'ol/layer'
import { get } from 'ol/proj'
import { Circle, Fill, Stroke, Style } from 'ol/style'
import { Point } from 'ol/geom'
let map: Map | null
const typeList = [
  {
    label: '位置精度（position accuracy）',
    key: 'positionAccuracy',
    unit: 'm'
  },
  {
    label: '海拔高度（altitude）',
    key: 'altitude',
    unit: 'm'
  },
  {
    label: '海拔精度（altitude accuracy）',
    key: 'altitudeAccuracy',
    unit: 'm'
  },
  {
    label: '航向（heading）',
    key: 'heading',
    unit: 'rad'
  },
  {
    label: '速度（speed）',
    key: 'speed',
    unit: 'm/s'
  }
]
type valueType = {
  [key: string]: number | undefined
}
const valueObj: valueType = {};
typeList.forEach(item => {
  valueObj[item.key] = undefined
})

const view = new View({
  projection: get('EPSG: 3857')!,
  resolutions: [65536, 32768, 16384, 8192, 4096, 2048],
  center: [-5000005, 44],
  zoom: 0
})

const geolocation = new Geolocation({
  projection: view.getProjection(),
  trackingOptions: {
    maximumAge: 10000,
    enableHighAccuracy: true,
    timeout: 600000
  }
})


const accuracyFeature = new Feature()
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry() || undefined)
})

const positionFeature = new Feature()
positionFeature.setStyle(new Style({
  image: new Circle({
    radius: 6,
    fill: new Fill({
      color: '#3399cc'
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 2
    })
  })
}))
geolocation.on('change:position', function () {
  const coordiante = geolocation.getPosition()
  positionFeature.setGeometry(coordiante ? new Point(coordiante) : undefined)
  flyLocation(coordiante!)
})

const featuresOverlay = new VectorLayer({
  source: new VectorSource({
    features: [accuracyFeature, positionFeature]
  })
})


function enablePositioning(data: ChangeEvent<HTMLInputElement>) {
  geolocation.setTracking(data.target.checked)
  if (!map) return;
  if (data.target.checked) {
    map.addLayer(featuresOverlay)
  } else {
    map.removeLayer(featuresOverlay)
  }
}



function elasticEasing(t: number) {
  return Math.pow(2, -10 * t) * Math.sin((t - .075) * (2 * Math.PI) / .3) + 1
}

function bounceEasing(t: number) {
  const s = 7.5625;
  const p = 2.75;
  let l;
  if (t < 1 / p) {
    l = s * t * t;
  } else {
    if (t < 2 / p) {
      t -= 1.5 / p;
      l = s * t * t + 0.75;
    } else {
      if (t < 2.5 / p) {
        t -= 2.25 / p;
        l = s * t * t + 0.9375;
      } else {
        t -= 2.625 / p;
        l = s * t * t + 0.984375;
      }
    }
  }
  return l;
}

function flyLocation(center: Coordinate) {
  const duration = 4000
  view.animate({
    duration: duration,
    center: center,
    zoom: 12,
    easing: elasticEasing
  })
  view.animate({
    center: center,
    duration: duration,
    zoom: 12,
    easing: bounceEasing
  })
}
export default function () {
  const [valueInfo, setValueInfo] = useState(valueObj)
  const [errorInfo, setErrorInfo] = useState('')
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [
        new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) })
      ],
      view: view,
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))

    geolocation.on('change', function () {
      setValueInfo({
        positionAccuracy: geolocation.getAccuracy(),
        altitude: geolocation.getAltitude(),
        altitudeAccuracy: geolocation.getAltitudeAccuracy(),
        heading: geolocation.getHeading(),
        speed: geolocation.getSpeed()
      })
    })

    geolocation.on('error', function (error) {
      setErrorInfo(error.message)
    })
  }, [])
  return (
    <div className={styles['panel']}>
      <div className={styles['menu']}>
        <label className='title' htmlFor='track'>
          导航定位演示：<input id="track" type="checkbox" onChange={enablePositioning} />开启定位
        </label>
        {errorInfo ? <div className={styles['alert']}>{errorInfo}</div> : <></>}

      </div>
      <div id="map" className={styles['map']}>
        <ul className={styles['info-list']}>
          {typeList.map(item => <li key={item.key}>
            {item.label}：{valueInfo[item.key] || 0} {item.unit}
          </li>)}
        </ul>
      </div>
    </div>
  )
}