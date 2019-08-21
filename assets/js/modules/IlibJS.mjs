/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2018 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import {UTILS, _} from './Utils.mjs'
import TOOLS from './Tools.mjs'


async function GetResource(uri, options = {}) {
    try {
        return await fetch(uri, options).then(response => response.json())
    } catch(ex) {
        //console.log(ex)
        return {
            IlibJS: 'https://github.com/iconic-dreams/ilibjs',
            author: {
                name: 'Lauro Moraes aka Subversivo58',
                url: 'https://github.com/subversivo58',
                homepage: 'https://subversivo58.github.io'
            },
            license: {
                type: 'The MIT License (MIT)',
                url: 'https://github.com/iconic-dreams/ilibjs/blob/master/LICENSE'
            }
        }
    }
}

/**
 * Simple and funny Storage System in memory
 */
class MemoryStorage {

    constructor(key) {
        this.key = key
        this.resources = []
        this.dictionary = {}
        this.length = 0
    }

    add(uri, resource) {
        this.resources.push({
            uri: uri,
            resource: resource
        })
        this.length = this.resources.length
    }

    put(resource) {
        return this.dictionary = resource
    }

    get() {
        return {
            key: this.key,
            resources: this.resources,
            dictionary: this.dictionary
        }
    }

    del(uri) {
        if ( this.resources.length > 0 ) {
            this.resources.forEach((item, i, arr) => {
                if ( item.uri === uri ) {
                    this.resources.splice(i, 1)
                }
            })
        }
    }

    clear() {
        this.resources = []
        this.dictionary = {}
    }
}

// MutationObeserver ...
const SpyDOM = (node, callback, options) => {
    let observer = new MutationObserver(callback)
    observer.observe(node, options)
}

/**
 * Get element attribute
 * @param element {Object} - NodeType HTMLElement
 * @param attribute {String} - atribute name criteria
 */
const GetAttributeData = (element, attribute) => {
    if ( UTILS.isElement(element) && (!!attribute && typeof attribute === 'string') ) {
        return _.getA(element, attribute)
    } else if ( UTILS.isElement(element) && !attribute ) {
        return {
            tooltip: _.getA(element, 'data-i18n-tooltip'),
            place:   _.getA(element, 'data-i18n-place'),
            multi:   _.getA(element, 'data-i18n-multi'),
            title:   _.getA(element, 'data-i18n-title'),
            html:    _.getA(element, 'data-i18n-html'),
            alt:     _.getA(element, 'data-i18n-alt'),
            img:     _.getA(element, 'data-i18n-img')
        }
    } else {
        return false
    }
}

/**
 * Find one word in dictionary object
 * @see https://pt.stackoverflow.com/questions/269054/buscar-valores-em-um-objeto#269061
 * @param  {String} expression - word's router in dictionary
 * @param  {Object} language   - dictionary
 * @return {String} the word or {Boolean}:false to not found
 * @throw  {Boolean}:false
 */
const FindWord = (expression, language) => {
    try {
        if ( UTILS.isString(expression) && /\./g.test(expression) ) {
            return expression.split('.').reduce((o, i) => o[i], language)
        } else {
            return false
        }
    } catch(ex) {
        return false
    }
}

/**
 * Translate all source
 * @param {Node}     node    - HTMLElement
 * @param {Object}   data    - attributes of Node
 * @param {String}   mode    - mode of add or set word(s)
 * @param {Function} getWord -
  */
const Translate = (node, data, mode, getWord) => {
    // define attributes
    let setAttr = (element, attribute) => {
        if ( attribute.title ) {
            _.setA(element, 'title', getWord(attribute.title))
        }
        if ( attribute.tooltip ) {
            _.setA(element, 'data-tooltip-title', getWord(attribute.tooltip))
        }
        if ( attribute.place ) {
            _.setA(element, 'placeholder', getWord(attribute.place))
        }
        if ( attribute.alt ) {
            _.setA(element, 'alt', getWord(attribute.alt))
        }
        if ( attribute.img ) {
            _.setA(element, 'title', getWord(attribute.img))
            _.setA(element, 'alt', getWord(attribute.img))
        }
    }
    switch (mode) {
        case 'prepend':
            if ( data.html ) {
                setAttr(node, data)
                node.innerHTML = ' ' + getWord(data.html) + ' ' + node.innerHTML
            }
        break;
        case 'append':
            if ( data.html ) {
                setAttr(node, data)
                node.innerHTML += ' ' + getWord(data.html)
            }
        break
        case 'pure':
            if ( data.html ) {
                setAttr(node, data)
                node.innerHTML = ' ' + getWord(data.html)
            }
        break
        case 'set':
            if ( data.html ) {
                setAttr(node, data)
                node.innerHTML = ' ' + getWord(data.html)
            } else if ( data.multi ) {
                setAttr(node, data)
                node.innerHTML = ' ' + getWord(data.multi)
            } else {
                setAttr(node, data)
            }
        break
    }
    if ( !data.tooltip && !data.place && !data.multi && !data.title && !data.html && !data.alt && !data.img ) {
        console.log(`Element: ${node} does not contain attributes to define`)
    }
    _.setA(node, 'translated', true)
}


/**
 * Layout translation based on JSON dictionaries
 */
