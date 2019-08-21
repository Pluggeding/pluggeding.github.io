/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2018 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import {UTILS} from './Utils.mjs'


const noop = () => {}

/**
 * Change `console` to auto-replace "mode" and plugin identification - facilitates filtering on console
 */
const ImprovedLog = (context, method, message) => {
    return function() {
       method.apply(context, [message].concat(Array.prototype.slice.apply(arguments)))
    }
}
// let's do the actual proxying over originals
let Log = function() {}
Log       = ImprovedLog(console, console.log,   '[LOG][IDBStorage]:')
Log.info  = ImprovedLog(console, console.info,  '[INFO][IDBStorage]:')
Log.warn  = ImprovedLog(console, console.warn,  '[WARN][IDBStorage]:')
Log.error = ImprovedLog(console, console.error, '[ERROR][IDBStorage]:')
Log.debug = ImprovedLog(console, console.debug, '[DEBUG][IDBStorage]:')

export default class IDBStorage {
    constructor(name, version = 1, logging = false) {
        this.name = name
        this.version = version
        this.log = (logging && typeof logging === 'boolean') ? Log : ((logging && typeof logging === 'function') ? logging : noop)
    }

    /**
     * Create database(s), tables and objects
     * @param  {Object} opt
     * @return {Object}:Promise
     */
    create(list) {
        return new Promise((resolve, reject) => {
            try {
                let request = indexedDB.open(this.name, this.version)
                request.onsuccess = sc => {
                    if ( sc.target.result !== undefined ) {
                        sc.target.result.close()
                    }
                    resolve(this)
                }
                request.onerror = er => {
                    let err_message = (er) ? er : 'Error in create|open indexedDB!'
                    this.log.error(err_message)
                    reject(err_message)
                }
                request.onupgradeneeded = up => {
                    list.forEach((item, idx, array) => {
                        up.target.result.createObjectStore(item)
                    })
                }
            } catch(ex) {
                reject()
            }
        })
    }


    put(list = false) {
        return new Promise((resolve, reject) => {
            try {
                let request = indexedDB.open(this.name, this.version)
                request.onsuccess = sc => {
                    let data = sc.target.result
                    if ( !!list && Array.isArray(list) ) {
                        let errors = []
                        list.forEach((item, idx, array) => {
                            if ( ('tbk' in item) && item.tbk !== undefined ) {
                                let transaction = data.transaction( [item.tbn], 'readwrite' )
                                transaction.objectStore( item.tbn ).put( item.tbv, item.tbk )
                            } else {
                                errors.push(`Failed insert: ${tables[i].tbn} values`)
                            }
                            if ( idx === array.length -1 ) {
                                data.close()
                                if ( errors.length > 0 ) {
                                    errors.forEach(err => {
                                        this.log.error(err)
                                    })
                                    reject(errors)
                                } else {
                                    resolve(this)
                                }
                            }
                        })
                    } else {
                         reject()
                    }
                }
                request.onerror = er => {
                    let err_message = (er) ? er : 'Error in create|open indexedDB!'
                    this.log.error(err_message)
                    reject(err_message)
                }
                // if database not exists ... is created
                request.onupgradeneeded = up => {
                    list.forEach((item, idx, array) => {
                        up.target.result.createObjectStore(item.tbn)
                    })
                }
            } catch(ex) {
                reject(ex)
            }
        })
    }

