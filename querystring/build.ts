export default function(object) {
    if (Object.prototype.toString.call(object) !== '[object Object]') return ''

    var args = []
    for (var key in object) {
        destructure(key, object[key])
    }

    return args.join('&')

    function destructure(key, value) {
        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                destructure(key + '[' + i + ']', value[i])
            }
        }
        else if (Object.prototype.toString.call(value) === '[object Object]') {
            for (var j in value) {
                destructure(key + '[' + j + ']', value[j])
            }
        }
        else args.push(encodeURIComponent(key) + (value != null && value !== '' ? '=' + encodeURIComponent(value) : ''))
    }
}