export default class IlibJS {
    /**
     * Constructor class
     * @param  {String} alias   -
     * @param  {Object} options -
     * @return {Object}         - Instance of class
     */
    constructor(alias, options = {}) {
        this.alias = typeof alias === 'string' ? alias : 'i18n'
        this.storage = new MemoryStorage(alias)
        this.global = false

        this.baseselector = '[class^="i18n"]:not([translated])'

        if ( typeof options === 'object') {
            // storage system
            if ( 'storage' in options && typeof options.storage === 'function' ) {
                this.storage = options.storage
            }
            // populate dictionary to global object `window` (reffer by "mode")
            if ( 'global' in options ) {
                this.global = true
            }
            if ( 'dictionary' in options ) {
                try {
                     this.storage.put(options.dictionary)
                } catch(e){}
            }
        }

        /**
         * Find one word expression in dictionary object
         * @see https://pt.stackoverflow.com/questions/269054/buscar-valores-em-um-objeto#269061
         * @param  {String} expression - word's router in dictionary
         * @return {String} the word or {Boolean}:false to not found
         */
        this.getWord = expression => {
            return FindWord(expression, this.storage.get().dictionary)
        }

    }

    changeDictionary(uri) {
        let schema = this.storage.get().resources.find(i => i.uri === uri)
        return schema ? this.storage.put(schema.resource) : false
    }

    addDictionary(uri, resource) {
        if ( !this.storage.get().resources.find(i => i.uri === uri) ) {
            this.storage.add(uri, resource)
        }
    }

    async get(uri, options = {}) {
        const Process = async (u, o) => {
            await fetch(u, o).then(response => response.json()).then(result => {
                this.storage.add(u, result)
                this.global ? (window[this.alias] = this.storage.put(result)) : this.storage.put(result)
            }).catch(e => {
                throw new Error(`Failed request ${u} resource.`, e)
            })
            return this.storage.get().dictionary
        }
        // pre-check current dictionaries
        return ( this.storage.length > 0 ) ? (async () => {
            let matched = this.storage.get().resources.find(res => res.uri === uri)
            return matched ? (this.global ? (window[this.alias] = this.storage.put(matched.resource)) : this.storage.put(matched.resource)) : await Process(uri, options)
        })() : await Process(uri, options)
    }

    // return current dictionary
    dictionary() {
        return this.storage.get().dictionary
    }

    /**
     * Transcript all source
     */
    transcript(dictionary = false) {
        //
        if ( dictionary && UTILS.isObject(dictionary) ) {
            this.storage.put(dictionary)
        }
        // define
        let pre  = _.qSA('.i18n-prepend:not([translated])') || 0,
            app  = _.qSA('.i18n-append:not([translated])') || 0,
            pure = _.qSA('.i18n-pure:not([translated])') || 0,
            set  = _.qSA('.i18n:not([translated])') || 0,
            self = this
        /**
         * Run Node Elements in loop
         * @param {Object}:Array element - NodeType
         * @param {String}          mode - mode definition for use in "trancript()"
         */
        let runNodes = (element, mode) => {
            for (let i = 0; i < element.length; i++) {
                 let type = GetAttributeData(element[i])
                 Translate(element[i], type, mode, self.getWord)
                 ;[..._.qSA(self.baseselector, element[i])].forEach(subtree => {
                     self.subtree(subtree)
                 })
            }
        }
        // loops
        runNodes(pre,  'prepend')
        runNodes(app,  'append')
        runNodes(pure, 'pure')
        runNodes(set,  'set')
    }

    /**
     * Transcript dinamic Node's (traversable)
     * @param nodeElement {Node} - `NodeElement`
     */
    subtree(nodeElement) {
        // define
        let isType = false
        // get list of `Element` class
        let classes = nodeElement.getAttribute('class').split(/\s+/g)
        // check
        if ( classes.includes('i18n-prepend') ) {
            isType = 'prepend'
        } else if ( classes.includes('i18n-append') )  {
            isType = 'append'
        } else if ( classes.includes('i18n-pure') ) {
            isType = 'pure'
        } else if ( classes.includes('i18n') ) {
            isType = 'set'
        }
        // verify
        if ( isType ) {
            Translate(nodeElement, GetAttributeData(nodeElement), isType, this.getWord)
        }
    }

    /**
     * Observe changes in dinamic DOM fragments
     * @param target   {Node}   - `NodeElement` for "observe mutations"
     * @param selector {String} - selector for request into `DOM`
     */
    observe(target, selector = this.baseselector) {
        // initialize MutationObserver
        SpyDOM(target, mutations => {
            mutations.forEach(mutation => {
                [...mutation.addedNodes].forEach(addedNode => {
                    if ( /element/g.test(UTILS.type(addedNode)) ) {
                        [..._.qSA(selector, addedNode)].forEach(node => {
                            this.subtree(node)
                        })
                    }
                })
            })
        }, {childList: true})
    }
}


/**
 * How to use:

import iLib from './pathToIlib/iLib.mjs'

// Instance and "mode" (i18n|l10n|Intl)
const i18n = new IlibJS('i18n')

// Request JSON dictonary
// second argument (optional) headers for get (`window.Fetch()`)
i18n.get('https://domain.com/pathToDictionari.json', {
    credentials: 'include',
    cache: 'reload'
})












 */