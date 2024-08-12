import 'ol/ol.css'
import { Map, View } from 'ol'
import { OSM, TileImage, XYZ, WMTS } from 'ol/source'
import { Tile as TileLayer } from 'ol/layer'
import { useEffect, ChangeEvent } from "react"

import { Attribution } from 'ol/control'
import { defaults as defaultsControl } from 'ol/control/defaults'

import styles from './loadPublicMaps.module.scss'
import { getWidth, getHeight, getTopLeft } from 'ol/extent'
import { createOrUpdate } from 'ol/tilecoord.js';
import { quadKey } from 'ol/source/BingMaps'

import axios from 'axios'
import { TileGrid } from 'ol/tilegrid'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { get, Projection } from 'ol/proj'
import { tile } from 'ol/loadingstrategy'

let map: Map | null
let bingType = 'RoadOnDemand'
let currentMapType = 'osm'


const typeList = [
  {
    label: 'OpenStreetMap',
    value: 'osm'
  },
  {
    label: '天地图',
    value: 'tianditu',
    list: [
      {
        label: '天地图矢量数据',
        value: 'vec'
      },
      {
        label: '天地图影像数据',
        value: 'img'
      },
      {
        label: '天地图矢量注记数据',
        value: 'cva'
      },
      {
        label: '天地图影像注记数据',
        value: 'cia'
      },
    ]
  },
  {
    label: 'Bing地图',
    value: 'bing',
    list: [
      {
        label: 'Road',
        value: 'RoadOnDemand'
      },
      {
        label: 'Aerial',
        value: 'Aerial'
      },
      {
        label: 'Aerial with labels',
        value: 'AerialWithLabelsOnDemand'
      },
      {
        label: 'Ordnance Survey',
        value: 'OrdnanceSurvey'
      },
      {
        label: 'canvas dark',
        value: 'CanvasDark'
      }
    ]
  },
  {
    label: 'Baidu地图',
    value: 'baidu'
  },
  {
    label: '高德地图',
    value: 'gaode'
  }
]

function changeMapType(data: ChangeEvent<HTMLInputElement>) {
  currentMapType = data.target.value
  if (currentMapType === 'bing') {
    bingType = 'RoadOnDemand'
  } else if (currentMapType === 'tianditu') {
    bingType = 'vec'
  }
  loadMap()
}

function changeBingMapType(data: ChangeEvent<HTMLSelectElement>) {
  bingType = data.target.value
  loadMap()
}

function loadMap() {
  if (!map) return;
  const layers = map.getLayers()
  if (layers !== null) {
    for (let i = 0, length = layers.getLength(); i < length; i++) {
      map.removeLayer(layers.item(i))
    }
  }

  switch (currentMapType) {
    case 'osm':
      loadOSM()
      break;
    case 'bing':
      loadBingMap()
      break;
    case 'baidu':
      loadBaidu()
      break;
    case 'tianditu':
      loadTiantitu()
      break;
    case 'gaode':
      loadGaode()
      break;
    default:
      break;
  }
}

