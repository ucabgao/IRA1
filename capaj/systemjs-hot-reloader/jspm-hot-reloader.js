/* eslint-env browser */
import socketIO from 'socket.io-client'
import Emitter from 'weakee'
import cloneDeep from 'lodash.clonedeep'

class JspmHotReloader extends Emitter {
  constructor (backendUrl) {
    if (!backendUrl) {
      backendUrl = '//' + document.location.host
    }
    super()
    const originalSystemImport = System.import
    const self = this
    System.import = function () {
      var args = arguments
      return originalSystemImport.apply(System, arguments).catch((err) => {
        self.lastFailedSystemImport = args
        throw err
      })
    }
    this.socket = socketIO(backendUrl)
    this.socket.on('connect', () => {
      console.log('hot reload connected to watcher on ', backendUrl)
      this.socket.emit('identification', navigator.userAgent)
    })
    this.socket.on('change', (ev) => {  // babel doesn't work properly here, need self instead of this
      let moduleName = ev.path
      this.emit('change', moduleName)
      if (moduleName === 'index.html') {
        document.location.reload(true)
      } else {
        if (self.lastFailedSystemImport) {
          return originalSystemImport.apply(System, self.lastFailedSystemImport).then(() => {
            console.log(self.lastFailedSystemImport[0], 'broken module reimported succesfully')
            self.lastFailedSystemImport = null
          })
        }
        if (this.currentHotReload) {
          this.currentHotReload = this.currentHotReload.then(() => {
            // chain promises TODO we can solve this better- this often leads to the same module being reloaded mutliple times
            return self.hotReload(moduleName)
          })
        } else {
          this.currentHotReload = this.hotReload(moduleName)
        }
      }
    })
    window.onerror = (err) => {
      this.socket.emit('error', err)  // emitting errors for jspm-dev-buddy
    }
    this.socket.on('disconnect', () => {
      console.log('hot reload disconnected from ', backendUrl)
    })
    this.pushImporters(System.loads)
  }
  pushImporters (moduleMap, overwriteOlds) {
    Object.keys(moduleMap).forEach((moduleName) => {
      let mod = System.loads[moduleName]
      if (!mod.importers) {
        mod.importers = []
      }
      mod.deps.forEach((dependantName) => {
        let normalizedDependantName = mod.depMap[dependantName]
        let dependantMod = System.loads[normalizedDependantName]
        if (!dependantMod) {
          return
        }
        if (!dependantMod.importers) {
          dependantMod.importers = []
        }
        if (overwriteOlds) {
          let imsIndex = dependantMod.importers.length
          while (imsIndex--) {
            if (dependantMod.importers[imsIndex].name === mod.name) {
              dependantMod.importers[imsIndex] = mod
              return
            }
          }
        }
        dependantMod.importers.push(mod)
      })
    })
  }
  deleteModule (moduleToDelete) {
    let name = moduleToDelete.name
    if (!this.modulesJustDeleted[name]) {
      let exportedValue
      this.modulesJustDeleted[name] = moduleToDelete
      if (!moduleToDelete.exports) {
        // this is a module from System.loads
        exportedValue = System.get(name)
        if (!exportedValue) {
          throw new Error('Not yet solved usecase, please reload whole page')
        }
      } else {
        exportedValue = moduleToDelete.exports
      }
      if (typeof exportedValue.__unload === 'function') {
        exportedValue.__unload() // calling module unload hook
      }
      System.delete(name)
      this.emit('deleted', moduleToDelete)
      console.log('deleted a module ', name)
    }
  }
  getModuleRecord (moduleName) {
    return System.normalize(moduleName).then(normalizedName => {
      let aModule = System._loader.moduleRecords[normalizedName]
      if (!aModule) {
        aModule = System.loads[normalizedName]
        if (aModule) {
          return aModule
        }
        return System.normalize(moduleName + '!').then(normalizedName => {  // .jsx! for example are stored like this
          let aModule = System._loader.moduleRecords[normalizedName]
          if (aModule) {
            return aModule
          }
          throw new Error('module was not found in Systemjs moduleRecords')
        })
      }
      return aModule
    })
  }
  hotReload (moduleName) {
    const self = this
    const start = new Date().getTime()
    this.backup = { // in case some module fails to import
      moduleRecords: cloneDeep(System._loader.moduleRecords),
      loads: cloneDeep(System.loads)
    }

    this.modulesJustDeleted = {}
    return this.getModuleRecord(moduleName).then(module => {
      this.deleteModule(module)
      const toReimport = []
      function deleteAllImporters (importersToBeDeleted) {
        importersToBeDeleted.forEach((importer) => {
          self.deleteModule(importer)
          if (importer.importers.length === 0 && toReimport.indexOf(importer.name) === -1) {
            toReimport.push(importer.name)
          } else {
            // recourse
            deleteAllImporters(importer.importers)
          }
        })
      }
      if (module.importers.length === 0) {
        toReimport.push(module.name)
      } else {
        deleteAllImporters(module.importers)
      }

      const promises = toReimport.map((moduleName) => {
        return System.import(moduleName).then(moduleReloaded => {
          console.log('reimported ', moduleName)
        })
      })
      return Promise.all(promises).then(() => {
        this.emit('allReimported', toReimport)
        this.pushImporters(this.modulesJustDeleted, true)
        console.log('all reimported in ', new Date().getTime() - start, 'ms')
      }, (err) => {
        this.emit('error', err)
        console.error(err)
        System._loader.moduleRecords = self.backup.moduleRecords
        System.loads = self.backup.loads
      })
    }, (err) => {
      this.emit('moduleRecordNotFound', err)
      // not found any module for this file, not really an error
    })
  }
}

export default JspmHotReloader