    // fetch entires
    get(opt) {
        let self = this
        return new Promise((resolve, reject) => {
            let method = (!!opt.method) ? opt.method : 'one', // for method get (one object or all objects)
                table  = (!!opt.tbn) ? opt.tbn : false,      // for table name
                key    = (!!opt.tbk) ? opt.tbk : false,     // for table key object
                data                                       // null|undefined for instance new connection
            let ready = () => {
                let request = indexedDB.open( this.name, this.version )
                let goSearch = database => {
                    switch (method) {
                        case 'count':
                            try {
                                let transact = database.transaction([table], 'readonly'),
                                    object   = transact.objectStore(table ),
                                    request = object.count()
                                request.onsuccess = () => {
                                    resolve(request.result)
                                }
                                request.onerror = e => {
                                    this.log.error(e.message)
                                    reject(e)
                                }
                            } catch(ex) {
                                this.log.error(ex.message)
                                reject(ex)
                            }
                        break
                        case 'like':
                            try {
                                let result = []
                                let transact = database.transaction([table], 'readonly'),
                                    object = transact.objectStore(table),
                                    request = object.openCursor(IDBKeyRange.bound(key, key + '\uffff'), 'prev')
                                request.onsuccess = sc => {
                                    let cursor = sc.target.result
                                    if ( cursor ) {
                                        result.push({
                                            key: cursor.key,
                                            value: cursor.value
                                        })
                                        cursor.continue()
                                    } else {
                                        database.close()
                                        resolve(result)
                                    }
                                }
                                request.onerror = err => {
                                    this.log.error(err.message)
                                    database.close()
                                    reject(err)
                                }
                            } catch(ex) {
                                this.log.error(ex.message)
                                reject(ex)
                            }
                        break
                        case 'one':
                            try {
                                let transact = database.transaction([table], 'readonly'),
                                    object   = transact.objectStore(table),
                                    request  = object.get( key )
                                request.onsuccess = sc => {
                                    if ( sc.target.result === undefined ) {
                                        reject(false)
                                    } else {
                                        database.close()
                                        resolve(sc.target.result) // value
                                    }
                                }
                                request.onerror = err => {
                                    this.log.error(err.message)
                                    reject(err)
                                };
                            } catch(ex) {
                                this.log.error(ex.message)
                                reject(ex)
                            }
                        break
                        case 'all-old':
                            try {
                                let transact = database.transaction(table).objectStore(table)
                                let result = []
                                transact.openCursor().onsuccess = sc => {
                                    let cursor = sc.target.result
                                    if ( cursor ) {
                                        /**
                                         * Old method ...
                                         *
                                         * result.push({
                                         *     key: cursor.key,
                                         *     value: cursor.value
                                         * });
                                         */
                                        result.push(cursor.value)
                                        cursor.continue()
                                    } else {
                                        resolve(result) // array [objects]
                                    }
                                }
                            } catch(ex) {
                                this.log.error(ex.message)
                                reject(ex)
                            }
                        break
                        case 'all-new':
                            /**
                             * shim to old method ["openCursor()"] case no have support to new method ["getAll()"]
                             * since Chrome 48
                             */
                            try {
                                let transact = database.transaction(table).objectStore(table)
                                if ('getAll' in transact) {
                                    transact.getAll().onsuccess = event => {
                                        resolve(event.target.result) // array [values]
                                    }
                                } else {
                                    let result = []
                                    transact.openCursor().onsuccess = sc => {
                                        let cursor = sc.target.result
                                        if ( cursor ) {
                                            /**
                                             * Old method ...
                                             *
                                             * result.push({
                                             *     key: cursor.key,
                                             *     value: cursor.value
                                             * });
                                             */
                                            result.push(cursor.value)
                                            cursor.continue()
                                        } else {
                                            resolve(result) // array [objects]
                                        }
                                    }
                                }
                            } catch(ex) {
                                this.log.error(ex.message)
                                reject(ex)
                            }
                        break
                        default:
                            reject()
                        break
                    }
                }
                request.onsuccess = sc => {
                    data = sc.target.result
                    goSearch( data )
                }
                request.onerror = err => {
                    // @revise
                    this.log.error(`Failed "get", code: ${err.target.errorCode}`)
                    reject( err )
                }
            }
            // check
            this.check().then(res => {
                ready()
            }).catch(err => {
                if ( err !== false ) {
                    // @revise
                    this.log.error(`Check indexedDB database error! Message: ${err.message}`)
                } else {
                    this.delete(this.name).then(noop).catch(noop)
                }
                reject(err)
            })
        })
    }