function loadOSM() {
  const layer = new TileLayer({
    source: new OSM({
      url: 'https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    })
  })
  const center = [0, 0]
  const zoom = 2
  map && map.addLayer(layer)
  setMapView(center, zoom)
}

function loadBingMap() {
  let key = 'AlEoTLTlzFB6Uf4Sy-ugXcRO21skQO7K8eObA5_L-8d20rjqZJLs2nkO1RMjGSPN'

  axios.get(`/bingMap/REST/v1/Imagery/Metadata/${bingType}?uriScheme=https&include=ImageryProviders&key=${key}&c=en-us`).then(res => {
    if (res.data && res.data.statusCode === 200 && Array.isArray(res.data.resourceSets) && res.data.resourceSets.length > 0) {
      let resources = res.data.resourceSets[0].resources
      if (!Array.isArray(resources) || resources.length < 1) {
        return
      }
      let mapInfo = resources[0]
      let url = mapInfo.imageUrl
      url = url.replace('{subdomain}', mapInfo.imageUrlSubdomains[0])
      const layer = new TileLayer({
        source: new TileImage({
          tileUrlFunction: function (tileCoord) {
            if (!tileCoord) {
              return "";
            }
            const quadKeyTileCoord = [0, 0, 0];
            createOrUpdate(tileCoord[0], tileCoord[1], tileCoord[2], quadKeyTileCoord);
            let imageUrl = url.replace('{quadkey}', quadKey(quadKeyTileCoord))
            return imageUrl
          }
        })
      })
      const center = [-6655.5402445057125, 6709968.258934638]
      const zoom = 13
      map && layer && map.addLayer(layer)
      setMapView(center, zoom)
    }
  })

}

function loadBaidu() {
  const attribution = 'Copyright:&copy; 2015 Baidu, i-cubed, GeoEye'
  const extent = [-20037508.34, -20037508.34, 20037508.34, 20037508.34]
  const tileSize = 256
  const origin = [0, 0]
  // const urlTemplate = "https://maponline3.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&udt=20151021&scaler=1&p=1"
  const urlTemplate = `http://online3.map.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&udt=udt=20170908&scaler=2&p=1`

  const resolutionSize = 19
  const resolutions = new Array(resolutionSize);
  for (let i = 0; i < resolutionSize; i++) {
    resolutions[i] = Math.pow(2, resolutionSize - 1 - i);
  }
  const source = new TileImage({
    attributions: [attribution],
    tileUrlFunction: function (tileCoord) {
      const z = tileCoord[0]
      let x: number | string = tileCoord[1] % 6
      let y: number | string = -tileCoord[2] - 1

      if (x < 0) {
        x = "M" + -x;
      }
      if (y < 0) {
        y = "M" + -y;
      }
      return urlTemplate.replace('{z}', z.toString()).replace('{x}', x.toString()).replace('{y}', y.toString())
    },
    projection: 'EPSG:3857',
    tileGrid: new TileGrid({
      origin,
      resolutions,
      tileSize
    })
  })
  const layer = new TileLayer({
    source
  })

  const center = [0, 0]
  const zoom = 4
  map && map.addLayer(layer)
  setMapView(center, zoom)
}

function loadBaiduByXYZ(type: string = 'vec_c') {

  var resolutions = []
  var maxZoom = 18
  for (var i = 0; i <= maxZoom; i++) {
    resolutions[i] = Math.pow(2, maxZoom - i)
  }
  let layer = new TileLayer({
    source: new XYZ({
      // 百度地图
      projection: 'EPSG:3857',
      crossOrigin: 'anonymous', //跨域
      tileGrid: new TileGrid({
        origin: [0, 0],
        resolutions: resolutions,
      }),
      tileUrlFunction: function (tileCoord) {
        if (!tileCoord) {
          return ''
        }
        var z = tileCoord[0]
        var x: number | string = tileCoord[1]
        var y: number | string = tileCoord[2] + 1
        if (x < 0) {
          x = 'M' + (-x)
        }
        y = -y
        if (y < 0) {
          y = 'M' + (-y)
        }
        let num = Math.ceil(Math.random() * 3)
        if (type === 'img_c') {
          return (
            'https://maponline' + num + '.bdimg.com/starpic/?qt=satepc&u=x=' + x + ';y=' + y + ';z=' + z + ';v=009;type=sate&fm=46&app=webearth2&v=009&udt=20200702'
          )
        } else if (type === 'vec_c') {
          return (
            'http://maponline' +
            num +
            '.bdimg.com//onlinelabel/?qt=vtile&x=' +
            x +
            '&y=' +
            y +
            '&z=' +
            z +
            '&styles=pl&udt=20200211&scaler=1&p=0'
          )
        } else {
          return ('http://online' + num + '.map.bdimg.com/onlinelabel/?qt=tile&x=' +
            x + '&y=' + y + '&z=' + z + '&styles=sl&udt=20170620&scaler=1&p=1')
        }
      },
    }),
  })
  const center = [0, 0]
  const zoom = 4
  map && map.addLayer(layer)
  setMapView(center, zoom)
}

function loadTiantitu() {
  let key = '75f0434f240669f4a2df6359275146d2'
  const projection = 'EPSG:4326'
  const attribution = `Copyright:&copy; 2015 Tianditu, i-cubed, GeoEye`
  const extent = [-90, -45, 90, 45]
  const tileSize = 256
  const origin = [0, 0]
  const resolutions = getResolutions(extent, tileSize)
  let urlTemplate = `http://t${Math.round(Math.random() * 7)}.tianditu.gov.cn/${bingType}_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${bingType}&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`
  const source = new TileImage({
    attributions: [attribution],
    tileUrlFunction: function (tileCoord) {
      const z = tileCoord[0]
      const x = tileCoord[1]
      const y = tileCoord[2]
      return urlTemplate.replace('{z}', z.toString()).replace('{y}', y.toString()).replace('{x}', x.toString())
    },
    projection,
    tileGrid: new TileGrid({
      origin,
      resolutions,
      tileSize
    })
  })

  const layer = new TileLayer({
    source
  })

  const center = [-240, -110]
  const zoom = 8
  map && map.addLayer(layer)
  setMapView(center, zoom)
}

function loadTiantituByWMTS() {
  const TIANDI_KEY = '75f0434f240669f4a2df6359275146d2'
  const projection = get("EPSG:4326") as Projection;
  const projectionExtent = projection.getExtent();
  const size = getWidth(projectionExtent) / 256;
  const resolutions = [];
  for (let z = 2; z < 19; ++z) {
    resolutions[z] = size / Math.pow(2, z);
  }

  // c: 经纬度投影 w: 球面墨卡托投影
  const matrixSet = 'c'

  const layer = new TileLayer({
    source: new WMTS({
      url: `http://t{0-6}.tianditu.com/vec_${matrixSet}/wmts?tk=${TIANDI_KEY}`,
      layer: 'vec',
      matrixSet: matrixSet,
      style: "default",
      crossOrigin: 'anonymous', // 解决跨域问题 如无该需求可不添加
      format: "tiles",
      wrapX: true,
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(projectionExtent),
        //resolutions: res.slice(0, 15),
        resolutions: resolutions,
        matrixIds: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']
      })
    })
  })
  map && map.addLayer(layer)
}

