const tableNames = ['st_sitinfo_b', 'st_revr_r', 'st_rinver_r', 'st_soil_r', 'wind_basicinfo',
'wind_info', 'wind_forecast']
export type st_sitinfo_b_type = {
  '站码': string,
  '站名': string,
  '东经': string,
  '北纬': string,
  '河名': string,
  '站类': string,
  '地市': string,
  '分局': string,
  '地址': string
}

export type st_revr_r_type = {
  STCD: string,
  TM: string,
  RZ: number,
  INQ: number,
  OTQ: number,
  W: number
}

export type st_rinver_r_type = {
  STCD: string,
  TM: string,
  Z: number,
  Q: number
}

export type st_soil_r_type = {
  Col001: string,
  Col002: string,
  Col007: number
}

export type wind_basicinfo_type = {
  windid: string,
  windname: string,
  windeng: string
}

export type wind_info_type = {
  windid: string,
  tm: string,
  jindu: number,
  weidu: number,
  windstrong: string,
  windspeed: string,
  qiya: string,
  movespeed: string,
  movedirect: string,
  sevradius: number
}

export type wind_forecast_type = {
  windid: string,
  forecast: string,
  tm: string,
  jindu: number,
  weidu: number,
  windstrong: string,
  windspeed: string,
  qiya: string,
  movespeed: string,
  movedirect: string,
  sevradius: number
}

import FeaturesTable from './featuresTable'
const featureTable = new FeaturesTable('waterConservancyInformation', tableNames)
export default featureTable