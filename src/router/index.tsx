import {Route, Routes } from "react-router-dom"
import App from "../App"

const files:any = import.meta.glob('/src/pages/*/*.tsx', {eager: true})
const routes = Object.keys(files).filter((path: any) => {
  const fileName = path.split('/').pop().replace(/\.tsx$/, '')
  // 限制chapter9文件夹下的tsx文件只有system能作为路由
  if (!path.includes('chapter9') || fileName === 'system') {
    return true
  }
  return false
}).map((path: any) => {
  const fileName = path.split('/').pop().replace(/\.tsx$/, '')
  return (<Route key={fileName} path={fileName} Component={files[`${path}`].default}></Route>)
  
})
routes.push((<Route key='404' path='*' Component={App}></Route>))

export default () => {
  return (
    <Routes>
      {routes}
    </Routes>
  )
}
