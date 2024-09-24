interface dataObj {
  [key: string]: string | number
}
export default class FeatrureTable {
  database: IDBDatabase | null = null
  databaseName = ''
  tableName = ''
  tableNames = ['features', 'chartInfo', 'hotSportsInfo']
  
  constructor(databaseName: string = 'leanOpenlayers', tableNames?: Array<string>) {
    if (tableNames) {
      this.tableNames = tableNames
    }
    this.open('', databaseName)
  }

  open(name: string, databaseName: string = 'leanOpenlayers') {
    this.databaseName = databaseName // 对应数据库名
    this.tableName = name // 对应表名
    let request = indexedDB.open(this.databaseName, 3)

    request.onerror = function (event) {
      console.error(`Failed to open database "${databaseName}", ${event}`)
    }

    request.onsuccess = (event) => {
      this.database = event.target && (event.target as IDBOpenDBRequest).result
    }

    request.onupgradeneeded = (event) => { // 当indexedDB.open传入数据库名不存在时触发
      this.database = event.target && (event.target as IDBOpenDBRequest).result || null
      if (this.database) {
        this.tableNames.forEach(table => {
          // 只能在本事件内执行，其他地方执行会报错，即应在这里将所要用到的表都创建完
          const objectStore = this.database!.createObjectStore(table, { keyPath: 'id', autoIncrement: true })
          // 同上
          objectStore.createIndex('name', 'name', { unique: false })
        })
      }
    }
  }

  activeBefore() {
    return new Promise((resolve) => {
      if (!this.database) {
        if (this.databaseName) {
          this.open(this.databaseName)
        }
        return resolve(`数据库${this.databaseName}加载失败，请重试！`)
      }

      const objectStoreNames = Array.from(this.database.objectStoreNames)
      if (!objectStoreNames.includes(this.tableName)) {
        return resolve('对应数据不存在，请重试！')
      }
      const transaction = this.database.transaction([this.tableName], 'readwrite')
      let objectStore = transaction.objectStore(this.tableName)
      resolve(objectStore)
    })
  }

  add(data: dataObj) {
    return this.activeBefore().then(res => {
      if (typeof res === 'string') {
        return { code: 500, msg: '数据添加失败，' + res }
      }
      return new Promise((resolve) => {
        const request = (res as IDBObjectStore).add(data)
        request.onsuccess = () => {
          resolve({ code: 200, msg: '数据添加成功' })
        }
        request.onerror = (event) => {
          resolve({ code: 500, msg: '数据添加失败，' + event })
        }
      })
    })
  }

  get() {
    return this.activeBefore().then(res => {
      if (typeof res === 'string') {
        return { code: 500, msg: '数据获取失败，' + res }
      }
      return new Promise((resolve) => {
        const request = (res as IDBObjectStore).getAll()
        request.onsuccess = () => {
          resolve({ code: 200, msg: '数据获取成功', data: request.result })
        }
        request.onerror = (event) => {
          resolve({ code: 500, msg: '数据获取失败，' + event })
        }
      })
    })
  }

  put(data: dataObj) {
    return this.activeBefore().then(res => {
      if (typeof res === 'string') {
        return { code: 500, msg: '数据更新失败，' + res }
      }
      return new Promise((resolve) => {
        const request = (res as IDBObjectStore).put(data)
        request.onsuccess = () => {
          resolve({ code: 200, msg: '数据更新成功' })
        }
        request.onerror = (event) => {
          resolve({ code: 500, msg: '数据更新失败，' + event })
        }
      })
    })
  }
  delete(id: number) {
    return this.activeBefore().then(res => {
      if (typeof res === 'string') {
        return { code: 500, msg: '数据删除失败，' + res }
      }
      return new Promise((resolve) => {
        const request = (res as IDBObjectStore).delete(id)
        request.onsuccess = () => {
          resolve({ code: 200, msg: '数据删除成功' })
        }
        request.onerror = (event) => {
          resolve({ code: 500, msg: '数据添加失败，' + event })
        }
      })
    })
  }
}