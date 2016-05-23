/**
 * This script contains a few functions taken from the Underscore.js 1.8.3
 * library, namely:
 * - _now
 * - _throttle
 * - _debounce
 *
 * For more information, please refer to http://underscorejs.org/
 */
// A (possibly faster) way to get the current timestamp as an integer.
var _now = Date.now || function(){
    return new Date().getTime();
};

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function _throttle(func, wait, options){
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};

    var later = function(){
        previous = options.leading === false ? 0 : _now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function(){
        var now = _now();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait){
            if (timeout){
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        }
        else if (!timeout && options.trailing !== false){
            timeout = setTimeout(later, remaining);
        }
    return result;
    };
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function _debounce(func, wait, immediate){
    var timeout, args, context, timestamp, result;

    var later = function(){
        var last = _now() - timestamp;

        if (last < wait && last >= 0){
            timeout = setTimeout(later, wait - last);
        }
        else {
            timeout = null;
            if (!immediate){
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };
    return function(){
        context = this;
        args = arguments;
        timestamp = _now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow){
            result = func.apply(context, args);
            context = args = null;
        }
        return result;
    };
}
