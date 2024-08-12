import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import { useEffect } from "react"
import styles from './animation.module.scss'

import Attribution from 'ol/control/Attribution'
import { defaults as defaultsControl } from 'ol/control/defaults'

import { fromLonLat } from 'ol/proj'
import { Coordinate } from 'ol/coordinate'
import { easeIn, easeOut } from 'ol/easing'

let map: Map | null
let view = new View({
  center: [12950000, 4860000],
  zoom: 7
})

type cityInfo = {
  name: string,
  style: string,
  methodName: string,
  point: Array<number>
}
const cityList: Array<cityInfo> = [
  {
    name: '沈阳',
    style: '旋转',
    methodName: 'rotate',
    point: [123.24, 41.50]
  },
  {
    name: '北京',
    style: '弹性',
    methodName: 'elastic',
    point: [116.28, 39.54]
  },
  {
    name: '上海',
    style: '反弹',
    methodName: 'bounce',
    point: [121.29, 31.14]
  },
  {
    name: '武汉',
    style: '自旋',
    methodName: 'spin',
    point: [114.21, 30.37]
  },
  {
    name: '广州',
    style: '飞行',
    methodName: 'fly',
    point: [113.15, 23.08]
  },
  {
    name: '海口',
    style: '螺旋',
    methodName: 'spiral',
    point: [110.20, 20.02]
  }
].map(item => ({ ...item, point: fromLonLat(item.point) }))

function rotate() {
  const rotation = view.getRotation()
  view.animate({
    rotation: rotation + Math.PI,
    duration: 1000,
    center: cityList[0].point,
    easing: easeIn
  },
    {
      rotation: rotation + Math.PI * 16,
      duration: 1000,
      center: cityList[0].point,
      easing: easeOut
    })
}

function elasticEasing(t: number) {
  return Math.pow(2, -10 * t) * Math.sin((t - .075) * (2 * Math.PI) / .3) + 1
}

function elastic() {
  view.animate({
    duration: 2000,
    center: cityList[1].point,
    easing: elasticEasing
  })
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

function bounce() {
  view.animate({
    center: cityList[2].point,
    duration: 2000,
    easing: bounceEasing
  })
}

function spin() {
  const centerPoint = view.getCenter()
  const center = centerPoint as Coordinate
  const rome = cityList[3].point
  view.animate({
    center: [
      center[0] + (rome[0] - center[0]) / 2,
      center[1] + (rome[1] - center[1]) / 2,
    ],
    rotation: Math.PI,
    easing: easeIn
  }, {
    center: rome,
    rotation: 2 * Math.PI,
    easing: easeOut
  })
}

function fly() {
  const duration = 2000
  const zoom = view.getZoom()
  let parts = 2
  let called = false
  function callback(complete: boolean) {
    --parts;
    if (called) {
      return
    }
    if (parts === 0 || !complete) {
      called = true
    }
  }
  view.animate({
    center: cityList[4].point,
    duration: duration / 2
  }, callback)
  view.animate({
    zoom: zoom as number - 1,
    duration: duration / 4
  }, {
    zoom: zoom as number,
    duration: duration / 4
  }, callback)
}

function spiral() {
  const duration = 2000
  const zoom = view.getZoom()
  let parts = 2
  let called = false
  function callback(complete: boolean) {
    --parts;
    if (called) {
      return
    }
    if (parts === 0 || !complete) {
      called = true
    }
  }
  view.animate({
    zoom: zoom as number - 1,
    duration: duration / 4
  }, {
    zoom: zoom as number,
    duration: duration / 4
  }, callback)
  const rotation = view.getRotation()
  view.animate({
    rotation: rotation + Math.PI,
    duration: duration / 4,
    center: cityList[5].point,
    easing: easeIn
  },
    {
      rotation: rotation + -4 * Math.PI,
      duration: duration / 4,
      center: cityList[5].point,
      easing: easeOut
    })
}

type methodListInfo = {
  [key: string]: Function,
}
let methodList: methodListInfo = {
  rotate,
  bounce,
  elastic,
  spin,
  fly,
  spiral
}
export default function () {
  const isFirst = true
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [
        new TileLayer({ source: new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' }) })
      ],
      view,
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))

  }, [isFirst])
  return (
    <div id="map" className={styles['map-box']}>
      <div className={styles['btn-list']}>
        {cityList.map(item => <button key={item.name} onClick={() => {
          if (item.methodName) {
            methodList[item.methodName]()
          }
        }}>{item.style}定位{item.name}</button>)}
      </div>
    </div>
  )
}