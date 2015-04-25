function isChinese(temp) {
    var re = /[^\u4e00-\u9fa5]/;
    if (re.test(temp)) return false;
    return true;
}

function isEnglish(temp) {
    var re = /[A-Za-z0-9 ]/g;
    if (re.test(temp)) return false;
    return true;
}


function isContainChinese(temp) {
    var cnt = 0;
    for (var i = 0; i < temp.length; i++) {
        if (isChinese(temp.charAt(i)))
            cnt++;
    }
    if (cnt > 5) return true;
    return false;
}

/*
Use XMLHttpRequest to request for data 
*/
function makeRequest(method, url, data, callback) {
    console.log('request url', url);
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var obj = JSON.parse(xhr.responseText)
        console.log(obj);
        callback(obj);
    };
    xhr.open(method, url, true);
    xhr.send(data);
}

/**
 * 检测对象是否是空对象(不包含任何可读属性)。
 * 方法既检测对象本身的属性，也检测从原型继承的属性(因此没有使hasOwnProperty)。
 */
function isEmpty(obj) {
    for (var name in obj) {
        return false;
    }
    return true;
};


function waitForQuery() {
    $('#wait').removeClass('hidden');
}

function goURL(url) {
    window.open(url);
    window.self.close();
}