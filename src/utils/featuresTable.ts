interface dataObj {
  [key:string]: string | number
}
export default class FeatrureTable {
  database: IDBDatabase | null = null
  databaseName = ''
  open(name: string) {
    this.databaseName = name
    let request = indexedDB.open(name, 3)

    request.onerror = function (event) {
      console.error(`Failed to open database "${name}", ${event}`)
    }

    request.onsuccess = (event) => {
      this.database = event.target && (event.target as IDBOpenDBRequest).result
    }

    request.onupgradeneeded = (event) => {
      this.database = event.target && (event.target as IDBOpenDBRequest).result || null
      if (this.database) {
        const objectStore = this.database.createObjectStore(name, { keyPath: 'id', autoIncrement: true })
        objectStore.createIndex('name', 'name', { unique: false })
      }
    }
  }

  add(data: dataObj) {
    return new Promise((resolve) => {
      if (!this.database) {
        if (this.databaseName) {
          this.open(this.databaseName)
        }
        return resolve({ code: 500, msg: '数据库添加数据失败，请重试'})
      }
      const transaction = this.database.transaction([this.databaseName], 'readwrite')
      const objectStore = transaction.objectStore(this.databaseName)
      const request = objectStore.add(data)
      request.onsuccess = () => {
        resolve({code: 200, msg: '数据添加成功'})
      }
      request.onerror = (event) => {
        resolve({code: 500, msg: '数据添加失败，' + event})
      }
    })
  }

  get(filterVal?: string) {
    return new Promise((resolve) => {
      if (!this.database) {
        if (this.databaseName) {
          this.open(this.databaseName)
        }
        return resolve({ code: 500, msg: '数据库获取数据失败，请重试'})
      }
      const transaction = this.database.transaction([this.databaseName], 'readonly')
      const objectStore = transaction.objectStore(this.databaseName)
      const request = objectStore.getAll()
      if (filterVal) {

      }
      request.onsuccess = () => {
        resolve({code: 200, data: request.result, msg: '数据获取成功'})
      }
      request.onerror = (event) => {
        resolve({code: 500, msg: '数据获取失败，' + event})
      }
    })
  }
  
  put(data: dataObj) {
    return new Promise((resolve) => {
      if (!this.database) {
        if (this.databaseName) {
          this.open(this.databaseName)
        }
        return resolve({ code: 500, msg: '数据库更新数据失败，请重试'})
      }
      const transaction = this.database.transaction([this.databaseName], 'readwrite')
      const objectStore = transaction.objectStore(this.databaseName)
      const request = objectStore.put(data)
      request.onsuccess = () => {
        resolve({code: 200, msg: '数据更新成功'})
      }
      request.onerror = (event) => {
        resolve({code: 500, msg: '数据更新失败，' + event})
      }
    })
  }
  delete(id: number) {
    return new Promise((resolve) => {
      if (!this.database) {
        if (this.databaseName) {
          this.open(this.databaseName)
        }
        return resolve({ code: 500, msg: '数据库删除数据失败，请重试'})
      }
      const transaction = this.database.transaction([this.databaseName], 'readwrite')
      const objectStore = transaction.objectStore(this.databaseName)
      const request = objectStore.delete(id)
      request.onsuccess = () => {
        resolve({code: 200, msg: '数据删除成功'})
      }
      request.onerror = (event) => {
        resolve({code: 500, msg: '数据删除失败，' + event})
      }
    })
  }
}