/*
G.keydown.on("Ctrl + A", function(e) {alert(e)}).un("Ctrl + A").on("Ctrl + B", function(e) {alert(e)}).on("f+u", function(e) {alert(e)});
*/
;;(function(WIN, DOC) {
	//base
	var byId = function(id) { return "string" === typeof id ? document.getElementById(id) : id;},
		on = document.addEventListener ? function(el,type,callback){
			el.addEventListener( type, callback, !1 );
		} : function(el,type,callback){
			el.attachEvent( "on" + type, callback );
		},
		un = document.removeEventListener ? function(el,type,callback){
			el.removeEventListener( type, callback, !1 );
		} : function(el,type,callback){
			el.detachEvent( "on" + type, callback);
		};
		
	WIN.G || (WIN.G = {});
	
	WIN.G.keydown = {
		
		keymap: {
					
			//shift Keys
			shiftKey: {
				"`":"~",
				"1":"!",
				"2":"@",
				"3":"#",
				"4":"$",
				"5":"%",
				"6":"^",
				"7":"&",
				"8":"*",
				"9":"(",
				"0":")",
				"-":"_",
				"=":"+",
				";":":",
				"'":"\"",
				",":"<",
				".":">",
				"/":"?",
				"\\":"|"
			},
			
			//special Keys
			specialKey: {
				'esc':27,
				'escape':27,
				'tab':9,
				'space':32,
				'return':13,
				'enter':13,
				'backspace':8,
	
				'scrolllock':145,
				'scroll_lock':145,
				'scroll':145,
				'capslock':20,
				'caps_lock':20,
				'caps':20,
				'numlock':144,
				'num_lock':144,
				'num':144,
				
				'pause':19,
				'break':19,
				
				'insert':45,
				'home':36,
				'delete':46,
				'end':35,
				
				'pageup':33,
				'page_up':33,
				'pu':33,
	
				'pagedown':34,
				'page_down':34,
				'pd':34,
	
				'left':37,
				'up':38,
				'right':39,
				'down':40,
	
				'f1':112,
				'f2':113,
				'f3':114,
				'f4':115,
				'f5':116,
				'f6':117,
				'f7':118,
				'f8':119,
				'f9':120,
				'f10':121,
				'f11':122,
				'f12':123
			}
		},
		
		handleCache: {},
		
		keyCache: [],
		
		//format: "Ctrl + A", "ctrl+a"...
		formatKey: function(s) {
			return s.replace(/\s/g, "").toLowerCase();
		},
		
		on: function(key, callback, o) {
			
			if(!key || !callback) return this;
			
			key = this.formatKey(key);
			
			o = o || {};
			
			var that = this,
			
				el = o.el || document,	//target
			
				type = o.type || "keydown",
				
				bubble = o.bubble || false,		//默认不允许事件冒泡
				
				handle = function(e) {
					
					/*
					@simple:
					var k=[];
					document.onkeydown = function(e){
					    e = e||window.event;
					    k.push(e.keyCode);
					    if(k.toString().indexOf("70,85,67,75")>=0) {
					        k=[];
					    }
					}
					*/
					e = e || window.event;
					var keyCode = e.keyCode || e.which,
						keyChar = String.fromCharCode(keyCode).toLowerCase(),
						keys = key.split("+"),
						
						specialKey = that.keymap.specialKey,
						shiftKey = that.keymap.shiftKey,
						
						//可能发生的组合键[0]形参，[1]实参
						comboKey = {
							shift: [ false, e.shiftKey || false],
							ctrl: [ false, e.ctrlKey || false],
							alt: [ false, e.altKey || false],
							meta: [ false, e.metaKey || false]		//听说的MAC组合键，听说而已，没有亲见
						},
						
						//match ComboKey
						comboKeyMatch = function() {
							var k, li;
							for(k in comboKey) {
								li = comboKey[k];
								if(li[0] !== li[1]) return false;	
							}
							return true;
						}
						
						//按下次数监控，保证中间不参杂其他按键
						pressCount = 0;
						
					//fix the "," || "." 's keyChar(special length == 0)
					if(keyCode == 188) keyChar = ",";
					if(keyCode == 190) keyChar = ".";
					
					for(var i=0, l=keys.length, k; k=keys[i],i<l; i++) {
						
						//comboKey
						if(/ctrl|shift|alt|meta/.test(k)) {
							comboKey[k][0] = true;
							pressCount++;
						}
						
						//specialKey, shiftKey, else special keys
						else if(k.length > 1 && keyCode === specialKey[k] || e.shiftKey && shiftKey[keyChar] && k === shiftKey[keyChar] || k === keyChar) {
							 pressCount++;
						}
					}
					
					if(pressCount === l && comboKeyMatch()) {
						callback(e);
			
						//stop event bubble
						if(!bubble) {
							e.cancelBubble = true;
							e.returnValue = false;
							if(e.stopPropagation) {
								e.stopPropagation();
								e.preventDefault();
							}
							//return false;
						}
					}
				};
			
			//add to cache
			this.handleCache[key] = {
				el: el,
				type: type,
				callback: handle
			}
			on(el, type, handle);
			return this;	
		},
		
		un: function(key) {
			
			if(!key) return this;
			
			key = this.formatKey(key);
			
			var curHandle = this.handleCache[key];
			
			if(!curHandle) return this;
			un(curHandle.el, curHandle.type, curHandle.callback);
			
			delete(this.handleCache[key]);
			
			return this;
		}
	}
})(this, document);




//G.keydown.on("Ctrl - A");
//G.keydown.on("Ctrl * 3");




/*
测试发现：
开启中文输入法，按下能显示内容的按键（排除方向键、退格、等功能键）
keyCode || which 始终 == 229（opera下总为197）

有希望成为一种鉴别是否开启输入法的办法！
document.getElementById("testInput").onkeydown = function(e) {
	e = e || window.event;
	alert(e.keyCode || e.which)
}
*/