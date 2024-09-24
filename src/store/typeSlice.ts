import { createSlice } from '@reduxjs/toolkit'
import { stat } from 'fs'
import 'react-redux'

const typeDefault: Array<string> = []

export const typeSlice = createSlice({
  name: 'type',
  initialState: {
    value: typeDefault
  },
  reducers: {
    setType(state, action) {
      state.value = action.payload
    }
  }
})

export const {setType} = typeSlice.actions
export default typeSlice.reducer