function onLoad() {
    // retrieves the seach box element
    var searchBox = document.getElementById("word");
    // registers the key press handler
    searchBox.onkeypress = function(event) {
        // in case the key it's enter
        if (event.keyCode == "13") {
            // creates a request with the search box value
            if (isChinese(searchBox.value))
                searchChinese(searchBox.value);
            else
            //if(isEnglish(searchBox.value))
                searchWord(searchBox.value);
        }
    }
    document.getElementById("querybutton").onclick = function() {
        if (isChinese(searchBox.value))
            searchChinese(searchBox.value);
        else
        //if(isEnglish(searchBox.value))
            searchWord(searchBox.value);
    };
}


var bg = chrome.extension.getBackgroundPage();
var gWord;

function searchWord(keyword) {
    console.log('search Word');
    $("#retention").addClass('hidden');
    clearPrevious();
    removeDiv('opt_text');
    removeDiv('opt_text');
    removeDiv('opt_text');
    removeDiv('opt_text');

    waitForQuery();

    if (bg.oauth.token_valid()) {
        var word_api = bg.oauth.conf.api_root + '/bdc/search/?access_token=' + bg.oauth.access_token() + '&word=' + keyword;
        makeRequest('GET', word_api, null, handleWord);
    } else {
        var word_api = bg.oauth.conf.api_root + '/bdc/search/?word=' + keyword;
        makeRequest('GET', word_api, null, handleWord);
    }
}

function searchChinese(keyword) {
    console.log('search Chinese');
    $("#retention").addClass('hidden');
    clearPrevious();
    removeDiv('opt_text');
    removeDiv('opt_text');
    removeDiv('opt_text');
    removeDiv('opt_text');

    waitForQuery();
    var youdao_api = 'http://fanyi.youdao.com/openapi.do?keyfrom=leeforall&key=468366660&type=data&doctype=json&version=1.1&q=' + encodeURIComponent(keyword);
    makeRequest('GET', youdao_api, null, hendleChinese);
}


function hendleChinese(data) {
    console.log(data);
}


function todayStatus() {
    console.log('Today Status');
    var status_api = 'http://www.shanbay.com/api/v1/bdc/stats/today/';
    makeRequest('GET', status_api, null, handleStatus);
}

function handleStatus(obj) {
    if (obj.data) {
        data = obj.data;
        document.getElementById("today").innerHTML = data.num_today;
        document.getElementById("new").innerHTML = data.num_new;
        document.getElementById("left").innerHTML = data.num_left;
        document.getElementById("checkin").innerHTML = data.num_checkin_days;
        $("#statustable").removeClass("hidden");
    } else {
        var login = 'http://www.shanbay.com/accounts/login/';
        document.getElementById("login").onclick = function() {
            goURL(login);
        };
        $("#login").removeClass("hidden");
    }
}

function forgetWord() {
    console.log('forget Word');
    $('#loading-forget').removeClass('hidden');
    $('#forget').addClass('hidden');
    var forget_api = bg.oauth.conf.api_root + '/bdc/learning/' + gWord.learning_id + '?access_token=' + bg.oauth.access_token();
    var formData = new FormData();
    formData.append('access_token', bg.oauth.access_token());　　
    formData.append('retention', 1);
    makeRequest('PUT', forget_api, formData, handleForget);
}

function handleForget(obj) {
    var data = obj.data
    if (data.id) {
        var other = document.getElementById('other');
        other.innerHTML = '<span class="highlight">' + gWord.content + '</span> 已加入复习计划<br>';
        $('#loading-forget').addClass('hidden');
    } else {
        var other = document.getElementById('other');
        other.innerHTML = '<span class="highlight">' + gWord.content + '</span> 加入复习失败<br>';
        $('#forget').removeClass('hidden');
        $('#loading-forget').addClass('hidden');
    }
}

function removeDiv(divname) {
    var div = document.getElementById(divname);
    if (div == null) return;
    div.parentNode.removeChild(div);
}

function clearPrevious() {
    var w = document.getElementById('content');
    var c = document.getElementById('definition');
    var other = document.getElementById('other');
    var i = document.getElementById('btns');
    w.innerHTML = '';
    c.innerHTML = '';
    other.innerHTML = '';
    i.innerHTML = '';
}

/*
<script type="text/x-dot-template" id="template">
            {{? it.error }}
            <div class="error-msg">{{= it.error }}</div>
            {{?? }}
            {{ if ( it.phonetic ) { }}
            <div class="phonetic"><span class="text">{{= it.phonetic }}</span><span class="action"><i data-action="copy">复制</i></span></div>
            {{ } }}
            {{ if ( it.detailed ) { }}
            <div class="detailed"><span class="text">{{= it.detailed }}</span><span class="action"><i data-action="copy">复制</i></span></div>
            {{ } }}
            <div class="result"><span class="text">{{= it.result }}</span><span class="action"><i data-action="copy">复制</i><i data-action="read">朗读</i></span></div>
            <div class="result-from">via <a href="{{= it.linkToResult }}" target="_blank">{{= it.api.name }}</a></div>
            {{? }}
        </script>
*/

/*
API key：468366660
keyfrom：leeforall
*/

