/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2018 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
/**
 * Define execution context (web only)[not Node environment or others][not frameable]
 * -- Browser Context    - main browser (window and document access)
 * -- Web Worker Context - thread       (WorkerGlobalWorkerScope access, don't access ServiceWorkerGlobalScope)
 * -- Service Worker     - proxy        (access WorkerGlobalWorkerScope and ServiceWorkerGlobalScope)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/self
 *
 *   -- "The Window.self read-only property returns the window itself, as a WindowProxy.
 *       It can be used with dot notation on a window object (that is, window.self) or standalone (self).
 *       The advantage of the standalone notation is that a similar notation exists for non-window contexts, such as in Web Workers.
 *       By using self, you can refer to the global scope in a way that will work not only in a window context (self will resolve to window.self)
 *       but also in a worker context (self will then resolve to WorkerGlobalScope.self)."
 */
export let IsServiceWorkerContext = ( ('WorkerGlobalScope' in self) && ('ServiceWorkerGlobalScope' in self) ) ? true : false,
           IsWebWorkerContext     = ( ('WorkerGlobalScope' in self) && !('ServiceWorkerGlobalScope' in self) ) ? true : false,
           IsWebBrowserContext    = ( ('window' in self && 'document' in self) && !IsServiceWorkerContext && !IsWebWorkerContext) ? true : false,
           // check if is frame context
           IsFrameBox = (window.location !== window.top.location) ? true : false
/**
 * global constant's (aka: variables) [imutables]
 */
export const noop = () => {}
export const dc = IsWebBrowserContext ? document : false,
        wd = IsWebBrowserContext ? window : self,
        nv = wd.navigator,
        sw = (IsWebBrowserContext && !IsFrameBox) ? nv.serviceWorker : {},
        ua = nv.userAgent,
        ls = (IsWebBrowserContext && !IsFrameBox) ? wd.localStorage : noop(),
        ss = (IsWebBrowserContext && !IsFrameBox) ? wd.sessionStorage : noop(),
        ot = IsWebBrowserContext ? dc.title : 'Subversivo58',
        dt = (function() {
            return new Date().toString()
        })(),
        ts = (function() {
            return new Date().getTime()
        })(),
        // PHP time() approach
        time = (function() {
            return Math.floor(new Date().getTime() / 1000)
        })(),
        // for get current protocol
        uri = wd.location.protocol,
        // root (domain)
        BaseRoot = uri + '//' + location.host + '/',

        XHR = (IsWebBrowserContext && !IsFrameBox) ? ( new XMLHttpRequest() ) : noop(),
        FD  = ( new FormData() ),
        // global get APIS...
        indexedDB      = (IsWebBrowserContext && !IsFrameBox) ? wd.indexedDB : false,
        IDBTransaction = (IsWebBrowserContext && !IsFrameBox) ? wd.IDBTransaction : false,
        IDBKeyRange    = (IsWebBrowserContext && !IsFrameBox) ? wd.IDBKeyRange : false,
        URL            = wd.URL || false,
        Geolocation    = IsWebBrowserContext ? nv.geolocation : noop(),
        RegLogout      = IsWebBrowserContext ? nv.sendBeacon : noop(),
        Notifics       = IsWebBrowserContext ? wd.Notification : noop(),
        Fetch          = wd.fetch || false,
        Storage        = (IsWebBrowserContext && !IsFrameBox) ? wd.Storage : noop(),
        Worker         = (IsWebBrowserContext && !IsFrameBox) ? wd.Worker : noop(),
        ServiceWorker  = (IsWebBrowserContext && !IsFrameBox) ? nv.serviceWorker : noop(),
        Promise        = wd.Promise || false

// global invoques dont use vars !IMPORTANT!
if ( IsWebBrowserContext && ('mediaDevices' in nv) ) {
    nv.getUserMedia = nv.mediaDevices
} else if ( IsWebBrowserContext && !('mediaDevices' in nv) ) {
    nv.getUserMedia = ( nv.getUserMedia || nv.webkitGetUserMedia || nv.mozGetUserMedia || nv.oGetUserMedia || nv.msGetUserMedia ) || false
} else {
    nv.getUserMedia = noop()
}
