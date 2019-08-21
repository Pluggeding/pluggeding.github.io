/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2018 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import {UTILS, _} from './Utils.mjs'
/**
 * Collection of tools
 */
export default {
        /**
         * Convert bytes to readable size
         * @see https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript#18650828
         * @param  {Integer|String}    bytes -
         * @param  {Integer|String} decimals - optional number of decimals
         * -- note: set to "0" pass as {String} like:
         *  + bytesToSize(122345346, 0)   // output: "116.68 MB"
         *  + bytesToSize(122345346, '0') // output: "116 MB" [its realy effective]
         * @return {String}
         */
        bytesToSize(bytes, decimals) {
            if ( (0 === bytes) || (!bytes) ) {
                return '0 Bytes'
            }
            let k = 1024,
                dm = decimals || 2,
                sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                i = Math.floor(Math.log(bytes) / Math.log(k))
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
        },

        /**
         * Generate UUID long and short (default: long)
         * @param  {Boolean} short - indicates return short UUID
         * @return {String}
         */
        uuid(short) {
            if ( short ) {
                return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
            }
            let s4 = () => {
                return Math.floor(Math.random() * 0x10000).toString(16)
            }
            return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4()
        },

        /**
         * OBSOLETE
         * Find one word in dictionary object
         * @see https://pt.stackoverflow.com/questions/269054/buscar-valores-em-um-objeto#269061
         * @param  {String} expression - word's router in dictionary
         * @param  {Object} language   - dictionary
         * @return {String} the word or {Boolean}:false to not found
         * @throw  {Boolean}:false
         */
        getWord(expression, language = {}) {
            try {
                language = (Object.keys(language) > 0) ? language : window.dictionary
                if ( UTILS.isString(expression) && /\./g.test(expression) ) {
                    return expression.split('.').reduce((o, i) => o[i], language)
                } else {
                    return false
                }
            } catch(ex) {
                return false
            }
        },
        /**
         * Deep Freezing {Object} and {Object}(s) properties [imutable]
         * @see font: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
         * @param {Object} obj -
         */
        deepFreeze(obj) {
            // get propertis names
            let propNames = Object.getOwnPropertyNames(obj)
            // freeze properties before auto-freeze
            propNames.forEach(name => {
                let prop = obj[name]
                // freeze prop
                if ( typeof prop === 'object' && prop !== null ) {
                    this.deepFreeze(prop)
                }
            })
            // auto-freeze (nothing if already freeze)
            return Object.freeze(obj)
        },
        /**
         *
         */
        fadeOut(element, timing, callback = false) {
            let StyleSheet = document.styleSheets[1],
            CSSFadeOutIdx,
                classuuid = this.uuid(true)
            if ( !UTILS.isNumber(timing) ) {
                timing = .4
            }
            _.addClass(element, 'fadeout-'+classuuid)
            CSSFadeOutIdx = StyleSheet.insertRule(`.fadeout-${classuuid} {
                transition: ${timing}s;
                opacity: 0;
            }`)
            setTimeout(() => {
                _.addClass(element, 'd-none')
                StyleSheet.deleteRule(CSSFadeOutIdx)
                if ( UTILS.isFunction(callback) ) {
                    callback(element)
                }
            }, (timing * 1000))
        },
        /**
         * [fadeIn description]
         * @param  {[type]}  element  [description]
         * @param  {[type]}  timing   [description]
         * @param  {Boolean} callback [description]
         * @return {[type]}           [description]
         */
        fadeIn(element, timing, callback = false) {
            let StyleSheet = document.styleSheets[1],
                CSSFadeInIdx,
                classuuid = this.uuid(true)
            if ( !UTILS.isNumber(timing) ) {
                timing = .4
            }
            _.addClass(element, 'fadein-'+classuuid).removeClass(element, 'd-none')
            CSSFadeInIdx = StyleSheet.insertRule(`.fadein-${classuuid} {
                opacity: 0;
                animation-name: fadeInOpacity;
                animation-iteration-count: 1;
                animation-timing-function: ease-in;
                animation-duration: ${timing}s;
            }`)
            setTimeout(() => {
                _.removeClass(element, 'fadein-'+classuuid)
                StyleSheet.deleteRule(CSSFadeInIdx)
                if ( UTILS.isFunction(callback) ) {
                    callback(element)
                }
            }, (timing * 1000))
        },
        /**
         * [stringDistance description]
         * @param  {String} str1 - string to comparation
         * @param  {String} str2 - string to comparation
         * @see https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely#36566052
         * @return {Number}      - estimated distance of strings
         */
        stringDistance(str1, str2) {
            const distance = (s1, s2) => {
                s1 = s1.toLowerCase()
                s2 = s2.toLowerCase()
                let costs = []
                for (let i = 0; i <= s1.length; i++) {
                     let lastValue = i;
                     for (let j = 0; j <= s2.length; j++) {
                          if ( i === 0 ) {
                              costs[j] = j
                          } else {
                              if ( j > 0 ) {
                                  let newValue = costs[j - 1]
                                  if ( s1.charAt(i - 1) != s2.charAt(j - 1) ) {
                                      newValue = Math.min(Math.min(newValue, lastValue),
                                      costs[j]) + 1
                                  }
                                  costs[j - 1] = lastValue
                                  lastValue = newValue
                              }
                          }
                     }
                     if ( i > 0 ) {
                         costs[s2.length] = lastValue
                     }
                }
                return costs[s2.length]
            }
            let longer = str1,
                shorter = str2
            if ( str1.length < str2.length ) {
                longer = str2
                shorter = str1
            }
            let longerLength = longer.length
            if ( longerLength == 0 ) {
                return 1.0
            }
            return (longerLength - distance(longer, shorter)) / parseFloat(longerLength)
        },
        /**
         *
         */
        ObjectSize(obj) {
            function sizeOfObject (object) {
                if ( object == null ) {
                    return 0
                }
                var bytes = 0
                for (var key in object) {
                     if ( !Object.hasOwnProperty.call(object, key) ) {
                         continue
                     }
                     bytes += sizeof(key)
                     try {
                         bytes += sizeof(object[key])
                     } catch (ex) {
                         if ( ex instanceof RangeError ) {
                             // circular reference detected, final result might be incorrect
                             // let's be nice and not throw an exception
                             bytes = 0
                         }
                     }
                }
                return bytes
            }
            if ( UTILS.isArrayBufferView(object) ) {
                return object.byteLength
            }
            var objectType = typeof (object)
            switch (objectType) {
                case 'string':
                    return object.length * 2
                case 'boolean':
                    return 4
                case 'number':
                    return 8
                case 'object':
                    return sizeOfObject(object)
                default:
                    return 0
            }
        }
    }
