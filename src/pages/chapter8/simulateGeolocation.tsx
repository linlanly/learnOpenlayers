import 'ol/ol.css'
import { Geolocation, Map, Overlay, View } from 'ol'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect, useState } from "react"

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'


import styles from './geolocation.module.scss'
import { get, transform } from 'ol/proj'
import { LineString } from 'ol/geom'
import pointsOfPath from '@/assets/json/pointPath.json'
let map: Map | null
let marker: Overlay | null
const typeList = [
  {
    label: '位置点坐标（position）',
    key: 'position',
    unit: ''
  },
  {
    label: '位置精度（position accuracy）',
    key: 'positionAccuracy',
    unit: 'm'
  },
  {
    label: '当前航向（heading）',
    key: 'heading',
    unit: 'rad'
  },
  {
    label: '当前速度（speed）',
    key: 'speed',
    unit: 'm/s'
  },
  {
    label: '采样周期（delta）',
    key: 'delta',
    unit: 'ms'
  }
]
type valueType = {
  [key: string]: number | undefined | string
}
const valueObj: valueType = {};
typeList.forEach(item => {
  valueObj[item.key] = undefined
})

const positions = new LineString([], 'XYZM')

let currentPoints = JSON.parse(JSON.stringify(pointsOfPath.data))
type coordsType = {
  speed: number,
  accuracy: number,
  altitudeAccuracy: number,
  altitude:  number,
  longitude: number,
  heading: number,
  latitude: number
}
type pointType = {
  timestamp: number,
  coords: coordsType
}
const view = new View({
  projection: get('EPSG: 3857')!,
  center: [653308.37, 5723559.45],
  zoom: 17,
})

const geolocation = new Geolocation({
  projection: view.getProjection(),
  trackingOptions: {
    maximumAge: 10000,
    enableHighAccuracy: true,
    timeout: 600000
  }
})

function radToDeg(value: number) {
  return value * 180 / Math.PI
}

function degToRad(value: number) {
  return value * Math.PI / 180
}

export default function () {
  const [valueInfo, setValueInfo] = useState(valueObj)
  const [errorInfo, setErrorInfo] = useState('')
  const [showBtn, setShowBtn] = useState(false)
  let delataMean = 500

  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [
        new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) })
      ],
      view: view,
      target: 'map',
    })
    map.addControl(new Attribution({
      collapsible: true
    }))

    const markerEl = document.getElementById('geolocation_marker')!
    marker = new Overlay({
      positioning: 'center-center',
      element: markerEl,
      stopEvent: false
    })

    map.addOverlay(marker)

    let previousM = 0
    map.on('precompose', function(event) {
      const frameState = event.frameState
      if (frameState) {
        let m = frameState.time - delataMean * 1.5
        m = Math.max(m, previousM)
        previousM = m
        const c = positions.getCoordinateAtM(m, true)

        const viewState = frameState.viewState
        if (c && marker) {
          viewState.center = getCenterWithHeading(c, -c[2], viewState.resolution)
          viewState.rotation = -c[2]
          marker.setPosition(c)
        }
      }
    })
    // map.beforeRender(function (map, frameState) {
    //   if (frameState !== null) {
    //     let m = frameState.time - delataMean * 1.5
    //     m = Math.max(m, previousM)
    //     previousM = m
    //     const c = positions.getCoordinateAtM(m, true)

    //     const view = frameState.viewState
    //     if (c) {
    //       view.center = getCenterWithHeading(c, -c[2], view.resolution)
    //       view.rotation = -c[2]
    //       marker.setPosition(c)
    //     }
    //   }
    //   return true
    // })

    function getCenterWithHeading(position: Array<number>, rotation: number, resolution: number) {
      const size = map!.getSize()
      if (!Array.isArray(size) || size.length < 2) {
        return [0, 0]
      }
      const height = size[1]
      return [position[0] - Math.sin(rotation) * height * resolution * 1 / 4, position[1] + Math.sin(rotation) * height * resolution * 1 / 4]
    }
  }, [])

  function simulateHandler() {
    if (!Array.isArray(pointsOfPath.data) || pointsOfPath.data.length < 1) {
      return setErrorInfo('未成功加载模拟数据！')
    }
    if (!currentPoints.length) {
      currentPoints = JSON.parse(JSON.stringify(pointsOfPath.data))
    }
    const coordinates = currentPoints
    const first = coordinates.shift()
    simulatePositionChange(first)
    let prevDate = first.timestamp

    function geolocate() {
      const position = coordinates.shift()
      if (!position) {
        setShowBtn(true)
        return
      }
      const newDate = position.timestamp
      simulatePositionChange(position)
      setTimeout(() => {
        prevDate = newDate
        geolocate()
      }, (newDate - prevDate) / .5);
    }
    geolocate()
    map?.on('postcompose', render)
    map?.render()
    setShowBtn(false)

  }

  function simulatePositionChange(position: pointType) {
    const coords = position.coords
    geolocation.set('accuracy', coords.accuracy)
    geolocation.set('heading', degToRad(coords.heading))
    const position_ = [coords.longitude, coords.latitude]
    const projectedPosition = transform(position_, 'EPSG:4326', 'EPSG:3857')
    geolocation.set('position', projectedPosition)
    geolocation.set('speed', coords.speed)
    geolocation.changed()
  }

  function render() {
    map?.render()
  }

  geolocation.on('change', function () {
    const position = geolocation.getPosition()
    const accuacy = geolocation.getAccuracy()
    const heading = geolocation.getHeading() || 0
    const speed = geolocation.getSpeed() || 0
    const m = Date.now()
    if (Array.isArray(position) && position.length > 1) {
      addPosition(position, heading, m, speed)
      const coords = positions.getCoordinates()
      const len = coords.length
      if (len >= 2) {
        delataMean = (coords[len - 1][3] - coords[0][3]) / (len - 1)
      }
      setValueInfo({
        position: `${position[0].toFixed(2)}, ${position[1].toFixed(2)}`,
        positionAccuracy: accuacy,
        heading: radToDeg(heading),
        speed: speed,
        delta: delataMean
      })
    }

  })

  geolocation.on('error', function (error) {
    setErrorInfo(error.message)
  })

  function addPosition(position: Array<number>, heading: number, m: number, speed: number) {
    const x = position[0]
    const y = position[1]
    const fCoords = positions.getCoordinates()
    const previous = fCoords[fCoords.length - 1]
    const prevHeading = previous && previous[2]

    let newHeading = heading
    if (prevHeading) {
      let headingDiff = heading - prevHeading
      if (Math.abs(headingDiff) > Math.PI) {
        const sign = (headingDiff >= 0) ? 1 : -1
        headingDiff = -sign * (2 * Math.PI - Math.abs(headingDiff))
      }
      newHeading = prevHeading + headingDiff
    }
      positions.appendCoordinate([x, y, newHeading, m])
      positions.setCoordinates(positions.getCoordinates().slice(-20))
  }

  return (
    <div className={styles['panel']}>

      <div className={styles['menu']}>
        <label className='title' htmlFor='track'>
          模拟导航演示：<button id="track" type="button" onClick={simulateHandler} disabled={showBtn}>开启定位</button>
        </label>
        {errorInfo ? <div className={styles['alert']}>{errorInfo}</div> : <></>}
      </div>
      <img id="geolocation_marker" style={{height: '40px', width: 'auto'}} src="src/assets/images/position.png" />
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