/*	
en_definitions   array     返回英文释义的数组
en_definition    object    英文释义
cn_definition    object    中文释义
id               int       单词的id
retention        int       单词的熟悉度
definition       string    中文释义
target_retention int       用户自定义的目标学习度
learning_id      long      learing id，如果未返回，在表明用户没学过该单词
content          string    查询的单词
pronunciation    string    单词的音标
*/
function handleWord(obj) {
    gWord = word = obj.data;
    if (!isEmpty(word)) { //添加单词
        var w = document.getElementById('content');
        var c = document.getElementById('definition');
        var other = document.getElementById('other');
        var i = document.getElementById('btns');

        var t = document.createElement("span"); //单词本体
        t.setAttribute("class", "wd");
        t.appendChild(document.createTextNode(word.content));
        w.appendChild(t);
        t = document.createElement("span"); //音标
        t.setAttribute("class", "prn");
        if (word.pron != '')
            t.innerHTML = '[' + word.pron + '] ';
        w.appendChild(t);

        if (word.audio) {
            t = document.createElement("img"); //播放读音
            t.setAttribute("src", "/resources/images/SpeakerOffA20.png");
            t.setAttribute("title", "发音");
            var t1 = t;
            t = document.createElement("a");
            t.setAttribute("href", "#");
            t.setAttribute("onclick", "play_single_sound();");
            t.appendChild(t1);
            t1 = t;
            t = document.createElement("span");
            t.appendChild(t1);
            w.appendChild(t);
            var audioElement = document.getElementById('sound');
            audioElement.removeAttribute('src');
            audioElement.setAttribute('src', word.audio);
        }

        t = document.createElement("span");
        t.innerHTML = word.definition.replace(/[\r\n]/g, "<br />"); //fixme
        t.setAttribute("class", "content");
        c.appendChild(t);


        var bars = $('.progress .bar');
        console.log(bars.length);
        console.log(word.retention);
        console.log(word.target_retention);
        index = 0;
        while (index < word.target_retention) {
            if (index <= word.retention) {
                $(bars[index]).addClass('bar-success')
            } else {
                $(bars[index]).addClass('bar-left')
            }
            index++;
        }
        $("#retention").removeClass('hidden');

        t = document.createElement("input");
        t.setAttribute('id', 'interactive');
        t.setAttribute('type', 'button');
        if (!word.learning_id) {
            t.onclick = function() {
                save(word)
            };
            t.setAttribute('value', '添加单词');
            t.setAttribute('title', '单击添加新词');
            i.appendChild(t);

        } else {
            t.onclick = function() {
                goURL('http://shanbay.com/review/learning/' + word.learning_id + '/');
            };
            t.setAttribute('value', '查看');
            t.setAttribute('title', '单击前往练习');
            var t1 = document.createElement('input');
            t1.setAttribute('type', 'button');
            t1.setAttribute('id', 'example');
            t1.setAttribute('value', '添加例句');
            t1.setAttribute('title', '为当前单词添加例句');
            var t2 = document.createElement('input');
            t2.setAttribute('type', 'button');
            t2.setAttribute('id', 'forget');
            t2.setAttribute('value', '我忘了');
            t2.setAttribute('title', '添加到复习列表');
            //t1.onclick=showExample;
            t2.addEventListener("click", forgetWord);
            var img = document.createElement('img');
            img.setAttribute('id', 'loading-forget');
            img.setAttribute('src', 'resources/images/loading-mask.gif');
            img.setAttribute('class', 'hidden');
            i.appendChild(t);
            i.appendChild(t1);
            i.appendChild(t2);
            i.appendChild(img);
            other.innerHTML = '已经学习过<span class="highlight">' + word.content + '</span><br>';
        }

        other.appendChild(document.createElement('br'));

        result = document.getElementById('result');

        $('#wait').addClass('hidden');
    } else { //找不到单词
        other = document.getElementById('other');
        c = document.getElementById('content');
        word = document.getElementsByName("word")[0].value; //damn
        c.innerHTML = "<span class='wd'>OOPS!</span>";
        other.innerHTML = '你查找的单词<span class="highlight">' + word + '</span> 没有找到<br>';
        $('#wait').addClass('hidden');
    }
}



function play_single_sound() {
    console.log('play sound');
    document.getElementById('sound').play();
    document.getElementById('word').focus();
}


function save(word) {}


function renderUser() {
    function callback(user) {
        console.log('Get User');
        var user_link = document.getElementById('home');
        user_link.href = 'http://www.shanbay.com/user/list/' + user.username;
        user_link.onclick = function() {
            chrome.tabs.create({
                url: this.href
            })
        };

        document.getElementById('logout').onclick = function() {
            bg.oauth.clearToken();
            delete bg.User;
            window.close();
        }

        var img = document.getElementById('avatar');
        img.src = user.avatar;

        var nickname = document.getElementById('nickname');
        nickname.innerText = user.nickname;
        bg.User = user;

        var loadingMask = document.getElementById("loading-mask");
        $("#home").removeClass("hidden");
        loadingMask.remove();
        todayStatus();
    }


    if (bg.User) {
        callback(bg.User);
        return;
    }

    if (bg.oauth.token_valid()) {
        var account_api = bg.oauth.conf.api_root + '/account/?access_token=' + bg.oauth.access_token();
        makeRequest('GET', account_api, null, callback);
    } else {
        chrome.runtime.sendMessage({
            type: 'authorize'
        }, function() {
            renderUser();
        })
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderUser();
    onLoad();
});