import styles from './map.module.scss'
import { Select } from "antd";

import { Feature, Map, View, Overlay } from 'ol'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { XYZ, Vector as VectorSource } from 'ol/source';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Style, Fill, Stroke, Circle, Text } from 'ol/style'
import { LineString, Point } from 'ol/geom';

import {typhoonTypes} from './data'
import { functionTypes } from "./data";

import WaterConservancyInfo from './waterConservancyInfo';
import TyphoonDetail from './typhoonDetail';
const typeList = [
  {
    label: '天地图矢量图',
    key: 'vec',
  },
  {
    label: '天地图影像图',
    key: 'img',
  },
  {
    label: '天地图地形图',
    key: 'ter',
  }
]
let mapType = typeList[0].key

let map: Map | null
let popup: Overlay | null
let typhoonImg: Overlay | null
let typhoonPopup: Overlay | null

const key = 'a1da769f5025385631085d1443796998'
const source = new XYZ({
  url: `http://t${Math.round(Math.random() * 7)}.tianditu.com/DataServer?T=${mapType}_c&tk=${key}&x={x}&y={y}&l={z}`,
  projection: 'EPSG:4326'
})

type sourceData = {
  [key: string]: VectorSource
}
type layerData = {
  [key: string]: VectorLayer<Feature>
}
const layerKey = ['reserior', 'river', 'rainfall', 'typhoon']
const sources: sourceData = {}
const layers: layerData = {}


const reseriorStyle = new Style({
  text: new Text({
    text: '▲',
    fill: new Fill({ color: 'blue' }),
  })
})

const riverStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 102, 0, .2)'
  }),
  stroke: new Stroke({
    color: '#cc3300',
    width: 2
  }),
  image: new Circle({
    radius: 3,
    fill: new Fill({
      color: '#cc3300'
    })
  })
})
const layer = new TileLayer({
  source
})
function changeType(data: string) {
  source.setUrl(`http://t${Math.round(Math.random() * 7)}.tianditu.com/DataServer?T=${data}_c&tk=${key}&x={x}&y={y}&l={z}`)
}

layerKey.forEach(key => {
  sources[key] = new VectorSource({})
  if (key === 'reserior') {
    layers[key] = new VectorLayer({
      source: sources[key],
      style: reseriorStyle,
      opacity: .8
    })
  } else if (key === 'river') {
    layers[key] = new VectorLayer({
      source: sources[key],
      style: riverStyle,
      opacity: .8
    })
  } else {
    layers[key] = new VectorLayer({
      source: sources[key],
    })
  }
})

function closeTyphoonPopup(isClose: boolean) {
  if (typhoonPopup && isClose) {
    typhoonPopup.setPosition(undefined)
  }
}

