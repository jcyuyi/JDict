module.exports = {
  search: function (text, callback) {
      $.get("http://ejje.weblio.jp/content/" + text, null, function(data) {
          var jp = $(data).find("#h1Query").text();
          if (jp.length === 0) {
              callback(result_words)
              return;
          }
          var result_words = [];
          var exp = $(data).find(".summaryM .content-explanation").text().trim();
          var defs = []; // {explain: , sentences: }
          defs.push({explain: exp, sentences: null});
          var word = {
              jp:jp,
              kana:'',
              tone:'',
              tip:'',
              defs:defs
          };
          result_words = [word];
          callback(result_words);
      }, "html");
  }
};
