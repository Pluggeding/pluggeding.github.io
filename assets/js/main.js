/**
 * @license The MIT License (MIT)             - [https://github.com/Pluggeding/pluggeding.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2019 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/Pluggeding/pluggeding.github.io/blob/master/VERSIONING.md]
 */



import {
    IsWebBrowserContext,
    IsWebWorkerContext,
    IsServiceWorkerContext,
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

           /**
            * Receive "source" from first communication
            */
           const PostMessageListener = source => {
               Events.on('postMessage', function(message) {
                   // overwrite message to {Object} add plugin id - because this, "pluginId" is reserved key
                   source.postMessage(message, '*')
               })
           }

           // incoming messages
           _.event(wd, 'message', data => {
               console.log(data)
           })

           //
           _.event(_.getBI('fake-install'), 'click', evt => {
               //
           })

           break
    }


}, UTILS.EventOptions(false, true, true), true)