export default function () {
  const realTimeWaterSituationStore = useSelector((state) => {
    console.log('show datainfo', state)
    return state.realTimeWaterSituationStore.value
  })

  const realTimeRainfallSituationStore = useSelector((state) => {
    return state.realTimeRainfallSituationStore.value
  })

  const typhoonPathStore = useSelector((state) => {
    return state.typhoonPathStore.value.typhoonPathList
  })
  
  const typeStore = useSelector((state) => {
    return state.typeStore.value
  })

  const [waterConservancyInfo, setWaterConservancyInfo] = useState({})
  const [typhoonInfo, setTyphoonInfo] = useState({})
  useEffect(() => {
    map = new Map({
      target: 'map',
      layers: [layer, ...Object.values(layers)],
      view: new View({
        center: [109.225873, 23.75437],
        zoom: 8,
        projection: 'EPSG:4326'
      })
    })
    let element = document.getElementById('popup')
    popup = new Overlay({
      element: element!,
      positioning: 'bottom-center',
      stopEvent: false
    })
    map.addOverlay(popup)
    map.on('click', (e) => {
      popup!.setPosition(undefined)
      const pixel = map?.getEventPixel(e.originalEvent)
      const hit = map?.hasFeatureAtPixel(pixel!)
      map!.getTargetElement()!.style.cursor = hit ? 'pointer' : ''
      if (hit) {
        const feature = map.forEachFeatureAtPixel(e.pixel, function (feature) {
          return feature
        })

        if (feature) {
          popup!.setPosition(e.coordinate)
          setWaterConservancyInfo((value) => {
            let temp = JSON.parse(JSON.stringify(value))
            temp.id = feature.get('id')
            temp.name = feature.get('name')
            temp.address = feature.get('address')
            temp.type = feature.get("type")
            return temp
          })
        }
      }
    })

    element = document.getElementById('typhoonDetail')!
    typhoonPopup = new Overlay({
      element,
      positioning: 'top-left',
      stopEvent: false,
      offset: [-100, -280]
    })
    map.addOverlay(typhoonPopup)

    element = document.getElementById('typhoon')!
    typhoonImg = new Overlay({
      element,
      positioning: 'top-left',
      stopEvent: false,
      offset: [-140, -140]
    })
    map.addOverlay(typhoonImg)
    map.on('pointermove', (e) => {
      popup!.setPosition(undefined)
      const pixel = map?.getEventPixel(e.originalEvent)
      const hit = map?.hasFeatureAtPixel(pixel!)
      map!.getTargetElement()!.style.cursor = hit ? 'pointer' : ''
      if (hit) {
        const feature = map.forEachFeatureAtPixel(e.pixel, function (feature) {
          return feature
        })

        if (feature) {
          let name = feature.get("name"), detail = feature.get('detail')
          if (detail && typhoonPopup) {
            setTyphoonInfo({
              ...detail,
              name
            })
            typhoonPopup.setPosition([detail.LON, detail.LAT])
            typhoonImg?.setPosition([detail.LON, detail.LAT])
          }
        }
      }
    })
  }, [])
  useEffect(() => {
    Object.keys(realTimeWaterSituationStore).forEach(key => {
      if (key === 'waterConservancyInfo') {
        let { latitude, longitude, id, name } = realTimeWaterSituationStore[key]
        if (latitude && longitude && id) {
          setWaterConservancyInfo({
            id,
            name,
            type: 'water'
          })
          popup && popup.setPosition([longitude, latitude])
        }
      } else {
        const currentSource = key === 'reservoirList' ? sources.reserior : sources.river

        let features = currentSource.getFeatures()
        currentSource.removeFeatures(features)
        realTimeWaterSituationStore[key].length > 0 && realTimeWaterSituationStore[key].forEach(reservoir => {
          const feature = new Feature({
            geometry: new Point([reservoir.LGTD, reservoir.LTTD]),
            name: reservoir.STNM,
            id: reservoir.STCD,
            type: 'water'
          })
          currentSource.addFeature(feature)
        })
      }
    })
  }, [realTimeWaterSituationStore])
  useEffect(() => {
    Object.keys(realTimeRainfallSituationStore).forEach(key => {
      if (key === 'rainfallInfo') {
        let { latitude, longitude, id, name, startTime, endTime, address } = realTimeRainfallSituationStore[key]
        setWaterConservancyInfo({
          id,
          name,
          type: 'rainfall',
          startTime,
          endTime,
          address
        })
        if (latitude && longitude && id) {
          popup && popup.setPosition([longitude, latitude])
        }
      } else {
        const currentSource = sources.rainfall

        let features = currentSource.getFeatures()
        currentSource.removeFeatures(features)
        realTimeRainfallSituationStore[key].length > 0 && realTimeRainfallSituationStore[key].forEach(reservoir => {
          const feature = new Feature({
            geometry: new Point([reservoir.LGTD, reservoir.LTTD]),
            name: reservoir.STNM,
            id: reservoir.STCD,
            address: reservoir.STLC,
            type: 'rainfall'
          })
          feature.setStyle(new Style({
            image: new Circle({
              radius: 3,
              fill: new Fill({
                color: reservoir.color
              })
            })
          }))
          currentSource.addFeature(feature)
        })
      }
    })
  }, [realTimeRainfallSituationStore])
  useEffect(() => {
    const currentSource = sources.typhoon

    let features = currentSource.getFeatures()
    currentSource.removeFeatures(features)
    typhoonPathStore.length > 0 && typhoonPathStore.forEach((reservoir, reserviorIndex) => {
      reservoir.path.forEach((path, index) => {
        const feature = new Feature({
          geometry: new Point([path.LON, path.LAT]),
          name: reservoir.NAME,
          detail: path
        })
        feature.setStyle(new Style({
          image: new Circle({
            radius: 5,
            fill: new Fill({
              color: typhoonTypes.find(item => item.label === path.LVLNAME)!.color
            }),
            stroke: new Stroke({
              color: 'black',
              width: 1
            })
          })
        }))
        currentSource.addFeature(feature)

        if (reserviorIndex === typhoonPathStore.length - 1 && index === 0) {
          typhoonImg?.setPosition([path.LON, path.LAT])
        }
      })
      const feature = new Feature({
        geometry: new LineString(reservoir.path.map(item => ([item.LON, item.LAT])))
      })

      feature.setStyle(new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 1
        })
      }))
      currentSource.addFeature(feature)
    })
  }, [typhoonPathStore])
  useEffect(() => {
    if (!typeStore.includes(functionTypes[0].key)) {
      sources.reserior.removeFeatures(sources.reserior.getFeatures())
      sources.reserior.removeFeatures(sources.river.getFeatures())
      popup?.setPosition(undefined)
    }
    if (!typeStore.includes(functionTypes[1].key)) {
      sources.rainfall.removeFeatures(sources.rainfall.getFeatures())
      popup?.setPosition(undefined)
    }
    if (!typeStore.includes(functionTypes[2].key)) {
      sources.typhoon.removeFeatures(sources.typhoon.getFeatures())
      typhoonImg?.setPosition(undefined)
      typhoonPopup?.setPosition(undefined)
    }
  }, [typeStore])
  return <div id="map" className={styles['map-box']}>
    <Select className={styles['map-type']} onChange={changeType}>
      {typeList.map(item => <Select.Option key={item.key} value={item.key}>{item.label}</Select.Option>)}
    </Select>
    <WaterConservancyInfo info={waterConservancyInfo}></WaterConservancyInfo>
    <div id="typhoon" className={styles['typhoon-box']}>
      <img src="src/assets/images/typhoon.gif" />
      <div></div>
    </div>
    <TyphoonDetail info={typhoonInfo} onClose={closeTyphoonPopup}></TyphoonDetail>
  </div>
}