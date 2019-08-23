/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2017 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
;(function(wd) {
    'use strict';
    
    // check if is running inside "frame box" ... not apply test inside "frame box"
    if ( window.location !== window.top.location ) {
        return
    }
    /**
     * Is mobile?
     * @see http://mobiledetect.com
     */
    function isMobile() {
        var a = wd.navigator.userAgent || wd.navigator.vendor || wd.opera;
        if ( /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)) ) {
            return true;
        } else {
            return false;
        }
    };
    function PrequelCustomError(message, code) {
       this.message = message || '';
       this.code = code;
    };
    // prototype
    PrequelCustomError.prototype = Error.prototype;
    try {
        // run-time pre check cookies arent enabled
        ;(function() {
            function test() {
                if ( !wd.navigator.cookieEnabled ) {
                    location.replace(location.protocol + '//' + location.host + '/nocookie.html');
                    //throw new Error('Your browser storage is off! Your access is denied!');
                }
            }
            setInterval(test, 1000);
            test();
        })();

        // https://caniuse.com/#feat=namevalue-storage for actual support of `window.Storage` API (93,75% usage in October 4, 2018)
        if ( typeof wd.localStorage !== 'undefined' ) {
            // check if ES6 support alredy test
            if ( !wd.localStorage.getItem('ES6') ) {
                // check `Symbol` support
                if ( typeof wd['Symbol'] === 'undefined' ) {
                    throw new PrequelCustomError('"Symbol" ES6 not detected! Your browser don\'t support "ES6"', 1);
                }
                eval('class Foo {};');
                // EventTarget with constructor
                eval("class Bar extends EventTarget { constructor() { super(); } };");
                eval('var bar = (x) => x+1;');
                eval('const noop = 1;');
                eval('let x = 1;');
                eval(';(function() { async _ => _; })();');
                eval(';[..."a","b","c"];');
                // save to storage
                wd.localStorage.setItem('ES6', true);
            }
            // check excential API's (assuming that ES6 is supported)
            if ( !wd.localStorage.getItem('EXCENTIAL_APIS') ) {
                /**
                 * ES6 Module Detection:
                 *   -- latests browser(s) support ES6 Modules, support "nomodule" attribute to ignore non module scripts
                 *   -- this reflect "static import": import {bar} from './foo.mjs'
                 */
                var script = document.createElement('script');
                var nv = wd.navigator,
                    excentials = {
                    getUserMedia: ( ('mediaDevices' in nv) || ('getUserMedia' in nv) || ('webkitGetUserMedia' in nv) || ('mozGetUserMedia' in nv) ) ? true : false,
                    WebRTC: ('RTCPeerConnection' in wd) ? true : false,
                    indexedDB: ( ('indexedDB' in wd) && ('IDBTransaction' in wd) && ('IDBKeyRange' in wd) ) ? true : false,
                    geolocation: ('geolocation' in nv) ? true : false,
                    Notification: ('Notification' in wd) ? true : false,
                    Worker: ('Worker' in wd) ? true : false,
                    sendBeacon: ('sendBeacon' in nv) ? true : false,
                    Promise: ('Promise' in wd) ? true : false,
                    serviceWorker: ('serviceWorker' in nv) ? true : false,
                    /**
                     * BroadcastChannel support - https://caniuse.com/#feat=broadcastchannel
                     * @note in October 4, 2018:
                     *   -- Firefox >= 38   (desktop)
                     *   -- Firefox >= 62   (mobile)(Android)
                     *   -- Chrome  >= 54   (desktop)
                     *   -- Chrome  >= 69   (mobile)(Android)
                     *   -- Opera   >= 41   (desktop)
                     *   -- Opera   >= 46   (mobile)
                     *   -- Android >= 67   (WebView)
                     *   -- UC      >= 11.8 (mobile)(Android)
                     *   -- Samsung >= 7.2  (mobile)
                     */
                    BroadcastChannel: ('BroadcastChannel' in wd) ? true : false,
                    EventTarget: ('EventTarget' in wd) ? true : false,
                    ES6Module: ('noModule' in script) ? true : false
                };
                // save to storage
                wd.localStorage.setItem('EXCENTIAL_APIS', JSON.stringify(excentials));
                // test excentials support
                Object.keys(excentials).forEach(function(key, index, array) {
                    // ignore ES6Module
                    if ( key !== 'ES6Module' && excentials[key] === false ) {
                        // this braek "loop"
                        throw new PrequelCustomError('Your browser don\'t support one or more features that are required for use this site ... see status table bellow:', 2)
                    }
                    // end "loop" ... no errors?
                    if ( index === array.length -1 ) {
                        // case it's "oldbrowser" page ... redirect to base website
                        if ( /oldbrowser\.html/.test(wd.location.href) ) {
                            wd.location.replace(wd.location.protocol + '//' + wd.location.host);
                        }
                    }
                })
            }
        } else {
            // possible Anonimous Mode
            throw new PrequelCustomError('"Storage" API is not detected! This site require use of storagement!', 0);
        }
    } catch(e) {
        // redirect
        if ( !/oldbrowser\.html/.test(wd.location.href) ) {
            // prevent ...
            wd.localStorage.clear();
            wd.location.replace(wd.location.protocol + '//' + wd.location.host + '/oldbrowser.html');
        } else {
            // check custom error
            if ( 'code' in e ) {
                switch (e.code) {
                    // `Storage` API not detected ... possible Anonimous Mode (incognitous)
                    case 0:
                        console.log('%c' + e.message, 'color:red;');
                        break;
                    // `Symbol` ES6 not detected ... nothing to show
                    case 1:
                        console.log('%c' + e.message, 'color:red;');
                        break;
                    // Excential API is not supported ... show info
                    case 2:
                        if ( wd.localStorage.getItem('EXCENTIAL_APIS') ) {
                            // Error in excentials API's ... "loop" for show status in console
                            console.log('%c' + e.message, 'color:red;');
                            var excentials = JSON.parse(wd.localStorage.getItem('EXCENTIAL_APIS'));
                            var tableStatus = [];
                            Object.keys(excentials).forEach(function(item, index, array) {
                                tableStatus.push({
                                    API: item,
                                    status: excentials[item]
                                });
                                if ( index === array.length -1 ) {
                                    console.table(tableStatus);
                                }
                            })
                        }
                        break;
                }
            } else {
                console.error(e)
            }
        }
        // prevent ...
        wd.localStorage.clear();
        // suggest browser's to update (or upgrade version)
        if ( !isMobile() ) {
            // remove desktop browesrs suggest link
            var suggests = document.getElementsByClassName('browser-suggest-link');
            for ( var i = 0; i < suggests.length; i++) {
                 suggests[i].classList.add('d-block');
                 suggests[i].classList.remove('d-none');
            }
        } else {
            var info = document.getElementsByClassName('mobile-info');
            for ( var i = 0; i < info.length; i++) {
                info[i].classList.add('d-block');
                info[i].classList.remove('d-none');
            }
        }
    }
})(window);
