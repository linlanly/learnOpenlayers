import {Route, Routes } from "react-router-dom"
import App from "../App"

const files:any = import.meta.glob('/src/pages/*/*.tsx', {eager: true})
const routes = Object.keys(files).map((path: any) => {
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