function loadTiantituByXYZ() {
  let key = '75f0434f240669f4a2df6359275146d2'
  const layer = new TileLayer({
    source: new XYZ({
      url: `http://t${Math.round(Math.random() * 7)}.tianditu.com/DataServer?T=${bingType}_c&tk=${key}&x={x}&y={y}&l={z}`,
      projection: 'EPSG:4326'
    })
  })
  const center = [0, 0]
  const zoom = 4
  map && map.addLayer(layer)
  setMapView(center, zoom)
}

function loadGaode() {
  const layer = new TileLayer({
    source: new XYZ({
      url: `http://webst0{1-4}.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}&lang=zh_cn&scale=1&size=1`
    })
  })
  const center = [0, 0]
  const zoom = 8
  map && map.addLayer(layer)
  setMapView(center, zoom)
}

function loadGaodeByXYZ(type:string) {
  let layer
  if (type === 'img_c') {
    layer = new TileLayer({
      source: new XYZ({
        projection: 'EPSG:3857',
        crossOrigin: 'anonymous', //跨域
        // 高德影像
        url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
      })
    })
  } else if (type === 'vec_c') {
    layer = new TileLayer({
      source: new XYZ({
        projection: 'EPSG:3857',
        crossOrigin: 'anonymous', //跨域
        // 高德矢量
        url: 'http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      })
    })
  } else {
    layer = new TileLayer({
      source: new XYZ({
        projection: 'EPSG:3857',
        crossOrigin: 'anonymous', //跨域
        // 高德注记
        url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
      })
    })
  }
  const center = [0, 0]
  const zoom = 8
  map && map.addLayer(layer)
  setMapView(center, zoom)
}

function setMapView(center: Array<number>, zoom: number) {
  if (!map) return;
  const view = map.getView()
  view.setCenter(center)
  view.setZoom(zoom)
}

function getResolutions(extent: Array<number>, tileSize: number) {
  const width = getWidth(extent)
  const height = getHeight(extent)
  const maxResolution = (width <= height ? height : width) / tileSize
  const resolutions = new Array(19)
  for (let i = 0; i < 19; i++) {
    resolutions[i] = maxResolution / Math.pow(2, i)
  }
  return resolutions
}

export default function () {
  const isFirst = true
  useEffect(() => {
    map = new Map({
      controls: defaultsControl({
        attribution: false
      }),
      layers: [],
      view: new View({
        center: [0, 0],
        zoom: 1
      }),
      target: 'map'
    })
    map.addControl(new Attribution({
      collapsible: true
    }))
    loadMap()
  }, [isFirst])
  return (
    <div id="map" className={styles['map-box']}>
      <ul className={styles['menu']}>
        {typeList.map(item =>
          <li key={item.value}>
            <label>
              <input type="radio" name="maps" value={item.value} onChange={changeMapType} />
              {item.label}
            </label>
            {item.list ? <select onChange={changeBingMapType}>
              {item.list.map(citem => <option value={citem.value} key={citem.value}>{citem.label}</option>)}
            </select> : ''}
          </li>)}
      </ul>
    </div>
  )
}