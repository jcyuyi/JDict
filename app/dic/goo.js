module.exports = {
  search: function (text, callback) {
      $.get("http://dictionary.goo.ne.jp/freewordsearcher.html?mode=1&kind=jn&MT=" + text, null, function(data) {
          var jp = $(data).find(".contents-wrap-b h1").text().replace(/ の意味/g, "").trim();
          var result_words = [];
          if (jp.length === 0) {
              callback(result_words)
              return;
          }
          var tip = $(data).find(".hinshi").text().trim();
          var defs = []; // {explain: , sentences: }
          $(data).find(".explanation").each(function(index){
              $(this).find(".text-indent").each(function(index){
                  var exp = $(this).text().trim();
                  defs.push({explain: exp, sentences: null});
              });
              if (defs.length === 0) {
                   $(this).find(".hinshi").remove();
                  var exp = $(this).text().trim();
                  defs.push({explain: exp, sentences: null});
              }
          });
          var word = {
              jp:jp,
              kana:'',
              tone:'',
              tip:tip,
              defs:defs
          };
          result_words = [word];
          callback(result_words);
      }, "html");
  }
};
