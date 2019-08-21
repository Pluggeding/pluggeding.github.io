/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2018 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
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
} from './BasePrefixes.mjs'

/**
 * Prototype to {String} "trimer" functions [global scope]
 */
String.prototype.trim = function() {
    let trimmed = this.replace(/^\s+|\s+$/g, '')
    return trimmed
}
String.prototype.ltrim = function() {
    let trimmed = this.replace(/^\s+/g, '')
    return trimmed
}
String.prototype.rtrim = function() {
    let trimmed = this.replace(/\s+$/g, '')
    return trimmed
}

//
let passiveListener = false

//
class Traverse {
    constructor(whats) {
        //
    }
}
/**
 * Helper's DOM manipulate HTMLElement [not allow in (Web|Service) Worker]
 * @extend -> Plugin._
 */
export let _ = {}
if ( IsWebBrowserContext ) {
    _ = {
        create(tag) {
            return dc.createElement(tag)
        },
        createTN(text) {
            return dc.createTextNode(text)
        },
        getA(element, attr) {
            return UTILS.isElement(element) ? element.getAttribute(attr) : false
        },
        has(element, attr) {
            return element.hasAttribute(attr)
        },
        setA(element, attr, value) {
            element.setAttribute(attr, value)
        },
        getBI(id) {
            return dc.getElementById(id)
        },
        getCN(className) {
            return dc.getElementsByClassName(className)
        },
        getTN(tagName, node) {
            if ( node ) {
                return node.getElementsByTagName(tagName)
            }
            return dc.getElementsByTagName(tagName)
        },
        qS(target, node, head = false) {
            if ( head ) {
                return dc.head.querySelector(target)
            } else if ( target && node ) {
                return node.querySelector(target)
            }
            return dc.querySelector(target)
        },
        qSA(target, node, head = false) {
            if ( head ) {
                return dc.head.querySelectorAll(target)
            } else if ( target && node ) {
                return node.querySelectorAll(target)
            }
            return dc.querySelectorAll(target)
        },
        remove(element) {
            element.parentNode.removeChild(element)
        },
        addClass(element, classes) {
            let list = classes.trim().split(' ')
            list.forEach(item => {
                element.classList.add(item)
            })
            return this
        },
        removeClass(element, classes) {
            let list = classes.trim().split(' ')
            list.forEach(item => {
                element.classList.remove(item)
            })
            return this
        },
        hasClass(element, clss) {
            return element.classList.contains(clss)
        },
        waitEl(base = dc, selector, callback) {
            let Animation,
                list,
                step = () => {
                list = this.qSA(selector, base)
                if ( list.length !== 0 ) {
                    cancelAnimationFrame(Animation)
                    callback(list)
                } else {
                    Animation = requestAnimationFrame(step)
                }
            }
            setTimeout(step, 100)
        },
        isVisible(element) {
            return !!( element.offsetWidth || element.offsetHeight || element.getClientRects().length )
        }
    }
}

