// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const dic_goo = require('./dic/goo.js');
const dic_hj  = require('./dic/hj.js');
const w2h  = require('./js/word2html.js');

// result panel toggle
$('.panel-heading').click(function(){
    $(this).parent().find('.panel-body').toggle();
});

// side bar
$(".sidebar-list-item").on("click", function() {
    var item = $(this).text();
    sidebarClick(event, item);
});

function sidebarClick(evt, item) {
    var i, x, tablinks;
     x = document.getElementsByClassName("result-page");
     for (i = 0; i < x.length; i++) {
         x[i].style.display = "none";
     }
     tablinks = document.getElementsByClassName("sidebar-list-item");
     for (i = 0; i < x.length; i++) {
         tablinks[i].className = tablinks[i].className.replace(" sidebar-list-item-selected", "");
     }
     document.getElementById(item).style.display = "block";
     evt.currentTarget.className += " sidebar-list-item-selected";
}

// search input
$("#btn-search").on("click", function() {
    var word = $('#input-search-word').val();
    search(word);
});

$('#input-search-word').keypress(function(e){
      if(e.keyCode==13)
      $('#btn-search').click();
});


// ipc
const {ipcRenderer} = require('electron');
ipcRenderer.on('search-event', (event, arg) => {
    console.log(arg);
    $('#input-search-word').val(arg);
    search(arg);
});

function prepSearch() {
    $('.results').empty();
    $('.results-message').show()
    $('.results-message').html("<img class=\"loading-image\" src=\"./img/loading.svg\">Loding...");
}

// =========== Dic search ===========

var currentWords = []; // {'hj': [word], 'goo':[word] }

function search(text) {
    prepSearch()
    dic_hj.search(text, function(words) {
        currentWords['hj'] = words;
        showResult('hj');
    });
    dic_goo.search(text,function(words) {
        currentWords['goo'] = words;
        showResult('goo');
    });
}

function showResult(newType) {
    //#hj-message
    var c = "." + newType;
    var words = currentWords[newType]
    if (words === undefined) {
        return;
    }
    if (words.length == 0) {
        $(c + "-message").html("Not Found");
    } else {
        $(c + "-message").hide();
        var i = 0;
        // add to Home
        var result = w2h.process(words[0]);
        $("#Home " + c + "-results").append(result);
        // add to tab page
        words.forEach(function(word) {
            var result = w2h.process(word);
            $(".tab-page " + c + "-results").append(result);
        });
    }
}
