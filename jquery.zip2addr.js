/*
 * jQuery.zip2addr
 *
 * Copyright 2010, Kotaro Kokubo a.k.a kotarok kotaro@nodot.jp
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * https://github.com/kotarok/jQuery.zip2addr
 *
 * Depends:
 *	jQuery 1.4 or above
 */

$.fn.zip2addr = function(target) {
  var c = {
    api: 'http://www.google.com/transliterate?langpair=ja-Hira|ja&jsonp=?',
    prefectureToken: '(東京都|道|府|県)',
    zipDelimiter: '-'
  }

  var cache = $.fn.zip2addr.cache;

  var getAddr = function(zip, callback) {
    $.getJSON(c.api, {
        'text': zip
      },
      function(json) {
        if (RegExp(c.prefectureToken).test(json[0][1][0])) {
          callback(json[0][1][0].replace(RegExp('(.*?' + c.prefectureToken + ')(.+)'), function(a, b, c, d) {
            return [b, d]
          }))
        }
      }
    )
  }

  var fillAddr = (function() {
    if (typeof target == 'object' && target.pref) {
      return function(addr) {
        var addrs = addr.split(',');
        if (addrs) {
          if (!RegExp(addrs[1]).test($(target.addr).val())) {
            $(target.pref).val(addrs[0]);
            $(target.addr).val(addrs[1]);
          }
        } else if (!RegExp(addrs[1]).test($(target.addr).val())) {
          $(target.pref).add(target.addr).val('');
        }
      }
    } else {
      return function(addr) {
        var addrStr = addr.replace(',', '');
        var addrField = target.addr || target;
        if (addrStr) {
          if (!RegExp(addrStr).test($(addrField).val())) {
            $(addrField).val(addrStr);
          }
        } else if (!RegExp(addrStr).test($(addrField).val())) {
          $(addrField).val('');
        }
      }
    }
  })()

  //From http://liosk.blog103.fc2.com/blog-entry-72.html
  var fascii2ascii = (function() {
    var pattern = /[\uFF01-\uFF5E]/g,
      replace = function(m) {
        return String.fromCharCode(m.charCodeAt() - 0xFEE0);
      };
    return function(s) {
      return s.replace(pattern, replace);
    };
  })();

  var check = function(_val) {
    var val = fascii2ascii(_val).replace(/\D/g, '');
    if (val.length == 7) {
      if (cache[val] == undefined) {
        getAddr(val.replace(/(\d\d\d)(\d\d\d\d)/, '$1-$2'), function(json) {
          cache[val] = json;
          fillAddr(json);
        })
      } else {
        fillAddr(cache[val]);
      }
    }
  }

  this.each(function() {
    var elem = $(this);
    if (typeof target == 'object' && target.zip2) {
      elem.add($(target.zip2))
        .bind('keyup.zip2addr change.zip2addr', function() {
          check(elem.val() + '' + $(target.zip2).val())
        })
        .bind('blur.zip2addr', function() {
          $(this).val(function() {
            return fascii2ascii($(this).val())
          })
        })
    } else {
      elem
        .bind('keyup.zip2addr change.zip2addr', function() {
          check(elem.val())
        })
        .bind('blur.zip2addr', function() {
          $(this).val(function() {
            return fascii2ascii($(this).val()).replace(/\D/g, '').replace(/(\d\d\d)(\d\d\d\d)/, '$1' + c.zipDelimiter + '$2')
          })
        })
    }
  });

  return this;
};

$.fn.zip2addr.cache = {};
