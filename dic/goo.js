module.exports = {
  search: function (text, callback) {
      $.get("http://dictionary.goo.ne.jp/freewordsearcher.html?mode=1&kind=jn&MT=" + text, null, function(data) {
          var jp = $(data).find(".contents-wrap-b h1").text().replace(/ の意味/g, "").trim();
          if (jp.length === 0) {
              callback(jp)
              return;
          }
          var tip = $(data).find(".hinshi").text().trim();
          var defs = []; // {explain: , sentences: }  
          $(data).find(".explanation .text-indent").each(function(index){
              var exp = $(this).text().trim();
              defs.push({explain: exp, sentences: null});
          });
          var word = {
              jp:jp,
              //kana:kana,
              //tone:tone,
              tip:tip,
              defs:defs
          };
          callback(word);
      }, "html");
  }
};