export const UTILS = {
    /**
     * EventListenerOptions
     * @param capture {Boolean}
     * @param passive {Boolean}
     * @param once {Boolean}
     * @return {Object|Boolean}
     */
    EventOptions(capture, passive, once) {
        // test passive support [every first]
        let passiveSupport = () => {
            let supportsPassive = false
            try {
                let opts = Object.defineProperty({}, 'passive', {
                    get() {
                        supportsPassive = true
                    }
                });
                wd.addEventListener('testPassiveListener', null, opts)
                wd.removeEventListener('testPassiveListener', null, opts)
            } catch (e) {}
            if ( supportsPassive || wd.Modernizr && Modernizr.passiveeventlisteners ) {
                passiveListener = true
                return true
            }
            return supportsPassive
        }
        let ObjRes = (cap, pas, onc) => {
            return {
                capture: cap,
                passive: pas,
                once: onc
            }
        }
        if ( this.isBoolean(capture) && this.isBoolean(passive) && this.isBoolean(once) ) {
            if ( passiveListener || passiveSupport() ) {
                capture = (!!capture) ? true : false
                passive = (!!passive) ? true : false
                once = (!!once) ? true : false
                return ObjRes(capture, passive, once)
            } else {
                return capture
            }
        } else if ( this.isBoolean(capture) && this.isBoolean(passive) && !this.isBoolean(once) ) {
            if ( passiveListener || passiveSupport() ) {
                capture = (!!capture) ? true : false
                passive = (!!passive) ? true : false
                return ObjRes(capture, passive, false)
            } else {
                return capture
            }
        } else if ( this.isBoolean(capture) && !this.isBoolean(passive) && !this.isBoolean(once) ) {
            return capture
        } else  if ( !this.isBoolean(capture) && this.isBoolean(passive) && this.isBoolean(once) ) {
            if ( passiveListener || passiveSupport() ) {
                once = (!!once) ? true : false
                passive = (!!passive) ? true : false
                return ObjRes(true, passive, once)
            } else {
                return true
            }
        } else if ( !this.isBoolean(capture) && !this.isBoolean(passive) && this.isBoolean(once) ) {
            if ( passiveListener || passiveSupport() ) {
                once = (!!once) ? true : false
                return ObjRes(false, false, once)
            } else {
                // if no have support to "passive" assume no have support to "once"
                return false
            }
        }
    },


    /**-------------------------------------------------------------------------------------------- OK|
     * Replace HTML text "entires"
     * @param rule {String|Array} - rule for mathching
     * @param replacement {String|Array} - item for replace the rule(s)
     * @param model {String} - HTML text
     * @param lang {String} - optional language definition for transcript [default: en-US]
     * @return {String} - HTML text
     */
    FindAndReplace(rule, replacement, model, i18n = false) {
        model = model.replace(/{{+[a-zA-Z0-9_]+=+[a-zA-Z0-9_=:.\/@#&-]+}}/gi, (wholeMatch) => {
            if ( wholeMatch ) {
                wholeMatch = wholeMatch.replace(/{{/g, '').replace(/}}/g, '')
                let index = wholeMatch.split('=')
                //
                if ( Array.isArray(rule) ) {
                    for (let i = 0; i < rule.length; i++) {
                         switch (index[0]) {
                             case rule[i]:
                                 if ( rule[i] === 'i18n' && IsServiceWorkerContext && i18n) {
                                     return i18n.getWord(index[1])
                                 } else if ( rule[i] === 'i18n' && IsWebBrowserContext ) {
                                     return i18n.getWord(index[1])
                                 } else {
                                     return (UTILS.isFunction(replacement[i])) ? replacement[i](index[1]) : replacement[i]
                                 }
                             break
                         }
                    }
                } else {
                    switch (index[0]) {
                        case rule:
                            return (UTILS.isFunction(replacement)) ? replacement(index[1]) : replacement
                        break
                        case 'i18n':
                            if ( IsServiceWorkerContext && lang) {
                                return i18n.getWord(index[1])
                            }
                            return i18n.getWord(index[1])
                        break
                    }
                }
            } else {
                return ''
            }
        })
        return model
    },


    /**
     * Queue [FIFO - First in, first out] - [call with constructor]
     */
    Queue: function() {
        this.q = []
        this.__proto__.push = item => {
            this.q.push(item)
        }
        this.__proto__.shift = () => {
            return this.q.shift() // empty array return "undefined"
        }
        this.__proto__.size = () => {
            return this.q.length
        }
    },

    /**
     * Stack [LIFO - Last in, first out] - [call with constructor]
     */
    Stack: function() {
        this.s = []
        this.__proto__.push = item => {
            this.s.push(item)
        }
        this.__proto__.shift = () => {
            return this.s.pop() // empty array return "undefined"
        }
        this.__proto__.last = () => {
            return this.s[this.s.length -1]
        }
        this.__proto__.size = () => {
            return this.s.length
        }
    },

    /**
     * Array merge [no duplicates]
     * @param origin {Array}
     * @param args {Array}(s) - objects to merge
     * @return {Array} - original or merged result
     */
    Merge(origin, ...args) {
        if ( !Array.isArray(...args) ) {
            return origin
        }
        // no duplicates ordered by "sort()"
        return Array.from(
            new Set(origin.concat(...args))
        ).sort()
    },

    /**
     * Extend objects - simple and minimalist merge objects
     * @arguments {Object}(s) - objects to merge
     * @return {Object} - merged objects
     * @throws {Object} - empty
     */
    Extend(...args) {
        try {
            return Object.assign(...args)
        } catch(e) {
            return {}
        }
    },

    /**
     * Convert NodeList to Array
     * @param {NodeList} nodeList
     */
    NodeToArray(nodeList) {
        return UTILS.isNodeList(nodeList) ? [...nodeList] : []
    },

    /**
     * Is mobile?
     * @see http://mobiledetect.com
     */
    isMobile: ((a) => {
        if ( /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)) ) {
            return true;
        } else {
            return false;
        }
    })(ua || nv.vendor || wd.opera),

    /**
     * Minimal detect device's
     */
    device: (() => {
        let devices = {},
            windows = ua.match(/(Windows Phone);?[\s\/]+([\d.]+)?/),
            android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
            ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
            ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
            iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/)
        devices.ios = devices.android = devices.windows = devices.iphone = devices.ipod = devices.ipad = devices.androidChrome = false
        // Windows
        if ( windows ) {
            devices.os = 'windows'
            devices.osVersion = windows[2]
            devices.windows = true
        }
        // Android
        if ( android && !windows ) {
            devices.os = 'android'
            devices.osVersion = android[2]
            devices.android = true
            devices.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0
        }
        if ( ipad || iphone || ipod ) {
            devices.os = 'ios'
            devices.ios = true
        }
        // iOS
        if ( iphone && !ipod ) {
            devices.osVersion = iphone[2].replace(/_/g, '.')
            devices.iphone = true
        }
        if ( ipad ) {
            devices.osVersion = ipad[2].replace(/_/g, '.')
            devices.ipad = true
        }
        if ( ipod ) {
            devices.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null
            devices.iphone = true
        }
        // iOS 8+ changed UA
        if ( devices.ios && devices.osVersion && ua.indexOf('Version/') >= 0 ) {
            if ( devices.osVersion.split('.')[0] === '10' ) {
                devices.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0]
            }
        }
        // Webview
        devices.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i) || false
        // Pixel Ratio
        devices.pixelRatio = wd.devicePixelRatio || 1
        return devices
    })(),
    /**
     * utils "is"
     */
    isString(str) {
        return typeof str === 'string'
    },
    isBoolean(val) {
        return typeof val === 'boolean'
    },
    isInteger(int) {
        return Number.isInteger(int)
    },
    isNumber(arg) {
        return typeof arg === 'number'
    },
    isNull(arg) {
        return arg === null
    },
    isObject(obj) {
        return typeof obj === 'object'
    },
    isElement(obj) {
        try {
            return (obj.constructor.__proto__.prototype.constructor.name) ? true : false
        } catch(_) {
            return false
        }
    },
    isNodeList(list) {
        return (!UTILS.isUndefined(list.length) && !UTILS.isUndefined(list.item))
    },
    isArray(obj) {
        return Array.isArray(obj)
    },
    isArrayBufferView(obj) {
        return obj && obj.buffer instanceof ArrayBuffer && obj.byteLength !== undefined
    },
    isUndefined(arg) {
        return arg === void 0
    },
    isFunction(arg) {
        return typeof arg === 'function'
    },
    isPrimitive(arg) {
        return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || /* ES6 symbol */ typeof arg === 'symbol' || typeof arg === 'undefined'
    },
    isDate(d) {
        return UTILS.isObject(d) && UTILS.objectToString(d) === '[object Date]'
    },
    isError(e) {
        return UTILS.isObject(e) && (UTILS.objectToString(e) === '[object Error]' || e instanceof Error)
    },
    isRegEx(re) {
        return UTILS.isObject(re) && UTILS.objectToString(re) === '[object RegExp]'
    },
    isSymbol(arg) {
        return typeof arg === 'symbol'
    },
    isJWT(str) {
        return UTILS.isString(str) && /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/.test(str)
    },
    /**
     * utils utility
     */
    objectToString(o) {
        return Object.prototype.toString.call(o)
    },
    hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop)
    },
    inArray(needle, haystack) {
        try {
            needle.includes(haystack)
        } catch(_) {
            return false
        }
    },
    type(obj) {
        return (obj) ? UTILS.objectToString(obj).replace(/^\[object (.+)\]$/, '$1').toLowerCase() : 'undefined'
    },
    //
    convertStringToArrayBuffer(str) {
        let encoder = new TextEncoder('utf-8')
        return encoder.encode(str)
    },

    convertArrayBuffertoString(buffer) {
        let decoder = new TextDecoder('utf-8')
        return decoder.decode(buffer)
    },

    bufferToHex(arr) {
        let i,
            len,
            hex = '',
            c
        for (i = 0, len = arr.length; i < len; i += 1) {
             c = arr[i].toString(16)
             if ( c.length < 2 ) {
                 c = '0' + c
             }
             hex += c
        }
        return hex
    },

    hexToBuffer(hex) {
      let i,
          byteLen = hex.length / 2,
          arr,
          j = 0
      if ( byteLen !== parseInt(byteLen, 10) ) {
          throw new Error("Invalid hex length '" + hex.length + "'")
      }
      arr = new Uint8Array(byteLen)
      for (i = 0; i < byteLen; i += 1) {
           arr[i] = parseInt(hex[j] + hex[j + 1], 16)
           j += 2
      }
      return arr
    }
}

