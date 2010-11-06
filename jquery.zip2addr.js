$.fn.zip2addrJp = function(target){
    var c = {
		api: 'http://www.google.com/transliterate?langpair=ja-Hira|ja&jsonp=?',
		prefectureToken: '(東京都|道|府|県)'
    }

    var getAddr = function(zip,callback){
        $.getJSON(c.api,{'text':zip},
			function(json){
				if(RegExp(c.prefectureToken).test(json[0][1][0])){
					callback(json[0][1][0].replace(RegExp('(.*?'+c.prefectureToken+')(.+)'),function(a,b,c,d){return [b,d]}))
				}
			}
		)
	}
	
	var buildZip = function(){}

	var fillAddr = (function(){
		if(typeof target == 'object' && target.pref){
			return function(addr){
				var addrs = addr.split(',');
				if(addrs){
					if(!RegExp(addrs[1]).test($(target.addr).val())){
						$(target.pref).val(addrs[0]);
						$(target.addr).val(addrs[1]);
					}
				}else if(!RegExp(addrs[1]).test($(target.addr).val())){
					$(target.pref).add(target.addr).val('');
				}
			}
		}else{
			return function(addr){
				var addrStr = addr.replace(',','');
				var addrField = target.addr || target;
				if(addrStr){
					if(!RegExp(addrStr).test($(addrField).val())){
						$(addrField).val(addrStr);
					}
				}else if(!RegExp(addrStr).test($(addrField).val())){
					$(addrField).val('');
				}
			}
		}
	})()

	//From http://liosk.blog103.fc2.com/blog-entry-72.html
	var fascii2ascii = (function() {
		var pattern = /[\uFF01-\uFF5E]/g, replace = function(m) {
			return String.fromCharCode(m.charCodeAt() - 0xFEE0);
		};
		return function(s){return s.replace(pattern, replace);};
	})();

	var check = function(_val){
		var val = fascii2ascii(_val);
		val = val.replace(/\D/,'');
		if(val.length == 7){
			if(cache[val] == undefined){
				getAddr(val.replace(/(\d\d\d)(\d\d\d\d)/,'$1-$2'),function(json){
					cache[val] = json;
					fillAddr(json);
				})
			}else{
				fillAddr(cache[val]);
			}
		}
	}

	var cache = $.fn.zip2addrJp.cache;

    this.each(function(){
        var elem = $(this);
		if(typeof target == 'object' && target.zip2){
			elem.add($(target.zip2)).bind('keyup.zip2addr change.zip2addr',function(){check(elem.val()+''+$(target.zip2).val())})
		}else{
			elem.bind('keyup.zip2addr change.zip2addr',function(){check(elem.val())})
		}
    });

    return this;
};

$.fn.zip2addrJp.cache = {};
