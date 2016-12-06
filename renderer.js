// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// toggle
$('.panel-heading').click(function(){
    $(this).parent().find('.panel-body').toggle();
});

$("#btn-search").on("click", function() {
    var word = $('#input-search-word').val();
    search(word);
});

$('#input-search-word').keypress(function(e){
      if(e.keyCode==13)
      $('#btn-search').click();
});

const {ipcRenderer} = require('electron');
ipcRenderer.on('search-event', (event, arg) => {
    console.log(arg);
    $('#input-search-word').val(arg);
    search(arg);
});

const dic_goo = require('./dic/goo.js');

function prepSearch() {
    $('.results').empty();
    $('.results-message').show()
    $('.results-message').html("<img class=\"loading-image\" src=\"./img/loading.svg\">Loding...");
}

function search(word) {
    prepSearch()
    $.get("http://dict.hjenglish.com/jp/jc/" + word, null, function(data) {
        var words = $(data).find(".main_container .jp_word_comment");
        words.each(function(index) {
            var word = processWord($(this), 'hj');
            addWord(word, 'hj');
        });
        if (words.length == 0) {
            $('#hj-message').html("Not Found");
        }else {
            $('#hj-message').hide();
        }
    }, "html");
    dic_goo.search(word,function(w) {
        if (w.length == 0) {
            $('#goo-message').html("Not Found");
        }else {
            $('#goo-message').hide();
        }
        addWord(w, 'goo');
    });
}

function defsToString(defs) {
    var i,len
    var result = ""
    for (i = 0, len = defs.length; i < len; i++) {
        var def = defs[i];
        result += def.explain;
        result += "\n"
        if (def.sentences && def.sentences.length > 0) {
            var j,len2;
            var sentences = def.sentences;
            console.log(sentences.length);
            for (j = 0, len2 = sentences.length; j < len2; j++) {
                var s = sentences[j];
                console.log(sentences);
                result += s.jp + " / " + s.cn + "\n"
            }
        }
    }
    return result;
}

function copyToClipboard(word) {
    const {clipboard} = require('electron')
    var tips = "";
    if (word.kana) {
        tips += word.kana;
    }
    if (word.tone) {
        tips += word.tone;
    }
    if (word.tip) {
        tips += "  " + word.tip;
    }
    var defs = defsToString(word.defs)
    clipboard.writeText(word.jp + '\n' + tips + '\n' + defs)
}

function addWord(word, type) {
    if (type === 'hj') {
        var result = $("<div class=\"hj-result list-group-item\"></div>");
        // add header
        var header = $("<h3 class=\"hj-result-heading list-group-item-heading\"></h3>");
        header.append("<span>" +  word.jp + "</span>");
        // add tips
        var tips = word.kana + word.tone + "  " + word.tip;
        header.append("<span class=\"hj-result-tips list-group-item-text\">" + tips + "</span>");
        result.append(header);
        // add definations
        var defs_html = defsToHtml(word.defs);
        console.log(defs_html);
        result.append(defs_html);
        // add copy
        var copy_btn = $("<button class=\"btn-copy btn btn-sm btn-default\"> Copy </button> ");
        result.append(copy_btn);
        copy_btn.on("click", function() {
            copyToClipboard(word);
        });
        $('#hj-results').append(result);
    } else if (type === 'goo') {
        var result = $("<div class=\"goo-result list-group-item\"></div>");
        // header
        var header = $("<h3 class=\"goo-result-heading list-group-item-heading\"></h3>");
        header.append("<span>" +  word.jp + "</span>");
        // tip
        var tips =  word.tip;
        header.append("<span class=\"goo-result-tips list-group-item-text\">" + tips + "</span>");
        result.append(header);
        var defs_html = defsToHtml(word.defs);
        result.append(defs_html);
        // add copy
        var copy_btn = $("<button class=\"btn-copy btn btn-sm btn-default\"> Copy </button> ");
        result.append(copy_btn);
        copy_btn.on("click", function() {
            copyToClipboard(word);
        });
        $('#goo-results').append(result);
    }
}

function defsToHtml(defs) {
    var result = $("<div class=\"defs\"></div>")
    //defs [{ explain: "abc", sentences: {jp:"jp", cn:"cn"} }]
    var i,len
    for (i = 0, len = defs.length; i < len; i++) {
        var def = defs[i];
        result.append("<p class=\"def-explain\">" + def.explain + "</p>");
        if (def.sentences && def.sentences.length > 0) {
            var sents_html = sentencesToHtml(def.sentences);
            result.append(sents_html);
        }
    }
    return result;
}

function sentencesToHtml(sentences) {
    var result = $("<div class=\"sentences well well-sm\"></div>");
    var i,len
    for (i = 0, len = sentences.length; i < len; i++) {
        var s = sentences[i];
        var sentence = $("<p class=\"sentence\"></div>");
        sentence.append("<span class=\"sentence-jp\">" + s.jp + "</span>");
        sentence.append("<span class=\"sentence-divider\">" + " / " + "</span>");
        sentence.append("<span class=\"sentence-cn\">" + s.cn + "</span>");
        result.append(sentence)
    }
    return result;
}

function processWord(w, type) {
    if (type === 'hj') {
        var jp   = w.find(".jpword").text();
        var kana = w.find("span[id^='kana']").text();
        var tone = w.find(".tone_jp").text();
        var tip  = w.find(".tip_content_item.big_type").text();
        var defs = []; // {explain: , sentences: }
        // for every def:
        w.find(".jp_definition_com .flag").each(function(index){
            var divs = $(this).children();
            // get explain
            var explain = divs.first().text();
            // get sentences
            var sentences = []; // {jp:"",ch:""}
            if (divs.length >= 2) {
                var cmd_sent = divs.find(".cmd_sent");
                if (cmd_sent.length == 0) {
                    var sens = divs.last().html().split("<br>")
                    for (var i = 0; i < sens.length; i++) {
                        var sen_split = sens[i].replace(/<.*?>/g, "").replace(/GetTTSVoice\(.*?\);/g, "").split("/");
                        //console.log(sen_split)
                        var sen_jp = sen_split[0];
                        var sen_cn = sen_split[1];
                        if (sen_jp === undefined || sen_cn=== undefined) {
                            continue;
                        }
                        var sentence = { jp: sen_jp, cn: sen_cn };
                        sentences.push(sentence);
                    }
                }
                else {
                    cmd_sent.each(function(index) {
                        var sen_jp = $(this).find(".cmd_sent_en").text().replace(/GetTTSVoice\(.*?\);/g, "");
                        var sen_cn = $(this).find(".cmd_sent_cn").text();
                        var sentence = { jp: sen_jp, cn: sen_cn };
                        sentences.push(sentence);
                    });
                }
            }
            defs.push({explain: explain, sentences: sentences});
        });

        var word = {
            jp:jp,
            kana:kana,
            tone:tone,
            tip:tip,
            defs:defs
        };

        console.log(word);
        return word;
    }
}
