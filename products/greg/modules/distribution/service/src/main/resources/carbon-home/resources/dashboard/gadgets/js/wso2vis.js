/*
    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
// qTip - CSS Tool Tips - by Craig Erskine
// http://qrayg.com
//
// Multi-tag support by James Crooke
// http://www.cj-design.com
//
// Inspired by code from Travis Beckham
// http://www.squidfingers.com | http://www.podlob.com
//
// Copyright (c) 2006 Craig Erskine
// Permission is granted to copy, distribute and/or modify this document
// under the terms of the GNU Free Documentation License, Version 1.3
// or any later version published by the Free Software Foundation;
// with no Invariant Sections, no Front-Cover Texts, and no Back-Cover Texts.
// A copy of the license is included in the section entitled "GNU
// Free Documentation License".

var qTipTag = "a,label,input,v"; //Which tag do you want to qTip-ize? Keep it lowercase!//
var qTipX = 0; //This is qTip's X offset//
var qTipY = 15; //This is qTip's Y offset//

//There's No need to edit anything below this line//
tooltip = {
  name : "qTip",
  offsetX : qTipX,
  offsetY : qTipY,
  tip : null
}

tooltip.init = function () {
	var tipNameSpaceURI = "http://www.w3.org/1999/xhtml";
	if(!tipContainerID){ var tipContainerID = "qTip";}
	var tipContainer = document.getElementById(tipContainerID);

	if(!tipContainer) {
	  tipContainer = document.createElementNS ? document.createElementNS(tipNameSpaceURI, "div") : document.createElement("div");
		tipContainer.setAttribute("id", tipContainerID);
	  document.getElementsByTagName("body").item(0).appendChild(tipContainer);
	}

	if (!document.getElementById) return;
	this.tip = document.getElementById (this.name);
	if (this.tip) document.onmousemove = function (evt) {tooltip.move (evt)};

	var a, sTitle, elements;
	
	var elementList = qTipTag.split(",");
	for(var j = 0; j < elementList.length; j++)
	{	
		elements = document.getElementsByTagName(elementList[j]);
		if(elements)
		{
			for (var i = 0; i < elements.length; i ++)
			{
				a = elements[i];
				sTitle = a.getAttribute("title");				
				if(sTitle)
				{
					a.setAttribute("tiptitle", sTitle);
					a.removeAttribute("title");
					a.removeAttribute("alt");
					a.onmouseover = function() {tooltip.show(this.getAttribute('tiptitle'))};
					a.onmouseout = function() {tooltip.hide()};
				}
			}
		}
	}
}

tooltip.move = function (evt) {
	var x=0, y=0;
	if (document.all) {//IE
		x = (document.documentElement && document.documentElement.scrollLeft) ? document.documentElement.scrollLeft : document.body.scrollLeft;
		y = (document.documentElement && document.documentElement.scrollTop) ? document.documentElement.scrollTop : document.body.scrollTop;
		x += window.event.clientX;
		y += window.event.clientY;
		
	} else {//Good Browsers
		x = evt.pageX;
		y = evt.pageY;
	}
	this.tip.style.left = (x + this.offsetX) + "px";
	this.tip.style.top = (y + this.offsetY) + "px";
}

tooltip.show = function (text) {
	if (!this.tip) return;
	this.tip.innerHTML = text;
	this.tip.style.display = "block";
}

tooltip.hide = function () {
	if (!this.tip) return;
	this.tip.innerHTML = "";
	this.tip.style.display = "none";
}

window.onload = function () {
	tooltip.init ();
}
if(!Array.prototype.map){Array.prototype.map=function(c,d){var e=this.length;var a=new Array(e);for(var b=0;b<e;b++){if(b in this){a[b]=c.call(d,this[b],b,this)}}return a}}if(!Array.prototype.filter){Array.prototype.filter=function(d,e){var g=this.length;var a=new Array();for(var c=0;c<g;c++){if(c in this){var b=this[c];if(d.call(e,b,c,this)){a.push(b)}}}return a}}if(!Array.prototype.forEach){Array.prototype.forEach=function(b,c){var d=this.length>>>0;for(var a=0;a<d;a++){if(a in this){b.call(c,this[a],a,this)}}}}if(!Array.prototype.reduce){Array.prototype.reduce=function(d,b){var a=this.length;if(!a&&(arguments.length==1)){throw new Error("reduce: empty array, no initial value")}var c=0;if(arguments.length<2){while(true){if(c in this){b=this[c++];break}if(++c>=a){throw new Error("reduce: no values, no initial value")}}}for(;c<a;c++){if(c in this){b=d(b,this[c],c,this)}}return b}}Date.__parse__=Date.parse;Date.parse=function(j,i){if(arguments.length==1){return Date.__parse__(j)}var h=1970,g=0,b=1,d=0,c=0,a=0;var f=[function(){}];i=i.replace(/[\\\^\$\*\+\?\[\]\(\)\.\{\}]/g,"\\$&");i=i.replace(/%[a-zA-Z0-9]/g,function(k){switch(k){case"%b":f.push(function(l){g={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11}[l]});return"([A-Za-z]+)";case"%h":case"%B":f.push(function(l){g={January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11}[l]});return"([A-Za-z]+)";case"%e":case"%d":f.push(function(l){b=l});return"([0-9]+)";case"%H":f.push(function(l){d=l});return"([0-9]+)";case"%m":f.push(function(l){g=l-1});return"([0-9]+)";case"%M":f.push(function(l){c=l});return"([0-9]+)";case"%S":f.push(function(l){a=l});return"([0-9]+)";case"%y":f.push(function(l){l=Number(l);h=l+(((0<=l)&&(l<69))?2000:(((l>=69)&&(l<100)?1900:0)))});return"([0-9]+)";case"%Y":f.push(function(l){h=l});return"([0-9]+)";case"%%":f.push(function(){});return"%"}return k});var e=j.match(i);if(e){e.forEach(function(k,l){f[l](k)})}return new Date(h,g,b,d,c,a)};if(Date.prototype.toLocaleFormat){Date.prototype.format=Date.prototype.toLocaleFormat}else{Date.prototype.format=function(b){function a(e,d){return(e<10)?(d||"0")+e:e}var c=this;return b.replace(/%[a-zA-Z0-9]/g,function(f){switch(f){case"%a":return["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][c.getDay()];case"%A":return["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][c.getDay()];case"%h":case"%b":return["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][c.getMonth()];case"%B":return["January","February","March","April","May","June","July","August","September","October","November","December"][c.getMonth()];case"%c":return c.toLocaleString();case"%C":return a(Math.floor(c.getFullYear()/100)%100);case"%d":return a(c.getDate());case"%x":case"%D":return a(c.getMonth()+1)+"/"+a(c.getDate())+"/"+a(c.getFullYear()%100);case"%e":return a(c.getDate()," ");case"%H":return a(c.getHours());case"%I":var e=c.getHours()%12;return e?a(e):12;case"%m":return a(c.getMonth()+1);case"%M":return a(c.getMinutes());case"%n":return"\n";case"%p":return c.getHours()<12?"AM":"PM";case"%T":case"%X":case"%r":var e=c.getHours()%12;return(e?a(e):12)+":"+a(c.getMinutes())+":"+a(c.getSeconds())+" "+(c.getHours()<12?"AM":"PM");case"%R":return a(c.getHours())+":"+a(c.getMinutes());case"%S":return a(c.getSeconds());case"%t":return"\t";case"%u":var d=c.getDay();return d?d:1;case"%w":return c.getDay();case"%y":return a(c.getFullYear()%100);case"%Y":return c.getFullYear();case"%%":return"%"}return f})}};var pv = function() {var pv={};pv.extend=function(b){function a(){}a.prototype=b.prototype||b;return new a()};try{eval("pv.parse = function(x) x;")}catch(e){pv.parse=function(a){var n=new RegExp("function(\\s+\\w+)?\\([^)]*\\)\\s*","mg"),f,k,h=0,o="";while(f=n.exec(a)){var g=f.index+f[0].length;if(a.charAt(g--)!="{"){o+=a.substring(h,g)+"{return ";h=g;for(var b=0;b>=0&&g<a.length;g++){var l=a.charAt(g);switch(l){case'"':case"'":while(++g<a.length&&(k=a.charAt(g))!=l){if(k=="\\"){g++}}break;case"[":case"(":b++;break;case"]":case")":b--;break;case";":case",":if(b==0){b--}break}}o+=pv.parse(a.substring(h,--g))+";}";h=g}n.lastIndex=g}o+=a.substring(h);return o}}pv.identity=function(a){return a};pv.index=function(){return this.index};pv.child=function(){return this.childIndex};pv.parent=function(){return this.parent.index};pv.range=function(g,c,d){if(arguments.length==1){c=g;g=0}if(d==undefined){d=1}else{if(!d){throw new Error("step must be non-zero")}}var f=[],b=0,a;if(d<0){while((a=g+d*b++)>c){f.push(a)}}else{while((a=g+d*b++)<c){f.push(a)}}return f};pv.random=function(b,a,c){if(arguments.length==1){a=b;b=0}if(c==undefined){c=1}return c?(Math.floor(Math.random()*(a-b)/c)*c+b):(Math.random()*(a-b)+b)};pv.repeat=function(b,a){if(arguments.length==1){a=2}return pv.blend(pv.range(a).map(function(){return b}))};pv.cross=function(g,f){var o=[];for(var k=0,l=g.length,d=f.length;k<l;k++){for(var h=0,c=g[k];h<d;h++){o.push([c,f[h]])}}return o};pv.blend=function(a){return Array.prototype.concat.apply([],a)};pv.transpose=function(f){var g=f.length,a=pv.max(f,function(h){return h.length});if(a>g){f.length=a;for(var d=g;d<a;d++){f[d]=new Array(g)}for(var d=0;d<g;d++){for(var b=d+1;b<a;b++){var c=f[d][b];f[d][b]=f[b][d];f[b][d]=c}}}else{for(var d=0;d<a;d++){f[d].length=g}for(var d=0;d<g;d++){for(var b=0;b<d;b++){var c=f[d][b];f[d][b]=f[b][d];f[b][d]=c}}}f.length=a;for(var d=0;d<a;d++){f[d].length=g}return f};pv.keys=function(b){var c=[];for(var a in b){c.push(a)}return c};pv.entries=function(b){var c=[];for(var a in b){c.push({key:a,value:b[a]})}return c};pv.values=function(b){var c=[];for(var a in b){c.push(b[a])}return c};function map(c,a){var b={};return a?c.map(function(g,f){b.index=f;return a.call(b,g)}):c.slice()}pv.normalize=function(g,d){var b=map(g,d),c=pv.sum(b);for(var a=0;a<b.length;a++){b[a]/=c}return b};pv.sum=function(c,a){var b={};return c.reduce(a?function(g,h,f){b.index=f;return g+a.call(b,h)}:function(f,g){return f+g},0)};pv.max=function(b,a){if(a==pv.index){return b.length-1}return Math.max.apply(null,a?map(b,a):b)};pv.max.index=function(j,d){if(d==pv.index){return j.length-1}if(!d){d=pv.identity}var b=-1,h=-Infinity,g={};for(var c=0;c<j.length;c++){g.index=c;var a=d.call(g,j[c]);if(a>h){h=a;b=c}}return b};pv.min=function(b,a){if(a==pv.index){return 0}return Math.min.apply(null,a?map(b,a):b)};pv.min.index=function(j,g){if(g==pv.index){return 0}if(!g){g=pv.identity}var d=-1,b=Infinity,h={};for(var c=0;c<j.length;c++){h.index=c;var a=g.call(h,j[c]);if(a<b){b=a;d=c}}return d};pv.mean=function(b,a){return pv.sum(b,a)/b.length};pv.median=function(c,b){if(b==pv.index){return(c.length-1)/2}c=map(c,b).sort(pv.naturalOrder);if(c.length%2){return c[Math.floor(c.length/2)]}var a=c.length/2;return(c[a-1]+c[a])/2};pv.dict=function(d,g){var a={},h={};for(var c=0;c<d.length;c++){if(c in d){var b=d[c];h.index=c;a[b]=g.call(h,b)}}return a};pv.permute=function(g,a,b){if(!b){b=pv.identity}var c=new Array(a.length),d={};a.forEach(function(f,h){d.index=f;c[h]=b.call(d,g[f])});return c};pv.numerate=function(a,b){if(!b){b=pv.identity}var c={},d={};a.forEach(function(f,g){d.index=g;c[b.call(d,f)]=g});return c};pv.naturalOrder=function(d,c){return(d<c)?-1:((d>c)?1:0)};pv.reverseOrder=function(c,d){return(d<c)?-1:((d>c)?1:0)};pv.css=function(b,a){return window.getComputedStyle?window.getComputedStyle(b,null).getPropertyValue(a):b.currentStyle[a]};pv.ns={svg:"http://www.w3.org/2000/svg",xmlns:"http://www.w3.org/2000/xmlns",xlink:"http://www.w3.org/1999/xlink"};pv.version={major:3,minor:1};pv.error=function(a){(typeof console=="undefined")?alert(a):console.error(a)};pv.listen=function(c,a,b){return c.addEventListener?c.addEventListener(a,b,false):c.attachEvent("on"+a,b)};pv.log=function(c,a){return Math.log(c)/Math.log(a)};pv.logSymmetric=function(c,a){return(c==0)?0:((c<0)?-pv.log(-c,a):pv.log(c,a))};pv.logAdjusted=function(c,a){var d=c<0;if(c<a){c+=(a-c)/a}return d?-pv.log(c,a):pv.log(c,a)};pv.logFloor=function(c,a){return(c>0)?Math.pow(a,Math.floor(pv.log(c,a))):-Math.pow(a,-Math.floor(-pv.log(-c,a)))};pv.logCeil=function(c,a){return(c>0)?Math.pow(a,Math.ceil(pv.log(c,a))):-Math.pow(a,-Math.ceil(-pv.log(-c,a)))};pv.search=function(i,h,g){if(!g){g=pv.identity}var a=0,d=i.length-1;while(a<=d){var b=(a+d)>>1,c=g(i[b]);if(c<h){a=b+1}else{if(c>h){d=b-1}else{return b}}}return -a-1};pv.search.index=function(d,c,b){var a=pv.search(d,c,b);return(a<0)?(-a-1):a};pv.tree=function(a){return new pv.Tree(a)};pv.Tree=function(a){this.array=a};pv.Tree.prototype.keys=function(a){this.k=a;return this};pv.Tree.prototype.value=function(a){this.v=a;return this};pv.Tree.prototype.map=function(){var g={},h={};for(var b=0;b<this.array.length;b++){h.index=b;var f=this.array[b],d=this.k.call(h,f),c=g;for(var a=0;a<d.length-1;a++){c=c[d[a]]||(c[d[a]]={})}c[d[a]]=this.v?this.v.call(h,f):f}return g};pv.nest=function(a){return new pv.Nest(a)};pv.Nest=function(a){this.array=a;this.keys=[]};pv.Nest.prototype.key=function(a){this.keys.push(a);return this};pv.Nest.prototype.sortKeys=function(a){this.keys[this.keys.length-1].order=a||pv.naturalOrder;return this};pv.Nest.prototype.sortValues=function(a){this.order=a||pv.naturalOrder;return this};pv.Nest.prototype.map=function(){var n={},g=[];for(var l,h=0;h<this.array.length;h++){var c=this.array[h];var b=n;for(l=0;l<this.keys.length-1;l++){var f=this.keys[l](c);if(!b[f]){b[f]={}}b=b[f]}f=this.keys[l](c);if(!b[f]){var d=[];g.push(d);b[f]=d}b[f].push(c)}if(this.order){for(var l=0;l<g.length;l++){g[l].sort(this.order)}}return n};pv.Nest.prototype.entries=function(){function a(f){var g=[];for(var d in f){var c=f[d];g.push({key:d,values:(c instanceof Array)?c:a(c)})}return g}function b(g,d){var f=this.keys[d].order;if(f){g.sort(function(i,h){return f(i.key,h.key)})}if(++d<this.keys.length){for(var c=0;c<g.length;c++){b.call(this,g[c].values,d)}}return g}return b.call(this,a(this.map()),0)};pv.Nest.prototype.rollup=function(b){function a(f){for(var c in f){var d=f[c];if(d instanceof Array){f[c]=b(d)}else{a(d)}}return f}return a(this.map())};pv.flatten=function(a){return new pv.Flatten(a)};pv.Flatten=function(a){this.map=a;this.keys=[]};pv.Flatten.prototype.key=function(a,b){this.keys.push({name:a,value:b});return this};pv.Flatten.prototype.array=function(){var b=[],a=[],d=this.keys;function c(h,g){if(g<d.length-1){for(var f in h){a.push(f);c(h[f],g+1);a.pop()}}else{b.push(a.concat(h))}}c(this.map,0);return b.map(function(g){var f={};for(var l=0;l<d.length;l++){var j=d[l],h=g[l];f[j.name]=j.value?j.value.call(null,h):h}return f})};pv.vector=function(a,b){return new pv.Vector(a,b)};pv.Vector=function(a,b){this.x=a;this.y=b};pv.Vector.prototype.perp=function(){return new pv.Vector(-this.y,this.x)};pv.Vector.prototype.norm=function(){var a=this.length();return this.times(a?(1/a):1)};pv.Vector.prototype.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)};pv.Vector.prototype.times=function(a){return new pv.Vector(this.x*a,this.y*a)};pv.Vector.prototype.plus=function(a,b){return(arguments.length==1)?new pv.Vector(this.x+a.x,this.y+a.y):new pv.Vector(this.x+a,this.y+b)};pv.Vector.prototype.minus=function(a,b){return(arguments.length==1)?new pv.Vector(this.x-a.x,this.y-a.y):new pv.Vector(this.x-a,this.y-b)};pv.Vector.prototype.dot=function(a,b){return(arguments.length==1)?this.x*a.x+this.y*a.y:this.x*a+this.y*b};pv.Scale=function(){};pv.Scale.interpolator=function(b,a){if(typeof b=="number"){return function(c){return c*(a-b)+b}}b=pv.color(b).rgb();a=pv.color(a).rgb();return function(d){var c=b.a*(1-d)+a.a*d;if(c<0.00001){c=0}return(b.a==0)?pv.rgb(a.r,a.g,a.b,c):((a.a==0)?pv.rgb(b.r,b.g,b.b,c):pv.rgb(Math.round(b.r*(1-d)+a.r*d),Math.round(b.g*(1-d)+a.g*d),Math.round(b.b*(1-d)+a.b*d),c))}};pv.Scale.linear=function(){var g=[0,1],c=[0,1],b=[pv.identity],a=0;function f(d){var h=pv.search(g,d);if(h<0){h=-h-2}h=Math.max(0,Math.min(b.length-1,h));return b[h]((d-g[h])/(g[h+1]-g[h]))}f.domain=function(i,h,d){if(arguments.length){if(i instanceof Array){if(arguments.length<2){h=pv.identity}if(arguments.length<3){d=h}g=[pv.min(i,h),pv.max(i,d)]}else{g=Array.prototype.slice.call(arguments)}return this}return g};f.range=function(){if(arguments.length){c=Array.prototype.slice.call(arguments);b=[];for(var d=0;d<c.length-1;d++){b.push(pv.Scale.interpolator(c[d],c[d+1]))}return this}return c};f.invert=function(h){var d=pv.search(c,h);if(d<0){d=-d-2}d=Math.max(0,Math.min(b.length-1,d));return(h-c[d])/(c[d+1]-c[d])*(g[d+1]-g[d])+g[d]};f.ticks=function(){var i=g[0],d=g[g.length-1],j=d-i,k=pv.logCeil(j/10,10);if(j/k<2){k/=5}else{if(j/k<5){k/=2}}var l=Math.ceil(i/k)*k,h=Math.floor(d/k)*k;a=Math.max(0,-Math.floor(pv.log(k,10)+0.01));return pv.range(l,h+k,k)};f.tickFormat=function(d){return d.toFixed(a)};f.nice=function(){var h=g[0],d=g[g.length-1],i=Math.pow(10,Math.round(Math.log(d-h)/Math.log(10))-1);g=[Math.floor(h/i)*i,Math.ceil(d/i)*i];return this};f.by=function(d){function h(){return f(d.apply(this,arguments))}for(var i in f){h[i]=f[i]}return h};f.domain.apply(f,arguments);return f};pv.Scale.log=function(){var k=[1,10],c=[0,1],a=10,h=[0,1],f=[pv.identity];function j(b){var d=pv.search(k,b);if(d<0){d=-d-2}d=Math.max(0,Math.min(f.length-1,d));return f[d]((g(b)-c[d])/(c[d+1]-c[d]))}function g(b){return pv.logSymmetric(b,a)}j.domain=function(i,d,b){if(arguments.length){if(i instanceof Array){if(arguments.length<2){d=pv.identity}if(arguments.length<3){b=d}k=[pv.min(i,d),pv.max(i,b)]}else{k=Array.prototype.slice.call(arguments)}c=k.map(g);return this}return k};j.range=function(){if(arguments.length){h=Array.prototype.slice.call(arguments);f=[];for(var b=0;b<h.length-1;b++){f.push(pv.Scale.interpolator(h[b],h[b+1]))}return this}return h};j.invert=function(i){var b=pv.search(h,i);if(b<0){b=-b-2}b=Math.max(0,Math.min(f.length-1,b));var d=c[b]+(i-h[b])/(h[b+1]-h[b])*(c[b+1]-c[b]);return(k[b]<0)?-Math.pow(a,-d):Math.pow(a,d)};j.ticks=function(){var o=Math.floor(c[0]),d=Math.ceil(c[1]),n=[];for(var m=o;m<d;m++){var b=Math.pow(a,m);if(k[0]<0){b=-b}for(var l=1;l<a;l++){n.push(b*l)}}n.push(Math.pow(a,d));if(n[0]<k[0]){n.shift()}if(n[n.length-1]>k[1]){n.pop()}return n};j.tickFormat=function(b){return b.toPrecision(1)};j.nice=function(){k=[pv.logFloor(k[0],a),pv.logCeil(k[1],a)];c=k.map(g);return this};j.base=function(b){if(arguments.length){a=b;c=k.map(g);return this}return a};j.by=function(b){function d(){return j(b.apply(this,arguments))}for(var i in j){d[i]=j[i]}return d};j.domain.apply(j,arguments);return j};pv.Scale.ordinal=function(){var g=[],a={},b=[],f=0;function c(d){if(!(d in a)){a[d]=g.push(d)-1}return b[a[d]%b.length]}c.domain=function(l,i){if(arguments.length){l=(l instanceof Array)?((arguments.length>1)?map(l,i):l):Array.prototype.slice.call(arguments);g=[];var d={};for(var h=0;h<l.length;h++){var k=l[h];if(!(k in d)){d[k]=true;g.push(k)}}a=pv.numerate(g);return this}return g};c.range=function(h,d){if(arguments.length){b=(h instanceof Array)?((arguments.length>1)?map(h,d):h):Array.prototype.slice.call(arguments);if(typeof b[0]=="string"){b=b.map(pv.color)}return this}return b};c.split=function(h,d){var i=(d-h)/this.domain().length;b=pv.range(h+i/2,d,i);return this};c.splitFlush=function(h,d){var j=this.domain().length,i=(d-h)/(j-1);b=(j==1)?[(h+d)/2]:pv.range(h,d+i/2,i);return this};c.splitBanded=function(h,d,m){if(arguments.length<3){m=1}if(m<0){var o=this.domain().length,k=-m*o,i=d-h-k,l=i/(o+1);b=pv.range(h+l,d,l-m);b.band=-m}else{var j=(d-h)/(this.domain().length+(1-m));b=pv.range(h+j*(1-m),d,j);b.band=j*m}return this};c.by=function(d){function h(){return c(d.apply(this,arguments))}for(var i in c){h[i]=c[i]}return h};c.domain.apply(c,arguments);return c};pv.color=function(n){if(!n||(n=="transparent")){return pv.rgb(0,0,0,0)}if(n instanceof pv.Color){return n}var p=/([a-z]+)\((.*)\)/i.exec(n);if(p){var o=p[2].split(","),m=1;switch(p[1]){case"hsla":case"rgba":m=parseFloat(o[3]);break}switch(p[1]){case"hsla":case"hsl":var i=parseFloat(o[0]),q=parseFloat(o[1])/100,d=parseFloat(o[2])/100;return(new pv.Color.Hsl(i,q,d,m)).rgb();case"rgba":case"rgb":function f(b){var a=parseFloat(b);return(b[b.length-1]=="%")?Math.round(a*2.55):a}var c=f(o[0]),j=f(o[1]),k=f(o[2]);return pv.rgb(c,j,k,m)}}n=pv.Color.names[n]||n;if(n.charAt(0)=="#"){var c,j,k;if(n.length==4){c=n.charAt(1);c+=c;j=n.charAt(2);j+=j;k=n.charAt(3);k+=k}else{if(n.length==7){c=n.substring(1,3);j=n.substring(3,5);k=n.substring(5,7)}}return pv.rgb(parseInt(c,16),parseInt(j,16),parseInt(k,16),1)}return new pv.Color(n,1)};pv.Color=function(a,b){this.color=a;this.opacity=b};pv.Color.prototype.brighter=function(a){return this.rgb().brighter(a)};pv.Color.prototype.darker=function(a){return this.rgb().darker(a)};pv.rgb=function(h,f,c,d){return new pv.Color.Rgb(h,f,c,(arguments.length==4)?d:1)};pv.Color.Rgb=function(h,f,c,d){pv.Color.call(this,d?("rgb("+h+","+f+","+c+")"):"none",d);this.r=h;this.g=f;this.b=c;this.a=d};pv.Color.Rgb.prototype=pv.extend(pv.Color);pv.Color.Rgb.prototype.red=function(a){return pv.rgb(a,this.g,this.b,this.a)};pv.Color.Rgb.prototype.green=function(a){return pv.rgb(this.r,a,this.b,this.a)};pv.Color.Rgb.prototype.blue=function(a){return pv.rgb(this.r,this.g,a,this.a)};pv.Color.Rgb.prototype.alpha=function(b){return pv.rgb(this.r,this.g,this.b,b)};pv.Color.Rgb.prototype.rgb=function(){return this};pv.Color.Rgb.prototype.brighter=function(c){c=Math.pow(0.7,arguments.length?c:1);var h=this.r,f=this.g,a=this.b,d=30;if(!h&&!f&&!a){return pv.rgb(d,d,d,this.a)}if(h&&(h<d)){h=d}if(f&&(f<d)){f=d}if(a&&(a<d)){a=d}return pv.rgb(Math.min(255,Math.floor(h/c)),Math.min(255,Math.floor(f/c)),Math.min(255,Math.floor(a/c)),this.a)};pv.Color.Rgb.prototype.darker=function(a){a=Math.pow(0.7,arguments.length?a:1);return pv.rgb(Math.max(0,Math.floor(a*this.r)),Math.max(0,Math.floor(a*this.g)),Math.max(0,Math.floor(a*this.b)),this.a)};pv.hsl=function(f,d,c,b){return new pv.Color.Hsl(f,d,c,(arguments.length==4)?b:1)};pv.Color.Hsl=function(f,d,c,b){pv.Color.call(this,"hsl("+f+","+(d*100)+"%,"+(c*100)+"%)",b);this.h=f;this.s=d;this.l=c;this.a=b};pv.Color.Hsl.prototype=pv.extend(pv.Color);pv.Color.Hsl.prototype.hue=function(a){return pv.hsl(a,this.s,this.l,this.a)};pv.Color.Hsl.prototype.saturation=function(a){return pv.hsl(this.h,a,this.l,this.a)};pv.Color.Hsl.prototype.lightness=function(a){return pv.hsl(this.h,this.s,a,this.a)};pv.Color.Hsl.prototype.alpha=function(b){return pv.hsl(this.h,this.s,this.l,b)};pv.Color.Hsl.prototype.rgb=function(){var g=this.h,f=this.s,a=this.l;g=g%360;if(g<0){g+=360}f=Math.max(0,Math.min(f,1));a=Math.max(0,Math.min(a,1));var c=(a<=0.5)?(a*(1+f)):(a+f-a*f);var d=2*a-c;function b(j){if(j>360){j-=360}else{if(j<0){j+=360}}if(j<60){return d+(c-d)*j/60}if(j<180){return c}if(j<240){return d+(c-d)*(240-j)/60}return d}function i(j){return Math.round(b(j)*255)}return pv.rgb(i(g+120),i(g),i(g-120),this.a)};pv.Color.names={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"};pv.colors=function(){var a=pv.Scale.ordinal();a.range.apply(a,arguments);return a};pv.Colors={};pv.Colors.category10=function(){var a=pv.colors("#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf");a.domain.apply(a,arguments);return a};pv.Colors.category20=function(){var a=pv.colors("#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b","#c49c94","#e377c2","#f7b6d2","#7f7f7f","#c7c7c7","#bcbd22","#dbdb8d","#17becf","#9edae5");a.domain.apply(a,arguments);return a};pv.Colors.category19=function(){var a=pv.colors("#9c9ede","#7375b5","#4a5584","#cedb9c","#b5cf6b","#8ca252","#637939","#e7cb94","#e7ba52","#bd9e39","#8c6d31","#e7969c","#d6616b","#ad494a","#843c39","#de9ed6","#ce6dbd","#a55194","#7b4173");a.domain.apply(a,arguments);return a};pv.ramp=function(c,a){var b=pv.Scale.linear();b.range.apply(b,arguments);return b};pv.SvgScene={};pv.SvgScene.create=function(a){return document.createElementNS(pv.ns.svg,a)};pv.SvgScene.expect=function(a,b){if(!b){return this.create(a)}if(b.tagName=="a"){b=b.firstChild}if(b.tagName==a){return b}var c=this.create(a);b.parentNode.replaceChild(c,b);return c};pv.SvgScene.append=function(c,a,b){c.$scene={scenes:a,index:b};c=this.title(c,a[b]);if(!c.parentNode){a.$g.appendChild(c)}return c.nextSibling};pv.SvgScene.title=function(f,d){var b=f.parentNode,c=String(d.title);if(b&&(b.tagName!="a")){b=null}if(c){if(!b){b=this.create("a");if(f.parentNode){f.parentNode.replaceChild(b,f)}b.appendChild(f)}b.setAttributeNS(pv.ns.xlink,"title",c);return b}if(b){b.parentNode.replaceChild(f,b)}return f};pv.SvgScene.dispatch=function(b){var a=b.target.$scene;if(a){a.scenes.mark.dispatch(b.type,a.scenes,a.index);b.preventDefault()}};pv.SvgScene.area=function(a){var k=a.$g.firstChild;if(!a.length){return k}var p=a[0];if(p.segmented){return this.areaSegment(a)}if(!p.visible){return k}var n=pv.color(p.fillStyle),o=pv.color(p.strokeStyle);if(!n.opacity&&!o.opacity){return k}var m="",l="";for(var h=0,f=a.length-1;f>=0;h++,f--){var g=a[h],d=a[f];m+=g.left+","+g.top+" ";l+=(d.left+d.width)+","+(d.top+d.height)+" ";if(h<a.length-1){var c=a[h+1],b=a[f-1];switch(p.interpolate){case"step-before":m+=g.left+","+c.top+" ";l+=(b.left+b.width)+","+(d.top+d.height)+" ";break;case"step-after":m+=c.left+","+g.top+" ";l+=(d.left+d.width)+","+(b.top+b.height)+" ";break}}}k=this.expect("polygon",k);k.setAttribute("cursor",p.cursor);k.setAttribute("points",m+l);var n=pv.color(p.fillStyle);k.setAttribute("fill",n.color);k.setAttribute("fill-opacity",n.opacity);var o=pv.color(p.strokeStyle);k.setAttribute("stroke",o.color);k.setAttribute("stroke-opacity",o.opacity);k.setAttribute("stroke-width",p.lineWidth);return this.append(k,a,0)};pv.SvgScene.areaSegment=function(a){var f=a.$g.firstChild;for(var d=0,c=a.length-1;d<c;d++){var h=a[d],g=a[d+1];if(!h.visible||!g.visible){continue}var j=pv.color(h.fillStyle),k=pv.color(h.strokeStyle);if(!j.opacity&&!k.opacity){continue}var b=h.left+","+h.top+" "+g.left+","+g.top+" "+(g.left+g.width)+","+(g.top+g.height)+" "+(h.left+h.width)+","+(h.top+h.height);f=this.expect("polygon",f);f.setAttribute("cursor",h.cursor);f.setAttribute("points",b);f.setAttribute("fill",j.color);f.setAttribute("fill-opacity",j.opacity);f.setAttribute("stroke",k.color);f.setAttribute("stroke-opacity",k.opacity);f.setAttribute("stroke-width",h.lineWidth);f=this.append(f,a,d)}return f};pv.SvgScene.bar=function(a){var g=a.$g.firstChild;for(var b=0;b<a.length;b++){var c=a[b];if(!c.visible){continue}var f=pv.color(c.fillStyle),d=pv.color(c.strokeStyle);if(!f.opacity&&!d.opacity){continue}g=this.expect("rect",g);g.setAttribute("cursor",c.cursor);g.setAttribute("x",c.left);g.setAttribute("y",c.top);g.setAttribute("width",Math.max(1e-10,c.width));g.setAttribute("height",Math.max(1e-10,c.height));g.setAttribute("fill",f.color);g.setAttribute("fill-opacity",f.opacity);g.setAttribute("stroke",d.color);g.setAttribute("stroke-opacity",d.opacity);g.setAttribute("stroke-width",c.lineWidth);g=this.append(g,a,b)}return g};pv.SvgScene.dot=function(b){var k=b.$g.firstChild;for(var d=0;d<b.length;d++){var p=b[d];if(!p.visible){continue}var n=pv.color(p.fillStyle),o=pv.color(p.strokeStyle);if(!n.opacity&&!o.opacity){continue}var j=Math.sqrt(p.size),l="",g="";switch(p.shape){case"cross":l="M"+-j+","+-j+"L"+j+","+j+"M"+j+","+-j+"L"+-j+","+j;break;case"triangle":var f=j,m=j*2/Math.sqrt(3);l="M0,"+f+"L"+m+","+-f+" "+-m+","+-f+"Z";break;case"diamond":j*=Math.sqrt(2);l="M0,"+-j+"L"+j+",0 0,"+j+" "+-j+",0Z";break;case"square":l="M"+-j+","+-j+"L"+j+","+-j+" "+j+","+j+" "+-j+","+j+"Z";break;case"tick":l="M0,0L0,"+-p.size;break;default:function a(h){return"M0,"+h+"A"+h+","+h+" 0 1,1 0,"+(-h)+"A"+h+","+h+" 0 1,1 0,"+h+"Z"}if(p.lineWidth/2>j){g=a(p.lineWidth)}l=a(j);break}var c="translate("+p.left+","+p.top+")"+(p.angle?" rotate("+180*p.angle/Math.PI+")":"");k=this.expect("path",k);k.setAttribute("d",l);k.setAttribute("transform",c);k.setAttribute("fill",n.color);k.setAttribute("fill-opacity",n.opacity);k.setAttribute("cursor",p.cursor);if(g){k.setAttribute("stroke","none")}else{k.setAttribute("stroke",o.color);k.setAttribute("stroke-opacity",o.opacity);k.setAttribute("stroke-width",p.lineWidth)}k=this.append(k,b,d);if(g){k=this.expect("path",k);k.setAttribute("d",g);k.setAttribute("transform",c);k.setAttribute("fill",o.color);k.setAttribute("fill-opacity",o.opacity);k.setAttribute("cursor",p.cursor);k=this.append(k,b,d)}}return k};pv.SvgScene.image=function(a){var d=a.$g.firstChild;for(var b=0;b<a.length;b++){var c=a[b];if(!c.visible){continue}d=this.fill(d,a,b);d=this.expect("image",d);d.setAttribute("preserveAspectRatio","none");d.setAttribute("x",c.left);d.setAttribute("y",c.top);d.setAttribute("width",c.width);d.setAttribute("height",c.height);d.setAttribute("cursor",c.cursor);d.setAttributeNS(pv.ns.xlink,"href",c.url);d=this.append(d,a,b);d=this.stroke(d,a,b)}return d};pv.SvgScene.label=function(a){var d=a.$g.firstChild;for(var c=0;c<a.length;c++){var k=a[c];if(!k.visible){continue}var h=pv.color(k.textStyle);if(!h.opacity){continue}var g=0,f=0,j=0,b="start";switch(k.textBaseline){case"middle":j=".35em";break;case"top":j=".71em";f=k.textMargin;break;case"bottom":f="-"+k.textMargin;break}switch(k.textAlign){case"right":b="end";g="-"+k.textMargin;break;case"center":b="middle";break;case"left":g=k.textMargin;break}d=this.expect("text",d);d.setAttribute("pointer-events","none");d.setAttribute("x",g);d.setAttribute("y",f);d.setAttribute("dy",j);d.setAttribute("text-anchor",b);d.setAttribute("transform","translate("+k.left+","+k.top+")"+(k.textAngle?" rotate("+180*k.textAngle/Math.PI+")":""));d.setAttribute("fill",h.color);d.setAttribute("fill-opacity",h.opacity);d.style.font=k.font;d.style.textShadow=k.textShadow;if(d.firstChild){d.firstChild.nodeValue=k.text}else{d.appendChild(document.createTextNode(k.text))}d=this.append(d,a,c)}return d};pv.SvgScene.line=function(a){var g=a.$g.firstChild;if(a.length<2){return g}var k=a[0];if(k.segmented){return this.lineSegment(a)}if(!k.visible){return g}var h=pv.color(k.fillStyle),j=pv.color(k.strokeStyle);if(!h.opacity&&!j.opacity){return g}var b="";for(var d=0;d<a.length;d++){var f=a[d];b+=f.left+","+f.top+" ";if(d<a.length-1){var c=a[d+1];switch(k.interpolate){case"step-before":b+=f.left+","+c.top+" ";break;case"step-after":b+=c.left+","+f.top+" ";break}}}g=this.expect("polyline",g);g.setAttribute("cursor",k.cursor);g.setAttribute("points",b);g.setAttribute("fill",h.color);g.setAttribute("fill-opacity",h.opacity);g.setAttribute("stroke",j.color);g.setAttribute("stroke-opacity",j.opacity);g.setAttribute("stroke-width",k.lineWidth);return this.append(g,a,0)};pv.SvgScene.lineSegment=function(f){var z=f.$g.firstChild;for(var y=0,x=f.length-1;y<x;y++){var m=f[y],k=f[y+1];if(!m.visible||!k.visible){continue}var r=pv.color(m.strokeStyle);if(!r.opacity){continue}function A(d,c,b,a){return d.plus(c.times(b.minus(d).dot(a.perp())/c.dot(a.perp())))}var j=pv.vector(m.left,m.top),h=pv.vector(k.left,k.top),u=h.minus(j),t=u.perp().norm(),s=t.times(m.lineWidth/2),E=j.plus(s),D=h.plus(s),C=h.minus(s),B=j.minus(s);if(y>0){var q=f[y-1];if(q.visible){var o=j.minus(q.left,q.top).perp().norm().plus(t);B=A(j,o,B,u);E=A(j,o,E,u)}}if(y<(x-1)){var g=f[y+2];if(g.visible){var l=pv.vector(g.left,g.top).minus(h).perp().norm().plus(t);C=A(h,l,C,u);D=A(h,l,D,u)}}var u=E.x+","+E.y+" "+D.x+","+D.y+" "+C.x+","+C.y+" "+B.x+","+B.y;z=this.expect("polygon",z);z.setAttribute("cursor",m.cursor);z.setAttribute("points",u);z.setAttribute("fill",r.color);z.setAttribute("fill-opacity",r.opacity);z=this.append(z,f,y)}return z};var guid=0;pv.SvgScene.panel=function(b){var k=b.$g,l=k&&k.firstChild;for(var h=0;h<b.length;h++){var n=b[h];if(!n.visible){continue}if(!b.parent){n.canvas.style.display="inline-block";k=n.canvas.firstChild;if(!k){k=n.canvas.appendChild(this.create("svg"));k.onclick=k.onmousedown=k.onmouseup=k.onmousemove=k.onmouseout=k.onmouseover=pv.SvgScene.dispatch}b.$g=k;k.setAttribute("width",n.width+n.left+n.right);k.setAttribute("height",n.height+n.top+n.bottom);if(typeof l=="undefined"){l=k.firstChild}}if(n.overflow=="hidden"){var m=this.expect("g",l),d=(guid++).toString(36);m.setAttribute("clip-path","url(#"+d+")");if(!m.parentNode){k.appendChild(m)}b.$g=k=m;l=m.firstChild;l=this.expect("clipPath",l);l.setAttribute("id",d);var a=l.firstChild||l.appendChild(this.create("rect"));a.setAttribute("x",n.left);a.setAttribute("y",n.top);a.setAttribute("width",n.width);a.setAttribute("height",n.height);if(!l.parentNode){k.appendChild(l)}l=l.nextSibling}l=this.fill(l,b,h);for(var f=0;f<n.children.length;f++){n.children[f].$g=l=this.expect("g",l);l.setAttribute("transform","translate("+n.left+","+n.top+")");this.updateAll(n.children[f]);if(!l.parentNode){k.appendChild(l)}l=l.nextSibling}l=this.stroke(l,b,h);if(n.overflow=="hidden"){b.$g=k=m.parentNode;l=m.nextSibling}}return l};pv.SvgScene.fill=function(f,a,b){var c=a[b],d=pv.color(c.fillStyle);if(d.opacity){f=this.expect("rect",f);f.setAttribute("x",c.left);f.setAttribute("y",c.top);f.setAttribute("width",c.width);f.setAttribute("height",c.height);f.setAttribute("cursor",c.cursor);f.setAttribute("fill",d.color);f.setAttribute("fill-opacity",d.opacity);f=this.append(f,a,b)}return f};pv.SvgScene.stroke=function(f,a,b){var c=a[b],d=pv.color(c.strokeStyle);if(d.opacity){f=this.expect("rect",f);f.setAttribute("x",c.left);f.setAttribute("y",c.top);f.setAttribute("width",Math.max(1e-10,c.width));f.setAttribute("height",Math.max(1e-10,c.height));f.setAttribute("cursor",c.cursor);f.setAttribute("fill","none");f.setAttribute("stroke",d.color);f.setAttribute("stroke-opacity",d.opacity);f.setAttribute("stroke-width",c.lineWidth);f=this.append(f,a,b)}return f};pv.SvgScene.rule=function(a){var f=a.$g.firstChild;for(var b=0;b<a.length;b++){var c=a[b];if(!c.visible){continue}var d=pv.color(c.strokeStyle);if(!d.opacity){continue}f=this.expect("line",f);f.setAttribute("cursor",c.cursor);f.setAttribute("x1",c.left);f.setAttribute("y1",c.top);f.setAttribute("x2",c.left+c.width);f.setAttribute("y2",c.top+c.height);f.setAttribute("stroke",d.color);f.setAttribute("stroke-opacity",d.opacity);f.setAttribute("stroke-width",c.lineWidth);f=this.append(f,a,b)}return f};pv.SvgScene.wedge=function(b){var k=b.$g.firstChild;for(var j=0;j<b.length;j++){var u=b[j];if(!u.visible){continue}var r=pv.color(u.fillStyle),t=pv.color(u.strokeStyle);if(!r.opacity&&!t.opacity){continue}var f=u.innerRadius,d=u.outerRadius,n=Math.abs(u.angle),c;if(n>=2*Math.PI){if(f){c="M0,"+d+"A"+d+","+d+" 0 1,1 0,"+(-d)+"A"+d+","+d+" 0 1,1 0,"+d+"M0,"+f+"A"+f+","+f+" 0 1,1 0,"+(-f)+"A"+f+","+f+" 0 1,1 0,"+f+"Z"}else{c="M0,"+d+"A"+d+","+d+" 0 1,1 0,"+(-d)+"A"+d+","+d+" 0 1,1 0,"+d+"Z"}}else{var m=Math.min(u.startAngle,u.endAngle),l=Math.max(u.startAngle,u.endAngle),h=Math.cos(m),g=Math.cos(l),q=Math.sin(m),o=Math.sin(l);if(f){c="M"+d*h+","+d*q+"A"+d+","+d+" 0 "+((n<Math.PI)?"0":"1")+",1 "+d*g+","+d*o+"L"+f*g+","+f*o+"A"+f+","+f+" 0 "+((n<Math.PI)?"0":"1")+",0 "+f*h+","+f*q+"Z"}else{c="M"+d*h+","+d*q+"A"+d+","+d+" 0 "+((n<Math.PI)?"0":"1")+",1 "+d*g+","+d*o+"L0,0Z"}}k=this.expect("path",k);k.setAttribute("fill-rule","evenodd");k.setAttribute("cursor",u.cursor);k.setAttribute("transform","translate("+u.left+","+u.top+")");k.setAttribute("d",c);k.setAttribute("fill",r.color);k.setAttribute("fill-opacity",r.opacity);k.setAttribute("stroke",t.color);k.setAttribute("stroke-opacity",t.opacity);k.setAttribute("stroke-width",u.lineWidth);k=this.append(k,b,j)}return k};pv.VmlScene={};pv.VmlScene.init=function(){document.createStyleSheet().addRule("v\\:*","behavior:url(#default#VML);display:inline-block");document.namespaces.add("v","urn:schemas-microsoft-com:vml");this.init=function(){}};pv.VmlScene.create=function(a){this.init();return document.createElement(a)};pv.VmlScene.expect=function(a,b){if(!b){return this.create(a)}if(b.tagName==a){return b}var c=this.create(a);b.parentNode.replaceChild(c,b);return c};pv.VmlScene.append=function(c,a,b){c.$scene={scenes:a,index:b};if(!c.parentNode||c.parentNode.nodeType==11){a.$g.appendChild(c)}return c.nextSibling};pv.VmlScene.dispatch=function(){var b=window.event;var a=b.srcElement.$scene;if(a){a.scenes.mark.dispatch(b.type,a.scenes,a.index);b.returnValue=false}};pv.VmlScene.area=function(b){var k=b.$g.firstChild;if(!b.length){return k}var n=b[0];if(n.segmented){return this.areaSegment(b)}if(!n.visible){return k}var l=pv.color(n.fillStyle),m=pv.color(n.strokeStyle);if(!l.opacity&&!m.opacity){return k}var c="";for(var g=0;g<b.length;g++){var h=b[g];c+=h.left+","+h.top+" "}for(var f=b.length-1;f>=0;f--){var d=b[f];c+=(d.left+d.width)+","+(d.top+d.height)+" "}k=this.expect("v:polyline",k);var a={root:k};a.root.appendChild(a.fill=this.create("v:fill"));a.root.appendChild(a.stroke=this.create("v:stroke"));a.root.style.cursor=n.cursor;a.root.title=n.title||"";a.root.points=c;a.fill.color=l.color;a.fill.opacity=l.opacity;a.stroke.color=m.color;a.stroke.opacity=m.opacity*Math.min(n.lineWidth,1);a.stroke.weight=n.lineWidth+"px";return this.append(k,b,0)};pv.VmlScene.bar=function(b){var h=b.$g.firstChild;for(var c=0;c<b.length;c++){var d=b[c];if(!d.visible){continue}var g=pv.color(d.fillStyle),f=pv.color(d.strokeStyle);if(!g.opacity&&!f.opacity){continue}h=this.expect("v:rect",h);var a={root:h};a.root.appendChild(a.fill=this.create("v:fill"));a.root.appendChild(a.stroke=this.create("v:stroke"));a.root.style.left=d.left;a.root.style.top=d.top;a.root.style.width=d.width;a.root.style.height=d.height;a.root.style.cursor=d.cursor;a.root.title=d.title||"";a.fill.color=g.color;a.fill.opacity=g.opacity;a.stroke.color=f.color;a.stroke.opacity=f.opacity*Math.min(d.lineWidth,1);a.stroke.weight=d.lineWidth+"px";h=this.append(h,b,c)}return h};pv.VmlScene.dot=function(c){var k=c.$g.firstChild;for(var f=0;f<c.length;f++){var u=c[f];if(!u.visible){continue}var r=pv.color(u.fillStyle),t=pv.color(u.strokeStyle);if(!r.opacity&&!t.opacity){continue}var j=Math.round(Math.sqrt(u.size));var l;switch(u.shape){case"cross":l="m"+-j+","+-j+"l"+j+","+j+"m"+j+","+-j+"l"+-j+","+j;break;case"triangle":var g=j,q=Math.round(j*2/Math.sqrt(3));l="m0,"+g+"l"+q+","+-g+" "+-q+","+-g+"x";break;case"diamond":j=Math.round(j*Math.sqrt(2));l="m0,"+-j+"l"+j+",0 0,"+j+" "+-j+",0x";break;case"square":l="m"+-j+","+-j+"l"+j+","+-j+" "+j+","+j+" "+-j+","+j+"x";break;case"tick":l="m0,0l0,"+-Math.round(u.size);break;default:l="ar-"+j+",-"+j+","+j+","+j+",0,0,0,0x";break}k=this.expect("v:group",k);var b={root:k};b.root.appendChild(b.shape=this.create("v:shape"));b.shape.appendChild(b.path=this.create("v:path"));b.shape.appendChild(b.fill=this.create("v:fill"));b.shape.appendChild(b.stroke=this.create("v:stroke"));var p=c.parent[c.parentIndex];var o=u.angle;if(o){var n=u.left,m=u.top;b.shape.style.left=Math.cos(-o)*n-Math.sin(-o)*m;b.shape.style.top=Math.sin(-o)*n+Math.cos(-o)*m;b.root.style.left=-p.width/2;b.root.style.top=-p.height/2;b.root.style.rotation=180*o/Math.PI;b.shape.style.marginLeft=p.width/2;b.shape.style.marginTop=p.height/2}else{b.root.style.rotation="";b.shape.style.left=u.left;b.shape.style.top=u.top}b.root.style.width=p.width;b.root.style.height=p.height;b.shape.style.width=p.width;b.shape.style.height=p.height;b.shape.style.cursor=u.cursor;b.shape.title=u.title||"";b.path.v=l;b.fill.color=r.color;b.fill.opacity=r.opacity;b.stroke.color=t.color;b.stroke.opacity=t.opacity*Math.min(u.lineWidth,1);b.stroke.weight=u.lineWidth+"px";k=this.append(k,c,f)}return k};pv.VmlScene.image=function(b){var h=b.$g.firstChild;for(var c=0;c<b.length;c++){var d=b[c];if(!d.visible){continue}h=this.expect("v:image",h);var a={root:h};a.root.appendChild(a.fill=this.create("v:fill"));a.root.appendChild(a.stroke=this.create("v:stroke"));a.root.filled=true;a.root.stroked=true;a.root.style.left=d.left;a.root.style.top=d.top;a.root.style.width=d.width;a.root.style.height=d.height;a.root.style.cursor=d.cursor;a.root.src=d.url;a.root.title=d.title||"";var g=pv.color(d.fillStyle);a.fill.color=g.color;a.fill.opacity=g.opacity;var f=pv.color(d.strokeStyle);a.stroke.color=f.color;a.stroke.opacity=f.opacity*Math.min(d.lineWidth,1);a.stroke.weight=d.lineWidth+"px";h=this.append(h,b,c)}return h};pv.VmlScene.label=function(b){var f=b.$g.firstChild;for(var d=0;d<b.length;d++){var o=b[d];if(!o.visible){continue}var l=pv.color(o.textStyle);if(!l.opacity){continue}f=this.expect("v:shape",f);var a={root:f};a.root.appendChild(a.path=this.create("v:path"));a.root.appendChild(a.fill=this.create("v:fill"));a.root.appendChild(a.text=this.create("v:textpath"));a.root.filled=true;a.root.stroked=false;a.root.style.width="100%";a.root.style.height="100%";a.path.textpathok=true;a.text.on=true;var q=0,m=0,n=10;switch(o.textBaseline){case"top":q=Math.round(-Math.sin(o.textAngle)*n);m=Math.round(Math.cos(o.textAngle)*n);break;case"bottom":q=-Math.round(-Math.sin(o.textAngle)*n);m=-Math.round(Math.cos(o.textAngle)*n);break}a.root.style.left=o.left+q;a.root.style.top=o.top+m;a.fill.color=l.color;a.fill.opacity=l.opacity;var h=Math.round(Math.cos(o.textAngle)*1000),g=Math.round(Math.sin(o.textAngle)*1000),k=Math.round(Math.cos(o.textAngle)*o.textMargin),j=Math.round(Math.sin(o.textAngle)*o.textMargin),c;switch(o.textAlign){case"right":c="M"+-h+","+-g+"L"+-k+","+-j;break;case"center":c="M"+-h+","+-g+"L"+h+","+g;break;default:c="M"+k+","+j+"L"+h+","+g;break}a.path.v=c;a.text.style.font=o.font;a.text.style.color="black";a.text.style["alignment-baseline"]="alphabetic";a.text.style["v-text-align"]=o.textAlign;a.text.string=o.text;f=this.append(f,b,d)}return f};pv.VmlScene.line=function(b){var g=b.$g.firstChild;if(b.length<2){return g}var m=b[0];if(m.segmented){return this.lineSegment(b)}if(!m.visible){return g}var k=pv.color(m.fillStyle),l=pv.color(m.strokeStyle);if(!k.opacity&&!l.opacity){return g}var c;for(var d=0;d<b.length;d++){var f=b[d],j=Math.round(f.left),h=Math.round(f.top);if(isNaN(j)){j=0}if(isNaN(h)){h=0}if(!c){c="m"+j+","+h+"l"}else{c+=j+","+h+" "}}g=this.expect("v:shape",g);var a={root:g};a.root.appendChild(a.path=this.create("v:path"));a.root.appendChild(a.fill=this.create("v:fill"));a.root.appendChild(a.stroke=this.create("v:stroke"));a.root.style.width="100%";a.root.style.height="100%";a.root.style.cursor=m.cursor;a.root.title=m.title||"";a.path.v=c;a.fill.color=k.color;a.fill.opacity=k.opacity;a.stroke.color=l.color;a.stroke.opacity=l.opacity*Math.min(m.lineWidth,1);a.stroke.weight=m.lineWidth+"px";return this.append(g,b,0)};pv.VmlScene.panel=function(b){var k=b.$g,l=k&&k.firstChild;for(var d=0;d<b.length;d++){var h=b[d];if(!h.visible){continue}if(!b.parent){h.canvas.style.position="relative";k=h.canvas.firstChild;if(!k){h.canvas.appendChild(k=this.create("v:group"));k.onclick=k.onmousedown=k.onmouseup=k.onmousemove=k.onmouseout=k.onmouseover=pv.VmlScene.dispatch}b.$g=k;var f=h.width+h.left+h.right;var a=h.height+h.top+h.bottom;k.style.position="relative";k.style.width=f;k.style.height=a;k.coordsize=f+","+a;if(typeof l=="undefined"){l=k.firstChild}}l=this.fill(l,b,d);for(var c=0;c<h.children.length;c++){h.children[c].$g=l=this.expect("v:group",l);l.style.position="absolute";l.style.width=h.width;l.style.height=h.height;l.style.left=h.left;l.style.top=h.top;l.coordsize=h.width+","+h.height;this.updateAll(h.children[c]);if(!l.parentNode||l.parentNode.nodeType==11){k.appendChild(l)}l=l.nextSibling}l=this.stroke(l,b,d)}return l};pv.VmlScene.fill=function(g,a,b){var d=a[b],f=pv.color(d.fillStyle);if(f.opacity){g=this.expect("v:rect",g);g.style.left=d.left;g.style.top=d.top;g.style.width=d.width;g.style.height=d.height;g.style.cursor=d.cursor;var h=g.appendChild(this.create("v:fill"));h.color=f.color;h.opacity=f.opacity;g=this.append(g,a,b)}return g};pv.VmlScene.stroke=function(j,a,b){var d=a[b],h=pv.color(d.strokeStyle);if(h.opacity){j=this.expect("v:rect",j);j.style.left=d.left;j.style.top=d.top;j.style.width=d.width;j.style.height=d.height;j.style.cursor=d.cursor;var g=j.appendChild(this.create("v:fill"));g.opacity=0;var k=j.appendChild(this.create("v:stroke"));k.color=h.color;k.opacity=h.opacity*Math.min(d.lineWidth,1);k.weight=d.lineWidth+"px";j=this.append(j,a,b)}return j};pv.VmlScene.rule=function(b){var h=b.$g.firstChild;for(var d=0;d<b.length;d++){var f=b[d];if(!f.visible){continue}var g=pv.color(f.strokeStyle);if(!g.opacity){continue}h=this.expect("v:line",h);var a={root:h};a.root.appendChild(a.stroke=this.create("v:stroke"));a.root.title=f.title;a.root.style.cursor=f.cursor;a.root.from=f.left+","+f.top;a.root.to=(f.left+f.width)+","+(f.top+f.height);var c=pv.color(f.strokeStyle);a.stroke.color=c.color;a.stroke.opacity=c.opacity*Math.min(f.lineWidth,1);a.stroke.weight=f.lineWidth+"px";h=this.append(h,b,d)}return h};pv.VmlScene.wedge=function(c){var j=c.$g.firstChild;for(var h=0;h<c.length;h++){var p=c[h];if(!p.visible){continue}var n=pv.color(p.fillStyle),o=pv.color(p.strokeStyle);if(!n.opacity&&!o.opacity){continue}var g=Math.round(p.innerRadius),f=Math.round(p.outerRadius),k;if(p.angle>=2*Math.PI){if(g){k="AE0,0 "+f+","+f+" 0 23592960AL0,0 "+g+","+g+" 0 23592960"}else{k="AE0,0 "+f+","+f+" 0 23592960"}}else{var m=Math.round(p.startAngle/Math.PI*11796480),l=Math.round(p.angle/Math.PI*11796480);if(g){k="AE 0,0 "+f+","+f+" "+-m+" "+-l+" 0,0 "+g+","+g+" "+-(m+l)+" "+l+"X"}else{k="M0,0AE0,0 "+f+","+f+" "+-m+" "+-l+"X"}}j=this.expect("v:shape",j);var b={root:j};b.root.appendChild(b.path=this.create("v:path"));b.root.appendChild(b.fill=this.create("v:fill"));b.root.appendChild(b.stroke=this.create("v:stroke"));b.root.style.left=p.left;b.root.style.top=p.top;b.root.style.width="100%";b.root.style.height="100%";b.root.style.cursor=p.cursor;b.root.title=p.title||"";b.fill.color=n.color;b.fill.opacity=n.opacity;b.stroke.color=o.color;b.stroke.opacity=o.opacity*Math.min(p.lineWidth,1);b.stroke.weight=p.lineWidth+"px";b.path.v=k;j=this.append(j,c,h)}return j};pv.Scene=document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")?pv.SvgScene:pv.VmlScene;pv.Scene.updateAll=function(a){if(!a.length){return}if((a[0].reverse)&&(a.type!="line")&&(a.type!="area")){var d=pv.extend(a);for(var c=0,b=a.length-1;b>=0;c++,b--){d[c]=a[b]}a=d}this.removeSiblings(this[a.type](a))};pv.Scene.removeSiblings=function(a){while(a){var b=a.nextSibling;a.parentNode.removeChild(a);a=b}};pv.Mark=function(){this.$properties=[]};pv.Mark.prototype.properties={};pv.Mark.prototype.property=function(a){if(!this.hasOwnProperty("properties")){this.properties=pv.extend(this.properties)}this.properties[a]=true;pv.Mark.prototype[a]=function(b){if(arguments.length){this.$properties.push({name:a,type:(typeof b=="function")?3:2,value:b});return this}return this.scene[this.index][a]};return this};pv.Mark.prototype.property("data").property("visible").property("left").property("right").property("top").property("bottom").property("cursor").property("title").property("reverse");pv.Mark.prototype.childIndex=-1;pv.Mark.prototype.index=-1;pv.Mark.prototype.defaults=new pv.Mark().data(function(a){return[a]}).visible(true).reverse(false).cursor("").title("");var defaultFillStyle=pv.Colors.category20().by(pv.parent),defaultStrokeStyle=pv.Colors.category10().by(pv.parent);pv.Mark.prototype.extend=function(a){this.proto=a;return this};pv.Mark.prototype.add=function(a){return this.parent.add(a).extend(this)};pv.Mark.prototype.def=function(a,b){this.$properties.push({name:a,type:(typeof b=="function")?1:0,value:b});return this};pv.Mark.prototype.anchor=function(b){var a=new pv.Anchor().extend(this).name(b);a.parent=this.parent;return a};pv.Mark.prototype.anchorTarget=function(){var a=this;while(!(a instanceof pv.Anchor)){a=a.proto;if(!a){return null}}return a.proto};pv.Mark.prototype.first=function(){return this.scene[0]};pv.Mark.prototype.last=function(){return this.scene[this.scene.length-1]};pv.Mark.prototype.sibling=function(){return(this.index==0)?null:this.scene[this.index-1]};pv.Mark.prototype.cousin=function(){var b=this.parent,a=b&&b.sibling();return(a&&a.children)?a.children[this.childIndex][this.index]:null};pv.Mark.prototype.render=function(){this.bind();this.build();pv.Scene.updateAll(this.scene)};function argv(b){var a=[];while(b){a.push(b.scene[b.index].data);b=b.parent}return a}pv.Mark.prototype.bind=function(){var a={},l=[[],[],[],[]],k,f;function n(r){do{var o=r.$properties;for(var d=o.length-1;d>=0;d--){var q=o[d];if(!(q.name in a)){a[q.name]=1;switch(q.name){case"data":k=q;break;case"visible":f=q;break;default:l[q.type].push(q);break}}}}while(r=r.proto)}function c(d){return function(o){var i=this.scene.defs;if(arguments.length){if(o==undefined){delete i.locked[d]}else{i.locked[d]=true}i.values[d]=o;return this}else{return i.values[d]}}}n(this);n(this.defaults);l[1].reverse();l[3].reverse();var g=this;do{for(var b in g.properties){if(!(b in a)){a[b]=1;l[2].push({name:b,type:2,value:null})}}}while(g=g.proto);var h=l[0].concat(l[1]);for(var j=0;j<h.length;j++){var m=h[j];this[m.name]=c(m.name)}this.binds={data:k,visible:f,defs:h,properties:pv.blend(l)}};pv.Mark.prototype.build=function(){var g=this.scene;if(!g){g=this.scene=[];g.mark=this;g.type=this.type;g.childIndex=this.childIndex;if(this.parent){g.parent=this.parent.scene;g.parentIndex=this.parent.index}}var j=this.root.scene.data;if(!j){this.root.scene.data=j=argv(this.parent)}if(this.binds.defs.length){var b=g.defs;if(!b){g.defs=b={values:{},locked:{}}}for(var f=0;f<this.binds.defs.length;f++){var h=this.binds.defs[f];if(!(h.name in b.locked)){var k=h.value;if(h.type==1){property=h.name;k=k.apply(this,j)}b.values[h.name]=k}}}var c=this.binds.data;switch(c.type){case 0:case 1:c=b.values.data;break;case 2:c=c.value;break;case 3:property="data";c=c.value.apply(this,j);break}j.unshift(null);g.length=c.length;for(var f=0;f<c.length;f++){pv.Mark.prototype.index=this.index=f;var l=g[f];if(!l){g[f]=l={}}l.data=j[0]=c[f];var a=this.binds.visible;switch(a.type){case 0:case 1:a=b.values.visible;break;case 2:a=a.value;break;case 3:property="visible";a=a.value.apply(this,j);break}if(l.visible=a){this.buildInstance(l)}}j.shift();delete this.index;pv.Mark.prototype.index=-1;if(!this.parent){g.data=null}return this};pv.Mark.prototype.buildProperties=function(d,c){for(var b=0,g=c.length;b<g;b++){var f=c[b],a=f.value;switch(f.type){case 0:case 1:a=this.scene.defs.values[f.name];break;case 3:property=f.name;a=a.apply(this,this.root.scene.data);break}d[f.name]=a}};pv.Mark.prototype.buildInstance=function(a){this.buildProperties(a,this.binds.properties);this.buildImplied(a)};pv.Mark.prototype.buildImplied=function(n){var f=n.left;var a=n.right;var m=n.top;var i=n.bottom;var d=this.properties;var j=d.width?n.width:0;var g=d.height?n.height:0;var c=this.parent?this.parent.width():(j+f+a);if(j==null){j=c-(a=a||0)-(f=f||0)}else{if(a==null){a=c-j-(f=f||0)}else{if(f==null){f=c-j-(a=a||0)}}}var k=this.parent?this.parent.height():(g+m+i);if(g==null){g=k-(m=m||0)-(i=i||0)}else{if(i==null){i=k-g-(m=m||0)}else{if(m==null){m=k-g-(i=i||0)}}}n.left=f;n.right=a;n.top=m;n.bottom=i;if(d.width){n.width=j}if(d.height){n.height=g}};var property;var pageX=0,pageY=0;pv.listen(document,"mousemove",function(c){c=c||window.event;pageX=c.pageX;pageY=c.pageY;if(pageX==undefined&&c.clientX!=undefined){var b=document.documentElement,a=document.body;pageX=c.clientX+(b&&b.scrollLeft||a&&a.scrollLeft||0)-(b&&b.clientLeft||a&&a.clientLeft||0);pageY=c.clientY+(b&&b.scrollTop||a&&a.scrollTop||0)-(b&&b.clientTop||a&&a.clientTop||0)}});pv.Mark.prototype.mouse=function(){var a=0,d=0,c=(this instanceof pv.Panel)?this:this.parent;do{a+=c.left();d+=c.top()}while(c=c.parent);var b=this.root.canvas();do{a+=b.offsetLeft;d+=b.offsetTop}while(b=b.offsetParent);return pv.vector(pageX-a,pageY-d)};pv.Mark.prototype.event=function(b,a){if(!this.$handlers){this.$handlers={}}this.$handlers[b]=a;return this};pv.Mark.prototype.dispatch=function(d,a,c){var b=this.$handlers&&this.$handlers[d];if(!b){if(this.parent){this.parent.dispatch(d,a.parent,a.parentIndex)}return}try{var f=this;do{f.index=c;f.scene=a;c=a.parentIndex;a=a.parent}while(f=f.parent);try{f=b.apply(this,this.root.scene.data=argv(this))}finally{this.root.scene.data=null}if(f instanceof pv.Mark){f.render()}}finally{var f=this;do{if(f.parent){delete f.scene}delete f.index}while(f=f.parent)}};pv.Anchor=function(){pv.Mark.call(this)};pv.Anchor.prototype=pv.extend(pv.Mark).property("name");pv.Area=function(){pv.Mark.call(this)};pv.Area.prototype=pv.extend(pv.Mark).property("width").property("height").property("lineWidth").property("strokeStyle").property("fillStyle").property("segmented").property("interpolate");pv.Area.prototype.type="area";pv.Area.prototype.defaults=new pv.Area().extend(pv.Mark.prototype.defaults).lineWidth(1.5).fillStyle(defaultFillStyle).interpolate("linear");pv.Area.prototype.anchor=function(a){var b=this;return pv.Mark.prototype.anchor.call(this,a).left(function(){switch(this.name()){case"bottom":case"top":case"center":return b.left()+b.width()/2;case"right":return b.left()+b.width()}return null}).right(function(){switch(this.name()){case"bottom":case"top":case"center":return b.right()+b.width()/2;case"left":return b.right()+b.width()}return null}).top(function(){switch(this.name()){case"left":case"right":case"center":return b.top()+b.height()/2;case"bottom":return b.top()+b.height()}return null}).bottom(function(){switch(this.name()){case"left":case"right":case"center":return b.bottom()+b.height()/2;case"top":return b.bottom()+b.height()}return null}).textAlign(function(){switch(this.name()){case"bottom":case"top":case"center":return"center";case"right":return"right"}return"left"}).textBaseline(function(){switch(this.name()){case"right":case"left":case"center":return"middle";case"top":return"top"}return"bottom"})};pv.Area.prototype.buildImplied=function(a){if(a.height==null){a.height=0}if(a.width==null){a.width=0}pv.Mark.prototype.buildImplied.call(this,a)};var pv_Area_specials={left:1,top:1,right:1,bottom:1,width:1,height:1,name:1};pv.Area.prototype.bind=function(){pv.Mark.prototype.bind.call(this);var d=this.binds,c=d.properties,a=d.specials=[];for(var b=0,g=c.length;b<g;b++){var f=c[b];if(f.name in pv_Area_specials){a.push(f)}}};pv.Area.prototype.buildInstance=function(a){if(this.index&&!this.scene[0].segmented){this.buildProperties(a,this.binds.specials);this.buildImplied(a)}else{pv.Mark.prototype.buildInstance.call(this,a)}};pv.Bar=function(){pv.Mark.call(this)};pv.Bar.prototype=pv.extend(pv.Mark).property("width").property("height").property("lineWidth").property("strokeStyle").property("fillStyle");pv.Bar.prototype.type="bar";pv.Bar.prototype.defaults=new pv.Bar().extend(pv.Mark.prototype.defaults).lineWidth(1.5).fillStyle(defaultFillStyle);pv.Bar.prototype.anchor=function(a){var b=this;return pv.Mark.prototype.anchor.call(this,a).left(function(){switch(this.name()){case"bottom":case"top":case"center":return b.left()+(this.properties.width?0:(b.width()/2));case"right":return b.left()+b.width()}return null}).right(function(){switch(this.name()){case"bottom":case"top":case"center":return b.right()+(this.properties.width?0:(b.width()/2));case"left":return b.right()+b.width()}return null}).top(function(){switch(this.name()){case"left":case"right":case"center":return b.top()+(this.properties.height?0:(b.height()/2));case"bottom":return b.top()+b.height()}return null}).bottom(function(){switch(this.name()){case"left":case"right":case"center":return b.bottom()+(this.properties.height?0:(b.height()/2));case"top":return b.bottom()+b.height()}return null}).textAlign(function(){switch(this.name()){case"bottom":case"top":case"center":return"center";case"right":return"right"}return"left"}).textBaseline(function(){switch(this.name()){case"right":case"left":case"center":return"middle";case"top":return"top"}return"bottom"})};pv.Dot=function(){pv.Mark.call(this)};pv.Dot.prototype=pv.extend(pv.Mark).property("size").property("shape").property("angle").property("lineWidth").property("strokeStyle").property("fillStyle");pv.Dot.prototype.type="dot";pv.Dot.prototype.defaults=new pv.Dot().extend(pv.Mark.prototype.defaults).size(20).shape("circle").lineWidth(1.5).strokeStyle(defaultStrokeStyle);pv.Dot.prototype.anchor=function(b){var a=this;return pv.Mark.prototype.anchor.call(this,b).left(function(c){switch(this.name()){case"bottom":case"top":case"center":return a.left();case"right":return a.left()+a.radius()}return null}).right(function(c){switch(this.name()){case"bottom":case"top":case"center":return a.right();case"left":return a.right()+a.radius()}return null}).top(function(c){switch(this.name()){case"left":case"right":case"center":return a.top();case"bottom":return a.top()+a.radius()}return null}).bottom(function(c){switch(this.name()){case"left":case"right":case"center":return a.bottom();case"top":return a.bottom()+a.radius()}return null}).textAlign(function(c){switch(this.name()){case"left":return"right";case"bottom":case"top":case"center":return"center"}return"left"}).textBaseline(function(c){switch(this.name()){case"right":case"left":case"center":return"middle";case"bottom":return"top"}return"bottom"})};pv.Dot.prototype.radius=function(){return Math.sqrt(this.size())};pv.Label=function(){pv.Mark.call(this)};pv.Label.prototype=pv.extend(pv.Mark).property("text").property("font").property("textAngle").property("textStyle").property("textAlign").property("textBaseline").property("textMargin").property("textShadow");pv.Label.prototype.type="label";pv.Label.prototype.defaults=new pv.Label().extend(pv.Mark.prototype.defaults).text(pv.identity).font("10px sans-serif").textAngle(0).textStyle("black").textAlign("left").textBaseline("bottom").textMargin(3);pv.Line=function(){pv.Mark.call(this)};pv.Line.prototype=pv.extend(pv.Mark).property("lineWidth").property("strokeStyle").property("fillStyle").property("segmented").property("interpolate");pv.Line.prototype.type="line";pv.Line.prototype.defaults=new pv.Line().extend(pv.Mark.prototype.defaults).lineWidth(1.5).strokeStyle(defaultStrokeStyle).interpolate("linear");var pv_Line_specials={left:1,top:1,right:1,bottom:1,name:1};pv.Line.prototype.bind=function(){pv.Mark.prototype.bind.call(this);var d=this.binds,c=d.properties,a=d.specials=[];for(var b=0,g=c.length;b<g;b++){var f=c[b];if(f.name in pv_Line_specials){a.push(f)}}};pv.Line.prototype.buildInstance=function(a){if(this.index&&!this.scene[0].segmented){this.buildProperties(a,this.binds.specials);this.buildImplied(a)}else{pv.Mark.prototype.buildInstance.call(this,a)}};pv.Rule=function(){pv.Mark.call(this)};pv.Rule.prototype=pv.extend(pv.Mark).property("width").property("height").property("lineWidth").property("strokeStyle");pv.Rule.prototype.type="rule";pv.Rule.prototype.defaults=new pv.Rule().extend(pv.Mark.prototype.defaults).lineWidth(1).strokeStyle("black");pv.Rule.prototype.anchor=function(a){return pv.Bar.prototype.anchor.call(this,a).textAlign(function(b){switch(this.name()){case"left":return"right";case"bottom":case"top":case"center":return"center";case"right":return"left"}}).textBaseline(function(b){switch(this.name()){case"right":case"left":case"center":return"middle";case"top":return"bottom";case"bottom":return"top"}})};pv.Rule.prototype.buildImplied=function(f){var c=f.left,g=f.right,d=f.top,a=f.bottom;if((f.width!=null)||((c==null)&&(g==null))||((g!=null)&&(c!=null))){f.height=0}else{f.width=0}pv.Mark.prototype.buildImplied.call(this,f)};pv.Panel=function(){pv.Bar.call(this);this.children=[];this.root=this;this.$dom=pv.Panel.$dom};pv.Panel.prototype=pv.extend(pv.Bar).property("canvas").property("overflow");pv.Panel.prototype.type="panel";pv.Panel.prototype.defaults=new pv.Panel().extend(pv.Bar.prototype.defaults).fillStyle(null).overflow("visible");pv.Panel.prototype.anchor=function(b){function c(){return 0}c.prototype=this;c.prototype.left=c.prototype.right=c.prototype.top=c.prototype.bottom=c;var a=pv.Bar.prototype.anchor.call(new c(),b).data(function(f){return[f]});a.parent=this;return a};pv.Panel.prototype.add=function(a){var b=new a();b.parent=this;b.root=this.root;b.childIndex=this.children.length;this.children.push(b);return b};pv.Panel.prototype.bind=function(){pv.Mark.prototype.bind.call(this);for(var a=0;a<this.children.length;a++){this.children[a].bind()}};pv.Panel.prototype.buildInstance=function(b){pv.Bar.prototype.buildInstance.call(this,b);if(!b.children){b.children=[]}for(var a=0;a<this.children.length;a++){this.children[a].scene=b.children[a];this.children[a].build()}for(var a=0;a<this.children.length;a++){b.children[a]=this.children[a].scene;delete this.children[a].scene}b.children.length=this.children.length};pv.Panel.prototype.buildImplied=function(d){if(!this.parent){var g=d.canvas;if(g){if(typeof g=="string"){g=document.getElementById(g)}if(g.$panel!=this){g.$panel=this;g.innerHTML=""}var a,b;if(d.width==null){a=parseFloat(pv.css(g,"width"));d.width=a-d.left-d.right}if(d.height==null){b=parseFloat(pv.css(g,"height"));d.height=b-d.top-d.bottom}}else{if(d.$canvas){g=d.$canvas}else{function f(){var c=document.body;while(c.lastChild&&c.lastChild.tagName){c=c.lastChild}return(c==document.body)?c:c.parentNode}g=d.$canvas=document.createElement("span");this.$dom?this.$dom.parentNode.insertBefore(g,this.$dom):f().appendChild(g)}}d.canvas=g}pv.Bar.prototype.buildImplied.call(this,d)};pv.Image=function(){pv.Bar.call(this)};pv.Image.prototype=pv.extend(pv.Bar).property("url");pv.Image.prototype.type="image";pv.Image.prototype.defaults=new pv.Image().extend(pv.Bar.prototype.defaults).fillStyle(null);pv.Wedge=function(){pv.Mark.call(this)};pv.Wedge.prototype=pv.extend(pv.Mark).property("startAngle").property("endAngle").property("angle").property("innerRadius").property("outerRadius").property("lineWidth").property("strokeStyle").property("fillStyle");pv.Wedge.prototype.type="wedge";pv.Wedge.prototype.defaults=new pv.Wedge().extend(pv.Mark.prototype.defaults).startAngle(function(){var a=this.sibling();return a?a.endAngle:-Math.PI/2}).innerRadius(0).lineWidth(1.5).strokeStyle(null).fillStyle(defaultFillStyle.by(pv.index));pv.Wedge.prototype.midRadius=function(){return(this.innerRadius()+this.outerRadius())/2};pv.Wedge.prototype.midAngle=function(){return(this.startAngle()+this.endAngle())/2};pv.Wedge.prototype.anchor=function(b){var a=this;return pv.Mark.prototype.anchor.call(this,b).left(function(){switch(this.name()){case"outer":return a.left()+a.outerRadius()*Math.cos(a.midAngle());case"inner":return a.left()+a.innerRadius()*Math.cos(a.midAngle());case"start":return a.left()+a.midRadius()*Math.cos(a.startAngle());case"center":return a.left()+a.midRadius()*Math.cos(a.midAngle());case"end":return a.left()+a.midRadius()*Math.cos(a.endAngle())}}).right(function(){switch(this.name()){case"outer":return a.right()+a.outerRadius()*Math.cos(a.midAngle());case"inner":return a.right()+a.innerRadius()*Math.cos(a.midAngle());case"start":return a.right()+a.midRadius()*Math.cos(a.startAngle());case"center":return a.right()+a.midRadius()*Math.cos(a.midAngle());case"end":return a.right()+a.midRadius()*Math.cos(a.endAngle())}}).top(function(){switch(this.name()){case"outer":return a.top()+a.outerRadius()*Math.sin(a.midAngle());case"inner":return a.top()+a.innerRadius()*Math.sin(a.midAngle());case"start":return a.top()+a.midRadius()*Math.sin(a.startAngle());case"center":return a.top()+a.midRadius()*Math.sin(a.midAngle());case"end":return a.top()+a.midRadius()*Math.sin(a.endAngle())}}).bottom(function(){switch(this.name()){case"outer":return a.bottom()+a.outerRadius()*Math.sin(a.midAngle());case"inner":return a.bottom()+a.innerRadius()*Math.sin(a.midAngle());case"start":return a.bottom()+a.midRadius()*Math.sin(a.startAngle());case"center":return a.bottom()+a.midRadius()*Math.sin(a.midAngle());case"end":return a.bottom()+a.midRadius()*Math.sin(a.endAngle())}}).textAlign(function(){switch(this.name()){case"outer":return pv.Wedge.upright(a.midAngle())?"right":"left";case"inner":return pv.Wedge.upright(a.midAngle())?"left":"right"}return"center"}).textBaseline(function(){switch(this.name()){case"start":return pv.Wedge.upright(a.startAngle())?"top":"bottom";case"end":return pv.Wedge.upright(a.endAngle())?"bottom":"top"}return"middle"}).textAngle(function(){var c=0;switch(this.name()){case"center":case"inner":case"outer":c=a.midAngle();break;case"start":c=a.startAngle();break;case"end":c=a.endAngle();break}return pv.Wedge.upright(c)?c:(c+Math.PI)})};pv.Wedge.upright=function(a){a=a%(2*Math.PI);a=(a<0)?(2*Math.PI+a):a;return(a<Math.PI/2)||(a>3*Math.PI/2)};pv.Wedge.prototype.buildImplied=function(a){pv.Mark.prototype.buildImplied.call(this,a);if(a.endAngle==null){a.endAngle=a.startAngle+a.angle}if(a.angle==null){a.angle=a.endAngle-a.startAngle}};pv.Layout={};pv.Layout.grid=function(d){var c=d.length,f=d[0].length;function a(){return this.parent.width()/f}function b(){return this.parent.height()/c}return new pv.Mark().data(pv.blend(d)).left(function(){return a.call(this)*(this.index%f)}).top(function(){return b.call(this)*Math.floor(this.index/f)}).width(a).height(b)};pv.Layout.stack=function(){var b=function(){return 0};function a(){var d=this.parent.index,f,g;while((d-->0)&&!g){f=this.parent.scene[d];if(f.visible){g=f.children[this.childIndex][this.index]}}if(g){switch(property){case"bottom":return g.bottom+g.height;case"top":return g.top+g.height;case"left":return g.left+g.width;case"right":return g.right+g.width}}return b.apply(this,arguments)}a.offset=function(c){b=(c instanceof Function)?c:function(){return c};return this};return a};pv.Layout.icicle=function(l){var j=[],c=Number;function k(p){var o={size:0,children:[],keys:j.slice()};for(var n in p){var q=p[n],m=c(q);j.push(n);if(isNaN(m)){q=k(q)}else{q={size:m,data:q,keys:j.slice()}}o.children.push(q);o.size+=q.size;j.pop()}o.children.sort(function(s,r){return r.size-s.size});return o}function d(o,m){o.size*=m;if(o.children){for(var n=0;n<o.children.length;n++){d(o.children[n],m)}}}function h(n,m){m=m?(m+1):1;return n.children?pv.max(n.children,function(o){return h(o,m)}):m}function i(n){if(n.children){b(n);for(var m=0;m<n.children.length;m++){i(n.children[m])}}}function b(o){var p=o.left;for(var m=0;m<o.children.length;m++){var q=o.children[m],n=(q.size/o.size)*o.width;q.left=p;q.top=o.top+o.height;q.width=n;q.height=o.height;q.depth=o.depth+1;p+=n;if(q.children){b(q)}}}function a(n,o){if(n.children){for(var m=0;m<n.children.length;m++){a(n.children[m],o)}}o.push(n);return o}function g(){var m=k(l);m.top=0;m.left=0;m.width=this.parent.width();m.height=this.parent.height()/h(m);m.depth=0;i(m);return a(m,[]).reverse()}var f=new pv.Mark().data(g).left(function(m){return m.left}).top(function(m){return m.top}).width(function(m){return m.width}).height(function(m){return m.height});f.root=function(m){j=[m];return this};f.size=function(m){c=m;return this};return f};pv.Layout.sunburst=function(p){var n=[],d=Number,m,k,c;function o(s){var r={size:0,children:[],keys:n.slice()};for(var q in s){var t=s[q],h=d(t);n.push(q);if(isNaN(h)){t=o(t)}else{t={size:h,data:t,keys:n.slice()}}r.children.push(t);r.size+=t.size;n.pop()}r.children.sort(function(v,u){return u.size-v.size});return r}function f(r,h){r.size*=h;if(r.children){for(var q=0;q<r.children.length;q++){f(r.children[q],h)}}}function j(q,h){h=h?(h+1):1;return q.children?pv.max(q.children,function(r){return j(r,h)}):h}function l(q){if(q.children){b(q);for(var h=0;h<q.children.length;h++){l(q.children[h])}}}function b(r){var q=r.startAngle;for(var h=0;h<r.children.length;h++){var t=r.children[h],s=(t.size/r.size)*r.angle;t.startAngle=q;t.angle=s;t.endAngle=q+s;t.depth=r.depth+1;t.left=m/2;t.top=k/2;t.innerRadius=Math.max(0,t.depth-0.5)*c;t.outerRadius=(t.depth+0.5)*c;q+=s;if(t.children){b(t)}}}function a(q,r){if(q.children){for(var h=0;h<q.children.length;h++){a(q.children[h],r)}}r.push(q);return r}function i(){var h=o(p);m=this.parent.width();k=this.parent.height();c=Math.min(m,k)/2/(j(h)-0.5);h.left=m/2;h.top=k/2;h.startAngle=0;h.angle=2*Math.PI;h.endAngle=2*Math.PI;h.innerRadius=0;h.outerRadius=c;h.depth=0;l(h);return a(h,[]).reverse()}var g=new pv.Mark().data(i).left(function(h){return h.left}).top(function(h){return h.top}).startAngle(function(h){return h.startAngle}).angle(function(h){return h.angle}).innerRadius(function(h){return h.innerRadius}).outerRadius(function(h){return h.outerRadius});g.root=function(h){n=[h];return this};g.size=function(h){d=h;return this};return g};pv.Layout.treemap=function(o){var k=[],l,n,c=Number;function b(p){return l?Math.round(p):p}function m(s){var r={size:0,children:[],keys:k.slice()};for(var q in s){var t=s[q],p=c(t);k.push(q);if(isNaN(p)){t=m(t)}else{t={size:p,data:t,keys:k.slice()}}r.children.push(t);r.size+=t.size;k.pop()}r.children.sort(function(v,u){return v.size-u.size});return r}function d(r,p){r.size*=p;if(r.children){for(var q=0;q<r.children.length;q++){d(r.children[q],p)}}}function j(w,p){var x=-Infinity,q=Infinity,u=0;for(var t=0;t<w.length;t++){var v=w[t].size;if(v<q){q=v}if(v>x){x=v}u+=v}u=u*u;p=p*p;return Math.max(p*x/u,u/(p*q))}function h(r){var E=[],A=Infinity;var C=r.left+(n?n.left:0),B=r.top+(n?n.top:0),D=r.width-(n?n.left+n.right:0),z=r.height-(n?n.top+n.bottom:0),s=Math.min(D,z);d(r,D*z/r.size);function v(H){var F=pv.sum(H,function(J){return J.size}),y=(s==0)?0:b(F/s);for(var x=0,G=0;x<H.length;x++){var I=H[x],w=b(I.size/y);if(D==s){I.left=C+G;I.top=B;I.width=w;I.height=y}else{I.left=C;I.top=B+G;I.width=y;I.height=w}G+=w}if(D==s){if(I){I.width+=D-G}B+=y;z-=y}else{if(I){I.height+=z-G}C+=y;D-=y}s=Math.min(D,z)}var q=r.children.slice();while(q.length>0){var p=q[q.length-1];if(p.size<=0){q.pop();continue}E.push(p);var t=j(E,s);if(t<=A){q.pop();A=t}else{E.pop();v(E);E.length=0;A=Infinity}}if(E.length>0){v(E)}if(D==s){for(var u=0;u<E.length;u++){E[u].width+=D}}else{for(var u=0;u<E.length;u++){E[u].height+=z}}}function i(q){if(q.children){h(q);for(var p=0;p<q.children.length;p++){var r=q.children[p];r.depth=q.depth+1;i(r)}}}function a(q,r){if(q.children){for(var p=0;p<q.children.length;p++){a(q.children[p],r)}}if(n||!q.children){r.push(q)}return r}function g(){var p=m(o);p.left=0;p.top=0;p.width=this.parent.width();p.height=this.parent.height();p.depth=0;i(p);return a(p,[]).reverse()}var f=new pv.Mark().data(g).left(function(p){return p.left}).top(function(p){return p.top}).width(function(p){return p.width}).height(function(p){return p.height});f.round=function(p){l=p;return this};f.inset=function(s,q,p,r){if(arguments.length==1){q=p=r=s}n={top:s,right:q,bottom:p,left:r};return this};f.root=function(p){k=[p];return this};f.size=function(p){c=p;return this};return f}; return pv;}();pv.listen(window,"load",function(){pv.$={i:0,x:document.getElementsByTagName("script")};for(;pv.$.i<pv.$.x.length;pv.$.i++){pv.$.s=pv.Panel.$dom=pv.$.x[pv.$.i];if(pv.$.s.type=="text/javascript+protovis"){try{window.eval(pv.parse(pv.$.s.textContent||pv.$.s.innerHTML))}catch(e){pv.error(e)}}}delete pv.Panel.$dom;delete pv.$});/*!
 * jQuery JavaScript Library v1.4.1
 * http://jquery.com/
 *
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2010, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Jan 25 19:43:33 2010 -0500
 */
(function(z,v){function la(){if(!c.isReady){try{r.documentElement.doScroll("left")}catch(a){setTimeout(la,1);return}c.ready()}}function Ma(a,b){b.src?c.ajax({url:b.src,async:false,dataType:"script"}):c.globalEval(b.text||b.textContent||b.innerHTML||"");b.parentNode&&b.parentNode.removeChild(b)}function X(a,b,d,f,e,i){var j=a.length;if(typeof b==="object"){for(var n in b)X(a,n,b[n],f,e,d);return a}if(d!==v){f=!i&&f&&c.isFunction(d);for(n=0;n<j;n++)e(a[n],b,f?d.call(a[n],n,e(a[n],b)):d,i);return a}return j?
e(a[0],b):null}function J(){return(new Date).getTime()}function Y(){return false}function Z(){return true}function ma(a,b,d){d[0].type=a;return c.event.handle.apply(b,d)}function na(a){var b,d=[],f=[],e=arguments,i,j,n,o,m,s,x=c.extend({},c.data(this,"events").live);if(!(a.button&&a.type==="click")){for(o in x){j=x[o];if(j.live===a.type||j.altLive&&c.inArray(a.type,j.altLive)>-1){i=j.data;i.beforeFilter&&i.beforeFilter[a.type]&&!i.beforeFilter[a.type](a)||f.push(j.selector)}else delete x[o]}i=c(a.target).closest(f,
a.currentTarget);m=0;for(s=i.length;m<s;m++)for(o in x){j=x[o];n=i[m].elem;f=null;if(i[m].selector===j.selector){if(j.live==="mouseenter"||j.live==="mouseleave")f=c(a.relatedTarget).closest(j.selector)[0];if(!f||f!==n)d.push({elem:n,fn:j})}}m=0;for(s=d.length;m<s;m++){i=d[m];a.currentTarget=i.elem;a.data=i.fn.data;if(i.fn.apply(i.elem,e)===false){b=false;break}}return b}}function oa(a,b){return"live."+(a?a+".":"")+b.replace(/\./g,"`").replace(/ /g,"&")}function pa(a){return!a||!a.parentNode||a.parentNode.nodeType===
11}function qa(a,b){var d=0;b.each(function(){if(this.nodeName===(a[d]&&a[d].nodeName)){var f=c.data(a[d++]),e=c.data(this,f);if(f=f&&f.events){delete e.handle;e.events={};for(var i in f)for(var j in f[i])c.event.add(this,i,f[i][j],f[i][j].data)}}})}function ra(a,b,d){var f,e,i;if(a.length===1&&typeof a[0]==="string"&&a[0].length<512&&a[0].indexOf("<option")<0&&(c.support.checkClone||!sa.test(a[0]))){e=true;if(i=c.fragments[a[0]])if(i!==1)f=i}if(!f){b=b&&b[0]?b[0].ownerDocument||b[0]:r;f=b.createDocumentFragment();
c.clean(a,b,f,d)}if(e)c.fragments[a[0]]=i?f:1;return{fragment:f,cacheable:e}}function K(a,b){var d={};c.each(ta.concat.apply([],ta.slice(0,b)),function(){d[this]=a});return d}function ua(a){return"scrollTo"in a&&a.document?a:a.nodeType===9?a.defaultView||a.parentWindow:false}var c=function(a,b){return new c.fn.init(a,b)},Na=z.jQuery,Oa=z.$,r=z.document,S,Pa=/^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/,Qa=/^.[^:#\[\.,]*$/,Ra=/\S/,Sa=/^(\s|\u00A0)+|(\s|\u00A0)+$/g,Ta=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,O=navigator.userAgent,
va=false,P=[],L,$=Object.prototype.toString,aa=Object.prototype.hasOwnProperty,ba=Array.prototype.push,Q=Array.prototype.slice,wa=Array.prototype.indexOf;c.fn=c.prototype={init:function(a,b){var d,f;if(!a)return this;if(a.nodeType){this.context=this[0]=a;this.length=1;return this}if(typeof a==="string")if((d=Pa.exec(a))&&(d[1]||!b))if(d[1]){f=b?b.ownerDocument||b:r;if(a=Ta.exec(a))if(c.isPlainObject(b)){a=[r.createElement(a[1])];c.fn.attr.call(a,b,true)}else a=[f.createElement(a[1])];else{a=ra([d[1]],
[f]);a=(a.cacheable?a.fragment.cloneNode(true):a.fragment).childNodes}}else{if(b=r.getElementById(d[2])){if(b.id!==d[2])return S.find(a);this.length=1;this[0]=b}this.context=r;this.selector=a;return this}else if(!b&&/^\w+$/.test(a)){this.selector=a;this.context=r;a=r.getElementsByTagName(a)}else return!b||b.jquery?(b||S).find(a):c(b).find(a);else if(c.isFunction(a))return S.ready(a);if(a.selector!==v){this.selector=a.selector;this.context=a.context}return c.isArray(a)?this.setArray(a):c.makeArray(a,
this)},selector:"",jquery:"1.4.1",length:0,size:function(){return this.length},toArray:function(){return Q.call(this,0)},get:function(a){return a==null?this.toArray():a<0?this.slice(a)[0]:this[a]},pushStack:function(a,b,d){a=c(a||null);a.prevObject=this;a.context=this.context;if(b==="find")a.selector=this.selector+(this.selector?" ":"")+d;else if(b)a.selector=this.selector+"."+b+"("+d+")";return a},setArray:function(a){this.length=0;ba.apply(this,a);return this},each:function(a,b){return c.each(this,
a,b)},ready:function(a){c.bindReady();if(c.isReady)a.call(r,c);else P&&P.push(a);return this},eq:function(a){return a===-1?this.slice(a):this.slice(a,+a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(Q.apply(this,arguments),"slice",Q.call(arguments).join(","))},map:function(a){return this.pushStack(c.map(this,function(b,d){return a.call(b,d,b)}))},end:function(){return this.prevObject||c(null)},push:ba,sort:[].sort,splice:[].splice};
c.fn.init.prototype=c.fn;c.extend=c.fn.extend=function(){var a=arguments[0]||{},b=1,d=arguments.length,f=false,e,i,j,n;if(typeof a==="boolean"){f=a;a=arguments[1]||{};b=2}if(typeof a!=="object"&&!c.isFunction(a))a={};if(d===b){a=this;--b}for(;b<d;b++)if((e=arguments[b])!=null)for(i in e){j=a[i];n=e[i];if(a!==n)if(f&&n&&(c.isPlainObject(n)||c.isArray(n))){j=j&&(c.isPlainObject(j)||c.isArray(j))?j:c.isArray(n)?[]:{};a[i]=c.extend(f,j,n)}else if(n!==v)a[i]=n}return a};c.extend({noConflict:function(a){z.$=
Oa;if(a)z.jQuery=Na;return c},isReady:false,ready:function(){if(!c.isReady){if(!r.body)return setTimeout(c.ready,13);c.isReady=true;if(P){for(var a,b=0;a=P[b++];)a.call(r,c);P=null}c.fn.triggerHandler&&c(r).triggerHandler("ready")}},bindReady:function(){if(!va){va=true;if(r.readyState==="complete")return c.ready();if(r.addEventListener){r.addEventListener("DOMContentLoaded",L,false);z.addEventListener("load",c.ready,false)}else if(r.attachEvent){r.attachEvent("onreadystatechange",L);z.attachEvent("onload",
c.ready);var a=false;try{a=z.frameElement==null}catch(b){}r.documentElement.doScroll&&a&&la()}}},isFunction:function(a){return $.call(a)==="[object Function]"},isArray:function(a){return $.call(a)==="[object Array]"},isPlainObject:function(a){if(!a||$.call(a)!=="[object Object]"||a.nodeType||a.setInterval)return false;if(a.constructor&&!aa.call(a,"constructor")&&!aa.call(a.constructor.prototype,"isPrototypeOf"))return false;var b;for(b in a);return b===v||aa.call(a,b)},isEmptyObject:function(a){for(var b in a)return false;
return true},error:function(a){throw a;},parseJSON:function(a){if(typeof a!=="string"||!a)return null;if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return z.JSON&&z.JSON.parse?z.JSON.parse(a):(new Function("return "+a))();else c.error("Invalid JSON: "+a)},noop:function(){},globalEval:function(a){if(a&&Ra.test(a)){var b=r.getElementsByTagName("head")[0]||
r.documentElement,d=r.createElement("script");d.type="text/javascript";if(c.support.scriptEval)d.appendChild(r.createTextNode(a));else d.text=a;b.insertBefore(d,b.firstChild);b.removeChild(d)}},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,b,d){var f,e=0,i=a.length,j=i===v||c.isFunction(a);if(d)if(j)for(f in a){if(b.apply(a[f],d)===false)break}else for(;e<i;){if(b.apply(a[e++],d)===false)break}else if(j)for(f in a){if(b.call(a[f],f,a[f])===false)break}else for(d=
a[0];e<i&&b.call(d,e,d)!==false;d=a[++e]);return a},trim:function(a){return(a||"").replace(Sa,"")},makeArray:function(a,b){b=b||[];if(a!=null)a.length==null||typeof a==="string"||c.isFunction(a)||typeof a!=="function"&&a.setInterval?ba.call(b,a):c.merge(b,a);return b},inArray:function(a,b){if(b.indexOf)return b.indexOf(a);for(var d=0,f=b.length;d<f;d++)if(b[d]===a)return d;return-1},merge:function(a,b){var d=a.length,f=0;if(typeof b.length==="number")for(var e=b.length;f<e;f++)a[d++]=b[f];else for(;b[f]!==
v;)a[d++]=b[f++];a.length=d;return a},grep:function(a,b,d){for(var f=[],e=0,i=a.length;e<i;e++)!d!==!b(a[e],e)&&f.push(a[e]);return f},map:function(a,b,d){for(var f=[],e,i=0,j=a.length;i<j;i++){e=b(a[i],i,d);if(e!=null)f[f.length]=e}return f.concat.apply([],f)},guid:1,proxy:function(a,b,d){if(arguments.length===2)if(typeof b==="string"){d=a;a=d[b];b=v}else if(b&&!c.isFunction(b)){d=b;b=v}if(!b&&a)b=function(){return a.apply(d||this,arguments)};if(a)b.guid=a.guid=a.guid||b.guid||c.guid++;return b},
uaMatch:function(a){a=a.toLowerCase();a=/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version)?[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||!/compatible/.test(a)&&/(mozilla)(?:.*? rv:([\w.]+))?/.exec(a)||[];return{browser:a[1]||"",version:a[2]||"0"}},browser:{}});O=c.uaMatch(O);if(O.browser){c.browser[O.browser]=true;c.browser.version=O.version}if(c.browser.webkit)c.browser.safari=true;if(wa)c.inArray=function(a,b){return wa.call(b,a)};S=c(r);if(r.addEventListener)L=function(){r.removeEventListener("DOMContentLoaded",
L,false);c.ready()};else if(r.attachEvent)L=function(){if(r.readyState==="complete"){r.detachEvent("onreadystatechange",L);c.ready()}};(function(){c.support={};var a=r.documentElement,b=r.createElement("script"),d=r.createElement("div"),f="script"+J();d.style.display="none";d.innerHTML="   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";var e=d.getElementsByTagName("*"),i=d.getElementsByTagName("a")[0];if(!(!e||!e.length||!i)){c.support=
{leadingWhitespace:d.firstChild.nodeType===3,tbody:!d.getElementsByTagName("tbody").length,htmlSerialize:!!d.getElementsByTagName("link").length,style:/red/.test(i.getAttribute("style")),hrefNormalized:i.getAttribute("href")==="/a",opacity:/^0.55$/.test(i.style.opacity),cssFloat:!!i.style.cssFloat,checkOn:d.getElementsByTagName("input")[0].value==="on",optSelected:r.createElement("select").appendChild(r.createElement("option")).selected,checkClone:false,scriptEval:false,noCloneEvent:true,boxModel:null};
b.type="text/javascript";try{b.appendChild(r.createTextNode("window."+f+"=1;"))}catch(j){}a.insertBefore(b,a.firstChild);if(z[f]){c.support.scriptEval=true;delete z[f]}a.removeChild(b);if(d.attachEvent&&d.fireEvent){d.attachEvent("onclick",function n(){c.support.noCloneEvent=false;d.detachEvent("onclick",n)});d.cloneNode(true).fireEvent("onclick")}d=r.createElement("div");d.innerHTML="<input type='radio' name='radiotest' checked='checked'/>";a=r.createDocumentFragment();a.appendChild(d.firstChild);
c.support.checkClone=a.cloneNode(true).cloneNode(true).lastChild.checked;c(function(){var n=r.createElement("div");n.style.width=n.style.paddingLeft="1px";r.body.appendChild(n);c.boxModel=c.support.boxModel=n.offsetWidth===2;r.body.removeChild(n).style.display="none"});a=function(n){var o=r.createElement("div");n="on"+n;var m=n in o;if(!m){o.setAttribute(n,"return;");m=typeof o[n]==="function"}return m};c.support.submitBubbles=a("submit");c.support.changeBubbles=a("change");a=b=d=e=i=null}})();c.props=
{"for":"htmlFor","class":"className",readonly:"readOnly",maxlength:"maxLength",cellspacing:"cellSpacing",rowspan:"rowSpan",colspan:"colSpan",tabindex:"tabIndex",usemap:"useMap",frameborder:"frameBorder"};var G="jQuery"+J(),Ua=0,xa={},Va={};c.extend({cache:{},expando:G,noData:{embed:true,object:true,applet:true},data:function(a,b,d){if(!(a.nodeName&&c.noData[a.nodeName.toLowerCase()])){a=a==z?xa:a;var f=a[G],e=c.cache;if(!b&&!f)return null;f||(f=++Ua);if(typeof b==="object"){a[G]=f;e=e[f]=c.extend(true,
{},b)}else e=e[f]?e[f]:typeof d==="undefined"?Va:(e[f]={});if(d!==v){a[G]=f;e[b]=d}return typeof b==="string"?e[b]:e}},removeData:function(a,b){if(!(a.nodeName&&c.noData[a.nodeName.toLowerCase()])){a=a==z?xa:a;var d=a[G],f=c.cache,e=f[d];if(b){if(e){delete e[b];c.isEmptyObject(e)&&c.removeData(a)}}else{try{delete a[G]}catch(i){a.removeAttribute&&a.removeAttribute(G)}delete f[d]}}}});c.fn.extend({data:function(a,b){if(typeof a==="undefined"&&this.length)return c.data(this[0]);else if(typeof a==="object")return this.each(function(){c.data(this,
a)});var d=a.split(".");d[1]=d[1]?"."+d[1]:"";if(b===v){var f=this.triggerHandler("getData"+d[1]+"!",[d[0]]);if(f===v&&this.length)f=c.data(this[0],a);return f===v&&d[1]?this.data(d[0]):f}else return this.trigger("setData"+d[1]+"!",[d[0],b]).each(function(){c.data(this,a,b)})},removeData:function(a){return this.each(function(){c.removeData(this,a)})}});c.extend({queue:function(a,b,d){if(a){b=(b||"fx")+"queue";var f=c.data(a,b);if(!d)return f||[];if(!f||c.isArray(d))f=c.data(a,b,c.makeArray(d));else f.push(d);
return f}},dequeue:function(a,b){b=b||"fx";var d=c.queue(a,b),f=d.shift();if(f==="inprogress")f=d.shift();if(f){b==="fx"&&d.unshift("inprogress");f.call(a,function(){c.dequeue(a,b)})}}});c.fn.extend({queue:function(a,b){if(typeof a!=="string"){b=a;a="fx"}if(b===v)return c.queue(this[0],a);return this.each(function(){var d=c.queue(this,a,b);a==="fx"&&d[0]!=="inprogress"&&c.dequeue(this,a)})},dequeue:function(a){return this.each(function(){c.dequeue(this,a)})},delay:function(a,b){a=c.fx?c.fx.speeds[a]||
a:a;b=b||"fx";return this.queue(b,function(){var d=this;setTimeout(function(){c.dequeue(d,b)},a)})},clearQueue:function(a){return this.queue(a||"fx",[])}});var ya=/[\n\t]/g,ca=/\s+/,Wa=/\r/g,Xa=/href|src|style/,Ya=/(button|input)/i,Za=/(button|input|object|select|textarea)/i,$a=/^(a|area)$/i,za=/radio|checkbox/;c.fn.extend({attr:function(a,b){return X(this,a,b,true,c.attr)},removeAttr:function(a){return this.each(function(){c.attr(this,a,"");this.nodeType===1&&this.removeAttribute(a)})},addClass:function(a){if(c.isFunction(a))return this.each(function(o){var m=
c(this);m.addClass(a.call(this,o,m.attr("class")))});if(a&&typeof a==="string")for(var b=(a||"").split(ca),d=0,f=this.length;d<f;d++){var e=this[d];if(e.nodeType===1)if(e.className)for(var i=" "+e.className+" ",j=0,n=b.length;j<n;j++){if(i.indexOf(" "+b[j]+" ")<0)e.className+=" "+b[j]}else e.className=a}return this},removeClass:function(a){if(c.isFunction(a))return this.each(function(o){var m=c(this);m.removeClass(a.call(this,o,m.attr("class")))});if(a&&typeof a==="string"||a===v)for(var b=(a||"").split(ca),
d=0,f=this.length;d<f;d++){var e=this[d];if(e.nodeType===1&&e.className)if(a){for(var i=(" "+e.className+" ").replace(ya," "),j=0,n=b.length;j<n;j++)i=i.replace(" "+b[j]+" "," ");e.className=i.substring(1,i.length-1)}else e.className=""}return this},toggleClass:function(a,b){var d=typeof a,f=typeof b==="boolean";if(c.isFunction(a))return this.each(function(e){var i=c(this);i.toggleClass(a.call(this,e,i.attr("class"),b),b)});return this.each(function(){if(d==="string")for(var e,i=0,j=c(this),n=b,o=
a.split(ca);e=o[i++];){n=f?n:!j.hasClass(e);j[n?"addClass":"removeClass"](e)}else if(d==="undefined"||d==="boolean"){this.className&&c.data(this,"__className__",this.className);this.className=this.className||a===false?"":c.data(this,"__className__")||""}})},hasClass:function(a){a=" "+a+" ";for(var b=0,d=this.length;b<d;b++)if((" "+this[b].className+" ").replace(ya," ").indexOf(a)>-1)return true;return false},val:function(a){if(a===v){var b=this[0];if(b){if(c.nodeName(b,"option"))return(b.attributes.value||
{}).specified?b.value:b.text;if(c.nodeName(b,"select")){var d=b.selectedIndex,f=[],e=b.options;b=b.type==="select-one";if(d<0)return null;var i=b?d:0;for(d=b?d+1:e.length;i<d;i++){var j=e[i];if(j.selected){a=c(j).val();if(b)return a;f.push(a)}}return f}if(za.test(b.type)&&!c.support.checkOn)return b.getAttribute("value")===null?"on":b.value;return(b.value||"").replace(Wa,"")}return v}var n=c.isFunction(a);return this.each(function(o){var m=c(this),s=a;if(this.nodeType===1){if(n)s=a.call(this,o,m.val());
if(typeof s==="number")s+="";if(c.isArray(s)&&za.test(this.type))this.checked=c.inArray(m.val(),s)>=0;else if(c.nodeName(this,"select")){var x=c.makeArray(s);c("option",this).each(function(){this.selected=c.inArray(c(this).val(),x)>=0});if(!x.length)this.selectedIndex=-1}else this.value=s}})}});c.extend({attrFn:{val:true,css:true,html:true,text:true,data:true,width:true,height:true,offset:true},attr:function(a,b,d,f){if(!a||a.nodeType===3||a.nodeType===8)return v;if(f&&b in c.attrFn)return c(a)[b](d);
f=a.nodeType!==1||!c.isXMLDoc(a);var e=d!==v;b=f&&c.props[b]||b;if(a.nodeType===1){var i=Xa.test(b);if(b in a&&f&&!i){if(e){b==="type"&&Ya.test(a.nodeName)&&a.parentNode&&c.error("type property can't be changed");a[b]=d}if(c.nodeName(a,"form")&&a.getAttributeNode(b))return a.getAttributeNode(b).nodeValue;if(b==="tabIndex")return(b=a.getAttributeNode("tabIndex"))&&b.specified?b.value:Za.test(a.nodeName)||$a.test(a.nodeName)&&a.href?0:v;return a[b]}if(!c.support.style&&f&&b==="style"){if(e)a.style.cssText=
""+d;return a.style.cssText}e&&a.setAttribute(b,""+d);a=!c.support.hrefNormalized&&f&&i?a.getAttribute(b,2):a.getAttribute(b);return a===null?v:a}return c.style(a,b,d)}});var ab=function(a){return a.replace(/[^\w\s\.\|`]/g,function(b){return"\\"+b})};c.event={add:function(a,b,d,f){if(!(a.nodeType===3||a.nodeType===8)){if(a.setInterval&&a!==z&&!a.frameElement)a=z;if(!d.guid)d.guid=c.guid++;if(f!==v){d=c.proxy(d);d.data=f}var e=c.data(a,"events")||c.data(a,"events",{}),i=c.data(a,"handle"),j;if(!i){j=
function(){return typeof c!=="undefined"&&!c.event.triggered?c.event.handle.apply(j.elem,arguments):v};i=c.data(a,"handle",j)}if(i){i.elem=a;b=b.split(/\s+/);for(var n,o=0;n=b[o++];){var m=n.split(".");n=m.shift();if(o>1){d=c.proxy(d);if(f!==v)d.data=f}d.type=m.slice(0).sort().join(".");var s=e[n],x=this.special[n]||{};if(!s){s=e[n]={};if(!x.setup||x.setup.call(a,f,m,d)===false)if(a.addEventListener)a.addEventListener(n,i,false);else a.attachEvent&&a.attachEvent("on"+n,i)}if(x.add)if((m=x.add.call(a,
d,f,m,s))&&c.isFunction(m)){m.guid=m.guid||d.guid;m.data=m.data||d.data;m.type=m.type||d.type;d=m}s[d.guid]=d;this.global[n]=true}a=null}}},global:{},remove:function(a,b,d){if(!(a.nodeType===3||a.nodeType===8)){var f=c.data(a,"events"),e,i,j;if(f){if(b===v||typeof b==="string"&&b.charAt(0)===".")for(i in f)this.remove(a,i+(b||""));else{if(b.type){d=b.handler;b=b.type}b=b.split(/\s+/);for(var n=0;i=b[n++];){var o=i.split(".");i=o.shift();var m=!o.length,s=c.map(o.slice(0).sort(),ab);s=new RegExp("(^|\\.)"+
s.join("\\.(?:.*\\.)?")+"(\\.|$)");var x=this.special[i]||{};if(f[i]){if(d){j=f[i][d.guid];delete f[i][d.guid]}else for(var A in f[i])if(m||s.test(f[i][A].type))delete f[i][A];x.remove&&x.remove.call(a,o,j);for(e in f[i])break;if(!e){if(!x.teardown||x.teardown.call(a,o)===false)if(a.removeEventListener)a.removeEventListener(i,c.data(a,"handle"),false);else a.detachEvent&&a.detachEvent("on"+i,c.data(a,"handle"));e=null;delete f[i]}}}}for(e in f)break;if(!e){if(A=c.data(a,"handle"))A.elem=null;c.removeData(a,
"events");c.removeData(a,"handle")}}}},trigger:function(a,b,d,f){var e=a.type||a;if(!f){a=typeof a==="object"?a[G]?a:c.extend(c.Event(e),a):c.Event(e);if(e.indexOf("!")>=0){a.type=e=e.slice(0,-1);a.exclusive=true}if(!d){a.stopPropagation();this.global[e]&&c.each(c.cache,function(){this.events&&this.events[e]&&c.event.trigger(a,b,this.handle.elem)})}if(!d||d.nodeType===3||d.nodeType===8)return v;a.result=v;a.target=d;b=c.makeArray(b);b.unshift(a)}a.currentTarget=d;(f=c.data(d,"handle"))&&f.apply(d,
b);f=d.parentNode||d.ownerDocument;try{if(!(d&&d.nodeName&&c.noData[d.nodeName.toLowerCase()]))if(d["on"+e]&&d["on"+e].apply(d,b)===false)a.result=false}catch(i){}if(!a.isPropagationStopped()&&f)c.event.trigger(a,b,f,true);else if(!a.isDefaultPrevented()){d=a.target;var j;if(!(c.nodeName(d,"a")&&e==="click")&&!(d&&d.nodeName&&c.noData[d.nodeName.toLowerCase()])){try{if(d[e]){if(j=d["on"+e])d["on"+e]=null;this.triggered=true;d[e]()}}catch(n){}if(j)d["on"+e]=j;this.triggered=false}}},handle:function(a){var b,
d;a=arguments[0]=c.event.fix(a||z.event);a.currentTarget=this;d=a.type.split(".");a.type=d.shift();b=!d.length&&!a.exclusive;var f=new RegExp("(^|\\.)"+d.slice(0).sort().join("\\.(?:.*\\.)?")+"(\\.|$)");d=(c.data(this,"events")||{})[a.type];for(var e in d){var i=d[e];if(b||f.test(i.type)){a.handler=i;a.data=i.data;i=i.apply(this,arguments);if(i!==v){a.result=i;if(i===false){a.preventDefault();a.stopPropagation()}}if(a.isImmediatePropagationStopped())break}}return a.result},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
fix:function(a){if(a[G])return a;var b=a;a=c.Event(b);for(var d=this.props.length,f;d;){f=this.props[--d];a[f]=b[f]}if(!a.target)a.target=a.srcElement||r;if(a.target.nodeType===3)a.target=a.target.parentNode;if(!a.relatedTarget&&a.fromElement)a.relatedTarget=a.fromElement===a.target?a.toElement:a.fromElement;if(a.pageX==null&&a.clientX!=null){b=r.documentElement;d=r.body;a.pageX=a.clientX+(b&&b.scrollLeft||d&&d.scrollLeft||0)-(b&&b.clientLeft||d&&d.clientLeft||0);a.pageY=a.clientY+(b&&b.scrollTop||
d&&d.scrollTop||0)-(b&&b.clientTop||d&&d.clientTop||0)}if(!a.which&&(a.charCode||a.charCode===0?a.charCode:a.keyCode))a.which=a.charCode||a.keyCode;if(!a.metaKey&&a.ctrlKey)a.metaKey=a.ctrlKey;if(!a.which&&a.button!==v)a.which=a.button&1?1:a.button&2?3:a.button&4?2:0;return a},guid:1E8,proxy:c.proxy,special:{ready:{setup:c.bindReady,teardown:c.noop},live:{add:function(a,b){c.extend(a,b||{});a.guid+=b.selector+b.live;b.liveProxy=a;c.event.add(this,b.live,na,b)},remove:function(a){if(a.length){var b=
0,d=new RegExp("(^|\\.)"+a[0]+"(\\.|$)");c.each(c.data(this,"events").live||{},function(){d.test(this.type)&&b++});b<1&&c.event.remove(this,a[0],na)}},special:{}},beforeunload:{setup:function(a,b,d){if(this.setInterval)this.onbeforeunload=d;return false},teardown:function(a,b){if(this.onbeforeunload===b)this.onbeforeunload=null}}}};c.Event=function(a){if(!this.preventDefault)return new c.Event(a);if(a&&a.type){this.originalEvent=a;this.type=a.type}else this.type=a;this.timeStamp=J();this[G]=true};
c.Event.prototype={preventDefault:function(){this.isDefaultPrevented=Z;var a=this.originalEvent;if(a){a.preventDefault&&a.preventDefault();a.returnValue=false}},stopPropagation:function(){this.isPropagationStopped=Z;var a=this.originalEvent;if(a){a.stopPropagation&&a.stopPropagation();a.cancelBubble=true}},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=Z;this.stopPropagation()},isDefaultPrevented:Y,isPropagationStopped:Y,isImmediatePropagationStopped:Y};var Aa=function(a){for(var b=
a.relatedTarget;b&&b!==this;)try{b=b.parentNode}catch(d){break}if(b!==this){a.type=a.data;c.event.handle.apply(this,arguments)}},Ba=function(a){a.type=a.data;c.event.handle.apply(this,arguments)};c.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){c.event.special[a]={setup:function(d){c.event.add(this,b,d&&d.selector?Ba:Aa,a)},teardown:function(d){c.event.remove(this,b,d&&d.selector?Ba:Aa)}}});if(!c.support.submitBubbles)c.event.special.submit={setup:function(a,b,d){if(this.nodeName.toLowerCase()!==
"form"){c.event.add(this,"click.specialSubmit."+d.guid,function(f){var e=f.target,i=e.type;if((i==="submit"||i==="image")&&c(e).closest("form").length)return ma("submit",this,arguments)});c.event.add(this,"keypress.specialSubmit."+d.guid,function(f){var e=f.target,i=e.type;if((i==="text"||i==="password")&&c(e).closest("form").length&&f.keyCode===13)return ma("submit",this,arguments)})}else return false},remove:function(a,b){c.event.remove(this,"click.specialSubmit"+(b?"."+b.guid:""));c.event.remove(this,
"keypress.specialSubmit"+(b?"."+b.guid:""))}};if(!c.support.changeBubbles){var da=/textarea|input|select/i;function Ca(a){var b=a.type,d=a.value;if(b==="radio"||b==="checkbox")d=a.checked;else if(b==="select-multiple")d=a.selectedIndex>-1?c.map(a.options,function(f){return f.selected}).join("-"):"";else if(a.nodeName.toLowerCase()==="select")d=a.selectedIndex;return d}function ea(a,b){var d=a.target,f,e;if(!(!da.test(d.nodeName)||d.readOnly)){f=c.data(d,"_change_data");e=Ca(d);if(a.type!=="focusout"||
d.type!=="radio")c.data(d,"_change_data",e);if(!(f===v||e===f))if(f!=null||e){a.type="change";return c.event.trigger(a,b,d)}}}c.event.special.change={filters:{focusout:ea,click:function(a){var b=a.target,d=b.type;if(d==="radio"||d==="checkbox"||b.nodeName.toLowerCase()==="select")return ea.call(this,a)},keydown:function(a){var b=a.target,d=b.type;if(a.keyCode===13&&b.nodeName.toLowerCase()!=="textarea"||a.keyCode===32&&(d==="checkbox"||d==="radio")||d==="select-multiple")return ea.call(this,a)},beforeactivate:function(a){a=
a.target;a.nodeName.toLowerCase()==="input"&&a.type==="radio"&&c.data(a,"_change_data",Ca(a))}},setup:function(a,b,d){for(var f in T)c.event.add(this,f+".specialChange."+d.guid,T[f]);return da.test(this.nodeName)},remove:function(a,b){for(var d in T)c.event.remove(this,d+".specialChange"+(b?"."+b.guid:""),T[d]);return da.test(this.nodeName)}};var T=c.event.special.change.filters}r.addEventListener&&c.each({focus:"focusin",blur:"focusout"},function(a,b){function d(f){f=c.event.fix(f);f.type=b;return c.event.handle.call(this,
f)}c.event.special[b]={setup:function(){this.addEventListener(a,d,true)},teardown:function(){this.removeEventListener(a,d,true)}}});c.each(["bind","one"],function(a,b){c.fn[b]=function(d,f,e){if(typeof d==="object"){for(var i in d)this[b](i,f,d[i],e);return this}if(c.isFunction(f)){e=f;f=v}var j=b==="one"?c.proxy(e,function(n){c(this).unbind(n,j);return e.apply(this,arguments)}):e;return d==="unload"&&b!=="one"?this.one(d,f,e):this.each(function(){c.event.add(this,d,j,f)})}});c.fn.extend({unbind:function(a,
b){if(typeof a==="object"&&!a.preventDefault){for(var d in a)this.unbind(d,a[d]);return this}return this.each(function(){c.event.remove(this,a,b)})},trigger:function(a,b){return this.each(function(){c.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0]){a=c.Event(a);a.preventDefault();a.stopPropagation();c.event.trigger(a,b,this[0]);return a.result}},toggle:function(a){for(var b=arguments,d=1;d<b.length;)c.proxy(a,b[d++]);return this.click(c.proxy(a,function(f){var e=(c.data(this,"lastToggle"+
a.guid)||0)%d;c.data(this,"lastToggle"+a.guid,e+1);f.preventDefault();return b[e].apply(this,arguments)||false}))},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}});c.each(["live","die"],function(a,b){c.fn[b]=function(d,f,e){var i,j=0;if(c.isFunction(f)){e=f;f=v}for(d=(d||"").split(/\s+/);(i=d[j++])!=null;){i=i==="focus"?"focusin":i==="blur"?"focusout":i==="hover"?d.push("mouseleave")&&"mouseenter":i;b==="live"?c(this.context).bind(oa(i,this.selector),{data:f,selector:this.selector,
live:i},e):c(this.context).unbind(oa(i,this.selector),e?{guid:e.guid+this.selector+i}:null)}return this}});c.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error".split(" "),function(a,b){c.fn[b]=function(d){return d?this.bind(b,d):this.trigger(b)};if(c.attrFn)c.attrFn[b]=true});z.attachEvent&&!z.addEventListener&&z.attachEvent("onunload",function(){for(var a in c.cache)if(c.cache[a].handle)try{c.event.remove(c.cache[a].handle.elem)}catch(b){}});
(function(){function a(g){for(var h="",k,l=0;g[l];l++){k=g[l];if(k.nodeType===3||k.nodeType===4)h+=k.nodeValue;else if(k.nodeType!==8)h+=a(k.childNodes)}return h}function b(g,h,k,l,q,p){q=0;for(var u=l.length;q<u;q++){var t=l[q];if(t){t=t[g];for(var y=false;t;){if(t.sizcache===k){y=l[t.sizset];break}if(t.nodeType===1&&!p){t.sizcache=k;t.sizset=q}if(t.nodeName.toLowerCase()===h){y=t;break}t=t[g]}l[q]=y}}}function d(g,h,k,l,q,p){q=0;for(var u=l.length;q<u;q++){var t=l[q];if(t){t=t[g];for(var y=false;t;){if(t.sizcache===
k){y=l[t.sizset];break}if(t.nodeType===1){if(!p){t.sizcache=k;t.sizset=q}if(typeof h!=="string"){if(t===h){y=true;break}}else if(o.filter(h,[t]).length>0){y=t;break}}t=t[g]}l[q]=y}}}var f=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,e=0,i=Object.prototype.toString,j=false,n=true;[0,0].sort(function(){n=false;return 0});var o=function(g,h,k,l){k=k||[];var q=h=h||r;if(h.nodeType!==1&&h.nodeType!==9)return[];if(!g||
typeof g!=="string")return k;for(var p=[],u,t,y,R,H=true,M=w(h),I=g;(f.exec(""),u=f.exec(I))!==null;){I=u[3];p.push(u[1]);if(u[2]){R=u[3];break}}if(p.length>1&&s.exec(g))if(p.length===2&&m.relative[p[0]])t=fa(p[0]+p[1],h);else for(t=m.relative[p[0]]?[h]:o(p.shift(),h);p.length;){g=p.shift();if(m.relative[g])g+=p.shift();t=fa(g,t)}else{if(!l&&p.length>1&&h.nodeType===9&&!M&&m.match.ID.test(p[0])&&!m.match.ID.test(p[p.length-1])){u=o.find(p.shift(),h,M);h=u.expr?o.filter(u.expr,u.set)[0]:u.set[0]}if(h){u=
l?{expr:p.pop(),set:A(l)}:o.find(p.pop(),p.length===1&&(p[0]==="~"||p[0]==="+")&&h.parentNode?h.parentNode:h,M);t=u.expr?o.filter(u.expr,u.set):u.set;if(p.length>0)y=A(t);else H=false;for(;p.length;){var D=p.pop();u=D;if(m.relative[D])u=p.pop();else D="";if(u==null)u=h;m.relative[D](y,u,M)}}else y=[]}y||(y=t);y||o.error(D||g);if(i.call(y)==="[object Array]")if(H)if(h&&h.nodeType===1)for(g=0;y[g]!=null;g++){if(y[g]&&(y[g]===true||y[g].nodeType===1&&E(h,y[g])))k.push(t[g])}else for(g=0;y[g]!=null;g++)y[g]&&
y[g].nodeType===1&&k.push(t[g]);else k.push.apply(k,y);else A(y,k);if(R){o(R,q,k,l);o.uniqueSort(k)}return k};o.uniqueSort=function(g){if(C){j=n;g.sort(C);if(j)for(var h=1;h<g.length;h++)g[h]===g[h-1]&&g.splice(h--,1)}return g};o.matches=function(g,h){return o(g,null,null,h)};o.find=function(g,h,k){var l,q;if(!g)return[];for(var p=0,u=m.order.length;p<u;p++){var t=m.order[p];if(q=m.leftMatch[t].exec(g)){var y=q[1];q.splice(1,1);if(y.substr(y.length-1)!=="\\"){q[1]=(q[1]||"").replace(/\\/g,"");l=m.find[t](q,
h,k);if(l!=null){g=g.replace(m.match[t],"");break}}}}l||(l=h.getElementsByTagName("*"));return{set:l,expr:g}};o.filter=function(g,h,k,l){for(var q=g,p=[],u=h,t,y,R=h&&h[0]&&w(h[0]);g&&h.length;){for(var H in m.filter)if((t=m.leftMatch[H].exec(g))!=null&&t[2]){var M=m.filter[H],I,D;D=t[1];y=false;t.splice(1,1);if(D.substr(D.length-1)!=="\\"){if(u===p)p=[];if(m.preFilter[H])if(t=m.preFilter[H](t,u,k,p,l,R)){if(t===true)continue}else y=I=true;if(t)for(var U=0;(D=u[U])!=null;U++)if(D){I=M(D,t,U,u);var Da=
l^!!I;if(k&&I!=null)if(Da)y=true;else u[U]=false;else if(Da){p.push(D);y=true}}if(I!==v){k||(u=p);g=g.replace(m.match[H],"");if(!y)return[];break}}}if(g===q)if(y==null)o.error(g);else break;q=g}return u};o.error=function(g){throw"Syntax error, unrecognized expression: "+g;};var m=o.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
TAG:/^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(g){return g.getAttribute("href")}},relative:{"+":function(g,h){var k=typeof h==="string",l=k&&!/\W/.test(h);k=k&&!l;if(l)h=h.toLowerCase();l=0;for(var q=g.length,
p;l<q;l++)if(p=g[l]){for(;(p=p.previousSibling)&&p.nodeType!==1;);g[l]=k||p&&p.nodeName.toLowerCase()===h?p||false:p===h}k&&o.filter(h,g,true)},">":function(g,h){var k=typeof h==="string";if(k&&!/\W/.test(h)){h=h.toLowerCase();for(var l=0,q=g.length;l<q;l++){var p=g[l];if(p){k=p.parentNode;g[l]=k.nodeName.toLowerCase()===h?k:false}}}else{l=0;for(q=g.length;l<q;l++)if(p=g[l])g[l]=k?p.parentNode:p.parentNode===h;k&&o.filter(h,g,true)}},"":function(g,h,k){var l=e++,q=d;if(typeof h==="string"&&!/\W/.test(h)){var p=
h=h.toLowerCase();q=b}q("parentNode",h,l,g,p,k)},"~":function(g,h,k){var l=e++,q=d;if(typeof h==="string"&&!/\W/.test(h)){var p=h=h.toLowerCase();q=b}q("previousSibling",h,l,g,p,k)}},find:{ID:function(g,h,k){if(typeof h.getElementById!=="undefined"&&!k)return(g=h.getElementById(g[1]))?[g]:[]},NAME:function(g,h){if(typeof h.getElementsByName!=="undefined"){var k=[];h=h.getElementsByName(g[1]);for(var l=0,q=h.length;l<q;l++)h[l].getAttribute("name")===g[1]&&k.push(h[l]);return k.length===0?null:k}},
TAG:function(g,h){return h.getElementsByTagName(g[1])}},preFilter:{CLASS:function(g,h,k,l,q,p){g=" "+g[1].replace(/\\/g,"")+" ";if(p)return g;p=0;for(var u;(u=h[p])!=null;p++)if(u)if(q^(u.className&&(" "+u.className+" ").replace(/[\t\n]/g," ").indexOf(g)>=0))k||l.push(u);else if(k)h[p]=false;return false},ID:function(g){return g[1].replace(/\\/g,"")},TAG:function(g){return g[1].toLowerCase()},CHILD:function(g){if(g[1]==="nth"){var h=/(-?)(\d*)n((?:\+|-)?\d*)/.exec(g[2]==="even"&&"2n"||g[2]==="odd"&&
"2n+1"||!/\D/.test(g[2])&&"0n+"+g[2]||g[2]);g[2]=h[1]+(h[2]||1)-0;g[3]=h[3]-0}g[0]=e++;return g},ATTR:function(g,h,k,l,q,p){h=g[1].replace(/\\/g,"");if(!p&&m.attrMap[h])g[1]=m.attrMap[h];if(g[2]==="~=")g[4]=" "+g[4]+" ";return g},PSEUDO:function(g,h,k,l,q){if(g[1]==="not")if((f.exec(g[3])||"").length>1||/^\w/.test(g[3]))g[3]=o(g[3],null,null,h);else{g=o.filter(g[3],h,k,true^q);k||l.push.apply(l,g);return false}else if(m.match.POS.test(g[0])||m.match.CHILD.test(g[0]))return true;return g},POS:function(g){g.unshift(true);
return g}},filters:{enabled:function(g){return g.disabled===false&&g.type!=="hidden"},disabled:function(g){return g.disabled===true},checked:function(g){return g.checked===true},selected:function(g){return g.selected===true},parent:function(g){return!!g.firstChild},empty:function(g){return!g.firstChild},has:function(g,h,k){return!!o(k[3],g).length},header:function(g){return/h\d/i.test(g.nodeName)},text:function(g){return"text"===g.type},radio:function(g){return"radio"===g.type},checkbox:function(g){return"checkbox"===
g.type},file:function(g){return"file"===g.type},password:function(g){return"password"===g.type},submit:function(g){return"submit"===g.type},image:function(g){return"image"===g.type},reset:function(g){return"reset"===g.type},button:function(g){return"button"===g.type||g.nodeName.toLowerCase()==="button"},input:function(g){return/input|select|textarea|button/i.test(g.nodeName)}},setFilters:{first:function(g,h){return h===0},last:function(g,h,k,l){return h===l.length-1},even:function(g,h){return h%2===
0},odd:function(g,h){return h%2===1},lt:function(g,h,k){return h<k[3]-0},gt:function(g,h,k){return h>k[3]-0},nth:function(g,h,k){return k[3]-0===h},eq:function(g,h,k){return k[3]-0===h}},filter:{PSEUDO:function(g,h,k,l){var q=h[1],p=m.filters[q];if(p)return p(g,k,h,l);else if(q==="contains")return(g.textContent||g.innerText||a([g])||"").indexOf(h[3])>=0;else if(q==="not"){h=h[3];k=0;for(l=h.length;k<l;k++)if(h[k]===g)return false;return true}else o.error("Syntax error, unrecognized expression: "+
q)},CHILD:function(g,h){var k=h[1],l=g;switch(k){case "only":case "first":for(;l=l.previousSibling;)if(l.nodeType===1)return false;if(k==="first")return true;l=g;case "last":for(;l=l.nextSibling;)if(l.nodeType===1)return false;return true;case "nth":k=h[2];var q=h[3];if(k===1&&q===0)return true;h=h[0];var p=g.parentNode;if(p&&(p.sizcache!==h||!g.nodeIndex)){var u=0;for(l=p.firstChild;l;l=l.nextSibling)if(l.nodeType===1)l.nodeIndex=++u;p.sizcache=h}g=g.nodeIndex-q;return k===0?g===0:g%k===0&&g/k>=
0}},ID:function(g,h){return g.nodeType===1&&g.getAttribute("id")===h},TAG:function(g,h){return h==="*"&&g.nodeType===1||g.nodeName.toLowerCase()===h},CLASS:function(g,h){return(" "+(g.className||g.getAttribute("class"))+" ").indexOf(h)>-1},ATTR:function(g,h){var k=h[1];g=m.attrHandle[k]?m.attrHandle[k](g):g[k]!=null?g[k]:g.getAttribute(k);k=g+"";var l=h[2];h=h[4];return g==null?l==="!=":l==="="?k===h:l==="*="?k.indexOf(h)>=0:l==="~="?(" "+k+" ").indexOf(h)>=0:!h?k&&g!==false:l==="!="?k!==h:l==="^="?
k.indexOf(h)===0:l==="$="?k.substr(k.length-h.length)===h:l==="|="?k===h||k.substr(0,h.length+1)===h+"-":false},POS:function(g,h,k,l){var q=m.setFilters[h[2]];if(q)return q(g,k,h,l)}}},s=m.match.POS;for(var x in m.match){m.match[x]=new RegExp(m.match[x].source+/(?![^\[]*\])(?![^\(]*\))/.source);m.leftMatch[x]=new RegExp(/(^(?:.|\r|\n)*?)/.source+m.match[x].source.replace(/\\(\d+)/g,function(g,h){return"\\"+(h-0+1)}))}var A=function(g,h){g=Array.prototype.slice.call(g,0);if(h){h.push.apply(h,g);return h}return g};
try{Array.prototype.slice.call(r.documentElement.childNodes,0)}catch(B){A=function(g,h){h=h||[];if(i.call(g)==="[object Array]")Array.prototype.push.apply(h,g);else if(typeof g.length==="number")for(var k=0,l=g.length;k<l;k++)h.push(g[k]);else for(k=0;g[k];k++)h.push(g[k]);return h}}var C;if(r.documentElement.compareDocumentPosition)C=function(g,h){if(!g.compareDocumentPosition||!h.compareDocumentPosition){if(g==h)j=true;return g.compareDocumentPosition?-1:1}g=g.compareDocumentPosition(h)&4?-1:g===
h?0:1;if(g===0)j=true;return g};else if("sourceIndex"in r.documentElement)C=function(g,h){if(!g.sourceIndex||!h.sourceIndex){if(g==h)j=true;return g.sourceIndex?-1:1}g=g.sourceIndex-h.sourceIndex;if(g===0)j=true;return g};else if(r.createRange)C=function(g,h){if(!g.ownerDocument||!h.ownerDocument){if(g==h)j=true;return g.ownerDocument?-1:1}var k=g.ownerDocument.createRange(),l=h.ownerDocument.createRange();k.setStart(g,0);k.setEnd(g,0);l.setStart(h,0);l.setEnd(h,0);g=k.compareBoundaryPoints(Range.START_TO_END,
l);if(g===0)j=true;return g};(function(){var g=r.createElement("div"),h="script"+(new Date).getTime();g.innerHTML="<a name='"+h+"'/>";var k=r.documentElement;k.insertBefore(g,k.firstChild);if(r.getElementById(h)){m.find.ID=function(l,q,p){if(typeof q.getElementById!=="undefined"&&!p)return(q=q.getElementById(l[1]))?q.id===l[1]||typeof q.getAttributeNode!=="undefined"&&q.getAttributeNode("id").nodeValue===l[1]?[q]:v:[]};m.filter.ID=function(l,q){var p=typeof l.getAttributeNode!=="undefined"&&l.getAttributeNode("id");
return l.nodeType===1&&p&&p.nodeValue===q}}k.removeChild(g);k=g=null})();(function(){var g=r.createElement("div");g.appendChild(r.createComment(""));if(g.getElementsByTagName("*").length>0)m.find.TAG=function(h,k){k=k.getElementsByTagName(h[1]);if(h[1]==="*"){h=[];for(var l=0;k[l];l++)k[l].nodeType===1&&h.push(k[l]);k=h}return k};g.innerHTML="<a href='#'></a>";if(g.firstChild&&typeof g.firstChild.getAttribute!=="undefined"&&g.firstChild.getAttribute("href")!=="#")m.attrHandle.href=function(h){return h.getAttribute("href",
2)};g=null})();r.querySelectorAll&&function(){var g=o,h=r.createElement("div");h.innerHTML="<p class='TEST'></p>";if(!(h.querySelectorAll&&h.querySelectorAll(".TEST").length===0)){o=function(l,q,p,u){q=q||r;if(!u&&q.nodeType===9&&!w(q))try{return A(q.querySelectorAll(l),p)}catch(t){}return g(l,q,p,u)};for(var k in g)o[k]=g[k];h=null}}();(function(){var g=r.createElement("div");g.innerHTML="<div class='test e'></div><div class='test'></div>";if(!(!g.getElementsByClassName||g.getElementsByClassName("e").length===
0)){g.lastChild.className="e";if(g.getElementsByClassName("e").length!==1){m.order.splice(1,0,"CLASS");m.find.CLASS=function(h,k,l){if(typeof k.getElementsByClassName!=="undefined"&&!l)return k.getElementsByClassName(h[1])};g=null}}})();var E=r.compareDocumentPosition?function(g,h){return g.compareDocumentPosition(h)&16}:function(g,h){return g!==h&&(g.contains?g.contains(h):true)},w=function(g){return(g=(g?g.ownerDocument||g:0).documentElement)?g.nodeName!=="HTML":false},fa=function(g,h){var k=[],
l="",q;for(h=h.nodeType?[h]:h;q=m.match.PSEUDO.exec(g);){l+=q[0];g=g.replace(m.match.PSEUDO,"")}g=m.relative[g]?g+"*":g;q=0;for(var p=h.length;q<p;q++)o(g,h[q],k);return o.filter(l,k)};c.find=o;c.expr=o.selectors;c.expr[":"]=c.expr.filters;c.unique=o.uniqueSort;c.getText=a;c.isXMLDoc=w;c.contains=E})();var bb=/Until$/,cb=/^(?:parents|prevUntil|prevAll)/,db=/,/;Q=Array.prototype.slice;var Ea=function(a,b,d){if(c.isFunction(b))return c.grep(a,function(e,i){return!!b.call(e,i,e)===d});else if(b.nodeType)return c.grep(a,
function(e){return e===b===d});else if(typeof b==="string"){var f=c.grep(a,function(e){return e.nodeType===1});if(Qa.test(b))return c.filter(b,f,!d);else b=c.filter(b,f)}return c.grep(a,function(e){return c.inArray(e,b)>=0===d})};c.fn.extend({find:function(a){for(var b=this.pushStack("","find",a),d=0,f=0,e=this.length;f<e;f++){d=b.length;c.find(a,this[f],b);if(f>0)for(var i=d;i<b.length;i++)for(var j=0;j<d;j++)if(b[j]===b[i]){b.splice(i--,1);break}}return b},has:function(a){var b=c(a);return this.filter(function(){for(var d=
0,f=b.length;d<f;d++)if(c.contains(this,b[d]))return true})},not:function(a){return this.pushStack(Ea(this,a,false),"not",a)},filter:function(a){return this.pushStack(Ea(this,a,true),"filter",a)},is:function(a){return!!a&&c.filter(a,this).length>0},closest:function(a,b){if(c.isArray(a)){var d=[],f=this[0],e,i={},j;if(f&&a.length){e=0;for(var n=a.length;e<n;e++){j=a[e];i[j]||(i[j]=c.expr.match.POS.test(j)?c(j,b||this.context):j)}for(;f&&f.ownerDocument&&f!==b;){for(j in i){e=i[j];if(e.jquery?e.index(f)>
-1:c(f).is(e)){d.push({selector:j,elem:f});delete i[j]}}f=f.parentNode}}return d}var o=c.expr.match.POS.test(a)?c(a,b||this.context):null;return this.map(function(m,s){for(;s&&s.ownerDocument&&s!==b;){if(o?o.index(s)>-1:c(s).is(a))return s;s=s.parentNode}return null})},index:function(a){if(!a||typeof a==="string")return c.inArray(this[0],a?c(a):this.parent().children());return c.inArray(a.jquery?a[0]:a,this)},add:function(a,b){a=typeof a==="string"?c(a,b||this.context):c.makeArray(a);b=c.merge(this.get(),
a);return this.pushStack(pa(a[0])||pa(b[0])?b:c.unique(b))},andSelf:function(){return this.add(this.prevObject)}});c.each({parent:function(a){return(a=a.parentNode)&&a.nodeType!==11?a:null},parents:function(a){return c.dir(a,"parentNode")},parentsUntil:function(a,b,d){return c.dir(a,"parentNode",d)},next:function(a){return c.nth(a,2,"nextSibling")},prev:function(a){return c.nth(a,2,"previousSibling")},nextAll:function(a){return c.dir(a,"nextSibling")},prevAll:function(a){return c.dir(a,"previousSibling")},
nextUntil:function(a,b,d){return c.dir(a,"nextSibling",d)},prevUntil:function(a,b,d){return c.dir(a,"previousSibling",d)},siblings:function(a){return c.sibling(a.parentNode.firstChild,a)},children:function(a){return c.sibling(a.firstChild)},contents:function(a){return c.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:c.makeArray(a.childNodes)}},function(a,b){c.fn[a]=function(d,f){var e=c.map(this,b,d);bb.test(a)||(f=d);if(f&&typeof f==="string")e=c.filter(f,e);e=this.length>1?c.unique(e):
e;if((this.length>1||db.test(f))&&cb.test(a))e=e.reverse();return this.pushStack(e,a,Q.call(arguments).join(","))}});c.extend({filter:function(a,b,d){if(d)a=":not("+a+")";return c.find.matches(a,b)},dir:function(a,b,d){var f=[];for(a=a[b];a&&a.nodeType!==9&&(d===v||a.nodeType!==1||!c(a).is(d));){a.nodeType===1&&f.push(a);a=a[b]}return f},nth:function(a,b,d){b=b||1;for(var f=0;a;a=a[d])if(a.nodeType===1&&++f===b)break;return a},sibling:function(a,b){for(var d=[];a;a=a.nextSibling)a.nodeType===1&&a!==
b&&d.push(a);return d}});var Fa=/ jQuery\d+="(?:\d+|null)"/g,V=/^\s+/,Ga=/(<([\w:]+)[^>]*?)\/>/g,eb=/^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i,Ha=/<([\w:]+)/,fb=/<tbody/i,gb=/<|&\w+;/,sa=/checked\s*(?:[^=]|=\s*.checked.)/i,Ia=function(a,b,d){return eb.test(d)?a:b+"></"+d+">"},F={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],
col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]};F.optgroup=F.option;F.tbody=F.tfoot=F.colgroup=F.caption=F.thead;F.th=F.td;if(!c.support.htmlSerialize)F._default=[1,"div<div>","</div>"];c.fn.extend({text:function(a){if(c.isFunction(a))return this.each(function(b){var d=c(this);d.text(a.call(this,b,d.text()))});if(typeof a!=="object"&&a!==v)return this.empty().append((this[0]&&this[0].ownerDocument||r).createTextNode(a));return c.getText(this)},
wrapAll:function(a){if(c.isFunction(a))return this.each(function(d){c(this).wrapAll(a.call(this,d))});if(this[0]){var b=c(a,this[0].ownerDocument).eq(0).clone(true);this[0].parentNode&&b.insertBefore(this[0]);b.map(function(){for(var d=this;d.firstChild&&d.firstChild.nodeType===1;)d=d.firstChild;return d}).append(this)}return this},wrapInner:function(a){if(c.isFunction(a))return this.each(function(b){c(this).wrapInner(a.call(this,b))});return this.each(function(){var b=c(this),d=b.contents();d.length?
d.wrapAll(a):b.append(a)})},wrap:function(a){return this.each(function(){c(this).wrapAll(a)})},unwrap:function(){return this.parent().each(function(){c.nodeName(this,"body")||c(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,true,function(a){this.nodeType===1&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,true,function(a){this.nodeType===1&&this.insertBefore(a,this.firstChild)})},before:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,
false,function(b){this.parentNode.insertBefore(b,this)});else if(arguments.length){var a=c(arguments[0]);a.push.apply(a,this.toArray());return this.pushStack(a,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,false,function(b){this.parentNode.insertBefore(b,this.nextSibling)});else if(arguments.length){var a=this.pushStack(this,"after",arguments);a.push.apply(a,c(arguments[0]).toArray());return a}},clone:function(a){var b=this.map(function(){if(!c.support.noCloneEvent&&
!c.isXMLDoc(this)){var d=this.outerHTML,f=this.ownerDocument;if(!d){d=f.createElement("div");d.appendChild(this.cloneNode(true));d=d.innerHTML}return c.clean([d.replace(Fa,"").replace(V,"")],f)[0]}else return this.cloneNode(true)});if(a===true){qa(this,b);qa(this.find("*"),b.find("*"))}return b},html:function(a){if(a===v)return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(Fa,""):null;else if(typeof a==="string"&&!/<script/i.test(a)&&(c.support.leadingWhitespace||!V.test(a))&&!F[(Ha.exec(a)||
["",""])[1].toLowerCase()]){a=a.replace(Ga,Ia);try{for(var b=0,d=this.length;b<d;b++)if(this[b].nodeType===1){c.cleanData(this[b].getElementsByTagName("*"));this[b].innerHTML=a}}catch(f){this.empty().append(a)}}else c.isFunction(a)?this.each(function(e){var i=c(this),j=i.html();i.empty().append(function(){return a.call(this,e,j)})}):this.empty().append(a);return this},replaceWith:function(a){if(this[0]&&this[0].parentNode){if(c.isFunction(a))return this.each(function(b){var d=c(this),f=d.html();d.replaceWith(a.call(this,
b,f))});else a=c(a).detach();return this.each(function(){var b=this.nextSibling,d=this.parentNode;c(this).remove();b?c(b).before(a):c(d).append(a)})}else return this.pushStack(c(c.isFunction(a)?a():a),"replaceWith",a)},detach:function(a){return this.remove(a,true)},domManip:function(a,b,d){function f(s){return c.nodeName(s,"table")?s.getElementsByTagName("tbody")[0]||s.appendChild(s.ownerDocument.createElement("tbody")):s}var e,i,j=a[0],n=[];if(!c.support.checkClone&&arguments.length===3&&typeof j===
"string"&&sa.test(j))return this.each(function(){c(this).domManip(a,b,d,true)});if(c.isFunction(j))return this.each(function(s){var x=c(this);a[0]=j.call(this,s,b?x.html():v);x.domManip(a,b,d)});if(this[0]){e=a[0]&&a[0].parentNode&&a[0].parentNode.nodeType===11?{fragment:a[0].parentNode}:ra(a,this,n);if(i=e.fragment.firstChild){b=b&&c.nodeName(i,"tr");for(var o=0,m=this.length;o<m;o++)d.call(b?f(this[o],i):this[o],e.cacheable||this.length>1||o>0?e.fragment.cloneNode(true):e.fragment)}n&&c.each(n,
Ma)}return this}});c.fragments={};c.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){c.fn[a]=function(d){var f=[];d=c(d);for(var e=0,i=d.length;e<i;e++){var j=(e>0?this.clone(true):this).get();c.fn[b].apply(c(d[e]),j);f=f.concat(j)}return this.pushStack(f,a,d.selector)}});c.each({remove:function(a,b){if(!a||c.filter(a,[this]).length){if(!b&&this.nodeType===1){c.cleanData(this.getElementsByTagName("*"));c.cleanData([this])}this.parentNode&&
this.parentNode.removeChild(this)}},empty:function(){for(this.nodeType===1&&c.cleanData(this.getElementsByTagName("*"));this.firstChild;)this.removeChild(this.firstChild)}},function(a,b){c.fn[a]=function(){return this.each(b,arguments)}});c.extend({clean:function(a,b,d,f){b=b||r;if(typeof b.createElement==="undefined")b=b.ownerDocument||b[0]&&b[0].ownerDocument||r;var e=[];c.each(a,function(i,j){if(typeof j==="number")j+="";if(j){if(typeof j==="string"&&!gb.test(j))j=b.createTextNode(j);else if(typeof j===
"string"){j=j.replace(Ga,Ia);var n=(Ha.exec(j)||["",""])[1].toLowerCase(),o=F[n]||F._default,m=o[0];i=b.createElement("div");for(i.innerHTML=o[1]+j+o[2];m--;)i=i.lastChild;if(!c.support.tbody){m=fb.test(j);n=n==="table"&&!m?i.firstChild&&i.firstChild.childNodes:o[1]==="<table>"&&!m?i.childNodes:[];for(o=n.length-1;o>=0;--o)c.nodeName(n[o],"tbody")&&!n[o].childNodes.length&&n[o].parentNode.removeChild(n[o])}!c.support.leadingWhitespace&&V.test(j)&&i.insertBefore(b.createTextNode(V.exec(j)[0]),i.firstChild);
j=c.makeArray(i.childNodes)}if(j.nodeType)e.push(j);else e=c.merge(e,j)}});if(d)for(a=0;e[a];a++)if(f&&c.nodeName(e[a],"script")&&(!e[a].type||e[a].type.toLowerCase()==="text/javascript"))f.push(e[a].parentNode?e[a].parentNode.removeChild(e[a]):e[a]);else{e[a].nodeType===1&&e.splice.apply(e,[a+1,0].concat(c.makeArray(e[a].getElementsByTagName("script"))));d.appendChild(e[a])}return e},cleanData:function(a){for(var b=0,d;(d=a[b])!=null;b++){c.event.remove(d);c.removeData(d)}}});var hb=/z-?index|font-?weight|opacity|zoom|line-?height/i,
Ja=/alpha\([^)]*\)/,Ka=/opacity=([^)]*)/,ga=/float/i,ha=/-([a-z])/ig,ib=/([A-Z])/g,jb=/^-?\d+(?:px)?$/i,kb=/^-?\d/,lb={position:"absolute",visibility:"hidden",display:"block"},mb=["Left","Right"],nb=["Top","Bottom"],ob=r.defaultView&&r.defaultView.getComputedStyle,La=c.support.cssFloat?"cssFloat":"styleFloat",ia=function(a,b){return b.toUpperCase()};c.fn.css=function(a,b){return X(this,a,b,true,function(d,f,e){if(e===v)return c.curCSS(d,f);if(typeof e==="number"&&!hb.test(f))e+="px";c.style(d,f,e)})};
c.extend({style:function(a,b,d){if(!a||a.nodeType===3||a.nodeType===8)return v;if((b==="width"||b==="height")&&parseFloat(d)<0)d=v;var f=a.style||a,e=d!==v;if(!c.support.opacity&&b==="opacity"){if(e){f.zoom=1;b=parseInt(d,10)+""==="NaN"?"":"alpha(opacity="+d*100+")";a=f.filter||c.curCSS(a,"filter")||"";f.filter=Ja.test(a)?a.replace(Ja,b):b}return f.filter&&f.filter.indexOf("opacity=")>=0?parseFloat(Ka.exec(f.filter)[1])/100+"":""}if(ga.test(b))b=La;b=b.replace(ha,ia);if(e)f[b]=d;return f[b]},css:function(a,
b,d,f){if(b==="width"||b==="height"){var e,i=b==="width"?mb:nb;function j(){e=b==="width"?a.offsetWidth:a.offsetHeight;f!=="border"&&c.each(i,function(){f||(e-=parseFloat(c.curCSS(a,"padding"+this,true))||0);if(f==="margin")e+=parseFloat(c.curCSS(a,"margin"+this,true))||0;else e-=parseFloat(c.curCSS(a,"border"+this+"Width",true))||0})}a.offsetWidth!==0?j():c.swap(a,lb,j);return Math.max(0,Math.round(e))}return c.curCSS(a,b,d)},curCSS:function(a,b,d){var f,e=a.style;if(!c.support.opacity&&b==="opacity"&&
a.currentStyle){f=Ka.test(a.currentStyle.filter||"")?parseFloat(RegExp.$1)/100+"":"";return f===""?"1":f}if(ga.test(b))b=La;if(!d&&e&&e[b])f=e[b];else if(ob){if(ga.test(b))b="float";b=b.replace(ib,"-$1").toLowerCase();e=a.ownerDocument.defaultView;if(!e)return null;if(a=e.getComputedStyle(a,null))f=a.getPropertyValue(b);if(b==="opacity"&&f==="")f="1"}else if(a.currentStyle){d=b.replace(ha,ia);f=a.currentStyle[b]||a.currentStyle[d];if(!jb.test(f)&&kb.test(f)){b=e.left;var i=a.runtimeStyle.left;a.runtimeStyle.left=
a.currentStyle.left;e.left=d==="fontSize"?"1em":f||0;f=e.pixelLeft+"px";e.left=b;a.runtimeStyle.left=i}}return f},swap:function(a,b,d){var f={};for(var e in b){f[e]=a.style[e];a.style[e]=b[e]}d.call(a);for(e in b)a.style[e]=f[e]}});if(c.expr&&c.expr.filters){c.expr.filters.hidden=function(a){var b=a.offsetWidth,d=a.offsetHeight,f=a.nodeName.toLowerCase()==="tr";return b===0&&d===0&&!f?true:b>0&&d>0&&!f?false:c.curCSS(a,"display")==="none"};c.expr.filters.visible=function(a){return!c.expr.filters.hidden(a)}}var pb=
J(),qb=/<script(.|\s)*?\/script>/gi,rb=/select|textarea/i,sb=/color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,N=/=\?(&|$)/,ja=/\?/,tb=/(\?|&)_=.*?(&|$)/,ub=/^(\w+:)?\/\/([^\/?#]+)/,vb=/%20/g;c.fn.extend({_load:c.fn.load,load:function(a,b,d){if(typeof a!=="string")return this._load(a);else if(!this.length)return this;var f=a.indexOf(" ");if(f>=0){var e=a.slice(f,a.length);a=a.slice(0,f)}f="GET";if(b)if(c.isFunction(b)){d=b;b=null}else if(typeof b==="object"){b=
c.param(b,c.ajaxSettings.traditional);f="POST"}var i=this;c.ajax({url:a,type:f,dataType:"html",data:b,complete:function(j,n){if(n==="success"||n==="notmodified")i.html(e?c("<div />").append(j.responseText.replace(qb,"")).find(e):j.responseText);d&&i.each(d,[j.responseText,n,j])}});return this},serialize:function(){return c.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?c.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&
(this.checked||rb.test(this.nodeName)||sb.test(this.type))}).map(function(a,b){a=c(this).val();return a==null?null:c.isArray(a)?c.map(a,function(d){return{name:b.name,value:d}}):{name:b.name,value:a}}).get()}});c.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){c.fn[b]=function(d){return this.bind(b,d)}});c.extend({get:function(a,b,d,f){if(c.isFunction(b)){f=f||d;d=b;b=null}return c.ajax({type:"GET",url:a,data:b,success:d,dataType:f})},getScript:function(a,
b){return c.get(a,null,b,"script")},getJSON:function(a,b,d){return c.get(a,b,d,"json")},post:function(a,b,d,f){if(c.isFunction(b)){f=f||d;d=b;b={}}return c.ajax({type:"POST",url:a,data:b,success:d,dataType:f})},ajaxSetup:function(a){c.extend(c.ajaxSettings,a)},ajaxSettings:{url:location.href,global:true,type:"GET",contentType:"application/x-www-form-urlencoded",processData:true,async:true,xhr:z.XMLHttpRequest&&(z.location.protocol!=="file:"||!z.ActiveXObject)?function(){return new z.XMLHttpRequest}:
function(){try{return new z.ActiveXObject("Microsoft.XMLHTTP")}catch(a){}},accepts:{xml:"application/xml, text/xml",html:"text/html",script:"text/javascript, application/javascript",json:"application/json, text/javascript",text:"text/plain",_default:"*/*"}},lastModified:{},etag:{},ajax:function(a){function b(){e.success&&e.success.call(o,n,j,w);e.global&&f("ajaxSuccess",[w,e])}function d(){e.complete&&e.complete.call(o,w,j);e.global&&f("ajaxComplete",[w,e]);e.global&&!--c.active&&c.event.trigger("ajaxStop")}
function f(q,p){(e.context?c(e.context):c.event).trigger(q,p)}var e=c.extend(true,{},c.ajaxSettings,a),i,j,n,o=a&&a.context||e,m=e.type.toUpperCase();if(e.data&&e.processData&&typeof e.data!=="string")e.data=c.param(e.data,e.traditional);if(e.dataType==="jsonp"){if(m==="GET")N.test(e.url)||(e.url+=(ja.test(e.url)?"&":"?")+(e.jsonp||"callback")+"=?");else if(!e.data||!N.test(e.data))e.data=(e.data?e.data+"&":"")+(e.jsonp||"callback")+"=?";e.dataType="json"}if(e.dataType==="json"&&(e.data&&N.test(e.data)||
N.test(e.url))){i=e.jsonpCallback||"jsonp"+pb++;if(e.data)e.data=(e.data+"").replace(N,"="+i+"$1");e.url=e.url.replace(N,"="+i+"$1");e.dataType="script";z[i]=z[i]||function(q){n=q;b();d();z[i]=v;try{delete z[i]}catch(p){}A&&A.removeChild(B)}}if(e.dataType==="script"&&e.cache===null)e.cache=false;if(e.cache===false&&m==="GET"){var s=J(),x=e.url.replace(tb,"$1_="+s+"$2");e.url=x+(x===e.url?(ja.test(e.url)?"&":"?")+"_="+s:"")}if(e.data&&m==="GET")e.url+=(ja.test(e.url)?"&":"?")+e.data;e.global&&!c.active++&&
c.event.trigger("ajaxStart");s=(s=ub.exec(e.url))&&(s[1]&&s[1]!==location.protocol||s[2]!==location.host);if(e.dataType==="script"&&m==="GET"&&s){var A=r.getElementsByTagName("head")[0]||r.documentElement,B=r.createElement("script");B.src=e.url;if(e.scriptCharset)B.charset=e.scriptCharset;if(!i){var C=false;B.onload=B.onreadystatechange=function(){if(!C&&(!this.readyState||this.readyState==="loaded"||this.readyState==="complete")){C=true;b();d();B.onload=B.onreadystatechange=null;A&&B.parentNode&&
A.removeChild(B)}}}A.insertBefore(B,A.firstChild);return v}var E=false,w=e.xhr();if(w){e.username?w.open(m,e.url,e.async,e.username,e.password):w.open(m,e.url,e.async);try{if(e.data||a&&a.contentType)w.setRequestHeader("Content-Type",e.contentType);if(e.ifModified){c.lastModified[e.url]&&w.setRequestHeader("If-Modified-Since",c.lastModified[e.url]);c.etag[e.url]&&w.setRequestHeader("If-None-Match",c.etag[e.url])}s||w.setRequestHeader("X-Requested-With","XMLHttpRequest");w.setRequestHeader("Accept",
e.dataType&&e.accepts[e.dataType]?e.accepts[e.dataType]+", */*":e.accepts._default)}catch(fa){}if(e.beforeSend&&e.beforeSend.call(o,w,e)===false){e.global&&!--c.active&&c.event.trigger("ajaxStop");w.abort();return false}e.global&&f("ajaxSend",[w,e]);var g=w.onreadystatechange=function(q){if(!w||w.readyState===0||q==="abort"){E||d();E=true;if(w)w.onreadystatechange=c.noop}else if(!E&&w&&(w.readyState===4||q==="timeout")){E=true;w.onreadystatechange=c.noop;j=q==="timeout"?"timeout":!c.httpSuccess(w)?
"error":e.ifModified&&c.httpNotModified(w,e.url)?"notmodified":"success";var p;if(j==="success")try{n=c.httpData(w,e.dataType,e)}catch(u){j="parsererror";p=u}if(j==="success"||j==="notmodified")i||b();else c.handleError(e,w,j,p);d();q==="timeout"&&w.abort();if(e.async)w=null}};try{var h=w.abort;w.abort=function(){w&&h.call(w);g("abort")}}catch(k){}e.async&&e.timeout>0&&setTimeout(function(){w&&!E&&g("timeout")},e.timeout);try{w.send(m==="POST"||m==="PUT"||m==="DELETE"?e.data:null)}catch(l){c.handleError(e,
w,null,l);d()}e.async||g();return w}},handleError:function(a,b,d,f){if(a.error)a.error.call(a.context||a,b,d,f);if(a.global)(a.context?c(a.context):c.event).trigger("ajaxError",[b,a,f])},active:0,httpSuccess:function(a){try{return!a.status&&location.protocol==="file:"||a.status>=200&&a.status<300||a.status===304||a.status===1223||a.status===0}catch(b){}return false},httpNotModified:function(a,b){var d=a.getResponseHeader("Last-Modified"),f=a.getResponseHeader("Etag");if(d)c.lastModified[b]=d;if(f)c.etag[b]=
f;return a.status===304||a.status===0},httpData:function(a,b,d){var f=a.getResponseHeader("content-type")||"",e=b==="xml"||!b&&f.indexOf("xml")>=0;a=e?a.responseXML:a.responseText;e&&a.documentElement.nodeName==="parsererror"&&c.error("parsererror");if(d&&d.dataFilter)a=d.dataFilter(a,b);if(typeof a==="string")if(b==="json"||!b&&f.indexOf("json")>=0)a=c.parseJSON(a);else if(b==="script"||!b&&f.indexOf("javascript")>=0)c.globalEval(a);return a},param:function(a,b){function d(j,n){if(c.isArray(n))c.each(n,
function(o,m){b?f(j,m):d(j+"["+(typeof m==="object"||c.isArray(m)?o:"")+"]",m)});else!b&&n!=null&&typeof n==="object"?c.each(n,function(o,m){d(j+"["+o+"]",m)}):f(j,n)}function f(j,n){n=c.isFunction(n)?n():n;e[e.length]=encodeURIComponent(j)+"="+encodeURIComponent(n)}var e=[];if(b===v)b=c.ajaxSettings.traditional;if(c.isArray(a)||a.jquery)c.each(a,function(){f(this.name,this.value)});else for(var i in a)d(i,a[i]);return e.join("&").replace(vb,"+")}});var ka={},wb=/toggle|show|hide/,xb=/^([+-]=)?([\d+-.]+)(.*)$/,
W,ta=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]];c.fn.extend({show:function(a,b){if(a||a===0)return this.animate(K("show",3),a,b);else{a=0;for(b=this.length;a<b;a++){var d=c.data(this[a],"olddisplay");this[a].style.display=d||"";if(c.css(this[a],"display")==="none"){d=this[a].nodeName;var f;if(ka[d])f=ka[d];else{var e=c("<"+d+" />").appendTo("body");f=e.css("display");if(f==="none")f="block";e.remove();
ka[d]=f}c.data(this[a],"olddisplay",f)}}a=0;for(b=this.length;a<b;a++)this[a].style.display=c.data(this[a],"olddisplay")||"";return this}},hide:function(a,b){if(a||a===0)return this.animate(K("hide",3),a,b);else{a=0;for(b=this.length;a<b;a++){var d=c.data(this[a],"olddisplay");!d&&d!=="none"&&c.data(this[a],"olddisplay",c.css(this[a],"display"))}a=0;for(b=this.length;a<b;a++)this[a].style.display="none";return this}},_toggle:c.fn.toggle,toggle:function(a,b){var d=typeof a==="boolean";if(c.isFunction(a)&&
c.isFunction(b))this._toggle.apply(this,arguments);else a==null||d?this.each(function(){var f=d?a:c(this).is(":hidden");c(this)[f?"show":"hide"]()}):this.animate(K("toggle",3),a,b);return this},fadeTo:function(a,b,d){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:b},a,d)},animate:function(a,b,d,f){var e=c.speed(b,d,f);if(c.isEmptyObject(a))return this.each(e.complete);return this[e.queue===false?"each":"queue"](function(){var i=c.extend({},e),j,n=this.nodeType===1&&c(this).is(":hidden"),
o=this;for(j in a){var m=j.replace(ha,ia);if(j!==m){a[m]=a[j];delete a[j];j=m}if(a[j]==="hide"&&n||a[j]==="show"&&!n)return i.complete.call(this);if((j==="height"||j==="width")&&this.style){i.display=c.css(this,"display");i.overflow=this.style.overflow}if(c.isArray(a[j])){(i.specialEasing=i.specialEasing||{})[j]=a[j][1];a[j]=a[j][0]}}if(i.overflow!=null)this.style.overflow="hidden";i.curAnim=c.extend({},a);c.each(a,function(s,x){var A=new c.fx(o,i,s);if(wb.test(x))A[x==="toggle"?n?"show":"hide":x](a);
else{var B=xb.exec(x),C=A.cur(true)||0;if(B){x=parseFloat(B[2]);var E=B[3]||"px";if(E!=="px"){o.style[s]=(x||1)+E;C=(x||1)/A.cur(true)*C;o.style[s]=C+E}if(B[1])x=(B[1]==="-="?-1:1)*x+C;A.custom(C,x,E)}else A.custom(C,x,"")}});return true})},stop:function(a,b){var d=c.timers;a&&this.queue([]);this.each(function(){for(var f=d.length-1;f>=0;f--)if(d[f].elem===this){b&&d[f](true);d.splice(f,1)}});b||this.dequeue();return this}});c.each({slideDown:K("show",1),slideUp:K("hide",1),slideToggle:K("toggle",
1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"}},function(a,b){c.fn[a]=function(d,f){return this.animate(b,d,f)}});c.extend({speed:function(a,b,d){var f=a&&typeof a==="object"?a:{complete:d||!d&&b||c.isFunction(a)&&a,duration:a,easing:d&&b||b&&!c.isFunction(b)&&b};f.duration=c.fx.off?0:typeof f.duration==="number"?f.duration:c.fx.speeds[f.duration]||c.fx.speeds._default;f.old=f.complete;f.complete=function(){f.queue!==false&&c(this).dequeue();c.isFunction(f.old)&&f.old.call(this)};return f},easing:{linear:function(a,
b,d,f){return d+f*a},swing:function(a,b,d,f){return(-Math.cos(a*Math.PI)/2+0.5)*f+d}},timers:[],fx:function(a,b,d){this.options=b;this.elem=a;this.prop=d;if(!b.orig)b.orig={}}});c.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this);(c.fx.step[this.prop]||c.fx.step._default)(this);if((this.prop==="height"||this.prop==="width")&&this.elem.style)this.elem.style.display="block"},cur:function(a){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==
null))return this.elem[this.prop];return(a=parseFloat(c.css(this.elem,this.prop,a)))&&a>-10000?a:parseFloat(c.curCSS(this.elem,this.prop))||0},custom:function(a,b,d){function f(i){return e.step(i)}this.startTime=J();this.start=a;this.end=b;this.unit=d||this.unit||"px";this.now=this.start;this.pos=this.state=0;var e=this;f.elem=this.elem;if(f()&&c.timers.push(f)&&!W)W=setInterval(c.fx.tick,13)},show:function(){this.options.orig[this.prop]=c.style(this.elem,this.prop);this.options.show=true;this.custom(this.prop===
"width"||this.prop==="height"?1:0,this.cur());c(this.elem).show()},hide:function(){this.options.orig[this.prop]=c.style(this.elem,this.prop);this.options.hide=true;this.custom(this.cur(),0)},step:function(a){var b=J(),d=true;if(a||b>=this.options.duration+this.startTime){this.now=this.end;this.pos=this.state=1;this.update();this.options.curAnim[this.prop]=true;for(var f in this.options.curAnim)if(this.options.curAnim[f]!==true)d=false;if(d){if(this.options.display!=null){this.elem.style.overflow=
this.options.overflow;a=c.data(this.elem,"olddisplay");this.elem.style.display=a?a:this.options.display;if(c.css(this.elem,"display")==="none")this.elem.style.display="block"}this.options.hide&&c(this.elem).hide();if(this.options.hide||this.options.show)for(var e in this.options.curAnim)c.style(this.elem,e,this.options.orig[e]);this.options.complete.call(this.elem)}return false}else{e=b-this.startTime;this.state=e/this.options.duration;a=this.options.easing||(c.easing.swing?"swing":"linear");this.pos=
c.easing[this.options.specialEasing&&this.options.specialEasing[this.prop]||a](this.state,e,0,1,this.options.duration);this.now=this.start+(this.end-this.start)*this.pos;this.update()}return true}};c.extend(c.fx,{tick:function(){for(var a=c.timers,b=0;b<a.length;b++)a[b]()||a.splice(b--,1);a.length||c.fx.stop()},stop:function(){clearInterval(W);W=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(a){c.style(a.elem,"opacity",a.now)},_default:function(a){if(a.elem.style&&a.elem.style[a.prop]!=
null)a.elem.style[a.prop]=(a.prop==="width"||a.prop==="height"?Math.max(0,a.now):a.now)+a.unit;else a.elem[a.prop]=a.now}}});if(c.expr&&c.expr.filters)c.expr.filters.animated=function(a){return c.grep(c.timers,function(b){return a===b.elem}).length};c.fn.offset="getBoundingClientRect"in r.documentElement?function(a){var b=this[0];if(a)return this.each(function(e){c.offset.setOffset(this,a,e)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return c.offset.bodyOffset(b);var d=b.getBoundingClientRect(),
f=b.ownerDocument;b=f.body;f=f.documentElement;return{top:d.top+(self.pageYOffset||c.support.boxModel&&f.scrollTop||b.scrollTop)-(f.clientTop||b.clientTop||0),left:d.left+(self.pageXOffset||c.support.boxModel&&f.scrollLeft||b.scrollLeft)-(f.clientLeft||b.clientLeft||0)}}:function(a){var b=this[0];if(a)return this.each(function(s){c.offset.setOffset(this,a,s)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return c.offset.bodyOffset(b);c.offset.initialize();var d=b.offsetParent,f=
b,e=b.ownerDocument,i,j=e.documentElement,n=e.body;f=(e=e.defaultView)?e.getComputedStyle(b,null):b.currentStyle;for(var o=b.offsetTop,m=b.offsetLeft;(b=b.parentNode)&&b!==n&&b!==j;){if(c.offset.supportsFixedPosition&&f.position==="fixed")break;i=e?e.getComputedStyle(b,null):b.currentStyle;o-=b.scrollTop;m-=b.scrollLeft;if(b===d){o+=b.offsetTop;m+=b.offsetLeft;if(c.offset.doesNotAddBorder&&!(c.offset.doesAddBorderForTableAndCells&&/^t(able|d|h)$/i.test(b.nodeName))){o+=parseFloat(i.borderTopWidth)||
0;m+=parseFloat(i.borderLeftWidth)||0}f=d;d=b.offsetParent}if(c.offset.subtractsBorderForOverflowNotVisible&&i.overflow!=="visible"){o+=parseFloat(i.borderTopWidth)||0;m+=parseFloat(i.borderLeftWidth)||0}f=i}if(f.position==="relative"||f.position==="static"){o+=n.offsetTop;m+=n.offsetLeft}if(c.offset.supportsFixedPosition&&f.position==="fixed"){o+=Math.max(j.scrollTop,n.scrollTop);m+=Math.max(j.scrollLeft,n.scrollLeft)}return{top:o,left:m}};c.offset={initialize:function(){var a=r.body,b=r.createElement("div"),
d,f,e,i=parseFloat(c.curCSS(a,"marginTop",true))||0;c.extend(b.style,{position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"});b.innerHTML="<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";a.insertBefore(b,a.firstChild);
d=b.firstChild;f=d.firstChild;e=d.nextSibling.firstChild.firstChild;this.doesNotAddBorder=f.offsetTop!==5;this.doesAddBorderForTableAndCells=e.offsetTop===5;f.style.position="fixed";f.style.top="20px";this.supportsFixedPosition=f.offsetTop===20||f.offsetTop===15;f.style.position=f.style.top="";d.style.overflow="hidden";d.style.position="relative";this.subtractsBorderForOverflowNotVisible=f.offsetTop===-5;this.doesNotIncludeMarginInBodyOffset=a.offsetTop!==i;a.removeChild(b);c.offset.initialize=c.noop},
bodyOffset:function(a){var b=a.offsetTop,d=a.offsetLeft;c.offset.initialize();if(c.offset.doesNotIncludeMarginInBodyOffset){b+=parseFloat(c.curCSS(a,"marginTop",true))||0;d+=parseFloat(c.curCSS(a,"marginLeft",true))||0}return{top:b,left:d}},setOffset:function(a,b,d){if(/static/.test(c.curCSS(a,"position")))a.style.position="relative";var f=c(a),e=f.offset(),i=parseInt(c.curCSS(a,"top",true),10)||0,j=parseInt(c.curCSS(a,"left",true),10)||0;if(c.isFunction(b))b=b.call(a,d,e);d={top:b.top-e.top+i,left:b.left-
e.left+j};"using"in b?b.using.call(a,d):f.css(d)}};c.fn.extend({position:function(){if(!this[0])return null;var a=this[0],b=this.offsetParent(),d=this.offset(),f=/^body|html$/i.test(b[0].nodeName)?{top:0,left:0}:b.offset();d.top-=parseFloat(c.curCSS(a,"marginTop",true))||0;d.left-=parseFloat(c.curCSS(a,"marginLeft",true))||0;f.top+=parseFloat(c.curCSS(b[0],"borderTopWidth",true))||0;f.left+=parseFloat(c.curCSS(b[0],"borderLeftWidth",true))||0;return{top:d.top-f.top,left:d.left-f.left}},offsetParent:function(){return this.map(function(){for(var a=
this.offsetParent||r.body;a&&!/^body|html$/i.test(a.nodeName)&&c.css(a,"position")==="static";)a=a.offsetParent;return a})}});c.each(["Left","Top"],function(a,b){var d="scroll"+b;c.fn[d]=function(f){var e=this[0],i;if(!e)return null;if(f!==v)return this.each(function(){if(i=ua(this))i.scrollTo(!a?f:c(i).scrollLeft(),a?f:c(i).scrollTop());else this[d]=f});else return(i=ua(e))?"pageXOffset"in i?i[a?"pageYOffset":"pageXOffset"]:c.support.boxModel&&i.document.documentElement[d]||i.document.body[d]:e[d]}});
c.each(["Height","Width"],function(a,b){var d=b.toLowerCase();c.fn["inner"+b]=function(){return this[0]?c.css(this[0],d,false,"padding"):null};c.fn["outer"+b]=function(f){return this[0]?c.css(this[0],d,false,f?"margin":"border"):null};c.fn[d]=function(f){var e=this[0];if(!e)return f==null?null:this;if(c.isFunction(f))return this.each(function(i){var j=c(this);j[d](f.call(this,i,j[d]()))});return"scrollTo"in e&&e.document?e.document.compatMode==="CSS1Compat"&&e.document.documentElement["client"+b]||
e.document.body["client"+b]:e.nodeType===9?Math.max(e.documentElement["client"+b],e.body["scroll"+b],e.documentElement["scroll"+b],e.body["offset"+b],e.documentElement["offset"+b]):f===v?c.css(e,d):this.css(d,typeof f==="string"?f:f+"px")}});z.jQuery=z.$=c})(window);
/*
 * Raphael 1.3.1 - JavaScript Vector Library
 *
 * Copyright (c) 2008 - 2009 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael=(function(){var a=/[, ]+/,aO=/^(circle|rect|path|ellipse|text|image)$/,L=document,au=window,l={was:"Raphael" in au,is:au.Raphael},an=function(){if(an.is(arguments[0],"array")){var d=arguments[0],e=w[aW](an,d.splice(0,3+an.is(d[0],al))),S=e.set();for(var R=0,a0=d[m];R<a0;R++){var E=d[R]||{};aO.test(E.type)&&S[f](e[E.type]().attr(E));}return S;}return w[aW](an,arguments);},aT=function(){},aL="appendChild",aW="apply",aS="concat",at="",am=" ",z="split",F="click dblclick mousedown mousemove mouseout mouseover mouseup"[z](am),Q="hasOwnProperty",az="join",m="length",aY="prototype",aZ=String[aY].toLowerCase,ab=Math,g=ab.max,aI=ab.min,al="number",aA="toString",aw=Object[aY][aA],aQ={},aM=ab.pow,f="push",aU=/^(?=[\da-f]$)/,c=/^url\(['"]?([^\)]+)['"]?\)$/i,x=/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgb\(\s*([\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|rgb\(\s*([\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\)|hs[bl]\(\s*([\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|hs[bl]\(\s*([\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\))\s*$/i,O=ab.round,v="setAttribute",W=parseFloat,G=parseInt,aN=String[aY].toUpperCase,j={"clip-rect":"0 0 1e9 1e9",cursor:"default",cx:0,cy:0,fill:"#fff","fill-opacity":1,font:'10px "Arial"',"font-family":'"Arial"',"font-size":"10","font-style":"normal","font-weight":400,gradient:0,height:0,href:"http://raphaeljs.com/",opacity:1,path:"M0,0",r:0,rotation:0,rx:0,ry:0,scale:"1 1",src:"",stroke:"#000","stroke-dasharray":"","stroke-linecap":"butt","stroke-linejoin":"butt","stroke-miterlimit":0,"stroke-opacity":1,"stroke-width":1,target:"_blank","text-anchor":"middle",title:"Raphael",translation:"0 0",width:0,x:0,y:0},Z={along:"along","clip-rect":"csv",cx:al,cy:al,fill:"colour","fill-opacity":al,"font-size":al,height:al,opacity:al,path:"path",r:al,rotation:"csv",rx:al,ry:al,scale:"csv",stroke:"colour","stroke-opacity":al,"stroke-width":al,translation:"csv",width:al,x:al,y:al},aP="replace";an.version="1.3.1";an.type=(au.SVGAngle||L.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")?"SVG":"VML");if(an.type=="VML"){var ag=document.createElement("div");ag.innerHTML="<!--[if vml]><br><br><![endif]-->";if(ag.childNodes[m]!=2){return null;}}an.svg=!(an.vml=an.type=="VML");aT[aY]=an[aY];an._id=0;an._oid=0;an.fn={};an.is=function(e,d){d=aZ.call(d);return((d=="object"||d=="undefined")&&typeof e==d)||(e==null&&d=="null")||aZ.call(aw.call(e).slice(8,-1))==d;};an.setWindow=function(d){au=d;L=au.document;};var aD=function(e){if(an.vml){var d=/^\s+|\s+$/g;aD=aj(function(R){var S;R=(R+at)[aP](d,at);try{var a0=new ActiveXObject("htmlfile");a0.write("<body>");a0.close();S=a0.body;}catch(a2){S=createPopup().document.body;}var i=S.createTextRange();try{S.style.color=R;var a1=i.queryCommandValue("ForeColor");a1=((a1&255)<<16)|(a1&65280)|((a1&16711680)>>>16);return"#"+("000000"+a1[aA](16)).slice(-6);}catch(a2){return"none";}});}else{var E=L.createElement("i");E.title="Rapha\xebl Colour Picker";E.style.display="none";L.body[aL](E);aD=aj(function(i){E.style.color=i;return L.defaultView.getComputedStyle(E,at).getPropertyValue("color");});}return aD(e);};an.hsb2rgb=aj(function(a3,a1,a7){if(an.is(a3,"object")&&"h" in a3&&"s" in a3&&"b" in a3){a7=a3.b;a1=a3.s;a3=a3.h;}var R,S,a8;if(a7==0){return{r:0,g:0,b:0,hex:"#000"};}if(a3>1||a1>1||a7>1){a3/=255;a1/=255;a7/=255;}var a0=~~(a3*6),a4=(a3*6)-a0,E=a7*(1-a1),e=a7*(1-(a1*a4)),a9=a7*(1-(a1*(1-a4)));R=[a7,e,E,E,a9,a7,a7][a0];S=[a9,a7,a7,e,E,E,a9][a0];a8=[E,E,a9,a7,a7,e,E][a0];R*=255;S*=255;a8*=255;var a5={r:R,g:S,b:a8},d=(~~R)[aA](16),a2=(~~S)[aA](16),a6=(~~a8)[aA](16);d=d[aP](aU,"0");a2=a2[aP](aU,"0");a6=a6[aP](aU,"0");a5.hex="#"+d+a2+a6;return a5;},an);an.rgb2hsb=aj(function(d,e,a1){if(an.is(d,"object")&&"r" in d&&"g" in d&&"b" in d){a1=d.b;e=d.g;d=d.r;}if(an.is(d,"string")){var a3=an.getRGB(d);d=a3.r;e=a3.g;a1=a3.b;}if(d>1||e>1||a1>1){d/=255;e/=255;a1/=255;}var a0=g(d,e,a1),i=aI(d,e,a1),R,E,S=a0;if(i==a0){return{h:0,s:0,b:a0};}else{var a2=(a0-i);E=a2/a0;if(d==a0){R=(e-a1)/a2;}else{if(e==a0){R=2+((a1-d)/a2);}else{R=4+((d-e)/a2);}}R/=6;R<0&&R++;R>1&&R--;}return{h:R,s:E,b:S};},an);var aE=/,?([achlmqrstvxz]),?/gi;an._path2string=function(){return this.join(",")[aP](aE,"$1");};function aj(E,e,d){function i(){var R=Array[aY].slice.call(arguments,0),a0=R[az]("\u25ba"),S=i.cache=i.cache||{},a1=i.count=i.count||[];if(S[Q](a0)){return d?d(S[a0]):S[a0];}a1[m]>=1000&&delete S[a1.shift()];a1[f](a0);S[a0]=E[aW](e,R);return d?d(S[a0]):S[a0];}return i;}an.getRGB=aj(function(d){if(!d||!!((d=d+at).indexOf("-")+1)){return{r:-1,g:-1,b:-1,hex:"none",error:1};}if(d=="none"){return{r:-1,g:-1,b:-1,hex:"none"};}!(({hs:1,rg:1})[Q](d.substring(0,2))||d.charAt()=="#")&&(d=aD(d));var S,i,E,a2,a3,a0=d.match(x);if(a0){if(a0[2]){a2=G(a0[2].substring(5),16);E=G(a0[2].substring(3,5),16);i=G(a0[2].substring(1,3),16);}if(a0[3]){a2=G((a3=a0[3].charAt(3))+a3,16);E=G((a3=a0[3].charAt(2))+a3,16);i=G((a3=a0[3].charAt(1))+a3,16);}if(a0[4]){a0=a0[4][z](/\s*,\s*/);i=W(a0[0]);E=W(a0[1]);a2=W(a0[2]);}if(a0[5]){a0=a0[5][z](/\s*,\s*/);i=W(a0[0])*2.55;E=W(a0[1])*2.55;a2=W(a0[2])*2.55;}if(a0[6]){a0=a0[6][z](/\s*,\s*/);i=W(a0[0]);E=W(a0[1]);a2=W(a0[2]);return an.hsb2rgb(i,E,a2);}if(a0[7]){a0=a0[7][z](/\s*,\s*/);i=W(a0[0])*2.55;E=W(a0[1])*2.55;a2=W(a0[2])*2.55;return an.hsb2rgb(i,E,a2);}a0={r:i,g:E,b:a2};var e=(~~i)[aA](16),R=(~~E)[aA](16),a1=(~~a2)[aA](16);e=e[aP](aU,"0");R=R[aP](aU,"0");a1=a1[aP](aU,"0");a0.hex="#"+e+R+a1;return a0;}return{r:-1,g:-1,b:-1,hex:"none",error:1};},an);an.getColor=function(e){var i=this.getColor.start=this.getColor.start||{h:0,s:1,b:e||0.75},d=this.hsb2rgb(i.h,i.s,i.b);i.h+=0.075;if(i.h>1){i.h=0;i.s-=0.2;i.s<=0&&(this.getColor.start={h:0,s:1,b:i.b});}return d.hex;};an.getColor.reset=function(){delete this.start;};an.parsePathString=aj(function(d){if(!d){return null;}var i={a:7,c:6,h:1,l:2,m:2,q:4,s:4,t:2,v:1,z:0},e=[];if(an.is(d,"array")&&an.is(d[0],"array")){e=av(d);}if(!e[m]){(d+at)[aP](/([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,function(R,E,a1){var a0=[],S=aZ.call(E);a1[aP](/(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig,function(a3,a2){a2&&a0[f](+a2);});while(a0[m]>=i[S]){e[f]([E][aS](a0.splice(0,i[S])));if(!i[S]){break;}}});}e[aA]=an._path2string;return e;});an.findDotsAtSegment=function(e,d,be,bc,a0,R,a2,a1,a8){var a6=1-a8,a5=aM(a6,3)*e+aM(a6,2)*3*a8*be+a6*3*a8*a8*a0+aM(a8,3)*a2,a3=aM(a6,3)*d+aM(a6,2)*3*a8*bc+a6*3*a8*a8*R+aM(a8,3)*a1,ba=e+2*a8*(be-e)+a8*a8*(a0-2*be+e),a9=d+2*a8*(bc-d)+a8*a8*(R-2*bc+d),bd=be+2*a8*(a0-be)+a8*a8*(a2-2*a0+be),bb=bc+2*a8*(R-bc)+a8*a8*(a1-2*R+bc),a7=(1-a8)*e+a8*be,a4=(1-a8)*d+a8*bc,E=(1-a8)*a0+a8*a2,i=(1-a8)*R+a8*a1,S=(90-ab.atan((ba-bd)/(a9-bb))*180/ab.PI);(ba>bd||a9<bb)&&(S+=180);return{x:a5,y:a3,m:{x:ba,y:a9},n:{x:bd,y:bb},start:{x:a7,y:a4},end:{x:E,y:i},alpha:S};};var U=aj(function(a5){if(!a5){return{x:0,y:0,width:0,height:0};}a5=H(a5);var a2=0,a1=0,R=[],e=[],E;for(var S=0,a4=a5[m];S<a4;S++){E=a5[S];if(E[0]=="M"){a2=E[1];a1=E[2];R[f](a2);e[f](a1);}else{var a0=aC(a2,a1,E[1],E[2],E[3],E[4],E[5],E[6]);R=R[aS](a0.min.x,a0.max.x);e=e[aS](a0.min.y,a0.max.y);a2=E[5];a1=E[6];}}var d=aI[aW](0,R),a3=aI[aW](0,e);return{x:d,y:a3,width:g[aW](0,R)-d,height:g[aW](0,e)-a3};}),av=function(a0){var E=[];if(!an.is(a0,"array")||!an.is(a0&&a0[0],"array")){a0=an.parsePathString(a0);}for(var e=0,R=a0[m];e<R;e++){E[e]=[];for(var d=0,S=a0[e][m];d<S;d++){E[e][d]=a0[e][d];}}E[aA]=an._path2string;return E;},ad=aj(function(R){if(!an.is(R,"array")||!an.is(R&&R[0],"array")){R=an.parsePathString(R);}var a4=[],a6=0,a5=0,a9=0,a8=0,E=0;if(R[0][0]=="M"){a6=R[0][1];a5=R[0][2];a9=a6;a8=a5;E++;a4[f](["M",a6,a5]);}for(var a1=E,ba=R[m];a1<ba;a1++){var d=a4[a1]=[],a7=R[a1];if(a7[0]!=aZ.call(a7[0])){d[0]=aZ.call(a7[0]);switch(d[0]){case"a":d[1]=a7[1];d[2]=a7[2];d[3]=a7[3];d[4]=a7[4];d[5]=a7[5];d[6]=+(a7[6]-a6).toFixed(3);d[7]=+(a7[7]-a5).toFixed(3);break;case"v":d[1]=+(a7[1]-a5).toFixed(3);break;case"m":a9=a7[1];a8=a7[2];default:for(var a0=1,a2=a7[m];a0<a2;a0++){d[a0]=+(a7[a0]-((a0%2)?a6:a5)).toFixed(3);}}}else{d=a4[a1]=[];if(a7[0]=="m"){a9=a7[1]+a6;a8=a7[2]+a5;}for(var S=0,e=a7[m];S<e;S++){a4[a1][S]=a7[S];}}var a3=a4[a1][m];switch(a4[a1][0]){case"z":a6=a9;a5=a8;break;case"h":a6+=+a4[a1][a3-1];break;case"v":a5+=+a4[a1][a3-1];break;default:a6+=+a4[a1][a3-2];a5+=+a4[a1][a3-1];}}a4[aA]=an._path2string;return a4;},0,av),r=aj(function(R){if(!an.is(R,"array")||!an.is(R&&R[0],"array")){R=an.parsePathString(R);}var a3=[],a5=0,a4=0,a8=0,a7=0,E=0;if(R[0][0]=="M"){a5=+R[0][1];a4=+R[0][2];a8=a5;a7=a4;E++;a3[0]=["M",a5,a4];}for(var a1=E,a9=R[m];a1<a9;a1++){var d=a3[a1]=[],a6=R[a1];if(a6[0]!=aN.call(a6[0])){d[0]=aN.call(a6[0]);switch(d[0]){case"A":d[1]=a6[1];d[2]=a6[2];d[3]=a6[3];d[4]=a6[4];d[5]=a6[5];d[6]=+(a6[6]+a5);d[7]=+(a6[7]+a4);break;case"V":d[1]=+a6[1]+a4;break;case"H":d[1]=+a6[1]+a5;break;case"M":a8=+a6[1]+a5;a7=+a6[2]+a4;default:for(var a0=1,a2=a6[m];a0<a2;a0++){d[a0]=+a6[a0]+((a0%2)?a5:a4);}}}else{for(var S=0,e=a6[m];S<e;S++){a3[a1][S]=a6[S];}}switch(d[0]){case"Z":a5=a8;a4=a7;break;case"H":a5=d[1];break;case"V":a4=d[1];break;default:a5=a3[a1][a3[a1][m]-2];a4=a3[a1][a3[a1][m]-1];}}a3[aA]=an._path2string;return a3;},null,av),aX=function(e,E,d,i){return[e,E,d,i,d,i];},aK=function(e,E,a0,R,d,i){var S=1/3,a1=2/3;return[S*e+a1*a0,S*E+a1*R,S*d+a1*a0,S*i+a1*R,d,i];},K=function(a9,bE,bi,bg,ba,a4,S,a8,bD,bb){var R=ab.PI,bf=R*120/180,d=R/180*(+ba||0),bm=[],bj,bA=aj(function(bF,bI,i){var bH=bF*ab.cos(i)-bI*ab.sin(i),bG=bF*ab.sin(i)+bI*ab.cos(i);return{x:bH,y:bG};});if(!bb){bj=bA(a9,bE,-d);a9=bj.x;bE=bj.y;bj=bA(a8,bD,-d);a8=bj.x;bD=bj.y;var e=ab.cos(R/180*ba),a6=ab.sin(R/180*ba),bo=(a9-a8)/2,bn=(bE-bD)/2;bi=g(bi,ab.abs(bo));bg=g(bg,ab.abs(bn));var by=(bo*bo)/(bi*bi)+(bn*bn)/(bg*bg);if(by>1){bi=ab.sqrt(by)*bi;bg=ab.sqrt(by)*bg;}var E=bi*bi,br=bg*bg,bt=(a4==S?-1:1)*ab.sqrt(ab.abs((E*br-E*bn*bn-br*bo*bo)/(E*bn*bn+br*bo*bo))),bd=bt*bi*bn/bg+(a9+a8)/2,bc=bt*-bg*bo/bi+(bE+bD)/2,a3=ab.asin(((bE-bc)/bg).toFixed(7)),a2=ab.asin(((bD-bc)/bg).toFixed(7));a3=a9<bd?R-a3:a3;a2=a8<bd?R-a2:a2;a3<0&&(a3=R*2+a3);a2<0&&(a2=R*2+a2);if(S&&a3>a2){a3=a3-R*2;}if(!S&&a2>a3){a2=a2-R*2;}}else{a3=bb[0];a2=bb[1];bd=bb[2];bc=bb[3];}var a7=a2-a3;if(ab.abs(a7)>bf){var be=a2,bh=a8,a5=bD;a2=a3+bf*(S&&a2>a3?1:-1);a8=bd+bi*ab.cos(a2);bD=bc+bg*ab.sin(a2);bm=K(a8,bD,bi,bg,ba,0,S,bh,a5,[a2,be,bd,bc]);}a7=a2-a3;var a1=ab.cos(a3),bC=ab.sin(a3),a0=ab.cos(a2),bB=ab.sin(a2),bp=ab.tan(a7/4),bs=4/3*bi*bp,bq=4/3*bg*bp,bz=[a9,bE],bx=[a9+bs*bC,bE-bq*a1],bw=[a8+bs*bB,bD-bq*a0],bu=[a8,bD];bx[0]=2*bz[0]-bx[0];bx[1]=2*bz[1]-bx[1];if(bb){return[bx,bw,bu][aS](bm);}else{bm=[bx,bw,bu][aS](bm)[az]()[z](",");var bk=[];for(var bv=0,bl=bm[m];bv<bl;bv++){bk[bv]=bv%2?bA(bm[bv-1],bm[bv],d).y:bA(bm[bv],bm[bv+1],d).x;}return bk;}},M=function(e,d,E,i,a2,a1,a0,S,a3){var R=1-a3;return{x:aM(R,3)*e+aM(R,2)*3*a3*E+R*3*a3*a3*a2+aM(a3,3)*a0,y:aM(R,3)*d+aM(R,2)*3*a3*i+R*3*a3*a3*a1+aM(a3,3)*S};},aC=aj(function(i,d,R,E,a9,a8,a5,a2){var a7=(a9-2*R+i)-(a5-2*a9+R),a4=2*(R-i)-2*(a9-R),a1=i-R,a0=(-a4+ab.sqrt(a4*a4-4*a7*a1))/2/a7,S=(-a4-ab.sqrt(a4*a4-4*a7*a1))/2/a7,a3=[d,a2],a6=[i,a5],e;ab.abs(a0)>1000000000000&&(a0=0.5);ab.abs(S)>1000000000000&&(S=0.5);if(a0>0&&a0<1){e=M(i,d,R,E,a9,a8,a5,a2,a0);a6[f](e.x);a3[f](e.y);}if(S>0&&S<1){e=M(i,d,R,E,a9,a8,a5,a2,S);a6[f](e.x);a3[f](e.y);}a7=(a8-2*E+d)-(a2-2*a8+E);a4=2*(E-d)-2*(a8-E);a1=d-E;a0=(-a4+ab.sqrt(a4*a4-4*a7*a1))/2/a7;S=(-a4-ab.sqrt(a4*a4-4*a7*a1))/2/a7;ab.abs(a0)>1000000000000&&(a0=0.5);ab.abs(S)>1000000000000&&(S=0.5);if(a0>0&&a0<1){e=M(i,d,R,E,a9,a8,a5,a2,a0);a6[f](e.x);a3[f](e.y);}if(S>0&&S<1){e=M(i,d,R,E,a9,a8,a5,a2,S);a6[f](e.x);a3[f](e.y);}return{min:{x:aI[aW](0,a6),y:aI[aW](0,a3)},max:{x:g[aW](0,a6),y:g[aW](0,a3)}};}),H=aj(function(a9,a4){var R=r(a9),a5=a4&&r(a4),a6={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},d={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},a0=function(ba,bb){var i,bc;if(!ba){return["C",bb.x,bb.y,bb.x,bb.y,bb.x,bb.y];}!(ba[0] in {T:1,Q:1})&&(bb.qx=bb.qy=null);switch(ba[0]){case"M":bb.X=ba[1];bb.Y=ba[2];break;case"A":ba=["C"][aS](K[aW](0,[bb.x,bb.y][aS](ba.slice(1))));break;case"S":i=bb.x+(bb.x-(bb.bx||bb.x));bc=bb.y+(bb.y-(bb.by||bb.y));ba=["C",i,bc][aS](ba.slice(1));break;case"T":bb.qx=bb.x+(bb.x-(bb.qx||bb.x));bb.qy=bb.y+(bb.y-(bb.qy||bb.y));ba=["C"][aS](aK(bb.x,bb.y,bb.qx,bb.qy,ba[1],ba[2]));break;case"Q":bb.qx=ba[1];bb.qy=ba[2];ba=["C"][aS](aK(bb.x,bb.y,ba[1],ba[2],ba[3],ba[4]));break;case"L":ba=["C"][aS](aX(bb.x,bb.y,ba[1],ba[2]));break;case"H":ba=["C"][aS](aX(bb.x,bb.y,ba[1],bb.y));break;case"V":ba=["C"][aS](aX(bb.x,bb.y,bb.x,ba[1]));break;case"Z":ba=["C"][aS](aX(bb.x,bb.y,bb.X,bb.Y));break;}return ba;},e=function(ba,bb){if(ba[bb][m]>7){ba[bb].shift();var bc=ba[bb];while(bc[m]){ba.splice(bb++,0,["C"][aS](bc.splice(0,6)));}ba.splice(bb,1);a7=g(R[m],a5&&a5[m]||0);}},E=function(be,bd,bb,ba,bc){if(be&&bd&&be[bc][0]=="M"&&bd[bc][0]!="M"){bd.splice(bc,0,["M",ba.x,ba.y]);bb.bx=0;bb.by=0;bb.x=be[bc][1];bb.y=be[bc][2];a7=g(R[m],a5&&a5[m]||0);}};for(var a2=0,a7=g(R[m],a5&&a5[m]||0);a2<a7;a2++){R[a2]=a0(R[a2],a6);e(R,a2);a5&&(a5[a2]=a0(a5[a2],d));a5&&e(a5,a2);E(R,a5,a6,d,a2);E(a5,R,d,a6,a2);var a1=R[a2],a8=a5&&a5[a2],S=a1[m],a3=a5&&a8[m];a6.x=a1[S-2];a6.y=a1[S-1];a6.bx=W(a1[S-4])||a6.x;a6.by=W(a1[S-3])||a6.y;d.bx=a5&&(W(a8[a3-4])||d.x);d.by=a5&&(W(a8[a3-3])||d.y);d.x=a5&&a8[a3-2];d.y=a5&&a8[a3-1];}return a5?[R,a5]:R;},null,av),p=aj(function(a4){var a3=[];for(var a0=0,a5=a4[m];a0<a5;a0++){var e={},a2=a4[a0].match(/^([^:]*):?([\d\.]*)/);e.color=an.getRGB(a2[1]);if(e.color.error){return null;}e.color=e.color.hex;a2[2]&&(e.offset=a2[2]+"%");a3[f](e);}for(var a0=1,a5=a3[m]-1;a0<a5;a0++){if(!a3[a0].offset){var E=W(a3[a0-1].offset||0),R=0;for(var S=a0+1;S<a5;S++){if(a3[S].offset){R=a3[S].offset;break;}}if(!R){R=100;S=a5;}R=W(R);var a1=(R-E)/(S-a0+1);for(;a0<S;a0++){E+=a1;a3[a0].offset=E+"%";}}}return a3;}),ao=function(){var i,e,R,E,d;if(an.is(arguments[0],"string")||an.is(arguments[0],"object")){if(an.is(arguments[0],"string")){i=L.getElementById(arguments[0]);}else{i=arguments[0];}if(i.tagName){if(arguments[1]==null){return{container:i,width:i.style.pixelWidth||i.offsetWidth,height:i.style.pixelHeight||i.offsetHeight};}else{return{container:i,width:arguments[1],height:arguments[2]};}}}else{if(an.is(arguments[0],al)&&arguments[m]>3){return{container:1,x:arguments[0],y:arguments[1],width:arguments[2],height:arguments[3]};}}},aG=function(d,i){var e=this;for(var E in i){if(i[Q](E)&&!(E in d)){switch(typeof i[E]){case"function":(function(R){d[E]=d===e?R:function(){return R[aW](e,arguments);};})(i[E]);break;case"object":d[E]=d[E]||{};aG.call(this,d[E],i[E]);break;default:d[E]=i[E];break;}}}},ak=function(d,e){d==e.top&&(e.top=d.prev);d==e.bottom&&(e.bottom=d.next);d.next&&(d.next.prev=d.prev);d.prev&&(d.prev.next=d.next);},Y=function(d,e){if(e.top===d){return;}ak(d,e);d.next=null;d.prev=e.top;e.top.next=d;e.top=d;},k=function(d,e){if(e.bottom===d){return;}ak(d,e);d.next=e.bottom;d.prev=null;e.bottom.prev=d;e.bottom=d;},A=function(e,d,i){ak(e,i);d==i.top&&(i.top=e);d.next&&(d.next.prev=e);e.next=d.next;e.prev=d;d.next=e;},aq=function(e,d,i){ak(e,i);d==i.bottom&&(i.bottom=e);d.prev&&(d.prev.next=e);e.prev=d.prev;d.prev=e;e.next=d;},s=function(d){return function(){throw new Error("Rapha\xebl: you are calling to method \u201c"+d+"\u201d of removed object");};},ar=/^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/;if(an.svg){aT[aY].svgns="http://www.w3.org/2000/svg";aT[aY].xlink="http://www.w3.org/1999/xlink";var O=function(d){return +d+(~~d===d)*0.5;},V=function(S){for(var e=0,E=S[m];e<E;e++){if(aZ.call(S[e][0])!="a"){for(var d=1,R=S[e][m];d<R;d++){S[e][d]=O(S[e][d]);}}else{S[e][6]=O(S[e][6]);S[e][7]=O(S[e][7]);}}return S;},aJ=function(i,d){if(d){for(var e in d){if(d[Q](e)){i[v](e,d[e]);}}}else{return L.createElementNS(aT[aY].svgns,i);}};an[aA]=function(){return"Your browser supports SVG.\nYou are running Rapha\xebl "+this.version;};var q=function(d,E){var e=aJ("path");E.canvas&&E.canvas[aL](e);var i=new ax(e,E);i.type="path";aa(i,{fill:"none",stroke:"#000",path:d});return i;};var b=function(E,a7,d){var a4="linear",a1=0.5,S=0.5,a9=E.style;a7=(a7+at)[aP](ar,function(bb,i,bc){a4="radial";if(i&&bc){a1=W(i);S=W(bc);var ba=((S>0.5)*2-1);aM(a1-0.5,2)+aM(S-0.5,2)>0.25&&(S=ab.sqrt(0.25-aM(a1-0.5,2))*ba+0.5)&&S!=0.5&&(S=S.toFixed(5)-0.00001*ba);}return at;});a7=a7[z](/\s*\-\s*/);if(a4=="linear"){var a0=a7.shift();a0=-W(a0);if(isNaN(a0)){return null;}var R=[0,0,ab.cos(a0*ab.PI/180),ab.sin(a0*ab.PI/180)],a6=1/(g(ab.abs(R[2]),ab.abs(R[3]))||1);R[2]*=a6;R[3]*=a6;if(R[2]<0){R[0]=-R[2];R[2]=0;}if(R[3]<0){R[1]=-R[3];R[3]=0;}}var a3=p(a7);if(!a3){return null;}var e=aJ(a4+"Gradient");e.id="r"+(an._id++)[aA](36);aJ(e,a4=="radial"?{fx:a1,fy:S}:{x1:R[0],y1:R[1],x2:R[2],y2:R[3]});d.defs[aL](e);for(var a2=0,a8=a3[m];a2<a8;a2++){var a5=aJ("stop");aJ(a5,{offset:a3[a2].offset?a3[a2].offset:!a2?"0%":"100%","stop-color":a3[a2].color||"#fff"});e[aL](a5);}aJ(E,{fill:"url(#"+e.id+")",opacity:1,"fill-opacity":1});a9.fill=at;a9.opacity=1;a9.fillOpacity=1;return 1;};var N=function(e){var d=e.getBBox();aJ(e.pattern,{patternTransform:an.format("translate({0},{1})",d.x,d.y)});};var aa=function(a6,bf){var a9={"":[0],none:[0],"-":[3,1],".":[1,1],"-.":[3,1,1,1],"-..":[3,1,1,1,1,1],". ":[1,3],"- ":[4,3],"--":[8,3],"- .":[4,3,1,3],"--.":[8,3,1,3],"--..":[8,3,1,3,1,3]},bb=a6.node,a7=a6.attrs,a3=a6.rotate(),S=function(bm,bl){bl=a9[aZ.call(bl)];if(bl){var bj=bm.attrs["stroke-width"]||"1",bh={round:bj,square:bj,butt:0}[bm.attrs["stroke-linecap"]||bf["stroke-linecap"]]||0,bk=[];var bi=bl[m];while(bi--){bk[bi]=bl[bi]*bj+((bi%2)?1:-1)*bh;}aJ(bb,{"stroke-dasharray":bk[az](",")});}};bf[Q]("rotation")&&(a3=bf.rotation);var a2=(a3+at)[z](a);if(!(a2.length-1)){a2=null;}else{a2[1]=+a2[1];a2[2]=+a2[2];}W(a3)&&a6.rotate(0,true);for(var ba in bf){if(bf[Q](ba)){if(!j[Q](ba)){continue;}var a8=bf[ba];a7[ba]=a8;switch(ba){case"rotation":a6.rotate(a8,true);break;case"href":case"title":case"target":var bd=bb.parentNode;if(aZ.call(bd.tagName)!="a"){var E=aJ("a");bd.insertBefore(E,bb);E[aL](bb);bd=E;}bd.setAttributeNS(a6.paper.xlink,ba,a8);break;case"cursor":bb.style.cursor=a8;break;case"clip-rect":var e=(a8+at)[z](a);if(e[m]==4){a6.clip&&a6.clip.parentNode.parentNode.removeChild(a6.clip.parentNode);var i=aJ("clipPath"),bc=aJ("rect");i.id="r"+(an._id++)[aA](36);aJ(bc,{x:e[0],y:e[1],width:e[2],height:e[3]});i[aL](bc);a6.paper.defs[aL](i);aJ(bb,{"clip-path":"url(#"+i.id+")"});a6.clip=bc;}if(!a8){var be=L.getElementById(bb.getAttribute("clip-path")[aP](/(^url\(#|\)$)/g,at));be&&be.parentNode.removeChild(be);aJ(bb,{"clip-path":at});delete a6.clip;}break;case"path":if(a8&&a6.type=="path"){a7.path=V(r(a8));aJ(bb,{d:a7.path});}break;case"width":bb[v](ba,a8);if(a7.fx){ba="x";a8=a7.x;}else{break;}case"x":if(a7.fx){a8=-a7.x-(a7.width||0);}case"rx":if(ba=="rx"&&a6.type=="rect"){break;}case"cx":a2&&(ba=="x"||ba=="cx")&&(a2[1]+=a8-a7[ba]);bb[v](ba,O(a8));a6.pattern&&N(a6);break;case"height":bb[v](ba,a8);if(a7.fy){ba="y";a8=a7.y;}else{break;}case"y":if(a7.fy){a8=-a7.y-(a7.height||0);}case"ry":if(ba=="ry"&&a6.type=="rect"){break;}case"cy":a2&&(ba=="y"||ba=="cy")&&(a2[2]+=a8-a7[ba]);bb[v](ba,O(a8));a6.pattern&&N(a6);break;case"r":if(a6.type=="rect"){aJ(bb,{rx:a8,ry:a8});}else{bb[v](ba,a8);}break;case"src":if(a6.type=="image"){bb.setAttributeNS(a6.paper.xlink,"href",a8);}break;case"stroke-width":bb.style.strokeWidth=a8;bb[v](ba,a8);if(a7["stroke-dasharray"]){S(a6,a7["stroke-dasharray"]);}break;case"stroke-dasharray":S(a6,a8);break;case"translation":var a0=(a8+at)[z](a);a0[0]=+a0[0]||0;a0[1]=+a0[1]||0;if(a2){a2[1]+=a0[0];a2[2]+=a0[1];}t.call(a6,a0[0],a0[1]);break;case"scale":var a0=(a8+at)[z](a);a6.scale(+a0[0]||1,+a0[1]||+a0[0]||1,+a0[2]||null,+a0[3]||null);break;case"fill":var R=(a8+at).match(c);if(R){var i=aJ("pattern"),a5=aJ("image");i.id="r"+(an._id++)[aA](36);aJ(i,{x:0,y:0,patternUnits:"userSpaceOnUse",height:1,width:1});aJ(a5,{x:0,y:0});a5.setAttributeNS(a6.paper.xlink,"href",R[1]);i[aL](a5);var bg=L.createElement("img");bg.style.cssText="position:absolute;left:-9999em;top-9999em";bg.onload=function(){aJ(i,{width:this.offsetWidth,height:this.offsetHeight});aJ(a5,{width:this.offsetWidth,height:this.offsetHeight});L.body.removeChild(this);a6.paper.safari();};L.body[aL](bg);bg.src=R[1];a6.paper.defs[aL](i);bb.style.fill="url(#"+i.id+")";aJ(bb,{fill:"url(#"+i.id+")"});a6.pattern=i;a6.pattern&&N(a6);break;}if(!an.getRGB(a8).error){delete bf.gradient;delete a7.gradient;!an.is(a7.opacity,"undefined")&&an.is(bf.opacity,"undefined")&&aJ(bb,{opacity:a7.opacity});!an.is(a7["fill-opacity"],"undefined")&&an.is(bf["fill-opacity"],"undefined")&&aJ(bb,{"fill-opacity":a7["fill-opacity"]});}else{if((({circle:1,ellipse:1})[Q](a6.type)||(a8+at).charAt()!="r")&&b(bb,a8,a6.paper)){a7.gradient=a8;a7.fill="none";break;}}case"stroke":bb[v](ba,an.getRGB(a8).hex);break;case"gradient":(({circle:1,ellipse:1})[Q](a6.type)||(a8+at).charAt()!="r")&&b(bb,a8,a6.paper);break;case"opacity":case"fill-opacity":if(a7.gradient){var d=L.getElementById(bb.getAttribute("fill")[aP](/^url\(#|\)$/g,at));if(d){var a1=d.getElementsByTagName("stop");a1[a1[m]-1][v]("stop-opacity",a8);}break;}default:ba=="font-size"&&(a8=G(a8,10)+"px");var a4=ba[aP](/(\-.)/g,function(bh){return aN.call(bh.substring(1));});bb.style[a4]=a8;bb[v](ba,a8);break;}}}D(a6,bf);if(a2){a6.rotate(a2.join(am));}else{W(a3)&&a6.rotate(a3,true);}};var h=1.2;var D=function(d,R){if(d.type!="text"||!(R[Q]("text")||R[Q]("font")||R[Q]("font-size")||R[Q]("x")||R[Q]("y"))){return;}var a3=d.attrs,e=d.node,a5=e.firstChild?G(L.defaultView.getComputedStyle(e.firstChild,at).getPropertyValue("font-size"),10):10;if(R[Q]("text")){a3.text=R.text;while(e.firstChild){e.removeChild(e.firstChild);}var E=(R.text+at)[z]("\n");for(var S=0,a4=E[m];S<a4;S++){if(E[S]){var a1=aJ("tspan");S&&aJ(a1,{dy:a5*h,x:a3.x});a1[aL](L.createTextNode(E[S]));e[aL](a1);}}}else{var E=e.getElementsByTagName("tspan");for(var S=0,a4=E[m];S<a4;S++){S&&aJ(E[S],{dy:a5*h,x:a3.x});}}aJ(e,{y:a3.y});var a0=d.getBBox(),a2=a3.y-(a0.y+a0.height/2);a2&&isFinite(a2)&&aJ(e,{y:a3.y+a2});};var ax=function(e,d){var E=0,i=0;this[0]=e;this.id=an._oid++;this.node=e;e.raphael=this;this.paper=d;this.attrs=this.attrs||{};this.transformations=[];this._={tx:0,ty:0,rt:{deg:0,cx:0,cy:0},sx:1,sy:1};!d.bottom&&(d.bottom=this);this.prev=d.top;d.top&&(d.top.next=this);d.top=this;this.next=null;};ax[aY].rotate=function(e,d,E){if(this.removed){return this;}if(e==null){if(this._.rt.cx){return[this._.rt.deg,this._.rt.cx,this._.rt.cy][az](am);}return this._.rt.deg;}var i=this.getBBox();e=(e+at)[z](a);if(e[m]-1){d=W(e[1]);E=W(e[2]);}e=W(e[0]);if(d!=null){this._.rt.deg=e;}else{this._.rt.deg+=e;}(E==null)&&(d=null);this._.rt.cx=d;this._.rt.cy=E;d=d==null?i.x+i.width/2:d;E=E==null?i.y+i.height/2:E;if(this._.rt.deg){this.transformations[0]=an.format("rotate({0} {1} {2})",this._.rt.deg,d,E);this.clip&&aJ(this.clip,{transform:an.format("rotate({0} {1} {2})",-this._.rt.deg,d,E)});}else{this.transformations[0]=at;this.clip&&aJ(this.clip,{transform:at});}aJ(this.node,{transform:this.transformations[az](am)});return this;};ax[aY].hide=function(){!this.removed&&(this.node.style.display="none");return this;};ax[aY].show=function(){!this.removed&&(this.node.style.display="");return this;};ax[aY].remove=function(){if(this.removed){return;}ak(this,this.paper);this.node.parentNode.removeChild(this.node);for(var d in this){delete this[d];}this.removed=true;};ax[aY].getBBox=function(){if(this.removed){return this;}if(this.type=="path"){return U(this.attrs.path);}if(this.node.style.display=="none"){this.show();var E=true;}var a1={};try{a1=this.node.getBBox();}catch(S){}finally{a1=a1||{};}if(this.type=="text"){a1={x:a1.x,y:Infinity,width:0,height:0};for(var d=0,R=this.node.getNumberOfChars();d<R;d++){var a0=this.node.getExtentOfChar(d);(a0.y<a1.y)&&(a1.y=a0.y);(a0.y+a0.height-a1.y>a1.height)&&(a1.height=a0.y+a0.height-a1.y);(a0.x+a0.width-a1.x>a1.width)&&(a1.width=a0.x+a0.width-a1.x);}}E&&this.hide();return a1;};ax[aY].attr=function(){if(this.removed){return this;}if(arguments[m]==0){var R={};for(var E in this.attrs){if(this.attrs[Q](E)){R[E]=this.attrs[E];}}this._.rt.deg&&(R.rotation=this.rotate());(this._.sx!=1||this._.sy!=1)&&(R.scale=this.scale());R.gradient&&R.fill=="none"&&(R.fill=R.gradient)&&delete R.gradient;return R;}if(arguments[m]==1&&an.is(arguments[0],"string")){if(arguments[0]=="translation"){return t.call(this);}if(arguments[0]=="rotation"){return this.rotate();}if(arguments[0]=="scale"){return this.scale();}if(arguments[0]=="fill"&&this.attrs.fill=="none"&&this.attrs.gradient){return this.attrs.gradient;}return this.attrs[arguments[0]];}if(arguments[m]==1&&an.is(arguments[0],"array")){var d={};for(var e in arguments[0]){if(arguments[0][Q](e)){d[arguments[0][e]]=this.attrs[arguments[0][e]];}}return d;}if(arguments[m]==2){var S={};S[arguments[0]]=arguments[1];aa(this,S);}else{if(arguments[m]==1&&an.is(arguments[0],"object")){aa(this,arguments[0]);}}return this;};ax[aY].toFront=function(){if(this.removed){return this;}this.node.parentNode[aL](this.node);var d=this.paper;d.top!=this&&Y(this,d);return this;};ax[aY].toBack=function(){if(this.removed){return this;}if(this.node.parentNode.firstChild!=this.node){this.node.parentNode.insertBefore(this.node,this.node.parentNode.firstChild);k(this,this.paper);var d=this.paper;}return this;};ax[aY].insertAfter=function(d){if(this.removed){return this;}var e=d.node;if(e.nextSibling){e.parentNode.insertBefore(this.node,e.nextSibling);}else{e.parentNode[aL](this.node);}A(this,d,this.paper);return this;};ax[aY].insertBefore=function(d){if(this.removed){return this;}var e=d.node;e.parentNode.insertBefore(this.node,e);aq(this,d,this.paper);return this;};var P=function(e,d,S,R){d=O(d);S=O(S);var E=aJ("circle");e.canvas&&e.canvas[aL](E);var i=new ax(E,e);i.attrs={cx:d,cy:S,r:R,fill:"none",stroke:"#000"};i.type="circle";aJ(E,i.attrs);return i;};var aF=function(i,d,a1,e,S,a0){d=O(d);a1=O(a1);var R=aJ("rect");i.canvas&&i.canvas[aL](R);var E=new ax(R,i);E.attrs={x:d,y:a1,width:e,height:S,r:a0||0,rx:a0||0,ry:a0||0,fill:"none",stroke:"#000"};E.type="rect";aJ(R,E.attrs);return E;};var ai=function(e,d,a0,S,R){d=O(d);a0=O(a0);var E=aJ("ellipse");e.canvas&&e.canvas[aL](E);var i=new ax(E,e);i.attrs={cx:d,cy:a0,rx:S,ry:R,fill:"none",stroke:"#000"};i.type="ellipse";aJ(E,i.attrs);return i;};var o=function(i,a0,d,a1,e,S){var R=aJ("image");aJ(R,{x:d,y:a1,width:e,height:S,preserveAspectRatio:"none"});R.setAttributeNS(i.xlink,"href",a0);i.canvas&&i.canvas[aL](R);var E=new ax(R,i);E.attrs={x:d,y:a1,width:e,height:S,src:a0};E.type="image";return E;};var X=function(e,d,S,R){var E=aJ("text");aJ(E,{x:d,y:S,"text-anchor":"middle"});e.canvas&&e.canvas[aL](E);var i=new ax(E,e);i.attrs={x:d,y:S,"text-anchor":"middle",text:R,font:j.font,stroke:"none",fill:"#000"};i.type="text";aa(i,i.attrs);return i;};var aV=function(e,d){this.width=e||this.width;this.height=d||this.height;this.canvas[v]("width",this.width);this.canvas[v]("height",this.height);return this;};var w=function(){var E=ao[aW](null,arguments),i=E&&E.container,e=E.x,a0=E.y,R=E.width,d=E.height;if(!i){throw new Error("SVG container not found.");}var S=aJ("svg");R=R||512;d=d||342;aJ(S,{xmlns:"http://www.w3.org/2000/svg",version:1.1,width:R,height:d});if(i==1){S.style.cssText="position:absolute;left:"+e+"px;top:"+a0+"px";L.body[aL](S);}else{if(i.firstChild){i.insertBefore(S,i.firstChild);}else{i[aL](S);}}i=new aT;i.width=R;i.height=d;i.canvas=S;aG.call(i,i,an.fn);i.clear();return i;};aT[aY].clear=function(){var d=this.canvas;while(d.firstChild){d.removeChild(d.firstChild);}this.bottom=this.top=null;(this.desc=aJ("desc"))[aL](L.createTextNode("Created with Rapha\xebl"));d[aL](this.desc);d[aL](this.defs=aJ("defs"));};aT[aY].remove=function(){this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas);for(var d in this){this[d]=s(d);}};}if(an.vml){var aH=function(a8){var a5=/[ahqstv]/ig,a0=r;(a8+at).match(a5)&&(a0=H);a5=/[clmz]/g;if(a0==r&&!(a8+at).match(a5)){var e={M:"m",L:"l",C:"c",Z:"x",m:"t",l:"r",c:"v",z:"x"},R=/([clmz]),?([^clmz]*)/gi,S=/-?[^,\s-]+/g;var a4=(a8+at)[aP](R,function(a9,bb,i){var ba=[];i[aP](S,function(bc){ba[f](O(bc));});return e[bb]+ba;});return a4;}var a6=a0(a8),E,a4=[],d;for(var a2=0,a7=a6[m];a2<a7;a2++){E=a6[a2];d=aZ.call(a6[a2][0]);d=="z"&&(d="x");for(var a1=1,a3=E[m];a1<a3;a1++){d+=O(E[a1])+(a1!=a3-1?",":at);}a4[f](d);}return a4[az](am);};an[aA]=function(){return"Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl "+this.version;};var q=function(d,S){var E=ah("group");E.style.cssText="position:absolute;left:0;top:0;width:"+S.width+"px;height:"+S.height+"px";E.coordsize=S.coordsize;E.coordorigin=S.coordorigin;var i=ah("shape"),e=i.style;e.width=S.width+"px";e.height=S.height+"px";i.coordsize=this.coordsize;i.coordorigin=this.coordorigin;E[aL](i);var R=new ax(i,E,S);R.isAbsolute=true;R.type="path";R.path=[];R.Path=at;d&&aa(R,{fill:"none",stroke:"#000",path:d});S.canvas[aL](E);return R;};var aa=function(a3,a8){a3.attrs=a3.attrs||{};var a6=a3.node,a9=a3.attrs,a0=a6.style,E,bd=a3;for(var a1 in a8){if(a8[Q](a1)){a9[a1]=a8[a1];}}a8.href&&(a6.href=a8.href);a8.title&&(a6.title=a8.title);a8.target&&(a6.target=a8.target);a8.cursor&&(a0.cursor=a8.cursor);if(a8.path&&a3.type=="path"){a9.path=a8.path;a6.path=aH(a9.path);}if(a8.rotation!=null){a3.rotate(a8.rotation,true);}if(a8.translation){E=(a8.translation+at)[z](a);t.call(a3,E[0],E[1]);if(a3._.rt.cx!=null){a3._.rt.cx+=+E[0];a3._.rt.cy+=+E[1];a3.setBox(a3.attrs,E[0],E[1]);}}if(a8.scale){E=(a8.scale+at)[z](a);a3.scale(+E[0]||1,+E[1]||+E[0]||1,+E[2]||null,+E[3]||null);}if("clip-rect" in a8){var d=(a8["clip-rect"]+at)[z](a);if(d[m]==4){d[2]=+d[2]+(+d[0]);d[3]=+d[3]+(+d[1]);var a2=a6.clipRect||L.createElement("div"),bc=a2.style,S=a6.parentNode;bc.clip=an.format("rect({1}px {2}px {3}px {0}px)",d);if(!a6.clipRect){bc.position="absolute";bc.top=0;bc.left=0;bc.width=a3.paper.width+"px";bc.height=a3.paper.height+"px";S.parentNode.insertBefore(a2,S);a2[aL](S);a6.clipRect=a2;}}if(!a8["clip-rect"]){a6.clipRect&&(a6.clipRect.style.clip=at);}}if(a3.type=="image"&&a8.src){a6.src=a8.src;}if(a3.type=="image"&&a8.opacity){a6.filterOpacity=" progid:DXImageTransform.Microsoft.Alpha(opacity="+(a8.opacity*100)+")";a0.filter=(a6.filterMatrix||at)+(a6.filterOpacity||at);}a8.font&&(a0.font=a8.font);a8["font-family"]&&(a0.fontFamily='"'+a8["font-family"][z](",")[0][aP](/^['"]+|['"]+$/g,at)+'"');a8["font-size"]&&(a0.fontSize=a8["font-size"]);a8["font-weight"]&&(a0.fontWeight=a8["font-weight"]);a8["font-style"]&&(a0.fontStyle=a8["font-style"]);if(a8.opacity!=null||a8["stroke-width"]!=null||a8.fill!=null||a8.stroke!=null||a8["stroke-width"]!=null||a8["stroke-opacity"]!=null||a8["fill-opacity"]!=null||a8["stroke-dasharray"]!=null||a8["stroke-miterlimit"]!=null||a8["stroke-linejoin"]!=null||a8["stroke-linecap"]!=null){a6=a3.shape||a6;var a7=(a6.getElementsByTagName("fill")&&a6.getElementsByTagName("fill")[0]),ba=false;!a7&&(ba=a7=ah("fill"));if("fill-opacity" in a8||"opacity" in a8){var e=((+a9["fill-opacity"]+1||2)-1)*((+a9.opacity+1||2)-1);e<0&&(e=0);e>1&&(e=1);a7.opacity=e;}a8.fill&&(a7.on=true);if(a7.on==null||a8.fill=="none"){a7.on=false;}if(a7.on&&a8.fill){var i=a8.fill.match(c);if(i){a7.src=i[1];a7.type="tile";}else{a7.color=an.getRGB(a8.fill).hex;a7.src=at;a7.type="solid";if(an.getRGB(a8.fill).error&&(bd.type in {circle:1,ellipse:1}||(a8.fill+at).charAt()!="r")&&b(bd,a8.fill)){a9.fill="none";a9.gradient=a8.fill;}}}ba&&a6[aL](a7);var R=(a6.getElementsByTagName("stroke")&&a6.getElementsByTagName("stroke")[0]),bb=false;!R&&(bb=R=ah("stroke"));if((a8.stroke&&a8.stroke!="none")||a8["stroke-width"]||a8["stroke-opacity"]!=null||a8["stroke-dasharray"]||a8["stroke-miterlimit"]||a8["stroke-linejoin"]||a8["stroke-linecap"]){R.on=true;}(a8.stroke=="none"||R.on==null||a8.stroke==0||a8["stroke-width"]==0)&&(R.on=false);R.on&&a8.stroke&&(R.color=an.getRGB(a8.stroke).hex);var e=((+a9["stroke-opacity"]+1||2)-1)*((+a9.opacity+1||2)-1),a4=(W(a8["stroke-width"])||1)*0.75;e<0&&(e=0);e>1&&(e=1);a8["stroke-width"]==null&&(a4=a9["stroke-width"]);a8["stroke-width"]&&(R.weight=a4);a4&&a4<1&&(e*=a4)&&(R.weight=1);R.opacity=e;a8["stroke-linejoin"]&&(R.joinstyle=a8["stroke-linejoin"]||"miter");R.miterlimit=a8["stroke-miterlimit"]||8;a8["stroke-linecap"]&&(R.endcap=a8["stroke-linecap"]=="butt"?"flat":a8["stroke-linecap"]=="square"?"square":"round");if(a8["stroke-dasharray"]){var a5={"-":"shortdash",".":"shortdot","-.":"shortdashdot","-..":"shortdashdotdot",". ":"dot","- ":"dash","--":"longdash","- .":"dashdot","--.":"longdashdot","--..":"longdashdotdot"};R.dashstyle=a5[Q](a8["stroke-dasharray"])?a5[a8["stroke-dasharray"]]:at;}bb&&a6[aL](R);}if(bd.type=="text"){var a0=bd.paper.span.style;a9.font&&(a0.font=a9.font);a9["font-family"]&&(a0.fontFamily=a9["font-family"]);a9["font-size"]&&(a0.fontSize=a9["font-size"]);a9["font-weight"]&&(a0.fontWeight=a9["font-weight"]);a9["font-style"]&&(a0.fontStyle=a9["font-style"]);bd.node.string&&(bd.paper.span.innerHTML=(bd.node.string+at)[aP](/</g,"&#60;")[aP](/&/g,"&#38;")[aP](/\n/g,"<br>"));bd.W=a9.w=bd.paper.span.offsetWidth;bd.H=a9.h=bd.paper.span.offsetHeight;bd.X=a9.x;bd.Y=a9.y+O(bd.H/2);switch(a9["text-anchor"]){case"start":bd.node.style["v-text-align"]="left";bd.bbx=O(bd.W/2);break;case"end":bd.node.style["v-text-align"]="right";bd.bbx=-O(bd.W/2);break;default:bd.node.style["v-text-align"]="center";break;}}};var b=function(d,a1){d.attrs=d.attrs||{};var a2=d.attrs,a4=d.node.getElementsByTagName("fill"),S="linear",a0=".5 .5";d.attrs.gradient=a1;a1=(a1+at)[aP](ar,function(a6,a7,i){S="radial";if(a7&&i){a7=W(a7);i=W(i);aM(a7-0.5,2)+aM(i-0.5,2)>0.25&&(i=ab.sqrt(0.25-aM(a7-0.5,2))*((i>0.5)*2-1)+0.5);a0=a7+am+i;}return at;});a1=a1[z](/\s*\-\s*/);if(S=="linear"){var e=a1.shift();e=-W(e);if(isNaN(e)){return null;}}var R=p(a1);if(!R){return null;}d=d.shape||d.node;a4=a4[0]||ah("fill");if(R[m]){a4.on=true;a4.method="none";a4.type=(S=="radial")?"gradientradial":"gradient";a4.color=R[0].color;a4.color2=R[R[m]-1].color;var a5=[];for(var E=0,a3=R[m];E<a3;E++){R[E].offset&&a5[f](R[E].offset+am+R[E].color);}a4.colors&&(a4.colors.value=a5[m]?a5[az](","):"0% "+a4.color);if(S=="radial"){a4.focus="100%";a4.focussize=a0;a4.focusposition=a0;}else{a4.angle=(270-e)%360;}}return 1;};var ax=function(R,a0,d){var S=0,i=0,e=0,E=1;this[0]=R;this.id=an._oid++;this.node=R;R.raphael=this;this.X=0;this.Y=0;this.attrs={};this.Group=a0;this.paper=d;this._={tx:0,ty:0,rt:{deg:0},sx:1,sy:1};!d.bottom&&(d.bottom=this);this.prev=d.top;d.top&&(d.top.next=this);d.top=this;this.next=null;};ax[aY].rotate=function(e,d,i){if(this.removed){return this;}if(e==null){if(this._.rt.cx){return[this._.rt.deg,this._.rt.cx,this._.rt.cy][az](am);}return this._.rt.deg;}e=(e+at)[z](a);if(e[m]-1){d=W(e[1]);i=W(e[2]);}e=W(e[0]);if(d!=null){this._.rt.deg=e;}else{this._.rt.deg+=e;}i==null&&(d=null);this._.rt.cx=d;this._.rt.cy=i;this.setBox(this.attrs,d,i);this.Group.style.rotation=this._.rt.deg;return this;};ax[aY].setBox=function(bb,e,d){if(this.removed){return this;}var a5=this.Group.style,R=(this.shape&&this.shape.style)||this.node.style;bb=bb||{};for(var a9 in bb){if(bb[Q](a9)){this.attrs[a9]=bb[a9];}}e=e||this._.rt.cx;d=d||this._.rt.cy;var a7=this.attrs,a1,a0,a2,ba;switch(this.type){case"circle":a1=a7.cx-a7.r;a0=a7.cy-a7.r;a2=ba=a7.r*2;break;case"ellipse":a1=a7.cx-a7.rx;a0=a7.cy-a7.ry;a2=a7.rx*2;ba=a7.ry*2;break;case"rect":case"image":a1=+a7.x;a0=+a7.y;a2=a7.width||0;ba=a7.height||0;break;case"text":this.textpath.v=["m",O(a7.x),", ",O(a7.y-2),"l",O(a7.x)+1,", ",O(a7.y-2)][az](at);a1=a7.x-O(this.W/2);a0=a7.y-this.H/2;a2=this.W;ba=this.H;break;case"path":if(!this.attrs.path){a1=0;a0=0;a2=this.paper.width;ba=this.paper.height;}else{var a8=U(this.attrs.path);a1=a8.x;a0=a8.y;a2=a8.width;ba=a8.height;}break;default:a1=0;a0=0;a2=this.paper.width;ba=this.paper.height;break;}e=(e==null)?a1+a2/2:e;d=(d==null)?a0+ba/2:d;var E=e-this.paper.width/2,a4=d-this.paper.height/2;if(this.type=="path"||this.type=="text"){(a5.left!=E+"px")&&(a5.left=E+"px");(a5.top!=a4+"px")&&(a5.top=a4+"px");this.X=this.type=="text"?a1:-E;this.Y=this.type=="text"?a0:-a4;this.W=a2;this.H=ba;(R.left!=-E+"px")&&(R.left=-E+"px");(R.top!=-a4+"px")&&(R.top=-a4+"px");}else{(a5.left!=E+"px")&&(a5.left=E+"px");(a5.top!=a4+"px")&&(a5.top=a4+"px");this.X=a1;this.Y=a0;this.W=a2;this.H=ba;(a5.width!=this.paper.width+"px")&&(a5.width=this.paper.width+"px");(a5.height!=this.paper.height+"px")&&(a5.height=this.paper.height+"px");(R.left!=a1-E+"px")&&(R.left=a1-E+"px");(R.top!=a0-a4+"px")&&(R.top=a0-a4+"px");(R.width!=a2+"px")&&(R.width=a2+"px");(R.height!=ba+"px")&&(R.height=ba+"px");var S=(+bb.r||0)/aI(a2,ba);if(this.type=="rect"&&this.arcsize.toFixed(4)!=S.toFixed(4)&&(S||this.arcsize)){var a6=ah("roundrect"),bc={},a9=0,a3=this.events&&this.events[m];a6.arcsize=S;a6.raphael=this;this.Group[aL](a6);this.Group.removeChild(this.node);this[0]=this.node=a6;this.arcsize=S;for(var a9 in a7){bc[a9]=a7[a9];}delete bc.scale;this.attr(bc);if(this.events){for(;a9<a3;a9++){this.events[a9].unbind=ae(this.node,this.events[a9].name,this.events[a9].f,this);}}}}};ax[aY].hide=function(){!this.removed&&(this.Group.style.display="none");return this;};ax[aY].show=function(){!this.removed&&(this.Group.style.display="block");return this;};ax[aY].getBBox=function(){if(this.removed){return this;}if(this.type=="path"){return U(this.attrs.path);}return{x:this.X+(this.bbx||0),y:this.Y,width:this.W,height:this.H};};ax[aY].remove=function(){if(this.removed){return;}ak(this,this.paper);this.node.parentNode.removeChild(this.node);this.Group.parentNode.removeChild(this.Group);this.shape&&this.shape.parentNode.removeChild(this.shape);for(var d in this){delete this[d];}this.removed=true;};ax[aY].attr=function(){if(this.removed){return this;}if(arguments[m]==0){var E={};for(var e in this.attrs){if(this.attrs[Q](e)){E[e]=this.attrs[e];}}this._.rt.deg&&(E.rotation=this.rotate());(this._.sx!=1||this._.sy!=1)&&(E.scale=this.scale());E.gradient&&E.fill=="none"&&(E.fill=E.gradient)&&delete E.gradient;return E;}if(arguments[m]==1&&an.is(arguments[0],"string")){if(arguments[0]=="translation"){return t.call(this);}if(arguments[0]=="rotation"){return this.rotate();}if(arguments[0]=="scale"){return this.scale();}if(arguments[0]=="fill"&&this.attrs.fill=="none"&&this.attrs.gradient){return this.attrs.gradient;}return this.attrs[arguments[0]];}if(this.attrs&&arguments[m]==1&&an.is(arguments[0],"array")){var d={};for(var e=0,R=arguments[0][m];e<R;e++){d[arguments[0][e]]=this.attrs[arguments[0][e]];}return d;}var S;if(arguments[m]==2){S={};S[arguments[0]]=arguments[1];}arguments[m]==1&&an.is(arguments[0],"object")&&(S=arguments[0]);if(S){if(S.text&&this.type=="text"){this.node.string=S.text;}aa(this,S);if(S.gradient&&(({circle:1,ellipse:1})[Q](this.type)||(S.gradient+at).charAt()!="r")){b(this,S.gradient);}(this.type!="path"||this._.rt.deg)&&this.setBox(this.attrs);}return this;};ax[aY].toFront=function(){!this.removed&&this.Group.parentNode[aL](this.Group);this.paper.top!=this&&Y(this,this.paper);return this;};ax[aY].toBack=function(){if(this.removed){return this;}if(this.Group.parentNode.firstChild!=this.Group){this.Group.parentNode.insertBefore(this.Group,this.Group.parentNode.firstChild);k(this,this.paper);}return this;};ax[aY].insertAfter=function(d){if(this.removed){return this;}if(d.Group.nextSibling){d.Group.parentNode.insertBefore(this.Group,d.Group.nextSibling);}else{d.Group.parentNode[aL](this.Group);}A(this,d,this.paper);return this;};ax[aY].insertBefore=function(d){if(this.removed){return this;}d.Group.parentNode.insertBefore(this.Group,d.Group);aq(this,d,this.paper);return this;};var P=function(e,d,a1,S){var R=ah("group"),a0=ah("oval"),i=a0.style;R.style.cssText="position:absolute;left:0;top:0;width:"+e.width+"px;height:"+e.height+"px";R.coordsize=e.coordsize;R.coordorigin=e.coordorigin;R[aL](a0);var E=new ax(a0,R,e);E.type="circle";aa(E,{stroke:"#000",fill:"none"});E.attrs.cx=d;E.attrs.cy=a1;E.attrs.r=S;E.setBox({x:d-S,y:a1-S,width:S*2,height:S*2});e.canvas[aL](R);return E;},aF=function(e,a1,a0,a2,E,d){var R=ah("group"),i=ah("roundrect"),a3=(+d||0)/(aI(a2,E));R.style.cssText="position:absolute;left:0;top:0;width:"+e.width+"px;height:"+e.height+"px";R.coordsize=e.coordsize;R.coordorigin=e.coordorigin;R[aL](i);i.arcsize=a3;var S=new ax(i,R,e);S.type="rect";aa(S,{stroke:"#000"});S.arcsize=a3;S.setBox({x:a1,y:a0,width:a2,height:E,r:d});e.canvas[aL](R);return S;},ai=function(d,a2,a1,i,e){var R=ah("group"),E=ah("oval"),a0=E.style;R.style.cssText="position:absolute;left:0;top:0;width:"+d.width+"px;height:"+d.height+"px";R.coordsize=d.coordsize;R.coordorigin=d.coordorigin;R[aL](E);var S=new ax(E,R,d);S.type="ellipse";aa(S,{stroke:"#000"});S.attrs.cx=a2;S.attrs.cy=a1;S.attrs.rx=i;S.attrs.ry=e;S.setBox({x:a2-i,y:a1-e,width:i*2,height:e*2});d.canvas[aL](R);return S;},o=function(e,d,a2,a1,a3,E){var R=ah("group"),i=ah("image"),a0=i.style;R.style.cssText="position:absolute;left:0;top:0;width:"+e.width+"px;height:"+e.height+"px";R.coordsize=e.coordsize;R.coordorigin=e.coordorigin;i.src=d;R[aL](i);var S=new ax(i,R,e);S.type="image";S.attrs.src=d;S.attrs.x=a2;S.attrs.y=a1;S.attrs.w=a3;S.attrs.h=E;S.setBox({x:a2,y:a1,width:a3,height:E});e.canvas[aL](R);return S;},X=function(e,a2,a1,a3){var R=ah("group"),E=ah("shape"),a0=E.style,a4=ah("path"),d=a4.style,i=ah("textpath");R.style.cssText="position:absolute;left:0;top:0;width:"+e.width+"px;height:"+e.height+"px";R.coordsize=e.coordsize;R.coordorigin=e.coordorigin;a4.v=an.format("m{0},{1}l{2},{1}",O(a2),O(a1),O(a2)+1);a4.textpathok=true;a0.width=e.width;a0.height=e.height;i.string=a3+at;i.on=true;E[aL](i);E[aL](a4);R[aL](E);var S=new ax(i,R,e);S.shape=E;S.textpath=a4;S.type="text";S.attrs.text=a3;S.attrs.x=a2;S.attrs.y=a1;S.attrs.w=1;S.attrs.h=1;aa(S,{font:j.font,stroke:"none",fill:"#000"});S.setBox();e.canvas[aL](R);return S;},aV=function(i,d){var e=this.canvas.style;i==+i&&(i+="px");d==+d&&(d+="px");e.width=i;e.height=d;e.clip="rect(0 "+i+" "+d+" 0)";return this;},ah;L.createStyleSheet().addRule(".rvml","behavior:url(#default#VML)");try{!L.namespaces.rvml&&L.namespaces.add("rvml","urn:schemas-microsoft-com:vml");ah=function(d){return L.createElement("<rvml:"+d+' class="rvml">');};}catch(af){ah=function(d){return L.createElement("<"+d+' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');};}var w=function(){var i=ao[aW](null,arguments),d=i.container,a2=i.height,a3,e=i.width,a1=i.x,a0=i.y;if(!d){throw new Error("VML container not found.");}var R=new aT,S=R.canvas=L.createElement("div"),E=S.style;e=e||512;a2=a2||342;e==+e&&(e+="px");a2==+a2&&(a2+="px");R.width=1000;R.height=1000;R.coordsize="1000 1000";R.coordorigin="0 0";R.span=L.createElement("span");R.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";S[aL](R.span);E.cssText=an.format("width:{0};height:{1};position:absolute;clip:rect(0 {0} {1} 0);overflow:hidden",e,a2);if(d==1){L.body[aL](S);E.left=a1+"px";E.top=a0+"px";}else{d.style.width=e;d.style.height=a2;if(d.firstChild){d.insertBefore(S,d.firstChild);}else{d[aL](S);}}aG.call(R,R,an.fn);return R;};aT[aY].clear=function(){this.canvas.innerHTML=at;this.span=L.createElement("span");this.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";this.canvas[aL](this.span);this.bottom=this.top=null;};aT[aY].remove=function(){this.canvas.parentNode.removeChild(this.canvas);for(var d in this){this[d]=s(d);}};}if((/^Apple|^Google/).test(navigator.vendor)&&!(navigator.userAgent.indexOf("Version/4.0")+1)){aT[aY].safari=function(){var d=this.rect(-99,-99,this.width+99,this.height+99);setTimeout(function(){d.remove();});};}else{aT[aY].safari=function(){};}var ae=(function(){if(L.addEventListener){return function(R,i,e,d){var E=function(S){return e.call(d,S);};R.addEventListener(i,E,false);return function(){R.removeEventListener(i,E,false);return true;};};}else{if(L.attachEvent){return function(S,E,i,e){var R=function(a0){return i.call(e,a0||au.event);};S.attachEvent("on"+E,R);var d=function(){S.detachEvent("on"+E,R);return true;};return d;};}}})();for(var ac=F[m];ac--;){(function(d){ax[aY][d]=function(e){if(an.is(e,"function")){this.events=this.events||[];this.events.push({name:d,f:e,unbind:ae(this.shape||this.node,d,e,this)});}return this;};ax[aY]["un"+d]=function(E){var i=this.events,e=i[m];while(e--){if(i[e].name==d&&i[e].f==E){i[e].unbind();i.splice(e,1);!i.length&&delete this.events;return this;}}return this;};})(F[ac]);}ax[aY].hover=function(e,d){return this.mouseover(e).mouseout(d);};ax[aY].unhover=function(e,d){return this.unmouseover(e).unmouseout(d);};aT[aY].circle=function(d,i,e){return P(this,d||0,i||0,e||0);};aT[aY].rect=function(d,R,e,i,E){return aF(this,d||0,R||0,e||0,i||0,E||0);};aT[aY].ellipse=function(d,E,i,e){return ai(this,d||0,E||0,i||0,e||0);};aT[aY].path=function(d){d&&!an.is(d,"string")&&!an.is(d[0],"array")&&(d+=at);return q(an.format[aW](an,arguments),this);};aT[aY].image=function(E,d,R,e,i){return o(this,E||"about:blank",d||0,R||0,e||0,i||0);};aT[aY].text=function(d,i,e){return X(this,d||0,i||0,e||at);};aT[aY].set=function(d){arguments[m]>1&&(d=Array[aY].splice.call(arguments,0,arguments[m]));return new T(d);};aT[aY].setSize=aV;aT[aY].top=aT[aY].bottom=null;aT[aY].raphael=an;function u(){return this.x+am+this.y;}ax[aY].scale=function(a6,a5,E,e){if(a6==null&&a5==null){return{x:this._.sx,y:this._.sy,toString:u};}a5=a5||a6;!+a5&&(a5=a6);var ba,a8,a9,a7,bm=this.attrs;if(a6!=0){var a4=this.getBBox(),a1=a4.x+a4.width/2,R=a4.y+a4.height/2,bl=a6/this._.sx,bk=a5/this._.sy;E=(+E||E==0)?E:a1;e=(+e||e==0)?e:R;var a3=~~(a6/ab.abs(a6)),a0=~~(a5/ab.abs(a5)),be=this.node.style,bo=E+(a1-E)*bl,bn=e+(R-e)*bk;switch(this.type){case"rect":case"image":var a2=bm.width*a3*bl,bd=bm.height*a0*bk;this.attr({height:bd,r:bm.r*aI(a3*bl,a0*bk),width:a2,x:bo-a2/2,y:bn-bd/2});break;case"circle":case"ellipse":this.attr({rx:bm.rx*a3*bl,ry:bm.ry*a0*bk,r:bm.r*aI(a3*bl,a0*bk),cx:bo,cy:bn});break;case"path":var bg=ad(bm.path),bh=true;for(var bj=0,bc=bg[m];bj<bc;bj++){var bf=bg[bj],bi,S=aN.call(bf[0]);if(S=="M"&&bh){continue;}else{bh=false;}if(S=="A"){bf[bg[bj][m]-2]*=bl;bf[bg[bj][m]-1]*=bk;bf[1]*=a3*bl;bf[2]*=a0*bk;bf[5]=+(a3+a0?!!+bf[5]:!+bf[5]);}else{if(S=="H"){for(bi=1,jj=bf[m];bi<jj;bi++){bf[bi]*=bl;}}else{if(S=="V"){for(bi=1,jj=bf[m];bi<jj;bi++){bf[bi]*=bk;}}else{for(bi=1,jj=bf[m];bi<jj;bi++){bf[bi]*=(bi%2)?bl:bk;}}}}}var d=U(bg),ba=bo-d.x-d.width/2,a8=bn-d.y-d.height/2;bg[0][1]+=ba;bg[0][2]+=a8;this.attr({path:bg});break;}if(this.type in {text:1,image:1}&&(a3!=1||a0!=1)){if(this.transformations){this.transformations[2]="scale("[aS](a3,",",a0,")");this.node[v]("transform",this.transformations[az](am));ba=(a3==-1)?-bm.x-(a2||0):bm.x;a8=(a0==-1)?-bm.y-(bd||0):bm.y;this.attr({x:ba,y:a8});bm.fx=a3-1;bm.fy=a0-1;}else{this.node.filterMatrix=" progid:DXImageTransform.Microsoft.Matrix(M11="[aS](a3,", M12=0, M21=0, M22=",a0,", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");be.filter=(this.node.filterMatrix||at)+(this.node.filterOpacity||at);}}else{if(this.transformations){this.transformations[2]=at;this.node[v]("transform",this.transformations[az](am));bm.fx=0;bm.fy=0;}else{this.node.filterMatrix=at;be.filter=(this.node.filterMatrix||at)+(this.node.filterOpacity||at);}}bm.scale=[a6,a5,E,e][az](am);this._.sx=a6;this._.sy=a5;}return this;};ax[aY].clone=function(){var d=this.attr();delete d.scale;delete d.translation;return this.paper[this.type]().attr(d);};var aB=function(d,e){return function(a9,S,a0){a9=H(a9);var a5,a4,E,a1,R="",a8={},a6,a3=0;for(var a2=0,a7=a9.length;a2<a7;a2++){E=a9[a2];if(E[0]=="M"){a5=+E[1];a4=+E[2];}else{a1=n(a5,a4,E[1],E[2],E[3],E[4],E[5],E[6]);if(a3+a1>S){if(e&&!a8.start){a6=an.findDotsAtSegment(a5,a4,E[1],E[2],E[3],E[4],E[5],E[6],(S-a3)/a1);R+=["C",a6.start.x,a6.start.y,a6.m.x,a6.m.y,a6.x,a6.y];if(a0){return R;}a8.start=R;R=["M",a6.x,a6.y+"C",a6.n.x,a6.n.y,a6.end.x,a6.end.y,E[5],E[6]][az]();a3+=a1;a5=+E[5];a4=+E[6];continue;}if(!d&&!e){a6=an.findDotsAtSegment(a5,a4,E[1],E[2],E[3],E[4],E[5],E[6],(S-a3)/a1);return{x:a6.x,y:a6.y,alpha:a6.alpha};}}a3+=a1;a5=+E[5];a4=+E[6];}R+=E;}a8.end=R;a6=d?a3:e?a8:an.findDotsAtSegment(a5,a4,E[1],E[2],E[3],E[4],E[5],E[6],1);a6.alpha&&(a6={x:a6.x,y:a6.y,alpha:a6.alpha});return a6;};},n=aj(function(E,d,a0,S,a6,a5,a4,a3){var R={x:0,y:0},a2=0;for(var a1=0;a1<1.01;a1+=0.01){var e=M(E,d,a0,S,a6,a5,a4,a3,a1);a1&&(a2+=ab.sqrt(aM(R.x-e.x,2)+aM(R.y-e.y,2)));R=e;}return a2;});var ap=aB(1),C=aB(),J=aB(0,1);ax[aY].getTotalLength=function(){if(this.type!="path"){return;}return ap(this.attrs.path);};ax[aY].getPointAtLength=function(d){if(this.type!="path"){return;}return C(this.attrs.path,d);};ax[aY].getSubpath=function(i,e){if(this.type!="path"){return;}if(ab.abs(this.getTotalLength()-e)<0.000001){return J(this.attrs.path,i).end;}var d=J(this.attrs.path,e,1);return i?J(d,i).end:d;};an.easing_formulas={linear:function(d){return d;},"<":function(d){return aM(d,3);},">":function(d){return aM(d-1,3)+1;},"<>":function(d){d=d*2;if(d<1){return aM(d,3)/2;}d-=2;return(aM(d,3)+2)/2;},backIn:function(e){var d=1.70158;return e*e*((d+1)*e-d);},backOut:function(e){e=e-1;var d=1.70158;return e*e*((d+1)*e+d)+1;},elastic:function(i){if(i==0||i==1){return i;}var e=0.3,d=e/4;return aM(2,-10*i)*ab.sin((i-d)*(2*ab.PI)/e)+1;},bounce:function(E){var e=7.5625,i=2.75,d;if(E<(1/i)){d=e*E*E;}else{if(E<(2/i)){E-=(1.5/i);d=e*E*E+0.75;}else{if(E<(2.5/i)){E-=(2.25/i);d=e*E*E+0.9375;}else{E-=(2.625/i);d=e*E*E+0.984375;}}}return d;}};var I={length:0},aR=function(){var a2=+new Date;for(var be in I){if(be!="length"&&I[Q](be)){var bj=I[be];if(bj.stop){delete I[be];I[m]--;continue;}var a0=a2-bj.start,bb=bj.ms,ba=bj.easing,bf=bj.from,a7=bj.diff,E=bj.to,a6=bj.t,a9=bj.prev||0,a1=bj.el,R=bj.callback,a8={},d;if(a0<bb){var S=an.easing_formulas[ba]?an.easing_formulas[ba](a0/bb):a0/bb;for(var bc in bf){if(bf[Q](bc)){switch(Z[bc]){case"along":d=S*bb*a7[bc];E.back&&(d=E.len-d);var bd=C(E[bc],d);a1.translate(a7.sx-a7.x||0,a7.sy-a7.y||0);a7.x=bd.x;a7.y=bd.y;a1.translate(bd.x-a7.sx,bd.y-a7.sy);E.rot&&a1.rotate(a7.r+bd.alpha,bd.x,bd.y);break;case"number":d=+bf[bc]+S*bb*a7[bc];break;case"colour":d="rgb("+[B(O(bf[bc].r+S*bb*a7[bc].r)),B(O(bf[bc].g+S*bb*a7[bc].g)),B(O(bf[bc].b+S*bb*a7[bc].b))][az](",")+")";break;case"path":d=[];for(var bh=0,a5=bf[bc][m];bh<a5;bh++){d[bh]=[bf[bc][bh][0]];for(var bg=1,bi=bf[bc][bh][m];bg<bi;bg++){d[bh][bg]=+bf[bc][bh][bg]+S*bb*a7[bc][bh][bg];}d[bh]=d[bh][az](am);}d=d[az](am);break;case"csv":switch(bc){case"translation":var a4=a7[bc][0]*(a0-a9),a3=a7[bc][1]*(a0-a9);a6.x+=a4;a6.y+=a3;d=a4+am+a3;break;case"rotation":d=+bf[bc][0]+S*bb*a7[bc][0];bf[bc][1]&&(d+=","+bf[bc][1]+","+bf[bc][2]);break;case"scale":d=[+bf[bc][0]+S*bb*a7[bc][0],+bf[bc][1]+S*bb*a7[bc][1],(2 in E[bc]?E[bc][2]:at),(3 in E[bc]?E[bc][3]:at)][az](am);break;case"clip-rect":d=[];var bh=4;while(bh--){d[bh]=+bf[bc][bh]+S*bb*a7[bc][bh];}break;}break;}a8[bc]=d;}}a1.attr(a8);a1._run&&a1._run.call(a1);}else{if(E.along){var bd=C(E.along,E.len*!E.back);a1.translate(a7.sx-(a7.x||0)+bd.x-a7.sx,a7.sy-(a7.y||0)+bd.y-a7.sy);E.rot&&a1.rotate(a7.r+bd.alpha,bd.x,bd.y);}(a6.x||a6.y)&&a1.translate(-a6.x,-a6.y);E.scale&&(E.scale=E.scale+at);a1.attr(E);delete I[be];I[m]--;a1.in_animation=null;an.is(R,"function")&&R.call(a1);}bj.prev=a0;}}an.svg&&a1&&a1.paper.safari();I[m]&&setTimeout(aR);},B=function(d){return d>255?255:(d<0?0:d);},t=function(d,i){if(d==null){return{x:this._.tx,y:this._.ty,toString:u};}this._.tx+=+d;this._.ty+=+i;switch(this.type){case"circle":case"ellipse":this.attr({cx:+d+this.attrs.cx,cy:+i+this.attrs.cy});break;case"rect":case"image":case"text":this.attr({x:+d+this.attrs.x,y:+i+this.attrs.y});break;case"path":var e=ad(this.attrs.path);e[0][1]+=+d;e[0][2]+=+i;this.attr({path:e});break;}return this;};ax[aY].animateWith=function(e,i,d,R,E){I[e.id]&&(i.start=I[e.id].start);return this.animate(i,d,R,E);};ax[aY].animateAlong=ay();ax[aY].animateAlongBack=ay(1);function ay(d){return function(E,i,e,S){var R={back:d};an.is(e,"function")?(S=e):(R.rot=e);E&&E.constructor==ax&&(E=E.attrs.path);E&&(R.along=E);return this.animate(R,i,S);};}ax[aY].onAnimation=function(d){this._run=d||0;return this;};ax[aY].animate=function(be,a5,a4,E){if(an.is(a4,"function")||!a4){E=a4||null;}var a9={},e={},a2={};for(var a6 in be){if(be[Q](a6)){if(Z[Q](a6)){a9[a6]=this.attr(a6);(a9[a6]==null)&&(a9[a6]=j[a6]);e[a6]=be[a6];switch(Z[a6]){case"along":var bc=ap(be[a6]),a7=C(be[a6],bc*!!be.back),R=this.getBBox();a2[a6]=bc/a5;a2.tx=R.x;a2.ty=R.y;a2.sx=a7.x;a2.sy=a7.y;e.rot=be.rot;e.back=be.back;e.len=bc;be.rot&&(a2.r=W(this.rotate())||0);break;case"number":a2[a6]=(e[a6]-a9[a6])/a5;break;case"colour":a9[a6]=an.getRGB(a9[a6]);var a8=an.getRGB(e[a6]);a2[a6]={r:(a8.r-a9[a6].r)/a5,g:(a8.g-a9[a6].g)/a5,b:(a8.b-a9[a6].b)/a5};break;case"path":var S=H(a9[a6],e[a6]);a9[a6]=S[0];var a3=S[1];a2[a6]=[];for(var bb=0,a1=a9[a6][m];bb<a1;bb++){a2[a6][bb]=[0];for(var ba=1,bd=a9[a6][bb][m];ba<bd;ba++){a2[a6][bb][ba]=(a3[bb][ba]-a9[a6][bb][ba])/a5;}}break;case"csv":var d=(be[a6]+at)[z](a),a0=(a9[a6]+at)[z](a);switch(a6){case"translation":a9[a6]=[0,0];a2[a6]=[d[0]/a5,d[1]/a5];break;case"rotation":a9[a6]=(a0[1]==d[1]&&a0[2]==d[2])?a0:[0,d[1],d[2]];a2[a6]=[(d[0]-a9[a6][0])/a5,0,0];break;case"scale":be[a6]=d;a9[a6]=(a9[a6]+at)[z](a);a2[a6]=[(d[0]-a9[a6][0])/a5,(d[1]-a9[a6][1])/a5,0,0];break;case"clip-rect":a9[a6]=(a9[a6]+at)[z](a);a2[a6]=[];var bb=4;while(bb--){a2[a6][bb]=(d[bb]-a9[a6][bb])/a5;}break;}e[a6]=d;}}}}this.stop();this.in_animation=1;I[this.id]={start:be.start||+new Date,ms:a5,easing:a4,from:a9,diff:a2,to:e,el:this,callback:E,t:{x:0,y:0}};++I[m]==1&&aR();return this;};ax[aY].stop=function(){I[this.id]&&I[m]--;delete I[this.id];return this;};ax[aY].translate=function(d,e){return this.attr({translation:d+" "+e});};ax[aY][aA]=function(){return"Rapha\xebl\u2019s object";};an.ae=I;var T=function(d){this.items=[];this[m]=0;if(d){for(var e=0,E=d[m];e<E;e++){if(d[e]&&(d[e].constructor==ax||d[e].constructor==T)){this[this.items[m]]=this.items[this.items[m]]=d[e];this[m]++;}}}};T[aY][f]=function(){var R,d;for(var e=0,E=arguments[m];e<E;e++){R=arguments[e];if(R&&(R.constructor==ax||R.constructor==T)){d=this.items[m];this[d]=this.items[d]=R;this[m]++;}}return this;};T[aY].pop=function(){delete this[this[m]--];return this.items.pop();};for(var y in ax[aY]){if(ax[aY][Q](y)){T[aY][y]=(function(d){return function(){for(var e=0,E=this.items[m];e<E;e++){this.items[e][d][aW](this.items[e],arguments);}return this;};})(y);}}T[aY].attr=function(e,a0){if(e&&an.is(e,"array")&&an.is(e[0],"object")){for(var d=0,S=e[m];d<S;d++){this.items[d].attr(e[d]);}}else{for(var E=0,R=this.items[m];E<R;E++){this.items[E].attr[aW](this.items[E],arguments);}}return this;};T[aY].animate=function(S,e,a2,a1){(an.is(a2,"function")||!a2)&&(a1=a2||null);var d=this.items[m],E=d,a0=this,R;a1&&(R=function(){!--d&&a1.call(a0);});this.items[--E].animate(S,e,a2||R,R);while(E--){this.items[E].animateWith(this.items[d-1],S,e,a2||R,R);}return this;};T[aY].insertAfter=function(e){var d=this.items[m];while(d--){this.items[d].insertAfter(e);}return this;};T[aY].getBBox=function(){var d=[],a0=[],e=[],R=[];for(var E=this.items[m];E--;){var S=this.items[E].getBBox();d[f](S.x);a0[f](S.y);e[f](S.x+S.width);R[f](S.y+S.height);}d=aI[aW](0,d);a0=aI[aW](0,a0);return{x:d,y:a0,width:g[aW](0,e)-d,height:g[aW](0,R)-a0};};an.registerFont=function(e){if(!e.face){return e;}this.fonts=this.fonts||{};var E={w:e.w,face:{},glyphs:{}},i=e.face["font-family"];for(var a0 in e.face){if(e.face[Q](a0)){E.face[a0]=e.face[a0];}}if(this.fonts[i]){this.fonts[i][f](E);}else{this.fonts[i]=[E];}if(!e.svg){E.face["units-per-em"]=G(e.face["units-per-em"],10);for(var R in e.glyphs){if(e.glyphs[Q](R)){var S=e.glyphs[R];E.glyphs[R]={w:S.w,k:{},d:S.d&&"M"+S.d[aP](/[mlcxtrv]/g,function(a1){return{l:"L",c:"C",x:"z",t:"m",r:"l",v:"c"}[a1]||"M";})+"z"};if(S.k){for(var d in S.k){if(S[Q](d)){E.glyphs[R].k[d]=S.k[d];}}}}}}return e;};aT[aY].getFont=function(a2,a3,e,R){R=R||"normal";e=e||"normal";a3=+a3||{normal:400,bold:700,lighter:300,bolder:800}[a3]||400;var S=an.fonts[a2];if(!S){var E=new RegExp("(^|\\s)"+a2[aP](/[^\w\d\s+!~.:_-]/g,at)+"(\\s|$)","i");for(var d in an.fonts){if(an.fonts[Q](d)){if(E.test(d)){S=an.fonts[d];break;}}}}var a0;if(S){for(var a1=0,a4=S[m];a1<a4;a1++){a0=S[a1];if(a0.face["font-weight"]==a3&&(a0.face["font-style"]==e||!a0.face["font-style"])&&a0.face["font-stretch"]==R){break;}}}return a0;};aT[aY].print=function(R,E,d,a1,a2,bb){bb=bb||"middle";var a7=this.set(),ba=(d+at)[z](at),a8=0,a4=at,bc;an.is(a1,"string")&&(a1=this.getFont(a1));if(a1){bc=(a2||16)/a1.face["units-per-em"];var e=a1.face.bbox.split(a),a0=+e[0],a3=+e[1]+(bb=="baseline"?e[3]-e[1]+(+a1.face.descent):(e[3]-e[1])/2);for(var a6=0,S=ba[m];a6<S;a6++){var a5=a6&&a1.glyphs[ba[a6-1]]||{},a9=a1.glyphs[ba[a6]];a8+=a6?(a5.w||a1.w)+(a5.k&&a5.k[ba[a6]]||0):0;a9&&a9.d&&a7[f](this.path(a9.d).attr({fill:"#000",stroke:"none",translation:[a8,0]}));}a7.scale(bc,bc,a0,a3).translate(R-a0,E-a3);}return a7;};an.format=function(i){var e=an.is(arguments[1],"array")?[0][aS](arguments[1]):arguments,d=/\{(\d+)\}/g;i&&an.is(i,"string")&&e[m]-1&&(i=i[aP](d,function(R,E){return e[++E]==null?at:e[E];}));return i||at;};an.ninja=function(){var d=Raphael;if(l.was){Raphael=l.is;}else{delete Raphael;}return d;};an.el=ax[aY];return an;})();(function(){function b(){}function c(w,u){for(var v in (u||{})){w[v]=u[v]}return w}function m(u){return(typeof u=="function")?u:function(){return u}}var k=Date.now||function(){return +new Date};function j(v){var u=h(v);return(u)?((u!="array")?[v]:v):[]}var h=function(u){return h.s.call(u).match(/^\[object\s(.*)\]$/)[1].toLowerCase()};h.s=Object.prototype.toString;function g(y,x){var w=h(y);if(w=="object"){for(var v in y){x(y[v],v)}}else{for(var u=0;u<y.length;u++){x(y[u],u)}}}function r(){var y={};for(var x=0,u=arguments.length;x<u;x++){var v=arguments[x];if(h(v)!="object"){continue}for(var w in v){var A=v[w],z=y[w];y[w]=(z&&h(A)=="object"&&h(z)=="object")?r(z,A):n(A)}}return y}function n(w){var v;switch(h(w)){case"object":v={};for(var y in w){v[y]=n(w[y])}break;case"array":v=[];for(var x=0,u=w.length;x<u;x++){v[x]=n(w[x])}break;default:return w}return v}function d(y,x){if(y.length<3){return null}if(y.length==4&&y[3]==0&&!x){return"transparent"}var v=[];for(var u=0;u<3;u++){var w=(y[u]-0).toString(16);v.push((w.length==1)?"0"+w:w)}return(x)?v:"#"+v.join("")}function i(u){f(u);if(u.parentNode){u.parentNode.removeChild(u)}if(u.clearAttributes){u.clearAttributes()}}function f(w){for(var v=w.childNodes,u=0;u<v.length;u++){i(v[u])}}function t(w,v,u){if(w.addEventListener){w.addEventListener(v,u,false)}else{w.attachEvent("on"+v,u)}}function s(v,u){return(" "+v.className+" ").indexOf(" "+u+" ")>-1}function p(v,u){if(!s(v,u)){v.className=(v.className+" "+u)}}function a(v,u){v.className=v.className.replace(new RegExp("(^|\\s)"+u+"(?:\\s|$)"),"$1")}function e(u){return document.getElementById(u)}var o=function(v){v=v||{};var u=function(){this.constructor=u;if(o.prototyping){return this}var x=(this.initialize)?this.initialize.apply(this,arguments):this;return x};for(var w in o.Mutators){if(!v[w]){continue}v=o.Mutators[w](v,v[w]);delete v[w]}c(u,this);u.constructor=o;u.prototype=v;return u};o.Mutators={Extends:function(w,u){o.prototyping=u.prototype;var v=new u;delete v.parent;v=o.inherit(v,w);delete o.prototyping;return v},Implements:function(u,v){g(j(v),function(w){o.prototying=w;c(u,(h(w)=="function")?new w:w);delete o.prototyping});return u}};c(o,{inherit:function(v,y){var u=arguments.callee.caller;for(var x in y){var w=y[x];var A=v[x];var z=h(w);if(A&&z=="function"){if(w!=A){if(u){w.__parent=A;v[x]=w}else{o.override(v,x,w)}}}else{if(z=="object"){v[x]=r(A,w)}else{v[x]=w}}}if(u){v.parent=function(){return arguments.callee.caller.__parent.apply(this,arguments)}}return v},override:function(v,u,y){var x=o.prototyping;if(x&&v[u]!=x[u]){x=null}var w=function(){var z=this.parent;this.parent=x?x[u]:v[u];var A=y.apply(this,arguments);this.parent=z;return A};v[u]=w}});o.prototype.implement=function(){var u=this.prototype;g(Array.prototype.slice.call(arguments||[]),function(v){o.inherit(u,v)});return this};this.TreeUtil={prune:function(v,u){this.each(v,function(x,w){if(w==u&&x.children){delete x.children;x.children=[]}})},getParent:function(u,y){if(u.id==y){return false}var x=u.children;if(x&&x.length>0){for(var w=0;w<x.length;w++){if(x[w].id==y){return u}else{var v=this.getParent(x[w],y);if(v){return v}}}}return false},getSubtree:function(u,y){if(u.id==y){return u}for(var w=0,x=u.children;w<x.length;w++){var v=this.getSubtree(x[w],y);if(v!=null){return v}}return null},getLeaves:function(w,u){var x=[],v=u||Number.MAX_VALUE;this.each(w,function(z,y){if(y<v&&(!z.children||z.children.length==0)){x.push({node:z,level:v-y})}});return x},eachLevel:function(u,z,w,y){if(z<=w){y(u,z);for(var v=0,x=u.children;v<x.length;v++){this.eachLevel(x[v],z+1,w,y)}}},each:function(u,v){this.eachLevel(u,0,Number.MAX_VALUE,v)},loadSubtrees:function(D,x){var C=x.request&&x.levelsToShow;var y=this.getLeaves(D,C),A=y.length,z={};if(A==0){x.onComplete()}for(var w=0,u=0;w<A;w++){var B=y[w],v=B.node.id;z[v]=B.node;x.request(v,B.level,{onComplete:function(G,E){var F=E.children;z[G].children=F;if(++u==A){x.onComplete()}}})}}};this.Canvas=(function(){var v={injectInto:"id",width:200,height:200,backgroundColor:"#333333",styles:{fillStyle:"#000000",strokeStyle:"#000000"},backgroundCanvas:false};function x(){x.t=x.t||typeof(HTMLCanvasElement);return"function"==x.t||"object"==x.t}function w(z,C,B){var A=document.createElement(z);(function(E,F){if(F){for(var D in F){E[D]=F[D]}}return arguments.callee})(A,C)(A.style,B);if(z=="canvas"&&!x()&&G_vmlCanvasManager){A=G_vmlCanvasManager.initElement(document.body.appendChild(A))}return A}function u(z){return document.getElementById(z)}function y(C,B,A,E){var D=A?(C.width-A):C.width;var z=E?(C.height-E):C.height;B.translate(D/2,z/2)}return function(B,C){var N,G,z,K,D,J;if(arguments.length<1){throw"Arguments missing"}var A=B+"-label",I=B+"-canvas",E=B+"-bkcanvas";C=r(v,C||{});var F={width:C.width,height:C.height};z=w("div",{id:B},r(F,{position:"relative"}));K=w("div",{id:A},{overflow:"visible",position:"absolute",top:0,left:0,width:F.width+"px",height:0});var L={position:"absolute",top:0,left:0,width:F.width+"px",height:F.height+"px"};D=w("canvas",r({id:I},F),L);var H=C.backgroundCanvas;if(H){J=w("canvas",r({id:E},F),L);z.appendChild(J)}z.appendChild(D);z.appendChild(K);u(C.injectInto).appendChild(z);N=D.getContext("2d");y(D,N);var M=C.styles;var O;for(O in M){N[O]=M[O]}if(H){G=J.getContext("2d");M=H.styles;for(O in M){G[O]=M[O]}y(J,G);H.impl.init(J,G);H.impl.plot(J,G)}return{id:B,getCtx:function(){return N},getElement:function(){return z},resize:function(T,P){var S=D.width,U=D.height;D.width=T;D.height=P;D.style.width=T+"px";D.style.height=P+"px";if(H){J.width=T;J.height=P;J.style.width=T+"px";J.style.height=P+"px"}if(!x()){y(D,N,S,U)}else{y(D,N)}var Q=C.styles;var R;for(R in Q){N[R]=Q[R]}if(H){Q=H.styles;for(R in Q){G[R]=Q[R]}if(!x()){y(J,G,S,U)}else{y(J,G)}H.impl.init(J,G);H.impl.plot(J,G)}},getSize:function(){return{width:D.width,height:D.height}},path:function(P,Q){N.beginPath();Q(N);N[P]();N.closePath()},clear:function(){var P=this.getSize();N.clearRect(-P.width/2,-P.height/2,P.width,P.height)},clearRectangle:function(T,R,Q,S){if(!x()){var P=N.fillStyle;N.fillStyle=C.backgroundColor;N.fillRect(S,T,Math.abs(R-S),Math.abs(Q-T));N.fillStyle=P}else{N.clearRect(S,T,Math.abs(R-S),Math.abs(Q-T))}}}}})();this.Polar=function(v,u){this.theta=v;this.rho=u};Polar.prototype={getc:function(u){return this.toComplex(u)},getp:function(){return this},set:function(u){u=u.getp();this.theta=u.theta;this.rho=u.rho},setc:function(u,v){this.rho=Math.sqrt(u*u+v*v);this.theta=Math.atan2(v,u);if(this.theta<0){this.theta+=Math.PI*2}},setp:function(v,u){this.theta=v;this.rho=u},clone:function(){return new Polar(this.theta,this.rho)},toComplex:function(w){var u=Math.cos(this.theta)*this.rho;var v=Math.sin(this.theta)*this.rho;if(w){return{x:u,y:v}}return new Complex(u,v)},add:function(u){return new Polar(this.theta+u.theta,this.rho+u.rho)},scale:function(u){return new Polar(this.theta,this.rho*u)},equals:function(u){return this.theta==u.theta&&this.rho==u.rho},$add:function(u){this.theta=this.theta+u.theta;this.rho+=u.rho;return this},$madd:function(u){this.theta=(this.theta+u.theta)%(Math.PI*2);this.rho+=u.rho;return this},$scale:function(u){this.rho*=u;return this},interpolate:function(w,C){var x=Math.PI,A=x*2;var v=function(D){return(D<0)?(D%A)+A:D%A};var z=this.theta,B=w.theta;var y;if(Math.abs(z-B)>x){if(z>B){y=v((B+((z-A)-B)*C))}else{y=v((B-A+(z-(B-A))*C))}}else{y=v((B+(z-B)*C))}var u=(this.rho-w.rho)*C+w.rho;return{theta:y,rho:u}}};var l=function(v,u){return new Polar(v,u)};Polar.KER=l(0,0);this.Complex=function(u,v){this.x=u;this.y=v};Complex.prototype={getc:function(){return this},getp:function(u){return this.toPolar(u)},set:function(u){u=u.getc(true);this.x=u.x;this.y=u.y},setc:function(u,v){this.x=u;this.y=v},setp:function(v,u){this.x=Math.cos(v)*u;this.y=Math.sin(v)*u},clone:function(){return new Complex(this.x,this.y)},toPolar:function(w){var u=this.norm();var v=Math.atan2(this.y,this.x);if(v<0){v+=Math.PI*2}if(w){return{theta:v,rho:u}}return new Polar(v,u)},norm:function(){return Math.sqrt(this.squaredNorm())},squaredNorm:function(){return this.x*this.x+this.y*this.y},add:function(u){return new Complex(this.x+u.x,this.y+u.y)},prod:function(u){return new Complex(this.x*u.x-this.y*u.y,this.y*u.x+this.x*u.y)},conjugate:function(){return new Complex(this.x,-this.y)},scale:function(u){return new Complex(this.x*u,this.y*u)},equals:function(u){return this.x==u.x&&this.y==u.y},$add:function(u){this.x+=u.x;this.y+=u.y;return this},$prod:function(w){var u=this.x,v=this.y;this.x=u*w.x-v*w.y;this.y=v*w.x+u*w.y;return this},$conjugate:function(){this.y=-this.y;return this},$scale:function(u){this.x*=u;this.y*=u;return this},$div:function(z){var u=this.x,w=this.y;var v=z.squaredNorm();this.x=u*z.x+w*z.y;this.y=w*z.x-u*z.y;return this.$scale(1/v)}};var q=function(v,u){return new Complex(v,u)};Complex.KER=q(0,0);this.Graph=new o({initialize:function(u){var v={complex:false,Node:{}};this.opt=r(v,u||{});this.nodes={}},getNode:function(u){if(this.hasNode(u)){return this.nodes[u]}return false},getAdjacence:function(w,u){var v=[];if(this.hasNode(w)&&this.hasNode(u)&&this.nodes[w].adjacentTo({id:u})&&this.nodes[u].adjacentTo({id:w})){v.push(this.nodes[w].getAdjacency(u));v.push(this.nodes[u].getAdjacency(w));return v}return false},addNode:function(u){if(!this.nodes[u.id]){this.nodes[u.id]=new Graph.Node(c({id:u.id,name:u.name,data:u.data},this.opt.Node),this.opt.complex)}return this.nodes[u.id]},addAdjacence:function(x,w,v){var y=[];if(!this.hasNode(x.id)){this.addNode(x)}if(!this.hasNode(w.id)){this.addNode(w)}x=this.nodes[x.id];w=this.nodes[w.id];for(var u in this.nodes){if(this.nodes[u].id==x.id){if(!this.nodes[u].adjacentTo(w)){y.push(this.nodes[u].addAdjacency(w,v))}}if(this.nodes[u].id==w.id){if(!this.nodes[u].adjacentTo(x)){y.push(this.nodes[u].addAdjacency(x,v))}}}return y},removeNode:function(w){if(this.hasNode(w)){var v=this.nodes[w];for(var u=0 in v.adjacencies){var adj=v.adjacencies[u];this.removeAdjacence(w,adj.nodeTo.id)}delete this.nodes[w]}},removeAdjacence:function(y,x){if(this.hasNode(y)){this.nodes[y].removeAdjacency(x)}if(this.hasNode(x)){this.nodes[x].removeAdjacency(y)}},hasNode:function(x){return x in this.nodes}});Graph.Node=new o({initialize:function(x,z){var y={id:"",name:"",data:{},adjacencies:{},selected:false,drawn:false,exist:false,angleSpan:{begin:0,end:0},alpha:1,startAlpha:1,endAlpha:1,pos:(z&&q(0,0))||l(0,0),startPos:(z&&q(0,0))||l(0,0),endPos:(z&&q(0,0))||l(0,0)};c(this,c(y,x))},adjacentTo:function(x){return x.id in this.adjacencies},getAdjacency:function(x){return this.adjacencies[x]},addAdjacency:function(y,z){var x=new Graph.Adjacence(this,y,z);return this.adjacencies[y.id]=x},removeAdjacency:function(x){delete this.adjacencies[x]}});Graph.Adjacence=function(x,z,y){this.nodeFrom=x;this.nodeTo=z;this.data=y||{};this.alpha=1;this.startAlpha=1;this.endAlpha=1};Graph.Util={filter:function(y){if(!y||!(h(y)=="string")){return function(){return true}}var x=y.split(" ");return function(A){for(var z=0;z<x.length;z++){if(A[x[z]]){return false}}return true}},getNode:function(x,y){return x.getNode(y)},eachNode:function(B,A,x){var z=this.filter(x);for(var y in B.nodes){if(z(B.nodes[y])){A(B.nodes[y])}}},eachAdjacency:function(A,B,x){var y=A.adjacencies,z=this.filter(x);for(var C in y){if(z(y[C])){B(y[C],C)}}},computeLevels:function(D,E,A,z){A=A||0;var B=this.filter(z);this.eachNode(D,function(F){F._flag=false;F._depth=-1},z);var y=D.getNode(E);y._depth=A;var x=[y];while(x.length!=0){var C=x.pop();C._flag=true;this.eachAdjacency(C,function(F){var G=F.nodeTo;if(G._flag==false&&B(G)){if(G._depth<0){G._depth=C._depth+1+A}x.unshift(G)}},z)}},eachBFS:function(C,D,B,y){var z=this.filter(y);this.clean(C);var x=[C.getNode(D)];while(x.length!=0){var A=x.pop();A._flag=true;B(A,A._depth);this.eachAdjacency(A,function(E){var F=E.nodeTo;if(F._flag==false&&z(F)){F._flag=true;x.unshift(F)}},y)}},eachLevel:function(B,F,y,C,A){var E=B._depth,x=this.filter(A),D=this;y=y===false?Number.MAX_VALUE-E:y;(function z(I,G,H){var J=I._depth;if(J>=G&&J<=H&&x(I)){C(I,J)}if(J<H){D.eachAdjacency(I,function(K){var L=K.nodeTo;if(L._depth>J){z(L,G,H)}})}})(B,F+E,y+E)},eachSubgraph:function(y,z,x){this.eachLevel(y,0,false,z,x)},eachSubnode:function(y,z,x){this.eachLevel(y,1,1,z,x)},anySubnode:function(A,z,y){var x=false;z=z||m(true);var B=h(z)=="string"?function(C){return C[z]}:z;this.eachSubnode(A,function(C){if(B(C)){x=true}},y);return x},getSubnodes:function(C,D,x){var z=[],B=this;D=D||0;var A,y;if(h(D)=="array"){A=D[0];y=D[1]}else{A=D;y=Number.MAX_VALUE-C._depth}this.eachLevel(C,A,y,function(E){z.push(E)},x);return z},getParents:function(y){var x=[];this.eachAdjacency(y,function(z){var A=z.nodeTo;if(A._depth<y._depth){x.push(A)}});return x},isDescendantOf:function(A,B){if(A.id==B){return true}var z=this.getParents(A),x=false;for(var y=0;!x&&y<z.length;y++){x=x||this.isDescendantOf(z[y],B)}return x},clean:function(x){this.eachNode(x,function(y){y._flag=false})}};Graph.Op={options:{type:"nothing",duration:2000,hideLabels:true,fps:30},removeNode:function(C,A){var x=this.viz;var y=r(this.options,x.controller,A);var E=j(C);var z,B,D;switch(y.type){case"nothing":for(z=0;z<E.length;z++){x.graph.removeNode(E[z])}break;case"replot":this.removeNode(E,{type:"nothing"});x.fx.clearLabels();x.refresh(true);break;case"fade:seq":case"fade":B=this;for(z=0;z<E.length;z++){D=x.graph.getNode(E[z]);D.endAlpha=0}x.fx.animate(r(y,{modes:["fade:nodes"],onComplete:function(){B.removeNode(E,{type:"nothing"});x.fx.clearLabels();x.reposition();x.fx.animate(r(y,{modes:["linear"]}))}}));break;case"fade:con":B=this;for(z=0;z<E.length;z++){D=x.graph.getNode(E[z]);D.endAlpha=0;D.ignore=true}x.reposition();x.fx.animate(r(y,{modes:["fade:nodes","linear"],onComplete:function(){B.removeNode(E,{type:"nothing"})}}));break;case"iter":B=this;x.fx.sequence({condition:function(){return E.length!=0},step:function(){B.removeNode(E.shift(),{type:"nothing"});x.fx.clearLabels()},onComplete:function(){y.onComplete()},duration:Math.ceil(y.duration/E.length)});break;default:this.doError()}},removeEdge:function(D,B){var x=this.viz;var z=r(this.options,x.controller,B);var y=(h(D[0])=="string")?[D]:D;var A,C,E;switch(z.type){case"nothing":for(A=0;A<y.length;A++){x.graph.removeAdjacence(y[A][0],y[A][1])}break;case"replot":this.removeEdge(y,{type:"nothing"});x.refresh(true);break;case"fade:seq":case"fade":C=this;for(A=0;A<y.length;A++){E=x.graph.getAdjacence(y[A][0],y[A][1]);if(E){E[0].endAlpha=0;E[1].endAlpha=0}}x.fx.animate(r(z,{modes:["fade:vertex"],onComplete:function(){C.removeEdge(y,{type:"nothing"});x.reposition();x.fx.animate(r(z,{modes:["linear"]}))}}));break;case"fade:con":C=this;for(A=0;A<y.length;A++){E=x.graph.getAdjacence(y[A][0],y[A][1]);if(E){E[0].endAlpha=0;E[0].ignore=true;E[1].endAlpha=0;E[1].ignore=true}}x.reposition();x.fx.animate(r(z,{modes:["fade:vertex","linear"],onComplete:function(){C.removeEdge(y,{type:"nothing"})}}));break;case"iter":C=this;x.fx.sequence({condition:function(){return y.length!=0},step:function(){C.removeEdge(y.shift(),{type:"nothing"});x.fx.clearLabels()},onComplete:function(){z.onComplete()},duration:Math.ceil(z.duration/y.length)});break;default:this.doError()}},sum:function(E,y){var C=this.viz;var F=r(this.options,C.controller,y),B=C.root;var A,D;C.root=y.id||C.root;switch(F.type){case"nothing":D=C.construct(E);A=Graph.Util;A.eachNode(D,function(G){A.eachAdjacency(G,function(H){C.graph.addAdjacence(H.nodeFrom,H.nodeTo,H.data)})});break;case"replot":C.refresh(true);this.sum(E,{type:"nothing"});C.refresh(true);break;case"fade:seq":case"fade":case"fade:con":A=Graph.Util;that=this;D=C.construct(E);var x=this.preprocessSum(D);var z=!x?["fade:nodes"]:["fade:nodes","fade:vertex"];C.reposition();if(F.type!="fade:con"){C.fx.animate(r(F,{modes:["linear"],onComplete:function(){C.fx.animate(r(F,{modes:z,onComplete:function(){F.onComplete()}}))}}))}else{A.eachNode(C.graph,function(G){if(G.id!=B&&G.pos.getp().equals(Polar.KER)){G.pos.set(G.endPos);G.startPos.set(G.endPos)}});C.fx.animate(r(F,{modes:["linear"].concat(z)}))}break;default:this.doError()}},morph:function(E,y){var C=this.viz;var F=r(this.options,C.controller,y),B=C.root;var A,D;C.root=y.id||C.root;switch(F.type){case"nothing":D=C.construct(E);A=Graph.Util;A.eachNode(D,function(G){A.eachAdjacency(G,function(H){C.graph.addAdjacence(H.nodeFrom,H.nodeTo,H.data)})});A.eachNode(C.graph,function(G){A.eachAdjacency(G,function(H){if(!D.getAdjacence(H.nodeFrom.id,H.nodeTo.id)){C.graph.removeAdjacence(H.nodeFrom.id,H.nodeTo.id)}});if(!D.hasNode(G.id)){C.graph.removeNode(G.id)}});break;case"replot":C.fx.clearLabels(true);this.morph(E,{type:"nothing"});C.refresh(true);C.refresh(true);break;case"fade:seq":case"fade":case"fade:con":A=Graph.Util;that=this;D=C.construct(E);var x=this.preprocessSum(D);A.eachNode(C.graph,function(G){if(!D.hasNode(G.id)){G.alpha=1;G.startAlpha=1;G.endAlpha=0;G.ignore=true}});A.eachNode(C.graph,function(G){if(G.ignore){return}A.eachAdjacency(G,function(H){if(H.nodeFrom.ignore||H.nodeTo.ignore){return}var I=D.getNode(H.nodeFrom.id);var J=D.getNode(H.nodeTo.id);if(!I.adjacentTo(J)){var K=C.graph.getAdjacence(I.id,J.id);x=true;K[0].alpha=1;K[0].startAlpha=1;K[0].endAlpha=0;K[0].ignore=true;K[1].alpha=1;K[1].startAlpha=1;K[1].endAlpha=0;K[1].ignore=true}})});var z=!x?["fade:nodes"]:["fade:nodes","fade:vertex"];C.reposition();A.eachNode(C.graph,function(G){if(G.id!=B&&G.pos.getp().equals(Polar.KER)){G.pos.set(G.endPos);G.startPos.set(G.endPos)}});C.fx.animate(r(F,{modes:["polar"].concat(z),onComplete:function(){A.eachNode(C.graph,function(G){if(G.ignore){C.graph.removeNode(G.id)}});A.eachNode(C.graph,function(G){A.eachAdjacency(G,function(H){if(H.ignore){C.graph.removeAdjacence(H.nodeFrom.id,H.nodeTo.id)}})});F.onComplete()}}));break;default:this.doError()}},preprocessSum:function(z){var x=this.viz;var y=Graph.Util;y.eachNode(z,function(B){if(!x.graph.hasNode(B.id)){x.graph.addNode(B);var C=x.graph.getNode(B.id);C.alpha=0;C.startAlpha=0;C.endAlpha=1}});var A=false;y.eachNode(z,function(B){y.eachAdjacency(B,function(C){var D=x.graph.getNode(C.nodeFrom.id);var E=x.graph.getNode(C.nodeTo.id);if(!D.adjacentTo(E)){var F=x.graph.addAdjacence(D,E,C.data);if(D.startAlpha==D.endAlpha&&E.startAlpha==E.endAlpha){A=true;F[0].alpha=0;F[0].startAlpha=0;F[0].endAlpha=1;F[1].alpha=0;F[1].startAlpha=0;F[1].endAlpha=1}}})});return A}};Graph.Plot={Interpolator:{moebius:function(C,E,A){if(E<=1||A.norm()<=1){var z=A.x,D=A.y;var B=C.startPos.getc().moebiusTransformation(A);C.pos.setc(B.x,B.y);A.x=z;A.y=D}},linear:function(x,A){var z=x.startPos.getc(true);var y=x.endPos.getc(true);x.pos.setc((y.x-z.x)*A+z.x,(y.y-z.y)*A+z.y)},"fade:nodes":function(x,A){if(A<=1&&(x.endAlpha!=x.alpha)){var z=x.startAlpha;var y=x.endAlpha;x.alpha=z+(y-z)*A}},"fade:vertex":function(x,A){var z=x.adjacencies;for(var y in z){this["fade:nodes"](z[y],A)}},polar:function(y,B){var A=y.startPos.getp(true);var z=y.endPos.getp();var x=z.interpolate(A,B);y.pos.setp(x.theta,x.rho)}},labelsHidden:false,labelContainer:false,labels:{},getLabelContainer:function(){return this.labelContainer?this.labelContainer:this.labelContainer=document.getElementById(this.viz.config.labelContainer)},getLabel:function(x){return(x in this.labels&&this.labels[x]!=null)?this.labels[x]:this.labels[x]=document.getElementById(x)},hideLabels:function(y){var x=this.getLabelContainer();if(y){x.style.display="none"}else{x.style.display=""}this.labelsHidden=y},clearLabels:function(x){for(var y in this.labels){if(x||!this.viz.graph.hasNode(y)){this.disposeLabel(y);delete this.labels[y]}}},disposeLabel:function(y){var x=this.getLabel(y);if(x&&x.parentNode){x.parentNode.removeChild(x)}},hideLabel:function(B,x){B=j(B);var y=x?"":"none",z,A=this;g(B,function(D){var C=A.getLabel(D.id);if(C){C.style.display=y}})},sequence:function(y){var z=this;y=r({condition:m(false),step:b,onComplete:b,duration:200},y||{});var x=setInterval(function(){if(y.condition()){y.step()}else{clearInterval(x);y.onComplete()}z.viz.refresh(true)},y.duration)},animate:function(z,y){var B=this,x=this.viz,C=x.graph,A=Graph.Util;z=r(x.controller,z||{});if(z.hideLabels){this.hideLabels(true)}this.animation.setOptions(r(z,{$animating:false,compute:function(E){var D=y?y.scale(-E):null;A.eachNode(C,function(G){for(var F=0;F<z.modes.length;F++){B.Interpolator[z.modes[F]](G,E,D)}});B.plot(z,this.$animating);this.$animating=true},complete:function(){A.eachNode(C,function(D){D.startPos.set(D.pos);D.startAlpha=D.alpha});if(z.hideLabels){B.hideLabels(false)}B.plot(z);z.onComplete();z.onAfterCompute()}})).start()},plot:function(y,G){var E=this.viz,B=E.graph,z=E.canvas,x=E.root,C=this,F=z.getCtx(),D=Graph.Util;y=y||this.viz.controller;y.clearCanvas&&z.clear();var A=!!B.getNode(x).visited;D.eachNode(B,function(H){D.eachAdjacency(H,function(I){var J=I.nodeTo;if(!!J.visited===A&&H.drawn&&J.drawn){!G&&y.onBeforePlotLine(I);F.save();F.globalAlpha=Math.min(Math.min(H.alpha,J.alpha),I.alpha);C.plotLine(I,z,G);F.restore();!G&&y.onAfterPlotLine(I)}});F.save();if(H.drawn){F.globalAlpha=H.alpha;!G&&y.onBeforePlotNode(H);C.plotNode(H,z,G);!G&&y.onAfterPlotNode(H)}if(!C.labelsHidden&&y.withLabels){if(H.drawn&&F.globalAlpha>=0.95){C.plotLabel(z,H,y)}else{C.hideLabel(H,false)}}F.restore();H.visited=!A})},plotLabel:function(A,B,z){var C=B.id,x=this.getLabel(C);if(!x&&!(x=document.getElementById(C))){x=document.createElement("div");var y=this.getLabelContainer();y.appendChild(x);x.id=C;x.className="node";x.style.position="absolute";z.onCreateLabel(x,B);this.labels[B.id]=x}this.placeLabel(x,B,z)},plotNode:function(z,y,G){var E=this.node,B=z.data;var D=E.overridable&&B;var x=D&&B.$lineWidth||E.lineWidth;var A=D&&B.$color||E.color;var F=y.getCtx();F.lineWidth=x;F.fillStyle=A;F.strokeStyle=A;var C=z.data&&z.data.$type||E.type;this.nodeTypes[C].call(this,z,y,G)},plotLine:function(E,z,G){var x=this.edge,B=E.data;var D=x.overridable&&B;var y=D&&B.$lineWidth||x.lineWidth;var A=D&&B.$color||x.color;var F=z.getCtx();F.lineWidth=y;F.fillStyle=A;F.strokeStyle=A;var C=E.data&&E.data.$type||x.type;this.edgeTypes[C].call(this,E,z,G)},fitsInCanvas:function(z,x){var y=x.getSize();if(z.x>=y.width||z.x<0||z.y>=y.height||z.y<0){return false}return true}};var Loader={construct:function(y){var z=(h(y)=="array");var x=new Graph(this.graphOptions);if(!z){(function(A,C){A.addNode(C);for(var B=0,D=C.children;B<D.length;B++){A.addAdjacence(C,D[B]);arguments.callee(A,D[B])}})(x,y)}else{(function(B,E){var H=function(J){for(var I=0;I<E.length;I++){if(E[I].id==J){return E[I]}}return undefined};for(var D=0;D<E.length;D++){B.addNode(E[D]);for(var C=0,A=E[D].adjacencies;C<A.length;C++){var F=A[C],G;if(typeof A[C]!="string"){G=F.data;F=F.nodeTo}B.addAdjacence(E[D],H(F),G)}}})(x,y)}return x},loadJSON:function(y,x){this.json=y;this.graph=this.construct(y);if(h(y)!="array"){this.root=y.id}else{this.root=y[x?x:0].id}}};this.Trans={linear:function(x){return x}};(function(){var x=function(A,z){z=j(z);return c(A,{easeIn:function(B){return A(B,z)},easeOut:function(B){return 1-A(1-B,z)},easeInOut:function(B){return(B<=0.5)?A(2*B,z)/2:(2-A(2*(1-B),z))/2}})};var y={Pow:function(A,z){return Math.pow(A,z[0]||6)},Expo:function(z){return Math.pow(2,8*(z-1))},Circ:function(z){return 1-Math.sin(Math.acos(z))},Sine:function(z){return 1-Math.sin((1-z)*Math.PI/2)},Back:function(A,z){z=z[0]||1.618;return Math.pow(A,2)*((z+1)*A-z)},Bounce:function(C){var B;for(var A=0,z=1;1;A+=z,z/=2){if(C>=(7-4*A)/11){B=z*z-Math.pow((11-6*A-11*C)/4,2);break}}return B},Elastic:function(A,z){return Math.pow(2,10*--A)*Math.cos(20*A*Math.PI*(z[0]||1)/3)}};g(y,function(A,z){Trans[z]=x(A)});g(["Quad","Cubic","Quart","Quint"],function(A,z){Trans[A]=x(function(B){return Math.pow(B,[z+2])})})})();var Animation=new o({initalize:function(x){this.setOptions(x)},setOptions:function(x){var y={duration:2500,fps:40,transition:Trans.Quart.easeInOut,compute:b,complete:b};this.opt=r(y,x||{});return this},getTime:function(){return k()},step:function(){var y=this.getTime(),x=this.opt;if(y<this.time+x.duration){var z=x.transition((y-this.time)/x.duration);x.compute(z)}else{this.timer=clearInterval(this.timer);x.compute(1);x.complete()}},start:function(){this.time=0;this.startTimer();return this},startTimer:function(){var y=this,x=this.opt;if(this.timer){return false}this.time=this.getTime()-this.time;this.timer=setInterval((function(){y.step()}),Math.round(1000/x.fps));return true}});(function(){var G=Array.prototype.slice;function E(Q,K,I,O){var M=K.Node,N=Graph.Util;var J=K.multitree;if(M.overridable){var P=-1,L=-1;N.eachNode(Q,function(T){if(T._depth==I&&(!J||("$orn" in T.data)&&T.data.$orn==O)){var R=T.data.$width||M.width;var S=T.data.$height||M.height;P=(P<R)?R:P;L=(L<S)?S:L}});return{width:P<0?M.width:P,height:L<0?M.height:L}}else{return M}}function H(J,M,L,I){var K=(I=="left"||I=="right")?"y":"x";J[M][K]+=L}function C(J,K){var I=[];g(J,function(L){L=G.call(L);L[0]+=K;L[1]+=K;I.push(L)});return I}function F(L,I){if(L.length==0){return I}if(I.length==0){return L}var K=L.shift(),J=I.shift();return[[K[0],J[1]]].concat(F(L,I))}function A(I,J){J=J||[];if(I.length==0){return J}var K=I.pop();return A(I,F(K,J))}function D(L,J,M,I,K){if(L.length<=K||J.length<=K){return 0}var O=L[K][1],N=J[K][0];return Math.max(D(L,J,M,I,++K)+M,O-N+I)}function B(L,J,I){function K(O,Q,N){if(Q.length<=N){return[]}var P=Q[N],M=D(O,P,J,I,0);return[M].concat(K(F(O,C(P,M)),Q,++N))}return K([],L,0)}function y(M,L,K){function I(P,R,O){if(R.length<=O){return[]}var Q=R[O],N=-D(Q,P,L,K,0);return[N].concat(I(F(C(Q,N),P),R,++O))}M=G.call(M);var J=I([],M.reverse(),0);return J.reverse()}function x(O,M,J,P){var K=B(O,M,J),N=y(O,M,J);if(P=="left"){N=K}else{if(P=="right"){K=N}}for(var L=0,I=[];L<K.length;L++){I[L]=(K[L]+N[L])/2}return I}function z(J,T,K,aa,Y){var M=aa.multitree;var S=["x","y"],P=["width","height"];var L=+(Y=="left"||Y=="right");var Q=S[L],Z=S[1-L];var V=aa.Node;var O=P[L],X=P[1-L];var N=aa.siblingOffset;var W=aa.subtreeOffset;var U=aa.align;var I=Graph.Util;function R(ad,ah,al){var ac=(V.overridable&&ad.data["$"+O])||V[O];var ak=ah||((V.overridable&&ad.data["$"+X])||V[X]);var ao=[],am=[],ai=false;var ab=ak+aa.levelDistance;I.eachSubnode(ad,function(aq){if(aq.exist&&(!M||("$orn" in aq.data)&&aq.data.$orn==Y)){if(!ai){ai=E(J,aa,aq._depth,Y)}var ap=R(aq,ai[X],al+ab);ao.push(ap.tree);am.push(ap.extent)}});var ag=x(am,W,N,U);for(var af=0,ae=[],aj=[];af<ao.length;af++){H(ao[af],K,ag[af],Y);aj.push(C(am[af],ag[af]))}var an=[[-ac/2,ac/2]].concat(A(aj));ad[K][Q]=0;if(Y=="top"||Y=="left"){ad[K][Z]=al}else{ad[K][Z]=-al}return{tree:ad,extent:an}}R(T,false,0)}this.ST=(function(){var J=[];function K(P){P=P||this.clickedNode;var M=this.geom,T=Graph.Util;var U=this.graph;var N=this.canvas;var L=P._depth,Q=[];T.eachNode(U,function(V){if(V.exist&&!V.selected){if(T.isDescendantOf(V,P.id)){if(V._depth<=L){Q.push(V)}}else{Q.push(V)}}});var R=M.getRightLevelToShow(P,N);T.eachLevel(P,R,R,function(V){if(V.exist&&!V.selected){Q.push(V)}});for(var S=0;S<J.length;S++){var O=this.graph.getNode(J[S]);if(!T.isDescendantOf(O,P.id)){Q.push(O)}}return Q}function I(O){var N=[],M=Graph.Util,L=this.config;O=O||this.clickedNode;M.eachLevel(this.clickedNode,0,L.levelsToShow,function(P){if(L.multitree&&!("$orn" in P.data)&&M.anySubnode(P,function(Q){return Q.exist&&!Q.drawn})){N.push(P)}else{if(P.drawn&&!M.anySubnode(P,"drawn")){N.push(P)}}});return N}return new o({Implements:Loader,initialize:function(O,L){var M={onBeforeCompute:b,onAfterCompute:b,onCreateLabel:b,onPlaceLabel:b,onComplete:b,onBeforePlotNode:b,onAfterPlotNode:b,onBeforePlotLine:b,onAfterPlotLine:b,request:false};var N={orientation:"left",labelContainer:O.id+"-label",levelsToShow:2,subtreeOffset:8,siblingOffset:5,levelDistance:30,withLabels:true,clearCanvas:true,align:"center",indent:10,multitree:false,constrained:true,Node:{overridable:false,type:"rectangle",color:"#ccb",lineWidth:1,height:20,width:90,dim:15,align:"center"},Edge:{overridable:false,type:"line",color:"#ccc",dim:15,lineWidth:1},duration:700,fps:25,transition:Trans.Quart.easeInOut};this.controller=this.config=r(N,M,L);this.canvas=O;this.graphOptions={complex:true};this.graph=new Graph(this.graphOptions);this.fx=new ST.Plot(this);this.op=new ST.Op(this);this.group=new ST.Group(this);this.geom=new ST.Geom(this);this.clickedNode=null},plot:function(){this.fx.plot(this.controller)},switchPosition:function(Q,P,O){var L=this.geom,M=this.fx,N=this;if(!M.busy){M.busy=true;this.contract({onComplete:function(){L.switchOrientation(Q);N.compute("endPos",false);M.busy=false;if(P=="animate"){N.onClick(N.clickedNode.id,O)}else{if(P=="replot"){N.select(N.clickedNode.id,O)}}}},Q)}},switchAlignment:function(N,M,L){this.config.align=N;if(M=="animate"){this.select(this.clickedNode.id,L)}else{if(M=="replot"){this.onClick(this.clickedNode.id,L)}}},addNodeInPath:function(L){J.push(L);this.select((this.clickedNode&&this.clickedNode.id)||this.root)},clearNodesInPath:function(L){J.length=0;this.select((this.clickedNode&&this.clickedNode.id)||this.root)},refresh:function(){this.reposition();this.select((this.clickedNode&&this.clickedNode.id)||this.root)},reposition:function(){Graph.Util.computeLevels(this.graph,this.root,0,"ignore");this.geom.setRightLevelToShow(this.clickedNode,this.canvas);Graph.Util.eachNode(this.graph,function(L){if(L.exist){L.drawn=true}});this.compute("endPos")},compute:function(N,M){var O=N||"startPos";var L=this.graph.getNode(this.root);c(L,{drawn:true,exist:true,selected:true});if(!!M||!("_depth" in L)){Graph.Util.computeLevels(this.graph,this.root,0,"ignore")}this.computePositions(L,O)},computePositions:function(P,L){var N=this.config;var M=N.multitree;var S=N.align;var O=S!=="center"&&N.indent;var T=N.orientation;var R=M?["top","right","bottom","left"]:[T];var Q=this;g(R,function(U){z(Q.graph,P,L,Q.config,U);var V=["x","y"][+(U=="left"||U=="right")];(function W(X){Graph.Util.eachSubnode(X,function(Y){if(Y.exist&&(!M||("$orn" in Y.data)&&Y.data.$orn==U)){Y[L][V]+=X[L][V];if(O){Y[L][V]+=S=="left"?O:-O}W(Y)}})})(P)})},requestNodes:function(O,P){var M=r(this.controller,P),L=this.config.levelsToShow,N=Graph.Util;if(M.request){var R=[],Q=O._depth;N.eachLevel(O,0,L,function(S){if(S.drawn&&!N.anySubnode(S)){R.push(S);S._level=L-(S._depth-Q)}});this.group.requestNodes(R,M)}else{M.onComplete()}},contract:function(P,Q){var O=this.config.orientation;var L=this.geom,N=this.group;if(Q){L.switchOrientation(Q)}var M=K.call(this);if(Q){L.switchOrientation(O)}N.contract(M,r(this.controller,P))},move:function(M,N){this.compute("endPos",false);var L=N.Move,O={x:L.offsetX,y:L.offsetY};if(L.enable){this.geom.translate(M.endPos.add(O).$scale(-1),"endPos")}this.fx.animate(r(this.controller,{modes:["linear"]},N))},expand:function(M,N){var L=I.call(this,M);this.group.expand(L,r(this.controller,N))},selectPath:function(P){var O=Graph.Util,N=this;O.eachNode(this.graph,function(R){R.selected=false});function Q(S){if(S==null||S.selected){return}S.selected=true;g(N.group.getSiblings([S])[S.id],function(T){T.exist=true;T.drawn=true});var R=O.getParents(S);R=(R.length>0)?R[0]:null;Q(R)}for(var L=0,M=[P.id].concat(J);L<M.length;L++){Q(this.graph.getNode(M[L]))}},setRoot:function(S,R,Q){var P=this,N=this.canvas;var L=this.graph.getNode(this.root);var M=this.graph.getNode(S);function O(){if(this.config.multitree&&M.data.$orn){var U=M.data.$orn;var V={left:"right",right:"left",top:"bottom",bottom:"top"}[U];L.data.$orn=V;(function T(W){Graph.Util.eachSubnode(W,function(X){if(X.id!=S){X.data.$orn=V;T(X)}})})(L);delete M.data.$orn}this.root=S;this.clickedNode=M;Graph.Util.computeLevels(this.graph,this.root,0,"ignore")}delete L.data.$orns;if(R=="animate"){this.onClick(S,{onBeforeMove:function(){O.call(P);P.selectPath(M)}})}else{if(R=="replot"){O.call(this);this.select(this.root)}}},addSubtree:function(L,N,M){if(N=="replot"){this.op.sum(L,c({type:"replot"},M||{}))}else{if(N=="animate"){this.op.sum(L,c({type:"fade:seq"},M||{}))}}},removeSubtree:function(Q,M,P,O){var N=this.graph.getNode(Q),L=[];Graph.Util.eachLevel(N,+!M,false,function(R){L.push(R.id)});if(P=="replot"){this.op.removeNode(L,c({type:"replot"},O||{}))}else{if(P=="animate"){this.op.removeNode(L,c({type:"fade:seq"},O||{}))}}},select:function(L,O){var T=this.group,R=this.geom;var P=this.graph.getNode(L),N=this.canvas;var S=this.graph.getNode(this.root);var M=r(this.controller,O);var Q=this;M.onBeforeCompute(P);this.selectPath(P);this.clickedNode=P;this.requestNodes(P,{onComplete:function(){T.hide(T.prepare(K.call(Q)),M);R.setRightLevelToShow(P,N);Q.compute("pos");Graph.Util.eachNode(Q.graph,function(V){var U=V.pos.getc(true);V.startPos.setc(U.x,U.y);V.endPos.setc(U.x,U.y);V.visited=false});Q.geom.translate(P.endPos.scale(-1),["pos","startPos","endPos"]);T.show(I.call(Q));Q.plot();M.onAfterCompute(Q.clickedNode);M.onComplete()}})},onClick:function(N,U){var O=this.canvas,S=this,R=this.fx,T=Graph.Util,L=this.geom;var Q={Move:{enable:true,offsetX:0,offsetY:0},onBeforeRequest:b,onBeforeContract:b,onBeforeMove:b,onBeforeExpand:b};var M=r(this.controller,Q,U);if(!this.busy){this.busy=true;var P=this.graph.getNode(N);this.selectPath(P,this.clickedNode);this.clickedNode=P;M.onBeforeCompute(P);M.onBeforeRequest(P);this.requestNodes(P,{onComplete:function(){M.onBeforeContract(P);S.contract({onComplete:function(){L.setRightLevelToShow(P,O);M.onBeforeMove(P);S.move(P,{Move:M.Move,onComplete:function(){M.onBeforeExpand(P);S.expand(P,{onComplete:function(){S.busy=false;M.onAfterCompute(N);M.onComplete()}})}})}})}})}}})})();ST.Op=new o({Implements:Graph.Op,initialize:function(I){this.viz=I}});ST.Group=new o({initialize:function(I){this.viz=I;this.canvas=I.canvas;this.config=I.config;this.animation=new Animation;this.nodes=null},requestNodes:function(N,M){var L=0,J=N.length,P={};var K=function(){M.onComplete()};var I=this.viz;if(J==0){K()}for(var O=0;O<J;O++){P[N[O].id]=N[O];M.request(N[O].id,N[O]._level,{onComplete:function(R,Q){if(Q&&Q.children){Q.id=R;I.op.sum(Q,{type:"nothing"})}if(++L==J){Graph.Util.computeLevels(I.graph,I.root,0);K()}}})}},contract:function(K,J){var M=Graph.Util;var I=this.viz;var L=this;K=this.prepare(K);this.animation.setOptions(r(J,{$animating:false,compute:function(N){if(N==1){N=0.99}L.plotStep(1-N,J,this.$animating);this.$animating="contract"},complete:function(){L.hide(K,J)}})).start()},hide:function(K,J){var N=Graph.Util,I=this.viz;for(var L=0;L<K.length;L++){if(true||!J||!J.request){N.eachLevel(K[L],1,false,function(O){if(O.exist){c(O,{drawn:false,exist:false})}})}else{var M=[];N.eachLevel(K[L],1,false,function(O){M.push(O.id)});I.op.removeNode(M,{type:"nothing"});I.fx.clearLabels()}}J.onComplete()},expand:function(J,I){var L=this,K=Graph.Util;this.show(J);this.animation.setOptions(r(I,{$animating:false,compute:function(M){L.plotStep(M,I,this.$animating);this.$animating="expand"},complete:function(){L.plotStep(undefined,I,false);I.onComplete()}})).start()},show:function(I){var K=Graph.Util,J=this.config;this.prepare(I);g(I,function(M){if(J.multitree&&!("$orn" in M.data)){delete M.data.$orns;var L=" ";K.eachSubnode(M,function(N){if(("$orn" in N.data)&&L.indexOf(N.data.$orn)<0&&N.exist&&!N.drawn){L+=N.data.$orn+" "}});M.data.$orns=L}K.eachLevel(M,0,J.levelsToShow,function(N){if(N.exist){N.drawn=true}})})},prepare:function(I){this.nodes=this.getNodesWithChildren(I);return this.nodes},getNodesWithChildren:function(K){var J=[],O=Graph.Util,M=this.config,I=this.viz.root;K.sort(function(R,Q){return(R._depth<=Q._depth)-(R._depth>=Q._depth)});for(var N=0;N<K.length;N++){if(O.anySubnode(K[N],"exist")){for(var L=N+1,P=false;!P&&L<K.length;L++){if(!M.multitree||"$orn" in K[L].data){P=P||O.isDescendantOf(K[N],K[L].id)}}if(!P){J.push(K[N])}}}return J},plotStep:function(T,O,V){var S=this.viz,L=this.config,K=S.canvas,U=K.getCtx(),I=this.nodes,Q=Graph.Util;var N,M;var J={};for(N=0;N<I.length;N++){M=I[N];J[M.id]=[];var R=L.multitree&&!("$orn" in M.data);var P=R&&M.data.$orns;Q.eachSubgraph(M,function(W){if(R&&P&&P.indexOf(W.data.$orn)>0&&W.drawn){W.drawn=false;J[M.id].push(W)}else{if((!R||!P)&&W.drawn){W.drawn=false;J[M.id].push(W)}}});M.drawn=true}if(I.length>0){S.fx.plot()}for(N in J){g(J[N],function(W){W.drawn=true})}for(N=0;N<I.length;N++){M=I[N];U.save();S.fx.plotSubtree(M,O,T,V);U.restore()}},getSiblings:function(I){var K={},J=Graph.Util;g(I,function(N){var M=J.getParents(N);if(M.length==0){K[N.id]=[N]}else{var L=[];J.eachSubnode(M[0],function(O){L.push(O)});K[N.id]=L}});return K}});ST.Geom=new o({initialize:function(I){this.viz=I;this.config=I.config;this.node=I.config.Node;this.edge=I.config.Edge},translate:function(J,I){I=j(I);Graph.Util.eachNode(this.viz.graph,function(K){g(I,function(L){K[L].$add(J)})})},switchOrientation:function(I){this.config.orientation=I},dispatch:function(){var J=Array.prototype.slice.call(arguments);var K=J.shift(),I=J.length;var L=function(M){return typeof M=="function"?M():M};if(I==2){return(K=="top"||K=="bottom")?L(J[0]):L(J[1])}else{if(I==4){switch(K){case"top":return L(J[0]);case"right":return L(J[1]);case"bottom":return L(J[2]);case"left":return L(J[3])}}}return undefined},getSize:function(J,I){var L=this.node,M=J.data,K=this.config;var O=L.overridable,P=K.siblingOffset;var R=(this.config.multitree&&("$orn" in J.data)&&J.data.$orn)||this.config.orientation;var Q=(O&&M.$width||L.width)+P;var N=(O&&M.$height||L.height)+P;if(!I){return this.dispatch(R,N,Q)}else{return this.dispatch(R,Q,N)}},getTreeBaseSize:function(M,N,J){var K=this.getSize(M,true),I=0,L=this;if(J(N,M)){return K}if(N===0){return 0}Graph.Util.eachSubnode(M,function(O){I+=L.getTreeBaseSize(O,N-1,J)});return(K>I?K:I)+this.config.subtreeOffset},getEdge:function(I,N,Q){var M=function(S,R){return function(){return I.pos.add(new Complex(S,R))}};var L=this.node;var O=this.node.overridable,J=I.data;var P=O&&J.$width||L.width;var K=O&&J.$height||L.height;if(N=="begin"){if(L.align=="center"){return this.dispatch(Q,M(0,K/2),M(-P/2,0),M(0,-K/2),M(P/2,0))}else{if(L.align=="left"){return this.dispatch(Q,M(0,K),M(0,0),M(0,0),M(P,0))}else{if(L.align=="right"){return this.dispatch(Q,M(0,0),M(-P,0),M(0,-K),M(0,0))}else{throw"align: not implemented"}}}}else{if(N=="end"){if(L.align=="center"){return this.dispatch(Q,M(0,-K/2),M(P/2,0),M(0,K/2),M(-P/2,0))}else{if(L.align=="left"){return this.dispatch(Q,M(0,0),M(P,0),M(0,K),M(0,0))}else{if(L.align=="right"){return this.dispatch(Q,M(0,-K),M(0,0),M(0,0),M(-P,0))}else{throw"align: not implemented"}}}}}},getScaledTreePosition:function(I,J){var L=this.node;var O=this.node.overridable,K=I.data;var P=(O&&K.$width||L.width);var M=(O&&K.$height||L.height);var Q=(this.config.multitree&&("$orn" in I.data)&&I.data.$orn)||this.config.orientation;var N=function(S,R){return function(){return I.pos.add(new Complex(S,R)).$scale(1-J)}};if(L.align=="left"){return this.dispatch(Q,N(0,M),N(0,0),N(0,0),N(P,0))}else{if(L.align=="center"){return this.dispatch(Q,N(0,M/2),N(-P/2,0),N(0,-M/2),N(P/2,0))}else{if(L.align=="right"){return this.dispatch(Q,N(0,0),N(-P,0),N(0,-M),N(0,0))}else{throw"align: not implemented"}}}},treeFitsInCanvas:function(N,I,O){var K=I.getSize(N);var L=(this.config.multitree&&("$orn" in N.data)&&N.data.$orn)||this.config.orientation;var J=this.dispatch(L,K.width,K.height);var M=this.getTreeBaseSize(N,O,function(Q,P){return Q===0||!Graph.Util.anySubnode(P)});return(M<J)},setRightLevelToShow:function(K,I){var L=this.getRightLevelToShow(K,I),J=this.viz.fx;Graph.Util.eachLevel(K,0,this.config.levelsToShow,function(N){var M=N._depth-K._depth;if(M>L){N.drawn=false;N.exist=false;J.hideLabel(N,false)}else{N.exist=true}});K.drawn=true},getRightLevelToShow:function(L,J){var I=this.config;var M=I.levelsToShow;var K=I.constrained;if(!K){return M}while(!this.treeFitsInCanvas(L,J,M)&&M>1){M--}return M}});ST.Plot=new o({Implements:Graph.Plot,initialize:function(I){this.viz=I;this.config=I.config;this.node=this.config.Node;this.edge=this.config.Edge;this.animation=new Animation;this.nodeTypes=new ST.Plot.NodeTypes;this.edgeTypes=new ST.Plot.EdgeTypes},plotSubtree:function(N,M,P,K){var I=this.viz,L=I.canvas;P=Math.min(Math.max(0.001,P),1);if(P>=0){N.drawn=false;var J=L.getCtx();var O=I.geom.getScaledTreePosition(N,P);J.translate(O.x,O.y);J.scale(P,P)}this.plotTree(N,!P,M,K);if(P>=0){N.drawn=true}},plotTree:function(L,M,I,S){var O=this,Q=this.viz,J=Q.canvas,K=this.config,R=J.getCtx();var P=K.multitree&&!("$orn" in L.data);var N=P&&L.data.$orns;Graph.Util.eachSubnode(L,function(U){if((!P||N.indexOf(U.data.$orn)>0)&&U.exist&&U.drawn){var T=L.getAdjacency(U.id);!S&&I.onBeforePlotLine(T);R.globalAlpha=Math.min(L.alpha,U.alpha);O.plotLine(T,J,S);!S&&I.onAfterPlotLine(T);O.plotTree(U,M,I,S)}});if(L.drawn){R.globalAlpha=L.alpha;!S&&I.onBeforePlotNode(L);this.plotNode(L,J,S);!S&&I.onAfterPlotNode(L);if(M&&R.globalAlpha>=0.95){this.plotLabel(J,L,I)}else{this.hideLabel(L,false)}}else{this.hideLabel(L,true)}},placeLabel:function(T,L,O){var R=L.pos.getc(true),M=this.node,J=this.viz.canvas;var S=M.overridable&&L.data.$width||M.width;var N=M.overridable&&L.data.$height||M.height;var P=J.getSize();var K,Q;if(M.align=="center"){K={x:Math.round(R.x-S/2+P.width/2),y:Math.round(R.y-N/2+P.height/2)}}else{if(M.align=="left"){Q=this.config.orientation;if(Q=="bottom"||Q=="top"){K={x:Math.round(R.x-S/2+P.width/2),y:Math.round(R.y+P.height/2)}}else{K={x:Math.round(R.x+P.width/2),y:Math.round(R.y-N/2+P.height/2)}}}else{if(M.align=="right"){Q=this.config.orientation;if(Q=="bottom"||Q=="top"){K={x:Math.round(R.x-S/2+P.width/2),y:Math.round(R.y-N+P.height/2)}}else{K={x:Math.round(R.x-S+P.width/2),y:Math.round(R.y-N/2+P.height/2)}}}else{throw"align: not implemented"}}}var I=T.style;I.left=K.x+"px";I.top=K.y+"px";I.display=this.fitsInCanvas(K,J)?"":"none";O.onPlaceLabel(T,L)},getAlignedPos:function(N,L,I){var K=this.node;var M,J;if(K.align=="center"){M={x:N.x-L/2,y:N.y-I/2}}else{if(K.align=="left"){J=this.config.orientation;if(J=="bottom"||J=="top"){M={x:N.x-L/2,y:N.y}}else{M={x:N.x,y:N.y-I/2}}}else{if(K.align=="right"){J=this.config.orientation;if(J=="bottom"||J=="top"){M={x:N.x-L/2,y:N.y-I}}else{M={x:N.x-L,y:N.y-I/2}}}else{throw"align: not implemented"}}}return M},getOrientation:function(I){var K=this.config;var J=K.orientation;if(K.multitree){var L=I.nodeFrom;var M=I.nodeTo;J=(("$orn" in L.data)&&L.data.$orn)||(("$orn" in M.data)&&M.data.$orn)}return J}});ST.Plot.NodeTypes=new o({none:function(){},circle:function(M,J){var P=M.pos.getc(true),L=this.node,N=M.data;var K=L.overridable&&N;var O=K&&N.$dim||L.dim;var I=this.getAlignedPos(P,O*2,O*2);J.path("fill",function(Q){Q.arc(I.x+O,I.y+O,O,0,Math.PI*2,true)})},square:function(M,J){var P=M.pos.getc(true),L=this.node,N=M.data;var K=L.overridable&&N;var O=K&&N.$dim||L.dim;var I=this.getAlignedPos(P,O,O);J.getCtx().fillRect(I.x,I.y,O,O)},ellipse:function(K,J){var N=K.pos.getc(true),O=this.node,L=K.data;var M=O.overridable&&L;var I=(M&&L.$width||O.width)/2;var Q=(M&&L.$height||O.height)/2;var P=this.getAlignedPos(N,I*2,Q*2);var R=J.getCtx();R.save();R.scale(I/Q,Q/I);J.path("fill",function(S){S.arc((P.x+I)*(Q/I),(P.y+Q)*(I/Q),Q,0,Math.PI*2,true)});R.restore()},rectangle:function(K,J){var N=K.pos.getc(true),O=this.node,L=K.data;var M=O.overridable&&L;var I=M&&L.$width||O.width;var Q=M&&L.$height||O.height;var P=this.getAlignedPos(N,I,Q);J.getCtx().fillRect(P.x,P.y,I,Q)}});ST.Plot.EdgeTypes=new o({none:function(){},line:function(J,L){var K=this.getOrientation(J);var N=J.nodeFrom,O=J.nodeTo;var M=this.viz.geom.getEdge(N._depth<O._depth?N:O,"begin",K);var I=this.viz.geom.getEdge(N._depth<O._depth?O:N,"end",K);L.path("stroke",function(P){P.moveTo(M.x,M.y);P.lineTo(I.x,I.y)})},"quadratic:begin":function(R,J){var Q=this.getOrientation(R);var M=R.data,I=this.edge;var O=R.nodeFrom,S=R.nodeTo;var K=this.viz.geom.getEdge(O._depth<S._depth?O:S,"begin",Q);var L=this.viz.geom.getEdge(O._depth<S._depth?S:O,"end",Q);var P=I.overridable&&M;var N=P&&M.$dim||I.dim;switch(Q){case"left":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(K.x+N,K.y,L.x,L.y)});break;case"right":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(K.x-N,K.y,L.x,L.y)});break;case"top":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(K.x,K.y+N,L.x,L.y)});break;case"bottom":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(K.x,K.y-N,L.x,L.y)});break}},"quadratic:end":function(R,J){var Q=this.getOrientation(R);var M=R.data,I=this.edge;var O=R.nodeFrom,S=R.nodeTo;var K=this.viz.geom.getEdge(O._depth<S._depth?O:S,"begin",Q);var L=this.viz.geom.getEdge(O._depth<S._depth?S:O,"end",Q);var P=I.overridable&&M;var N=P&&M.$dim||I.dim;switch(Q){case"left":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(L.x-N,L.y,L.x,L.y)});break;case"right":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(L.x+N,L.y,L.x,L.y)});break;case"top":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(L.x,L.y-N,L.x,L.y)});break;case"bottom":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(L.x,L.y+N,L.x,L.y)});break}},bezier:function(R,J){var M=R.data,I=this.edge;var Q=this.getOrientation(R);var O=R.nodeFrom,S=R.nodeTo;var K=this.viz.geom.getEdge(O._depth<S._depth?O:S,"begin",Q);var L=this.viz.geom.getEdge(O._depth<S._depth?S:O,"end",Q);var P=I.overridable&&M;var N=P&&M.$dim||I.dim;switch(Q){case"left":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.bezierCurveTo(K.x+N,K.y,L.x-N,L.y,L.x,L.y)});break;case"right":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.bezierCurveTo(K.x-N,K.y,L.x+N,L.y,L.x,L.y)});break;case"top":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.bezierCurveTo(K.x,K.y+N,L.x,L.y-N,L.x,L.y)});break;case"bottom":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.bezierCurveTo(K.x,K.y-N,L.x,L.y+N,L.x,L.y)});break}},arrow:function(Q,L){var W=this.getOrientation(Q);var U=Q.nodeFrom,M=Q.nodeTo;var Z=Q.data,P=this.edge;var R=P.overridable&&Z;var O=R&&Z.$dim||P.dim;if(R&&Z.$direction&&Z.$direction.length>1){var K={};K[U.id]=U;K[M.id]=M;var V=Z.$direction;U=K[V[0]];M=K[V[1]]}var N=this.viz.geom.getEdge(U,"begin",W);var S=this.viz.geom.getEdge(M,"end",W);var T=new Complex(S.x-N.x,S.y-N.y);T.$scale(O/T.norm());var X=new Complex(S.x-T.x,S.y-T.y);var Y=new Complex(-T.y/2,T.x/2);var J=X.add(Y),I=X.$add(Y.$scale(-1));L.path("stroke",function(aa){aa.moveTo(N.x,N.y);aa.lineTo(S.x,S.y)});L.path("fill",function(aa){aa.moveTo(J.x,J.y);aa.lineTo(I.x,I.y);aa.lineTo(S.x,S.y)})}})})();var AngularWidth={setAngularWidthForNodes:function(){var x=this.config.Node;var z=x.overridable;var y=x.dim;Graph.Util.eachBFS(this.graph,this.root,function(C,A){var B=(z&&C.data&&C.data.$aw)||y;C._angularWidth=B/A},"ignore")},setSubtreesAngularWidth:function(){var x=this;Graph.Util.eachNode(this.graph,function(y){x.setSubtreeAngularWidth(y)},"ignore")},setSubtreeAngularWidth:function(A){var z=this,y=A._angularWidth,x=0;Graph.Util.eachSubnode(A,function(B){z.setSubtreeAngularWidth(B);x+=B._treeAngularWidth},"ignore");A._treeAngularWidth=Math.max(y,x)},computeAngularWidths:function(){this.setAngularWidthForNodes();this.setSubtreesAngularWidth()}};this.RGraph=new o({Implements:[Loader,AngularWidth],initialize:function(A,x){var z={labelContainer:A.id+"-label",interpolation:"linear",levelDistance:100,withLabels:true,Node:{overridable:false,type:"circle",dim:3,color:"#ccb",width:5,height:5,lineWidth:1},Edge:{overridable:false,type:"line",color:"#ccb",lineWidth:1},fps:40,duration:2500,transition:Trans.Quart.easeInOut,clearCanvas:true};var y={onBeforeCompute:b,onAfterCompute:b,onCreateLabel:b,onPlaceLabel:b,onComplete:b,onBeforePlotLine:b,onAfterPlotLine:b,onBeforePlotNode:b,onAfterPlotNode:b};this.controller=this.config=r(z,y,x);this.graphOptions={complex:false,Node:{selected:false,exist:true,drawn:true}};this.graph=new Graph(this.graphOptions);this.fx=new RGraph.Plot(this);this.op=new RGraph.Op(this);this.json=null;this.canvas=A;this.root=null;this.busy=false;this.parent=false},refresh:function(){this.compute();this.plot()},reposition:function(){this.compute("endPos")},plot:function(){this.fx.plot()},compute:function(y){var z=y||["pos","startPos","endPos"];var x=this.graph.getNode(this.root);x._depth=0;Graph.Util.computeLevels(this.graph,this.root,0,"ignore");this.computeAngularWidths();this.computePositions(z)},computePositions:function(E){var y=j(E);var D=this.graph;var C=Graph.Util;var x=this.graph.getNode(this.root);var B=this.parent;var z=this.config;for(var A=0;A<y.length;A++){x[y[A]]=l(0,0)}x.angleSpan={begin:0,end:2*Math.PI};x._rel=1;C.eachBFS(this.graph,this.root,function(I){var L=I.angleSpan.end-I.angleSpan.begin;var O=(I._depth+1)*z.levelDistance;var M=I.angleSpan.begin;var N=0,F=[];C.eachSubnode(I,function(Q){N+=Q._treeAngularWidth;F.push(Q)},"ignore");if(B&&B.id==I.id&&F.length>0&&F[0].dist){F.sort(function(R,Q){return(R.dist>=Q.dist)-(R.dist<=Q.dist)})}for(var J=0;J<F.length;J++){var H=F[J];if(!H._flag){H._rel=H._treeAngularWidth/N;var P=H._rel*L;var G=M+P/2;for(var K=0;K<y.length;K++){H[y[K]]=l(G,O)}H.angleSpan={begin:M,end:M+P};M+=P}}},"ignore")},getNodeAndParentAngle:function(E){var z=false;var D=this.graph.getNode(E);var B=Graph.Util.getParents(D);var A=(B.length>0)?B[0]:false;if(A){var x=A.pos.getc(),C=D.pos.getc();var y=x.add(C.scale(-1));z=Math.atan2(y.y,y.x);if(z<0){z+=2*Math.PI}}return{parent:A,theta:z}},tagChildren:function(B,D){if(B.angleSpan){var C=[];Graph.Util.eachAdjacency(B,function(E){C.push(E.nodeTo)},"ignore");var x=C.length;for(var A=0;A<x&&D!=C[A].id;A++){}for(var z=(A+1)%x,y=0;D!=C[z].id;z=(z+1)%x){C[z].dist=y++}}},onClick:function(B,y){if(this.root!=B&&!this.busy){this.busy=true;this.root=B;that=this;this.controller.onBeforeCompute(this.graph.getNode(B));var z=this.getNodeAndParentAngle(B);this.tagChildren(z.parent,B);this.parent=z.parent;this.compute("endPos");var x=z.theta-z.parent.endPos.theta;Graph.Util.eachNode(this.graph,function(C){C.endPos.set(C.endPos.getp().add(l(x,0)))});var A=this.config.interpolation;y=r({onComplete:b},y||{});this.fx.animate(r({hideLabels:true,modes:[A]},y,{onComplete:function(){that.busy=false;y.onComplete()}}))}}});RGraph.Op=new o({Implements:Graph.Op,initialize:function(x){this.viz=x}});RGraph.Plot=new o({Implements:Graph.Plot,initialize:function(x){this.viz=x;this.config=x.config;this.node=x.config.Node;this.edge=x.config.Edge;this.animation=new Animation;this.nodeTypes=new RGraph.Plot.NodeTypes;this.edgeTypes=new RGraph.Plot.EdgeTypes},placeLabel:function(y,C,z){var E=C.pos.getc(true),A=this.viz.canvas;var x=A.getSize();var D={x:Math.round(E.x+x.width/2),y:Math.round(E.y+x.height/2)};var B=y.style;B.left=D.x+"px";B.top=D.y+"px";B.display=this.fitsInCanvas(D,A)?"":"none";z.onPlaceLabel(y,C)}});RGraph.Plot.NodeTypes=new o({none:function(){},circle:function(z,x){var C=z.pos.getc(true),y=this.node,B=z.data;var A=y.overridable&&B&&B.$dim||y.dim;x.path("fill",function(D){D.arc(C.x,C.y,A,0,Math.PI*2,true)})},square:function(A,x){var D=A.pos.getc(true),z=this.node,C=A.data;var B=z.overridable&&C&&C.$dim||z.dim;var y=2*B;x.getCtx().fillRect(D.x-B,D.y-B,y,y)},rectangle:function(B,y){var D=B.pos.getc(true),A=this.node,C=B.data;var z=A.overridable&&C&&C.$width||A.width;var x=A.overridable&&C&&C.$height||A.height;y.getCtx().fillRect(D.x-z/2,D.y-x/2,z,x)},triangle:function(B,y){var F=B.pos.getc(true),G=this.node,C=B.data;var x=G.overridable&&C&&C.$dim||G.dim;var A=F.x,z=F.y-x,I=A-x,H=F.y+x,E=A+x,D=H;y.path("fill",function(J){J.moveTo(A,z);J.lineTo(I,H);J.lineTo(E,D)})},star:function(z,y){var D=z.pos.getc(true),E=this.node,B=z.data;var x=E.overridable&&B&&B.$dim||E.dim;var F=y.getCtx(),C=Math.PI/5;F.save();F.translate(D.x,D.y);F.beginPath();F.moveTo(x,0);for(var A=0;A<9;A++){F.rotate(C);if(A%2==0){F.lineTo((x/0.525731)*0.200811,0)}else{F.lineTo(x,0)}}F.closePath();F.fill();F.restore()}});RGraph.Plot.EdgeTypes=new o({none:function(){},line:function(x,y){var A=x.nodeFrom.pos.getc(true);var z=x.nodeTo.pos.getc(true);y.path("stroke",function(B){B.moveTo(A.x,A.y);B.lineTo(z.x,z.y)})},arrow:function(J,B){var D=J.nodeFrom,A=J.nodeTo;var E=J.data,x=this.edge;var I=x.overridable&&E;var L=I&&E.$dim||14;if(I&&E.$direction&&E.$direction.length>1){var y={};y[D.id]=D;y[A.id]=A;var z=E.$direction;D=y[z[0]];A=y[z[1]]}var N=D.pos.getc(true),C=A.pos.getc(true);var H=new Complex(C.x-N.x,C.y-N.y);H.$scale(L/H.norm());var F=new Complex(C.x-H.x,C.y-H.y);var G=new Complex(-H.y/2,H.x/2);var M=F.add(G),K=F.$add(G.$scale(-1));B.path("stroke",function(O){O.moveTo(N.x,N.y);O.lineTo(C.x,C.y)});B.path("fill",function(O){O.moveTo(M.x,M.y);O.lineTo(K.x,K.y);O.lineTo(C.x,C.y)})}});Complex.prototype.moebiusTransformation=function(z){var x=this.add(z);var y=z.$conjugate().$prod(this);y.x++;return x.$div(y)};Graph.Util.getClosestNodeToOrigin=function(y,z,x){return this.getClosestNodeToPos(y,Polar.KER,z,x)};Graph.Util.getClosestNodeToPos=function(z,C,B,x){var y=null;B=B||"pos";C=C&&C.getc(true)||Complex.KER;var A=function(E,D){var G=E.x-D.x,F=E.y-D.y;return G*G+F*F};this.eachNode(z,function(D){y=(y==null||A(D[B].getc(true),C)<A(y[B].getc(true),C))?D:y},x);return y};Graph.Util.moebiusTransformation=function(z,B,A,y,x){this.eachNode(z,function(D){for(var C=0;C<A.length;C++){var F=B[C].scale(-1),E=y?y:A[C];D[A[C]].set(D[E].getc().moebiusTransformation(F))}},x)};this.Hypertree=new o({Implements:[Loader,AngularWidth],initialize:function(A,x){var z={labelContainer:A.id+"-label",withLabels:true,Node:{overridable:false,type:"circle",dim:7,color:"#ccb",width:5,height:5,lineWidth:1,transform:true},Edge:{overridable:false,type:"hyperline",color:"#ccb",lineWidth:1},clearCanvas:true,fps:40,duration:1500,transition:Trans.Quart.easeInOut};var y={onBeforeCompute:b,onAfterCompute:b,onCreateLabel:b,onPlaceLabel:b,onComplete:b,onBeforePlotLine:b,onAfterPlotLine:b,onBeforePlotNode:b,onAfterPlotNode:b};this.controller=this.config=r(z,y,x);this.graphOptions={complex:false,Node:{selected:false,exist:true,drawn:true}};this.graph=new Graph(this.graphOptions);this.fx=new Hypertree.Plot(this);this.op=new Hypertree.Op(this);this.json=null;this.canvas=A;this.root=null;this.busy=false},refresh:function(x){if(x){this.reposition();Graph.Util.eachNode(this.graph,function(y){y.startPos.rho=y.pos.rho=y.endPos.rho;y.startPos.theta=y.pos.theta=y.endPos.theta})}else{this.compute()}this.plot()},reposition:function(){this.compute("endPos");var x=this.graph.getNode(this.root).pos.getc().scale(-1);Graph.Util.moebiusTransformation(this.graph,[x],["endPos"],"endPos","ignore");Graph.Util.eachNode(this.graph,function(y){if(y.ignore){y.endPos.rho=y.pos.rho;y.endPos.theta=y.pos.theta}})},plot:function(){this.fx.plot()},compute:function(y){var z=y||["pos","startPos"];var x=this.graph.getNode(this.root);x._depth=0;Graph.Util.computeLevels(this.graph,this.root,0,"ignore");this.computeAngularWidths();this.computePositions(z)},computePositions:function(F){var G=j(F);var B=this.graph,D=Graph.Util;var E=this.graph.getNode(this.root),C=this,x=this.config;var H=this.canvas.getSize();var z=Math.min(H.width,H.height)/2;for(var A=0;A<G.length;A++){E[G[A]]=l(0,0)}E.angleSpan={begin:0,end:2*Math.PI};E._rel=1;var y=(function(){var K=0;D.eachNode(B,function(L){K=(L._depth>K)?L._depth:K;L._scale=z},"ignore");for(var J=0.51;J<=1;J+=0.01){var I=(function(L,M){return(1-Math.pow(L,M))/(1-L)})(J,K+1);if(I>=2){return J-0.01}}return 0.5})();D.eachBFS(this.graph,this.root,function(N){var J=N.angleSpan.end-N.angleSpan.begin;var O=N.angleSpan.begin;var M=(function(Q){var R=0;D.eachSubnode(Q,function(S){R+=S._treeAngularWidth},"ignore");return R})(N);for(var L=1,I=0,K=y,P=N._depth;L<=P+1;L++){I+=K;K*=y}D.eachSubnode(N,function(T){if(!T._flag){T._rel=T._treeAngularWidth/M;var S=T._rel*J;var R=O+S/2;for(var Q=0;Q<G.length;Q++){T[G[Q]]=l(R,I)}T.angleSpan={begin:O,end:O+S};O+=S}},"ignore")},"ignore")},onClick:function(z,x){var y=this.graph.getNode(z).pos.getc(true);this.move(y,x)},move:function(C,z){var y=q(C.x,C.y);if(this.busy===false&&y.norm()<1){var B=Graph.Util;this.busy=true;var x=B.getClosestNodeToPos(this.graph,y),A=this;B.computeLevels(this.graph,x.id,0);this.controller.onBeforeCompute(x);if(y.norm()<1){z=r({onComplete:b},z||{});this.fx.animate(r({modes:["moebius"],hideLabels:true},z,{onComplete:function(){A.busy=false;z.onComplete()}}),y)}}}});Hypertree.Op=new o({Implements:Graph.Op,initialize:function(x){this.viz=x}});Hypertree.Plot=new o({Implements:Graph.Plot,initialize:function(x){this.viz=x;this.config=x.config;this.node=this.config.Node;this.edge=this.config.Edge;this.animation=new Animation;this.nodeTypes=new Hypertree.Plot.NodeTypes;this.edgeTypes=new Hypertree.Plot.EdgeTypes},hyperline:function(I,A){var B=I.nodeFrom,z=I.nodeTo,F=I.data;var J=B.pos.getc(),E=z.pos.getc();var D=this.computeArcThroughTwoPoints(J,E);var K=A.getSize();var C=Math.min(K.width,K.height)/2;if(D.a>1000||D.b>1000||D.ratio>1000){A.path("stroke",function(L){L.moveTo(J.x*C,J.y*C);L.lineTo(E.x*C,E.y*C)})}else{var H=Math.atan2(E.y-D.y,E.x-D.x);var G=Math.atan2(J.y-D.y,J.x-D.x);var y=this.sense(H,G);var x=A.getCtx();A.path("stroke",function(L){L.arc(D.x*C,D.y*C,D.ratio*C,H,G,y)})}},computeArcThroughTwoPoints:function(L,K){var D=(L.x*K.y-L.y*K.x),z=D;var C=L.squaredNorm(),B=K.squaredNorm();if(D==0){return{x:0,y:0,ratio:1001}}var J=(L.y*B-K.y*C+L.y-K.y)/D;var H=(K.x*C-L.x*B+K.x-L.x)/z;var I=-J/2;var G=-H/2;var F=(J*J+H*H)/4-1;if(F<0){return{x:0,y:0,ratio:1001}}var E=Math.sqrt(F);var A={x:I,y:G,ratio:E,a:J,b:H};return A},sense:function(x,y){return(x<y)?((x+Math.PI>y)?false:true):((y+Math.PI>x)?true:false)},placeLabel:function(F,A,C){var E=A.pos.getc(true),y=this.viz.canvas;var D=y.getSize();var B=A._scale;var z={x:Math.round(E.x*B+D.width/2),y:Math.round(E.y*B+D.height/2)};var x=F.style;x.left=z.x+"px";x.top=z.y+"px";x.display="";C.onPlaceLabel(F,A)}});Hypertree.Plot.NodeTypes=new o({none:function(){},circle:function(A,y){var z=this.node,C=A.data;var B=z.overridable&&C&&C.$dim||z.dim;var D=A.pos.getc(),E=D.scale(A._scale);var x=z.transform?B*(1-D.squaredNorm()):B;if(x>=B/4){y.path("fill",function(F){F.arc(E.x,E.y,x,0,Math.PI*2,true)})}},square:function(A,z){var F=this.node,C=A.data;var x=F.overridable&&C&&C.$dim||F.dim;var y=A.pos.getc(),E=y.scale(A._scale);var D=F.transform?x*(1-y.squaredNorm()):x;var B=2*D;if(D>=x/4){z.getCtx().fillRect(E.x-D,E.y-D,B,B)}},rectangle:function(A,z){var E=this.node,B=A.data;var y=E.overridable&&B&&B.$width||E.width;var F=E.overridable&&B&&B.$height||E.height;var x=A.pos.getc(),D=x.scale(A._scale);var C=1-x.squaredNorm();y=E.transform?y*C:y;F=E.transform?F*C:F;if(C>=0.25){z.getCtx().fillRect(D.x-y/2,D.y-F/2,y,F)}},triangle:function(C,z){var I=this.node,D=C.data;var x=I.overridable&&D&&D.$dim||I.dim;var y=C.pos.getc(),H=y.scale(C._scale);var G=I.transform?x*(1-y.squaredNorm()):x;if(G>=x/4){var B=H.x,A=H.y-G,K=B-G,J=H.y+G,F=B+G,E=J;z.path("fill",function(L){L.moveTo(B,A);L.lineTo(K,J);L.lineTo(F,E)})}},star:function(A,z){var G=this.node,C=A.data;var x=G.overridable&&C&&C.$dim||G.dim;var y=A.pos.getc(),F=y.scale(A._scale);var E=G.transform?x*(1-y.squaredNorm()):x;if(E>=x/4){var H=z.getCtx(),D=Math.PI/5;H.save();H.translate(F.x,F.y);H.beginPath();H.moveTo(x,0);for(var B=0;B<9;B++){H.rotate(D);if(B%2==0){H.lineTo((E/0.525731)*0.200811,0)}else{H.lineTo(E,0)}}H.closePath();H.fill();H.restore()}}});Hypertree.Plot.EdgeTypes=new o({none:function(){},line:function(x,y){var z=x.nodeFrom._scale;var B=x.nodeFrom.pos.getc(true);var A=x.nodeTo.pos.getc(true);y.path("stroke",function(C){C.moveTo(B.x*z,B.y*z);C.lineTo(A.x*z,A.y*z)})},hyperline:function(x,y){this.hyperline(x,y)}});this.TM={layout:{orientation:"h",vertical:function(){return this.orientation=="v"},horizontal:function(){return this.orientation=="h"},change:function(){this.orientation=this.vertical()?"h":"v"}},innerController:{onBeforeCompute:b,onAfterCompute:b,onComplete:b,onCreateElement:b,onDestroyElement:b,request:false},config:{orientation:"h",titleHeight:13,rootId:"infovis",offset:4,levelsToShow:3,addLeftClickHandler:false,addRightClickHandler:false,selectPathOnHover:false,Color:{allow:false,minValue:-100,maxValue:100,minColorValue:[255,0,50],maxColorValue:[0,255,50]},Tips:{allow:false,offsetX:20,offsetY:20,onShow:b}},initialize:function(x){this.tree=null;this.shownTree=null;this.controller=this.config=r(this.config,this.innerController,x);this.rootId=this.config.rootId;this.layout.orientation=this.config.orientation;if(this.config.Tips.allow&&document.body){var B=document.getElementById("_tooltip")||document.createElement("div");B.id="_tooltip";B.className="tip";var z=B.style;z.position="absolute";z.display="none";z.zIndex=13000;document.body.appendChild(B);this.tip=B}var A=this;var y=function(){A.empty();if(window.CollectGarbage){window.CollectGarbage()}delete y};if(window.addEventListener){window.addEventListener("unload",y,false)}else{window.attachEvent("onunload",y)}},each:function(x){(function y(D){if(!D){return}var C=D.childNodes,z=C.length;if(z>0){x.apply(this,[D,z===1,C[0],C[1]])}if(z>1){for(var A=C[1].childNodes,B=0;B<A.length;B++){y(A[B])}}})(e(this.rootId).firstChild)},toStyle:function(z){var x="";for(var y in z){x+=y+":"+z[y]+";"}return x},leaf:function(x){return x.children==0},createBox:function(y,A,x){var z;if(!this.leaf(y)){z=this.headBox(y,A)+this.bodyBox(x,A)}else{z=this.leafBox(y,A)}return this.contentBox(y,A,z)},plot:function(B){var D=B.coord,A="";if(this.leaf(B)){return this.createBox(B,D,null)}for(var z=0,C=B.children;z<C.length;z++){var y=C[z],x=y.coord;if(x.width*x.height>1){A+=this.plot(y)}}return this.createBox(B,D,A)},headBox:function(y,B){var x=this.config,A=x.offset;var z={height:x.titleHeight+"px",width:(B.width-A)+"px",left:A/2+"px"};return'<div class="head" style="'+this.toStyle(z)+'">'+y.name+"</div>"},bodyBox:function(y,C){var x=this.config,z=x.titleHeight,B=x.offset;var A={width:(C.width-B)+"px",height:(C.height-B-z)+"px",top:(z+B/2)+"px",left:(B/2)+"px"};return'<div class="body" style="'+this.toStyle(A)+'">'+y+"</div>"},contentBox:function(z,B,y){var A={};for(var x in B){A[x]=B[x]+"px"}return'<div class="content" style="'+this.toStyle(A)+'" id="'+z.id+'">'+y+"</div>"},leafBox:function(A,E){var z=this.config;var y=z.Color.allow&&this.setColor(A),D=z.offset,B=E.width-D,x=E.height-D;var C={top:(D/2)+"px",height:x+"px",width:B+"px",left:(D/2)+"px"};if(y){C["background-color"]=y}return'<div class="leaf" style="'+this.toStyle(C)+'">'+A.name+"</div>"},setColor:function(F){var A=this.config.Color,B=A.maxColorValue,y=A.minColorValue,C=A.maxValue,G=A.minValue,E=C-G,D=(F.data.$color-0);var z=function(I,H){return Math.round((((B[I]-y[I])/E)*(H-G)+y[I]))};return d([z(0,D),z(1,D),z(2,D)])},enter:function(x){this.view(x.parentNode.id)},onLeftClick:function(x){this.enter(x)},out:function(){var x=TreeUtil.getParent(this.tree,this.shownTree.id);if(x){if(this.controller.request){TreeUtil.prune(x,this.config.levelsToShow)}this.view(x.id)}},onRightClick:function(){this.out()},view:function(B){var x=this.config,z=this;var y={onComplete:function(){z.loadTree(B);e(x.rootId).focus()}};if(this.controller.request){var A=TreeUtil;A.loadSubtrees(A.getSubtree(this.tree,B),r(this.controller,y))}else{y.onComplete()}},resetPath:function(x){var y=this.rootId,B=this.resetPath.previous;this.resetPath.previous=x||false;function z(D){var C=D.parentNode;return C&&(C.id!=y)&&C}function A(F,C){if(F){var D=e(F.id);if(D){var E=z(D);while(E){F=E.childNodes[0];if(s(F,"in-path")){if(C==undefined||!!C){a(F,"in-path")}}else{if(!C){p(F,"in-path")}}E=z(E)}}}}A(B,true);A(x,false)},initializeElements:function(){var x=this.controller,z=this;var y=m(false),A=x.Tips.allow;this.each(function(F,E,D,C){var B=TreeUtil.getSubtree(z.tree,F.id);x.onCreateElement(F,B,E,D,C);if(x.addRightClickHandler){D.oncontextmenu=y}if(x.addLeftClickHandler||x.addRightClickHandler){t(D,"mouseup",function(G){var H=(G.which==3||G.button==2);if(H){if(x.addRightClickHandler){z.onRightClick()}}else{if(x.addLeftClickHandler){z.onLeftClick(D)}}if(G.preventDefault){G.preventDefault()}else{G.returnValue=false}})}if(x.selectPathOnHover||A){t(D,"mouseover",function(G){if(x.selectPathOnHover){if(E){p(D,"over-leaf")}else{p(D,"over-head");p(F,"over-content")}if(F.id){z.resetPath(B)}}if(A){x.Tips.onShow(z.tip,B,E,D)}});t(D,"mouseout",function(G){if(x.selectPathOnHover){if(E){a(D,"over-leaf")}else{a(D,"over-head");a(F,"over-content")}z.resetPath()}if(A){z.tip.style.display="none"}});if(A){t(D,"mousemove",function(J,I){var O=z.tip;I=I||window;J=J||I.event;var N=I.document;N=N.html||N.body;var K={x:J.pageX||J.clientX+N.scrollLeft,y:J.pageY||J.clientY+N.scrollTop};O.style.display="";I={height:document.body.clientHeight,width:document.body.clientWidth};var H={width:O.offsetWidth,height:O.offsetHeight};var G=O.style,M=x.Tips.offsetX,L=x.Tips.offsetY;G.top=((K.y+L+H.height>I.height)?(K.y-H.height-L):K.y+L)+"px";G.left=((K.x+H.width+M>I.width)?(K.x-H.width-M):K.x+M)+"px"})}}})},destroyElements:function(){if(this.controller.onDestroyElement!=b){var x=this.controller,y=this;this.each(function(C,B,A,z){x.onDestroyElement(C,TreeUtil.getSubtree(y.tree,C.id),B,A,z)})}},empty:function(){this.destroyElements();f(e(this.rootId))},loadTree:function(x){this.empty();this.loadJSON(TreeUtil.getSubtree(this.tree,x))}};TM.SliceAndDice=new o({Implements:TM,loadJSON:function(A){this.controller.onBeforeCompute(A);var y=e(this.rootId),z=this.config,B=y.offsetWidth,x=y.offsetHeight;var C={coord:{top:0,left:0,width:B,height:x+z.titleHeight+z.offset}};if(this.tree==null){this.tree=A}this.shownTree=A;this.compute(C,A,this.layout.orientation);y.innerHTML=this.plot(A);this.initializeElements();this.controller.onAfterCompute(A)},compute:function(D,M,B){var O=this.config,I=D.coord,L=O.offset,H=I.width-L,F=I.height-L-O.titleHeight,y=D.data,x=(y&&("$area" in y))?M.data.$area/y.$area:1;var G,E,K,C,A;var N=(B=="h");if(N){B="v";G=F;E=Math.round(H*x);K="height";C="top";A="left"}else{B="h";G=Math.round(F*x);E=H;K="width";C="left";A="top"}M.coord={width:E,height:G,top:0,left:0};var J=0,z=this;g(M.children,function(P){z.compute(M,P,B);P.coord[C]=J;P.coord[A]=0;J+=Math.floor(P.coord[K])})}});TM.Area=new o({loadJSON:function(z){this.controller.onBeforeCompute(z);var y=e(this.rootId),A=y.offsetWidth,x=y.offsetHeight,E=this.config.offset,C=A-E,B=x-E-this.config.titleHeight;z.coord={height:x,width:A,top:0,left:0};var D=r(z.coord,{width:C,height:B});this.compute(z,D);y.innerHTML=this.plot(z);if(this.tree==null){this.tree=z}this.shownTree=z;this.initializeElements();this.controller.onAfterCompute(z)},computeDim:function(A,E,y,D,z){if(A.length+E.length==1){var x=(A.length==1)?A:E;this.layoutLast(x,y,D);return}if(A.length>=2&&E.length==0){E=[A[0]];A=A.slice(1)}if(A.length==0){if(E.length>0){this.layoutRow(E,y,D)}return}var C=A[0];if(z(E,y)>=z([C].concat(E),y)){this.computeDim(A.slice(1),E.concat([C]),y,D,z)}else{var B=this.layoutRow(E,y,D);this.computeDim(A,[],B.dim,B,z)}},worstAspectRatio:function(x,E){if(!x||x.length==0){return Number.MAX_VALUE}var y=0,F=0,B=Number.MAX_VALUE;for(var C=0;C<x.length;C++){var z=x[C]._area;y+=z;B=(B<z)?B:z;F=(F>z)?F:z}var D=E*E,A=y*y;return Math.max(D*F/A,A/(D*B))},avgAspectRatio:function(A,x){if(!A||A.length==0){return Number.MAX_VALUE}var C=0;for(var y=0;y<A.length;y++){var B=A[y]._area;var z=B/x;C+=(x>z)?x/z:z/x}return C/A.length},layoutLast:function(y,x,z){y[0].coord=z}});TM.Squarified=new o({Implements:[TM,TM.Area],compute:function(F,C){if(!(C.width>=C.height&&this.layout.horizontal())){this.layout.change()}var x=F.children,z=this.config;if(x.length>0){this.processChildrenLayout(F,x,C);for(var B=0;B<x.length;B++){var A=x[B].coord,D=z.offset,E=A.height-(z.titleHeight+D),y=A.width-D;C={width:y,height:E,top:0,left:0};this.compute(x[B],C)}}},processChildrenLayout:function(F,x,B){var y=B.width*B.height;var A,C=0,G=[];for(A=0;A<x.length;A++){G[A]=parseFloat(x[A].data.$area);C+=G[A]}for(A=0;A<G.length;A++){x[A]._area=y*G[A]/C}var z=(this.layout.horizontal())?B.height:B.width;x.sort(function(I,H){return(I._area<=H._area)-(I._area>=H._area)});var E=[x[0]];var D=x.slice(1);this.squarify(D,E,z,B)},squarify:function(y,A,x,z){this.computeDim(y,A,x,z,this.worstAspectRatio)},layoutRow:function(y,x,z){if(this.layout.horizontal()){return this.layoutV(y,x,z)}else{return this.layoutH(y,x,z)}},layoutV:function(x,F,C){var G=0,z=Math.round;g(x,function(H){G+=H._area});var y=z(G/F),D=0;for(var A=0;A<x.length;A++){var B=z(x[A]._area/y);x[A].coord={height:B,width:y,top:C.top+D,left:C.left};D+=B}var E={height:C.height,width:C.width-y,top:C.top,left:C.left+y};E.dim=Math.min(E.width,E.height);if(E.dim!=E.height){this.layout.change()}return E},layoutH:function(x,E,B){var G=0,y=Math.round;g(x,function(H){G+=H._area});var F=y(G/E),C=B.top,z=0;for(var A=0;A<x.length;A++){x[A].coord={height:F,width:y(x[A]._area/F),top:C,left:B.left+z};z+=x[A].coord.width}var D={height:B.height-F,width:B.width,top:B.top+F,left:B.left};D.dim=Math.min(D.width,D.height);if(D.dim!=D.width){this.layout.change()}return D}});TM.Strip=new o({Implements:[TM,TM.Area],compute:function(F,C){var x=F.children,z=this.config;if(x.length>0){this.processChildrenLayout(F,x,C);for(var B=0;B<x.length;B++){var A=x[B].coord,D=z.offset,E=A.height-(z.titleHeight+D),y=A.width-D;C={width:y,height:E,top:0,left:0};this.compute(x[B],C)}}},processChildrenLayout:function(A,z,E){var B=E.width*E.height;var C=parseFloat(A.data.$area);g(z,function(F){F._area=B*parseFloat(F.data.$area)/C});var y=(this.layout.horizontal())?E.width:E.height;var D=[z[0]];var x=z.slice(1);this.stripify(x,D,y,E)},stripify:function(y,A,x,z){this.computeDim(y,A,x,z,this.avgAspectRatio)},layoutRow:function(y,x,z){if(this.layout.horizontal()){return this.layoutH(y,x,z)}else{return this.layoutV(y,x,z)}},layoutV:function(x,F,C){var G=0,z=function(H){return H};g(x,function(H){G+=H._area});var y=z(G/F),D=0;for(var A=0;A<x.length;A++){var B=z(x[A]._area/y);x[A].coord={height:B,width:y,top:C.top+(F-B-D),left:C.left};D+=B}var E={height:C.height,width:C.width-y,top:C.top,left:C.left+y,dim:F};return E},layoutH:function(x,E,B){var G=0,y=function(H){return H};g(x,function(H){G+=H._area});var F=y(G/E),C=B.height-F,z=0;for(var A=0;A<x.length;A++){x[A].coord={height:F,width:y(x[A]._area/F),top:C,left:B.left+z};z+=x[A].coord.width}var D={height:B.height-F,width:B.width,top:B.top,left:B.left,dim:E};return D}})})();/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.8.0r4
*/
if(typeof YAHOO=="undefined"||!YAHOO){var YAHOO={};}YAHOO.namespace=function(){var A=arguments,E=null,C,B,D;for(C=0;C<A.length;C=C+1){D=(""+A[C]).split(".");E=YAHOO;for(B=(D[0]=="YAHOO")?1:0;B<D.length;B=B+1){E[D[B]]=E[D[B]]||{};E=E[D[B]];}}return E;};YAHOO.log=function(D,A,C){var B=YAHOO.widget.Logger;if(B&&B.log){return B.log(D,A,C);}else{return false;}};YAHOO.register=function(A,E,D){var I=YAHOO.env.modules,B,H,G,F,C;if(!I[A]){I[A]={versions:[],builds:[]};}B=I[A];H=D.version;G=D.build;F=YAHOO.env.listeners;B.name=A;B.version=H;B.build=G;B.versions.push(H);B.builds.push(G);B.mainClass=E;for(C=0;C<F.length;C=C+1){F[C](B);}if(E){E.VERSION=H;E.BUILD=G;}else{YAHOO.log("mainClass is undefined for module "+A,"warn");}};YAHOO.env=YAHOO.env||{modules:[],listeners:[]};YAHOO.env.getVersion=function(A){return YAHOO.env.modules[A]||null;};YAHOO.env.ua=function(){var D=function(H){var I=0;return parseFloat(H.replace(/\./g,function(){return(I++==1)?"":".";}));},G=navigator,F={ie:0,opera:0,gecko:0,webkit:0,mobile:null,air:0,caja:G.cajaVersion,secure:false,os:null},C=navigator&&navigator.userAgent,E=window&&window.location,B=E&&E.href,A;F.secure=B&&(B.toLowerCase().indexOf("https")===0);if(C){if((/windows|win32/i).test(C)){F.os="windows";}else{if((/macintosh/i).test(C)){F.os="macintosh";}}if((/KHTML/).test(C)){F.webkit=1;}A=C.match(/AppleWebKit\/([^\s]*)/);if(A&&A[1]){F.webkit=D(A[1]);if(/ Mobile\//.test(C)){F.mobile="Apple";}else{A=C.match(/NokiaN[^\/]*/);if(A){F.mobile=A[0];}}A=C.match(/AdobeAIR\/([^\s]*)/);if(A){F.air=A[0];}}if(!F.webkit){A=C.match(/Opera[\s\/]([^\s]*)/);if(A&&A[1]){F.opera=D(A[1]);A=C.match(/Opera Mini[^;]*/);if(A){F.mobile=A[0];}}else{A=C.match(/MSIE\s([^;]*)/);if(A&&A[1]){F.ie=D(A[1]);}else{A=C.match(/Gecko\/([^\s]*)/);if(A){F.gecko=1;A=C.match(/rv:([^\s\)]*)/);if(A&&A[1]){F.gecko=D(A[1]);}}}}}}return F;}();(function(){YAHOO.namespace("util","widget","example");if("undefined"!==typeof YAHOO_config){var B=YAHOO_config.listener,A=YAHOO.env.listeners,D=true,C;if(B){for(C=0;C<A.length;C++){if(A[C]==B){D=false;break;}}if(D){A.push(B);}}}})();YAHOO.lang=YAHOO.lang||{};(function(){var B=YAHOO.lang,A=Object.prototype,H="[object Array]",C="[object Function]",G="[object Object]",E=[],F=["toString","valueOf"],D={isArray:function(I){return A.toString.apply(I)===H;},isBoolean:function(I){return typeof I==="boolean";},isFunction:function(I){return(typeof I==="function")||A.toString.apply(I)===C;},isNull:function(I){return I===null;},isNumber:function(I){return typeof I==="number"&&isFinite(I);},isObject:function(I){return(I&&(typeof I==="object"||B.isFunction(I)))||false;},isString:function(I){return typeof I==="string";},isUndefined:function(I){return typeof I==="undefined";},_IEEnumFix:(YAHOO.env.ua.ie)?function(K,J){var I,M,L;for(I=0;I<F.length;I=I+1){M=F[I];L=J[M];if(B.isFunction(L)&&L!=A[M]){K[M]=L;}}}:function(){},extend:function(L,M,K){if(!M||!L){throw new Error("extend failed, please check that "+"all dependencies are included.");}var J=function(){},I;J.prototype=M.prototype;L.prototype=new J();L.prototype.constructor=L;L.superclass=M.prototype;if(M.prototype.constructor==A.constructor){M.prototype.constructor=M;}if(K){for(I in K){if(B.hasOwnProperty(K,I)){L.prototype[I]=K[I];}}B._IEEnumFix(L.prototype,K);}},augmentObject:function(M,L){if(!L||!M){throw new Error("Absorb failed, verify dependencies.");}var I=arguments,K,N,J=I[2];if(J&&J!==true){for(K=2;K<I.length;K=K+1){M[I[K]]=L[I[K]];}}else{for(N in L){if(J||!(N in M)){M[N]=L[N];}}B._IEEnumFix(M,L);}},augmentProto:function(L,K){if(!K||!L){throw new Error("Augment failed, verify dependencies.");}var I=[L.prototype,K.prototype],J;for(J=2;J<arguments.length;J=J+1){I.push(arguments[J]);}B.augmentObject.apply(this,I);},dump:function(I,N){var K,M,P=[],Q="{...}",J="f(){...}",O=", ",L=" => ";if(!B.isObject(I)){return I+"";}else{if(I instanceof Date||("nodeType" in I&&"tagName" in I)){return I;}else{if(B.isFunction(I)){return J;}}}N=(B.isNumber(N))?N:3;if(B.isArray(I)){P.push("[");for(K=0,M=I.length;K<M;K=K+1){if(B.isObject(I[K])){P.push((N>0)?B.dump(I[K],N-1):Q);}else{P.push(I[K]);}P.push(O);}if(P.length>1){P.pop();}P.push("]");}else{P.push("{");for(K in I){if(B.hasOwnProperty(I,K)){P.push(K+L);if(B.isObject(I[K])){P.push((N>0)?B.dump(I[K],N-1):Q);}else{P.push(I[K]);}P.push(O);}}if(P.length>1){P.pop();}P.push("}");}return P.join("");},substitute:function(Y,J,R){var N,M,L,U,V,X,T=[],K,O="dump",S=" ",I="{",W="}",Q,P;for(;;){N=Y.lastIndexOf(I);if(N<0){break;}M=Y.indexOf(W,N);if(N+1>=M){break;}K=Y.substring(N+1,M);U=K;X=null;L=U.indexOf(S);if(L>-1){X=U.substring(L+1);U=U.substring(0,L);}V=J[U];if(R){V=R(U,V,X);}if(B.isObject(V)){if(B.isArray(V)){V=B.dump(V,parseInt(X,10));}else{X=X||"";Q=X.indexOf(O);if(Q>-1){X=X.substring(4);}P=V.toString();if(P===G||Q>-1){V=B.dump(V,parseInt(X,10));}else{V=P;}}}else{if(!B.isString(V)&&!B.isNumber(V)){V="~-"+T.length+"-~";T[T.length]=K;}}Y=Y.substring(0,N)+V+Y.substring(M+1);}for(N=T.length-1;N>=0;N=N-1){Y=Y.replace(new RegExp("~-"+N+"-~"),"{"+T[N]+"}","g");}return Y;},trim:function(I){try{return I.replace(/^\s+|\s+$/g,"");}catch(J){return I;}},merge:function(){var L={},J=arguments,I=J.length,K;for(K=0;K<I;K=K+1){B.augmentObject(L,J[K],true);}return L;},later:function(P,J,Q,L,M){P=P||0;J=J||{};var K=Q,O=L,N,I;if(B.isString(Q)){K=J[Q];}if(!K){throw new TypeError("method undefined");}if(O&&!B.isArray(O)){O=[L];}N=function(){K.apply(J,O||E);};I=(M)?setInterval(N,P):setTimeout(N,P);return{interval:M,cancel:function(){if(this.interval){clearInterval(I);}else{clearTimeout(I);}}};},isValue:function(I){return(B.isObject(I)||B.isString(I)||B.isNumber(I)||B.isBoolean(I));}};B.hasOwnProperty=(A.hasOwnProperty)?function(I,J){return I&&I.hasOwnProperty(J);}:function(I,J){return !B.isUndefined(I[J])&&I.constructor.prototype[J]!==I[J];};D.augmentObject(B,D,true);YAHOO.util.Lang=B;B.augment=B.augmentProto;YAHOO.augment=B.augmentProto;YAHOO.extend=B.extend;})();YAHOO.register("yahoo",YAHOO,{version:"2.8.0r4",build:"2449"});
(function(){YAHOO.env._id_counter=YAHOO.env._id_counter||0;var E=YAHOO.util,L=YAHOO.lang,m=YAHOO.env.ua,A=YAHOO.lang.trim,d={},h={},N=/^t(?:able|d|h)$/i,X=/color$/i,K=window.document,W=K.documentElement,e="ownerDocument",n="defaultView",v="documentElement",t="compatMode",b="offsetLeft",P="offsetTop",u="offsetParent",Z="parentNode",l="nodeType",C="tagName",O="scrollLeft",i="scrollTop",Q="getBoundingClientRect",w="getComputedStyle",a="currentStyle",M="CSS1Compat",c="BackCompat",g="class",F="className",J="",B=" ",s="(?:^|\\s)",k="(?= |$)",U="g",p="position",f="fixed",V="relative",j="left",o="top",r="medium",q="borderLeftWidth",R="borderTopWidth",D=m.opera,I=m.webkit,H=m.gecko,T=m.ie;E.Dom={CUSTOM_ATTRIBUTES:(!W.hasAttribute)?{"for":"htmlFor","class":F}:{"htmlFor":"for","className":g},DOT_ATTRIBUTES:{},get:function(z){var AB,x,AA,y,Y,G;if(z){if(z[l]||z.item){return z;}if(typeof z==="string"){AB=z;z=K.getElementById(z);G=(z)?z.attributes:null;if(z&&G&&G.id&&G.id.value===AB){return z;}else{if(z&&K.all){z=null;x=K.all[AB];for(y=0,Y=x.length;y<Y;++y){if(x[y].id===AB){return x[y];}}}}return z;}if(YAHOO.util.Element&&z instanceof YAHOO.util.Element){z=z.get("element");}if("length" in z){AA=[];for(y=0,Y=z.length;y<Y;++y){AA[AA.length]=E.Dom.get(z[y]);}return AA;}return z;}return null;},getComputedStyle:function(G,Y){if(window[w]){return G[e][n][w](G,null)[Y];}else{if(G[a]){return E.Dom.IE_ComputedStyle.get(G,Y);}}},getStyle:function(G,Y){return E.Dom.batch(G,E.Dom._getStyle,Y);},_getStyle:function(){if(window[w]){return function(G,y){y=(y==="float")?y="cssFloat":E.Dom._toCamel(y);var x=G.style[y],Y;if(!x){Y=G[e][n][w](G,null);if(Y){x=Y[y];}}return x;};}else{if(W[a]){return function(G,y){var x;switch(y){case"opacity":x=100;try{x=G.filters["DXImageTransform.Microsoft.Alpha"].opacity;}catch(z){try{x=G.filters("alpha").opacity;}catch(Y){}}return x/100;case"float":y="styleFloat";default:y=E.Dom._toCamel(y);x=G[a]?G[a][y]:null;return(G.style[y]||x);}};}}}(),setStyle:function(G,Y,x){E.Dom.batch(G,E.Dom._setStyle,{prop:Y,val:x});},_setStyle:function(){if(T){return function(Y,G){var x=E.Dom._toCamel(G.prop),y=G.val;if(Y){switch(x){case"opacity":if(L.isString(Y.style.filter)){Y.style.filter="alpha(opacity="+y*100+")";if(!Y[a]||!Y[a].hasLayout){Y.style.zoom=1;}}break;case"float":x="styleFloat";default:Y.style[x]=y;}}else{}};}else{return function(Y,G){var x=E.Dom._toCamel(G.prop),y=G.val;if(Y){if(x=="float"){x="cssFloat";}Y.style[x]=y;}else{}};}}(),getXY:function(G){return E.Dom.batch(G,E.Dom._getXY);},_canPosition:function(G){return(E.Dom._getStyle(G,"display")!=="none"&&E.Dom._inDoc(G));},_getXY:function(){if(K[v][Q]){return function(y){var z,Y,AA,AF,AE,AD,AC,G,x,AB=Math.floor,AG=false;if(E.Dom._canPosition(y)){AA=y[Q]();AF=y[e];z=E.Dom.getDocumentScrollLeft(AF);Y=E.Dom.getDocumentScrollTop(AF);AG=[AB(AA[j]),AB(AA[o])];if(T&&m.ie<8){AE=2;AD=2;AC=AF[t];if(m.ie===6){if(AC!==c){AE=0;AD=0;}}if((AC===c)){G=S(AF[v],q);x=S(AF[v],R);if(G!==r){AE=parseInt(G,10);}if(x!==r){AD=parseInt(x,10);}}AG[0]-=AE;AG[1]-=AD;}if((Y||z)){AG[0]+=z;AG[1]+=Y;}AG[0]=AB(AG[0]);AG[1]=AB(AG[1]);}else{}return AG;};}else{return function(y){var x,Y,AA,AB,AC,z=false,G=y;if(E.Dom._canPosition(y)){z=[y[b],y[P]];x=E.Dom.getDocumentScrollLeft(y[e]);Y=E.Dom.getDocumentScrollTop(y[e]);AC=((H||m.webkit>519)?true:false);while((G=G[u])){z[0]+=G[b];z[1]+=G[P];if(AC){z=E.Dom._calcBorders(G,z);}}if(E.Dom._getStyle(y,p)!==f){G=y;while((G=G[Z])&&G[C]){AA=G[i];AB=G[O];if(H&&(E.Dom._getStyle(G,"overflow")!=="visible")){z=E.Dom._calcBorders(G,z);}if(AA||AB){z[0]-=AB;z[1]-=AA;}}z[0]+=x;z[1]+=Y;}else{if(D){z[0]-=x;z[1]-=Y;}else{if(I||H){z[0]+=x;z[1]+=Y;}}}z[0]=Math.floor(z[0]);z[1]=Math.floor(z[1]);}else{}return z;};}}(),getX:function(G){var Y=function(x){return E.Dom.getXY(x)[0];};return E.Dom.batch(G,Y,E.Dom,true);},getY:function(G){var Y=function(x){return E.Dom.getXY(x)[1];};return E.Dom.batch(G,Y,E.Dom,true);},setXY:function(G,x,Y){E.Dom.batch(G,E.Dom._setXY,{pos:x,noRetry:Y});},_setXY:function(G,z){var AA=E.Dom._getStyle(G,p),y=E.Dom.setStyle,AD=z.pos,Y=z.noRetry,AB=[parseInt(E.Dom.getComputedStyle(G,j),10),parseInt(E.Dom.getComputedStyle(G,o),10)],AC,x;if(AA=="static"){AA=V;y(G,p,AA);}AC=E.Dom._getXY(G);if(!AD||AC===false){return false;}if(isNaN(AB[0])){AB[0]=(AA==V)?0:G[b];}if(isNaN(AB[1])){AB[1]=(AA==V)?0:G[P];}if(AD[0]!==null){y(G,j,AD[0]-AC[0]+AB[0]+"px");}if(AD[1]!==null){y(G,o,AD[1]-AC[1]+AB[1]+"px");}if(!Y){x=E.Dom._getXY(G);if((AD[0]!==null&&x[0]!=AD[0])||(AD[1]!==null&&x[1]!=AD[1])){E.Dom._setXY(G,{pos:AD,noRetry:true});}}},setX:function(Y,G){E.Dom.setXY(Y,[G,null]);},setY:function(G,Y){E.Dom.setXY(G,[null,Y]);},getRegion:function(G){var Y=function(x){var y=false;if(E.Dom._canPosition(x)){y=E.Region.getRegion(x);}else{}return y;};return E.Dom.batch(G,Y,E.Dom,true);},getClientWidth:function(){return E.Dom.getViewportWidth();},getClientHeight:function(){return E.Dom.getViewportHeight();},getElementsByClassName:function(AB,AF,AC,AE,x,AD){AF=AF||"*";AC=(AC)?E.Dom.get(AC):null||K;if(!AC){return[];}var Y=[],G=AC.getElementsByTagName(AF),z=E.Dom.hasClass;for(var y=0,AA=G.length;y<AA;++y){if(z(G[y],AB)){Y[Y.length]=G[y];}}if(AE){E.Dom.batch(Y,AE,x,AD);}return Y;},hasClass:function(Y,G){return E.Dom.batch(Y,E.Dom._hasClass,G);},_hasClass:function(x,Y){var G=false,y;if(x&&Y){y=E.Dom._getAttribute(x,F)||J;if(Y.exec){G=Y.test(y);}else{G=Y&&(B+y+B).indexOf(B+Y+B)>-1;}}else{}return G;},addClass:function(Y,G){return E.Dom.batch(Y,E.Dom._addClass,G);},_addClass:function(x,Y){var G=false,y;if(x&&Y){y=E.Dom._getAttribute(x,F)||J;if(!E.Dom._hasClass(x,Y)){E.Dom.setAttribute(x,F,A(y+B+Y));G=true;}}else{}return G;},removeClass:function(Y,G){return E.Dom.batch(Y,E.Dom._removeClass,G);},_removeClass:function(y,x){var Y=false,AA,z,G;if(y&&x){AA=E.Dom._getAttribute(y,F)||J;E.Dom.setAttribute(y,F,AA.replace(E.Dom._getClassRegex(x),J));z=E.Dom._getAttribute(y,F);if(AA!==z){E.Dom.setAttribute(y,F,A(z));Y=true;if(E.Dom._getAttribute(y,F)===""){G=(y.hasAttribute&&y.hasAttribute(g))?g:F;
y.removeAttribute(G);}}}else{}return Y;},replaceClass:function(x,Y,G){return E.Dom.batch(x,E.Dom._replaceClass,{from:Y,to:G});},_replaceClass:function(y,x){var Y,AB,AA,G=false,z;if(y&&x){AB=x.from;AA=x.to;if(!AA){G=false;}else{if(!AB){G=E.Dom._addClass(y,x.to);}else{if(AB!==AA){z=E.Dom._getAttribute(y,F)||J;Y=(B+z.replace(E.Dom._getClassRegex(AB),B+AA)).split(E.Dom._getClassRegex(AA));Y.splice(1,0,B+AA);E.Dom.setAttribute(y,F,A(Y.join(J)));G=true;}}}}else{}return G;},generateId:function(G,x){x=x||"yui-gen";var Y=function(y){if(y&&y.id){return y.id;}var z=x+YAHOO.env._id_counter++;if(y){if(y[e]&&y[e].getElementById(z)){return E.Dom.generateId(y,z+x);}y.id=z;}return z;};return E.Dom.batch(G,Y,E.Dom,true)||Y.apply(E.Dom,arguments);},isAncestor:function(Y,x){Y=E.Dom.get(Y);x=E.Dom.get(x);var G=false;if((Y&&x)&&(Y[l]&&x[l])){if(Y.contains&&Y!==x){G=Y.contains(x);}else{if(Y.compareDocumentPosition){G=!!(Y.compareDocumentPosition(x)&16);}}}else{}return G;},inDocument:function(G,Y){return E.Dom._inDoc(E.Dom.get(G),Y);},_inDoc:function(Y,x){var G=false;if(Y&&Y[C]){x=x||Y[e];G=E.Dom.isAncestor(x[v],Y);}else{}return G;},getElementsBy:function(Y,AF,AB,AD,y,AC,AE){AF=AF||"*";AB=(AB)?E.Dom.get(AB):null||K;if(!AB){return[];}var x=[],G=AB.getElementsByTagName(AF);for(var z=0,AA=G.length;z<AA;++z){if(Y(G[z])){if(AE){x=G[z];break;}else{x[x.length]=G[z];}}}if(AD){E.Dom.batch(x,AD,y,AC);}return x;},getElementBy:function(x,G,Y){return E.Dom.getElementsBy(x,G,Y,null,null,null,true);},batch:function(x,AB,AA,z){var y=[],Y=(z)?AA:window;x=(x&&(x[C]||x.item))?x:E.Dom.get(x);if(x&&AB){if(x[C]||x.length===undefined){return AB.call(Y,x,AA);}for(var G=0;G<x.length;++G){y[y.length]=AB.call(Y,x[G],AA);}}else{return false;}return y;},getDocumentHeight:function(){var Y=(K[t]!=M||I)?K.body.scrollHeight:W.scrollHeight,G=Math.max(Y,E.Dom.getViewportHeight());return G;},getDocumentWidth:function(){var Y=(K[t]!=M||I)?K.body.scrollWidth:W.scrollWidth,G=Math.max(Y,E.Dom.getViewportWidth());return G;},getViewportHeight:function(){var G=self.innerHeight,Y=K[t];if((Y||T)&&!D){G=(Y==M)?W.clientHeight:K.body.clientHeight;}return G;},getViewportWidth:function(){var G=self.innerWidth,Y=K[t];if(Y||T){G=(Y==M)?W.clientWidth:K.body.clientWidth;}return G;},getAncestorBy:function(G,Y){while((G=G[Z])){if(E.Dom._testElement(G,Y)){return G;}}return null;},getAncestorByClassName:function(Y,G){Y=E.Dom.get(Y);if(!Y){return null;}var x=function(y){return E.Dom.hasClass(y,G);};return E.Dom.getAncestorBy(Y,x);},getAncestorByTagName:function(Y,G){Y=E.Dom.get(Y);if(!Y){return null;}var x=function(y){return y[C]&&y[C].toUpperCase()==G.toUpperCase();};return E.Dom.getAncestorBy(Y,x);},getPreviousSiblingBy:function(G,Y){while(G){G=G.previousSibling;if(E.Dom._testElement(G,Y)){return G;}}return null;},getPreviousSibling:function(G){G=E.Dom.get(G);if(!G){return null;}return E.Dom.getPreviousSiblingBy(G);},getNextSiblingBy:function(G,Y){while(G){G=G.nextSibling;if(E.Dom._testElement(G,Y)){return G;}}return null;},getNextSibling:function(G){G=E.Dom.get(G);if(!G){return null;}return E.Dom.getNextSiblingBy(G);},getFirstChildBy:function(G,x){var Y=(E.Dom._testElement(G.firstChild,x))?G.firstChild:null;return Y||E.Dom.getNextSiblingBy(G.firstChild,x);},getFirstChild:function(G,Y){G=E.Dom.get(G);if(!G){return null;}return E.Dom.getFirstChildBy(G);},getLastChildBy:function(G,x){if(!G){return null;}var Y=(E.Dom._testElement(G.lastChild,x))?G.lastChild:null;return Y||E.Dom.getPreviousSiblingBy(G.lastChild,x);},getLastChild:function(G){G=E.Dom.get(G);return E.Dom.getLastChildBy(G);},getChildrenBy:function(Y,y){var x=E.Dom.getFirstChildBy(Y,y),G=x?[x]:[];E.Dom.getNextSiblingBy(x,function(z){if(!y||y(z)){G[G.length]=z;}return false;});return G;},getChildren:function(G){G=E.Dom.get(G);if(!G){}return E.Dom.getChildrenBy(G);},getDocumentScrollLeft:function(G){G=G||K;return Math.max(G[v].scrollLeft,G.body.scrollLeft);},getDocumentScrollTop:function(G){G=G||K;return Math.max(G[v].scrollTop,G.body.scrollTop);},insertBefore:function(Y,G){Y=E.Dom.get(Y);G=E.Dom.get(G);if(!Y||!G||!G[Z]){return null;}return G[Z].insertBefore(Y,G);},insertAfter:function(Y,G){Y=E.Dom.get(Y);G=E.Dom.get(G);if(!Y||!G||!G[Z]){return null;}if(G.nextSibling){return G[Z].insertBefore(Y,G.nextSibling);}else{return G[Z].appendChild(Y);}},getClientRegion:function(){var x=E.Dom.getDocumentScrollTop(),Y=E.Dom.getDocumentScrollLeft(),y=E.Dom.getViewportWidth()+Y,G=E.Dom.getViewportHeight()+x;return new E.Region(x,y,G,Y);},setAttribute:function(Y,G,x){E.Dom.batch(Y,E.Dom._setAttribute,{attr:G,val:x});},_setAttribute:function(x,Y){var G=E.Dom._toCamel(Y.attr),y=Y.val;if(x&&x.setAttribute){if(E.Dom.DOT_ATTRIBUTES[G]){x[G]=y;}else{G=E.Dom.CUSTOM_ATTRIBUTES[G]||G;x.setAttribute(G,y);}}else{}},getAttribute:function(Y,G){return E.Dom.batch(Y,E.Dom._getAttribute,G);},_getAttribute:function(Y,G){var x;G=E.Dom.CUSTOM_ATTRIBUTES[G]||G;if(Y&&Y.getAttribute){x=Y.getAttribute(G,2);}else{}return x;},_toCamel:function(Y){var x=d;function G(y,z){return z.toUpperCase();}return x[Y]||(x[Y]=Y.indexOf("-")===-1?Y:Y.replace(/-([a-z])/gi,G));},_getClassRegex:function(Y){var G;if(Y!==undefined){if(Y.exec){G=Y;}else{G=h[Y];if(!G){Y=Y.replace(E.Dom._patterns.CLASS_RE_TOKENS,"\\$1");G=h[Y]=new RegExp(s+Y+k,U);}}}return G;},_patterns:{ROOT_TAG:/^body|html$/i,CLASS_RE_TOKENS:/([\.\(\)\^\$\*\+\?\|\[\]\{\}\\])/g},_testElement:function(G,Y){return G&&G[l]==1&&(!Y||Y(G));},_calcBorders:function(x,y){var Y=parseInt(E.Dom[w](x,R),10)||0,G=parseInt(E.Dom[w](x,q),10)||0;if(H){if(N.test(x[C])){Y=0;G=0;}}y[0]+=G;y[1]+=Y;return y;}};var S=E.Dom[w];if(m.opera){E.Dom[w]=function(Y,G){var x=S(Y,G);if(X.test(G)){x=E.Dom.Color.toRGB(x);}return x;};}if(m.webkit){E.Dom[w]=function(Y,G){var x=S(Y,G);if(x==="rgba(0, 0, 0, 0)"){x="transparent";}return x;};}if(m.ie&&m.ie>=8&&K.documentElement.hasAttribute){E.Dom.DOT_ATTRIBUTES.type=true;}})();YAHOO.util.Region=function(C,D,A,B){this.top=C;this.y=C;this[1]=C;this.right=D;this.bottom=A;this.left=B;this.x=B;this[0]=B;
this.width=this.right-this.left;this.height=this.bottom-this.top;};YAHOO.util.Region.prototype.contains=function(A){return(A.left>=this.left&&A.right<=this.right&&A.top>=this.top&&A.bottom<=this.bottom);};YAHOO.util.Region.prototype.getArea=function(){return((this.bottom-this.top)*(this.right-this.left));};YAHOO.util.Region.prototype.intersect=function(E){var C=Math.max(this.top,E.top),D=Math.min(this.right,E.right),A=Math.min(this.bottom,E.bottom),B=Math.max(this.left,E.left);if(A>=C&&D>=B){return new YAHOO.util.Region(C,D,A,B);}else{return null;}};YAHOO.util.Region.prototype.union=function(E){var C=Math.min(this.top,E.top),D=Math.max(this.right,E.right),A=Math.max(this.bottom,E.bottom),B=Math.min(this.left,E.left);return new YAHOO.util.Region(C,D,A,B);};YAHOO.util.Region.prototype.toString=function(){return("Region {"+"top: "+this.top+", right: "+this.right+", bottom: "+this.bottom+", left: "+this.left+", height: "+this.height+", width: "+this.width+"}");};YAHOO.util.Region.getRegion=function(D){var F=YAHOO.util.Dom.getXY(D),C=F[1],E=F[0]+D.offsetWidth,A=F[1]+D.offsetHeight,B=F[0];return new YAHOO.util.Region(C,E,A,B);};YAHOO.util.Point=function(A,B){if(YAHOO.lang.isArray(A)){B=A[1];A=A[0];}YAHOO.util.Point.superclass.constructor.call(this,B,A,B,A);};YAHOO.extend(YAHOO.util.Point,YAHOO.util.Region);(function(){var B=YAHOO.util,A="clientTop",F="clientLeft",J="parentNode",K="right",W="hasLayout",I="px",U="opacity",L="auto",D="borderLeftWidth",G="borderTopWidth",P="borderRightWidth",V="borderBottomWidth",S="visible",Q="transparent",N="height",E="width",H="style",T="currentStyle",R=/^width|height$/,O=/^(\d[.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz|%){1}?/i,M={get:function(X,Z){var Y="",a=X[T][Z];if(Z===U){Y=B.Dom.getStyle(X,U);}else{if(!a||(a.indexOf&&a.indexOf(I)>-1)){Y=a;}else{if(B.Dom.IE_COMPUTED[Z]){Y=B.Dom.IE_COMPUTED[Z](X,Z);}else{if(O.test(a)){Y=B.Dom.IE.ComputedStyle.getPixel(X,Z);}else{Y=a;}}}}return Y;},getOffset:function(Z,e){var b=Z[T][e],X=e.charAt(0).toUpperCase()+e.substr(1),c="offset"+X,Y="pixel"+X,a="",d;if(b==L){d=Z[c];if(d===undefined){a=0;}a=d;if(R.test(e)){Z[H][e]=d;if(Z[c]>d){a=d-(Z[c]-d);}Z[H][e]=L;}}else{if(!Z[H][Y]&&!Z[H][e]){Z[H][e]=b;}a=Z[H][Y];}return a+I;},getBorderWidth:function(X,Z){var Y=null;if(!X[T][W]){X[H].zoom=1;}switch(Z){case G:Y=X[A];break;case V:Y=X.offsetHeight-X.clientHeight-X[A];break;case D:Y=X[F];break;case P:Y=X.offsetWidth-X.clientWidth-X[F];break;}return Y+I;},getPixel:function(Y,X){var a=null,b=Y[T][K],Z=Y[T][X];Y[H][K]=Z;a=Y[H].pixelRight;Y[H][K]=b;return a+I;},getMargin:function(Y,X){var Z;if(Y[T][X]==L){Z=0+I;}else{Z=B.Dom.IE.ComputedStyle.getPixel(Y,X);}return Z;},getVisibility:function(Y,X){var Z;while((Z=Y[T])&&Z[X]=="inherit"){Y=Y[J];}return(Z)?Z[X]:S;},getColor:function(Y,X){return B.Dom.Color.toRGB(Y[T][X])||Q;},getBorderColor:function(Y,X){var Z=Y[T],a=Z[X]||Z.color;return B.Dom.Color.toRGB(B.Dom.Color.toHex(a));}},C={};C.top=C.right=C.bottom=C.left=C[E]=C[N]=M.getOffset;C.color=M.getColor;C[G]=C[P]=C[V]=C[D]=M.getBorderWidth;C.marginTop=C.marginRight=C.marginBottom=C.marginLeft=M.getMargin;C.visibility=M.getVisibility;C.borderColor=C.borderTopColor=C.borderRightColor=C.borderBottomColor=C.borderLeftColor=M.getBorderColor;B.Dom.IE_COMPUTED=C;B.Dom.IE_ComputedStyle=M;})();(function(){var C="toString",A=parseInt,B=RegExp,D=YAHOO.util;D.Dom.Color={KEYWORDS:{black:"000",silver:"c0c0c0",gray:"808080",white:"fff",maroon:"800000",red:"f00",purple:"800080",fuchsia:"f0f",green:"008000",lime:"0f0",olive:"808000",yellow:"ff0",navy:"000080",blue:"00f",teal:"008080",aqua:"0ff"},re_RGB:/^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,re_hex:/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,re_hex3:/([0-9A-F])/gi,toRGB:function(E){if(!D.Dom.Color.re_RGB.test(E)){E=D.Dom.Color.toHex(E);}if(D.Dom.Color.re_hex.exec(E)){E="rgb("+[A(B.$1,16),A(B.$2,16),A(B.$3,16)].join(", ")+")";}return E;},toHex:function(H){H=D.Dom.Color.KEYWORDS[H]||H;if(D.Dom.Color.re_RGB.exec(H)){var G=(B.$1.length===1)?"0"+B.$1:Number(B.$1),F=(B.$2.length===1)?"0"+B.$2:Number(B.$2),E=(B.$3.length===1)?"0"+B.$3:Number(B.$3);H=[G[C](16),F[C](16),E[C](16)].join("");}if(H.length<6){H=H.replace(D.Dom.Color.re_hex3,"$1$1");}if(H!=="transparent"&&H.indexOf("#")<0){H="#"+H;}return H.toLowerCase();}};}());YAHOO.register("dom",YAHOO.util.Dom,{version:"2.8.0r4",build:"2449"});YAHOO.util.CustomEvent=function(D,C,B,A,E){this.type=D;this.scope=C||window;this.silent=B;this.fireOnce=E;this.fired=false;this.firedWith=null;this.signature=A||YAHOO.util.CustomEvent.LIST;this.subscribers=[];if(!this.silent){}var F="_YUICEOnSubscribe";if(D!==F){this.subscribeEvent=new YAHOO.util.CustomEvent(F,this,true);}this.lastError=null;};YAHOO.util.CustomEvent.LIST=0;YAHOO.util.CustomEvent.FLAT=1;YAHOO.util.CustomEvent.prototype={subscribe:function(B,C,D){if(!B){throw new Error("Invalid callback for subscriber to '"+this.type+"'");}if(this.subscribeEvent){this.subscribeEvent.fire(B,C,D);}var A=new YAHOO.util.Subscriber(B,C,D);if(this.fireOnce&&this.fired){this.notify(A,this.firedWith);}else{this.subscribers.push(A);}},unsubscribe:function(D,F){if(!D){return this.unsubscribeAll();}var E=false;for(var B=0,A=this.subscribers.length;B<A;++B){var C=this.subscribers[B];if(C&&C.contains(D,F)){this._delete(B);E=true;}}return E;},fire:function(){this.lastError=null;var H=[],A=this.subscribers.length;var D=[].slice.call(arguments,0),C=true,F,B=false;if(this.fireOnce){if(this.fired){return true;}else{this.firedWith=D;}}this.fired=true;if(!A&&this.silent){return true;}if(!this.silent){}var E=this.subscribers.slice();for(F=0;F<A;++F){var G=E[F];if(!G){B=true;}else{C=this.notify(G,D);if(false===C){if(!this.silent){}break;}}}return(C!==false);},notify:function(F,C){var B,H=null,E=F.getScope(this.scope),A=YAHOO.util.Event.throwErrors;if(!this.silent){}if(this.signature==YAHOO.util.CustomEvent.FLAT){if(C.length>0){H=C[0];}try{B=F.fn.call(E,H,F.obj);}catch(G){this.lastError=G;if(A){throw G;}}}else{try{B=F.fn.call(E,this.type,C,F.obj);}catch(D){this.lastError=D;if(A){throw D;}}}return B;},unsubscribeAll:function(){var A=this.subscribers.length,B;for(B=A-1;B>-1;B--){this._delete(B);}this.subscribers=[];return A;},_delete:function(A){var B=this.subscribers[A];if(B){delete B.fn;delete B.obj;}this.subscribers.splice(A,1);},toString:function(){return"CustomEvent: "+"'"+this.type+"', "+"context: "+this.scope;}};YAHOO.util.Subscriber=function(A,B,C){this.fn=A;this.obj=YAHOO.lang.isUndefined(B)?null:B;this.overrideContext=C;};YAHOO.util.Subscriber.prototype.getScope=function(A){if(this.overrideContext){if(this.overrideContext===true){return this.obj;}else{return this.overrideContext;}}return A;};YAHOO.util.Subscriber.prototype.contains=function(A,B){if(B){return(this.fn==A&&this.obj==B);}else{return(this.fn==A);}};YAHOO.util.Subscriber.prototype.toString=function(){return"Subscriber { obj: "+this.obj+", overrideContext: "+(this.overrideContext||"no")+" }";};if(!YAHOO.util.Event){YAHOO.util.Event=function(){var G=false,H=[],J=[],A=0,E=[],B=0,C={63232:38,63233:40,63234:37,63235:39,63276:33,63277:34,25:9},D=YAHOO.env.ua.ie,F="focusin",I="focusout";return{POLL_RETRYS:500,POLL_INTERVAL:40,EL:0,TYPE:1,FN:2,WFN:3,UNLOAD_OBJ:3,ADJ_SCOPE:4,OBJ:5,OVERRIDE:6,CAPTURE:7,lastError:null,isSafari:YAHOO.env.ua.webkit,webkit:YAHOO.env.ua.webkit,isIE:D,_interval:null,_dri:null,_specialTypes:{focusin:(D?"focusin":"focus"),focusout:(D?"focusout":"blur")},DOMReady:false,throwErrors:false,startInterval:function(){if(!this._interval){this._interval=YAHOO.lang.later(this.POLL_INTERVAL,this,this._tryPreloadAttach,null,true);}},onAvailable:function(Q,M,O,P,N){var K=(YAHOO.lang.isString(Q))?[Q]:Q;for(var L=0;L<K.length;L=L+1){E.push({id:K[L],fn:M,obj:O,overrideContext:P,checkReady:N});}A=this.POLL_RETRYS;this.startInterval();},onContentReady:function(N,K,L,M){this.onAvailable(N,K,L,M,true);},onDOMReady:function(){this.DOMReadyEvent.subscribe.apply(this.DOMReadyEvent,arguments);},_addListener:function(M,K,V,P,T,Y){if(!V||!V.call){return false;}if(this._isValidCollection(M)){var W=true;for(var Q=0,S=M.length;Q<S;++Q){W=this.on(M[Q],K,V,P,T)&&W;}return W;}else{if(YAHOO.lang.isString(M)){var O=this.getEl(M);if(O){M=O;}else{this.onAvailable(M,function(){YAHOO.util.Event._addListener(M,K,V,P,T,Y);});return true;}}}if(!M){return false;}if("unload"==K&&P!==this){J[J.length]=[M,K,V,P,T];return true;}var L=M;if(T){if(T===true){L=P;}else{L=T;}}var N=function(Z){return V.call(L,YAHOO.util.Event.getEvent(Z,M),P);};var X=[M,K,V,N,L,P,T,Y];var R=H.length;H[R]=X;try{this._simpleAdd(M,K,N,Y);}catch(U){this.lastError=U;this.removeListener(M,K,V);return false;}return true;},_getType:function(K){return this._specialTypes[K]||K;},addListener:function(M,P,L,N,O){var K=((P==F||P==I)&&!YAHOO.env.ua.ie)?true:false;return this._addListener(M,this._getType(P),L,N,O,K);},addFocusListener:function(L,K,M,N){return this.on(L,F,K,M,N);},removeFocusListener:function(L,K){return this.removeListener(L,F,K);},addBlurListener:function(L,K,M,N){return this.on(L,I,K,M,N);},removeBlurListener:function(L,K){return this.removeListener(L,I,K);},removeListener:function(L,K,R){var M,P,U;K=this._getType(K);if(typeof L=="string"){L=this.getEl(L);}else{if(this._isValidCollection(L)){var S=true;for(M=L.length-1;M>-1;M--){S=(this.removeListener(L[M],K,R)&&S);}return S;}}if(!R||!R.call){return this.purgeElement(L,false,K);}if("unload"==K){for(M=J.length-1;M>-1;M--){U=J[M];if(U&&U[0]==L&&U[1]==K&&U[2]==R){J.splice(M,1);return true;}}return false;}var N=null;var O=arguments[3];if("undefined"===typeof O){O=this._getCacheIndex(H,L,K,R);}if(O>=0){N=H[O];}if(!L||!N){return false;}var T=N[this.CAPTURE]===true?true:false;try{this._simpleRemove(L,K,N[this.WFN],T);}catch(Q){this.lastError=Q;return false;}delete H[O][this.WFN];delete H[O][this.FN];H.splice(O,1);return true;},getTarget:function(M,L){var K=M.target||M.srcElement;return this.resolveTextNode(K);},resolveTextNode:function(L){try{if(L&&3==L.nodeType){return L.parentNode;}}catch(K){}return L;},getPageX:function(L){var K=L.pageX;if(!K&&0!==K){K=L.clientX||0;if(this.isIE){K+=this._getScrollLeft();}}return K;},getPageY:function(K){var L=K.pageY;if(!L&&0!==L){L=K.clientY||0;if(this.isIE){L+=this._getScrollTop();}}return L;},getXY:function(K){return[this.getPageX(K),this.getPageY(K)];},getRelatedTarget:function(L){var K=L.relatedTarget;if(!K){if(L.type=="mouseout"){K=L.toElement;
}else{if(L.type=="mouseover"){K=L.fromElement;}}}return this.resolveTextNode(K);},getTime:function(M){if(!M.time){var L=new Date().getTime();try{M.time=L;}catch(K){this.lastError=K;return L;}}return M.time;},stopEvent:function(K){this.stopPropagation(K);this.preventDefault(K);},stopPropagation:function(K){if(K.stopPropagation){K.stopPropagation();}else{K.cancelBubble=true;}},preventDefault:function(K){if(K.preventDefault){K.preventDefault();}else{K.returnValue=false;}},getEvent:function(M,K){var L=M||window.event;if(!L){var N=this.getEvent.caller;while(N){L=N.arguments[0];if(L&&Event==L.constructor){break;}N=N.caller;}}return L;},getCharCode:function(L){var K=L.keyCode||L.charCode||0;if(YAHOO.env.ua.webkit&&(K in C)){K=C[K];}return K;},_getCacheIndex:function(M,P,Q,O){for(var N=0,L=M.length;N<L;N=N+1){var K=M[N];if(K&&K[this.FN]==O&&K[this.EL]==P&&K[this.TYPE]==Q){return N;}}return -1;},generateId:function(K){var L=K.id;if(!L){L="yuievtautoid-"+B;++B;K.id=L;}return L;},_isValidCollection:function(L){try{return(L&&typeof L!=="string"&&L.length&&!L.tagName&&!L.alert&&typeof L[0]!=="undefined");}catch(K){return false;}},elCache:{},getEl:function(K){return(typeof K==="string")?document.getElementById(K):K;},clearCache:function(){},DOMReadyEvent:new YAHOO.util.CustomEvent("DOMReady",YAHOO,0,0,1),_load:function(L){if(!G){G=true;var K=YAHOO.util.Event;K._ready();K._tryPreloadAttach();}},_ready:function(L){var K=YAHOO.util.Event;if(!K.DOMReady){K.DOMReady=true;K.DOMReadyEvent.fire();K._simpleRemove(document,"DOMContentLoaded",K._ready);}},_tryPreloadAttach:function(){if(E.length===0){A=0;if(this._interval){this._interval.cancel();this._interval=null;}return;}if(this.locked){return;}if(this.isIE){if(!this.DOMReady){this.startInterval();return;}}this.locked=true;var Q=!G;if(!Q){Q=(A>0&&E.length>0);}var P=[];var R=function(T,U){var S=T;if(U.overrideContext){if(U.overrideContext===true){S=U.obj;}else{S=U.overrideContext;}}U.fn.call(S,U.obj);};var L,K,O,N,M=[];for(L=0,K=E.length;L<K;L=L+1){O=E[L];if(O){N=this.getEl(O.id);if(N){if(O.checkReady){if(G||N.nextSibling||!Q){M.push(O);E[L]=null;}}else{R(N,O);E[L]=null;}}else{P.push(O);}}}for(L=0,K=M.length;L<K;L=L+1){O=M[L];R(this.getEl(O.id),O);}A--;if(Q){for(L=E.length-1;L>-1;L--){O=E[L];if(!O||!O.id){E.splice(L,1);}}this.startInterval();}else{if(this._interval){this._interval.cancel();this._interval=null;}}this.locked=false;},purgeElement:function(O,P,R){var M=(YAHOO.lang.isString(O))?this.getEl(O):O;var Q=this.getListeners(M,R),N,K;if(Q){for(N=Q.length-1;N>-1;N--){var L=Q[N];this.removeListener(M,L.type,L.fn);}}if(P&&M&&M.childNodes){for(N=0,K=M.childNodes.length;N<K;++N){this.purgeElement(M.childNodes[N],P,R);}}},getListeners:function(M,K){var P=[],L;if(!K){L=[H,J];}else{if(K==="unload"){L=[J];}else{K=this._getType(K);L=[H];}}var R=(YAHOO.lang.isString(M))?this.getEl(M):M;for(var O=0;O<L.length;O=O+1){var T=L[O];if(T){for(var Q=0,S=T.length;Q<S;++Q){var N=T[Q];if(N&&N[this.EL]===R&&(!K||K===N[this.TYPE])){P.push({type:N[this.TYPE],fn:N[this.FN],obj:N[this.OBJ],adjust:N[this.OVERRIDE],scope:N[this.ADJ_SCOPE],index:Q});}}}}return(P.length)?P:null;},_unload:function(R){var L=YAHOO.util.Event,O,N,M,Q,P,S=J.slice(),K;for(O=0,Q=J.length;O<Q;++O){M=S[O];if(M){K=window;if(M[L.ADJ_SCOPE]){if(M[L.ADJ_SCOPE]===true){K=M[L.UNLOAD_OBJ];}else{K=M[L.ADJ_SCOPE];}}M[L.FN].call(K,L.getEvent(R,M[L.EL]),M[L.UNLOAD_OBJ]);S[O]=null;}}M=null;K=null;J=null;if(H){for(N=H.length-1;N>-1;N--){M=H[N];if(M){L.removeListener(M[L.EL],M[L.TYPE],M[L.FN],N);}}M=null;}L._simpleRemove(window,"unload",L._unload);},_getScrollLeft:function(){return this._getScroll()[1];},_getScrollTop:function(){return this._getScroll()[0];},_getScroll:function(){var K=document.documentElement,L=document.body;if(K&&(K.scrollTop||K.scrollLeft)){return[K.scrollTop,K.scrollLeft];}else{if(L){return[L.scrollTop,L.scrollLeft];}else{return[0,0];}}},regCE:function(){},_simpleAdd:function(){if(window.addEventListener){return function(M,N,L,K){M.addEventListener(N,L,(K));};}else{if(window.attachEvent){return function(M,N,L,K){M.attachEvent("on"+N,L);};}else{return function(){};}}}(),_simpleRemove:function(){if(window.removeEventListener){return function(M,N,L,K){M.removeEventListener(N,L,(K));};}else{if(window.detachEvent){return function(L,M,K){L.detachEvent("on"+M,K);};}else{return function(){};}}}()};}();(function(){var EU=YAHOO.util.Event;EU.on=EU.addListener;EU.onFocus=EU.addFocusListener;EU.onBlur=EU.addBlurListener;
/* DOMReady: based on work by: Dean Edwards/John Resig/Matthias Miller/Diego Perini */
if(EU.isIE){if(self!==self.top){document.onreadystatechange=function(){if(document.readyState=="complete"){document.onreadystatechange=null;EU._ready();}};}else{YAHOO.util.Event.onDOMReady(YAHOO.util.Event._tryPreloadAttach,YAHOO.util.Event,true);var n=document.createElement("p");EU._dri=setInterval(function(){try{n.doScroll("left");clearInterval(EU._dri);EU._dri=null;EU._ready();n=null;}catch(ex){}},EU.POLL_INTERVAL);}}else{if(EU.webkit&&EU.webkit<525){EU._dri=setInterval(function(){var rs=document.readyState;if("loaded"==rs||"complete"==rs){clearInterval(EU._dri);EU._dri=null;EU._ready();}},EU.POLL_INTERVAL);}else{EU._simpleAdd(document,"DOMContentLoaded",EU._ready);}}EU._simpleAdd(window,"load",EU._load);EU._simpleAdd(window,"unload",EU._unload);EU._tryPreloadAttach();})();}YAHOO.util.EventProvider=function(){};YAHOO.util.EventProvider.prototype={__yui_events:null,__yui_subscribers:null,subscribe:function(A,C,F,E){this.__yui_events=this.__yui_events||{};var D=this.__yui_events[A];if(D){D.subscribe(C,F,E);}else{this.__yui_subscribers=this.__yui_subscribers||{};var B=this.__yui_subscribers;if(!B[A]){B[A]=[];}B[A].push({fn:C,obj:F,overrideContext:E});}},unsubscribe:function(C,E,G){this.__yui_events=this.__yui_events||{};var A=this.__yui_events;if(C){var F=A[C];if(F){return F.unsubscribe(E,G);}}else{var B=true;for(var D in A){if(YAHOO.lang.hasOwnProperty(A,D)){B=B&&A[D].unsubscribe(E,G);}}return B;}return false;},unsubscribeAll:function(A){return this.unsubscribe(A);
},createEvent:function(B,G){this.__yui_events=this.__yui_events||{};var E=G||{},D=this.__yui_events,F;if(D[B]){}else{F=new YAHOO.util.CustomEvent(B,E.scope||this,E.silent,YAHOO.util.CustomEvent.FLAT,E.fireOnce);D[B]=F;if(E.onSubscribeCallback){F.subscribeEvent.subscribe(E.onSubscribeCallback);}this.__yui_subscribers=this.__yui_subscribers||{};var A=this.__yui_subscribers[B];if(A){for(var C=0;C<A.length;++C){F.subscribe(A[C].fn,A[C].obj,A[C].overrideContext);}}}return D[B];},fireEvent:function(B){this.__yui_events=this.__yui_events||{};var D=this.__yui_events[B];if(!D){return null;}var A=[];for(var C=1;C<arguments.length;++C){A.push(arguments[C]);}return D.fire.apply(D,A);},hasEvent:function(A){if(this.__yui_events){if(this.__yui_events[A]){return true;}}return false;}};(function(){var A=YAHOO.util.Event,C=YAHOO.lang;YAHOO.util.KeyListener=function(D,I,E,F){if(!D){}else{if(!I){}else{if(!E){}}}if(!F){F=YAHOO.util.KeyListener.KEYDOWN;}var G=new YAHOO.util.CustomEvent("keyPressed");this.enabledEvent=new YAHOO.util.CustomEvent("enabled");this.disabledEvent=new YAHOO.util.CustomEvent("disabled");if(C.isString(D)){D=document.getElementById(D);}if(C.isFunction(E)){G.subscribe(E);}else{G.subscribe(E.fn,E.scope,E.correctScope);}function H(O,N){if(!I.shift){I.shift=false;}if(!I.alt){I.alt=false;}if(!I.ctrl){I.ctrl=false;}if(O.shiftKey==I.shift&&O.altKey==I.alt&&O.ctrlKey==I.ctrl){var J,M=I.keys,L;if(YAHOO.lang.isArray(M)){for(var K=0;K<M.length;K++){J=M[K];L=A.getCharCode(O);if(J==L){G.fire(L,O);break;}}}else{L=A.getCharCode(O);if(M==L){G.fire(L,O);}}}}this.enable=function(){if(!this.enabled){A.on(D,F,H);this.enabledEvent.fire(I);}this.enabled=true;};this.disable=function(){if(this.enabled){A.removeListener(D,F,H);this.disabledEvent.fire(I);}this.enabled=false;};this.toString=function(){return"KeyListener ["+I.keys+"] "+D.tagName+(D.id?"["+D.id+"]":"");};};var B=YAHOO.util.KeyListener;B.KEYDOWN="keydown";B.KEYUP="keyup";B.KEY={ALT:18,BACK_SPACE:8,CAPS_LOCK:20,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,META:224,NUM_LOCK:144,PAGE_DOWN:34,PAGE_UP:33,PAUSE:19,PRINTSCREEN:44,RIGHT:39,SCROLL_LOCK:145,SHIFT:16,SPACE:32,TAB:9,UP:38};})();YAHOO.register("event",YAHOO.util.Event,{version:"2.8.0r4",build:"2449"});YAHOO.register("yahoo-dom-event", YAHOO, {version: "2.8.0r4", build: "2449"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.8.0r4
*/
(function(){var B=YAHOO.util;var A=function(D,C,E,F){if(!D){}this.init(D,C,E,F);};A.NAME="Anim";A.prototype={toString:function(){var C=this.getEl()||{};var D=C.id||C.tagName;return(this.constructor.NAME+": "+D);},patterns:{noNegatives:/width|height|opacity|padding/i,offsetAttribute:/^((width|height)|(top|left))$/,defaultUnit:/width|height|top$|bottom$|left$|right$/i,offsetUnit:/\d+(em|%|en|ex|pt|in|cm|mm|pc)$/i},doMethod:function(C,E,D){return this.method(this.currentFrame,E,D-E,this.totalFrames);},setAttribute:function(C,F,E){var D=this.getEl();if(this.patterns.noNegatives.test(C)){F=(F>0)?F:0;}if(C in D&&!("style" in D&&C in D.style)){D[C]=F;}else{B.Dom.setStyle(D,C,F+E);}},getAttribute:function(C){var E=this.getEl();var G=B.Dom.getStyle(E,C);if(G!=="auto"&&!this.patterns.offsetUnit.test(G)){return parseFloat(G);}var D=this.patterns.offsetAttribute.exec(C)||[];var H=!!(D[3]);var F=!!(D[2]);if("style" in E){if(F||(B.Dom.getStyle(E,"position")=="absolute"&&H)){G=E["offset"+D[0].charAt(0).toUpperCase()+D[0].substr(1)];}else{G=0;}}else{if(C in E){G=E[C];}}return G;},getDefaultUnit:function(C){if(this.patterns.defaultUnit.test(C)){return"px";}return"";},setRuntimeAttribute:function(D){var I;var E;var F=this.attributes;this.runtimeAttributes[D]={};var H=function(J){return(typeof J!=="undefined");};if(!H(F[D]["to"])&&!H(F[D]["by"])){return false;}I=(H(F[D]["from"]))?F[D]["from"]:this.getAttribute(D);if(H(F[D]["to"])){E=F[D]["to"];}else{if(H(F[D]["by"])){if(I.constructor==Array){E=[];for(var G=0,C=I.length;G<C;++G){E[G]=I[G]+F[D]["by"][G]*1;}}else{E=I+F[D]["by"]*1;}}}this.runtimeAttributes[D].start=I;this.runtimeAttributes[D].end=E;this.runtimeAttributes[D].unit=(H(F[D].unit))?F[D]["unit"]:this.getDefaultUnit(D);return true;},init:function(E,J,I,C){var D=false;var F=null;var H=0;E=B.Dom.get(E);this.attributes=J||{};this.duration=!YAHOO.lang.isUndefined(I)?I:1;this.method=C||B.Easing.easeNone;this.useSeconds=true;this.currentFrame=0;this.totalFrames=B.AnimMgr.fps;this.setEl=function(M){E=B.Dom.get(M);};this.getEl=function(){return E;};this.isAnimated=function(){return D;};this.getStartTime=function(){return F;};this.runtimeAttributes={};this.animate=function(){if(this.isAnimated()){return false;}this.currentFrame=0;this.totalFrames=(this.useSeconds)?Math.ceil(B.AnimMgr.fps*this.duration):this.duration;if(this.duration===0&&this.useSeconds){this.totalFrames=1;}B.AnimMgr.registerElement(this);return true;};this.stop=function(M){if(!this.isAnimated()){return false;}if(M){this.currentFrame=this.totalFrames;this._onTween.fire();}B.AnimMgr.stop(this);};var L=function(){this.onStart.fire();this.runtimeAttributes={};for(var M in this.attributes){this.setRuntimeAttribute(M);}D=true;H=0;F=new Date();};var K=function(){var O={duration:new Date()-this.getStartTime(),currentFrame:this.currentFrame};O.toString=function(){return("duration: "+O.duration+", currentFrame: "+O.currentFrame);};this.onTween.fire(O);var N=this.runtimeAttributes;for(var M in N){this.setAttribute(M,this.doMethod(M,N[M].start,N[M].end),N[M].unit);}H+=1;};var G=function(){var M=(new Date()-F)/1000;var N={duration:M,frames:H,fps:H/M};N.toString=function(){return("duration: "+N.duration+", frames: "+N.frames+", fps: "+N.fps);};D=false;H=0;this.onComplete.fire(N);};this._onStart=new B.CustomEvent("_start",this,true);this.onStart=new B.CustomEvent("start",this);this.onTween=new B.CustomEvent("tween",this);this._onTween=new B.CustomEvent("_tween",this,true);this.onComplete=new B.CustomEvent("complete",this);this._onComplete=new B.CustomEvent("_complete",this,true);this._onStart.subscribe(L);this._onTween.subscribe(K);this._onComplete.subscribe(G);}};B.Anim=A;})();YAHOO.util.AnimMgr=new function(){var C=null;var B=[];var A=0;this.fps=1000;this.delay=1;this.registerElement=function(F){B[B.length]=F;A+=1;F._onStart.fire();this.start();};this.unRegister=function(G,F){F=F||E(G);if(!G.isAnimated()||F===-1){return false;}G._onComplete.fire();B.splice(F,1);A-=1;if(A<=0){this.stop();}return true;};this.start=function(){if(C===null){C=setInterval(this.run,this.delay);}};this.stop=function(H){if(!H){clearInterval(C);for(var G=0,F=B.length;G<F;++G){this.unRegister(B[0],0);}B=[];C=null;A=0;}else{this.unRegister(H);}};this.run=function(){for(var H=0,F=B.length;H<F;++H){var G=B[H];if(!G||!G.isAnimated()){continue;}if(G.currentFrame<G.totalFrames||G.totalFrames===null){G.currentFrame+=1;if(G.useSeconds){D(G);}G._onTween.fire();}else{YAHOO.util.AnimMgr.stop(G,H);}}};var E=function(H){for(var G=0,F=B.length;G<F;++G){if(B[G]===H){return G;}}return -1;};var D=function(G){var J=G.totalFrames;var I=G.currentFrame;var H=(G.currentFrame*G.duration*1000/G.totalFrames);var F=(new Date()-G.getStartTime());var K=0;if(F<G.duration*1000){K=Math.round((F/H-1)*G.currentFrame);}else{K=J-(I+1);}if(K>0&&isFinite(K)){if(G.currentFrame+K>=J){K=J-(I+1);}G.currentFrame+=K;}};this._queue=B;this._getIndex=E;};YAHOO.util.Bezier=new function(){this.getPosition=function(E,D){var F=E.length;var C=[];for(var B=0;B<F;++B){C[B]=[E[B][0],E[B][1]];}for(var A=1;A<F;++A){for(B=0;B<F-A;++B){C[B][0]=(1-D)*C[B][0]+D*C[parseInt(B+1,10)][0];C[B][1]=(1-D)*C[B][1]+D*C[parseInt(B+1,10)][1];}}return[C[0][0],C[0][1]];};};(function(){var A=function(F,E,G,H){A.superclass.constructor.call(this,F,E,G,H);};A.NAME="ColorAnim";A.DEFAULT_BGCOLOR="#fff";var C=YAHOO.util;YAHOO.extend(A,C.Anim);var D=A.superclass;var B=A.prototype;B.patterns.color=/color$/i;B.patterns.rgb=/^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i;B.patterns.hex=/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i;B.patterns.hex3=/^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;B.patterns.transparent=/^transparent|rgba\(0, 0, 0, 0\)$/;B.parseColor=function(E){if(E.length==3){return E;}var F=this.patterns.hex.exec(E);if(F&&F.length==4){return[parseInt(F[1],16),parseInt(F[2],16),parseInt(F[3],16)];}F=this.patterns.rgb.exec(E);if(F&&F.length==4){return[parseInt(F[1],10),parseInt(F[2],10),parseInt(F[3],10)];}F=this.patterns.hex3.exec(E);if(F&&F.length==4){return[parseInt(F[1]+F[1],16),parseInt(F[2]+F[2],16),parseInt(F[3]+F[3],16)];
}return null;};B.getAttribute=function(E){var G=this.getEl();if(this.patterns.color.test(E)){var I=YAHOO.util.Dom.getStyle(G,E);var H=this;if(this.patterns.transparent.test(I)){var F=YAHOO.util.Dom.getAncestorBy(G,function(J){return !H.patterns.transparent.test(I);});if(F){I=C.Dom.getStyle(F,E);}else{I=A.DEFAULT_BGCOLOR;}}}else{I=D.getAttribute.call(this,E);}return I;};B.doMethod=function(F,J,G){var I;if(this.patterns.color.test(F)){I=[];for(var H=0,E=J.length;H<E;++H){I[H]=D.doMethod.call(this,F,J[H],G[H]);}I="rgb("+Math.floor(I[0])+","+Math.floor(I[1])+","+Math.floor(I[2])+")";}else{I=D.doMethod.call(this,F,J,G);}return I;};B.setRuntimeAttribute=function(F){D.setRuntimeAttribute.call(this,F);if(this.patterns.color.test(F)){var H=this.attributes;var J=this.parseColor(this.runtimeAttributes[F].start);var G=this.parseColor(this.runtimeAttributes[F].end);if(typeof H[F]["to"]==="undefined"&&typeof H[F]["by"]!=="undefined"){G=this.parseColor(H[F].by);for(var I=0,E=J.length;I<E;++I){G[I]=J[I]+G[I];}}this.runtimeAttributes[F].start=J;this.runtimeAttributes[F].end=G;}};C.ColorAnim=A;})();
/*
TERMS OF USE - EASING EQUATIONS
Open source under the BSD License.
Copyright 2001 Robert Penner All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
YAHOO.util.Easing={easeNone:function(B,A,D,C){return D*B/C+A;},easeIn:function(B,A,D,C){return D*(B/=C)*B+A;},easeOut:function(B,A,D,C){return -D*(B/=C)*(B-2)+A;},easeBoth:function(B,A,D,C){if((B/=C/2)<1){return D/2*B*B+A;}return -D/2*((--B)*(B-2)-1)+A;},easeInStrong:function(B,A,D,C){return D*(B/=C)*B*B*B+A;},easeOutStrong:function(B,A,D,C){return -D*((B=B/C-1)*B*B*B-1)+A;},easeBothStrong:function(B,A,D,C){if((B/=C/2)<1){return D/2*B*B*B*B+A;}return -D/2*((B-=2)*B*B*B-2)+A;},elasticIn:function(C,A,G,F,B,E){if(C==0){return A;}if((C/=F)==1){return A+G;}if(!E){E=F*0.3;}if(!B||B<Math.abs(G)){B=G;var D=E/4;}else{var D=E/(2*Math.PI)*Math.asin(G/B);}return -(B*Math.pow(2,10*(C-=1))*Math.sin((C*F-D)*(2*Math.PI)/E))+A;},elasticOut:function(C,A,G,F,B,E){if(C==0){return A;}if((C/=F)==1){return A+G;}if(!E){E=F*0.3;}if(!B||B<Math.abs(G)){B=G;var D=E/4;}else{var D=E/(2*Math.PI)*Math.asin(G/B);}return B*Math.pow(2,-10*C)*Math.sin((C*F-D)*(2*Math.PI)/E)+G+A;},elasticBoth:function(C,A,G,F,B,E){if(C==0){return A;}if((C/=F/2)==2){return A+G;}if(!E){E=F*(0.3*1.5);}if(!B||B<Math.abs(G)){B=G;var D=E/4;}else{var D=E/(2*Math.PI)*Math.asin(G/B);}if(C<1){return -0.5*(B*Math.pow(2,10*(C-=1))*Math.sin((C*F-D)*(2*Math.PI)/E))+A;}return B*Math.pow(2,-10*(C-=1))*Math.sin((C*F-D)*(2*Math.PI)/E)*0.5+G+A;},backIn:function(B,A,E,D,C){if(typeof C=="undefined"){C=1.70158;}return E*(B/=D)*B*((C+1)*B-C)+A;},backOut:function(B,A,E,D,C){if(typeof C=="undefined"){C=1.70158;}return E*((B=B/D-1)*B*((C+1)*B+C)+1)+A;},backBoth:function(B,A,E,D,C){if(typeof C=="undefined"){C=1.70158;}if((B/=D/2)<1){return E/2*(B*B*(((C*=(1.525))+1)*B-C))+A;}return E/2*((B-=2)*B*(((C*=(1.525))+1)*B+C)+2)+A;},bounceIn:function(B,A,D,C){return D-YAHOO.util.Easing.bounceOut(C-B,0,D,C)+A;},bounceOut:function(B,A,D,C){if((B/=C)<(1/2.75)){return D*(7.5625*B*B)+A;}else{if(B<(2/2.75)){return D*(7.5625*(B-=(1.5/2.75))*B+0.75)+A;}else{if(B<(2.5/2.75)){return D*(7.5625*(B-=(2.25/2.75))*B+0.9375)+A;}}}return D*(7.5625*(B-=(2.625/2.75))*B+0.984375)+A;},bounceBoth:function(B,A,D,C){if(B<C/2){return YAHOO.util.Easing.bounceIn(B*2,0,D,C)*0.5+A;}return YAHOO.util.Easing.bounceOut(B*2-C,0,D,C)*0.5+D*0.5+A;}};(function(){var A=function(H,G,I,J){if(H){A.superclass.constructor.call(this,H,G,I,J);}};A.NAME="Motion";var E=YAHOO.util;YAHOO.extend(A,E.ColorAnim);var F=A.superclass;var C=A.prototype;C.patterns.points=/^points$/i;C.setAttribute=function(G,I,H){if(this.patterns.points.test(G)){H=H||"px";F.setAttribute.call(this,"left",I[0],H);F.setAttribute.call(this,"top",I[1],H);}else{F.setAttribute.call(this,G,I,H);}};C.getAttribute=function(G){if(this.patterns.points.test(G)){var H=[F.getAttribute.call(this,"left"),F.getAttribute.call(this,"top")];}else{H=F.getAttribute.call(this,G);}return H;};C.doMethod=function(G,K,H){var J=null;if(this.patterns.points.test(G)){var I=this.method(this.currentFrame,0,100,this.totalFrames)/100;J=E.Bezier.getPosition(this.runtimeAttributes[G],I);}else{J=F.doMethod.call(this,G,K,H);}return J;};C.setRuntimeAttribute=function(P){if(this.patterns.points.test(P)){var H=this.getEl();var J=this.attributes;var G;var L=J["points"]["control"]||[];var I;var M,O;if(L.length>0&&!(L[0] instanceof Array)){L=[L];}else{var K=[];for(M=0,O=L.length;M<O;++M){K[M]=L[M];}L=K;}if(E.Dom.getStyle(H,"position")=="static"){E.Dom.setStyle(H,"position","relative");}if(D(J["points"]["from"])){E.Dom.setXY(H,J["points"]["from"]);
}else{E.Dom.setXY(H,E.Dom.getXY(H));}G=this.getAttribute("points");if(D(J["points"]["to"])){I=B.call(this,J["points"]["to"],G);var N=E.Dom.getXY(this.getEl());for(M=0,O=L.length;M<O;++M){L[M]=B.call(this,L[M],G);}}else{if(D(J["points"]["by"])){I=[G[0]+J["points"]["by"][0],G[1]+J["points"]["by"][1]];for(M=0,O=L.length;M<O;++M){L[M]=[G[0]+L[M][0],G[1]+L[M][1]];}}}this.runtimeAttributes[P]=[G];if(L.length>0){this.runtimeAttributes[P]=this.runtimeAttributes[P].concat(L);}this.runtimeAttributes[P][this.runtimeAttributes[P].length]=I;}else{F.setRuntimeAttribute.call(this,P);}};var B=function(G,I){var H=E.Dom.getXY(this.getEl());G=[G[0]-H[0]+I[0],G[1]-H[1]+I[1]];return G;};var D=function(G){return(typeof G!=="undefined");};E.Motion=A;})();(function(){var D=function(F,E,G,H){if(F){D.superclass.constructor.call(this,F,E,G,H);}};D.NAME="Scroll";var B=YAHOO.util;YAHOO.extend(D,B.ColorAnim);var C=D.superclass;var A=D.prototype;A.doMethod=function(E,H,F){var G=null;if(E=="scroll"){G=[this.method(this.currentFrame,H[0],F[0]-H[0],this.totalFrames),this.method(this.currentFrame,H[1],F[1]-H[1],this.totalFrames)];}else{G=C.doMethod.call(this,E,H,F);}return G;};A.getAttribute=function(E){var G=null;var F=this.getEl();if(E=="scroll"){G=[F.scrollLeft,F.scrollTop];}else{G=C.getAttribute.call(this,E);}return G;};A.setAttribute=function(E,H,G){var F=this.getEl();if(E=="scroll"){F.scrollLeft=H[0];F.scrollTop=H[1];}else{C.setAttribute.call(this,E,H,G);}};B.Scroll=D;})();YAHOO.register("animation",YAHOO.util.Anim,{version:"2.8.0r4",build:"2449"});/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.8.0r4
*/
(function(){YAHOO.util.Config=function(D){if(D){this.init(D);}};var B=YAHOO.lang,C=YAHOO.util.CustomEvent,A=YAHOO.util.Config;A.CONFIG_CHANGED_EVENT="configChanged";A.BOOLEAN_TYPE="boolean";A.prototype={owner:null,queueInProgress:false,config:null,initialConfig:null,eventQueue:null,configChangedEvent:null,init:function(D){this.owner=D;this.configChangedEvent=this.createEvent(A.CONFIG_CHANGED_EVENT);this.configChangedEvent.signature=C.LIST;this.queueInProgress=false;this.config={};this.initialConfig={};this.eventQueue=[];},checkBoolean:function(D){return(typeof D==A.BOOLEAN_TYPE);},checkNumber:function(D){return(!isNaN(D));},fireEvent:function(D,F){var E=this.config[D];if(E&&E.event){E.event.fire(F);}},addProperty:function(E,D){E=E.toLowerCase();this.config[E]=D;D.event=this.createEvent(E,{scope:this.owner});D.event.signature=C.LIST;D.key=E;if(D.handler){D.event.subscribe(D.handler,this.owner);}this.setProperty(E,D.value,true);if(!D.suppressEvent){this.queueProperty(E,D.value);}},getConfig:function(){var D={},F=this.config,G,E;for(G in F){if(B.hasOwnProperty(F,G)){E=F[G];if(E&&E.event){D[G]=E.value;}}}return D;},getProperty:function(D){var E=this.config[D.toLowerCase()];if(E&&E.event){return E.value;}else{return undefined;}},resetProperty:function(D){D=D.toLowerCase();var E=this.config[D];if(E&&E.event){if(this.initialConfig[D]&&!B.isUndefined(this.initialConfig[D])){this.setProperty(D,this.initialConfig[D]);return true;}}else{return false;}},setProperty:function(E,G,D){var F;E=E.toLowerCase();if(this.queueInProgress&&!D){this.queueProperty(E,G);return true;}else{F=this.config[E];if(F&&F.event){if(F.validator&&!F.validator(G)){return false;}else{F.value=G;if(!D){this.fireEvent(E,G);this.configChangedEvent.fire([E,G]);}return true;}}else{return false;}}},queueProperty:function(S,P){S=S.toLowerCase();var R=this.config[S],K=false,J,G,H,I,O,Q,F,M,N,D,L,T,E;if(R&&R.event){if(!B.isUndefined(P)&&R.validator&&!R.validator(P)){return false;}else{if(!B.isUndefined(P)){R.value=P;}else{P=R.value;}K=false;J=this.eventQueue.length;for(L=0;L<J;L++){G=this.eventQueue[L];if(G){H=G[0];I=G[1];if(H==S){this.eventQueue[L]=null;this.eventQueue.push([S,(!B.isUndefined(P)?P:I)]);K=true;break;}}}if(!K&&!B.isUndefined(P)){this.eventQueue.push([S,P]);}}if(R.supercedes){O=R.supercedes.length;for(T=0;T<O;T++){Q=R.supercedes[T];F=this.eventQueue.length;for(E=0;E<F;E++){M=this.eventQueue[E];if(M){N=M[0];D=M[1];if(N==Q.toLowerCase()){this.eventQueue.push([N,D]);this.eventQueue[E]=null;break;}}}}}return true;}else{return false;}},refireEvent:function(D){D=D.toLowerCase();var E=this.config[D];if(E&&E.event&&!B.isUndefined(E.value)){if(this.queueInProgress){this.queueProperty(D);}else{this.fireEvent(D,E.value);}}},applyConfig:function(D,G){var F,E;if(G){E={};for(F in D){if(B.hasOwnProperty(D,F)){E[F.toLowerCase()]=D[F];}}this.initialConfig=E;}for(F in D){if(B.hasOwnProperty(D,F)){this.queueProperty(F,D[F]);}}},refresh:function(){var D;for(D in this.config){if(B.hasOwnProperty(this.config,D)){this.refireEvent(D);}}},fireQueue:function(){var E,H,D,G,F;this.queueInProgress=true;for(E=0;E<this.eventQueue.length;E++){H=this.eventQueue[E];if(H){D=H[0];G=H[1];F=this.config[D];F.value=G;this.eventQueue[E]=null;this.fireEvent(D,G);}}this.queueInProgress=false;this.eventQueue=[];},subscribeToConfigEvent:function(D,E,G,H){var F=this.config[D.toLowerCase()];if(F&&F.event){if(!A.alreadySubscribed(F.event,E,G)){F.event.subscribe(E,G,H);}return true;}else{return false;}},unsubscribeFromConfigEvent:function(D,E,G){var F=this.config[D.toLowerCase()];if(F&&F.event){return F.event.unsubscribe(E,G);}else{return false;}},toString:function(){var D="Config";if(this.owner){D+=" ["+this.owner.toString()+"]";}return D;},outputEventQueue:function(){var D="",G,E,F=this.eventQueue.length;for(E=0;E<F;E++){G=this.eventQueue[E];if(G){D+=G[0]+"="+G[1]+", ";}}return D;},destroy:function(){var E=this.config,D,F;for(D in E){if(B.hasOwnProperty(E,D)){F=E[D];F.event.unsubscribeAll();F.event=null;}}this.configChangedEvent.unsubscribeAll();this.configChangedEvent=null;this.owner=null;this.config=null;this.initialConfig=null;this.eventQueue=null;}};A.alreadySubscribed=function(E,H,I){var F=E.subscribers.length,D,G;if(F>0){G=F-1;do{D=E.subscribers[G];if(D&&D.obj==I&&D.fn==H){return true;}}while(G--);}return false;};YAHOO.lang.augmentProto(A,YAHOO.util.EventProvider);}());YAHOO.widget.DateMath={DAY:"D",WEEK:"W",YEAR:"Y",MONTH:"M",ONE_DAY_MS:1000*60*60*24,WEEK_ONE_JAN_DATE:1,add:function(A,D,C){var F=new Date(A.getTime());switch(D){case this.MONTH:var E=A.getMonth()+C;var B=0;if(E<0){while(E<0){E+=12;B-=1;}}else{if(E>11){while(E>11){E-=12;B+=1;}}}F.setMonth(E);F.setFullYear(A.getFullYear()+B);break;case this.DAY:this._addDays(F,C);break;case this.YEAR:F.setFullYear(A.getFullYear()+C);break;case this.WEEK:this._addDays(F,(C*7));break;}return F;},_addDays:function(D,C){if(YAHOO.env.ua.webkit&&YAHOO.env.ua.webkit<420){if(C<0){for(var B=-128;C<B;C-=B){D.setDate(D.getDate()+B);}}else{for(var A=96;C>A;C-=A){D.setDate(D.getDate()+A);}}}D.setDate(D.getDate()+C);},subtract:function(A,C,B){return this.add(A,C,(B*-1));},before:function(C,B){var A=B.getTime();if(C.getTime()<A){return true;}else{return false;}},after:function(C,B){var A=B.getTime();if(C.getTime()>A){return true;}else{return false;}},between:function(B,A,C){if(this.after(B,A)&&this.before(B,C)){return true;}else{return false;}},getJan1:function(A){return this.getDate(A,0,1);},getDayOffset:function(B,D){var C=this.getJan1(D);var A=Math.ceil((B.getTime()-C.getTime())/this.ONE_DAY_MS);return A;},getWeekNumber:function(D,B,G){B=B||0;G=G||this.WEEK_ONE_JAN_DATE;var H=this.clearTime(D),L,M;if(H.getDay()===B){L=H;}else{L=this.getFirstDayOfWeek(H,B);}var I=L.getFullYear();M=new Date(L.getTime()+6*this.ONE_DAY_MS);var F;if(I!==M.getFullYear()&&M.getDate()>=G){F=1;}else{var E=this.clearTime(this.getDate(I,0,G)),A=this.getFirstDayOfWeek(E,B);var J=Math.round((H.getTime()-A.getTime())/this.ONE_DAY_MS);var K=J%7;var C=(J-K)/7;
F=C+1;}return F;},getFirstDayOfWeek:function(D,A){A=A||0;var B=D.getDay(),C=(B-A+7)%7;return this.subtract(D,this.DAY,C);},isYearOverlapWeek:function(A){var C=false;var B=this.add(A,this.DAY,6);if(B.getFullYear()!=A.getFullYear()){C=true;}return C;},isMonthOverlapWeek:function(A){var C=false;var B=this.add(A,this.DAY,6);if(B.getMonth()!=A.getMonth()){C=true;}return C;},findMonthStart:function(A){var B=this.getDate(A.getFullYear(),A.getMonth(),1);return B;},findMonthEnd:function(B){var D=this.findMonthStart(B);var C=this.add(D,this.MONTH,1);var A=this.subtract(C,this.DAY,1);return A;},clearTime:function(A){A.setHours(12,0,0,0);return A;},getDate:function(D,A,C){var B=null;if(YAHOO.lang.isUndefined(C)){C=1;}if(D>=100){B=new Date(D,A,C);}else{B=new Date();B.setFullYear(D);B.setMonth(A);B.setDate(C);B.setHours(0,0,0,0);}return B;}};(function(){var C=YAHOO.util.Dom,A=YAHOO.util.Event,E=YAHOO.lang,D=YAHOO.widget.DateMath;function F(I,G,H){this.init.apply(this,arguments);}F.IMG_ROOT=null;F.DATE="D";F.MONTH_DAY="MD";F.WEEKDAY="WD";F.RANGE="R";F.MONTH="M";F.DISPLAY_DAYS=42;F.STOP_RENDER="S";F.SHORT="short";F.LONG="long";F.MEDIUM="medium";F.ONE_CHAR="1char";F.DEFAULT_CONFIG={YEAR_OFFSET:{key:"year_offset",value:0,supercedes:["pagedate","selected","mindate","maxdate"]},TODAY:{key:"today",value:new Date(),supercedes:["pagedate"]},PAGEDATE:{key:"pagedate",value:null},SELECTED:{key:"selected",value:[]},TITLE:{key:"title",value:""},CLOSE:{key:"close",value:false},IFRAME:{key:"iframe",value:(YAHOO.env.ua.ie&&YAHOO.env.ua.ie<=6)?true:false},MINDATE:{key:"mindate",value:null},MAXDATE:{key:"maxdate",value:null},MULTI_SELECT:{key:"multi_select",value:false},START_WEEKDAY:{key:"start_weekday",value:0},SHOW_WEEKDAYS:{key:"show_weekdays",value:true},SHOW_WEEK_HEADER:{key:"show_week_header",value:false},SHOW_WEEK_FOOTER:{key:"show_week_footer",value:false},HIDE_BLANK_WEEKS:{key:"hide_blank_weeks",value:false},NAV_ARROW_LEFT:{key:"nav_arrow_left",value:null},NAV_ARROW_RIGHT:{key:"nav_arrow_right",value:null},MONTHS_SHORT:{key:"months_short",value:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]},MONTHS_LONG:{key:"months_long",value:["January","February","March","April","May","June","July","August","September","October","November","December"]},WEEKDAYS_1CHAR:{key:"weekdays_1char",value:["S","M","T","W","T","F","S"]},WEEKDAYS_SHORT:{key:"weekdays_short",value:["Su","Mo","Tu","We","Th","Fr","Sa"]},WEEKDAYS_MEDIUM:{key:"weekdays_medium",value:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]},WEEKDAYS_LONG:{key:"weekdays_long",value:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},LOCALE_MONTHS:{key:"locale_months",value:"long"},LOCALE_WEEKDAYS:{key:"locale_weekdays",value:"short"},DATE_DELIMITER:{key:"date_delimiter",value:","},DATE_FIELD_DELIMITER:{key:"date_field_delimiter",value:"/"},DATE_RANGE_DELIMITER:{key:"date_range_delimiter",value:"-"},MY_MONTH_POSITION:{key:"my_month_position",value:1},MY_YEAR_POSITION:{key:"my_year_position",value:2},MD_MONTH_POSITION:{key:"md_month_position",value:1},MD_DAY_POSITION:{key:"md_day_position",value:2},MDY_MONTH_POSITION:{key:"mdy_month_position",value:1},MDY_DAY_POSITION:{key:"mdy_day_position",value:2},MDY_YEAR_POSITION:{key:"mdy_year_position",value:3},MY_LABEL_MONTH_POSITION:{key:"my_label_month_position",value:1},MY_LABEL_YEAR_POSITION:{key:"my_label_year_position",value:2},MY_LABEL_MONTH_SUFFIX:{key:"my_label_month_suffix",value:" "},MY_LABEL_YEAR_SUFFIX:{key:"my_label_year_suffix",value:""},NAV:{key:"navigator",value:null},STRINGS:{key:"strings",value:{previousMonth:"Previous Month",nextMonth:"Next Month",close:"Close"},supercedes:["close","title"]}};F._DEFAULT_CONFIG=F.DEFAULT_CONFIG;var B=F.DEFAULT_CONFIG;F._EVENT_TYPES={BEFORE_SELECT:"beforeSelect",SELECT:"select",BEFORE_DESELECT:"beforeDeselect",DESELECT:"deselect",CHANGE_PAGE:"changePage",BEFORE_RENDER:"beforeRender",RENDER:"render",BEFORE_DESTROY:"beforeDestroy",DESTROY:"destroy",RESET:"reset",CLEAR:"clear",BEFORE_HIDE:"beforeHide",HIDE:"hide",BEFORE_SHOW:"beforeShow",SHOW:"show",BEFORE_HIDE_NAV:"beforeHideNav",HIDE_NAV:"hideNav",BEFORE_SHOW_NAV:"beforeShowNav",SHOW_NAV:"showNav",BEFORE_RENDER_NAV:"beforeRenderNav",RENDER_NAV:"renderNav"};F.STYLES={CSS_ROW_HEADER:"calrowhead",CSS_ROW_FOOTER:"calrowfoot",CSS_CELL:"calcell",CSS_CELL_SELECTOR:"selector",CSS_CELL_SELECTED:"selected",CSS_CELL_SELECTABLE:"selectable",CSS_CELL_RESTRICTED:"restricted",CSS_CELL_TODAY:"today",CSS_CELL_OOM:"oom",CSS_CELL_OOB:"previous",CSS_HEADER:"calheader",CSS_HEADER_TEXT:"calhead",CSS_BODY:"calbody",CSS_WEEKDAY_CELL:"calweekdaycell",CSS_WEEKDAY_ROW:"calweekdayrow",CSS_FOOTER:"calfoot",CSS_CALENDAR:"yui-calendar",CSS_SINGLE:"single",CSS_CONTAINER:"yui-calcontainer",CSS_NAV_LEFT:"calnavleft",CSS_NAV_RIGHT:"calnavright",CSS_NAV:"calnav",CSS_CLOSE:"calclose",CSS_CELL_TOP:"calcelltop",CSS_CELL_LEFT:"calcellleft",CSS_CELL_RIGHT:"calcellright",CSS_CELL_BOTTOM:"calcellbottom",CSS_CELL_HOVER:"calcellhover",CSS_CELL_HIGHLIGHT1:"highlight1",CSS_CELL_HIGHLIGHT2:"highlight2",CSS_CELL_HIGHLIGHT3:"highlight3",CSS_CELL_HIGHLIGHT4:"highlight4",CSS_WITH_TITLE:"withtitle",CSS_FIXED_SIZE:"fixedsize",CSS_LINK_CLOSE:"link-close"};F._STYLES=F.STYLES;F.prototype={Config:null,parent:null,index:-1,cells:null,cellDates:null,id:null,containerId:null,oDomContainer:null,today:null,renderStack:null,_renderStack:null,oNavigator:null,_selectedDates:null,domEventMap:null,_parseArgs:function(H){var G={id:null,container:null,config:null};if(H&&H.length&&H.length>0){switch(H.length){case 1:G.id=null;G.container=H[0];G.config=null;break;case 2:if(E.isObject(H[1])&&!H[1].tagName&&!(H[1] instanceof String)){G.id=null;G.container=H[0];G.config=H[1];}else{G.id=H[0];G.container=H[1];G.config=null;}break;default:G.id=H[0];G.container=H[1];G.config=H[2];break;}}else{}return G;},init:function(J,H,I){var G=this._parseArgs(arguments);J=G.id;H=G.container;I=G.config;this.oDomContainer=C.get(H);if(!this.oDomContainer.id){this.oDomContainer.id=C.generateId();
}if(!J){J=this.oDomContainer.id+"_t";}this.id=J;this.containerId=this.oDomContainer.id;this.initEvents();this.cfg=new YAHOO.util.Config(this);this.Options={};this.Locale={};this.initStyles();C.addClass(this.oDomContainer,this.Style.CSS_CONTAINER);C.addClass(this.oDomContainer,this.Style.CSS_SINGLE);this.cellDates=[];this.cells=[];this.renderStack=[];this._renderStack=[];this.setupConfig();if(I){this.cfg.applyConfig(I,true);}this.cfg.fireQueue();this.today=this.cfg.getProperty("today");},configIframe:function(I,H,J){var G=H[0];if(!this.parent){if(C.inDocument(this.oDomContainer)){if(G){var K=C.getStyle(this.oDomContainer,"position");if(K=="absolute"||K=="relative"){if(!C.inDocument(this.iframe)){this.iframe=document.createElement("iframe");this.iframe.src="javascript:false;";C.setStyle(this.iframe,"opacity","0");if(YAHOO.env.ua.ie&&YAHOO.env.ua.ie<=6){C.addClass(this.iframe,this.Style.CSS_FIXED_SIZE);}this.oDomContainer.insertBefore(this.iframe,this.oDomContainer.firstChild);}}}else{if(this.iframe){if(this.iframe.parentNode){this.iframe.parentNode.removeChild(this.iframe);}this.iframe=null;}}}}},configTitle:function(H,G,I){var K=G[0];if(K){this.createTitleBar(K);}else{var J=this.cfg.getProperty(B.CLOSE.key);if(!J){this.removeTitleBar();}else{this.createTitleBar("&#160;");}}},configClose:function(H,G,I){var K=G[0],J=this.cfg.getProperty(B.TITLE.key);if(K){if(!J){this.createTitleBar("&#160;");}this.createCloseButton();}else{this.removeCloseButton();if(!J){this.removeTitleBar();}}},initEvents:function(){var G=F._EVENT_TYPES,I=YAHOO.util.CustomEvent,H=this;H.beforeSelectEvent=new I(G.BEFORE_SELECT);H.selectEvent=new I(G.SELECT);H.beforeDeselectEvent=new I(G.BEFORE_DESELECT);H.deselectEvent=new I(G.DESELECT);H.changePageEvent=new I(G.CHANGE_PAGE);H.beforeRenderEvent=new I(G.BEFORE_RENDER);H.renderEvent=new I(G.RENDER);H.beforeDestroyEvent=new I(G.BEFORE_DESTROY);H.destroyEvent=new I(G.DESTROY);H.resetEvent=new I(G.RESET);H.clearEvent=new I(G.CLEAR);H.beforeShowEvent=new I(G.BEFORE_SHOW);H.showEvent=new I(G.SHOW);H.beforeHideEvent=new I(G.BEFORE_HIDE);H.hideEvent=new I(G.HIDE);H.beforeShowNavEvent=new I(G.BEFORE_SHOW_NAV);H.showNavEvent=new I(G.SHOW_NAV);H.beforeHideNavEvent=new I(G.BEFORE_HIDE_NAV);H.hideNavEvent=new I(G.HIDE_NAV);H.beforeRenderNavEvent=new I(G.BEFORE_RENDER_NAV);H.renderNavEvent=new I(G.RENDER_NAV);H.beforeSelectEvent.subscribe(H.onBeforeSelect,this,true);H.selectEvent.subscribe(H.onSelect,this,true);H.beforeDeselectEvent.subscribe(H.onBeforeDeselect,this,true);H.deselectEvent.subscribe(H.onDeselect,this,true);H.changePageEvent.subscribe(H.onChangePage,this,true);H.renderEvent.subscribe(H.onRender,this,true);H.resetEvent.subscribe(H.onReset,this,true);H.clearEvent.subscribe(H.onClear,this,true);},doPreviousMonthNav:function(H,G){A.preventDefault(H);setTimeout(function(){G.previousMonth();var J=C.getElementsByClassName(G.Style.CSS_NAV_LEFT,"a",G.oDomContainer);if(J&&J[0]){try{J[0].focus();}catch(I){}}},0);},doNextMonthNav:function(H,G){A.preventDefault(H);setTimeout(function(){G.nextMonth();var J=C.getElementsByClassName(G.Style.CSS_NAV_RIGHT,"a",G.oDomContainer);if(J&&J[0]){try{J[0].focus();}catch(I){}}},0);},doSelectCell:function(M,G){var R,O,I,L;var N=A.getTarget(M),H=N.tagName.toLowerCase(),K=false;while(H!="td"&&!C.hasClass(N,G.Style.CSS_CELL_SELECTABLE)){if(!K&&H=="a"&&C.hasClass(N,G.Style.CSS_CELL_SELECTOR)){K=true;}N=N.parentNode;H=N.tagName.toLowerCase();if(N==this.oDomContainer||H=="html"){return;}}if(K){A.preventDefault(M);}R=N;if(C.hasClass(R,G.Style.CSS_CELL_SELECTABLE)){L=G.getIndexFromId(R.id);if(L>-1){O=G.cellDates[L];if(O){I=D.getDate(O[0],O[1]-1,O[2]);var Q;if(G.Options.MULTI_SELECT){Q=R.getElementsByTagName("a")[0];if(Q){Q.blur();}var J=G.cellDates[L];var P=G._indexOfSelectedFieldArray(J);if(P>-1){G.deselectCell(L);}else{G.selectCell(L);}}else{Q=R.getElementsByTagName("a")[0];if(Q){Q.blur();}G.selectCell(L);}}}}},doCellMouseOver:function(I,H){var G;if(I){G=A.getTarget(I);}else{G=this;}while(G.tagName&&G.tagName.toLowerCase()!="td"){G=G.parentNode;if(!G.tagName||G.tagName.toLowerCase()=="html"){return;}}if(C.hasClass(G,H.Style.CSS_CELL_SELECTABLE)){C.addClass(G,H.Style.CSS_CELL_HOVER);}},doCellMouseOut:function(I,H){var G;if(I){G=A.getTarget(I);}else{G=this;}while(G.tagName&&G.tagName.toLowerCase()!="td"){G=G.parentNode;if(!G.tagName||G.tagName.toLowerCase()=="html"){return;}}if(C.hasClass(G,H.Style.CSS_CELL_SELECTABLE)){C.removeClass(G,H.Style.CSS_CELL_HOVER);}},setupConfig:function(){var G=this.cfg;G.addProperty(B.TODAY.key,{value:new Date(B.TODAY.value.getTime()),supercedes:B.TODAY.supercedes,handler:this.configToday,suppressEvent:true});G.addProperty(B.PAGEDATE.key,{value:B.PAGEDATE.value||new Date(B.TODAY.value.getTime()),handler:this.configPageDate});G.addProperty(B.SELECTED.key,{value:B.SELECTED.value.concat(),handler:this.configSelected});G.addProperty(B.TITLE.key,{value:B.TITLE.value,handler:this.configTitle});G.addProperty(B.CLOSE.key,{value:B.CLOSE.value,handler:this.configClose});G.addProperty(B.IFRAME.key,{value:B.IFRAME.value,handler:this.configIframe,validator:G.checkBoolean});G.addProperty(B.MINDATE.key,{value:B.MINDATE.value,handler:this.configMinDate});G.addProperty(B.MAXDATE.key,{value:B.MAXDATE.value,handler:this.configMaxDate});G.addProperty(B.MULTI_SELECT.key,{value:B.MULTI_SELECT.value,handler:this.configOptions,validator:G.checkBoolean});G.addProperty(B.START_WEEKDAY.key,{value:B.START_WEEKDAY.value,handler:this.configOptions,validator:G.checkNumber});G.addProperty(B.SHOW_WEEKDAYS.key,{value:B.SHOW_WEEKDAYS.value,handler:this.configOptions,validator:G.checkBoolean});G.addProperty(B.SHOW_WEEK_HEADER.key,{value:B.SHOW_WEEK_HEADER.value,handler:this.configOptions,validator:G.checkBoolean});G.addProperty(B.SHOW_WEEK_FOOTER.key,{value:B.SHOW_WEEK_FOOTER.value,handler:this.configOptions,validator:G.checkBoolean});G.addProperty(B.HIDE_BLANK_WEEKS.key,{value:B.HIDE_BLANK_WEEKS.value,handler:this.configOptions,validator:G.checkBoolean});G.addProperty(B.NAV_ARROW_LEFT.key,{value:B.NAV_ARROW_LEFT.value,handler:this.configOptions});
G.addProperty(B.NAV_ARROW_RIGHT.key,{value:B.NAV_ARROW_RIGHT.value,handler:this.configOptions});G.addProperty(B.MONTHS_SHORT.key,{value:B.MONTHS_SHORT.value,handler:this.configLocale});G.addProperty(B.MONTHS_LONG.key,{value:B.MONTHS_LONG.value,handler:this.configLocale});G.addProperty(B.WEEKDAYS_1CHAR.key,{value:B.WEEKDAYS_1CHAR.value,handler:this.configLocale});G.addProperty(B.WEEKDAYS_SHORT.key,{value:B.WEEKDAYS_SHORT.value,handler:this.configLocale});G.addProperty(B.WEEKDAYS_MEDIUM.key,{value:B.WEEKDAYS_MEDIUM.value,handler:this.configLocale});G.addProperty(B.WEEKDAYS_LONG.key,{value:B.WEEKDAYS_LONG.value,handler:this.configLocale});var H=function(){G.refireEvent(B.LOCALE_MONTHS.key);G.refireEvent(B.LOCALE_WEEKDAYS.key);};G.subscribeToConfigEvent(B.START_WEEKDAY.key,H,this,true);G.subscribeToConfigEvent(B.MONTHS_SHORT.key,H,this,true);G.subscribeToConfigEvent(B.MONTHS_LONG.key,H,this,true);G.subscribeToConfigEvent(B.WEEKDAYS_1CHAR.key,H,this,true);G.subscribeToConfigEvent(B.WEEKDAYS_SHORT.key,H,this,true);G.subscribeToConfigEvent(B.WEEKDAYS_MEDIUM.key,H,this,true);G.subscribeToConfigEvent(B.WEEKDAYS_LONG.key,H,this,true);G.addProperty(B.LOCALE_MONTHS.key,{value:B.LOCALE_MONTHS.value,handler:this.configLocaleValues});G.addProperty(B.LOCALE_WEEKDAYS.key,{value:B.LOCALE_WEEKDAYS.value,handler:this.configLocaleValues});G.addProperty(B.YEAR_OFFSET.key,{value:B.YEAR_OFFSET.value,supercedes:B.YEAR_OFFSET.supercedes,handler:this.configLocale});G.addProperty(B.DATE_DELIMITER.key,{value:B.DATE_DELIMITER.value,handler:this.configLocale});G.addProperty(B.DATE_FIELD_DELIMITER.key,{value:B.DATE_FIELD_DELIMITER.value,handler:this.configLocale});G.addProperty(B.DATE_RANGE_DELIMITER.key,{value:B.DATE_RANGE_DELIMITER.value,handler:this.configLocale});G.addProperty(B.MY_MONTH_POSITION.key,{value:B.MY_MONTH_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MY_YEAR_POSITION.key,{value:B.MY_YEAR_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MD_MONTH_POSITION.key,{value:B.MD_MONTH_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MD_DAY_POSITION.key,{value:B.MD_DAY_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MDY_MONTH_POSITION.key,{value:B.MDY_MONTH_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MDY_DAY_POSITION.key,{value:B.MDY_DAY_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MDY_YEAR_POSITION.key,{value:B.MDY_YEAR_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MY_LABEL_MONTH_POSITION.key,{value:B.MY_LABEL_MONTH_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MY_LABEL_YEAR_POSITION.key,{value:B.MY_LABEL_YEAR_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MY_LABEL_MONTH_SUFFIX.key,{value:B.MY_LABEL_MONTH_SUFFIX.value,handler:this.configLocale});G.addProperty(B.MY_LABEL_YEAR_SUFFIX.key,{value:B.MY_LABEL_YEAR_SUFFIX.value,handler:this.configLocale});G.addProperty(B.NAV.key,{value:B.NAV.value,handler:this.configNavigator});G.addProperty(B.STRINGS.key,{value:B.STRINGS.value,handler:this.configStrings,validator:function(I){return E.isObject(I);},supercedes:B.STRINGS.supercedes});},configStrings:function(H,G,I){var J=E.merge(B.STRINGS.value,G[0]);this.cfg.setProperty(B.STRINGS.key,J,true);},configPageDate:function(H,G,I){this.cfg.setProperty(B.PAGEDATE.key,this._parsePageDate(G[0]),true);},configMinDate:function(H,G,I){var J=G[0];if(E.isString(J)){J=this._parseDate(J);this.cfg.setProperty(B.MINDATE.key,D.getDate(J[0],(J[1]-1),J[2]));}},configMaxDate:function(H,G,I){var J=G[0];if(E.isString(J)){J=this._parseDate(J);this.cfg.setProperty(B.MAXDATE.key,D.getDate(J[0],(J[1]-1),J[2]));}},configToday:function(I,H,J){var K=H[0];if(E.isString(K)){K=this._parseDate(K);}var G=D.clearTime(K);if(!this.cfg.initialConfig[B.PAGEDATE.key]){this.cfg.setProperty(B.PAGEDATE.key,G);}this.today=G;this.cfg.setProperty(B.TODAY.key,G,true);},configSelected:function(I,G,K){var H=G[0],J=B.SELECTED.key;if(H){if(E.isString(H)){this.cfg.setProperty(J,this._parseDates(H),true);}}if(!this._selectedDates){this._selectedDates=this.cfg.getProperty(J);}},configOptions:function(H,G,I){this.Options[H.toUpperCase()]=G[0];},configLocale:function(H,G,I){this.Locale[H.toUpperCase()]=G[0];this.cfg.refireEvent(B.LOCALE_MONTHS.key);this.cfg.refireEvent(B.LOCALE_WEEKDAYS.key);},configLocaleValues:function(J,I,K){J=J.toLowerCase();var M=I[0],H=this.cfg,N=this.Locale;switch(J){case B.LOCALE_MONTHS.key:switch(M){case F.SHORT:N.LOCALE_MONTHS=H.getProperty(B.MONTHS_SHORT.key).concat();break;case F.LONG:N.LOCALE_MONTHS=H.getProperty(B.MONTHS_LONG.key).concat();break;}break;case B.LOCALE_WEEKDAYS.key:switch(M){case F.ONE_CHAR:N.LOCALE_WEEKDAYS=H.getProperty(B.WEEKDAYS_1CHAR.key).concat();break;case F.SHORT:N.LOCALE_WEEKDAYS=H.getProperty(B.WEEKDAYS_SHORT.key).concat();break;case F.MEDIUM:N.LOCALE_WEEKDAYS=H.getProperty(B.WEEKDAYS_MEDIUM.key).concat();break;case F.LONG:N.LOCALE_WEEKDAYS=H.getProperty(B.WEEKDAYS_LONG.key).concat();break;}var L=H.getProperty(B.START_WEEKDAY.key);if(L>0){for(var G=0;G<L;++G){N.LOCALE_WEEKDAYS.push(N.LOCALE_WEEKDAYS.shift());}}break;}},configNavigator:function(H,G,I){var J=G[0];if(YAHOO.widget.CalendarNavigator&&(J===true||E.isObject(J))){if(!this.oNavigator){this.oNavigator=new YAHOO.widget.CalendarNavigator(this);this.beforeRenderEvent.subscribe(function(){if(!this.pages){this.oNavigator.erase();}},this,true);}}else{if(this.oNavigator){this.oNavigator.destroy();this.oNavigator=null;}}},initStyles:function(){var G=F.STYLES;this.Style={CSS_ROW_HEADER:G.CSS_ROW_HEADER,CSS_ROW_FOOTER:G.CSS_ROW_FOOTER,CSS_CELL:G.CSS_CELL,CSS_CELL_SELECTOR:G.CSS_CELL_SELECTOR,CSS_CELL_SELECTED:G.CSS_CELL_SELECTED,CSS_CELL_SELECTABLE:G.CSS_CELL_SELECTABLE,CSS_CELL_RESTRICTED:G.CSS_CELL_RESTRICTED,CSS_CELL_TODAY:G.CSS_CELL_TODAY,CSS_CELL_OOM:G.CSS_CELL_OOM,CSS_CELL_OOB:G.CSS_CELL_OOB,CSS_HEADER:G.CSS_HEADER,CSS_HEADER_TEXT:G.CSS_HEADER_TEXT,CSS_BODY:G.CSS_BODY,CSS_WEEKDAY_CELL:G.CSS_WEEKDAY_CELL,CSS_WEEKDAY_ROW:G.CSS_WEEKDAY_ROW,CSS_FOOTER:G.CSS_FOOTER,CSS_CALENDAR:G.CSS_CALENDAR,CSS_SINGLE:G.CSS_SINGLE,CSS_CONTAINER:G.CSS_CONTAINER,CSS_NAV_LEFT:G.CSS_NAV_LEFT,CSS_NAV_RIGHT:G.CSS_NAV_RIGHT,CSS_NAV:G.CSS_NAV,CSS_CLOSE:G.CSS_CLOSE,CSS_CELL_TOP:G.CSS_CELL_TOP,CSS_CELL_LEFT:G.CSS_CELL_LEFT,CSS_CELL_RIGHT:G.CSS_CELL_RIGHT,CSS_CELL_BOTTOM:G.CSS_CELL_BOTTOM,CSS_CELL_HOVER:G.CSS_CELL_HOVER,CSS_CELL_HIGHLIGHT1:G.CSS_CELL_HIGHLIGHT1,CSS_CELL_HIGHLIGHT2:G.CSS_CELL_HIGHLIGHT2,CSS_CELL_HIGHLIGHT3:G.CSS_CELL_HIGHLIGHT3,CSS_CELL_HIGHLIGHT4:G.CSS_CELL_HIGHLIGHT4,CSS_WITH_TITLE:G.CSS_WITH_TITLE,CSS_FIXED_SIZE:G.CSS_FIXED_SIZE,CSS_LINK_CLOSE:G.CSS_LINK_CLOSE};
},buildMonthLabel:function(){return this._buildMonthLabel(this.cfg.getProperty(B.PAGEDATE.key));},_buildMonthLabel:function(G){var I=this.Locale.LOCALE_MONTHS[G.getMonth()]+this.Locale.MY_LABEL_MONTH_SUFFIX,H=(G.getFullYear()+this.Locale.YEAR_OFFSET)+this.Locale.MY_LABEL_YEAR_SUFFIX;if(this.Locale.MY_LABEL_MONTH_POSITION==2||this.Locale.MY_LABEL_YEAR_POSITION==1){return H+I;}else{return I+H;}},buildDayLabel:function(G){return G.getDate();},createTitleBar:function(G){var H=C.getElementsByClassName(YAHOO.widget.CalendarGroup.CSS_2UPTITLE,"div",this.oDomContainer)[0]||document.createElement("div");H.className=YAHOO.widget.CalendarGroup.CSS_2UPTITLE;H.innerHTML=G;this.oDomContainer.insertBefore(H,this.oDomContainer.firstChild);C.addClass(this.oDomContainer,this.Style.CSS_WITH_TITLE);return H;},removeTitleBar:function(){var G=C.getElementsByClassName(YAHOO.widget.CalendarGroup.CSS_2UPTITLE,"div",this.oDomContainer)[0]||null;if(G){A.purgeElement(G);this.oDomContainer.removeChild(G);}C.removeClass(this.oDomContainer,this.Style.CSS_WITH_TITLE);},createCloseButton:function(){var K=YAHOO.widget.CalendarGroup.CSS_2UPCLOSE,J=this.Style.CSS_LINK_CLOSE,M="us/my/bn/x_d.gif",L=C.getElementsByClassName(J,"a",this.oDomContainer)[0],G=this.cfg.getProperty(B.STRINGS.key),H=(G&&G.close)?G.close:"";if(!L){L=document.createElement("a");A.addListener(L,"click",function(O,N){N.hide();A.preventDefault(O);},this);}L.href="#";L.className=J;if(F.IMG_ROOT!==null){var I=C.getElementsByClassName(K,"img",L)[0]||document.createElement("img");I.src=F.IMG_ROOT+M;I.className=K;L.appendChild(I);}else{L.innerHTML='<span class="'+K+" "+this.Style.CSS_CLOSE+'">'+H+"</span>";}this.oDomContainer.appendChild(L);return L;},removeCloseButton:function(){var G=C.getElementsByClassName(this.Style.CSS_LINK_CLOSE,"a",this.oDomContainer)[0]||null;if(G){A.purgeElement(G);this.oDomContainer.removeChild(G);}},renderHeader:function(Q){var P=7,O="us/tr/callt.gif",G="us/tr/calrt.gif",N=this.cfg,K=N.getProperty(B.PAGEDATE.key),L=N.getProperty(B.STRINGS.key),V=(L&&L.previousMonth)?L.previousMonth:"",H=(L&&L.nextMonth)?L.nextMonth:"",M;if(N.getProperty(B.SHOW_WEEK_HEADER.key)){P+=1;}if(N.getProperty(B.SHOW_WEEK_FOOTER.key)){P+=1;}Q[Q.length]="<thead>";Q[Q.length]="<tr>";Q[Q.length]='<th colspan="'+P+'" class="'+this.Style.CSS_HEADER_TEXT+'">';Q[Q.length]='<div class="'+this.Style.CSS_HEADER+'">';var X,U=false;if(this.parent){if(this.index===0){X=true;}if(this.index==(this.parent.cfg.getProperty("pages")-1)){U=true;}}else{X=true;U=true;}if(X){M=this._buildMonthLabel(D.subtract(K,D.MONTH,1));var R=N.getProperty(B.NAV_ARROW_LEFT.key);if(R===null&&F.IMG_ROOT!==null){R=F.IMG_ROOT+O;}var I=(R===null)?"":' style="background-image:url('+R+')"';Q[Q.length]='<a class="'+this.Style.CSS_NAV_LEFT+'"'+I+' href="#">'+V+" ("+M+")"+"</a>";}var W=this.buildMonthLabel();var S=this.parent||this;if(S.cfg.getProperty("navigator")){W='<a class="'+this.Style.CSS_NAV+'" href="#">'+W+"</a>";}Q[Q.length]=W;if(U){M=this._buildMonthLabel(D.add(K,D.MONTH,1));var T=N.getProperty(B.NAV_ARROW_RIGHT.key);if(T===null&&F.IMG_ROOT!==null){T=F.IMG_ROOT+G;}var J=(T===null)?"":' style="background-image:url('+T+')"';Q[Q.length]='<a class="'+this.Style.CSS_NAV_RIGHT+'"'+J+' href="#">'+H+" ("+M+")"+"</a>";}Q[Q.length]="</div>\n</th>\n</tr>";if(N.getProperty(B.SHOW_WEEKDAYS.key)){Q=this.buildWeekdays(Q);}Q[Q.length]="</thead>";return Q;},buildWeekdays:function(H){H[H.length]='<tr class="'+this.Style.CSS_WEEKDAY_ROW+'">';if(this.cfg.getProperty(B.SHOW_WEEK_HEADER.key)){H[H.length]="<th>&#160;</th>";}for(var G=0;G<this.Locale.LOCALE_WEEKDAYS.length;++G){H[H.length]='<th class="'+this.Style.CSS_WEEKDAY_CELL+'">'+this.Locale.LOCALE_WEEKDAYS[G]+"</th>";}if(this.cfg.getProperty(B.SHOW_WEEK_FOOTER.key)){H[H.length]="<th>&#160;</th>";}H[H.length]="</tr>";return H;},renderBody:function(m,k){var AK=this.cfg.getProperty(B.START_WEEKDAY.key);this.preMonthDays=m.getDay();if(AK>0){this.preMonthDays-=AK;}if(this.preMonthDays<0){this.preMonthDays+=7;}this.monthDays=D.findMonthEnd(m).getDate();this.postMonthDays=F.DISPLAY_DAYS-this.preMonthDays-this.monthDays;m=D.subtract(m,D.DAY,this.preMonthDays);var Y,N,M="w",f="_cell",c="wd",w="d",P,u,AC=this.today,O=this.cfg,W=AC.getFullYear(),v=AC.getMonth(),J=AC.getDate(),AB=O.getProperty(B.PAGEDATE.key),I=O.getProperty(B.HIDE_BLANK_WEEKS.key),j=O.getProperty(B.SHOW_WEEK_FOOTER.key),b=O.getProperty(B.SHOW_WEEK_HEADER.key),U=O.getProperty(B.MINDATE.key),a=O.getProperty(B.MAXDATE.key),T=this.Locale.YEAR_OFFSET;if(U){U=D.clearTime(U);}if(a){a=D.clearTime(a);}k[k.length]='<tbody class="m'+(AB.getMonth()+1)+" "+this.Style.CSS_BODY+'">';var AI=0,Q=document.createElement("div"),l=document.createElement("td");Q.appendChild(l);var AA=this.parent||this;for(var AE=0;AE<6;AE++){Y=D.getWeekNumber(m,AK);N=M+Y;if(AE!==0&&I===true&&m.getMonth()!=AB.getMonth()){break;}else{k[k.length]='<tr class="'+N+'">';if(b){k=this.renderRowHeader(Y,k);}for(var AJ=0;AJ<7;AJ++){P=[];this.clearElement(l);l.className=this.Style.CSS_CELL;l.id=this.id+f+AI;if(m.getDate()==J&&m.getMonth()==v&&m.getFullYear()==W){P[P.length]=AA.renderCellStyleToday;}var Z=[m.getFullYear(),m.getMonth()+1,m.getDate()];this.cellDates[this.cellDates.length]=Z;if(m.getMonth()!=AB.getMonth()){P[P.length]=AA.renderCellNotThisMonth;}else{C.addClass(l,c+m.getDay());C.addClass(l,w+m.getDate());for(var AD=0;AD<this.renderStack.length;++AD){u=null;var y=this.renderStack[AD],AL=y[0],H,e,L;switch(AL){case F.DATE:H=y[1][1];e=y[1][2];L=y[1][0];if(m.getMonth()+1==H&&m.getDate()==e&&m.getFullYear()==L){u=y[2];this.renderStack.splice(AD,1);}break;case F.MONTH_DAY:H=y[1][0];e=y[1][1];if(m.getMonth()+1==H&&m.getDate()==e){u=y[2];this.renderStack.splice(AD,1);}break;case F.RANGE:var h=y[1][0],g=y[1][1],n=h[1],S=h[2],X=h[0],AH=D.getDate(X,n-1,S),K=g[1],q=g[2],G=g[0],AG=D.getDate(G,K-1,q);if(m.getTime()>=AH.getTime()&&m.getTime()<=AG.getTime()){u=y[2];if(m.getTime()==AG.getTime()){this.renderStack.splice(AD,1);}}break;case F.WEEKDAY:var R=y[1][0];
if(m.getDay()+1==R){u=y[2];}break;case F.MONTH:H=y[1][0];if(m.getMonth()+1==H){u=y[2];}break;}if(u){P[P.length]=u;}}}if(this._indexOfSelectedFieldArray(Z)>-1){P[P.length]=AA.renderCellStyleSelected;}if((U&&(m.getTime()<U.getTime()))||(a&&(m.getTime()>a.getTime()))){P[P.length]=AA.renderOutOfBoundsDate;}else{P[P.length]=AA.styleCellDefault;P[P.length]=AA.renderCellDefault;}for(var z=0;z<P.length;++z){if(P[z].call(AA,m,l)==F.STOP_RENDER){break;}}m.setTime(m.getTime()+D.ONE_DAY_MS);m=D.clearTime(m);if(AI>=0&&AI<=6){C.addClass(l,this.Style.CSS_CELL_TOP);}if((AI%7)===0){C.addClass(l,this.Style.CSS_CELL_LEFT);}if(((AI+1)%7)===0){C.addClass(l,this.Style.CSS_CELL_RIGHT);}var o=this.postMonthDays;if(I&&o>=7){var V=Math.floor(o/7);for(var AF=0;AF<V;++AF){o-=7;}}if(AI>=((this.preMonthDays+o+this.monthDays)-7)){C.addClass(l,this.Style.CSS_CELL_BOTTOM);}k[k.length]=Q.innerHTML;AI++;}if(j){k=this.renderRowFooter(Y,k);}k[k.length]="</tr>";}}k[k.length]="</tbody>";return k;},renderFooter:function(G){return G;},render:function(){this.beforeRenderEvent.fire();var H=D.findMonthStart(this.cfg.getProperty(B.PAGEDATE.key));this.resetRenderers();this.cellDates.length=0;A.purgeElement(this.oDomContainer,true);var G=[];G[G.length]='<table cellSpacing="0" class="'+this.Style.CSS_CALENDAR+" y"+(H.getFullYear()+this.Locale.YEAR_OFFSET)+'" id="'+this.id+'">';G=this.renderHeader(G);G=this.renderBody(H,G);G=this.renderFooter(G);G[G.length]="</table>";this.oDomContainer.innerHTML=G.join("\n");this.applyListeners();this.cells=C.getElementsByClassName(this.Style.CSS_CELL,"td",this.id);this.cfg.refireEvent(B.TITLE.key);this.cfg.refireEvent(B.CLOSE.key);this.cfg.refireEvent(B.IFRAME.key);this.renderEvent.fire();},applyListeners:function(){var P=this.oDomContainer,H=this.parent||this,L="a",S="click";var M=C.getElementsByClassName(this.Style.CSS_NAV_LEFT,L,P),I=C.getElementsByClassName(this.Style.CSS_NAV_RIGHT,L,P);if(M&&M.length>0){this.linkLeft=M[0];A.addListener(this.linkLeft,S,this.doPreviousMonthNav,H,true);}if(I&&I.length>0){this.linkRight=I[0];A.addListener(this.linkRight,S,this.doNextMonthNav,H,true);}if(H.cfg.getProperty("navigator")!==null){this.applyNavListeners();}if(this.domEventMap){var J,G;for(var R in this.domEventMap){if(E.hasOwnProperty(this.domEventMap,R)){var N=this.domEventMap[R];if(!(N instanceof Array)){N=[N];}for(var K=0;K<N.length;K++){var Q=N[K];G=C.getElementsByClassName(R,Q.tag,this.oDomContainer);for(var O=0;O<G.length;O++){J=G[O];A.addListener(J,Q.event,Q.handler,Q.scope,Q.correct);}}}}}A.addListener(this.oDomContainer,"click",this.doSelectCell,this);A.addListener(this.oDomContainer,"mouseover",this.doCellMouseOver,this);A.addListener(this.oDomContainer,"mouseout",this.doCellMouseOut,this);},applyNavListeners:function(){var H=this.parent||this,I=this,G=C.getElementsByClassName(this.Style.CSS_NAV,"a",this.oDomContainer);if(G.length>0){A.addListener(G,"click",function(N,M){var L=A.getTarget(N);if(this===L||C.isAncestor(this,L)){A.preventDefault(N);}var J=H.oNavigator;if(J){var K=I.cfg.getProperty("pagedate");J.setYear(K.getFullYear()+I.Locale.YEAR_OFFSET);J.setMonth(K.getMonth());J.show();}});}},getDateByCellId:function(H){var G=this.getDateFieldsByCellId(H);return(G)?D.getDate(G[0],G[1]-1,G[2]):null;},getDateFieldsByCellId:function(G){G=this.getIndexFromId(G);return(G>-1)?this.cellDates[G]:null;},getCellIndex:function(I){var H=-1;if(I){var G=I.getMonth(),N=I.getFullYear(),M=I.getDate(),K=this.cellDates;for(var J=0;J<K.length;++J){var L=K[J];if(L[0]===N&&L[1]===G+1&&L[2]===M){H=J;break;}}}return H;},getIndexFromId:function(I){var H=-1,G=I.lastIndexOf("_cell");if(G>-1){H=parseInt(I.substring(G+5),10);}return H;},renderOutOfBoundsDate:function(H,G){C.addClass(G,this.Style.CSS_CELL_OOB);G.innerHTML=H.getDate();return F.STOP_RENDER;},renderRowHeader:function(H,G){G[G.length]='<th class="'+this.Style.CSS_ROW_HEADER+'">'+H+"</th>";return G;},renderRowFooter:function(H,G){G[G.length]='<th class="'+this.Style.CSS_ROW_FOOTER+'">'+H+"</th>";return G;},renderCellDefault:function(H,G){G.innerHTML='<a href="#" class="'+this.Style.CSS_CELL_SELECTOR+'">'+this.buildDayLabel(H)+"</a>";},styleCellDefault:function(H,G){C.addClass(G,this.Style.CSS_CELL_SELECTABLE);},renderCellStyleHighlight1:function(H,G){C.addClass(G,this.Style.CSS_CELL_HIGHLIGHT1);},renderCellStyleHighlight2:function(H,G){C.addClass(G,this.Style.CSS_CELL_HIGHLIGHT2);},renderCellStyleHighlight3:function(H,G){C.addClass(G,this.Style.CSS_CELL_HIGHLIGHT3);},renderCellStyleHighlight4:function(H,G){C.addClass(G,this.Style.CSS_CELL_HIGHLIGHT4);},renderCellStyleToday:function(H,G){C.addClass(G,this.Style.CSS_CELL_TODAY);},renderCellStyleSelected:function(H,G){C.addClass(G,this.Style.CSS_CELL_SELECTED);},renderCellNotThisMonth:function(H,G){C.addClass(G,this.Style.CSS_CELL_OOM);G.innerHTML=H.getDate();return F.STOP_RENDER;},renderBodyCellRestricted:function(H,G){C.addClass(G,this.Style.CSS_CELL);C.addClass(G,this.Style.CSS_CELL_RESTRICTED);G.innerHTML=H.getDate();return F.STOP_RENDER;},addMonths:function(I){var H=B.PAGEDATE.key,J=this.cfg.getProperty(H),G=D.add(J,D.MONTH,I);this.cfg.setProperty(H,G);this.resetRenderers();this.changePageEvent.fire(J,G);},subtractMonths:function(G){this.addMonths(-1*G);},addYears:function(I){var H=B.PAGEDATE.key,J=this.cfg.getProperty(H),G=D.add(J,D.YEAR,I);this.cfg.setProperty(H,G);this.resetRenderers();this.changePageEvent.fire(J,G);},subtractYears:function(G){this.addYears(-1*G);},nextMonth:function(){this.addMonths(1);},previousMonth:function(){this.addMonths(-1);},nextYear:function(){this.addYears(1);},previousYear:function(){this.addYears(-1);},reset:function(){this.cfg.resetProperty(B.SELECTED.key);this.cfg.resetProperty(B.PAGEDATE.key);this.resetEvent.fire();},clear:function(){this.cfg.setProperty(B.SELECTED.key,[]);this.cfg.setProperty(B.PAGEDATE.key,new Date(this.today.getTime()));this.clearEvent.fire();},select:function(I){var L=this._toFieldArray(I),H=[],K=[],M=B.SELECTED.key;for(var G=0;G<L.length;++G){var J=L[G];
if(!this.isDateOOB(this._toDate(J))){if(H.length===0){this.beforeSelectEvent.fire();K=this.cfg.getProperty(M);}H.push(J);if(this._indexOfSelectedFieldArray(J)==-1){K[K.length]=J;}}}if(H.length>0){if(this.parent){this.parent.cfg.setProperty(M,K);}else{this.cfg.setProperty(M,K);}this.selectEvent.fire(H);}return this.getSelectedDates();},selectCell:function(J){var H=this.cells[J],N=this.cellDates[J],M=this._toDate(N),I=C.hasClass(H,this.Style.CSS_CELL_SELECTABLE);if(I){this.beforeSelectEvent.fire();var L=B.SELECTED.key;var K=this.cfg.getProperty(L);var G=N.concat();if(this._indexOfSelectedFieldArray(G)==-1){K[K.length]=G;}if(this.parent){this.parent.cfg.setProperty(L,K);}else{this.cfg.setProperty(L,K);}this.renderCellStyleSelected(M,H);this.selectEvent.fire([G]);this.doCellMouseOut.call(H,null,this);}return this.getSelectedDates();},deselect:function(K){var G=this._toFieldArray(K),J=[],M=[],N=B.SELECTED.key;for(var H=0;H<G.length;++H){var L=G[H];if(!this.isDateOOB(this._toDate(L))){if(J.length===0){this.beforeDeselectEvent.fire();M=this.cfg.getProperty(N);}J.push(L);var I=this._indexOfSelectedFieldArray(L);if(I!=-1){M.splice(I,1);}}}if(J.length>0){if(this.parent){this.parent.cfg.setProperty(N,M);}else{this.cfg.setProperty(N,M);}this.deselectEvent.fire(J);}return this.getSelectedDates();},deselectCell:function(K){var H=this.cells[K],N=this.cellDates[K],I=this._indexOfSelectedFieldArray(N);var J=C.hasClass(H,this.Style.CSS_CELL_SELECTABLE);if(J){this.beforeDeselectEvent.fire();var L=this.cfg.getProperty(B.SELECTED.key),M=this._toDate(N),G=N.concat();if(I>-1){if(this.cfg.getProperty(B.PAGEDATE.key).getMonth()==M.getMonth()&&this.cfg.getProperty(B.PAGEDATE.key).getFullYear()==M.getFullYear()){C.removeClass(H,this.Style.CSS_CELL_SELECTED);}L.splice(I,1);}if(this.parent){this.parent.cfg.setProperty(B.SELECTED.key,L);}else{this.cfg.setProperty(B.SELECTED.key,L);}this.deselectEvent.fire([G]);}return this.getSelectedDates();},deselectAll:function(){this.beforeDeselectEvent.fire();var J=B.SELECTED.key,G=this.cfg.getProperty(J),H=G.length,I=G.concat();if(this.parent){this.parent.cfg.setProperty(J,[]);}else{this.cfg.setProperty(J,[]);}if(H>0){this.deselectEvent.fire(I);}return this.getSelectedDates();},_toFieldArray:function(H){var G=[];if(H instanceof Date){G=[[H.getFullYear(),H.getMonth()+1,H.getDate()]];}else{if(E.isString(H)){G=this._parseDates(H);}else{if(E.isArray(H)){for(var I=0;I<H.length;++I){var J=H[I];G[G.length]=[J.getFullYear(),J.getMonth()+1,J.getDate()];}}}}return G;},toDate:function(G){return this._toDate(G);},_toDate:function(G){if(G instanceof Date){return G;}else{return D.getDate(G[0],G[1]-1,G[2]);}},_fieldArraysAreEqual:function(I,H){var G=false;if(I[0]==H[0]&&I[1]==H[1]&&I[2]==H[2]){G=true;}return G;},_indexOfSelectedFieldArray:function(K){var J=-1,G=this.cfg.getProperty(B.SELECTED.key);for(var I=0;I<G.length;++I){var H=G[I];if(K[0]==H[0]&&K[1]==H[1]&&K[2]==H[2]){J=I;break;}}return J;},isDateOOM:function(G){return(G.getMonth()!=this.cfg.getProperty(B.PAGEDATE.key).getMonth());},isDateOOB:function(I){var J=this.cfg.getProperty(B.MINDATE.key),K=this.cfg.getProperty(B.MAXDATE.key),H=D;if(J){J=H.clearTime(J);}if(K){K=H.clearTime(K);}var G=new Date(I.getTime());G=H.clearTime(G);return((J&&G.getTime()<J.getTime())||(K&&G.getTime()>K.getTime()));},_parsePageDate:function(G){var J;if(G){if(G instanceof Date){J=D.findMonthStart(G);}else{var K,I,H;H=G.split(this.cfg.getProperty(B.DATE_FIELD_DELIMITER.key));K=parseInt(H[this.cfg.getProperty(B.MY_MONTH_POSITION.key)-1],10)-1;I=parseInt(H[this.cfg.getProperty(B.MY_YEAR_POSITION.key)-1],10)-this.Locale.YEAR_OFFSET;J=D.getDate(I,K,1);}}else{J=D.getDate(this.today.getFullYear(),this.today.getMonth(),1);}return J;},onBeforeSelect:function(){if(this.cfg.getProperty(B.MULTI_SELECT.key)===false){if(this.parent){this.parent.callChildFunction("clearAllBodyCellStyles",this.Style.CSS_CELL_SELECTED);this.parent.deselectAll();}else{this.clearAllBodyCellStyles(this.Style.CSS_CELL_SELECTED);this.deselectAll();}}},onSelect:function(G){},onBeforeDeselect:function(){},onDeselect:function(G){},onChangePage:function(){this.render();},onRender:function(){},onReset:function(){this.render();},onClear:function(){this.render();},validate:function(){return true;},_parseDate:function(I){var J=I.split(this.Locale.DATE_FIELD_DELIMITER),G;if(J.length==2){G=[J[this.Locale.MD_MONTH_POSITION-1],J[this.Locale.MD_DAY_POSITION-1]];G.type=F.MONTH_DAY;}else{G=[J[this.Locale.MDY_YEAR_POSITION-1]-this.Locale.YEAR_OFFSET,J[this.Locale.MDY_MONTH_POSITION-1],J[this.Locale.MDY_DAY_POSITION-1]];G.type=F.DATE;}for(var H=0;H<G.length;H++){G[H]=parseInt(G[H],10);}return G;},_parseDates:function(H){var O=[],N=H.split(this.Locale.DATE_DELIMITER);for(var M=0;M<N.length;++M){var L=N[M];if(L.indexOf(this.Locale.DATE_RANGE_DELIMITER)!=-1){var G=L.split(this.Locale.DATE_RANGE_DELIMITER),K=this._parseDate(G[0]),P=this._parseDate(G[1]),J=this._parseRange(K,P);O=O.concat(J);}else{var I=this._parseDate(L);O.push(I);}}return O;},_parseRange:function(G,K){var H=D.add(D.getDate(G[0],G[1]-1,G[2]),D.DAY,1),J=D.getDate(K[0],K[1]-1,K[2]),I=[];I.push(G);while(H.getTime()<=J.getTime()){I.push([H.getFullYear(),H.getMonth()+1,H.getDate()]);H=D.add(H,D.DAY,1);}return I;},resetRenderers:function(){this.renderStack=this._renderStack.concat();},removeRenderers:function(){this._renderStack=[];this.renderStack=[];},clearElement:function(G){G.innerHTML="&#160;";G.className="";},addRenderer:function(G,H){var J=this._parseDates(G);for(var I=0;I<J.length;++I){var K=J[I];if(K.length==2){if(K[0] instanceof Array){this._addRenderer(F.RANGE,K,H);}else{this._addRenderer(F.MONTH_DAY,K,H);}}else{if(K.length==3){this._addRenderer(F.DATE,K,H);}}}},_addRenderer:function(H,I,G){var J=[H,I,G];this.renderStack.unshift(J);this._renderStack=this.renderStack.concat();},addMonthRenderer:function(H,G){this._addRenderer(F.MONTH,[H],G);},addWeekdayRenderer:function(H,G){this._addRenderer(F.WEEKDAY,[H],G);},clearAllBodyCellStyles:function(G){for(var H=0;
H<this.cells.length;++H){C.removeClass(this.cells[H],G);}},setMonth:function(I){var G=B.PAGEDATE.key,H=this.cfg.getProperty(G);H.setMonth(parseInt(I,10));this.cfg.setProperty(G,H);},setYear:function(H){var G=B.PAGEDATE.key,I=this.cfg.getProperty(G);I.setFullYear(parseInt(H,10)-this.Locale.YEAR_OFFSET);this.cfg.setProperty(G,I);},getSelectedDates:function(){var I=[],H=this.cfg.getProperty(B.SELECTED.key);for(var K=0;K<H.length;++K){var J=H[K];var G=D.getDate(J[0],J[1]-1,J[2]);I.push(G);}I.sort(function(M,L){return M-L;});return I;},hide:function(){if(this.beforeHideEvent.fire()){this.oDomContainer.style.display="none";this.hideEvent.fire();}},show:function(){if(this.beforeShowEvent.fire()){this.oDomContainer.style.display="block";this.showEvent.fire();}},browser:(function(){var G=navigator.userAgent.toLowerCase();if(G.indexOf("opera")!=-1){return"opera";}else{if(G.indexOf("msie 7")!=-1){return"ie7";}else{if(G.indexOf("msie")!=-1){return"ie";}else{if(G.indexOf("safari")!=-1){return"safari";}else{if(G.indexOf("gecko")!=-1){return"gecko";}else{return false;}}}}}})(),toString:function(){return"Calendar "+this.id;},destroy:function(){if(this.beforeDestroyEvent.fire()){var G=this;if(G.navigator){G.navigator.destroy();}if(G.cfg){G.cfg.destroy();}A.purgeElement(G.oDomContainer,true);C.removeClass(G.oDomContainer,G.Style.CSS_WITH_TITLE);C.removeClass(G.oDomContainer,G.Style.CSS_CONTAINER);C.removeClass(G.oDomContainer,G.Style.CSS_SINGLE);G.oDomContainer.innerHTML="";G.oDomContainer=null;G.cells=null;this.destroyEvent.fire();}}};YAHOO.widget.Calendar=F;YAHOO.widget.Calendar_Core=YAHOO.widget.Calendar;YAHOO.widget.Cal_Core=YAHOO.widget.Calendar;})();(function(){var D=YAHOO.util.Dom,F=YAHOO.widget.DateMath,A=YAHOO.util.Event,E=YAHOO.lang,G=YAHOO.widget.Calendar;function B(J,H,I){if(arguments.length>0){this.init.apply(this,arguments);}}B.DEFAULT_CONFIG=B._DEFAULT_CONFIG=G.DEFAULT_CONFIG;B.DEFAULT_CONFIG.PAGES={key:"pages",value:2};var C=B.DEFAULT_CONFIG;B.prototype={init:function(K,I,J){var H=this._parseArgs(arguments);K=H.id;I=H.container;J=H.config;this.oDomContainer=D.get(I);if(!this.oDomContainer.id){this.oDomContainer.id=D.generateId();}if(!K){K=this.oDomContainer.id+"_t";}this.id=K;this.containerId=this.oDomContainer.id;this.initEvents();this.initStyles();this.pages=[];D.addClass(this.oDomContainer,B.CSS_CONTAINER);D.addClass(this.oDomContainer,B.CSS_MULTI_UP);this.cfg=new YAHOO.util.Config(this);this.Options={};this.Locale={};this.setupConfig();if(J){this.cfg.applyConfig(J,true);}this.cfg.fireQueue();if(YAHOO.env.ua.opera){this.renderEvent.subscribe(this._fixWidth,this,true);this.showEvent.subscribe(this._fixWidth,this,true);}},setupConfig:function(){var H=this.cfg;H.addProperty(C.PAGES.key,{value:C.PAGES.value,validator:H.checkNumber,handler:this.configPages});H.addProperty(C.YEAR_OFFSET.key,{value:C.YEAR_OFFSET.value,handler:this.delegateConfig,supercedes:C.YEAR_OFFSET.supercedes,suppressEvent:true});H.addProperty(C.TODAY.key,{value:new Date(C.TODAY.value.getTime()),supercedes:C.TODAY.supercedes,handler:this.configToday,suppressEvent:false});H.addProperty(C.PAGEDATE.key,{value:C.PAGEDATE.value||new Date(C.TODAY.value.getTime()),handler:this.configPageDate});H.addProperty(C.SELECTED.key,{value:[],handler:this.configSelected});H.addProperty(C.TITLE.key,{value:C.TITLE.value,handler:this.configTitle});H.addProperty(C.CLOSE.key,{value:C.CLOSE.value,handler:this.configClose});H.addProperty(C.IFRAME.key,{value:C.IFRAME.value,handler:this.configIframe,validator:H.checkBoolean});H.addProperty(C.MINDATE.key,{value:C.MINDATE.value,handler:this.delegateConfig});H.addProperty(C.MAXDATE.key,{value:C.MAXDATE.value,handler:this.delegateConfig});H.addProperty(C.MULTI_SELECT.key,{value:C.MULTI_SELECT.value,handler:this.delegateConfig,validator:H.checkBoolean});H.addProperty(C.START_WEEKDAY.key,{value:C.START_WEEKDAY.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.SHOW_WEEKDAYS.key,{value:C.SHOW_WEEKDAYS.value,handler:this.delegateConfig,validator:H.checkBoolean});H.addProperty(C.SHOW_WEEK_HEADER.key,{value:C.SHOW_WEEK_HEADER.value,handler:this.delegateConfig,validator:H.checkBoolean});H.addProperty(C.SHOW_WEEK_FOOTER.key,{value:C.SHOW_WEEK_FOOTER.value,handler:this.delegateConfig,validator:H.checkBoolean});H.addProperty(C.HIDE_BLANK_WEEKS.key,{value:C.HIDE_BLANK_WEEKS.value,handler:this.delegateConfig,validator:H.checkBoolean});H.addProperty(C.NAV_ARROW_LEFT.key,{value:C.NAV_ARROW_LEFT.value,handler:this.delegateConfig});H.addProperty(C.NAV_ARROW_RIGHT.key,{value:C.NAV_ARROW_RIGHT.value,handler:this.delegateConfig});H.addProperty(C.MONTHS_SHORT.key,{value:C.MONTHS_SHORT.value,handler:this.delegateConfig});H.addProperty(C.MONTHS_LONG.key,{value:C.MONTHS_LONG.value,handler:this.delegateConfig});H.addProperty(C.WEEKDAYS_1CHAR.key,{value:C.WEEKDAYS_1CHAR.value,handler:this.delegateConfig});H.addProperty(C.WEEKDAYS_SHORT.key,{value:C.WEEKDAYS_SHORT.value,handler:this.delegateConfig});H.addProperty(C.WEEKDAYS_MEDIUM.key,{value:C.WEEKDAYS_MEDIUM.value,handler:this.delegateConfig});H.addProperty(C.WEEKDAYS_LONG.key,{value:C.WEEKDAYS_LONG.value,handler:this.delegateConfig});H.addProperty(C.LOCALE_MONTHS.key,{value:C.LOCALE_MONTHS.value,handler:this.delegateConfig});H.addProperty(C.LOCALE_WEEKDAYS.key,{value:C.LOCALE_WEEKDAYS.value,handler:this.delegateConfig});H.addProperty(C.DATE_DELIMITER.key,{value:C.DATE_DELIMITER.value,handler:this.delegateConfig});H.addProperty(C.DATE_FIELD_DELIMITER.key,{value:C.DATE_FIELD_DELIMITER.value,handler:this.delegateConfig});H.addProperty(C.DATE_RANGE_DELIMITER.key,{value:C.DATE_RANGE_DELIMITER.value,handler:this.delegateConfig});H.addProperty(C.MY_MONTH_POSITION.key,{value:C.MY_MONTH_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MY_YEAR_POSITION.key,{value:C.MY_YEAR_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MD_MONTH_POSITION.key,{value:C.MD_MONTH_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});
H.addProperty(C.MD_DAY_POSITION.key,{value:C.MD_DAY_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MDY_MONTH_POSITION.key,{value:C.MDY_MONTH_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MDY_DAY_POSITION.key,{value:C.MDY_DAY_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MDY_YEAR_POSITION.key,{value:C.MDY_YEAR_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MY_LABEL_MONTH_POSITION.key,{value:C.MY_LABEL_MONTH_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MY_LABEL_YEAR_POSITION.key,{value:C.MY_LABEL_YEAR_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MY_LABEL_MONTH_SUFFIX.key,{value:C.MY_LABEL_MONTH_SUFFIX.value,handler:this.delegateConfig});H.addProperty(C.MY_LABEL_YEAR_SUFFIX.key,{value:C.MY_LABEL_YEAR_SUFFIX.value,handler:this.delegateConfig});H.addProperty(C.NAV.key,{value:C.NAV.value,handler:this.configNavigator});H.addProperty(C.STRINGS.key,{value:C.STRINGS.value,handler:this.configStrings,validator:function(I){return E.isObject(I);},supercedes:C.STRINGS.supercedes});},initEvents:function(){var J=this,L="Event",M=YAHOO.util.CustomEvent;var I=function(O,R,N){for(var Q=0;Q<J.pages.length;++Q){var P=J.pages[Q];P[this.type+L].subscribe(O,R,N);}};var H=function(N,Q){for(var P=0;P<J.pages.length;++P){var O=J.pages[P];O[this.type+L].unsubscribe(N,Q);}};var K=G._EVENT_TYPES;J.beforeSelectEvent=new M(K.BEFORE_SELECT);J.beforeSelectEvent.subscribe=I;J.beforeSelectEvent.unsubscribe=H;J.selectEvent=new M(K.SELECT);J.selectEvent.subscribe=I;J.selectEvent.unsubscribe=H;J.beforeDeselectEvent=new M(K.BEFORE_DESELECT);J.beforeDeselectEvent.subscribe=I;J.beforeDeselectEvent.unsubscribe=H;J.deselectEvent=new M(K.DESELECT);J.deselectEvent.subscribe=I;J.deselectEvent.unsubscribe=H;J.changePageEvent=new M(K.CHANGE_PAGE);J.changePageEvent.subscribe=I;J.changePageEvent.unsubscribe=H;J.beforeRenderEvent=new M(K.BEFORE_RENDER);J.beforeRenderEvent.subscribe=I;J.beforeRenderEvent.unsubscribe=H;J.renderEvent=new M(K.RENDER);J.renderEvent.subscribe=I;J.renderEvent.unsubscribe=H;J.resetEvent=new M(K.RESET);J.resetEvent.subscribe=I;J.resetEvent.unsubscribe=H;J.clearEvent=new M(K.CLEAR);J.clearEvent.subscribe=I;J.clearEvent.unsubscribe=H;J.beforeShowEvent=new M(K.BEFORE_SHOW);J.showEvent=new M(K.SHOW);J.beforeHideEvent=new M(K.BEFORE_HIDE);J.hideEvent=new M(K.HIDE);J.beforeShowNavEvent=new M(K.BEFORE_SHOW_NAV);J.showNavEvent=new M(K.SHOW_NAV);J.beforeHideNavEvent=new M(K.BEFORE_HIDE_NAV);J.hideNavEvent=new M(K.HIDE_NAV);J.beforeRenderNavEvent=new M(K.BEFORE_RENDER_NAV);J.renderNavEvent=new M(K.RENDER_NAV);J.beforeDestroyEvent=new M(K.BEFORE_DESTROY);J.destroyEvent=new M(K.DESTROY);},configPages:function(T,R,N){var L=R[0],J=C.PAGEDATE.key,W="_",M,O=null,S="groupcal",V="first-of-type",K="last-of-type";for(var I=0;I<L;++I){var U=this.id+W+I,Q=this.containerId+W+I,P=this.cfg.getConfig();P.close=false;P.title=false;P.navigator=null;if(I>0){M=new Date(O);this._setMonthOnDate(M,M.getMonth()+I);P.pageDate=M;}var H=this.constructChild(U,Q,P);D.removeClass(H.oDomContainer,this.Style.CSS_SINGLE);D.addClass(H.oDomContainer,S);if(I===0){O=H.cfg.getProperty(J);D.addClass(H.oDomContainer,V);}if(I==(L-1)){D.addClass(H.oDomContainer,K);}H.parent=this;H.index=I;this.pages[this.pages.length]=H;}},configPageDate:function(O,N,L){var J=N[0],M;var K=C.PAGEDATE.key;for(var I=0;I<this.pages.length;++I){var H=this.pages[I];if(I===0){M=H._parsePageDate(J);H.cfg.setProperty(K,M);}else{var P=new Date(M);this._setMonthOnDate(P,P.getMonth()+I);H.cfg.setProperty(K,P);}}},configSelected:function(J,H,L){var K=C.SELECTED.key;this.delegateConfig(J,H,L);var I=(this.pages.length>0)?this.pages[0].cfg.getProperty(K):[];this.cfg.setProperty(K,I,true);},delegateConfig:function(I,H,L){var M=H[0];var K;for(var J=0;J<this.pages.length;J++){K=this.pages[J];K.cfg.setProperty(I,M);}},setChildFunction:function(K,I){var H=this.cfg.getProperty(C.PAGES.key);for(var J=0;J<H;++J){this.pages[J][K]=I;}},callChildFunction:function(M,I){var H=this.cfg.getProperty(C.PAGES.key);for(var L=0;L<H;++L){var K=this.pages[L];if(K[M]){var J=K[M];J.call(K,I);}}},constructChild:function(K,I,J){var H=document.getElementById(I);if(!H){H=document.createElement("div");H.id=I;this.oDomContainer.appendChild(H);}return new G(K,I,J);},setMonth:function(L){L=parseInt(L,10);var M;var I=C.PAGEDATE.key;for(var K=0;K<this.pages.length;++K){var J=this.pages[K];var H=J.cfg.getProperty(I);if(K===0){M=H.getFullYear();}else{H.setFullYear(M);}this._setMonthOnDate(H,L+K);J.cfg.setProperty(I,H);}},setYear:function(J){var I=C.PAGEDATE.key;J=parseInt(J,10);for(var L=0;L<this.pages.length;++L){var K=this.pages[L];var H=K.cfg.getProperty(I);if((H.getMonth()+1)==1&&L>0){J+=1;}K.setYear(J);}},render:function(){this.renderHeader();for(var I=0;I<this.pages.length;++I){var H=this.pages[I];H.render();}this.renderFooter();},select:function(H){for(var J=0;J<this.pages.length;++J){var I=this.pages[J];I.select(H);}return this.getSelectedDates();},selectCell:function(H){for(var J=0;J<this.pages.length;++J){var I=this.pages[J];I.selectCell(H);}return this.getSelectedDates();},deselect:function(H){for(var J=0;J<this.pages.length;++J){var I=this.pages[J];I.deselect(H);}return this.getSelectedDates();},deselectAll:function(){for(var I=0;I<this.pages.length;++I){var H=this.pages[I];H.deselectAll();}return this.getSelectedDates();},deselectCell:function(H){for(var J=0;J<this.pages.length;++J){var I=this.pages[J];I.deselectCell(H);}return this.getSelectedDates();},reset:function(){for(var I=0;I<this.pages.length;++I){var H=this.pages[I];H.reset();}},clear:function(){for(var I=0;I<this.pages.length;++I){var H=this.pages[I];H.clear();}this.cfg.setProperty(C.SELECTED.key,[]);this.cfg.setProperty(C.PAGEDATE.key,new Date(this.pages[0].today.getTime()));this.render();},nextMonth:function(){for(var I=0;I<this.pages.length;
++I){var H=this.pages[I];H.nextMonth();}},previousMonth:function(){for(var I=this.pages.length-1;I>=0;--I){var H=this.pages[I];H.previousMonth();}},nextYear:function(){for(var I=0;I<this.pages.length;++I){var H=this.pages[I];H.nextYear();}},previousYear:function(){for(var I=0;I<this.pages.length;++I){var H=this.pages[I];H.previousYear();}},getSelectedDates:function(){var J=[];var I=this.cfg.getProperty(C.SELECTED.key);for(var L=0;L<I.length;++L){var K=I[L];var H=F.getDate(K[0],K[1]-1,K[2]);J.push(H);}J.sort(function(N,M){return N-M;});return J;},addRenderer:function(H,I){for(var K=0;K<this.pages.length;++K){var J=this.pages[K];J.addRenderer(H,I);}},addMonthRenderer:function(K,H){for(var J=0;J<this.pages.length;++J){var I=this.pages[J];I.addMonthRenderer(K,H);}},addWeekdayRenderer:function(I,H){for(var K=0;K<this.pages.length;++K){var J=this.pages[K];J.addWeekdayRenderer(I,H);}},removeRenderers:function(){this.callChildFunction("removeRenderers");},renderHeader:function(){},renderFooter:function(){},addMonths:function(H){this.callChildFunction("addMonths",H);},subtractMonths:function(H){this.callChildFunction("subtractMonths",H);},addYears:function(H){this.callChildFunction("addYears",H);},subtractYears:function(H){this.callChildFunction("subtractYears",H);},getCalendarPage:function(K){var M=null;if(K){var N=K.getFullYear(),J=K.getMonth();var I=this.pages;for(var L=0;L<I.length;++L){var H=I[L].cfg.getProperty("pagedate");if(H.getFullYear()===N&&H.getMonth()===J){M=I[L];break;}}}return M;},_setMonthOnDate:function(I,J){if(YAHOO.env.ua.webkit&&YAHOO.env.ua.webkit<420&&(J<0||J>11)){var H=F.add(I,F.MONTH,J-I.getMonth());I.setTime(H.getTime());}else{I.setMonth(J);}},_fixWidth:function(){var H=0;for(var J=0;J<this.pages.length;++J){var I=this.pages[J];H+=I.oDomContainer.offsetWidth;}if(H>0){this.oDomContainer.style.width=H+"px";}},toString:function(){return"CalendarGroup "+this.id;},destroy:function(){if(this.beforeDestroyEvent.fire()){var J=this;if(J.navigator){J.navigator.destroy();}if(J.cfg){J.cfg.destroy();}A.purgeElement(J.oDomContainer,true);D.removeClass(J.oDomContainer,B.CSS_CONTAINER);D.removeClass(J.oDomContainer,B.CSS_MULTI_UP);for(var I=0,H=J.pages.length;I<H;I++){J.pages[I].destroy();J.pages[I]=null;}J.oDomContainer.innerHTML="";J.oDomContainer=null;this.destroyEvent.fire();}}};B.CSS_CONTAINER="yui-calcontainer";B.CSS_MULTI_UP="multi";B.CSS_2UPTITLE="title";B.CSS_2UPCLOSE="close-icon";YAHOO.lang.augmentProto(B,G,"buildDayLabel","buildMonthLabel","renderOutOfBoundsDate","renderRowHeader","renderRowFooter","renderCellDefault","styleCellDefault","renderCellStyleHighlight1","renderCellStyleHighlight2","renderCellStyleHighlight3","renderCellStyleHighlight4","renderCellStyleToday","renderCellStyleSelected","renderCellNotThisMonth","renderBodyCellRestricted","initStyles","configTitle","configClose","configIframe","configStrings","configToday","configNavigator","createTitleBar","createCloseButton","removeTitleBar","removeCloseButton","hide","show","toDate","_toDate","_parseArgs","browser");YAHOO.widget.CalGrp=B;YAHOO.widget.CalendarGroup=B;YAHOO.widget.Calendar2up=function(J,H,I){this.init(J,H,I);};YAHOO.extend(YAHOO.widget.Calendar2up,B);YAHOO.widget.Cal2up=YAHOO.widget.Calendar2up;})();YAHOO.widget.CalendarNavigator=function(A){this.init(A);};(function(){var A=YAHOO.widget.CalendarNavigator;A.CLASSES={NAV:"yui-cal-nav",NAV_VISIBLE:"yui-cal-nav-visible",MASK:"yui-cal-nav-mask",YEAR:"yui-cal-nav-y",MONTH:"yui-cal-nav-m",BUTTONS:"yui-cal-nav-b",BUTTON:"yui-cal-nav-btn",ERROR:"yui-cal-nav-e",YEAR_CTRL:"yui-cal-nav-yc",MONTH_CTRL:"yui-cal-nav-mc",INVALID:"yui-invalid",DEFAULT:"yui-default"};A.DEFAULT_CONFIG={strings:{month:"Month",year:"Year",submit:"Okay",cancel:"Cancel",invalidYear:"Year needs to be a number"},monthFormat:YAHOO.widget.Calendar.LONG,initialFocus:"year"};A._DEFAULT_CFG=A.DEFAULT_CONFIG;A.ID_SUFFIX="_nav";A.MONTH_SUFFIX="_month";A.YEAR_SUFFIX="_year";A.ERROR_SUFFIX="_error";A.CANCEL_SUFFIX="_cancel";A.SUBMIT_SUFFIX="_submit";A.YR_MAX_DIGITS=4;A.YR_MINOR_INC=1;A.YR_MAJOR_INC=10;A.UPDATE_DELAY=50;A.YR_PATTERN=/^\d+$/;A.TRIM=/^\s*(.*?)\s*$/;})();YAHOO.widget.CalendarNavigator.prototype={id:null,cal:null,navEl:null,maskEl:null,yearEl:null,monthEl:null,errorEl:null,submitEl:null,cancelEl:null,firstCtrl:null,lastCtrl:null,_doc:null,_year:null,_month:0,__rendered:false,init:function(A){var C=A.oDomContainer;this.cal=A;this.id=C.id+YAHOO.widget.CalendarNavigator.ID_SUFFIX;this._doc=C.ownerDocument;var B=YAHOO.env.ua.ie;this.__isIEQuirks=(B&&((B<=6)||(this._doc.compatMode=="BackCompat")));},show:function(){var A=YAHOO.widget.CalendarNavigator.CLASSES;if(this.cal.beforeShowNavEvent.fire()){if(!this.__rendered){this.render();}this.clearErrors();this._updateMonthUI();this._updateYearUI();this._show(this.navEl,true);this.setInitialFocus();this.showMask();YAHOO.util.Dom.addClass(this.cal.oDomContainer,A.NAV_VISIBLE);this.cal.showNavEvent.fire();}},hide:function(){var A=YAHOO.widget.CalendarNavigator.CLASSES;if(this.cal.beforeHideNavEvent.fire()){this._show(this.navEl,false);this.hideMask();YAHOO.util.Dom.removeClass(this.cal.oDomContainer,A.NAV_VISIBLE);this.cal.hideNavEvent.fire();}},showMask:function(){this._show(this.maskEl,true);if(this.__isIEQuirks){this._syncMask();}},hideMask:function(){this._show(this.maskEl,false);},getMonth:function(){return this._month;},getYear:function(){return this._year;},setMonth:function(A){if(A>=0&&A<12){this._month=A;}this._updateMonthUI();},setYear:function(B){var A=YAHOO.widget.CalendarNavigator.YR_PATTERN;if(YAHOO.lang.isNumber(B)&&A.test(B+"")){this._year=B;}this._updateYearUI();},render:function(){this.cal.beforeRenderNavEvent.fire();if(!this.__rendered){this.createNav();this.createMask();this.applyListeners();this.__rendered=true;}this.cal.renderNavEvent.fire();},createNav:function(){var B=YAHOO.widget.CalendarNavigator;var C=this._doc;var D=C.createElement("div");D.className=B.CLASSES.NAV;var A=this.renderNavContents([]);D.innerHTML=A.join("");this.cal.oDomContainer.appendChild(D);
this.navEl=D;this.yearEl=C.getElementById(this.id+B.YEAR_SUFFIX);this.monthEl=C.getElementById(this.id+B.MONTH_SUFFIX);this.errorEl=C.getElementById(this.id+B.ERROR_SUFFIX);this.submitEl=C.getElementById(this.id+B.SUBMIT_SUFFIX);this.cancelEl=C.getElementById(this.id+B.CANCEL_SUFFIX);if(YAHOO.env.ua.gecko&&this.yearEl&&this.yearEl.type=="text"){this.yearEl.setAttribute("autocomplete","off");}this._setFirstLastElements();},createMask:function(){var B=YAHOO.widget.CalendarNavigator.CLASSES;var A=this._doc.createElement("div");A.className=B.MASK;this.cal.oDomContainer.appendChild(A);this.maskEl=A;},_syncMask:function(){var B=this.cal.oDomContainer;if(B&&this.maskEl){var A=YAHOO.util.Dom.getRegion(B);YAHOO.util.Dom.setStyle(this.maskEl,"width",A.right-A.left+"px");YAHOO.util.Dom.setStyle(this.maskEl,"height",A.bottom-A.top+"px");}},renderNavContents:function(A){var D=YAHOO.widget.CalendarNavigator,E=D.CLASSES,B=A;B[B.length]='<div class="'+E.MONTH+'">';this.renderMonth(B);B[B.length]="</div>";B[B.length]='<div class="'+E.YEAR+'">';this.renderYear(B);B[B.length]="</div>";B[B.length]='<div class="'+E.BUTTONS+'">';this.renderButtons(B);B[B.length]="</div>";B[B.length]='<div class="'+E.ERROR+'" id="'+this.id+D.ERROR_SUFFIX+'"></div>';return B;},renderMonth:function(D){var G=YAHOO.widget.CalendarNavigator,H=G.CLASSES;var I=this.id+G.MONTH_SUFFIX,F=this.__getCfg("monthFormat"),A=this.cal.cfg.getProperty((F==YAHOO.widget.Calendar.SHORT)?"MONTHS_SHORT":"MONTHS_LONG"),E=D;if(A&&A.length>0){E[E.length]='<label for="'+I+'">';E[E.length]=this.__getCfg("month",true);E[E.length]="</label>";E[E.length]='<select name="'+I+'" id="'+I+'" class="'+H.MONTH_CTRL+'">';for(var B=0;B<A.length;B++){E[E.length]='<option value="'+B+'">';E[E.length]=A[B];E[E.length]="</option>";}E[E.length]="</select>";}return E;},renderYear:function(B){var E=YAHOO.widget.CalendarNavigator,F=E.CLASSES;var G=this.id+E.YEAR_SUFFIX,A=E.YR_MAX_DIGITS,D=B;D[D.length]='<label for="'+G+'">';D[D.length]=this.__getCfg("year",true);D[D.length]="</label>";D[D.length]='<input type="text" name="'+G+'" id="'+G+'" class="'+F.YEAR_CTRL+'" maxlength="'+A+'"/>';return D;},renderButtons:function(A){var D=YAHOO.widget.CalendarNavigator.CLASSES;var B=A;B[B.length]='<span class="'+D.BUTTON+" "+D.DEFAULT+'">';B[B.length]='<button type="button" id="'+this.id+"_submit"+'">';B[B.length]=this.__getCfg("submit",true);B[B.length]="</button>";B[B.length]="</span>";B[B.length]='<span class="'+D.BUTTON+'">';B[B.length]='<button type="button" id="'+this.id+"_cancel"+'">';B[B.length]=this.__getCfg("cancel",true);B[B.length]="</button>";B[B.length]="</span>";return B;},applyListeners:function(){var B=YAHOO.util.Event;function A(){if(this.validate()){this.setYear(this._getYearFromUI());}}function C(){this.setMonth(this._getMonthFromUI());}B.on(this.submitEl,"click",this.submit,this,true);B.on(this.cancelEl,"click",this.cancel,this,true);B.on(this.yearEl,"blur",A,this,true);B.on(this.monthEl,"change",C,this,true);if(this.__isIEQuirks){YAHOO.util.Event.on(this.cal.oDomContainer,"resize",this._syncMask,this,true);}this.applyKeyListeners();},purgeListeners:function(){var A=YAHOO.util.Event;A.removeListener(this.submitEl,"click",this.submit);A.removeListener(this.cancelEl,"click",this.cancel);A.removeListener(this.yearEl,"blur");A.removeListener(this.monthEl,"change");if(this.__isIEQuirks){A.removeListener(this.cal.oDomContainer,"resize",this._syncMask);}this.purgeKeyListeners();},applyKeyListeners:function(){var D=YAHOO.util.Event,A=YAHOO.env.ua;var C=(A.ie||A.webkit)?"keydown":"keypress";var B=(A.ie||A.opera||A.webkit)?"keydown":"keypress";D.on(this.yearEl,"keypress",this._handleEnterKey,this,true);D.on(this.yearEl,C,this._handleDirectionKeys,this,true);D.on(this.lastCtrl,B,this._handleTabKey,this,true);D.on(this.firstCtrl,B,this._handleShiftTabKey,this,true);},purgeKeyListeners:function(){var D=YAHOO.util.Event,A=YAHOO.env.ua;var C=(A.ie||A.webkit)?"keydown":"keypress";var B=(A.ie||A.opera||A.webkit)?"keydown":"keypress";D.removeListener(this.yearEl,"keypress",this._handleEnterKey);D.removeListener(this.yearEl,C,this._handleDirectionKeys);D.removeListener(this.lastCtrl,B,this._handleTabKey);D.removeListener(this.firstCtrl,B,this._handleShiftTabKey);},submit:function(){if(this.validate()){this.hide();this.setMonth(this._getMonthFromUI());this.setYear(this._getYearFromUI());var B=this.cal;var A=YAHOO.widget.CalendarNavigator.UPDATE_DELAY;if(A>0){var C=this;window.setTimeout(function(){C._update(B);},A);}else{this._update(B);}}},_update:function(B){var A=YAHOO.widget.DateMath.getDate(this.getYear()-B.cfg.getProperty("YEAR_OFFSET"),this.getMonth(),1);B.cfg.setProperty("pagedate",A);B.render();},cancel:function(){this.hide();},validate:function(){if(this._getYearFromUI()!==null){this.clearErrors();return true;}else{this.setYearError();this.setError(this.__getCfg("invalidYear",true));return false;}},setError:function(A){if(this.errorEl){this.errorEl.innerHTML=A;this._show(this.errorEl,true);}},clearError:function(){if(this.errorEl){this.errorEl.innerHTML="";this._show(this.errorEl,false);}},setYearError:function(){YAHOO.util.Dom.addClass(this.yearEl,YAHOO.widget.CalendarNavigator.CLASSES.INVALID);},clearYearError:function(){YAHOO.util.Dom.removeClass(this.yearEl,YAHOO.widget.CalendarNavigator.CLASSES.INVALID);},clearErrors:function(){this.clearError();this.clearYearError();},setInitialFocus:function(){var A=this.submitEl,C=this.__getCfg("initialFocus");if(C&&C.toLowerCase){C=C.toLowerCase();if(C=="year"){A=this.yearEl;try{this.yearEl.select();}catch(B){}}else{if(C=="month"){A=this.monthEl;}}}if(A&&YAHOO.lang.isFunction(A.focus)){try{A.focus();}catch(D){}}},erase:function(){if(this.__rendered){this.purgeListeners();this.yearEl=null;this.monthEl=null;this.errorEl=null;this.submitEl=null;this.cancelEl=null;this.firstCtrl=null;this.lastCtrl=null;if(this.navEl){this.navEl.innerHTML="";}var B=this.navEl.parentNode;if(B){B.removeChild(this.navEl);}this.navEl=null;var A=this.maskEl.parentNode;
if(A){A.removeChild(this.maskEl);}this.maskEl=null;this.__rendered=false;}},destroy:function(){this.erase();this._doc=null;this.cal=null;this.id=null;},_show:function(B,A){if(B){YAHOO.util.Dom.setStyle(B,"display",(A)?"block":"none");}},_getMonthFromUI:function(){if(this.monthEl){return this.monthEl.selectedIndex;}else{return 0;}},_getYearFromUI:function(){var B=YAHOO.widget.CalendarNavigator;var A=null;if(this.yearEl){var C=this.yearEl.value;C=C.replace(B.TRIM,"$1");if(B.YR_PATTERN.test(C)){A=parseInt(C,10);}}return A;},_updateYearUI:function(){if(this.yearEl&&this._year!==null){this.yearEl.value=this._year;}},_updateMonthUI:function(){if(this.monthEl){this.monthEl.selectedIndex=this._month;}},_setFirstLastElements:function(){this.firstCtrl=this.monthEl;this.lastCtrl=this.cancelEl;if(this.__isMac){if(YAHOO.env.ua.webkit&&YAHOO.env.ua.webkit<420){this.firstCtrl=this.monthEl;this.lastCtrl=this.yearEl;}if(YAHOO.env.ua.gecko){this.firstCtrl=this.yearEl;this.lastCtrl=this.yearEl;}}},_handleEnterKey:function(B){var A=YAHOO.util.KeyListener.KEY;if(YAHOO.util.Event.getCharCode(B)==A.ENTER){YAHOO.util.Event.preventDefault(B);this.submit();}},_handleDirectionKeys:function(H){var G=YAHOO.util.Event,A=YAHOO.util.KeyListener.KEY,D=YAHOO.widget.CalendarNavigator;var F=(this.yearEl.value)?parseInt(this.yearEl.value,10):null;if(isFinite(F)){var B=false;switch(G.getCharCode(H)){case A.UP:this.yearEl.value=F+D.YR_MINOR_INC;B=true;break;case A.DOWN:this.yearEl.value=Math.max(F-D.YR_MINOR_INC,0);B=true;break;case A.PAGE_UP:this.yearEl.value=F+D.YR_MAJOR_INC;B=true;break;case A.PAGE_DOWN:this.yearEl.value=Math.max(F-D.YR_MAJOR_INC,0);B=true;break;default:break;}if(B){G.preventDefault(H);try{this.yearEl.select();}catch(C){}}}},_handleTabKey:function(D){var C=YAHOO.util.Event,A=YAHOO.util.KeyListener.KEY;if(C.getCharCode(D)==A.TAB&&!D.shiftKey){try{C.preventDefault(D);this.firstCtrl.focus();}catch(B){}}},_handleShiftTabKey:function(D){var C=YAHOO.util.Event,A=YAHOO.util.KeyListener.KEY;if(D.shiftKey&&C.getCharCode(D)==A.TAB){try{C.preventDefault(D);this.lastCtrl.focus();}catch(B){}}},__getCfg:function(D,B){var C=YAHOO.widget.CalendarNavigator.DEFAULT_CONFIG;var A=this.cal.cfg.getProperty("navigator");if(B){return(A!==true&&A.strings&&A.strings[D])?A.strings[D]:C.strings[D];}else{return(A!==true&&A[D])?A[D]:C[D];}},__isMac:(navigator.userAgent.toLowerCase().indexOf("macintosh")!=-1)};YAHOO.register("calendar",YAHOO.widget.Calendar,{version:"2.8.0r4",build:"2449"});/**
 * The top-level WSO2Vis namespace. All public methods and fields should be
 * registered on this object. Note that core wso2vis source is surrounded by an
 * anonymous function, so any other declared globals will not be visible outside
 * of core methods. This also allows multiple versions of WSO2Vis to coexist,
 * since each version will see their own <tt>wso2vis</tt> namespace.
 *
 * @namespace The top-level wso2vis namespace, <tt>wso2vis</tt>.
 */
var wso2vis = {};

/**
 * @namespace wso2vis namespace for Providers, <tt>wso2vis.p</tt>.
 */
wso2vis.p = {};

/**
 * @namespace wso2vis namespace for Filters, <tt>wso2vis.f</tt>.
 */
wso2vis.f = {};

/**
 * @namespace wso2vis namespace for Filter Forms, <tt>wso2vis.f.form</tt>.
 */
wso2vis.f.form = {};

/**
 * @namespace wso2vis namespace for Subscribers, <tt>wso2vis.s</tt>.
 */
wso2vis.s = {};

/**
 * @namespace wso2vis namespace for Subscriber Charts, <tt>wso2vis.s.chart</tt>.
 */
wso2vis.s.chart = {};

/**
 * @namespace wso2vis namespace for Subscriber Protovis Charts, <tt>wso2vis.s.chart.protovis</tt>.
 */
wso2vis.s.chart.protovis = {};

/**
 * @namespace wso2vis namespace for Subscriber Raphael Charts, <tt>wso2vis.s.chart.raphael</tt>.
 */
wso2vis.s.chart.raphael = {};

/**
 * @namespace wso2vis namespace for Subscriber Infovis Charts, <tt>wso2vis.s.chart.raphael</tt>.
 */
wso2vis.s.chart.infovis = {};

/**
 * @namespace wso2vis namespace for Subscriber Forms, <tt>wso2vis.s.form</tt>.
 */
wso2vis.s.form = {};

/**
 * @namespace wso2vis namespace for Utility Components, <tt>wso2vis.u</tt>.
 */
wso2vis.u = {};

/**
 * @namespace wso2vis namespace for utility functions, <tt>wso2vis.util</tt>.
 */
wso2vis.util = {};

/**
 * @namespace wso2vis namespace for Adaptors, <tt>wso2vis.a</tt>.
 */
wso2vis.a = {};

/**
 * @namespace wso2vis namespace for controls, <tt>wso2vis.c</tt>.
 */
wso2vis.c = {};

/**
 * @namespace wso2vis namespace for user defined custom functions, <tt>wso2vis.fn</tt>.
 */
wso2vis.fn = {};

/**
 * WSO2Vis major and minor version numbers.
 *
 * @namespace WSO2Vis major and minor version numbers.
 */
wso2vis.version = {
   /**
    * The major version number.
    *
    * @type number
    * @constant
    */
    major: 0,

   /**
    * The minor version number.
    *
    * @type number
    * @constant
    */
    minor: 1
};

/**
 * WSO2Vis environment. All data providers, filters and charts are registred in the environment. 
 */ 
wso2vis.environment = { 
   /** 
    * providers array
    */
    providers: [],

   /** 
    * filters array
    */
    filters: [],
    
   /**
    * charts array
    */
    charts: [],
    
   /** 
    * dialogs array
    */
    dialogs: [],
    
    /**
     * subscribers array
     */
     subscribers: [],
     
    /**
     * adapters array
     */
     adapters: [],

	 /**
	  * controls array
	  */
	 controls: []
	
};

wso2vis.fn.getProviderFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.providers.length > id)) {
        return wso2vis.environment.providers[id];
    }
    return null;
};

wso2vis.fn.getFilterFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.filters.length > id)) {
        return wso2vis.environment.filters[id];
    }
    return null;    
};

wso2vis.fn.getChartFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.charts.length > id)) {
        return wso2vis.environment.charts[id];
    }
    return null;
};

wso2vis.fn.getDialogFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.dialogs.length > id)) {
        return wso2vis.environment.dialogs[id];
    }
    return null;
};

wso2vis.fn.getElementFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.elements.length > id)) {
        return wso2vis.environment.elements[id];
    }
    return null;
};

wso2vis.fn.getAdapterFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.adapters.length > id)) {
        return wso2vis.environment.adapters[id];
    }
    return null;
};

wso2vis.fn.getControlFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.controls.length > id)) {
        return wso2vis.environment.controls[id];
    }
    return null;
};

/* using "Parasitic Combination Inheritance" */
wso2vis.extend = function(subc, superc /*, overrides*/) {
    if (!superc||!subc) {
        throw new Error("extend failed, please check that " +
                        "all dependencies are included.");
    }
    var F = function() {}/*, i*/;
    F.prototype=superc.prototype;
    subc.prototype=new F();
    subc.prototype.constructor=subc;
    subc.superclass=superc.prototype;
    if (superc.prototype.constructor == Object.prototype.constructor) {
        superc.prototype.constructor=superc;
    }

    /* Lets worry about the following later
    if (overrides) {
        for (i in overrides) {
            if (L.hasOwnProperty(overrides, i)) {
                subc.prototype[i]=overrides[i];
            }
        }

        L._IEEnumFix(subc.prototype, overrides);
    } */
};

wso2vis.initialize = function() {
    wso2vis.environment.tooltip = new wso2vis.c.Tooltip();        
};


//Global utility functions

function $(_id) {
    return document.getElementById(_id);
}

Array.prototype.max = function() {
    var max = this[0];
    var len = this.length;
    for (var i = 1; i < len; i++) if (this[i] > max) max = this[i];
    return max;
}

Array.prototype.min = function() {
    var min = this[0];
    var len = this.length;
    for (var i = 1; i < len; i++) if (this[i] < min) min = this[i];
    return min;
}

wso2vis.util.generateColors = function(count, scheme) {
    function hexNumtoHexStr(n) {
        function toHexStr(N) {
             if (N==null) return "00";
             N=parseInt(N); if (N==0 || isNaN(N)) return "00";
             N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
             return "0123456789ABCDEF".charAt((N-N%16)/16)
                  + "0123456789ABCDEF".charAt(N%16);
        }
        
        return "#" + toHexStr((n & 0xFF0000)>>>16) + toHexStr((n & 0x00FF00)>>>8) + toHexStr((n & 0x0000FF));
    }
        
    function generateInterpolatedColorArray(count, colors) {
        function interpolateColors(color1, color2, f) {
            if (f >= 1)
                return color2;
            if (f <= 0)
                return color1;
            var fb = 1 - f;
            return ((((color2 & 0xFF0000) * f)+((color1 & 0xFF0000) * fb)) & 0xFF0000)
                   +((((color2 & 0x00FF00) * f)+((color1 & 0x00FF00) * fb)) & 0x00FF00)
                   +((((color2 & 0x0000FF) * f)+((color1 & 0x0000FF) * fb)) & 0x0000FF);                                   
        }               
        
        var len = colors.length;
        var res = new Array();
        res.push(hexNumtoHexStr(colors[0]));
        
        for (var i = 1; i < count; i++) {
            var val = i * len / count;
            var color1 = Math.floor(val);
            var color2 = Math.ceil(val);
            res.push(hexNumtoHexStr(interpolateColors(colors[color1], colors[color2], val - color1)));                        
        }
        
        return res;
    }

    if (count <= 0) 
        return null;
        
    var a10 = [0x1f77b4, 0xff7f0e, 0x2ca02c, 0xd62728, 0x9467bd,
        0x8c564b, 0xe377c2, 0x7f7f7f, 0xbcbd22, 0x17becf];
    var b20 = [0x1f77b4, 0xaec7e8, 0xff7f0e, 0xffbb78, 0x2ca02c,
          0x98df8a, 0xd62728, 0xff9896, 0x9467bd, 0xc5b0d5,
          0x8c564b, 0xc49c94, 0xe377c2, 0xf7b6d2, 0x7f7f7f,
          0xc7c7c7, 0xbcbd22, 0xdbdb8d, 0x17becf, 0x9edae5];
    var c19 = [0x9c9ede, 0x7375b5, 0x4a5584, 0xcedb9c, 0xb5cf6b,
          0x8ca252, 0x637939, 0xe7cb94, 0xe7ba52, 0xbd9e39,
          0x8c6d31, 0xe7969c, 0xd6616b, 0xad494a, 0x843c39,
          0xde9ed6, 0xce6dbd, 0xa55194, 0x7b4173];
    var colorScheme;
    
    if (scheme == 20) {
        colorScheme = b20;
    }
    else if (scheme == 10) {
        colorScheme = a10;
    }
    else /* any ((scheme === undefined) || (scheme == 19))*/{
        colorScheme = c19;
    }
    
    if (count <= colorScheme.length) {
        c = new Array();
        for (var i = 0; i < count; i++)
            c.push(hexNumtoHexStr(colorScheme[i]));
        return c;
    }
    
    return generateInterpolatedColorArray(count, colorScheme);
}

/**
 * Timer 
 */
wso2vis.u.Timer = function(timerInterval) {
	this.timerInterval = timerInterval; // sets the interval

	var timerID = 0;
	var timerRunning = false;
	var thisObject = null;
	
	this.updateInterval = function(interval) {
		if ((interval > 0) && (interval != this.timerInterval)) {
			this.timerInterval = interval;
			stopTimer();
			startTimer();
		}
	};

	this.startTimer = function() {
		if (timerInterval > 0) {
			this.timerRunning = true;
	
			thisObject = this;
			if (thisObject.timerRunning)
			{
				thisObject.timerID = setInterval(
					function()
					{
						thisObject.tick();
					}, 
					thisObject.timerInterval);
			}
		}
	};
	
	this.stopTimer = function() {
		if (this.timerRunning)
			clearInterval(thisObject.timerID);
		this.timerRunning = false;        
	};
	
	this.tick = function() {	
	};
};

wso2vis.c.Tooltip = function () {
    this.el = document.createElement('div');
    this.el.setAttribute('id', 'ttipRRR'); // a random name to avoid conflicts. 
    this.el.style.display = 'none';
    this.el.style.width = 'auto';
    this.el.style.height = 'auto';
    this.el.style.margin = '0';
    this.el.style.padding = '5px';
    this.el.style.backgroundColor = '#ffffff';
    this.el.style.borderStyle = 'solid';
    this.el.style.borderWidth = '1px';
    this.el.style.borderColor = '#444444';
    this.el.style.opacity = 0.85;
    
    this.el.style.fontFamily = 'Fontin-Sans, Arial';
    this.el.style.fontSize = '12px';
    
    this.el.innerHTML = "<b>wso2vis</b> tooltip demo <br/> works damn fine!";    
    document.body.appendChild(this.el);    
};

wso2vis.c.Tooltip.prototype.style = function() {
    return this.el.style;
};

wso2vis.c.Tooltip.prototype.show = function(x, y, content) {    
	var w = this.el.style.width;
	var h = this.el.style.height;
	var deltaX = 15;
    var deltaY = 15;
	
	if ((w + x) >= (this.getWindowWidth() - deltaX)) { 
		x = x - w;
		x = x - deltaX;
	} 
	else {
		x = x + deltaX;
	}
	
	if ((h + y) >= (this.getWindowHeight() - deltaY)) { 
		y = y - h;
		y = y - deltaY;
	} 
	else {
		y = y + deltaY;
	} 
	
	this.el.style.position = 'absolute';
	this.el.style.top = y + 'px';
	this.el.style.left = x + 'px';	
	if (content != undefined) 
	    this.el.innerHTML = content;
	this.el.style.display = 'block';
	this.el.style.zindex = 1000;
};

wso2vis.c.Tooltip.prototype.hide = function() {
    this.el.style.display = 'none';
};

wso2vis.c.Tooltip.prototype.getWindowHeight = function(){
    var innerHeight;
    if (navigator.appVersion.indexOf('MSIE')>0) {
	    innerHeight = document.body.clientHeight;
    } 
    else {
	    innerHeight = window.innerHeight;
    }
    return innerHeight;	
};
 
wso2vis.c.Tooltip.prototype.getWindowWidth = function(){
    var innerWidth;
    if (navigator.appVersion.indexOf('MSIE')>0) {
	    innerWidth = document.body.clientWidth;
    } 
    else {
	    innerWidth = window.innerWidth;
    }
    return innerWidth;	
};


/**
 * Provider 
 */
wso2vis.p.Provider = function() {
    this.drList = [];
    wso2vis.environment.providers.push(this);
    id = wso2vis.environment.providers.length - 1;
    this.getID = function() {
        return id;
    } 
};

wso2vis.p.Provider.prototype.initialize = function() {
    this.pullData();		
};

wso2vis.p.Provider.prototype.addDataReceiver = function(dataReceiver) {
	this.drList.push(dataReceiver);
};
	
wso2vis.p.Provider.prototype.pushData = function(data) {
	// loop all data receivers. Pump data to them.
    //console.log(JSON.stringify(data) + this.url);
	for (i = 0; i < this.drList.length; i++) {
		(this.drList[i]).pushData(data); 
	}
};

wso2vis.p.Provider.prototype.pullData = function() {
};

/**
* @class ProviderGET
* @extends Provider
**/
wso2vis.p.ProviderGET = function(url) {
	this.url = url;
	this.xmlHttpReq = null;
	
	wso2vis.p.Provider.call(this);
};

wso2vis.extend(wso2vis.p.ProviderGET, wso2vis.p.Provider);

wso2vis.p.ProviderGET.prototype.initialize = function() {
    this.pullDataSync(); // initial pullData call should fill the wire with data to populate filter forms properly, hense the sync call.
};

wso2vis.p.ProviderGET.prototype.pullData = function() {
	// Make sure the XMLHttpRequest object was instantiated
	var that = this;
	if (!that.xmlHttpReq) {
		that.xmlHttpReq = this.createXmlHttpRequest();
	}	
	if (that.xmlHttpReq)
	{
		that.xmlHttpReq.open("GET", that.getURLwithRandomParam()); // to prevent IE caching
		that.xmlHttpReq.onreadystatechange = function() {
            if (that.xmlHttpReq.readyState == 4) {
		        that.pushData(that.parseResponse(that.xmlHttpReq.responseText, that));
         	}
        };
		that.xmlHttpReq.send(null);
	}
}

wso2vis.p.ProviderGET.prototype.pullDataSync = function() {
    var that = this;
	if (!that.xmlHttpReq) {
		that.xmlHttpReq = this.createXmlHttpRequest();
	}
	
	if (that.xmlHttpReq)
	{
		that.xmlHttpReq.open("GET", that.getURLwithRandomParam(), false); // to prevent IE caching		
		that.xmlHttpReq.send(null);
		if (that.xmlHttpReq.status == 200) {
            that.pushData(that.parseResponse(that.xmlHttpReq.responseText, that));
        }
	}
	
	return false;
}

wso2vis.p.ProviderGET.prototype.parseResponse = function(response, that) {
    var resp = that.parseXml(response);
    return that.xmlToJson(resp, "  ");
}

wso2vis.p.ProviderGET.prototype.getURLwithRandomParam = function() {
    if (this.url.indexOf('?') == -1) {
        return this.url + '?random=' + new Date().getTime();
    } 
    return this.url + '&random=' + new Date().getTime();
}

wso2vis.p.ProviderGET.prototype.createXmlHttpRequest = function() {
	var request;

	// Lets try using ActiveX to instantiate the XMLHttpRequest
	// object
	try {
		request = new ActiveXObject("Microsoft.XMLHTTP");
	} catch(ex1) {
		try {
			request = new ActiveXObject("Msxml2.XMLHTTP");
		} catch(ex2) {
			request = null;
		}
	}

	// If the previous didn't work, lets check if the browser natively support XMLHttpRequest
	if (!request && typeof XMLHttpRequest != "undefined") {
		//The browser does, so lets instantiate the object
		request = new XMLHttpRequest();
	}

	return request;
}

/**
 * converts xml string to a dom object
 *
 * @param {string} [xml] a xml string
 * @returns {dom} a xml dom object
 */
wso2vis.p.ProviderGET.prototype.parseXml = function(xml) {
	var dom = null;
	if (window.DOMParser) {
		try { 
		 dom = (new DOMParser()).parseFromString(xml, "text/xml"); 
		} 
		catch (e) { dom = null; }
	}
	else if (window.ActiveXObject) {
		try {
			dom = new ActiveXObject('Microsoft.XMLDOM');
			dom.async = false;
			if (!dom.loadXML(xml)) // parse error ..
				window.alert(dom.parseError.reason + dom.parseError.srcText);
		} 
		catch (e) { dom = null; }
	}
	else
	  window.alert("oops");
	return dom;
}

/**
 * Once passed an xml dom object xmlToJson will create a corresponding JSON object.
 *
 * @param {DOM} [xml] a xml dom object
 * @param {string} [tab] an optional whitespace character to beutify the created JSON string.
 * @returns {object} a JSON object
 */
wso2vis.p.ProviderGET.prototype.xmlToJson = function(xml, tab) {
   var X = {
	  toObj: function(xml) {
		 var o = {};
		 if (xml.nodeType == 1) {   
			if (xml.attributes.length)   
			   for (var i=0; i<xml.attributes.length; i++)
				  o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
			if (xml.firstChild) { 
			   var textChild=0, cdataChild=0, hasElementChild=false;
			   for (var n=xml.firstChild; n; n=n.nextSibling) {
				  if (n.nodeType==1) hasElementChild = true;
				  else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; 
				  else if (n.nodeType==4) cdataChild++; 
			   }
			   if (hasElementChild) {
				  if (textChild < 2 && cdataChild < 2) { 
					 X.removeWhite(xml);
					 for (var n=xml.firstChild; n; n=n.nextSibling) {
						if (n.nodeType == 3)  
						   o["#text"] = X.escape(n.nodeValue);
						else if (n.nodeType == 4)  
						   o["#cdata"] = X.escape(n.nodeValue);
						else if (o[n.nodeName]) {  
						   if (o[n.nodeName] instanceof Array)
							  o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
						   else
							  o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
						}
						else  
						   o[n.nodeName] = X.toObj(n);
					 }
				  }
				  else { 
					 if (!xml.attributes.length)
						o = X.escape(X.innerXml(xml));
					 else
						o["#text"] = X.escape(X.innerXml(xml));
				  }
			   } //(hasElementChild)
			   else if (textChild) { 
				  if (!xml.attributes.length)
					 o = X.escape(X.innerXml(xml));
				  else
					 o["#text"] = X.escape(X.innerXml(xml));
			   }
			   else if (cdataChild) { 
				  if (cdataChild > 1)
					 o = X.escape(X.innerXml(xml));
				  else
					 for (var n=xml.firstChild; n; n=n.nextSibling)
						o["#cdata"] = X.escape(n.nodeValue);
			   }
			}
			if (!xml.attributes.length && !xml.firstChild) o = null;
		 }
		 else if (xml.nodeType==9) { 
			o = X.toObj(xml.documentElement);
		 }
		 else
			alert("unhandled node type: " + xml.nodeType);
		 return o;
	  },
	  toJson: function(o, name, ind) {
	     var p = name.lastIndexOf(':');
	     if (p != -1) {
	        if (p + 1 >= name.length) 
	            name = "";	            
	        else 
	            name = name.substr(p + 1); 	        
	     }
		 var json = name ? ("\""+name+"\"") : "";
		 if (o instanceof Array) {
			for (var i=0,n=o.length; i<n; i++)
			   o[i] = X.toJson(o[i], "", ind+"\t");
			json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
		 }
		 else if (o == null)
			json += (name&&":") + "null";
		 else if (typeof(o) == "object") {
			var arr = [];
			for (var m in o)
			   arr[arr.length] = X.toJson(o[m], m, ind+"\t");
			json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
		 }
		 else if (typeof(o) == "string")
			json += (name&&":") + "\"" + o.toString() + "\"";
		 else
			json += (name&&":") + o.toString();
		 return json;
	  },
	  innerXml: function(node) {
		 var s = ""
		 if ("innerHTML" in node)
			s = node.innerHTML;
		 else {
			var asXml = function(n) {
			   var s = "";
			   if (n.nodeType == 1) {
				  s += "<" + n.nodeName;
				  for (var i=0; i<n.attributes.length;i++)
					 s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
				  if (n.firstChild) {
					 s += ">";
					 for (var c=n.firstChild; c; c=c.nextSibling)
						s += asXml(c);
					 s += "</"+n.nodeName+">";
				  }
				  else
					 s += "/>";
			   }
			   else if (n.nodeType == 3)
				  s += n.nodeValue;
			   else if (n.nodeType == 4)
				  s += "<![CDATA[" + n.nodeValue + "]]>";
			   return s;
			};
			for (var c=node.firstChild; c; c=c.nextSibling)
			   s += asXml(c);
		 }
		 return s;
	  },
	  escape: function(txt) {
		 return txt.replace(/[\\]/g, "\\\\")
				   .replace(/[\"]/g, '\\"')
				   .replace(/[\n]/g, '\\n')
				   .replace(/[\r]/g, '\\r');
	  },
	  removeWhite: function(e) {
		 e.normalize();
		 for (var n = e.firstChild; n; ) {
			if (n.nodeType == 3) {  
			   if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { 
				  var nxt = n.nextSibling;
				  e.removeChild(n);
				  n = nxt;
			   }
			   else
				  n = n.nextSibling;
			}
			else if (n.nodeType == 1) {  
			   X.removeWhite(n);
			   n = n.nextSibling;
			}
			else                      
			   n = n.nextSibling;
		 }
		 return e;
	  }
   };
   if (xml.nodeType == 9) 
	  xml = xml.documentElement;
   var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
   return JSON.parse("{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}");
}

/**
* @class ProviderGET
* @extends Provider
**/
wso2vis.p.ProviderGETJSON = function(url) {
	this.url = url;
	this.xmlHttpReq = null;
	
	wso2vis.p.Provider.call(this);
};

wso2vis.extend(wso2vis.p.ProviderGETJSON, wso2vis.p.ProviderGET);


wso2vis.p.ProviderGETJSON.prototype.parseResponse = function(response, that) {
    var trimmedResponse = response.replace(/^\s*/, "").replace(/\s*$/, "");
    if (trimmedResponse == "") return response;
    return JSON.parse(response);
}
/** 
 * DataSubscriber 
 */
wso2vis.s.Subscriber = function() {
    this.attr = [];
    wso2vis.environment.subscribers.push(this);
    id = wso2vis.environment.subscribers.length - 1;
    this.getID = function() {
        return id;
    };
};

wso2vis.s.Subscriber.prototype.property = function(name) {
    /*
    * Define the setter-getter globally
    */
    wso2vis.s.Subscriber.prototype[name] = function(v) {
      if (arguments.length) {
        this.attr[name] = v;
        return this;
      }
      return this.attr[name];
    };

    return this;
};

/**
 * Set data to the subscriber. Providers use this method to push data to subscribers.
 *
 * @param {object} [data] a JSON object.
 */
wso2vis.s.Subscriber.prototype.pushData = function(data) {
};

/**
 * Filter
 */
wso2vis.f.Filter = function() {
    this.attr = [];
	this.dp = null;
	this.drList = [];
	wso2vis.environment.filters.push(this);
    id = wso2vis.environment.filters.length - 1;
    this.getID = function() {return id;}
};

wso2vis.f.Filter.prototype.property = function(name) {
    /*
    * Define the setter-getter globally
    */
    wso2vis.f.Filter.prototype[name] = function(v) {
      if (arguments.length) {
        this.attr[name] = v;
        return this;
      }
      return this.attr[name];
    };

    return this;
};

wso2vis.f.Filter.prototype.dataProvider = function(dp) {
	this.dp = dp;
	this.dp.addDataReceiver(this);
	return;
};

wso2vis.f.Filter.prototype.addDataReceiver = function(dr) {
	this.drList.push(dr);
};

wso2vis.f.Filter.prototype.pushData = function(data) {
	var filteredData = this.filterData(data);
	for (i = 0; i < this.drList.length; i++) {
		(this.drList[i]).pushData(filteredData); 
	}
};

wso2vis.f.Filter.prototype.pullData = function() {
	this.dp.pullData();
};

wso2vis.f.Filter.prototype.filterData = function(data) {
	return data;
};

wso2vis.f.Filter.prototype.traverseToDataField = function (object, dataFieldArray) {
	var a = object;					
	for (var i = 0; i < dataFieldArray.length; i++) {
		a = a[dataFieldArray[i]];
	}
	return a;
};
/**
 * BasicFilter (Inherited from Filter)
 */
wso2vis.f.BasicFilter = function(dataField, dataLabel, filterArray) {
	wso2vis.f.Filter.call(this);

    this.dataField(dataField)
        .dataLabel(dataLabel)
	    .filterArray(filterArray);

    /* @private */
    this.remainingArray = [];
};

wso2vis.extend(wso2vis.f.BasicFilter, wso2vis.f.Filter);

wso2vis.f.BasicFilter.prototype
    .property("dataField")
    .property("dataLabel")
    .property("filterArray");

wso2vis.f.BasicFilter.prototype.filterData = function(data) {	
    function getLbl(obj, dataLabel, x, that) {
        var r;
        if (obj instanceof Array) {
            r = obj[x];
        }
        else {
            r = obj;
        }
        return that.traverseToDataField(r, dataLabel);
    }
	    
	function filter(object, dataLabel, filterArray, that) {	    
	    var dcount = 1;
	    if (object instanceof Array)
	        dcount = object.length;
	    
	    if ((filterArray === undefined) || (filterArray == null)) {
	        var arr = [];
	         
	        for (var i = dcount - 1; i >= 0; i--) {
				arr.push(getLbl(object, dataLabel, i, that));
			}
			return {rem:[], fil:arr};					    
	    }
	    else {
	        remainingArray = [];
		    for (var i = dcount - 1; i >= 0; i--) {
			    var found = false;
			    var label = getLbl(object, dataLabel, i, that);
			    for (var j = 0; j < filterArray.length; j++) {
				    if (label == filterArray[j]) {
					    found  = true;
					    break;
				    }							
			    }
			    if (!found) {				
				    remainingArray.push(label);
				    if (object instanceof Array)
				        object.splice(i, 1); // not found! remove from the object				
				    else {
				        // unhandled.. TODO: Fixed This damn bug. 
				        alert("TODO: fix this ;)");
				    }
			    }			
		    }
		    return {rem:remainingArray, fil:filterArray};
	    }
	}
	
	function sortthem(object, dataLabel, filterArray, that) {
	    if ((filterArray === undefined) || (filterArray == null)) {
	        return;
	    }
	    var dcount = 1;
	    if (object instanceof Array)
	        dcount = object.length;
	        
		var index = 0;
		for (var i = 0; i < filterArray.length; i++) {
			for (var j = 0; j < dcount; j++) {
			    var label = getLbl(object, dataLabel, j, that);
				if (label == filterArray[i]) {
					if (index != j) {
						var temp = object[index];
						object[index] = object[j];
						object[j] = temp;
					}
					index++;
					break;
				}														
			}
		}
	}

    
	var cloned = JSON.parse(JSON.stringify(data)); //eval(data.toSource());				
	var filtered = this.traverseToDataField(cloned, this.dataField());
	var result = filter(filtered, this.dataLabel(), this.filterArray(), this);
	this.remainingArray = result.rem;
	this.filterArray(result.fil);	
	sortthem(filtered, this.dataLabel(), this.filterArray(), this);

	return cloned;
};
/**
 * @class Select
 * @extends Form
 */
wso2vis.f.form.Select = function() { //canvas, selectID, onChangeFuncStr, dataField, key, value, defaultText) {
    wso2vis.f.BasicFilter.call(this);
    this.defaultText("default");
    this.filterArray([]);
    /* @private */
	this.dirty = true;
};

wso2vis.extend(wso2vis.f.form.Select, wso2vis.f.BasicFilter);

wso2vis.f.form.Select.prototype
    .property("canvas")
    .property("dataField")
    .property("dataLabel")
    .property("dataValue")
    .property("defaultText");

wso2vis.f.form.Select.prototype.invalidate = function() {
    this.dirty = true;
}

/*wso2vis.f.form.Select.prototype.filterData = function(data) {
    if (this.dirty) {
        this.dirty = false;
        
        
        
    }
    this.superclass.filterData(data);
};*/

wso2vis.f.form.Select.prototype.create = function() {
    var newElementHTML = '<select id="wso2visSelect_'+this.getID()+'" onchange="wso2vis.fn.selectFormChanged('+this.getID()+');">';    
    if ((this.filterArray() !== undefined) && (this.filterArray() !== null) && (this.filterArray().length > 0)) {
        newElementHTML += '<option value="' + this.defaultText() + '">' + this.defaultText() + '</option>';
        newElementHTML += '<option value="' + this.filterArray()[0] + '" selected>' + this.filterArray()[0] + '</option>';        
    }
    else {
        newElementHTML += '<option value="' + this.defaultText() + '" selected>' + this.defaultText() + '</option>';
    }    
    if (this.remainingArray !== null && this.remainingArray.length > 0) {
        for (var x = 0; x < this.remainingArray.length; x++) {
            newElementHTML += '<option value="' + this.remainingArray[x] + '">' + this.remainingArray[x] + '</option>'
        }
    }    
    newElementHTML += '</select>';
    return newElementHTML;
};

wso2vis.f.form.Select.prototype.load = function() {    var canvas = document.getElementById(this.canvas());    canvas.innerHTML = this.create();};
wso2vis.f.form.Select.prototype.unload = function() {    var canvas = document.getElementById(this.canvas());    canvas.innerHTML = "";};

wso2vis.f.form.Select.prototype.onChange = function(text) {    
};

wso2vis.fn.selectFormChanged = function(id) {
    var filter = wso2vis.fn.getFilterFromID(id);
    var elem = document.getElementById("wso2visSelect_"+id);      
    filter.filterArray([]);
    if (elem[elem.selectedIndex].text != filter.defaultText())
        filter.filterArray().push(elem[elem.selectedIndex].text);   
    filter.onChange(elem[elem.selectedIndex].text);  
};
/**
* FilterForm 
*/
wso2vis.f.form.FilterForm = function() {
	wso2vis.f.BasicFilter.call(this);
};

wso2vis.extend(wso2vis.f.form.FilterForm, wso2vis.f.BasicFilter);

wso2vis.f.form.FilterForm.prototype.property("canvas");

wso2vis.f.form.FilterForm.prototype.create = function() {
    var i = 0;
    var content;
    content = '<form>' +
    '<table width="100%" border="0">' +
    '<tr>' +
    '  <td width="13%" rowspan="4"><select name="FilterFormList1_'+this.getID()+'" id="FilterFormList1_'+this.getID()+'" size="10" style="width: 110px">';
    for (i = 0; i < this.remainingArray.length; i++) {
        if (i == 0)
            content += '<option value="'+i+'" selected>' + this.remainingArray[i] +'</option>';
        else 
            content += '<option value="'+i+'">' + this.remainingArray[i] +'</option>';
    }
    content += '  </select></td>' +
    '  <td width="6%">&nbsp;</td>' +
    '  <td width="14%" rowspan="4"><select name="FilterFormList2_'+this.getID()+'" id="FilterFormList2_'+this.getID()+'" size="10" style="width: 110px">';
    if (this.filterArray() !== undefined) {
        for (i = 0; i < this.filterArray().length; i++) {
            if (i == 0)
                content += '<option value="'+i+'" selected>' + this.filterArray()[i] +'</option>';
            else 
                content += '<option value="'+i+'">' + this.filterArray()[i] +'</option>';
        }
    }
    content += '  </select></td>' +
    '  <td width="7%">&nbsp;</td>' +
    '  <td width="60%" rowspan="4">&nbsp;</td>' +
    '</tr>' +
    '<tr>' +
    '  <td><div align="center">' +
    '    <input type="button" name="buttonLeft" id="buttonLeft" value="Add" style="width: 50px" onclick="FilterFormButtonLeft('+this.getID()+');"/>' +
    '  </div></td>' +
    '  <td><div align="center">' +
    '      <input type="button" name="buttonUp" id="buttonUp" value="Up" style="width: 50px" onclick="FilterFormButtonUp('+this.getID()+');"/>' +
    '  </div></td>' +
    '</tr>' +
    '<tr>' +
    '  <td><div align="center">' +
    '    <input type="button" name="buttonRight" id="buttonRight" value="Remove" style="width: 50px" onclick="FilterFormButtonRight('+this.getID()+');"/>' +
    '  </div></td>' +
    '  <td><div align="center">' +
    '      <input type="button" name="buttonDown" id="buttonDown" value="Down" style="width: 50px" onclick="FilterFormButtonDown('+this.getID()+');"/>' +
    '  </div></td>' +
    '</tr>' +
    '<tr>' +
    '  <td>&nbsp;</td>' +
    '  <td>&nbsp;</td>' +
    '</tr>' +
    '<tr>' +
    '  <td colspan="5">' +
    '    <input type="button" name="buttonApply" id="buttonApply" value="Apply" style="width: 50px"  onclick="FilterFormButtonApply('+this.getID()+')"/>' +
    '    <input type="button" name="buttonCancel" id="buttonCancel" value="Cancel" style="width: 50px"  onclick="FilterFormButtonCancel('+this.getID()+')"/></td>' +
    '</tr>' +
    '</table>' +
    '</form>';
    
    return content;
}

wso2vis.f.form.FilterForm.prototype.load = function() {    var canvas = document.getElementById(this.canvas());    canvas.innerHTML = this.create();};
wso2vis.f.form.FilterForm.prototype.unload = function() {    var canvas = document.getElementById(this.canvas());    canvas.innerHTML = "";};

wso2vis.f.form.FilterForm.prototype.onApply = function(data) {    
};

wso2vis.f.form.FilterForm.prototype.create.onCancel = function() {
};

FilterFormButtonUp = function(id) {
	FilterFormItemMoveWithin(true, "FilterFormList2_"+id);
};

FilterFormButtonDown = function(id) {
	FilterFormItemMoveWithin(false, "FilterFormList2_"+id);
};

FilterFormButtonLeft = function(id) {
	FilterFormItemMoveInbetween("FilterFormList1_"+id, "FilterFormList2_"+id);
};

FilterFormButtonRight = function(id) {
	FilterFormItemMoveInbetween("FilterFormList2_"+id, "FilterFormList1_"+id);
};

FilterFormButtonApply = function(id) {
    var basicDataFilter = wso2vis.fn.getFilterFromID(id);	
    var list2Element = document.getElementById("FilterFormList2_" + id);
    var i = 0;
    basicDataFilter.filterArray([]);
    for (i = 0; i < list2Element.length; i++) {
        basicDataFilter.filterArray().push(list2Element.options[i].text);
    }    
    basicDataFilter.onApply(basicDataFilter.filterArray());
};

FilterFormButtonCancel = function(id) {
    var FilterForm = wso2vis.fn.getFilterFromID(id);
    FilterForm.onCancel();
};

FilterFormItemMoveInbetween = function(listName, listName2) {
    var src = document.getElementById(listName);
    var dst = document.getElementById(listName2);
    var idx = src.selectedIndex;
    if (idx==-1) 
        alert("You must first select the item to move.");
    else {
        var oldVal = src[idx].value;
        var oldText = src[idx].text;
        src.remove(idx);		

        var nxidx;
        if (idx>=src.length-1) 
	        nxidx=src.length-1;		
        else 
	        nxidx=idx;			
        if (src.length > 0) { 
	        src.selectedIndex = nxidx;		
        }

        var opNew = document.createElement('option');
        opNew.text = oldText;
        opNew.value = oldVal;		
        try {
	        dst.add(opNew, null); // standards compliant; doesn't work in IE
        }
        catch(ex) {
	        dst.add(opNew); // IE only
        }		
        dst.selectedIndex = dst.length - 1;	
    }
};

FilterFormItemMoveWithin = function(bDir,sName) {
    var el = document.getElementById(sName);
    var idx = el.selectedIndex
    if (idx==-1) 
        alert("You must first select the item to reorder.")
    else {
        var nxidx = idx+( bDir? -1 : 1)
        if (nxidx<0) nxidx=el.length-1
        if (nxidx>=el.length) nxidx=0
        var oldVal = el[idx].value
        var oldText = el[idx].text
        el[idx].value = el[nxidx].value
        el[idx].text = el[nxidx].text
        el[nxidx].value = oldVal
        el[nxidx].text = oldText
        el.selectedIndex = nxidx
    }
};

/**
 * @class
 * Base class for all charts
 */
wso2vis.s.chart.Chart = function (canvas, ttle, desc) {
    wso2vis.s.Subscriber.call(this);
    /* @private */
    this.title(ttle)
        .description(desc)
        .divEl(canvas)
        .tooltip(true)
        .legend(true)
        .marks(false)
        .width(600)
        .height(500)
        .titleFont("10px sans-serif")
        .labelFont("10px sans-serif");

    /* @private */
    this.data = null;
    this.formattedData = null;

    wso2vis.environment.charts.push(this);
    id = wso2vis.environment.charts.length - 1;
    this.getID = function() {
        return id;
    };
};

wso2vis.extend(wso2vis.s.chart.Chart, wso2vis.s.Subscriber);

wso2vis.s.chart.Chart.prototype
    .property("title")
    .property("description")
    .property("divEl")
    .property("msgDiv")
    .property("tooltip")
    .property("legend")
    .property("width")
    .property("height")
    .property("titleFont")
    .property("labelFont")
    .property("marks");

wso2vis.s.chart.Chart.prototype.pushData = function (d) {
    if( this.validateData(d) ){
        this.data = d;
        this.update();
    } else {
        this.updateMessageDiv(this.messageInterceptFunction());
    }
};

wso2vis.s.chart.Chart.prototype.validateData = function (d) {
    //Check whether we have valid data or not.
    if( d === null || d === undefined ) {
        return false;
    }
    else {
        return true;
    }
};

wso2vis.s.chart.Chart.prototype.update = function () {
};

wso2vis.s.chart.Chart.prototype.updateMessageDiv = function (s) {

    if( this.msgDiv() !== undefined ) {
        var msgdiv = document.getElementById(this.msgDiv());
        if( msgdiv !== undefined ) {
            msgdiv.innerHTML = s;
            msgdiv.style.display = "block";
        }
    }
};

wso2vis.s.chart.Chart.prototype.messageInterceptFunction = function () {

    return "Invalid Data";
};

wso2vis.s.chart.Chart.prototype.onClick = function () {
};

wso2vis.s.chart.Chart.prototype.onTooltip = function (data) {
    return "";
};

wso2vis.s.chart.Chart.prototype.onKey = function () {
};

wso2vis.s.chart.Chart.prototype.traverseToDataField = function (object, dataFieldArray) {
	var a = object;
    try { //Try catch outside the loop TODO
	    for (var i = 0; i < dataFieldArray.length; i++) {
		    a = a[dataFieldArray[i]];
	    }
    }
    catch (e) {
        this.updateMessageDiv(this.messageInterceptFunction());
    }
	return a;
};

wso2vis.s.chart.Chart.prototype.getDataObject = function (dataObj, i) {
    if( dataObj instanceof Array ) {
        return dataObj[i];
    }
    else {
        return dataObj;
    }
};

//@class wso2vis.s.chart.protovis.WedgeChart : wso2vis.s.chart.Chart
//This is the custom wrapper class for axiis bar charts

//Constructor
wso2vis.s.chart.protovis.WedgeChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    this.labelLength(12)
        .thickness(30);

    /* @private */
    this.vis = null;
}

// this makes c.protovis.WedgeChart.prototype inherits from wso2vis.s.chart.Chart
wso2vis.extend(wso2vis.s.chart.protovis.WedgeChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.WedgeChart.prototype
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("labelLength")
    .property("thickness");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.WedgeChart.prototype.load = function (w) {
    if ( w !== undefined ) {
        this.width(w);
    }
    /*if ( h !== undefined ) { //not using height for the Wedge
        this.height(h);
    }*/
    var r = this.width() / 2.5;

    var thisObject = this;
    
    this.vis = new pv.Panel()
        //.def("i", -1)
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); });
    
    var wedge = this.vis.add(pv.Wedge)
        .data(function() { return pv.normalize(thisObject.getData(thisObject)); })
        .left(this.width() / 2)
        .bottom(this.width() / 2)
        .innerRadius(function() { return (r - thisObject.thickness()); })
        .outerRadius(r)
        .angle(function(d) { return (d * 2 * Math.PI); })
        .title(function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });

    wedge.anchor("outer").add(pv.Label)
        .visible(function(d) { return (d > 0.05); })
        .textMargin(function(){ return thisObject.thickness() + 5; })
        .text(function(d) { var lbl=thisObject.getDataLabel(this.index); return (lbl.length > thisObject.labelLength() ? lbl.substring(0,thisObject.labelLength())+"..." : lbl); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle(function() { return wedge.fillStyle(); });

    wedge.anchor("center").add(pv.Label)
         .visible(function(d) { return (thisObject.marks() && (d > 0.10)); })
         .textAngle(0)
         .text(function(d) { return (d*100).toFixed() + "%"; })
         .textStyle("#fff");

     this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.WedgeChart.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

/**
* @private
*/
wso2vis.s.chart.protovis.WedgeChart.prototype.populateData = function (thisObject) {

    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
    var dataGrpCount = 1;

    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    this.formattedData = pv.range(dataGrpCount).map( genDataMap );

    function genDataMap(x) {
        var rootObj;
        if( _dataField instanceof Array ) {
            rootObj = _dataField[x];
        }
        else {
            rootObj = _dataField;
        }
        return parseInt(thisObject.traverseToDataField(rootObj, thisObject.dataValue()));
    }
};

wso2vis.s.chart.protovis.WedgeChart.prototype.getData = function (thisObject) {

    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.WedgeChart.prototype.update = function () {

    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.WedgeChart.prototype.getDataLabel = function (i) {

    if (this.data !== null){

        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    
    return i;
};

//@class wso2vis.s.chart.protovis.PieChart : wso2vis.s.chart.WedgeChart

//Constructor
wso2vis.s.chart.protovis.PieChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.protovis.WedgeChart.call(this, canvas, chartTitle, chartDesc);
}

// this makes c.protovis.PieChart.prototype inherits from wso2vis.s.chart.WedgeChart
wso2vis.extend(wso2vis.s.chart.protovis.PieChart, wso2vis.s.chart.protovis.WedgeChart);

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.PieChart.prototype.load = function (w) {
    if ( w !== undefined ) {
        this.width(w);
    }
    /*if ( h !== undefined ) { //not using height for the Wedge
        this.height(h);
    }*/
    var r = this.width() / 2.5;

    var thisObject = this;
    
    this.vis = new pv.Panel()
        //.def("i", -1)
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); });
    
    var wedge = this.vis.add(pv.Wedge)
        .data(function() { return pv.normalize(thisObject.getData(thisObject)); })
        .left(this.width() / 2)
        .bottom(this.width() / 2)
        .innerRadius(0)
        .outerRadius(r)
        .angle(function(d) { return (d * 2 * Math.PI); })
        .title(function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });

    wedge.anchor("center").add(pv.Label)
         .visible(function(d) { return (thisObject.marks() && (d > 0.10)); })
         .textAngle(0)
         .text(function(d) { return (d*100).toFixed() + "%"; })
         .textStyle("#fff");

     this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

//Class c.protovis.BarChart : Chart
//This is the custom wrapper class for protovis bar charts

//Constructor
wso2vis.s.chart.protovis.BarChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    /* @private */
    this.vis = null;
    this.y = null;
    this.x = null;
}

// this makes c.protovis.BarChart.prototype inherits
// from Chart.prototype
wso2vis.extend(wso2vis.s.chart.protovis.BarChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.BarChart.prototype
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("ySuffix")
    .property("xSuffix");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.BarChart.prototype.load = function (w, h) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }

    var thisObject = this;

    this.x = pv.Scale.linear(0, 1).range(0, this.width());
    this.y = pv.Scale.ordinal(pv.range(3)).splitBanded(0, this.height()*0.9, 4/5);
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); })
        //.def("i", 1)
        .bottom(20)
        .left(100)
        .right(10)
        .top(5);

    var panel = this.vis.add(pv.Panel)
        .top(function() { return (thisObject.height() * (1 - thisObject.titleSpacing())); })
        .height(function() { return (thisObject.height() * thisObject.titleSpacing()); });
     
    var bar = panel.add(pv.Bar)
        .data(function() { return thisObject.getData(thisObject); })
        .top(function() { return thisObject.y(this.index); })
        .height(function() { return thisObject.y.range().band; })
        .width(thisObject.x)
        .left(0)
        //.fillStyle(pv.Colors.category20().by(pv.index))
        .title(function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });
     
    bar.anchor("right").add(pv.Label)
        .visible(function() { return thisObject.marks(); })
        .textStyle("white")
        .textMargin(5)
        .text(function(d) { return d; });

    bar.anchor("left").add(pv.Label)
        .textMargin(5)
        .textAlign("right")
        .text(function() { return thisObject.getDataLabel(this.index); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.x.ticks(); })
        .left(function(d) { return (Math.round(thisObject.x(d)) - 0.5); })
        .strokeStyle(function(d) { return (d ? "rgba(128,128,128,.3)" : "rgba(128,128,128,.8)"); })
      .add(pv.Rule)
        .bottom(0)
        .height(5)
        .strokeStyle("rgba(128,128,128,.2)")
      .anchor("bottom").add(pv.Label)
        .text(function(d) { return d.toFixed(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.BarChart.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

/**
* @private
*/
wso2vis.s.chart.protovis.BarChart.prototype.populateData = function (thisObject) {
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());

    var dataGrpCount = 1;
    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    thisObject.formattedData = pv.range(dataGrpCount).map( genDataMap );

    
    var maxVal = thisObject.formattedData.max();
    if (maxVal < 5) maxVal = 5; // fixing value repeating issue.

    this.x.domain(0, maxVal).range(0,this.width());
    this.y.domain(pv.range(dataGrpCount)).splitBanded(0, (this.height() * thisObject.titleSpacing()), 4/5);

    function genDataMap(x) {
        var rootObj;
        if( _dataField instanceof Array ) {
            rootObj = _dataField[x];
        }
        else {
            rootObj = _dataField;
        }
        return parseInt(thisObject.traverseToDataField(rootObj, thisObject.dataValue()));
    }
};

wso2vis.s.chart.protovis.BarChart.prototype.getData = function (thisObject) {
    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.BarChart.prototype.update = function () {
    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.BarChart.prototype.getDataLabel = function (i) {
    if (this.data !== null){

        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    
    return i;
};

//Class c.protovis.ClusteredBarChart : Chart
//This is the custom wrapper class for protovis bar charts

//Constructor
wso2vis.s.chart.protovis.ClusteredBarChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    this.ySuffix("")
        .xSuffix("");

    /* @private */
    this.vis = null;
    this.y = null;
    this.x = null;
    this.dataFieldCount = 1;
    this.subDataFieldCount = 1;
    this.maxDataValue = 50;
}

// this makes c.protovis.ClusteredBarChart.prototype inherit from Chart
wso2vis.extend(wso2vis.s.chart.protovis.ClusteredBarChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.ClusteredBarChart.prototype
    .property("dataField")
    .property("dataLabel")
    .property("subDataField")
    .property("subDataValue")
    .property("subDataLabel")
    .property("ySuffix")
    .property("xSuffix");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.ClusteredBarChart.prototype.load = function (w, h) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }

    var thisObject = this;

    this.x = pv.Scale.linear(0, this.maxDataValue).range(0, this.width());
    this.y = pv.Scale.ordinal(pv.range(this.dataFieldCount)).splitBanded(0, this.height()*0.9, 4/5);
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        //.def("i", 1) //always true
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); })
        .bottom(20)
        .left(100)
        .right(10)
        .top(5);

    var panel = this.vis.add(pv.Panel)
        .top(function() { return (thisObject.height() * (1 - thisObject.titleSpacing())); })
        .height(function() { return (thisObject.height() * thisObject.titleSpacing()); });
     
    var bar = panel.add(pv.Panel)
        .data(function() { return thisObject.getData(thisObject); })
        .top(function() { return thisObject.y(this.index); })
      .add(pv.Bar)
        .data(function(a) { return a; })
        .top(function() { return (this.index * thisObject.y.range().band / thisObject.subDataFieldCount); })
        .height(function() { return (thisObject.y.range().band / thisObject.subDataFieldCount); })
        .left(0)
        .width(thisObject.x)
        .fillStyle(pv.Colors.category20().by(pv.index))
        .title(function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.parent.index], this.index);
            }
            else {
                return thisObject.onTooltip(dataObj, this.index);
            }
        })
        .event("click", function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.parent.index], this.index);
            }
            else {
                return thisObject.onClick(dataObj, this.index);
            }
        });
     
    bar.anchor("right").add(pv.Label)
        .visible(function() { return thisObject.marks(); })
        .textStyle("white")
        .text(function(d) { return d; });
     
    panel.add(pv.Label)
        .data(function() { return pv.range(thisObject.dataFieldCount); })
        .left(0)
        .top(function() { return (thisObject.y(this.index) + thisObject.y.range().band / 2); })
        .textMargin(5)
        .textAlign("right")
        .text(function() { return thisObject.getDataLabel(this.index); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.x.ticks(); })
        .left(function(d) { return (Math.round(thisObject.x(d)) - 0.5); })
        .strokeStyle(function(d) { return (d ? "rgba(128,128,128,.3)" : "rgba(128,128,128,.8)"); })
      .add(pv.Rule)
        .bottom(0)
        .height(5)
        .strokeStyle("rgba(128,128,128,.2)")
      .anchor("bottom").add(pv.Label)
        .text(function(d) { return d.toFixed(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.ClusteredBarChart.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

wso2vis.s.chart.protovis.ClusteredBarChart.prototype.populateData = function (thisObject) {

    var tmpMaxValHolder = [];
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());

    var dataGrpCount = 1;
    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    thisObject.subDataFieldCount = 1;
    thisObject.formattedData = pv.range(dataGrpCount).map( genDataMap );
    thisObject.dataFieldCount = dataGrpCount;
    thisObject.maxDataValue = tmpMaxValHolder.max() + 5; //to keep bars inside the ruler
    if (thisObject.maxDataValue < 5) thisObject.maxDataValue = 5; // fixing value repeating issue.

    thisObject.x.domain(0, thisObject.maxDataValue).range(0,thisObject.width());
    thisObject.y.domain(pv.range(thisObject.dataFieldCount)).splitBanded(0, (this.height() * thisObject.titleSpacing()), 4/5);

    function genDataMap(x) {
        var innerArray = [];

        var rootObja;
        if( _dataField instanceof Array ) {
            rootObja = _dataField[x];
        }
        else {
            rootObja = _dataField;
        }

        var _subDataField = thisObject.traverseToDataField(rootObja, thisObject.subDataField());

        var subDataGrpCount = 1;
        if( _subDataField instanceof Array ) {
            subDataGrpCount = _subDataField.length;
            thisObject.subDataFieldCount = (thisObject.subDataFieldCount < _subDataField.length) ? _subDataField.length : thisObject.subDataFieldCount;
        }

        for(var y=0; y<subDataGrpCount; y++) {
            var rootObjb;
            if( _subDataField instanceof Array ) {
                rootObjb = _subDataField[y];
            }
            else {
                rootObjb = _subDataField;
            }
            var temp = parseInt(thisObject.traverseToDataField(rootObjb, thisObject.subDataValue()));
            innerArray.push(temp);
        }
        tmpMaxValHolder.push(innerArray.max());
        return innerArray;
    }
};

wso2vis.s.chart.protovis.ClusteredBarChart.prototype.getData = function (thisObject) {

    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.ClusteredBarChart.prototype.update = function () {

    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.ClusteredBarChart.prototype.getDataLabel = function (i) {
    if (this.data !== null){

        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    return i;
};

wso2vis.s.chart.protovis.ClusteredBarChart.prototype.getSubDataLable = function (i, j) {
    if (this.data !== null){
        var rootDataObj;
        var _dataField = this.traverseToDataField(this.data, this.dataField());

        if( _dataField instanceof Array ) {
            rootDataObj = _dataField[i];
        }
        else {
            rootDataObj = _dataField;
        }

        var rootSubDataObj = this.traverseToDataField(rootDataObj, this.subDataField());

        if( rootSubDataObj instanceof Array ) {
            return this.traverseToDataField(rootSubDataObj[j], this.subDataLabel());
        }
        else {
            return this.traverseToDataField(rootSubDataObj, this.subDataLabel());
        }
    }
    return j;
};

//Class c.protovis.ColumnChart : Chart
//This is the custom wrapper class for protovis column charts

//Constructor
wso2vis.s.chart.protovis.ColumnChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    this.ySuffix("")
        .xSuffix("");

    /* @private */
    this.vis = null;
    this.y = null;
    this.x = null;
}

// this makes c.protovis.ColumnChart.prototype inherits
// from Chart.prototype
wso2vis.extend(wso2vis.s.chart.protovis.ColumnChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.ColumnChart.prototype
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("ySuffix")
    .property("xSuffix");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.ColumnChart.prototype.load = function (w, h) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }

    var n = 3;
    var thisObject = this;

    this.y = pv.Scale.linear(0, 1).range(0, this.height()*0.9);
    this.x = pv.Scale.ordinal(pv.range(n)).splitBanded(0, this.width(), 4/5);
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height()+100; }) /* TODO this 100 is a dirty hack to make sure all the labels are visible. need to fix this!!! */
        .bottom(20)
        .left(30)
        .right(10)
        .top(5);

    var panel = this.vis.add(pv.Panel)
        .top(function() { return (thisObject.height() * (1 - thisObject.titleSpacing())); })
        .height(function() { return (thisObject.height() * thisObject.titleSpacing()); });
     
    var bar = panel.add(pv.Bar)
        .data(function() { return thisObject.getData(thisObject); })
        .left(function() { return thisObject.x(this.index); })
        .width(function() { return thisObject.x.range().band; })
        .bottom(0)
        .height(thisObject.y)
        .title(function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });
     
    bar.anchor("top").add(pv.Label)
        .visible(function() { return thisObject.marks(); })
        .textStyle("white")
        .textMargin(5)
        .text(function(d) { return d; });

    bar.anchor("bottom").add(pv.Label)
        .textMargin(10)
        .textBaseline("top")
        .textAngle(Math.PI / 2)
        .textAlign("left")
        .text(function() { return thisObject.getDataLabel(this.index); })
        .font(function() { return thisObject.labelFont(); });
        /*.add(pv.Bar).fillStyle("rgba(128,128,128,0.1)").height(6);*/
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.y.ticks(); })
        .bottom(function(d) { return (Math.round(thisObject.y(d)) - 0.5); })
        .strokeStyle(function(d) { return (d ? "rgba(128,128,128,.5)" : "#000"); })
      .add(pv.Rule)
        .left(0)
        .width(5)
        .strokeStyle("rgba(128,128,128,.2)")
      .anchor("left").add(pv.Label)
        .text(function(d) { return d.toFixed(); })
        .font(function() { return thisObject.labelFont(); });

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.ColumnChart.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

wso2vis.s.chart.protovis.ColumnChart.prototype.populateData = function (thisObject) {
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());

    var dataGrpCount = 1;
    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    thisObject.formattedData = pv.range(dataGrpCount).map( genDataMap );

    
    var maxVal = thisObject.formattedData.max() + 5; //to make sure the bars are inside the rule
    if (maxVal < 5) maxVal = 5; // fixing value repeating issue.

    this.y.domain(0, maxVal).range(0,(this.height() * thisObject.titleSpacing()));
    this.x.domain(pv.range(dataGrpCount)).splitBanded(0, this.width(), 4/5);

    function genDataMap(x) {
        var rootObj;
        if( _dataField instanceof Array ) {
            rootObj = _dataField[x];
        }
        else {
            rootObj = _dataField;
        }
        return parseInt(thisObject.traverseToDataField(rootObj, thisObject.dataValue()));
    }
};

wso2vis.s.chart.protovis.ColumnChart.prototype.getData = function (thisObject) {
    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.ColumnChart.prototype.update = function () {
    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.ColumnChart.prototype.getDataLabel = function (i) {
    if (this.data !== null){

        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    
    return i;
};

//Class c.protovis.ClusteredColumnChart : Chart
//This is the custom wrapper class for protovis bar charts

//Constructor
wso2vis.s.chart.protovis.ClusteredColumnChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    this.ySuffix("")
        .xSuffix("");

    /* @private */
    this.vis = null;
    this.y = null;
    this.x = null;
    this.dataFieldCount = 1;
    this.subDataFieldCount = 1;
    this.maxDataValue = 50;
}

// this makes c.protovis.ClusteredColumnChart.prototype inherit from Chart
wso2vis.extend(wso2vis.s.chart.protovis.ClusteredColumnChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.ClusteredColumnChart.prototype
    .property("dataField")
    .property("dataLabel")
    .property("subDataField")
    .property("subDataValue")
    .property("subDataLabel")
    .property("ySuffix")
    .property("xSuffix");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.load = function (w, h) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }

    var thisObject = this;

    this.y = pv.Scale.linear(0, this.maxDataValue).range(0, this.height()*0.9);
    this.x = pv.Scale.ordinal(pv.range(this.dataFieldCount)).splitBanded(0, this.width(), 4/5);
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        //.def("i", 1) //always true
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); })
        .bottom(20)
        .left(30)
        .right(10)
        .top(5);

    var panel = this.vis.add(pv.Panel)
        .top(function() { return (thisObject.height() * (1 - thisObject.titleSpacing())); })
        .height(function() { return (thisObject.height() * thisObject.titleSpacing()); });
     
    var bar = panel.add(pv.Panel)
        .data(function() { return thisObject.getData(thisObject); })
        .left(function() { return thisObject.x(this.index); })
      .add(pv.Bar)
        .data(function(a) { return a; })
        .left(function() { return (this.index * thisObject.x.range().band / thisObject.subDataFieldCount); })
        .width(function() { return (thisObject.x.range().band / thisObject.subDataFieldCount); })
        .bottom(0)
        .height(thisObject.y)
        .fillStyle(pv.Colors.category20().by(pv.index))
        .title(function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.parent.index], this.index);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.parent.index], this.index);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });
     
    bar.anchor("top").add(pv.Label)
        .visible(function() { return thisObject.marks(); })
        .textStyle("white")
        .text(function(d) { return d; });
     
    panel.add(pv.Label)
        .data(function() { return pv.range(thisObject.dataFieldCount); })
        .bottom(0)
        .left(function() { return thisObject.x(this.index); }) //TODO fix the alignment issue (+ thisObject.x.range().band / 2)
        .textMargin(5)
        .textBaseline("top")
        .text(function() { return thisObject.getDataLabel(this.index); })
        .font(function() { return thisObject.labelFont(); });
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.y.ticks(); })
        .bottom(function(d) { return (Math.round(thisObject.y(d)) - 0.5); })
        .strokeStyle(function(d) { return (d ? "rgba(128,128,128,.3)" : "#000"); })
      .add(pv.Rule)
        .left(0)
        .width(5)
        .strokeStyle("rgba(128,128,128,.2)")
      .anchor("left").add(pv.Label)
        .text(function(d) { return d.toFixed(); })
        .font(function() { return thisObject.labelFont(); });

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.populateData = function (thisObject) {

    var tmpMaxValHolder = [];
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());

    var dataGrpCount = 1;
    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    thisObject.subDataFieldCount = 1;
    thisObject.formattedData = pv.range(dataGrpCount).map( genDataMap );
    thisObject.dataFieldCount = dataGrpCount;
    thisObject.maxDataValue = tmpMaxValHolder.max();
    if (thisObject.maxDataValue < 5) thisObject.maxDataValue = 5; // fixing value repeating issue.

    thisObject.y.domain(0, thisObject.maxDataValue).range(0,(this.height() * thisObject.titleSpacing()));
    thisObject.x.domain(pv.range(thisObject.dataFieldCount)).splitBanded(0, thisObject.width(), 4/5);

    function genDataMap(x) {
        var innerArray = [];

        var rootObja;
        if( _dataField instanceof Array ) {
            rootObja = _dataField[x];
        }
        else {
            rootObja = _dataField;
        }

        var _subDataField = thisObject.traverseToDataField(rootObja, thisObject.subDataField());

        var subDataGrpCount = 1;
        if( _subDataField instanceof Array ) {
            subDataGrpCount = _subDataField.length;
            thisObject.subDataFieldCount = (thisObject.subDataFieldCount < _subDataField.length) ? _subDataField.length : thisObject.subDataFieldCount;
        }

        for(var y=0; y<subDataGrpCount; y++) {
            var rootObjb;
            if( _subDataField instanceof Array ) {
                rootObjb = _subDataField[y];
            }
            else {
                rootObjb = _subDataField;
            }
            var temp = parseInt(thisObject.traverseToDataField(rootObjb, thisObject.subDataValue()));
            innerArray.push(temp);
        }
        tmpMaxValHolder.push(innerArray.max());
        return innerArray;
    }
};

wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.getData = function (thisObject) {

    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.update = function () {

    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.getDataLabel = function (i) {
    if (this.data !== null){

        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    return i;
};

wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.getSubDataLable = function (i, j) {
    if (this.data !== null){
        var rootDataObj;
        var _dataField = this.traverseToDataField(this.data, this.dataField());

        if( _dataField instanceof Array ) {
            rootDataObj = _dataField[i];
        }
        else {
            rootDataObj = _dataField;
        }

        var rootSubDataObj = this.traverseToDataField(rootDataObj, this.subDataField());

        if( rootSubDataObj instanceof Array ) {
            return this.traverseToDataField(rootSubDataObj[j], this.subDataLabel());
        }
        else {
            return this.traverseToDataField(rootSubDataObj, this.subDataLabel());
        }
    }
    return j;
};

//Class AreaChart : Chart
//This is the custom wrapper class for protovis area/line charts

//Constructor
wso2vis.s.chart.protovis.AreaChart = function(div, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, div, chartTitle, chartDesc);

    this.band(12)
        .ySuffix("")
        .xSuffix("")
        .xInterval(10000);

    /* @private */
    this.dataHistory = [];
    this.vis = null;
    this.x = null;
    this.y = null;
};

// this makes AreaChart.prototype inherit from Chart
wso2vis.extend(wso2vis.s.chart.protovis.AreaChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.AreaChart.prototype
    .property("band")
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("ySuffix")
    .property("xSuffix")
    .property("xInterval");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.AreaChart.prototype.load = function (w, h, band) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }
    if ( band !== undefined ) {
        this.band(band);
    }

    var thisObject = this;

    this.x = pv.Scale.linear(0, this.band()).range(0, this.width());
    this.y = pv.Scale.linear(0, 50).range(0, this.height()*0.9);
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); })
        .bottom(20)
        .top(0)
        .left(30)
        .right(10);

    var panel = this.vis.add(pv.Panel)
        .data(function() { return thisObject.getData(thisObject); })
        .top(function() { return (thisObject.height() * (1 - thisObject.titleSpacing())); })
        .height(function() { return (thisObject.height() * thisObject.titleSpacing()); })
        .strokeStyle("#ccc");

    var area = panel.add(pv.Area)
        .data(function(a) { return a; })
        .left(function(d) { return thisObject.x(this.index); })
        .bottom(0)//pv.Layout.stack())
        .height(function(d) { return thisObject.y(d); })
        .title(function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });

    var areaDot = area.anchor("top").add(pv.Dot).title(function(d) { return d; })
        .visible(function() { return thisObject.marks(); })
        .fillStyle("#fff")
        .size(10);
        //.add(pv.Label);

    /* Legend */
    panel.add(pv.Dot)
        .visible(function() { return thisObject.legend(); })
        .right(100)
        .fillStyle(function() { return area.fillStyle(); })
        .bottom(function() { return (this.parent.index * 15) + 10; })
        .size(20) 
        .lineWidth(1)
        .strokeStyle("#000")
      .anchor("right").add(pv.Label)
        .text(function() { return thisObject.getDataLabel(this.parent.index); });
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.x.ticks(); })
        .visible(function(d) { return (d > 0); })
        .left(function(d) { return (Math.round(thisObject.x(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.1)")
      .anchor("bottom").add(pv.Label)
        .text(function(d) { var n = new Number(d * thisObject.xInterval() / 1000); return n.toFixed() + thisObject.xSuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.y.ticks(); })
        .visible(function() { return !(this.parent.index % 2); })
        .bottom(function(d) { return (Math.round(thisObject.y(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.2)")
      .anchor("left").add(pv.Label)
        .text(function(d) {return d.toFixed() + thisObject.ySuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.AreaChart.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

/**
* @private 
*/
wso2vis.s.chart.protovis.AreaChart.prototype.populateData = function (thisObject) {
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());

    var dataGrpCount = 1;
    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    thisObject.formattedData = pv.range(dataGrpCount).map(genDataMap);

    thisObject.x.domain(0, thisObject.band()).range(0,thisObject.width());
    var maxheight = calcMaxHeight();
    if (maxheight < 5) maxheight = 5; // fixing value repeating issue.
    thisObject.y.domain(0, maxheight).range(0, (thisObject.height() * thisObject.titleSpacing()) - 35);
    thisObject.y.nice();
    
    function genDataMap(x) {
        var rootObj;
        if( _dataField instanceof Array ) {
            rootObj = _dataField[x];
        }
        else {
            rootObj = _dataField;
        }
        var valObj = parseInt(thisObject.traverseToDataField(rootObj, thisObject.dataValue()));

        if (thisObject.dataHistory[x] === undefined){
            thisObject.dataHistory[x] = new Array();
        }
        thisObject.dataHistory[x].unshift(valObj);

        if(thisObject.dataHistory[x].length > thisObject.band()+1){
            thisObject.dataHistory[x].pop();
        }
        return thisObject.dataHistory[x];
    }

    function calcMaxHeight() {
        var totHeights = [];
        for (var k=0; k<thisObject.dataHistory.length; k++) {
            totHeights.push(thisObject.dataHistory[k].max());
        }
        return totHeights.max();
    }
};

wso2vis.s.chart.protovis.AreaChart.prototype.getData = function (thisObject) {
    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.AreaChart.prototype.update = function () {
    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.AreaChart.prototype.getDataLabel = function (i) {
    if (this.data !== null){
        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    return i;
};

wso2vis.s.chart.protovis.AreaChart.prototype.clear = function () {
    this.dataHistory.length = 0;
};

//Class AreaChart2 : Chart
//This is the custom wrapper class for protovis area/line charts

//Constructor
wso2vis.s.chart.protovis.AreaChart2 = function(div, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, div, chartTitle, chartDesc);

    this.band(12)
        .xSuffix("")
        .ySuffix("");

    /* @private */
    this.vis = null;
    this.x = null;
    this.y = null;
};

// this makes AreaChart2.prototype inherit from Chart
wso2vis.extend(wso2vis.s.chart.protovis.AreaChart2, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.AreaChart2.prototype
    .property("dataField")
    .property("subDataField")
    .property("xDataValue")
    .property("yDataValue")
    .property("dataLabel")
    .property("xSuffix")
    .property("ySuffix")
    .property("xLabel")
    .property("band");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.AreaChart2.prototype.load = function (w, h) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }

    var thisObject = this;

    this.x = pv.Scale.linear(0, 4).range(0, this.width());
    this.y = pv.Scale.linear(0, 50).range(0, this.height()*0.9);
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); })
        .bottom(20)
        .top(0)
        .left(30)
        .right(10);

    var panel = this.vis.add(pv.Panel)
        .data(function() { return thisObject.getData(thisObject); })
        .top(function() { return (thisObject.height() * (1 - thisObject.titleSpacing())); })
        .height(function() { return (thisObject.height() * thisObject.titleSpacing()); })
        .strokeStyle("#ccc");

    var area = panel.add(pv.Area)
        .data(function(a) { return a; })
        .left(function(d) { return thisObject.x(d.x); })
        .bottom(0)//pv.Layout.stack())
        .height(function(d) { return thisObject.y(d.y); })
        .title(function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });

    var areaDot = area.anchor("top").add(pv.Dot).title(function(d) { return d.y; })
        .visible(function() { return thisObject.marks(); })
        .fillStyle("#fff")
        .size(10);
        //.add(pv.Label);

    /* Legend */
    panel.add(pv.Dot)
        .visible(function() { return thisObject.legend(); })
        .right(100)
        .fillStyle(function() { return area.fillStyle(); })
        .bottom(function() { return (this.parent.index * 15) + 10; })
        .size(20) 
        .lineWidth(1)
        .strokeStyle("#000")
      .anchor("right").add(pv.Label)
        .text(function() { return thisObject.getDataLabel(this.parent.index); });
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.x.ticks(); })
        .visible(function(d) { return (d > 0); })
        .left(function(d) { return (Math.round(thisObject.x(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.1)")
      .anchor("bottom").add(pv.Label)
        .text(function(d) { return d.toFixed() + thisObject.xSuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.y.ticks(); })
        .visible(function() { return !(this.parent.index % 2); })
        .bottom(function(d) { return (Math.round(thisObject.y(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.2)")
      .anchor("left").add(pv.Label)
        .text(function(d) {return d.toFixed() + thisObject.ySuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.AreaChart2.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

/**
* @private 
*/
wso2vis.s.chart.protovis.AreaChart2.prototype.populateData = function (thisObject) {
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
    var tempDataArray = [];

    var dataGrpCount = 1;
    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    thisObject.formattedData = pv.range(dataGrpCount).map(genDataMap);

    var maxheight = tempDataArray.max();
    if (maxheight < 5) maxheight = 5; // fixing value repeating issue.
    if (thisObject.xDataValue() === undefined) {
        thisObject.x.domain(0, thisObject.band()).range(0, this.width());
    }
    else {
        thisObject.x.domain(thisObject.formattedData[0], function(d) { return d.x; }).range(0, this.width());
    }
    thisObject.y.domain(0, maxheight).range(0, (thisObject.height() * thisObject.titleSpacing()) - 35);
    thisObject.y.nice();
    
    function genDataMap(x) {
        var innerArray = [];
        var rootObja;
        if( _dataField instanceof Array ) {
            rootObja = _dataField[x];
        }
        else {
            rootObja = _dataField;
        }

        var _subDataField = thisObject.traverseToDataField(rootObja, thisObject.subDataField());

        var subDataGrpCount = 1;
        if( _subDataField instanceof Array ) {
            subDataGrpCount = _subDataField.length;
        }

        for(var y=0; y<subDataGrpCount; y++) {
            var rootObjb;
            if( _subDataField instanceof Array ) {
                rootObjb = _subDataField[y];
            }
            else {
                rootObjb = _subDataField;
            }

            var valObjY = parseInt(thisObject.traverseToDataField(rootObjb, thisObject.yDataValue()));
            tempDataArray.push(valObjY);

            if (thisObject.xDataValue() === undefined) {
                innerArray.push(valObjY);
            }
            else {
                var valObjX = parseInt(thisObject.traverseToDataField(rootObjb, thisObject.xDataValue()));
                innerArray.push({ x: valObjX, y: valObjY });
            }
        }
        return innerArray;
    }
};

wso2vis.s.chart.protovis.AreaChart2.prototype.getData = function (thisObject) {
    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.AreaChart2.prototype.update = function () {
    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.AreaChart2.prototype.getDataLabel = function (i) {
    if (this.data !== null){
        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    return i;
};

//Class c.protovis.LineChart : AreaChart
//This is the custom wrapper class for protovis area/line charts

//Constructor
wso2vis.s.chart.protovis.LineChart = function(div, chartTitle, chartDesc) {
    wso2vis.s.chart.protovis.AreaChart.call(this, div, chartTitle, chartDesc);
}

// this makes c.protovis.LineChart.prototype inherit from ProtovisStakedAreaChart
wso2vis.extend(wso2vis.s.chart.protovis.LineChart, wso2vis.s.chart.protovis.AreaChart);

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.LineChart.prototype.load = function (w, h, band) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }
    if ( band !== undefined ) {
        this.band(band);
    }

    var thisObject = this;

    this.x = pv.Scale.linear(0, this.band).range(0, this.width());
    this.y = pv.Scale.linear(0, 50).range(0, this.height()*0.9);
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); })
        .def("i", -1)
        .bottom(20)
        .top(0)
        .left(30)
        .right(10);

    var panel = this.vis.add(pv.Panel)
        .top(function() { return (thisObject.height() * (1 - thisObject.titleSpacing())); })
        .height(function() { return (thisObject.height() * thisObject.titleSpacing()); })
        .data(function() { return thisObject.getData(thisObject); });

    var line = panel.add(pv.Line)
        .data(function(a) { return a; })
        .left(function(d) { return thisObject.x(this.index); })
        .bottom(function(d) { return thisObject.y(d); })
        .lineWidth(3)
        .title(function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });
    
    var lineDot = line.add(pv.Dot).title(function(d) { return d; })
        .visible(function() { return thisObject.marks(); })
        .fillStyle(function() { return this.strokeStyle(); });
        //.add(pv.Label);

    line.add(pv.Dot).title(function(d) { return d; })
        .visible(function() { return thisObject.marks(); })
        .strokeStyle("#fff")
        .lineWidth(1);

    /* Legend */
    panel.add(pv.Dot)
        .visible(function() { return thisObject.legend(); })
        .right(100)
        .fillStyle(function() { return line.strokeStyle(); })
        .bottom(function() { return (this.parent.index * 15) + 10; })
        .size(20) 
        .lineWidth(1)
        .strokeStyle("#000")
      .anchor("right").add(pv.Label)
        .text(function() { return thisObject.getDataLabel(this.parent.index); });
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.x.ticks(); })
        .visible(function(d) { return (d > 0); })
        .left(function(d) { return (Math.round(thisObject.x(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.1)")
      .anchor("bottom").add(pv.Label)
        .text(function(d) { var n = new Number(d * thisObject.xInterval() / 1000); return n.toFixed() + thisObject.xSuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.y.ticks(); })
        //.visible(function() { return !(this.index % 2); })
        .bottom(function(d) { return (Math.round(thisObject.y(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.2)")
      .anchor("left").add(pv.Label)
        .text(function(d) {return d.toFixed() + thisObject.ySuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

//Class c.protovis.LineChart2 : AreaChart2
//This is the custom wrapper class for protovis area/line charts

//Constructor
wso2vis.s.chart.protovis.LineChart2 = function(div, chartTitle, chartDesc) {
    wso2vis.s.chart.protovis.AreaChart2.call(this, div, chartTitle, chartDesc);
}

// this makes c.protovis.LineChart2.prototype inherit from ProtovisStakedAreaChart
wso2vis.extend(wso2vis.s.chart.protovis.LineChart2, wso2vis.s.chart.protovis.AreaChart2);

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.LineChart2.prototype.load = function (w, h) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }

    var thisObject = this;

    this.x = pv.Scale.linear(0, 4).range(0, this.width());
    this.y = pv.Scale.linear(0, 50).range(0, this.height()*0.9);
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); })
        .def("i", -1)
        .bottom(20)
        .top(0)
        .left(30)
        .right(10);

    var panel = this.vis.add(pv.Panel)
        .top(function() { return (thisObject.height() * (1 - thisObject.titleSpacing())); })
        .height(function() { return (thisObject.height() * thisObject.titleSpacing()); })
        .data(function() { return thisObject.getData(thisObject); });

    var line = panel.add(pv.Line)
        .data(function(a) { return a; })
        .left(function(d) { return thisObject.x(d.x); })
        .bottom(function(d) { return thisObject.y(d.y); })
        .lineWidth(3)
        .title(function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });
    
    var lineDot = line.add(pv.Dot).title(function(d) { return d.y; })
        .visible(function() { return thisObject.marks(); })
        .fillStyle(function() { return this.strokeStyle(); });
        //.add(pv.Label);

    line.add(pv.Dot).title(function(d) { return d.y; })
        .visible(function() { return thisObject.marks(); })
        .strokeStyle("#fff")
        .lineWidth(1);

    /* Legend */
    panel.add(pv.Dot)
        .visible(function() { return thisObject.legend(); })
        .right(100)
        .fillStyle(function() { return line.strokeStyle(); })
        .bottom(function() { return (this.parent.index * 15) + 10; })
        .size(20) 
        .lineWidth(1)
        .strokeStyle("#000")
      .anchor("right").add(pv.Label)
        .text(function() { return thisObject.getDataLabel(this.parent.index); });
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.x.ticks(); })
        .visible(function(d) { return (d >= 0); })
        .left(function(d) { return (Math.round(thisObject.x(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.1)")
      .anchor("bottom").add(pv.Label)
        .text(function(d) { return thisObject.traverseToDataField(thisObject.traverseToDataField(thisObject.traverseToDataField(thisObject.data, thisObject.dataField())[this.parent.index], thisObject.subDataField())[this.index], thisObject.xLabel()) + thisObject.xSuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.y.ticks(); })
        //.visible(function() { return !(this.index % 2); })
        .bottom(function(d) { return (Math.round(thisObject.y(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.2)")
      .anchor("left").add(pv.Label)
        .text(function(d) {return d.toFixed() + thisObject.ySuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

//@class wso2vis.s.chart.protovis.Sunburst : wso2vis.s.chart.Chart

//Constructor
wso2vis.s.chart.protovis.Sunburst = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    this.labelLength(12)
        .thickness(30);

    /* @private */
    this.vis = null;
    this.sunburst = null;
    this.wedge = null;

    this.flare = {
      analytics: {
        cluster: {
          AgglomerativeCluster: 3938,
          CommunityStructure: 3812,
          HierarchicalCluster: 6714,
          MergeEdge: 743
        },
        graph: {
          BetweennessCentrality: 3534,
          LinkDistance: 5731,
          MaxFlowMinCut: 7840,
          ShortestPaths: 5914,
          SpanningTree: 3416
        },
        optimization: {
          AspectRatioBanker: 7074
        }
      }
    };
}

// this makes c.protovis.Sunburst.prototype inherits from wso2vis.s.chart.Chart
wso2vis.extend(wso2vis.s.chart.protovis.Sunburst, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.Sunburst.prototype
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("labelLength")
    .property("thickness");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.Sunburst.prototype.load = function (w) {
    if ( w !== undefined ) {
        this.width(w);
    }
    /*if ( h !== undefined ) { //not using height for the Wedge
        this.height(h);
    }*/
    var r = this.width() / 2.5;

    var thisObject = this;

    //this.sunburst = pv.Layout.sunburst(this.data).size(Number);
    
    this.vis = new pv.Panel()
        //.def("i", -1)
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); });
    
    this.wedge = this.vis.add(pv.Wedge)
        .extend(pv.Layout.sunburst(this.formattedData).size(function(n) { return parseInt(n); }))
        .fillStyle(pv.Colors.category10()
              .by(function(n) { return n.children ? n.keys : n.keys.slice(0, -1); }))
        .strokeStyle("#222")
          .lineWidth(1)
          //.visible(function(n) { return n.depth < 3; })
          .title(function(n) { return /*thisObject.traverseToDataField(thisObject.data, n.keys)*/ n.keys.join(".") + ": " + n.size; });
        //.anchor("center").add(pv.Label)
          //.visible(function(n) { return n.angle * n.depth > .05; })
          //.text(function(n) { return n.keys[n.keys.length - 1]; });

     this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.Sunburst.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

/**
* @private
*/
wso2vis.s.chart.protovis.Sunburst.prototype.populateData = function (thisObject) {

    rec(this.data);
    //console.log(this.data);
    this.formattedData = this.data;

    function rec(d) {
        for( i in d ) {
            if( typeof(d[i]) == "string" && isNaN(d[i]) ) {
                d[i] = 0;
            }
            rec(d[i]);
        }
    }
};

wso2vis.s.chart.protovis.Sunburst.prototype.getData = function (thisObject) {

    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.Sunburst.prototype.update = function () {

    this.populateData(this);
    this.wedge.extend(pv.Layout.sunburst(this.formattedData).size(function(n) { return parseInt(n); })); 
    //this.sunburst.size(Number);//console.log(JSON.stringify(this.data));
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.Sunburst.prototype.getDataLable = function (i) {

    if (this.data !== null){

        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    
    return i;
};

wso2vis.s.chart.raphael.FunnelChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);
    
    this.colscheme(20)
        .gap(4)
        .labelRelief(15)
        .labelSpan(1)
        .showPercent(true)
        .showValue(true);
}

// inherits from Chart
wso2vis.extend(wso2vis.s.chart.raphael.FunnelChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.raphael.FunnelChart.prototype
    .property("colscheme")
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("gap")
    .property("showPercent")
    .property("showValue")
    .property("labelRelief")
    .property("labelSpan");
    

wso2vis.s.chart.raphael.FunnelChart.prototype.load = function (w, h) {
    if (w !== undefined) {
        this.width(w);
    }
    if (h !== undefined) {
        this.height(h);
    }
    
    this.r = Raphael(this.divEl(), this.width(), this.height());  
    
    this.wf = this.width() / 406.01;
	this.hf = this.height() / 325.01;
	this.eh = 1007.9 * this.hf;
	this.ew = 663 * this.wf;
	this.e1x = -560 * this.wf + 5;
	this.e2x = 173 * this.wf + 5;
	this.ey = -136 * this.hf;   	
	this.fc = 139 * this.wf + 5;     
	
	return this; 
};

wso2vis.s.chart.raphael.FunnelChart.prototype.update = function () {
    this.convertData(this);
    
    var total = 0;
    
    for (var i = 0; i < this.formattedData.length; i++) {
        total += this.formattedData[i]["value"];
    }
    
    var funnelHeightRatio = (this.height()  - this.gap() * (this.formattedData.length - 1) - this.labelRelief() * this.formattedData.length) / total;        
    
    var colors = wso2vis.util.generateColors(this.formattedData.length, this.colscheme());
    
    var is_label_visible = false,
        leave_timer;
    
    var currY = 0;
    var df = this.traverseToDataField(this.data, this.dataField());    
    if (df instanceof Array) {
        df = df;
    }
    else {
        df = [df];
    }
    
    var first;
    
    for (i = 0; i < this.formattedData.length; i++) {
        var crect;
        if (i != 0) {
            this.r.rect(0, currY, this.width(), this.gap()).attr({fill:"#fff", stroke:"#fff"});          
            crect = this.r.rect(0, currY + this.gap(), this.width(), funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief()).attr({fill:colors[i], stroke:"#fff"});
            currY += this.gap() + funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief();                
        }
        else {
            crect = this.r.rect(0, 0, this.width(), funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief()).attr({fill:colors[i], stroke:"#fff"});
            currY += funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief();           
            first = this.formattedData[i]["value"];    
        }
        
        if (this.tooltip()) {
            (function (data, lbl, func, org) {
                $(crect.node).hover(function (e) {
                    clearTimeout(leave_timer);
                    var tip = func({label:lbl, value:data, total:total, first:first, raw:org});
                    wso2vis.environment.tooltip.show(e.pageX, e.pageY, tip);
                    is_label_visible = true;
                }, function () {
                    leave_timer = setTimeout(function () {
                        wso2vis.environment.tooltip.hide();
                        is_label_visible = false;
                    }, 2);
                });
            })(this.formattedData[i]["value"], this.formattedData[i]["label"], this.onTooltip, df[i]);//(this.fc - frame.attrs.width/2 , crect.attrs.y + crect.attrs.height, this.formattedData[i]["value"], this.formattedData[i]["label"]);
            
            (function (data, lbl, func, org) {
                $(crect.node).mousemove(function (e) {
                    if (is_label_visible) {
                        clearTimeout(leave_timer);
                        var tip = func({label:lbl, value:data, total:total, first:first, raw:org});
                        wso2vis.environment.tooltip.show(e.pageX, e.pageY, tip);
                    }
                });
            })(this.formattedData[i]["value"], this.formattedData[i]["label"], this.onTooltip, df[i]);//(this.fc - frame.attrs.width/2 , crect.attrs.y + crect.attrs.height, this.formattedData[i]["value"], this.formattedData[i]["label"]);
        }
    }   

    var el1 = this.r.ellipse(-560 * this.wf + 5 + 663 * this.wf / 2, -136 * this.hf + 1007.9 * this.hf / 2, 663 * this.wf / 2, 1007.9 * this.hf / 2);
    var el2 = this.r.ellipse(173 * this.wf + 5 + 663 * this.wf / 2, -136 * this.hf + 1007.9 * this.hf / 2, 663 * this.wf / 2, 1007.9 * this.hf / 2); 
    
    el1.attr({fill:"#fff", opacity:0.9, stroke:"#fff"});
    el2.attr({fill:"#fff", opacity:0.8, stroke:"#fff"});
    
    currY = 0;
    for (i = 0; i < this.formattedData.length; i++) {
        var t2;
        if (i != 0) {
            var t = this.r.text(this.width(), currY + this.gap() + funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief(), this.formattedData[i]["label"]).attr({fill:colors[i]});
            t.attr({"font-size":12});              
            var bbox = t.getBBox();
            t.translate(-bbox.width/2 - 2 * this.labelSpan(), -bbox.height/2 - this.labelSpan());
            var str = this.showValue()?this.formattedData[i]["value"]:"";
            if ((this.formattedData[0]["value"] != 0) && this.showPercent()) {
                str += "(" + (this.formattedData[i]["value"] * 100/ this.formattedData[0]["value"]).toFixed() + "%)";
            }
            t2 = this.r.text(this.fc, currY + this.gap() + funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief(), str).attr({fill:"#fff"});
            t2.attr({"font-size":10});
            bbox = t2.getBBox();
            t2.translate(0, -bbox.height/2 - this.labelSpan());
            currY += this.gap() + funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief();                
        }
        else {
            var t = this.r.text(this.width(), funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief(), this.formattedData[i]["label"]).attr({fill:colors[i]});            
            t.attr({"font-size":12});  
            var bbox = t.getBBox();
            t.translate(-bbox.width/2 - 2 * this.labelSpan(), -bbox.height/2 - this.labelSpan());            
            var str = this.showValue()?this.formattedData[i]["value"]:"";
            if ((this.formattedData[0]["value"] != 0) && this.showPercent()) {
                str += "(" + (this.formattedData[i]["value"] * 100/ this.formattedData[0]["value"]).toFixed() + "%)";
            }
            t2 = this.r.text(this.fc, funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief(), str).attr({fill:"#fff"});
            t2.attr({"font-size":10});
            bbox = t2.getBBox();
            t2.translate(0, -bbox.height/2 - this.labelSpan());
            currY += funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief();                
        }
    }   
    this.r.rect(0, 0, this.width()-1, this.height()-1);
};

wso2vis.s.chart.raphael.FunnelChart.prototype.convertData = function (that) {
    var df = that.traverseToDataField(that.data, that.dataField());    
    var dcount = 1;
    if (df instanceof Array) {
        dcount = df.length;
    }
    
    that.formattedData = [];
    
    for (var i = 0; i < dcount; i++) {
        that.formattedData.push({"label":getLbl(i), "value":getVal(i)});
    }
    
    function getVal(x) {
        var r;
        if (df instanceof Array) {
            r = df[x];
        }
        else {
            r = df;
        }        
        return parseInt(that.traverseToDataField(r, that.dataValue()));
    }
    
    function getLbl(x) {
        var r;
        if (df instanceof Array) {
            r = df[x];
        }
        else {
            r = df;
        }
        return that.traverseToDataField(r, that.dataLabel());
    }
};

wso2vis.s.chart.raphael.FunnelChart.prototype.onTooltip = function (data) {
    return data.label + ":" + data.value;
};




//Class c.infovis.SpaceTree : Chart
//This is the custom wrapper class for protovis bar charts

//Constructor
wso2vis.s.chart.infovis.SpaceTree = function(divElementLog, canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    /* @private */
    this.divElementLog = divElementLog;
    this.canvas = canvas;
    this.st = null;
    this.y = null;
    this.x = null;
    this.tip = new wso2vis.c.Tooltip();
    this.testLabel = null;
}

// this makes c.infovis.SpaceTree.prototype inherits
// from Chart.prototype
wso2vis.extend(wso2vis.s.chart.infovis.SpaceTree, wso2vis.s.chart.Chart);

wso2vis.s.chart.infovis.SpaceTree.prototype
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("ySuffix")
    .property("xSuffix");

//Public function loadChart
//Loads the chart inside the given HTML element
wso2vis.s.chart.infovis.SpaceTree.prototype.load = function (w, h) {
	 
	if (w !== undefined) {
	      this.width(w);
	}	
	if (h !== undefined) {
		this.height(h);
	}

	that = this;
		var Log = {
		    elem: false,
		    write: function(text){
		        if (!this.elem) 
		            this.elem = that.divElementLog;
		        this.elem.innerHTML = text;
		        this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
		    }
		};
	    //init canvas
	    //Create a new canvas instance.
	    var canvas = new Canvas('mycanvas', {
	        'injectInto': that.canvas,
	        'width': that.width(),
	        'height': that.height(),
	        'backgroundColor': '#1a1a1a'
	    });
	    //end
	    
	    //init st
	    //Create a new ST instance
	     this.st = new ST(canvas, {
	        //set duration for the animation
	        //orientation: "left",
		duration: 400,
	        //set animation transition type
	        transition: Trans.Quart.easeInOut,
	        //set distance between node and its children
	        levelDistance: 60,
	        //set node and edge styles
	        //set overridable=true for styling individual
	        //nodes or edges
	        Node: {
	            height: 20,
	            width: 110,
	            type: 'rectangle',
	            color: '#aaa',
	            overridable: true
	        },
	        
	        Edge: {
	            type: 'bezier',
	            overridable: true
	        },
	        
	        onBeforeCompute: function(node){
	       //     Log.write("loading " + node.name);
	        },
	        
	        onAfterCompute: function(){
	            //Log.write("done");
	        },
	        
	        //This method is called on DOM label creation.
	        //Use this method to add event handlers and styles to
	        //your node.
	        onCreateLabel: function(label, node){
	            label.id = node.id;
		    var testDiv = that.getNodeDiv;
            
	            testDiv.innerHTML = label.innerHTML = that.trim(node.name);
	            label.onclick = function(){
	                that.st.onClick(node.id);
		//	Log.write("Done");
	            };
		    label.onmouseover = function(e){
		that.tip.show(e.pageX, e.pageY, node.name);	
	//	Log.write("mouse is over the" + node.name + "label, triggering mouse event : " + e.toString());
			};
		label.onmouseout = function () {
		that.tip.hide();
		};
	            //set label styles
	            var style = label.style;
	            style.width = testDiv.offsetWidth;
	            style.height = 17 + 'px';            
	            style.cursor = 'pointer';
	            style.color = '#333';
	            style.fontSize = '0.8em';
	            style.textAlign= 'left';
	            style.paddingTop = '4px';
		    style.paddingLeft = '3px';
	        },
	        
	        //This method is called right before plotting
	        //a node. It's useful for changing an individual node
	        //style properties before plotting it.
	        //The data properties prefixed with a dollar
	        //sign will override the global node style properties.
	        onBeforePlotNode: function(node){
	            //add some color to the nodes in the path between the
	            //root node and the selected node.
	            
		    if (node.selected) {
	                node.data.$color = "#ff7";
	            }
	            else {
	                delete node.data.$color;
	                var GUtil = Graph.Util;
	                //if the node belongs to the last plotted level
	                if(!GUtil.anySubnode(node, "exist")) {
	                    //count children number
	                    var count = 0;
	                    GUtil.eachSubnode(node, function(n) { count++; });
	                    //assign a node color based on
	                    //how many children it has
	                    node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];                    
	                }
	            }
	        },
	        
	        //This method is called right before plotting
	        //an edge. It's useful for changing an individual edge
	        //style properties before plotting it.
	        //Edge data proprties prefixed with a dollar sign will
	        //override the Edge global style properties.
	        onBeforePlotLine: function(adj){
	            if (adj.nodeFrom.selected && adj.nodeTo.selected) {
	                adj.data.$color = "#eed";
	                adj.data.$lineWidth = 3;
	            }
	            else {
	                delete adj.data.$color;
	                delete adj.data.$lineWidth;
	            }
	        }
	    });
	    
};


wso2vis.s.chart.infovis.SpaceTree.prototype.populateData = function (thisObject) {
	// Space Tree can only be drawn with a JSON Tree i.e. with JSON nodes
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
if ((_dataField instanceof Array) && (_dataField.length < 1)) {
	return false;
}
	var st = thisObject.st
var lbs = st.fx.labels;
for (label in lbs) {
 	   if (lbs[label]) {
 	    lbs[label].parentNode.removeChild(lbs[label]);
 	   }
}
st.fx.labels = {};
 thisObject.adjustWidth(_dataField[0]);
 thisObject.st.loadJSON(_dataField[0]);
return true;

  };

wso2vis.s.chart.infovis.SpaceTree.prototype.trim = function (txt) { 
if (txt.length > 20) {
 	    var str = txt.substr(0,18);
	    str += "...";	
	} else {
	    var str = txt;
	}
return str;
}


wso2vis.s.chart.infovis.SpaceTree.prototype.getNodeDiv = function () { 
if (this.testLabel == null) {

var testLabel = this.testLabel = document.createElement('div'); 
testLabel.id = "mytestlabel"; 
testLabel.style.visibility = "hidden"; 
testLabel.style.position = "absolute";
testLabel.style.height = 20 + 'px'; 
document.body.appendChild(testLabel);
return this.testLabel;
}
}



wso2vis.s.chart.infovis.SpaceTree.prototype.adjustWidth = function(tree) {
var elem = this.getNodeDiv();
TreeUtil.each(tree, function(node) { 
    elem.innerHTML = that.trim(node.name); 
    node.data.$width = elem.offsetWidth; 
}); 
} 

wso2vis.s.chart.infovis.SpaceTree.prototype.update = function () {
	var st = this.st;
if (this.populateData(this)) {
    //compute node positions and layout
    st.compute();
    //optional: make a translation of the tree
    st.geom.translate(new Complex(-200, 0), "startPos");
    //emulate a click on the root node.
    st.onClick(st.root);
	
    if(this.tooltip() === true) {
        tooltip.init();
    }
}
};
//Class c.infovis.HyperTree : Chart
//This is the custom wrapper class for protovis bar charts

//Constructor
wso2vis.s.chart.infovis.HyperTree = function(divElementLog, canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    /* @private */
    this.divElementLog = divElementLog;
    this.canvas = canvas;
    this.ht = null;
    this.y = null;
    this.x = null;
}

// this makes c.infovis.HyperTree.prototype inherits
// from Chart.prototype
wso2vis.extend(wso2vis.s.chart.infovis.HyperTree, wso2vis.s.chart.Chart);

wso2vis.s.chart.infovis.HyperTree.prototype
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("ySuffix")
    .property("xSuffix");


function addEvent(obj, type, fn) {
    if (obj.addEventListener) obj.addEventListener(type, fn, false);
    else obj.attachEvent('on' + type, fn);
};

//Public function loadChart
//Loads the chart inside the given HTML element

wso2vis.s.chart.infovis.HyperTree.prototype.load = function (w, h) {
	 
	if (w !== undefined) {
	      this.width(w);
	}	
	if (h !== undefined) {
		this.height(h);
	}

	that = this;
		var Log = {
		    elem: false,
		    write: function(text){
		        if (!this.elem) 
		            this.elem = that.divElementLog;
		        this.elem.innerHTML = text;
		        this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
		    }
		};
	
var canvas = new Canvas('mycanvas', {
	        'injectInto': that.canvas,
	        'width': that.width(),
	        'height': that.height(),
	        'backgroundColor': '#1a1a1a'
	    });

    //end
    var style = document.getElementById('mycanvas').style;
    style.marginLeft = style.marginTop = "25px";
    //init Hypertree
    this.ht = new Hypertree(canvas, {
        //Change node and edge styles such as
        //color, width and dimensions.
        Node: {
            dim: 9,
            color: "#f00"
        },
        
        Edge: {
            lineWidth: 2,
            color: "#024"
        },
        
        onBeforeCompute: function(node){
            //Log.write("centering");
        },
        //Attach event handlers and add text to the
        //labels. This method is only triggered on label
        //creation
        onCreateLabel: function(domElement, node){
            domElement.innerHTML = node.name;
            addEvent(domElement, 'click', function () {
                that.ht.onClick(node.id);
            });
        },
        //Change node styles when labels are placed
        //or moved.
        onPlaceLabel: function(domElement, node){
            var style = domElement.style;
            style.display = '';
            style.cursor = 'pointer';
            if (node._depth <= 1) {
                style.fontSize = "0.8em";
                style.color = "#000";

            } else if(node._depth == 2){
                style.fontSize = "0.7em";
                style.color = "#011";

            } else {
                style.display = 'none';
            }

            var left = parseInt(style.left);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2) + 'px';
        },
        
        onAfterCompute: function(){
           // Log.write("done");
	    }
	});
	    
};


wso2vis.s.chart.infovis.HyperTree.prototype.populateData = function (thisObject) {
	// Space Tree can only be drawn with a JSON Tree i.e. with JSON nodes
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
if ((_dataField instanceof Array) && (_dataField.length < 1)) {
	return false;
}
var ht = thisObject.ht
var lbs = ht.fx.labels;
for (label in lbs) {
 	   if (lbs[label]) {
 	    lbs[label].parentNode.removeChild(lbs[label]);
 	   }
}
ht.fx.labels = {};
thisObject.ht.loadJSON(_dataField[0]);
return true;

  };



wso2vis.s.chart.infovis.HyperTree.prototype.update = function () {
	var ht = this.ht;
if (this.populateData(this)) {
   ht.refresh();
   ht.controller.onAfterCompute();  
	
    if(this.tooltip() === true) {
        tooltip.init();
    }
}
};

/*
* @class Adapter
*
*/
wso2vis.a.Adapter = function() {
    this.dp = null;
	this.drList = [];
	wso2vis.environment.adapters.push(this);
    id = wso2vis.environment.adapters.length - 1;    
    this.getID = function() {
        return id;
    }
};

wso2vis.a.Adapter.prototype.dataProvider = function(dp) {
	this.dp = dp;
	this.dp.addDataReceiver(this);
	return;
};

wso2vis.a.Adapter.prototype.addDataReceiver = function(dr) {
	this.drList.push(dr);
};

wso2vis.a.Adapter.prototype.pushData = function(data) {
	var filteredData = this.convertData(data);
	for (i = 0; i < this.drList.length; i++) {
		(this.drList[i]).pushData(filteredData); 
	}
};

wso2vis.a.Adapter.prototype.pullData = function() {
	this.dp.pullData();
};

wso2vis.a.Adapter.prototype.convertData = function(data) {
	return data;
};

/**
 * Control 
 */
wso2vis.c.Control = function(canvas) {
   	this.attr = []; 	
  	this.canvas(canvas);   
    
	this.dp = null;
	wso2vis.environment.controls.push(this);
    
	id = wso2vis.environment.controls.length - 1;
    this.getID = function() {return id;}	
};

wso2vis.c.Control.prototype.property = function(name) {
    wso2vis.c.Control.prototype[name] = function(v) {
      if (arguments.length) {
        this.attr[name] = v;
        return this;
      }
      return this.attr[name];
    };

    return this;
};

wso2vis.c.Control.prototype.property("canvas");

wso2vis.c.Control.prototype.create = function() {
};

wso2vis.c.Control.prototype.load = function() {
    var divEl = document.getElementById(this.canvas());
    divEl.innerHTML = this.create();
};

wso2vis.c.Control.prototype.unload = function() {
    var divEl = document.getElementById(this.canvas());
    divEl.innerHTML = "";
};

wso2vis.c.Tooltip = function () {
    this.el = document.createElement('div');
    this.el.setAttribute('id', 'ttipRRR'); // a random name to avoid conflicts. 
    this.el.style.display = 'none';
    this.el.style.width = 'auto';
    this.el.style.height = 'auto';
    this.el.style.margin = '0';
    this.el.style.padding = '5px';
    this.el.style.backgroundColor = '#ffffff';
    this.el.style.borderStyle = 'solid';
    this.el.style.borderWidth = '1px';
    this.el.style.borderColor = '#444444';
    this.el.style.opacity = 0.85;
    
    this.el.style.fontFamily = 'Fontin-Sans, Arial';
    this.el.style.fontSize = '12px';
    
    this.el.innerHTML = "<b>wso2vis</b> tooltip demo <br/> works damn fine!";    
    document.body.appendChild(this.el);    
};

wso2vis.c.Tooltip.prototype.style = function() {
    return this.el.style;
};

wso2vis.c.Tooltip.prototype.show = function(x, y, content) {    
	var w = this.el.style.width;
	var h = this.el.style.height;
	var deltaX = 15;
    var deltaY = 15;
	
	if ((w + x) >= (this.getWindowWidth() - deltaX)) { 
		x = x - w;
		x = x - deltaX;
	} 
	else {
		x = x + deltaX;
	}
	
	if ((h + y) >= (this.getWindowHeight() - deltaY)) { 
		y = y - h;
		y = y - deltaY;
	} 
	else {
		y = y + deltaY;
	} 
	
	this.el.style.position = 'absolute';
	this.el.style.top = y + 'px';
	this.el.style.left = x + 'px';	
	if (content != undefined) 
	    this.el.innerHTML = content;
	this.el.style.display = 'block';
	this.el.style.zindex = 1000;
};

wso2vis.c.Tooltip.prototype.hide = function() {
    this.el.style.display = 'none';
};

wso2vis.c.Tooltip.prototype.getWindowHeight = function(){
    var innerHeight;
    if (navigator.appVersion.indexOf('MSIE')>0) {
	    innerHeight = document.body.clientHeight;
    } 
    else {
	    innerHeight = window.innerHeight;
    }
    return innerHeight;	
};
 
wso2vis.c.Tooltip.prototype.getWindowWidth = function(){
    var innerWidth;
    if (navigator.appVersion.indexOf('MSIE')>0) {
	    innerWidth = document.body.clientWidth;
    } 
    else {
	    innerWidth = window.innerWidth;
    }
    return innerWidth;	
};


wso2vis.c.DateRange = function() {
	this.currentTimestamp = 0;
	this.firstStart = true; // user to hide the date selection box in the first start
	this.startHr;
	this.endHr = 0;	
	this.startEndHrState = "init";   
	this.pageMode = 'hour'; //This is a flag set to keep the page mode (hour,day,or month);

	wso2vis.c.Control.call(this);
    
    this.showHours(true);
    this.showDays(true);
    this.showMonths(true);
}

wso2vis.extend(wso2vis.c.DateRange, wso2vis.c.Control);

wso2vis.c.DateRange.prototype.property("showHours");
wso2vis.c.DateRange.prototype.property("showDays");
wso2vis.c.DateRange.prototype.property("showMonths");

wso2vis.c.DateRange.prototype.onApplyClicked = function(mode, date1, date2) {
}

wso2vis.c.DateRange.prototype.create = function() {
/*YAHOO.util.Event.onDOMReady(function() {*/
	//variables to keep the date interval start and end
	var styleTabMonthDisplay = '';
	var styleTabDayDisplay = ''; 
	var styleTabHourDisplay = '';
	var styleMonthDisplay = '';
	var styleDayDisplay = ''; 
	var styleHourDisplay = '';
	
	this.pageMode = 'none';
	
    if (this.showMonths()) {
	    this.pageMode = 'month';
	    styleMonthDisplay = '';
	    styleDayDisplay = 'style="display:none"';
	    styleHourDisplay = 'style="display:none"';
	}
	else {
	    styleTabMonthDisplay = 'style="display:none"';
	    styleMonthDisplay = 'style="display:none"';
	}
	
	if (this.showDays()) {
	    this.pageMode = 'day';
	    styleMonthDisplay = 'style="display:none"';
	    styleDayDisplay = '';
	    styleHourDisplay = 'style="display:none"';
	}
	else {
	    styleTabDayDisplay = 'style="display:none"';
	    styleDayDisplay = 'style="display:none"';
	}
	
	if (this.showHours()) {
	    this.pageMode = 'hour';
	    styleMonthDisplay = 'style="display:none"';
	    styleDayDisplay = 'style="display:none"';
	    styleHourDisplay = '';
	}
	else {
	    styleTabHourDisplay = 'style="display:none"';
	    styleHourDisplay = 'style="display:none"';
	}
	
	if (this.pageMode == 'none')
	    return;
	
	var canvas = YAHOO.util.Dom.get(this.canvas());
	canvas.innerHTML = '<div style="height:40px;"><a style="cursor:pointer;" onClick="wso2vis.fn.toggleDateSelector('+this.getID()+')"> \
                <table class="time-header"> \
                	<tr> \
                    	<td><span id="dateDisplay'+this.getID()+'"></span><img src="../images/down.png" alt="calendar" align="middle" style="margin-bottom: 4px;margin-left:5px;margin-right:5px" id="imgObj'+this.getID()+'"/></td> \
                    </tr> \
                </table> \
            </a></div> \
            <div class="dates-selection-Box yui-skin-sam" style="display:none" id="datesSelectionBox'+this.getID()+'"> \
            	<div class="dates" style="float:left"> \
                    <table> \
                        <tr> \
                            <td>Range</td> \
                            <td><input type="text" name="in" id="in'+this.getID()+'" class="in"></td> \
                            <td> -</td> \
                            <td><input type="text" name="out" id="out'+this.getID()+'" class="out"></td> \
                        </tr> \
                    </table> \
                </div> \
                <ul class="dates-types" id="datesTypes'+this.getID()+'"> \
                    <li><a class="nor-right" id="datesSelectionBox'+this.getID()+'MonthTab" onClick="wso2vis.fn.setPageMode(\'month\',this,'+this.getID()+')" '+ styleTabMonthDisplay+'>Month</a></li> \
                    <li><a class="nor-rep" id="datesSelectionBox'+this.getID()+'DayTab" onClick="wso2vis.fn.setPageMode(\'day\',this,'+this.getID()+')" '+ styleTabDayDisplay+'>Day</a></li> \
                    <li><a class="sel-left" id="datesSelectionBox'+this.getID()+'HourTab" onClick="wso2vis.fn.setPageMode(\'hour\',this,'+this.getID()+')" ' + styleTabHourDisplay+'>Hour</a></li> \
                </ul> \
                <div class="dateBox-main" id="dateBox-main'+this.getID()+'"><div id="cal1Container'+this.getID()+'" '+ styleDayDisplay+'></div></div> \
                <div class="timeBox-main" id="timeBox-main'+this.getID()+'" '+ styleHourDisplay+'></div> \
                <div class="monthBox-main" id="monthBox-main'+this.getID()+'" '+ styleMonthDisplay+'></div> \
                <div style="clear:both;padding-top:5px;"><input type="button" value="Apply" onClick="wso2vis.fn.updatePage('+this.getID()+', true);wso2vis.fn.toggleDateSelector('+this.getID()+')" class="button"/></div> \
            </div> \
            <div style="clear:both"></div>';
									   
	var d = new Date();
	var dateDisplay = YAHOO.util.Dom.get("dateDisplay"+this.getID());
	var inTxtTop = getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear();
	var outTxtTop = "";
	var inTxt = YAHOO.util.Dom.get("in"+this.getID()),
		outTxt = YAHOO.util.Dom.get("out"+this.getID()),
		inDate, outDate, interval;

	inTxt.value = "";
	outTxt.value = "";
	
	var d = new Date();
	this.currentTimestamp = d.getTime();

	var cal = new YAHOO.example.calendar.IntervalCalendar("cal1Container"+this.getID(), {pages:3,width:60});

	cal.selectEvent.subscribe(function() {
		interval = this.getInterval();
		if (interval.length == 2) {
			inDate = interval[0];
			inTxt.value = (inDate.getMonth() + 1) + "/" + inDate.getDate() + "/" + inDate.getFullYear();
			inTxtTop = getStringMonth(inDate.getMonth()) + ' ' + inDate.getDate() + ',' + inDate.getFullYear();
			wso2vis.fn.getControlFromID(id).startHr = inDate.getTime();
			if (interval[0].getTime() != interval[1].getTime()) {
				outDate = interval[1];
				outTxt.value = (outDate.getMonth() + 1) + "/" + outDate.getDate() + "/" + outDate.getFullYear();
				outTxtTop = getStringMonth(outDate.getMonth()) + ' ' + outDate.getDate() + ',' + outDate.getFullYear();
				wso2vis.fn.getControlFromID(id).endHr = outDate.getTime();
			} else {
				outTxt.value = "";
				outTxtTop = "";
			}
		}
		dateDisplay.innerHTML = inTxtTop + " - " + outTxtTop;
	}, cal, true);

	cal.render();
	genTimeHours(this.getID());
	genTimeMonths(this.getID());

	//Set the time ranges
    var tmpString;
	if (this.showMonths()) {
	    var twoMonthLate = new Date(getPrevMonth(getPrevMonth(d.getTime()))); //Get the prev month
		tmpString = getStringMonth(twoMonthLate.getMonth()) + ' ' + twoMonthLate.getDate() + ',' + twoMonthLate.getFullYear();
		tmpString += ' -> ' + getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear();		
		wso2vis.fn.getControlFromID(this.getID()).startHr = twoMonthLate.getTime();
		wso2vis.fn.getControlFromID(this.getID()).endHr = d.getTime();
	}
	
	if (this.showDays()) {
	    var sevenDayLate = new Date(d.getTime() - 7*oneDay); //Get the yesterdays midnight
		tmpString = getStringMonth(sevenDayLate.getMonth()) + ' ' + sevenDayLate.getDate() + ',' + sevenDayLate.getFullYear();
		tmpString += ' -> ' + getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear();		
		wso2vis.fn.getControlFromID(this.getID()).startHr = sevenDayLate.getTime();
		wso2vis.fn.getControlFromID(this.getID()).endHr = d.getTime();
	}
	
	if (this.showHours()) {
        wso2vis.fn.setPageMode('hour', document.getElementById('datesSelectionBox'+this.getID()+'HourTab'), this.getID());
	}
	else if (this.showDays()) {
	    wso2vis.fn.setPageMode('day', document.getElementById('datesSelectionBox'+this.getID()+'DayTab'), this.getID());
	}
	else if (this.showMonths()) {
	    wso2vis.fn.setPageMode('month', document.getElementById('datesSelectionBox'+this.getID()+'MonthTab'), this.getID());
	}

	wso2vis.fn.updatePage(this.getID());
}; 


function genHourTable(timestamp, id) {
	var timeBoxMain = document.getElementById('timeBox-main'+id);
	var d = new Date(timestamp);
	var externDiv = document.createElement("DIV");
	YAHOO.util.Dom.addClass(externDiv, 'timeBox-sub');
	var insideStr = '<div class="date-title">' + getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear() + '</div>' +
					'<div class="timeBox-Wrapper">' +
					'<ul>';
	for (var i = 0; i <= 23; i++) {
		insideStr += '<li title="' + (timestamp + i * oneHour) + '" onclick="wso2vis.fn.setHourRange(this, '+id+')">' + i + '</li>';
	}
	insideStr += '</ul></div>';
	externDiv.innerHTML = insideStr;

	timeBoxMain.appendChild(externDiv);
}

function genTimeHours(id) {
	var clearToday = getClearTimestamp(wso2vis.fn.getControlFromID(id).currentTimestamp);


	//set the buttons
	var timeBoxMain = document.getElementById('timeBox-main'+id);
	var navButtons = '<div class="navButtons"><a class="left" onclick="wso2vis.fn.navHour(\'left\','+id+')"><<</a><a class="right" onclick="wso2vis.fn.navHour(\'right\','+id+')">>></a></div>';
	var navButtonDiv = document.createElement("DIV");
	navButtonDiv.innerHTML = navButtons;
	timeBoxMain.innerHTML = "";
	timeBoxMain.appendChild(navButtonDiv);

	genHourTable(clearToday - oneDay * 2, id);
	genHourTable(clearToday - oneDay, id);
	genHourTable(clearToday, id);
}

/* --------------------------------------------------------*/
/*Create Monthe range selector*/
function genMonthTable(timestamp, id) {
	var timeBoxMain = document.getElementById('monthBox-main'+id);
	var d = new Date(timestamp);
	var externDiv = document.createElement("DIV");
	YAHOO.util.Dom.addClass(externDiv, 'monthBox-sub');
	var insideStr = '<div class="date-title">' + d.getFullYear() + '</div>' +
					'<div class="monthBox-Wrapper">' +
					'<ul>';
	var iTime = timestamp;
	for (var i = 0; i < m_names.length; i++) {
		insideStr += '<li title="' + iTime + '" onclick="wso2vis.fn.setMonthRange(this, '+id+')">' + m_names[i] + '</li>';
		iTime = getNextMonth(iTime);
	}
	insideStr += '</ul></div>';
	externDiv.innerHTML = insideStr;

	timeBoxMain.appendChild(externDiv);
}

function genTimeMonths(id) {
	//set the buttons
	var timeBoxMain = document.getElementById('monthBox-main'+id);
	var navButtons = '<div class="navButtons"><a class="left" onclick="wso2vis.fn.navMonth(\'left\','+id+')"><<</a><a class="right" onclick="wso2vis.fn.navMonth(\'right\', '+id+')">>></a></div>';
	var navButtonDiv = document.createElement("DIV");
	navButtonDiv.innerHTML = navButtons;
	timeBoxMain.innerHTML = "";
	timeBoxMain.appendChild(navButtonDiv);
	var jan1st = new Date((new Date(wso2vis.fn.getControlFromID(id).currentTimestamp)).getFullYear(),0,1);
	genMonthTable(getPrevYear(wso2vis.fn.getControlFromID(id).currentTimestamp), id); 
	genMonthTable(jan1st.getTime(), id);
}

function getNextYear(timestamp){
	now = new Date(timestamp);
	var current;
	current = new Date(now.getFullYear() + 1, 0, 1);
	return current.getTime();
}

function getPrevYear(timestamp){
	now = new Date(timestamp);
	var current;
	current = new Date(now.getFullYear() - 1, 0, 1);
	return current.getTime();
}

//util function
function getStringMonth(num) {
	var m_names = new Array("January", "February", "March",
			"April", "May", "June", "July", "August", "September",
			"October", "November", "December");

	return m_names[num];
}

function getClearTimestamp(timestamp) {
	var d = new Date(timestamp);
	var dateClear = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	return (dateClear.getTime()+d.getTimezoneOffset()*1000 * 60);
}

function formatDate(inDate) {
	var year = inDate.split(" ")[0].split("-")[0];
	var month = inDate.split(" ")[0].split("-")[1];
	var day = inDate.split(" ")[0].split("-")[2];
	var hour = inDate.split(" ")[1].split(":")[0];

	return m_names[month - 1] + " " + day + "-" + hour +":00";
}




/************************** YAHOO IntervalCalender ********************************/

function IntervalCalendar(container, cfg) {
	this._iState = 0;
	cfg = cfg || {};
	cfg.multi_select = true;
	IntervalCalendar.superclass.constructor.call(this, container, cfg);

	this.beforeSelectEvent.subscribe(this._intervalOnBeforeSelect, this, true);
	this.selectEvent.subscribe(this._intervalOnSelect, this, true);
	this.beforeDeselectEvent.subscribe(this._intervalOnBeforeDeselect, this, true);
	this.deselectEvent.subscribe(this._intervalOnDeselect, this, true);
}

IntervalCalendar._DEFAULT_CONFIG = YAHOO.widget.CalendarGroup._DEFAULT_CONFIG;

YAHOO.lang.extend(IntervalCalendar, YAHOO.widget.CalendarGroup, {
_dateString : function(d) {
	var a = [];
	a[this.cfg.getProperty(IntervalCalendar._DEFAULT_CONFIG.MDY_MONTH_POSITION.key) - 1] = (d.getMonth() + 1);
	a[this.cfg.getProperty(IntervalCalendar._DEFAULT_CONFIG.MDY_DAY_POSITION.key) - 1] = d.getDate();
	a[this.cfg.getProperty(IntervalCalendar._DEFAULT_CONFIG.MDY_YEAR_POSITION.key) - 1] = d.getFullYear();
	var s = this.cfg.getProperty(IntervalCalendar._DEFAULT_CONFIG.DATE_FIELD_DELIMITER.key);
	return a.join(s);
},

_dateIntervalString : function(l, u) {
	var s = this.cfg.getProperty(IntervalCalendar._DEFAULT_CONFIG.DATE_RANGE_DELIMITER.key);
	return (this._dateString(l)
			+ s + this._dateString(u));
},

getInterval : function() {
	// Get selected dates
	var dates = this.getSelectedDates();
	if (dates.length > 0) {
		// Return lower and upper date in array
		var l = dates[0];
		var u = dates[dates.length - 1];
		return [l, u];
	}
	else {
		// No dates selected, return empty array
		return [];
	}
},

setInterval : function(d1, d2) {
	// Determine lower and upper dates
	var b = (d1 <= d2);
	var l = b ? d1 : d2;
	var u = b ? d2 : d1;
	// Update configuration
	this.cfg.setProperty('selected', this._dateIntervalString(l, u), false);
	this._iState = 2;
},

resetInterval : function() {
	// Update configuration
	this.cfg.setProperty('selected', [], false);
	this._iState = 0;
},

_intervalOnBeforeSelect : function(t, a, o) {
	// Update interval state
	this._iState = (this._iState + 1) % 3;
	if (this._iState == 0) {
		// If starting over with upcoming selection, first deselect all
		this.deselectAll();
		this._iState++;
	}
},

_intervalOnSelect : function(t, a, o) {
	// Get selected dates
	var dates = this.getSelectedDates();
	if (dates.length > 1) {
		/* If more than one date is selected, ensure that the entire interval
		 between and including them is selected */
		var l = dates[0];
		var u = dates[dates.length - 1];
		this.cfg.setProperty('selected', this._dateIntervalString(l, u), false);
	}
	// Render changes
	this.render();
},

_intervalOnBeforeDeselect : function(t, a, o) {
	if (this._iState != 0) {
		/* If part of an interval is already selected, then swallow up
		 this event because it is superfluous (see _intervalOnDeselect) */
		return false;
	}
},

_intervalOnDeselect : function(t, a, o) {
	if (this._iState != 0) {
		// If part of an interval is already selected, then first deselect all
		this._iState = 0;
		this.deselectAll();

		// Get individual date deselected and page containing it
		var d = a[0][0];
		var date = YAHOO.widget.DateMath.getDate(d[0], d[1] - 1, d[2]);
		var page = this.getCalendarPage(date);
		if (page) {
			// Now (re)select the individual date
			page.beforeSelectEvent.fire();
			this.cfg.setProperty('selected', this._dateString(date), false);
			page.selectEvent.fire([d]);
		}
		// Swallow up since we called deselectAll above
		return false;
	}
}
});

YAHOO.namespace("example.calendar");
YAHOO.example.calendar.IntervalCalendar = IntervalCalendar;

/************************** <end> YAHOO IntervalCalender ********************************/



function gotoInitMode(id){
	var allDivs1 = document.getElementById("timeBox-main"+id).getElementsByTagName("*");
	var allDivs2 = document.getElementById("monthBox-main"+id).getElementsByTagName("*");

	for (i = 0; i < allDivs1.length; i++) {
		YAHOO.util.Dom.removeClass(allDivs1[i], 'selected');
	}
	for (i = 0; i < allDivs2.length; i++) {
		YAHOO.util.Dom.removeClass(allDivs2[i], 'selected');
	}
	wso2vis.fn.getControlFromID(id).startEndHrState = "init";
}

function getNextMonth(timestamp){
	now = new Date(timestamp);
	var current;
	if (now.getMonth() == 11) {
	current = new Date(now.getFullYear() + 1, 0, 1);
	} else {
	current = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	}
	return current.getTime();
}

function getPrevMonth(timestamp){
	now = new Date(timestamp);
	var current;
	if (now.getMonth() == 0) {
	current = new Date(now.getFullYear() - 1, 11, 1);
	} else {
	current = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	}
	return current.getTime();	
}

var oneDay = 1000 * 60 * 60 * 24;
var oneHour = 1000 * 60 * 60;
var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");	

wso2vis.fn.setPageMode = function(mode, clickedObj, id) {
	var d = new Date();
	wso2vis.fn.getControlFromID(id).pageMode = mode;
	var dateDisplay = YAHOO.util.Dom.get("dateDisplay"+id);
	var allObjs = document.getElementById("datesTypes"+id).getElementsByTagName("*");
	for (var i = 0; i < allObjs.length; i++) {
		if (YAHOO.util.Dom.hasClass(allObjs[i], "sel-left")) {
			YAHOO.util.Dom.removeClass(allObjs[i], "sel-left");
			YAHOO.util.Dom.addClass(allObjs[i], "nor-left");
		}
		if (YAHOO.util.Dom.hasClass(allObjs[i], "sel-right")) {
			YAHOO.util.Dom.removeClass(allObjs[i], "sel-right");
			YAHOO.util.Dom.addClass(allObjs[i], "nor-right");
		}
		if (YAHOO.util.Dom.hasClass(allObjs[i], "sel-rep")) {
			YAHOO.util.Dom.removeClass(allObjs[i], "sel-rep");
			YAHOO.util.Dom.addClass(allObjs[i], "nor-rep");
		}
	}
	var timeBoxMain = document.getElementById('timeBox-main'+id);
	var cal1Container = document.getElementById('cal1Container'+id);
	var monthBoxMain = document.getElementById('monthBox-main'+id);
	gotoInitMode(id);            
	if (wso2vis.fn.getControlFromID(id).pageMode == 'hour') {
		timeBoxMain.style.display = '';
		cal1Container.style.display = 'none';
		monthBoxMain.style.display = 'none';
		YAHOO.util.Dom.removeClass(clickedObj, "nor-left");
		YAHOO.util.Dom.addClass(clickedObj, "sel-left");
		if (wso2vis.fn.getControlFromID(id).startEndHrState == 'init') {
			var hourLate = new Date(d.getTime() - oneHour*8);
			var tmpString = getStringMonth(hourLate.getMonth()) + ' ' + hourLate.getDate() + ',' + hourLate.getFullYear() + ' - <span class="hourStrong">' + hourLate.getHours() + ':00</span>';
			tmpString += ' -> ' + getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear() + ' - <span class="hourStrong">' + d.getHours() + ':00</span>';
			dateDisplay.innerHTML = tmpString;
		}
		wso2vis.fn.updatePage(id);
	}
	if (wso2vis.fn.getControlFromID(id).pageMode == 'day') {
		d = new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,0,0);
		timeBoxMain.style.display = 'none';
		monthBoxMain.style.display = 'none';
		cal1Container.style.display = '';
		YAHOO.util.Dom.removeClass(clickedObj, "nor-rep");
		YAHOO.util.Dom.addClass(clickedObj, "sel-rep");
		if (wso2vis.fn.getControlFromID(id).startEndHrState == 'init') {
			var sevenDayLate = new Date(d.getTime() - 7*oneDay); //Get the yesterdays midnight
			var tmpString = getStringMonth(sevenDayLate.getMonth()) + ' ' + sevenDayLate.getDate() + ',' + sevenDayLate.getFullYear();
			tmpString += ' -> ' + getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear();
			dateDisplay.innerHTML = tmpString;
			wso2vis.fn.getControlFromID(id).startHr = sevenDayLate.getTime();
			wso2vis.fn.getControlFromID(id).endHr = d.getTime();
		}
		wso2vis.fn.updatePage(id);
	}
	if (wso2vis.fn.getControlFromID(id).pageMode == 'month') {
		d = new Date(d.getFullYear(),d.getMonth(),1,0,0,0);
		timeBoxMain.style.display = 'none';
		monthBoxMain.style.display = '';
		cal1Container.style.display = 'none';
		YAHOO.util.Dom.removeClass(clickedObj, "nor-right");
		YAHOO.util.Dom.addClass(clickedObj, "sel-right");
		if (wso2vis.fn.getControlFromID(id).startEndHrState == 'init') {
			var twoMonthLate = new Date(getPrevMonth(getPrevMonth(d.getTime()))); //Get the prev month
			var tmpString = getStringMonth(twoMonthLate.getMonth()) + ' ' + twoMonthLate.getDate() + ',' + twoMonthLate.getFullYear();
			tmpString += ' -> ' + getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear();
			dateDisplay.innerHTML = tmpString;
			wso2vis.fn.getControlFromID(id).startHr = twoMonthLate.getTime();
			wso2vis.fn.getControlFromID(id).endHr = d.getTime();
		}
		wso2vis.fn.updatePage(id);
	}
}

wso2vis.fn.updatePage = function(id, butt){
	if (butt !== undefined)
	   (wso2vis.fn.getControlFromID(id)).onApplyClicked(wso2vis.fn.getControlFromID(id).pageMode, wso2vis.fn.getControlFromID(id).startHr, wso2vis.fn.getControlFromID(id).endHr);
	
	if (!wso2vis.fn.getControlFromID(id).firstStart) {
		var now = new Date();
		if (wso2vis.fn.getControlFromID(id).startEndHrState == "init") {
			if (wso2vis.fn.getControlFromID(id).pageMode == "hour") {
				now = getClearTimestamp(now.getTime());
				wso2vis.fn.getControlFromID(id).startHr = now - 8 * oneHour;
				wso2vis.fn.getControlFromID(id).endHr = now;
			} else if (wso2vis.fn.getControlFromID(id).pageMode == "day") {
				now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				wso2vis.fn.getControlFromID(id).startHr = now.getTime() - oneDay * 7;
				wso2vis.fn.getControlFromID(id).endHr = now.getTime();
			} else if (wso2vis.fn.getControlFromID(id).pageMode == "month") {
				now = new Date(now.getFullYear(), now.getMonth(), 1);
				wso2vis.fn.getControlFromID(id).startHr = getPrevMonth(getPrevMonth(now.getTime()));
				wso2vis.fn.getControlFromID(id).endHr = now.getTime();
			}
		}else if(wso2vis.fn.getControlFromID(id).startEndHrState == "startSet") {
			wso2vis.fn.getControlFromID(id).endHr = wso2vis.fn.getControlFromID(id).startHr;
			if (wso2vis.fn.getControlFromID(id).pageMode == "hour") {
				wso2vis.fn.getControlFromID(id).startHr = wso2vis.fn.getControlFromID(id).startHr - 8 * oneHour;
			 } else if (wso2vis.fn.getControlFromID(id).pageMode == "day") {
				wso2vis.fn.getControlFromID(id).startHr = wso2vis.fn.getControlFromID(id).startHr - oneDay * 7;
			} else if (wso2vis.fn.getControlFromID(id).pageMode == "month") {
				wso2vis.fn.getControlFromID(id).startHr = getPrevMonth(getPrevMonth(wso2vis.fn.getControlFromID(id).startHr));
			}
		} else if(wso2vis.fn.getControlFromID(id).startEndHrState == "endSet") {
		}
	}
	wso2vis.fn.getControlFromID(id).firstStart = false;
	//var startHrToSend = wso2vis.fn.getControlFromID(id).startHr-oneHour*1/2;
	//var endHrToSend = wso2vis.fn.getControlFromID(id).endHr-oneHour*1/2;
};

wso2vis.fn.setHourRange = function(theli, id) {
	var inTxt = YAHOO.util.Dom.get("in"+id),outTxt = YAHOO.util.Dom.get("out"+id),dateDisplay=YAHOO.util.Dom.get("dateDisplay"+id);
	var timestamp = theli.title;
	timestamp = parseInt(timestamp);
	var allDivs = document.getElementById("timeBox-main"+id).getElementsByTagName("*");

	if (wso2vis.fn.getControlFromID(id).startEndHrState == "init") {
		wso2vis.fn.getControlFromID(id).startHr = timestamp;
		for (var i = 0; i < allDivs.length; i++) {
			YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
		}
		YAHOO.util.Dom.addClass(theli, 'selected');
		wso2vis.fn.getControlFromID(id).startEndHrState = "startSet";
		//set the headers and the text boxes
		var d = new Date(timestamp);
		inTxt.value = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + " - " + d.getHours()+":00";
		outTxt.value = '';
		var tmpString = getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear() + ' - <span class="hourStrong">' + d.getHours() + ':00</span>';
		dateDisplay.innerHTML = tmpString;

	} else if (wso2vis.fn.getControlFromID(id).startEndHrState == "endSet") {
		wso2vis.fn.getControlFromID(id).startHr = timestamp;
		for (var i = 0; i < allDivs.length; i++) {
			YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
		}
		YAHOO.util.Dom.addClass(theli, 'selected');
		wso2vis.fn.getControlFromID(id).startEndHrState = "startSet";

		//set the headers and the text boxes
		var d = new Date(timestamp);
		inTxt.value = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + " - " + d.getHours()+":00";
		outTxt.value = '';
		var tmpString = getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear() + ' - <span class="hourStrong">' + d.getHours() + ':00</span>';
		dateDisplay.innerHTML = tmpString;

	} else if (wso2vis.fn.getControlFromID(id).startEndHrState == "startSet") {
		wso2vis.fn.getControlFromID(id).endHr = timestamp;
		if (wso2vis.fn.getControlFromID(id).startHr > wso2vis.fn.getControlFromID(id).endHr) {//Swap if the end time is smaller than start time
			var tmp = wso2vis.fn.getControlFromID(id).endHr;
			wso2vis.fn.getControlFromID(id).endHr = wso2vis.fn.getControlFromID(id).startHr;
			wso2vis.fn.getControlFromID(id).startHr = tmp;
		}
		for (var i = 0; i < allDivs.length; i++) {
			if (allDivs[i].title <= wso2vis.fn.getControlFromID(id).endHr && allDivs[i].title >= wso2vis.fn.getControlFromID(id).startHr) {
				YAHOO.util.Dom.addClass(allDivs[i], 'selected');
			}
			else {
				YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
			}
		}
		wso2vis.fn.getControlFromID(id).startEndHrState = "endSet";

		//set the headers and the text boxes
		var dStart = new Date(wso2vis.fn.getControlFromID(id).startHr);
		var dEnd = new Date(wso2vis.fn.getControlFromID(id).endHr);
		inTxt.value = (dStart.getMonth() + 1) + "/" + dStart.getDate() + "/" + dStart.getFullYear() + " - " + dStart.getHours()+":00";
		outTxt.value = (dEnd.getMonth() + 1) + "/" + dEnd.getDate() + "/" + dEnd.getFullYear() + " - " + dEnd.getHours()+":00";
		var tmpString = getStringMonth(dStart.getMonth()) + ' ' + dStart.getDate() + ',' + dStart.getFullYear() + ' - <span class="hourStrong">' + dStart.getHours() + ':00</span>' +' -> ' +getStringMonth(dEnd.getMonth()) + ' ' + dEnd.getDate() + ',' + dEnd.getFullYear() + ' - <span class="hourStrong">' + dEnd.getHours() + ':00</span>';
		dateDisplay.innerHTML = tmpString;
	}
};

wso2vis.fn.navHour = function(direction, id) {
	if (direction == "left") {
		wso2vis.fn.getControlFromID(id).currentTimestamp -= oneDay;
	} else if (direction == "right") {
		wso2vis.fn.getControlFromID(id).currentTimestamp += oneDay;
	}
	genTimeHours(id);
	var allDivs = document.getElementById("timeBox-main"+id).getElementsByTagName("*");
	if (wso2vis.fn.getControlFromID(id).startEndHrState == "startSet") {
		for (var i = 0; i < allDivs.length; i++) {
			if (allDivs[i].title == wso2vis.fn.getControlFromID(id).startHr) {
				YAHOO.util.Dom.addClass(allDivs[i], 'selected');
			}
		}
	} else if (wso2vis.fn.getControlFromID(id).startEndHrState == "endSet") {
		for (var i = 0; i < allDivs.length; i++) {
			if (allDivs[i].title <= wso2vis.fn.getControlFromID(id).endHr && allDivs[i].title >= wso2vis.fn.getControlFromID(id).startHr) {
				YAHOO.util.Dom.addClass(allDivs[i], 'selected');
			}
			else {
				YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
			}
		}
	}
};

wso2vis.fn.navMonth = function(direction, id){
	if (direction == "left") {
		wso2vis.fn.getControlFromID(id).currentTimestamp = getPrevYear(wso2vis.fn.getControlFromID(id).currentTimestamp);
	} else if (direction == "right") {
		wso2vis.fn.getControlFromID(id).currentTimestamp = getNextYear(wso2vis.fn.getControlFromID(id).currentTimestamp);
	}
	genTimeMonths(id);
	var allDivs = document.getElementById("monthBox-main"+id).getElementsByTagName("*");
	if (wso2vis.fn.getControlFromID(id).startEndHrState == "startSet") {
		for (var i = 0; i < allDivs.length; i++) {
			if (allDivs[i].title == wso2vis.fn.getControlFromID(id).startHr) {
				YAHOO.util.Dom.addClass(allDivs[i], 'selected');
			}
		}
	} else if (wso2vis.fn.getControlFromID(id).startEndHrState == "endSet") {
		for (var i = 0; i < allDivs.length; i++) {
			if (allDivs[i].title <= wso2vis.fn.getControlFromID(id).endHr && allDivs[i].title >= wso2vis.fn.getControlFromID(id).startHr) {
				YAHOO.util.Dom.addClass(allDivs[i], 'selected');
			}
			else {
				YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
			}
		}
	}
};

wso2vis.fn.setMonthRange = function(theli, id){
	var inTxt = YAHOO.util.Dom.get("in"+id),outTxt = YAHOO.util.Dom.get("out"+id),dateDisplay=YAHOO.util.Dom.get("dateDisplay"+id);
	var timestamp = theli.title;
	timestamp = parseInt(timestamp);
	var allDivs = document.getElementById("monthBox-main"+id).getElementsByTagName("*");

	if (wso2vis.fn.getControlFromID(id).startEndHrState == "init") {
		wso2vis.fn.getControlFromID(id).startHr = timestamp;
		for (var i = 0; i < allDivs.length; i++) {
			YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
		}
		YAHOO.util.Dom.addClass(theli, 'selected');
		wso2vis.fn.getControlFromID(id).startEndHrState = "startSet";
		//set the headers and the text boxes
		var d = new Date(timestamp);
		inTxt.value = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
		outTxt.value = '';
		var tmpString = getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear();
		dateDisplay.innerHTML = tmpString;

	} else if (wso2vis.fn.getControlFromID(id).startEndHrState == "endSet") {
		wso2vis.fn.getControlFromID(id).startHr = timestamp;
		for (var i = 0; i < allDivs.length; i++) {
			YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
		}
		YAHOO.util.Dom.addClass(theli, 'selected');
		wso2vis.fn.getControlFromID(id).startEndHrState = "startSet";

		//set the headers and the text boxes
		var d = new Date(timestamp);
		inTxt.value = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
		outTxt.value = '';
		var tmpString = getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear() ;
		dateDisplay.innerHTML = tmpString;

	} else if (wso2vis.fn.getControlFromID(id).startEndHrState == "startSet") {
		wso2vis.fn.getControlFromID(id).endHr = timestamp;
		if (wso2vis.fn.getControlFromID(id).startHr > wso2vis.fn.getControlFromID(id).endHr) {//Swap if the end time is smaller than start time
			var tmp = wso2vis.fn.getControlFromID(id).endHr;
			wso2vis.fn.getControlFromID(id).endHr = wso2vis.fn.getControlFromID(id).startHr;
			wso2vis.fn.getControlFromID(id).startHr = tmp;
		}
		for (var i = 0; i < allDivs.length; i++) {
			if (allDivs[i].title <= wso2vis.fn.getControlFromID(id).endHr && allDivs[i].title >= wso2vis.fn.getControlFromID(id).startHr) {
				YAHOO.util.Dom.addClass(allDivs[i], 'selected');
			}
			else {
				YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
			}
		}
		wso2vis.fn.getControlFromID(id).startEndHrState = "endSet";

		//set the headers and the text boxes
		var dStart = new Date(wso2vis.fn.getControlFromID(id).startHr);
		var dEnd = new Date(wso2vis.fn.getControlFromID(id).endHr);
		inTxt.value = (dStart.getMonth() + 1) + "/" + dStart.getDate() + "/" + dStart.getFullYear();
		outTxt.value = (dEnd.getMonth() + 1) + "/" + dEnd.getDate() + "/" + dEnd.getFullYear();
		var tmpString = getStringMonth(dStart.getMonth()) + ' ' + dStart.getDate() + ',' + dStart.getFullYear() + ' -> ' + getStringMonth(dEnd.getMonth()) + ' ' + dEnd.getDate() + ',' + dEnd.getFullYear();
		dateDisplay.innerHTML = tmpString;
	}
};

wso2vis.fn.toggleDateSelector = function(id) {
	var anim = "";
	var attributes = "";
	var datesSelectionBox = document.getElementById('datesSelectionBox' + id);
	var imgObj = document.getElementById('imgObj'+id);
	if (datesSelectionBox.style.display == "none") {
		attributes = {
			opacity: { to: 1 },
			height: { to: 230 }
		};
		anim = new YAHOO.util.Anim('datesSelectionBox' + id, attributes);
		datesSelectionBox.style.display = "";
		imgObj.src = "../images/up.png";
	} else {
		attributes = {
			opacity: { to: 0 },
			height: { to: 0 }
		};
		anim = new YAHOO.util.Anim('datesSelectionBox' + id, attributes);

		anim.onComplete.subscribe(function() {
			datesSelectionBox.style.display = "none";
		}, datesSelectionBox);
		imgObj.src = "../images/down.png";
	}

	anim.duration = 0.3;
	anim.animate();
}



