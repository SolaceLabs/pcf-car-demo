/*
==============================================================================
    Solace Systems, Inc.
    SOLACE SYSTEMS MESSAGING API FOR JAVASCRIPT
    SolclientJS
==============================================================================
    7.1.0.17 - Debug
    20150120-2201
------------------------------------------------------------------------------
 Copyright 2009-2015 Solace Systems, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to use and
 copy the Software, and to permit persons to whom the Software is furnished to
 do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 UNLESS STATED ELSEWHERE BETWEEN YOU AND SOLACE SYSTEMS, INC., THE SOFTWARE IS
 PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 http://www.SolaceSystems.com

------------------------------------------------------------------------------
*/
//
/*global solace:true,window,global,escape,unescape,WebSocket,ArrayBuffer,Uint8Array,WebSocket,QUnit,SOLACE_LOG_FATAL,SOLACE_LOG_ERROR,SOLACE_LOG_WARN,SOLACE_LOG_INFO,SOLACE_LOG_DEBUG,SOLACE_LOG_TRACE */
//

/**
 * Requires log4javascript
 * http://log4javascript.org/
 */

//
function SOLACE_TS() {
    // unroll logic for speed
    var     ddd = new Date(),
            hh = String(ddd.getHours()),
            mm = String(ddd.getMinutes()),
            ss = String(ddd.getSeconds()),
            ms = String(ddd.getMilliseconds());

    hh = hh.length < 2 ? "0" + hh : hh;
    mm = mm.length < 2 ? "0" + mm : mm;
    ss = ss.length < 2 ? "0" + ss : ss;
    ms = ms.length < 3 ? "0" + ms : ms;
    ms = ms.length < 3 ? "0" + ms : ms; //twice: pad to 3

    return hh + ":" + mm + ":" + ss + "." + ms;
}

function SOLACE_LOG_FATAL(msg) {
    if (solace && solace.logger && solace.logger.fatal && typeof solace.logger.fatal === "function" && solace.SolclientFactory.getLogLevel() >= solace.LogLevel.FATAL) {
        msg = SOLACE_TS() + " " + Array.prototype.join.call(arguments, " ");
        solace.logger.fatal(msg);
    }
}
function SOLACE_LOG_ERROR(msg) {
    if (solace && solace.logger && solace.logger.error && typeof solace.logger.error === "function" && solace.SolclientFactory.getLogLevel() >= solace.LogLevel.ERROR) {
        msg = SOLACE_TS() + " " + Array.prototype.join.call(arguments, " ");
		solace.logger.error(msg);
    }
}
function SOLACE_LOG_WARN(msg) {
    if (solace && solace.logger && solace.logger.warn && typeof solace.logger.warn === "function" &&  solace.SolclientFactory.getLogLevel() >= solace.LogLevel.WARN) {
        msg = SOLACE_TS() + " " + Array.prototype.join.call(arguments, " ");
		solace.logger.warn(msg);
    }
}
function SOLACE_LOG_INFO(msg) {
    if (solace && solace.logger && solace.logger.info && typeof solace.logger.info === "function" && solace.SolclientFactory.getLogLevel() >= solace.LogLevel.INFO) {
        msg = SOLACE_TS() + " " + Array.prototype.join.call(arguments, " ");
		solace.logger.info(msg);
    }
}
function SOLACE_LOG_DEBUG(msg) {
    if (solace && solace.logger && solace.logger.debug && typeof solace.logger.debug === "function" && solace.SolclientFactory.getLogLevel() >= solace.LogLevel.DEBUG) {
        msg = SOLACE_TS() + " " + Array.prototype.join.call(arguments, " ");
		solace.logger.debug(msg);
    }
}
function SOLACE_LOG_TRACE(msg) {
    if (solace && solace.logger && solace.logger.trace && typeof solace.logger.trace === "function" && solace.SolclientFactory.getLogLevel() >= solace.LogLevel.TRACE) {
        msg = SOLACE_TS() + " " + Array.prototype.join.call(arguments, " ");
		solace.logger.trace(msg);
    }
}
//

if (typeof window.solace === "undefined") {
    /**
     * @namespace
     * <h1> Overview </h1>
     * This is the Solace Systems Messaging API for JavaScript. Concepts
     * defined in this API are similar to those defined in other Solace Messaging APIs
     * for Java, C, and .NET.
     * <h1> Concepts </h1>
     * Some general concepts:
     * <li> All function calls are non-blocking; confirmation, if requested, is
     * returned to the calling client application in the form of callbacks.
     * </li>
     *
     */
    var solace = {};
}

(function(solace) {
    /*
     * Date Format 1.2.3
     * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
     * MIT license
     *
     * Includes enhancements by Scott Trenda <scott.trenda.net>
     * and Kris Kowal <cixar.com/~kris.kowal/>
     *
     * Accepts a date, a mask, or a date and a mask.
     * Returns a formatted version of the given date.
     * The date defaults to the current date/time.
     * The mask defaults to dateFormat.masks.default.
     */
    var dateFormat = (function () {
        var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;
        var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[\-+]\d{4})?)\b/g;
        var timezoneClip = /[^\-+\dA-Z]/g;
        var pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) {
                    val = "0" + val;
                }
                return val;
            };

        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {
            var dF = dateFormat;

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length === 1 && Object.prototype.toString.call(date) === "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date();
            if (isNaN(date)) {
                throw new SyntaxError("invalid date");
            }

            mask = String(dF.masks[mask] || mask || dF.masks["default"]);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) === "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            var	prefix = utc ? "getUTC" : "get";
            var d = date[prefix + "Date"]();
            var D = date[prefix + "Day"]();
            var m = date[prefix + "Month"]();
            var y = date[prefix + "FullYear"]();
            var H = date[prefix + "Hours"]();
            var M = date[prefix + "Minutes"]();
            var s = date[prefix + "Seconds"]();
            var L = date[prefix + "Milliseconds"]();
            var o = utc ? 0 : date.getTimezoneOffset();
            var flags = {
                    d:    d,
                    dd:   pad(d),
                    ddd:  dF.i18n.dayNames[D],
                    dddd: dF.i18n.dayNames[D + 7],
                    m:    m + 1,
                    mm:   pad(m + 1),
                    mmm:  dF.i18n.monthNames[m],
                    mmmm: dF.i18n.monthNames[m + 12],
                    yy:   String(y).slice(2),
                    yyyy: y,
                    h:    H % 12 || 12,
                    hh:   pad(H % 12 || 12),
                    H:    H,
                    HH:   pad(H),
                    M:    M,
                    MM:   pad(M),
                    s:    s,
                    ss:   pad(s),
                    l:    pad(L, 3),
                    L:    pad(L > 99 ? Math.round(L / 10) : L),
                    t:    H < 12 ? "a"  : "p",
                    tt:   H < 12 ? "am" : "pm",
                    T:    H < 12 ? "A"  : "P",
                    TT:   H < 12 ? "AM" : "PM",
                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
                };

            return mask.replace(token, function ($0) {
                return flags.hasOwnProperty($0) ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }());

    // Some common format strings
    dateFormat.masks = {
        "default":      "ddd mmm dd yyyy HH:MM:ss",
        shortDate:      "m/d/yy",
        mediumDate:     "mmm d, yyyy",
        longDate:       "mmmm d, yyyy",
        fullDate:       "dddd, mmmm d, yyyy",
        shortTime:      "h:MM TT",
        mediumTime:     "h:MM:ss TT",
        longTime:       "h:MM:ss TT Z",
        isoDate:        "yyyy-mm-dd",
        isoTime:        "HH:MM:ss",
        isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };

    // Internationalization strings
    dateFormat.i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
    };

    // For convenience...
    Date.prototype.format = function (mask, utc) {
        return dateFormat(this, mask, utc);
    };

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, start) {
            for (var i = (start || 0); i < this.length; i++) {
                if (this[i] === obj) {
                    return i;
                }
            }
            return -1;
        };
    }
    
    if (! Array.prototype.map) {
        Array.prototype.map = function(mapper, that) {
            var other = [];
            for (var i = 0, n = this.length; i < n; i++) {
                if (i in this) {
                    other[i] = mapper.call(that, this[i], i, this);
                }
            }
            return other;
        };
    }

    /**
     * @private
     * ===========================================================================
     * Convert
     *
     * This collection of functions performs all required string to number and number to string
     * conversions
     * ============================================================================
     */
    solace.Convert = (function () {
        var threeZerosStr = String.fromCharCode(0,0,0);
        var twoZerosStr   = String.fromCharCode(0,0);

        var SHFT_24 = Math.pow(256, 3);
        var SHFT_16 = Math.pow(256, 2);
        var SHFT_08 = 256;

        var obj = {

            int8ToStr: function (int8) {
                return String.fromCharCode(int8 & 0xff);
            },

            int16ToStr: function (int16) {
                return (String.fromCharCode((int16 >> 8) & 0xff) + String.fromCharCode(int16 & 0xff));
            },
            int24ToStr: function(int24) {
                return (String.fromCharCode((int24 >> 16) & 0xff) + String.fromCharCode((int24 >> 8) & 0xff) + String.fromCharCode(int24 & 0xff));
            },
            int32ToStr: function (int32) {

                // It is expected that there are a lot of small numbers
                // being converted, so it is worth doing a few checks for
                // efficiency (on firefox it is about 3 times quicker for small numbers
                // to do the check - it is 2 times quicker for chrome)
                if (int32 >= 0 && int32 < 256) {
                    return threeZerosStr + String.fromCharCode(int32);
                }
                else if (int32 >= 0 && int32 < 65536) {
                    return twoZerosStr + String.fromCharCode(int32 >> 8) + String.fromCharCode(int32 & 0xff);
                }
                else {
                    return (String.fromCharCode((int32 >> 24) & 0xff) +
                            String.fromCharCode((int32 >> 16) & 0xff) +
                            String.fromCharCode((int32 >> 8) & 0xff) +
                            String.fromCharCode(int32 & 0xff));
                }

            },

            byteArrayToStr: function (byteArray) {
                var len = byteArray.length;
                if (len < 8192) {
                    return String.fromCharCode.apply(null, byteArray);
                } else {
                    // webkit bug
                    var k = 0,
                        r = "";
                    while (k < len) {
                        // slice is clamped, inclusive of startIndex, exclusive of lastIndex
                        r += String.fromCharCode.apply(null, byteArray.slice(k, k + 8192));
                        k += 8192;
                    }
                    return r;
                }
            },

            strToByteArray: function (str) {
                var result = [];
                for (var i = 0; i < str.length; i++) {
                    result[i] = str.charCodeAt(i);
                }
                return result;
            },

            strToHexArray: function(str) {
                function toHex(c) {
                    return c.charCodeAt(0).toString(16);
                }
                return Array.prototype.map.call(str.split(""), toHex);
            },

            strToInt8: function (data) {
                return data.charCodeAt(0) & 0xff;
            },

            strToInt16: function (data) {
                return ((data.charCodeAt(0) << 8) +
                        data.charCodeAt(1));
            },
            strToInt24: function(data) {
                return ((data.charCodeAt(0) << 16) +
                        (data.charCodeAt(1) << 8) +
                        (data.charCodeAt(2)));
            },
            strToInt32: function (data) {
                // SIGNED integer
                return ((data.charCodeAt(0) << 24) +
                    (data.charCodeAt(1) << 16) +
                    (data.charCodeAt(2) << 8) +
                    data.charCodeAt(3));
            },
            strToUInt32: function (data) {
                // WARNING: you cannot use a <<24 to shift a byte into
                // a 32-bit string, because JS treats it as signed
                return ((data.charCodeAt(0) * (256 * 256 * 256)) +
                    (data.charCodeAt(1) << 16) +
                    (data.charCodeAt(2) << 8) +
                    data.charCodeAt(3));
            }


        };

        return obj;
    }());


    // This code was written by Tyler Akins and has been placed in the
    // public domain.  It would be nice if you left this header intact.
    // Base64 code from Tyler Akins -- http://rumkin.com

    // It has been modified by me (Edward Funnekotter) to improve its
    // efficiency
    /**
     * @private
     */
    solace.Base64 = (function () {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var encLut = [ -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, 99, -1, -1, 99, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       99, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, 62, -1, -1, -1, 63,
                       52, 53, 54, 55, 56, 57, 58, 59,
                       60, 61, -1, -1, -1, 64, -1, -1,

                       // 64
                       -1,  0,  1,  2,  3,  4,  5,  6,
                        7,  8,  9, 10, 11, 12, 13, 14,
                       15, 16, 17, 18, 19, 20, 21, 22,
                       23, 24, 25, -1, -1, -1, -1, -1,
                       -1, 26, 27, 28, 29, 30, 31, 32,
                       33, 34, 35, 36, 37, 38, 39, 40,
                       41, 42, 43, 44, 45, 46, 47, 48,
                       49, 50, 51, -1, -1, -1, -1, -1,

                       // 128
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,

                       // 194
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1,
                       -1, -1, -1, -1, -1, -1, -1, -1 ];


        var obj = {
            /**
             * @private
             * Encodes a string in base64
             * @param {String} input The string to encode in base64.
             */
            encode: function (input) {
                var output = "";
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;
                do {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) + keyStr.charAt(enc4);
                } while (i < input.length);

                return output;
            },

            /**
             * @private
             * Decodes a base64 string.
             * @param {String} input The string to decode.
             */
            decode: function (input) {
                var output = "";
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;

                //SOLACE_LOG_TRACE("decoding " + input.length + " bytes: \n" + input);
                do {
                    while (encLut[input.charCodeAt(i)] > 64) {
                        i++;
                    }
                    enc1 = encLut[input.charCodeAt(i++)];
                    enc2 = encLut[input.charCodeAt(i++)];
                    enc3 = encLut[input.charCodeAt(i++)];
                    enc4 = encLut[input.charCodeAt(i++)];

                    if (enc1 < 0 || enc2 < 0 || enc3 < 0 || enc4 < 0) {
                        // Invalid character in base64 text
                        // alert("enc at " + i + ": " + enc1 + ", " + enc2 + ", " + enc3 + ", " + enc4);
                        throw(new solace.TransportError("Invalid base64 character in data stream",
                                                        solace.TransportSessionEventCode.DATA_DECODE_ERROR));
                    }

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output = output + String.fromCharCode(chr1);

                    if (enc3 !== 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 !== 64) {
                        output = output + String.fromCharCode(chr3);
                    }
                } while (i < input.length-3);

                //SOLACE_LOG_TRACE("returning " + output.length + " bytes");
                return output;
            }
        };

        return obj;
    }());

// Optimization for browsers that have built in base64 functions
    if (window.atob && window.btoa) {
        solace.base64_encode = function(data) {return window.btoa(data);};
        solace.base64_decode = function(data) {return window.atob(data);};
    }
    else {
        solace.base64_encode = solace.Base64.encode;
        solace.base64_decode = solace.Base64.decode;
    }

    /**
     * @private
     * @singleton
     */
    solace.ObjectUtil = (function ObjectUtil() {
        var defineReadOnlyProperty = (function() {
            try {
                if (Object.defineProperty) {
                    var result = function(object, propertyName, propertyValue) {
                        Object.defineProperty(object, propertyName, {
                            configurable:   false,
                            enumerable:     true,
                            writable:       false,
                            value:          propertyValue
                        });
                        return object;
                    };
                    // Test definition
                    var test = result({}, "testProp", false);
                    // Test access and value
                    if (typeof test.testProp === 'undefined' || test.testProp !== false) {
                        throw new Error("Property definition failed");
                    }
                    // Looks OK.
                    return result;
                }
            } catch (e) {
                // Use polyfill fallback.
            }

            return function(object, propertyName, propertyValue) {
                // This is not read-only, but the platform does not support it.
                object[propertyName] = propertyValue;
                return object;
            };
        }());

        return defineReadOnlyProperty({}, 'defineReadOnlyProperty', defineReadOnlyProperty);
    }());

    /**
     * @private
     */
    solace.TopicUtil = (function() {
        var obj = {
            toSafeChars: function(topic) {
                topic = topic.replace(/[^a-zA-Z0-9_\/.]/g, "");
                return topic;
            },
            validateTopic: function(topicName) {
                // return null if valid, return error msg on invalid
                /*
                 * TRB topics can contain any utf-8 character and must be <= 250 bytes
                 * in length.
                 * '*', if present in a level, must be the last character in that level.
                 * May not have empty levels.
                 */
                if (typeof topicName !== "string") {
                    return "topicName must be a string.";
                }
                var length = topicName.length;
                if (length < 1) {
                    return "Topic too short (must be >= 1 character).";
                } else if (length > 250) {
                    return "Topic too long (must be <= 250 characters).";
                }
                for (var i = 0; i < length; i++) {
                    var curChar = topicName.charAt(i);
                    if (curChar === "/") {
                        if (i === 0 || i === (length - 1) || topicName.charAt(i - 1) === "/") {
                            return "Topic has empty level.";
                        }
                    } else if (curChar === "*" && (i < length - 1)) {
                        // must not have something other than '/' to the right
                        if (topicName.charAt(i + 1) !== "/") {
                            return "Topic has illegal wildcard.";
                        }
                    }
                }
                return null;
            },
            isWildcarded: function(topicName) {
                var len = topicName.length;
                if (topicName === ">") {
                    return true;
                } else if (len >= 2 &&
                        topicName.charAt(len - 2) === "/" &&
                        topicName.charAt(len - 1) === ">") {
                    return true;
                } else if (topicName.indexOf("*", 0) !== -1) {
                    return true;
                }
                return false;
            }
        };
        return obj;
    }());

    /**
     * @private
     * @singleton
     * @type {*}
     */
    solace.EnumUtil = (function() {
        return {
            /**
             * Returns the name of an namespaced value given the
             * namespace and the value.
             * @param instance The namespace instance.
             * @param value The value for which to return the name.
             */
            name: function(instance, value) {
                for (var key in instance) {
                    if (instance.hasOwnProperty(key)) {
                        if (value === instance[key]) {
                            return key;
                        }
                    }
                }
                return null;
            }
        };
    }());

    /**
     * @private
     * @class
     * This class is used to efficiently concatenate strings.
     * @constructor
     * @param {...*} varargs
     */
    solace.StringBuffer = function(varargs) {
        this.buffer = [];
        if (arguments.length === 1) {
            this.buffer.push(arguments[0]);
        }
    };

    solace.StringBuffer.prototype.append = function(string) {
        if (typeof string !== "undefined") {
            this.buffer.push(string);
        }
        return this;
    };

    solace.StringBuffer.prototype.toString = function() {
        return this.buffer.join("");
    };

    /**
     * @private
     * @type {StringUtil}
     */
    solace.StringUtil = (function StringUtil(){
        var PAD_LEFT = 0;
        var PAD_RIGHT = 1;

        function padLeftRight(str, minLen, padSide, padChar) {
            if (typeof str === "string") {
                if (str.length < minLen) {
                    var c = " ";
                    if (typeof padChar === "string" && padChar.length === 1) {
                        c = padChar;
                    }
                    var StringBuffer = solace.StringBuffer;
                    var buf = new StringBuffer();
                    for (var i = 0; i < (minLen - str.length); i++) {
                        buf.append(c);
                    }
                    switch (padSide) {
                        case PAD_LEFT:
                            return buf.toString() + str;
                        case PAD_RIGHT:
                            return str + buf.toString();
                        default:
                            return str;
                    }
                }
            }
            return str;
        }

        return {
            padLeft: function(str, minLen, padChar) {
                return padLeftRight(str, minLen, PAD_LEFT, padChar);
            },

            padRight: function(str, minLen, padChar) {
                return padLeftRight(str, minLen, PAD_RIGHT, padChar);
            },

            notEmpty: function(str) {
                return (typeof str !== "undefined" && str !== null && str.length > 0);
            },

            formatDumpBytes: function(data, showDecode, leftPadding) {
                if (!this.notEmpty(data)) {
                    return null;
                }
                var output = [], curr_ascii = [], curr_line = [];
                var lineBytes = 0;
                var ascii_offset = 54;
                var lu_print = (function() {
                    var tmp = [];
                    for (var c = 0; c < 256; c++) {
                        tmp[c] = (c < 33 || c > 126) ? "." : String.fromCharCode(c);
                    }
                    return tmp;
                }());

                for (var i = 0, dataLen = data.length; i < dataLen; i++) {
                    var ccode = data.charCodeAt(i);
                    curr_line.push(this.padLeft(ccode.toString(16), 2, "0"));
                    curr_line.push(" ");
                    curr_ascii.push(lu_print[ccode] || ".");
                    lineBytes++;

                    if (lineBytes === 8) {
                        curr_line.push("   ");
                    }
                    if (lineBytes === 16 || i === data.length -1) {
                        if (leftPadding > 0) {
                            output.push(this.padRight("", leftPadding, " "));
                        }
                        output.push(this.padRight(curr_line.join(""), ascii_offset, " "));
                        if (showDecode) {
                            output.push(curr_ascii.join(""));
                        }
                        output.push("\n");
                        curr_line = [];
                        curr_ascii = [];
                        lineBytes = 0;
                    }
                }
                return output.join("");
            }

        };
    }());

    /**
     * Returns the API version. Use version, date and mode properties for build details.
     * Use the summary property or the .toString() method to return a summary.
     * @singleton
     * @type {Version}
     */
    solace.Version = (function Version() {
        var obj = {};
        solace.ObjectUtil.defineReadOnlyProperty(obj, 'version', '7.1.0.17');
        solace.ObjectUtil.defineReadOnlyProperty(obj, 'date', '20150120-2201');
        solace.ObjectUtil.defineReadOnlyProperty(obj, 'mode', 'Debug');
        solace.ObjectUtil.defineReadOnlyProperty(obj, 'summary', ['SolclientJS', obj.version, obj.mode, obj.date].join(', '));
        solace.ObjectUtil.defineReadOnlyProperty(obj, 'toString', function() {
            return obj.summary;
        });
        return obj;
    }());

}(solace));
//
// 
// 
//
//
/*global solace:true,window,global,escape,unescape,WebSocket,ArrayBuffer,Uint8Array,WebSocket,QUnit,SOLACE_LOG_FATAL,SOLACE_LOG_ERROR,SOLACE_LOG_WARN,SOLACE_LOG_INFO,SOLACE_LOG_DEBUG,SOLACE_LOG_TRACE */
var detected_console = (
    (typeof this.global !== 'undefined') && this.global ?
        this.global.console :
        (typeof this.window !== 'undefined') && this.window ?
            (
                (typeof this.window.console !== 'undefined') ?
                this.window.console :
                null
            ) :
            null
    );
(function(solace, console) {
    /**
     * @namespace solace Defines an error subcode enumeration which is returned as a property of
     * the errors/exceptions thrown by the API.
     *
     * <h4>General Login Failure Subcodes</h4>
     * The following subcodes can apply to error responses resulting from
     * failed login attempts. As a login attempt failure can result from every session
     * operation that communicates with the appliance; they are listed here to avoid
     * repetition.
     * <ul>
     * <li>{@link solace.ErrorSubcode.CLIENT_NAME_INVALID}
     * <li>{@link solace.ErrorSubcode.CLIENT_NAME_ALREADY_IN_USE}
     * <li>{@link solace.ErrorSubcode.LOGIN_FAILURE}
     * <li>{@link solace.ErrorSubcode.CLIENT_USERNAME_IS_SHUTDOWN}
     * <li>{@link solace.ErrorSubcode.DYNAMIC_CLIENTS_NOT_ALLOWED}
     * <li>{@link solace.ErrorSubcode.CLIENT_ACL_DENIED}
     * <li>{@link solace.ErrorSubcode.INVALID_VIRTUAL_ADDRESS}
     * <li>{@link solace.ErrorSubcode.MESSAGE_VPN_NOT_ALLOWED}
     * <li>{@link solace.ErrorSubcode.MESSAGE_VPN_UNAVAILABLE}
     * <li>{@link solace.ErrorSubcode.CLIENT_DELETE_IN_PROGRESS}
     * <li>{@link solace.ErrorSubcode.TOO_MANY_CLIENTS}
     * </ul>
     */
    solace.ErrorSubcode = {
        // SESSION
        /**
         * @constant
         * @description Errors that do not have a proper subcode.
         *
         */
        UNKNOWN_ERROR: 999,
        /**
         * @constant
         * @description The session is already connected.
         */
        //SESSION_ALREADY_CONNECTED: 1,
        /**
         * @constant
         * @description The session is not connected.
         */
        SESSION_NOT_CONNECTED: 2,
        /**
         * @constant
         * @description The performed session operation is invalid given the state
         * of the session.
         */
        INVALID_SESSION_OPERATION: 3,
        /**
         * @constant
         * @description An API call failed due to a timeout.
         */
        TIMEOUT: 4,

        // MESSAGE VPN
        /**
         * @constant
         * @description The Message VPN name configured for the session is not configured to allow access for
         * the session's username. (Cause: 403 Message VPN Not Allowed)
         */
        MESSAGE_VPN_NOT_ALLOWED: 5,
        /**
         * @constant
         * @description The Message VPN name set for the session (or the default VPN if none
         * was set) is currently shutdown on the appliance. (Cause: 503 Message VPN Unavailable)
         */
        MESSAGE_VPN_UNAVAILABLE: 6,

        // CLIENT
        /**
         * @constant
         * @description The username for the client is administratively shutdown
         * on the appliance. (Cause: 403 Client Username Is Shutdown)
         */
        CLIENT_USERNAME_IS_SHUTDOWN: 7,
        /**
         * @constant
         * @description The username for the session has not been set and dynamic
         * clients are not allowed. (Cause: 403 Dynamic Clients Not Allowed)
         */
        DYNAMIC_CLIENTS_NOT_ALLOWED: 8,
        /**
         * @constant
         * @description The session is attempting to use a client name that is 
		 * in use by another client, and the appliance is configured to reject the
		 * new session. 
		 * A client name cannot be used by multiple clients in the same Message 
		 * VPN. (Cause: 403 Client Name Already In Use)
         */
        CLIENT_NAME_ALREADY_IN_USE: 9,
        /**
         * @constant
         * @description The client name chosen has been rejected as invalid by the appliance.
         * (Cause: 400 Client Name Parse Error)
         */
        CLIENT_NAME_INVALID: 10,
        /**
         * @constant
         * @description The client login is not currently possible because a previous
         * instance of same client was being deleted. (Cause: 503 Subscriber Delete In
	     * Progress)
         */
        CLIENT_DELETE_IN_PROGRESS: 11,
        /**
         * @constant
         * @description The client login is not currently possible because the maximum
         * number of active clients on appliance has already been reached.
         * (Cause: 503 Too Many Clients, 503 Too Many Publishers, 503 Too Many Subscribers)
         */
        TOO_MANY_CLIENTS: 12,
        /**
         * @constant
         * @description The client could not log into the appliance. (Cause: 401, 404 error codes)
         */
        LOGIN_FAILURE: 13,

        // VRID
        /**
         * @constant
         * @description An attempt was made to connect to the wrong IP address on
         * the appliance (must use CVRID if configured), or the appliance CVRID has
         * changed and this was detected on reconnect. (Cause: 403 Invalid Virtual Router Address)
         */
        INVALID_VIRTUAL_ADDRESS: 14,

        // ACL
        /**
         * @constant
         * @description The client login to the appliance was denied because the
         * IP address/netmask combination used for the client is designated in the
         * ACL (Access Control List) profile associated with that client. (Cause: 403 Forbidden)
         */
        CLIENT_ACL_DENIED: 15,
        /**
         * @constant
         * @description Adding a subscription was denied because it matched a
         * subscription that was defined as denied on the ACL (Access Control List) profile associated with the client.
         * (Cause: 403 Subscription ACL Denied)
         */
        SUBSCRIPTION_ACL_DENIED: 16,
        /**
         * @constant
         * @description A message could not be published because its topic matched
         * a topic defined as denied on the ACL (Access Control List) profile associated with the client. (Cause: 403 Publish ACL Denied)
         */
        PUBLISH_ACL_DENIED: 17,

        // VALIDATION
        /**
         * @constant
         * @description An API call was made with an out-of-range parameter.
         */
        PARAMETER_OUT_OF_RANGE: 18,
        
        /**
         * @constant
         * @description An API call was made with a parameter combination
         * that is not valid.
         */
        PARAMETER_CONFLICT: 19,

        /**
         * @constant
         * @description An API call was made with a parameter of incorrect type.
         */
        PARAMETER_INVALID_TYPE: 20,

        // FATAL ERRORS
        /**
         * @constant
         * @description  An API call had an internal error (not an application fault).
         */
        INTERNAL_ERROR: 21,
        /**
         * @constant
         * @description An API call failed due to insufficient space in the transport buffer to accept more data.
         */
        INSUFFICIENT_SPACE: 22,
        /**
         * @constant
         * @description An API call failed due to lack of resources. (Cause: 400 Not Enough Space)
         */
        OUT_OF_RESOURCES: 23,
        /**
         * @constant
         * @description An API call failed due to a protocol error with the appliance
         * (not an application fault).
         */
        PROTOCOL_ERROR: 24,
        /**
         * @constant
         * @description An API call failed due to a communication error.
         */
        COMMUNICATION_ERROR: 25,

        // KEEP ALIVE
        /**
         * @constant
         * @description The session keep-alive detected a failed session.
         */
        KEEP_ALIVE_FAILURE: 26,

        // MESSAGE RELATED
        /**
         * @constant
         * @description An attempt was made to use a topic which is longer
         * than the maximum that is supported.
         */
        //TOPIC_TOO_LARGE: 27,
        /**
         * @constant
         * @description A send call was made that did not have a topic in a mode
         * where one is required (for example, client mode).
         */
        TOPIC_MISSING: 28,
//        /**
//         * @constant
//         * @description  An attempt was made to send a message with a total
//         * size greater than that supported by the protocol. (???)
//         */
//        MAX_TOTAL_MSGSIZE_EXCEEDED: 29,
        /**
         * @constant
         * @description An attempt was made to send a message with user data larger
         * than the maximum that is supported.
         */
        //USER_DATA_TOO_LARGE: 30,
        /**
         * @constant
         * @description An attempt was made to use a topic which has a syntax that
         * is not supported. (Cause: 400 Topic Parse Error)
         */
        INVALID_TOPIC_SYNTAX: 31,
        /**
         * @constant
         * @description The client attempted to send a message larger than that
         * supported by the appliance. (Cause: 400 Document Is Too Large, 400 Message Too Long)
         */
        MESSAGE_TOO_LARGE: 32,
        /**
         * @constant
         * @description The appliance could not parse an XML message. (Cause: 400 XML Parse Error)
         */
        XML_PARSE_ERROR: 33,

        // SUBSCRIPTIONS
        /**
         * @constant
         * @description The client attempted to add a subscription that already
         * exists. This subcode is only returned if the session property
         * 'IgnoreDuplicateSubscription' is not enabled. (Cause: 400
	     * Already Exists, 400 Subscription Already Exists)
         */
        SUBSCRIPTION_ALREADY_PRESENT: 34,
        /**
         * @constant
         * @description The client attempted to remove a subscription which did not exist.
         * This subcode is only returned if the session property 'IgnoreDuplicateSubscription' is not enabled.
         * (Cause: 400 Not Found, 400 Subscription Not Found)
         */
        SUBSCRIPTION_NOT_FOUND: 35,
        /**
         * @constant
         * @description The client attempted to add/remove a subscription that
         * is not valid. (Cause: 400 Not Supported, 400 Parse Error, 400 Subscription Parse Error)
         */
        SUBSCRIPTION_INVALID: 36,
        /**
         * @constant
         * @description The appliance rejected a subscription add or remove request
         * for a reason not separately enumerated.
         */
        SUBSCRIPTION_ERROR_OTHER: 37,
        /**
         * @constant
         * @description The client attempted to add a subscription that
         * exceeded the maximum number allowed. (Cause: 400 Max Num Subscriptions Exceeded)
         */
        SUBSCRIPTION_TOO_MANY: 38,
        /**
         * @constant
         * @description  The client attempted to add a subscription which already
         * exists but it has different properties.
         * (Cause: 400 Subscription Attributes Conflict With Existing Subscription)
         */
        SUBSCRIPTION_ATTRIBUTES_CONFLICT: 39,

        /**
         * @constant
         * @description The client attempted to establish a session with No Local
         * enabled and the capability is not supported by the appliance.
         */
        NO_LOCAL_NOT_SUPPORTED: 40,

        // UNKNOWN ERRORS
        /**
         * @constant
         * @description The appliance rejected a control message for another reason
         * not separately enumerated.
         */
        //CONTROL_ERROR_OTHER: 41,
        /**
         * @constant
         * @description The appliance rejected a data message for another reason
         * not separately enumerated.
         */
        DATA_ERROR_OTHER: 42,

        // TRANSPORT ERRORS
        /**
         * @constant
         * @description Failed to create the HTTP connection.
         */
        CREATE_XHR_FAILED: 43,
        /**
         * @constant
         * @description Failed to create the HTTP transport.
         */
        INTERNAL_CONNECTION_ERROR: 44,
        /**
         * @constant
         * @description Failed to decode the HTTP reply.
         */
        DATA_DECODE_ERROR: 45,
        /**
         * @constant
         * @description The session was inactive for too long.
         */
        INACTIVITY_TIMEOUT: 46,
        /**
         * @constant
         * @description The appliance does not know this session's identifier.
         */
        UNKNOWN_TRANSPORT_SESSION_ID: 47,
        /**
         * @constant
         * @description Assisted Delivery messages (with a delivery mode other than DIRECT) are not supported.
         */
        AD_MESSAGING_NOT_SUPPORTED: 48,

        /**
         * @constant
         * @description Creating the WebSocket transport failed.
         */
        CREATE_WEBSOCKET_FAILED: 49,

        /**
         * @constant
         * @description The appliance to connect to is in replication standby.
         */
        REPLICATION_IS_STANDBY: 50
    };

    /**
     * Defines the possible TransportSessionEvent codes.
     * @private
     */
    solace.TransportSessionEventCode = {
        // Raised when TransportSession is up and ready to send/receive data
        UP_NOTICE: 1,

        // Raised if the session is destroyed
        DESTROYED_NOTICE: 2,

        // Raised on entry to the transport session waiting for create response state
        CONNECTING: 3,

        // Raised when the send queue had reached its maximum, but now has space again
        CAN_ACCEPT_DATA: 4,

        // Raised when there is a decode error on received data.  The app should destroy the session
        DATA_DECODE_ERROR: 5,

        // Raised when there is a decode error on received data.  The app should destroy the session
        PARSE_FAILURE: 6,

        // There was an error on the appliance connection that has caused the session to fail
        CONNECTION_ERROR: 7,

        // Notify token received (for resetting KeepAlive)
        NOTIFY_GOT_TOKEN: 8
    };
    
    /**
     * @namespace
     * An attribute of solace.SessionEvent. This enumeration represents the
     * different events emitted by {@link solace.Session} through the session event
     * callback.
     *
     * When a session is no longer in a usable state, the API tears down the underlying
     * connection and notifies the application with one of the following session event codes:
     * <ul>
     * <li>{@link solace.SessionEventCode.DOWN_ERROR}
     * <li>{@link solace.SessionEventCode.CONNECT_FAILED_ERROR}
     * <li>{@link solace.SessionEventCode.REQUEST_TIMEOUT}
     * <li>{@link solace.SessionEventCode.REAPPLY_SUBSCRIPTION_ERROR}
     * <li>{@link solace.SessionEventCode.LOGIN_FAILURE}
     * <li>{@link solace.SessionEventCode.P2P_SUB_ERROR}
     * <li>{@link solace.SessionEventCode.PARSE_FAILURE}
     * <li>{@link solace.SessionEventCode.DATA_DECODE_ERROR}
     * <li>{@link solace.SessionEventCode.KEEP_ALIVE_ERROR}
     * <li>{@link solace.SessionEventCode.INTERNAL_ERROR}
     * </ul>
     *
     * The client application receives a session event with event code {@link solace.SessionEventCode.DISCONNECTED}
     * when the underlying connection is successfully closed, or closed as a result of a communication error. It is recommended that upon receiving
     * the above listed events, the client application should call {@link solace.Session#disconnect} to properly
     * close the session or call {@link solace.Session#dispose} to release all the resources referenced by the
     * session.
     * <p>
     * When a connection is disconnected, any queued data waiting in the output buffer is cleared.
     */
    solace.SessionEventCode = {
        /**
         * Raised when the Session is ready to send/receive messages
         * and perform control operations.
         *
         * At this point the transport session is up, the Session
         * has logged in and added the P2PInbox subscription.
         *
         * @constant
         * @description The session is established.
         */
        UP_NOTICE: 1,
        /**
         * Raised when the underlying connection is down.
         *
         * @constant
         * @description The session was established and then went down
         */
        DOWN_ERROR: 2,
        /**
         * @constant
         * @description  The session attempted to connect but was unsuccessful.
         */
        CONNECT_FAILED_ERROR: 3,
        /**
         * @Constant
         * @description  Raised when connect() was called on the Session to establish transport session.
         *
         */
        CONNECTING: 4,
        /**
         * @constant
         * @description The appliance rejected a published message.
         */
        REJECTED_MESSAGE_ERROR: 5,
        /**
         * @constant
         * @description The appliance rejected a subscription (add or remove).
         */
        SUBSCRIPTION_ERROR: 6,
        /**
         * @constant
         * @description The subscribe or unsubscribe operation succeeded.
         */
        SUBSCRIPTION_OK: 7,
        /**
         * @constant
         * @description The appliance's Virtual Router Name changed during a reconnect operation.
         */
        VIRTUALROUTER_NAME_CHANGED: 8,
        /**
         * @constant
         * @description Raised when a request is aborted because the session is being disconnected.
         */
        REQUEST_ABORTED: 9,
        /**
         * @constant
         * @description The event represents a timed-out request API call.
         */
        REQUEST_TIMEOUT: 10,
        /**
         * @constant
         * @description The event represents a successful update of a mutable session property.
         */
        PROPERTY_UPDATE_OK: 11,
        /**
         * @constant
         * @description The event represents a failed update of a mutable session property.
         */
        PROPERTY_UPDATE_ERROR: 12,
        /**
         * @constant
         * @description Raised when failure occurred while applying subscriptions.
         */
        REAPPLY_SUBSCRIPTION_ERROR: 13,
        /**
         * @constant
         * @description Raised when underlying transport can accept data again.
         */
        CAN_ACCEPT_DATA: 14,
        /**
         * @Constant
         * @description Raised when the session's connect operation fails, or the session was once up, is now disconnected.
         */
        DISCONNECTED: 15,
        /**
         * @constant
         * @description Raised when a login fails.
         */
        LOGIN_FAILURE: 16,
        /**
         * @constant
         * @description Raised when P2P registration fails.
         */
        P2P_SUB_ERROR: 17,
        /**
         * @constant
         * @description Raised when incoming data cannot be parsed properly.
         */
        PARSE_FAILURE: 18,
        /**
         * @constant
         * @description Raised when decoding incoming data fails.
         */
        DATA_DECODE_ERROR: 19,
        /**
         * @constant
         * @description Raised when failure occurred while sending keep alive.
         */
        KEEP_ALIVE_ERROR: 20,
        /**
         * @constant
         * @description Raised when there is an internal API error.
         */
        INTERNAL_ERROR: 21
    };

    /**
     * Session Event Code description
     * @private
     */
    solace.SessionEventCodeDescription = (function(){
        var descriptions = [];
        var index;
        for (index in solace.SessionEventCode) {
            if (solace.SessionEventCode.hasOwnProperty(index)) {
                descriptions[solace.SessionEventCode[index]] = index;
            }
        }
        return descriptions;
    }());


    /**
     * Session state description.
     * @private
     */
    solace.InternalSessionStateDescription = (function() {
        var descriptions = [];
        descriptions[0] = "NEW";
        descriptions[1] = "DISCONNECTED";
        descriptions[2] = "WAITING_FOR_TRANSPORT_UP";
        descriptions[3] = "TRANSPORT_SESSION_UP";
        descriptions[4] = "WAITING_FOR_LOGIN";
        descriptions[5] = "LOGIN_COMPLETE";
        descriptions[6] = "WAITING_FOR_P2PINBOX_REG";
        descriptions[7] = "P2PINBOX_REG_COMPLETE";
        descriptions[8] = "CONNECTED";
        descriptions[9] = "SESSION_ERROR";
        descriptions[10] = "DISCONNECTING";
        descriptions[11] = "REAPPLYING_SUBSCRIPTIONS";
        return descriptions;
    }());

    /**
     * Session operation description.
     * @private
     */
    solace.SessionOperationDescription = (function() {
        var descriptions = [];
        descriptions[0] = "CONNECT";
        descriptions[1] = "DISCONNECT";
        descriptions[2] = "LOGIN";
        descriptions[3] = "P2PINBOXREG";
        descriptions[4] = "CTRL";
        descriptions[5] = "SEND";
        descriptions[6] = "REAPPLY_SUBSCRIPTIONS";
        descriptions[7] = "QUERY_OPERATION";

        return descriptions;
    }());

     /**
     * Transport return code description.
     * @private
     */
    solace.TransportReturnCodeDescription = (function() {
        var descriptions = [];
        descriptions[0] = "OK";
        descriptions[1] = "FAIL";
        descriptions[2] = "NO_SPACE";
        descriptions[3] = "DATA_DECODE_ERROR";
        descriptions[4] = "INVALID_STATE_FOR_OPERATION";
        descriptions[5] = "CONNECTION_ERROR";

        return descriptions;
    }());

    /**
     * @namespace solace.SessionState Enumeration of possible session states.
     */
    solace.SessionState = {
        /**
         * @constant
         * @description
         * The session is new and never connected.
         */
        NEW:                0,
        /**
         * @constant
         * @description
         * The session is connecting.
         */
        CONNECTING:         1,
        /**
         * @constant
         * @description
         * The session is connected.
         */
        CONNECTED:          2,
        /**
         * @constant
         * @description
         * The session experienced an error.
         */
        SESSION_ERROR:      3,
        /**
         * @constant
         * @description
         * The session is disconnecting.
         */
        DISCONNECTING:      4,
        /**
         * @constant
         * @description
         * The session is disconnected.
         */
        DISCONNECTED:       5
    };

    /**
     * @namespace solace.TransportProtocol
     * Connection scheme types referenced by {@link solace.SessionProperties#transportProtocol} and
     * {@link solace.SessionProperties#transportProtocolInUse}.
     */
    solace.TransportProtocol = {
        
        /**
         * A COMET model that uses base64 payload encoding. HTTP responses have a defined Content-Length.
         */
        HTTP_BASE64: "HTTP_BASE64",

        /**
         * A COMET model that uses binary payload encoding. HTTP responses have a defined Content-Length.
         */
        HTTP_BINARY: "HTTP_BINARY",

        /**
         * A COMET model that uses binary payload encoding. HTTP responses use Chunked Transfer-Encoding
         * to stream data from the appliance to the client without needing to terminate the HTTP response.
         */
        HTTP_BINARY_STREAMING: "HTTP_BINARY_STREAMING",

        /**
         * A WebSocket communication channel uses binary payload encoding and provides full-duplex
         * communication between the client and the appliance over a single TCP connection.
         */
        WS_BINARY: "WS_BINARY"
        
    };

    /**
     * Enum of transport families supported
     * @private
     *
     */
    solace.TransportFamily = {
        /**
         * @private
         * @constant
         * Clear text over HTTP protocol
         */
        HTTP: "HTTP",
        /**
         * @private
         * @constant
         * Encrypted text over HTTP protocol using SSL
         */
        HTTPS: "HTTPS",
        /**
         * @private
         * @constant
         * Unencrypted binary data via WebSocket protocol
         */
        WS: "WS",
        /**
         * @private
         * @constant
         * TLS-encrypted binary data via WebSocket protocol
         */
        WSS: "WSS"
    };

    /* ===========================================================================
     * Exceptions/Errors
     * ============================================================================
     */
    /**
     * @class NotImplementedError An error thrown when calling an API that has not been implemented.
     *
     * @param {string} message
     */
    solace.NotImplementedError = function NotImplementedError(message) {
        this.name = "NotImplementedError";
        this.message = (message || "");
    };
    solace.NotImplementedError.prototype = new Error();
    solace.NotImplementedError.prototype.toString = function() {
        var buf = new solace.StringBuffer(this.name);
        buf.append(": ");
        buf.append("message=").append(this.message||"");
        return buf.toString();
    };

    /**
     * @class OperationError An error thrown by the API when an operational error is encountered.
     *
     * @param {string} message
     * @param {solace.ErrorSubcode} subcode
     * @param {Object=} reason Embedded error or exception (optional)
     */
    solace.OperationError = function (message, subcode, reason) {
        this.name = "OperationError";
        this.message = (message || "");
        this.subcode = subcode;
        this.reason = reason;
    };
    solace.OperationError.prototype = new Error();
    solace.OperationError.prototype.toString = function() {
        var buf = new solace.StringBuffer();
        buf.append(this.name).append(": ");
        if (this.name === "OperationError") {
            buf.append("message=").append(this.message||"").append(", ");
            buf.append("subcode=").append(this.subcode||"").append(", ");
            buf.append("reason=").append(this.reason||"");
        }
        else {
            buf.append("message=").append(this.message||"");
        }
        return buf.toString();
    };


    /**
     * @class
     * An error thrown when an error occurs on the transport session.
     * <p>
     * Applications are not expected to instantiate this type.
     *
     * @param {string} message
     * @param {solace.ErrorSubcode} subcode
     */
    solace.TransportError = function TransportError(message, subcode) {
        this.name = "TransportError";
        this.message = (message || "");
        this.subcode = subcode;
    };
    solace.TransportError.prototype = new Error();
    solace.TransportError.prototype.toString = function() {
        var buf = new solace.StringBuffer(this.name);
        buf.append(": ");
        if (this.name === "TransportError") {
            buf.append("message=").append(this.message||"").append(", ");
            buf.append("subcode=").append(this.subcode||"");
        }
        else {
             buf.append("message=").append(this.message||"");
        }
        return buf.toString();
    };

    /**
     * @class
     * Represents a session properties object. Passed in to
     * {@link solace.SolclientFactory.createSession()} when creating a Session instance.
     */
    solace.SessionProperties = function SessionProperties() {
        // Credentials
        /**
         * @property {string}
         * @description  The url of the messaging service to connect to.
         * <li>Default: empty string </li>
         * <li><strong>Note:</strong> cross-domain restrictions should be taken into consideration
         * when deploying web applications with messaging capabilities (see the API User Guide for more information).</li>
         */
        this.url = "";
        /**
         * @property {string}
         * @description The password required for authentication.
         * <li> Default: empty string </li>
         */
        this.password = "";
        /**
         * @property {string}
         * @description  The client username required for authentication.
         * <li> Default: empty string </li>
         */
        this.userName = "";
        /**
         * @property {string}
         * @description The session client name that is used during client login
         * (appliance running SolOS-TR) to create a unique session.
         * <p>
         * An empty string causes a unique client name to be generated
         * automatically.
         * </p>
         * If specified, it must be a valid Topic name,
         * and a maximum of 160 bytes in length.
         * This property is also used to uniquely identify the sender in
         * a message's senderId field if {@link solace.SessionProperties#includeSenderId}
         * is set.
         * <li> Default: empty string </li>
         */
        this.clientName = "";
        /**
         * @property {string}
         * @description A string that uniquely describes the application instance.
         * <li> Default: If left blank, the API will generate a description string using the current user-agent string.</li>
         */
        this.applicationDescription = "";
        /**
         * @property {string}
         * @description The Message VPN name that the client is requesting for
         * this session.
         * <li> Default: empty string </li>
         */
        this.vpnName = "";
        /**
         * @property {string}
         * @description A read-only session property that indicates which Message
         * VPN the session is connected to.
         * When not connected, or when not in client mode,
         * an empty string is returned.
         * <li> Default: empty string </li>
         */
        this.vpnNameInUse = "";
        /**
         * @property {string}
         * @description A read-only property that indicates the connected appliance's
         * virtual router name.
         * <li> Default: empty string </li>
         */
        this.virtualRouterName = "";

        // Connection Strategies
        /**
         * @property {Number}
         * @description The timeout period (in milliseconds) for a connect
         * operation to a given host.
         * <li> Default: 30000 </li>
         * <li> The valid range is > 0. </li>
         */
        this.connectTimeoutInMsecs = 30000;

        /**
         * @property {Number}
         * @description The timeout period (in milliseconds) for a reply to
         * come back from the appliance. This timeout serves as the default
         * request timeout for {@link solace.Session#subscribe},
         * {@link solace.Session#unsubscribe}, {@link solace.Session#updateProperty}.
         * <li> Default: 10000 </li>
         * <li> The valid range is > 0. </li>
         */
        this.readTimeoutInMsecs = 10000;

        /**
         * @property {Number}
         * @description The maximum buffer size for the transport session. This size must be bigger than the largest message an
         * application intends to send on the session.
         * <li> Default: 64K </li>
         * <li> The valid range is > 0. </li>
         * <p>
         * The session buffer size configured using the sendBufferMaxSize
         * session property controls SolClient buffering of transmit messages. When
         * sending small messages, the session buffer size should be set to multiple times
         * the typical message size to improve the performance. Regardless of the buffer
         * size, SolClient always accepts at least one message to transmit. So even if a
         * single message exceeds sendBufferMaxSize, it is accepted and
         * transmitted as long as the current buffered data is zero. However no more
         * messages are accepted until the amount of data buffered is reduced
         * enough to allow room below sendBufferMaxSize.
         * </p>
         */
        this.sendBufferMaxSize = 64 * 1024;

        /**
         * @property {Number}
         * @description The maximum payload size (in bytes) when sending data using the Web
         * transport protocol.  Large messages may fail to be sent to the Solace appliance when the
         * maximum web payload is set to a small value. To avoid this, use a large maximum
         * web payload.
         * <li> Default: 1MB </li>
         * <li> The valid range is >= 100. </li>
         */
        this.maxWebPayload = 1024*1024;

        /**
         * @private
         * @property {Number}
         * @description When WebSocket transport protocol is used, SolClient uses this property and
         * {@link solace.SessionProperties.maxWebPayload} throttle the publishing rate in order to 
         * avoid network saturation.
         * <li> Default: 100 </li>
         * <li> The valid range is >=4. </li>
         */
        this.bufferedAmountQueryIntervalInMsecs = 100;

        // Timestamps
        /**
         * @property {boolean}
         * @description When enabled, a send timestamp is automatically included
         * (if not already present) in the Solace-defined fields for
         * each message sent.
         * <li> Default: false </li>
         */
        this.generateSendTimestamps = false;
        /**
         * @property {boolean}
         * @description When enabled, a receive timestamp is recorded for
         * each message and passed to the session's message callback receive handler.
         * <li> Default: false </li>
         */
        this.generateReceiveTimestamps = false;
        /**
         * @property {boolean}
         * @description When enabled, a sender ID is automatically included
         * (if not already present) in the Solace-defined fields for each message
         * sent.
         * <li> Default: false </li>
         */
        this.includeSenderId = false;

        // Keep Alive
        /**
         * @property {Number}
         * @description The amount of time (in milliseconds) to wait between sending
		 * out keep-alive messages to the appliance.
         * <li>The valid range is >= 100.</li>
         * <li> Default: 3000 </li>
         */
        this.keepAliveIntervalInMsecs = 3000;
        /**
         * @property {Number}
         * @description The maximum number of consecutive Keep-Alive messages that
		 * can be sent without receiving a response before the session is declared down
		 * and the connection is closed by the API.
         * <li>The valid range is >= 3.</li>
         * <li> Default: 3 </li>
         */
        this.keepAliveIntervalsLimit = 3;

        // P2P Inbox
        /**
         * @property {string}
         * @description A read-only string that indicates the default
         * reply-to destination used for any request messages sent from this session.
         * See {@link solace.Session#sendRequest}.
         * This parameter is only valid when the session is connected.
         * <li> Default: empty string </li>
         */
        this.p2pInboxInUse = "";

        /**
         * @private
         * @description A read-only information string that stores the P2P topic subscription
         * obtained from the appliance.
         * This parameter is only valid when the session is connected.
         * <li> Default: empty string </li>
         */
        this.p2pInboxBase = "";
        /**
         * @property {string}
         * @description A read-only string providing information
         * about the application, such as the name of operating system
         * that is running the application.
         * <li> Default: empty string</li>
         */
        this.userIdentification = "";

        // Sequence Numbers
        /**
         * @property {boolean}
         * @description When enabled, a sequence number is automatically
         * included (if not already present) in the Solace-defined fields
         * for each message sent.
         * <li> Default: false </li>
         */
        this.generateSequenceNumber = false;

        // Subscriptions
        /**
         * @property {Number}
         * @description Subscriber priorities are used by the appliance to distribute messages that have the {@link solace.Message#setDeliverToOne} flag
         * set to true. These messages are sent to the subscriber with the
         * highest priority.
         * Subscribers have two priorities; this priority is for messages
         * published locally.
         * <li> The valid range is 1..4 </li>
         * <li> Default: 1 </li>
         */
        this.subscriberLocalPriority = 1;
        /**
         * @property {Number}
         * @description Subscriber priorities are used by the appliance to distribute messages that have the {@link solace.Message#setDeliverToOne} flag
         * set to true. These messages are sent to the subscriber with the
         * highest priority.
         * Subscribers have two priorities; this priority is
         * for messages published on appliances other than the one that the client
         * is connected to.
         * <li> The valid range is 1..4 </li>
         * <li> Default: 1 </li>
         */
        this.subscriberNetworkPriority = 1;
        /**
         * @property {boolean}
         * @description Used to ignore duplicate subscription errors on subscribe.
         * <li> Default: true </li>
         */
        this.ignoreDuplicateSubscriptionError = true;
        /**
         * @property {boolean}
         * @description Used to ignore subscription not found errors on unsubscribe.
         * <li> Default: true </li>
         */
        this.ignoreSubscriptionNotFoundError = true;
        /**
         * @property {boolean}
         * @description Set to 'true' to have the API remember subscriptions and
         * reapply them upon calling session connect {@link solace.Session#connect} on a disconnected session.
         * <li> Default: false </li>
         */
        this.reapplySubscriptions = false;

        // ================== Transport configuration ========================

        /**
         * @property {boolean}
         * @description Set to 'true' to signal the appliance that messages published
         * on the session should
         * not be received on the same session even if the client has a subscription
         * that matches the published topic. If this restriction is requested, and the
         * appliance does not have No Local support, the session connect will fail.
         * <li> Default: false </li>
         */
        this.noLocal = false;

        /**
         * @property {solace.TransportProtocol}
         * @description The transport protocol that will initially be selected by the session for
         * its connection attempt. If this protocol fails, the session will attempt other
         * protocols in accordance with its transport protocol connect policy.
         */
        this.transportProtocol = null;

        /**
         * @property {solace.TranportProtocol}
         * @description The transport protocol that is currently being used by the session for its
         * current connection or connection attempt. To determine which transport protocol
         * was successfully used by the API, interrogate this property after the session
         * event UP_NOTICE is dispatched.
         */
        this.transportProtocolInUse = null;

        /**
         * @property {Number}
         * @description The timeout, in milliseconds, that must elapse before the session will abandon
         * a connection attempt with the current transport protocol, and begin a new connection
         * attempt with a downgraded transport protocol. If no remaining downgrades exist, the
         * session will continue the current connection attempt until the connection timeout
         * expires.
         * <li> Default: 10000 </li>
         * <li> The valid range is > 0. </li>
         */
        this.transportDowngradeTimeoutInMsecs = 10000;

        /**
         * @private
         * @property {string}
         * @description Transport content-type override
         */
        this.transportContentType = "text/plain";
    };

    solace.SessionProperties.prototype.toString = function() {
        var result = new solace.StringBuffer("\n");
        var first = true;
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                if (key === "password") {
                    continue;
                }
                if (first) {
                    result.append(" {")
                            .append(key)
                            .append(", ")
                            .append(this[key])
                            .append("}");
                    first = false;
                }
                else {
                    result.append(",\n ")
                            .append("{")
                            .append(key)
                            .append(", ")
                            .append(this[key])
                            .append(" }");
                }
            }

        }
        return result.toString();
    };

    solace.SessionProperties.prototype.clone = function() {
        var copy = new solace.SessionProperties();
        for (var p in this) {
            if (this.hasOwnProperty(p)) {
                copy[p] = this[p];
            }
        }
        return copy;
    };

    solace.SessionProperties.prototype.sol_validate = function() {
        // validating properties
        var prop_this = this;

        function isDefined(name) {
            return (typeof prop_this[name] !== "undefined" &&
                    prop_this[name] !== null &&
                    (typeof prop_this[name] !== "string" || prop_this[name].length > 0));
        }

        function val_not_empty(name) {
            if (typeof prop_this[name] === "undefined" || prop_this[name] === null || prop_this[name] === "") {
                throw new solace.OperationError("SessionProperties validation: Property '" + name + "' cannot be empty.", solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE);
            }
        }

        function val_length(name, max) {
            if (isDefined(name) && typeof prop_this[name] === "string" && prop_this[name].length > max) {
                throw new solace.OperationError("SessionProperties validation: Property '" + name + "' exceeded max length " + max, solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE);
            }
        }

        function val_range(name, min, max) {
            if (isDefined(name) && typeof prop_this[name] === "number" && (prop_this[name] < min || prop_this[name] > max)) {
                throw new solace.OperationError("SessionProperties validation: Property '" + name + "' out of range [" + min + "; " + max + "].", solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE);
            }
        }

        function val_type(name, type) {
            if (isDefined(name) && typeof prop_this[name] !== type) {
                throw new solace.OperationError("SessionProperties validation: Property '" + name + "' should be type " + type, solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
            }
        }

        function val_clientname(name) {
            if (isDefined(name) && typeof prop_this[name] === "string") {
                var ret = solace.smf.ClientCtrlMessage.validateClientName(prop_this[name]);
                if (ret) {
                    throw new solace.OperationError("SessionProperties validation: Property '" + name + "' :" + ret, solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE);
                }
            }
        }

        function val_is_member(name, enumName, allowNull) {
            var val = prop_this[name];
            if ((solace.EnumUtil.name(solace[enumName], val) === null) && !(allowNull && val === null)) {
                throw new solace.OperationError("SessionProperties validation: Property '" + name + "' must be a member of solace." + enumName);
            }
        }

        function process_validator(name, var_args) {
            for (var i = 1, argLen = arguments.length; i < argLen; i++) {
                var check = arguments[i];
                switch (check.length) {
                    case 1:
                        check[0](name);
                        break;
                    case 2:
                        check[0](name, check[1]);
                        break;
                    case 3:
                        check[0](name, check[1], check[2]);
                        break;
                }
            }
        }

        // Validation rules: same as JCSMP
        process_validator("url", [val_not_empty], [val_type, "string"]);
        process_validator("userName", [val_not_empty], [val_type, "string"], [val_length, 32]);
        process_validator("password", [val_type, "string"], [val_length, 128]);
        process_validator("clientName", [val_type, "string"], [val_length, 160], [val_clientname]);
        process_validator("applicationDescription", [val_type, "string"], [val_length, 254]);
        process_validator("vpnName", [val_type, "string"], [val_length, 32]);
        process_validator("connectTimeoutInMsecs", [val_type, "number"], [val_range, 1, Number.MAX_VALUE]);
        process_validator("readTimeoutInMsecs", [val_type, "number"], [val_range, 1, Number.MAX_VALUE]);
        process_validator("sendBufferMaxSize", [val_type, "number"], [val_range, 1, Number.MAX_VALUE]);
        process_validator("maxWebPayload", [val_type, "number"], [val_range, 100, Number.MAX_VALUE]);
        process_validator("bufferedAmountQueryIntervalInMsecs", [val_type, "number"], [val_range, 4, Number.MAX_VALUE]);
        process_validator("generateSendTimestamps", [val_type, "boolean"]);
        process_validator("generateReceiveTimestamps", [val_type, "boolean"]);
        process_validator("includeSenderId", [val_type, "boolean"]);
        process_validator("keepAliveIntervalInMsecs", [val_type, "number"], [val_range, 100, Number.MAX_VALUE]);
        process_validator("keepAliveIntervalsLimit", [val_type, "number"], [val_range, 3, Number.MAX_VALUE]);
        process_validator("generateSequenceNumber", [val_type, "boolean"]);
        process_validator("subscriberLocalPriority", [val_type, "number"], [val_range, 1, 4]);
        process_validator("subscriberNetworkPriority", [val_type, "number"], [val_range, 1, 4]);
        process_validator("ignoreDuplicateSubscriptionError", [val_type, "boolean"]);
        process_validator("ignoreSubscriptionNotFoundError", [val_type, "boolean"]);
        process_validator("reapplySubscriptions", [val_type, "boolean"]);
        process_validator("noLocal", [val_type, "boolean"]);
        process_validator("transportProtocol", [val_is_member, "TransportProtocol", true]);
        process_validator("transportDowngradeTimeoutInMsecs", [val_type, "number"], [val_range, 1, Number.MAX_VALUE]);
    };

    /**
     * @class
     * Encapsulates the session's message receive callback function and
     * an optional user-specified object.
     * <br>
     * This class is passed to {@link solace.SolclientFactory.createSession} when creating a session.
     *
     * @param {function(solace.Session, solace.Message, Object, Object)} messageRxCBFunction invoked by the API when
     * a message is received over the session. The prototype of this function is the
     * following: ({@link solace.Session}, {@link solace.Message},
     * userObject {Object}, RFUObject {Object})
     *
     * @param {Object} userObject An optional user-specified object passed on
     * every message receive callback.
     */
    solace.MessageRxCBInfo = function MessageRxCBInfo(messageRxCBFunction, userObject) {
        /**
         * @property {function}
         * @description The prototype of this function is the
         * following: ({@link solace.Session}, {@link solace.Message},
         * userObject {Object}, RFUObject {Object})
         */
        this.messageRxCBFunction = messageRxCBFunction;
        /**
         * @property {Object}
         * @description user-specified object
         */
        this.userObject = userObject;
    };

    /**
     * @class
     * Encapsulates the session's event callback function and
     * an optional user-specified object.
     * <br>
     * This class is passed to {@link solace.SolclientFactory.createSession} when creating a session.
     *
     * @param {function(solace.Session, solace.SessionEvent, Object, Object)} sessionEventCBFunction
	 * invoked by the Messaging API when a session event occurs. The prototype
	 * of this function is the following: ({@link solace.Session},
     * {@link solace.SessionEvent},
     *  userObject {Object},
     *  RFUObject {Object})
     *
     * @param {Object} userObject An optional user-specified object passed on
     * every session event callback.
     */
    solace.SessionEventCBInfo = function SessionEventCBInfo(sessionEventCBFunction, userObject) {
        /**
         * @property {Object}
         * @description user-specified object
         */
        this.userObject = userObject;
        /**
         * @property {function}
         * @description The prototype of this function is the
         * following: ({@link solace.Session},
         * {@link solace.SessionEvent},
         *  userObject {Object},
         *  RFUObject {Object})
         */
        this.sessionEventCBFunction = sessionEventCBFunction;
    };

    /**
     * @class
     * Represents a session event; events are passed to the application-provided
     * event handling callback provided when creating the session.
     *
     * @param {solace.SessionEventCode} sessionEventCode
     * @param {string} infoStr
     * @param {number} responseCode
     * @param {solace.ErrorSubcode} errorSubCode (optional)
     * @param {Object} correlationKey
     * @param {string} reason (optional)
     */
    solace.SessionEvent =
            function SessionEvent(sessionEventCode, infoStr, responseCode, errorSubCode, correlationKey, reason) {
                /**
                 * @property {solace.SessionEventCode}
                 * @description further qualifies the session event. Defined in
                 * {@link solace.SessionEventCode}.
                 */
                this.sessionEventCode = sessionEventCode;
                /**
                 * @property {string}
                 * @description if applicable, an information string returned by the appliance
                 */
                this.infoStr = infoStr;
                /**
                 * @property {Number}
                 * @description if applicable, a response code returned by the appliance
                 */
                this.responseCode = responseCode;
                /**
                 * @property {solace.ErrorSubcode}
                 * @description if applicable, an error subcode
                 */
                this.errorSubCode = errorSubCode;
                /**
                 * @property {Object}
                 * @description A user-specified object
                 * made available in the response or confirmation event by including it as a
                 * parameter in the orignal API call.  If the user did not specify a
                 * correlationKey, it will be <code>null</code>.
                 */
                this.correlationKey = correlationKey;
                /**
                 * @property {string}
                 * @description Additional information if it is applicable.
                 */
                this.reason = reason; // optional
            };

    solace.SessionEvent.prototype.toString = function () {
        var buf = new solace.StringBuffer("Session event: ");
        buf.append("sessionEventCode=").append(solace.SessionEventCodeDescription[this.sessionEventCode]).append(", ");
        buf.append("infoStr=").append(this.infoStr||"").append(", ");
        buf.append("responseCode=").append(this.responseCode||"").append(", ");
        buf.append("errorSubCode=").append(this.errorSubCode||"").append(", ");
        buf.append("correlationKey=").append(this.correlationKey||"").append(", ");
        buf.append("reason=(").append(this.reason||"").append(")");
        return buf.toString();
    };

    /**
     * @namespace DestinationType Represents the destination type enumeration.
     */
    solace.DestinationType = {
        /**
         * A topic destination, which is an identifier for Solace appliance topics and topic subscriptions.
         * @constant
         */
        TOPIC: 0
    };

    /**
     * Destination type description
     * @private
     */
    solace.DestinationTypeDescription = (function(){
        var descriptions = [];
        var index;
        for (index in solace.DestinationType) {
            if (solace.DestinationType.hasOwnProperty(index)) {
                descriptions[solace.DestinationType[index]] = index;
            }
        }
        return descriptions;
    }());

    /**
     * @class
     * Represents a message destination. The only supported destination type
     * is {@link solace.Topic}.
     * @param {string} name
     * @param {solace.DestinationType} destinationType (reserved for future, defaults to {@link solace.DestinationType.TOPIC})
     * @constructor
     */
    solace.Destination = function Destination(name, destinationType) {
        /**
         * @private
         * @type string
         */
        this.m_name = name;
        /**
         * @private
         * @type solace.DestinationType
         */
        this.m_type = solace.DestinationType.TOPIC;
        /**
         * @private
         * @type boolean
         */
        this.m_temporary = false;
    };

    /**
     * @return true, if the destination is temporary.
     */
    solace.Destination.prototype.isTemporary = function() {
        return this.m_temporary;
    };

    /**
     * @return {solace.DestinationType}
     */
    solace.Destination.prototype.getType = function () {
        return this.m_type;
    };

    /**
     * @return {string} The destination name specified at creation time.
     */
    solace.Destination.prototype.getName = function() {
        return this.m_name;
    };

    solace.Destination.prototype.toString = function() {
        return this.getName() || "[object Destination]";
    };

	/**
     * @class
     * Represents a Topic, which is a type of Destination.
     * <p>
     * Instances should be acquired through {@link solace.SolclientFactory.createTopic}.
     */
    solace.Topic = function Topic(topicName) {
        /**
         * @private
         * @property {string}
         */
        this.m_name = topicName;
        /**
         * @private
         */
        this.m_type = solace.DestinationType.TOPIC;
        /**
         * @private
         */
        this.m_temporary = false;
    };

    solace.Topic.prototype = new solace.Destination();
    solace.Topic.prototype.getKey = function() {
        return this.m_name;
    };


    /**
     * @namespace Defines the status of a message as it relates to an existing
     * cache session. A message delivered to an application as a result of a
     * cache request will have a MessageCacheStatus that is not
     * {@link solace.MessageCacheStatus.LIVE}.
     */
    solace.MessageCacheStatus = {

        /**
         * @constant
         * @description
         * The message is live.
         */
        LIVE:       0,

        /**
         * @constant
         * @description
         * The message is cached.
         */
        CACHED:     1,

        /**
         * @constant
         * @description
         * The message is cached and is deemed suspect.
         */
        SUSPECT:    2

    };

    /**
     * Represents a message.
     * <p>
     * Applications are not expected to instantiate this class; use {@link solace.SolclientFactory.createMessage}.
     * @constructor
     */
    solace.Message = function() {

        ///////////////////////////////////////////////////////////////////////////
        // In SMF
        ///////////////////////////////////////////////////////////////////////////
        this.m_binaryAttachment = null;
        this.m_xmlContent = null;
        this.m_xmlMetadata = null;
        this.m_userData = null;
        this.m_binaryMetaChunk = null;
        this.m_discardIndication = false;
        this.m_elidingEligible = false;
        this.m_redelivered = false;
        this.m_deliveryMode = solace.MessageDeliveryModeType.DIRECT;
        this.m_deliverToOne = false;
        // Destination
        this.m_destination = null; // of type Destination
        // Cos
        this.m_userCos = solace.MessageUserCosType.COS1; // of type MessageUserCosType

        ///////////////////////////////////////////////////////////////////////////
        // In binary Meta part of the message
        ///////////////////////////////////////////////////////////////////////////

        // ace-defined message headers
        this.m_applicationMessageId = null;
        this.m_applicationMessageType = null;

        // Request/Reply
        this.m_correlationId = null;
        this.m_replyMessage = false;
        this.m_replyTo = null; // of type Destination
        // Sender
        this.m_senderId = null;
        this.m_senderTimestamp = null;
        this.m_autoSenderTimestamp = false;
        // Sequence Number
        this.m_sequenceNumber = null;
        this.m_autoSequenceNumber = false;
        // User property map
        this.m_userPropertyMap = null;
        // Structured SDT container
        this.m_structuredContainer = null;

        ///////////////////////////////////////////////////////////////////////////
        // Message attribute
        ///////////////////////////////////////////////////////////////////////////
        this.m_receiverTimestamp = null;

        // The type of the message based on the preamble
        this.m_messageType = solace.MessageType.BINARY;

        ///////////////////////////////////////////////////////////////////////////
        // Cache attributes
        ///////////////////////////////////////////////////////////////////////////
        this.m_cacheStatus = solace.MessageCacheStatus.LIVE;
        this.m_cacheRequestId = null;

        this.m_smfHeader = null; // SMF header object
    };

    /**
     * Gets the structured payload type of the message. A message has a structured payload if one
     * was attached via {@link solace.Message#setSdtContainer}.
     *
     * @return {solace.MessageType} the structured payload type, BINARY is the default if none is set.
     */
    solace.Message.prototype.getType = function() {
        return this.m_messageType;
    };

    /**
     * Sets the application-provided message ID.
     * @param {string} value
     */
    solace.Message.prototype.setApplicationMessageId = function(value) {
        if (value !== null && typeof value !== "string") {
            throw new solace.OperationError(
                    "Invalid message parameter, expected string.",
                    solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        this.m_applicationMessageId = value;
    };

    /**
     * Gets the application-provided message ID.
     * @return {string}
     */
    solace.Message.prototype.getApplicationMessageId = function() {
        return this.m_applicationMessageId;
    };

    /**
     * Sets the application message type. This value is used by applications
	 * only, and is passed through the API untouched.
     * @param {string} value The application message type.
     */
    solace.Message.prototype.setApplicationMessageType = function(value) {
        if (value !== null && typeof value !== "string") {
            throw new solace.OperationError(
                    "Invalid message parameter, expected string.",
                    solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        this.m_applicationMessageType = value;
    };

    /**
     * Gets the application message type. This value is used by applications
	 * only, and is passed through the API untouched.
	 * @return {string} The application message type. If not present, <code>null</code>
	 * is returned.
     */
    solace.Message.prototype.getApplicationMessageType = function() {
        return this.m_applicationMessageType;
    };

    /**
     * Gets the binary attachment part of the message. The binary attachment
     * is returned as a string, wherein each character has a code in the range
     * 0-255 representing the value of a single received byte at that position.
     * 
     * @return {string} A string representing the binary attachment. If not present,
     * <code>null</code> is returned.
     */
    solace.Message.prototype.getBinaryAttachment = function() {
        return this.m_binaryAttachment;
    };

    /**
     * Sets the binary attachment part of the message. The binary attachment
     * must be a string, wherein each character has a code in the range 0-255
     * representing exactly one byte in the attachment.
     *
     * @param {string} value Sets the binary attachment part of the message.
     */
    solace.Message.prototype.setBinaryAttachment = function(value) {
        if (value !== null && typeof value !== "string") {
            throw new solace.OperationError(
                    "Invalid message parameter, expected string.",
                    solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        this.m_binaryAttachment = value;
    };

    /**
     * Gets the request ID set in the cache request.
     *
     * @return {number|null} The request ID of the cache request associated with this,
     * message, or null if this message is not associated with a cache request.
     */
    solace.Message.prototype.getCacheRequestId = function() {
        return this.m_cacheRequestId;
    };

    /**
     * @private
     * @param {number} cacheRequestID
     */
    solace.Message.prototype.setCacheRequestID = function(cacheRequestID) {
        this.m_cacheRequestId = cacheRequestID;
    };

    /**
     * Gets the correlation ID. The correlation ID is used for correlating 
	 * a request to a reply.
	 * @return {string} The correlation ID associated with the message, 
	 * or <code>null</code>, if unset.
     */
    solace.Message.prototype.getCorrelationId = function() {
        return this.m_correlationId;
    };

    /**
     * Sets the correlation ID. The correlation ID is used for correlating 
	 * a request to a reply.
     * @param {string} value The correlation ID to associate with the message.
     */
    solace.Message.prototype.setCorrelationId = function(value) {
        if (value !== null && typeof value !== "string") {
            throw new solace.OperationError(
                    "Invalid message parameter, expected string.",
                    solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        this.m_correlationId = value;
    };

    /**
     * Sets whether the message is configured for delivering to one client only.
     * @param {boolean} value whether the message is configured for delivering to one client only.
     */
    solace.Message.prototype.setDeliverToOne = function(value) {
        this.m_deliverToOne = value;
    };

    /**
     * Gets whether the message is configured for delivering to one client only.
	 * @return {boolean} indicates whether the message is configured for delivering to one client only.
     */
    solace.Message.prototype.isDeliverToOne = function() {
        return this.m_deliverToOne;
    };

    /**
	 * Gets the delivery mode of the message.
     * @return {solace.MessageDeliveryModeType} representing the delivery mode of the message. 
     */
    solace.Message.prototype.getDeliveryMode = function() {
        return this.m_deliveryMode;
    };

    /**
     * Sets the delivery mode of the message.
     * @param {solace.MessageDeliveryModeType} value The message delivery mode.
     */
    solace.Message.prototype.setDeliveryMode = function(value) {
        this.m_deliveryMode = value;
    };

    /**
     * Gets the destination to which the message was published.
	 * @return {solace.Destination} The destination to which a message was published.
     */
    solace.Message.prototype.getDestination = function() {
        return this.m_destination;
    };

    /**
     * Sets the destination (topic) to publish the message to.
     * @param {solace.Destination} value The destination to publish the message to.
     */
    solace.Message.prototype.setDestination = function(value) {
        this.m_destination = value;
    };

    /**
     * Indicates whether one or more messages have been discarded prior 
	 * to the current message. This indicates congestion discards only and 
	 * is not affected by message eliding. 
	 * @return {boolean} Returns true if one or more messages have been 
	 * discarded prior to the current message; otherwise, it returns false. 
     */
    solace.Message.prototype.isDiscardIndication = function() {
        return this.m_discardIndication;
    };

    /**
     * @private
     * @param {boolean} value 
     */
    solace.Message.prototype.setDiscardIndication = function(value) {
        this.m_discardIndication = value;
    };

    /**
     * Returns whether the message is eligible for eliding.
     * <p>
	 * Message eliding enables filtering of data to avoid transmitting 
	 * every single update to a subscribing client.
     * <p>
     * This property does not indicate whether the message was elided.
     *
     * @return {boolean} indicates whether the message is eligible for eliding.
     */
    solace.Message.prototype.isElidingEligible = function() {
        return this.m_elidingEligible;
    };

    /**
     * Sets whether the message is eligible for eliding.
     * <p>
	 * Message eliding enables filtering of data to avoid transmitting
	 * every single update to a subscribing client.
     * <p>
     * This property does not indicate whether the message was elided.
     *
     * @param {boolean} value sets whether the message is eligible for eliding.
	 */
    solace.Message.prototype.setElidingEligible = function(value) {
        this.m_elidingEligible = value;
    };

    /**
     * Gets the cache status of this message.
     *
     * @return {solace.MessageCacheStatus} The cache status of this message. The status
     * will be solace.MessageCacheStatus.LIVE unless the message was returned in a
     * reply to a cache request.
     */
    solace.Message.prototype.getCacheStatus = function() {
        return this.m_cacheStatus;
    };

    /**
     * @private
     * @param cacheStatus {solace.MessageCacheStatus}
     */
    solace.Message.prototype.setCacheStatus = function(cacheStatus) {
        this.m_cacheStatus = cacheStatus;
    };

    /**
     * Returns whether the message's reply field is set, indicating 
	 * that this message is a reply.
	 * @return {boolean} Indicates the state of the reply field.
     */
    solace.Message.prototype.isReplyMessage = function() {
        return this.m_replyMessage;
    };

    /**
     * Indicates whether the message has been marked as redelivered by the appliance.
     * @return {boolean} Indicates whether the redelivered flag is set.
     */
    solace.Message.prototype.isRedelivered = function() {
        return this.m_redelivered;
    };

    /**
     * Sets the <i>reply</i> field of the message.
     * @param {boolean} value Sets whether to flag the message as a reply.
     */
    solace.Message.prototype.setAsReplyMessage = function(value) {
        this.m_replyMessage = value;
    };

    /**
     * Gets the receive timestamp (in milliseconds, from midnight, January 1, 1970 UTC). 
	 * @return {number} The receive timestamp; returns 0, if unset.
     */
    solace.Message.prototype.getReceiverTimestamp = function() {
        return this.m_receiverTimestamp;
    };

    /**
     * Gets the replyTo destination 
	 * @return {solace.Destination} The value of the replyTo destination.
     */
    solace.Message.prototype.getReplyTo = function() {
        return this.m_replyTo;
    };

    /**
     * Sets the replyTo destination 
     * @param {solace.Destination} value The replyTo destination.
     */
    solace.Message.prototype.setReplyTo = function(value) {
        this.m_replyTo = value;
    };

    /**
     * Returns the Sender's ID.
	 * @return {string} The Sender's ID; <code>null</code>, if it is not set.
     */
    solace.Message.prototype.getSenderId = function() {
        return this.m_senderId;
    };

    /**
     * Sets the Sender ID for the message
     * @param {string} value The Sender ID for the message.
     */
    solace.Message.prototype.setSenderId = function(value) {
        if (value !== null && typeof value !== "string") {
            throw new solace.OperationError(
                    "Invalid message parameter, expected string.",
                    solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        this.m_senderId = value;
    };

    /**
     * Gets the send timestamp (in milliseconds, from midnight, January 1, 
	 * 1970 UTC).
	 * @return {number} The send timestamp. <code>null</code>, if it was not set on send.
     */
    solace.Message.prototype.getSenderTimestamp = function() {
        return this.m_senderTimestamp;
    };

    /**
     * Sets the send timestamp (in milliseconds, from midnight, January 1, 
	 * 1970 UTC). This field can be set automatically during message 
	 * publishing, but existing values are not overwritten if non-null, 
	 * as when a message is sent multiple times. 
     * @param {number} value The value to set as the send timestamp.
     */
    solace.Message.prototype.setSenderTimestamp = function(value) {
        this.m_senderTimestamp = value;
    };

    /**
     * Gets the sequence number.
     * <p>
     * This is an application-defined field, see <code>setSequenceNumber()</code>.
	 * @return {number} The sequence number; <code>null</code> if it was not set on send.
     */
    solace.Message.prototype.getSequenceNumber = function() {
        return this.m_sequenceNumber;
    };

    /**
     * Sets the application-defined sequence number.
     * @param {number} value The sequence number.
     */
    solace.Message.prototype.setSequenceNumber = function(value) {
        this.m_sequenceNumber = value;
        this.m_autoSequenceNumber = false;
    };

    /**
     * Gets the Class of Service (CoS) value for the message.
	 * @return {solace.MessageUserCosType} The COS value.
     */
    solace.Message.prototype.getUserCos = function() {
        return this.m_userCos;
    };

    /**
     * Sets the Class of Service (CoS) value for the message.
     * @param {solace.MessageUserCosType} value The COS value.
     */
    solace.Message.prototype.setUserCos = function(value) {
        this.m_userCos = value;
    };

    /**
     * Gets the user data part of the message.
	 * @return {string} The user data part of the message. Returns <code>null</code> if not present.
     */
    solace.Message.prototype.getUserData = function() {
        return this.m_userData;
    };

    /**
     * Sets the user data part of the message.
     * @param {string} value The user data part of the message.
     */
    solace.Message.prototype.setUserData = function(value) {
        if (value !== null && typeof value !== "string") {
            throw new solace.OperationError(
                    "Invalid message parameter, expected string.",
                    solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        this.m_userData = value;
    };

    /**
     * Gets the XML content part of the message.
	 * @return {string} The XML content part of the message. Returns <code>null</code> if not present.
     */
    solace.Message.prototype.getXmlContent = function() {
        return this.m_xmlContent;
    };

    /**
     * Sets the XML content part of the message.
     * @param {string} value The XML content part of the message. 
     */
    solace.Message.prototype.setXmlContent = function(value) {
        if (value !== null && typeof value !== "string") {
            throw new solace.OperationError(
                    "Invalid message parameter, expected string.",
                    solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        this.m_xmlContent = value;
    };

    /**
     * Sets the message's XML metadata section.
     * @param {string} value The XML metadata.
     */
    solace.Message.prototype.setXmlMetadata = function(value) {
        if (value !== null && typeof value !== "string") {
            throw new solace.OperationError(
                    "Invalid message parameter, expected string.",
                    solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        this.m_xmlMetadata = value;
    };

    /**
     * Gets the message's XML metadata section.
     * @return string The XML metadata.
     */
    solace.Message.prototype.getXmlMetadata = function() {
        return this.m_xmlMetadata;
    };

    /**
     * @private
     */
    solace.Message.prototype.getBinaryMetadataChunk = function() {
        return this.m_binaryMetaChunk;
    };

    /**
     * @private
     */
    solace.Message.prototype.setBinaryMetadataChunk = function(meta) {
        this.m_binaryMetaChunk = meta;
    };

    /**
     * @private
     */
    solace.Message.prototype.getSmfHeader = function() {
        return this.m_smfHeader;
    };

    /**
     * @private
     */
    solace.Message.prototype.setHasAutoSequenceNumber = function(value) {
        this.m_autoSequenceNumber = value;
    };

    /**
     * @private
     */
    solace.Message.prototype.hasAutoSequenceNumber = function() {
        return this.m_autoSequenceNumber;
    };

    /**
     * @private
     */
    solace.Message.prototype.setHasAutoSenderTimestamp = function(value) {
        this.m_autoSenderTimestamp = value;
    };

    /**
     * @private
     */
    solace.Message.prototype.hasAutoSenderTimestamp = function() {
        return this.m_autoSenderTimestamp;
    };

    /**
     * Gets the user properties map carried in the message.
	 * @return {solace.SDTMapContainer} The user properties map.
     */
    solace.Message.prototype.getUserPropertyMap = function() {
        return this.m_userPropertyMap;
    };

    /**
     * Allows users to specify their own user properties to be carried 
	 * in the message separate from the payload.
     * @param {solace.SDTMapContainer} value The user properties map.
     */
    solace.Message.prototype.setUserPropertyMap = function(value) {
        this.m_userPropertyMap = value;
    };

    /**
     * Makes this message a strutured data message by assigning it a 
	 * structured data type (SDT) container payload
     * (such as a {@link solace.SDTMapContainer} or 
	 * {@link solace.SDTStreamContainer} or a string), which
     * is transported in the binary attachment field.
     * <p>
     * Assigning a SDT container updates the
     * message's Type property to the appropriate value.
     * <p>
     * The container argument must be a {@link solace.SDTField} with a type
     * of {@link solace.SDTFieldType.MAP}, {@link solace.SDTFieldType.STREAM},
     * or {@link solace.SDTFieldType.STRING}.
     *
     * @param {solace.SDTField} container The SDTField container to send in this message.
     */
    solace.Message.prototype.setSdtContainer = function(container) {
        if (container === null) {
            // clear
            this.m_structuredContainer = null;
            this.m_messageType = solace.MessageType.BINARY;
            this.setBinaryAttachment(null);
            return;
        }

        solace.Util.checkParamInstanceOf(container, solace.SDTField, "solace.SDTField");
        var p_sdtType = container.getType();
        switch (p_sdtType) {
            case solace.SDTFieldType.MAP:
                this.m_messageType = solace.MessageType.MAP;
                break;
            case solace.SDTFieldType.STREAM:
                this.m_messageType = solace.MessageType.STREAM;
                break;
            case solace.SDTFieldType.STRING:
                this.m_messageType = solace.MessageType.TEXT;
                break;
            default:
                throw new solace.OperationError(
                        "Invalid parameter, SDTField Type of MAP, STREAM, or STRING.",
                        solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        this.m_structuredContainer = container;
    };

    /**
     * Gets the message's structured data container, if this is a structured data message.
     *
     * @return A {@link solace.SDTField} with a payload of either string, {@link solace.SDTMapContainer}, or {@link solace.SDTStreamContainer} if one was set in the message; <code>null</code>, otherwise.
     */
    solace.Message.prototype.getSdtContainer = function() {
        var msgType = this.getType();
        if ((msgType === solace.MessageType.MAP ||
                msgType === solace.MessageType.STREAM ||
                msgType === solace.MessageType.TEXT) &&
                (this.getBinaryAttachment() !== null) && (this.getBinaryAttachment().length > 0)) {
            var sdtField = null;
            if (! (sdtField = solace.sdt.Codec.parseSdt(this.getBinaryAttachment(), 0))) {
                SOLACE_LOG_DEBUG("getStdContainer return null, reason: sdtField=" + sdtField);
                return null;
            }
            // cache structured container for later access
            this.m_structuredContainer = sdtField;
            return sdtField;
        }
        SOLACE_LOG_DEBUG("getStdContainer return null, reason: msgType=" + msgType + ", or binaryAttchment empty, len=" +
                ((this.getBinaryAttachment() !== null)?this.getBinaryAttachment().length:"null"));
        return null;
    };

    /**
     * Produces a human-readable dump of the message's properties
     * contents. Applications must not parse the output, as its format is
     * undefined.
     *
     * <p>
     * Output can be controlled by the <code>flags</code> parameter. The values are:
     * <ul>
     * <li>{@link solace.MessageDumpFlag.MSGDUMP_BRIEF}
     * <li>{@link solace.MessageDumpFlag.MSGDUMP_FULL}
     * </ul>
     * </p>
     *
     * @param flags Flags controlling the output, such as whether to include verbose (binary dump) information
     * @return  A string representation of the message, to be used for debugging.
     */
    solace.Message.prototype.dump = function (flags) {
        if (typeof flags === "undefined") {
            return solace.MessageDumpUtil.dump(this, solace.MessageDumpFlag.MSGDUMP_FULL);
        }
        else if (typeof flags !== "undefined" && flags !== null && typeof flags === "number") {
            if (flags === solace.MessageDumpFlag.MSGDUMP_BRIEF || flags === solace.MessageDumpFlag.MSGDUMP_FULL) {
                return solace.MessageDumpUtil.dump(this, flags);
            }
            else {
                throw new solace.OperationError("Invalid parameter value for dump flags.",
                        solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE);
            }
        }
        else {
            throw new solace.OperationError("Invalid parameter type for dump flags.", solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
    };

    /**
     * @namespace Represents an enumeration of user Class of Service (COS) levels.
     * Applicable to DIRECT messages only.
     */
    solace.MessageUserCosType = {
        /**
         * Direct Messages, USER COS 1 (Lowest priority).
         * @constant
         */
        COS1: 0,
        /**
         * Direct Messages, USER COS 2.
         * @constant
         */
        COS2: 1,
        /**
         * Direct Messages, USER COS 3 (Highest priority).
         * @constant
         */
        COS3: 2
    };

    /**
     * @private
     */
    solace.MessageUserCosTypeDescription = (function (){
        var description = [];
        description[solace.MessageUserCosType.COS1] = "COS1";
        description[solace.MessageUserCosType.COS2] = "COS2";
        description[solace.MessageUserCosType.COS3] = "COS3";
        return description;
    }());

    /**
     * @namespace Represents an enumeration of message types.
     * <p>
     * A message may contain unstructured byte data, or a structured container.
     */
    solace.MessageType = {
        /**
         * Binary message (unstructured bytes stored in the binary attachment message part).
         * @constant
         */
        BINARY: 0,
        /**
         * Structured map message.
         * @constant
         */
        MAP: 1,
        /**
         * Structured stream message.
         * @constant
         */
        STREAM: 2,
        /**
         * Structured text message.
         * @constant
         */
        TEXT: 3
    };

    /**
     * @private
     */
    solace.MessageTypeDescription = (function(){
        var description = [];
        description[solace.MessageType.BINARY] = "Binary";
        description[solace.MessageType.MAP] = "Map";
        description[solace.MessageType.STREAM] = "Stream";
        description[solace.MessageType.TEXT] = "Text";
        return description;
    }());

    /**
     * @namespace Represents an enumeration of message delivery modes.
     * <p>
     * <strong>Note:</strong> this API only supports sending messages with <code>DIRECT</code> delivery.
     */
    solace.MessageDeliveryModeType = {
        /**
         * This mode provides at-most-once message delivery. Direct messages have
         * the following characteristics:
         * <ul>
         * <li>They are not retained for clients that are not connected to a Solace appliance.
         * <li>They can be discarded when congestion or system failures are encountered.
         * <li>They can be reordered in the event of network topology changes.
         * </ul>
         * Direct messages are most appropriate for messaging applications that require very
         * high-rate or very low-latency message transmission. Direct Messaging enables
         * applications to efficiently publish messages to a large number of clients
         * with matching subscriptions.
         * @constant
         */
        DIRECT: 0,
        /**
         * (Unsupported) This mode provides once-and-only-once message delivery.
         * @constant
         */
        PERSISTENT: 1,
        /**
         * (Unsupported) This mode provides once-and-only-once message delivery.
         * @constant
         */
        NON_PERSISTENT: 2
    };

        /**
     * @private
     */
    solace.MessageDeliveryModeTypeDescription = (function(){
        var description = [];
        description[solace.MessageDeliveryModeType.DIRECT] = "DIRECT";
        description[solace.MessageDeliveryModeType.PERSISTENT] = "PERSISTENT";
        description[solace.MessageDeliveryModeType.NON_PERSISTENT] = "NON_PERSISTENT";

        return description;
    }());

    /**
     * @namespace Represents an enumeration of session properties that can be modified.
     * These correspond to session properties in {@link solace.SessionProperties}.
     */
    solace.MutableSessionProperty = {
        /**
         * @constant
         */
        CLIENT_NAME: 1,
        /**
         * @constant
         */
        CLIENT_DESCRIPTION: 2
    };

    /**
     * @namespace Represents an enumeration of message dump format. It controls
     * the output of {@link solace.Message#dump()}.
     */
    solace.MessageDumpFlag = {
        /**
         * Display only the length of the binary attachment, XML content and user property maps.
         * @constant
         */
        MSGDUMP_BRIEF: 0,
        /**
         * Display the entire message contents.
         * @constant
         */
        MSGDUMP_FULL: 1
    };

    /** ===========================================================================
     * Stats
     * ============================================================================
     */

    /**
     * @namespace
     * Session Statistics for sent/received messages and control operations.
     */
    solace.StatType = {
        /**
         * Count of bytes sent as part of data messages.
         * @constant
         */
        TX_TOTAL_DATA_BYTES: 0,
        
        /**
         * Count of data messages sent.
         * @constant
         */
        TX_TOTAL_DATA_MSGS: 1,

        /**
         * Count of bytes sent as part of direct data messages.
         * @constant
         */
        TX_DIRECT_BYTES: 2,

        /**
         * Count of direct data messages sent.
         * @constant
         */
        TX_DIRECT_MSGS: 3,

        /**
         * Count of bytes sent as part of control messages.
         * @constant
         */
        TX_CONTROL_BYTES: 4,

        /**
         * Count of control messages sent.
         * @constant
         */
        TX_CONTROL_MSGS: 5,

        /**
         * Count of request messages sent.
         * @constant
         */
        TX_REQUEST_SENT: 6,

        /**
         * Count of request timeouts that occurred.
         * @constant
         */
        TX_REQUEST_TIMEOUT: 7,


        /**
         * Count of bytes received as part of data messages.
         * @constant
         */
        RX_TOTAL_DATA_BYTES: 8,

        /**
         * Count of data messages received.
         * @constant
         */
        RX_TOTAL_DATA_MSGS: 9,

        /**
         * Count of bytes received as part of direct data messages.
         * @constant
         */
        RX_DIRECT_BYTES: 10,

        /**
         * Count of direct data messages received.
         * @constant
         */
        RX_DIRECT_MSGS: 11,

        /**
         * Count of bytes received as part of control messages.
         * @constant
         */
        RX_CONTROL_BYTES: 12,

        /**
         * Count of control messages received.
         * @constant
         */
        RX_CONTROL_MSGS: 13,

        /**
         * Count discard message indications received on incoming messages.
         * @constant
         */
        RX_DISCARD_MSG_INDICATION: 14,

        /**
         * Count of reply messaged received.
         * @constant
         */
        RX_REPLY_MSG_RECVED: 15,

        /**
         * Count of received reply messages that were discarded.
         * @constant
         */
        RX_REPLY_MSG_DISCARD: 16,

        /**
         * @constant
         * @description
         * Count of messages discarded due to the presence of an unknown element or
         * unknown protocol in the SMF header.
         */
        RX_DISCARD_SMF_UNKNOWN_ELEMENT: 17,

        /**
         * @constant
         * @description
         * Count of cache requests sent. One conceptual request (i.e. one API call)
         * may involve many requests and replies.
         */
        CACHE_REQUEST_SENT:             18,

        /**
         * @constant
         * @description
         * Count of OK responses to cache requests.
         */
        CACHE_REQUEST_OK_RESPONSE:      19,

        /**
         * @constant
         * @description
         * Count of cache requests that returned a failure response.
         */
        CACHE_REQUEST_FAIL_RESPONSE:   20,

        /**
         * @constant
         * @description
         * Count of cache replies discarded because a request has been fulfilled.
         */
        CACHE_REQUEST_FULFILL_DISCARD_RESPONSE: 21,

        /**
         * @constant
         * @description
         * Count of cached messages delivered to the application.
         */
        RX_CACHE_MSG:                   22,

        /**
         * @constant
         * @description
         * Count of cache requests that were incomplete.
         */
        CACHE_REQUEST_INCOMPLETE_RESPONSE: 23,

        /**
         * @constant
         * @description
         * The cache session operation completed when live data arrived on the requested topic.
         */
        CACHE_REQUEST_LIVE_DATA_FULFILL: 24
    };

    solace.SessionStatistics = function() {
        this.m_statsMap = [];
        var index;
        for (index in solace.StatType) {
            if (solace.StatType.hasOwnProperty(index)) {
                this.m_statsMap[solace.StatType[index]] = 0;
            }
        }
    };

    solace.SessionStatistics.prototype.resetStats = function() {
        for (var i = 0, mapLength = this.m_statsMap.length; i < mapLength; i++) {
            if (typeof this.m_statsMap[i] !== "undefined") {
                this.m_statsMap[i] = 0;
            }
        }
    };

    solace.SessionStatistics.prototype.incStat = function(statType, value) {
        // should we validate statsTxType?
        this.m_statsMap[statType] += (value !== undefined ? value : 1);
    };

    solace.SessionStatistics.prototype.getStat = function(statType) {
        return this.m_statsMap[statType];
    };

    /**
     * @namespace
     * Represents an enumeration of peer capabilities.
     */
    solace.CapabilityType = {
        /**
         * @constant
         * @description Peer's software load version. Type: string.
         */
        PEER_SOFTWARE_VERSION: 0,
        /**
         * @constant
         * @description Peer's software release date. Type: string.
         */
        PEER_SOFTWARE_DATE: 1,
        /**
         * @constant
         * @description Peer's platform. Type: string.
         */
        PEER_PLATFORM: 2,
        /**
         * @constant
         * @description Speed (in Mbps) of the port the client connects to. Type: number.
         */
        PEER_PORT_SPEED: 3,
        /**
         * @constant
         * @description Type of the port the client has connected to (currently 0: Ethernet). Type: number.
         */
        PEER_PORT_TYPE: 4,
        /**
         * @constant
         * @description Maximum size of a Direct message (in bytes), including all optional message headers and data. Type: number.
         */
        MAX_DIRECT_MSG_SIZE: 5,
        /**
         * @constant
         * @description Peer's router name. Type: string.
         *
         * This property is useful when sending SEMP requests to a peer's SEMP
         * topic, which may be constructed as '<code>#P2P/routername/#client/SEMP</code>'.
         */
        PEER_ROUTER_NAME: 6,
        /**
         * @constant
         * @description Peer supports message eliding. Type: boolean.
         */
        MESSAGE_ELIDING: 7,
        /**
         * @constant
         * @description Peer supports NoLocal option (client may avoid receiving messages published by itself).
         */
        NO_LOCAL: 8
    };

     /**
     * Capability type description.
     * @private
     */
    solace.CapabilityTypeDescription = (function() {
        var descriptions = [];
        descriptions[solace.CapabilityType.PEER_SOFTWARE_VERSION] = "PEER_SOFTWARE_VERSION";
        descriptions[solace.CapabilityType.PEER_SOFTWARE_DATE] = "PEER_SOFTWARE_DATE";
        descriptions[solace.CapabilityType.PEER_PLATFORM] = "PEER_PLATFORM";
        descriptions[solace.CapabilityType.PEER_PORT_SPEED] = "PEER_PORT_SPEED";
        descriptions[solace.CapabilityType.PEER_PORT_TYPE] = "PEER_PORT_TYPE";
        descriptions[solace.CapabilityType.MAX_DIRECT_MSG_SIZE] = "MAX_DIRECT_MSG_SIZE";
        descriptions[solace.CapabilityType.PEER_ROUTER_NAME] = "PEER_ROUTER_NAME";
        descriptions[solace.CapabilityType.MESSAGE_ELIDING] = "MESSAGE_ELIDING";
        descriptions[solace.CapabilityType.NO_LOCAL] = "NO_LOCAL";
        return descriptions;
    } ());

    /**
     * @namespace Represents a log level enumeration.
     */
    solace.LogLevel = {
        /**
         * Fatal.
         */
        FATAL: 0,
        /**
         * Error.
         */
        ERROR: 1,
        /**
         * Warn.
         */
        WARN: 2,
        /**
         * Info.
         */
        INFO: 3,
        /**
         * Debug.
         */
        DEBUG: 4,
        /**
         * Trace.
         */
        TRACE: 5
    };

    /**
     * Properties used during initialization of SolclientFactory.
     * @class
     */
    solace.SolclientFactoryProperties = function(){
        /**
         * The logging level to use for filtering log events. Events with a level of lesser importance than this will be filtered out and not logged.
         * @type solace.LogLevel
         */
        this.logLevel   = solace.LogLevel.ERROR;

        /**
         * The logging implementation to use. In the debug API, the log implementation will be called for every log
         * statement not filtered out by the log level. If no implementation is supplied, the default implementation
         * will be used, which logs to the browser console.
         * @type solace.LogImpl
         */
        this.logger     = null;
    };

    /**
     * A binding to a log implementation. The binding will call the supplied log methods with the parameters supplied
     * to each.
     * @class
     * @see solace.ConsoleLogImpl
     * @param {function(argsToLog)} traceCallback
     * @param {function(argsToLog)} debugCallback
     * @param {function(argsToLog)} infoCallback
     * @param {function(argsToLog)} warnCallback
     * @param {function(argsToLog)} errorCallback
     * @param {function(argsToLog)} fatalCallback
     */
    solace.LogImpl = function(traceCallback, debugCallback, infoCallback, warnCallback, errorCallback, fatalCallback) {
        this.trace = traceCallback;
        this.debug = debugCallback;
        this.info = infoCallback;
        this.warn = warnCallback;
        this.error = errorCallback;
        this.fatal = fatalCallback;
    };

    /**
     * A log implementation that uses the browser console. This is the default log implementation
     * used by the API if no logger was supplied via solace.SolclientFactoryProperties.
     * @see solace.SolclientFactoryProperties
     * @class
     */
    solace.ConsoleLogImpl = function() {
        var stub = function() { },
            trace = stub,
            debug = stub,
            info = stub,
            warn = stub,
            error = stub,
            fatal = stub;

        if (console) {

            // Check browser caps
            var hasBind = !! Function.prototype.bind;
            var consoleIsObject = (typeof console.log === 'object');
            // Safari 5 compatibility
            var bindImpl = hasBind ?
                Function.prototype.bind :
                function(oThis) {
                    // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
                    var aArgs = Array.prototype.slice.call(arguments, 1),
                        fToBind = this,
                        fNOP = function() { },
                        fBound = function() {
                            return fToBind.apply(this instanceof Function && oThis ?
                                                        this :
                                                        oThis,
                                                    aArgs.concat(Array.prototype.slice.call(arguments)
                                                 )
                            );
                        };
                    fNOP.prototype = this.prototype;
                    fBound.prototype = new fNOP();
                    return fBound;
                };

            // IE8 compatibility
            if (! hasBind && consoleIsObject) {
                var log = function() {
                    Function.prototype.call.call(console.log, console, Array.prototype.slice.call(arguments));
                };
                trace = log;
                debug = log;
                info = log;
                warn = log;
                error = log;
                fatal = log;
            } else {
                // Where console.log is supported, it is preferred over console.debug
                // https://developer.mozilla.org/en-US/docs/DOM/console
                // console methods in IE9 are object, not function, unfortunately
                if (console.log && typeof console.log !== "undefined") {
                    debug = bindImpl.call(console.log, console);
                } else if (console.debug && typeof console.debug === "function") {
                    debug = bindImpl.call(console.debug, console);
                } else {
                    debug = stub;
                }

                // console.trace outputs a stack trace on some platforms.
                trace = debug;

                // Where console.info exists, it is preferred. Otherwise, fall back
                // to whatever we could get for debug.
                if (console.info && typeof console.info !== "undefined") {
                    info = bindImpl.call(console.info, console);
                } else {
                    info = debug;
                }

                // Where console.warn exists, it is preferred. Otherwise, fall back
                // to info.
                if (console.warn && typeof console.warn !== "undefined") {
                    warn = bindImpl.call(console.warn, console);
                } else {
                    warn = info;
                }

                // Where console.error exists, it is preferred. Otherwise, fall back
                // to warn.
                if (console.error && typeof console.error !== "undefined") {
                    error = bindImpl.call(console.error, console);
                } else {
                    error = warn;
                }

                // console.fatal is not present in any known console implementation. Use
                // console.error.
                fatal = error;
            }
        } // else no console implementation was found, so the default (stub) is used for each level.
        solace.LogImpl.call(this, trace, debug, info, warn, error, fatal);
    };
    solace.ConsoleLogImpl.prototype = (Object.create ? Object.create(solace.LogImpl) : new solace.LogImpl());

    /**
     * @class SolclientFactory A singleton used as the first entry point to the messaging APIs.
     * @static
     */
    solace.SolclientFactory = (function(){
        var initializeCount = 0;
        var logLevel = solace.LogLevel.ERROR;
        var logger = new solace.ConsoleLogImpl(); // Without configuration, log errors to console.

        /**
         * @static
         * @private
         */
        var factory =
        /**
         * @lends solace.SolclientFactory
         */
        {
            /**
             * Creates a session instance.
             * @param {solace.SessionProperties} sessionProperties Properties to configure the session.
             * @param {solace.MessageRxCBInfo} messageCallbackInfo
             * @param {solace.SessionEventCBInfo} eventCallbackInfo
             * @return {solace.Session}
             * @throws {solace.OperationError} if the parameters have an invalid type or value. Subcode: {@link solace.ErrorSubcode.PARAMETER_INVALID_TYPE}.
             */
            createSession: function(sessionProperties, messageCallbackInfo, eventCallbackInfo) {
                return new solace.Session(sessionProperties, messageCallbackInfo, eventCallbackInfo);
            },
            /**
             * Creates a topic instance.
             * @param {string} topicName
             * @return {solace.Topic}
             */
            createTopic: function(topicName) {
                return new solace.Topic(topicName);
            },
            /**
             * Initialize connection factory properties.
             * @param {solace.SolclientFactoryProperties} factoryProps
             * @throw {solace.OperationError} Invalid log level
             */
            init: function(factoryProps) {
                if (initializeCount === 0) {
                    if (typeof factoryProps !== "undefined" && factoryProps !== null && factoryProps instanceof solace.SolclientFactoryProperties) {
                        if (factoryProps.logLevel < solace.LogLevel.FATAL || factoryProps.logLevel > solace.LogLevel.TRACE) {
                            throw new solace.OperationError("Invalid log level", solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE, null);
                        }
                        logLevel    = factoryProps.logLevel;
                    }
                    solace.logger      = factoryProps.logger || new solace.ConsoleLogImpl();
                    if (! (logger &&
                            logger.trace && (typeof logger.trace === "function") &&
                            logger.debug && (typeof logger.debug === "function") &&
                            logger.info &&  (typeof logger.info === "function") &&
                            logger.warn &&  (typeof logger.warn === "function") &&
                            logger.error && (typeof logger.error === "function") &&
                            logger.fatal && (typeof logger.fatal === "function")
                        )) {
                        throw new solace.OperationError("Invalid logger (trace, debug, info, warn, error and fatal methods required)", solace.ErrorSubcode.PARAMETER_INVALID_TYPE, null);
                    }
                    initializeCount++;
                }
            },
            /**
              * Get current logging level
              */
            getLogLevel: function() {
                return logLevel;
            },
            /**
             * Change logging level
             * @param {solace.LogLevel} newLevel
             * @throws {solace.OperationError} Invalid log level
             */
            setLogLevel: function(newLevel) {
                if (newLevel < solace.LogLevel.FATAL || newLevel > solace.LogLevel.TRACE) {
                    throw new solace.OperationError("Invalid log level", solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE, null);
                }
                logLevel = newLevel;
            },
            /**
             * Creates a {@link solace.Message} instance.
             * @return {solace.Message} a new message instance.
             */
            createMessage: function() {
                return new solace.Message();
            }
        };
        return factory;

    }());

    solace.P2PUtil = {
        getP2PInboxTopic: function(base) {
            return (base + "/#");
        },
        getP2PTopicSubscription: function(base) {
            return (base + "/>");
        }
    };

    solace.GlobalContext = (function GlobalContext(){
        function leftPad(str, len) {
            for(var z = len - str.length; z > 0; z--) {
                str = "0" + str;
            }
            return str;
        }
        return {
            RandId: (function() {
                var rand = (Math.random() * Math.pow(2, 32)).toFixed(0);
                return leftPad(rand + "", 10);
            }()),
            sessionCounter: 0,
            NextSessionCounter: function() {
                this.sessionCounter++;
                return leftPad(this.sessionCounter + "", 4);
            },
            idCounter: 0,
            NextId: function() {
                this.idCounter++;
                return this.idCounter;
            },
            GenerateClientName: function() {
                var product = "solclientjs", clientName = "";
                if (typeof navigator.product !== "undefined") {
                   product = solace.TopicUtil.toSafeChars(navigator.product);
                   product = (product.length > 0) ? product : "solclientjs";
                }
                var platform = solace.TopicUtil.toSafeChars(navigator.platform);
                clientName = product + "/" + platform + "/" + this.RandId + "/" + this.NextSessionCounter();
                return clientName;
            },
            GenerateUserIdentification: function() {
                var product = "solclientjs", appDesc = "";
                if (typeof navigator.product !== "undefined") {
                   product = solace.TopicUtil.toSafeChars(navigator.product);
                   product = (product.length > 0) ? product : "solclientjs";
                }
                var platform = solace.TopicUtil.toSafeChars(navigator.platform);
                appDesc = product + "/" + platform + "/" + this.RandId;
                return appDesc;
            },
            GenerateClientDescription: function() {
                // auto-gen description
                var appDesc = "solclientjs / " + navigator.userAgent;
                if (appDesc.length > 254) {
                    appDesc = appDesc.substr(0, 254);
                }
                return appDesc;
            }
        };
    }()); // end solace.GlobalContext

    solace.Util = (function Util(){
        return {
            checkParamTypeOf: function(param, expectedTypeName, paramName) {
                if (typeof param !== expectedTypeName) {
                    throw new solace.OperationError(
                            "Invalid parameter type for " + (paramName || "") + ", expected a " + expectedTypeName,
                            solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
                }
            },
            checkParamInstanceOf: function(param, expectedType, expectedTypeName) {
                if (! (param instanceof expectedType)) {
                    throw new solace.OperationError(
                            "Invalid parameter, expected a " + expectedTypeName,
                            solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
                }
            },
            nullTerminate: function nullTerminate(str) {
                if (str === null) {
                    SOLACE_LOG_ERROR("str null in nullTerminate");
                }
                var lastChar = str.charCodeAt(str.length - 1);
                if (lastChar === 0) {
                    return str;
                } else {
                    return str + String.fromCharCode(0x00);
                }
            },
            stripNullTerminate: function stripNullTerminate(str) {
                if (str === null) {
                    SOLACE_LOG_ERROR("str null in stripNullTerminate");
                }
                var lastChar = str.charCodeAt(str.length - 1);
                if (lastChar === 0) {
                    return str.substr(0, str.length - 1);
                } else {
                    return str;
                }
            },
            hexdump: function(s) {
                var output = [],
                printable = [],
                linelen = 0,
                lu_print = (function() {
                    var tmp = [];
                    for (var c = 0; c < 256; c++) {
                        tmp[c] = (c < 33 || c > 126) ? "." : String.fromCharCode(c);
                    }
                    return tmp;
                }()),
                spacer = function(len) {
                    return (len === 8 || len === 16) ? "  " : " ";
                },
                lpad = function(str, len) {
                    for (; str.length < len; str = " " + str) {
                    }
                    return str;
                };
                for (var i = 0, sLength = s.length; i < sLength; i++) {
                    var ccode = s.charCodeAt(i);
                    output.push(lpad(ccode.toString(16), 2));
                    printable.push(lu_print[ccode] || ".");
                    linelen++;
                    output.push(spacer(linelen));

                    //input finished: complete the line
                    if (i === s.length - 1) {
                        while (linelen < 16) {
                            output.push("  " + spacer(++linelen));
                        }
                    }

                    if (linelen === 16) {
                        output.push(printable.join(""));
                        output.push("\n");
                        linelen = 0;
                        printable = [];
                    }
                }
                return output.join("");
            },
            debugParseSmfStream: function(data) {
                if (data === null) {
                    SOLACE_LOG_ERROR("data null in debugParseSmfStream");
                }
                var pos = 0;
                SOLACE_LOG_WARN("parseSmfStream(): Starting parse, length " + data.length);
                while (pos < data.length) {
                    var incomingMsg = solace.smf.Codec.decodeCompoundMessage(data, pos);
                    if (incomingMsg && incomingMsg.getSmfHeader()) {
                        var smf = incomingMsg.getSmfHeader();
                        SOLACE_LOG_WARN(">> Pos(" + pos + ") Protocol " + smf.m_smf_protocol + ", Length: " + smf.m_messageLength);
                        pos += smf.m_messageLength;
                    } else {
                        // couldn't decode! Lost SMF framing.
                        SOLACE_LOG_WARN("parseSmfStream(): couldn't decode message.");
                        SOLACE_LOG_WARN("Position: " + pos + " length: " + data.length);
                        return;
                    }
                }

            },
            TimingBucket: function(name, interval) {
                this.name = name;
                this.buckets = [];
                this.log = function(v) {
                    if (typeof v === "undefined" || isNaN(v)) {
                        return;
                    }
                    var normalized = Math.floor(v/interval) * interval;
                    this.buckets[normalized] = this.buckets[normalized] || 0;
                    this.buckets[normalized]++;
                };
                this.bucketCount = function() {
                    var c = 0;
                    for (var i = 0; i < this.buckets.length; i++) {
                        c += this.buckets[i] || 0;
                    }
                    return c;
                };
                this.toString = function() {
                    var cont = [];
                    for(var i in this.buckets) {
                        if (this.buckets.hasOwnProperty(i)) {
                            cont.push(i + ": " + this.buckets[i]);
                        }
                    }
                    return "{" + cont.join(', ') + "}";
                };
            },
            each: function(collection, callback) {
                // Apply function on collection, callback should take args (value, index).
                var len;
                if (typeof (len = collection.length) === 'undefined') {
                    for (var name in collection) {
                        if (collection.hasOwnProperty(name)) {
                            if (callback(collection[name], name) === false) {
                                break;
                            }
                        }
                    }
                } else {
                    for (var i = 0; i < len; i++) {
                        if (callback(collection[i], i) === false) {
                            break;
                        }
                    }
                }
            },
            formatHexString: function (arr) {
                function numToHex(n) {
                    if (typeof n !== "number") {
                        return "";
                    }
                    var s = n.toString(16);
                    return (s.length < 2) ? "0" + s : s;
                }

                var s = "";
                if (typeof arr === "number") {
                    return numToHex(arr);
                } else if (typeof arr === "object" && arr instanceof Array) {
                    for (var i = 0; i < arr.length; i++) {
                        s += numToHex(arr[i]);
                    }
                    return s;
                } else if (typeof arr === "string") {
                    //binary string
                    for (var j = 0; j < arr.length; j++) {
                        s += numToHex(arr.charCodeAt(j));
                    }
                    return s;
                } else {
                    return null;
                }
            },
            /*
             Mini string templating: matches instances of '{0}' in the input and
             replaces them with the other args, in the same order.
             */
            strFmt: function(str) {
                // first arg is the string, everything else a replacement value
                var idx = 1;
                var strFmtArgs = arguments;
                var repl = str.replace(/\{\d+\}/g, function(match) {
                    var repl_value = strFmtArgs[idx++];
                    return (typeof repl_value === "undefined") ? match : repl_value + "";
                });
                return repl;
            }

        };
    }()); // end solace.Util

    solace.MessageDumpStandardProvider = (function MessageDumpStandardProvider() {
        var providers = {
            fpDestination: function(message, flags) {
                var dest = message.getDestination();
                if (dest !== null && dest instanceof solace.Destination) {
                    return ["Destination", true, solace.DestinationTypeDescription[dest.getType()] + " '" + dest.getName() + "'", null];
                }
                else {
                    return ["Destination", false, "", null];
                }
            },

            fpSenderId: function(message, flags) {
                return ["SenderId", (typeof message.getSenderId() !== "undefined" && message.getSenderId() !== null), message.getSenderId(), null];
            },

            fpAppMsgType: function(message, flags) {
                return ["AppMessageType", (typeof message.getApplicationMessageType() !== "undefined" && message.getApplicationMessageType() !== null),
                    message.getApplicationMessageType(), null];
            },

            fpAppMsgId: function(message, flags) {
                return ["AppMessageID", (typeof message.getApplicationMessageId() !== "undefined" && message.getApplicationMessageId() !== null),
                    message.getApplicationMessageId(), null];
            },

            fpSequenceNumber: function(message, flags) {
                var sequenceNum = message.getSequenceNumber();
                if (typeof sequenceNum ==="number") {
                    return ["SequenceNumber", true, sequenceNum, null];
                }
                else {
                    return ["SequenceNumber", false, "", null];
                }
            },

            fpCorrelationId: function(message, flags) {
                return ["CorrelationId", (typeof message.getCorrelationId() !== "undefined" && message.getCorrelationId() !== null),
                    message.getCorrelationId(), null];
            },

            fpSendTimestamp: function(message, flags) {
                var timestamp = message.getSenderTimestamp();
                if (typeof timestamp === "number") {
                    return ["SendTimestamp", true,
                        timestamp + " (" +  solace.MessageDumpUtil.formatDate(timestamp) + ")", null];
                }
                else {
                    return ["SendTimestamp", false, "", null];
                }
            },

            fpRcvTimestamp: function(message, flags) {
                var timestamp = message.getReceiverTimestamp();
                if (typeof timestamp === "number") {
                    return ["RcvTimestamp", true,
                        timestamp + " (" + solace.MessageDumpUtil.formatDate(timestamp) + ")", null];
                }
                else {
                    return ["RcvTimestamp", false, "", null];
                }
            },

            fpClassOfService: function(message, flags) {
                var cos = message.getUserCos();
                if (typeof cos === "number") {
                    return ["Class Of Service", true, solace.MessageUserCosTypeDescription[message.getUserCos()], null];
                }
                else {
                    return ["Class Of Service", false, "", null];
                }
            },

            fpDeliveryMode: function(message, flags) {
                var mode = message.getDeliveryMode();
                if (typeof mode === "number") {
                    return ["DeliveryMode", true, solace.MessageDeliveryModeTypeDescription[message.getDeliveryMode()], null];
                }
                else {
                    return ["DeliveryMode", false, "", null];
                }
            },

            fpMessageRedelivered: function(message, flags) {
                return  ["Message Re-delivered", message.isRedelivered(), "", null];
            },

            fpDiscardIndication: function(message, flags) {
                return ["Discard Indication", message.isDiscardIndication(), "", null];
            },

            fpReplyMessage: function(message, flags) {
                return ["Reply Message", message.isReplyMessage(), "", null];
            },

            fpReplyTo: function(message, flags) {
                var replyTo = message.getReplyTo();
                if (replyTo !== null && replyTo instanceof solace.Destination) {
                    return ["ReplyTo", true, solace.DestinationTypeDescription[replyTo.getType()] + " '" + replyTo.getName() + "'", null];
                }
                else {
                    return ["ReplyTo", false, "", null];
                }
            },

            fpDeliverToOne: function(message, flags) {
                return ["Deliver To One", message.isDeliverToOne(), "", null];
            },

            fpElidingEligible: function(message, flags) {
                return ["Eliding Eligible", message.isElidingEligible(), "", null];
            },

            fpUserData: function(message, flags) {
                if (solace.StringUtil.notEmpty(message.getUserData())) {
                    return ["User Data", true, "len=" + message.getUserData().length,
                        solace.StringUtil.formatDumpBytes(message.getUserData(), true, 2)];
                }
                else {
                    return ["User Data", false, "", null];
                }
            },

            fpUserPropertyMap: function(message, flags) {
                var propMap = message.getUserPropertyMap();
                if (propMap !== null && propMap instanceof solace.SDTMapContainer) {
                    var value = propMap.getKeys().length + " entries";
                    var detailValue = null;
                    if (flags === solace.MessageDumpFlag.MSGDUMP_FULL) {
                        try {
                            detailValue = solace.MessageDumpUtil.printMap(propMap, 2);
                        } catch (e) {
                            SOLACE_LOG_ERROR(e.message);
                            detailValue = "Error";
                        }
                    }
                    return ["User Property Map", true, value, detailValue];
                }
                else {
                    return ["User Property Map", false, "", null];
                }
            },

            fpSdtStream: function(message, flags) {
                var sdtFieldValue = message.getSdtContainer();
                if (sdtFieldValue !== null && sdtFieldValue.getType() === solace.SDTFieldType.STREAM) {
                    var value = solace.MessageDumpUtil.countItems(sdtFieldValue.getValue()) + " entries";
                    var detailValue = null;
                    if (flags === solace.MessageDumpFlag.MSGDUMP_FULL) {
                        try {
                            detailValue = solace.MessageDumpUtil.printStream(sdtFieldValue.getValue(), 2);
                        } catch (e) {
                            SOLACE_LOG_ERROR(e.message);
                            detailValue = "Error";
                        }
                    }
                    return ["SDT Stream", true, value, detailValue];
                }
                else {
                    return ["SDT Stream", false, "", null];
                }
            },

            fpSdtMap: function(message, flags) {
                var sdtFieldValue = message.getSdtContainer();
                if (sdtFieldValue !== null && sdtFieldValue.getType() === solace.SDTFieldType.MAP) {
                    var value = sdtFieldValue.getValue().getKeys().length + " entries";
                    var detailValue = null;
                    if (flags === solace.MessageDumpFlag.MSGDUMP_FULL) {
                        try {
                            detailValue = solace.MessageDumpUtil.printMap(sdtFieldValue.getValue(), 2);
                        } catch (e) {
                            SOLACE_LOG_ERROR(e.message);
                            detailValue = "Error";
                        }
                    }
                    return ["SDT Map", true, value, detailValue];
                }
                else {
                    return ["SDT Map", false, "", null];
                }
            },

            fpBinaryAttachment: function(message, flags) {
                var att = message.getBinaryAttachment();
                if (solace.StringUtil.notEmpty(att)) {
                    var value = "len=" + att.length;
                    var detailValue = null;
                    if (flags === solace.MessageDumpFlag.MSGDUMP_FULL) {
                        detailValue = solace.StringUtil.formatDumpBytes(att, true, 2);
                    }
                    return["Binary Attachment", true, value, detailValue];
                }
                else {
                    return ["Binary Attachment", false, "", null];
                }
            },

            fpXmlContent: function(message, flags) {
                var xml = message.getXmlContent();
                if (solace.StringUtil.notEmpty(xml)) {
                    var value = "len=" + xml.length;
                    var detailValue = null;
                    if (flags === solace.MessageDumpFlag.MSGDUMP_FULL) {
                        detailValue = solace.StringUtil.formatDumpBytes(xml, true, 2);
                    }
                    return["XML", true, value, detailValue];
                }
                else {
                    return ["XML", false, "", null];
                }
            },

            fpXmlMetadata: function(message, flags) {
                var xmlMetadata = message.getXmlMetadata();
                if (solace.StringUtil.notEmpty(xmlMetadata)) {
                    var value = "len=" + xmlMetadata.length;
                    var detailValue = null;
                    if (flags === solace.MessageDumpFlag.MSGDUMP_FULL) {
                        detailValue = solace.StringUtil.formatDumpBytes(xmlMetadata, true, 2);
                    }
                    return["XML Metadata", true, value, detailValue];
                }
                else {
                    return ["XML Metadata", false, "", null];
                }
            }
       };

       return providers;
    }()); // solace.MessageDumpStandardProvider

    solace.MessageDumpUtil = (function MessageDumpUtil() {
        var providers = solace.MessageDumpStandardProvider;
        var dumpProviders = [];
        for (var index in providers) {
            if (providers.hasOwnProperty(index)) {
                dumpProviders.push(providers[index]);
            }
        }

        return {
            getOutOfRangeValue: function(rawData) {
                return "<out of range>\n" +
                     solace.StringUtil.formatDumpBytes(rawData);
            },

            getValue: function(sdtField) {
                var value = null;
                try {
                    value = sdtField.getValue();
                    return value;
                } catch(e) {
                    if (e instanceof solace.SDTUnsupportedValueError) {
                        if (e.getSubcode() === solace.SDTValueErrorSubcode.VALUE_OUTSIDE_SUPPORTED_RANGE) {
                            return this.getOutOfRangeValue(e.getSourceData());
                        }
                    }
                    throw e;
                }
            },

            printMap: function(sdtMap, indent) {
                if (typeof sdtMap === "undefined" || sdtMap === null || !(sdtMap instanceof solace.SDTMapContainer)) {
                    return null;
                }
                var sb = new solace.StringBuffer();
                var strIndent = solace.StringUtil.padRight("", indent, " ");
                var keys = sdtMap.getKeys().sort();
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var sdtFieldValue = sdtMap.getField(key);
                    var type = null, value = null;

                    if (sdtFieldValue.getType() !== null) {
                        type = sdtFieldValue.getType();
                    }
                    value = this.getValue(sdtFieldValue);

                    var strValue = null;
                    switch (type) {
                        case solace.SDTFieldType.MAP:
                            strValue = "\n";
                            strValue += this.printMap(value, indent+2);
                            break;
                        case solace.SDTFieldType.STREAM:
                            strValue = "\n";
                            strValue += this.printStream(value, indent+2);
                            break;
                        case solace.SDTFieldType.BYTEARRAY:
                            strValue = solace.StringUtil.formatDumpBytes(value, false, 0);
                            if (strValue !== null && strValue.charAt(strValue.length-1) === '\n') {
                                strValue = strValue.substring(0, strValue.length-1);
                            }
                            break;
                        case solace.SDTFieldType.DESTINATION:
                            strValue = solace.DestinationTypeDescription[value.getType()] + " '" + value.getName() + "'";
                            break;
                        default:
                            strValue = (value !== null) ? value.toString():null;
                    }
                    sb.append(strIndent);
                    sb.append("Key '").append(key).append("' (").append(solace.SDTFieldTypeDescription[type]).append("): ").append(strValue);
                    if (i < (keys.length-1)) {
                        sb.append("\n");
                    }
                }
                return sb.toString();
            },

            printStream: function(sdtStream, indent) {
                if (typeof sdtStream === "undefined" || sdtStream === null ||
                        !(sdtStream instanceof solace.SDTStreamContainer)) {
                    return null;
                }
                sdtStream.rewind();
                var sb = new solace.StringBuffer();
                var strIndent = solace.StringUtil.padRight("", indent, " ");
                while (sdtStream.hasNext()) {
                    var sdtFieldValue = sdtStream.getNext();
                    var type = null, value = null;

                    if (sdtFieldValue.getType() !== null) {
                        type = sdtFieldValue.getType();
                    }
                    value = this.getValue(sdtFieldValue);

                    var strValue = null;
                    switch (type) {
                        case solace.SDTFieldType.MAP:
                            strValue = "\n";
                            strValue += this.printMap(value, indent+2);
                            break;
                        case solace.SDTFieldType.STREAM:
                            strValue = "\n";
                            strValue += this.printStream(value, indent+2);
                            break;
                        case solace.SDTFieldType.BYTEARRAY:
                            strValue = solace.StringUtil.formatDumpBytes(value, false, 0);
                            if (strValue !== null && strValue.charAt(strValue.length-1) === '\n') {
                                strValue = strValue.substring(0, strValue.length-1);
                            }
                            break;
                        case solace.SDTFieldType.DESTINATION:
                            strValue = solace.DestinationTypeDescription[value.getType()] + " '" + value.getName() + "'";   
                            break;
                        default:
                            strValue = (value !== null)?value.toString():null;
                    }
                    sb.append(strIndent);
                    sb.append("(").append(solace.SDTFieldTypeDescription[type]).append("): ").append(strValue);
                    if (sdtStream.hasNext()) {
                        sb.append("\n");
                    }
                }
                sdtStream.rewind();
                return sb.toString();
            },

            countItems: function(sdtStream) {
                if (typeof sdtStream === "undefined" || sdtStream === null ||
                        (!(sdtStream instanceof solace.SDTStreamContainer))) {
                    return 0;
                }
                sdtStream.rewind();
                var count = 0;
                while (sdtStream.hasNext()) {
                    sdtStream.getNext();
                    count++;
                }
                sdtStream.rewind();
                return count;
            },

            formatDate: function(timeStamp) {
                var date = new Date(timeStamp);
                return date.format("ddd mmm dd yyyy HH:MM:ss Z", true);
            },

            dump: function (message, flags, separator, colPadding) {
                var fieldValues;
                var key;
                var isPresent;
                var value;
                var detailValue;
                var sb = new solace.StringBuffer();
                var theSeparator = "\n";
                var theColPadding = 40;
                if (typeof separator !== "undefined" && separator !== null && typeof separator === "string") {
                    theSeparator = separator;
                }
                if (typeof colPadding !== "undefined" && colPadding !== null && typeof colPadding === "number") {
                    theColPadding = colPadding;
                }
                var needSeparator = false;
                for (var i = 0; i < dumpProviders.length; i++) {
                    fieldValues = dumpProviders[i](message, flags);
                    isPresent = fieldValues[1];
                    if (!isPresent) {
                        continue;
                    }
                    key = fieldValues[0];
                    value = fieldValues[2];
                    detailValue = fieldValues[3];
                    if (needSeparator) {
                        sb.append(theSeparator);
                    }

                    if (value === null || value.length === 0) {
                        // If we have no VALUE field, this is probably a boolean flag
                        // and we just end up displaying the key and a newline.
                        sb.append(key);
                    } else {
                        sb.append(solace.StringUtil.padRight(key + ":", theColPadding, " "));
                        sb.append(value);
                    }
                    if (detailValue !== null && ((flags & solace.MessageDumpFlag.MSGDUMP_FULL) > 0)) {
                        sb.append("\n");
                        if (detailValue.indexOf("  ") !== 0) {
                            sb.append("  ");
                        }
                        sb.append(detailValue);
                        if (detailValue.substring(detailValue.length-2) !== "\n" && i < (dumpProviders.length - 1)) {
                            sb.append("\n");
                        }
                    }
                    needSeparator = true;
                }
                return sb.toString();
            }
        };

    }()); // end solace.MessageDumpUtil

}(solace, detected_console));
//
//
//
/*global solace:true,window,global,escape,unescape,WebSocket,ArrayBuffer,Uint8Array,WebSocket,QUnit,SOLACE_LOG_FATAL,SOLACE_LOG_ERROR,SOLACE_LOG_WARN,SOLACE_LOG_INFO,SOLACE_LOG_DEBUG,SOLACE_LOG_TRACE */
/*global ActiveXObject */

(function(solace){

    var SOL_CONNECTION_DEBUG = false;


    /**
     * A URI starting with a "/" is a "path-absolute" URI, and those aren't
     * allowed to have a query component (starting with "?").
     *
     * If an origin isn't defined in the url, tack on the one from the page.
     *
     * @param url
     */
    function prependOrigin(url) {
        if (url.match(/^(http|ws)(s?):/i)) {
            // has origin (non-relative) || 
            return url;
        } else if (window && window.location && window.location.origin) {
            return window.location.origin + ((url.charAt(0) !== "/") ? "/" : "") + url;
            // that's clear right?
        } else {
            return url;
        }
    }

    function getXhrObj() {
        var xhr = null;
        if (typeof window.XMLHttpRequest !== 'undefined' && window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            if (typeof window.ActiveXObject !== 'undefined' && window.ActiveXObject) {
                var msHttpList = ["Microsoft.XMLHttp", "MSXML2.XMLHttp", "MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0"];
                for (var i = 0; i < msHttpList.length; i++) {
                    try {
                        xhr = new ActiveXObject(msHttpList[i]);
                        break;
                    }
                    catch (e) {
                        // Do nothing
                    }
                }
            }
        }
        if (typeof(xhr) === 'undefined' || xhr === null) {
            throw (new solace.TransportError("Failed to create an XMLHttpRequest", solace.ErrorSubcode.CREATE_XHR_FAILED));
        }
        return xhr;
    }

    /**
     * HttpConnection : This class contains all state for a single HTTP connection (XHR).
     * @constructor
     */
    function HttpConnection(url, base64Enc, streamProgressEvents, rxDataCb, connectionErrorCb, contentType) {
        this.Options = {
            url: prependOrigin(url),
            contentType: contentType,
            base64Enc: base64Enc,
            streamProgressEvents: streamProgressEvents
        };
        
        this.m_streamProgressBytes = 0;
        this.m_xhr = null;
        this.m_rxDataCb = rxDataCb;
        this.m_connErrorCb = connectionErrorCb;
        this.m_reqActive = false;
        this.m_REQCOUNTER = 0;
        this.m_REQBASE = Math.floor(Math.random()*1000);

        this.m_xhr = getXhrObj();
        this.stats = {
            WaitedToken: new solace.Util.TimingBucket('WaitedToken', 100),
            HadToken: new solace.Util.TimingBucket('HadToken', 100),
            ReturnedToken: new solace.Util.TimingBucket('ReturnedToken', 100),
            toString: function() {
                var s = "";
                solace.Util.each([this.WaitedToken, this.HadToken, this.ReturnedToken], function(b) {
                    if (b && b.bucketCount() > 0) {
                        s += b.name + ">> " + b.toString() + "\n";
                    }
                });
                return s;
            }
        };
        var clThis = this;
        this.recStat = function(s) {
            if (!SOL_CONNECTION_DEBUG) {
                return;
            }
            function getTs() {
                return new Date().getTime();
            }
            var stats = clThis.stats;
            if (s === "GotToken") {
                stats.LastGotToken = getTs();
                if (stats.LastSendMsg) {
                    var waitedTok = stats.LastGotToken - stats.LastSendMsg;
                    stats.WaitedToken.log(waitedTok);
                    if (waitedTok > 100) {
                        SOLACE_LOG_WARN("Abnormally long waitToken, last request: " + this.m_REQBASE + "_" + this.m_REQCOUNTER);
                    }
                }
            }
            if (s === "SendMsg") {
                stats.LastSendMsg = getTs();
                var hadToken = stats.LastSendMsg - stats.LastGotToken;
                stats.HadToken.log(hadToken);
            }
            if (s === "GotData") {
                stats.LastGotData = getTs();
            }
            if (s === "ReturnToken") {
                stats.LastReturnToken = getTs();
                if (stats.LastGotData) {
                    var returnedToken = stats.LastReturnToken - stats.LastGotData;
                    stats.ReturnedToken.log(returnedToken);
                }
            }
        };
    }
    solace.HttpConnection = HttpConnection;

    var xhrBinaryCheck = function() {
        SOLACE_LOG_DEBUG("http xhrBinaryCheck - if XMLHttpRequest supported and XMLHttpRequest supports sendAsBinary, " +
                "or if XMLHttpRequest, Uint8Array and ProgressEvent supported and XMLHttpRequest supports overrideMimeType");
        if (window.XMLHttpRequest && window.XMLHttpRequest.prototype.sendAsBinary) {
            SOLACE_LOG_DEBUG("http xhrBinaryCheck: true - firefox with binary support");
            return "firefox";
        } else if (window.XMLHttpRequest && window.Uint8Array && window.ProgressEvent && ('overrideMimeType' in (new XMLHttpRequest()))) {
            // Modern Webkit + XHR2.
            // see https://github.com/Modernizr/Modernizr/commit/22912a17e553782ef0244156d59339cbb5e6e619

            if (navigator) {
                // Check for degenerate iOS 4.2/4.3 Safari.
                // Avoid useragent checks if at all possible, but feature detection does not work in this case.
                // It appears to support the whole XHR2 API, *but* xhr.send(/* binary */data) silently fails.
                var agent = navigator.userAgent || "";
                if (agent.match(/chrome/i)) {
                    SOLACE_LOG_DEBUG("http xhrBinaryCheck: true - modern WebKit + XHR2 + chrome with binary support");
                    return "chrome";
                }
                if (agent.match(/OS 4(_\d)+ like Mac OS X/i)) {
                    // iOS 4,5...
                    SOLACE_LOG_DEBUG("http xhrBinaryCheck: false - modern WebKit + XHR2, but iOS4 has no binary support");
                    return null;
                }
            }
            SOLACE_LOG_DEBUG("http xhrBinaryCheck: true - modern WebKit + XHR2 with binary support");
            return "xhr2";
        } else {
            // text fallback
            SOLACE_LOG_DEBUG("http xhrBinaryCheck: false - no binary support");
            return null;
        }
    };

    /**
     * @static
     * Check if we can try binary XHR on this browser.
     */
    HttpConnection.browserSupportsXhrBinary = function() {
        return !! xhrBinaryCheck();
    };

    /**
     * @static
     * Check if browser supports streaming responses (progressive reading of XHR).
     */
    HttpConnection.browserSupportsStreamingResponse = function() {
        var check = (typeof XMLHttpRequest !== 'undefined' && ('onprogress' in (new XMLHttpRequest())));
        SOLACE_LOG_DEBUG("http browserStreamingCheck - if XMLHttpRequest supported and XMLHttpRequest support onprogress: " + check);
        return check;
    };

    function sendXhrText(xhr, data, contentType) {
        if (data !== null) {
            data = solace.base64_encode(data);
        }
        xhr.setRequestHeader('Content-Type', contentType + '; charset=x-user-defined');
        xhr.send(data);
    }

    var fn_sendXhrBinary = null;
    (function() {
        // sniff browser and load a reasonable XHR binary send implementation
        var check = xhrBinaryCheck();
        if (check === "firefox") {
            // Firefox
            fn_sendXhrBinary = function(xhr, data, contentType) {
                xhr.sendAsBinary(data);
            };
        } else if (check === "xhr2" || check === "chrome") {
            fn_sendXhrBinary = function(xhr, data, contentType) {
                // Modern Webkit
                // See: http://javascript0.org/wiki/Portable_sendAsBinary
                var arrayBuf = new ArrayBuffer(data.length);
                var uint8Array = new Uint8Array(arrayBuf, 0);
                for (var i = 0, dataLength = data.length; i < dataLength; i++) {
                    uint8Array[i] = data.charCodeAt(i);
                }
                // If parameter is Uint8Array, Safari xhr.send() doesn't recognize
                // the type and therefore call toString() on it and sends the data
                // as [object UintArray] on the wire. Use the underlying ArrayBuffer
                // as parameter instead.
                // If parameter is ArrayBuffer, Chrome 22.0.1229.94 and up will output
                // the deprecated warning to the console.
                if (check === "chrome") {
                    xhr.send(uint8Array);
                }
                else {
                    xhr.send(uint8Array.buffer);
                }
            };
        } else {
            // text fallback
            fn_sendXhrBinary = function(xhr, data, contentType){
                sendXhrText(xhr, data, contentType);
            };
        }
    }());

    function sendXhrBinary(xhr, data, contentType) {
        /*
         We built these messages ourselves so we assume our charcodes are in
         the range 0x00 - 0xFF, no need to chop off the MSB of each char.
         */
        xhr.overrideMimeType(contentType + "; charset=x-user-defined");
        xhr.setRequestHeader('Content-Type', contentType + '; charset=x-user-defined');
        fn_sendXhrBinary(xhr, data, contentType);
    }

    /*
     * Send data over the connection - this requires a send token
     */
    HttpConnection.prototype.send = function(data, attempt) {
        attempt = (typeof attempt === "undefined" ? 0 : attempt);
        if (attempt > 0) {
            this.m_xhr.abort();
            this.m_xhr = getXhrObj();
        }
        this.m_xhr.open("POST", this.Options.url, true);

        var encThis = this;
        this.m_streamProgressBytes = 0;
        // We pass the write data to the CB so we can retry when it mysteriously fails.
        this.m_xhr.onreadystatechange = function() {
            encThis.xhrStateChange(data, attempt);
        };
        this.m_reqActive = true;

        if (SOL_CONNECTION_DEBUG) {
            this.m_REQCOUNTER++;
            this.m_xhr.setRequestHeader('sol-request-track', this.m_REQBASE + "_" + this.m_REQCOUNTER);
        }
        if (this.Options.base64Enc) {
            sendXhrText(this.m_xhr, data, this.Options.contentType);
        } else {
            sendXhrBinary(this.m_xhr, data, this.Options.contentType);
        }
        this.recStat("SendMsg");
    };


    // XmlHttpRequest Callback
    HttpConnection.prototype.xhrStateChange = function(sentdata, attempt){
        var RS_UNSENT = 0,
            RS_OPENED = 1,
            RS_HEADERS_RX = 2,
            RS_LOADING = 3,
            RS_DONE = 4,
            readyState = this.m_xhr.readyState;

        if (! ((this.Options.streamProgressEvents && readyState === RS_LOADING) || readyState === RS_DONE)) {
            // we proceed with notifications if we're LOADING and we requested streaming events, or we're DONE.
            return;
        }
        if (! this.m_reqActive) {
            // request aborted, DO NOT propagate event
            return;
        }

        if (this.m_xhr.status === 200 || this.m_xhr.status === 304) {

            var data = this.m_xhr.responseText;
            data = data.substring(this.m_streamProgressBytes, data.length);
            this.m_streamProgressBytes += data.length;

            if (data.length === 0 && readyState === RS_LOADING) {
                // we are streaming LOADING events but have no data
                return;
            }
            if (this.Options.base64Enc) {
                try {
                    data = solace.base64_decode(data);
                } catch(e) {
                    // Failed the decode - call the error callback
                    SOLACE_LOG_ERROR("Data decode error on: " + data);
                    SOLACE_LOG_ERROR("Date decode error is: " + e.message);
                    this.m_rxDataCb(3, data);
                    return;
                }
            } else {
                // take lower-8 bits
                var decoded_data = [];
                for (var i = 0; i < data.length; i++) {
                    decoded_data.push(String.fromCharCode(data.charCodeAt(i) & 0xFF));
                }
                data = decoded_data.join("");
            }
            if (readyState === RS_DONE) {
                // MUST do this BEFORE the callback invocation, because the callback can trigger a new send.
                this.m_reqActive = false;
            }
            this.m_rxDataCb(0, data);
            if (readyState === RS_DONE && data.length > 0) {
                this.m_rxDataCb(0, ""); //indicate end of stream
            }
        }
        else {
            var status = this.m_xhr.status;
            var statusText = this.m_xhr.statusText;
            var responseText = this.m_xhr.responseText || "";
            var responseTextLen = responseText.length;
            var requestUrl = this.Options.url;
            var sentdataLen = sentdata?sentdata.length:0;
            SOLACE_LOG_INFO("Http request failed.  url=" + requestUrl + ", status=" + status + ", statusText=" + statusText + ", responseText length=" + responseTextLen +
                    ", responseText(first 256 bytes or fewer)=\n" + solace.StringUtil.formatDumpBytes(responseText.substr(0,Math.min(responseTextLen, 256)), true, 0) + ", XHR errorCode=" + (this.m_xhr.m_error?this.m_xhr.m_error.code:"") + ", attempt=" + attempt +
                    ", reqActive=" + this.m_reqActive + ", readyState=" + readyState + ", send data length=" + sentdataLen +
                    ", send data(first 256 bytes or fewer)=\n" + solace.StringUtil.formatDumpBytes(sentdata.substr(0, Math.min(sentdataLen, 256)), true, 0));
            if (attempt === 0 && this.m_reqActive && status !== 400 && responseText.length === 0) {
                SOLACE_LOG_INFO("XHR failed while request active, will retry send once, attempt=" + attempt);
                this.send(sentdata, attempt + 1); // RETRY (could be a transient browser connection problem)
            } else {
                this.m_reqActive = false;
                this.m_connErrorCb(status,
                    "HTTP request failed: status=" + status + " statusText=" + statusText + ", responseText length=" + responseTextLen + ", XHR errorCode=" +
                            (this.m_xhr.m_error?this.m_xhr.m_error.code:""));
            }
        }
    };

    HttpConnection.prototype.isUsingBase64 = function() {
        return this.Options.base64Enc;
    };

    // This function will abort the current xhr request if it is active
    HttpConnection.prototype.abort = function() {
        // mark request as inactive, so we won't process statechange events
        this.m_reqActive = false;
        if (this.m_xhr && this.m_xhr.abort) {
            this.m_xhr.abort();
        }
    };
    
}(solace));

//
/*global solace:true,window,global,escape,unescape,WebSocket,ArrayBuffer,Uint8Array,WebSocket,QUnit,SOLACE_LOG_FATAL,SOLACE_LOG_ERROR,SOLACE_LOG_WARN,SOLACE_LOG_INFO,SOLACE_LOG_DEBUG,SOLACE_LOG_TRACE */
//

(function(solace) {
    // === SDTField utils ===
    function fail_invalid_parameter(valueType) {
        throw new solace.OperationError(
                "Invalid SDT type:value combination, expected value type " + valueType,
                solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
    }

    function validateSdtField(type, value) {
        var baseTypes = [];
        baseTypes[solace.SDTFieldType.BOOL] = "boolean";
        baseTypes[solace.SDTFieldType.UINT8] = "number";
        baseTypes[solace.SDTFieldType.INT8] = "number";
        baseTypes[solace.SDTFieldType.UINT16] = "number";
        baseTypes[solace.SDTFieldType.INT16] = "number";
        baseTypes[solace.SDTFieldType.UINT32] = "number";
        baseTypes[solace.SDTFieldType.INT32] = "number";
        baseTypes[solace.SDTFieldType.UINT64] = "number";
        baseTypes[solace.SDTFieldType.INT64] = "number";
        baseTypes[solace.SDTFieldType.WCHAR] = "string";
        baseTypes[solace.SDTFieldType.STRING] = "string";
        baseTypes[solace.SDTFieldType.BYTEARRAY] = "string";
        baseTypes[solace.SDTFieldType.FLOATTYPE] = "number";
        baseTypes[solace.SDTFieldType.DOUBLETYPE] = "number";

        if (baseTypes[type]) {
            if (typeof value !== baseTypes[type]) {
                fail_invalid_parameter(baseTypes[type]);
            }
        } else if (type === solace.SDTFieldType.MAP && !(value instanceof solace.SDTMapContainer)) {
            fail_invalid_parameter("solace.SDTMapContainer");
        } else if (type === solace.SDTFieldType.STREAM && !(value instanceof solace.SDTStreamContainer)) {
            fail_invalid_parameter("solace.SDTStreamContainer");
        } else if (type === solace.SDTFieldType.DESTINATION && !(value instanceof solace.Destination)) {
            fail_invalid_parameter("solace.Destination");
        }
    }
    // === END SDTField utils ===

    /**
     * @namespace SDTValueErrorSubcode Enumeration of SDTUnsuportedValueError causes.
     */
    solace.SDTValueErrorSubcode = {
        /**
         * @constant
         * @description
         * The value for this field may be valid on other platforms, but is outside the
         * range that is supported on this platform for the given type.
         */
        VALUE_OUTSIDE_SUPPORTED_RANGE: 1
    };
    
    /**
     * @class
     * Represents a SDT unsupported value error.  An SDT field was assigned a value that is within the type range
     * for the given SDT type, but is not supported on this platform/runtime.
     *
     * @param {string} message
     * @param {solace.SDTValueErrorSubcode} subcode
     * @param {Object} sourceData The original representation of the value
     */
    solace.SDTUnsupportedValueError = function SDTUnsupportedValueError(message, subcode, sourceData) {
        this.name = "SDTUnsupportedValueError";
        this.message = (message || "");
        this.subcode = subcode;
        this.sourceData = sourceData;
    };
    solace.SDTUnsupportedValueError.prototype = new Error();
    solace.SDTUnsupportedValueError.prototype.toString = function() {
        var buf = new solace.StringBuffer(this.name);
        buf.append(": ");
        if (this.name === "SDTUnsupportedValueError") {
            buf.append("message=").append(this.message||"").append(", ");
            buf.append("subcode=").append(this.subcode||"").append(", ");
            buf.append("sourceData=").append(
                solace.StringUtil.formatDumpBytes(this.sourceData, false, 0)
            );
        }
        else {
            buf.append("message=").append(this.message||"");
        }
        return buf.toString();
    };
    solace.SDTUnsupportedValueError.prototype.getSubcode = function() {
        return this.subcode;
    };
    solace.SDTUnsupportedValueError.prototype.getSourceData = function() {
        return this.sourceData;
    };

    /**
     * @class
     * Represents a SDT (Structured Data Type) field. To create an instance of an <code>SDTField</code>, call {@link solace.SDTField.create}.
     */
    solace.SDTField = function SDTField(){
        this.m_type = solace.SDTFieldType.NULLTYPE;
        this.m_value = null;
        this.m_error = null;
    };

    /**
     * Create a new SDTField instance representing a Value of a given Type.
     *
     * @static
     * @param {solace.SDTFieldType} type The type of field represented.
     * @param value The corresponding value to store in the field.
     * @param {Error} error (Optional) An error, used by the API internally.
     */
    solace.SDTField.create = function(type, value, error) {
        validateSdtField(type, value);
        var sdt = new solace.SDTField();
        sdt.m_type = type;
        sdt.m_value = value;

        if (error) {
            sdt.m_error = error;
        } else {
            sdt.m_error = null;
        }

        return sdt;
    };

    /**
     * Gets the type of field represented.
     * @return {solace.SDTFieldType} The type of field represented.
     */
    solace.SDTField.prototype.getType = function() {
        return this.m_type;
    };

    /**
     * Gets the field value.
     * @return Field value (as one of the supported data types).
     */
    solace.SDTField.prototype.getValue = function() {
        if (this.m_error) {
            throw this.m_error;
        }
        return this.m_value;
    };

    solace.SDTField.prototype.toString = function() {
        return "[SDTField type:" + this.getType() + " value:" + this.getValue() + "]";
    };

    /**
     * @namespace SDTFieldType An enumeration of all SDT data types.
     */
    solace.SDTFieldType = {
        /**
         * @constant
         * @description Maps to a boolean.
         */
        BOOL: 0,
        /**
         * @constant
         * @description Maps to a number.
         */
        UINT8: 1,
        /**
         * @constant
         * @description Maps to a number.
         */
        INT8: 2,
        /**
         * @constant
         * @description Maps to a number.
         */
        UINT16: 3,
        /**
         * @constant
         * @description Maps to a number.
         */
        INT16: 4,
        /**
         * @constant
         * @description Maps to a number.
         */
        UINT32: 5,
        /**
         * @constant
         * @description Maps to a number.
         */
        INT32: 6,
        /**
         * @constant
         * @description Maps to a number. <br>
         * <strong>Warning:</strong> Supports 48-bit integers (range: 0 to 2<sup>48</sup>-1). When decoding, only the lower 48 bits are considered significant.
         */
        UINT64: 7,
        /**
         * @constant
         * @description Maps to a number. <br>
         * <strong>Warning:</strong> Supports 48-bit integers + sign (range: -(2<sup>48</sup>-1) to 2<sup>48</sup>-1). When decoding, only the lower 48 bits are considered significant.
         */
        INT64: 8,
        /**
         * @constant
         * @description A single character; maps to a string.
         */
        WCHAR: 9,
        /**
         * @constant
         * @description Maps to a string.
         */
        STRING: 10,
        /**
         * @constant
         * @description Maps to a string (string representation of a byte array).
         */
        BYTEARRAY: 11,
        /**
         * @constant
         * @description Single-precision float; maps to a number.
         */
        FLOATTYPE: 12,
        /**
         * @constant
         * @description Double-precision float; maps to a number.
         */
        DOUBLETYPE: 13,
        /**
         * @constant
         * @description Maps to {@link solace.SDTMapContainer}.
         */
        MAP: 14,
        /**
         * @constant
         * @description Maps to {@link solace.SDTStreamContainer}.
         */
        STREAM: 15,
        /**
         * @constant
         * @description Maps to {@link solace.Destination}.
         */
        DESTINATION: 16,
        /**
         * @constant
         * @description Maps to <code>null</code>.
         */
        NULLTYPE: 17,
        /**
         * @constant
         * @description Maps to an unknown type.
         */
        UNKNOWN: 18,
        /**
         * @constant
         * @description Maps to an encoded SMF message.
         */
        SMF_MESSAGE: 19
    };

    /**
     * @private
     */
    solace.SDTFieldTypeDescription = (function() {
        var description = [];
        var index;
        for (index in solace.SDTFieldType) {
            if (solace.SDTFieldType.hasOwnProperty(index)) {
                description[solace.SDTFieldType[index]] = index;
            }
        }
        return description;
    }());

    /**
     * @class
     * Defines a Structued Data Type (SDT) map container.
     */
    solace.SDTMapContainer = function SDTMapContainer(){
        this.m_map = []; //key-value mappings (keys are strings)
    };

    /**
     * Get the list of keys in this map, in unspecified order.
     * @return {Array.<string>} Array of defined keys in the map.
     */
    solace.SDTMapContainer.prototype.getKeys = function() {
        var ret = [];
        // iterates over all keys in m_map, 'i' taking the value of the key string.
        for (var i in this.m_map) {
            if (this.m_map.hasOwnProperty(i)) {
                ret.push(i);
            }
        }
        return ret;
    };

    /**
     * Return the SDTField with the given key.
     * @param {string} key The key to look up.
     * @return {solace.SDTField} The field referenced by key.
     */
    solace.SDTMapContainer.prototype.getField = function(key){
        return this.m_map[key];
    };
    /**
     * Delete an SDTField with the given key.
     * @param {string} key
     */
    solace.SDTMapContainer.prototype.deleteField = function(key){
        delete this.m_map[key];
    };

    /**
     * Adds a field to this map. If a key:value mapping already exists for this key, it is replaced.
     * <p>
     * The provided <code>value</code> argument should be an {@link solace.SDTField} instance. (Instead of an SDTField,
     * it is also possible to specify arguments (type, value), an {@link solace.SDTFieldType} and a value, respectively.
     * The API wraps them in a <code>SDTField</code> of the specified type.)
     *
     * @param {string} key The key by which to store the given value.
     * @param {solace.SDTField} value A solace.SDTField instance to store in the map.
     */
    solace.SDTMapContainer.prototype.addField = function(key, value) {
        if (value instanceof solace.SDTField) {
            this.m_map[key] = value;
        } else if (arguments.length >= 3) {
            this.m_map[arguments[0]] = solace.SDTField.create(arguments[1], arguments[2]);
        }
    };

    /**
     * @class
     * Defines a Structured Data Type (SDT) stream container. A stream is an iterable collection of solace.SDTFields.
     *
     */
    solace.SDTStreamContainer = function SDTStreamContainer(){
        this.m_stream = [];
        this.m_writable = true;
        this.m_readPt = 0;
    };

    /**
     * Returns true if the stream has at least one more {@link solace.SDTField}
     * at the current position.
     * @return {boolean} true, if there is an available field at the read pointer; false, otherwise.
     */
    solace.SDTStreamContainer.prototype.hasNext = function(){
        return (this.m_stream.length > this.m_readPt);
    };

    /**
     * Returns the next field in the stream and advances the read pointer.
     * If the end of the stream is reached, it returns undefined.
     * @return {solace.SDTField} The next field in the stream.
     */
    solace.SDTStreamContainer.prototype.getNext = function() {
        return (this.m_readPt < this.m_stream.length) ? this.m_stream[this.m_readPt++] : undefined;
    };

    /**
     * Rewinds the read pointer to the beginning of the stream. Normally when {@link solace.hasNext}
	 * returns false, a client application must call rewind() to reiterate over the stream's fields. 
     * @throws {solace.OperationError} if the stream cannot be rewound.
     */
    solace.SDTStreamContainer.prototype.rewind = function(){
        this.m_readPt = 0;
    };

    /**
     * Appends a SDTField to the stream.
     * <p>
     * If <code>field</code> is a solace.SDTField,
     * this field is appended to the stream.
     * <br>
     * If <code>field</code> is a
     * solace.SDTFieldType, then the API will create a solace.SDTField of this type
     * with a value of <code>optValue</code> and append this new solace.SDTField to
     * the stream.
     *
     * @param {solace.SDTField} field The field to append to the stream.
     * @param [optValue] The value to wrap as an SDTField.
     */
    solace.SDTStreamContainer.prototype.addField = function(field, optValue) {
        if (this.m_writable) {
            if (field instanceof solace.SDTField) {
                this.m_stream.push(field);
            } else if (arguments.length >= 2) {
                this.m_stream.push(solace.SDTField.create(arguments[0], arguments[1]));
            }
        }
    };

    solace.sdt = solace.sdt || {};
    solace.sdt.Codec = (function() {
        var smfDTypes = {
            Null: 0x00,
            Boolean: 0x01,
            Integer: 0x02,
            UnsignedInteger: 0x03,
            Float: 0x04,
            Char: 0x05,
            ByteArray: 0x06,
            String: 0x07,
            Destination: 0x08,
            SMFMessage: 0x09,
            Map: 0x0A,
            Stream: 0x0B
        };

        //Util: decode 1, 2, 3, 4 byte UINT.
        function autoDecodeVarLengthNumber(dataStr) {
            switch (dataStr.length) {
                case 1:
                    return solace.Convert.strToInt8(dataStr);
                case 2:
                    return solace.Convert.strToInt16(dataStr);
                case 3:
                    return solace.Convert.strToInt24(dataStr);
                case 4:
                    return solace.Convert.strToInt32(dataStr);
                default:
                    return false;
            }
        }

        // shorthand
        var crSdtField = solace.SDTField.create;

        function getBinaryString(strBytes) {
            var bits = [];
            for (var i = strBytes.length - 1; i >= 0; i--) {
                var byte_i = strBytes.charCodeAt(i) & 0xFF;
                for(var j = 0; j < 8; j++) {
                    bits.push(byte_i % 2 ? 1 : 0);
                    byte_i = byte_i >> 1;
                }
            }
            bits.reverse();
            return bits.join('');
        }

        function int48ToStr(v) {
            var bytes = [];
            for (var i = 0; i < 6; i++) {
                var byte_i = (v % 256);
                v = Math.floor(v / 256);
                bytes.push(String.fromCharCode(byte_i));
            }
            bytes.reverse();
            return bytes.join("");
        }

        // Parse an integer SDT Field: [U]INT 8, 16, 32, 64.
        function parseIntegerField(bSigned, datastr) {
            var sign = false;
            var val = 0;

            switch (datastr.length) {
                case 1:
                    val = solace.Convert.strToInt8(datastr);
                    if (bSigned) {
                        sign = (val & 0x80) !== 0;
                        if (sign) {
                            val -= 256;
                        }
                        return crSdtField(solace.SDTFieldType.INT8, val);
                    } else {
                        return crSdtField(solace.SDTFieldType.UINT8, val);
                    }
                    break;
                case 2:
                    val = solace.Convert.strToInt16(datastr);
                    if (bSigned) {
                        sign = (val & 0x8000) !== 0;
                        if (sign) {
                            val -= 65536;
                        }
                        return crSdtField(solace.SDTFieldType.INT16, val);
                    } else {
                        return crSdtField(solace.SDTFieldType.UINT16, val);
                    }
                    break;
                case 4:
                    val = solace.Convert.strToInt32(datastr);
                    if (bSigned) {
                        // raw read using strToInt32 (it reads 2's complement)
                        return crSdtField(solace.SDTFieldType.INT32, val);
                    } else {
                        // conversion error with strToInt32! (we can't read back a 32bit uint)
                        // Solution is to convert byte positions ourselves without using bitwise shifts
                        // Because the UINT is guaranteed to be < 2^53 this should work.
                        var b0 = datastr.charCodeAt(0);
                        var b1 = datastr.charCodeAt(1);
                        var b2 = datastr.charCodeAt(2);
                        var b3 = datastr.charCodeAt(3);
                        val = (b0 * 16777216) + (b1 * 65536) + (b2 * 256) + b3;
                        return crSdtField(solace.SDTFieldType.UINT32, val);
                    }
                    break;
                case 8:
                    // we handle 48-bit ints safely
                    var bitstr64 = getBinaryString(datastr.substr(0, 8));
                    var error = null;
                    sign = bSigned && bitstr64.substr(0, 1) === "1";

                    // If these bits change the representation, we can't
                    // compute a valid representation.
                    var unsafeBits = parseInt(bitstr64.substr(1, 15), 2);

                    // If the number is not signed, enforce bits 1-15 === 0.
                    // If the number is signed and negative, enforce bits 1-15 === 1.
                    if (
                            ( !sign && (unsafeBits !== 0) ) ||
                            ( sign && (unsafeBits !== 0x7FFF) ) ) {
                        error = new solace.SDTUnsupportedValueError("Value is not supported",
                            solace.SDTValueErrorSubcode.VALUE_OUTSIDE_SUPPORTED_RANGE,
                            datastr);
                    }

                    val = parseInt(bitstr64.substr(16, 48), 2);
                    if (bSigned) {
                        if (sign) {
                            // negative (two's complement) number
                            val -= Math.pow(2, 48);
                        }
                        return crSdtField(solace.SDTFieldType.INT64, val, error);
                    } else {
                        return crSdtField(solace.SDTFieldType.UINT64, val, error);
                    }
            }
            return null;
        }

        // IEEE 754 implementation taken from node-packet library (MIT LICENSE)
        // https://github.com/bigeasy/node-packet
        var IEEE754LIB = {
            /*
             The MIT License

             Copyright (c) 2010 Alan Gutierrez

             Permission is hereby granted, free of charge, to any person obtaining a copy
             of this software and associated documentation files (the "Software"), to deal
             in the Software without restriction, including without limitation the rights
             to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
             copies of the Software, and to permit persons to whom the Software is
             furnished to do so, subject to the following conditions:

             The above copyright notice and this permission notice shall be included in
             all copies or substantial portions of the Software.

             THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
             IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
             FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
             AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
             LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
             OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
             THE SOFTWARE.
             */
            toIEEE754: function(v, ebits, fbits) {
                var bias = (1 << (ebits - 1)) - 1;

                // Compute sign, exponent, fraction
                var s, e, f;
                if (isNaN(v)) {
                    e = (1 << bias) - 1;
                    f = 1;
                    s = 0;
                }
                else if (v === Infinity || v === -Infinity) {
                    e = (1 << bias) - 1;
                    f = 0;
                    s = (v < 0) ? 1 : 0;
                }
                else if (v === 0) {
                    e = 0;
                    f = 0;
                    s = (1 / v === -Infinity) ? 1 : 0;
                }
                else {
                    s = v < 0;
                    v = Math.abs(v);

                    if (v >= Math.pow(2, 1 - bias)) {
                        var ln = Math.min(Math.floor(Math.log(v) / Math.LN2), bias);
                        e = ln + bias;
                        f = v * Math.pow(2, fbits - ln) - Math.pow(2, fbits);
                    }
                    else {
                        e = 0;
                        f = v / Math.pow(2, 1 - bias - fbits);
                    }
                }

                // Pack sign, exponent, fraction
                var i, bits = [];
                for (i = fbits; i; i -= 1) {
                    bits.push(f % 2 ? 1 : 0);
                    f = Math.floor(f / 2);
                }
                for (i = ebits; i; i -= 1) {
                    bits.push(e % 2 ? 1 : 0);
                    e = Math.floor(e / 2);
                }
                bits.push(s ? 1 : 0);
                bits.reverse();
                var str = bits.join('');

                // Bits to bytes
                var bytes = [];
                while (str.length) {
                    bytes.push(parseInt(str.substring(0, 8), 2));
                    str = str.substring(8);
                }
                return bytes;
            },
            fromIEEE754: function(bytes, ebits, fbits) {

                // Bytes to bits
                var bits = [];
                for (var i = bytes.length; i; i -= 1) {
                    var byte_i = bytes[i - 1];
                    for (var j = 8; j; j -= 1) {
                        bits.push(byte_i % 2 ? 1 : 0);
                        byte_i = byte_i >> 1;
                    }
                }
                bits.reverse();
                var str = bits.join('');

                // Unpack sign, exponent, fraction
                var bias = (1 << (ebits - 1)) - 1;
                var s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
                var e = parseInt(str.substring(1, 1 + ebits), 2);
                var f = parseInt(str.substring(1 + ebits), 2);

                // Produce number
                if (e === (1 << ebits) - 1) {
                    return f !== 0 ? NaN : s * Infinity;
                }
                else if (e > 0) {
                    return s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
                }
                else if (f !== 0) {
                    return s * Math.pow(2, -(bias - 1)) * (f / Math.pow(2, fbits));
                }
                else {
                    return s * 0;
                }
            },
            strToByteArr: function(str) {
                var bytes = [];
                for(var i = 0; i < str.length; i++) { bytes.push(str.charCodeAt(i) & 0xFF); }
                return bytes;
            },
            byteArrToStr: function(bytes) {
                var str = [];
                for (var i = 0; i < bytes.length; i++) {str.push(String.fromCharCode(bytes[i] & 0xFF));}
                return str.join("");
            },
            fromIEEE754Double: function(b) { return this.fromIEEE754(this.strToByteArr(b), 11, 52); },
            toIEEE754Double: function(v) { return this.byteArrToStr(this.toIEEE754(v, 11, 52)); },
            fromIEEE754Single: function(b) { return this.fromIEEE754(this.strToByteArr(b),  8, 23); },
            toIEEE754Single: function(v) { return this.byteArrToStr(this.toIEEE754(v,  8, 23)); }
        };

        function parseFloatField(bytes) {
            switch (bytes.length) {
                case 4:
                    return crSdtField(solace.SDTFieldType.FLOATTYPE, IEEE754LIB.fromIEEE754Single(bytes));
                case 8:
                    return crSdtField(solace.SDTFieldType.DOUBLETYPE, IEEE754LIB.fromIEEE754Double(bytes));
                default:
                    return crSdtField(solace.SDTFieldType.UNKNOWN, bytes);
            }
        }

        // Function prototypes (defined later) to resolve circular dependency)
        var parseMapFn = null;
        var parseStreamFn = null;
        var encodeMapFn = null;
        var encodeStreamFn = null;

        // Parse the header part of an SDT field.
        // Returns [TYPE, DECLARED_LENGTH, VALUE_DATA_LENGTH, CONSUMED_BYTES]
        function parseFieldHeader(data, offset) {
            var pos = offset;
            var onebyte = solace.Convert.strToInt8(data.substr(pos, 1));
            var elemType = (onebyte & 0xFC) >> 2;
            var lenBytes = (onebyte & 0x03) + 1;
            pos++;
            var elemLen = autoDecodeVarLengthNumber(data.substr(pos, lenBytes));
            pos += lenBytes;
            var elemValLen = elemLen - (1 + lenBytes);
            return [elemType, elemLen, elemValLen, pos - offset];
        }

        // UCS-2 --> UTF-8 conversion
        function strencode( data ) {
            return unescape(encodeURIComponent(data));
        }

        // UTF-8 --> UCS-2 conversion
        function strdecode( data ) {
            return decodeURIComponent(escape(data));
        }

        // Parse single SDT element, returns SDTField
        function parseSingleElement(data, offset) {
            var fieldHeader = parseFieldHeader(data, offset);
            if (!fieldHeader) {
                SOLACE_LOG_DEBUG("parseSingleElement return false, fieldHeader=" + fieldHeader);
                return false;
            }

            var pos = offset + fieldHeader[3];

            // For use inside switch
            var numeric = 0;
            var elemValLen = fieldHeader[2];
            switch (fieldHeader[0]) {
                case smfDTypes.Null:
                    return crSdtField(solace.SDTFieldType.NULLTYPE, null);
                case smfDTypes.Boolean:
                    numeric = solace.Convert.strToInt8(data.substr(pos, 1));
                    return crSdtField(solace.SDTFieldType.BOOL, numeric !== 0);
                case smfDTypes.Integer:
                    return parseIntegerField(true, data.substr(pos, elemValLen));
                case smfDTypes.UnsignedInteger:
                    return parseIntegerField(false, data.substr(pos, elemValLen));
                case smfDTypes.Float:
                    return parseFloatField(data.substr(pos, elemValLen));
                case smfDTypes.Char:
                    numeric = solace.Convert.strToInt16(data.substr(pos, 2));
                    return crSdtField(solace.SDTFieldType.WCHAR, String.fromCharCode(numeric));
                case smfDTypes.ByteArray:
                    return crSdtField(solace.SDTFieldType.BYTEARRAY, data.substr(pos, elemValLen));
                case smfDTypes.String:
                    // strip last byte (null-terminator)
                    return crSdtField(solace.SDTFieldType.STRING, strdecode(data.substr(pos, elemValLen - 1)));
                case smfDTypes.Destination:
                    var destType = solace.Convert.strToInt8(data.substr(pos, 1));
                    // Name is null-terminated so strip last byte.
                    // Type 0x00 is TOPIC. 0x01 is QUEUE, currently unsupported.
                    var destName = data.substr(pos + 1, elemValLen - 2);
                    return crSdtField(
                            solace.SDTFieldType.DESTINATION,
                            (destType === 0x00 ? new solace.Topic(destName) : null));
                case smfDTypes.SMFMessage:
                    return crSdtField(solace.SDTFieldType.SMF_MESSAGE, data.substr(pos, elemValLen));
                case smfDTypes.Map:
                    return parseMapFn(data, pos, elemValLen);
                case smfDTypes.Stream:
                    return parseStreamFn(data, pos, elemValLen);
                default:
                    return crSdtField(solace.SDTFieldType.UNKNOWN, data.substr(pos, elemValLen));

            }
        }

        function encodeHeader(tag, valueLen) {
            // Tag in first 6 bits, then (lenbytes-1) in 2 bits
            var byte0 = (tag << 2) & 0xFF;
            var strSdtLen = null;

            if (tag === smfDTypes.Map || tag === smfDTypes.Stream) {
                // force 4 bytes
                strSdtLen = solace.Convert.int32ToStr(valueLen + 5);
                byte0 |= 3; // 4 length bytes
            } else if (valueLen + 2 <= 255) {
                strSdtLen = solace.Convert.int8ToStr(valueLen + 2);
                byte0 |= 0; // 1 length byte
            } else if (valueLen + 3 <= 65535) {
                strSdtLen = solace.Convert.int16ToStr(valueLen + 3);
                byte0 |= 1; // 2 length bytes
            } else {
                strSdtLen = solace.Convert.int32ToStr(valueLen + 5);
                byte0 |= 3; // 4 length bytes
            }
            var ret = solace.Convert.int8ToStr(byte0) + strSdtLen;
            return ret;
        }

        // Encode an SDTField into provided buffer buf
        function encodeSingleElementToBuf(sdtfield, buf) {
            if (! (sdtfield instanceof solace.SDTField)) {
                return false;
            }
            // we write the header at the end, once we know the size
            var field_val = null;
            var value = sdtfield.getValue();
            var tag = 0; // SMF TAG
            var numeric = 0;
            switch (sdtfield.getType()) {
                case solace.SDTFieldType.BOOL:
                    tag = smfDTypes.Boolean;
                    field_val = solace.Convert.int8ToStr(value ? 1 : 0);
                    break;
                case solace.SDTFieldType.UINT8:
                    tag = smfDTypes.UnsignedInteger;
                    field_val = solace.Convert.int8ToStr(value);
                    break;
                case solace.SDTFieldType.INT8:
                    tag = smfDTypes.Integer;
                    field_val = solace.Convert.int8ToStr(value);
                    break;
                case solace.SDTFieldType.UINT16:
                    tag = smfDTypes.UnsignedInteger;
                    field_val = solace.Convert.int16ToStr(value);
                    break;
                case solace.SDTFieldType.INT16:
                    tag = smfDTypes.Integer;
                    field_val = solace.Convert.int16ToStr(value);
                    break;
                case solace.SDTFieldType.UINT32:
                    tag = smfDTypes.UnsignedInteger;
                    field_val = solace.Convert.int32ToStr(value);
                    break;
                case solace.SDTFieldType.INT32:
                    tag = smfDTypes.Integer;
                    field_val = solace.Convert.int32ToStr(value);
                    break;
                case solace.SDTFieldType.UINT64:
                    tag = smfDTypes.UnsignedInteger;
                    field_val = String.fromCharCode(0) + String.fromCharCode(0) + int48ToStr(value);
                    break;
                case solace.SDTFieldType.INT64:
                    tag = smfDTypes.Integer;
                    if (value >= 0) {
                        field_val = String.fromCharCode(0) + String.fromCharCode(0) + int48ToStr(value);
                    } else {
                        var two_c = Math.pow(2, 48) + value;
                        field_val = String.fromCharCode(0xFF) + String.fromCharCode(0xFF) + int48ToStr(two_c);
                    }
                    break;
                case solace.SDTFieldType.WCHAR:
                    tag = smfDTypes.Char;
                    numeric = value.charCodeAt(0);
                    field_val = solace.Convert.int16ToStr(numeric);
                    break;
                case solace.SDTFieldType.STRING:
                    tag = smfDTypes.String;
                    field_val = solace.Util.nullTerminate(strencode(value));
                    break;
                case solace.SDTFieldType.BYTEARRAY:
                    tag = smfDTypes.ByteArray;
                    field_val = value;
                    break;
                case solace.SDTFieldType.FLOATTYPE:
                    tag = smfDTypes.Float;
                    field_val = IEEE754LIB.toIEEE754Single(value);
                    break;
                case solace.SDTFieldType.DOUBLETYPE:
                    tag = smfDTypes.Float;
                    field_val = IEEE754LIB.toIEEE754Double(value);
                    break;
                case solace.SDTFieldType.MAP:
                    tag = smfDTypes.Map;
                    field_val = encodeMapFn(value);
                    break;
                case solace.SDTFieldType.STREAM:
                    tag = smfDTypes.Stream;
                    field_val = encodeStreamFn(value);
                    break;
                case solace.SDTFieldType.DESTINATION:
                    tag = smfDTypes.Destination;
                    if (value instanceof solace.Topic) {
                        field_val = solace.Convert.int8ToStr(0x00);
                        field_val += solace.Util.nullTerminate(value.getName());
                    }
                    break;
                case solace.SDTFieldType.NULLTYPE:
                    tag = smfDTypes.Null;
                    field_val = "";
                    break;
                case solace.SDTFieldType.UNKNOWN:
                    field_val = null;
                    break;
            }
            if (field_val !== null) {
                var hdr = encodeHeader(tag, field_val.length);
                buf.push(hdr);
                buf.push(field_val);
            }
        }

        function encodeSingleElement(sdtfield) {
            var buf = [];
            encodeSingleElementToBuf(sdtfield, buf);
            return buf.join("");
        }

        // encodes and returns a map value (string of mapentries)
        function encodeMap(sdtmap) {
            var buf = [];
            if (! (sdtmap instanceof solace.SDTMapContainer)) {
                return null; // skip!
            }
            var keys = sdtmap.getKeys();
            var sdtfield = null;
            var strKeyField = null;
            var strKeyName = null;
            for (var i = 0; i < keys.length; i++) {
                sdtfield = sdtmap.getField(keys[i]);
                if (sdtfield) {
                    // === KEY ===
                    strKeyName = solace.Util.nullTerminate(keys[i]);
                    strKeyField = encodeHeader(smfDTypes.String, strKeyName.length);
                    strKeyField += strKeyName;
                    buf.push(strKeyField);

                    // === VALUE ===
                    encodeSingleElementToBuf(sdtfield, buf);
                }
            } // end iter over keys
            return buf.join("");
        }
        encodeMapFn = encodeMap;

        function encodeStream(sdtstream) {
            var buf = [];
            if (! (sdtstream instanceof solace.SDTStreamContainer)) {
                return null; // skip!
            }
            var sdtfield = null;
            while(sdtstream.hasNext()) {
                sdtfield = sdtstream.getNext();
                if (sdtfield) {
                    encodeSingleElementToBuf(sdtfield, buf);
                }
            } // end iter over stream entries
            return buf.join("");
        }
        encodeStreamFn = encodeStream;

        function parseMapAt(data, offset, datalen) {
            var pos = offset;
            var mapObj = new solace.SDTMapContainer();
            while( pos < offset + datalen ) {
                // === key field ===
                var keyFieldHeader = parseFieldHeader(data, pos);
                pos += keyFieldHeader[3]; // consumed bytes
                // pos now points to start of string
                if (keyFieldHeader[0] !== smfDTypes.String) {
                    // Fail!
                    SOLACE_LOG_ERROR("Error parsing SDTMAP, expected to find a string field as map key, and didn't");
                    return crSdtField(solace.SDTFieldType.MAP,  null);
                }
                var keyString = data.substr(pos, keyFieldHeader[2]-1);
                pos += keyFieldHeader[2];

                // === value field ===
                // pos now points to start of next value
                var valueField_header = parseFieldHeader(data, pos);
                var valueField = parseSingleElement(data, pos);
                pos += valueField_header[1]; // declared field length
                mapObj.addField(keyString, valueField);
            }
            return crSdtField(solace.SDTFieldType.MAP, mapObj);
        }
        parseMapFn = parseMapAt;

        function parseStreamAt(data, offset, datalen) {
            var streamObj = new solace.SDTStreamContainer();
            var pos = offset;
            while (pos < offset + datalen) {
                var valueField_header = parseFieldHeader(data, pos);
                var valueField = parseSingleElement(data, pos);
                pos += valueField_header[1]; // declared field length
                if (valueField) {
                    streamObj.addField(valueField);
                }
            }
            return crSdtField(solace.SDTFieldType.STREAM, streamObj);
        }
        parseStreamFn = parseStreamAt;

        return {
            parseSdt: parseSingleElement,
            encodeSdt: encodeSingleElement,
            IEEE754LIB: IEEE754LIB
        };
    }());

}(solace));

//
/*global solace:true,window,global,escape,unescape,WebSocket,ArrayBuffer,Uint8Array,WebSocket,QUnit,SOLACE_LOG_FATAL,SOLACE_LOG_ERROR,SOLACE_LOG_WARN,SOLACE_LOG_INFO,SOLACE_LOG_DEBUG,SOLACE_LOG_TRACE */
// 
// 
//
//

(function(solace) {

    // shortcuts to static or singleton class
    var ErrorSubcode = solace.ErrorSubcode;
    var SessionEventCode = solace.SessionEventCode;
    var TransportSessionEventCode = solace.TransportSessionEventCode;
    var GlobalContext = solace.GlobalContext;
    var P2PUtil = solace.P2PUtil;
    var TopicUtil = solace.TopicUtil;
    var StringUtil = solace.StringUtil;
    var Util = solace.Util;
    var StatType = solace.StatType;
    var MutableSessionProperty = solace.MutableSessionProperty;
    var SessionState = solace.SessionState;
    var strFmt = solace.Util.strFmt;

    var SolClientRequestPrefix = "#REQ";
    
    /**
     * @class
     * Represents a Client Session.
     * <p>
     * <strong>Note: </strong>To create an instance of solace.Session, applications should use {@link solace.SolclientFactory.createSession} and avoid
     * using the solace.Session constructor.
     * </p>
     * @param {solace.SessionProperties} sessionProperties Properties to use for constructing the session.
     * @param {solace.MessageRxCBInfo} messageCallbackInfo
     * @param {solace.SessionEventCBInfo} eventCallbackInfo
     *
     * @constructor
     * @throws {solace.OperationError} if the parameters have an invalid type or value. Subcode: {@link solace.ErrorSubcode.PARAMETER_INVALID_TYPE}.
     */
    solace.Session = function Session(sessionProperties, messageCallbackInfo, eventCallbackInfo) {
        // Must assert that the following arguments are not null
        if (!sessionProperties) {
            throw new solace.OperationError("Session properties cannot be null",
                    ErrorSubcode.PARAMETER_OUT_OF_RANGE);
        }
        sessionProperties.sol_validate();

        this.m_sessionProperties = sessionProperties.clone();
        this.resetTransportProtocolHandler();

        // Validate session properties assigned to transport protocol handler
        this.m_transportProtocolHandler.validateProperties();

        if (!(messageCallbackInfo instanceof solace.MessageRxCBInfo)) {
            throw new solace.OperationError("Invalid parameter type for messageCallbackInfo", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        if (!(eventCallbackInfo instanceof solace.SessionEventCBInfo)) {
             throw new solace.OperationError("Invalid parameter type for eventCallbackInfo", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }

        // Callbacks to client application
        this.m_messageCallbackInfo = messageCallbackInfo;
        this.m_eventCallbackInfo = eventCallbackInfo;

        // client name generation is applicable
        if (!(StringUtil.notEmpty(this.m_sessionProperties.clientName))) {
            // Auto-gen clientName
            this.m_sessionProperties.clientName = solace.GlobalContext.GenerateClientName();
        }

        // generate userIdentification
        this.m_sessionProperties.userIdentification = solace.GlobalContext.GenerateUserIdentification();

        // client description generation is applicable
         if (!(StringUtil.notEmpty(this.m_sessionProperties.applicationDescription))) {
            // Auto-gen applicationDescription
            this.m_sessionProperties.applicationDescription = solace.GlobalContext.GenerateClientDescription();
        }

        this.m_sessionState = 0;
        this.m_sessionStatistics = new solace.SessionStatistics();

        /**
         * The following fields are destroyed when disconnect is called
         * and recreated when connect is called again.
         * @private
         */
        this.m_sessionId = null;
        // Need to reschedule keepAliveTimer when some other write operation happens
        this.m_keepAliveTimer = null;
        this.m_keepAliveCounter = 0;
        this.m_outstandingCtrlReqs = {};
        this.m_outstandingDataReqs = {};

        this.m_newSession = true;
        this.m_inReconnect = false;
        this.m_disposed = false;

        this.m_smfClient = null;
        this.m_kaStats = {lastMsgWritten: 0, lastBytesWritten: 0};
        this.m_capabilities = null;
        /**
         * The following fields are destroyed when dispose is called
         * and cannot be reinitialized.
         * @private
         */
        this.m_subscriptionCache = null;
        this.m_subscriptionCacheKeys = null;
        this.m_subscriptionCacheCount = 0;
        if (this.m_sessionProperties.reapplySubscriptions) {
            this.m_subscriptionCache = {};
        }
        this.m_seqNum = 1;

        // When negotiating the initial transport, we can fail and transparently reconnect.
        this.m_lastKnownGoodTransport = null;
    };

    /**
     * Connects the session to the appliance given the
     * {@link solace.SessionProperties#url}.
     * <p>
     * If the call is successful, an event is generated on the session event callback
     * stating that the session's state is changing to connecting and then connected.
     * <p>
     * If {@link solace.SessionProperties#reapplySubscriptions} is set to true,
     * this operation re-registers previously registered subscriptions.
     * The connected session event ({@link solace.SessionEventCode.UP_NOTICE}) is generated only
     * when all the subscriptions are successfully added to the appliance.
     * <p>
     * If the API is unable to connect within {@link solace.SessionProperties#connectTimeoutInMsecs}
	 * or due to login failures, the session's state transitions back to 'disconnected'
     * and an event is generated.
     * <p>
     * <strong>Note:</strong> Before the session's state transitions to 'connected',
     * a client application cannot use the session; any attempt to
     * call functions will throw {@link solace.OperationError}.
     * 
     *
     * @throws {solace.OperationError} if the session is disposed, already connected or connecting. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     * @throws {solace.OperationError} if the underlying transport cannot be established. Subcode: {@link solace.ErrorSubcode.INTERNAL_CONNECTION_ERROR}.
     */
    solace.Session.prototype.connect = function() {
        // The public API entry point overrides the first protocol to try with the last known successful
        // protocol. The internal version bypasses this mechanism to allow downgrades.
        this.beginConnect(this.m_lastKnownGoodTransport);
    };

    solace.Session.prototype.connectInternal = function() {
        try {
            this.beginConnect(null);
        } catch (e) {
            SOLACE_LOG_ERROR("Downgrade connect failed for" + this.getSessionIdForLogging() + ", exception: " + e.message);
            this.m_inReconnect = false;
            // change state
            this.changeState(9);
             // notify client
            var sessionEvent = new solace.SessionEvent(SessionEventCode.CONNECT_FAILED_ERROR,
                        "Downgrade connect failed.", null,
                        (e.subcode)?e.subcode:ErrorSubcode.UNKNOWN_ERROR, null, e);
            this.sendEvent(sessionEvent);
        }
    };

    solace.Session.prototype.beginConnect = function(overrideTransport) {
        var result = this.allowOperation(0);

        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }

        if (this.m_newSession) {
            this.m_newSession = false;
        }
        else {
            // cleanup in case connect has been previously called
            this.cleanupSession();
            this.m_inReconnect = true;
        }

        // Start a connect timer if it isn't already running
        // Handles both connect and reconnect paths, assuming timer is
        // always cleaned up properly
        if (! this.m_connectTimer) {
            this.setConnectTimer();
        }

        var self = this;

        SOLACE_LOG_DEBUG("Creating transport session " + this.m_sessionProperties.url + this.getSessionIdForLogging());
        this.m_kaStats = {lastMsgWritten: 0, lastBytesWritten: 0};

        var propCopy = this.m_sessionProperties.clone();
        if (overrideTransport) {
            this.m_transportProtocolHandler.setProtocol(overrideTransport);
        }
        propCopy.transportProtocol = this.m_transportProtocolHandler.getTransportProtocol();

        // If there is no remaining downgrade, set the downgrade timeout to 0.
        // The transport will interpret this as "no timeout."
        if (! this.m_transportProtocolHandler.shouldRetry()) {
            propCopy.transportDowngradeTimeoutInMsecs = 0;
        }

        this.m_smfClient = new solace.SMFClient(propCopy,
                function(rxData)            { self.handleSmfMessage(rxData);                },
                function(rxError)           { self.handleSmfParseError(rxError);            },
                function(transportEvent)    { self.handleTransportEvent(transportEvent);    },
                self
        );

        // change state
        this.changeState(2);

        // notify client
        var sessionEvent = new solace.SessionEvent(SessionEventCode.CONNECTING,
            strFmt("Establishing connection (transport:{0})", this.m_transportProtocolHandler),
            null, null, null, null);
        this.sendEvent(sessionEvent);

        try {
            var returnCode = this.m_smfClient.connect();
            if (returnCode !== 0) {
                this.clearConnectTimer();
                throw new solace.OperationError("Cannot establish transport session",
                        ErrorSubcode.INTERNAL_CONNECTION_ERROR, solace.TransportReturnCodeDescription[returnCode]);
            }
        } catch (e) {
            this.clearConnectTimer();
            throw new solace.OperationError("Cannot establish transport session",
                        ErrorSubcode.INTERNAL_CONNECTION_ERROR, e);
        }
    };

    /**
     * @private
     */
    solace.Session.prototype.setConnectTimer = function() {
        this.clearConnectTimer();

        var self = this;
        this.m_connectTimer = setTimeout(function() {
            self.handleConnectTimeout();
        }, this.m_sessionProperties.connectTimeoutInMsecs);
    };

    /**
     * @private
     */
    solace.Session.prototype.clearConnectTimer = function() {
        if (this.m_connectTimer) {
            clearTimeout(this.m_connectTimer);
            this.m_connectTimer = null;
        }
    };

    /**
     * @private
     */
    solace.Session.prototype.handleConnectTimeout = function() {
        SOLACE_LOG_ERROR("Connection timeout. Disconnecting" + this.getSessionIdForLogging());
        this.m_inReconnect = false;
        this.disconnectInternal();
    };

    solace.Session.prototype.resetTransportProtocolHandler = function() {
        this.m_transportProtocolHandler = new solace.TransportProtocolHandler(this.m_sessionProperties);
    };

    /**
     * Disconnects the session.
     *
     * @throws {solace.OperationError} if the session is disposed, or has never been connected. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     */
    solace.Session.prototype.disconnect = function() {
        // this.m_inReconnect = false;
        this.disconnectInternal();
    };

    solace.Session.prototype.disconnectInternal = function() {
        var result = this.allowOperation(1);
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }

        SOLACE_LOG_INFO("Disconnecting session" + this.getSessionIdForLogging());
        if (this.m_sessionState !== 1 &&
                this.m_sessionState !== 10) {

            this.m_sessionState = 10;

        } else if (this.m_sessionState === 1) {
            // Already disconnected.
            // DO NOT send an event in this case, it can screw up session logic.
        }

        this.clearConnectTimer();
        this.cleanupSession();
        this.resetTransportProtocolHandler();
        this.destroyTransportSession();
    };

    /**
     * Release all resources associated with the session.
     */
    solace.Session.prototype.dispose = function() {
        try {
            if (this.m_disposed) {
                return;
            }
            SOLACE_LOG_INFO("Release session resources" + this.getSessionIdForLogging());
            if (this.allowOperation(1) === null) {
                this.m_inReconnect = false;
                this.disconnectInternal();
            }
            this.m_capabilities = null;
            if (this.m_sessionStatistics) {
                this.m_sessionStatistics.resetStats();
            }
            this.m_sessionStatistics = null;
            if (this.m_subscriptionCache) {
                SOLACE_LOG_DEBUG("Clear subscription cache" + this.getSessionIdForLogging());
                for (var index in this.m_subscriptionCache) {
                    if (this.m_subscriptionCache.hasOwnProperty(index)) {
                        this.removeFromSubscriptionCache(index);
                    }
                }
            }
            this.m_subscriptionCache = null;
            this.clearSubscriptionCacheKeys();
            this.m_subscriptionCacheCount = 0;
            this.m_outstandingCtrlReqs = null;
            this.m_outstandingDataReqs = null;
            this.m_disposed = true;
        } catch (e) {
            // do nothing
        }
    };

    /**
     * Subscribe to a topic, optionally requesting a confirmation from the appliance.
     *
     * <p>
     * If requestConfirmation is set to true, session event {@link solace.SessionEventCode.SUBSCRIPTION_OK} is generated
     * when subscription is added successfully; otherwise, session event {@link solace.SessionEventCode.SUBSCRIPTION_ERROR}
     * is generated.
     * </p>
     * <p>
     * If requestConfirmation is set to false, only session event {@link solace.SessionEventCode.SUBSCRIPTION_ERROR} is
     * generated upon failure.
     * </p>
     * <p>
     * When the application receives session event {@link solace.SessionEventCode.SUBSCRIPTION_ERROR}, it can obtain
     * the failed topic subscription by calling {@link solace.SessionEvent#reason}. The returned string is in the format
     * of "Topic: <failed topic subscription>".
     * </p>
     *
     * @param {solace.Topic} topic The topic subscription to add.
     * @param {boolean} requestConfirmation true, to request a confirmation; false
     * otherwise.
     * @param {Object} correlationKey If specified, this value is echoed in the
     * session event within {@link solace.SessionEvent}.
     * @param {number} requestTimeout The request timeout period (in milliseconds).	
     * If specified, this value overwrites readTimeoutInMsecs property
     * in {@link solace.SessionProperties}.
     *
     * @throws {solace.OperationError} if the session is disposed or disconnected. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     * @throws {solace.OperationError} if the parameters have an invalid type. Subcode: {@link solace.ErrorSubcode.PARAMETER_INVALID_TYPE}.
     * @throws {solace.OperationError} if the parameters have an invalid value. Subcode: {@link solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE}.
     * @throws {solace.OperationError} if the topic has invalid syntax. Subcode: {@link solace.ErrorSubcode.INVALID_TOPIC_SYNTAX}.
     * @throws {solace.OperationError} if there's no space in the transport to send the request. Subcode: {@link solace.ErrorSubcode.INSUFFICIENT_SPACE}.
     */
    solace.Session.prototype.subscribe = function(topic, requestConfirmation,
                                                  correlationKey, requestTimeout) {
        var result = this.allowOperation(4);
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }
        if (!(topic instanceof solace.Topic)) {
            throw new solace.OperationError("Invalid parameter type for topic.", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        result = TopicUtil.validateTopic(topic.getName());
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_TOPIC_SYNTAX, null);
        }
        if (typeof requestConfirmation !== "undefined" && requestConfirmation !== null && typeof requestConfirmation !== "boolean") {
             throw new solace.OperationError("Invalid parameter type for requestConfirmation.", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        if (typeof requestTimeout !== "undefined" && requestTimeout !== null) {
            if (typeof requestTimeout !== "number") {
                throw new solace.OperationError("Invalid parameter type for requestTimeout.", ErrorSubcode.PARAMETER_INVALID_TYPE);
            }
            else if (requestTimeout <= 0) {
                throw new solace.OperationError("Request timeout must be greater than 0.", ErrorSubcode.PARAMETER_OUT_OF_RANGE);
            }
        }

        var myThis = this;
        this.subscriptionUpdate(topic, requestConfirmation, correlationKey, requestTimeout,
                2,
                function (rxMsgObj, cancelledRequest) {myThis.handleSubscriptionUpdateResponse(rxMsgObj, cancelledRequest);});
    };

    /**
     * Unsubscribe from a topic, and optionally request a confirmation from the appliance.
     *
     * <p>
     * If requestConfirmation is set to true, session event {@link solace.SessionEventCode.SUBSCRIPTION_OK} is generated
     * when subscription is removed successfully; otherwise, session event {@link solace.SessionEventCode.SUBSCRIPTION_ERROR} 
     * is generated.
     * </p>
     * <p>
     * If requestConfirmation is set to false, only session event {@link solace.SessionEventCode.SUBSCRIPTION_ERROR} is
     * generated upon failure.
     * </p>
     * <p>
     * When the application receives session event {@link solace.SessionEventCode.SUBSCRIPTION_ERROR}, it can obtain
     * the failed topic subscription by calling {@link solace.SessionEvent#reason}. The returned string is in the format
     * of "Topic: <failed topic subscription>".
     * </p>
     *
     * @param {solace.Topic} topic The topic subscription to remove.
     * @param {boolean} requestConfirmation true, to request a confirmation; false
     * otherwise.
     * @param {Object} correlationKey If <code>null</code> or undefined, a
     * Correlation Key is not set in the confirmation session event.
     * @param {number} requestTimeout The request timeout period (in milliseconds). 
	 * If specified, this value overwrites readTimeoutInMsecs
     * property in {@link solace.SessionProperties}.
     *
     * @throws {solace.OperationError} if the session is disposed or disconnected. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     * @throws {solace.OperationError} if the parameters have an invalid type. Subcode: {@link solace.ErrorSubcode.PARAMETER_INVALID_TYPE}.
     * @throws {solace.OperationError} if the parameters have an invalid value. Subcode: {@link solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE}.
     * @throws {solace.OperationError} if the topic has invalid syntax. Subcode: {@link solace.ErrorSubcode.INVALID_TOPIC_SYNTAX}.
     * @throws {solace.OperationError} if there's no space in the transport to send the request. Subcode: {@link solace.ErrorSubcode.INSUFFICIENT_SPACE}.
     */
    solace.Session.prototype.unsubscribe = function(topic, requestConfirmation,
                                                    correlationKey, requestTimeout) {
        var result = this.allowOperation(4);
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }
        if (!(topic instanceof solace.Topic)) {
            throw new solace.OperationError("Invalid parameter type for topic.", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        result = TopicUtil.validateTopic(topic.getName());
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_TOPIC_SYNTAX, null);
        }
        if (typeof requestConfirmation !== "undefined" && requestConfirmation !== null && typeof requestConfirmation !== "boolean") {
             throw new solace.OperationError("Invalid parameter type for requestConfirmation.", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        if (typeof requestTimeout !== "undefined" && requestTimeout !== null) {
            if (typeof requestTimeout !== "number") {
                throw new solace.OperationError("Invalid parameter type for requestTimeout", ErrorSubcode.PARAMETER_INVALID_TYPE);
            }
            else if (requestTimeout <= 0) {
                throw new solace.OperationError("Request timeout must be greater than 0.", ErrorSubcode.PARAMETER_OUT_OF_RANGE);
            }
        }
        var myThis = this;
        this.subscriptionUpdate(topic, requestConfirmation, correlationKey, requestTimeout,
                3,
                function (rxMsgObj, cancelledRequest) {myThis.handleSubscriptionUpdateResponse(rxMsgObj, cancelledRequest);});
    };

    /**
     * Modify a session property after creation of the session.
     *
     * @param {solace.MutableSessionProperty} mutableSessionProperty The property key to modify.
     * @param {Object} newValue The new property value.
     * @param {number} requestTimeout The request timeout period (in milliseconds). 
	 * If specified, it overwrites readTimeoutInMsecs
     * @param {Object} correlationKey If specified, this value is echoed in the
     * session event within {@link solace.SessionEvent} property
     * in {@link solace.SessionProperties}
     *
     * @throws {solace.OperationError} if the session is disposed or disconnected. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     * @throws {solace.OperationError} if the parameters have an invalid type. Subcode: {@link solace.ErrorSubcode.PARAMETER_INVALID_TYPE}.
     * @throws {solace.OperationError} if the parameters have an invalid value. Subcode: {@link solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE}.
     * @throws {solace.OperationError} if there's no space in the transport to send the request. Subcode: {@link solace.ErrorSubcode.INSUFFICIENT_SPACE}.
     */
    solace.Session.prototype.updateProperty = function(mutableSessionProperty,
                                                       newValue,
                                                       requestTimeout,
                                                       correlationKey) {
        var result = this.allowOperation(4);
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }
        var valid = false;
        for (var index in MutableSessionProperty) {
            if (MutableSessionProperty.hasOwnProperty(index)) {
                if (MutableSessionProperty[index] === mutableSessionProperty) {
                    valid = true;
                }
            }
        }
        if (!valid) {
             throw new solace.OperationError("Invalid parameter value for mutableSessionProperty.", ErrorSubcode.PARAMETER_OUT_OF_RANGE);
        }
        if (typeof requestTimeout !== "undefined" && requestTimeout !== null) {
            if (typeof requestTimeout !== "number") {
                throw new solace.OperationError("Invalid parameter type for requestTimeout.", ErrorSubcode.PARAMETER_INVALID_TYPE);
            }
            else if (requestTimeout <= 0) {
                throw new solace.OperationError("Request timeout must be greater than 0.", ErrorSubcode.PARAMETER_OUT_OF_RANGE);
            }
        }        

        var req_types = [];
        req_types[MutableSessionProperty.CLIENT_DESCRIPTION] = 6;
        req_types[MutableSessionProperty.CLIENT_NAME] = 5;

        var correlationTag = this.m_smfClient.nextCorrelationTag();
        var cc = solace.smf.ClientCtrlMessage.getUpdate(
                mutableSessionProperty, newValue, correlationTag);

        var myThis = this;
        var sessionEvent;
        var PROPERTY_UPDATE_OK = SessionEventCode.PROPERTY_UPDATE_OK;
        var PROPERTY_UPDATE_ERROR = SessionEventCode.PROPERTY_UPDATE_ERROR;

        var returnCode = this.m_smfClient.send(cc);
        if (returnCode !== 0) {
            // change session state
            this.changeState(9);

            if (returnCode === 2) {
                sessionEvent = new solace.SessionEvent(PROPERTY_UPDATE_ERROR,
                    "Property update failed - no space in transport",
                    null, ErrorSubcode.INSUFFICIENT_SPACE, null, null);
            } else {
                sessionEvent = new solace.SessionEvent(PROPERTY_UPDATE_ERROR,
                    "Property update failed",
                    null, ErrorSubcode.INVALID_SESSION_OPERATION, null, null);
            }
            this.sendEvent(sessionEvent);
        } else {
            this.updateTxStats(cc);
            /*
             Response CB to the CLIENTCTRL UPDATE response

             This is pretty complicated: the reason we need to define the whole logical process in here using
             callbacks is that it's a way to preserve state such as the correlationKey of the user request.
             That is, this entire multi-step process executes under the context of that one call to updateProperty
             with a single correlationKey value.
             */
            var response_cb = function(respMsg) {
                var response = respMsg.getResponse();
                if (response.ResponseCode === 200) {
                    if (mutableSessionProperty === MutableSessionProperty.CLIENT_DESCRIPTION) {
                        // update property and notify client
                        myThis.m_sessionProperties.applicationDescription = newValue;
                        sessionEvent = new solace.SessionEvent(PROPERTY_UPDATE_OK,
                                response.ResponseString, response.ResponseCode, 0, correlationKey, null);
                        myThis.sendEvent(sessionEvent);
                    } else if (mutableSessionProperty === MutableSessionProperty.CLIENT_NAME) {
                        // replace P2P subscription: REM and ADD
                        var oldP2pTopic = P2PUtil.getP2PTopicSubscription(myThis.m_sessionProperties.p2pInboxBase);
                        var newP2pTopic = P2PUtil.getP2PTopicSubscription(respMsg.getP2PTopicValue());

                        var cb_after_add = function(smpResp) {
                            var resp = smpResp.getResponse();
                            if (resp.ResponseCode === 200) {
                                // notify client
                                myThis.m_sessionProperties.p2pInboxBase = respMsg.getP2PTopicValue()||"";
                                myThis.m_sessionProperties.p2pInboxInUse = P2PUtil.getP2PInboxTopic(myThis.m_sessionProperties.p2pInboxBase);
                                myThis.m_sessionProperties.clientName = newValue;
                                sessionEvent = new solace.SessionEvent(PROPERTY_UPDATE_OK,
                                resp.ResponseString, resp.ResponseCode, 0, correlationKey, null);
                                myThis.sendEvent(sessionEvent);
                            }
                            else {
                                var errorSubCode = solace.ErrorResponseSubCodeMapper.getErrorSubCode(resp.ResponseCode, resp.ResponseString);
                                if (errorSubCode === ErrorSubcode.SUBSCRIPTION_ALREADY_PRESENT &&
                                        myThis.m_sessionProperties.ignoreDuplicateSubscriptionError) {
                                    // notify client
                                    sessionEvent = new solace.SessionEvent(PROPERTY_UPDATE_OK,
                                    resp.ResponseString, resp.ResponseCode, 0, correlationKey, null);
                                    myThis.sendEvent(sessionEvent);
                                }
                                else if (errorSubCode === ErrorSubcode.SUBSCRIPTION_ALREADY_PRESENT ||
                                        errorSubCode === ErrorSubcode.SUBSCRIPTION_ATTRIBUTES_CONFLICT ||
                                        errorSubCode === ErrorSubcode.SUBSCRIPTION_INVALID ||
                                        errorSubCode === ErrorSubcode.SUBSCRIPTION_ACL_DENIED ||
                                        errorSubCode === ErrorSubcode.SUBSCRIPTION_TOO_MANY) {
                                    // notify client
                                    sessionEvent = new solace.SessionEvent(PROPERTY_UPDATE_ERROR,
                                            resp.ResponseString, resp.ResponseCode, errorSubCode, correlationKey, null);
                                    myThis.sendEvent(sessionEvent);
                                }
                                else {
                                    // notify client
                                    sessionEvent = new solace.SessionEvent(PROPERTY_UPDATE_ERROR,
                                            resp.ResponseString, resp.ResponseCode, ErrorSubcode.SUBSCRIPTION_ERROR_OTHER,
                                            correlationKey, null);
                                    myThis.sendEvent(sessionEvent);
                                }
                            }
                        };

                        var cb_after_rem = function(smpResp) {
                            var resp = smpResp.getResponse();
                            if (resp.ResponseCode === 200) {
                                myThis.sendUpdateP2PInboxReg(true, newP2pTopic, correlationKey, cb_after_add);
                            }
                            else {
                                var errorSubCode = solace.ErrorResponseSubCodeMapper.getErrorSubCode(resp.ResponseCode, resp.ResponseString);
                                if (errorSubCode === ErrorSubcode.SUBSCRIPTION_NOT_FOUND &&
                                        myThis.m_sessionProperties.ignoreSubscriptionNotFoundError) {
                                    myThis.sendUpdateP2PInboxReg(true, newP2pTopic, correlationKey, cb_after_add);
                                }
                                else if (errorSubCode === ErrorSubcode.SUBSCRIPTION_ATTRIBUTES_CONFLICT ||
                                        errorSubCode === ErrorSubcode.SUBSCRIPTION_INVALID ||
                                        errorSubCode === ErrorSubcode.SUBSCRIPTION_NOT_FOUND ||
                                        errorSubCode === ErrorSubcode.SUBSCRIPTION_ACL_DENIED) {
                                    // notify client
                                    sessionEvent = new solace.SessionEvent(PROPERTY_UPDATE_ERROR,
                                            resp.ResponseString, resp.ResponseCode, errorSubCode, null, null);
                                    myThis.sendEvent(sessionEvent);
                                }
                                else {
                                    // notify client
                                    sessionEvent = new solace.SessionEvent(PROPERTY_UPDATE_ERROR,
                                            resp.ResponseString, resp.ResponseCode,
                                            ErrorSubcode.SUBSCRIPTION_ERROR_OTHER, null, null);
                                    myThis.sendEvent(sessionEvent);
                                }
                            }

                        };

                        // fire remove old P2P
                        myThis.sendUpdateP2PInboxReg(false, oldP2pTopic, correlationKey, cb_after_rem);
                    }
                } else {
                    // notify client error
                    var errorSubCode = solace.ErrorResponseSubCodeMapper.getErrorSubCode(response.ResponseCode, response.ResponseString);
                    sessionEvent = new solace.SessionEvent(PROPERTY_UPDATE_ERROR,
                            response.ResponseString, response.ResponseCode, errorSubCode, correlationKey, null);
                    myThis.sendEvent(sessionEvent);
                }
            }; // end CB (response to UPDATE request)
            this.enqueueOutstandingCtrlReq(correlationTag,
                    function() {
                        myThis.handleOperationTimeout(correlationTag, "Update request timeout");
                    },
                    requestTimeout || this.m_sessionProperties.readTimeoutInMsecs,
                    req_types[mutableSessionProperty] || 0,
                    correlationKey,
                    response_cb);
        }
    };

    /**
     * Publish (send) a message over the session. The message is sent to its set destination.
     *
     * @param {solace.Message} message The message to send. It must have a destination set.
     * 
     * @throws {solace.OperationError} if the session is disposed or disconnected. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     * @throws {solace.OperationError} if the parameters have an invalid type. Subcode: {@link solace.ErrorSubcode.PARAMETER_INVALID_TYPE}.
     * @throws {solace.OperationError} if the message does not have a topic. Subcode: {@link solace.ErrorSubcode.TOPIC_MISSING}.
     * @throws {solace.OperationError} if there's no space in the transport to send the request. Subcode: {@link solace.ErrorSubcode.INSUFFICIENT_SPACE}.
     * @throws {solace.OperationError} if the message delivery mode is {@link solace.MessageDeliveryModeType.PERSISTENT} or 
     * {@link solace.MessageDeliveryModeType.NON_PERSISTENT}. Subcode: {@link solace.ErrorSubcode.AD_MESSAGING_NOT_SUPPORTED}.
     */
    solace.Session.prototype.send = function(message) {
        var result = this.allowOperation(5);
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }
        if (!(message instanceof solace.Message)) {
            throw new solace.OperationError("Invalid parameter type for message", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }

        this.handleSendMessage(message);
    };

    /**
     * Sends a request using user-specified callback functions.
     * <br>
     * <strong>Note:</strong>
     * The API sets the correlationId and replyTo fields of the message being sent;
     * this overwrites any existing correlationId and replyTo values on the message.
     *
     * @param {solace.Message} message The request message to send.
     * @param {number} timeout The timeout value (in milliseconds). The minimum value is 100 msecs.
     * @param {function(solace.Session, solace.Message, Object, Object)} replyReceivedCBFunction The prototype of this function
     * is: ({@link solace.Session}, {@link solace.Message},
     * userObject {Object}, RFUObject {Object})
     * @param {function(solace.Session, solace.SessionEvent, Object, Object)} requestFailedCBFunction 
	 * The prototype of this function is: ({@link solace.Session}, {@link solace.SessionEvent},
     * userObject {Object}, RFUObject {Object})
     * @param {Object} userObject An optional correlation object to use in the response callback.
     * 
     * @throws {solace.OperationError} if the session is disposed or disconnected. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     * @throws {solace.OperationError} if the parameters have an invalid type. Subcode: {@link solace.ErrorSubcode.PARAMETER_INVALID_TYPE}.
     * @throws {solace.OperationError} if the parameters have an invalid value. Subcode: {@link solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE}.
     * @throws {solace.OperationError} if the message does not have a topic. Subcode: {@link solace.ErrorSubcode.TOPIC_MISSING}.
     * @throws {solace.OperationError} if there's no space in the transport to send the request. Subcode: {@link solace.ErrorSubcode.INSUFFICIENT_SPACE}.
     * @throws {solace.OperationError} if the message delivery mode is {@link solace.MessageDeliveryModeType.PERSISTENT} or 
     * {@link solace.MessageDeliveryModeType.NON_PERSISTENT}. Subcode: {@link solace.ErrorSubcode.AD_MESSAGING_NOT_SUPPORTED}.
     */
    solace.Session.prototype.sendRequest = function(message, timeout, replyReceivedCBFunction,
           requestFailedCBFunction, userObject) {
        var result = this.allowOperation(5);
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }
        if (!(message instanceof solace.Message)) {
            throw new solace.OperationError("Invalid parameter type for message.", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        if (typeof timeout !== "undefined" && timeout !== null) {
            Util.checkParamTypeOf(timeout, "number", "timeout");
            if (timeout < 100) {
                throw new solace.OperationError("Request timeout must be greater than or equal to 100.", ErrorSubcode.PARAMETER_OUT_OF_RANGE);
            }
        }
        if (typeof replyReceivedCBFunction === "undefined" || replyReceivedCBFunction === null || typeof replyReceivedCBFunction !== "function") {
            throw new solace.OperationError("Invalid parameter type for replyReceivedCBFunction.", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        if (typeof requestFailedCBFunction === "undefined" || requestFailedCBFunction === null || typeof requestFailedCBFunction !== "function") {
            throw new solace.OperationError("Invalid parameter type for requestFailedCBFunction.", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }

        // set correlationId and replyTo fields
        message.setCorrelationId(SolClientRequestPrefix + GlobalContext.NextId());
        var replyToTopic = solace.SolclientFactory.createTopic(this.m_sessionProperties.p2pInboxInUse);
        message.setReplyTo(replyToTopic);

        this.handleSendMessage(message);

        // enqueue request
        this.enqueueOutstandingDataReq(message.getCorrelationId(), requestFailedCBFunction, timeout,
                replyReceivedCBFunction, userObject);

    };

    /**
     * Sends a reply message to the destination specified in messageToReplyTo.
     * <p>
     *
     * If <code>messageToReplyTo</code> is non-null, the following message properties
     * are copied to replyMessage:
     * <ul>
     *     <li>ReplyTo is copied to Destination, unless ReplyTo is null.
     *     <li>CorrelationId, unless it is null.
     * </ul>
     * <p>
     * If MessageToReplyTo is null, the application is responsible for setting
     * the Destination and CorrelationId on the replyMessage.
     * @param {solace.Message} messageToReplyTo The message to which a reply will be sent.
     * @param {solace.Message} replyMessage The reply to send.
     * 
     * @throws {solace.OperationError} if the session is disposed or disconnected. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     * @throws {solace.OperationError} if the parameters have an invalid type. Subcode: {@link solace.ErrorSubcode.PARAMETER_INVALID_TYPE}.
     * @throws {solace.OperationError} if the parameters have an invalid value. Subcode: {@link solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE}.
     * @throws {solace.OperationError} if the message does not have a topic. Subcode: {@link solace.ErrorSubcode.TOPIC_MISSING}.
     * @throws {solace.OperationError} if there's no space in the transport to send the request. Subcode: {@link solace.ErrorSubcode.INSUFFICIENT_SPACE}.
     * @throws {solace.OperationError} if the message delivery mode is {@link solace.MessageDeliveryModeType.PERSISTENT} or
     * {@link solace.MessageDeliveryModeType.NON_PERSISTENT}. Subcode: {@link solace.ErrorSubcode.AD_MESSAGING_NOT_SUPPORTED}.
     */
    solace.Session.prototype.sendReply = function(messageToReplyTo, replyMessage) {
        var result = this.allowOperation(5);
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }
        if (typeof messageToReplyTo !== "undefined" && messageToReplyTo !== null && !(messageToReplyTo instanceof solace.Message)) {
            throw new solace.OperationError("Invalid parameter type for messageToReplyTo.", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        if (!(replyMessage instanceof solace.Message)) {
             throw new solace.OperationError("Invalid parameter type for replyMessage.", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }

        replyMessage.setAsReplyMessage(true);
        if (typeof messageToReplyTo !== "undefined" && messageToReplyTo !== null) {
            replyMessage.setCorrelationId(messageToReplyTo.getCorrelationId());
            if (messageToReplyTo.getReplyTo() === null) {
                throw new solace.OperationError("ReplyTo destination may not be null.", ErrorSubcode.PARAMETER_OUT_OF_RANGE);
            }
            replyMessage.setDestination(messageToReplyTo.getReplyTo());
        }
        this.handleSendMessage(replyMessage);
    };

    /**
     * Returns the value of a given {@link solace.StatType}.
     * <br>
     * @param {solace.StatType} statType The statistic to query.
     * @return {number}
     *
     * @throws {solace.OperationError} if the session is disposed. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     * @throws {solace.OperationError} if the StatType is invalid. Subcode: {@link solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE}.
     */
    solace.Session.prototype.getStat = function(statType) {
        var result = this.allowOperation(7);
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }
        var valid = false;
        for (var index in StatType) {
            if (StatType.hasOwnProperty(index)) {
                if (StatType[index] === statType) {
                    valid = true;
                }
            }
        }
        if (!valid) {
             throw new solace.OperationError("Invalid parameter value for statType.", ErrorSubcode.PARAMETER_OUT_OF_RANGE);
        }
        return this.m_sessionStatistics.getStat(statType);
    };

    /**
     * Reset session statistics to 0.
     * 
     * @throws {solace.OperationError} if the session is disposed. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     */
    solace.Session.prototype.resetStats = function() {
        var result = this.allowOperation(7);
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }
        this.m_sessionStatistics.resetStats();
    };

    /**
     * Returns a clone of the SessionProperties for this session.
     *
     * @return {solace.SessionProperties}
     * @throws {solace.OperationError} if the session is disposed. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     */
    solace.Session.prototype.getSessionProperties = function() {
        var result = this.allowOperation(7);
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }

        var properties = this.m_sessionProperties.clone();
        if ((this.m_sessionState !== 1) && this.m_transportProtocolHandler) {
            properties.transportProtocolInUse = this.m_transportProtocolHandler.getTransportProtocol();
        }

        return properties;
    };    

    /**
     * Check the value of a boolean appliance capability.
     *
     * This function is a shortcut for <code>getCapability(...)</code>. It performs the same operation, only instead of
     * returning an <code>solace.SDTField</code> wrapping a capability value, it just returns the boolean value.
     * <p>
     * Attempting to query a non-boolean capability will return <code>null</code>.
     *
     * @param {solace.CapabilityType} capabilityType The capability to check.
     * @return {boolean} the value of the capability queried.
     * @throws {solace.OperationError} if the session is disposed. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     * @throws {solace.OperationError} if the parameters have an invalid type or value. Subcode: {@link solace.ErrorSubcode.PARAMETER_INVALID_TYPE}.
     */
    solace.Session.prototype.isCapable = function(capabilityType) {
        var result = this.allowOperation(7);
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }
        if (typeof capabilityType !== "number") {
            throw new solace.OperationError("Invalid parameter type for capabilityType.", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        var caps = this.m_capabilities;
        if (!caps) {
            return false;
        }
        // Guard for undefined OR non-boolean capability
        return (typeof caps[capabilityType] === "boolean") ? caps[capabilityType] : false;
    };

    /**
     * Get the value of an appliance capability, or null if unknown. This function must
	 * be called after connecting the session.
     * <br>
     * SDT Type conversions:
     * <ul>
     * <li>String values are returned as SDTFieldType.STRING.
     * <li>Boolean values are returned as SDTFieldType.BOOL.
     * <li>All numeric values are returned as SDTFieldType.INT64.
     * </ul>
     * @param {solace.CapabilityType} capabilityType
     * @return {solace.SDTField}
     * @throws {solace.OperationError} if the session is disposed. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     * @throws {solace.OperationError} if the parameters have an invalid type or value. Subcode: {@link solace.ErrorSubcode.PARAMETER_INVALID_TYPE}.
     */
    solace.Session.prototype.getCapability = function(capabilityType) {
        var result = this.allowOperation(7);
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }
        if (typeof capabilityType !== "number") {
            throw new solace.OperationError("Invalid parameter type for capabilityType", ErrorSubcode.PARAMETER_INVALID_TYPE);
        }

        var caps = this.m_capabilities;
        if (!caps || typeof caps[capabilityType] === "undefined") {
            return null;
        }

        var val = caps[capabilityType];
        if (typeof val === "boolean") {
            return solace.SDTField.create(solace.SDTFieldType.BOOL, val);
        } else if (typeof val === "number") {
            return solace.SDTField.create(solace.SDTFieldType.INT64, val);
        } else if (typeof val === "string") {
            return solace.SDTField.create(solace.SDTFieldType.STRING, val);
        } else {
            return null;
        }
    };

    /**
     * Returns the session's state.
     * 
     * @return {solace.SessionState}
     * @throws {solace.OperationError} if the session is disposed. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}.
     */
    solace.Session.prototype.getSessionState = function() {
        var result = this.allowOperation(7);
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_SESSION_OPERATION, null);
        }
        switch (this.m_sessionState) {
            case 0:
                return SessionState.NEW;
            case 8:
                return SessionState.CONNECTED;
            case 10:
                return SessionState.DISCONNECTING;
            case 1:
                return SessionState.DISCONNECTED;
            case 9:
                return SessionState.SESSION_ERROR;
            default:
                return SessionState.CONNECTING;
        }
    };

    /**
     * Creates a CacheSession object that uses this Session to service its CacheRequests.  It should be destroyed
     * when the application no longer requires a CacheSession,
     * by calling {@link solace.CacheSession#dispose()}.
     *
     * @param properties {solace.CacheSessionProperties} The properties for the cache session.
     * @return {solace.CacheSession}
     * @throws {solace.OperationError} if a CacheSession is already associated with this Session.
     * Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}
     */
    solace.Session.prototype.createCacheSession = function(properties) {
        return new solace.CacheSession(properties, this);  
    };


    /**
     * @private
     * @param smfMessage
     */
    solace.Session.prototype.updateRxStats = function(smfMessage) {
        var smfHeader = smfMessage.getSmfHeader ? smfMessage.getSmfHeader() : null;
        if (smfHeader) {
            var msgLength = smfHeader.m_messageLength;
            switch (smfHeader.m_smf_protocol) {
                case 0x0d:
                    var respCode = smfHeader.m_pm_respcode;
                    if (respCode === 0) {
                        this.m_sessionStatistics.incStat(StatType.RX_TOTAL_DATA_MSGS);
                        this.m_sessionStatistics.incStat(StatType.RX_DIRECT_MSGS);
                        this.m_sessionStatistics.incStat(StatType.RX_TOTAL_DATA_BYTES, msgLength);
                        this.m_sessionStatistics.incStat(StatType.RX_DIRECT_BYTES, msgLength);
                        if (smfMessage.m_discardIndication) {
                            this.m_sessionStatistics.incStat(StatType.RX_DISCARD_MSG_INDICATION);
                        }
                    }
                    break;
                case 0x0c:
                case 0x0f:
                case 0x0a:
                case 0x0b:
                    this.m_sessionStatistics.incStat(StatType.RX_CONTROL_MSGS);
                    this.m_sessionStatistics.incStat(StatType.RX_CONTROL_BYTES, msgLength);
                    break;
            }
        }
    };

    /**
     * @private
     * @param smfMessage
     */
    solace.Session.prototype.updateTxStats = function(smfMessage) {
        if (typeof smfMessage.getReplyTo !== "undefined" && smfMessage.getReplyTo()) {
            // update stats
            this.m_sessionStatistics.incStat(StatType.TX_REQUEST_SENT);
        }

        var smfHeader = smfMessage.getSmfHeader ? smfMessage.getSmfHeader() : null;
        if (smfHeader) {
            var msgLength = smfHeader.m_messageLength;
            switch (smfHeader.m_smf_protocol) {
                case 0x0d:
                    this.m_sessionStatistics.incStat(StatType.TX_TOTAL_DATA_MSGS);
                    this.m_sessionStatistics.incStat(StatType.TX_DIRECT_MSGS);
                    this.m_sessionStatistics.incStat(StatType.TX_TOTAL_DATA_BYTES, msgLength);
                    this.m_sessionStatistics.incStat(StatType.TX_DIRECT_BYTES, msgLength);
                    break;
                case 0x0c:
                case 0x0f:
                case 0x0a:
                case 0x0b:
                    this.m_sessionStatistics.incStat(StatType.TX_CONTROL_MSGS);
                    this.m_sessionStatistics.incStat(StatType.TX_CONTROL_BYTES, msgLength);
                    break;
            }
        }
    };

    /**
     * @private
     * @param sessionEvent
     */
    solace.Session.prototype.sendEvent = function(sessionEvent) {
        if (sessionEvent) {
            if (this.m_eventCallbackInfo) {
                SOLACE_LOG_DEBUG(sessionEvent + this.getSessionIdForLogging());
                if (this.m_eventCallbackInfo.userObject) {
                    this.m_eventCallbackInfo.sessionEventCBFunction(this, sessionEvent,
                            this.m_eventCallbackInfo.userObject);
                }
                else {
                    this.m_eventCallbackInfo.sessionEventCBFunction(this, sessionEvent);
                }
            }
        }
    };

    /**
     * @private
     * @return false if session is already in unusable state, no need to notify client
     */
    solace.Session.prototype.shallNotifyClient = function() {
        return (this.m_sessionState !== 9 &&
            this.m_sessionState !== 10 &&
            this.m_sessionState !== 1 &&
            !this.m_disposed);
    };

    /**
     * @private
     * @param newState
     */
    solace.Session.prototype.changeState = function(newState) {
      if (newState && this.m_sessionState !== newState) {
          var oldState = this.m_sessionState;
          if ((oldState === 10 || oldState === 1) &&
                  newState !== 1) {
              if (oldState === 1 && this.m_inReconnect &&
                      newState === 2) {
                  this.m_sessionState = newState;
                  SOLACE_LOG_DEBUG("Session state is changed from " + solace.InternalSessionStateDescription[oldState] + " to " +
                    solace.InternalSessionStateDescription[newState] + this.getSessionIdForLogging());
                  return;
              }
              else {
                  SOLACE_LOG_DEBUG("Session state is " + solace.InternalSessionStateDescription[oldState] + ", no need to change to " +
                    solace.InternalSessionStateDescription[newState] + this.getSessionIdForLogging());
                  return;
              }
          }
          this.m_sessionState = newState;
          SOLACE_LOG_DEBUG("Session state is changed from " + solace.InternalSessionStateDescription[oldState] + " to " +
                  solace.InternalSessionStateDescription[newState] + this.getSessionIdForLogging());
          if (newState === 9) {
              SOLACE_LOG_WARN("Session error. Destroying transport");
              this.destroyTransportSession();
          }
      }
    };

    /**
     * @private
     * @param operationEnum the id of the operation
     * @return {?string} error message if not allowed; otherwise null
     */
    solace.Session.prototype.allowOperation = function (operationEnum) {
        var allow = true;
        if (this.m_disposed) {
            allow = false;
        }
        else {
            if (typeof operationEnum !== "undefined" && operationEnum !== null) {
                switch (operationEnum) {
                    case 0:
                        if (this.m_sessionState !== 0 &&
                                this.m_sessionState !== 1) {
                            allow = false;
                        }
                        break;
                    case 1:
                        if (this.m_sessionState === 0) {
                            allow = false;
                        }
                        break;
                    case 2:
                        if (this.m_sessionState !== 3) {
                            allow = false;
                        }
                        break;
                    case 3:
                        if (this.m_sessionState !== 5) {
                            allow = false;
                        }
                        break;
                    case 4:
                        if (this.m_sessionState !== 8) {
                            allow = false;
                        }
                        break;
                    case 5:
                        if (this.m_sessionState !== 8) {
                            allow = false;
                        }
                        break;
                    case 6:
                        if (!(this.m_sessionProperties.reapplySubscriptions &&
                                this.m_sessionState === 7)) {
                            allow = false;
                        }
                        break;
                    case 7:
                        allow = true;
                        break;
                    default:
                        allow = false;
                }
            }
            else {
                allow = false;
            }
        }
        if (allow) {
            return null;
        }
        else {
           var errorMsg = new solace.StringBuffer("Cannot perform operation ");
           errorMsg.append(solace.SessionOperationDescription[operationEnum] || "");
           errorMsg.append(" while in state ").append(solace.InternalSessionStateDescription[this.m_sessionState]);
           errorMsg.append(this.m_disposed?"(already disposed)":"");
           return errorMsg.toString();
        }
    };

    /**
     * @private
     * @param {solace.smf.ClientCtrlMessage} clientCtrlRespMsg
     */
    solace.Session.prototype.updateReadonlySessionProps = function(clientCtrlRespMsg) {
        this.m_sessionProperties.vpnNameInUse = clientCtrlRespMsg.getVpnNameInUseValue() || "";
        var oldVirtualRouterName = this.m_sessionProperties.virtualRouterName;
        var newVirtualRouterName = clientCtrlRespMsg.getVridInUseValue() || "";
        this.m_sessionProperties.virtualRouterName = newVirtualRouterName;
        if (oldVirtualRouterName !== "" && oldVirtualRouterName !== newVirtualRouterName) {
            var sessionEvent = new solace.SessionEvent(SessionEventCode.VIRTUALROUTER_NAME_CHANGED,
                    "Virtual router name is changed from " + oldVirtualRouterName + " to " + newVirtualRouterName,
                    null, 0,  null, null);
            this.sendEvent(sessionEvent);
        }

        // The appliance login response should always contain a P2P topic for this client name.
        // If it doesn't that's an error (and we store "").
        this.m_sessionProperties.p2pInboxBase = clientCtrlRespMsg.getP2PTopicValue() || "";
        this.m_sessionProperties.p2pInboxInUse = P2PUtil.getP2PInboxTopic(this.m_sessionProperties.p2pInboxBase);
        this.m_capabilities = clientCtrlRespMsg.getRouterCapabilities();
    };

    /**
     * @private
     * @description This method is responsible for add/remove subscriptions
     * @param {solace.Topic} topic
     * @param requestConfirmation
     * @param correlationKey
     * @param requestTimeout
     * @param requestType
     * @param respRecvdCallback
     */
    solace.Session.prototype.subscriptionUpdate = function(topic, requestConfirmation,
            correlationKey, requestTimeout, requestType, respRecvdCallback) {
        var errorMsg;
        switch (requestType) {
            case 2:
            case 4:
                errorMsg = "Cannot add subscription";
                break;
            case 3:
                errorMsg = "Cannot remove subscription";
                break;
            case 1:
                errorMsg = "Cannot register P2P inbox subscripiton";
                break;
            case 7:
            case 8:
                errorMsg = "Cannot update P2P inbox subscription";
                break;
            default:
                errorMsg = "Subscription update failed";
        }
        var timeoutMsg;
        switch (requestType) {
            case 2:
            case 4:
                timeoutMsg = "Add subscription request timeout";
                break;
            case 3:
                timeoutMsg = "Remove subscription request timeout";
                break;
            case 7:
            case 1:
                timeoutMsg = "Add P2P inbox subscription timeout";
                break;
            case 8:
                timeoutMsg = "Remove P2P inbox subscription timeout";
                break;
            default:
                timeoutMsg = "Request timeout";
        }

        var add = (requestType === 2 ||
                requestType === 4 ||
                requestType === 1 ||
                requestType === 7);
        var correlationTag = this.m_smfClient.nextCorrelationTag();
        var smpMsg = solace.smf.SMPMessage.getSubscriptionMessage(
                correlationTag, topic, add, requestConfirmation);

        var myThis = this;
        var sessionEvent;
        var returnCode = this.m_smfClient.send(smpMsg);
        if (returnCode !== 0) {
            var errorSubcode;
            if (returnCode === 2) {
                errorSubcode = ErrorSubcode.INSUFFICIENT_SPACE;
                errorMsg += " - no space in transport";
            }
            else {
                errorSubcode = ErrorSubcode.INVALID_SESSION_OPERATION;
            }

            switch (requestType) {
                case 1:
                    sessionEvent = new solace.SessionEvent(SessionEventCode.P2P_SUB_ERROR,
                        errorMsg, null, errorSubcode, null, null);
                    break;
                case 7:
                case 8:
                    sessionEvent = new solace.SessionEvent(SessionEventCode.PROPERTY_UPDATE_ERROR,
                        errorMsg, null, errorSubcode, null, null);
                    break;
                default:
                    // client calling subscribe/unsubscribe/reapply subscription, should throw OperationError
                    throw new solace.OperationError(errorMsg, errorSubcode, solace.TransportReturnCodeDescription[returnCode]);
            }

            // change session state
            this.changeState(9);
            // notify client
            this.sendEvent(sessionEvent);
        }
        else {
            this.updateTxStats(smpMsg);
            if (requestConfirmation) {
                 this.enqueueOutstandingCtrlReq(correlationTag,
                        function() {myThis.handleOperationTimeout(correlationTag, timeoutMsg);},
                        requestTimeout || this.m_sessionProperties.readTimeoutInMsecs,
                        requestType,
                        correlationKey,
                        respRecvdCallback);
            }
            if (requestType === 2 &&
                        this.m_sessionProperties.reapplySubscriptions) {
                    this.addToSubscriptionCache(topic);
            }
            else if (requestType === 3 &&
                    this.m_sessionProperties.reapplySubscriptions) {
                this.removeFromSubscriptionCache(topic);
            }
        }
    };

    /**
     * @private
     * @param message
     */
    solace.Session.prototype.handleSendMessage = function (message) {
       //Sanity checks on the message before attempting to send it
        //  * do we have a destination?
        var sendDest = message.getDestination();
        if (!(sendDest !== null && StringUtil.notEmpty(sendDest.getName()))) {
            throw new solace.OperationError("Message must have a valid Destination", ErrorSubcode.TOPIC_MISSING);
        }
        var result = TopicUtil.validateTopic(sendDest.getName());
        if (result) {
            throw new solace.OperationError(result, ErrorSubcode.INVALID_TOPIC_SYNTAX, null);
        }

        var deliveryMode = message.getDeliveryMode();
        if (deliveryMode !== null && deliveryMode !== solace.MessageDeliveryModeType.DIRECT) {
            throw new solace.OperationError("AD messages are not supported", ErrorSubcode.AD_MESSAGING_NOT_SUPPORTED);
        }

        if (this.m_sessionProperties.generateSendTimestamps && (message.getSenderTimestamp() === null || message.hasAutoSenderTimestamp())) {
            var now = new Date();
            message.setSenderTimestamp(now.getTime());
            message.setHasAutoSenderTimestamp(true);
        }
        if (this.m_sessionProperties.generateSequenceNumber && (message.getSequenceNumber() === null || message.hasAutoSequenceNumber())) {
            message.setSequenceNumber(this.m_seqNum++);
            message.setHasAutoSequenceNumber(true);
        }
        if (this.m_sessionProperties.includeSenderId && message.getSenderId() === null) {
            message.setSenderId(this.m_sessionProperties.clientName);
        }
        
        var returnCode = this.m_smfClient.send(message);
        if (returnCode !== 0) {
            if (returnCode === 2) {
               throw new solace.OperationError("Cannot send message - no space in transport",
                        ErrorSubcode.INSUFFICIENT_SPACE, solace.TransportReturnCodeDescription[returnCode]);
            }
            else {
                throw new solace.OperationError("Cannot send message",
                        ErrorSubcode.INVALID_SESSION_OPERATION, solace.TransportReturnCodeDescription[returnCode]);
            }
        }
        else {
            this.updateTxStats(message);
        }
    };

    /**
     * @private
     * @param {string} correlationId
     * @param {function(...[*])} reqFailedCb
     * @param {number} reqTimeout
     * @param {function(*)} replyRecvdCb
     * @param {Object} userObject
     */
    solace.Session.prototype.enqueueOutstandingDataReq = function (correlationId, reqFailedCb, reqTimeout, replyRecvdCb, userObject) {
        if (typeof correlationId !== "undefined" && correlationId !== null) {
            SOLACE_LOG_DEBUG("Enqueue outstanding data request correlationId=" + correlationId + this.getSessionIdForLogging());
            var outstandingReq;
            var timer;
            var myThis = this;
            timer = setTimeout(function() {
                    myThis.m_sessionStatistics.incStat(StatType.TX_REQUEST_TIMEOUT);
                    // remove request from queue
                    try {
                        if (!(delete myThis.m_outstandingDataReqs[correlationId])) {
                            SOLACE_LOG_ERROR("Cannot delete data request " + correlationId + this.getSessionIdForLogging());
                        }
                    } catch (e) {
                        SOLACE_LOG_ERROR("Cannot delete data request " + correlationId + this.getSessionIdForLogging() + ", exception: " + e.message);
                    }

                    if (typeof reqFailedCb !== "undefined" && reqFailedCb !== null) {
                        var sessionEvent = new solace.SessionEvent(
                                SessionEventCode.REQUEST_TIMEOUT, "Request timeout", null,
                                ErrorSubcode.TIMEOUT, null, null);

                        reqFailedCb(myThis, sessionEvent, userObject);
                    }
                },
                reqTimeout || this.m_sessionProperties.readTimeoutInMsecs);

            outstandingReq = new solace.OutstandingDataRequest(correlationId, timer, replyRecvdCb, reqFailedCb, userObject);
            this.m_outstandingDataReqs[correlationId] = outstandingReq;
        }
    };

    /**
     * @private
     * @param {string} correlationId
     * @return {solace.OutstandingDataRequest} request
     */
    solace.Session.prototype.cancelOutstandingDataReq = function(correlationId) {
        if (this.m_outstandingDataReqs && (typeof correlationId !== "undefined") && correlationId !== null) {
            var req = this.m_outstandingDataReqs[correlationId];
            if (typeof req !== "undefined") {
                SOLACE_LOG_DEBUG("Cancel outstanding data request correlationId=" + correlationId + this.getSessionIdForLogging());
                if (typeof req.timer !== "undefined" && req.timer !== null) {
                    clearTimeout(req.timer);
                    req.timer = null;
                }
                try {
                    if (!(delete this.m_outstandingDataReqs[correlationId])) {
                        SOLACE_LOG_ERROR("Cannot delete data request " + correlationId + this.getSessionIdForLogging());
                    }
                } catch (e) {
                    SOLACE_LOG_ERROR("Cannot delete data request " + correlationId + this.getSessionIdForLogging() + ", exception: " + e.message);
                }
                return req;
            }
        }
        return null;
    };

    /**
     * @private
     * @param {string} correlationTag
     * @param {function(*)} reqTimeoutCb
     * @param {number} reqTimeout
     * @param {number} requestType
     * @param {Object} correlationKey
     * @param {function(*)} respRecvCallback
     */
    solace.Session.prototype.enqueueOutstandingCtrlReq = function (correlationTag, reqTimeoutCb, reqTimeout, requestType, correlationKey, respRecvCallback) {
        if (typeof correlationTag !== "undefined" && correlationTag !== null) {
            SOLACE_LOG_DEBUG("Enqueue outstanding ctrl request correlationTag=" + correlationTag + this.getSessionIdForLogging());
            var outstandingReq;
            var timer;
            timer = setTimeout(reqTimeoutCb,
                reqTimeout || this.m_sessionProperties.readTimeoutInMsecs);

            outstandingReq = new solace.OutstandingCtrlRequest(correlationTag, timer, requestType, correlationKey, respRecvCallback);
            this.m_outstandingCtrlReqs[correlationTag] = outstandingReq;
        }
    };

    /**
     * @private
     * @param {string} correlationTag
     * @return {solace.OutstandingCtrlRequest} request
     */
    solace.Session.prototype.cancelOutstandingCtrlReq = function(correlationTag) {
        if (this.m_outstandingCtrlReqs && (typeof correlationTag !== "undefined") && correlationTag !== null) {
            var req = this.m_outstandingCtrlReqs[correlationTag];
            if (typeof req !== "undefined") {
                SOLACE_LOG_DEBUG("Cancel outstanding ctrl request correlationTag=" + correlationTag + this.getSessionIdForLogging());
                if (typeof req.timer !== "undefined" && req.timer !== null) {
                    clearTimeout(req.timer);
                    req.timer = null;
                }
                try {
                    if (!(delete this.m_outstandingCtrlReqs[correlationTag])) {
                        SOLACE_LOG_ERROR("Cannot delete ctrl request " + correlationTag + this.getSessionIdForLogging());
                    }
                } catch (e) {
                    SOLACE_LOG_ERROR("Cannot delete ctrl request " + correlationTag + this.getSessionIdForLogging() + ", exception: " + e.message);
                }
                return req;
            }
        }
        return null;
    };

    /**
     * @private
     * @param {solace.Topic} topic
     */
    solace.Session.prototype.addToSubscriptionCache = function(topic) {
        if (this.m_subscriptionCache && typeof topic !== "undefined" && topic !== null) {
            var key = topic.getKey();
            if (typeof this.m_subscriptionCache[key] === "undefined") {
                SOLACE_LOG_DEBUG("Cache subscription " + key + this.getSessionIdForLogging());
                this.m_subscriptionCache[key] = topic;
                SOLACE_LOG_DEBUG("Increment cache count" + this.getSessionIdForLogging());
                this.m_subscriptionCacheCount++;
            }
            else {
                SOLACE_LOG_DEBUG("Cache subscription " + key + this.getSessionIdForLogging());
                this.m_subscriptionCache[key] = topic;
            }
        }
    };

    /**
     * @private
     * @param {solace.Topic} topic
     */
    solace.Session.prototype.removeFromSubscriptionCache = function(topic) {
        if (this.m_subscriptionCache && typeof topic !== "undefined" && topic !== null) {
            var key;
            if (topic instanceof solace.Topic) {
                key = topic.getKey();
            }
            else {
                key = topic;
            }
            SOLACE_LOG_DEBUG("Remove subscription " + key + this.getSessionIdForLogging());
            var sub = this.m_subscriptionCache[key];
            if (typeof sub !== "undefined") {
                try {
                    if (!(delete this.m_subscriptionCache[key])) {
                        SOLACE_LOG_ERROR("Cannot remove subscription " + key + this.getSessionIdForLogging());
                    }
                    else {
                        this.m_subscriptionCacheCount--;
                    }
                } catch (e) {
                    SOLACE_LOG_ERROR("Cannot remove subscription " + key + this.getSessionIdForLogging() + ", exception: " + e.message);
                }
                return sub;
            }
        }
        return null;
    };

    /**
     * @private
     */
    solace.Session.prototype.resetKeepAliveCounter = function() {
        // Reset the KA counter. Called by the SMFClient on each SMF chunk received (whether full message or not).
        this.m_keepAliveCounter = 0;
    };

    /**
     * @private
     */
    solace.Session.prototype.handleSmfMessage = function(rxMsgObj) {
         if (!this.shallNotifyClient()) {
            SOLACE_LOG_WARN("Ignore data received on a session in state " + solace.InternalSessionStateDescription[this.m_sessionState] + this.getSessionIdForLogging());
            return;
        }

        var sessionEvent;
        var errorSubcode;
        try {
            // update stats
            this.updateRxStats(rxMsgObj);

            // process rxMsgObj
            var smfRespHeader = rxMsgObj.getSmfHeader();
            var respCode = smfRespHeader.m_pm_respcode;
            var respText = smfRespHeader.m_pm_respstr;
            var cancelledRequest;

            switch (smfRespHeader.m_smf_protocol) {
                case 0x0d:
                    if (respCode !== 0) {
                        // It is trmsg response. For direct message, it must be a failure response
                         errorSubcode = solace.ErrorResponseSubCodeMapper.getErrorSubCode(respCode, respText);
                         sessionEvent = new solace.SessionEvent(SessionEventCode.REJECTED_MESSAGE_ERROR,
                                 respText, respCode, errorSubcode, null, null);
                         this.sendEvent(sessionEvent);
                    }
                    else {
                        this.handleDataMessage(rxMsgObj);
                    }
                    break;
                case 0x0c:
                    var correlationTag = smfRespHeader.m_pm_corrtag || "";

                    // find matching correlationTag to cancel timer
                    cancelledRequest = this.cancelOutstandingCtrlReq(correlationTag);
                    if (typeof cancelledRequest === "undefined" || cancelledRequest === null) {
                        // change state
                        this.changeState(9);

                        // notify client
                        sessionEvent = new solace.SessionEvent(SessionEventCode.INTERNAL_ERROR,
                                "Cannot find matching request for response: " + respText, respCode,
                                ErrorSubcode.INTERNAL_ERROR, null, null);
                        this.sendEvent(sessionEvent);

                    } else {
                        // call callback referenced by cancelledRequest
                        // login or update property
                        if (cancelledRequest.respRecvdCallback) {
                            cancelledRequest.respRecvdCallback(rxMsgObj);
                        }
                    }
                    break;
                case 0x0f:
                    correlationTag = smfRespHeader.m_pm_corrtag || "";
                    var subscriptionStr = solace.Util.stripNullTerminate(rxMsgObj.EncodedUtf8Subscription);
                    // find matching correlationTag to cancel timer
                    cancelledRequest = this.cancelOutstandingCtrlReq(correlationTag);
                    if (this.m_sessionState === 6) {
                        if (typeof cancelledRequest === "undefined" || cancelledRequest === null) {
                            // change state
                            this.changeState(9);

                            // notify client
                            sessionEvent = new solace.SessionEvent(SessionEventCode.INTERNAL_ERROR,
                                    "Cannot find matching request for response: " + respText, respCode,
                                    ErrorSubcode.INTERNAL_ERROR, null, null);
                            this.sendEvent(sessionEvent);
                        }
                        else {
                            // must be 1
                            // calling handleP2pInboxRegResponse
                            if (cancelledRequest.respRecvdCallback) {
                                cancelledRequest.respRecvdCallback(rxMsgObj);
                            }
                        }
                    }
                    else if (this.m_sessionState === 11) {
                        if (typeof cancelledRequest === "undefined" || cancelledRequest === null) {
                            // must be error response for apply subscription requests without confirm
                            errorSubcode = solace.ErrorResponseSubCodeMapper.getErrorSubCode(respCode, respText);
                            if (!(errorSubcode === ErrorSubcode.SUBSCRIPTION_ALREADY_PRESENT &&
                                    this.m_sessionProperties.ignoreDuplicateSubscriptionError)) {
                                // notify client
                                sessionEvent = new solace.SessionEvent(SessionEventCode.REAPPLY_SUBSCRIPTION_ERROR,
                                        respText, respCode, errorSubcode, null, "Topic: " + subscriptionStr);
                                this.sendEvent(sessionEvent);
                            }
                        }
                        else {
                            // must be 4
                            // calling handleApplySubscriptnResponse
                            if (cancelledRequest.respRecvdCallback) {
                                cancelledRequest.respRecvdCallback(rxMsgObj);
                            }
                        }
                    }
                    else {
                        if (typeof cancelledRequest === "undefined" || cancelledRequest === null) {
                            // must be error response from subscriber/unsubscribe requests without confirm
                            this.handleSubscriptionUpdateError(respCode, respText, subscriptionStr, null);
                        }
                        else {
                            // subscribe/unsubscribe with confirm, or add/remove p2p inbox registration during update property operation
                            if (cancelledRequest.respRecvdCallback) {
                                cancelledRequest.respRecvdCallback(rxMsgObj, cancelledRequest);
                            }
                        }
                    }
                    break;
                case 0x0a:
                case 0x0b:
                    // do nothing
                    break;
                default:
                    // unknown protocol
                    // change state
                    this.changeState(9);
                    if (smfRespHeader.m_smf_protocol === 0x14) {
                        SOLACE_LOG_ERROR("Received transport session message instead of SMF message, protocol 0x" +
                                solace.Util.formatHexString(smfRespHeader.m_smf_protocol) +  this.getSessionIdForLogging());
                        SOLACE_LOG_ERROR("Transport MessageType=" + rxMsgObj.MessageType + ", SessionId=" + solace.Util.formatHexString(rxMsgObj.SessionId));
                        // notify client
                        sessionEvent = new solace.SessionEvent(SessionEventCode.PARSE_FAILURE,
                                "Received message with unknown protocol", null, ErrorSubcode.DATA_ERROR_OTHER,
                                null, null);
                        this.sendEvent(sessionEvent);
                    }
                    else {
                        // Drop message of unknown protocol and increment stats
                         this.m_sessionStatistics.incStat(StatType.RX_DISCARD_SMF_UNKNOWN_ELEMENT);
                        SOLACE_LOG_INFO("Drop message with unknown protocol 0x" + solace.Util.formatHexString(smfRespHeader.m_smf_protocol) +
                                this.getSessionIdForLogging());
                    }


            }
        } catch (e) {
            SOLACE_LOG_ERROR("Exception in handleSmfMessage" + this.getSessionIdForLogging() + ", exception: " + e.message);
            this.changeState(9);

            // notify client
            sessionEvent = new solace.SessionEvent(SessionEventCode.INTERNAL_ERROR,
                    ("Exception in handleSmfMessage: " + e.message), 0, ErrorSubcode.INTERNAL_ERROR, null, null);
            this.sendEvent(sessionEvent);
        }
    };

    /**
     * @private
     * @param {solace.Message} dataMessage
     */
    solace.Session.prototype.handleDataMessage = function(dataMessage) {
        var correlationId;
        var dataReq;

        if (this.m_sessionProperties.generateReceiveTimestamps) {
            var now = new Date();
            dataMessage.m_receiverTimestamp = now.getTime();
        }

        if (dataMessage.isReplyMessage()) {
            correlationId = dataMessage.getCorrelationId();
            if (typeof correlationId !== "undefined" && correlationId !== null) {
                dataReq = this.cancelOutstandingDataReq(correlationId);
                if (dataReq === null) {
                    if (correlationId.indexOf(SolClientRequestPrefix) === 0) {
                        // if a reply message doesn't have outstanding request and correlationId
                        // starts with #REQ it is assumed to be a delayed reply and has to be discarded
                        SOLACE_LOG_WARN("DROP: Discard reply message due to missing outstanding request" + this.getSessionIdForLogging());
                        this.m_sessionStatistics.incStat(StatType.RX_REPLY_MSG_DISCARD);
                        return;
                    } else if (correlationId.indexOf(solace.CacheRequestPrefix) === 0 &&
                        ! (solace.CacheMessageRxCBInfo && this.m_messageCallbackInfo instanceof solace.CacheMessageRxCBInfo)) {
                        // If it's a cache message, only pass it along if the listener is a cache message
                        // listener. The listener may drop it and increment the DISCARD stat if no
                        // cache session recognizes the reply.
                        SOLACE_LOG_WARN("DROP: Discard cache reply due to no cache session active" + this.getSessionIdForLogging());
                        this.m_sessionStatistics.incStat(StatType.RX_REPLY_MSG_DISCARD);
                        return;
                    }
                }
                else {
                    this.m_sessionStatistics.incStat(StatType.RX_REPLY_MSG_RECVED);
                    SOLACE_LOG_DEBUG("Calling application replyReceivedCallback");
                    dataReq.replyReceivedCBFunction(this, dataMessage, dataReq.userObject);
                    SOLACE_LOG_DEBUG("application replyReceivedCallback returns");
                    return;
                }
            }
        }

        // notify client message callback
        if (this.m_messageCallbackInfo) {
            SOLACE_LOG_DEBUG("Calling application messageCallback");
            if (this.m_messageCallbackInfo.userObject) {
                this.m_messageCallbackInfo.messageRxCBFunction(this, dataMessage,
                        this.m_messageCallbackInfo.userObject);
            }
            else {
                this.m_messageCallbackInfo.messageRxCBFunction(this, dataMessage);
            }
            SOLACE_LOG_DEBUG("application messageCallback returns");
        }
    };

    /**
     * @private
     */
    solace.Session.prototype.handleSmfParseError = function(transportError) {
        if (!this.shallNotifyClient()) {
            SOLACE_LOG_WARN("Ignore errors received on a session in state " + solace.InternalSessionStateDescription[this.m_sessionState] + this.getSessionIdForLogging());
            return;
        }

        // change state
        this.changeState(9);

        // notify client
        var sessionEvent = new solace.SessionEvent(SessionEventCode.PARSE_FAILURE,
                transportError.message, null, transportError.subcode || ErrorSubcode.DATA_ERROR_OTHER,
                null, null);
        this.sendEvent(sessionEvent);
    };

    /**
     * @private
     */
    solace.Session.prototype.handleTransportEvent = function(transportEvent) {
        var sEventCode;
        var infoStr = transportEvent.getInfoStr() || "";
        var transportEventStr = transportEvent.toString();
        var sessionEvent;

        SOLACE_LOG_DEBUG("Receive transport event: " + transportEvent + this.getSessionIdForLogging());
        if (transportEvent.getSessionEventCode() !== TransportSessionEventCode.DESTROYED_NOTICE &&
                !this.shallNotifyClient()) {
            SOLACE_LOG_WARN("Ignore transport event on a session in state " + solace.InternalSessionStateDescription[this.m_sessionState] + this.getSessionIdForLogging());
            return;
        }

        switch (transportEvent.getSessionEventCode()) {
            case TransportSessionEventCode.UP_NOTICE:

                // We are up. Cancel the connect timer.
                this.clearConnectTimer();
                this.m_lastKnownGoodTransport = this.m_transportProtocolHandler.getTransportProtocol();
                
                // change state
                this.changeState(3);
                this.m_sessionId = transportEvent.getSessionId() || "";
                SOLACE_LOG_INFO("Transport session is up" + this.getSessionIdForLogging());

                // no need to notify client

                // initiate login process - send client ctrl
                this.sendClientCtrl();
                break;
            case TransportSessionEventCode.DESTROYED_NOTICE:
                // change state
                var originalState = this.m_sessionState; // backup
                this.changeState(1);
                // clean up session cache
                this.cleanupSession();

                // The looseness of this check is to accommodate both dead-transport (WS-killing proxy)
                // and held-transport (chunk buffering proxy) scenarios.
                if (originalState === 2 ||
                    originalState === 4) {
                    // Failure during connect
                    if (this.m_transportProtocolHandler.shouldRetry()) {
                        // Downgrade
						this.m_transportProtocolHandler.handleConnectFailed(transportEvent);
                        this.connectInternal();
                        return;
                    }
                }

                // reaching here: we should NOT retry the initial connect attempt (transport negotiation)

                // notify client
                sEventCode = SessionEventCode.DISCONNECTED;
                sessionEvent = new solace.SessionEvent(sEventCode, infoStr, null,
                        transportEvent.getResponseCode(), null, transportEventStr);

                // set client callbacks to null so that they will no longer receive any event or message
                if (! this.m_disposed) {
                    // No successful connect. Disconnect, cancel timers, reset protocol handler, etc.
                    this.disconnectInternal();
                }

                // Send the event now, after the disconnect completes.
                this.sendEvent(sessionEvent);
                if (this.disposed) {
                    this.m_messageCallbackInfo = null;
                    this.m_eventCallbackInfo = null;
                }

                break;
            case TransportSessionEventCode.CONNECTING:
                if (this.m_sessionState !== 2) {
                    // change state
                    this.changeState(2);

                    // no need to notify client
                }
                break;
            case TransportSessionEventCode.CAN_ACCEPT_DATA:
                // no state change, session remain connected
                if (this.m_sessionState === 11) {
                    this.reapplySubscriptions();
                }
                else {
                    // notify client
                    sEventCode = SessionEventCode.CAN_ACCEPT_DATA;
                    sessionEvent = new solace.SessionEvent(sEventCode, infoStr, null,
                            transportEvent.getResponseCode(), null, transportEventStr);
                    this.sendEvent(sessionEvent);
                }
                break;
            case TransportSessionEventCode.CONNECTION_ERROR:
            case TransportSessionEventCode.DATA_DECODE_ERROR:
            case TransportSessionEventCode.PARSE_FAILURE:
                // fatal connection error
                this.destroyTransportSession(infoStr, transportEvent.getResponseCode());
                break;
            default:
                SOLACE_LOG_WARN("Received unknown transport session event"  + this.getSessionIdForLogging() + ": " + transportEventStr);
        }
    };


    /**
     * Initiates the ClientCtrl handshake, called from transportSessionEvent callback
     * @private
     */
    solace.Session.prototype.sendClientCtrl = function () {
        var sessionEvent;

        var result = this.allowOperation(2);
        if (result) {
            // notify client
            sessionEvent = new solace.SessionEvent(SessionEventCode.LOGIN_FAILURE,
                    result, null,
                    ErrorSubcode.INVALID_SESSION_OPERATION, null, null);
            this.sendEvent(sessionEvent);
            return;
        }

        // change state
        this.changeState(4);

        var clientCtrlMsg = solace.smf.ClientCtrlMessage.getLogin(this.m_sessionProperties);
        var correlationTag = clientCtrlMsg.getSmfHeader().m_pm_corrtag || "";

        var myThis = this;
        var returnCode = this.m_smfClient.send(clientCtrlMsg);
        if (returnCode !== 0) {
            // change session state
            this.changeState(9);

            // notify client
            if (returnCode === 2) {
                sessionEvent = new solace.SessionEvent(SessionEventCode.LOGIN_FAILURE,
                        "Cannot send client control - no space in transport",
                        null, ErrorSubcode.INSUFFICIENT_SPACE, null, null);
            }
            else {
                SOLACE_LOG_INFO("Cannot send client ctrl, return code " + solace.TransportReturnCodeDescription[returnCode]);
                sessionEvent = new solace.SessionEvent(SessionEventCode.LOGIN_FAILURE,
                        "Cannot send client ctrl",
                        null, ErrorSubcode.INVALID_SESSION_OPERATION, null, null);
            }
            this.sendEvent(sessionEvent);
        }
        else {
            // update stats
            this.updateTxStats(clientCtrlMsg);

            // enqueue outstanding request
            // IE Javascript timer has resolution of 15ms, while Firefox and Chrome have 1ms timer resolution.
            // If value of transportDowngradeTimeoutInMsecs and readTimeoutInMsecs are set to the same or too
            // close, sometimes, the clientCtrl request timeout timer can be fired before downgrade timeout timer.
            // We've seen this in Chrome when transportDowngradeTimeoutInMsecs is set to the same value as
            // readTimeoutInMsecs. Add this checking against unwanted clientCtrl request timeout.
            var reqTimeout = this.m_sessionProperties.readTimeoutInMsecs;
            if (this.m_sessionProperties.readTimeoutInMsecs - this.m_sessionProperties.transportDowngradeTimeoutInMsecs < 20) {
                reqTimeout = this.m_sessionProperties.transportDowngradeTimeoutInMsecs + 20;
            }
            this.enqueueOutstandingCtrlReq(correlationTag,
                function() {
                    myThis.handleOperationTimeout(correlationTag, "Login request timeout");
                },
                reqTimeout,
                0, null,
                function(rxMsgObj) {
                    myThis.handleClientCtrlResponse(rxMsgObj);
                });

            SOLACE_LOG_INFO("Sent client ctrl" + this.getSessionIdForLogging());
        }
    };

    /**
     * @private
     * @param clientCtrlMsg
     */
    solace.Session.prototype.handleClientCtrlResponse = function(clientCtrlMsg) {
        var response = clientCtrlMsg.getResponse();
        var respCode = response.ResponseCode;
        var respText = response.ResponseString;
        var sessionEvent;
        var errorSubCode;

        // login
        if (respCode === 200) {
            if (this.m_sessionProperties.noLocal === true) {
                var caps = clientCtrlMsg.getRouterCapabilities();
                var noLocalSupported = true;
                if (!caps) {
                    noLocalSupported = false;
                }
                else {
                // Guard for undefined OR non-boolean capability
                    noLocalSupported = (typeof caps[solace.CapabilityType.NO_LOCAL] === "boolean") ? caps[solace.CapabilityType.NO_LOCAL] : false;
                }
                if (!noLocalSupported) {
                    this.m_inReconnect = false;
                    // change state
                    this.changeState(9);

                    // notify client
                    sessionEvent = new solace.SessionEvent(SessionEventCode.LOGIN_FAILURE,
                            "No Local is not supported by the appliance", respCode, ErrorSubcode.NO_LOCAL_NOT_SUPPORTED, null, null);
                    this.sendEvent(sessionEvent);
                    return;
                }
            }
            // change state
            this.changeState(5);
            // no need to notify client

            // update session properties
            this.updateReadonlySessionProps(clientCtrlMsg);

            // do p2pInbox registration
            this.sendP2PInboxReg();
        }
        else {
            SOLACE_LOG_INFO("Login Failure" + this.getSessionIdForLogging());
            this.m_inReconnect = false;
            // change state
            this.changeState(9);

            // notify client
            errorSubCode = solace.ErrorResponseSubCodeMapper.getErrorSubCode(respCode, respText);
            sessionEvent = new solace.SessionEvent(SessionEventCode.LOGIN_FAILURE,
                    respText, respCode, errorSubCode, null, null);
            this.sendEvent(sessionEvent);
        }
    };

    /**
     * @private
     * Initiate P2PInbox subscription. Called from smf client rxMessage callback
     */
    solace.Session.prototype.sendP2PInboxReg = function() {
        var result = this.allowOperation(3);
        if (result) {
            // notify client
            var sessionEvent = new solace.SessionEvent(SessionEventCode.P2P_SUB_ERROR,
                        result, null,
                        ErrorSubcode.INVALID_SESSION_OPERATION, null, null);
            this.sendEvent(sessionEvent);
            return;
        }

        // change state
        this.changeState(6);

        var p2pTopic = P2PUtil.getP2PTopicSubscription(this.m_sessionProperties.p2pInboxBase);
        var myThis = this;
        this.subscriptionUpdate(new solace.Topic(p2pTopic), true, null, this.m_sessionProperties.readTimeoutInMsecs,
                1,
                function(rxMsgObj) {myThis.handleP2PRegResponse(rxMsgObj);});
    };

    /**
     * @private
     * @param smpMsg
     */
    solace.Session.prototype.handleP2PRegResponse = function(smpMsg) {
        var response = smpMsg.getResponse();
        var respCode = response.ResponseCode;
        var respText = response.ResponseString;
        var sessionEvent;
        var errorSubCode;

        if (respCode === 200) {
            if (this.m_inReconnect && this.m_sessionProperties.reapplySubscriptions &&
                    this.m_subscriptionCache && this.m_subscriptionCacheCount > 0) {
                this.changeState(7);

                // no need to notify client

                // reapply subscriptions if applicable
                this.clearSubscriptionCacheKeys();
                this.m_subscriptionCacheKeys = [];
                for (var key in this.m_subscriptionCache) {
                    if (this.m_subscriptionCache.hasOwnProperty(key)) {
                        this.m_subscriptionCacheKeys.push(key);
                    }
                }
                this.reapplySubscriptions();
            }
            else {
                this.m_inReconnect = false;

                // change state
                this.changeState(8);

                // start keep alive timer
                this.scheduleKeepAlive();

                // notify client
                sessionEvent = new solace.SessionEvent(SessionEventCode.UP_NOTICE,
                    strFmt("Session is up (transport:{0})", this.m_transportProtocolHandler),
                    respCode, 0, null, null);
                this.sendEvent(sessionEvent);
            }
        }
        else {
            // change state
            this.m_inReconnect = false;
            this.changeState(9);

            // notify client
            errorSubCode = solace.ErrorResponseSubCodeMapper.getErrorSubCode(respCode, respText);
            sessionEvent = new solace.SessionEvent(SessionEventCode.P2P_SUB_ERROR,
                    respText, respCode, errorSubCode, null, null);
            this.sendEvent(sessionEvent);
        }
    };


    /**
     * @private
     * Initiate update P2PInbox subscription. Called from smf client rxMessage callback
     */
    solace.Session.prototype.sendUpdateP2PInboxReg = function(add, p2pTopic, correlationKey, responseCb) {
        var result = this.allowOperation(4);
        if (result) {
            // notify client
            var sessionEvent = new solace.SessionEvent(SessionEventCode.PROPERTY_UPDATE_ERROR,
                        result, null,
                        ErrorSubcode.INVALID_SESSION_OPERATION, correlationKey, null);
            this.sendEvent(sessionEvent);
            return;
        }
        this.subscriptionUpdate(new solace.Topic(p2pTopic), true, null, this.m_sessionProperties.readTimeoutInMsecs,
                add ? 7 : 8,
                responseCb);
    };

    /**
     * Handle control request timeout
     * @param correlationTag
     * @param timeoutMsg
     * @private
     */
    solace.Session.prototype.handleOperationTimeout = function(correlationTag, timeoutMsg) {
        this.m_inReconnect = false;
        // remove request from queue
        try {
            if (!(delete this.m_outstandingCtrlReqs[correlationTag])) {
                SOLACE_LOG_ERROR("Cannot delete ctrl request " + correlationTag + this.getSessionIdForLogging());
            }
        } catch (e) {
            SOLACE_LOG_ERROR("Cannot delete ctrl request " + correlationTag + this.getSessionIdForLogging() + ", exception: " + e.message);
        }

        if (this.shallNotifyClient()) {
            // change state
            this.changeState(9);

            // notify client
            var sessionEvent = new solace.SessionEvent(SessionEventCode.REQUEST_TIMEOUT,
                    timeoutMsg, null, ErrorSubcode.TIMEOUT, null, null);
            this.sendEvent(sessionEvent);
        }
        else {
           SOLACE_LOG_WARN("Ignore timeout error on a session in state " + solace.InternalSessionStateDescription[this.m_sessionState] + this.getSessionIdForLogging());
        }
    };

    /**
     * @private
     * Schedule keep alive task
     */
    solace.Session.prototype.scheduleKeepAlive = function() {
        var myThis = this;
        if (this.m_keepAliveTimer) {
            clearInterval(this.m_keepAliveTimer);
        }
        if (this.m_kaWatchdog) {
            clearInterval(this.m_kaWatchdog);
        }
        myThis.m_kaWatchdog = 0;
        myThis.m_kaWatchdogCount = 0;

        this.m_keepAliveTimer = setInterval(function() {
            try {
                myThis.sendKeepAlive();
                myThis.m_kaWatchdogCount = 0;
            } catch (e) {
                SOLACE_LOG_ERROR("Error occurred in sendKeepAlive " + myThis.getSessionIdForLogging() + ", exception: " + e.message);
            }
        }, this.m_sessionProperties.keepAliveIntervalInMsecs);

        this.m_kaWatchdog = setInterval(function() {
            myThis.m_kaWatchdogCount++;
            if (myThis.m_kaWatchdogCount >= 2) {
                SOLACE_LOG_INFO("KeepAlive watchdog: restarting KA (" + myThis.m_kaWatchdogCount + ") " + myThis.getSessionIdForLogging());
                myThis.scheduleKeepAlive();
            }
        }, this.m_sessionProperties.keepAliveIntervalInMsecs * 3);
        SOLACE_LOG_DEBUG("Create Keepalive timer " + this.m_keepAliveTimer + this.getSessionIdForLogging());
    };

    /**
     * @private
     * Call from keep alive scheduled task
     */
    solace.Session.prototype.sendKeepAlive = function() {
        SOLACE_LOG_DEBUG("sendKeepAlive called..." + this.getSessionIdForLogging());
        var sessionEvent;

        var result = this.allowOperation(4);
        if (result) {
            SOLACE_LOG_INFO("sendKeepAlive: disallowed op " + result + this.getSessionIdForLogging());
            if (this.shallNotifyClient()) {
                sessionEvent = new solace.SessionEvent(SessionEventCode.KEEP_ALIVE_ERROR,
                        result, null,
                        ErrorSubcode.INVALID_SESSION_OPERATION, null, null);
                this.sendEvent(sessionEvent);
            }
            else {
               SOLACE_LOG_INFO("Ignore keep alive error on a session in state " + solace.InternalSessionStateDescription[this.m_sessionState] + this.getSessionIdForLogging());
            }
            return;
        }

        // session is in connected state but hasn't received keep alive response
        // Less than or equal to because this is the number of *already sent* KAs
        if (this.m_keepAliveCounter >= this.m_sessionProperties.keepAliveIntervalsLimit) {
            SOLACE_LOG_ERROR("Exceed maximum keep alive intervals limit " + this.m_sessionProperties.keepAliveIntervalsLimit + this.getSessionIdForLogging());
            // stop timers
            SOLACE_LOG_INFO("Stop keep alive timer");
            if (this.m_kaWatchdog) {
                clearInterval(this.m_kaWatchdog);
            }
            if (this.m_keepAliveTimer) {
                clearInterval(this.m_keepAliveTimer);
            }

            // change session state
            this.changeState(9);

            // send event
            sessionEvent = new solace.SessionEvent(SessionEventCode.KEEP_ALIVE_ERROR,
                    "Exceed maximum keep alive intervals limit",
                    null, ErrorSubcode.KEEP_ALIVE_FAILURE, null, null);
            this.sendEvent(sessionEvent);
            return;
        }

        SOLACE_LOG_DEBUG("About to send keep alive" + this.getSessionIdForLogging());
        var kaMsg = new solace.smf.KeepAliveMessage();
        var smfClient = this.m_smfClient;
        var prestat_msgWritten = smfClient.getClientStats().msgWritten;
        var prestat_bytesWritten = smfClient.getClientStats().bytesWritten;
        
        var returnCode = this.m_smfClient.send(kaMsg, true);
        if (returnCode !== 0) {
            /*
            if (returnCode === 2) {
                // no need to disconnect session right now
                this.m_keepAliveCounter++;
                SOLACE_LOG_INFO("Increment keep alive counter due to insufficent space, keep alive count=" + this.m_keepAliveCounter + this.getSessionIdForLogging());
            }
            else {   below         }
            Not possible. Send is called with the forceAllowEnqueue parameter.
            */
            if (this.shallNotifyClient()) {
                SOLACE_LOG_INFO("Cannot send keep alive message, return code " + solace.TransportReturnCodeDescription[returnCode]);
                // change session state
                this.changeState(9);
                sessionEvent = new solace.SessionEvent(SessionEventCode.KEEP_ALIVE_ERROR,
                        "Cannot send keep alive message",
                        null, ErrorSubcode.COMMUNICATION_ERROR, null, null);
                this.sendEvent(sessionEvent);
            }
            else {
                SOLACE_LOG_INFO("Ignore keep alive error on a session in state " + solace.InternalSessionStateDescription[this.m_sessionState] + this.getSessionIdForLogging());
            }
        }
        else {
            // update stats
            this.updateTxStats(kaMsg);

            // We need to avoid incrementing the KA counter if we're in the process of
            // sending a huge message and we've had no opportunity to write a KA message.
            // Detection: last KA's snapshot of messages written is equal to right now, but number of bytes written has gone up.
            if (this.m_kaStats.lastMsgWritten === prestat_msgWritten &&
                this.m_kaStats.lastBytesWritten < prestat_bytesWritten) {
                SOLACE_LOG_INFO("Keep alive sent, not incrementing keep alive counter due to large message send, KA count = " + this.m_keepAliveCounter + this.getSessionIdForLogging());
            } else {
                this.m_keepAliveCounter++;
                SOLACE_LOG_DEBUG("Last message written: " + this.m_kaStats.lastMsgWritten);
                SOLACE_LOG_DEBUG("Last bytes written: " + this.m_kaStats.lastBytesWritten);
                SOLACE_LOG_INFO("Keep alive sent, increment keep alive counter, keep alive count = " + this.m_keepAliveCounter + this.getSessionIdForLogging());
            }
            this.m_kaStats.lastBytesWritten = smfClient.getClientStats().bytesWritten;
            this.m_kaStats.lastMsgWritten = smfClient.getClientStats().msgWritten;

        }
    };


    /**
     * Reapply subscriptions. This method is called only when subscription cache is not empty.
     * @private
     */
    solace.Session.prototype.reapplySubscriptions = function() {
        if (this.m_sessionState !== 11) {
            var result = this.allowOperation(6);
            if (result) {
                this.m_inReconnect = false;
                this.clearSubscriptionCacheKeys();
                var sessionEvent = new solace.SessionEvent(SessionEventCode.SUBSCRIPTION_ERROR,
                        result, null,
                        ErrorSubcode.INVALID_SESSION_OPERATION, null, null);
                this.sendEvent(sessionEvent);
                return;
            }
    
            this.changeState(11);
        }

        SOLACE_LOG_DEBUG("Reapplying subscriptions" + this.getSessionIdForLogging());
        // add subscriptions and ask for confirm on last one
        var myThis = this;
        var applyCallback = function (rxMsgObj) {
            myThis.handleApplySubscriptionResponse(rxMsgObj);
        };

        if (this.m_subscriptionCacheKeys) {
            var key = null;
            try {
                while (this.m_subscriptionCacheKeys.length > 0) {
                    key = this.m_subscriptionCacheKeys[0];
                    if (this.m_subscriptionCacheKeys.length === 1) {
                        this.subscriptionUpdate(this.m_subscriptionCache[key], true, null,
                                    this.m_sessionProperties.readTimeoutInMsecs, 4,
                                    applyCallback);
                    }
                    else {
                        this.subscriptionUpdate(this.m_subscriptionCache[key], false, null,
                                    this.m_sessionProperties.readTimeoutInMsecs, 4, null);
                    }
                    // remove applied subscription
                    this.m_subscriptionCacheKeys.shift();
                }
            } catch (e) {
                if (e.name && e.name === "OperationError" && e.subcode === ErrorSubcode.INSUFFICIENT_SPACE) {
                    SOLACE_LOG_INFO("Apply subscriptions blocked due to insufficient space, wait for can accept data event" + this.getSessionIdForLogging());
                }
                else {
                    throw e;
                }
            }
        }
    };

    /**
     * @private
     * Callback function for applySubscription response
     * @param smpMsg
     */
    solace.Session.prototype.handleApplySubscriptionResponse = function(smpMsg) {
        var response = smpMsg.getResponse();
        var respCode = response.ResponseCode;
        var respText = response.ResponseString;
        var sessionEvent;
        var errorSubCode;

        // for reapply subscriptions operations, only the last subscription add require confirm
        // so if success response received, should change the session state to connected and send
        // out a session up event
        this.m_inReconnect = false;
        this.clearSubscriptionCacheKeys();

        if (respCode !== 200) {
            var subscriptionStr = solace.Util.stripNullTerminate(smpMsg.EncodedUtf8Subscription);
            errorSubCode = solace.ErrorResponseSubCodeMapper.getErrorSubCode(respCode, respText);
            if (!(errorSubCode === ErrorSubcode.SUBSCRIPTION_ALREADY_PRESENT &&
                this.m_sessionProperties.ignoreDuplicateSubscriptionError)) {
                // notify client
                sessionEvent = new solace.SessionEvent(SessionEventCode.REAPPLY_SUBSCRIPTION_ERROR,
                        respText, respCode, errorSubCode, null, "Topic: " + subscriptionStr);
                this.sendEvent(sessionEvent);
            }
        }

        // change state
        this.changeState(8);

        // start keep alive
        this.scheduleKeepAlive();

        // notify client
        sessionEvent = new solace.SessionEvent(SessionEventCode.UP_NOTICE,
            strFmt("Session is up (transport:{0})", this.m_transportProtocolHandler.getTransportProtocol()),
            respCode, 0, null, null);
        this.sendEvent(sessionEvent);

    };

    /**
     * @private
     * Callback function for subscribe/unsubscribe response
     * @param smpMsg
     * @param {solace.OutstandingCtrlRequest} request
     */
    solace.Session.prototype.handleSubscriptionUpdateResponse = function (smpMsg, request) {
        var response = smpMsg.getResponse();
        var respCode = response.ResponseCode;
        var respText = response.ResponseString;
        var sessionEvent;

        if (respCode === 200) {
            var correlationKey = request.correlationKey;

            // notify client
            sessionEvent = new solace.SessionEvent(SessionEventCode.SUBSCRIPTION_OK,
                    respText, respCode, 0, correlationKey, null);
            this.sendEvent(sessionEvent);
        }
        else {
            var subscriptionStr = solace.Util.stripNullTerminate(smpMsg.EncodedUtf8Subscription);
            this.handleSubscriptionUpdateError(respCode, respText, subscriptionStr, request);
        }
    };

    /**
     * @private
     * @param respCode
     * @param respText
     * @param subscriptionStr
     * @param request
     */
    solace.Session.prototype.handleSubscriptionUpdateError = function (respCode, respText, subscriptionStr, request) {
        var errorSubCode = solace.ErrorResponseSubCodeMapper.getErrorSubCode(respCode, respText);
        var SUBSCRIPTION_ERROR = SessionEventCode.SUBSCRIPTION_ERROR;
        var correlationKey = null;
        if (request !== null) {
            correlationKey = request.correlationKey;
        }
        var sessionEvent;
        if ((errorSubCode === ErrorSubcode.SUBSCRIPTION_ALREADY_PRESENT &&
                this.m_sessionProperties.ignoreDuplicateSubscriptionError) ||
                 (errorSubCode === ErrorSubcode.SUBSCRIPTION_NOT_FOUND &&
                        this.m_sessionProperties.ignoreSubscriptionNotFoundError)) {
            // if request is not null, this request needs confirm
            if (request !== null) {
                // notify client
                sessionEvent = new solace.SessionEvent(
                        SessionEventCode.SUBSCRIPTION_OK,
                        respText, respCode, 0, correlationKey, null);
                this.sendEvent(sessionEvent);
            }
        }
        else if (errorSubCode === ErrorSubcode.SUBSCRIPTION_ALREADY_PRESENT ||
                errorSubCode === ErrorSubcode.SUBSCRIPTION_NOT_FOUND) {
            // notify client
            sessionEvent = new solace.SessionEvent(
                    SUBSCRIPTION_ERROR, respText, respCode,
                    errorSubCode, correlationKey, "Topic: " + subscriptionStr);
            this.sendEvent(sessionEvent);
        }
        else if  (errorSubCode === ErrorSubcode.SUBSCRIPTION_ATTRIBUTES_CONFLICT ||
                errorSubCode === ErrorSubcode.SUBSCRIPTION_INVALID ||
                errorSubCode === ErrorSubcode.SUBSCRIPTION_ACL_DENIED ||
                errorSubCode === ErrorSubcode.SUBSCRIPTION_TOO_MANY) {
            // remove from cache
            this.removeFromSubscriptionCache(subscriptionStr);
            // notify client
            sessionEvent = new solace.SessionEvent(
                    SUBSCRIPTION_ERROR, respText, respCode,
                    errorSubCode, correlationKey, "Topic: " + subscriptionStr);
            this.sendEvent(sessionEvent);
        }
        else {
            // remove from cache
            this.removeFromSubscriptionCache(subscriptionStr);
            // notify client
            sessionEvent = new solace.SessionEvent(
                    SUBSCRIPTION_ERROR, respText, respCode,
                    ErrorSubcode.SUBSCRIPTION_ERROR_OTHER, correlationKey, "Topic: " + subscriptionStr);
            this.sendEvent(sessionEvent);
        }
    };

    /**
     * @private
     * @returns {solace.SessionEventCBInfo}
     */
    solace.Session.prototype.getEventCBInfo = function() {
        return this.m_eventCallbackInfo;
    };

    /**
     * @private
     * @param eventCBInfo {solace.SessionEventCBInfo}
     */
    solace.Session.prototype.setEventCBInfo = function(eventCBInfo) {
        this.m_eventCallbackInfo = eventCBInfo;
    };

    /**
     * @private
     * @returns {solace.MessageRxCBInfo}
     */
    solace.Session.prototype.getMessageCBInfo = function() {
        return this.m_messageCallbackInfo;
    };

    /**
     * @private
     * @param messageCBInfo {solace.MessageRxCBInfo}
     */
    solace.Session.prototype.setMessageCBInfo = function(messageCBInfo) {
        this.m_messageCallbackInfo = messageCBInfo;
    };

    /**
     * @private
     */
    solace.Session.prototype.cleanupSession = function() {
        SOLACE_LOG_INFO("Clean up session" + this.getSessionIdForLogging());
        this.m_sessionId = null;
        this.m_inReconnect = false;

//        SOLACE_LOG_DEBUG("========>Keepalive timer " + this.m_keepAliveTimer + this.getSessionIdForLogging());
        if (typeof this.m_keepAliveTimer !== "undefined" && this.m_keepAliveTimer !== null) {
            SOLACE_LOG_DEBUG("Cancel keepalive timer" + this.getSessionIdForLogging());
            clearInterval(this.m_keepAliveTimer);
            clearInterval(this.m_kaWatchdog);
            this.m_keepAliveTimer = null;
        }
        this.resetKeepAliveCounter();

        var index;
        if (this.m_outstandingCtrlReqs) {
            SOLACE_LOG_DEBUG("Cancel all outstanding ctrl requests" + this.getSessionIdForLogging());
            for (index in this.m_outstandingCtrlReqs) {
                if (this.m_outstandingCtrlReqs.hasOwnProperty(index)) {
                    this.cancelOutstandingCtrlReq(index);
                }
            }
        }

        if (this.m_outstandingDataReqs) {
            SOLACE_LOG_DEBUG("Cancel all outstanding data requests" + this.getSessionIdForLogging());
            var dataReq;
            for (index in this.m_outstandingDataReqs) {
                if (this.m_outstandingDataReqs.hasOwnProperty(index)) {
                    dataReq = this.cancelOutstandingDataReq(index);
                    if (dataReq !== null && (typeof dataReq.reqFailedCBFunction !== "undefined") && dataReq.reqFailedCBFunction !== null) {
                        var sessionEvent = new solace.SessionEvent(
                                SessionEventCode.REQUEST_ABORTED, "Request aborted", null,
                                ErrorSubcode.SESSION_NOT_CONNECTED, null, null);

                        dataReq.reqFailedCBFunction(this, sessionEvent, dataReq.userObject);
                    }
                }
            }
        }
    };

    /**
     * @private
     */
    solace.Session.prototype.destroyTransportSession = function(msg, subCode) {
        if (typeof this.m_smfClient !== "undefined" && this.m_smfClient !== null) {
            SOLACE_LOG_INFO("Destroy transport session" + this.getSessionIdForLogging());

            // Capture old client, because destroying it might cause a new
            // one to be created
            var oldClient = this.m_smfClient;
            this.m_smfClient = null;
            var returnCode = oldClient.destroy(true, msg, subCode);

            if (returnCode !== 0) {
                SOLACE_LOG_ERROR("Failed to destroy transport session" + this.getSessionIdForLogging() + ", return code: " + solace.TransportReturnCodeDescription[returnCode]);
            }

            // resource is in oldClient; released at end of scope
        }
    };

    /**
     * @private
     */
    solace.Session.prototype.clearSubscriptionCacheKeys = function() {
        if (this.m_subscriptionCacheKeys) {
            try {
                while (this.m_subscriptionCacheKeys.length > 0) {
                    this.m_subscriptionCacheKeys.shift();
                }
            }
            catch (e) {
                SOLACE_LOG_ERROR("Failed to remove item from subscription cache keys" + this.getSessionIdForLogging() + ", exception: " + e.message);
            }
            this.m_subscriptionCacheKeys = null;
        }
    };

    /**
     * Gets a transport session information string.
     * This string is informative only, and applications should not attempt to parse it.
     *
     * @return {string}
     */
    solace.Session.prototype.getTransportInfo = function() {
        if (typeof this.m_smfClient === "undefined" || this.m_smfClient !== null) {
            return "Not connected.";
        }
        return this.m_smfClient.getTransportSessionInfoStr();
    };

    /**
     * @private
     *
     * @return {string}
     */
    solace.Session.prototype.getSessionIdForLogging = function() {
        var msg = StringUtil.notEmpty(this.m_sessionId) ? solace.Util.formatHexString(this.m_sessionId) : "N/A";
        return " (sessionId=" + msg + ")";
    };

    /**
     * @class
     * @private
     * Construct a mapping between {solace.ErrorResponseSubCodeMapper.ResponseCode},
     * {solace.ErrorResponseSubCodeMapper.ResponseErrorStr} and
     * {solace.ErrorSubcode}.
     *
     * @param {solace.ErrorResponseSubCodeMapper.ResponseCode} respErrorCode
     * @param {solace.ErrorResponseSubCodeMapper.ResponseErrorStr} respErrorStr
     * @param {solace.ErrorSubcode} errSubCode
     */
    solace.ResponseErrorMap = function(respErrorCode, respErrorStr, errSubCode) {
        this.respErrorCode = respErrorCode;
        this.respErrorStr = respErrorStr;
        this.errSubCode = errSubCode;
    };

    /**
     * @class
     * @private
     * @description Return {solace.ErrorSubcode} based on response code and response string
     * from the appliance.
     */
    solace.ErrorResponseSubCodeMapper = {
    };

    /**
     * @private
     * Static method
     * @param {number} respErrorCode
     * @param {string} respStr
     */
    solace.ErrorResponseSubCodeMapper.getErrorSubCode = function(respErrorCode, respStr) {
        if (respErrorCode === solace.ErrorResponseSubCodeMapper.ResponseCode.E200_OK) {
            // success response, error subcode is 0 -  transport session use 0 as OK
            return 0;
        }
        var i;
        var errorMap;
        var ResponseErrorMapping = solace.ErrorResponseSubCodeMapper.ResponseErrorMapping;
        var len = ResponseErrorMapping.length;
        for (i = 0; i < len; i++) {
            errorMap = ResponseErrorMapping[i];
            if (errorMap.respErrorCode === respErrorCode) {
                if (errorMap.respErrorStr === null || respStr.toLowerCase().indexOf(errorMap.respErrorStr.toLowerCase()) >= 0) {
                    return errorMap.errSubCode;
                }
            }
        }

        var buf = new solace.StringBuffer("Cannot find error subcode for response error code=");
        buf.append(respErrorCode).append(", response string");
        buf.append(respStr);
        SOLACE_LOG_ERROR(buf.toString());

        return ErrorSubcode.UNKNOWN_ERROR;
    };

    /**
     * @private
     * Static class property
     */
    solace.ErrorResponseSubCodeMapper.ResponseCode = {
        E200_OK: 200,
        E400: 400,
        E401: 401,
        E403: 403,
        E404: 404,
        E503: 503,
        E507: 507
    };

    /**
     * @private
     * Static class property
     */
    solace.ErrorResponseSubCodeMapper.ResponseErrorStr = {
//        ER_UNAUTHORIZED: "unauthorized",
//		ER_NOT_FOUND: "not found",
//		ER_UNKNOWN_CLIENT_NAME: "unknown client name",
//		ER_INVALID_USERNAME: "invalid username",
		ER_XML_PARSE_ERROR: "xml parse error",
		ER_DOC_TOO_LARGE: "document is too large",
		ER_MSG_TOO_LARGE: "message too long",
		ER_TOO_MANY_CLIENTS: "too many clients",
		ER_SUB_DELETE_IN_PROGRESS: "subscriber delete in progress",
		ER_INVALID_VIRTUAL_IP: "invalid virtual router address",
		ER_SUB_ALREADY_PRESENT: "subscription already exists",
		ER_SUB_NOT_FOUND: "subscription not found",
		ER_SUB_PARSE_ERROR: "subscription parse error",
		ER_SUB_MAX_NUMBER_EXCEEDED: "max num subscriptions exceeded",
		ER_TOPIC_PARSE_ERROR: "topic parse error",
		ER_NOT_ENOUGH_SPACE: "not enough space",
		ER_MSG_VPN_NOT_ALLOWED: "message vpn not allowed",
		ER_MSG_VPN_UNAVAILABLE: "message vpn unavailable",
		ER_CLIENT_USERNAME_IS_SHUTDOWN: "client username is shutdown",
		ER_DYNAMIC_CLIENTS_NOT_ALLOWED: "dynamic clients not allowed",
		ER_CLIENT_NAME_ALREADY_IN_USE: "client name already in use",
		ER_CLIENT_NAME_PARSE_ERROR: "client name parse error",
		ER_FORBIDDEN: "Forbidden",
		ER_SUBSCRIPTION_ACL_DENIED: "Subscription ACL Denied",
		ER_PUBLISH_ACL_DENIED: "Publish ACL Denied",
		ER_SUBSCRIPTION_ATTRIBUTES_CONFLICT_WITH_EXISTING_SUBSCRIPTION: "Subscription Attributes Conflict With Existing Subscription",
		ER_INACTIVITY_TIMEOUT: "Inactivity Timeout",
		ER_UNKNOWN_TRANSPORT_SESSION_ID: "Unknown Transport Session Identifier",
        ER_REPLICATION_IS_STANDBY: "Replication Is Standby"
    };

    /**
     * @private
     * Static class property
     */
    solace.ErrorResponseSubCodeMapper.ResponseErrorMapping = (function() {
        var ResponseCode = solace.ErrorResponseSubCodeMapper.ResponseCode;
        var ResponseErrorStr = solace.ErrorResponseSubCodeMapper.ResponseErrorStr;
        return [
            new solace.ResponseErrorMap(ResponseCode.E401, null, ErrorSubcode.LOGIN_FAILURE),
            new solace.ResponseErrorMap(ResponseCode.E404, null, ErrorSubcode.LOGIN_FAILURE),
            new solace.ResponseErrorMap(ResponseCode.E403, ResponseErrorStr.ER_INVALID_VIRTUAL_IP, ErrorSubcode.INVALID_VIRTUAL_ADDRESS),
            new solace.ResponseErrorMap(ResponseCode.E403, ResponseErrorStr.ER_MSG_VPN_NOT_ALLOWED, ErrorSubcode.MESSAGE_VPN_NOT_ALLOWED),
            new solace.ResponseErrorMap(ResponseCode.E403, ResponseErrorStr.ER_CLIENT_USERNAME_IS_SHUTDOWN, ErrorSubcode.CLIENT_USERNAME_IS_SHUTDOWN),
            new solace.ResponseErrorMap(ResponseCode.E403, ResponseErrorStr.ER_DYNAMIC_CLIENTS_NOT_ALLOWED, ErrorSubcode.DYNAMIC_CLIENTS_NOT_ALLOWED),
            new solace.ResponseErrorMap(ResponseCode.E403, ResponseErrorStr.ER_CLIENT_NAME_ALREADY_IN_USE, ErrorSubcode.CLIENT_NAME_ALREADY_IN_USE),
            new solace.ResponseErrorMap(ResponseCode.E503, ResponseErrorStr.ER_SUB_DELETE_IN_PROGRESS, ErrorSubcode.CLIENT_DELETE_IN_PROGRESS),
            new solace.ResponseErrorMap(ResponseCode.E503, ResponseErrorStr.ER_TOO_MANY_CLIENTS, ErrorSubcode.TOO_MANY_CLIENTS),
            new solace.ResponseErrorMap(ResponseCode.E503, ResponseErrorStr.ER_MSG_VPN_UNAVAILABLE, ErrorSubcode.MESSAGE_VPN_UNAVAILABLE),
            new solace.ResponseErrorMap(ResponseCode.E400, ResponseErrorStr.ER_CLIENT_NAME_PARSE_ERROR, ErrorSubcode.CLIENT_NAME_INVALID),
            new solace.ResponseErrorMap(ResponseCode.E403, ResponseErrorStr.ER_FORBIDDEN, ErrorSubcode.CLIENT_ACL_DENIED),
            new solace.ResponseErrorMap(ResponseCode.E400, ResponseErrorStr.ER_XML_PARSE_ERROR, ErrorSubcode.XML_PARSE_ERROR),
            new solace.ResponseErrorMap(ResponseCode.E400, ResponseErrorStr.ER_DOC_TOO_LARGE, ErrorSubcode.MESSAGE_TOO_LARGE),
            new solace.ResponseErrorMap(ResponseCode.E400, ResponseErrorStr.ER_MSG_TOO_LARGE, ErrorSubcode.MESSAGE_TOO_LARGE),
            new solace.ResponseErrorMap(ResponseCode.E400, ResponseErrorStr.ER_TOPIC_PARSE_ERROR, ErrorSubcode.INVALID_TOPIC_SYNTAX),
            new solace.ResponseErrorMap(ResponseCode.E403, ResponseErrorStr.ER_PUBLISH_ACL_DENIED, ErrorSubcode.PUBLISH_ACL_DENIED),
            new solace.ResponseErrorMap(ResponseCode.E400, ResponseErrorStr.ER_SUB_ALREADY_PRESENT, ErrorSubcode.SUBSCRIPTION_ALREADY_PRESENT),
            new solace.ResponseErrorMap(ResponseCode.E400, ResponseErrorStr.ER_SUB_NOT_FOUND, ErrorSubcode.SUBSCRIPTION_NOT_FOUND),
            new solace.ResponseErrorMap(ResponseCode.E400, ResponseErrorStr.ER_SUB_PARSE_ERROR, ErrorSubcode.SUBSCRIPTION_INVALID),
            new solace.ResponseErrorMap(ResponseCode.E400, ResponseErrorStr.ER_SUB_MAX_NUMBER_EXCEEDED, ErrorSubcode.SUBSCRIPTION_TOO_MANY),
            new solace.ResponseErrorMap(ResponseCode.E400, ResponseErrorStr.ER_NOT_ENOUGH_SPACE, ErrorSubcode.OUT_OF_RESOURCES),
            new solace.ResponseErrorMap(ResponseCode.E403, ResponseErrorStr.ER_SUBSCRIPTION_ACL_DENIED, ErrorSubcode.SUBSCRIPTION_ACL_DENIED),
            new solace.ResponseErrorMap(ResponseCode.E400, ResponseErrorStr.ER_SUBSCRIPTION_ATTRIBUTES_CONFLICT_WITH_EXISTING_SUBSCRIPTION, ErrorSubcode.SUBSCRIPTION_ATTRIBUTES_CONFLICT),
            new solace.ResponseErrorMap(ResponseCode.E400, ResponseErrorStr.ER_INACTIVITY_TIMEOUT, ErrorSubcode.INACTIVITY_TIMEOUT),
            new solace.ResponseErrorMap(ResponseCode.E400, ResponseErrorStr.ER_UNKNOWN_TRANSPORT_SESSION_ID, ErrorSubcode.UNKNOWN_TRANSPORT_SESSION_ID),
            new solace.ResponseErrorMap(ResponseCode.E403, ResponseErrorStr.ER_REPLICATION_IS_STANDBY, ErrorSubcode.REPLICATION_IS_STANDBY)    
        ];
    }());

    /**
     * @private
     * @param correlationId
     * @param timer
     * @param userObject
     *  @param replyReceivedCBFunction
     */
    solace.OutstandingDataRequest = function OutstandingDataRequest(correlationId, timer, replyReceivedCBFunction, reqFailedCBFunction, userObject) {
        this.correlationId = correlationId;
        this.timer = timer;
        this.replyReceivedCBFunction = replyReceivedCBFunction;
        this.reqFailedCBFunction = reqFailedCBFunction;
        this.userObject = userObject;
    };
    

    /**
     * @class Represents an outstanding control request
     * @private
     *
     * @param {string} correlationTag
     * @param {number} timer
     * @param {number} requestType
     * @param {Object} correlationKey
     * @param {function(*)} respRecvdCallback
     */
    solace.OutstandingCtrlRequest = function OutstandingCtrlRequest(correlationTag, timer, requestType, correlationKey, respRecvdCallback) {
        this.correlationTag = correlationTag;
        this.timer = timer;
        this.requestType = requestType;
        this.correlationKey = correlationKey;
        this.respRecvdCallback = respRecvdCallback;
    };

    /**
     * @private
     */
    solace.CacheRequestPrefix = "#CRQ";

}(solace));
//
/*global solace:true,window,global,escape,unescape,WebSocket,ArrayBuffer,Uint8Array,WebSocket,QUnit,SOLACE_LOG_FATAL,SOLACE_LOG_ERROR,SOLACE_LOG_WARN,SOLACE_LOG_INFO,SOLACE_LOG_DEBUG,SOLACE_LOG_TRACE */
// 
// 

(function(solace){
    solace.smf = solace.smf || {};

    var bits = function(val, shift, num_bits){
        return (val >>> shift) & ((0x01 << num_bits) - 1);
    };

    var setBits = function(data, val, shift, num_bits) {
        var curMask = (1 << num_bits) - 1;
        var shiftedVal = (val & curMask) << shift;
        data &= ~(curMask << shift);
        return (data | shiftedVal);
    };

    solace.smf.Codec = {
        // alias bits/setBits for public use
        bits: bits,
        setBits: setBits
    };

    solace.smf.Codec.isSmfHeaderAvailable = function(data, offset) {
        var remaining = data.length - offset;
        if (remaining < 12) {
            //SOLACE_LOG_DEBUG("Smf header not available, number of bytes in buffer = " + remaining);
            return false;
        }

//        var version = solace.Convert.strToInt8(data.substr(offset + 0, 1)) & 0x7;
//        if (version !== 3) {
//            SOLACE_LOG_ERROR("Invalid smf version in smf header, version=" + version);
//            return false;
//        }
        return true;
    };

    solace.smf.Codec.isSmfHeaderValid = function(data, offset) {
        if (!solace.smf.Codec.isSmfHeaderAvailable(data, offset)) {
            return false;
        }
        var version = solace.Convert.strToInt8(data.substr(offset + 0, 1)) & 0x7;
        if (version !== 3) {
            SOLACE_LOG_ERROR("Invalid smf version in smf header, version=" + version);
            return false;
        }
        return true;
    };

    solace.smf.Codec.isSmfAvailable = function(data, offset){
        if (!solace.smf.Codec.isSmfHeaderValid(data, offset)) {
            return false;
        }
        var remaining = data.length - offset;
        var totalLen = solace.Convert.strToUInt32(data.substr(offset + 8, 4));
        return (totalLen <= remaining);
    };

    solace.smf.Codec.parseSmfAt = function(data, offset, readHeaderOnly){
        if (!this.isSmfHeaderValid(data, offset)) {
            SOLACE_LOG_DEBUG("Valid Smf header not available");
            return false;
        }
        var pos = offset;

        // Reading fixed header block (12 bytes)
        var word1 = solace.Convert.strToInt32(data.substr(pos + 0, 4));
        var headerLen = solace.Convert.strToUInt32(data.substr(pos + 4, 4));
        var word3 = solace.Convert.strToUInt32(data.substr(pos + 8, 4));

        var smfHeader = new solace.smf.SMFHeader();
        smfHeader.m_smf_di = bits(word1, 31, 1);
        smfHeader.m_smf_elidingeligible = bits(word1, 30, 1);
        smfHeader.m_smf_dto = bits(word1, 29, 1);
        smfHeader.m_smf_adf = bits(word1, 28, 1);
        smfHeader.m_smf_version = bits(word1, 24, 3);
        smfHeader.m_smf_uh = bits(word1, 22, 2);
        smfHeader.m_smf_protocol = bits(word1, 16, 6);
        smfHeader.m_smf_priority = bits(word1, 12, 4);
        smfHeader.m_smf_ttl = bits(word1, 0, 8);

        var payloadLen = word3 - headerLen;
        if (payloadLen < 0) {
            SOLACE_LOG_INFO("SMF parse error: lost framing");
            return false; // SMF parse error: lost framing
        }
        smfHeader.setMessageSizes(headerLen, payloadLen);
        if (readHeaderOnly) {
            return smfHeader;
        }
        pos += 12;

        // Reading variable-length params
        while (pos < (offset + headerLen)) {
            var prm_byte1 = solace.Convert.strToInt8(data.substr(pos, 1));
            pos++;
            var prm_uh = bits(prm_byte1, 6, 2);
            var prm_isLW = (bits(prm_byte1, 5, 1) !== 0);
            var prm_type = 0;
            var prm_len = 0;
            var prm_valueLen = 0;

            if (prm_isLW) {
                // LIGHTWEIGHT param
                prm_type = bits(prm_byte1, 2, 3);
                prm_len = bits(prm_byte1, 0, 2) + 1;
                prm_valueLen = prm_len - 1;
                if (prm_len <= 0) {
                    return false; // Invalid parameter
                }
                switch (prm_type) {
                    case 0x00:
                        smfHeader.m_pm_corrtag = solace.Convert.strToInt24(data.substr(pos, 3));
                        break;
                    case 0x01:
                        var parsed_qo = this.ParamParse.parseTopicQueueOffsets(data, pos);
                        smfHeader.m_pm_queue_offset = parsed_qo[0];
                        smfHeader.m_pm_queue_len = parsed_qo[1];
                        break;
                    case 0x02:
                        var parsed_to = this.ParamParse.parseTopicQueueOffsets(data, pos);
                        smfHeader.m_pm_topic_offset = parsed_to[0];
                        smfHeader.m_pm_topic_len = parsed_to[1];
                        break;
                }
                pos += prm_valueLen;
            }
            else {
                // REGULAR encoded param
                prm_type = bits(prm_byte1, 0, 5);
                if (prm_type === 0) {
                    break; // PADDING (break while: header finished)
                }
                prm_len = solace.Convert.strToInt8(data.substr(pos, 1));
                pos++;
                if (prm_len === 0) {
                    // extended-length parameter (32-bit)
                    prm_len = solace.Convert.strToUInt32(data.substr(pos, 4));
                    pos += 4;
                    prm_valueLen = prm_len - 6;
                }
                else {
                    prm_valueLen = prm_len - 2;
                }
                if (prm_len <= 0) {
                    return false; // Invalid parameter
                }
                switch (prm_type) {
                    case 0x03:
                        smfHeader.m_pm_msg_priority = solace.Convert.strToInt8(data.substr(pos, 1));
                        break;
                    case 0x04:
                        smfHeader.m_pm_userdata = data.substr(pos, prm_valueLen);
                        break;
                    case 0x06:
                        // only useful on API -> appliance
                        smfHeader.m_pm_username = solace.base64_decode(data.substr(pos, prm_valueLen));
                        break;
                    case 0x07:
                        // only useful on API -> appliance
                        smfHeader.m_pm_password = solace.base64_decode(data.substr(pos, prm_valueLen));
                        break;
                    case 0x08:
                        var response_parsed = this.ParamParse.parseResponseParam(data, pos, prm_valueLen);
                        smfHeader.m_pm_respcode = response_parsed[0];
                        smfHeader.m_pm_respstr = response_parsed[1];
                        break;
                    case 0x0A:
                    case 0x0B:
                    case 0x0C:
                        // deprecated
                        break;
                    case 0x10:
                        smfHeader.m_pm_deliverymode = this.ParamParse.parseDeliveryMode(data, pos);
                        break;
                    case 0x11:
                        smfHeader.m_pm_ad_msgid = 0; //No support
                        break;
                    case 0x12:
                        smfHeader.m_pm_ad_prevmsgid = 0; //No support
                        break;
                    case 0x13:
                        smfHeader.m_pm_ad_redelflag = true;
                        break;
                    case 0x14:
                        smfHeader.m_pm_ad_ttl = 0; //AD unsupported
                        break;
                    case 0x16:
                        var contentSummary = this.ParamParse.parseContentSummary(data, pos, prm_valueLen);
                        if (contentSummary) {
                            smfHeader.m_pm_content_summary = contentSummary;
                        }
                        else {
                            return false; // invalid message content summary parameter
                        }
                        break;
                    case 0x17:
                        smfHeader.m_pm_ad_flowid = 0; // AD unsupported
                        break;
                    case 0x18:
                        // copy bytes but strip null-terminator (last byte)
                        smfHeader.m_pm_tr_topicname_bytes = data.substr(pos, prm_valueLen - 1);
                        break;
                    case 0x19:
                        smfHeader.m_pm_ad_flowredelflag = true;
                        break;

                } // end param type switch block
                pos += prm_valueLen;
            } // end (regular param)
        } // end while
        return smfHeader;
    };


    // ParamParse module
    solace.smf.Codec.ParamParse = (function() {
        // private data
        var LUT_delModeToEnum = (function() {
            var lut = [];
            lut[0x00] = solace.MessageDeliveryModeType.NON_PERSISTENT;
            lut[0x01] = solace.MessageDeliveryModeType.PERSISTENT;
            lut[0x02] = solace.MessageDeliveryModeType.DIRECT;
            return lut;
        }());
        var LUT_enumToDelMode = (function() {
            var lut = [];
            lut[solace.MessageDeliveryModeType.NON_PERSISTENT] = solace.Convert.int8ToStr(0x00);
            lut[solace.MessageDeliveryModeType.PERSISTENT] = solace.Convert.int8ToStr(0x01);
            lut[solace.MessageDeliveryModeType.DIRECT] = solace.Convert.int8ToStr(0x02);
            return lut;
        }());

        // public members: can be called to encode/decode SMF parameters
        return {
            parseTopicQueueOffsets: function(data, offset) {
                var result = [];
                result[0] = solace.Convert.strToInt8(data.substr(offset, 1));
                result[1] = solace.Convert.strToInt8(data.substr(offset + 1, 1));
                return result;
            },
            parseResponseParam: function(data, offset, param_len) {
                var result = [];
                result[0] = solace.Convert.strToInt32(data.substr(offset, 4));
                var resp_string_len = param_len - 4;
                if (resp_string_len > 0) {
                    result[1] = data.substr(offset + 4, resp_string_len);
                }
                else {
                    result[1] = "";
                }
                return result;
            },
            parseDeliveryMode: function(data, offset) {
                var delmode = solace.Convert.strToInt8(data.substr(offset, 1));
                return LUT_delModeToEnum[delmode] || solace.MessageDeliveryModeType.DIRECT;
            },
            encDeliveryMode: function(delmode) {
                var lut = LUT_enumToDelMode;
                return lut[delmode] || lut[solace.MessageDeliveryModeType.DIRECT];
            },
            ContentSummaryType: {
                // the type in here matches the SMF encoding value
                XML_META: 0,
                XML_PAYLOAD: 1,
                BINARY_ATTACHMENT: 2,
                CID_LIST: 3,
                BINARY_METADATA: 4
            },
            ContentSummaryElement: function() {
                this.Type = null;
                this.Position = 0;
                this.Length = 0;
            },
            parseContentSummary: function(data, offset, length) {
                var elements = [];
                var cumul_size = 0;
                var pos = offset;
                while (pos < offset + length) {
                    var byte1 = solace.Convert.strToInt8(data.substr(pos, 1));
                    var elem_type = bits(byte1, 4, 4);
                    var elem_decl_length = bits(byte1, 0, 4);
                    var elem_size = 0;
                    switch (elem_decl_length) {
                        case 2:
                            elem_size = solace.Convert.strToInt8(data.substr(pos + 1, 1));
                            break;
                        case 3:
                            elem_size = solace.Convert.strToInt16(data.substr(pos + 1, 2));
                            break;
                        case 4:
                            elem_size = solace.Convert.strToInt24(data.substr(pos + 1, 3));
                            break;
                        case 5:
                            elem_size = solace.Convert.strToInt32(data.substr(pos + 1, 4));
                            break;
                    }
                    var oldpos = pos;
                    pos += elem_decl_length;
                    if (oldpos === pos) {
                        SOLACE_LOG_ERROR("Invalid content summary parameter - pos not advancing");
                        return null;
                    }
                    var cur_element = new this.ContentSummaryElement();
                    cur_element.Position = cumul_size;
                    cur_element.Length = elem_size;
                    cumul_size += elem_size;
                    switch (elem_type) {
                        case 0:
                            cur_element.Type = this.ContentSummaryType.XML_META;
                            break;
                        case 1:
                            cur_element.Type = this.ContentSummaryType.XML_PAYLOAD;
                            break;
                        case 2:
                            cur_element.Type = this.ContentSummaryType.BINARY_ATTACHMENT;
                            break;
                        case 3:
                            cur_element.Type = this.ContentSummaryType.CID_LIST;
                            break;
                        case 4:
                            cur_element.Type = this.ContentSummaryType.BINARY_METADATA;
                            break;
                    }
                    elements.push(cur_element);
                } // end while loop
                return elements;
            },
            encContentSummary: function(cs_array) {
                var msg_element_descriptions = [];
                for (var i = 0; i < cs_array.length; i++) {
                    // a ContentSummaryElement
                    var cur_cs = cs_array[i];
                    var cur_sz = "";
                    var firstByte = 0;
                    firstByte = setBits(firstByte, cur_cs.Type, 4, 4);
                    if (cur_cs.Length <= 255) {
                        // element length: 2
                        firstByte = setBits(firstByte, 2, 0, 4);
                        cur_sz = solace.Convert.int8ToStr(cur_cs.Length);
                    } else if (cur_cs.Length <= 65535) {
                        firstByte = setBits(firstByte, 3, 0, 4);
                        cur_sz = solace.Convert.int16ToStr(cur_cs.Length);
                    } else if (cur_cs.Length <= 16777215) {
                        firstByte = setBits(firstByte, 4, 0, 4);
                        cur_sz = solace.Convert.int24ToStr(cur_cs.Length);
                    } else {
                        firstByte = setBits(firstByte, 5, 0, 4);
                        cur_sz = solace.Convert.int32ToStr(cur_cs.Length);
                    }
                    msg_element_descriptions.push(solace.Convert.int8ToStr(firstByte));
                    msg_element_descriptions.push(cur_sz);
                }
                return msg_element_descriptions.join("");
            },
            encSmfParam: function(uh, paramtype, value) {
                var data = [];
                var byte1 = 0;
                var byte2 = 0;
                byte1 = setBits(byte1, uh, 6, 2);
                byte1 = setBits(byte1, paramtype, 0, 5);
                data.push(solace.Convert.int8ToStr(byte1));
                if (value.length <= 253) {
                    byte2 = value.length + 2; // full length of param
                    data.push(solace.Convert.int8ToStr(byte2));
                } else {
                    byte2 = 0; // extended-length
                    data.push(solace.Convert.int8ToStr(byte2));
                    data.push(solace.Convert.int32ToStr(value.length + 6));
                }
                data.push(value);
                return data.join("");
            },
            encLightSmfParam: function(uh, paramtype, value) {
                var data = [];
                var byte1 = 0;
                byte1 = setBits(byte1, uh, 6, 2);
                byte1 = setBits(byte1, 1, 5, 1);
                byte1 = setBits(byte1, paramtype, 2, 3);
                byte1 = setBits(byte1, value.length, 0, 2);
                data.push(solace.Convert.int8ToStr(byte1));
                data.push(value);
                return data.join("");
            }

        };
    }());

    solace.smf.Codec.encSmf = function(message) {
        var output = [];

        // First 4 bytes: protocol, ttl, etc
        var w1 = 0;

        // every set is guarded to check for undefined
        if (message.m_smf_di) {
            w1 = setBits(w1, message.m_smf_di, 31, 1);
        }
        if (message.m_smf_elidingeligible) {
            w1 = setBits(w1, message.m_smf_elidingeligible, 30, 1);
        }
        if (message.m_smf_dto) {
            w1 = setBits(w1, message.m_smf_dto, 29, 1);
        }
        if (message.m_smf_adf) {
            w1 = setBits(w1, message.m_smf_adf, 28, 1);
        }
        if (message.m_smf_version) {
            w1 = setBits(w1, message.m_smf_version,  24, 3);
        }
        if (message.m_smf_uh) {
            w1 = setBits(w1, message.m_smf_uh, 22, 2);
        }
        if (message.m_smf_protocol) {
            w1 = setBits(w1, message.m_smf_protocol, 16, 6);
        }
        if (message.m_smf_priority) {
            w1 = setBits(w1, message.m_smf_priority, 12, 4);
        }
        if (message.m_smf_ttl) {
            w1 = setBits(w1, message.m_smf_ttl, 0, 8);
        }

        var paramspace = [];
        // Encode all standard SMF parameters
        // Topic name and queue/topic offsets are supposed to come first
        if (message.m_pm_tr_topicname_bytes) {
            paramspace.push(
                    solace.smf.Codec.ParamParse.encSmfParam(2, 0x18, message.m_pm_tr_topicname_bytes + "\u0000"));
        }
        var tmptwobytes = 0;
        if (message.m_pm_queue_len) {
            tmptwobytes = 0;
            tmptwobytes = setBits(tmptwobytes, message.m_pm_queue_offset, 8, 8);
            tmptwobytes = setBits(tmptwobytes, message.m_pm_queue_len, 0, 8);
            paramspace.push(
                    solace.smf.Codec.ParamParse.encLightSmfParam(
                            0,
                            0x02,
                            solace.Convert.int16ToStr(tmptwobytes)));
        }
        if (message.m_pm_topic_len) {
            tmptwobytes = 0;
            tmptwobytes = setBits(tmptwobytes, message.m_pm_topic_offset, 8, 8);
            tmptwobytes = setBits(tmptwobytes, message.m_pm_topic_len, 0, 8);
            paramspace.push(
                    solace.smf.Codec.ParamParse.encLightSmfParam(
                            0,
                            0x01,
                            solace.Convert.int16ToStr(tmptwobytes)));
        }
        if (message.m_pm_corrtag !== null) {
            paramspace.push(
                    solace.smf.Codec.ParamParse.encLightSmfParam(
                            0,
                            0x00,
                            solace.Convert.int24ToStr(message.m_pm_corrtag)));
        }
        if (message.m_pm_msg_priority !== null) {
            paramspace.push(
                    solace.smf.Codec.ParamParse.encSmfParam(
                            0,
                            0x03,
                            solace.Convert.int8ToStr(message.m_pm_msg_priority)));
        }
        if (message.m_pm_userdata !== null && message.m_pm_userdata !== "") {
            paramspace.push(
                    solace.smf.Codec.ParamParse.encSmfParam(
                            0,
                            0x04,
                            message.m_pm_userdata));
        }
        if (message.m_pm_username) {
            //do a sloppy base64 (no newlines)
            var username_b64 = solace.base64_encode(message.m_pm_username);
            paramspace.push(
                    solace.smf.Codec.ParamParse.encSmfParam(
                            0,
                            0x06,
                            username_b64));
        }
        if (message.m_pm_password) {
            //do a sloppy base64 (no newlines)
            var passw_b64 = solace.base64_encode(message.m_pm_password);
            paramspace.push(
                    solace.smf.Codec.ParamParse.encSmfParam(
                            0,
                            0x07,
                            passw_b64));
        }
        if (message.m_pm_respcode) {
            // not useful API->appliance
            var resp = solace.Convert.int32ToStr(message.m_pm_respcode);
            resp += message.m_pm_respstr;
            paramspace.push(
                    solace.smf.Codec.ParamParse.encSmfParam(0, 0x08, resp));
        }

        if (message.m_pm_deliverymode !== null) {
            paramspace.push(
                solace.smf.Codec.ParamParse.encSmfParam(
                        0,
                        0x10,
                        solace.smf.Codec.ParamParse.encDeliveryMode(message.m_pm_deliverymode)));
        }

        if (message.m_pm_ad_flowid ||
                message.m_pm_ad_flowredelflag ||
                message.m_pm_ad_msgid ||
                message.m_pm_ad_prevmsgid ||
                message.m_pm_ad_redelflag ||
                message.m_pm_ad_ttl) {
            // don't care: AD parameters
        }
        if (message.m_pm_content_summary) {
            paramspace.push(
                    solace.smf.Codec.ParamParse.encSmfParam(
                            2,
                            0x16,
                            solace.smf.Codec.ParamParse.encContentSummary(message.m_pm_content_summary)));
        }
        // done common SMF parameters!

        // compute header size and full message size
        var encodedParams = paramspace.join("");
        var hdrlen = 12 + encodedParams.length;
        var msglen = hdrlen + message.m_payloadLength;
        output.push(solace.Convert.int32ToStr(w1));
        output.push(solace.Convert.int32ToStr(hdrlen));
        output.push(solace.Convert.int32ToStr(msglen));
        output.push(encodedParams);
        message.setMessageSizes(hdrlen, message.m_payloadLength);

        return output.join("");
    };


// ========== SMP ==========
    solace.smf.Codec.Smp = {
        parseSmpAt: function(data, offset) {
            if ((offset + 6) > data.length) {
                //not enough data
                SOLACE_LOG_DEBUG("Not enough data to read an SMP message.");
                return false;
            }
            var pos = offset;
            var onebyte = solace.Convert.strToInt8(data.substr(pos, 1));
            pos++;

            var msgUh = bits(onebyte, 7, 1);
            var msgType = bits(onebyte, 0, 7);
            var smpMsg = new solace.smf.SMPMessage();

            if (msgType === 0x00 || msgType === 0x01) {
                var msgLength = solace.Convert.strToUInt32(data.substr(pos, 4));
                pos += 4;
                if ((offset + msgLength) > data.length) {
                    //not enough data
                    SOLACE_LOG_DEBUG("Invalid declared length of " + msgLength + ", unable to read SMP message.");
                    return false;
                }
                var msgFlags = solace.Convert.strToInt8(data.substr(pos, 1));
                pos++;

                smpMsg.MsgType = msgType;
                smpMsg.SmpFlags = msgFlags;
                smpMsg.EncodedUtf8Subscription = data.substr(pos, msgLength - 6); //6 is the base len
                return smpMsg;
            } else {
                SOLACE_LOG_DEBUG("Found unsupported SMP messageType " + msgType);
                return false; //unsupported type
            }
        },
        encSmp: function(smpMsg) {
            if (!(smpMsg.MsgType === 0x00 || smpMsg.MsgType === 0x01)) {
                SOLACE_LOG_DEBUG("Unsupported SMP message for encoding: " + smpMsg);
                return false;
            }
            var data = [];
            var onebyte = 0;
            onebyte = setBits(onebyte, 1, 7, 1);
            onebyte = setBits(onebyte, smpMsg.MsgType, 0, 7);
            data.push(solace.Convert.int8ToStr(onebyte));
            data.push(solace.Convert.int32ToStr(6 + smpMsg.EncodedUtf8Subscription.length)); //length
            data.push(solace.Convert.int8ToStr(smpMsg.SmpFlags));
            data.push(smpMsg.EncodedUtf8Subscription);

            return data.join("");
        }
    };

    // ========== END SMP ==========

    // ========== CLIENT CTRL ==========
    solace.smf.Codec.ClientCtrl = {
        parseCCAt: function(data, offset, payloadLen) {
            var ccMsg = new solace.smf.ClientCtrlMessage();
            if (payloadLen < 6 || offset + 6 > data.length) {
                // not enough data! Return empty.
                // This is required because we can get an empty CC payload as an appliance response
                return ccMsg;
            }
            var pos = offset;
            var twobytes = solace.Convert.strToInt16(data.substr(pos, 2));
            pos += 2;
            var uh = bits(twobytes, 15, 1);
            var version = bits(twobytes, 8, 3);
            var msgType = bits(twobytes, 0, 8);
            var len = solace.Convert.strToUInt32(data.substr(pos, 4));
            pos += 4;

            // Sanity check: we support ClientCtrl v1
            if (version !== 1) {
                return false;
            }
            if (len <= 0 || (offset + len) > data.length) {
                return false;
            }

            ccMsg.MsgType = msgType;
            ccMsg.Version = version;
            while(pos < (offset + len)) {
                var onebyte = solace.Convert.strToInt8(data.substr(pos, 1));
                pos++;
                var prm_uh = bits(onebyte, 7, 1);
                var prm_type = bits(onebyte, 0, 7);
                var prm_len = solace.Convert.strToUInt32(data.substr(pos, 4));
                if (prm_len <= 0) {
                    return false; // SMF parsing fail
                }
                pos += 4;
                var prm_valueLen = prm_len - 5;
                var prm_value = data.substr(pos, prm_valueLen);
                ccMsg.addParameter(new solace.smf.SMFParameter(prm_uh, prm_type, prm_value));
                pos += prm_valueLen;
            }
            return ccMsg;
        },
        encCC: function(ccMsg) {
            var paramspace = [];
            var paramarray = ccMsg.getParameterArray();
            /*
            ClientCtrl Parameter formatting:
                1 byte uh/type
                4 bytes length
                N bytes value
             */
            for( var p=0; p < paramarray.length; p++ ) {
                var cur_p = paramarray[p];
                // It's not a flat array, we have gaps!
                if (typeof cur_p === "undefined") {
                    continue;
                }
                var cur_p_onebyte = 0;
                cur_p_onebyte = setBits(cur_p_onebyte, cur_p.getUh(), 7, 1);
                cur_p_onebyte = setBits(cur_p_onebyte, cur_p.getType(), 0, 7);
                paramspace.push(solace.Convert.int8ToStr(cur_p_onebyte));
                paramspace.push(solace.Convert.int32ToStr(cur_p.getValue().length + 5));
                paramspace.push(cur_p.getValue());
            }
            var paramdata = paramspace.join("");

            var twobytes = 0;
            twobytes = setBits(twobytes, 0, 15, 1); // uh
            twobytes = setBits(twobytes, 0, 11, 4); // RFU
            twobytes = setBits(twobytes, 1, 8, 3); // version
            twobytes = setBits(twobytes, ccMsg.MsgType, 0, 8); // msgtype
            var data = [];
            data.push(solace.Convert.int16ToStr(twobytes)); // first 2B (uh, version, msgtype)
            data.push(solace.Convert.int32ToStr(6 + paramdata.length)); //length: 6B header + params
            data.push(paramdata);
            return data.join("");
        }
    };
    // ========== END CLIENT CTRL ==========

    // ========== TSSMF ==========
    function remains(data, offset) { return data.length - offset; }
    function parseTsSmfHdrAt(data, offset, smfheader) {
        var pos = offset;
        if (remains(data, pos) < 10) {
            SOLACE_LOG_ERROR("TsSmf parse failed: not enough data, expected at least 10B");
            return false;
        }
        var ts_msg = new solace.TransportSmfMessage();
        ts_msg.setSmfHeader(smfheader);
        var twobyte = solace.Convert.strToInt16(data.substr(pos, 2));
        pos +=2;
        ts_msg.UH = bits(twobyte, 15, 1);
        ts_msg.MessageType = bits(twobyte, 8, 7);
        var tsHdrLen = bits(twobyte, 0, 8);
        ts_msg.TsHeaderLength = tsHdrLen;
        ts_msg.SessionId = data.substr(pos, 8);
        pos += 8;

        if (ts_msg.MessageType === 1) {
            // parse extra chunk: routerTag
            var rtrTagLen = solace.Convert.strToInt8(data.substr(pos, 1));
            pos++;
            if (remains(data, pos) < rtrTagLen) {
                SOLACE_LOG_ERROR("TsSmf parse failed: not enough data for RouterTag, expected " + rtrTagLen + "B");
                return false;
            }
            ts_msg.RouterTag = data.substr(pos, rtrTagLen);
            pos += rtrTagLen;
        }

        //FFWD any remaining TsSmf padding?
        pos = offset + tsHdrLen;

        // Length of encapsulated message payload:
        // the SMF msg payload length - bytes consumed in TsSmf

        if (smfheader.m_payloadLength === 0xffffffff) {
            // special "streaming" unknown-length header
            ts_msg.PayloadLength = smfheader.m_payloadLength;
        } else {
            ts_msg.PayloadLength = smfheader.m_payloadLength - tsHdrLen;
        }
        return ts_msg; //Header with no payload field
    }

    solace.smf.Codec.TsSmf = {
        parseTsSmfMsgAt: function(data, offset, smfheader) {
            var ts_msg = parseTsSmfHdrAt(data, offset, smfheader);
            if (! ts_msg) {
                return false;
            }
            // need to FF to pos
            var pos = offset;
            pos += ts_msg.TsHeaderLength;

            // Length of encapsulated message payload:
            // the SMF msg payload length - bytes consumed in TsSmf
            if (remains(data, pos) < ts_msg.PayloadLength) {
                SOLACE_LOG_ERROR("Couldn't read full encapsulated TsSmf payload, expected " + ts_msg.PayloadLength + "B");
                return false;
            }
            ts_msg.Payload = data.substr(pos, ts_msg.PayloadLength); // router tag
            return ts_msg;
        },
        parseTsSmfHdrAt: parseTsSmfHdrAt
    };
    // ========== END TSSMF ==========

    var LUT_userCosForPriority = (function() {
        var arr = [];
        arr[0] = solace.MessageUserCosType.COS1;
        arr[1] = solace.MessageUserCosType.COS2;
        arr[2] = solace.MessageUserCosType.COS3;
        return arr;
    }());

    function getUserCos(priority_value) {
        return LUT_userCosForPriority[priority_value] || solace.MessageUserCosType.COS1;
    }

    var LUT_priorityForUserCos = (function() {
        var arr = [];
        arr[solace.MessageUserCosType.COS1] = 0;
        arr[solace.MessageUserCosType.COS2] = 1;
        arr[solace.MessageUserCosType.COS3] = 2;
        return arr;
    }());

    function getSmfPriorityFromUserCos(userCos) {
        return LUT_priorityForUserCos[userCos] || 0;
    }

    function adaptBinaryMetaToMessage(binmeta, message) {
        var messageSdt = solace.sdt.Codec.parseSdt(binmeta.Payload, 0);
        if (messageSdt && messageSdt.getType() === solace.SDTFieldType.STREAM) {
            var sdtstream = messageSdt.getValue();
            var sdtfield = sdtstream.getNext();
            if (sdtfield && sdtfield.getType() === solace.SDTFieldType.BYTEARRAY) {
                // Preamble byte array is present
                var preambleByte0 = sdtfield.getValue().charCodeAt(0) & 0xFF;
                if ((preambleByte0 & 0x80) === 0) {
                    // structured message: override default "BIN" message type
                    var structypes = {
                        0x0A: solace.MessageType.MAP,
                        0x0B: solace.MessageType.STREAM,
                        0x07: solace.MessageType.TEXT};
                    message.m_messageType = structypes[preambleByte0 & 0x0F] || solace.MessageType.BINARY;
                }
                if (sdtfield.getValue().length >= 1) {
                    var preambleByte1 = sdtfield.getValue().charCodeAt(1) & 0xFF;
                    message.setAsReplyMessage((preambleByte1 & 0x80) !== 0);
                }
            }
            sdtfield = sdtstream.getNext();
            if (sdtfield && sdtfield.getType() === solace.SDTFieldType.MAP) {
                var sdtmap = sdtfield.getValue();
                if (sdtmap.getField("p")) {
                    var userpropmap = sdtmap.getField("p").getValue();
                    message.setUserPropertyMap(userpropmap);
                }
                if (sdtmap.getField("h")) {
                    var headermap = sdtmap.getField("h").getValue();
                    if (headermap.getField("ci")) {
                        message.setCorrelationId(headermap.getField("ci").getValue());
                    }
                    if (headermap.getField("mi")) {
                        message.setApplicationMessageId(headermap.getField("mi").getValue());
                    }
                    if (headermap.getField("mt")) {
                        message.setApplicationMessageType(headermap.getField("mt").getValue());
                    }
                    if (headermap.getField("rt")) {
                        message.setReplyTo(headermap.getField("rt").getValue());
                    }
                    if (headermap.getField("si")) {
                        message.setSenderId(headermap.getField("si").getValue());
                    }
                    if (headermap.getField("sn")) {
                        message.setSequenceNumber(headermap.getField("sn").getValue());
                    }
                    if (headermap.getField("ts")) {
                        message.setSenderTimestamp(headermap.getField("ts").getValue());
                    }
                }
            }
        }
    }

    function adaptMessageToBinaryMeta(message) {
        // solace header map
        var headermap = new solace.SDTMapContainer();
        function addToMapIfPresent(key, type, value_fn) {
            // if the getter function value_fn returns something add it to hmap
            var value = value_fn();
            if (typeof value !== "undefined" && value !== null) {
                headermap.addField(key, solace.SDTField.create(type, value));
            }
        }
        addToMapIfPresent("ci", solace.SDTFieldType.STRING, function() { return message.getCorrelationId(); });
        addToMapIfPresent("mi", solace.SDTFieldType.STRING, function() { return message.getApplicationMessageId(); });
        addToMapIfPresent("mt", solace.SDTFieldType.STRING, function() { return message.getApplicationMessageType(); });
        addToMapIfPresent("rt", solace.SDTFieldType.DESTINATION, function() { return message.getReplyTo(); });
        addToMapIfPresent("si", solace.SDTFieldType.STRING, function() { return message.getSenderId(); });
        addToMapIfPresent("sn", solace.SDTFieldType.INT64, function() { return message.getSequenceNumber(); });
        addToMapIfPresent("ts", solace.SDTFieldType.INT64, function() { return message.getSenderTimestamp(); });

        // container map: solace headers + user prop map
        var sdtMap = new solace.SDTMapContainer();
        if (message.getUserPropertyMap()) {
            sdtMap.addField("p", solace.SDTField.create(solace.SDTFieldType.MAP,  message.getUserPropertyMap()));
        }
        if (headermap.getKeys().length > 0) {
            sdtMap.addField("h", solace.SDTField.create(solace.SDTFieldType.MAP,  headermap));
        }

        var enc_sdtpayload = null;
        var preamble_b0 = 0;
        switch(message.getType()) {
            case solace.MessageType.BINARY:
                preamble_b0 |= 0x80;
                break;
            case solace.MessageType.MAP:
                preamble_b0 |= 0x0A;
                enc_sdtpayload = solace.sdt.Codec.encodeSdt(message.m_structuredContainer);
                if (enc_sdtpayload) {
                    message.setBinaryAttachment(enc_sdtpayload);
                }
                break;
            case solace.MessageType.STREAM:
                preamble_b0 |= 0x0B;
                enc_sdtpayload = solace.sdt.Codec.encodeSdt(message.m_structuredContainer);
                if (enc_sdtpayload) {
                    message.setBinaryAttachment(enc_sdtpayload);
                }
                break;
            case solace.MessageType.TEXT:
                preamble_b0 |= 0x07;
                enc_sdtpayload = solace.sdt.Codec.encodeSdt(message.m_structuredContainer);
                if (enc_sdtpayload) {
                    message.setBinaryAttachment(enc_sdtpayload);
                }
                break;
        }
        var preamble_b1 = 0;
        if (message.isReplyMessage()) {
            preamble_b1 |= 0x80;
        }
        var sdtPreamble = solace.SDTField.create(solace.SDTFieldType.BYTEARRAY, String.fromCharCode(preamble_b0, preamble_b1));

        // Putting it all together: a stream with the preamble and map
        var sdtStreamContainer = new solace.SDTStreamContainer();
        sdtStreamContainer.addField(sdtPreamble);
        sdtStreamContainer.addField(solace.SDTField.create(solace.SDTFieldType.MAP, sdtMap));

        var binmeta = new solace.smf.BinaryMetaBlock();
        binmeta.Type = 0;
        binmeta.Payload = solace.sdt.Codec.encodeSdt(solace.SDTField.create(solace.SDTFieldType.STREAM, sdtStreamContainer));
        message.setBinaryMetadataChunk(binmeta);
    }

    function adaptSmfToMessage(smfHeader, message, stream, offset) {
        message.setDeliverToOne(smfHeader.m_smf_dto ? true : false);
        message.setDeliveryMode(smfHeader.m_pm_deliverymode || solace.MessageDeliveryModeType.DIRECT);
        message.setDestination(new solace.Topic(smfHeader.m_pm_tr_topicname_bytes));
        message.setDiscardIndication(smfHeader.m_smf_di ? true : false);
        message.setElidingEligible(smfHeader.m_smf_elidingeligible ? true : false);
        message.setUserCos(getUserCos(smfHeader.m_smf_priority));
        message.setUserData(smfHeader.m_pm_userdata ? smfHeader.m_pm_userdata : null);
        message.m_redelivered = smfHeader.m_pm_ad_redelflag ? true : false;

        // Copy content into fields (from input bytes)
        var payload_offset = offset + smfHeader.m_headerLength;
        var cs = smfHeader.m_pm_content_summary;
        var CSType = solace.smf.Codec.ParamParse.ContentSummaryType;
        if (cs && cs.length > 0) {
            for(var i = 0; i < cs.length; i++) {
                var cur_chunk = cs[i];
                var chunk_data = stream.substr(payload_offset + cur_chunk.Position, cur_chunk.Length);
                if (cur_chunk.Type === CSType.BINARY_ATTACHMENT) {
                    message.setBinaryAttachment(chunk_data);
                } else if (cur_chunk.Type === CSType.BINARY_METADATA) {
                    var binmeta = solace.smf.BinaryMetaBlock.fromEncodedSmf(chunk_data, 0);
                    message.setBinaryMetadataChunk(binmeta);
                    if (binmeta.Type === 0) {
                        // we have SDT JMS metadata
                        adaptBinaryMetaToMessage(binmeta, message);
                    }
                } else if (cur_chunk.Type === CSType.CID_LIST) {
                    // Ignore! No support for CID
                } else if (cur_chunk.Type === CSType.XML_META) {
                    message.setXmlMetadata(chunk_data);
                } else if (cur_chunk.Type === CSType.XML_PAYLOAD) {
                    message.setXmlContent(chunk_data);
                }
            }
        } else {
            // No content-summary, assume binary attachment
            message.setBinaryAttachment(smfHeader.m_payloadLength > 0 ? stream.substr(payload_offset, smfHeader.m_payloadLength) : null);
        }
    }

    function addContentElementToCsArray(cs_array, payload_arr, data_chunk, cstype) {
        if (typeof data_chunk !== "undefined" &&
                data_chunk !== null &&
                data_chunk.length > 0) {
            var cse = new solace.smf.Codec.ParamParse.ContentSummaryElement();
            cse.Type = cstype;
            cse.Length = data_chunk.length;
            cs_array.push(cse);
            payload_arr.push(data_chunk);
        }
    }

    function adaptMessageToSmf(message, smfHeader) {
        smfHeader.m_smf_dto = message.isDeliverToOne() ? true : false;
        smfHeader.m_pm_deliverymode = message.getDeliveryMode();
        smfHeader.m_smf_di = message.isDiscardIndication() ? true : false;
        smfHeader.m_smf_elidingeligible = message.isElidingEligible() ? true : false;

        var dest = message.getDestination();
        if (dest !== null && dest instanceof solace.Topic) {
            smfHeader.m_pm_tr_topicname_bytes = dest.getName();
        }

        // Setup user properties, header properties, msgtype
        if (message.getCorrelationId() ||
                message.getApplicationMessageId() ||
                message.getApplicationMessageType() ||
                message.getReplyTo() ||
                message.getSenderId() ||
                message.getSequenceNumber() ||
                message.getSenderTimestamp() ||
                message.getUserPropertyMap() ||
                message.isReplyMessage() ||
                (message.getType() !== solace.MessageType.BINARY)) {
            // add SDT binary metadata
            adaptMessageToBinaryMeta(message);
        }
        
        smfHeader.m_smf_priority = getSmfPriorityFromUserCos(message.getUserCos());
        smfHeader.m_pm_userdata = message.getUserData() === null ? null : message.getUserData();

        // Build array of ContentSummaryElements
        var CSType = solace.smf.Codec.ParamParse.ContentSummaryType;
        var cs_array = [];
        var payload = [];
        addContentElementToCsArray(cs_array, payload, message.getXmlMetadata(), CSType.XML_META);
        addContentElementToCsArray(cs_array, payload, message.getXmlContent(), CSType.XML_PAYLOAD);
        addContentElementToCsArray(cs_array, payload, message.getBinaryAttachment(), CSType.BINARY_ATTACHMENT);
        var binmeta = null;
        if ((binmeta = message.getBinaryMetadataChunk()) !== null) {
            var binmeta_smf = binmeta.asEncodedSmf();
            addContentElementToCsArray(cs_array, payload, binmeta_smf, CSType.BINARY_METADATA);
        }
        if (cs_array.length === 0 || (cs_array.length === 1 && cs_array[0].Type === CSType.BINARY_ATTACHMENT)) {
            // NULL or RAW payload (no content-summary)
        } else {
            smfHeader.m_pm_content_summary = cs_array;
        }
        var payload_bytes = payload.join("");
        smfHeader.m_payload = payload_bytes;
        smfHeader.setPayloadSize(payload_bytes.length);
    }

    solace.smf.Codec.decodeCompoundMessage = function(data, pos) {
        var smfheader = solace.smf.Codec.parseSmfAt(data, pos);
        if (! smfheader) {
            return null;
        }
        
        // the parser determined there was a full SMF message
        var payload_position = pos + smfheader.m_headerLength;
        var payload_len = smfheader.m_payloadLength;
        switch (smfheader.m_smf_protocol) {
            case 0x14:
                var tsmsg = solace.smf.Codec.TsSmf.parseTsSmfMsgAt(data, payload_position, smfheader);
                if (tsmsg) {
                    tsmsg.setSmfHeader(smfheader);
                    return tsmsg;
                }
                break;
            case 0x0d:
                var pubmsg = new solace.Message();
                pubmsg.m_smfHeader = smfheader;
                adaptSmfToMessage(smfheader, pubmsg, data, pos);
                SOLACE_LOG_DEBUG("Decoded SMF message");
                return pubmsg;
            case 0x0c:
                var cc = solace.smf.Codec.ClientCtrl.parseCCAt(data, payload_position, payload_len);
                if (cc) {
                    cc.setSmfHeader(smfheader);
                    return cc;
                }
                break;
            case 0x0f:
                var smp = solace.smf.Codec.Smp.parseSmpAt(data, payload_position);
                if (smp) {
                    smp.setSmfHeader(smfheader);
                    return smp;
                }
                break;
            case 0x0a:
            case 0x0b:
                var keepalive = new solace.smf.KeepAliveMessage();
                keepalive.setSmfHeader(smfheader);
                SOLACE_LOG_INFO("Decoded keep alive response");
                return keepalive;
            default:
                SOLACE_LOG_ERROR("Unknown protocol: 0x" + solace.Util.formatHexString(smfheader.m_smf_protocol) + ", dump message content: \n" +
                        solace.StringUtil.formatDumpBytes(data.substring(pos, smfheader.m_messageLength), true, 0));
                break;
        }
        return null;
    };
    
    solace.smf.Codec.encodeCompoundMessage = function(msg){
        var payload = [], header = [];
        if (msg instanceof solace.smf.ClientCtrlMessage) {
            payload = solace.smf.Codec.ClientCtrl.encCC(msg);
            msg.getSmfHeader().setPayloadSize(payload.length);
            header = solace.smf.Codec.encSmf(msg.getSmfHeader());
        } else if (msg instanceof solace.smf.SMPMessage) {
            payload = solace.smf.Codec.Smp.encSmp(msg);
            msg.getSmfHeader().setPayloadSize(payload.length);
            header = solace.smf.Codec.encSmf(msg.getSmfHeader());
        } else if (msg instanceof solace.smf.KeepAliveMessage) {
            msg.getSmfHeader().setPayloadSize(0);
            header = solace.smf.Codec.encSmf(msg.getSmfHeader());
        } else if (msg instanceof solace.Message) {
            if (msg.m_smfHeader === null) {
                var newheader = new solace.smf.SMFHeader();
                newheader.m_smf_protocol = 0x0d;
                newheader.m_smf_ttl = 255;
                msg.m_smfHeader = newheader;
            }
            adaptMessageToSmf(msg, msg.m_smfHeader);
            payload = msg.m_smfHeader.m_payload;
            header = solace.smf.Codec.encSmf(msg.m_smfHeader);
        }
        return header + payload;
    };

}(solace));
//
/*global solace:true,window,global,escape,unescape,WebSocket,ArrayBuffer,Uint8Array,WebSocket,QUnit,SOLACE_LOG_FATAL,SOLACE_LOG_ERROR,SOLACE_LOG_WARN,SOLACE_LOG_INFO,SOLACE_LOG_DEBUG,SOLACE_LOG_TRACE */
// 
// 

(function(solace) {
    solace.smf = solace.smf || {};

    // import bit twiddling functions
    var bits = solace.smf.Codec.bits;
    var setBits = solace.smf.Codec.setBits;

    /**
     * Base class for headers containing parameters
     * @constructor
     */
    function BaseMessage() {
        this.m_parameters = [];
        this.m_smfHeader = null;
    }
    BaseMessage.prototype.addParameter = function(param){
        this.m_parameters[param.getType()] = param;
    };
    BaseMessage.prototype.getParameter = function(paramType){
        return this.m_parameters[paramType];
    };
    BaseMessage.prototype.getParameterArray = function(){
        if (typeof this.m_parameters === "undefined") {
            return false;
        }
        return this.m_parameters;
    };
    BaseMessage.prototype.getSmfHeader = function() {
        return this.m_smfHeader;
    };
    BaseMessage.prototype.setSmfHeader = function(smfh) {
        this.m_smfHeader = smfh;
    };

    BaseMessage.prototype.getResponse = function() {
        var smf = this.getSmfHeader();
        if (smf && smf.m_pm_respcode && smf.m_pm_respstr) {
            return {ResponseCode: smf.m_pm_respcode, ResponseString: smf.m_pm_respstr};
        } else {
            return null;
        }
    };

    /**
     * Control messages wrap an SMFHeader instance
     * @constructor
     */
    function SMFHeader(){
        // header properties
        // header block
        // SMF parameters
        // payload
        this.m_parameters = []; //override parent

        // Common SMF header field values
        this.m_smf_version = 3;
        this.m_smf_uh = 0;
        this.m_smf_protocol = 0;
        this.m_smf_priority = 0;
        this.m_smf_ttl = 0;
        this.m_smf_msgLen = 0;
        this.m_smf_di = 0;
        this.m_smf_tqd = 0;
        this.m_smf_elidingeligible = 0;
        this.m_smf_dto = 0;
        this.m_smf_adf = 0; //AD (unused)
        // Common SMF protocol parameters
        this.m_pm_userdata = null;
        this.m_pm_respcode = 0;
        this.m_pm_respstr = null;
        this.m_pm_username = null;
        this.m_pm_password = null;
        this.m_pm_tr_topicname_bytes = null;
        this.m_pm_deliverymode = null;
        this.m_pm_ad_msgid = 0; //AD (unused)
        this.m_pm_ad_redelflag = 0; //AD (unused)
        this.m_pm_ad_flowredelflag = 0; //AD (unused)
        this.m_pm_ad_ttl = 0; //AD (unused)
        this.m_pm_content_summary = null;
        this.m_pm_corrtag = null;
        this.m_pm_topic_offset = 0;
        this.m_pm_topic_len = 0;
        this.m_pm_queue_offset = 0;
        this.m_pm_queue_len = 0;
        this.m_pm_ad_prevmsgid = 0; //AD (unused)
        this.m_pm_msg_priority = null; // A number, but 0 is allowed
        this.m_pm_ad_flowid = 0; //AD (unused)

        // housekeeping
        this.m_unknownProtoFlag = false;
        this.m_messageLength = 0;
        this.m_payloadLength = 0;
        this.m_headerLength = 0;
        this.m_payload = null;

    }
    //SMFHeader.prototype = new BaseMessage();
    SMFHeader.prototype.setMessageSizes = function(header_sz, payload_sz) {
        this.m_headerLength = header_sz;
        this.m_payloadLength = payload_sz;
        this.m_messageLength = header_sz + payload_sz;
    };
    SMFHeader.prototype.setPayloadSize = function(payload_sz) {
        this.m_payloadLength = payload_sz;
    };
    solace.smf.SMFHeader = SMFHeader;

    /**
     * @constructor
     */
    function SMFParameter(uh, type, value){
        this.m_type = type;
        this.m_value = value;
        this.m_uh = uh;
    }
    SMFParameter.prototype.getType = function(){
        return this.m_type;
    };
    SMFParameter.prototype.getValue = function(){
        return this.m_value;
    };
    SMFParameter.prototype.getUh = function(){
        return this.m_uh;
    };
    solace.smf.SMFParameter = SMFParameter;

    // Internal API use only.
    /**
     Represents a binary metadata block in a TrMsg
     @constructor
     */
    function BinaryMetaBlock() {
        this.Type = 0;
        this.Payload = "";
    }

    BinaryMetaBlock.prototype.asEncodedSmf = function() {
        var smf = [];
        smf.push(solace.Convert.int8ToStr(1));
        smf.push(solace.Convert.int8ToStr(this.Type));
        smf.push(solace.Convert.int24ToStr(this.Payload.length));
        smf.push(this.Payload);
        return smf.join("");
    };
    BinaryMetaBlock.fromEncodedSmf = function(strSmf, offset) {
        if (typeof offset === "undefined") {
            offset = 0;
        }
        if ((strSmf.length - offset) < 6) {
            return null; // not enough data
        }
        var chunkCount = solace.Convert.strToInt8(strSmf.substr(offset, 1));
        var fourbyte = solace.Convert.strToInt32(strSmf.substr(offset + 1, 4));
        var metaBlock = new BinaryMetaBlock();
        metaBlock.Type = bits(fourbyte, 24, 8);
        var payloadLen = bits(fourbyte, 0, 24);
        var payloadOffset = chunkCount * 4 + 1;
        metaBlock.Payload = strSmf.substr(offset + payloadOffset, payloadLen);
        return metaBlock;
    };
    solace.smf.BinaryMetaBlock = BinaryMetaBlock;

    /**
     * Represents an SMP request or reply message
     * @constructor
     */
    function SMPMessage(){
        this.m_smfHeader = new solace.smf.SMFHeader(); //override prototype's
        this.m_smfHeader.m_smf_protocol = 0x0f;
        this.m_smfHeader.m_smf_ttl = 1;

        // Field: msgtype
        this.MsgType = 0;

        // Field: subscription string
        this.EncodedUtf8Subscription = null;

        this.SmpFlags = (0 | 4); //default flags
        this.m_encodedQueueName = null; //unused in solclientjs
        this.m_encodedClientName = null; //unused in solclientjs
    }
    SMPMessage.prototype = new BaseMessage();
    SMPMessage.prototype.isFlag = function(flagMask){
        return (this.SmpFlags & flagMask);
    };
    SMPMessage.prototype.setFlag = function(flagMask, value){
        if (value) {
            this.SmpFlags |= flagMask;
        }
        else {
            this.SmpFlags &= (~ flagMask);
        }
    };
    SMPMessage.prototype.encodeTopic = function encodeTopic(topic) {
        this.EncodedUtf8Subscription = solace.Util.nullTerminate(topic);
    };

    /*
     Get an SMP add/remove topic subscription object.

     smfclient: the transport SMFClient object that tracks correlation tags
     topicObj: a string or solace.Destination representing the topic
     add: boolean - add or remove
     requestConfirm: boolean - whether to set the response required flag
     */
    SMPMessage.getSubscriptionMessage = function(correlationTag, topicObj, add, requestConfirm) {
        var topicString = "";
        if (typeof topicObj === "string") {
            topicString = topicObj;
        } else if (topicObj instanceof solace.Destination) {
            topicString = topicObj.getName();
        }
        var smp = new SMPMessage();
        smp.MsgType = add ? 0x00 : 0x01;
        smp.encodeTopic(topicString);
        smp.setFlag(4, true);
        if (requestConfirm) {
            smp.setFlag(8, true);
        }

        // Always put a correlation tag
        smp.m_smfHeader.m_pm_corrtag = correlationTag;
        return smp;
    };
    solace.smf.SMPMessage = SMPMessage;

    var ZERO = solace.Convert.int8ToStr(0);

    /**
     * Represents a ClientCtrl request or reply message
     * @constructor
     */
    function ClientCtrlMessage(){
        this.m_smfHeader = new solace.smf.SMFHeader(); //override prototype's
        this.m_smfHeader.m_smf_protocol = 0x0c;
        this.m_smfHeader.m_smf_ttl = 1;

        this.m_parameters = []; // override parent

        // Field: msgtype
        this.MsgType = 0;

        // Field: version
        this.Version = 1;
    }
    var CCM_proto = new BaseMessage();
    ClientCtrlMessage.prototype = CCM_proto;
    CCM_proto.getP2PTopicValue = function() {
        var p2pParam = null;
        if ((p2pParam = this.getParameter(0x08))) {
            return solace.Util.stripNullTerminate(p2pParam.getValue());
        }
        else {
            return null;
        }
    };

    CCM_proto.getVpnNameInUseValue = function() {
        var vpnParam = null;
        if ((vpnParam = this.getParameter(0x06))) {
            return solace.Util.stripNullTerminate(vpnParam.getValue());
        }
        else {
            return null;
        }
    };

    CCM_proto.getVridInUseValue = function() {
        var vridParam = null;
        if ((vridParam = this.getParameter(0x0a))) {
            return solace.Util.stripNullTerminate(vridParam.getValue());
        }
        else {
            return null;
        }
    };

    CCM_proto.getUserIdValue = function() {
        var userIdParam = null;
        if ((userIdParam = this.getParameter(0x03))) {
            return solace.Util.stripNullTerminate(userIdParam.getValue());
        }
        else {
            return null;
        }
    };

    CCM_proto.prmGetDtoPriorityValue = function(dto) {
        if (typeof dto.local === "undefined" || typeof dto.network === "undefined") {
            return false;
        }
        var twobyte = 0;
        twobyte = solace.smf.Codec.setBits(twobyte, dto.local, 8, 8);
        twobyte = solace.smf.Codec.setBits(twobyte, dto.network, 0, 8);
        return solace.Convert.int16ToStr(twobyte);
    };

    CCM_proto.prmParseDtoPriorityValue = function(strDtoPriority) {
        var dto = {};
        var twobyte = solace.Convert.strToInt16(strDtoPriority.substr(0, 2));
        dto.local = solace.smf.Codec.bits(twobyte, 8, 8);
        dto.network = solace.smf.Codec.bits(twobyte, 0, 8);
        return dto;
    };

    /*
    strCapabilities: parameter value
    caps: an already existing hash array of CapabilityType
     */
    CCM_proto.prmParseCapabilitiesValue = function(strCapabilities, caps) {
        if (! (strCapabilities && caps)) {
            return false;
        }
        var CT = solace.CapabilityType;
        var pos = 0;

        // parse boolean capabilities
        var bool_cap_count = solace.Convert.strToInt8(strCapabilities.substr(pos, 1));
        pos++;
        var onebyte = 0;
        if (bool_cap_count >= 1) {
            onebyte = solace.Convert.strToInt8(strCapabilities.substr(pos, 1));
            pos++;
            // no solclientjs capabilities yet
        }
        if (bool_cap_count >= 9) {
            onebyte = solace.Convert.strToInt8(strCapabilities.substr(pos, 1));
            pos++;
            caps[CT.MESSAGE_ELIDING] = bits(onebyte, 3, 1) ? true : false;
            caps[CT.NO_LOCAL] = bits(onebyte, 1, 1) ? true : false;
        }
        if (bool_cap_count > 16) {
            // We don't know about these capabilities yet
            pos += Math.ceil((bool_cap_count-16)/8); //advance and skip
        }

        // parse non-boolean capabilities
        var sanity_loop = 500;
        while(pos < strCapabilities.length && sanity_loop-- > 0) {
            onebyte = solace.Convert.strToInt8(strCapabilities.substr(pos, 1)); //type
            pos++;
            var capLen = solace.Convert.strToInt32(strCapabilities.substr(pos, 4)); 
            pos += 4;
            capLen -= 5;
            var strValue = strCapabilities.substr(pos, capLen);
            pos += capLen;
            switch (onebyte) {
                case 0x00:
                    caps[CT.PEER_PORT_SPEED] = (strValue.length === 4) ? solace.Convert.strToInt32(strValue) : 0;
                    break;
                case 0x01:
                    caps[CT.PEER_PORT_TYPE] = (strValue.length === 1) ? solace.Convert.strToInt8(strValue) : 0;
                    break;
                case 0x02:
                    // NOOP (max guaranteed message size)
                    break;
                case 0x03:
                    caps[CT.MAX_DIRECT_MSG_SIZE] = (strValue.length === 4) ? solace.Convert.strToInt32(strValue) : 0;
                    break;
            }
        }
        return caps;
    };

    CCM_proto.getRouterCapabilities = function() {
        var caps = [];
        var cap_param = null;
        // Parse the composite capabilities parameter
        if ((cap_param = this.getParameter(0x09))) {
            caps = this.prmParseCapabilitiesValue(cap_param.getValue(), caps);
        }

        // Parse out the appliance status strings
        if ((cap_param = this.getParameter(0x00))) {
            caps[solace.CapabilityType.PEER_SOFTWARE_VERSION] = solace.Util.stripNullTerminate(cap_param.getValue());
        }
        if ((cap_param = this.getParameter(0x01))) {
            caps[solace.CapabilityType.PEER_SOFTWARE_DATE] = solace.Util.stripNullTerminate(cap_param.getValue());
        }
        if ((cap_param = this.getParameter(0x02))) {
            caps[solace.CapabilityType.PEER_PLATFORM] = solace.Util.stripNullTerminate(cap_param.getValue());
        }
        if ((cap_param = this.getParameter(0x0c))) {
            caps[solace.CapabilityType.PEER_ROUTER_NAME] = solace.Util.stripNullTerminate(cap_param.getValue());
        }
        return caps;
    };

    // static method (put it on the function def)
    ClientCtrlMessage.getLogin = function(sprop, correlationTag) {
        var cc = new solace.smf.ClientCtrlMessage();
        if (!(sprop instanceof solace.SessionProperties)) {
            return false;
        }
        cc.MsgType = 0x00;
        var smfHeader = cc.m_smfHeader;
        smfHeader.m_pm_corrtag = correlationTag;
        if (sprop.password) {
            smfHeader.m_pm_password = sprop.password;
        }
        if (sprop.userName) {
            smfHeader.m_pm_username = sprop.userName;
        }
        if (sprop.subscriberLocalPriority && sprop.subscriberNetworkPriority) {
            cc.addParameter(new SMFParameter(
                    0,
                    0x07,
                    this.prototype.prmGetDtoPriorityValue({local: sprop.subscriberLocalPriority, network: sprop.subscriberNetworkPriority})));
        }
        if (sprop.vpnName && sprop.vpnName.length > 0) {
            cc.addParameter(new SMFParameter(
                    1,
                    0x06,
                    solace.Util.nullTerminate(sprop.vpnName)));
        }

        if (sprop.applicationDescription && sprop.applicationDescription.length > 0) {
            cc.addParameter(new SMFParameter(
                0,
                0x04,
                solace.Util.nullTerminate(sprop.applicationDescription)));
        } 

        if (sprop.userIdentification && sprop.userIdentification.length > 0) {
            cc.addParameter(new SMFParameter(
                0,
                0x03,
                solace.Util.nullTerminate(sprop.userIdentification)));
        }
        
        cc.addParameter(new SMFParameter(
                0,
                0x05,
                solace.Util.nullTerminate(sprop.clientName)));
        cc.addParameter(new SMFParameter(
                0,
                0x02,
                solace.Util.nullTerminate(navigator.platform + " - JS API (Debug)")));

        if (sprop.noLocal) {
            cc.addParameter(new SMFParameter(
                    0,
                    0x0f,
                    solace.Convert.int8ToStr(1)));
        }

        var bdate = "20150120-2201";
        var formattedDate = bdate;
        var index = bdate.indexOf("-");
        if (index >= 0) {
            var dstamp = bdate.substring(0, index);
            var tstamp = bdate.substring(index+1);
            if (dstamp.length === 8 && tstamp.length === 4) {
                var sb = new solace.StringBuffer();
                sb.append(dstamp.charAt(0)).append(dstamp.charAt(1));
                sb.append(dstamp.charAt(2)).append(dstamp.charAt(3));
                sb.append("/");
                sb.append(dstamp.charAt(4)).append(dstamp.charAt(5));
                sb.append("/");
                sb.append(dstamp.charAt(6)).append(dstamp.charAt(7));
                sb.append(" ");
                sb.append(tstamp.charAt(0)).append(tstamp.charAt(1));
                sb.append(":");
                sb.append(tstamp.charAt(2)).append(tstamp.charAt(3));
                formattedDate = sb.toString();
            }
        }
        cc.addParameter(new SMFParameter(0, 0x01, solace.Util.nullTerminate(formattedDate)));
        cc.addParameter(new SMFParameter(0, 0x00, solace.Util.nullTerminate("7.1.0.17")));
        return cc;
    };

    /**
     * Get a CC update message.
     *
     * @param {solace.MutableSessionProperty} mutableSessionProperty
     * @param {String} newValue
     */
    ClientCtrlMessage.getUpdate = function getUpdate(mutableSessionProperty, newValue, correlationTag) {
        var cc = new ClientCtrlMessage();
        cc.MsgType = 0x01;
        var smfHeader = cc.m_smfHeader;
        smfHeader.m_pm_corrtag = correlationTag;
        if (mutableSessionProperty === solace.MutableSessionProperty.CLIENT_DESCRIPTION) {
            var appdesc = (newValue + "").substr(0, 250);
            cc.addParameter(new SMFParameter(
                    0,
                    0x04,
                    solace.Util.nullTerminate(appdesc)));
        } else if (mutableSessionProperty === solace.MutableSessionProperty.CLIENT_NAME) {
            var result = ClientCtrlMessage.validateClientName(newValue);
            if (result) {
                throw new solace.OperationError(result, solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE);
            }
            cc.addParameter(new SMFParameter(
                    0,
                    0x05,
                    solace.Util.nullTerminate(newValue)));
        }
        return cc;
    };

    ClientCtrlMessage.validateClientName = function(strName) {
        var result = solace.TopicUtil.validateTopic(strName);
        if (result) {
            return result;
        }
        result = strName.length <= 160 ? null : "Client Name too long (max length: 160).";
        if (result) {
            return result;
        }
        return null;
    };
    solace.smf.ClientCtrlMessage = ClientCtrlMessage;

    /**
     * KeepAlive message object.
     * @constructor
     */
    function KeepAliveMessage() {
        var smfh = new solace.smf.SMFHeader();
        smfh.m_smf_protocol = 0x0b;
        smfh.m_smf_uh = 2;
        smfh.m_smf_ttl = 1;
        this.m_smfHeader = smfh; // override prototype's
    }
    KeepAliveMessage.prototype = new BaseMessage();
    solace.smf.KeepAliveMessage = KeepAliveMessage;

    /**
     * Transport SMF Message
     * @constructor
     */
    function TransportSmfMessage() {
        this.UH = 0;
        this.MessageType = null;
        this.SessionId = null;
        this.RouterTag = null;
        this.Payload = null;
        this.PayloadLength = 0;
        this.TsHeaderLength = 0;

        // override parent
        this.m_smfHeader = null;
        this.m_parameters = null;
    }
    TransportSmfMessage.prototype = new BaseMessage();
    solace.TransportSmfMessage = TransportSmfMessage;
}(solace));
//
/*global solace:true,window,global,escape,unescape,WebSocket,ArrayBuffer,Uint8Array,WebSocket,QUnit,SOLACE_LOG_FATAL,SOLACE_LOG_ERROR,SOLACE_LOG_WARN,SOLACE_LOG_INFO,SOLACE_LOG_DEBUG,SOLACE_LOG_TRACE */
// 
// 

(function(solace) {



    /**
     * @class
     * CacheCBInfo
     * Encapsulates a {@link solace.CacheSession}'s request listener callback function and optional application-specified
     * context object.
     * <p>
     * Instances of this class are required as a parameter to  {@link solace.CacheSession.sendCacheRequest} when
     * creating a CacheSession request.
     * </p>
     *
     * @param {function(Number, solace.CacheRequestResult, Object)} cacheCBFunction Callback function
     * invoked by the API when a cache response is received.  The prototype of the function is the following:
     * (Number, {@link solace.CacheRequestResult}, Object)
     *
     * @param {object} userObject An optional application-specified context object to be returned to the listener with the
     * result.

     * @constructor
     */
    solace.CacheCBInfo = function CacheCBInfo(cacheCBFunction, userObject) {
        /**
         * The function that will be called by the cache session when a request
         * completes.
         */
        this.cacheCBFunction = cacheCBFunction;

        /**
         * The context user object that will be supplied to the callback function
         * when the cache request completes.
         */
        this.userObject = userObject;
    };

    /**
     * @private
     */
    solace.CacheCBInfo.prototype.getCallback = function() {
        return this.cacheCBFunction;
    };

    /**
     * @private
     */
    solace.CacheCBInfo.prototype.getUserObject = function() {
        return this.userObject;
    };

    /**
     * @namespace solace.CacheLiveDataAction
     * Enumeration of CacheLiveDataAction values, specifying how the CacheSession should handle
     * live data associated with a cache request in progress.
     */
    solace.CacheLiveDataAction = {

        /**
         * @constant
         * @description End the cache request when live data arrives that matches the topic.
         * Note that wildcard cache requests must always be {@link solace.CacheLiveDataAction.FLOW_THRU}.
         */
        FULFILL: 1,

        /**
         * @constant
         * @description Queue arriving live data that matches the topic, until the cache request completes.
         * Note that wildcard cache requests must always be {@link solace.CacheLiveDataAction.FLOW_THRU}.
         */
        QUEUE: 2,

        /**
         * @constant
         * @description Continue the outstanding cache request while allowing live data to flow through to
         * the application.
         * Note that wildcard cache requests must always be {@link solace.CacheLiveDataAction.FLOW_THRU}.
         */
        FLOW_THRU: 3
    };

    /**
     * @private
     * @class CacheGetResult encapsulates the result of a cache get request
     * @name CacheGetResult
     * @constructor
     */
    solace.CacheGetResult = function CacheGetResult() {
        this.messageID = null;
        this.version = 0;
        this.responseCode = solace.CacheGetResultCode.INVALID;
        this.responseString = "";
        this.matchTopic = "";
        this.sessionID = null;
        this.isSuspect = null;
        this.hasMore = null;
        this.hasTimestamps = null;
        this.replyTo = null;

        this.messageStream = null;
        this.clusterNameStream = null;
    };

    /**
     * @private
     */
    solace.CacheGetResult.prototype.readFromStream = function(stream) {
        this.messageID = stream.getNext().getValue();
        this.version = stream.getNext().getValue();
        this.responseCode = stream.getNext().getValue();
        this.responseString = stream.getNext().getValue();
        // this.instanceName = stream.getNext().getValue(); // not present, despite SD
        this.matchTopic = stream.getNext().getValue();
        this.sessionID = stream.getNext().getValue();
        this.isSuspect = stream.getNext().getValue();
        this.hasMore = stream.getNext().getValue();
        this.hasTimestamps = stream.getNext().getValue();

        if (stream.hasNext()) { // first stream
            this.messageStream = stream.getNext().getValue();
        }
        if (stream.hasNext()) { // if two streams, first was cluster name stream
            this.clusterNameStream = this.messageStream;
            this.messageStream = stream.getNext().getValue();
        }
    };

    /**
     * @private
     * @namespace
     */
    solace.CacheGetResultCode = {
        INVALID: 0,
        OK: 1
    };

    /**
     * @private
     */
    solace.CacheRequestCorrelationID = 0;

    /**
     * @class solace.CacheRequest
     * @constructor
     * @private
     * @param {solace.CacheSession} cacheSession
     * @param {solace.CacheRequestType} cacheMessageType
     * @param {number} requestID
     * @param {solace.CacheCBInfo} cbInfo
     * @param {solace.CacheLiveDataAction} liveDataAction
     * @param {solace.Topic} topic
     * @param {string} cacheName;
     */
    solace.CacheRequest = function CacheRequest(cacheSession, cacheMessageType, requestID, cbInfo, liveDataAction, topic, cacheName) {
        this.cacheSession           = cacheSession;
        this.cacheMessageType       = cacheMessageType;
        this.requestID              = requestID;
        this.cbInfo                 = cbInfo;
        this.liveDataAction         = liveDataAction;
        this.topic                  = topic;
        this.cacheName              = cacheName;
        
        this.subscriptionWaiting    = null;
        this.replyReceived          = false;
        this.dataReceived           = false;
        this.isSuspect              = false;

        this.correlationID          = solace.CacheRequestPrefix +
                                        solace.CacheRequestCorrelationID++;

        this.childRequests          = [];
        this.parentRequest          = null;

        this.queuedLiveData         = [];
        this.liveDataFulfilled      = false;

        this.timeoutHandle          = null;
    };

    /**
     * @private
     */
    solace.CacheRequest.VERSION = 1;

    /**
     * @private
     */
    solace.CacheRequest.DEFAULT_REPLY_SIZE_LIMIT = 1000000;

    /**
     * @private
     */
    solace.CacheRequest.REPLY_SIZE_LIMIT = solace.CacheRequest.DEFAULT_REPLY_SIZE_LIMIT;

    /**
     * @private
     * @returns {solace.CacheRequest}
     */
    solace.CacheRequest.prototype.getRootRequest = function() {
        if (! this.parentRequest) {
            return this;
        }
        return this.parentRequest.getRootRequest();
    };

    /**
     * @private
     * @param child {solace.CacheRequest}
     */
    solace.CacheRequest.prototype.addChild = function(child) {
        if (child === this) {
            throw new Error("Constructing circular child reference");
        }
        
        child.parentRequest = this;
        this.childRequests.push(child);
    };

    /**
     * @private
     * @param child {solace.CacheRequest}
     */
    solace.CacheRequest.prototype.removeChild = function(child) {
        if (child === this) {
            throw new Error("Attempting to deconstruct invalid circular child reference");
        }

        var childIndex = this.childRequests.indexOf(child);
        if (childIndex === -1) {
            SOLACE_LOG_DEBUG("Child " + child + " not found in " + this);
        }
        this.childRequests.splice(childIndex, 1);
        child.parentRequest = null;
    };

    /**
     * @private
     */
    solace.CacheRequest.prototype.collapse = function() {
        var parentRequest = this.parentRequest;
        parentRequest.isSuspect = parentRequest.isSuspect || this.isSuspect;
        parentRequest.dataReceived = parentRequest.dataReceived || this.dataReceived;
        parentRequest.removeChild(this);
    };

    /**
     * @private
     * @param {solace.CacheSession} session
     */
    solace.CacheRequest.prototype.cancel = function() {
        if ( this.parentRequest) {
            this.collapse();
        }

        var child;
        for (var i = 0; i < this.childRequests.length; i++) {
            child = this.childRequests[i];
            if (child.childRequests) {
                child.cancel();
            }
            this.removeChild(child);
        }
        this.clearRequestTimeout();
    };

    /**
     * @private
     */
    solace.CacheRequest.prototype.getRequestID = function() {
        return this.requestID;
    };

    /**
     * @private
     * @returns {solace.CacheCBInfo}
     */
    solace.CacheRequest.prototype.getCBInfo = function() {
        return this.cbInfo;
    };

    /**
     * @private
     * @returns {solace.Topic}
     */
    solace.CacheRequest.prototype.getTopic = function() {
        return this.topic;
    };

    /**
     * @private
     * @returns {solace.CacheLiveDataAction}
     */
    solace.CacheRequest.prototype.getLiveDataAction = function() {
        return this.liveDataAction;
    };

    /**
     * @private
     * @param cacheSessionTimeoutCB {function({solace.CacheRequest})}
     * @param timeoutMsec {number}
     */
    solace.CacheRequest.prototype.startRequestTimeout = function(cacheSessionTimeoutCB, timeoutMsec) {
        var context = this;
        this.timeoutHandle = setTimeout(function() {
            cacheSessionTimeoutCB(context);
        }, timeoutMsec);
    };

    /**
     * @private
     */
    solace.CacheRequest.prototype.clearRequestTimeout = function() {
        if (this.timeoutHandle === null) {
            return;
        }

        SOLACE_LOG_DEBUG("Clearing timeout for " + this);
        clearTimeout(this.timeoutHandle);
        this.timeoutHandle = null;
    };

    /**
     * Returns a string representing the request.
     * @returns {string}
     */
    solace.CacheRequest.prototype.toString = function() {
        return "CacheRequest[" +
            "correlationID=" + this.correlationID +
            ",requestID=" + this.requestID +
            ",cacheName=" + this.cacheName +
            ",topic=" + this.topic.getName() + "]";
    };


    /**
     * @private
     * @namespace
     */
    solace.CacheRequestType = {
        INVALID:                        0,
        BULK_MSG:                       1,
        REGISTER_REQUEST:               2,
        REGISTER_RESPONSE:              3,
        HEARTBEAT_REQUEST:              4,
        HEARTBEAT_RESPONSE:             5,
        EVENT_NOTIFY:                   6,
        EVENT_ACK:                      7,
        ACTION_REQUEST:                 8,
        ACTION_RESPONSE:                9,
        GET_REQUEST:                    10,
        GET_RESPONSE:                   11,
        GET_NEXT_REQUEST:               12,
        GET_NEXT_RESPONSE:              13,
        SET_REQUEST:                    14,
        SET_RESPONSE:                   15,
        GET_MSG_REQUEST:                16,
        GET_MSG_RESPONSE:               17,
        GET_NEXT_MSG_REQUEST:           18,
        GET_NEXT_MSG_RESPONSE:          19,
        UNREGISTER_IND:                 20,
        BULK_SET_REQUEST:               21,
        BULK_SET_RESPONSE:              22,
        PURGE_MSG_SEQUENCE_REQUEST:     23,
        PURGE_MSG_SEQUENCE_RESPONSE:    24,
        GET_MSG_SEQUENCE_REQUEST:       25,
        GET_NEXT_MSG_SEQUENCE_REQUEST:  26,
        GET_TOPIC_INFO_REQUEST:         27,
        GET_TOPIC_INFO_RESPONSE:        28,
        READY_MARKER:                   29,
        GET_TOPIC_INFO_REQUEST_RANGE:   30,
        SYNC_READY_MARKER:              31,
        VACUUM_REQUEST:                 32,
        VACUUM_RESPONSE:                33
    };

    /**
     * @class solace.CacheRequestResult
     * An object that indicates the termination of a cache request, and provides details how it concluded.
     * @param rc {@link solace.CacheReturnCode} The result of the request.
     * <ul> <li>When returnCode === CacheReturnCode.OK, the applicable subcodes are: <ul>
     *          <li>{@link solace.CacheReturnSubcode.REQUEST_COMPLETE}</li>
     *          <li>{@link solace.CacheReturnSubcode.LIVE_DATA_FULFILL}</li></ul>
     *      <li>When returnCode === CacheReturnCode.FAIL, applicable subcodes are: <ul>
     *          <li>{@link solace.CacheReturnSubcode.ERROR_RESPONSE}</li>
     *          <li>{@link solace.CacheReturnSubcode.INVALID_SESSION}</li>
     *          <li>{@link solace.CacheReturnSubcode.REQUEST_ALREADY_IN_PROGRESS}</li></ul>
     *      <li>When returnCode === CacheReturnCode.INCOMPLETE, applicable subcodes are: <ul>
     *          <li>{@link solace.CacheReturnSubcode.NO_DATA}</li>
     *          <li>{@link solace.CacheReturnSubcode.REQUEST_TIMEOUT}</li>
     *          <li>{@link solace.CacheReturnSubcode.SUSPECT_DATA}</li></ul>
     * @param {solace.CacheReturnSubcode} subcode The subcode result of the request.  Provides details on
     * the condition that caused the result.
     * @param {solace.Topic} topic The topic on which the request was made.
     * @param {Error} The error, if any, that caused the current result.
     * @constructor
     */
    solace.CacheRequestResult = function CacheRequestResult(rc, subcode, topic, error) {
        this.returnCode = rc;
        this.subcode = subcode;
        this.topic = topic;
        this.error = error;
    };

    /**
     * Gets the return code from the cache request result.
     *
     * @return {solace.CacheReturnCode} The return code associated with the result of
     * the request.
     */
    solace.CacheRequestResult.prototype.getReturnCode = function() {
        return this.returnCode;
    };

    /**
     * Gets the return subcode from the cache request result.
     *
     * @return {solace.CacheReturnSubcode} A subcode that gives more detail than
     * {@link solace.CacheRequestResult#getReturnCode} about the result of the request.
     */
    solace.CacheRequestResult.prototype.getReturnSubcode = function() {
        return this.subcode;
    };

    /**
     * Gets the topic object associated with the cache request.
     *
     * @return {solace.Topic} The topic supplied for the cache request.
     */
    solace.CacheRequestResult.prototype.getTopic = function() {
        return this.topic;
    };

    /**
     * Gets the error, if any, associated with the returned result.
     *
     * @return {Error} The error associated with the returned result.
     */
    solace.CacheRequestResult.prototype.getError = function() {
        return this.error;
    };


    /**
     * @namespace solace.CacheReturnCode
     * Enumeration of CacheReturnCode types.  These return the basic
     * result of a cache request.  More details are available in the associated
     * {@link solace.CacheReturnSubcode}, available in
     * {@link solace.CacheRequestResult#getSubcode}.
     */
    solace.CacheReturnCode = {

        /**
         * @constant
         * @description
         * The cache request succeeded.  See the subcode for more information.
         */
        OK:         1,

        /**
         * @constant
         * @description
         * The cache request was not processed.  See the subcode for more information.
         */
        FAIL:       2,

        /**
         * @constant
         * @description
         * The cache request was processed but could not be completed.  See the subcode for more information.
         */
        INCOMPLETE: 3

    };




    /**
     * @namespace solace.CacheReturnSubcode
     * Enumeration of CacheReturnSubcode types.
     */
    solace.CacheReturnSubcode = {

        /**
         * @constant
         * @description
         * The cache request completed successfully.
         */
        REQUEST_COMPLETE:               0,

        /**
         * @constant
         * @description
         * The cache request completed when live data arrived on the topic requested.
         */
        LIVE_DATA_FULFILL:              1,

        /**
         * @constant
         * @description
         * The cache instance or session returned an error response to the cache request.
         */
        ERROR_RESPONSE:                 2,

        /**
         * @constant
         * @description
         * The cache request failed because the {@link solace.Session} used to construct it has been destroyed.
         */
        INVALID_SESSION:                3,

        /**
         * @constant
         * @description
         * The cache request failed because the request timeout expired.
         */
        REQUEST_TIMEOUT:                4,

        /**
         * @constant
         * @description
         * The cache request was made on the same topic as an existing request, and
         * {@link solace.CacheLiveDataAction.FLOW_THRU} was not set.
         */
        REQUEST_ALREADY_IN_PROGRESS:    5,

        /**
         * @constant
         * @description
         * The cache reply returned no data.
         */
        NO_DATA:                        6,

        /**
         * @constant
         * @description
         * The cache reply returned suspect data.
         */
        SUSPECT_DATA:                   7,

        /**
         * @constant
         * @description
         * The request was terminated because the cache session was disposed.
         */
        CACHE_SESSION_DISPOSED:         8,

        /**
         * @constant
         * @description
         * The request was terminated because the subscription request for the specified topic failed.
         */
        SUBSCRIPTION_ERROR:             9


    };



    // ---------------------------------- * solace.CacheSession definition * ------------------------------------- //

    /**
     * @class
     * A session for performing cache requests.
     * <p>
     *     <strong>Note:</strong> To create an instance of solace.CacheSession, applications should use
     *     {@link solace.Session.createCacheSession} and avoid using the solace.CacheSession constructor.
     * </p>
     * <p>
     *     The supplied {@link solace.CacheSessionProperties} will be copied. Subsequent modifications to
     *     the passed properties will not modify the session. The properties may be reused.
     * </p>
     *
     * @param {solace.CacheSessionProperties} props The properties for the cache session.
     * @param {solace.Session} session The solace.Session on which the solace.CacheSession will issue cache requests.

     * @constructor
     * @throws {solace.OperationError} if the parameters have an invalid type or value; subcode {@link solace.ErrorSubcode.PARAMETER_INVALID_TYPE}.
     */
    solace.CacheSession = function CacheSession(props, session) {
        this.validateProps(props);

        var myProps = new solace.CacheSessionProperties(
            props.cacheName,
            props.maxAgeSec,
            props.maxMessages,
            props.timeoutMsec
        );

        this.properties                     = myProps;
        this.outstandingRequests            = {};
        this.outstandingIDs                 = {};
        this.session                        = session;
        this.disposed                       = false;

        this.nextMessageCallbackInfo        = null;
        this.nextSessionEventCallbackInfo   = null;

        this.connectToSession(session);

    };

    /**
     * @private
     * @param {solace.CacheSessionProperties} props
     * @param props
     */
    solace.CacheSession.prototype.validateProps = function(props) {
        if ((typeof(props.cacheName) !== "string")) {
            throw new solace.OperationError("Invalid parameter type for cacheName", solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        var result = solace.TopicUtil.validateTopic(props.cacheName);
        if (result) {
            throw new solace.OperationError(result, solace.ErrorSubcode.INVALID_TOPIC_SYNTAX, null);
        }

        if ((typeof(props.maxAgeSec) !== "number")) {
            throw new solace.OperationError("Invalid parameter type for maxAgeSec", solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        if (props.maxAgeSec < 0) {
            throw new solace.OperationError("Invalid value for maxAgeSec; must be >= 0", solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE);
        }
        if ((typeof(props.maxMessages) !== "number")) {
            throw new solace.OperationError("Invalid parameter type for maxMessages", solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        if (props.maxMessages < 0) {
            throw new solace.OperationError("Invalid value for maxMessages; must be >= 0", solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE);
        }
        if ((typeof(props.timeoutMsec) !== "number")) {
            throw new solace.OperationError("Invalid parameter type for timeoutMsec", solace.ErrorSubcode.PARAMETER_INVALID_TYPE);
        }
        if (props.timeoutMsec < 3000) {
            throw new solace.OperationError("Invalid value for timeoutMsec; must be >= 3000", solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE);
        }
    };

    /**
     * @private
     * @param {solace.Session} session
     */
    solace.CacheSession.prototype.connectToSession = function(session) {
        this.nextSessionEventCallbackInfo = session.getEventCBInfo();
        this.nextMessageCallbackInfo = session.getMessageCBInfo();

        var self = this;
        session.setMessageCBInfo(new solace.CacheMessageRxCBInfo(
            function(session, message, userObject, rfuObject) {
                self.handleMessage(message);
            },
            null
        ));

        session.setEventCBInfo(this.createCompoundEventCB(this.nextSessionEventCallbackInfo));
    };


    /**
     * @private
     * Takes the session's existing event callback and sets it as the next delegate in a
     * chain of responsibility. The next delegate could be the client application, or another
     * cache session.
     * @param nextDelegate
     */
    solace.CacheSession.prototype.createCompoundEventCB = function(nextDelegate) {
        var self = this;
        return new solace.SessionEventCBInfo(
            function(session, sessionEvent, userObject, rfuObject) {
                self.handleSessionEvent(nextDelegate, session, sessionEvent, userObject, rfuObject);
            },
            null
        );
    };


    /**
     * @private Modified chain of responsibility. Handles the event, then passes the event to the next
     * delegate.
     * @param {solace.SessionEventCBInfo} nextDelegate
     * @param {solace.Session} session
     * @param {solace.SessionEvent} sessionEvent
     * @param {Object} userObject
     * @param {Object} rfuObject
     */
    solace.CacheSession.prototype.handleSessionEvent = function(nextDelegate, session, sessionEvent, userObject, rfuObject) {
        var passEvent = this.processSessionEvent(session, sessionEvent);
        if (! passEvent) {
            return;
        }

        var cbUserObject = nextDelegate.userObject;

        if (cbUserObject === null) {
            nextDelegate.sessionEventCBFunction(session, sessionEvent);
        } else {
            nextDelegate.sessionEventCBFunction(session, sessionEvent, cbUserObject);
        }
    };

    /**
     * @private
     * @param {solace.Message} message
     */
    solace.CacheSession.prototype.sendToNextDelegate = function(message) {
        var cbUserObject = this.nextMessageCallbackInfo.userObject;
        if (cbUserObject === null) {
            this.nextMessageCallbackInfo.messageRxCBFunction(this.session, message);
        } else {
            this.nextMessageCallbackInfo.messageRxCBFunction(this.session, message, cbUserObject);
        }
    };


    /**
     * @private
     * @param {solace.Session} session
     * @param {solace.SessionEvent} event
     * @return true if event should pass to next delegate
     */
    solace.CacheSession.prototype.processSessionEvent = function(session, event) {
        switch (event.sessionEventCode) {
            case solace.SessionEventCode.SUBSCRIPTION_ERROR:
            case solace.SessionEventCode.SUBSCRIPTION_OK:
                return this.checkSubscriptionStatus(event);
            case solace.SessionEventCode.DOWN_ERROR:
                this.dispose();
                return true;
            default:
                SOLACE_LOG_DEBUG("Unhandled session event: " + event.sessionEventCode);
                return true;
        }
    };

    /**
     * @private
     * @param {solace.SessionEvent} cacheSessionSubscribeInfo
     */
    solace.CacheSession.prototype.checkSubscriptionStatus = function(event) {
        // Incremental checks for whether this is our subscription.
        if ((event.correlationKey === null) ||
            (!(event.correlationKey instanceof solace.CacheSessionSubscribeInfo)) ||
            (event.correlationKey.cacheSession !== this)) {
            return true;
        }

        var request = this.getOutstandingRequest(event.correlationKey.correlationID);
        if (!request) {
            SOLACE_LOG_WARN("No request found for subscription success on " + event.correlationKey.topic);
            return true;
        }

        if (event.sessionEventCode === solace.SessionEventCode.SUBSCRIPTION_OK) {
            this.handleSubscriptionSuccess(request, event.correlationKey.topic);
            return false;
        } else {
            this.handleSubscriptionError(request, event);
            return false;
        }
    };

    /**
     * @private
     * @param {solace.CacheRequest} request
     * @param {solace.Topic} topic
     */
    solace.CacheSession.prototype.handleSubscriptionSuccess = function(request, topic) {
        // Null out this field and check completion status.
        request.subscriptionWaiting = null;
        this.startCacheRequest(request);
    };

    /**
     * @private
     * @param request
     * @param event
     */
    solace.CacheSession.prototype.handleSubscriptionError = function(request, event) {
        this.terminateRequest(request, solace.CacheReturnCode.FAIL, solace.CacheReturnSubcode.SUBSCRIPTION_ERROR);
    };

    /**
     * @private
     * @param {solace.CacheSessionRequest} request
     */
    solace.CacheSession.prototype.checkRequestCompletion = function(request) {
        if (request.childRequests.length) {
            // Not finished with spawned child requests.
            SOLACE_LOG_DEBUG("Awaiting termination of " + request.childRequests.length + " children");
            return;
        }
        if (request.subscriptionWaiting) {
            // Waiting for confirmation of subscription to a topic.
            SOLACE_LOG_DEBUG("Awaiting subscription");
            return;
        }
        if (request.timeoutHandle !== null && (! request.replyReceived)) {
            SOLACE_LOG_DEBUG("Awaiting timeout");
            return;
        }

        if (request.parentRequest) {
            // We're no longer waiting for a child to complete.
            var parent = request.parentRequest;
            request.cancel();
            this.unregisterRequest(request);
            this.checkRequestCompletion(parent);
            return;
        }

        // This is a parent request and it's done.
        var code, subcode;
        if (request.isSuspect) {
            code = solace.CacheReturnCode.INCOMPLETE;
            subcode = solace.CacheReturnSubcode.SUSPECT_DATA;
        } else if (request.dataReceived) {
            code = solace.CacheReturnCode.OK;
            if (request.liveDataFulfilled) {
                subcode = solace.CacheReturnSubcode.LIVE_DATA_FULFILL;
            } else {
                subcode = solace.CacheReturnSubcode.REQUEST_COMPLETE;
            }
        } else if (request.replyReceived) {
            code = solace.CacheReturnCode.INCOMPLETE;
            subcode = solace.CacheReturnSubcode.NO_DATA;
        } else {
            throw new Error("Sanity: should never happen");
        }

        this.terminateRequest(request, code, subcode);
    };

    /**
     * @private
     * @param parentRequest
     * @param cacheGetResult
     */
    solace.CacheSession.prototype.sendSeeOther = function(parentRequest, cacheGetResult) {
        var clusterName = cacheGetResult.clusterNameStream.getNext().getValue();
        var root = parentRequest.getRootRequest();

        SOLACE_LOG_DEBUG("See Other for " + clusterName + ". Sending child request");
        var childRequest = new solace.CacheRequest(
            this,
            solace.CacheRequestType.GET_MSG_REQUEST,
            parentRequest.requestID,
            new solace.CacheCBInfo(this.swallowChildReply, null),
            parentRequest.liveDataAction,
            parentRequest.topic,
            clusterName
        );

        // Add this request to its parent
        parentRequest.addChild(childRequest);

        // Start the request
        this.registerRequest(childRequest);
        childRequest.startRequestTimeout(
            this.handleCacheRequestTimeout,
            this.properties.timeoutMsec
        );
        this.startCacheRequest(
            childRequest, // request to send
            null, // no session ID
            null, // no specific instance target
            true // don't return other clusters
        );
    };

    /**
     * @private
     * @param parentRequest
     * @param cacheGetResult
     */
    solace.CacheSession.prototype.sendGetNext = function(parentRequest, cacheGetResult) {
        SOLACE_LOG_DEBUG("Cache result has more, sending GET_NEXT_MSG_REQUEST as child");
        var nextRequest = new solace.CacheRequest(
            this,
            solace.CacheRequestType.GET_NEXT_MSG_REQUEST,
            parentRequest.requestID,
            new solace.CacheCBInfo(this.swallowChildReply, null),
            parentRequest.liveDataAction,
            parentRequest.topic,
            parentRequest.cacheName
        );

        // Set up parent-child relationship
        parentRequest.addChild(nextRequest);

        // Start the request
        this.registerRequest(nextRequest);
        nextRequest.startRequestTimeout(
            this.handleCacheRequestTimeout,
            this.properties.timeoutMsec
        );
        this.startCacheRequest(
            nextRequest, // request to send
            cacheGetResult.sessionID, // supplied session ID
            cacheGetResult.replyTo // supplied cache instance target
        );
    };

    /**
     * @private
     * @param request
     * @param result
     */
    solace.CacheSession.prototype.decodeMessageStream = function(request, result) {
        if (! result.messageStream) {
            return [];
        }

        SOLACE_LOG_DEBUG("Receiving messages");

        var data, innerMessage;
        var messages = [];
        
        while (result.messageStream.hasNext()) {
            request.dataReceived = true;
            data = result.messageStream.getNext().getValue();
            innerMessage = solace.smf.Codec.decodeCompoundMessage(data,  0);
            innerMessage.setCacheStatus(result.isSuspect ? solace.MessageCacheStatus.SUSPECT : solace.MessageCacheStatus.CACHED);
            innerMessage.setCacheRequestID(request.requestID);
            messages.push(innerMessage);
        }
        SOLACE_LOG_DEBUG(messages.length + " cached messages received");

        return messages;
    };

    /**
     * @private
     * @param {solace.Message} message
     */
    solace.CacheSession.prototype.handleMessage = function(message) {
        // Determine if the message is associated with one of this session's requests
        var correlationID = message.getCorrelationId();
        var request = correlationID ? this.outstandingRequests[correlationID] : null;

        // This could be live data on a relevant topic.  Check that.
        if (! request) {
            if (this.relevantLiveData(message)) {
                this.sendToNextDelegate(message);
            }
            return;
        }

        SOLACE_LOG_DEBUG("Processing reply to " + request);

        // It's ours!
        // bug 36404: We have a response. Cancel the timeout for this request.
        request.clearRequestTimeout();

        var streamField = message.getSdtContainer();
        var stream = streamField.getValue();

        if (! stream) {
            // The session will never see this reply, so we need to update the stats
            // from here.
            SOLACE_LOG_ERROR("Invalid message format for cache response: no SDT stream.");
            this.terminateRequest(request, solace.CacheReturnCode.FAIL, solace.CacheReturnSubcode.ERROR_RESPONSE);
        }

        this.incStat(solace.StatType.RX_REPLY_MSG_RECVED);
        request.replyReceived = true;

        // If the request was fulfilled by live data, discard the reply
        // and stop processing the response.
        if (request.getRootRequest().liveDataFulfilled) {
            this.incStat(solace.StatType.CACHE_REQUEST_FULFILL_DISCARD_RESPONSE);
            this.checkRequestCompletion(request);
            return;
        }

            try {
            // Fill the result object with values from the result stream.
            var result = new solace.CacheGetResult();
            result.readFromStream(stream);
            result.replyTo = message.getReplyTo();

            if (result.responseString) {
                SOLACE_LOG_DEBUG("Cluster response: " + result.responseString);
                }

            // Apply the isSuspect flag. Don't clear it if the result is
            // already suspect.
            request.isSuspect = request.isSuspect || result.isSuspect;

            // Get any inner messages.
            var messages = this.decodeMessageStream(request, result);
            // Update statistics.
            this.incStat(solace.StatType.RX_CACHE_MSG, messages.length);

            // If we have more results to come, send a get next request.
            if (result.hasMore) {
                this.sendGetNext(request, result);
                    }

            // If we have more clusters to visit, send requests to those clusters.
            if (result.clusterNameStream) {
                    SOLACE_LOG_DEBUG("Receiving cluster stream");
                while (result.clusterNameStream.hasNext()) {
                    this.sendSeeOther(request, result);
                        }
                    }

            // Forward any retrieved messages.
            if (messages) {
                for (var i = 0; i < messages.length; i++) {
                    this.sendToNextDelegate(messages[i]);
                }
            }

            this.checkRequestCompletion(request);

            } catch (exception) {
                SOLACE_LOG_ERROR("Invalid message format for cache response: " + exception.message);
            this.terminateRequest(request, solace.CacheReturnCode.FAIL, solace.CacheReturnSubcode.ERROR_RESPONSE);
            }
    };

    /**
     * @private
     * @param message
     */
    solace.CacheSession.prototype.relevantLiveData = function(message) {
        // If the next message processor does not belong to a cache
        // session, and this is a CRQ message, suppress it.
        if (message.getCorrelationId() &&
            message.getCorrelationId().indexOf(solace.CacheRequestPrefix) === 0 &&
            ! (this.nextMessageCallbackInfo instanceof solace.CacheMessageRxCBInfo)) {
            SOLACE_LOG_WARN("DROP: Dropping CRQ reply due to no remaining Cache Session processors on message callback chain");
            this.incStat(solace.StatType.RX_REPLY_MSG_DISCARD);
            return false;
        }

        // Otherwise, assume the message should flow through.
        var flowThrough = true;
        for (var checkCID in this.outstandingRequests) {
            if (typeof checkCID === "string") {

                var checkFulfilledRequest = this.outstandingRequests[checkCID];
                if (checkFulfilledRequest.topic.getName() === message.getDestination().getName()) {
                    // The topic matches, so perform the appropriate action for the
                    // associated request's live data action
                    flowThrough = flowThrough && this.performLiveDataAction(checkFulfilledRequest, message);
                }
            }
        }

        return flowThrough;
    };

    /**
     * @private
     * @param request {solace.CacheRequest}
     * @param message {solace.Message}
     * @return true if message should flow through after action.
     */
    solace.CacheSession.prototype.performLiveDataAction = function(request, message) {
        request.dataReceived = true;

        switch (request.liveDataAction) {
            case solace.CacheLiveDataAction.QUEUE:
                request.queuedLiveData.push(message);
                return false;

            case solace.CacheLiveDataAction.FULFILL:
                if (! request.liveDataFulfilled) {
                    this.fulfillRequest(request);
                }
            return true;
            
            default:
                return true;
        }

    };

    /**
     * @private
     * @param request
     */
    solace.CacheSession.prototype.fulfillRequest = function(request) {
            request.liveDataFulfilled = true;
        this.trackCompletionStats(solace.CacheReturnCode.OK, solace.CacheReturnSubcode.LIVE_DATA_FULFILL);

        // We have more work to do here -- we need to return the live data first.
        // Schedule the notification for later.
        var self = this;
            setTimeout(function() {
            self.notifyCallback(request, solace.CacheReturnCode.OK, solace.CacheReturnSubcode.LIVE_DATA_FULFILL, request.getTopic(), null);
            }, 0);

    };

    /**
     * Disposes the session.  No cache requests will be sent by this CacheSession after it is disposed.
     * Any subsequent operations on the session will throw {solace.OperationError}.  Any pending operations
     * will immediately terminate, returning <br/>
     * <ul>
     *     <li>{@link solace.CacheRequestResult}</li>
     *     <ul>
     *         <li>#returnCode === {@link solace.CacheReturnCode.INCOMPLETE}</li>
     *         <li>#subcode === {@link solace.CacheReturnSubcode.CACHE_SESSION_DISPOSED}</li>
     *     </ul>
     * </ul>
     * @throws {solace.OperationError} if the solace.CacheSession is already disposed.
     */
    solace.CacheSession.prototype.dispose = function() {

        var toTerminate = [];
        for (var correlationID in this.outstandingRequests) {
            if (this.outstandingRequests[correlationID] instanceof solace.CacheRequest) {
                toTerminate.push(this.outstandingRequests[correlationID]);
            }
        }

        for (var i = 0; i < toTerminate.length; i++) {
            this.terminateRequest(toTerminate[i],
                solace.CacheReturnCode.INCOMPLETE,
                solace.CacheReturnSubcode.CACHE_SESSION_DISPOSED);
        }

        this.outstandingRequests = [];

        // Restore original listeners
        this.session.setEventCBInfo(this.nextSessionEventCallbackInfo);
        this.session.setMessageCBInfo(this.nextMessageCallbackInfo);

        // Set disposed
        this.disposed = true;
    };

    /**
     * Gets the cache session properties.
     *
     * @return {solace.CacheSessionProperties} The properties for the session.
     * @throws {solace.OperationError} if the solace.CacheSession is disposed.
     */
    solace.CacheSession.prototype.getProperties = function() {
        return this.properties;
    };

    /**
     * Issues an asynchronous cache request.  The result of the request will be returned via the listener.  Messages
     * returned as a result of issuing the request will be returned to the application via the {solace.MessageRxCBInfo}
     * associated with the {solace.Session} associated with this CacheSession.
     *
     * <p>Any request in progress
     *
     * @param {number} requestID The application-assigned ID number for the request.
     * @param {solace.Topic} topic The topic for which the cache request will be made.
     * @param {boolean} subscribe If true, the session will subscribe to the given {solace.Topic}, if it is not already
     * subscribed, before performing the cache request.
     * @param {solace.CacheLiveDataAction} liveDataAction The action to perform when the {solace.CacheSession} receives
     * live data on the given topic.
     * @param {solace.CacheCBInfo} cbInfo Callback info for the cache request.
     * @throws {solace.OperationError} if the solace.CacheSession is disposed. Subcode: {@link solace.ErrorSubcode.INVALID_SESSION_OPERATION}
     * @throws {solace.OperationError} if one or more parameters were invalid. Subcode: {@link solace.ErrorSubcode.PARAMETER_INVALID_TYPE}
     * @throws {solace.OperationError} if the supplied topic and live data action cannot be combined. Subcode: {@link solace.ErrorSubcode.PARAMETER_CONFLICT}
     * @throws {solace.OperationError} if the supplied topic or live data action cannot be used given the current outstanding requests. Subcode: {@link solace.ErrorSubcode.PARAMETER_CONFLICT}
     */
    solace.CacheSession.prototype.sendCacheRequest = function(requestID, topic, subscribe, liveDataAction, cbInfo) {
        if (arguments.length !== 5) {
            throw new solace.OperationError("sendCacheRequest() invoked with an illegal argument count of " + arguments.length);
        }

        if (typeof subscribe !== "boolean") {
            throw new solace.OperationError("Invalid subscribe flag argument, should be a boolean but was " + typeof subscribe);
        }
        

        if (typeof requestID !== "number") {
            throw new solace.OperationError("Invalid requestID", solace.ErrorSubcode.PARAMETER_INVALID_TYPE, null);
        }

        if (this.outstandingIDs[requestID]) {
            throw new solace.OperationError("Request already in progress with this requestID");
        }

        if (! (topic instanceof solace.Topic)) {
            throw new solace.OperationError("Invalid topic", solace.ErrorSubcode.PARAMETER_INVALID_TYPE, (typeof topic));
        }

        var result = solace.TopicUtil.validateTopic(topic.getName());
        if (result) {
            throw new solace.OperationError(result, solace.ErrorSubcode.INVALID_TOPIC_SYNTAX);
        }

        if (!(liveDataAction === solace.CacheLiveDataAction.FLOW_THRU ||
            liveDataAction === solace.CacheLiveDataAction.FULFILL ||
            liveDataAction === solace.CacheLiveDataAction.QUEUE
            )) {
            throw new solace.OperationError("Invalid live data action", solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE);
        }

        if (solace.TopicUtil.isWildcarded(topic.getName()) && liveDataAction !== solace.CacheLiveDataAction.FLOW_THRU) {
            throw new solace.OperationError("Wildcarded topic not supported for this live data action", solace.ErrorSubcode.PARAMETER_CONFLICT);
        }

        if (! (cbInfo instanceof solace.CacheCBInfo)) {
            throw new solace.OperationError("Callback info was not an instance of solace.CacheCBInfo");
        }

        if (this.disposed) {
            cbInfo.cacheCBFunction(requestID, solace.CacheReturnCode.FAIL, solace.CacheReturnSubcode.CACHE_SESSION_DISPOSED);
            return;
        }

        if (this.session.m_disposed) {
            cbInfo.cacheCBFunction(requestID, solace.CacheReturnCode.FAIL, solace.CacheReturnSubcode.INVALID_SESSION);
        }

        var request = new solace.CacheRequest(
            this, solace.CacheRequestType.GET_MSG_REQUEST,
            requestID, cbInfo, liveDataAction,
            topic, this.properties.cacheName);

        for (var key in this.outstandingRequests) {
            // Topic name matches are bad unless both requests are FLOW_THRU
            if (this.outstandingRequests[key].topic.getName() === topic.getName()) {
                // Can we let this pass?
                if (liveDataAction === this.outstandingRequests[key].liveDataAction &&
                    liveDataAction === solace.CacheLiveDataAction.FLOW_THRU) {
                    // Yes
                    continue;
                }

                SOLACE_LOG_WARN("Existing request " + this.outstandingRequests[key] + " conflicts; rejecting request " + request);
                // Register this request so that it is not dismissed as an orphan.
                this.registerRequest(request);
                this.terminateRequest(request, solace.CacheReturnCode.FAIL, solace.CacheReturnSubcode.REQUEST_ALREADY_IN_PROGRESS);
                return;
            }
        }


        this.registerRequest(request);
        request.startRequestTimeout(this.handleCacheRequestTimeout, this.properties.timeoutMsec);

        if (subscribe) {
            var waitingForSubscribeInfo = new solace.CacheSessionSubscribeInfo(request.correlationID, topic, this);
            request.subscriptionWaiting = waitingForSubscribeInfo;
            this.session.subscribe(topic, true, waitingForSubscribeInfo);
            return;
        }
        
        this.startCacheRequest(request);
    };

    /**
     * @private
     */
    solace.CacheSession.prototype.swallowChildReply = function() {
    };

    /**
     * @private
     * @param {solace.Session} session
     * @param {solace.SessionEvent} sessionEvent
     * @param {solace.CacheRequest} userObject
     * @param {Object} rfuObject
     */
    solace.CacheSession.prototype.handleCacheRequestFailed = function(session, sessionEvent, userObject, rfuObject) {
        this.terminateRequest(userObject.getRequestID(), solace.CacheReturnCode.FAIL, solace.CacheReturnSubcode.ERROR_RESPONSE);
    };

    /**
     * @private
     * @param {solace.CacheRequest} request
     */
    solace.CacheSession.prototype.registerRequest = function(request) {
        this.outstandingRequests[request.correlationID] = request;
        if (! request.parentRequest) {
            this.outstandingIDs[request.requestID] = request;
        }
    };

    /**
     * @private
     * @param {number} correlationID
     */
    solace.CacheSession.prototype.getOutstandingRequest = function(correlationID) {
        return this.outstandingRequests[correlationID];
    };

    /**
     * @private
     * @param {solace.CacheRequest} request
     * @param {number|undefined} sessionID Only when returned from a cache instance as part of a previous message
     * @param {solace.Topic|undefined} destination Only when required by a cache reply
     * @param {boolean|undefined} suppressClusters True when other clusters should be excluded from the response,
     * as in a request resulting from a "see other"
     */
    solace.CacheSession.prototype.startCacheRequest = function(request, sessionID, destination, suppressClusters) {
        var message = solace.SolclientFactory.createMessage();
        var requestID = request.getRequestID();

        // Prepare message
        message.setCorrelationId(request.correlationID);
        if (destination) {
            message.setDestination(destination);
        } else {
        message.setDestination(
            solace.SolclientFactory.createTopic(
                this.properties.cachePrefix + request.cacheName
            )
        );
        }

        message.setReplyTo(
            solace.SolclientFactory.createTopic(
                this.session.getSessionProperties().p2pInboxInUse
            )
        );
        message.setDeliverToOne(request.cacheMessageType === solace.CacheRequestType.GET_MSG_REQUEST);

        // Prepare stream container
        var stream = new solace.SDTStreamContainer();
        stream.addField(solace.SDTFieldType.UINT32, request.cacheMessageType);
        stream.addField(solace.SDTFieldType.UINT32, solace.CacheRequest.VERSION);
        stream.addField(solace.SDTFieldType.STRING, request.topic.getName());
        stream.addField(solace.SDTFieldType.UINT32, solace.CacheRequest.REPLY_SIZE_LIMIT);

        if (typeof sessionID === 'number') {
            SOLACE_LOG_DEBUG("Including session ID: " + sessionID);
            stream.addField(solace.SDTFieldType.UINT32, sessionID);
        }

        stream.addField(solace.SDTFieldType.UINT32, this.properties.maxMessages);
        stream.addField(solace.SDTFieldType.UINT32, this.properties.maxAgeSec);

        if (request.cacheMessageType === solace.CacheRequestType.GET_MSG_REQUEST) {
            stream.addField(solace.SDTFieldType.BOOL, this.properties.includeOtherClusters && (! suppressClusters));
        }

        stream.addField(solace.SDTFieldType.BOOL, false); // includeTimestamps, 6.17.1

        if (request.cacheMessageType === solace.CacheRequestType.GET_MSG_REQUEST) {
            stream.addField(solace.SDTFieldType.UINT32, Math.round(this.properties.timeoutMsec / 1000));
        }

        // Load stream container
        message.setSdtContainer(solace.SDTField.create(solace.SDTFieldType.STREAM, stream));
        try {
            SOLACE_LOG_DEBUG("Sending " + request);
            
            this.session.send(message);

            if (! request.parentRequest) {
                // Don't count child requests in CACHE_REQUEST_SENT total
                this.incStat(solace.StatType.CACHE_REQUEST_SENT);
            }
        } catch (e) {
            SOLACE_LOG_ERROR("Failed to send request: " + e.message);
            this.terminateRequest(request, solace.CacheReturnCode.FAIL, solace.CacheReturnSubcode.ERROR_RESPONSE, e);
        }
    };

    solace.CacheSession.prototype.incStat = function(statType, value) {
        if (! this.session) {
            SOLACE_LOG_DEBUG("Can't log stat; session is disposed");
            return;
        }

        if (! this.session.m_sessionStatistics) {
            SOLACE_LOG_DEBUG("Can't log stat; session statistics not available");
            return;
        }

        this.session.m_sessionStatistics.incStat(statType, value);
    };

    /**
     * @private
     * Closure call context; this will be redefined
     * @param {solace.CacheRequest} cacheRequest
     */
    solace.CacheSession.prototype.handleCacheRequestTimeout = function(cacheRequest) {
        var context = cacheRequest.cacheSession;
        if (! context.getOutstandingRequest(cacheRequest.correlationID)) {
            SOLACE_LOG_ERROR("Timeout for " + cacheRequest + " was not unregistered; ignoring");
            // already completed
            return;
        }

        // bug 36404: Cache request timeout is to be interpreted as timeout per session request-reply,
        // not timeout per cache request-reply.
        // Implementation: Timeouts on parent requests are cancelled when a child request is spawned.
        // Timeouts on child requests cause the root request to fail.
        SOLACE_LOG_INFO("Request " + cacheRequest + " timed out");
        context.terminateRequest(cacheRequest.getRootRequest(), solace.CacheReturnCode.INCOMPLETE, solace.CacheReturnSubcode.REQUEST_TIMEOUT);
    };

    solace.CacheSession.prototype.unregisterRequest = function(request) {
        delete this.outstandingRequests[request.correlationID];
        delete this.outstandingIDs[request.requestID];
    };

    /**
     * @private
     * @param request
     * @param returnCode
     * @param subcode
     * @param error
     */
    solace.CacheSession.prototype.notifyCallback = function(request, returnCode, subcode, topic, error) {
        var cbInfo = request.cbInfo;
        var callback = cbInfo.getCallback();
        callback(request.requestID, new solace.CacheRequestResult(returnCode, subcode, topic, error), cbInfo.getUserObject());
    };

    /**
     * @private
     * @param returnCode
     * @param subcode
     */
    solace.CacheSession.prototype.trackCompletionStats = function(returnCode, subcode) {
        switch (returnCode) {
            case solace.CacheReturnCode.OK:
                this.incStat(solace.StatType.CACHE_REQUEST_OK_RESPONSE);
                if (subcode === solace.CacheReturnSubcode.LIVE_DATA_FULFILL) {
                    this.incStat(solace.StatType.CACHE_REQUEST_LIVE_DATA_FULFILL);
                }
                break;
            case solace.CacheReturnCode.INCOMPLETE:
                this.incStat(solace.StatType.CACHE_REQUEST_INCOMPLETE_RESPONSE);
                break;
            case solace.CacheReturnCode.FAIL:
                this.incStat(solace.StatType.CACHE_REQUEST_FAIL_RESPONSE);
                break;
            default:
                throw new Error("Sanity: no return code supplied");
        }
    };

    /**
     * @private
     * @param {solace.CacheRequest}
     * @param {solace.CacheReturnCode} returnCode
     * @param {solace.CacheReturnSubcode} subcode
     * @param {Error}
     */
    solace.CacheSession.prototype.terminateRequest = function(request, returnCode, subcode, error) {
        request = request.getRootRequest();
        if (! this.outstandingRequests[request.correlationID]) {
            // Request is unknown or was previously terminated
            return;
        }

        var cbInfo = request.cbInfo;
        if (! cbInfo) {
            SOLACE_LOG_WARN("No callback info provided for " + request + "; cannot notify");
            return; // Cannot continue
        }

        var callback = cbInfo.getCallback();
        if (! callback) {
            SOLACE_LOG_WARN("No callback provided for " + request + "; cannot notify");
            return; // Cannot continue
        }

        var topic = request.getTopic();
        if (! topic) {
            SOLACE_LOG_WARN("No topic provided for " + request);
        }

        for (var i = 0; i < request.queuedLiveData.length; i++) {
            // Fire any queued live data through the listener chain
            this.sendToNextDelegate(request.queuedLiveData[i]);
        }

        // Unregister before callback so that the client application can treat the request ID
        // as "freed" and reuse it
        request.cancel();
        this.unregisterRequest(request);

        if (! request.liveDataFulfilled) {
            // All of this has already been done on fulfill.
            this.trackCompletionStats(returnCode, subcode);
            this.notifyCallback(request, returnCode, subcode, topic, error);
                }

    };

    /**
     * @class
     *
     * Encapsulates the properties of a cache session.
     * @param {string} cacheName A property that specifies the cache name to which CacheSession operations should be
     * sent.
     *
     * @param {number|null} maxAgeSec The maximum allowable message age in seconds to deliver in response to a cache request.
     * 0 means no restriction on age. The default for this property is 0. If null is supplied, the default is used.
     *
     * @param {number|null} maxMessages The maximum number of messages per Topic to deliver in response to cache requests.
     * 0 means no restriction on the number of messages. The default for this property is 1. If null is supplied, the default is used.
     *
     * @param {number|null} timeoutMsec The timeout period (in milliseconds) to wait for a response from the cache.
     * This is a protocol timer used internally by the API on each message exchange with solCache. A single call to
     * solace.CacheSession#sendCacheRequest() may lead to many request-reply exchanges with solCache and so is not
     * bounded by this timer as long as each internal request is satisfied in time.
     * The valid range for this property is >= 3000. The default for this property is 10000.
     * If null is supplied, the default is used.
     *
     */
    solace.CacheSessionProperties = function CacheSessionProperties(cacheName, maxAgeSec, maxMessages, timeoutMsec) {

        /**
         * @property {string}
         * @description A property that specifies the cache name to which CacheSession operations should be sent.
         */
        this.cacheName = cacheName;

        /**
         * @property {number}
         * @description The maximum allowable message age in seconds to deliver in response to cache requests.  0
         * means no restriction on age.
         * @default 0
         */
        this.maxAgeSec = maxAgeSec || 0;

        /**
         * @property {number}
         * @description The maximum number of messages per Topic to deliver in response to cache requests.  0 means
         * no restriction on the number of messages.
         * @default 1
         */
        this.maxMessages = (maxMessages === null || typeof maxMessages === "undefined") ? 1 : maxMessages;

        /**
         * @property {number}
         * @description The timeout for a cache request, in milliseconds.  The valid range for this property is >= 3000.
         * @default 10000
         */
        this.timeoutMsec = timeoutMsec || 10000;

        /**
         * @private
         * @property {boolean}
         * @description Whether to include other clusters in the request.
         * @default true
         */
        this.includeOtherClusters = true;

        /**
         * @private
         */
        this.cachePrefix = "#P2P/CACHEINST/";

    };

    /**
     * Gets the cache name to which {@link solace.CacheSession} requests should be sent, for
     * sessions constructed using these properties.
     *
     * @return {string} The cache name.
     */
    solace.CacheSessionProperties.prototype.getCacheName = function() {
        return this.cacheName;
    };

    /**
     * Sets the cache name to which requests should be sent. Cannot be null or blank.
     * @param {string} value The cache name to which requests should be sent.
     */
    solace.CacheSessionProperties.prototype.setCacheName = function(value) {
        this.cacheName = value;
    };

    /**
     * Gets the maximum allowable message age for messages to be delivered in response
     * to a request made on a {@link solace.CacheSession} that was constructed
     * using these properties.  0 means no restriction on age.
     *
     * @return {number} The maximum allowable message age to be returned by an associated
     * {@link solace.CacheSession}, or 0 for no restriction.
     */
    solace.CacheSessionProperties.prototype.getMaxMessageAgeSec = function() {
        return this.maxAgeSec;
    };

    /**
     * Sets the maximum allowable message age. 0 means no restriction on age.
     * @param {number} value The maximum allowable message age, or 0 for no restriction.
     */
    solace.CacheSessionProperties.prototype.setMaxMessageAgeSec = function(value) {
        this.maxAgeSec = value;
    };

    /**
     * Gets the maximum count of messages to be delivered, per {@link solace.Topic},
     * in response to a request issued on a {@link solace.CacheSession} constructed
     * using these properties.  0 means no restriction on the number of messages.
     *
     * @return {number} The maximum number of messages per Topic to deliver, or
     * 0 for no restriction.
     */
    solace.CacheSessionProperties.prototype.getMaxMessages = function() {
        return this.maxMessages;
    };

    /**
     * Sets the maximum count of messages to be delivered per {@link solace.Topic}
     * in response to a cache request. 0 means no restriction.
     * @param {number} value The maximum count of messages to deliver, or 0 for no
     * restriction.
     */
    solace.CacheSessionProperties.prototype.setMaxMessages = function(value) {
        this.maxMessages = value;
    };

    /**
     * Gets the timeout for requests issued on a {@link solace.CacheSession} constructed
     * using these properties.  The valid range is >= 3000.
     *
     * @return {number} The timeout, in milliseconds, for cache session requests.
     */
    solace.CacheSessionProperties.prototype.getTimeoutMsec = function() {
        return this.timeoutMsec;
    };

    /**
     * Sets the timeout for requests. The valid range is >= 3000.
     * @param {number} value The timeout for requests.
     */
    solace.CacheSessionProperties.prototype.setTimeoutMsec = function(value) {
        this.timeoutMsec = value;
    };

    /**
     * @private
     * @param {string} correlationID
     * @param {solace.Topic} topic
     * @param {solace.CacheSession} cacheSession
     */
    solace.CacheSessionSubscribeInfo = function CacheSessionSubscribeInfo(correlationID, topic, cacheSession) {
        this.correlationID = correlationID;
        this.topic = topic;
        this.cacheSession = cacheSession;

    };

    /**
     * @private
     * @param session
     * @param message
     * @param userObject
     * @param rfuObject
     */
    solace.CacheMessageRxCBInfo = function(session, message, userObject, rfuObject) {
        solace.MessageRxCBInfo.apply(this, arguments);
    };

}(solace));
//
/*global solace:true,window,global,escape,unescape,WebSocket,ArrayBuffer,Uint8Array,WebSocket,QUnit,SOLACE_LOG_FATAL,SOLACE_LOG_ERROR,SOLACE_LOG_WARN,SOLACE_LOG_INFO,SOLACE_LOG_DEBUG,SOLACE_LOG_TRACE */
// 
// 

(function(solace) {
    // This contains SMF formatting for SMF Transport Session headers
    solace.TsSmf = (function() {
        // INTERNAL
        // Generates an SMF header up to, but not including the the total length
        // This is fixed for all client generated transport session messages
        function genTsHeaderPreLength() {
            return (
                    solace.Convert.int32ToStr(0x03140001) + // SMF version, TransportSession, TTL
                            solace.Convert.int32ToStr(12)   // Header length
                    );
        }

        return {
            // Generate a full Transport Session Create header
            genTsCreateHeader: function genTsCreateHeader() {
                return (
                        genTsHeaderPreLength() + // Header up to the message length field
                                solace.Convert.int32ToStr(22) + // Total length
                                solace.Convert.int16ToStr(0x800a) + // MsgType(create), length
                                solace.Convert.int32ToStr(0) + // Session ID (first half)
                                solace.Convert.int32ToStr(0)        // Session ID (second half)
                        );
            },
            // Generate a full Transport Session Destroy header
            genTsDestroyHeader: function genTsDestroyHeader(sid) {
                return (
                        genTsHeaderPreLength() + // Header up to the message length field
                                solace.Convert.int32ToStr(22) + // Total length
                                solace.Convert.int16ToStr(0x820a) + // MsgType(destroy), length
                                sid                                   // Session ID
                        );
            },

            // Generate a data token message
            genTsDataTokenMsg: function genTsDataTokenMsg(sid) {
                return (solace.Convert.int32ToStr(0x03940001) +
                        solace.Convert.int32ToStr(12) +
                        solace.Convert.int32ToStr(22) +
                        solace.Convert.int16ToStr(0x850a) +
                        sid);
            },

            // Generate a STREAMING data token message
            genTsDataStreamTokenMsg: function genTsDataStreamTokenMsg(sid) {
                return (solace.Convert.int32ToStr(0x03940001) +
                        solace.Convert.int32ToStr(12) +
                        solace.Convert.int32ToStr(24) +
                        solace.Convert.int16ToStr(0x860c) +
                        sid +
                        solace.Convert.int16ToStr(0x0000));
            },

            genTsDataMsgHeaderParts: function genTsDataMsgHeaderParts(sid) {
                return [(solace.Convert.int32ToStr(0x03940001) +
                    solace.Convert.int32ToStr(12)),
                    (solace.Convert.int16ToStr(0x840a) +
                        sid)];

            }
        };
    }());

}(solace));
//
/*global solace:true,window,global,escape,unescape,WebSocket,ArrayBuffer,Uint8Array,WebSocket,QUnit,SOLACE_LOG_FATAL,SOLACE_LOG_ERROR,SOLACE_LOG_WARN,SOLACE_LOG_INFO,SOLACE_LOG_DEBUG,SOLACE_LOG_TRACE */
//
//
//

(function(solace) {

    /** ===========================================================================
     * TransportSessionEvent :
     *
     * Defines a Transport Session Event
     *
     * @param {Object} TransportSessionEventCode {@link solace.TransportSessionEventCode}
     * @param {Object} infoStr
     * @param {Object} responseCode
     * @param {Object} sessionId
     *
     * ============================================================================
     */
    solace.TransportSessionEvent = function(TransportSessionEventCode, infoStr, responseCode, sessionId){
        this.m_sessionEventCode = TransportSessionEventCode;
        this.m_infoStr          = infoStr;
        this.m_responseCde      = responseCode;
        this.m_sid              = sessionId;
    };

    // TransportSessionEvent functions

    solace.TransportSessionEvent.prototype.getSessionEventCode = function(){
        return this.m_sessionEventCode;
    };

    solace.TransportSessionEvent.prototype.getInfoStr = function(){
        return this.m_infoStr;
    };

    solace.TransportSessionEvent.prototype.getResponseCode = function(){
        return this.m_responseCde;
    };

    solace.TransportSessionEvent.prototype.getSessionId = function(){
        return this.m_sid;
    };

    solace.TransportSessionEvent.prototype.toString = function() {
        var buf = new solace.StringBuffer("Transport session event: ");
        buf.append("sessionEventCode=").append(this.m_sessionEventCode).append(", ");
        buf.append("infoStr=").append(this.m_infoStr||"").append(", ");
        buf.append("responseCode=").append(this.m_responseCde||"").append(", ");
        buf.append("sid=").append(this.m_sid ? solace.Util.formatHexString(this.m_sid) : "N/A");
        return buf.toString();
    };

    /**
     * @private
     * @namespace Values for tracking current state of incoming read message.
     */
    var PacketReadState = {
        SMF_NEW: 0,
        SMF_HEADER_READ: 1,
        TRANSPORT_HEADER_READ: 2
    };

    /**
     * @private
     * @constructor
     * @class Tracks state of a read/parse multi-step operation.
     */
    function StreamPacketReadState() {
        this.PacketReadState = PacketReadState.SMF_NEW;
        this.TopSmfHeader = null;
        this.TotalPayloadToRead = 0;
        this.TransportMessageCurrent = null;
        this.m_bytesRead = 0;
        this.m_inputbuf = "";

        this.remaining = function() {
            return (this.m_inputbuf.length - this.m_bytesRead);
        };
        this.enqueue = function(data) {
            this.m_inputbuf += data;
        };
        this.getBuffer = function() {
            return this.m_inputbuf;
        };
        this.advanceBuffer = function(len) {
            this.m_bytesRead += len;
            if (this.m_bytesRead === this.m_inputbuf.length) {
                this.m_bytesRead = 0;
                this.m_inputbuf = "";
            }
        };
        this.position = function() {
            return this.m_bytesRead;
        };
    }

    function allowEnqueue(ts, datalen) {
        // Bug 32006: we always accept at least one message, if there's no queued data, even if it exceeds the sendBufferMaxSize.
        // If we reject enqueueing something too large because we already have queued data,
        // that guarantees when the data is flushed we will emit the alertOnDequeue event.

        return ts.m_queuedDataSize === 0 || ((datalen + ts.m_queuedDataSize) <= ts.m_sendBufferMaxSize);
    }

    function enqueue_fail_no_space(ts) {
        ts.m_alertOnDequeue = true;
        return 2;
    }

    function getQueuedDataToSend(ts) {
        // Track messages dequeued.
        var data = "";

        // Start by trying to fill a complete payload.
        var bytesAllowed = ts.m_maxPayloadBytes;
        if (ts.getBufferedAmount) {
			// websocket
            bytesAllowed = ts.m_maxPayloadBytes - ts.getBufferedAmount();
			if (bytesAllowed <= 0) {
				SOLACE_LOG_INFO("$$ bytesAllowed=" + bytesAllowed + ", bufferedAmount=" +  ts.getBufferedAmount());
				if (ts.m_bufferedAmountQueryIntervalInMsecs * ts.m_bufferedAmountQueryIntervalDelayMultiplier <= 4000) {
					ts.m_bufferedAmountQueryIntervalDelayMultiplier = ts.m_bufferedAmountQueryIntervalDelayMultiplier*2;
				}
				return data;
			}
			else {
				ts.m_bufferedAmountQueryIntervalDelayMultiplier = 1;
			}
        }

        if (ts.m_queuedDataSize > bytesAllowed) {
            var payloadSize = bytesAllowed;
            var elem, elemLength;
            // Slow path: dequeue and append until we fill the payload.
            while (payloadSize && ts.m_queuedDataSize) {
                // Is this element larger than the payload?
                elem = ts.m_queuedData[0];
                elemLength = elem.length;
                if (elemLength > payloadSize) {
                    // This element is larger than the payload.
                    data += elem.substr(0, payloadSize);
                    ts.m_queuedData[0] = elem.substr(payloadSize);

                    // The rest of the payload space was consumed.
                    ts.m_queuedDataSize -= payloadSize;
                    payloadSize = 0;
                } else {
                    data += ts.m_queuedData.shift();
                    payloadSize -= elemLength;
                    ts.m_queuedDataSize -= elemLength;
                    ts.m_clientstats.msgWritten++;
                }
            }

        } else {
            // Shortcut: use the whole buffer, increase the message sent count by the length of the size queue,
            // and reset the buffer.
            data = ts.m_queuedData.join("");
            ts.m_clientstats.msgWritten += ts.m_queuedData.length;

            ts.m_queuedData = [];
            ts.m_queuedDataSize = 0;
        }

        // SOLACE_LOG_DEBUG("Sending a " + data.length + " byte payload");
        return data;
    }

    /**
     * @private
     */
    solace.TransportClientStats = function TransportClientStats() {
        this.bytesWritten = 0;
        this.msgWritten = 0;
    };

    /**
     * @private
     * @constructor
     * @name solace.TransportSessionBase
     * @param eventCB
     * @param rxDataCB
     * @param props
     */
    solace.TransportSessionBase = function TransportSessionBase(eventCB, rxDataCB, props) {
        this.m_connectTimeout = props.transportDowngradeTimeoutInMsecs;
        this.m_connectTimer = null;
        this.m_clientstats = new solace.TransportClientStats();
        this.m_dataCB = rxDataCB;
        this.m_eventCB = eventCB;
        this.m_state = 0;

        // Maximum amount of send data than can be queued
        this.m_sendBufferMaxSize = props.sendBufferMaxSize;
        // Maximum payload chunk size in web transport
        this.m_maxPayloadBytes = props.maxWebPayload;

        // Queue to hold data to be sent to the appliance when we get back a
        // data token
        this.m_queuedData = [];

        // Number of bytes of queued data
        this.m_queuedDataSize = 0;

        // Remember if we have to send an event when there is room in the queue
        this.m_alertOnDequeue = false;


        var self = this;

        this.createConnectTimeout = function() {
            if (this.m_connectTimeout > 0) {
                this.m_connectTimer = setTimeout(function() {
                    self.connectTimerExpiry();
                }, this.m_connectTimeout);
            }
        };

        this.cancelConnectTimeout = function() {
            if (this.m_connectTimer) {
                clearTimeout(this.m_connectTimer);
                this.m_connectTimer = null;
            }
        };

        this.connectTimerExpiry = function() { /* override me */ };

        this.getClientStats = function() {
            return this.m_clientstats;
        };
    };

    /**
     * @private
     * @constructor
     * @name solace.WebSocketTransportSession
     * @param url
     * @param eventCB
     * @param rxDataCB
     * @param props
     */
    solace.WebSocketTransportSession = function WebSocketTransportSession(url, eventCB, rxDataCB, props) {
        solace.TransportSessionBase.apply(this, [eventCB, rxDataCB, props]);

        function adaptURL(url) {
            var v = url.match(/(ws|http)(s?:\/\/.+)/);
            return "ws" + v[2];
        }

        this.m_streamInputReadState = new StreamPacketReadState();
        this.m_url = adaptURL(url);
        this.m_webSocket = null;
        this.m_sessionId = null;

        this.m_bufferedAmountQueryIntervalInMsecs = props.bufferedAmountQueryIntervalInMsecs;
        this.m_bufferedAmountQueryTimer = null;
        this.m_bufferedAmountQueryIntervalDelayMultiplier = 1;

        // override
        this.connectTimerExpiry = function() {
            SOLACE_LOG_INFO("WebSocket transport connect timeout");
            this.state = 5;
            this.m_eventCB(
                new solace.TransportSessionEvent(
                    solace.TransportSessionEventCode.CONNECTION_ERROR,
                    "timeout",
                    null
                )
            );
        };
    };

    /**
     * @private
     * @param event {CloseEvent}
     */
    solace.WebSocketTransportSession.prototype.onClose = function(event) {
        SOLACE_LOG_ERROR("WebSocket transport connection is closed" + ((event.reason)?(": " + event.reason):""));
        this.m_state = 5;
        this.m_eventCB(
            new solace.TransportSessionEvent(
                solace.TransportSessionEventCode.CONNECTION_ERROR,
                "Connection closed" + ((event.reason)?(": " + event.reason):""),
                null
            )
        );
    };

    /**
     * @private
     */
    solace.WebSocketTransportSession.prototype.onConnect = function() {
        //this.cancelConnectTimeout();
        
        // Send the event to the application letting it know that the session is up
        this.m_eventCB(
            new solace.TransportSessionEvent(
                solace.TransportSessionEventCode.UP_NOTICE,
                "Connected",
                0,
                this.m_sessionId));

    };

    /**
     * @private
     * @param event {ErrorEvent}
     */
    solace.WebSocketTransportSession.prototype.onError = function(event) {
        SOLACE_LOG_ERROR("WebSocket transport connection error");
        this.m_state = 5;
        this.m_eventCB(
            new solace.TransportSessionEvent(
                solace.TransportSessionEventCode.CONNECTION_ERROR,
                "Connection error",
                null
            )
        );
    };

    /**
     * @private
     * @param event {MessageEvent}
     */
    solace.WebSocketTransportSession.prototype.onData = function(data) {
        this.cancelConnectTimeout();

        var inputState = this.m_streamInputReadState;
        inputState.enqueue(data);

        var smfheader;
        var repeat = true;
        while(repeat) {

            repeat = false;

            switch(inputState.PacketReadState) {

                case PacketReadState.SMF_NEW:
                    smfheader = solace.smf.Codec.parseSmfAt(inputState.getBuffer(), inputState.position(), true);
                    if (smfheader) {
                        inputState.PacketReadState = PacketReadState.SMF_HEADER_READ;
                        inputState.TopSmfHeader = smfheader;
                        repeat = true;
                    }
                    else if (solace.smf.Codec.isSmfHeaderAvailable(inputState.getBuffer(), inputState.position()) &&
                                (!solace.smf.Codec.isSmfHeaderValid(inputState.getBuffer(), inputState.position()))) {
                        SOLACE_LOG_ERROR("Couldn't decode message due to invalid smf header, dump first 64 bytes (or fewer) of buffer content:\n" +
                                solace.StringUtil.formatDumpBytes(inputState.getBuffer().substring(inputState.position(), 64), true, 0));

                        var error_info = "Error parsing incoming message - invalid SMF header detected";
                        this.m_state = 5;
                        this.m_eventCB(
                            new solace.TransportSessionEvent(
                                solace.TransportSessionEventCode.PARSE_FAILURE,
                                error_info,
                                solace.ErrorSubcode.PROTOCOL_ERROR
                            )
                        );
                        return; // throw away all we have for now
                    }

                    break;

                case PacketReadState.SMF_HEADER_READ:
                    smfheader = inputState.TopSmfHeader;
                    var requiredBytes = smfheader.m_headerLength + smfheader.m_payloadLength;
                    var remainingBytes = inputState.remaining();
                    if (this.m_dataCB && (remainingBytes >= requiredBytes)) {
                        // SOLACE_LOG_DEBUG("Reading payload of " + requiredBytes);
                        this.m_dataCB(inputState.getBuffer().substr(inputState.position(), requiredBytes));
                        // advance pointer by bytes consumed
                        inputState.advanceBuffer(requiredBytes);
                        inputState.PacketReadState = PacketReadState.SMF_NEW;

                        // If there's no data left, don't repeat.
                        repeat = (remainingBytes > requiredBytes);
                    }
                    break;

            }

        }// end while(repeat)
    };

    /**
     * @private
     */
    solace.WebSocketTransportSession.prototype.connect = function() {
        var context = this;
        if (this.m_state !== 0) {
            return 4;
        }
        if (! this.m_url) {
            SOLACE_LOG_ERROR("Cannot connect to null URL");
            return 5;
        }
        try {
            this.m_webSocket = new solace.WebSocketConnection(
                this.m_url,
                function()          { context.onConnect();      },
                function(data)      { context.onData(data);     },
                function(error)     { context.onError(error);   },
                function(error)     { context.onClose(error);   }
            );
            this.m_webSocket.binaryType = "arraybuffer";
        } catch (createError) {
            SOLACE_LOG_ERROR("Could not create WebSocketConnection: " + createError.message);
            this.m_state = 5;
            return 5;
        }

        this.createConnectTimeout();
        
        try {
            this.m_webSocket.connect();
            this.m_state = 2;
            return 0;
        } catch (connError) {
            SOLACE_LOG_ERROR("Error connecting: " + connError.message);
            this.m_state = 5;
            this.cancelConnectTimeout();
            //re-throw exception to propagate error message to application
            throw connError;
        }
    };

    /**
     * @private
     * @param data
     */
    solace.WebSocketTransportSession.prototype.send = function(data, force) {
        if (this.m_state !== 2) {
            return 4;
        }

        // Check to see if we already have queued data
        if (this.m_queuedData.length > 0) {
            return this.enqueueData(data, force);
        }

        // Check if we need to chop up the payload
        var bytesAllowed = this.m_maxPayloadBytes - this.getBufferedAmount();
        if (bytesAllowed <= 0) {
            //SOLACE_LOG_INFO("$$ send enqueue byteAllowed:" + bytesAllowed);
            return this.enqueueData(data, force);
        }

        var remainder = null;
        if (data.length > bytesAllowed) {
            remainder = data.substr(bytesAllowed);
            data = data.substr(0, bytesAllowed);

            // If no space for remainder, return FAIL without sending anything.
            if (!allowEnqueue(this, remainder.length)) {
                return enqueue_fail_no_space(this);
            }

            //SOLACE_LOG_DEBUG("$$ send dataChunk:" + data.length + ", remainderChunk:" + remainder.length);
        }

        this.m_webSocket.send(data);
        this.m_clientstats.bytesWritten += data.length;

        if (remainder) {
            // The message was partially sent. The message written count will be incremented
            // when its last bytes go out.
            return this.enqueueData(remainder, true);
        } else {
            // The whole message was sent.
            this.m_clientstats.msgWritten++;
            return 0;
        }
    };

    /**
     * @private
     */
    solace.WebSocketTransportSession.prototype.getBufferedAmount = function() {
        if (this.m_webSocket) {
            return this.m_webSocket.getBufferedAmount();
        }
    };

        /**
     * Push data onto the pending send queue as long as it doesn't violate
     * the max stored message size
     */
    solace.WebSocketTransportSession.prototype.enqueueData = function(data, forceAllowEnqueue) {
        var dataLen = data.length;
        if (forceAllowEnqueue || allowEnqueue(this, dataLen)) {
            this.m_queuedDataSize += dataLen;
            this.m_queuedData.push(data);
            //SOLACE_LOG_DEBUG("$$ enqueud data: " + dataLen + ", queue depth: " + this.m_queuedDataSize);
        }
        else {
            return enqueue_fail_no_space(this);
        }

        if (!this.m_bufferedAmountQueryTimer) {
            this.scheduleQuery();
        }
        return 0;
    };

    /**
     * @private
     */
    solace.WebSocketTransportSession.prototype.scheduleQuery = function() {
         if (this.m_queuedDataSize > 0 && this.m_bufferedAmountQueryIntervalInMsecs > 0) {
            // schedule timer
            this.cancelQuery();
            var self = this;
            if (this.m_bufferedAmountQueryIntervalDelayMultiplier > 1) {
				SOLACE_LOG_INFO("$$ schedule bufferedAmount query timer in " +
					(this.m_bufferedAmountQueryIntervalInMsecs*this.m_bufferedAmountQueryIntervalDelayMultiplier) + " ms");
			}
            this.m_bufferedAmountQueryTimer = setTimeout(function() {
                try {
                    self.cancelQuery();
                    self.sendQueuedData();
                } catch (e) {
                    SOLACE_LOG_ERROR("Error occurred in sendQueuedData: " + e.message);
                    SOLACE_LOG_ERROR("Stack: " + e.stack);
                }
            }, this.m_bufferedAmountQueryIntervalInMsecs*this.m_bufferedAmountQueryIntervalDelayMultiplier);
        }
    };

    solace.WebSocketTransportSession.prototype.cancelQuery = function() {
        if (this.m_bufferedAmountQueryTimer) {
            clearTimeout(this.m_bufferedAmountQueryTimer);
            this.m_bufferedAmountQueryTimer = null;
        }
    };

    /**
     * @private
     * Check if there is any data waiting to be sent to the appliance.
     * If there is, send it.
     */
    solace.WebSocketTransportSession.prototype.sendQueuedData = function() {
        if (this.m_queuedDataSize === 0) {
            return;
        }

        var data = getQueuedDataToSend(this);
        if (data.length > 0) {
            this.m_clientstats.bytesWritten += data.length;
            this.m_webSocket.send(data);
            //SOLACE_LOG_INFO("$$ send queued data:" + data.length);
        }

        this.scheduleQuery();

        if (this.m_alertOnDequeue && this.m_queuedDataSize < this.m_sendBufferMaxSize) {
            this.m_alertOnDequeue = false;
            this.m_eventCB(new solace.TransportSessionEvent(solace.TransportSessionEventCode.CAN_ACCEPT_DATA,
                                                            "", 0, this.m_sessionId));
        }

    };


    /**
     * @private
     */
    solace.WebSocketTransportSession.prototype.destroy = function() {
        // We can destroy (and get a notice) even if the socket is freshly created.
        // But this will only work once.
        if (this.m_state === 0 && !this.m_webSocket) {
            // nothing to do.
            return 0;
        }

        this.m_webSocket.destroy();
        if (this.m_connectTimer) {
            clearTimeout(this.m_connectTimer);
            this.m_connectTimer = null;
        }
        this.cancelQuery();

        this.m_webSocket = null;
        this.m_queuedData             = [];
        this.m_queuedDataSize         = 0;
        this.m_alertOnDequeue         = false;
        this.m_bufferedAmountQueryIntervalDelayMultiplier = 1;
        
        this.m_state = 0;

        if (this.m_eventCB) {
            var self = this;
            // Fire this *almost* instantly, but follow the HTTP
            // transport pattern by guaranteeing an async callback.
            setTimeout(function() {
                // This callback fires later...maybe the callback was cleared somehow.
                if (self.m_eventCB) {
                    self.m_eventCB(
                        new solace.TransportSessionEvent(
                            solace.TransportSessionEventCode.DESTROYED_NOTICE,
                            "Session is destroyed",
                            0,
                            self.m_sessionId
                        )
                    );
                }
                // Release references to other components
                self.m_dataCB = null;
                self.m_eventCB = null;
            }, 0);
        }

        return 0;
    };

    /** ===========================================================================
     * HttpTransportSession :
     *
     * This contains all data and code required to maintain HTTP transport sessions
     * with Solace appliances
     * ============================================================================
     */
    solace.HTTPTransportSession = function HTTPTransportSession(baseUrl, eventCB, rxDataCB, props){
        solace.TransportSessionBase.apply(this, [eventCB, rxDataCB, props]);

        function adaptURL(url) {
            var v = url.match(/.+?(s?:\/\/.+)/);
            return "http" + v[1];
        }

        // Set to true if we have the data token that we need for sending data to the appliance
        this.m_haveToken = true;

        // Maximum payload chunk size in web transport
        this.m_confMaxWebPayload = props.maxWebPayload;
        this.m_maxPayloadBytes = 0;

        // Timer that will keep track of the destroy time
        this.m_destroyTimer = null;
        this.m_destroyTimeout = props.connectTimeoutInMsecs;

        // The URL used for create messages
        this.m_createUrl = adaptURL(baseUrl);

        // The URL used for all other messages - it will have the router tag appended
        // after the session has been created
        this.m_applianceUrl = this.m_createUrl;

        // Send data connection (instantiated after session is created)
        this.m_httpSendConn = null;

        // Receive data connection (instantiated after session is created)
        this.m_httpReceiveConn = null;

        // Data Token SMF header - this is preformatted for performance
        // It will be set after session is created
        this.m_smfDataTokenTSHeader = null;

        // Router Tag - a string that will be added to HTTP request URLs
        this.m_routerTag = "";

        // Session ID - 8-byte identifier that will associate this client
        // with client resources on the appliance
        this.m_sid = null;

        // Incoming channel readstate
        this.m_streamInputReadState = new StreamPacketReadState();

        if (props.transportProtocol === null) {
            throw new solace.OperationError("transportProtocol is null", solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE);
        }
        this.m_transportProtocol = props.transportProtocol;
        this.m_useBinaryTransport = false;
        this.m_useStreamingTransport = false;

        this.m_useBinaryTransport = (props.transportProtocol !== solace.TransportProtocol.HTTP_BASE64);
        this.m_useStreamingTransport = (props.transportProtocol === solace.TransportProtocol.HTTP_BINARY_STREAMING);

        if (props.transportContentType === null) {
            throw new solace.OperationError("transportContentType is null", solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE);
        }
        this.m_contentType = props.transportContentType;

        // overrides
        this.connectTimerExpiry = function() {
             SOLACE_LOG_INFO("Http transport connect timeout");
            this.destroyCleanup(true, "Timeout during connection create", solace.ErrorSubcode.INTERNAL_CONNECTION_ERROR);
        };
    };

    solace.HTTPTransportSession.prototype.getSessionIdForLogging = function() {
        var msg = (this.m_sid)?solace.Util.formatHexString(this.m_sid):"";
        return " (sessionId=" + msg + ")";
    };

    solace.HTTPTransportSession.prototype.updateMaxWebPayload = function() {
        // 22 Bytes of TransportSMF wrapping overhead
        var tr_less_encapsmf = this.m_confMaxWebPayload - 22;
        // Base64 has a 4:3 expansion
        this.m_maxPayloadBytes = this.m_useBinaryTransport ? tr_less_encapsmf : Math.floor(tr_less_encapsmf * 0.75);
    };

    /**
     * Connect transport session to appliance
     */
    solace.HTTPTransportSession.prototype.connect = function(){

        // Check that we we are in an acceptable state for connection
        if (this.m_state !== 0) {
            return 4;
        }

        this.connectInternal();
        return 0;
    };

    solace.HTTPTransportSession.prototype.connectInternal = function() {
        // Create the XHR to talk to the appliance
        var myThis = this;
        try {
            this.m_createConn = new solace.HttpConnection(
                this.m_createUrl,
                !(this.m_useBinaryTransport),
                false,
                function(rc, data){
                    myThis.handleCreateResponse(rc, data);
                },
                function(rc, data){
                    myThis.handleCreateConnFailure(rc, data);
                },
                this.m_contentType
            );
        } catch (e) {
            SOLACE_LOG_ERROR("Failed to create connection to appliance: " + e.message);
            return 5;
        }
        if (typeof(this.m_createConn) === 'undefined' || this.m_createConn === null) {
            SOLACE_LOG_ERROR("Failed to create connection to appliance");
            return 5;
        }

        // Get an SMF transport session create message
        var createMsg = solace.TsSmf.genTsCreateHeader();

        if (this.m_state === 1) {
            // already connecting (this is likely a retry with Base64 encoding)
            SOLACE_LOG_DEBUG("Connect attempt while in WAITING_FOR_CREATE (retry)");
        } else {
            this.createConnectTimeout();

            // Set the current state
            this.m_state  = 1;

            this.m_eventCB(new solace.TransportSessionEvent(solace.TransportSessionEventCode.CONNECTING,
                                                            "Connection in progress",
                                                            0, 0));
        }

        // Send the create message to the appliance.  When the response is received, the
        // handleCreateResponse method will be called
        try {
            this.m_createConn.send(createMsg);
        } catch (connError) {
            SOLACE_LOG_ERROR("Error connecting: " + connError.message);
            this.m_state = 5;
            this.cancelConnectTimeout();
            //re-throw exception to propagate error message to application
            throw connError;
        }
    };

    /**
     * Destroy transport session to appliance
     */
    solace.HTTPTransportSession.prototype.destroy = function(immediate, msg, subCode){
        SOLACE_LOG_INFO("Destroy transport session when in state " + this.m_state + this.getSessionIdForLogging());
        if (this.m_state === 4 ||
            this.m_state === 0) {
            // Nothing to do
            return 0;
        }

        if (this.m_state === 5 ||
                this.m_state === 1) {
            // The connections are in an unreliable state - we will just
            // kill our local object and let the appliance clean itself up with its inactivity timer
            SOLACE_LOG_INFO("The connection is in unreliable state, close transport" + this.getSessionIdForLogging());
            this.destroyCleanup(true, msg, subCode, true);
            return 0;
        }

        if (immediate || this.m_haveToken) {
            SOLACE_LOG_INFO("Destroy transport session immediately" + this.getSessionIdForLogging());
            // Set the current state
            this.m_state  = 4;

            // Abort any current requests for this session
            if (this.m_httpSendConn !== null) {
                this.m_httpSendConn.abort();
            }
            if (this.m_httpReceiveConn !== null) {
                this.m_httpReceiveConn.abort();
            }

            // Start a timer
            var myThis = this;
            this.m_destroyTimer = setTimeout(function(){
                    myThis.destroyTimerExpiry();
                }, this.m_destroyTimeout);

            // Send the destroy message to the appliance.  When the response is received, the
            // handleCreateResponse method will be called
            if (this.m_httpSendConn !== null) {
                // Get an SMF transport session destroy message
                var destroyMsg = solace.TsSmf.genTsDestroyHeader(this.m_sid);

                SOLACE_LOG_INFO("destroy message: " + solace.Convert.strToHexArray(destroyMsg) + this.getSessionIdForLogging());
                this.m_httpSendConn.send(destroyMsg);
            }
        }
        else {
            SOLACE_LOG_INFO("Destroy pending" + this.getSessionIdForLogging());
            // Simply set the pending destroy state so that
            // we will issue the destroy request later
            this.m_state  = 3;

        }

        return 0;

    };

    /**
     * Send data over the connection - this requires a send token
     * @param {String} data
     * @return OK or NO_SPACE
     */
    solace.HTTPTransportSession.prototype.send = function(data, forceAllowEnqueue){
        //SOLACE_LOG_DEBUG("HttpTransportSession:send " + data.length + " bytes, tx_queued:" + this.m_queuedDataSize);
        if (this.m_state !== 2) {
            return 4;
        }

        // Check to see if we already have queued data
        if ((this.m_queuedData.length > 0) || (!this.m_haveToken)) {
            return this.enqueueData(data, forceAllowEnqueue);
        }

        // Check if we need to chop up the payload
        var remainder = null;
        if (data.length > this.m_maxPayloadBytes) {
            remainder = data.substr(this.m_maxPayloadBytes);
            data = data.substr(0, this.m_maxPayloadBytes);

            // If no space for remainder, return FAIL without sending anything.
            if (!allowEnqueue(this, remainder.length)) {
                return enqueue_fail_no_space(this);
            }

            //SOLACE_LOG_DEBUG("$$ send dataChunk:" + data.length + ", remainderChunk:" + remainder.length);
        }
        
        // We have the token, so send the data
        this.m_haveToken = false;

        var transportPacketLen = this.m_smfDataTSHeaderParts[0].length + 4 + this.m_smfDataTSHeaderParts[1].length + data.length;

        this.m_httpSendConn.send(this.m_smfDataTSHeaderParts[0] +
                                 solace.Convert.int32ToStr(transportPacketLen) +
                                 this.m_smfDataTSHeaderParts[1] +
                                 data);
        this.m_clientstats.bytesWritten += data.length;

        if (remainder) {
            // The message was partially sent. The message written count will be incremented
            // when its last bytes go out.
            return this.enqueueData(remainder);
        } else {
            // The whole message was sent.
            this.m_clientstats.msgWritten++;
            return 0;
        }
    };


    /**
     * Push data onto the pending send queue as long as it doesn't violate
     * the max stored message size
     */
    solace.HTTPTransportSession.prototype.enqueueData = function(data, forceAllowEnqueue) {

        var dataLen = data.length;

        //SOLACE_LOG_DEBUG("enqueuing data: " + data.length + ", queue depth: " + this.m_queuedDataSize);
        if (forceAllowEnqueue || allowEnqueue(this, dataLen)) {
            this.m_queuedDataSize += dataLen;
            this.m_queuedData.push(data);
        }
        else {
            return enqueue_fail_no_space(this);
        }

        return 0;
    };


    /**
     * Set the data in the preformatted headers.  The headers are set up this way
     * for performance reasons
     */
    solace.HTTPTransportSession.prototype.initPreformattedHeaders = function(sid) {

        // m_smfDataTSHeaderParts is a two entry array - one part before the total length
        // and the other after.  The total length is not know until actual data is sent
        this.m_smfDataTSHeaderParts = solace.TsSmf.genTsDataMsgHeaderParts(sid);

        // m_smfDataTokenTSHeader is a single header that all data-token messages require
        if (this.m_useStreamingTransport) {
            this.m_smfDataTokenTSHeader = solace.TsSmf.genTsDataStreamTokenMsg(sid);
        } else {
            this.m_smfDataTokenTSHeader = solace.TsSmf.genTsDataTokenMsg(sid);
        }

    };

    /**
     * Check if there is any data waiting to be sent to the appliance.
     * If there is, send it.
     */
    solace.HTTPTransportSession.prototype.sendQueuedData = function() {

        if (this.m_queuedDataSize === 0) {
            if (this.m_state === 3) {
                this.destroy(false);
            }
            return;
        }

        this.m_haveToken = false;
        var data = getQueuedDataToSend(this);
        var transportPacketLen = this.m_smfDataTSHeaderParts[0].length + 4 + this.m_smfDataTSHeaderParts[1].length + data.length;

        this.m_httpSendConn.send(this.m_smfDataTSHeaderParts[0] +
                                 solace.Convert.int32ToStr(transportPacketLen) +
                                 this.m_smfDataTSHeaderParts[1] +
                                 data);
        this.m_clientstats.bytesWritten += data.length;

        if (this.m_alertOnDequeue) {
            this.m_alertOnDequeue = false;
            this.m_eventCB(new solace.TransportSessionEvent(solace.TransportSessionEventCode.CAN_ACCEPT_DATA,
                                                            "", 0, this.m_sid));
        }



    };

// Internal Callbacks

// Called when a create response message has been received
    solace.HTTPTransportSession.prototype.handleCreateResponse = function(tsRc, response){
        if (this.m_state === 4 ||
              this.m_state === 0) {
            SOLACE_LOG_DEBUG("Received create response on a destroyed transport session, ignore" + this.getSessionIdForLogging());
            return;
        }

        // Was: stop the connect timer. We don't do that in this transport now.
        // We wait for the login response.

        // We know whether we're using Base64 or not, so update our max payload size.
        this.updateMaxWebPayload();

        if (tsRc !== 0) {
            SOLACE_LOG_INFO("Received create response with return code " + solace.TransportReturnCodeDescription[tsRc]);
            if (tsRc === 3) {
                this.destroyCleanup(true, "Received data decode error on create session response", solace.ErrorSubcode.DATA_DECODE_ERROR);
            }
            else {
                this.destroyCleanup(true, "Failed to handle create session response", solace.ErrorSubcode.INTERNAL_CONNECTION_ERROR);
            }
            return;
        }

        if (response.length === 0) {
            return; // null read indicating end of stream
        }

        // Parse the Transport Session SMF
        var parsedResponse = solace.smf.Codec.decodeCompoundMessage(response, 0);

        if (!parsedResponse) {
            SOLACE_LOG_ERROR("Could not parse create response as SMF. Destroying transport" + this.getSessionIdForLogging());
            this.destroyCleanup(true, "Failed to parse create response message", solace.ErrorSubcode.INTERNAL_CONNECTION_ERROR);
            return;
        }

        var smfresponse = parsedResponse.getResponse();
        if (smfresponse.ResponseCode !== 200) {
            this.destroyCleanup(true, "Transport create request failed: response code - " + smfresponse.ResponseCode +
                    ", " + smfresponse.ResponseCode, solace.ErrorSubcode.INTERNAL_CONNECTION_ERROR);
            return;
        }

        this.m_createConn.abort();
        this.m_createConn = null;
        this.m_state        = 2;
        this.m_sid          = parsedResponse.SessionId;
        this.m_routerTag    = parsedResponse.RouterTag;

        // Trim any parameters off the create url before using it for the routerUrl
        this.m_applianceUrl    = this.m_createUrl.replace(/\?.*/, "");
        if (this.m_routerTag !== "") {
            this.m_applianceUrl = this.m_applianceUrl + this.m_routerTag;
        }

        this.initPreformattedHeaders(this.m_sid);


        // Create the two connections to the appliance
        // By now, getXhrObj() should not throw any exception inside solace.HttpConnection constructor
        var myThis = this;
        this.m_httpSendConn = new solace.HttpConnection(this.m_applianceUrl, !(this.m_useBinaryTransport), false,
                                                        function(rc, data){ // RxData callback
                                                            myThis.handleRxDataToken(rc, data);
                                                        },
                                                        function(rc, data){ // connection close or error callback
                                                            myThis.handleConnFailure(rc, data);
                                                        },
                                                        this.m_contentType);

        this.m_httpReceiveConn = new solace.HttpConnection(this.m_applianceUrl, !(this.m_useBinaryTransport), this.m_useStreamingTransport,
                                                           function(rc, data){ // RxData callback
                                                               myThis.handleRxData(rc, data);
                                                           },
                                                           function(rc,data){  // connection close or error callback
                                                               myThis.handleConnFailure(rc, data);
                                                           },
                                                           this.m_contentType);

        // Give the appliance the data token so that it will be able to send data
        this.m_httpReceiveConn.send(this.m_smfDataTokenTSHeader);

        // Send the event to the application letting it know that the session is up
        this.m_eventCB(new solace.TransportSessionEvent(solace.TransportSessionEventCode.UP_NOTICE,
                                                        smfresponse.ResponseString,
                                                        0, parsedResponse.SessionId));
    };


// Called when receiving a destroy response
    solace.HTTPTransportSession.prototype.handleDestroyResponse = function(response) {
        SOLACE_LOG_INFO("Handle destroy response" + this.getSessionIdForLogging());
        // First, stop the timer
        this.cancelDestroyTimeout();

        var respString = response.getResponse().ResponseString || "";
        respString += " Handled Destroy Response addressed to session " + solace.Util.formatHexString(response.SessionId) + ", on session " + solace.Util.formatHexString(this.m_sid);

        this.destroyCleanup(true, respString);
    };


// Called when data is received on the connection
    solace.HTTPTransportSession.prototype.handleRxData = function(tsRc, data){
        if (this.m_httpReceiveConn === null) {
            if (this.m_state === 0) {
                SOLACE_LOG_INFO("Transport session is down, ignore received data" + this.getSessionIdForLogging());
            }
            else {
                SOLACE_LOG_ERROR("Transport session is not in working state, state: " + this.m_state + this.getSessionIdForLogging());
            }
            return;
        }

        // Any data received on the receive channel cancels the connect timeout.
        this.cancelConnectTimeout();

        this.m_httpReceiveConn.recStat("GotData");
        if (tsRc !== 0) {
            return this.handleRxError(tsRc, data);
        }

        if (data.length === 0) {
            // IF end of stream, send a new token
            this.m_streamInputReadState.PacketReadState = PacketReadState.SMF_NEW;
            SOLACE_LOG_DEBUG("Send write token to appliance");
            this.m_httpReceiveConn.send(this.m_smfDataTokenTSHeader);
        } else {
            // Data to process
            var inputState = this.m_streamInputReadState;
            inputState.enqueue(data);
            var madeprogress = true;
            while(madeprogress) {
                switch (inputState.PacketReadState) {
                    case PacketReadState.SMF_NEW:
                        // nothing parsed yet: we need to read an input SMF header
                        var smfheader = solace.smf.Codec.parseSmfAt(inputState.getBuffer(), inputState.position());
                        if (smfheader) {
                            // advance pointer by bytes consumed
                            inputState.advanceBuffer(smfheader.m_headerLength);
                            inputState.TopSmfHeader = smfheader;
                            inputState.TotalPayloadToRead = smfheader.m_payloadLength;
                            inputState.PacketReadState = PacketReadState.SMF_HEADER_READ;
                        } else if (solace.smf.Codec.isSmfHeaderAvailable(inputState.getBuffer(), inputState.position()) &&
                                    (!solace.smf.Codec.isSmfHeaderValid(inputState.getBuffer(), inputState.position()))) {
                            SOLACE_LOG_ERROR("Couldn't decode message due to invalid smf header, dump first 64 bytes (or fewer) of buffer content:\n" +
                                    solace.StringUtil.formatDumpBytes(inputState.getBuffer().substring(inputState.position(), 64), true, 0));

                            var error_info = "Error parsing incoming message - invalid SMF header detected";
                            this.m_state = 5;
                            this.m_eventCB(
                                new solace.TransportSessionEvent(
                                    solace.TransportSessionEventCode.PARSE_FAILURE,
                                    error_info,
                                    solace.ErrorSubcode.PROTOCOL_ERROR
                                )
                            );
                            return; // throw away all we have for now
                        } else {
                            madeprogress = false;
                        }
                        break;
                    case PacketReadState.SMF_HEADER_READ:
                        // we have parsed the TOP SMF header, can we now read the Transport SMF chunk?
                        var tsmsg = solace.smf.Codec.TsSmf.parseTsSmfHdrAt(inputState.getBuffer(), inputState.position(), inputState.TopSmfHeader);
                        if (tsmsg) {
                            // advance pointer by bytes consumed, and reduce TOREAD by tshdr length
                            inputState.advanceBuffer(tsmsg.TsHeaderLength);
                            inputState.TransportMessageCurrent = tsmsg;
                            inputState.TotalPayloadToRead -= tsmsg.TsHeaderLength;
                            inputState.PacketReadState = PacketReadState.TRANSPORT_HEADER_READ;
                        } else {
                            madeprogress = false;
                        }
                        break;
                    case PacketReadState.TRANSPORT_HEADER_READ:
                        var loctsmsg = inputState.TransportMessageCurrent;
                        switch(inputState.TransportMessageCurrent.MessageType) {
                            case 3:
                                this.handleDestroyResponse(loctsmsg);
                                return;
                            case 4:
                                if (loctsmsg.SessionId !== this.m_sid) {
                                    // The appliance may have given us an error code, if so, include in the error message.
                                    var smf_err_response = loctsmsg.getResponse();
                                    var response_err_str = (smf_err_response) ?
                                            (" (" + smf_err_response.ResponseCode + " " + smf_err_response.ResponseString + ")" ) :
                                            "";

                                    SOLACE_LOG_DEBUG("HandleRxData Bad Session ID received in message.  Expected: " + solace.Convert.strToByteArray(this.m_sid) +
                                              ", Received: " + solace.Convert.strToByteArray(loctsmsg.SessionId) + response_err_str);
                                    SOLACE_LOG_DEBUG("First 64 bytes (or fewer) of message: " + solace.Convert.strToByteArray(data.substr(0, 64)));

                                    this.m_state = 5;
                                    this.m_eventCB(new solace.TransportSessionEvent(solace.TransportSessionEventCode.PARSE_FAILURE,
                                        "Session ID mismatch in data message, expected: " + solace.Util.formatHexString(this.m_sid) + ", got: " +
                                                solace.Util.formatHexString(loctsmsg.SessionId) + ", " + response_err_str,
                                        solace.ErrorSubcode.PROTOCOL_ERROR, this.m_sid));
                                    return;
                                }

                                // pass-through encapsulated data to parent
                                if (inputState.remaining() > 0) {
                                    var passthru_bytes = Math.min(inputState.remaining(), inputState.TotalPayloadToRead);
                                    var passthru_str = inputState.getBuffer().substr(inputState.position(), passthru_bytes);
                                    inputState.advanceBuffer(passthru_bytes);
                                    inputState.TotalPayloadToRead -= passthru_bytes;
                                    this.m_dataCB(passthru_str);

                                    if (inputState.TotalPayloadToRead === 0) {
                                        inputState.PacketReadState = PacketReadState.SMF_NEW;
                                        // Prevent spurious parse iteration
                                        if (inputState.remaining() === 0) {
                                            break;
                                        }
                                    }
                                } else {
                                    madeprogress = false;
                                }
                            break;
                            default:
                                // Unexpected message type
                                throw(new solace.TransportError("Unexpected message type (" +
                                                                loctsmsg.MessageType + ") on ReceiveData connection", 0));
                        }
                        break;
                }
            } // end while(madeprogress)
        } // end have data to process
    };

// Called when data is received on the httpDataSend
    solace.HTTPTransportSession.prototype.handleRxDataToken = function(tsRc, data){

        if (tsRc !== 0) {
            return this.handleRxError(tsRc, data);
        }

        if (data.length === 0) {
            return; // handle End of Stream
        }

        var parsedResponse = solace.smf.Codec.decodeCompoundMessage(data, 0);
        if (!parsedResponse) {
            if (this.m_state !== 4) {
                this.m_state = 5;
                this.m_eventCB(new solace.TransportSessionEvent(solace.TransportSessionEventCode.PARSE_FAILURE,
                                                                "Failed to parse received data message",
                                                                solace.ErrorSubcode.PROTOCOL_ERROR, this.m_sid));
            } else {
                this.destroyCleanup(true);
            }
            return;
        }

        if (parsedResponse.MessageType === 3) {
            this.handleDestroyResponse(parsedResponse);
            return;
        }

        if (parsedResponse.SessionId !== this.m_sid) {
            // The appliance may have given us an error code, if so, include in the error message.
            var smf_err_response = parsedResponse.getResponse();
            var response_err_str = (smf_err_response) ?
                    (" (" + smf_err_response.ResponseCode + " " + smf_err_response.ResponseString + ")" ) :
                    "";

            SOLACE_LOG_DEBUG("HandleRxDataToken Bad SID received in message.  Expected: " + solace.Convert.strToByteArray(this.m_sid) +
                      ", Received: " + solace.Convert.strToByteArray(parsedResponse.SessionId) + response_err_str);
            SOLACE_LOG_DEBUG("First 64 bytes (or fewer) of message: " + solace.Convert.strToByteArray(data.substr(0, 64)));

            if (this.m_state !== 4) {
                this.m_state = 5;
                this.m_eventCB(new solace.TransportSessionEvent(solace.TransportSessionEventCode.PARSE_FAILURE,
                    "Session ID mismatch in response message, expected: " + solace.Util.formatHexString(this.m_sid) + ", got: " + solace.Util.formatHexString(parsedResponse.SessionId) + ", " + response_err_str,
                    solace.ErrorSubcode.PROTOCOL_ERROR, this.m_sid));
            }
            else {
                this.destroyCleanup(true, "Session ID mismatch in response message", solace.ErrorSubcode.PROTOCOL_ERROR);
            }
            return;
        }

        if (parsedResponse.MessageType === 5 ||
            parsedResponse.MessageType === 6) {
            this.m_haveToken = true;
            this.m_httpSendConn.recStat("GotToken");
            //this.m_eventCB(new solace.TransportSessionEvent(solace.TransportSessionEventCode.NOTIFY_GOT_TOKEN, "", null, null));
            this.sendQueuedData();
        } else {
            // Unexpected message type
            throw(new solace.TransportError("Unexpected message type (" +
                                            parsedResponse.MessageType + ") on SendData connection", 0));
        }

    };


    solace.HTTPTransportSession.prototype.handleRxError = function(tsRc, data){
        SOLACE_LOG_INFO("handleRxError, transport return code " + solace.TransportReturnCodeDescription[tsRc]);
        this.m_state = 5;
        if (tsRc === 3) {
            this.m_eventCB(new solace.TransportSessionEvent(solace.TransportSessionEventCode.DATA_DECODE_ERROR,
                                                            "Received data decode error",
                                                            solace.ErrorSubcode.DATA_DECODE_ERROR, this.m_sid));
        }
        else {
            this.m_eventCB(new solace.TransportSessionEvent(solace.TransportSessionEventCode.CONNECTION_ERROR,
                                                            "Connection error",
                                                            solace.ErrorSubcode.INTERNAL_CONNECTION_ERROR, this.m_sid));
        }

    };


// Called when there is an error on a connection or the connection is aborted
    solace.HTTPTransportSession.prototype.handleConnFailure = function(status, msg){
        SOLACE_LOG_INFO("Connection failure (" + msg + ") while in state " + this.m_state + this.getSessionIdForLogging());
        if (this.m_state === 2) {
            this.m_state = 5;
            // Need to tear the session down
            this.m_eventCB(new solace.TransportSessionEvent(solace.TransportSessionEventCode.CONNECTION_ERROR,
                                                            "Connection error: " + msg,
                                                            solace.ErrorSubcode.INTERNAL_CONNECTION_ERROR, this.m_sid));
        }
        else if (this.m_state === 0 ||
                this.m_state === 4) {
            SOLACE_LOG_DEBUG("Received HTTP status " + status + this.getSessionIdForLogging());
            this.destroyCleanup(true, "Connection error: " + msg, solace.ErrorSubcode.INTERNAL_CONNECTION_ERROR);
        }
        else {
            this.destroyCleanup(true, "Connection error: " + msg, solace.ErrorSubcode.INTERNAL_CONNECTION_ERROR);
        }
    };


// Called when there is an error on a connection for a session create request
    solace.HTTPTransportSession.prototype.handleCreateConnFailure = function(status, msg){
        if (this.m_state === 0) {
            return;
        }

        SOLACE_LOG_INFO("Connection create failure (" + msg + ") while in state " + this.m_state);
                this.destroyCleanup(true, "Connection create failure: " + msg, solace.ErrorSubcode.INTERNAL_CONNECTION_ERROR);
    };


// Called when the destroy timer expires
    solace.HTTPTransportSession.prototype.destroyTimerExpiry = function(){
        this.destroyCleanup(true, "Destroy request timeout");
    };

    solace.HTTPTransportSession.prototype.cancelDestroyTimeout = function() {
        if (this.m_destroyTimer) {
            clearTimeout(this.m_destroyTimer);
            this.m_destroyTimer = null;
        }
    };

    solace.HTTPTransportSession.prototype.destroyCleanup = function(sendEvent, infoStr, subCode, asyncSendEvent) {
        SOLACE_LOG_INFO("Destroy cleanup" + this.getSessionIdForLogging());

        // Abort any current requests for this session

        // Set state for connection teardown.
        this.m_state  = 4;

        if (this.m_createConn) {
            this.m_createConn.abort();
        }
        if (this.m_httpSendConn) {
            this.m_httpSendConn.abort();
        }
        if (this.m_httpReceiveConn) {
            this.m_httpReceiveConn.abort();
        }

        // Clear most internal state
        this.m_createUrl              = null;
        this.m_applianceUrl           = null;
        this.m_createConn             = null;
        this.m_httpSendConn           = null;
        this.m_httpReceiveConn        = null;
        this.m_smfDataTokenTSHeader   = null;
        this.m_routerTag              = "";
        this.m_queuedData             = [];
        this.m_queuedDataSize         = 0;
        this.m_alertOnDequeue         = false;

        // Clear timers.
        this.cancelDestroyTimeout();
        this.cancelConnectTimeout();

        // Set final state
        this.m_state                  = 0;

        // Send the event to the application letting it know that the session is down
        if (asyncSendEvent) {
            var self = this;
            setTimeout(function() {
                if (sendEvent) {
                    if (typeof(subCode) === 'undefined') {
                        subCode = 0;
                    }
                    // This callback fires later...maybe the callback was cleared somehow.
                    if (self.m_eventCB) {
                        self.m_eventCB(new solace.TransportSessionEvent(solace.TransportSessionEventCode.DESTROYED_NOTICE,
                        (typeof infoStr === "undefined" || infoStr === null || infoStr === "")?"Session is destroyed":infoStr,
                            subCode, self.m_sid)
                        );
                    }
                }

                // release reference to smf client object
                self.m_dataCB = null;
                // release reference to session object
                self.m_eventCB = null;
            }, 0);
        }
        else {
            if (sendEvent) {
                if (typeof(subCode) === 'undefined') {
                   subCode = 0;
                }

                if (this.m_eventCB) {
                    this.m_eventCB(new solace.TransportSessionEvent(solace.TransportSessionEventCode.DESTROYED_NOTICE,
                            (typeof infoStr === "undefined" || infoStr === null || infoStr === "")?"Session is destroyed":infoStr,
                        subCode, this.m_sid));
                }
            }

            // release reference to smf client object
            this.m_dataCB = null;
            // release reference to session object
            this.m_eventCB = null;
        }

    };

    solace.HTTPTransportSession.prototype.getInfoStr = function() {
        var str = "HttpTransportSession; sid=" +
            solace.Util.formatHexString(this.m_sid) +
            "; routerTag=" + this.m_routerTag;
        return str;
    };

    function SMFClient(props, rxSmfCB, rxMessageErrorCB, rxTransportEventCB, session) {

        this.m_incomingBuffer = ""; // init incoming SMF buffer
        this.m_rxSmfCB = rxSmfCB; // callback for parsed msg
        this.m_rxMessageErrorCB = rxMessageErrorCB; // invalid UH, etc.
        this.m_rxTransportEventCB = rxTransportEventCB;
        this.m_correlationCounter = 0;
        this.m_session = session;

        var self = this;

        switch (props.transportProtocol) {
            case solace.TransportProtocol.HTTP_BASE64:
            case solace.TransportProtocol.HTTP_BINARY:
            case solace.TransportProtocol.HTTP_BINARY_STREAMING:
                this.m_transportSession = new solace.HTTPTransportSession(
                    props.url,
                    function(tr_event)  { self.handleTransportEvent(tr_event); },
                    function(data)      { self.rxDataCB(data); },
                    props);
                break;
            case solace.TransportProtocol.WS_BINARY:
                this.m_transportSession = new solace.WebSocketTransportSession(
                    props.url,
                    function(tr_event)  { self.handleTransportEvent(tr_event); },
                    function(data)      { self.rxDataCB(data); },
                    props
                );
                break;
            default:
                SOLACE_LOG_ERROR("Unrecognized TransportProtocol: " + props.transportProtocol);
                throw new solace.OperationError(
                    "No transport session provider for scheme: " + props.transportProtocol,
                    solace.ErrorSubcode.INTERNAL_CONNECTION_ERROR,
                    props.transportProtocol
                );
        }

    }

    SMFClient.prototype = {
        handleTransportEvent: function handleTransportEvent(tr_event) {
            if (this.m_rxTransportEventCB) {
                this.m_rxTransportEventCB(tr_event);
            }
        },

        rxDataCB: function rxData(data) {
            /*
             Handles multiple SMF messages in input, as well as defragmenting partial SMF messages.
             The state we keep is in this.m_incomingBuffer.
             */
            if (this.m_session) {
                SOLACE_LOG_DEBUG("Reset KeepAliveCounter");
                // each incoming data chunk resets KA counter
                this.m_session.resetKeepAliveCounter();
            }
            if (this.m_incomingBuffer.length === 0) {
                // optimization: set reference (cheaper than append)
                this.m_incomingBuffer = data;
            } else {
                // append to existing data
                this.m_incomingBuffer += data;
                if (this.m_incomingBuffer.length > 80000000) {
                    // sanity check
                    // 80 megabytes - lost SMF framing: may never complete
                    SOLACE_LOG_ERROR("First 64 bytes (or fewer) of incoming buffer: \n" + solace.StringUtil.formatDumpBytes(this.m_incomingBuffer.substr(0, 64), true, 0));
                    this.m_rxMessageErrorCB("Buffer overflow (length: " + this.m_incomingBuffer.length + ")");
                    this.m_incomingBuffer = "";
                }
            }
            var pos = 0;
            while ((pos < this.m_incomingBuffer.length) &&
                    (solace.smf.Codec.isSmfAvailable(this.m_incomingBuffer, pos))) {
                SOLACE_LOG_DEBUG("SMFClient incoming buffer has a full SMF message");
                var incomingMsg = solace.smf.Codec.decodeCompoundMessage(this.m_incomingBuffer, pos);
                if (incomingMsg && incomingMsg.getSmfHeader()) {
                    pos += incomingMsg.getSmfHeader().m_messageLength;
                    this.m_rxSmfCB(incomingMsg); // hand over to core API callback
                } else {
                    // couldn't decode! Lost SMF framing.
                    var sessionId = null;
                    if (this.m_session) {
                        sessionId = this.m_session.m_sessionId;
                    }
                    SOLACE_LOG_ERROR("SMFClient.rxData(): couldn't decode message (sessionId=" +
                            ((sessionId)?solace.Util.formatHexString(sessionId):"N/A") +
                            "), dumping buffer content:\n" +
                            solace.StringUtil.formatDumpBytes(this.m_incomingBuffer.substring(pos), true, 0));
                    this.m_incomingBuffer = "";
                    var err_info = "Error parsing incoming SMF at position " + pos;
                    this.m_rxMessageErrorCB(err_info);
                    return; // throw away all we have for now
                }
            }
            if (pos < this.m_incomingBuffer.length) {
                SOLACE_LOG_DEBUG("SMFClient partial message remaining: keep it in incoming buffer");
                if (solace.smf.Codec.isSmfHeaderAvailable(this.m_incomingBuffer, pos) &&
                        (!solace.smf.Codec.isSmfHeaderValid(this.m_incomingBuffer, pos))) {
                    SOLACE_LOG_ERROR("SMFClient.rxData(): couldn't decode message due to invalid smf header, dump first 64 bytes (or fewer) of buffer content:\n" +
                           solace.StringUtil.formatDumpBytes(this.m_incomingBuffer.substring(pos, 64), true, 0));
                    this.m_incomingBuffer = "";
                    var error_info = "Error parsing incoming SMF at position " + pos + " - invalid SMF header detected";
                    this.m_rxMessageErrorCB(error_info);
                    return; // throw away all we have for now
                }
                // partial message remaining: keep it in incoming buffer
                var in_buf = this.m_incomingBuffer;
                this.m_incomingBuffer = in_buf.substr(pos, in_buf.length - pos);
            } else {
                SOLACE_LOG_DEBUG("SMFClient clear incoming buffer");
                // clear incoming buffer
                this.m_incomingBuffer = "";
            }
        },
        connect: function() {
            // pass-through to transport
            return this.m_transportSession.connect();
        },
        cancelConnectTimeout: function cancelConnectTimeout() {
            this.m_transportSession.cancelConnectTimeout();
        },
        destroy: function(immediate, msg, subCode) {
            // pass-through to transport
            return this.m_transportSession.destroy(immediate, msg, subCode);
        },
        send: function send(message, forceAllowEnqueue) {
            var content = solace.smf.Codec.encodeCompoundMessage(message);
            return this.m_transportSession.send(content, forceAllowEnqueue);
        },
        getTransportSession: function() {
            return this.m_transportSession;
        },
        getClientStats: function() {
            return this.m_transportSession.getClientStats();
        },
        getTransportSessionInfoStr: function() {
            return this.m_transportSession.getInfoStr();
        },
        nextCorrelationTag: function() {
            return ++this.m_correlationCounter;
        }
    };
    solace.SMFClient = SMFClient;



    function TransportProtocolHandler(transportProp) {
        var self = this;

        /**
         * @constructor
         * @param useSsl
         */
        function TSHState() {
            this.m_ssl = false;
            this.m_transportProtocol = TransportProtocolHandler.defaultTransportProtocol;
            this.m_transportFamily = solace.TransportFamily.HTTP;
            this.m_unsupportedRuntimeMessage = "not supported by this runtime: " +
                (window && window.navigator ? window.navigator.userAgent : "(unknown)");

            this.m_nextStateOnFail = null;

            this.m_name = "PARENT";

            this.shouldRetry = function shouldRetry() {
                return (this.m_nextStateOnFail !== null);
            };

            this.getTransportProtocol = function getTransportProtocol() {
                return this.m_transportProtocol;
            };

            this.getTransportFamily = function getTransportFamily() {
                return this.m_transportFamily;
            };

            this.handleConnectFailed = function handleConnectFailed(err) {
                if (this.m_nextStateOnFail) {
                    SOLACE_LOG_INFO("Connect failed (" + err + "), try next state.");
                    self.switchState(this.m_nextStateOnFail, err);
                } else {
                    SOLACE_LOG_WARN("Connect failed (" + err + "), no next state.");
                }
            };

            this.validateLegal = function() {
                // No-op
            };

            this.toString = function() {
                return this.m_transportProtocol + (this.m_ssl ? " (SSL)" : "");
            };

            this.setUseSsl = function(useSSL) {
                this.m_ssl = !! useSSL;
            };

            this.getUseSsl = function() {
                return this.m_ssl;
            };
        }

        /**
         * @constructor
         * @param useSsl
         */
        function StateBase64(useSsl) {
            this.setUseSsl(useSsl);

            this.m_transportProtocol = solace.TransportProtocol.HTTP_BASE64;
            this.m_transportFamily = this.getUseSsl() ? solace.TransportFamily.HTTPS : solace.TransportFamily.HTTP;

            this.m_nextStateOnFail = null;

            this.m_name = this.m_transportProtocol.toString();
        }
        StateBase64.prototype = new TSHState();

        /**
         * @constructor
         * @param useSsl
         */
        function StateBinary(useSsl) {
            this.setUseSsl(useSsl);

            this.m_transportProtocol = solace.TransportProtocol.HTTP_BINARY;
            this.m_transportFamily = this.getUseSsl() ? solace.TransportFamily.HTTPS : solace.TransportFamily.HTTP;

            this.m_nextStateOnFail = new StateBase64(useSsl);

            this.validateLegal = function() {
                if (! solace.HttpConnection.browserSupportsXhrBinary()) {
                    self.switchState(this.m_nextStateOnFail, this.m_unsupportedRuntimeMessage);
                }
            };
        }
        StateBinary.prototype = new TSHState();

        /**
         * @constructor
         * @param useSsl
         */
        function StateStreamingAndBinary(useSsl) {
            this.setUseSsl(useSsl);

            this.m_transportProtocol = solace.TransportProtocol.HTTP_BINARY_STREAMING;
            this.m_transportFamily = this.getUseSsl() ? solace.TransportFamily.HTTPS : solace.TransportFamily.HTTP;

            this.m_nextStateOnFail = new StateBinary(useSsl);

            this.m_name = this.m_transportProtocol.toString();

            this.validateLegal = function() {
                if (! (solace.HttpConnection.browserSupportsStreamingResponse() && solace.HttpConnection.browserSupportsXhrBinary())) {
                    self.switchState(this.m_nextStateOnFail, this.m_unsupportedRuntimeMessage);
                }
            };
        }
        StateStreamingAndBinary.prototype = new TSHState();

        /**
         * @constructor
         * @extends TSHState
         * @param useSsl
         */
        function StateWebSocketBinary(useSsl) {
            this.setUseSsl(useSsl);

            this.m_transportProtocol = solace.TransportProtocol.WS_BINARY;
            this.m_transportFamily = this.getUseSsl() ? solace.TransportFamily.WSS : solace.TransportFamily.WS;

            this.m_nextStateOnFail = new StateStreamingAndBinary(useSsl);

            this.m_name = this.m_transportProtocol.toString();

            this.validateLegal = function() {
                if (! solace.WebSocketConnection.browserSupportsBinaryWebSockets(useSsl)) {
                    self.switchState(this.m_nextStateOnFail, this.m_unsupportedRuntimeMessage);
                }
            };
        }
        StateWebSocketBinary.prototype = new TSHState();


        // TransportProtocolHandler impl ==================================================================
        this.getTransportProtocol = function getTransportProtocol() {
            return self.m_state.getTransportProtocol();
        };

        this.getTransportFamily = function getTransportFamily() {
            return self.m_state.getTransportFamily();
        };

        this.handleConnectFailed = function(err) {
            self.m_state.handleConnectFailed(err);
        };

        this.shouldRetry = function() {
            return self.m_state.shouldRetry();
        };

        this.useSsl = function() {
            return self.m_state.getUseSsl();
        };

        this.toString = function() {
            return self.m_state.toString();
        };

        this.switchState = function switchState(newState, reason) {
            SOLACE_LOG_INFO("Switching " + self.m_state.toString() + " => " + newState + " (" + reason + ")");
            self.m_state = newState;
            newState.validateLegal();
        };

        this.validateProperties = function() {

            // Validate URL scheme
            var urlParts = (transportProp.url || "").split('://');
            if (! (urlParts.length && TransportProtocolHandler.validSchemes.indexOf(urlParts[0]) >= 0)) {
                throw new solace.OperationError(
                    "Invalid parameter for url: Only [" +
                        TransportProtocolHandler.validSchemes.join(', ') +
                        "] URL schemes are supported",
                    solace.ErrorSubcode.PARAMETER_OUT_OF_RANGE);
            }
        };

        // Lookup appropriate transport negotiation state
        var lutTransportProtocols = {};
        lutTransportProtocols[solace.TransportProtocol.HTTP_BINARY_STREAMING] = StateStreamingAndBinary;
        lutTransportProtocols[solace.TransportProtocol.HTTP_BINARY] = StateBinary;
        lutTransportProtocols[solace.TransportProtocol.HTTP_BASE64] = StateBase64;
        lutTransportProtocols[solace.TransportProtocol.WS_BINARY] = StateWebSocketBinary;

        this.setProtocol = function(protocol) {
            var useSSL;
            var TransportConstructor;

            useSSL = (transportProp.url.toLowerCase().indexOf("s://") > 1);
            TransportConstructor = lutTransportProtocols[protocol];
            this.m_state = new TransportConstructor(useSSL);
            this.m_state.validateLegal();
        };

        this.setProtocol(transportProp.transportProtocol || TransportProtocolHandler.defaultProtocol);
    }

    /**
     * @const
     * @type {solace.TransportProtocol}
     */
    TransportProtocolHandler.defaultProtocol = solace.TransportProtocol.WS_BINARY;

    /**
     * @const
     * @type {Array}
     */
    TransportProtocolHandler.validSchemes = ['http', 'https', 'ws', 'wss'];

    solace.TransportProtocolHandler = TransportProtocolHandler;

}(solace));
//
//
//
/*global solace:true,window,global,escape,unescape,WebSocket,ArrayBuffer,Uint8Array,WebSocket,QUnit,SOLACE_LOG_FATAL,SOLACE_LOG_ERROR,SOLACE_LOG_WARN,SOLACE_LOG_INFO,SOLACE_LOG_DEBUG,SOLACE_LOG_TRACE */

(function(solace) {

    function WebSocketConnection(url, onConnectCB, rxDataCb, connectionErrorCb, onCloseCB) {

        this.url = url;
        this.socket = null;

        this.rxDataCb           = rxDataCb;
        this.connectionErrorCb  = connectionErrorCb;
        this.onCloseCB          = onCloseCB;
        this.onConnectCB        = onConnectCB;
    }
    
    WebSocketConnection.prototype.onOpen = function(event) {
        this.connCTS = true;
        this.onConnectCB();
    };

    WebSocketConnection.prototype.onMessage = function(event) {
        var string = this.arrayBufferToString(event.data);
        this.rxDataCb(string);
    };

    WebSocketConnection.prototype.onClose = function(event) {
        this.onCloseCB(event);
    };

    WebSocketConnection.prototype.onError = function(event) {
        this.connectionErrorCb(event);
    };

    WebSocketConnection.prototype.connect = function() {
        if (this.socket) {
            this.connectionErrorCb("Socket already connected");
        }

        var context = this;
        try {
            this.socket = new WebSocket(this.url, 'smf.solacesystems.com');
            this.socket.binaryType  = "arraybuffer";
            this.socket.onopen      = function(event)       { context.onOpen(event);            };
            this.socket.onmessage   = function(event)       { context.onMessage(event);   };
            this.socket.onclose     = function(event)       { context.onClose(event);           };
            this.socket.onerror     = function(event)       { context.onError(event);           };
        } catch (error) {
            throw new solace.TransportError("Could not create WebSocket: " + error.message, solace.ErrorSubcode.CREATE_WEBSOCKET_FAILED);
        }
    };

    WebSocketConnection.prototype.send = function(data) {
        if (this.socket) {
            this.socket.send(this.stringToArrayBuffer(data));
        }
    };

    WebSocketConnection.prototype.destroy = function() {
        if (this.socket) {
            this.socket.close();
            this.socket.onopen      = null;
            this.socket.onmessage   = null;
            this.socket.onclose     = null;
            this.socket.onerror     = null;
            this.socket             = null;
        }
        this.rxDataCb           = null;
        this.connectionErrorCb  = null;
        this.onCloseCB          = null;
        this.onConnectCB        = null;
    };

    WebSocketConnection.prototype.getBufferedAmount = function() {
        if (this.socket) {
            return this.socket.bufferedAmount;
        }
        return 0;
    };

    // Tuned from
    // http://jsperf.com/arraybuffer-to-string-apply-performance
    WebSocketConnection.prototype.arrayBufferToString = function(ab) {
        var len = ab.byteLength;
        var u8 = new Uint8Array(ab);
        if (len < 32768) {
            return String.fromCharCode.apply(null, u8);
        } else {
            var k = 0,
                r = "";
            while (k < len) {
                // slice is clamped, inclusive of startIndex, exclusive of lastIndex
                r += String.fromCharCode.apply(null, u8.subarray(k, k + 32768));
                k += 32768;
            }
            return r;
        }
    };

    WebSocketConnection.prototype.stringToArrayBuffer = function(string) {
        var u8 = new Uint8Array(new ArrayBuffer(string.length));
        for (var i = 0; i < string.length; i++) {
            u8[i] = string.charCodeAt(i);
        }
        return u8.buffer;
    };

    WebSocketConnection.browserSupportsBinaryWebSockets = function(useSsl) {
        SOLACE_LOG_DEBUG("websocket browserSupportBinaryCheck - if WebSocket, ArrayBuffer and Uint8Array are supported");
        if (
            (typeof WebSocket === "undefined") ||
            (typeof ArrayBuffer === "undefined") ||
            (typeof Uint8Array === "undefined")
        ){
            SOLACE_LOG_DEBUG("websocket browserSupportBinaryCheck: false - some required classes not supported");
            return false;
        }

        // ideal:
        SOLACE_LOG_DEBUG("websocket browserSupportBinaryCheck - if WebSocket supports binaryType");
        if ('binaryType' in WebSocket.prototype) {
            SOLACE_LOG_DEBUG("websocket browserSupportBinaryCheck: true - WebSocket supports binaryType");
            return true;
        }
        else {
            // however:
            // binaryType not present on WebSocket.prototype in WebKit
            // https://www.w3.org/Bugs/Public/show_bug.cgi?id=13984
            // https://bugs.webkit.org/show_bug.cgi?id=67335
            // therefore we instantiate a websocket to a way-bogus URL :(
            var check = !!(window.WebSocket && (new WebSocket(useSsl?'wss://.':'ws://.')).binaryType);
            if (check) {
                SOLACE_LOG_DEBUG("websocket browserSupportBinaryCheck: true - WebSocket supports binaryType");
            }
            else {
                SOLACE_LOG_DEBUG("websocket browserSupportBinaryCheck: false - WebSocket does not support binaryType");
            }
            return check;
        }
    };

    solace.WebSocketConnection = WebSocketConnection;

}(solace));
