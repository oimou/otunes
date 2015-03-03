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
  var content = document.getElementById("template-card").import;
  var template = content.querySelector("template");
  var audioCtx = new AudioContext();

  // UIへ表示する
  // デザインは適当ですが、こんな感じで表示できます。
  json.results.forEach(function (res) {
    var el = document.importNode(template.content, true);

    $(el).find(".card-title").text(res.trackName);
    $(el).find(".card-artist").text(res.artistName);
    $(el).find(".card-audio").attr("src", res.previewUrl);

    var audio = $(el).find(".card-audio")[0];
    var source = audioCtx.createMediaElementSource(audio);
    var analyser = audioCtx.createAnalyser();

    source.connect(analyser);
    //analyser.connect(audioCtx.destination);

    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    var width = 400;
    var height = 200;
    var canvas = $(el).find(".card-canvas")[0];
    var ctx = canvas.getContext("2d");

    $(canvas).attr({
      width: width,
      height: height
    });

    ctx.clearRect(0, 0, width, height);

    $(el).find(".card").on("click", function () {
      if (audio.paused) {
        audio.play();
        analyser.connect(audioCtx.destination);
      } else {
        audio.pause();
        analyser.disconnect();
      }
    });

    $(el).appendTo("#displayArea");

    var scale = chroma.scale('RdYlBu').domain([0, 1]);
    var bgColor = scale(Math.random()).css();
    var waveColor;

    if (chroma.luminance(bgColor) > 0.5) {
      waveColor = "rgb(30, 30, 30)";
    } else {
      waveColor = "rgb(200, 200, 200)";
    }

    function draw() {
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.5;
      ctx.strokeStyle = waveColor;
      ctx.beginPath();

      var sliceWidth = width * 1.0 / bufferLength;
      var x = 0;

      for (var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128.0;
        var y = v * height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      requestAnimationFrame(draw);
    }

    draw();
  });
}

$(function () {
    search({
      term: 'きゃりーぱみゅぱみゅ',
      limit: 12
    });
});
