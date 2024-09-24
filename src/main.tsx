import ReactDOM from 'react-dom/client'
import './index.css'
import {BrowserRouter} from "react-router-dom"
import AppRouter from "./router/index"

import store from '@/store/index'
import {Provider} from 'react-redux'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </BrowserRouter>
)
