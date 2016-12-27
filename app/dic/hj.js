module.exports = {
  search: function (text, callback) {
      $.get("http://dict.hjenglish.com/jp/jc/" + text, null, function(data) {
          var words = $(data).find(".main_container .jp_word_comment");
          var result_words = [];
          words.each(function(index) {
              var word = processWord($(this));
              result_words.push(word);
          });
          callback(result_words);
      }, "html");
  }
};

function processWord(w) {
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