// prototype UTILS AND _
if ( IsWebBrowserContext ) {
    /**
     * Add or Remove `EventListener` to NodeElement
     * @param  {Node}         element  - `NodeElement` target
     * @param  {String|Array} event    - related event(s)
     * @param  {Function}     callback - `Function` to this handler
     * @param  {Object}       options  - `Event` options (capture, passive, once), default {Boolean} fallback to `UTILS.EventOptions()`
     * @param  {Boolean}      mode     - "add" or "remove", deafult `true` for "addEventListener"
     */
    _.event = (element, event, callback, options = false, mode = true) => {
        mode = mode ? 'addEventListener' : 'removeEventListener'
        let opts = UTILS.isObject(options) ? options : UTILS.EventOptions(false, true, false)

        if ( !UTILS.isArray(element) && UTILS.isArray(event) ) {
            // multi events for same element
            event.forEach(ev => {
                element[mode](ev, callback, opts)
            })
        } else if ( UTILS.isArray(element) ) {
            let isArray = UTILS.isArray(event)
            // many elements for one or more events ... note: events length equal elements length
            element.forEach((el, idx) => {
                el[mode]((isArray ? event[idx] : event), callback, opts)
            })
        } else {
            // one element one event
            element[mode](event, callback, opts)
        }
    }
    /**
     * Get element position on window
     * @param el {DOMDocumentElementNode}
     * @return {number|float} cardinal x,y relative element position
     */
    UTILS.getPosition = (el) => {
        // default positions
        let xPos = 0,
            yPos = 0
        // loop
        while (el) {
            if ( el.tagName === "BODY" ) {
                // deal with browser quirks with body/window/document and page scroll
                let xScroll = el.scrollLeft || dc.documentElement.scrollLeft,
                    yScroll = el.scrollTop  || dc.documentElement.scrollTop
                xPos += ( el.offsetLeft - xScroll + el.clientLeft )
                yPos += ( el.offsetTop  - yScroll + el.clientTop )
            } else {
               // for all other non-BODY elements
               xPos += ( el.offsetLeft - el.scrollLeft + el.clientLeft )
               yPos += ( el.offsetTop  - el.scrollTop  + el.clientTop )
            }
            el = el.offsetParent
        }
        return {
           x: xPos,
           y: yPos
        }
    }
    /**
     *
     */
    UTILS.pN = (showpath) => {
        let lp = location.pathname
        if ( lp !== '/' ) {
            let list = lp.split('/')
            if ( list.length > 1 ) {
                let response = ''
                if ( /\.html/g.test(list[list.length -1]) ) {
                    response = (!!showpath) ? list.toString().replace(/,/g, '/').slice(1).replace('.html', '') : list[list.length -1].replace('.html', '')
                } else {
                    if ( list[0] === '' && list[list.length -1] === '' ) {
                        response = (!!showpath) ? list.toString().replace(/,/g, '/').slice(1) + 'index' : 'index'
                    }
                }
                return (response !== '') ? response : 'index'
            }
        } else {
            return 'index'
        }
    }
    /**
     *
     */
    UTILS.dL = function() {
        let lp = location.pathname
        let pn = this.pN()
        // differ of base domain
        if ( lp !== '/' ) {
            // check if have .html extension (file or folder)
            if ( /\.html/g.test(lp) ) {
                let levels = lp.replace('.html', '').split('/'),
                    loc = ''
                if ( levels.length > 1 ) {
                    for (let i = 0; i < levels.length; i++) {
                         if ( levels[i] !== '' && levels[i] !== pn ) {
                             loc += '../'
                         }
                    }
                } else {
                    loc = './';
                }
                return (loc !== '') ? loc : './';
            } else {
                let levels = lp.split('/'),
                    loc = '';
                if ( levels.length > 1 ) {
                    for (let i = 0; i < levels.length; i++) {
                         if ( levels[i] !== '' ) {
                             loc += '../'
                         }
                    }
                } else {
                    loc = './'
                }
                return (loc !== '') ? loc : './'
            }

        } else {
            return './'
        }
    }
    /**
     * Handler of `sessionStorage`
     */
    UTILS.Session = {
        /**
         * Get (request) entire
         * @param {String} key - index of entire
         * @param {String} regex - for generate {RegExp}
         * @return {String|Undefined}
         */
        get(key, regex) {
            let keys = Object.keys(ss).join('; ')
            if ( !!regex && typeof regex === 'string' ) {
                let r = new RegExp('[; ]' + regex + '([^\\s;]*)')
                let m = (' ' + keys).match(r)
                return (!!m) ? ss.getItem(regex + m[1]) : null
            } else {
                return ss.getItem(key)
            }
        },
        /**
         * Set (create) entire
         * @param {String} key - index of entire
         * @param {String|Object|Array} - entire value [note: {Object|Array} use `JSON.stringify`]
         */
        set(key, val) {
            if ( typeof val !== 'string' ) {
                ss.setItem(key, JSON.stringify(val))
                return
            }
            ss.setItem(key, val)
        },
        /**
         * Delete (remove) entire
         * @param {String} key - index of entire
         */
        del(key) {
            ss.removeItem(key)
        },
        /**
         * Get (request) all entires
         * @param {String} regex - for generate {RegExp}
         * @return {Array} - lot of entires [or empty]
         */
        all(regex) {
            let keys = Object.keys(ss),
                result = [],
                self = this
            if ( regex && typeof regex === 'string' ) {
                let r = new RegExp(regex)
                keys.forEach((key, i) => {
                    if ( r.test(key) ) {
                        result.push({
                            key: key,
                            value: self.get(key)
                        })
                    }
                })
            } else {
                keys.forEach((key, i) => {
                    result.push({
                        key: key,
                        value: self.get(key)
                    })
                })
            }
            return result
        },
        /**
         * Get (request) `JSON` values has been parsed (using `JSON.parse`)
         * @param {String} key - index of entire
         * @param {String} regex - for generate {RegEx}
         * @return {String|Undefined}
         */
        json(key, regex) {
            return this.get(key, regex) ? JSON.parse(this.get(key, regex)) : null
        },
        /**
         * Clear (remove) all entires from `sessionStorage`
         */
        clear() {
            ss.clear()
        }
    }
    /**
     * Redirect
     * @param {String} url - indicates destination
     */
    UTILS.redirect = (url) => {
        location.replace(url)
        return false
    }
    /**
     * Minimal possible browser's
     */
    UTILS.browser = {
        isSafari: (() => {
            let UA = ua.toLowerCase()
            return (UA.indexOf('safari') >= 0 && UA.indexOf('chrome') < 0 && UA.indexOf('android') < 0)
        })(),
        isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua),
        isIE: nv.pointerEnabled || nv.msPointerEnabled,
        isIETouch: (nv.msPointerEnabled && nv.msMaxTouchPoints > 1) || (nv.pointerEnabled && nv.maxTouchPoints > 1),
        islteIE9: (() => {
            // create temporary DIV
            let div = _.create('div')
            // add content to tmp DIV which is wrapped into the IE HTML conditional statement
            div.innerHTML = '<!--[if lte IE 9]><i></i><![endif]-->'
            // return true / false value based on what will browser render
            return _.getTN('i', div).length === 1
        })(),
        isEdge: ua.indexOf('Edge') !== -1 && (!!nv.msSaveBlob || !!nv.msSaveOrOpenBlob),
        isOpera: !!wd.opera || ua.indexOf(' OPR/') >= 0,
        isChrome: !!wd.chrome && !wd.opera || !ua.indexOf(' OPR/') >= 0,
        isFirefox: typeof wd.InstallTrigger !== 'undefined' && /Firefox/i.test(ua)
    }
    UTILS.browser.isWindows = (UTILS.browser.isIE || UTILS.browser.isIETouch || UTILS.browser.islteIE9 || UTILS.browser.isEdge) || false
    /**
     * SendBeacon
     */
    UTILS.sendBeacon = (uri, data, auth) => {
        try {
            if ( auth ) {
                /**
                 * Chrome bug not support Blob.type === 'application/json'
                 * @see https://bugs.chromium.org/p/chromium/issues/detail?id=490015
                 */
                data.auth = auth
                let serializedData = JSON.stringify(data),
                    rawData = false
                if ( this.brower.isChrome ) {
                    rawData = new Blob([serializedData], {
                        type: 'application/x-www-form-urlencoded'
                    })
                } else {
                    rawData = new Blob([serializedData], {
                        type: 'application/json'
                    })
                }
                // send
                if ( rawData ) {
                    sendBeacon(uri, rawData)
                }
            }
        } catch(ex) {}
    }
}