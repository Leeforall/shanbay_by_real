var oauth = ShanbayOauth.initPage();

function logout() {
    oauth.clearToken();
}

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
    switch (message.type) {
        case 'request':
            $.getJSON(message.url, message.data).success(function(data) {
                callback({
                    data: data,
                    success: true
                });
            }).error(function() {
                callback({
                    data: null,
                    success: false
                });
            });
            break;
        case 'chinese':
            makeRequest(message.method, message.url, message.data, callback);
            break;
        case 'authorize':
            oauth.authorize(callback);
            break;
        default:

    }

})

//http://fanyi.youdao.com/openapi.do?keyfrom=<keyfrom>&key=<key>&type=data&doctype=json&version=1.1&q


$(function() {
    todayStatus();
    setTimeout(function() {
        checked = false;
        todayStatus();
    }, 2 * 60 * 60 * 1000); //每3h提醒一次

});

function todayStatus() {
    console.log('set BadgeTexts');
    var status_api = 'http://www.shanbay.com/api/v1/bdc/stats/today/';
    makeRequest('GET', status_api, null, handleStatus);
}

function handleStatus(obj) {
    if (obj.data) {
        var data = obj.data;
        var m = data.num_left;
        chrome.browserAction.setBadgeText({
            text: m + ''
        });
    } else {
        chrome.browserAction.setBadgeText({
            text: ''
        });
    }
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
        callback({
            data: obj
        });
    };
    xhr.open(method, url, true);
    xhr.send(data);
}