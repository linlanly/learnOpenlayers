import 'ol/ol.css'
import { Feature, Map, View } from 'ol'
import { OSM, Vector as VectorSource, XYZ } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { useEffect, ChangeEvent, useState } from "react"

import { Attribution } from 'ol/control'
import { defaults as defaultsControl } from 'ol/control/defaults'

import styles from './featuresStyle.module.scss'
import { LineString, Point, Polygon } from 'ol/geom'
import { Circle, Fill, Stroke, Style, Text } from 'ol/style'
import { StyleFunction, StyleLike } from 'ol/style/Style'
import { FeatureLike } from 'ol/Feature'


let map: Map | null
let currentIndex = 0
export default function () {

  interface selectItem {
    label: string,
    value: string
  }
  interface contentLiObj {
    label: string,
    key: string,
    value: number | string,
    type: string,
    selectList?: Array<selectItem>
  }
  interface contentObj {
    title: string,
    list: Array<contentLiObj>
  }
  let contentList: Array<contentObj> = [
    {
      title: '图形样式',
      list: [
        {
          label: '点大小（radius）',
          key: 'pointSize',
          value: 10,
          type: 'number'
        },
        {
          label: '填充颜色（color）',
          key: 'pointColor',
          value: '#aa3300',
          type: 'color'
        },
        {
          label: '边框样式（color）',
          key: 'borderColor',
          value: '#ff0000',
          type: 'color'
        },
        {
          label: '边框样式（width）',
          key: 'borderWidth',
          value: 2,
          type: 'number'
        }
      ]
    },
    {
      title: '文字样式',
      list: [
        {
          label: '位置（align）',
          key: 'position',
          value: 'center',
          type: 'select',
          selectList: [
            {
              label: 'Center',
              value: 'center'
            },
            {
              label: 'End',
              value: 'end'
            },
            {
              label: 'Left',
              value: 'left'
            },
            {
              label: 'Right',
              value: 'right'
            },
            {
              label: 'Start',
              value: 'start'
            }
          ]
        },
        {
          label: '基线（baseline）',
          key: 'baseline',
          value: 'middle',
          type: 'select',
          selectList: [
            {
              label: 'Alphabetic',
              value: 'alphabetic'
            },
            {
              label: 'Bottom',
              value: 'bottom'
            },
            {
              label: 'Hanging',
              value: 'hanging'
            },
            {
              label: 'Ideographic',
              value: 'ideographic'
            },
            {
              label: 'Middle',
              value: 'middle'
            },
            {
              label: 'Top',
              value: 'top'
            }
          ]
        },
        {
          label: '旋转角度（rotation）',
          key: 'rotation',
          value: '0',
          type: 'select',
          selectList: [
            {
              label: '0°',
              value: '0'
            },
            {
              label: '45°',
              value: '0.785398164'
            },
            {
              label: '90°',
              value: '1.570796327'
            },
          ]
        },
        {
          label: '字体（font）',
          key: 'font',
          value: 'Arial',
          type: 'select',
          selectList: [
            {
              label: 'Arial',
              value: 'Arial'
            },
            {
              label: 'Courier New',
              value: 'Courier New'
            },
            {
              label: 'Quattroncento',
              value: 'Quattroncento'
            },
            {
              label: 'Verdana',
              value: 'Verdana'
            },
          ]
        },
        {
          label: '字体粗细（weight）',
          key: 'weight',
          value: 'normal',
          type: 'select',
          selectList: [
            {
              label: 'Bold',
              value: 'bold'
            },
            {
              label: 'Normal',
              value: 'normal'
            }
          ]
        },
        {
          label: '字体大小（size）',
          key: 'size',
          value: 12,
          type: 'number'
        },
        {
          label: 'X偏移量（offset x）',
          key: 'offsetX',
          value: 0,
          type: 'number'
        },
        {
          label: 'Y偏移量（offset y）',
          key: 'offsetY',
          value: 0,
          type: 'number'
        },
        {
          label: '字体颜色（color）',
          key: 'color',
          value: '#0000ff',
          type: 'color'
        },
        {
          label: '文字外框颜色（O. Color）',
          key: 'outlineColor',
          value: '#ffffff',
          type: 'color'
        },
        {
          label: '文字外框宽度（O. Width）',
          key: 'outlineWidth',
          value: 3,
          type: 'number'
        },
      ]
    }
  ]
  interface valueInfo {
    [key: string]: number | string
  }
  interface typeInfo {
    label: string,
    values?: valueInfo
  }

  let typeList: Array<typeInfo> = [
    {
      label: '点要素样式',
      values: { ...getMapInfo(contentList), visible: 1 }
    },
    {
      label: '线要素样式',
      values: { ...getMapInfo(contentList), visible: 0 }
    },
    {
      label: '区要素样式',
      values: { ...getMapInfo(contentList), visible: 0 }
    }
  ]


  const [showType, setShowType] = useState(typeList)
  let osmSource = new OSM({ url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png' })
  function getMapInfo(dataList: Array<contentObj>) {
    let value: valueInfo = {}
    dataList.forEach(item => {
      Array.isArray(item.list) && item.list.forEach(li => {
        value[li.key] = li.value
      })
    })
    return value
  }

  let pointFeature = new Feature({
    geometry: new Point([0, 0]),
    name: 'Point Feature'
  })
  let lineFeature = new Feature({
    geometry: new LineString([[1e7, 1e6], [1e6, 3e6]]),
    name: 'Line Feature'
  })
  let polygonFeature = new Feature({
    geometry: new Polygon([[[1e6, -1e6], [1e6, 1e6], [3e6, 1e6], [3e6, -1e6], [1e6, -1e6]]]),
    name: 'Polygon Feature'
  })
  let vectorPoints = createVectorPoints()

  let vectorLines = createVectorLines()

  let vectorPolygons = createVectorPolyons()

  function createTextStyle(name: string, index: number) {
    let data = showType[index].values!
    return new Text({
      textAlign: data.position as CanvasTextAlign,
      textBaseline: data.baseline as CanvasTextBaseline,
      font: data.font as string,
      text: name,
      fill: new Fill({ color: data.color as string }),
      stroke: new Stroke({ color: data.outlineColor as string, width: data.outlineWidth as number }),
      offsetX: data.offsetX as number,
      offsetY: data.offsetY as number,
      rotation: data.rotation as number
    })
  }
  function createVectorPoints() {
    return new VectorLayer({
      source: new VectorSource({
        features: [pointFeature]
      }),
      style: createPointStyleNoFunction
    })
  }
  function createPointStyleNoFunction(feature: FeatureLike) {
    let data = showType[0].values!
    // 根据需要更新样式
    return new Style({
      image: new Circle({
        radius: Number(data.pointSize),
        fill: new Fill({
          color: data.pointColor as string
        }),
        stroke: new Stroke({
          color: data.borderColor as string,
          width: data.borderWidth as number
        })
      }),
      text: createTextStyle(feature.get('name'), 0)
    });
  }
  function createVectorLines() {
    return new VectorLayer({
      source: new VectorSource({
        features: [lineFeature]
      }),
      style: createLineStyleNoFunction
    })
  }
  function createLineStyleNoFunction(feature: FeatureLike) {
    let data = showType[1].values!
    return new Style({
      stroke: new Stroke({
        color: data.borderColor as string,
        width: data.borderWidth as number
      }),
      text: createTextStyle(feature.get('name'), 1)
    })
  }
  function createVectorPolyons() {
    return new VectorLayer({
      source: new VectorSource({
        features: [polygonFeature]
      }),
      style: createPolyStyleNoFunction
    })
  }
  function createPolyStyleNoFunction(feature: FeatureLike) {
    let data = showType[2].values!
    return new Style({
      stroke: new Stroke({
        color: data.borderColor as string,
        width: data.borderWidth as number
      }),
      fill: new Fill({
        color: data.pointColor as string
      }),
      text: createTextStyle(feature.get('name'), 2)
    })
  }
  function createPointStyleFunction(feature: FeatureLike): StyleFunction {
    return function () {
      let data = showType[0].values!
      let style = new Style({
        image: new Circle({
          radius: data.pointSize as number,
          fill: new Fill({
            color: data.pointColor as string
          }),
          stroke: new Stroke({
            color: data.borderColor as string,
            width: data.borderWidth as number
          })
        }),
        text: createTextStyle(feature.get('name'), 0)
      })
      return style
    }
  }

  function createLineStyleFunction(feature: Feature) {
    let data = showType[1].values!
    return function () {
      return [
        new Style({
          stroke: new Stroke({
            color: data.borderColor as string,
            width: data.borderWidth as number
          }),
          text: createTextStyle(feature.get('name'), 1)
        })
      ]
    }
  }

  function createPolyStyleFunction(feature: Feature) {
    let data = showType[2].values!
    return function () {
      return [
        new Style({
          stroke: new Stroke({
            color: data.borderColor as string,
            width: data.borderWidth as number
          }),
          fill: new Fill({
            color: data.pointColor as string
          }),
          text: createTextStyle(feature.get('name'), 2)
        })
      ]
    }
  }

  function changeValue(data: ChangeEvent<HTMLInputElement | HTMLSelectElement> | null, key: string, index: number) {
    let tempVal = JSON.parse(JSON.stringify(showType))
    if (key === 'visible') {
      tempVal[index].values![key] = tempVal[index].values![key] ? 0 : 1
      if (tempVal[index].values![key]) {
        tempVal.forEach((item: typeInfo, iindex: number) => {
          if (iindex !== index) {
            item.values!.visible = 0
          }
        })
      }
    } else {
      tempVal[index].values![key] = data?.target.value!
    }
    setShowType(tempVal)
    currentIndex = index
  }

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
        vectorPoints,
        vectorLines,
        vectorPolygons
      ],
      view: new View({
        center: [0, 0],
        zoom: 3
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
  }, [])
  useEffect(() => {
    switch (currentIndex) {
      case 0:
        map?.removeLayer(vectorPoints)
        vectorPoints = createVectorPoints()
        map?.addLayer(vectorPoints)
        break;
      case 1:
        map?.removeLayer(vectorLines)
        vectorLines = createVectorLines()
        map?.addLayer(vectorLines)
        break;
      case 2:
        map?.removeLayer(vectorPolygons)
        vectorPolygons = createVectorPolyons()
        map?.addLayer(vectorPolygons)
        break;
      default:
        break;
    }
  }, showType)
  return (
    <div id="map" className={styles['map-box']}>
      <ul className={styles['menu']}>
        {showType.map((type, index) => {
          return <li key={type.label}>
            <div className={styles['type-label']} onClick={() => { changeValue(null, 'visible', index) }}>{type.label}</div>
            {type.values!.visible ?
              <ul className={styles['option']}>
                {contentList.map(content => {
                  return <li key={content.title}>
                    <div>{content.title}</div>
                    <ul>
                      {content.list.map(item => {
                        return <li key={item.key}>
                          <label>{item.label}</label>
                          {item.type === 'select' ?
                            <select onChange={(...rest) => { changeValue(...rest, item.key, index) }}>
                              {item.selectList!.map(option => {
                                return <option key={option.value} value={option.value}>{option.label}</option>
                              })}
                            </select> :
                            <input onChange={(...rest) => { changeValue(...rest, item.key, index) }} type={item.type} value={type.values![item.key]} />}
                        </li>
                      })}
                    </ul>
                  </li>
                })}
              </ul>
              : ''}
          </li>
        })}
      </ul>
    </div>
  )
}