    /**
     * check if database exist (onsuccess response) or not(onupgradeneeded response) [used by get method]
     * @param  {Object} opt
     * @return {Object}:Promise
     */
    check(opt) {
        return new Promise((resolve, reject) => {
            let dbn,
                request = indexedDB.open( this.name, this.version )
            request.onsuccess = sc => {
                if ( dbn === undefined || dbn === null ) {
                    resolve()
                } else {
                    dbn.close()
                    reject(false)
                }
            }
            request.onerror = err => {
                reject(err)
            }
            // on created
            request.onupgradeneeded = up => {
                dbn = up.target.result
            }
        })
    }

    /**
     * Clear entire(s)
     * @param  {Object} opt
     * @return {Object}:Promise
     */
    clear(opt) {
        let self = this
        return new Promise((resolve, reject) => {
            let method = opt.method, // for method get (one object or all objects)
                table  = opt.tname, // for table name
                key    = opt.tkey, // for table key object
                data              // null|undefined for instance new connection
            let ready = () => {
               let request = indexedDB.open( this.name, this.version )
               let removeObject = conn => {
                   if ( method === 'all' ) {
                       let transact = conn.transaction( table, 'readwrite' ).objectStore( table )
                       transact.clear().onsuccess = sc => {
                           resolve()
                       }
                   } else {
                       let transact = conn.transaction( [table], 'readwrite' ).objectStore( table ).delete( key );
                       transact.onsuccess = sc => {
                           resolve()
                       }
                   }
               }
               request.onsuccess = sc => {
                   if ( dbn === undefined || dbn === null ) {
                       data = sc.target.result
                       removeObject( data )
                   } else {
                       // @revise
                       this.log.error(`No have database: ${this.name}, this is created and now, is deleted!`)
                       this.delete(this.name).then(reject).catch(reject)
                   }
               }
               request.onerror = err => {
                   // @revise
                   this.log.error(`Failed to "clear" indexed table: ${table}! Code: ${err.target.errorCode}`)
                   reject(err)
               }
               request.onupgradeneeded = up => {
                   dbn = 'onupgradeneeded'
                   // @revise
                   this.log.error(`Failed to "clear", no have database: ${this.name}!`)
               }
            }
            ready()
        })
    }

    /**
     * Destroy data base(s)
     * @param  {String|Object}:Array name - name of database or `Array` list of names
     * @return {Object}:Promise
     */
    delete(name) {
        return new Promise((resolve, reject) => {
            try {
                 let promises = []
                 let multidelete = dbname => {
                     return new Promise((res, rej) => {
                         let del = indexedDB.deleteDatabase(dbname)
                         del.onerror = e => {
                            this.log.error(e.message)
                             reject(e)
                         }
                         del.onsuccess = s => {
                             resolve(true)
                         }
                     })
                 }
                 // list all database
                 indexedDB.databases().then(result => {
                    if ( result.length >= 1 ) {
                        if ( Array.isArray(name) ) {
                            result.filter((x,i) => x.name === name[i]).forEach((db, idx, arr) => {
                                promises.push(multidelete(db.name))
                                if ( idx === arr.length -1 ) {
                                    Promise.all(promises).then(res => {
                                        resolve(res)
                                    }).catch(reject)
                                }
                            })
                        } else {
                            result.filter(x => x.name === name).forEach(db => {
                                let del = indexedDB.deleteDatabase(db.name)
                                del.onerror = e => {
                                    this.log.error(e.message)
                                    reject(e)
                                }
                                del.onsuccess = s => {
                                    resolve(true)
                                }
                            })
                        }
                    } else {
                        reject(false)
                    }
                 }).catch(reject)
            } catch(ex) {
                this.log.error(ex.message)
                reject(ex)
            }
        })
    }

    /**
     * Erase all databases - not `throws`, not return
     */
    eraseAll() {
        try {
            indexedDB.databases().then(result => {
                result.forEach(db => {
                    indexedDB.deleteDatabase(db.name)
                })
            }).catch(noop)
        } catch(ex) {
            this.log.error(ex.message)
        }
    }

    exists(dbname = false) {
        return new Promise((resolve, reject) => {
            dbname = !!dbname ? dbname : this.name
            indexedDB.databases().then(result => {
                if ( result.find(db => db.name === dbname) ) {
                    resolve(true)
                } else {
                    reject(false)
                }
            }).catch(reject)
        })
    }
}
