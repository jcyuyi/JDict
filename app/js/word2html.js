module.exports = {
  process: function (w) {
      var result = wordToHtml(w);
      return result;
  }
};

function wordToHtml(word) {
    var result = $("<div class=\"result list-group-item\"></div>");
    // add header
    var header = $("<h3 class=\"result-heading list-group-item-heading\"></h3>");
    header.append("<span>" +  word.jp + "</span>");
    // add copy
    var copy_btn = $("<button class=\"btn-copy btn btn-sm btn-default\"> Copy </button> ");
    result.append(copy_btn);
    copy_btn.on("click", function() {
        copyToClipboard(word);
    });
    // add tips
    var tips = word.kana + word.tone + "  " + word.tip;
    header.append("<span class=\"result-tips list-group-item-text\">" + tips + "</span>");
    result.append(header);
    // add definations
    var defs_html = defsToHtml(word.defs);
    result.append(defs_html);
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

function defsToHtml(defs) {
    var result = $("<div class=\"defs\"></div>")
    //defs [{ explain: "abc", sentences: {jp:"jp", cn:"cn"} }]
    if (defs  === undefined) {
        return result;
    }
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
