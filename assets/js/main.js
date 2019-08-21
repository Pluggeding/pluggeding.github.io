/**
 * @license The MIT License (MIT)             - [https://github.com/Pluggeding/pluggeding.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2019 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/Pluggeding/pluggeding.github.io/blob/master/VERSIONING.md]
 */



import {
    IsWebBrowserContext,
    IsWebWorkerContext,
    IsServiceWorkerContext,
    IsFrameBox,
    noop, dc, wd, nv, sw, ua, ls, ss, ot, dt, ts,
    // PHP time() approach
    time,
    // protocol
    uri,
    // root (domain)
    BaseRoot,
    // XMLHttpRequest
    XHR,
    // FormData
    FD,
    // global get APIS...
    indexedDB,
    IDBTransaction,
    IDBKeyRange,
    URL,
    Geolocation,
    RegLogout,
    Notifics,
    Fetch,
    Storage,
    Worker,
    ServiceWorker,
    Promise
} from './modules/BasePrefixes.mjs'
import {UTILS, _} from './modules/Utils.mjs'
import TOOLS from './modules/Tools.mjs'
import CookiesJS from './modules/CookiesJS.mjs'
import Emitter from './modules/Emitter.mjs'
import BootstrapNative from './modules/BootstrapNative-v4.2.min.mjs'
import IDBStorage from './modules/IDBStorage.mjs'




// After HTMLDocument is charged and parsed [don't wait charge stylesheet's, images and subframe's]
_.event(dc, 'DOMContentLoaded', evt => {

    let IsFrameBox = (window.location !== window.top.location) ? true : false

    // on "top" CorePlugin call BootstrapNative JavaScript Functions
    BootstrapNative.initCallback()

    const Events = new Emitter()

    // main router
    const router = UTILS.pN(true)
    switch (router) {
        case 'index':
            break
        case 'store':

            // only istall on frame box
            if ( IsFrameBox ) {
                /**
                 * Receive "source" from first communication
                 */
                const PostMessageListener = source => {
                    Events.on('postMessage', data => {
                        // overwrite message to {Object} add plugin id - because this, "pluginId" is reserved key
                        source.postMessage(data.detail, '*')
                    })
                }

                // incoming messages
                _.event(wd, 'message', data => {
                    // check if have origin and origin is TLS protocol
                    if ( !event.origin /*|| !/https/.test(event.origin)*/ ) {
                        return
                    }
                    // check credentials...
                    if ( 'handshake' === event.data /*check credential*/) {
                        PostMessageListener(event.source)        // enable communication ... define "source"
                        Events.emit('postMessage', 'handshake')  // response to origin about this handshake
                        Events.emit('handshake', 'event.data')  // notify current script that communication opened
                    } else {
                        // "gatekeeper" for incoming messages
                        Events.emit('onmessage', event.data)
                    }
                })

                Events.on('handshake', () => {
                    Events.on('message', data => {
                        console.log(data) // plugin istalled response
                    })
                    //
                    _.event(_.getBI('fake-install'), 'click', evt => {
                        // store waithing response id
                        Events.on('install-xxxx', data => {
                            if ( data.detail ) {
                                console.log('> Plugin has been installed!')
                            } else {
                                console.log('> Plugin refused installation!')
                            }
                        }, true)

                        // send plugin metadata
                        Events.emit('postMessage', JSON.stringify({
                            "name": "Plugin Name",
                            "description": "Plugin description",
                            "permissions": {
                                "required": [
                                    "user-info",
                                    "user-contacts",
                                    "indexeddb",
                                    "storage"
                                ],
                                "optional": [
                                    "notification",
                                    "webpush",
                                    "geolocation"
                                ]
                            }
                        }))
                    })
                })
            } else {
                // disable all installation buttons
            }

            break
    }


}, UTILS.EventOptions(false, true, true), true)