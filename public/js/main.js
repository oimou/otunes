/**
  iTunes APIから取得する関数
*/
var search = function(options) {

  // 検索条件のベースとなるオブジェクト
  var params = {
    lang: 'ja_jp',
    entry: 'music',
    media: 'music',
    country: 'JP',
  };

  // 検索ワード（複数の場合は、「+」で結合しておくこと）
  if (options && options.term) {
    params.term = options.term;
  }

  // 検索上限を指定する
  if (options && options.limit) {
    params.limit = options.limit;
  }

  // iTunes APIをコールする
  $.ajax({
    url: 'https://itunes.apple.com/search',
    method: 'GET',
    data: params,
    // dataTypeをjsonpにする必要があります
    dataType: 'jsonp',

    // 処理が成功したら、jsonが返却されます
    success: function(json) {
      showData(json, options);
    },

    error: function() {
      console.log('itunes api search error. ', arguments);
    },
  });
};


/**
  iTunes APIから取得したデータをテーブルに表示する
*/
var showData = function(json) {
  // UIへ表示する
  // デザインは適当ですが、こんな感じで表示できます。
  for (var i = 0, len = json.results.length; i < len; i++) {
    var result = json.results[i];
    var html = 'title:' + result.trackName;
    html += 'artist:' + result.artistName;
    html += '視聴する:<audio src="' + result.previewUrl + '" controls />';
    $('#displayArea').append(html);
  }

  var ctx = new AudioContext();
  var el = $("audio").eq(0)[0];
  var source = ctx.createMediaElementSource(el);
  var gainNode = ctx.createGain();

  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  var v = 0;
  setInterval(function () {
      v = v + 0.05;
      gainNode.gain.value = 0.5 + Math.cos(v) / 2;
  }, 100);

  el.play();
}

$(function () {
    // 検索する
    search({
      term: 'きゃりーぱみゅぱみゅ',
      limit: 30
    });
});
