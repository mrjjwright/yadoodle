/**======================================================================
** K$JAX :: DEKAF's lightweight alternative when you cannot use jQuery
**=======================================================================
*/
// --------------------
// public APIs:
// --------------------
//
//	k$("SELECTOR")        // similar to jQuery's $() method:
//		#id               //   return native DOM object with given id (or null)
//		.className        //   return vector of native DOM objects with given CSS class
//      tagName           //   return vector of native DOM objects with given HTML element name
//
//	k$jax({                      // initiate an AJAX (XMLHttpRequest) request as per the parms:
//      url: "...",              //   [required,string] URL of request
//      element: "id"|object,    //   [optional,object|string] element whose innerHTML is to be replaced by response
//      method: "...",           //   [optional,string] request method (defaults to "GET")
//      data: ...,               //   [optional,object|string] data payload
//      blobdata: ...,           //   [optional,blob] blob data payload (used for png, gif, etc)
//      contentType: "...",      //   [optional,string] mime type to send with data payload
//      responseType: "...",     //   [optional,string] override mime type for the response
//      requestHeaders: {},      //   [optional,object] set of request headers as key:value pairs (ex: {"x-amz-tagging":"translationKey=","FooId":"123"})
//      progress: ...,           //   [optional,function] function to call with ajax progress (see below)
//      complete: ...,           //   [optional,function] function to call with results (good or bad)
//      success: ...,            //   [optional,function] function to call with results if the status is between 200-299
//      failure: ...,            //   [optional,function] function to call with results if the status it not between 200-299
//      debug: 0|1|2|3,          //   [optional,number] console.log debug level (default 0 or quiet)
//      retry_count: 0|1|2|...,  //   [optional,number] number of times to retry the request if failed (default 5)
//      retry_status: [],        //   [optional,list] list of status values to retry on (default [0])
//      retry_min_msecs: number, //   [optional,number] min number in range used to generate random msec value (default 1)
//      retry_max_msecs: number  //   [optional,number] max number in range used to generate random msec value (default 20)
//  })
//
//  k$now()               // return a printable string suitable for timing debug statements
//

// --------------------
// functions:
// --------------------
//  all callback functions (progress, complete, success, failure) should be defined like this:
//    function MyFunction (oXHR, oParms) { ... }
//  the arguments are:
//    1. oXHR   -- the native XMLHttpRequest object (Google it)
//    2. oParms -- your JSON object that was passed into k$jax()
//
// --------------------
// examples:
// --------------------
//  k$jax ({                    // GET's response from given URL and replaces inside element with id 'cool'
//     url: "/something/cool.php",
//     id: "cool"
//  });
//
//  k$jax ({                    // same but with exception handling if request fails
//     url: "/something/cool.php",
//     id: "cool"
//     failure: function(oXHR) {
//       alert ("broken ajax request, got HTTP-" + oXHR.status + ": " + oXHR.statusText);
//     }
//  });
//
//  k$jax ({                    // issue POST with JSON data and show response in js console
//     url: "/something/cool.php",
//     method: "POST",
//     data: { foo: "bar" },
//     complete: function(oXHR) {
//       console.log ("KJAX: got: HTTP-" + oXHR.status + ": " + oXHR.statusText);
//       console.log ("KJAX: data to follow:");
//       console.log (oXHR.responseText);
//     }
//  });
//
//  k$jax ({                    // issue POST with custom string data and show response in js console
//     url: "/something/cool.php",
//     method: "POST",
//     data: "something very custom",
//     complete: function(oXHR) {
//       console.log ("KJAX: got: HTTP-" + oXHR.status + ": " + oXHR.statusText);
//       console.log ("KJAX: data to follow:");
//       console.log (oXHR.responseText);
//     }
//  });
//
//  k$jax ({                    // GET with console messages as AJAX does it's thing
//     url: "/something/cool.php",
//     progress: function(oXHR,oParms) {
//       if (oXHR.readyState == 0) {
//          console.log ("KJAX: " + oParms['url'] + ": readyState:0: uninitialized");
//       }
//       else if (oXHR.readyState == 1) {
//          console.log ("KJAX: " + oParms['url'] + ": readyState:1: open called");
//       }
//       else if (oXHR.readyState == 2) {
//          console.log ("KJAX: " + oParms['url'] + ": readyState:2: URL sent, but no response yet");
//       }
//       else if (oXHR.readyState == 3) {
//          console.log ("KJAX: " + oParms['url'] + ": readyState:3: receiving text back, but not yet complete");
//       }
//       else if (oXHR.readyState == 4) {
//          console.log ("KJAX: " + oParms['url'] + ": readyState:4: complete");
//       }
//     }
//  });
//

var g_nKNowStart = window.performance.now(); // global

//-----------------------------------------------------------------------------
function k$format_num(iNum, iMaxLength)
//-----------------------------------------------------------------------------
{
	'use strict';

	let sVal = iNum.toString().substring(0,iMaxLength);
	while (sVal.length < iMaxLength) sVal = " " + sVal;
	return sVal;

} // k$format_num

//-----------------------------------------------------------------------------
function k$format_str(sStr, iMaxLength)
//-----------------------------------------------------------------------------
{
	'use strict';

	let sVal = sStr.substring(0,iMaxLength);
	while (sVal.length < iMaxLength) sVal = sVal + " ";
	return sVal;

} // k$format_str

//-----------------------------------------------------------------------------
function k$now (sAction)
//-----------------------------------------------------------------------------
{
	'use strict';

	return ("| " + k$format_num(window.performance.now() - g_nKNowStart, 9) + " | ");

} // k$now

//-----------------------------------------------------------------------------
function k$ (sSelect)
//-----------------------------------------------------------------------------
{
	'use strict';

	if (sSelect.startsWith ('#')) {
		return document.getElementById (sSelect.substr(1));
	}
	else if (sSelect.startsWith ('.')) {
		return document.getElementsByClassName (sSelect.substr(1));
	}
	else {
		return document.getElementsByTagName (sSelect);
	}

} // k$

//-----------------------------------------------------------------------------
function k$jax (oParms)
//-----------------------------------------------------------------------------
{
	'use strict';

	// {
	//     url: "...",              // [required,string] URL of request
	//     id: "...",               // [optional,string] id of element whose innerHTML is to be replaced by response
	//     method: "...",           // [optional,string] request method (defaults to "GET")
	//     data: ...,               // [optional,object|string] data payload
	//     blobdata: ...,           // [optional,blob] blob data payload (used for png, gif, etc)
	//     contentType: "...",      // [optional,string] mime type to send with data payload
	//     responseType: "...",     // [optional,string] override mime type for the response
	//     requestHeaders: {},      // [optional,object] set of request headers as key:value pairs (ex: {"User-Agent":"foo","FooId":"123"})
	//     progress: ...,           // [optional,object] function to call with ajax progress (see below)
	//     complete: ...,           // [optional,object] function to call with results (good or bad)
	//     success: ...,            // [optional,object] function to call with results if the status is between 200-299
	//     failure: ...             // [optional,object] function to call with results if the status it not between 200-299
	//     debug: 0|1|2|3,          // [optional,number] console.log debug level (default 0 or quiet)
	//     retry_count: 0|1|2|...,  // [optional,number] number of times to retry the request if failed (default 5)
	//     retry_status: [],        // [optional,list] list of status values to retry on (default [0])
	//     retry_min_msecs: number, // [optional,number] min number in range used to generate random msec value (default 1)
	//     retry_max_msecs: number  // [optional,number] max number in range used to generate random msec value (default 20)
	// }

	if (!oParms || (typeof(oParms) != "object")) {
		console.log ("KJAX: missing JSON object as argument");
		return false;
	}

	var sURL            = oParms["url"];
	var sMethod         = oParms["method"];
	var oData           = oParms["data"];
	var sData           = (typeof(oData) == "object") ? JSON.stringify(oData) : (typeof(oData) == "string") ? oData : null;
	var bData           = oParms["blobdata"];
	var sMime           = oParms["contentType"];
	var sRespMime       = oParms["responseType"];
	var oRequestHeaders = oParms["requestHeaders"];
	var iDebug          = oParms["debug"] ? (1 * oParms["debug"]) : 0;

	if (typeof(sURL) != "string") {
		console.log ("KJAX: missing (or illegal) url parameter");
		return false;
	}
	else if (!sMethod) {
		sMethod = "GET";
	}
	var oXHR = new XMLHttpRequest();

	oXHR.onreadystatechange = function() {
		_k$jax_rsc (oXHR, oParms);
	};

	if (iDebug >= 1) {
		console.log (k$now() + "KJAX | " + sURL + ", method: " + sMethod);
	}

	oXHR.open (sMethod, sURL);
	if (sMime)
	{
		if (iDebug >= 2) console.log (k$now() + "KJAX | " + sURL + ", type: " + sMime);
		oXHR.setRequestHeader ("Content-Type", sMime);
	}

	if (oRequestHeaders)
	{
		for (var key in oRequestHeaders)
		{
			oXHR.setRequestHeader (key, oRequestHeaders[key]);
		}
	}

	if (sRespMime)
	{
		if (iDebug >= 2) console.log (k$now() + "KJAX | " + sURL + ", response MimeType: " + sRespMime);
		oXHR.responseType = sRespMime;
	}

	if (sData)
	{
		if (iDebug >= 2) {
			console.log (k$now() + "KJAX | " + sURL + ", data:");
			console.log (sData);
		}
		oXHR.send (sData);
	} else if (bData)
	{
		if (iDebug >= 2) {
			console.log (k$now() + "KJAX | " + sURL + ", data:blob:");
		}
		oXHR.send (bData);
	}
	else {
		oXHR.send (null);
	}

} // k$jax

//-----------------------------------------------------------------------------
function _k$jax_rsc (oXHR, oParms)
//-----------------------------------------------------------------------------
{
	'use strict';

	var iDebug         = oParms["debug"] ? (1 * oParms["debug"]) : 0;
	var oProgress      = oParms["progress"];
	var sURL           = oParms["url"];
	var iRetryParm     = oParms["retry_count"];
	var iRetryCount    = (iRetryParm || (iRetryParm==0)) ? (1 * iRetryParm) : 5;
	var iRetryStatus   = oParms["retry_status"] ? oParms["retry_status"] : [0];
	var iRetryMinMsecs = oParms["retry_min_msecs"] ? (1 * oParms["retry_min_msecs"]) : 1;
	var iRetryMaxMsecs = oParms["retry_max_msecs"] ? (1 * oParms["retry_max_msecs"]) : 20;

	if (iDebug >= 3)
	{
		 if (oXHR.readyState == 0) {
			console.log (k$now() + "KJAX | " + sURL + ": readyState:0: uninitialized, url: " + sURL);
		 }
		 else if (oXHR.readyState == 1) {
			console.log (k$now() + "KJAX | " + sURL + ": readyState:1: open called, url: " + sURL);
		 }
		 else if (oXHR.readyState == 2) {
			console.log (k$now() + "KJAX | " + sURL + ": readyState:2: URL sent, but no response yet, url: " + sURL);
		 }
		 else if (oXHR.readyState == 3) {
			console.log (k$now() + "KJAX | " + sURL + ": readyState:3: receiving text back, but not yet complete, url: " + sURL);
		 }
		 else if (oXHR.readyState == 4) {
			console.log (k$now() + "KJAX | " + sURL + ": readyState:4: complete, url: " + sURL);
		 }
	}
	if (oProgress) {
		oProgress (oXHR, oParms);
	}

	switch (oXHR.readyState)
	{
	case 4: // 4 = complete
		// fall-through...
		break;

	case 0: // 0 = uninitialized (noise)
	case 1: // 1 = open called (noise)
	case 2: // 2 = URL sent, but no response yet
	case 3: // 3 = receiving text back, but not yet complete
	default:
		return;
	}

	if (iDebug >= 1) {
		console.log (k$now() + "KJAX | " + sURL + ", " + oXHR.status + ": " + oXHR.statusText);
	}

	var sID       = oParms["element"];
	var oElement  = (typeof(sID) == "string") ? k$('#'+sID) : (typeof(sID) == "object") ? sID : null;
	var oSuccess  = oParms["success"];
	var oFailure  = oParms["failure"];
	var oComplete = oParms["complete"];
	var bSuccess  = ((oXHR.status >= 200) && (oXHR.status <= 299));

	// populate the given element as long as it was a 2xx or if there is no failure object:
	if (oElement && (bSuccess || !oFailure))
	{
		oElement.innerHTML = oXHR.responseText;
	}

	if (oComplete)
	{
		if (typeof(oComplete) != "function") {
			console.log (k$now() + "KJAX | non-function sent to parms, complete: " + oComplete);
		}
		else {
			oComplete (oXHR, oParms);
		}
	}

	if (bSuccess)
	{
		if (oSuccess)
		{
			if (typeof(oSuccess) != "function") {
				console.log (k$now() + "KJAX | non-function sent to parms, success: " + oSuccess);
			}
			else {
				oSuccess (oXHR, oParms);
			}
		}
	}
	else
	{
		// Request was not successful. See if we should try again.
		if ((iRetryStatus.indexOf(oXHR.status) > -1) && (iRetryCount > 0))
		{
			if (iDebug >= 1)
			{
				console.log (k$now() + "KJAX | Request Failed. retry_count=" + iRetryCount + " Retrying...");
			}
			iRetryCount--;
			oParms["retry_count"] = iRetryCount;

			// wait random msecs and try again
			setTimeout(function(){
				k$jax (oParms);
			}, Math.floor(Math.random() * (iRetryMaxMsecs - iRetryMinMsecs + 1)) + iRetryMinMsecs);
		} else if (oFailure)
		{
			if (typeof(oFailure) != "function") {
				console.log (k$now() + "KJAX | non-function sent to parms, failure: " + oFailure);
			}
			else {
				oFailure (oXHR, oParms);
			}
		}
	}

} // _k$jax_rsc - onReadyStateChange
/**
 * From: https://github.com/tjwebb/fnv-plus
 * FNV-1a Hash implementation (32, 64, 128, 256, 512, and 1024 bit)
 * @author Travis Webb <me@traviswebb.com>
 * @see http://tools.ietf.org/html/draft-eastlake-fnv-06
 */
var fnvplus = (function(){
	'use strict'

	var i, hl = [], hl16 = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'],
		version = '1a',
		useUTF8 = false,
		_hash32, _hash52, _hash64, _hash128, _hash256, _hash512, _hash1024,
		referenceSeed = 'chongo <Landon Curt Noll> /\\../\\',
		defaultKeyspace = 52,
		fnvConstants = {
			32: {offset: 0},
			64: {offset: [0,0,0,0]},
			128: {offset: [0,0,0,0,0,0,0,0]},
			256: {offset: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
			512: {offset: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
			1024: {offset: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}};

	for(i=0; i < 256; i++){
		hl[i] = ((i >> 4) & 15).toString(16) + (i & 15).toString(16);
	}

	function hexToBase(hex, base){
		var alphabet = '0123456789abcdefghijklmnopqrstuvwxyz',
			digits = [0], carry, i, j, string = '';

		for(i = 0; i < hex.length; i+=2){
			carry = parseInt(hex.substr(i,2),16);
			for(j = 0; j < digits.length; j++){
				carry += digits[j] << 8;
				digits[j] = carry % base;
				carry = (carry / base) | 0;
			}
			while (carry > 0) {
				digits.push(carry % base);
				carry = (carry / base) | 0;
			}
		}

		for (i = digits.length - 1; i >= 0; --i){
			string += alphabet[digits[i]];
		}

		return string;
	}

	function hashValHex(value, keyspace) {
		return {
			bits: keyspace,
			value: value,
			dec: function(){return hexToBase(value, 10);},
			hex: function(){return value;},
			str: function(){return hexToBase(value, 36);}
		};
	}

	function hashValInt32(value, keyspace) {
		return {
			bits: keyspace,
			value: value,
			dec: function(){return value.toString();},
			hex: function(){return hl[value>>>24]+ hl[(value>>>16)&255]+hl[(value>>>8)&255]+hl[value&255];},
			str: function(){return value.toString(36);}
		};
	}

	function hashValInt52(value, keyspace) {
		return {
			bits: keyspace,
			value: value,
			dec: function(){return value.toString();},
			hex: function(){return ('0000000000000000'+value.toString(16)).substr(-13);},
			str: function(){return value.toString(36);}
		};
	}

	function hash(message, keyspace) {
		var str = (typeof message === 'object') ? JSON.stringify(message) : message;

		switch(keyspace || defaultKeyspace){
			case 32:
				return _hash32(str);
			case 64:
				return _hash64(str);
			case 128:
				return _hash128(str);
			case 256:
				return _hash256(str);
			case 512:
				return _hash512(str);
			case 1024:
				return _hash1024(str);
			default:
				return _hash52(str);
		}
	}

	function setKeyspace(keyspace) {
		if (keyspace === 52 || fnvConstants[keyspace]) {
			defaultKeyspace = keyspace;
		} else {
			throw new Error('Supported FNV keyspacs: 32, 52, 64, 128, 256, 512, and 1024 bit');
		}
	}

	function setVersion(_version) {
		if (_version === '1a' ) {
			version = _version;
			_hash32   = useUTF8 ? _hash32_1a_utf   : _hash32_1a;
			_hash52   = useUTF8 ? _hash52_1a_utf   : _hash52_1a;
			_hash64   = useUTF8 ? _hash64_1a_utf   : _hash64_1a;
			_hash128  = useUTF8 ? _hash128_1a_utf  : _hash128_1a;
			_hash256  = useUTF8 ? _hash256_1a_utf  : _hash256_1a;
			_hash512  = useUTF8 ? _hash512_1a_utf  : _hash512_1a;
			_hash1024 = useUTF8 ? _hash1024_1a_utf : _hash1024_1a;
		} else if (_version === '1') {
			version = _version;
			_hash32   = useUTF8 ? _hash32_1_utf   : _hash32_1;
			_hash52   = useUTF8 ? _hash52_1_utf   : _hash52_1;
			_hash64   = useUTF8 ? _hash64_1_utf   : _hash64_1;
			_hash128  = useUTF8 ? _hash128_1_utf  : _hash128_1;
			_hash256  = useUTF8 ? _hash256_1_utf  : _hash256_1;
			_hash512  = useUTF8 ? _hash512_1_utf  : _hash512_1;
			_hash1024 = useUTF8 ? _hash1024_1_utf : _hash1024_1;
		} else {
			throw new Error('Supported FNV versions: 1, 1a');
		}
	}

	function setUTF8(utf8) {
		if (utf8) {
			useUTF8 = true;
			_hash32   = version == '1a' ? _hash32_1a_utf   : _hash32_1_utf;
			_hash52   = version == '1a' ? _hash52_1a_utf   : _hash52_1_utf;
			_hash64   = version == '1a' ? _hash64_1a_utf   : _hash64_1_utf;
			_hash128  = version == '1a' ? _hash128_1a_utf  : _hash128_1_utf;
			_hash256  = version == '1a' ? _hash256_1a_utf  : _hash256_1_utf;
			_hash512  = version == '1a' ? _hash512_1a_utf  : _hash512_1_utf;
			_hash1024 = version == '1a' ? _hash1024_1a_utf : _hash1024_1_utf;
		} else {
			useUTF8 = false;
			_hash32   = version == '1a' ? _hash32_1a   : _hash32_1;
			_hash52   = version == '1a' ? _hash52_1a   : _hash52_1;
			_hash64   = version == '1a' ? _hash64_1a   : _hash64_1;
			_hash128  = version == '1a' ? _hash128_1a  : _hash128_1;
			_hash256  = version == '1a' ? _hash256_1a  : _hash256_1;
			_hash512  = version == '1a' ? _hash512_1a  : _hash512_1;
			_hash1024 = version == '1a' ? _hash1024_1a : _hash1024_1;
		}
	}

	function seed(seed) {
		var oldVersion = version, res, i;

		seed = (seed || seed === 0) ? seed : referenceSeed;

		if (seed === referenceSeed) setVersion('1');

		for (var keysize in fnvConstants) {
			fnvConstants[keysize].offset = [];
			for(i = 0; i < keysize / 16; i++){
				fnvConstants[keysize].offset[i]	= 0;
			}
			res = hash(seed, parseInt(keysize, 10)).hex();
			for(i = 0; i < keysize / 16; i++){
				fnvConstants[keysize].offset[i]	= parseInt(res.substr(i*4,4), 16);
			}
		}

		setVersion(oldVersion);
	}

	/**
	 * Implementation without library overhead.
	 */

	function _hash32_1a_fast(str) {
		var i, l = str.length-3, t0=0,v0=0x9dc5,t1=0,v1=0x811c;

		for (i = 0; i < l;) {
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
		}

		while(i<l+3){
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
		}


		return ((v1<<16)>>>0)+v0;
	}

	function _hash32_1a_fast_hex(str) {
		var i, l = str.length-3, t0=0,v0=0x9dc5,t1=0,v1=0x811c;

		for (i = 0; i < l;) {
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
		}

		while(i<l+3){
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
		}


		return hl[(v1>>>8)&255]+hl[v1&255]+hl[(v0>>>8)&255]+hl[v0&255];
	}

	function _hash52_1a_fast(str){
		var i,l=str.length-3,t0=0,v0=0x2325,t1=0,v1=0x8422,t2=0,v2=0x9ce4,t3=0,v3=0xcbf2;

		for (i = 0; i < l;) {
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		while(i<l+3){
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		return (v3&15) * 281474976710656 + v2 * 4294967296 + v1 * 65536 + (v0^(v3>>4));
	}

	function _hash52_1a_fast_hex(str){
		var i,l=str.length-3,t0=0,v0=0x2325,t1=0,v1=0x8422,t2=0,v2=0x9ce4,t3=0,v3=0xcbf2;

		for (i = 0; i < l;) {
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		while(i<l+3){
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		return hl16[v3&15]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[(v0>>8)^(v3>>12)]+hl[(v0^(v3>>4))&255];
	}

	function _hash64_1a_fast(str){
		var i,l=str.length-3,t0=0,v0=0x2325,t1=0,v1=0x8422,t2=0,v2=0x9ce4,t3=0,v3=0xcbf2;

		for (i = 0; i < l;) {
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		while(i<l+3){
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		return hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255];
	}

	function _hash32_1a_fast_utf(str) {
		var c,i,l=str.length,t0=0,v0=0x9dc5,t1=0,v1=0x811c;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=(c&63)|128;
			}
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
		}

		return ((v1<<16)>>>0)+v0;
	}

	function _hash32_1a_fast_hex_utf(str) {
		var c,i,l=str.length,t0=0,v0=0x9dc5,t1=0,v1=0x811c;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=(c&63)|128;
			}
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
		}


		return hl[(v1>>>8)&255]+hl[v1&255]+hl[(v0>>>8)&255]+hl[v0&255];
	}

	function _hash52_1a_fast_utf(str){
		var c,i,l=str.length,t0=0,v0=0x2325,t1=0,v1=0x8422,t2=0,v2=0x9ce4,t3=0,v3=0xcbf2;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		return (v3&15) * 281474976710656 + v2 * 4294967296 + v1 * 65536 + (v0^(v3>>4));
	}

	function _hash52_1a_fast_hex_utf (str){
		var c,i,l=str.length,t0=0,v0=0x2325,t1=0,v1=0x8422,t2=0,v2=0x9ce4,t3=0,v3=0xcbf2;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		return hl16[v3&15]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[(v0>>8)^(v3>>12)]+hl[(v0^(v3>>4))&255];
	}

	function _hash64_1a_fast_utf(str){
		var c,i,l=str.length,t0=0,v0=0x2325,t1=0,v1=0x8422,t2=0,v2=0x9ce4,t3=0,v3=0xcbf2;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		return hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255];
	}
	/**
	 * Regular functions. This versions are accessible through API
	 */

	function _hash32_1a(str){
		var i,l=str.length-3,s=fnvConstants[32].offset,t0=0,v0=s[1]|0,t1=0,v1=s[0]|0;

		for (i = 0; i < l;) {
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
		}

		while(i<l+3){
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
		}

		return hashValInt32(((v1<<16)>>>0)+v0,32);
	}

	function _hash32_1(str){
		var i,l=str.length-3,s=fnvConstants[32].offset,t0=0,v0=s[1]|0,t1=0,v1=s[0]|0;

		for (i = 0; i < l;) {
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
		}

		while(i<l+3){
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			v0^=str.charCodeAt(i++);
		}

		return hashValInt32(((v1<<16)>>>0)+v0,32);
	}

	function _hash32_1a_utf(str){
		var c,i,l=str.length,s=fnvConstants[32].offset,t0=0,v0=s[1]|0,t1=0,v1=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=(c&63)|128;
			}
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
		}

		return hashValInt32(((v1<<16)>>>0)+v0,32);
	}

	function _hash32_1_utf(str){
		var c,i,l=str.length,s=fnvConstants[32].offset,t0=0,v0=s[1]|0,t1=0,v1=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			t0=v0*403;t1=v1*403;
			t1+=v0<<8;
			v1=(t1+(t0>>>16))&65535;v0=t0&65535;
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*403;t1=v1*403;
				t1+=v0<<8;
				v1=(t1+(t0>>>16))&65535;v0=t0&65535;
				v0^=(c&63)|128;
			}
		}

		return hashValInt32(((v1<<16)>>>0)+v0,32);
	}

	_hash32 = _hash32_1a;

	function _hash52_1a(str){
		var i,l=str.length-3,s=fnvConstants[64].offset,t0=0,v0=s[3]|0,t1=0,v1=s[2]|0,t2=0,v2=s[1]|0,t3=0,v3=s[0]|0;

		for (i = 0; i < l;) {
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		while(i<l+3){
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		return hashValInt52((v3&15)*281474976710656+v2*4294967296+v1*65536+(v0^(v3>>4)),52);
	}

	function _hash52_1(str){
		var i,l=str.length-3,s=fnvConstants[64].offset,t0=0,v0=s[3]|0,t1=0,v1=s[2]|0,t2=0,v2=s[1]|0,t3=0,v3=s[0]|0;

		for (i = 0; i < l;) {
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
		}

		while(i<l+3){
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
		}

		return hashValInt52((v3&15)*281474976710656+v2*4294967296+v1*65536+(v0^(v3>>4)),52);
	}

	function _hash52_1a_utf(str){
		var c,i,l=str.length,s=fnvConstants[64].offset,t0=0,v0=s[3]|0,t1=0,v1=s[2]|0,t2=0,v2=s[1]|0,t3=0,v3=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		return hashValInt52((v3&15)*281474976710656+v2*4294967296+v1*65536+(v0^(v3>>4)),52);
	}

	function _hash52_1_utf(str){
		var c,i,l=str.length,s=fnvConstants[64].offset,t0=0,v0=s[3]|0,t1=0,v1=s[2]|0,t2=0,v2=s[1]|0,t3=0,v3=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}
		}

		return hashValInt52((v3&15)*281474976710656+v2*4294967296+v1*65536+(v0^(v3>>4)),52);
	}

	_hash52 = _hash52_1a;

	function _hash64_1a(str){
		var i,l=str.length-3,s=fnvConstants[64].offset,t0=0,v0=s[3]|0,t1=0,v1=s[2]|0,t2=0,v2=s[1]|0,t3=0,v3=s[0]|0;

		for (i = 0; i < l;) {
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		while(i<l+3){
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		return hashValHex(hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],64);
	}

	function _hash64_1(str){
		var i,l=str.length-3,s=fnvConstants[64].offset,t0=0,v0=s[3]|0,t1=0,v1=s[2]|0,t2=0,v2=s[1]|0,t3=0,v3=s[0]|0;

		for (i = 0; i < l;) {
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
		}

		while(i<l+3){
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
		}

		return hashValHex(hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],64);
	}

	function _hash64_1a_utf(str){
		var c,i,l=str.length,s=fnvConstants[64].offset,t0=0,v0=s[3]|0,t1=0,v1=s[2]|0,t2=0,v2=s[1]|0,t3=0,v3=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}

		return hashValHex(hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],64);
	}

	function _hash64_1_utf(str){
		var c,i,l=str.length,s=fnvConstants[64].offset,t0=0,v0=s[3]|0,t1=0,v1=s[2]|0,t2=0,v2=s[1]|0,t3=0,v3=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
				t2+=v0<<8;t3+=v1<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
				v0^=(c&63)|128;
			}
		}

		return hashValHex(hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],64);
	}

	_hash64 = _hash64_1a;

	function _hash128_1a(str){
		var i,l=str.length-3,s=fnvConstants[128].offset,t0=0,v0=s[7]|0,t1=0,v1=s[6]|0,t2=0,v2=s[5]|0,t3=0,v3=s[4]|0,t4=0,v4=s[3]|0,t5=0,v5=s[2]|0,t6=0,v6=s[1]|0,t7=0,v7=s[0]|0;

		for (i = 0; i < l;) {
			v0^=str.charCodeAt(i++);
			t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
			t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
			t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
			t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
			t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
		}

		while(i<l+3){
			v0^=str.charCodeAt(i++);
			t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
			t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
		}

		return hashValHex(hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],128);
	}

	function _hash128_1(str){
		var i,l=str.length-3,s=fnvConstants[128].offset,t0=0,v0=s[7]|0,t1=0,v1=s[6]|0,t2=0,v2=s[5]|0,t3=0,v3=s[4]|0,t4=0,v4=s[3]|0,t5=0,v5=s[2]|0,t6=0,v6=s[1]|0,t7=0,v7=s[0]|0;

		for (i = 0; i < l;) {
			t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
			t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
			t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
			t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
			t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
			v0^=str.charCodeAt(i++);
		}

		while(i<l+3){
			t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
			t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
			v0^=str.charCodeAt(i++);
		}

		return hashValHex(hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],128);
	}

	function _hash128_1a_utf(str){
		var c,i,l=str.length,s=fnvConstants[128].offset,t0=0,v0=s[7]|0,t1=0,v1=s[6]|0,t2=0,v2=s[5]|0,t3=0,v3=s[4]|0,t4=0,v4=s[3]|0,t5=0,v5=s[2]|0,t6=0,v6=s[1]|0,t7=0,v7=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
				t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
				t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
				t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
				t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
				t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
				t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
				v0^=(c&63)|128;
			}
			t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
			t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
		}

		return hashValHex(hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],128);
	}

	function _hash128_1_utf(str){
		var c,i,l=str.length,s=fnvConstants[128].offset,t0=0,v0=s[7]|0,t1=0,v1=s[6]|0,t2=0,v2=s[5]|0,t3=0,v3=s[4]|0,t4=0,v4=s[3]|0,t5=0,v5=s[2]|0,t6=0,v6=s[1]|0,t7=0,v7=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
			t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
				t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
				t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
				t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
				t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
				t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*315;t1=v1*315;t2=v2*315;t3=v3*315;t4=v4*315;t5=v5*315;t6=v6*315;t7=v7*315;
				t5+=v0<<8;t6+=v1<<8;t7+=v2<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;v7=(t7+(t6>>>16))&65535;v6=t6&65535;
				v0^=(c&63)|128;
			}
		}

		return hashValHex(hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],128);
	}

	_hash128 = _hash128_1a;

	function _hash256_1a(str){
		var i,l=str.length-3,s=fnvConstants[256].offset,t0=0,v0=s[15]|0,t1=0,v1=s[14]|0,t2=0,v2=s[13]|0,t3=0,v3=s[12]|0,t4=0,v4=s[11]|0,t5=0,v5=s[10]|0,t6=0,v6=s[9]|0,t7=0,v7=s[8]|0,t8=0,v8=s[7]|0,t9=0,v9=s[6]|0,t10=0,v10=s[5]|0,t11=0,v11=s[4]|0,t12=0,v12=s[3]|0,t13=0,v13=s[2]|0,t14=0,v14=s[1]|0,t15=0,v15=s[0]|0;

		for (i = 0; i < l;) {
			v0^=str.charCodeAt(i++);
			t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
			t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
			t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
			t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
			t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
		}

		while(i<l+3){
			v0^=str.charCodeAt(i++);
			t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
			t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
		}

		return hashValHex(hl[v15>>8]+hl[v15&255]+hl[v14>>8]+hl[v14&255]+hl[v13>>8]+hl[v13&255]+hl[v12>>8]+hl[v12&255]+hl[v11>>8]+hl[v11&255]+hl[v10>>8]+hl[v10&255]+hl[v9>>8]+hl[v9&255]+hl[v8>>8]+hl[v8&255]+hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],256);
	}

	function _hash256_1(str){
		var i,l=str.length-3,s=fnvConstants[256].offset,t0=0,v0=s[15]|0,t1=0,v1=s[14]|0,t2=0,v2=s[13]|0,t3=0,v3=s[12]|0,t4=0,v4=s[11]|0,t5=0,v5=s[10]|0,t6=0,v6=s[9]|0,t7=0,v7=s[8]|0,t8=0,v8=s[7]|0,t9=0,v9=s[6]|0,t10=0,v10=s[5]|0,t11=0,v11=s[4]|0,t12=0,v12=s[3]|0,t13=0,v13=s[2]|0,t14=0,v14=s[1]|0,t15=0,v15=s[0]|0;

		for (i = 0; i < l;) {
			t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
			t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
			t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
			t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
			t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
			v0^=str.charCodeAt(i++);
		}

		while(i<l+3){
			t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
			t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
			v0^=str.charCodeAt(i++);
		}

		return hashValHex(hl[v15>>8]+hl[v15&255]+hl[v14>>8]+hl[v14&255]+hl[v13>>8]+hl[v13&255]+hl[v12>>8]+hl[v12&255]+hl[v11>>8]+hl[v11&255]+hl[v10>>8]+hl[v10&255]+hl[v9>>8]+hl[v9&255]+hl[v8>>8]+hl[v8&255]+hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],256);
	}

	function _hash256_1a_utf(str){
		var c,i,l=str.length,s=fnvConstants[256].offset,t0=0,v0=s[15]|0,t1=0,v1=s[14]|0,t2=0,v2=s[13]|0,t3=0,v3=s[12]|0,t4=0,v4=s[11]|0,t5=0,v5=s[10]|0,t6=0,v6=s[9]|0,t7=0,v7=s[8]|0,t8=0,v8=s[7]|0,t9=0,v9=s[6]|0,t10=0,v10=s[5]|0,t11=0,v11=s[4]|0,t12=0,v12=s[3]|0,t13=0,v13=s[2]|0,t14=0,v14=s[1]|0,t15=0,v15=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
				t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
				t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
				t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
				t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
				t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
				t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
				v0^=(c&63)|128;
			}
			t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
			t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
		}

		return hashValHex(hl[v15>>8]+hl[v15&255]+hl[v14>>8]+hl[v14&255]+hl[v13>>8]+hl[v13&255]+hl[v12>>8]+hl[v12&255]+hl[v11>>8]+hl[v11&255]+hl[v10>>8]+hl[v10&255]+hl[v9>>8]+hl[v9&255]+hl[v8>>8]+hl[v8&255]+hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],256);
	}

	function _hash256_1_utf(str){
		var c,i,l=str.length,s=fnvConstants[256].offset,t0=0,v0=s[15]|0,t1=0,v1=s[14]|0,t2=0,v2=s[13]|0,t3=0,v3=s[12]|0,t4=0,v4=s[11]|0,t5=0,v5=s[10]|0,t6=0,v6=s[9]|0,t7=0,v7=s[8]|0,t8=0,v8=s[7]|0,t9=0,v9=s[6]|0,t10=0,v10=s[5]|0,t11=0,v11=s[4]|0,t12=0,v12=s[3]|0,t13=0,v13=s[2]|0,t14=0,v14=s[1]|0,t15=0,v15=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
			t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
				t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
				t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
				t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
				t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
				t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*355;t1=v1*355;t2=v2*355;t3=v3*355;t4=v4*355;t5=v5*355;t6=v6*355;t7=v7*355;t8=v8*355;t9=v9*355;t10=v10*355;t11=v11*355;t12=v12*355;t13=v13*355;t14=v14*355;t15=v15*355;
				t10+=v0<<8;t11+=v1<<8;t12+=v2<<8;t13+=v3<<8;t14+=v4<<8;t15+=v5<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;v15=(t15+(t14>>>16))&65535;v14=t14&65535;
				v0^=(c&63)|128;
			}
		}

		return hashValHex(hl[v15>>8]+hl[v15&255]+hl[v14>>8]+hl[v14&255]+hl[v13>>8]+hl[v13&255]+hl[v12>>8]+hl[v12&255]+hl[v11>>8]+hl[v11&255]+hl[v10>>8]+hl[v10&255]+hl[v9>>8]+hl[v9&255]+hl[v8>>8]+hl[v8&255]+hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],256);
	}

	_hash256 = _hash256_1a;

	function _hash512_1a(str){
		var i,l=str.length-3,s=fnvConstants[512].offset,t0=0,v0=s[31]|0,t1=0,v1=s[30]|0,t2=0,v2=s[29]|0,t3=0,v3=s[28]|0,t4=0,v4=s[27]|0,t5=0,v5=s[26]|0,t6=0,v6=s[25]|0,t7=0,v7=s[24]|0,t8=0,v8=s[23]|0,t9=0,v9=s[22]|0,t10=0,v10=s[21]|0,t11=0,v11=s[20]|0,t12=0,v12=s[19]|0,t13=0,v13=s[18]|0,t14=0,v14=s[17]|0,t15=0,v15=s[16]|0,t16=0,v16=s[15]|0,t17=0,v17=s[14]|0,t18=0,v18=s[13]|0,t19=0,v19=s[12]|0,t20=0,v20=s[11]|0,t21=0,v21=s[10]|0,t22=0,v22=s[9]|0,t23=0,v23=s[8]|0,t24=0,v24=s[7]|0,t25=0,v25=s[6]|0,t26=0,v26=s[5]|0,t27=0,v27=s[4]|0,t28=0,v28=s[3]|0,t29=0,v29=s[2]|0,t30=0,v30=s[1]|0,t31=0,v31=s[0]|0;

		for (i = 0; i < l;) {
			v0^=str.charCodeAt(i++);
			t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
			t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
			t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
			t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
			t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
		}

		while(i<l+3){
			v0^=str.charCodeAt(i++);
			t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
			t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
		}

		return hashValHex(hl[v31>>8]+hl[v31&255]+hl[v30>>8]+hl[v30&255]+hl[v29>>8]+hl[v29&255]+hl[v28>>8]+hl[v28&255]+hl[v27>>8]+hl[v27&255]+hl[v26>>8]+hl[v26&255]+hl[v25>>8]+hl[v25&255]+hl[v24>>8]+hl[v24&255]+hl[v23>>8]+hl[v23&255]+hl[v22>>8]+hl[v22&255]+hl[v21>>8]+hl[v21&255]+hl[v20>>8]+hl[v20&255]+hl[v19>>8]+hl[v19&255]+hl[v18>>8]+hl[v18&255]+hl[v17>>8]+hl[v17&255]+hl[v16>>8]+hl[v16&255]+hl[v15>>8]+hl[v15&255]+hl[v14>>8]+hl[v14&255]+hl[v13>>8]+hl[v13&255]+hl[v12>>8]+hl[v12&255]+hl[v11>>8]+hl[v11&255]+hl[v10>>8]+hl[v10&255]+hl[v9>>8]+hl[v9&255]+hl[v8>>8]+hl[v8&255]+hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],512);
	}

	function _hash512_1(str){
		var i,l=str.length-3,s=fnvConstants[512].offset,t0=0,v0=s[31]|0,t1=0,v1=s[30]|0,t2=0,v2=s[29]|0,t3=0,v3=s[28]|0,t4=0,v4=s[27]|0,t5=0,v5=s[26]|0,t6=0,v6=s[25]|0,t7=0,v7=s[24]|0,t8=0,v8=s[23]|0,t9=0,v9=s[22]|0,t10=0,v10=s[21]|0,t11=0,v11=s[20]|0,t12=0,v12=s[19]|0,t13=0,v13=s[18]|0,t14=0,v14=s[17]|0,t15=0,v15=s[16]|0,t16=0,v16=s[15]|0,t17=0,v17=s[14]|0,t18=0,v18=s[13]|0,t19=0,v19=s[12]|0,t20=0,v20=s[11]|0,t21=0,v21=s[10]|0,t22=0,v22=s[9]|0,t23=0,v23=s[8]|0,t24=0,v24=s[7]|0,t25=0,v25=s[6]|0,t26=0,v26=s[5]|0,t27=0,v27=s[4]|0,t28=0,v28=s[3]|0,t29=0,v29=s[2]|0,t30=0,v30=s[1]|0,t31=0,v31=s[0]|0;

		for (i = 0; i < l;) {
			t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
			t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
			t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
			t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
			t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
			v0^=str.charCodeAt(i++);
		}

		while(i<l+3){
			t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
			t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
			v0^=str.charCodeAt(i++);
		}

		return hashValHex(hl[v31>>8]+hl[v31&255]+hl[v30>>8]+hl[v30&255]+hl[v29>>8]+hl[v29&255]+hl[v28>>8]+hl[v28&255]+hl[v27>>8]+hl[v27&255]+hl[v26>>8]+hl[v26&255]+hl[v25>>8]+hl[v25&255]+hl[v24>>8]+hl[v24&255]+hl[v23>>8]+hl[v23&255]+hl[v22>>8]+hl[v22&255]+hl[v21>>8]+hl[v21&255]+hl[v20>>8]+hl[v20&255]+hl[v19>>8]+hl[v19&255]+hl[v18>>8]+hl[v18&255]+hl[v17>>8]+hl[v17&255]+hl[v16>>8]+hl[v16&255]+hl[v15>>8]+hl[v15&255]+hl[v14>>8]+hl[v14&255]+hl[v13>>8]+hl[v13&255]+hl[v12>>8]+hl[v12&255]+hl[v11>>8]+hl[v11&255]+hl[v10>>8]+hl[v10&255]+hl[v9>>8]+hl[v9&255]+hl[v8>>8]+hl[v8&255]+hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],512);
	}

	function _hash512_1a_utf(str){
		var c,i,l=str.length,s=fnvConstants[512].offset,t0=0,v0=s[31]|0,t1=0,v1=s[30]|0,t2=0,v2=s[29]|0,t3=0,v3=s[28]|0,t4=0,v4=s[27]|0,t5=0,v5=s[26]|0,t6=0,v6=s[25]|0,t7=0,v7=s[24]|0,t8=0,v8=s[23]|0,t9=0,v9=s[22]|0,t10=0,v10=s[21]|0,t11=0,v11=s[20]|0,t12=0,v12=s[19]|0,t13=0,v13=s[18]|0,t14=0,v14=s[17]|0,t15=0,v15=s[16]|0,t16=0,v16=s[15]|0,t17=0,v17=s[14]|0,t18=0,v18=s[13]|0,t19=0,v19=s[12]|0,t20=0,v20=s[11]|0,t21=0,v21=s[10]|0,t22=0,v22=s[9]|0,t23=0,v23=s[8]|0,t24=0,v24=s[7]|0,t25=0,v25=s[6]|0,t26=0,v26=s[5]|0,t27=0,v27=s[4]|0,t28=0,v28=s[3]|0,t29=0,v29=s[2]|0,t30=0,v30=s[1]|0,t31=0,v31=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
				t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
				t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
				t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
				t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
				t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
				t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
				v0^=(c&63)|128;
			}
			t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
			t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
		}

		return hashValHex(hl[v31>>8]+hl[v31&255]+hl[v30>>8]+hl[v30&255]+hl[v29>>8]+hl[v29&255]+hl[v28>>8]+hl[v28&255]+hl[v27>>8]+hl[v27&255]+hl[v26>>8]+hl[v26&255]+hl[v25>>8]+hl[v25&255]+hl[v24>>8]+hl[v24&255]+hl[v23>>8]+hl[v23&255]+hl[v22>>8]+hl[v22&255]+hl[v21>>8]+hl[v21&255]+hl[v20>>8]+hl[v20&255]+hl[v19>>8]+hl[v19&255]+hl[v18>>8]+hl[v18&255]+hl[v17>>8]+hl[v17&255]+hl[v16>>8]+hl[v16&255]+hl[v15>>8]+hl[v15&255]+hl[v14>>8]+hl[v14&255]+hl[v13>>8]+hl[v13&255]+hl[v12>>8]+hl[v12&255]+hl[v11>>8]+hl[v11&255]+hl[v10>>8]+hl[v10&255]+hl[v9>>8]+hl[v9&255]+hl[v8>>8]+hl[v8&255]+hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],512);
	}

	function _hash512_1_utf(str){
		var c,i,l=str.length,s=fnvConstants[512].offset,t0=0,v0=s[31]|0,t1=0,v1=s[30]|0,t2=0,v2=s[29]|0,t3=0,v3=s[28]|0,t4=0,v4=s[27]|0,t5=0,v5=s[26]|0,t6=0,v6=s[25]|0,t7=0,v7=s[24]|0,t8=0,v8=s[23]|0,t9=0,v9=s[22]|0,t10=0,v10=s[21]|0,t11=0,v11=s[20]|0,t12=0,v12=s[19]|0,t13=0,v13=s[18]|0,t14=0,v14=s[17]|0,t15=0,v15=s[16]|0,t16=0,v16=s[15]|0,t17=0,v17=s[14]|0,t18=0,v18=s[13]|0,t19=0,v19=s[12]|0,t20=0,v20=s[11]|0,t21=0,v21=s[10]|0,t22=0,v22=s[9]|0,t23=0,v23=s[8]|0,t24=0,v24=s[7]|0,t25=0,v25=s[6]|0,t26=0,v26=s[5]|0,t27=0,v27=s[4]|0,t28=0,v28=s[3]|0,t29=0,v29=s[2]|0,t30=0,v30=s[1]|0,t31=0,v31=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
			t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
				t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
				t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
				t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
				t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
				t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*343;t1=v1*343;t2=v2*343;t3=v3*343;t4=v4*343;t5=v5*343;t6=v6*343;t7=v7*343;t8=v8*343;t9=v9*343;t10=v10*343;t11=v11*343;t12=v12*343;t13=v13*343;t14=v14*343;t15=v15*343;t16=v16*343;t17=v17*343;t18=v18*343;t19=v19*343;t20=v20*343;t21=v21*343;t22=v22*343;t23=v23*343;t24=v24*343;t25=v25*343;t26=v26*343;t27=v27*343;t28=v28*343;t29=v29*343;t30=v30*343;t31=v31*343;
				t21+=v0<<8;t22+=v1<<8;t23+=v2<<8;t24+=v3<<8;t25+=v4<<8;t26+=v5<<8;t27+=v6<<8;t28+=v7<<8;t29+=v8<<8;t30+=v9<<8;t31+=v10<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;v31=(t31+(t30>>>16))&65535;v30=t30&65535;
				v0^=(c&63)|128;
			}
		}

		return hashValHex(hl[v31>>8]+hl[v31&255]+hl[v30>>8]+hl[v30&255]+hl[v29>>8]+hl[v29&255]+hl[v28>>8]+hl[v28&255]+hl[v27>>8]+hl[v27&255]+hl[v26>>8]+hl[v26&255]+hl[v25>>8]+hl[v25&255]+hl[v24>>8]+hl[v24&255]+hl[v23>>8]+hl[v23&255]+hl[v22>>8]+hl[v22&255]+hl[v21>>8]+hl[v21&255]+hl[v20>>8]+hl[v20&255]+hl[v19>>8]+hl[v19&255]+hl[v18>>8]+hl[v18&255]+hl[v17>>8]+hl[v17&255]+hl[v16>>8]+hl[v16&255]+hl[v15>>8]+hl[v15&255]+hl[v14>>8]+hl[v14&255]+hl[v13>>8]+hl[v13&255]+hl[v12>>8]+hl[v12&255]+hl[v11>>8]+hl[v11&255]+hl[v10>>8]+hl[v10&255]+hl[v9>>8]+hl[v9&255]+hl[v8>>8]+hl[v8&255]+hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],512);
	}

	_hash512 = _hash512_1a;

	function _hash1024_1a(str){
		var i,l=str.length-3,s=fnvConstants[1024].offset,t0=0,v0=s[63]|0,t1=0,v1=s[62]|0,t2=0,v2=s[61]|0,t3=0,v3=s[60]|0,t4=0,v4=s[59]|0,t5=0,v5=s[58]|0,t6=0,v6=s[57]|0,t7=0,v7=s[56]|0,t8=0,v8=s[55]|0,t9=0,v9=s[54]|0,t10=0,v10=s[53]|0,t11=0,v11=s[52]|0,t12=0,v12=s[51]|0,t13=0,v13=s[50]|0,t14=0,v14=s[49]|0,t15=0,v15=s[48]|0,t16=0,v16=s[47]|0,t17=0,v17=s[46]|0,t18=0,v18=s[45]|0,t19=0,v19=s[44]|0,t20=0,v20=s[43]|0,t21=0,v21=s[42]|0,t22=0,v22=s[41]|0,t23=0,v23=s[40]|0,t24=0,v24=s[39]|0,t25=0,v25=s[38]|0,t26=0,v26=s[37]|0,t27=0,v27=s[36]|0,t28=0,v28=s[35]|0,t29=0,v29=s[34]|0,t30=0,v30=s[33]|0,t31=0,v31=s[32]|0,t32=0,v32=s[31]|0,t33=0,v33=s[30]|0,t34=0,v34=s[29]|0,t35=0,v35=s[28]|0,t36=0,v36=s[27]|0,t37=0,v37=s[26]|0,t38=0,v38=s[25]|0,t39=0,v39=s[24]|0,t40=0,v40=s[23]|0,t41=0,v41=s[22]|0,t42=0,v42=s[21]|0,t43=0,v43=s[20]|0,t44=0,v44=s[19]|0,t45=0,v45=s[18]|0,t46=0,v46=s[17]|0,t47=0,v47=s[16]|0,t48=0,v48=s[15]|0,t49=0,v49=s[14]|0,t50=0,v50=s[13]|0,t51=0,v51=s[12]|0,t52=0,v52=s[11]|0,t53=0,v53=s[10]|0,t54=0,v54=s[9]|0,t55=0,v55=s[8]|0,t56=0,v56=s[7]|0,t57=0,v57=s[6]|0,t58=0,v58=s[5]|0,t59=0,v59=s[4]|0,t60=0,v60=s[3]|0,t61=0,v61=s[2]|0,t62=0,v62=s[1]|0,t63=0,v63=s[0]|0;

		for (i = 0; i < l;) {
			v0^=str.charCodeAt(i++);
			t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
			t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
			t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
			t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
			t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
		}

		while(i<l+3){
			v0^=str.charCodeAt(i++);
			t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
			t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
		}

		return hashValHex(hl[v63>>8]+hl[v63&255]+hl[v62>>8]+hl[v62&255]+hl[v61>>8]+hl[v61&255]+hl[v60>>8]+hl[v60&255]+hl[v59>>8]+hl[v59&255]+hl[v58>>8]+hl[v58&255]+hl[v57>>8]+hl[v57&255]+hl[v56>>8]+hl[v56&255]+hl[v55>>8]+hl[v55&255]+hl[v54>>8]+hl[v54&255]+hl[v53>>8]+hl[v53&255]+hl[v52>>8]+hl[v52&255]+hl[v51>>8]+hl[v51&255]+hl[v50>>8]+hl[v50&255]+hl[v49>>8]+hl[v49&255]+hl[v48>>8]+hl[v48&255]+hl[v47>>8]+hl[v47&255]+hl[v46>>8]+hl[v46&255]+hl[v45>>8]+hl[v45&255]+hl[v44>>8]+hl[v44&255]+hl[v43>>8]+hl[v43&255]+hl[v42>>8]+hl[v42&255]+hl[v41>>8]+hl[v41&255]+hl[v40>>8]+hl[v40&255]+hl[v39>>8]+hl[v39&255]+hl[v38>>8]+hl[v38&255]+hl[v37>>8]+hl[v37&255]+hl[v36>>8]+hl[v36&255]+hl[v35>>8]+hl[v35&255]+hl[v34>>8]+hl[v34&255]+hl[v33>>8]+hl[v33&255]+hl[v32>>8]+hl[v32&255]+hl[v31>>8]+hl[v31&255]+hl[v30>>8]+hl[v30&255]+hl[v29>>8]+hl[v29&255]+hl[v28>>8]+hl[v28&255]+hl[v27>>8]+hl[v27&255]+hl[v26>>8]+hl[v26&255]+hl[v25>>8]+hl[v25&255]+hl[v24>>8]+hl[v24&255]+hl[v23>>8]+hl[v23&255]+hl[v22>>8]+hl[v22&255]+hl[v21>>8]+hl[v21&255]+hl[v20>>8]+hl[v20&255]+hl[v19>>8]+hl[v19&255]+hl[v18>>8]+hl[v18&255]+hl[v17>>8]+hl[v17&255]+hl[v16>>8]+hl[v16&255]+hl[v15>>8]+hl[v15&255]+hl[v14>>8]+hl[v14&255]+hl[v13>>8]+hl[v13&255]+hl[v12>>8]+hl[v12&255]+hl[v11>>8]+hl[v11&255]+hl[v10>>8]+hl[v10&255]+hl[v9>>8]+hl[v9&255]+hl[v8>>8]+hl[v8&255]+hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],1024);
	}

	function _hash1024_1(str){
		var i,l=str.length-3,s=fnvConstants[1024].offset,t0=0,v0=s[63]|0,t1=0,v1=s[62]|0,t2=0,v2=s[61]|0,t3=0,v3=s[60]|0,t4=0,v4=s[59]|0,t5=0,v5=s[58]|0,t6=0,v6=s[57]|0,t7=0,v7=s[56]|0,t8=0,v8=s[55]|0,t9=0,v9=s[54]|0,t10=0,v10=s[53]|0,t11=0,v11=s[52]|0,t12=0,v12=s[51]|0,t13=0,v13=s[50]|0,t14=0,v14=s[49]|0,t15=0,v15=s[48]|0,t16=0,v16=s[47]|0,t17=0,v17=s[46]|0,t18=0,v18=s[45]|0,t19=0,v19=s[44]|0,t20=0,v20=s[43]|0,t21=0,v21=s[42]|0,t22=0,v22=s[41]|0,t23=0,v23=s[40]|0,t24=0,v24=s[39]|0,t25=0,v25=s[38]|0,t26=0,v26=s[37]|0,t27=0,v27=s[36]|0,t28=0,v28=s[35]|0,t29=0,v29=s[34]|0,t30=0,v30=s[33]|0,t31=0,v31=s[32]|0,t32=0,v32=s[31]|0,t33=0,v33=s[30]|0,t34=0,v34=s[29]|0,t35=0,v35=s[28]|0,t36=0,v36=s[27]|0,t37=0,v37=s[26]|0,t38=0,v38=s[25]|0,t39=0,v39=s[24]|0,t40=0,v40=s[23]|0,t41=0,v41=s[22]|0,t42=0,v42=s[21]|0,t43=0,v43=s[20]|0,t44=0,v44=s[19]|0,t45=0,v45=s[18]|0,t46=0,v46=s[17]|0,t47=0,v47=s[16]|0,t48=0,v48=s[15]|0,t49=0,v49=s[14]|0,t50=0,v50=s[13]|0,t51=0,v51=s[12]|0,t52=0,v52=s[11]|0,t53=0,v53=s[10]|0,t54=0,v54=s[9]|0,t55=0,v55=s[8]|0,t56=0,v56=s[7]|0,t57=0,v57=s[6]|0,t58=0,v58=s[5]|0,t59=0,v59=s[4]|0,t60=0,v60=s[3]|0,t61=0,v61=s[2]|0,t62=0,v62=s[1]|0,t63=0,v63=s[0]|0;

		for (i = 0; i < l;) {
			t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
			t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
			t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
			t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
			t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
			v0^=str.charCodeAt(i++);
		}

		while(i<l+3){
			t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
			t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
			v0^=str.charCodeAt(i++);
		}

		return hashValHex(hl[v63>>8]+hl[v63&255]+hl[v62>>8]+hl[v62&255]+hl[v61>>8]+hl[v61&255]+hl[v60>>8]+hl[v60&255]+hl[v59>>8]+hl[v59&255]+hl[v58>>8]+hl[v58&255]+hl[v57>>8]+hl[v57&255]+hl[v56>>8]+hl[v56&255]+hl[v55>>8]+hl[v55&255]+hl[v54>>8]+hl[v54&255]+hl[v53>>8]+hl[v53&255]+hl[v52>>8]+hl[v52&255]+hl[v51>>8]+hl[v51&255]+hl[v50>>8]+hl[v50&255]+hl[v49>>8]+hl[v49&255]+hl[v48>>8]+hl[v48&255]+hl[v47>>8]+hl[v47&255]+hl[v46>>8]+hl[v46&255]+hl[v45>>8]+hl[v45&255]+hl[v44>>8]+hl[v44&255]+hl[v43>>8]+hl[v43&255]+hl[v42>>8]+hl[v42&255]+hl[v41>>8]+hl[v41&255]+hl[v40>>8]+hl[v40&255]+hl[v39>>8]+hl[v39&255]+hl[v38>>8]+hl[v38&255]+hl[v37>>8]+hl[v37&255]+hl[v36>>8]+hl[v36&255]+hl[v35>>8]+hl[v35&255]+hl[v34>>8]+hl[v34&255]+hl[v33>>8]+hl[v33&255]+hl[v32>>8]+hl[v32&255]+hl[v31>>8]+hl[v31&255]+hl[v30>>8]+hl[v30&255]+hl[v29>>8]+hl[v29&255]+hl[v28>>8]+hl[v28&255]+hl[v27>>8]+hl[v27&255]+hl[v26>>8]+hl[v26&255]+hl[v25>>8]+hl[v25&255]+hl[v24>>8]+hl[v24&255]+hl[v23>>8]+hl[v23&255]+hl[v22>>8]+hl[v22&255]+hl[v21>>8]+hl[v21&255]+hl[v20>>8]+hl[v20&255]+hl[v19>>8]+hl[v19&255]+hl[v18>>8]+hl[v18&255]+hl[v17>>8]+hl[v17&255]+hl[v16>>8]+hl[v16&255]+hl[v15>>8]+hl[v15&255]+hl[v14>>8]+hl[v14&255]+hl[v13>>8]+hl[v13&255]+hl[v12>>8]+hl[v12&255]+hl[v11>>8]+hl[v11&255]+hl[v10>>8]+hl[v10&255]+hl[v9>>8]+hl[v9&255]+hl[v8>>8]+hl[v8&255]+hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],1024);
	}

	function _hash1024_1a_utf(str){
		var c,i,l=str.length,s=fnvConstants[1024].offset,t0=0,v0=s[63]|0,t1=0,v1=s[62]|0,t2=0,v2=s[61]|0,t3=0,v3=s[60]|0,t4=0,v4=s[59]|0,t5=0,v5=s[58]|0,t6=0,v6=s[57]|0,t7=0,v7=s[56]|0,t8=0,v8=s[55]|0,t9=0,v9=s[54]|0,t10=0,v10=s[53]|0,t11=0,v11=s[52]|0,t12=0,v12=s[51]|0,t13=0,v13=s[50]|0,t14=0,v14=s[49]|0,t15=0,v15=s[48]|0,t16=0,v16=s[47]|0,t17=0,v17=s[46]|0,t18=0,v18=s[45]|0,t19=0,v19=s[44]|0,t20=0,v20=s[43]|0,t21=0,v21=s[42]|0,t22=0,v22=s[41]|0,t23=0,v23=s[40]|0,t24=0,v24=s[39]|0,t25=0,v25=s[38]|0,t26=0,v26=s[37]|0,t27=0,v27=s[36]|0,t28=0,v28=s[35]|0,t29=0,v29=s[34]|0,t30=0,v30=s[33]|0,t31=0,v31=s[32]|0,t32=0,v32=s[31]|0,t33=0,v33=s[30]|0,t34=0,v34=s[29]|0,t35=0,v35=s[28]|0,t36=0,v36=s[27]|0,t37=0,v37=s[26]|0,t38=0,v38=s[25]|0,t39=0,v39=s[24]|0,t40=0,v40=s[23]|0,t41=0,v41=s[22]|0,t42=0,v42=s[21]|0,t43=0,v43=s[20]|0,t44=0,v44=s[19]|0,t45=0,v45=s[18]|0,t46=0,v46=s[17]|0,t47=0,v47=s[16]|0,t48=0,v48=s[15]|0,t49=0,v49=s[14]|0,t50=0,v50=s[13]|0,t51=0,v51=s[12]|0,t52=0,v52=s[11]|0,t53=0,v53=s[10]|0,t54=0,v54=s[9]|0,t55=0,v55=s[8]|0,t56=0,v56=s[7]|0,t57=0,v57=s[6]|0,t58=0,v58=s[5]|0,t59=0,v59=s[4]|0,t60=0,v60=s[3]|0,t61=0,v61=s[2]|0,t62=0,v62=s[1]|0,t63=0,v63=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
				t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
				t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
				t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
				t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
				t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
				t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
				v0^=(c&63)|128;
			}
			t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
			t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
		}

		return hashValHex(hl[v63>>8]+hl[v63&255]+hl[v62>>8]+hl[v62&255]+hl[v61>>8]+hl[v61&255]+hl[v60>>8]+hl[v60&255]+hl[v59>>8]+hl[v59&255]+hl[v58>>8]+hl[v58&255]+hl[v57>>8]+hl[v57&255]+hl[v56>>8]+hl[v56&255]+hl[v55>>8]+hl[v55&255]+hl[v54>>8]+hl[v54&255]+hl[v53>>8]+hl[v53&255]+hl[v52>>8]+hl[v52&255]+hl[v51>>8]+hl[v51&255]+hl[v50>>8]+hl[v50&255]+hl[v49>>8]+hl[v49&255]+hl[v48>>8]+hl[v48&255]+hl[v47>>8]+hl[v47&255]+hl[v46>>8]+hl[v46&255]+hl[v45>>8]+hl[v45&255]+hl[v44>>8]+hl[v44&255]+hl[v43>>8]+hl[v43&255]+hl[v42>>8]+hl[v42&255]+hl[v41>>8]+hl[v41&255]+hl[v40>>8]+hl[v40&255]+hl[v39>>8]+hl[v39&255]+hl[v38>>8]+hl[v38&255]+hl[v37>>8]+hl[v37&255]+hl[v36>>8]+hl[v36&255]+hl[v35>>8]+hl[v35&255]+hl[v34>>8]+hl[v34&255]+hl[v33>>8]+hl[v33&255]+hl[v32>>8]+hl[v32&255]+hl[v31>>8]+hl[v31&255]+hl[v30>>8]+hl[v30&255]+hl[v29>>8]+hl[v29&255]+hl[v28>>8]+hl[v28&255]+hl[v27>>8]+hl[v27&255]+hl[v26>>8]+hl[v26&255]+hl[v25>>8]+hl[v25&255]+hl[v24>>8]+hl[v24&255]+hl[v23>>8]+hl[v23&255]+hl[v22>>8]+hl[v22&255]+hl[v21>>8]+hl[v21&255]+hl[v20>>8]+hl[v20&255]+hl[v19>>8]+hl[v19&255]+hl[v18>>8]+hl[v18&255]+hl[v17>>8]+hl[v17&255]+hl[v16>>8]+hl[v16&255]+hl[v15>>8]+hl[v15&255]+hl[v14>>8]+hl[v14&255]+hl[v13>>8]+hl[v13&255]+hl[v12>>8]+hl[v12&255]+hl[v11>>8]+hl[v11&255]+hl[v10>>8]+hl[v10&255]+hl[v9>>8]+hl[v9&255]+hl[v8>>8]+hl[v8&255]+hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],1024);
	}

	function _hash1024_1_utf(str){
		var c,i,l=str.length,s=fnvConstants[1024].offset,t0=0,v0=s[63]|0,t1=0,v1=s[62]|0,t2=0,v2=s[61]|0,t3=0,v3=s[60]|0,t4=0,v4=s[59]|0,t5=0,v5=s[58]|0,t6=0,v6=s[57]|0,t7=0,v7=s[56]|0,t8=0,v8=s[55]|0,t9=0,v9=s[54]|0,t10=0,v10=s[53]|0,t11=0,v11=s[52]|0,t12=0,v12=s[51]|0,t13=0,v13=s[50]|0,t14=0,v14=s[49]|0,t15=0,v15=s[48]|0,t16=0,v16=s[47]|0,t17=0,v17=s[46]|0,t18=0,v18=s[45]|0,t19=0,v19=s[44]|0,t20=0,v20=s[43]|0,t21=0,v21=s[42]|0,t22=0,v22=s[41]|0,t23=0,v23=s[40]|0,t24=0,v24=s[39]|0,t25=0,v25=s[38]|0,t26=0,v26=s[37]|0,t27=0,v27=s[36]|0,t28=0,v28=s[35]|0,t29=0,v29=s[34]|0,t30=0,v30=s[33]|0,t31=0,v31=s[32]|0,t32=0,v32=s[31]|0,t33=0,v33=s[30]|0,t34=0,v34=s[29]|0,t35=0,v35=s[28]|0,t36=0,v36=s[27]|0,t37=0,v37=s[26]|0,t38=0,v38=s[25]|0,t39=0,v39=s[24]|0,t40=0,v40=s[23]|0,t41=0,v41=s[22]|0,t42=0,v42=s[21]|0,t43=0,v43=s[20]|0,t44=0,v44=s[19]|0,t45=0,v45=s[18]|0,t46=0,v46=s[17]|0,t47=0,v47=s[16]|0,t48=0,v48=s[15]|0,t49=0,v49=s[14]|0,t50=0,v50=s[13]|0,t51=0,v51=s[12]|0,t52=0,v52=s[11]|0,t53=0,v53=s[10]|0,t54=0,v54=s[9]|0,t55=0,v55=s[8]|0,t56=0,v56=s[7]|0,t57=0,v57=s[6]|0,t58=0,v58=s[5]|0,t59=0,v59=s[4]|0,t60=0,v60=s[3]|0,t61=0,v61=s[2]|0,t62=0,v62=s[1]|0,t63=0,v63=s[0]|0;

		for (i = 0; i < l; i++) {
			c = str.charCodeAt(i);
			t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
			t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
			if(c < 128){
				v0^=c;
			}else if(c < 2048){
				v0^=(c>>6)|192;
				t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
				t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
				v0^=(c&63)|128;
			}else if(((c&64512)==55296)&&(i+1)<l&&((str.charCodeAt(i+1)&64512)==56320)){
				c=65536+((c&1023)<<10)+(str.charCodeAt(++i)&1023);
				v0^=(c>>18)|240;
				t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
				t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
				v0^=((c>>12)&63)|128;
				t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
				t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
				t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
				v0^=(c&63)|128;
			}else{
				v0^=(c>>12)|224;
				t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
				t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
				v0^=((c>>6)&63)|128;
				t0=v0*397;t1=v1*397;t2=v2*397;t3=v3*397;t4=v4*397;t5=v5*397;t6=v6*397;t7=v7*397;t8=v8*397;t9=v9*397;t10=v10*397;t11=v11*397;t12=v12*397;t13=v13*397;t14=v14*397;t15=v15*397;t16=v16*397;t17=v17*397;t18=v18*397;t19=v19*397;t20=v20*397;t21=v21*397;t22=v22*397;t23=v23*397;t24=v24*397;t25=v25*397;t26=v26*397;t27=v27*397;t28=v28*397;t29=v29*397;t30=v30*397;t31=v31*397;t32=v32*397;t33=v33*397;t34=v34*397;t35=v35*397;t36=v36*397;t37=v37*397;t38=v38*397;t39=v39*397;t40=v40*397;t41=v41*397;t42=v42*397;t43=v43*397;t44=v44*397;t45=v45*397;t46=v46*397;t47=v47*397;t48=v48*397;t49=v49*397;t50=v50*397;t51=v51*397;t52=v52*397;t53=v53*397;t54=v54*397;t55=v55*397;t56=v56*397;t57=v57*397;t58=v58*397;t59=v59*397;t60=v60*397;t61=v61*397;t62=v62*397;t63=v63*397;
				t42+=v0<<8;t43+=v1<<8;t44+=v2<<8;t45+=v3<<8;t46+=v4<<8;t47+=v5<<8;t48+=v6<<8;t49+=v7<<8;t50+=v8<<8;t51+=v9<<8;t52+=v10<<8;t53+=v11<<8;t54+=v12<<8;t55+=v13<<8;t56+=v14<<8;t57+=v15<<8;t58+=v16<<8;t59+=v17<<8;t60+=v18<<8;t61+=v19<<8;t62+=v20<<8;t63+=v21<<8;
				t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;t3+=t2>>>16;v2=t2&65535;t4+=t3>>>16;v3=t3&65535;t5+=t4>>>16;v4=t4&65535;t6+=t5>>>16;v5=t5&65535;t7+=t6>>>16;v6=t6&65535;t8+=t7>>>16;v7=t7&65535;t9+=t8>>>16;v8=t8&65535;t10+=t9>>>16;v9=t9&65535;t11+=t10>>>16;v10=t10&65535;t12+=t11>>>16;v11=t11&65535;t13+=t12>>>16;v12=t12&65535;t14+=t13>>>16;v13=t13&65535;t15+=t14>>>16;v14=t14&65535;t16+=t15>>>16;v15=t15&65535;t17+=t16>>>16;v16=t16&65535;t18+=t17>>>16;v17=t17&65535;t19+=t18>>>16;v18=t18&65535;t20+=t19>>>16;v19=t19&65535;t21+=t20>>>16;v20=t20&65535;t22+=t21>>>16;v21=t21&65535;t23+=t22>>>16;v22=t22&65535;t24+=t23>>>16;v23=t23&65535;t25+=t24>>>16;v24=t24&65535;t26+=t25>>>16;v25=t25&65535;t27+=t26>>>16;v26=t26&65535;t28+=t27>>>16;v27=t27&65535;t29+=t28>>>16;v28=t28&65535;t30+=t29>>>16;v29=t29&65535;t31+=t30>>>16;v30=t30&65535;t32+=t31>>>16;v31=t31&65535;t33+=t32>>>16;v32=t32&65535;t34+=t33>>>16;v33=t33&65535;t35+=t34>>>16;v34=t34&65535;t36+=t35>>>16;v35=t35&65535;t37+=t36>>>16;v36=t36&65535;t38+=t37>>>16;v37=t37&65535;t39+=t38>>>16;v38=t38&65535;t40+=t39>>>16;v39=t39&65535;t41+=t40>>>16;v40=t40&65535;t42+=t41>>>16;v41=t41&65535;t43+=t42>>>16;v42=t42&65535;t44+=t43>>>16;v43=t43&65535;t45+=t44>>>16;v44=t44&65535;t46+=t45>>>16;v45=t45&65535;t47+=t46>>>16;v46=t46&65535;t48+=t47>>>16;v47=t47&65535;t49+=t48>>>16;v48=t48&65535;t50+=t49>>>16;v49=t49&65535;t51+=t50>>>16;v50=t50&65535;t52+=t51>>>16;v51=t51&65535;t53+=t52>>>16;v52=t52&65535;t54+=t53>>>16;v53=t53&65535;t55+=t54>>>16;v54=t54&65535;t56+=t55>>>16;v55=t55&65535;t57+=t56>>>16;v56=t56&65535;t58+=t57>>>16;v57=t57&65535;t59+=t58>>>16;v58=t58&65535;t60+=t59>>>16;v59=t59&65535;t61+=t60>>>16;v60=t60&65535;t62+=t61>>>16;v61=t61&65535;v63=(t63+(t62>>>16))&65535;v62=t62&65535;
				v0^=(c&63)|128;
			}
		}

		return hashValHex(hl[v63>>8]+hl[v63&255]+hl[v62>>8]+hl[v62&255]+hl[v61>>8]+hl[v61&255]+hl[v60>>8]+hl[v60&255]+hl[v59>>8]+hl[v59&255]+hl[v58>>8]+hl[v58&255]+hl[v57>>8]+hl[v57&255]+hl[v56>>8]+hl[v56&255]+hl[v55>>8]+hl[v55&255]+hl[v54>>8]+hl[v54&255]+hl[v53>>8]+hl[v53&255]+hl[v52>>8]+hl[v52&255]+hl[v51>>8]+hl[v51&255]+hl[v50>>8]+hl[v50&255]+hl[v49>>8]+hl[v49&255]+hl[v48>>8]+hl[v48&255]+hl[v47>>8]+hl[v47&255]+hl[v46>>8]+hl[v46&255]+hl[v45>>8]+hl[v45&255]+hl[v44>>8]+hl[v44&255]+hl[v43>>8]+hl[v43&255]+hl[v42>>8]+hl[v42&255]+hl[v41>>8]+hl[v41&255]+hl[v40>>8]+hl[v40&255]+hl[v39>>8]+hl[v39&255]+hl[v38>>8]+hl[v38&255]+hl[v37>>8]+hl[v37&255]+hl[v36>>8]+hl[v36&255]+hl[v35>>8]+hl[v35&255]+hl[v34>>8]+hl[v34&255]+hl[v33>>8]+hl[v33&255]+hl[v32>>8]+hl[v32&255]+hl[v31>>8]+hl[v31&255]+hl[v30>>8]+hl[v30&255]+hl[v29>>8]+hl[v29&255]+hl[v28>>8]+hl[v28&255]+hl[v27>>8]+hl[v27&255]+hl[v26>>8]+hl[v26&255]+hl[v25>>8]+hl[v25&255]+hl[v24>>8]+hl[v24&255]+hl[v23>>8]+hl[v23&255]+hl[v22>>8]+hl[v22&255]+hl[v21>>8]+hl[v21&255]+hl[v20>>8]+hl[v20&255]+hl[v19>>8]+hl[v19&255]+hl[v18>>8]+hl[v18&255]+hl[v17>>8]+hl[v17&255]+hl[v16>>8]+hl[v16&255]+hl[v15>>8]+hl[v15&255]+hl[v14>>8]+hl[v14&255]+hl[v13>>8]+hl[v13&255]+hl[v12>>8]+hl[v12&255]+hl[v11>>8]+hl[v11&255]+hl[v10>>8]+hl[v10&255]+hl[v9>>8]+hl[v9&255]+hl[v8>>8]+hl[v8&255]+hl[v7>>8]+hl[v7&255]+hl[v6>>8]+hl[v6&255]+hl[v5>>8]+hl[v5&255]+hl[v4>>8]+hl[v4&255]+hl[v3>>8]+hl[v3&255]+hl[v2>>8]+hl[v2&255]+hl[v1>>8]+hl[v1&255]+hl[v0>>8]+hl[v0&255],1024);
	}

	_hash1024 = _hash1024_1a;

	// Init library.
	setVersion('1a');
	setUTF8(false);
	seed();

	return {
		hash: hash,
		setKeyspace: setKeyspace,
		version: setVersion,
		useUTF8: setUTF8,
		seed: seed,
		fast1a32: _hash32_1a_fast,
		fast1a32hex:_hash32_1a_fast_hex,
		fast1a52: _hash52_1a_fast,
		fast1a52hex: _hash52_1a_fast_hex,
		fast1a64: _hash64_1a_fast,
		fast1a32utf: _hash32_1a_fast_utf,
		fast1a32hexutf:_hash32_1a_fast_hex_utf,
		fast1a52utf: _hash52_1a_fast_utf,
		fast1a52hexutf: _hash52_1a_fast_hex_utf,
		fast1a64utf: _hash64_1a_fast_utf
	};
})();
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = fnvplus;
(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.XRegExp = f();
  }
})(function () {
  var define, module, exports;
  return (function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw ((a.code = "MODULE_NOT_FOUND"), a);
          }
          var p = (n[i] = { exports: {} });
          e[i][0].call(
            p.exports,
            function (r) {
              var n = e[i][1][r];
              return o(n || r);
            },
            p,
            p.exports,
            r,
            e,
            n,
            t
          );
        }
        return n[i].exports;
      }
      for (
        var u = "function" == typeof require && require, i = 0;
        i < t.length;
        i++
      )
        o(t[i]);
      return o;
    }
    return r;
  })()(
    {
      1: [
        function (require, module, exports) {
          "use strict";

          var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

          var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

          _Object$defineProperty(exports, "__esModule", {
            value: true,
          });

          exports["default"] = void 0;

          var _reduce = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/instance/reduce")
          );

          var _map = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/instance/map")
          );

          var _indexOf = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/instance/index-of")
          );

          var _concat = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/instance/concat")
          );

          /*!
           * XRegExp.build 5.0.2
           * <xregexp.com>
           * Steven Levithan (c) 2012-present MIT License
           */
          var _default = function _default(XRegExp) {
            var REGEX_DATA = "xregexp";
            var subParts =
              /(\()(?!\?)|\\([1-9]\d*)|\\[\s\S]|\[(?:[^\\\]]|\\[\s\S])*\]/g;
            var parts = XRegExp.union(
              [/\({{([\w$]+)}}\)|{{([\w$]+)}}/, subParts],
              "g",
              {
                conjunction: "or",
              }
            );
            /**
             * Strips a leading `^` and trailing unescaped `$`, if both are present.
             *
             * @private
             * @param {String} pattern Pattern to process.
             * @returns {String} Pattern with edge anchors removed.
             */

            function deanchor(pattern) {
              // Allow any number of empty noncapturing groups before/after anchors, because regexes
              // built/generated by XRegExp sometimes include them
              var leadingAnchor = /^(?:\(\?:\))*\^/;
              var trailingAnchor = /\$(?:\(\?:\))*$/;

              if (
                leadingAnchor.test(pattern) &&
                trailingAnchor.test(pattern) && // Ensure that the trailing `$` isn't escaped
                trailingAnchor.test(pattern.replace(/\\[\s\S]/g, ""))
              ) {
                return pattern
                  .replace(leadingAnchor, "")
                  .replace(trailingAnchor, "");
              }

              return pattern;
            }
            /**
             * Converts the provided value to an XRegExp. Native RegExp flags are not preserved.
             *
             * @private
             * @param {String|RegExp} value Value to convert.
             * @param {Boolean} [addFlagX] Whether to apply the `x` flag in cases when `value` is not
             *   already a regex generated by XRegExp
             * @returns {RegExp} XRegExp object with XRegExp syntax applied.
             */

            function asXRegExp(value, addFlagX) {
              var flags = addFlagX ? "x" : "";
              return XRegExp.isRegExp(value)
                ? value[REGEX_DATA] && value[REGEX_DATA].captureNames // Don't recompile, to preserve capture names
                  ? value // Recompile as XRegExp
                  : XRegExp(value.source, flags) // Compile string as XRegExp
                : XRegExp(value, flags);
            }

            function interpolate(substitution) {
              return substitution instanceof RegExp
                ? substitution
                : XRegExp.escape(substitution);
            }

            function reduceToSubpatternsObject(
              subpatterns,
              interpolated,
              subpatternIndex
            ) {
              subpatterns["subpattern".concat(subpatternIndex)] = interpolated;
              return subpatterns;
            }

            function embedSubpatternAfter(raw, subpatternIndex, rawLiterals) {
              var hasSubpattern = subpatternIndex < rawLiterals.length - 1;
              return (
                raw +
                (hasSubpattern
                  ? "{{subpattern".concat(subpatternIndex, "}}")
                  : "")
              );
            }
            /**
             * Provides tagged template literals that create regexes with XRegExp syntax and flags. The
             * provided pattern is handled as a raw string, so backslashes don't need to be escaped.
             *
             * Interpolation of strings and regexes shares the features of `XRegExp.build`. Interpolated
             * patterns are treated as atomic units when quantified, interpolated strings have their special
             * characters escaped, a leading `^` and trailing unescaped `$` are stripped from interpolated
             * regexes if both are present, and any backreferences within an interpolated regex are
             * rewritten to work within the overall pattern.
             *
             * @memberOf XRegExp
             * @param {String} [flags] Any combination of XRegExp flags.
             * @returns {Function} Handler for template literals that construct regexes with XRegExp syntax.
             * @example
             *
             * XRegExp.tag()`\b\w+\b`.test('word'); // -> true
             *
             * const hours = /1[0-2]|0?[1-9]/;
             * const minutes = /(?<minutes>[0-5][0-9])/;
             * const time = XRegExp.tag('x')`\b ${hours} : ${minutes} \b`;
             * time.test('10:59'); // -> true
             * XRegExp.exec('10:59', time).groups.minutes; // -> '59'
             *
             * const backref1 = /(a)\1/;
             * const backref2 = /(b)\1/;
             * XRegExp.tag()`${backref1}${backref2}`.test('aabb'); // -> true
             */

            XRegExp.tag = function (flags) {
              return function (literals) {
                var _context, _context2;

                for (
                  var _len = arguments.length,
                    substitutions = new Array(_len > 1 ? _len - 1 : 0),
                    _key = 1;
                  _key < _len;
                  _key++
                ) {
                  substitutions[_key - 1] = arguments[_key];
                }

                var subpatterns = (0, _reduce["default"])(
                  (_context = (0, _map["default"])(substitutions).call(
                    substitutions,
                    interpolate
                  ))
                ).call(_context, reduceToSubpatternsObject, {});
                var pattern = (0, _map["default"])((_context2 = literals.raw))
                  .call(_context2, embedSubpatternAfter)
                  .join("");
                return XRegExp.build(pattern, subpatterns, flags);
              };
            };
            /**
             * Builds regexes using named subpatterns, for readability and pattern reuse. Backreferences in
             * the outer pattern and provided subpatterns are automatically renumbered to work correctly.
             * Native flags used by provided subpatterns are ignored in favor of the `flags` argument.
             *
             * @memberOf XRegExp
             * @param {String} pattern XRegExp pattern using `{{name}}` for embedded subpatterns. Allows
             *   `({{name}})` as shorthand for `(?<name>{{name}})`. Patterns cannot be embedded within
             *   character classes.
             * @param {Object} subs Lookup object for named subpatterns. Values can be strings or regexes. A
             *   leading `^` and trailing unescaped `$` are stripped from subpatterns, if both are present.
             * @param {String} [flags] Any combination of XRegExp flags.
             * @returns {RegExp} Regex with interpolated subpatterns.
             * @example
             *
             * const time = XRegExp.build('(?x)^ {{hours}} ({{minutes}}) $', {
             *   hours: XRegExp.build('{{h12}} : | {{h24}}', {
             *     h12: /1[0-2]|0?[1-9]/,
             *     h24: /2[0-3]|[01][0-9]/
             *   }, 'x'),
             *   minutes: /^[0-5][0-9]$/
             * });
             * time.test('10:59'); // -> true
             * XRegExp.exec('10:59', time).groups.minutes; // -> '59'
             */

            XRegExp.build = function (pattern, subs, flags) {
              flags = flags || ""; // Used with `asXRegExp` calls for `pattern` and subpatterns in `subs`, to work around how
              // some browsers convert `RegExp('\n')` to a regex that contains the literal characters `\`
              // and `n`. See more details at <https://github.com/slevithan/xregexp/pull/163>.

              var addFlagX =
                (0, _indexOf["default"])(flags).call(flags, "x") !== -1;
              var inlineFlags = /^\(\?([\w$]+)\)/.exec(pattern); // Add flags within a leading mode modifier to the overall pattern's flags

              if (inlineFlags) {
                flags = XRegExp._clipDuplicates(flags + inlineFlags[1]);
              }

              var data = {};

              for (var p in subs) {
                if (subs.hasOwnProperty(p)) {
                  // Passing to XRegExp enables extended syntax and ensures independent validity,
                  // lest an unescaped `(`, `)`, `[`, or trailing `\` breaks the `(?:)` wrapper. For
                  // subpatterns provided as native regexes, it dies on octals and adds the property
                  // used to hold extended regex instance data, for simplicity.
                  var sub = asXRegExp(subs[p], addFlagX);
                  data[p] = {
                    // Deanchoring allows embedding independently useful anchored regexes. If you
                    // really need to keep your anchors, double them (i.e., `^^...$$`).
                    pattern: deanchor(sub.source),
                    names: sub[REGEX_DATA].captureNames || [],
                  };
                }
              } // Passing to XRegExp dies on octals and ensures the outer pattern is independently valid;
              // helps keep this simple. Named captures will be put back.

              var patternAsRegex = asXRegExp(pattern, addFlagX); // 'Caps' is short for 'captures'

              var numCaps = 0;
              var numPriorCaps;
              var numOuterCaps = 0;
              var outerCapsMap = [0];
              var outerCapNames = patternAsRegex[REGEX_DATA].captureNames || [];
              var output = patternAsRegex.source.replace(
                parts,
                function ($0, $1, $2, $3, $4) {
                  var subName = $1 || $2;
                  var capName;
                  var intro;
                  var localCapIndex; // Named subpattern

                  if (subName) {
                    var _context3;

                    if (!data.hasOwnProperty(subName)) {
                      throw new ReferenceError(
                        "Undefined property ".concat($0)
                      );
                    } // Named subpattern was wrapped in a capturing group

                    if ($1) {
                      capName = outerCapNames[numOuterCaps];
                      outerCapsMap[++numOuterCaps] = ++numCaps; // If it's a named group, preserve the name. Otherwise, use the subpattern name
                      // as the capture name

                      intro = "(?<".concat(capName || subName, ">");
                    } else {
                      intro = "(?:";
                    }

                    numPriorCaps = numCaps;
                    var rewrittenSubpattern = data[subName].pattern.replace(
                      subParts,
                      function (match, paren, backref) {
                        // Capturing group
                        if (paren) {
                          capName = data[subName].names[numCaps - numPriorCaps];
                          ++numCaps; // If the current capture has a name, preserve the name

                          if (capName) {
                            return "(?<".concat(capName, ">");
                          } // Backreference
                        } else if (backref) {
                          localCapIndex = +backref - 1; // Rewrite the backreference

                          return data[subName].names[localCapIndex] // Need to preserve the backreference name in case using flag `n`
                            ? "\\k<".concat(
                                data[subName].names[localCapIndex],
                                ">"
                              )
                            : "\\".concat(+backref + numPriorCaps);
                        }

                        return match;
                      }
                    );
                    return (0, _concat["default"])(
                      (_context3 = "".concat(intro))
                    ).call(_context3, rewrittenSubpattern, ")");
                  } // Capturing group

                  if ($3) {
                    capName = outerCapNames[numOuterCaps];
                    outerCapsMap[++numOuterCaps] = ++numCaps; // If the current capture has a name, preserve the name

                    if (capName) {
                      return "(?<".concat(capName, ">");
                    } // Backreference
                  } else if ($4) {
                    localCapIndex = +$4 - 1; // Rewrite the backreference

                    return outerCapNames[localCapIndex] // Need to preserve the backreference name in case using flag `n`
                      ? "\\k<".concat(outerCapNames[localCapIndex], ">")
                      : "\\".concat(outerCapsMap[+$4]);
                  }

                  return $0;
                }
              );
              return XRegExp(output, flags);
            };
          };

          exports["default"] = _default;
          module.exports = exports.default;
        },
        {
          "@babel/runtime-corejs3/core-js-stable/instance/concat": 7,
          "@babel/runtime-corejs3/core-js-stable/instance/index-of": 10,
          "@babel/runtime-corejs3/core-js-stable/instance/map": 11,
          "@babel/runtime-corejs3/core-js-stable/instance/reduce": 12,
          "@babel/runtime-corejs3/core-js-stable/object/define-property": 16,
          "@babel/runtime-corejs3/helpers/interopRequireDefault": 28,
        },
      ],
      2: [
        function (require, module, exports) {
          "use strict";

          var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

          var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

          _Object$defineProperty(exports, "__esModule", {
            value: true,
          });

          exports["default"] = void 0;

          var _indexOf = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/instance/index-of")
          );

          var _concat = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/instance/concat")
          );

          var _slice = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/instance/slice")
          );

          /*!
           * XRegExp.matchRecursive 5.0.2
           * <xregexp.com>
           * Steven Levithan (c) 2009-present MIT License
           */
          var _default = function _default(XRegExp) {
            /**
             * Returns a match detail object composed of the provided values.
             *
             * @private
             */
            function row(name, value, start, end) {
              return {
                name: name,
                value: value,
                start: start,
                end: end,
              };
            }
            /**
             * Returns an array of match strings between outermost left and right delimiters, or an array of
             * objects with detailed match parts and position data. An error is thrown if delimiters are
             * unbalanced within the data.
             *
             * @memberOf XRegExp
             * @param {String} str String to search.
             * @param {String} left Left delimiter as an XRegExp pattern.
             * @param {String} right Right delimiter as an XRegExp pattern.
             * @param {String} [flags] Any combination of XRegExp flags, used for the left and right delimiters.
             * @param {Object} [options] Lets you specify `valueNames` and `escapeChar` options.
             * @returns {!Array} Array of matches, or an empty array.
             * @example
             *
             * // Basic usage
             * let str = '(t((e))s)t()(ing)';
             * XRegExp.matchRecursive(str, '\\(', '\\)', 'g');
             * // -> ['t((e))s', '', 'ing']
             *
             * // Extended information mode with valueNames
             * str = 'Here is <div> <div>an</div></div> example';
             * XRegExp.matchRecursive(str, '<div\\s*>', '</div>', 'gi', {
             *   valueNames: ['between', 'left', 'match', 'right']
             * });
             * // -> [
             * // {name: 'between', value: 'Here is ',       start: 0,  end: 8},
             * // {name: 'left',    value: '<div>',          start: 8,  end: 13},
             * // {name: 'match',   value: ' <div>an</div>', start: 13, end: 27},
             * // {name: 'right',   value: '</div>',         start: 27, end: 33},
             * // {name: 'between', value: ' example',       start: 33, end: 41}
             * // ]
             *
             * // Omitting unneeded parts with null valueNames, and using escapeChar
             * str = '...{1}.\\{{function(x,y){return {y:x}}}';
             * XRegExp.matchRecursive(str, '{', '}', 'g', {
             *   valueNames: ['literal', null, 'value', null],
             *   escapeChar: '\\'
             * });
             * // -> [
             * // {name: 'literal', value: '...',  start: 0, end: 3},
             * // {name: 'value',   value: '1',    start: 4, end: 5},
             * // {name: 'literal', value: '.\\{', start: 6, end: 9},
             * // {name: 'value',   value: 'function(x,y){return {y:x}}', start: 10, end: 37}
             * // ]
             *
             * // Sticky mode via flag y
             * str = '<1><<<2>>><3>4<5>';
             * XRegExp.matchRecursive(str, '<', '>', 'gy');
             * // -> ['1', '<<2>>', '3']
             */

            XRegExp.matchRecursive = function (
              str,
              left,
              right,
              flags,
              options
            ) {
              flags = flags || "";
              options = options || {};
              var global =
                (0, _indexOf["default"])(flags).call(flags, "g") !== -1;
              var sticky =
                (0, _indexOf["default"])(flags).call(flags, "y") !== -1; // Flag `y` is controlled internally

              var basicFlags = flags.replace(/y/g, "");
              var _options = options,
                escapeChar = _options.escapeChar;
              var vN = options.valueNames;
              var output = [];
              var openTokens = 0;
              var delimStart = 0;
              var delimEnd = 0;
              var lastOuterEnd = 0;
              var outerStart;
              var innerStart;
              var leftMatch;
              var rightMatch;
              var esc;
              left = XRegExp(left, basicFlags);
              right = XRegExp(right, basicFlags);

              if (escapeChar) {
                var _context, _context2;

                if (escapeChar.length > 1) {
                  throw new Error("Cannot use more than one escape character");
                }

                escapeChar = XRegExp.escape(escapeChar); // Example of concatenated `esc` regex:
                // `escapeChar`: '%'
                // `left`: '<'
                // `right`: '>'
                // Regex is: /(?:%[\S\s]|(?:(?!<|>)[^%])+)+/

                esc = new RegExp(
                  (0, _concat["default"])(
                    (_context = (0, _concat["default"])(
                      (_context2 = "(?:".concat(escapeChar, "[\\S\\s]|(?:(?!"))
                    ).call(
                      _context2, // Using `XRegExp.union` safely rewrites backreferences in `left` and `right`.
                      // Intentionally not passing `basicFlags` to `XRegExp.union` since any syntax
                      // transformation resulting from those flags was already applied to `left` and
                      // `right` when they were passed through the XRegExp constructor above.
                      XRegExp.union([left, right], "", {
                        conjunction: "or",
                      }).source,
                      ")[^"
                    ))
                  ).call(_context, escapeChar, "])+)+"), // Flags `gy` not needed here
                  flags.replace(
                    XRegExp._hasNativeFlag("s") ? /[^imsu]/g : /[^imu]/g,
                    ""
                  )
                );
              }

              while (true) {
                // If using an escape character, advance to the delimiter's next starting position,
                // skipping any escaped characters in between
                if (escapeChar) {
                  delimEnd += (XRegExp.exec(str, esc, delimEnd, "sticky") || [
                    "",
                  ])[0].length;
                }

                leftMatch = XRegExp.exec(str, left, delimEnd);
                rightMatch = XRegExp.exec(str, right, delimEnd); // Keep the leftmost match only

                if (leftMatch && rightMatch) {
                  if (leftMatch.index <= rightMatch.index) {
                    rightMatch = null;
                  } else {
                    leftMatch = null;
                  }
                } // Paths (LM: leftMatch, RM: rightMatch, OT: openTokens):
                // LM | RM | OT | Result
                // 1  | 0  | 1  | loop
                // 1  | 0  | 0  | loop
                // 0  | 1  | 1  | loop
                // 0  | 1  | 0  | throw
                // 0  | 0  | 1  | throw
                // 0  | 0  | 0  | break
                // The paths above don't include the sticky mode special case. The loop ends after the
                // first completed match if not `global`.

                if (leftMatch || rightMatch) {
                  delimStart = (leftMatch || rightMatch).index;
                  delimEnd = delimStart + (leftMatch || rightMatch)[0].length;
                } else if (!openTokens) {
                  break;
                }

                if (sticky && !openTokens && delimStart > lastOuterEnd) {
                  break;
                }

                if (leftMatch) {
                  if (!openTokens) {
                    outerStart = delimStart;
                    innerStart = delimEnd;
                  }

                  ++openTokens;
                } else if (rightMatch && openTokens) {
                  if (!--openTokens) {
                    if (vN) {
                      if (vN[0] && outerStart > lastOuterEnd) {
                        output.push(
                          row(
                            vN[0],
                            (0, _slice["default"])(str).call(
                              str,
                              lastOuterEnd,
                              outerStart
                            ),
                            lastOuterEnd,
                            outerStart
                          )
                        );
                      }

                      if (vN[1]) {
                        output.push(
                          row(
                            vN[1],
                            (0, _slice["default"])(str).call(
                              str,
                              outerStart,
                              innerStart
                            ),
                            outerStart,
                            innerStart
                          )
                        );
                      }

                      if (vN[2]) {
                        output.push(
                          row(
                            vN[2],
                            (0, _slice["default"])(str).call(
                              str,
                              innerStart,
                              delimStart
                            ),
                            innerStart,
                            delimStart
                          )
                        );
                      }

                      if (vN[3]) {
                        output.push(
                          row(
                            vN[3],
                            (0, _slice["default"])(str).call(
                              str,
                              delimStart,
                              delimEnd
                            ),
                            delimStart,
                            delimEnd
                          )
                        );
                      }
                    } else {
                      output.push(
                        (0, _slice["default"])(str).call(
                          str,
                          innerStart,
                          delimStart
                        )
                      );
                    }

                    lastOuterEnd = delimEnd;

                    if (!global) {
                      break;
                    }
                  }
                } else {
                  var _context3;

                  var delimSide = rightMatch ? "right" : "left";
                  var errorPos = rightMatch ? delimStart : outerStart;
                  throw new Error(
                    (0, _concat["default"])(
                      (_context3 = "Unbalanced ".concat(
                        delimSide,
                        " delimiter found in string at position "
                      ))
                    ).call(_context3, errorPos)
                  );
                } // If the delimiter matched an empty string, avoid an infinite loop

                if (delimStart === delimEnd) {
                  ++delimEnd;
                }
              }

              if (
                global &&
                !sticky &&
                vN &&
                vN[0] &&
                str.length > lastOuterEnd
              ) {
                output.push(
                  row(
                    vN[0],
                    (0, _slice["default"])(str).call(str, lastOuterEnd),
                    lastOuterEnd,
                    str.length
                  )
                );
              }

              return output;
            };
          };

          exports["default"] = _default;
          module.exports = exports.default;
        },
        {
          "@babel/runtime-corejs3/core-js-stable/instance/concat": 7,
          "@babel/runtime-corejs3/core-js-stable/instance/index-of": 10,
          "@babel/runtime-corejs3/core-js-stable/instance/slice": 13,
          "@babel/runtime-corejs3/core-js-stable/object/define-property": 16,
          "@babel/runtime-corejs3/helpers/interopRequireDefault": 28,
        },
      ],
      3: [
        function (require, module, exports) {
          "use strict";

          var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

          var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

          _Object$defineProperty(exports, "__esModule", {
            value: true,
          });

          exports["default"] = void 0;

          var _xregexp = _interopRequireDefault(require("./xregexp"));

          var _build = _interopRequireDefault(require("./addons/build"));

          var _matchrecursive = _interopRequireDefault(
            require("./addons/matchrecursive")
          );

          (0, _build["default"])(_xregexp["default"]);
          (0, _matchrecursive["default"])(_xregexp["default"]);
          var _default = _xregexp["default"];
          exports["default"] = _default;
          module.exports = exports.default;
        },
        {
          "./addons/build": 1,
          "./addons/matchrecursive": 2,
          "./xregexp": 4,
          "@babel/runtime-corejs3/core-js-stable/object/define-property": 16,
          "@babel/runtime-corejs3/helpers/interopRequireDefault": 28,
        },
      ],
      4: [
        function (require, module, exports) {
          "use strict";

          var _sliceInstanceProperty2 = require("@babel/runtime-corejs3/core-js-stable/instance/slice");

          var _Array$from = require("@babel/runtime-corejs3/core-js-stable/array/from");

          var _Symbol = require("@babel/runtime-corejs3/core-js-stable/symbol");

          var _getIteratorMethod = require("@babel/runtime-corejs3/core-js/get-iterator-method");

          var _Array$isArray = require("@babel/runtime-corejs3/core-js-stable/array/is-array");

          var _getIterator = require("@babel/runtime-corejs3/core-js/get-iterator");

          var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

          var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

          _Object$defineProperty(exports, "__esModule", {
            value: true,
          });

          exports["default"] = void 0;

          var _slicedToArray2 = _interopRequireDefault(
            require("@babel/runtime-corejs3/helpers/slicedToArray")
          );

          var _flags = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/instance/flags")
          );

          var _sort = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/instance/sort")
          );

          var _slice = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/instance/slice")
          );

          var _parseInt2 = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/parse-int")
          );

          var _indexOf = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/instance/index-of")
          );

          var _forEach = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/instance/for-each")
          );

          var _create = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/object/create")
          );

          var _concat = _interopRequireDefault(
            require("@babel/runtime-corejs3/core-js-stable/instance/concat")
          );

          function _createForOfIteratorHelper(o, allowArrayLike) {
            var it;
            if (
              typeof _Symbol === "undefined" ||
              _getIteratorMethod(o) == null
            ) {
              if (
                _Array$isArray(o) ||
                (it = _unsupportedIterableToArray(o)) ||
                (allowArrayLike && o && typeof o.length === "number")
              ) {
                if (it) o = it;
                var i = 0;
                var F = function F() {};
                return {
                  s: F,
                  n: function n() {
                    if (i >= o.length) return { done: true };
                    return { done: false, value: o[i++] };
                  },
                  e: function e(_e) {
                    throw _e;
                  },
                  f: F,
                };
              }
              throw new TypeError(
                "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
              );
            }
            var normalCompletion = true,
              didErr = false,
              err;
            return {
              s: function s() {
                it = _getIterator(o);
              },
              n: function n() {
                var step = it.next();
                normalCompletion = step.done;
                return step;
              },
              e: function e(_e2) {
                didErr = true;
                err = _e2;
              },
              f: function f() {
                try {
                  if (!normalCompletion && it["return"] != null) it["return"]();
                } finally {
                  if (didErr) throw err;
                }
              },
            };
          }

          function _unsupportedIterableToArray(o, minLen) {
            var _context9;
            if (!o) return;
            if (typeof o === "string") return _arrayLikeToArray(o, minLen);
            var n = _sliceInstanceProperty2(
              (_context9 = Object.prototype.toString.call(o))
            ).call(_context9, 8, -1);
            if (n === "Object" && o.constructor) n = o.constructor.name;
            if (n === "Map" || n === "Set") return _Array$from(o);
            if (
              n === "Arguments" ||
              /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
            )
              return _arrayLikeToArray(o, minLen);
          }

          function _arrayLikeToArray(arr, len) {
            if (len == null || len > arr.length) len = arr.length;
            for (var i = 0, arr2 = new Array(len); i < len; i++) {
              arr2[i] = arr[i];
            }
            return arr2;
          }

          /*!
           * XRegExp 5.0.2
           * <xregexp.com>
           * Steven Levithan (c) 2007-present MIT License
           */

          /**
           * XRegExp provides augmented, extensible regular expressions. You get additional regex syntax and
           * flags, beyond what browsers support natively. XRegExp is also a regex utility belt with tools to
           * make your client-side grepping simpler and more powerful, while freeing you from related
           * cross-browser inconsistencies.
           */
          // ==--------------------------==
          // Private stuff
          // ==--------------------------==
          // Property name used for extended regex instance data
          var REGEX_DATA = "xregexp"; // Optional features that can be installed and uninstalled

          var features = {
            astral: false,
            namespacing: true,
          }; // Storage for fixed/extended native methods

          var fixed = {}; // Storage for regexes cached by `XRegExp.cache`

          var regexCache = {}; // Storage for pattern details cached by the `XRegExp` constructor

          var patternCache = {}; // Storage for regex syntax tokens added internally or by `XRegExp.addToken`

          var tokens = []; // Token scopes

          var defaultScope = "default";
          var classScope = "class"; // Regexes that match native regex syntax, including octals

          var nativeTokens = {
            // Any native multicharacter token in default scope, or any single character
            default:
              /\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u(?:[\dA-Fa-f]{4}|{[\dA-Fa-f]+})|c[A-Za-z]|[\s\S])|\(\?(?:[:=!]|<[=!])|[?*+]\?|{\d+(?:,\d*)?}\??|[\s\S]/,
            // Any native multicharacter token in character class scope, or any single character
            class:
              /\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u(?:[\dA-Fa-f]{4}|{[\dA-Fa-f]+})|c[A-Za-z]|[\s\S])|[\s\S]/,
          }; // Any backreference or dollar-prefixed character in replacement strings

          var replacementToken =
            /\$(?:\{([^\}]+)\}|<([^>]+)>|(\d\d?|[\s\S]?))/g; // Check for correct `exec` handling of nonparticipating capturing groups

          var correctExecNpcg = /()??/.exec("")[1] === undefined; // Check for ES6 `flags` prop support

          var hasFlagsProp = (0, _flags["default"])(/x/) !== undefined;

          function hasNativeFlag(flag) {
            // Can't check based on the presence of properties/getters since browsers might support such
            // properties even when they don't support the corresponding flag in regex construction (tested
            // in Chrome 48, where `'unicode' in /x/` is true but trying to construct a regex with flag `u`
            // throws an error)
            var isSupported = true;

            try {
              // Can't use regex literals for testing even in a `try` because regex literals with
              // unsupported flags cause a compilation error in IE
              new RegExp("", flag); // Work around a broken/incomplete IE11 polyfill for sticky introduced in core-js 3.6.0

              if (flag === "y") {
                // Using function to avoid babel transform to regex literal
                var gy = (function () {
                  return "gy";
                })();

                var incompleteY =
                  ".a".replace(new RegExp("a", gy), ".") === "..";

                if (incompleteY) {
                  isSupported = false;
                }
              }
            } catch (exception) {
              isSupported = false;
            }

            return isSupported;
          } // Check for ES2018 `s` flag support

          var hasNativeS = hasNativeFlag("s"); // Check for ES6 `u` flag support

          var hasNativeU = hasNativeFlag("u"); // Check for ES6 `y` flag support

          var hasNativeY = hasNativeFlag("y"); // Tracker for known flags, including addon flags

          var registeredFlags = {
            g: true,
            i: true,
            m: true,
            s: hasNativeS,
            u: hasNativeU,
            y: hasNativeY,
          }; // Flags to remove when passing to native `RegExp` constructor

          var nonnativeFlags = hasNativeS ? /[^gimsuy]+/g : /[^gimuy]+/g;
          /**
           * Attaches extended data and `XRegExp.prototype` properties to a regex object.
           *
           * @private
           * @param {RegExp} regex Regex to augment.
           * @param {Array} captureNames Array with capture names, or `null`.
           * @param {String} xSource XRegExp pattern used to generate `regex`, or `null` if N/A.
           * @param {String} xFlags XRegExp flags used to generate `regex`, or `null` if N/A.
           * @param {Boolean} [isInternalOnly=false] Whether the regex will be used only for internal
           *   operations, and never exposed to users. For internal-only regexes, we can improve perf by
           *   skipping some operations like attaching `XRegExp.prototype` properties.
           * @returns {!RegExp} Augmented regex.
           */

          function augment(
            regex,
            captureNames,
            xSource,
            xFlags,
            isInternalOnly
          ) {
            var _context;

            regex[REGEX_DATA] = {
              captureNames: captureNames,
            };

            if (isInternalOnly) {
              return regex;
            } // Can't auto-inherit these since the XRegExp constructor returns a nonprimitive value

            if (regex.__proto__) {
              regex.__proto__ = XRegExp.prototype;
            } else {
              for (var p in XRegExp.prototype) {
                // An `XRegExp.prototype.hasOwnProperty(p)` check wouldn't be worth it here, since this
                // is performance sensitive, and enumerable `Object.prototype` or `RegExp.prototype`
                // extensions exist on `regex.prototype` anyway
                regex[p] = XRegExp.prototype[p];
              }
            }

            regex[REGEX_DATA].source = xSource; // Emulate the ES6 `flags` prop by ensuring flags are in alphabetical order

            regex[REGEX_DATA].flags = xFlags
              ? (0, _sort["default"])((_context = xFlags.split("")))
                  .call(_context)
                  .join("")
              : xFlags;
            return regex;
          }
          /**
           * Removes any duplicate characters from the provided string.
           *
           * @private
           * @param {String} str String to remove duplicate characters from.
           * @returns {string} String with any duplicate characters removed.
           */

          function clipDuplicates(str) {
            return str.replace(/([\s\S])(?=[\s\S]*\1)/g, "");
          }
          /**
           * Copies a regex object while preserving extended data and augmenting with `XRegExp.prototype`
           * properties. The copy has a fresh `lastIndex` property (set to zero). Allows adding and removing
           * flags g and y while copying the regex.
           *
           * @private
           * @param {RegExp} regex Regex to copy.
           * @param {Object} [options] Options object with optional properties:
           *   - `addG` {Boolean} Add flag g while copying the regex.
           *   - `addY` {Boolean} Add flag y while copying the regex.
           *   - `removeG` {Boolean} Remove flag g while copying the regex.
           *   - `removeY` {Boolean} Remove flag y while copying the regex.
           *   - `isInternalOnly` {Boolean} Whether the copied regex will be used only for internal
           *     operations, and never exposed to users. For internal-only regexes, we can improve perf by
           *     skipping some operations like attaching `XRegExp.prototype` properties.
           *   - `source` {String} Overrides `<regex>.source`, for special cases.
           * @returns {RegExp} Copy of the provided regex, possibly with modified flags.
           */

          function copyRegex(regex, options) {
            var _context2;

            if (!XRegExp.isRegExp(regex)) {
              throw new TypeError("Type RegExp expected");
            }

            var xData = regex[REGEX_DATA] || {};
            var flags = getNativeFlags(regex);
            var flagsToAdd = "";
            var flagsToRemove = "";
            var xregexpSource = null;
            var xregexpFlags = null;
            options = options || {};

            if (options.removeG) {
              flagsToRemove += "g";
            }

            if (options.removeY) {
              flagsToRemove += "y";
            }

            if (flagsToRemove) {
              flags = flags.replace(
                new RegExp("[".concat(flagsToRemove, "]+"), "g"),
                ""
              );
            }

            if (options.addG) {
              flagsToAdd += "g";
            }

            if (options.addY) {
              flagsToAdd += "y";
            }

            if (flagsToAdd) {
              flags = clipDuplicates(flags + flagsToAdd);
            }

            if (!options.isInternalOnly) {
              if (xData.source !== undefined) {
                xregexpSource = xData.source;
              } // null or undefined; don't want to add to `flags` if the previous value was null, since
              // that indicates we're not tracking original precompilation flags

              if ((0, _flags["default"])(xData) != null) {
                // Flags are only added for non-internal regexes by `XRegExp.globalize`. Flags are never
                // removed for non-internal regexes, so don't need to handle it
                xregexpFlags = flagsToAdd
                  ? clipDuplicates((0, _flags["default"])(xData) + flagsToAdd)
                  : (0, _flags["default"])(xData);
              }
            } // Augment with `XRegExp.prototype` properties, but use the native `RegExp` constructor to avoid
            // searching for special tokens. That would be wrong for regexes constructed by `RegExp`, and
            // unnecessary for regexes constructed by `XRegExp` because the regex has already undergone the
            // translation to native regex syntax

            regex = augment(
              new RegExp(options.source || regex.source, flags),
              hasNamedCapture(regex)
                ? (0, _slice["default"])((_context2 = xData.captureNames)).call(
                    _context2,
                    0
                  )
                : null,
              xregexpSource,
              xregexpFlags,
              options.isInternalOnly
            );
            return regex;
          }
          /**
           * Converts hexadecimal to decimal.
           *
           * @private
           * @param {String} hex
           * @returns {number}
           */

          function dec(hex) {
            return (0, _parseInt2["default"])(hex, 16);
          }
          /**
           * Returns a pattern that can be used in a native RegExp in place of an ignorable token such as an
           * inline comment or whitespace with flag x. This is used directly as a token handler function
           * passed to `XRegExp.addToken`.
           *
           * @private
           * @param {String} match Match arg of `XRegExp.addToken` handler
           * @param {String} scope Scope arg of `XRegExp.addToken` handler
           * @param {String} flags Flags arg of `XRegExp.addToken` handler
           * @returns {string} Either '' or '(?:)', depending on which is needed in the context of the match.
           */

          function getContextualTokenSeparator(match, scope, flags) {
            var matchEndPos = match.index + match[0].length;
            var precedingChar = match.input[match.index - 1];
            var followingChar = match.input[matchEndPos];

            if (
              // No need to separate tokens if at the beginning or end of a group, before or after a
              // group, or before or after a `|`
              /^[()|]$/.test(precedingChar) ||
              /^[()|]$/.test(followingChar) || // No need to separate tokens if at the beginning or end of the pattern
              match.index === 0 ||
              matchEndPos === match.input.length || // No need to separate tokens if at the beginning of a noncapturing group or lookaround.
              // Looks only at the last 4 chars (at most) for perf when constructing long regexes.
              /\(\?(?:[:=!]|<[=!])$/.test(
                match.input.substring(match.index - 4, match.index)
              ) || // Avoid separating tokens when the following token is a quantifier
              isQuantifierNext(match.input, matchEndPos, flags)
            ) {
              return "";
            } // Keep tokens separated. This avoids e.g. inadvertedly changing `\1 1` or `\1(?#)1` to `\11`.
            // This also ensures all tokens remain as discrete atoms, e.g. it prevents converting the
            // syntax error `(? :` into `(?:`.

            return "(?:)";
          }
          /**
           * Returns native `RegExp` flags used by a regex object.
           *
           * @private
           * @param {RegExp} regex Regex to check.
           * @returns {string} Native flags in use.
           */

          function getNativeFlags(regex) {
            return hasFlagsProp
              ? (0, _flags["default"])(regex) // Explicitly using `RegExp.prototype.toString` (rather than e.g. `String` or concatenation
              : // with an empty string) allows this to continue working predictably when
                // `XRegExp.proptotype.toString` is overridden
                /\/([a-z]*)$/i.exec(RegExp.prototype.toString.call(regex))[1];
          }
          /**
           * Determines whether a regex has extended instance data used to track capture names.
           *
           * @private
           * @param {RegExp} regex Regex to check.
           * @returns {boolean} Whether the regex uses named capture.
           */

          function hasNamedCapture(regex) {
            return !!(regex[REGEX_DATA] && regex[REGEX_DATA].captureNames);
          }
          /**
           * Converts decimal to hexadecimal.
           *
           * @private
           * @param {Number|String} dec
           * @returns {string}
           */

          function hex(dec) {
            return (0, _parseInt2["default"])(dec, 10).toString(16);
          }
          /**
           * Checks whether the next nonignorable token after the specified position is a quantifier.
           *
           * @private
           * @param {String} pattern Pattern to search within.
           * @param {Number} pos Index in `pattern` to search at.
           * @param {String} flags Flags used by the pattern.
           * @returns {Boolean} Whether the next nonignorable token is a quantifier.
           */

          function isQuantifierNext(pattern, pos, flags) {
            var inlineCommentPattern = "\\(\\?#[^)]*\\)";
            var lineCommentPattern = "#[^#\\n]*";
            var quantifierPattern = "[?*+]|{\\d+(?:,\\d*)?}";
            var regex =
              (0, _indexOf["default"])(flags).call(flags, "x") !== -1 // Ignore any leading whitespace, line comments, and inline comments
                ? /^(?:\s|#[^#\n]*|\(\?#[^)]*\))*(?:[?*+]|{\d+(?:,\d*)?})/ // Ignore any leading inline comments
                : /^(?:\(\?#[^)]*\))*(?:[?*+]|{\d+(?:,\d*)?})/;
            return regex.test(
              (0, _slice["default"])(pattern).call(pattern, pos)
            );
          }
          /**
           * Determines whether a value is of the specified type, by resolving its internal [[Class]].
           *
           * @private
           * @param {*} value Object to check.
           * @param {String} type Type to check for, in TitleCase.
           * @returns {boolean} Whether the object matches the type.
           */

          function isType(value, type) {
            return (
              Object.prototype.toString.call(value) ===
              "[object ".concat(type, "]")
            );
          }
          /**
           * Returns the object, or throws an error if it is `null` or `undefined`. This is used to follow
           * the ES5 abstract operation `ToObject`.
           *
           * @private
           * @param {*} value Object to check and return.
           * @returns {*} The provided object.
           */

          function nullThrows(value) {
            // null or undefined
            if (value == null) {
              throw new TypeError("Cannot convert null or undefined to object");
            }

            return value;
          }
          /**
           * Adds leading zeros if shorter than four characters. Used for fixed-length hexadecimal values.
           *
           * @private
           * @param {String} str
           * @returns {string}
           */

          function pad4(str) {
            while (str.length < 4) {
              str = "0".concat(str);
            }

            return str;
          }
          /**
           * Checks for flag-related errors, and strips/applies flags in a leading mode modifier. Offloads
           * the flag preparation logic from the `XRegExp` constructor.
           *
           * @private
           * @param {String} pattern Regex pattern, possibly with a leading mode modifier.
           * @param {String} flags Any combination of flags.
           * @returns {!Object} Object with properties `pattern` and `flags`.
           */

          function prepareFlags(pattern, flags) {
            // Recent browsers throw on duplicate flags, so copy this behavior for nonnative flags
            if (clipDuplicates(flags) !== flags) {
              throw new SyntaxError(
                "Invalid duplicate regex flag ".concat(flags)
              );
            } // Strip and apply a leading mode modifier with any combination of flags except g or y

            pattern = pattern.replace(/^\(\?([\w$]+)\)/, function ($0, $1) {
              if (/[gy]/.test($1)) {
                throw new SyntaxError(
                  "Cannot use flag g or y in mode modifier ".concat($0)
                );
              } // Allow duplicate flags within the mode modifier

              flags = clipDuplicates(flags + $1);
              return "";
            }); // Throw on unknown native or nonnative flags

            var _iterator = _createForOfIteratorHelper(flags),
              _step;

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done; ) {
                var flag = _step.value;

                if (!registeredFlags[flag]) {
                  throw new SyntaxError("Unknown regex flag ".concat(flag));
                }
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }

            return {
              pattern: pattern,
              flags: flags,
            };
          }
          /**
           * Prepares an options object from the given value.
           *
           * @private
           * @param {String|Object} value Value to convert to an options object.
           * @returns {Object} Options object.
           */

          function prepareOptions(value) {
            var options = {};

            if (isType(value, "String")) {
              (0, _forEach["default"])(XRegExp).call(
                XRegExp,
                value,
                /[^\s,]+/,
                function (match) {
                  options[match] = true;
                }
              );
              return options;
            }

            return value;
          }
          /**
           * Registers a flag so it doesn't throw an 'unknown flag' error.
           *
           * @private
           * @param {String} flag Single-character flag to register.
           */

          function registerFlag(flag) {
            if (!/^[\w$]$/.test(flag)) {
              throw new Error("Flag must be a single character A-Za-z0-9_$");
            }

            registeredFlags[flag] = true;
          }
          /**
           * Runs built-in and custom regex syntax tokens in reverse insertion order at the specified
           * position, until a match is found.
           *
           * @private
           * @param {String} pattern Original pattern from which an XRegExp object is being built.
           * @param {String} flags Flags being used to construct the regex.
           * @param {Number} pos Position to search for tokens within `pattern`.
           * @param {Number} scope Regex scope to apply: 'default' or 'class'.
           * @param {Object} context Context object to use for token handler functions.
           * @returns {Object} Object with properties `matchLength`, `output`, and `reparse`; or `null`.
           */

          function runTokens(pattern, flags, pos, scope, context) {
            var i = tokens.length;
            var leadChar = pattern[pos];
            var result = null;
            var match;
            var t; // Run in reverse insertion order

            while (i--) {
              t = tokens[i];

              if (
                (t.leadChar && t.leadChar !== leadChar) ||
                (t.scope !== scope && t.scope !== "all") ||
                (t.flag &&
                  !((0, _indexOf["default"])(flags).call(flags, t.flag) !== -1))
              ) {
                continue;
              }

              match = XRegExp.exec(pattern, t.regex, pos, "sticky");

              if (match) {
                result = {
                  matchLength: match[0].length,
                  output: t.handler.call(context, match, scope, flags),
                  reparse: t.reparse,
                }; // Finished with token tests

                break;
              }
            }

            return result;
          }
          /**
           * Enables or disables implicit astral mode opt-in. When enabled, flag A is automatically added to
           * all new regexes created by XRegExp. This causes an error to be thrown when creating regexes if
           * the Unicode Base addon is not available, since flag A is registered by that addon.
           *
           * @private
           * @param {Boolean} on `true` to enable; `false` to disable.
           */

          function setAstral(on) {
            features.astral = on;
          }
          /**
           * Adds named capture groups to the `groups` property of match arrays. See here for details:
           * https://github.com/tc39/proposal-regexp-named-groups
           *
           * @private
           * @param {Boolean} on `true` to enable; `false` to disable.
           */

          function setNamespacing(on) {
            features.namespacing = on;
          } // ==--------------------------==
          // Constructor
          // ==--------------------------==

          /**
           * Creates an extended regular expression object for matching text with a pattern. Differs from a
           * native regular expression in that additional syntax and flags are supported. The returned object
           * is in fact a native `RegExp` and works with all native methods.
           *
           * @class XRegExp
           * @constructor
           * @param {String|RegExp} pattern Regex pattern string, or an existing regex object to copy.
           * @param {String} [flags] Any combination of flags.
           *   Native flags:
           *     - `g` - global
           *     - `i` - ignore case
           *     - `m` - multiline anchors
           *     - `u` - unicode (ES6)
           *     - `y` - sticky (Firefox 3+, ES6)
           *   Additional XRegExp flags:
           *     - `n` - explicit capture
           *     - `s` - dot matches all (aka singleline) - works even when not natively supported
           *     - `x` - free-spacing and line comments (aka extended)
           *     - `A` - astral (requires the Unicode Base addon)
           *   Flags cannot be provided when constructing one `RegExp` from another.
           * @returns {RegExp} Extended regular expression object.
           * @example
           *
           * // With named capture and flag x
           * XRegExp(`(?<year>  [0-9]{4} ) -?  # year
           *          (?<month> [0-9]{2} ) -?  # month
           *          (?<day>   [0-9]{2} )     # day`, 'x');
           *
           * // Providing a regex object copies it. Native regexes are recompiled using native (not XRegExp)
           * // syntax. Copies maintain extended data, are augmented with `XRegExp.prototype` properties, and
           * // have fresh `lastIndex` properties (set to zero).
           * XRegExp(/regex/);
           */

          function XRegExp(pattern, flags) {
            if (XRegExp.isRegExp(pattern)) {
              if (flags !== undefined) {
                throw new TypeError(
                  "Cannot supply flags when copying a RegExp"
                );
              }

              return copyRegex(pattern);
            } // Copy the argument behavior of `RegExp`

            pattern = pattern === undefined ? "" : String(pattern);
            flags = flags === undefined ? "" : String(flags);

            if (
              XRegExp.isInstalled("astral") &&
              !((0, _indexOf["default"])(flags).call(flags, "A") !== -1)
            ) {
              // This causes an error to be thrown if the Unicode Base addon is not available
              flags += "A";
            }

            if (!patternCache[pattern]) {
              patternCache[pattern] = {};
            }

            if (!patternCache[pattern][flags]) {
              var context = {
                hasNamedCapture: false,
                captureNames: [],
              };
              var scope = defaultScope;
              var output = "";
              var pos = 0;
              var result; // Check for flag-related errors, and strip/apply flags in a leading mode modifier

              var applied = prepareFlags(pattern, flags);
              var appliedPattern = applied.pattern;
              var appliedFlags = (0, _flags["default"])(applied); // Use XRegExp's tokens to translate the pattern to a native regex pattern.
              // `appliedPattern.length` may change on each iteration if tokens use `reparse`

              while (pos < appliedPattern.length) {
                do {
                  // Check for custom tokens at the current position
                  result = runTokens(
                    appliedPattern,
                    appliedFlags,
                    pos,
                    scope,
                    context
                  ); // If the matched token used the `reparse` option, splice its output into the
                  // pattern before running tokens again at the same position

                  if (result && result.reparse) {
                    appliedPattern =
                      (0, _slice["default"])(appliedPattern).call(
                        appliedPattern,
                        0,
                        pos
                      ) +
                      result.output +
                      (0, _slice["default"])(appliedPattern).call(
                        appliedPattern,
                        pos + result.matchLength
                      );
                  }
                } while (result && result.reparse);

                if (result) {
                  output += result.output;
                  pos += result.matchLength || 1;
                } else {
                  // Get the native token at the current position
                  var _XRegExp$exec = XRegExp.exec(
                      appliedPattern,
                      nativeTokens[scope],
                      pos,
                      "sticky"
                    ),
                    _XRegExp$exec2 = (0, _slicedToArray2["default"])(
                      _XRegExp$exec,
                      1
                    ),
                    token = _XRegExp$exec2[0];

                  output += token;
                  pos += token.length;

                  if (token === "[" && scope === defaultScope) {
                    scope = classScope;
                  } else if (token === "]" && scope === classScope) {
                    scope = defaultScope;
                  }
                }
              }

              patternCache[pattern][flags] = {
                // Use basic cleanup to collapse repeated empty groups like `(?:)(?:)` to `(?:)`. Empty
                // groups are sometimes inserted during regex transpilation in order to keep tokens
                // separated. However, more than one empty group in a row is never needed.
                pattern: output.replace(/(?:\(\?:\))+/g, "(?:)"),
                // Strip all but native flags
                flags: appliedFlags.replace(nonnativeFlags, ""),
                // `context.captureNames` has an item for each capturing group, even if unnamed
                captures: context.hasNamedCapture ? context.captureNames : null,
              };
            }

            var generated = patternCache[pattern][flags];
            return augment(
              new RegExp(generated.pattern, (0, _flags["default"])(generated)),
              generated.captures,
              pattern,
              flags
            );
          } // Add `RegExp.prototype` to the prototype chain

          XRegExp.prototype = /(?:)/; // ==--------------------------==
          // Public properties
          // ==--------------------------==

          /**
           * The XRegExp version number as a string containing three dot-separated parts. For example,
           * '2.0.0-beta-3'.
           *
           * @static
           * @memberOf XRegExp
           * @type String
           */

          XRegExp.version = "5.0.2"; // ==--------------------------==
          // Public methods
          // ==--------------------------==
          // Intentionally undocumented; used in tests and addons

          XRegExp._clipDuplicates = clipDuplicates;
          XRegExp._hasNativeFlag = hasNativeFlag;
          XRegExp._dec = dec;
          XRegExp._hex = hex;
          XRegExp._pad4 = pad4;
          /**
           * Extends XRegExp syntax and allows custom flags. This is used internally and can be used to
           * create XRegExp addons. If more than one token can match the same string, the last added wins.
           *
           * @memberOf XRegExp
           * @param {RegExp} regex Regex object that matches the new token.
           * @param {Function} handler Function that returns a new pattern string (using native regex syntax)
           *   to replace the matched token within all future XRegExp regexes. Has access to persistent
           *   properties of the regex being built, through `this`. Invoked with three arguments:
           *   - The match array, with named backreference properties.
           *   - The regex scope where the match was found: 'default' or 'class'.
           *   - The flags used by the regex, including any flags in a leading mode modifier.
           *   The handler function becomes part of the XRegExp construction process, so be careful not to
           *   construct XRegExps within the function or you will trigger infinite recursion.
           * @param {Object} [options] Options object with optional properties:
           *   - `scope` {String} Scope where the token applies: 'default', 'class', or 'all'.
           *   - `flag` {String} Single-character flag that triggers the token. This also registers the
           *     flag, which prevents XRegExp from throwing an 'unknown flag' error when the flag is used.
           *   - `optionalFlags` {String} Any custom flags checked for within the token `handler` that are
           *     not required to trigger the token. This registers the flags, to prevent XRegExp from
           *     throwing an 'unknown flag' error when any of the flags are used.
           *   - `reparse` {Boolean} Whether the `handler` function's output should not be treated as
           *     final, and instead be reparseable by other tokens (including the current token). Allows
           *     token chaining or deferring.
           *   - `leadChar` {String} Single character that occurs at the beginning of any successful match
           *     of the token (not always applicable). This doesn't change the behavior of the token unless
           *     you provide an erroneous value. However, providing it can increase the token's performance
           *     since the token can be skipped at any positions where this character doesn't appear.
           * @example
           *
           * // Basic usage: Add \a for the ALERT control code
           * XRegExp.addToken(
           *   /\\a/,
           *   () => '\\x07',
           *   {scope: 'all'}
           * );
           * XRegExp('\\a[\\a-\\n]+').test('\x07\n\x07'); // -> true
           *
           * // Add the U (ungreedy) flag from PCRE and RE2, which reverses greedy and lazy quantifiers.
           * // Since `scope` is not specified, it uses 'default' (i.e., transformations apply outside of
           * // character classes only)
           * XRegExp.addToken(
           *   /([?*+]|{\d+(?:,\d*)?})(\??)/,
           *   (match) => `${match[1]}${match[2] ? '' : '?'}`,
           *   {flag: 'U'}
           * );
           * XRegExp('a+', 'U').exec('aaa')[0]; // -> 'a'
           * XRegExp('a+?', 'U').exec('aaa')[0]; // -> 'aaa'
           */

          XRegExp.addToken = function (regex, handler, options) {
            options = options || {};
            var _options = options,
              optionalFlags = _options.optionalFlags;

            if (options.flag) {
              registerFlag(options.flag);
            }

            if (optionalFlags) {
              optionalFlags = optionalFlags.split("");

              var _iterator2 = _createForOfIteratorHelper(optionalFlags),
                _step2;

              try {
                for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
                  var flag = _step2.value;
                  registerFlag(flag);
                }
              } catch (err) {
                _iterator2.e(err);
              } finally {
                _iterator2.f();
              }
            } // Add to the private list of syntax tokens

            tokens.push({
              regex: copyRegex(regex, {
                addG: true,
                addY: hasNativeY,
                isInternalOnly: true,
              }),
              handler: handler,
              scope: options.scope || defaultScope,
              flag: options.flag,
              reparse: options.reparse,
              leadChar: options.leadChar,
            }); // Reset the pattern cache used by the `XRegExp` constructor, since the same pattern and flags
            // might now produce different results

            XRegExp.cache.flush("patterns");
          };
          /**
           * Caches and returns the result of calling `XRegExp(pattern, flags)`. On any subsequent call with
           * the same pattern and flag combination, the cached copy of the regex is returned.
           *
           * @memberOf XRegExp
           * @param {String} pattern Regex pattern string.
           * @param {String} [flags] Any combination of XRegExp flags.
           * @returns {RegExp} Cached XRegExp object.
           * @example
           *
           * let match;
           * while (match = XRegExp.cache('.', 'gs').exec('abc')) {
           *   // The regex is compiled once only
           * }
           */

          XRegExp.cache = function (pattern, flags) {
            if (!regexCache[pattern]) {
              regexCache[pattern] = {};
            }

            return (
              regexCache[pattern][flags] ||
              (regexCache[pattern][flags] = XRegExp(pattern, flags))
            );
          }; // Intentionally undocumented; used in tests

          XRegExp.cache.flush = function (cacheName) {
            if (cacheName === "patterns") {
              // Flush the pattern cache used by the `XRegExp` constructor
              patternCache = {};
            } else {
              // Flush the regex cache populated by `XRegExp.cache`
              regexCache = {};
            }
          };
          /**
           * Escapes any regular expression metacharacters, for use when matching literal strings. The result
           * can safely be used at any position within a regex that uses any flags.
           *
           * @memberOf XRegExp
           * @param {String} str String to escape.
           * @returns {string} String with regex metacharacters escaped.
           * @example
           *
           * XRegExp.escape('Escaped? <.>');
           * // -> 'Escaped\?\u0020<\.>'
           */
          // Following are the contexts where each metacharacter needs to be escaped because it would
          // otherwise have a special meaning, change the meaning of surrounding characters, or cause an
          // error. Context 'default' means outside character classes only.
          // - `\` - context: all
          // - `[()*+?.$|` - context: default
          // - `]` - context: default with flag u or if forming the end of a character class
          // - `{}` - context: default with flag u or if part of a valid/complete quantifier pattern
          // - `,` - context: default if in a position that causes an unescaped `{` to turn into a quantifier.
          //   Ex: `/^a{1\,2}$/` matches `'a{1,2}'`, but `/^a{1,2}$/` matches `'a'` or `'aa'`
          // - `#` and <whitespace> - context: default with flag x
          // - `^` - context: default, and context: class if it's the first character in the class
          // - `-` - context: class if part of a valid character class range

          XRegExp.escape = function (str) {
            return String(nullThrows(str)) // Escape most special chars with a backslash
              .replace(/[\\\[\]{}()*+?.^$|]/g, "\\$&") // Convert to \uNNNN for special chars that can't be escaped when used with ES6 flag `u`
              .replace(/[\s#\-,]/g, function (match) {
                return "\\u".concat(pad4(hex(match.charCodeAt(0))));
              });
          };
          /**
           * Executes a regex search in a specified string. Returns a match array or `null`. If the provided
           * regex uses named capture, named capture properties are included on the match array's `groups`
           * property. Optional `pos` and `sticky` arguments specify the search start position, and whether
           * the match must start at the specified position only. The `lastIndex` property of the provided
           * regex is not used, but is updated for compatibility. Also fixes browser bugs compared to the
           * native `RegExp.prototype.exec` and can be used reliably cross-browser.
           *
           * @memberOf XRegExp
           * @param {String} str String to search.
           * @param {RegExp} regex Regex to search with.
           * @param {Number} [pos=0] Zero-based index at which to start the search.
           * @param {Boolean|String} [sticky=false] Whether the match must start at the specified position
           *   only. The string `'sticky'` is accepted as an alternative to `true`.
           * @returns {Array} Match array with named capture properties on the `groups` object, or `null`. If
           *   the `namespacing` feature is off, named capture properties are directly on the match array.
           * @example
           *
           * // Basic use, with named capturing group
           * let match = XRegExp.exec('U+2620', XRegExp('U\\+(?<hex>[0-9A-F]{4})'));
           * match.groups.hex; // -> '2620'
           *
           * // With pos and sticky, in a loop
           * let pos = 2, result = [], match;
           * while (match = XRegExp.exec('<1><2><3><4>5<6>', /<(\d)>/, pos, 'sticky')) {
           *   result.push(match[1]);
           *   pos = match.index + match[0].length;
           * }
           * // result -> ['2', '3', '4']
           */

          XRegExp.exec = function (str, regex, pos, sticky) {
            var cacheKey = "g";
            var addY = false;
            var fakeY = false;
            var match;
            addY =
              hasNativeY && !!(sticky || (regex.sticky && sticky !== false));

            if (addY) {
              cacheKey += "y";
            } else if (sticky) {
              // Simulate sticky matching by appending an empty capture to the original regex. The
              // resulting regex will succeed no matter what at the current index (set with `lastIndex`),
              // and will not search the rest of the subject string. We'll know that the original regex
              // has failed if that last capture is `''` rather than `undefined` (i.e., if that last
              // capture participated in the match).
              fakeY = true;
              cacheKey += "FakeY";
            }

            regex[REGEX_DATA] = regex[REGEX_DATA] || {}; // Shares cached copies with `XRegExp.match`/`replace`

            var r2 =
              regex[REGEX_DATA][cacheKey] ||
              (regex[REGEX_DATA][cacheKey] = copyRegex(regex, {
                addG: true,
                addY: addY,
                source: fakeY ? "".concat(regex.source, "|()") : undefined,
                removeY: sticky === false,
                isInternalOnly: true,
              }));
            pos = pos || 0;
            r2.lastIndex = pos; // Fixed `exec` required for `lastIndex` fix, named backreferences, etc.

            match = fixed.exec.call(r2, str); // Get rid of the capture added by the pseudo-sticky matcher if needed. An empty string means
            // the original regexp failed (see above).

            if (fakeY && match && match.pop() === "") {
              match = null;
            }

            if (regex.global) {
              regex.lastIndex = match ? r2.lastIndex : 0;
            }

            return match;
          };
          /**
           * Executes a provided function once per regex match. Searches always start at the beginning of the
           * string and continue until the end, regardless of the state of the regex's `global` property and
           * initial `lastIndex`.
           *
           * @memberOf XRegExp
           * @param {String} str String to search.
           * @param {RegExp} regex Regex to search with.
           * @param {Function} callback Function to execute for each match. Invoked with four arguments:
           *   - The match array, with named backreference properties.
           *   - The zero-based match index.
           *   - The string being traversed.
           *   - The regex object being used to traverse the string.
           * @example
           *
           * // Extracts every other digit from a string
           * const evens = [];
           * XRegExp.forEach('1a2345', /\d/, (match, i) => {
           *   if (i % 2) evens.push(+match[0]);
           * });
           * // evens -> [2, 4]
           */

          XRegExp.forEach = function (str, regex, callback) {
            var pos = 0;
            var i = -1;
            var match;

            while ((match = XRegExp.exec(str, regex, pos))) {
              // Because `regex` is provided to `callback`, the function could use the deprecated/
              // nonstandard `RegExp.prototype.compile` to mutate the regex. However, since `XRegExp.exec`
              // doesn't use `lastIndex` to set the search position, this can't lead to an infinite loop,
              // at least. Actually, because of the way `XRegExp.exec` caches globalized versions of
              // regexes, mutating the regex will not have any effect on the iteration or matched strings,
              // which is a nice side effect that brings extra safety.
              callback(match, ++i, str, regex);
              pos = match.index + (match[0].length || 1);
            }
          };
          /**
           * Copies a regex object and adds flag `g`. The copy maintains extended data, is augmented with
           * `XRegExp.prototype` properties, and has a fresh `lastIndex` property (set to zero). Native
           * regexes are not recompiled using XRegExp syntax.
           *
           * @memberOf XRegExp
           * @param {RegExp} regex Regex to globalize.
           * @returns {RegExp} Copy of the provided regex with flag `g` added.
           * @example
           *
           * const globalCopy = XRegExp.globalize(/regex/);
           * globalCopy.global; // -> true
           */

          XRegExp.globalize = function (regex) {
            return copyRegex(regex, {
              addG: true,
            });
          };
          /**
           * Installs optional features according to the specified options. Can be undone using
           * `XRegExp.uninstall`.
           *
           * @memberOf XRegExp
           * @param {Object|String} options Options object or string.
           * @example
           *
           * // With an options object
           * XRegExp.install({
           *   // Enables support for astral code points in Unicode addons (implicitly sets flag A)
           *   astral: true,
           *
           *   // Adds named capture groups to the `groups` property of matches
           *   namespacing: true
           * });
           *
           * // With an options string
           * XRegExp.install('astral namespacing');
           */

          XRegExp.install = function (options) {
            options = prepareOptions(options);

            if (!features.astral && options.astral) {
              setAstral(true);
            }

            if (!features.namespacing && options.namespacing) {
              setNamespacing(true);
            }
          };
          /**
           * Checks whether an individual optional feature is installed.
           *
           * @memberOf XRegExp
           * @param {String} feature Name of the feature to check. One of:
           *   - `astral`
           *   - `namespacing`
           * @returns {boolean} Whether the feature is installed.
           * @example
           *
           * XRegExp.isInstalled('astral');
           */

          XRegExp.isInstalled = function (feature) {
            return !!features[feature];
          };
          /**
           * Returns `true` if an object is a regex; `false` if it isn't. This works correctly for regexes
           * created in another frame, when `instanceof` and `constructor` checks would fail.
           *
           * @memberOf XRegExp
           * @param {*} value Object to check.
           * @returns {boolean} Whether the object is a `RegExp` object.
           * @example
           *
           * XRegExp.isRegExp('string'); // -> false
           * XRegExp.isRegExp(/regex/i); // -> true
           * XRegExp.isRegExp(RegExp('^', 'm')); // -> true
           * XRegExp.isRegExp(XRegExp('(?s).')); // -> true
           */

          XRegExp.isRegExp = function (value) {
            return Object.prototype.toString.call(value) === "[object RegExp]";
          }; // Same as `isType(value, 'RegExp')`, but avoiding that function call here for perf since
          // `isRegExp` is used heavily by internals including regex construction

          /**
           * Returns the first matched string, or in global mode, an array containing all matched strings.
           * This is essentially a more convenient re-implementation of `String.prototype.match` that gives
           * the result types you actually want (string instead of `exec`-style array in match-first mode,
           * and an empty array instead of `null` when no matches are found in match-all mode). It also lets
           * you override flag g and ignore `lastIndex`, and fixes browser bugs.
           *
           * @memberOf XRegExp
           * @param {String} str String to search.
           * @param {RegExp} regex Regex to search with.
           * @param {String} [scope='one'] Use 'one' to return the first match as a string. Use 'all' to
           *   return an array of all matched strings. If not explicitly specified and `regex` uses flag g,
           *   `scope` is 'all'.
           * @returns {String|Array} In match-first mode: First match as a string, or `null`. In match-all
           *   mode: Array of all matched strings, or an empty array.
           * @example
           *
           * // Match first
           * XRegExp.match('abc', /\w/); // -> 'a'
           * XRegExp.match('abc', /\w/g, 'one'); // -> 'a'
           * XRegExp.match('abc', /x/g, 'one'); // -> null
           *
           * // Match all
           * XRegExp.match('abc', /\w/g); // -> ['a', 'b', 'c']
           * XRegExp.match('abc', /\w/, 'all'); // -> ['a', 'b', 'c']
           * XRegExp.match('abc', /x/, 'all'); // -> []
           */

          XRegExp.match = function (str, regex, scope) {
            var global = (regex.global && scope !== "one") || scope === "all";
            var cacheKey =
              (global ? "g" : "") + (regex.sticky ? "y" : "") || "noGY";
            regex[REGEX_DATA] = regex[REGEX_DATA] || {}; // Shares cached copies with `XRegExp.exec`/`replace`

            var r2 =
              regex[REGEX_DATA][cacheKey] ||
              (regex[REGEX_DATA][cacheKey] = copyRegex(regex, {
                addG: !!global,
                removeG: scope === "one",
                isInternalOnly: true,
              }));
            var result = String(nullThrows(str)).match(r2);

            if (regex.global) {
              regex.lastIndex =
                scope === "one" && result // Can't use `r2.lastIndex` since `r2` is nonglobal in this case
                  ? result.index + result[0].length
                  : 0;
            }

            return global ? result || [] : result && result[0];
          };
          /**
           * Retrieves the matches from searching a string using a chain of regexes that successively search
           * within previous matches. The provided `chain` array can contain regexes and or objects with
           * `regex` and `backref` properties. When a backreference is specified, the named or numbered
           * backreference is passed forward to the next regex or returned.
           *
           * @memberOf XRegExp
           * @param {String} str String to search.
           * @param {Array} chain Regexes that each search for matches within preceding results.
           * @returns {Array} Matches by the last regex in the chain, or an empty array.
           * @example
           *
           * // Basic usage; matches numbers within <b> tags
           * XRegExp.matchChain('1 <b>2</b> 3 <b>4 a 56</b>', [
           *   XRegExp('(?is)<b>.*?</b>'),
           *   /\d+/
           * ]);
           * // -> ['2', '4', '56']
           *
           * // Passing forward and returning specific backreferences
           * const html = `<a href="http://xregexp.com/api/">XRegExp</a>
           *               <a href="http://www.google.com/">Google</a>`;
           * XRegExp.matchChain(html, [
           *   {regex: /<a href="([^"]+)">/i, backref: 1},
           *   {regex: XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
           * ]);
           * // -> ['xregexp.com', 'www.google.com']
           */

          XRegExp.matchChain = function (str, chain) {
            return (function recurseChain(values, level) {
              var item = chain[level].regex
                ? chain[level]
                : {
                    regex: chain[level],
                  };
              var matches = [];

              function addMatch(match) {
                if (item.backref) {
                  var ERR_UNDEFINED_GROUP =
                    "Backreference to undefined group: ".concat(item.backref);
                  var isNamedBackref = isNaN(item.backref);

                  if (isNamedBackref && XRegExp.isInstalled("namespacing")) {
                    // `groups` has `null` as prototype, so using `in` instead of `hasOwnProperty`
                    if (!(match.groups && item.backref in match.groups)) {
                      throw new ReferenceError(ERR_UNDEFINED_GROUP);
                    }
                  } else if (!match.hasOwnProperty(item.backref)) {
                    throw new ReferenceError(ERR_UNDEFINED_GROUP);
                  }

                  var backrefValue =
                    isNamedBackref && XRegExp.isInstalled("namespacing")
                      ? match.groups[item.backref]
                      : match[item.backref];
                  matches.push(backrefValue || "");
                } else {
                  matches.push(match[0]);
                }
              }

              var _iterator3 = _createForOfIteratorHelper(values),
                _step3;

              try {
                for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
                  var value = _step3.value;
                  (0, _forEach["default"])(XRegExp).call(
                    XRegExp,
                    value,
                    item.regex,
                    addMatch
                  );
                }
              } catch (err) {
                _iterator3.e(err);
              } finally {
                _iterator3.f();
              }

              return level === chain.length - 1 || !matches.length
                ? matches
                : recurseChain(matches, level + 1);
            })([str], 0);
          };
          /**
           * Returns a new string with one or all matches of a pattern replaced. The pattern can be a string
           * or regex, and the replacement can be a string or a function to be called for each match. To
           * perform a global search and replace, use the optional `scope` argument or include flag g if using
           * a regex. Replacement strings can use `$<n>` or `${n}` for named and numbered backreferences.
           * Replacement functions can use named backreferences via the last argument. Also fixes browser bugs
           * compared to the native `String.prototype.replace` and can be used reliably cross-browser.
           *
           * @memberOf XRegExp
           * @param {String} str String to search.
           * @param {RegExp|String} search Search pattern to be replaced.
           * @param {String|Function} replacement Replacement string or a function invoked to create it.
           *   Replacement strings can include special replacement syntax:
           *     - $$ - Inserts a literal $ character.
           *     - $&, $0 - Inserts the matched substring.
           *     - $` - Inserts the string that precedes the matched substring (left context).
           *     - $' - Inserts the string that follows the matched substring (right context).
           *     - $n, $nn - Where n/nn are digits referencing an existing capturing group, inserts
           *       backreference n/nn.
           *     - $<n>, ${n} - Where n is a name or any number of digits that reference an existing capturing
           *       group, inserts backreference n.
           *   Replacement functions are invoked with three or more arguments:
           *     - args[0] - The matched substring (corresponds to `$&` above). If the `namespacing` feature
           *       is off, named backreferences are accessible as properties of this argument.
           *     - args[1..n] - One argument for each backreference (corresponding to `$1`, `$2`, etc. above).
           *       If the regex has no capturing groups, no arguments appear in this position.
           *     - args[n+1] - The zero-based index of the match within the entire search string.
           *     - args[n+2] - The total string being searched.
           *     - args[n+3] - If the the search pattern is a regex with named capturing groups, the last
           *       argument is the groups object. Its keys are the backreference names and its values are the
           *       backreference values. If the `namespacing` feature is off, this argument is not present.
           * @param {String} [scope] Use 'one' to replace the first match only, or 'all'. Defaults to 'one'.
           *   Defaults to 'all' if using a regex with flag g.
           * @returns {String} New string with one or all matches replaced.
           * @example
           *
           * // Regex search, using named backreferences in replacement string
           * const name = XRegExp('(?<first>\\w+) (?<last>\\w+)');
           * XRegExp.replace('John Smith', name, '$<last>, $<first>');
           * // -> 'Smith, John'
           *
           * // Regex search, using named backreferences in replacement function
           * XRegExp.replace('John Smith', name, (...args) => {
           *   const groups = args[args.length - 1];
           *   return `${groups.last}, ${groups.first}`;
           * });
           * // -> 'Smith, John'
           *
           * // String search, with replace-all
           * XRegExp.replace('RegExp builds RegExps', 'RegExp', 'XRegExp', 'all');
           * // -> 'XRegExp builds XRegExps'
           */

          XRegExp.replace = function (str, search, replacement, scope) {
            var isRegex = XRegExp.isRegExp(search);
            var global = (search.global && scope !== "one") || scope === "all";
            var cacheKey =
              (global ? "g" : "") + (search.sticky ? "y" : "") || "noGY";
            var s2 = search;

            if (isRegex) {
              search[REGEX_DATA] = search[REGEX_DATA] || {}; // Shares cached copies with `XRegExp.exec`/`match`. Since a copy is used, `search`'s
              // `lastIndex` isn't updated *during* replacement iterations

              s2 =
                search[REGEX_DATA][cacheKey] ||
                (search[REGEX_DATA][cacheKey] = copyRegex(search, {
                  addG: !!global,
                  removeG: scope === "one",
                  isInternalOnly: true,
                }));
            } else if (global) {
              s2 = new RegExp(XRegExp.escape(String(search)), "g");
            } // Fixed `replace` required for named backreferences, etc.

            var result = fixed.replace.call(nullThrows(str), s2, replacement);

            if (isRegex && search.global) {
              // Fixes IE, Safari bug (last tested IE 9, Safari 5.1)
              search.lastIndex = 0;
            }

            return result;
          };
          /**
           * Performs batch processing of string replacements. Used like `XRegExp.replace`, but accepts an
           * array of replacement details. Later replacements operate on the output of earlier replacements.
           * Replacement details are accepted as an array with a regex or string to search for, the
           * replacement string or function, and an optional scope of 'one' or 'all'. Uses the XRegExp
           * replacement text syntax, which supports named backreference properties via `$<name>` or
           * `${name}`.
           *
           * @memberOf XRegExp
           * @param {String} str String to search.
           * @param {Array} replacements Array of replacement detail arrays.
           * @returns {String} New string with all replacements.
           * @example
           *
           * str = XRegExp.replaceEach(str, [
           *   [XRegExp('(?<name>a)'), 'z$<name>'],
           *   [/b/gi, 'y'],
           *   [/c/g, 'x', 'one'], // scope 'one' overrides /g
           *   [/d/, 'w', 'all'],  // scope 'all' overrides lack of /g
           *   ['e', 'v', 'all'],  // scope 'all' allows replace-all for strings
           *   [/f/g, (match) => match.toUpperCase()]
           * ]);
           */

          XRegExp.replaceEach = function (str, replacements) {
            var _iterator4 = _createForOfIteratorHelper(replacements),
              _step4;

            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done; ) {
                var r = _step4.value;
                str = XRegExp.replace(str, r[0], r[1], r[2]);
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }

            return str;
          };
          /**
           * Splits a string into an array of strings using a regex or string separator. Matches of the
           * separator are not included in the result array. However, if `separator` is a regex that contains
           * capturing groups, backreferences are spliced into the result each time `separator` is matched.
           * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
           * cross-browser.
           *
           * @memberOf XRegExp
           * @param {String} str String to split.
           * @param {RegExp|String} separator Regex or string to use for separating the string.
           * @param {Number} [limit] Maximum number of items to include in the result array.
           * @returns {Array} Array of substrings.
           * @example
           *
           * // Basic use
           * XRegExp.split('a b c', ' ');
           * // -> ['a', 'b', 'c']
           *
           * // With limit
           * XRegExp.split('a b c', ' ', 2);
           * // -> ['a', 'b']
           *
           * // Backreferences in result array
           * XRegExp.split('..word1..', /([a-z]+)(\d+)/i);
           * // -> ['..', 'word', '1', '..']
           */

          XRegExp.split = function (str, separator, limit) {
            return fixed.split.call(nullThrows(str), separator, limit);
          };
          /**
           * Executes a regex search in a specified string. Returns `true` or `false`. Optional `pos` and
           * `sticky` arguments specify the search start position, and whether the match must start at the
           * specified position only. The `lastIndex` property of the provided regex is not used, but is
           * updated for compatibility. Also fixes browser bugs compared to the native
           * `RegExp.prototype.test` and can be used reliably cross-browser.
           *
           * @memberOf XRegExp
           * @param {String} str String to search.
           * @param {RegExp} regex Regex to search with.
           * @param {Number} [pos=0] Zero-based index at which to start the search.
           * @param {Boolean|String} [sticky=false] Whether the match must start at the specified position
           *   only. The string `'sticky'` is accepted as an alternative to `true`.
           * @returns {boolean} Whether the regex matched the provided value.
           * @example
           *
           * // Basic use
           * XRegExp.test('abc', /c/); // -> true
           *
           * // With pos and sticky
           * XRegExp.test('abc', /c/, 0, 'sticky'); // -> false
           * XRegExp.test('abc', /c/, 2, 'sticky'); // -> true
           */
          // Do this the easy way :-)

          XRegExp.test = function (str, regex, pos, sticky) {
            return !!XRegExp.exec(str, regex, pos, sticky);
          };
          /**
           * Uninstalls optional features according to the specified options. Used to undo the actions of
           * `XRegExp.install`.
           *
           * @memberOf XRegExp
           * @param {Object|String} options Options object or string.
           * @example
           *
           * // With an options object
           * XRegExp.uninstall({
           *   // Disables support for astral code points in Unicode addons (unless enabled per regex)
           *   astral: true,
           *
           *   // Don't add named capture groups to the `groups` property of matches
           *   namespacing: true
           * });
           *
           * // With an options string
           * XRegExp.uninstall('astral namespacing');
           */

          XRegExp.uninstall = function (options) {
            options = prepareOptions(options);

            if (features.astral && options.astral) {
              setAstral(false);
            }

            if (features.namespacing && options.namespacing) {
              setNamespacing(false);
            }
          };
          /**
           * Returns an XRegExp object that is the union of the given patterns. Patterns can be provided as
           * regex objects or strings. Metacharacters are escaped in patterns provided as strings.
           * Backreferences in provided regex objects are automatically renumbered to work correctly within
           * the larger combined pattern. Native flags used by provided regexes are ignored in favor of the
           * `flags` argument.
           *
           * @memberOf XRegExp
           * @param {Array} patterns Regexes and strings to combine.
           * @param {String} [flags] Any combination of XRegExp flags.
           * @param {Object} [options] Options object with optional properties:
           *   - `conjunction` {String} Type of conjunction to use: 'or' (default) or 'none'.
           * @returns {RegExp} Union of the provided regexes and strings.
           * @example
           *
           * XRegExp.union(['a+b*c', /(dogs)\1/, /(cats)\1/], 'i');
           * // -> /a\+b\*c|(dogs)\1|(cats)\2/i
           *
           * XRegExp.union([/man/, /bear/, /pig/], 'i', {conjunction: 'none'});
           * // -> /manbearpig/i
           */

          XRegExp.union = function (patterns, flags, options) {
            options = options || {};
            var conjunction = options.conjunction || "or";
            var numCaptures = 0;
            var numPriorCaptures;
            var captureNames;

            function rewrite(match, paren, backref) {
              var name = captureNames[numCaptures - numPriorCaptures]; // Capturing group

              if (paren) {
                ++numCaptures; // If the current capture has a name, preserve the name

                if (name) {
                  return "(?<".concat(name, ">");
                } // Backreference
              } else if (backref) {
                // Rewrite the backreference
                return "\\".concat(+backref + numPriorCaptures);
              }

              return match;
            }

            if (!(isType(patterns, "Array") && patterns.length)) {
              throw new TypeError(
                "Must provide a nonempty array of patterns to merge"
              );
            }

            var parts =
              /(\()(?!\?)|\\([1-9]\d*)|\\[\s\S]|\[(?:[^\\\]]|\\[\s\S])*\]/g;
            var output = [];

            var _iterator5 = _createForOfIteratorHelper(patterns),
              _step5;

            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done; ) {
                var pattern = _step5.value;

                if (XRegExp.isRegExp(pattern)) {
                  numPriorCaptures = numCaptures;
                  captureNames =
                    (pattern[REGEX_DATA] && pattern[REGEX_DATA].captureNames) ||
                    []; // Rewrite backreferences. Passing to XRegExp dies on octals and ensures patterns are
                  // independently valid; helps keep this simple. Named captures are put back

                  output.push(
                    XRegExp(pattern.source).source.replace(parts, rewrite)
                  );
                } else {
                  output.push(XRegExp.escape(pattern));
                }
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }

            var separator = conjunction === "none" ? "" : "|";
            return XRegExp(output.join(separator), flags);
          }; // ==--------------------------==
          // Fixed/extended native methods
          // ==--------------------------==

          /**
           * Adds named capture support (with backreferences returned as `result.name`), and fixes browser
           * bugs in the native `RegExp.prototype.exec`. Use via `XRegExp.exec`.
           *
           * @memberOf RegExp
           * @param {String} str String to search.
           * @returns {Array} Match array with named backreference properties, or `null`.
           */

          fixed.exec = function (str) {
            var origLastIndex = this.lastIndex;
            var match = RegExp.prototype.exec.apply(this, arguments);

            if (match) {
              // Fix browsers whose `exec` methods don't return `undefined` for nonparticipating capturing
              // groups. This fixes IE 5.5-8, but not IE 9's quirks mode or emulation of older IEs. IE 9
              // in standards mode follows the spec.
              if (
                !correctExecNpcg &&
                match.length > 1 &&
                (0, _indexOf["default"])(match).call(match, "") !== -1
              ) {
                var _context3;

                var r2 = copyRegex(this, {
                  removeG: true,
                  isInternalOnly: true,
                }); // Using `str.slice(match.index)` rather than `match[0]` in case lookahead allowed
                // matching due to characters outside the match

                (0, _slice["default"])((_context3 = String(str)))
                  .call(_context3, match.index)
                  .replace(r2, function () {
                    var len = arguments.length; // Skip index 0 and the last 2

                    for (var i = 1; i < len - 2; ++i) {
                      if (
                        (i < 0 || arguments.length <= i
                          ? undefined
                          : arguments[i]) === undefined
                      ) {
                        match[i] = undefined;
                      }
                    }
                  });
              } // Attach named capture properties

              if (this[REGEX_DATA] && this[REGEX_DATA].captureNames) {
                var groupsObject = match;

                if (XRegExp.isInstalled("namespacing")) {
                  // https://tc39.github.io/proposal-regexp-named-groups/#sec-regexpbuiltinexec
                  match.groups = (0, _create["default"])(null);
                  groupsObject = match.groups;
                } // Skip index 0

                for (var i = 1; i < match.length; ++i) {
                  var name = this[REGEX_DATA].captureNames[i - 1];

                  if (name) {
                    groupsObject[name] = match[i];
                  }
                } // Preserve any existing `groups` obj that came from native ES2018 named capture
              } else if (!match.groups && XRegExp.isInstalled("namespacing")) {
                match.groups = undefined;
              } // Fix browsers that increment `lastIndex` after zero-length matches

              if (
                this.global &&
                !match[0].length &&
                this.lastIndex > match.index
              ) {
                this.lastIndex = match.index;
              }
            }

            if (!this.global) {
              // Fixes IE, Opera bug (last tested IE 9, Opera 11.6)
              this.lastIndex = origLastIndex;
            }

            return match;
          };
          /**
           * Fixes browser bugs in the native `RegExp.prototype.test`.
           *
           * @memberOf RegExp
           * @param {String} str String to search.
           * @returns {boolean} Whether the regex matched the provided value.
           */

          fixed.test = function (str) {
            // Do this the easy way :-)
            return !!fixed.exec.call(this, str);
          };
          /**
           * Adds named capture support (with backreferences returned as `result.name`), and fixes browser
           * bugs in the native `String.prototype.match`.
           *
           * @memberOf String
           * @param {RegExp|*} regex Regex to search with. If not a regex object, it is passed to `RegExp`.
           * @returns {Array} If `regex` uses flag g, an array of match strings or `null`. Without flag g,
           *   the result of calling `regex.exec(this)`.
           */

          fixed.match = function (regex) {
            if (!XRegExp.isRegExp(regex)) {
              // Use the native `RegExp` rather than `XRegExp`
              regex = new RegExp(regex);
            } else if (regex.global) {
              var result = String.prototype.match.apply(this, arguments); // Fixes IE bug

              regex.lastIndex = 0;
              return result;
            }

            return fixed.exec.call(regex, nullThrows(this));
          };
          /**
           * Adds support for `${n}` (or `$<n>`) tokens for named and numbered backreferences in replacement
           * text, and provides named backreferences to replacement functions as `arguments[0].name`. Also
           * fixes browser bugs in replacement text syntax when performing a replacement using a nonregex
           * search value, and the value of a replacement regex's `lastIndex` property during replacement
           * iterations and upon completion. Note that this doesn't support SpiderMonkey's proprietary third
           * (`flags`) argument. Use via `XRegExp.replace`.
           *
           * @memberOf String
           * @param {RegExp|String} search Search pattern to be replaced.
           * @param {String|Function} replacement Replacement string or a function invoked to create it.
           * @returns {string} New string with one or all matches replaced.
           */

          fixed.replace = function (search, replacement) {
            var isRegex = XRegExp.isRegExp(search);
            var origLastIndex;
            var captureNames;
            var result;

            if (isRegex) {
              if (search[REGEX_DATA]) {
                captureNames = search[REGEX_DATA].captureNames;
              } // Only needed if `search` is nonglobal

              origLastIndex = search.lastIndex;
            } else {
              search += ""; // Type-convert
            } // Don't use `typeof`; some older browsers return 'function' for regex objects

            if (isType(replacement, "Function")) {
              // Stringifying `this` fixes a bug in IE < 9 where the last argument in replacement
              // functions isn't type-converted to a string
              result = String(this).replace(search, function () {
                for (
                  var _len = arguments.length, args = new Array(_len), _key = 0;
                  _key < _len;
                  _key++
                ) {
                  args[_key] = arguments[_key];
                }

                if (captureNames) {
                  var groupsObject;

                  if (XRegExp.isInstalled("namespacing")) {
                    // https://tc39.github.io/proposal-regexp-named-groups/#sec-regexpbuiltinexec
                    groupsObject = (0, _create["default"])(null);
                    args.push(groupsObject);
                  } else {
                    // Change the `args[0]` string primitive to a `String` object that can store
                    // properties. This really does need to use `String` as a constructor
                    args[0] = new String(args[0]);
                    groupsObject = args[0];
                  } // Store named backreferences

                  for (var i = 0; i < captureNames.length; ++i) {
                    if (captureNames[i]) {
                      groupsObject[captureNames[i]] = args[i + 1];
                    }
                  }
                } // ES6 specs the context for replacement functions as `undefined`

                return replacement.apply(void 0, args);
              });
            } else {
              // Ensure that the last value of `args` will be a string when given nonstring `this`,
              // while still throwing on null or undefined context
              result = String(nullThrows(this)).replace(search, function () {
                for (
                  var _len2 = arguments.length,
                    args = new Array(_len2),
                    _key2 = 0;
                  _key2 < _len2;
                  _key2++
                ) {
                  args[_key2] = arguments[_key2];
                }

                return String(replacement).replace(replacementToken, replacer);

                function replacer($0, bracketed, angled, dollarToken) {
                  bracketed = bracketed || angled; // ES2018 added a new trailing `groups` arg that's passed to replacement functions
                  // when the search regex uses native named capture

                  var numNonCaptureArgs = isType(
                    args[args.length - 1],
                    "Object"
                  )
                    ? 4
                    : 3;
                  var numCaptures = args.length - numNonCaptureArgs; // Handle named or numbered backreference with curly or angled braces: ${n}, $<n>

                  if (bracketed) {
                    // Handle backreference to numbered capture, if `bracketed` is an integer. Use
                    // `0` for the entire match. Any number of leading zeros may be used.
                    if (/^\d+$/.test(bracketed)) {
                      // Type-convert and drop leading zeros
                      var _n = +bracketed;

                      if (_n <= numCaptures) {
                        return args[_n] || "";
                      }
                    } // Handle backreference to named capture. If the name does not refer to an
                    // existing capturing group, it's an error. Also handles the error for numbered
                    // backference that does not refer to an existing group.
                    // Using `indexOf` since having groups with the same name is already an error,
                    // otherwise would need `lastIndexOf`.

                    var n = captureNames
                      ? (0, _indexOf["default"])(captureNames).call(
                          captureNames,
                          bracketed
                        )
                      : -1;

                    if (n < 0) {
                      throw new SyntaxError(
                        "Backreference to undefined group ".concat($0)
                      );
                    }

                    return args[n + 1] || "";
                  } // Handle `$`-prefixed variable
                  // Handle space/blank first because type conversion with `+` drops space padding
                  // and converts spaces and empty strings to `0`

                  if (dollarToken === "" || dollarToken === " ") {
                    throw new SyntaxError("Invalid token ".concat($0));
                  }

                  if (dollarToken === "&" || +dollarToken === 0) {
                    // $&, $0 (not followed by 1-9), $00
                    return args[0];
                  }

                  if (dollarToken === "$") {
                    // $$
                    return "$";
                  }

                  if (dollarToken === "`") {
                    var _context4;

                    // $` (left context)
                    return (0, _slice["default"])(
                      (_context4 = args[args.length - 1])
                    ).call(_context4, 0, args[args.length - 2]);
                  }

                  if (dollarToken === "'") {
                    var _context5;

                    // $' (right context)
                    return (0, _slice["default"])(
                      (_context5 = args[args.length - 1])
                    ).call(_context5, args[args.length - 2] + args[0].length);
                  } // Handle numbered backreference without braces
                  // Type-convert and drop leading zero

                  dollarToken = +dollarToken; // XRegExp behavior for `$n` and `$nn`:
                  // - Backrefs end after 1 or 2 digits. Use `${..}` or `$<..>` for more digits.
                  // - `$1` is an error if no capturing groups.
                  // - `$10` is an error if less than 10 capturing groups. Use `${1}0` or `$<1>0`
                  //   instead.
                  // - `$01` is `$1` if at least one capturing group, else it's an error.
                  // - `$0` (not followed by 1-9) and `$00` are the entire match.
                  // Native behavior, for comparison:
                  // - Backrefs end after 1 or 2 digits. Cannot reference capturing group 100+.
                  // - `$1` is a literal `$1` if no capturing groups.
                  // - `$10` is `$1` followed by a literal `0` if less than 10 capturing groups.
                  // - `$01` is `$1` if at least one capturing group, else it's a literal `$01`.
                  // - `$0` is a literal `$0`.

                  if (!isNaN(dollarToken)) {
                    if (dollarToken > numCaptures) {
                      throw new SyntaxError(
                        "Backreference to undefined group ".concat($0)
                      );
                    }

                    return args[dollarToken] || "";
                  } // `$` followed by an unsupported char is an error, unlike native JS

                  throw new SyntaxError("Invalid token ".concat($0));
                }
              });
            }

            if (isRegex) {
              if (search.global) {
                // Fixes IE, Safari bug (last tested IE 9, Safari 5.1)
                search.lastIndex = 0;
              } else {
                // Fixes IE, Opera bug (last tested IE 9, Opera 11.6)
                search.lastIndex = origLastIndex;
              }
            }

            return result;
          };
          /**
           * Fixes browser bugs in the native `String.prototype.split`. Use via `XRegExp.split`.
           *
           * @memberOf String
           * @param {RegExp|String} separator Regex or string to use for separating the string.
           * @param {Number} [limit] Maximum number of items to include in the result array.
           * @returns {!Array} Array of substrings.
           */

          fixed.split = function (separator, limit) {
            if (!XRegExp.isRegExp(separator)) {
              // Browsers handle nonregex split correctly, so use the faster native method
              return String.prototype.split.apply(this, arguments);
            }

            var str = String(this);
            var output = [];
            var origLastIndex = separator.lastIndex;
            var lastLastIndex = 0;
            var lastLength; // Values for `limit`, per the spec:
            // If undefined: pow(2,32) - 1
            // If 0, Infinity, or NaN: 0
            // If positive number: limit = floor(limit); if (limit >= pow(2,32)) limit -= pow(2,32);
            // If negative number: pow(2,32) - floor(abs(limit))
            // If other: Type-convert, then use the above rules
            // This line fails in very strange ways for some values of `limit` in Opera 10.5-10.63, unless
            // Opera Dragonfly is open (go figure). It works in at least Opera 9.5-10.1 and 11+

            limit = (limit === undefined ? -1 : limit) >>> 0;
            (0, _forEach["default"])(XRegExp).call(
              XRegExp,
              str,
              separator,
              function (match) {
                // This condition is not the same as `if (match[0].length)`
                if (match.index + match[0].length > lastLastIndex) {
                  output.push(
                    (0, _slice["default"])(str).call(
                      str,
                      lastLastIndex,
                      match.index
                    )
                  );

                  if (match.length > 1 && match.index < str.length) {
                    Array.prototype.push.apply(
                      output,
                      (0, _slice["default"])(match).call(match, 1)
                    );
                  }

                  lastLength = match[0].length;
                  lastLastIndex = match.index + lastLength;
                }
              }
            );

            if (lastLastIndex === str.length) {
              if (!separator.test("") || lastLength) {
                output.push("");
              }
            } else {
              output.push((0, _slice["default"])(str).call(str, lastLastIndex));
            }

            separator.lastIndex = origLastIndex;
            return output.length > limit
              ? (0, _slice["default"])(output).call(output, 0, limit)
              : output;
          }; // ==--------------------------==
          // Built-in syntax/flag tokens
          // ==--------------------------==

          /*
           * Letter escapes that natively match literal characters: `\a`, `\A`, etc. These should be
           * SyntaxErrors but are allowed in web reality. XRegExp makes them errors for cross-browser
           * consistency and to reserve their syntax, but lets them be superseded by addons.
           */

          XRegExp.addToken(
            /\\([ABCE-RTUVXYZaeg-mopqyz]|c(?![A-Za-z])|u(?![\dA-Fa-f]{4}|{[\dA-Fa-f]+})|x(?![\dA-Fa-f]{2}))/,
            function (match, scope) {
              // \B is allowed in default scope only
              if (match[1] === "B" && scope === defaultScope) {
                return match[0];
              }

              throw new SyntaxError("Invalid escape ".concat(match[0]));
            },
            {
              scope: "all",
              leadChar: "\\",
            }
          );
          /*
           * Unicode code point escape with curly braces: `\u{N..}`. `N..` is any one or more digit
           * hexadecimal number from 0-10FFFF, and can include leading zeros. Requires the native ES6 `u` flag
           * to support code points greater than U+FFFF. Avoids converting code points above U+FFFF to
           * surrogate pairs (which could be done without flag `u`), since that could lead to broken behavior
           * if you follow a `\u{N..}` token that references a code point above U+FFFF with a quantifier, or
           * if you use the same in a character class.
           */

          XRegExp.addToken(
            /\\u{([\dA-Fa-f]+)}/,
            function (match, scope, flags) {
              var code = dec(match[1]);

              if (code > 0x10ffff) {
                throw new SyntaxError(
                  "Invalid Unicode code point ".concat(match[0])
                );
              }

              if (code <= 0xffff) {
                // Converting to \uNNNN avoids needing to escape the literal character and keep it
                // separate from preceding tokens
                return "\\u".concat(pad4(hex(code)));
              } // If `code` is between 0xFFFF and 0x10FFFF, require and defer to native handling

              if (
                hasNativeU &&
                (0, _indexOf["default"])(flags).call(flags, "u") !== -1
              ) {
                return match[0];
              }

              throw new SyntaxError(
                "Cannot use Unicode code point above \\u{FFFF} without flag u"
              );
            },
            {
              scope: "all",
              leadChar: "\\",
            }
          );
          /*
           * Comment pattern: `(?# )`. Inline comments are an alternative to the line comments allowed in
           * free-spacing mode (flag x).
           */

          XRegExp.addToken(/\(\?#[^)]*\)/, getContextualTokenSeparator, {
            leadChar: "(",
          });
          /*
           * Whitespace and line comments, in free-spacing mode (aka extended mode, flag x) only.
           */

          XRegExp.addToken(/\s+|#[^\n]*\n?/, getContextualTokenSeparator, {
            flag: "x",
          });
          /*
           * Dot, in dotAll mode (aka singleline mode, flag s) only.
           */

          if (!hasNativeS) {
            XRegExp.addToken(
              /\./,
              function () {
                return "[\\s\\S]";
              },
              {
                flag: "s",
                leadChar: ".",
              }
            );
          }
          /*
           * Named backreference: `\k<name>`. Backreference names can use RegExpIdentifierName characters
           * only. Also allows numbered backreferences as `\k<n>`.
           */

          XRegExp.addToken(
            /\\k<([^>]+)>/,
            function (match) {
              var _context6, _context7;

              // Groups with the same name is an error, else would need `lastIndexOf`
              var index = isNaN(match[1])
                ? (0, _indexOf["default"])(
                    (_context6 = this.captureNames)
                  ).call(_context6, match[1]) + 1
                : +match[1];
              var endIndex = match.index + match[0].length;

              if (!index || index > this.captureNames.length) {
                throw new SyntaxError(
                  "Backreference to undefined group ".concat(match[0])
                );
              } // Keep backreferences separate from subsequent literal numbers. This avoids e.g.
              // inadvertedly changing `(?<n>)\k<n>1` to `()\11`.

              return (0, _concat["default"])(
                (_context7 = "\\".concat(index))
              ).call(
                _context7,
                endIndex === match.input.length || isNaN(match.input[endIndex])
                  ? ""
                  : "(?:)"
              );
            },
            {
              leadChar: "\\",
            }
          );
          /*
           * Numbered backreference or octal, plus any following digits: `\0`, `\11`, etc. Octals except `\0`
           * not followed by 0-9 and backreferences to unopened capture groups throw an error. Other matches
           * are returned unaltered. IE < 9 doesn't support backreferences above `\99` in regex syntax.
           */

          XRegExp.addToken(
            /\\(\d+)/,
            function (match, scope) {
              if (
                !(
                  scope === defaultScope &&
                  /^[1-9]/.test(match[1]) &&
                  +match[1] <= this.captureNames.length
                ) &&
                match[1] !== "0"
              ) {
                throw new SyntaxError(
                  "Cannot use octal escape or backreference to undefined group ".concat(
                    match[0]
                  )
                );
              }

              return match[0];
            },
            {
              scope: "all",
              leadChar: "\\",
            }
          );
          /*
           * Named capturing group; match the opening delimiter only: `(?<name>`. Capture names can use the
           * RegExpIdentifierName characters only. Names can't be integers. Supports Python-style
           * `(?P<name>` as an alternate syntax to avoid issues in some older versions of Opera which natively
           * supported the Python-style syntax. Otherwise, XRegExp might treat numbered backreferences to
           * Python-style named capture as octals.
           */

          XRegExp.addToken(
            /\(\?P?<((?:[\$A-Z_a-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDEC0-\uDEEB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])(?:[\$0-9A-Z_a-z\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05EF-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u07FD\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u08D3-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u09FE\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D81-\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1878\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1ABF\u1AC0\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CD0-\u1CD2\u1CD4-\u1CFA\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA827\uA82C\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD27\uDD30-\uDD39\uDE80-\uDEA9\uDEAB\uDEAC\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF50\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD44-\uDD47\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDC9-\uDDCC\uDDCE-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3B-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC5E-\uDC61\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDC00-\uDC3A\uDCA0-\uDCE9\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD35\uDD37\uDD38\uDD3B-\uDD43\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD7\uDDDA-\uDDE1\uDDE3\uDDE4\uDE00-\uDE3E\uDE47\uDE50-\uDE99\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD8E\uDD90\uDD91\uDD93-\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF6\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF4F-\uDF87\uDF8F-\uDF9F\uDFE0\uDFE1\uDFE3\uDFE4\uDFF0\uDFF1]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDD00-\uDD2C\uDD30-\uDD3D\uDD40-\uDD49\uDD4E\uDEC0-\uDEF9]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4B\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A]|\uDB40[\uDD00-\uDDEF])*)>/,
            function (match) {
              var _context8;

              if (
                !XRegExp.isInstalled("namespacing") &&
                (match[1] === "length" || match[1] === "__proto__")
              ) {
                throw new SyntaxError(
                  "Cannot use reserved word as capture name ".concat(match[0])
                );
              }

              if (
                (0, _indexOf["default"])((_context8 = this.captureNames)).call(
                  _context8,
                  match[1]
                ) !== -1
              ) {
                throw new SyntaxError(
                  "Cannot use same name for multiple groups ".concat(match[0])
                );
              }

              this.captureNames.push(match[1]);
              this.hasNamedCapture = true;
              return "(";
            },
            {
              leadChar: "(",
            }
          );
          /*
           * Capturing group; match the opening parenthesis only. Required for support of named capturing
           * groups. Also adds explicit capture mode (flag n).
           */

          XRegExp.addToken(
            /\((?!\?)/,
            function (match, scope, flags) {
              if ((0, _indexOf["default"])(flags).call(flags, "n") !== -1) {
                return "(?:";
              }

              this.captureNames.push(null);
              return "(";
            },
            {
              optionalFlags: "n",
              leadChar: "(",
            }
          );
          var _default = XRegExp;
          exports["default"] = _default;
          module.exports = exports.default;
        },
        {
          "@babel/runtime-corejs3/core-js-stable/array/from": 5,
          "@babel/runtime-corejs3/core-js-stable/array/is-array": 6,
          "@babel/runtime-corejs3/core-js-stable/instance/concat": 7,
          "@babel/runtime-corejs3/core-js-stable/instance/flags": 8,
          "@babel/runtime-corejs3/core-js-stable/instance/for-each": 9,
          "@babel/runtime-corejs3/core-js-stable/instance/index-of": 10,
          "@babel/runtime-corejs3/core-js-stable/instance/slice": 13,
          "@babel/runtime-corejs3/core-js-stable/instance/sort": 14,
          "@babel/runtime-corejs3/core-js-stable/object/create": 15,
          "@babel/runtime-corejs3/core-js-stable/object/define-property": 16,
          "@babel/runtime-corejs3/core-js-stable/parse-int": 17,
          "@babel/runtime-corejs3/core-js-stable/symbol": 18,
          "@babel/runtime-corejs3/core-js/get-iterator": 22,
          "@babel/runtime-corejs3/core-js/get-iterator-method": 21,
          "@babel/runtime-corejs3/helpers/interopRequireDefault": 28,
          "@babel/runtime-corejs3/helpers/slicedToArray": 31,
        },
      ],
      5: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/array/from");
        },
        { "core-js-pure/stable/array/from": 192 },
      ],
      6: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/array/is-array");
        },
        { "core-js-pure/stable/array/is-array": 193 },
      ],
      7: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/instance/concat");
        },
        { "core-js-pure/stable/instance/concat": 195 },
      ],
      8: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/instance/flags");
        },
        { "core-js-pure/stable/instance/flags": 196 },
      ],
      9: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/instance/for-each");
        },
        { "core-js-pure/stable/instance/for-each": 197 },
      ],
      10: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/instance/index-of");
        },
        { "core-js-pure/stable/instance/index-of": 198 },
      ],
      11: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/instance/map");
        },
        { "core-js-pure/stable/instance/map": 199 },
      ],
      12: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/instance/reduce");
        },
        { "core-js-pure/stable/instance/reduce": 200 },
      ],
      13: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/instance/slice");
        },
        { "core-js-pure/stable/instance/slice": 201 },
      ],
      14: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/instance/sort");
        },
        { "core-js-pure/stable/instance/sort": 202 },
      ],
      15: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/object/create");
        },
        { "core-js-pure/stable/object/create": 203 },
      ],
      16: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/object/define-property");
        },
        { "core-js-pure/stable/object/define-property": 204 },
      ],
      17: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/parse-int");
        },
        { "core-js-pure/stable/parse-int": 205 },
      ],
      18: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/stable/symbol");
        },
        { "core-js-pure/stable/symbol": 206 },
      ],
      19: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/features/array/from");
        },
        { "core-js-pure/features/array/from": 54 },
      ],
      20: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/features/array/is-array");
        },
        { "core-js-pure/features/array/is-array": 55 },
      ],
      21: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/features/get-iterator-method");
        },
        { "core-js-pure/features/get-iterator-method": 56 },
      ],
      22: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/features/get-iterator");
        },
        { "core-js-pure/features/get-iterator": 57 },
      ],
      23: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/features/instance/slice");
        },
        { "core-js-pure/features/instance/slice": 58 },
      ],
      24: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/features/is-iterable");
        },
        { "core-js-pure/features/is-iterable": 59 },
      ],
      25: [
        function (require, module, exports) {
          module.exports = require("core-js-pure/features/symbol");
        },
        { "core-js-pure/features/symbol": 60 },
      ],
      26: [
        function (require, module, exports) {
          function _arrayLikeToArray(arr, len) {
            if (len == null || len > arr.length) len = arr.length;

            for (var i = 0, arr2 = new Array(len); i < len; i++) {
              arr2[i] = arr[i];
            }

            return arr2;
          }

          module.exports = _arrayLikeToArray;
        },
        {},
      ],
      27: [
        function (require, module, exports) {
          var _Array$isArray = require("@babel/runtime-corejs3/core-js/array/is-array");

          function _arrayWithHoles(arr) {
            if (_Array$isArray(arr)) return arr;
          }

          module.exports = _arrayWithHoles;
        },
        { "@babel/runtime-corejs3/core-js/array/is-array": 20 },
      ],
      28: [
        function (require, module, exports) {
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule
              ? obj
              : {
                  default: obj,
                };
          }

          module.exports = _interopRequireDefault;
        },
        {},
      ],
      29: [
        function (require, module, exports) {
          var _getIterator = require("@babel/runtime-corejs3/core-js/get-iterator");

          var _isIterable = require("@babel/runtime-corejs3/core-js/is-iterable");

          var _Symbol = require("@babel/runtime-corejs3/core-js/symbol");

          function _iterableToArrayLimit(arr, i) {
            if (typeof _Symbol === "undefined" || !_isIterable(Object(arr)))
              return;
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = undefined;

            try {
              for (
                var _i = _getIterator(arr), _s;
                !(_n = (_s = _i.next()).done);
                _n = true
              ) {
                _arr.push(_s.value);

                if (i && _arr.length === i) break;
              }
            } catch (err) {
              _d = true;
              _e = err;
            } finally {
              try {
                if (!_n && _i["return"] != null) _i["return"]();
              } finally {
                if (_d) throw _e;
              }
            }

            return _arr;
          }

          module.exports = _iterableToArrayLimit;
        },
        {
          "@babel/runtime-corejs3/core-js/get-iterator": 22,
          "@babel/runtime-corejs3/core-js/is-iterable": 24,
          "@babel/runtime-corejs3/core-js/symbol": 25,
        },
      ],
      30: [
        function (require, module, exports) {
          function _nonIterableRest() {
            throw new TypeError(
              "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
            );
          }

          module.exports = _nonIterableRest;
        },
        {},
      ],
      31: [
        function (require, module, exports) {
          var arrayWithHoles = require("./arrayWithHoles");

          var iterableToArrayLimit = require("./iterableToArrayLimit");

          var unsupportedIterableToArray = require("./unsupportedIterableToArray");

          var nonIterableRest = require("./nonIterableRest");

          function _slicedToArray(arr, i) {
            return (
              arrayWithHoles(arr) ||
              iterableToArrayLimit(arr, i) ||
              unsupportedIterableToArray(arr, i) ||
              nonIterableRest()
            );
          }

          module.exports = _slicedToArray;
        },
        {
          "./arrayWithHoles": 27,
          "./iterableToArrayLimit": 29,
          "./nonIterableRest": 30,
          "./unsupportedIterableToArray": 32,
        },
      ],
      32: [
        function (require, module, exports) {
          var _Array$from = require("@babel/runtime-corejs3/core-js/array/from");

          var _sliceInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/slice");

          var arrayLikeToArray = require("./arrayLikeToArray");

          function _unsupportedIterableToArray(o, minLen) {
            var _context;

            if (!o) return;
            if (typeof o === "string") return arrayLikeToArray(o, minLen);

            var n = _sliceInstanceProperty(
              (_context = Object.prototype.toString.call(o))
            ).call(_context, 8, -1);

            if (n === "Object" && o.constructor) n = o.constructor.name;
            if (n === "Map" || n === "Set") return _Array$from(o);
            if (
              n === "Arguments" ||
              /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
            )
              return arrayLikeToArray(o, minLen);
          }

          module.exports = _unsupportedIterableToArray;
        },
        {
          "./arrayLikeToArray": 26,
          "@babel/runtime-corejs3/core-js/array/from": 19,
          "@babel/runtime-corejs3/core-js/instance/slice": 23,
        },
      ],
      33: [
        function (require, module, exports) {
          require("../../modules/es.string.iterator");
          require("../../modules/es.array.from");
          var path = require("../../internals/path");

          module.exports = path.Array.from;
        },
        {
          "../../internals/path": 130,
          "../../modules/es.array.from": 155,
          "../../modules/es.string.iterator": 170,
        },
      ],
      34: [
        function (require, module, exports) {
          require("../../modules/es.array.is-array");
          var path = require("../../internals/path");

          module.exports = path.Array.isArray;
        },
        { "../../internals/path": 130, "../../modules/es.array.is-array": 157 },
      ],
      35: [
        function (require, module, exports) {
          require("../../../modules/es.array.concat");
          var entryVirtual = require("../../../internals/entry-virtual");

          module.exports = entryVirtual("Array").concat;
        },
        {
          "../../../internals/entry-virtual": 90,
          "../../../modules/es.array.concat": 153,
        },
      ],
      36: [
        function (require, module, exports) {
          require("../../../modules/es.array.for-each");
          var entryVirtual = require("../../../internals/entry-virtual");

          module.exports = entryVirtual("Array").forEach;
        },
        {
          "../../../internals/entry-virtual": 90,
          "../../../modules/es.array.for-each": 154,
        },
      ],
      37: [
        function (require, module, exports) {
          require("../../../modules/es.array.index-of");
          var entryVirtual = require("../../../internals/entry-virtual");

          module.exports = entryVirtual("Array").indexOf;
        },
        {
          "../../../internals/entry-virtual": 90,
          "../../../modules/es.array.index-of": 156,
        },
      ],
      38: [
        function (require, module, exports) {
          require("../../../modules/es.array.map");
          var entryVirtual = require("../../../internals/entry-virtual");

          module.exports = entryVirtual("Array").map;
        },
        {
          "../../../internals/entry-virtual": 90,
          "../../../modules/es.array.map": 159,
        },
      ],
      39: [
        function (require, module, exports) {
          require("../../../modules/es.array.reduce");
          var entryVirtual = require("../../../internals/entry-virtual");

          module.exports = entryVirtual("Array").reduce;
        },
        {
          "../../../internals/entry-virtual": 90,
          "../../../modules/es.array.reduce": 160,
        },
      ],
      40: [
        function (require, module, exports) {
          require("../../../modules/es.array.slice");
          var entryVirtual = require("../../../internals/entry-virtual");

          module.exports = entryVirtual("Array").slice;
        },
        {
          "../../../internals/entry-virtual": 90,
          "../../../modules/es.array.slice": 161,
        },
      ],
      41: [
        function (require, module, exports) {
          require("../../../modules/es.array.sort");
          var entryVirtual = require("../../../internals/entry-virtual");

          module.exports = entryVirtual("Array").sort;
        },
        {
          "../../../internals/entry-virtual": 90,
          "../../../modules/es.array.sort": 162,
        },
      ],
      42: [
        function (require, module, exports) {
          var concat = require("../array/virtual/concat");

          var ArrayPrototype = Array.prototype;

          module.exports = function (it) {
            var own = it.concat;
            return it === ArrayPrototype ||
              (it instanceof Array && own === ArrayPrototype.concat)
              ? concat
              : own;
          };
        },
        { "../array/virtual/concat": 35 },
      ],
      43: [
        function (require, module, exports) {
          var flags = require("../regexp/flags");

          var RegExpPrototype = RegExp.prototype;

          module.exports = function (it) {
            return (it === RegExpPrototype || it instanceof RegExp) &&
              !("flags" in it)
              ? flags(it)
              : it.flags;
          };
        },
        { "../regexp/flags": 52 },
      ],
      44: [
        function (require, module, exports) {
          var indexOf = require("../array/virtual/index-of");

          var ArrayPrototype = Array.prototype;

          module.exports = function (it) {
            var own = it.indexOf;
            return it === ArrayPrototype ||
              (it instanceof Array && own === ArrayPrototype.indexOf)
              ? indexOf
              : own;
          };
        },
        { "../array/virtual/index-of": 37 },
      ],
      45: [
        function (require, module, exports) {
          var map = require("../array/virtual/map");

          var ArrayPrototype = Array.prototype;

          module.exports = function (it) {
            var own = it.map;
            return it === ArrayPrototype ||
              (it instanceof Array && own === ArrayPrototype.map)
              ? map
              : own;
          };
        },
        { "../array/virtual/map": 38 },
      ],
      46: [
        function (require, module, exports) {
          var reduce = require("../array/virtual/reduce");

          var ArrayPrototype = Array.prototype;

          module.exports = function (it) {
            var own = it.reduce;
            return it === ArrayPrototype ||
              (it instanceof Array && own === ArrayPrototype.reduce)
              ? reduce
              : own;
          };
        },
        { "../array/virtual/reduce": 39 },
      ],
      47: [
        function (require, module, exports) {
          var slice = require("../array/virtual/slice");

          var ArrayPrototype = Array.prototype;

          module.exports = function (it) {
            var own = it.slice;
            return it === ArrayPrototype ||
              (it instanceof Array && own === ArrayPrototype.slice)
              ? slice
              : own;
          };
        },
        { "../array/virtual/slice": 40 },
      ],
      48: [
        function (require, module, exports) {
          var sort = require("../array/virtual/sort");

          var ArrayPrototype = Array.prototype;

          module.exports = function (it) {
            var own = it.sort;
            return it === ArrayPrototype ||
              (it instanceof Array && own === ArrayPrototype.sort)
              ? sort
              : own;
          };
        },
        { "../array/virtual/sort": 41 },
      ],
      49: [
        function (require, module, exports) {
          require("../../modules/es.object.create");
          var path = require("../../internals/path");

          var Object = path.Object;

          module.exports = function create(P, D) {
            return Object.create(P, D);
          };
        },
        { "../../internals/path": 130, "../../modules/es.object.create": 165 },
      ],
      50: [
        function (require, module, exports) {
          require("../../modules/es.object.define-property");
          var path = require("../../internals/path");

          var Object = path.Object;

          var defineProperty = (module.exports = function defineProperty(
            it,
            key,
            desc
          ) {
            return Object.defineProperty(it, key, desc);
          });

          if (Object.defineProperty.sham) defineProperty.sham = true;
        },
        {
          "../../internals/path": 130,
          "../../modules/es.object.define-property": 166,
        },
      ],
      51: [
        function (require, module, exports) {
          require("../modules/es.parse-int");
          var path = require("../internals/path");

          module.exports = path.parseInt;
        },
        { "../internals/path": 130, "../modules/es.parse-int": 168 },
      ],
      52: [
        function (require, module, exports) {
          require("../../modules/es.regexp.flags");
          var flags = require("../../internals/regexp-flags");

          module.exports = function (it) {
            return flags.call(it);
          };
        },
        {
          "../../internals/regexp-flags": 132,
          "../../modules/es.regexp.flags": 169,
        },
      ],
      53: [
        function (require, module, exports) {
          require("../../modules/es.array.concat");
          require("../../modules/es.object.to-string");
          require("../../modules/es.symbol");
          require("../../modules/es.symbol.async-iterator");
          require("../../modules/es.symbol.description");
          require("../../modules/es.symbol.has-instance");
          require("../../modules/es.symbol.is-concat-spreadable");
          require("../../modules/es.symbol.iterator");
          require("../../modules/es.symbol.match");
          require("../../modules/es.symbol.match-all");
          require("../../modules/es.symbol.replace");
          require("../../modules/es.symbol.search");
          require("../../modules/es.symbol.species");
          require("../../modules/es.symbol.split");
          require("../../modules/es.symbol.to-primitive");
          require("../../modules/es.symbol.to-string-tag");
          require("../../modules/es.symbol.unscopables");
          require("../../modules/es.math.to-string-tag");
          require("../../modules/es.json.to-string-tag");
          var path = require("../../internals/path");

          module.exports = path.Symbol;
        },
        {
          "../../internals/path": 130,
          "../../modules/es.array.concat": 153,
          "../../modules/es.json.to-string-tag": 163,
          "../../modules/es.math.to-string-tag": 164,
          "../../modules/es.object.to-string": 167,
          "../../modules/es.symbol": 176,
          "../../modules/es.symbol.async-iterator": 171,
          "../../modules/es.symbol.description": 172,
          "../../modules/es.symbol.has-instance": 173,
          "../../modules/es.symbol.is-concat-spreadable": 174,
          "../../modules/es.symbol.iterator": 175,
          "../../modules/es.symbol.match": 178,
          "../../modules/es.symbol.match-all": 177,
          "../../modules/es.symbol.replace": 179,
          "../../modules/es.symbol.search": 180,
          "../../modules/es.symbol.species": 181,
          "../../modules/es.symbol.split": 182,
          "../../modules/es.symbol.to-primitive": 183,
          "../../modules/es.symbol.to-string-tag": 184,
          "../../modules/es.symbol.unscopables": 185,
        },
      ],
      54: [
        function (require, module, exports) {
          var parent = require("../../es/array/from");

          module.exports = parent;
        },
        { "../../es/array/from": 33 },
      ],
      55: [
        function (require, module, exports) {
          var parent = require("../../es/array/is-array");

          module.exports = parent;
        },
        { "../../es/array/is-array": 34 },
      ],
      56: [
        function (require, module, exports) {
          require("../modules/web.dom-collections.iterator");
          require("../modules/es.string.iterator");
          var getIteratorMethod = require("../internals/get-iterator-method");

          module.exports = getIteratorMethod;
        },
        {
          "../internals/get-iterator-method": 96,
          "../modules/es.string.iterator": 170,
          "../modules/web.dom-collections.iterator": 191,
        },
      ],
      57: [
        function (require, module, exports) {
          require("../modules/web.dom-collections.iterator");
          require("../modules/es.string.iterator");
          var getIterator = require("../internals/get-iterator");

          module.exports = getIterator;
        },
        {
          "../internals/get-iterator": 97,
          "../modules/es.string.iterator": 170,
          "../modules/web.dom-collections.iterator": 191,
        },
      ],
      58: [
        function (require, module, exports) {
          var parent = require("../../es/instance/slice");

          module.exports = parent;
        },
        { "../../es/instance/slice": 47 },
      ],
      59: [
        function (require, module, exports) {
          require("../modules/web.dom-collections.iterator");
          require("../modules/es.string.iterator");
          var isIterable = require("../internals/is-iterable");

          module.exports = isIterable;
        },
        {
          "../internals/is-iterable": 109,
          "../modules/es.string.iterator": 170,
          "../modules/web.dom-collections.iterator": 191,
        },
      ],
      60: [
        function (require, module, exports) {
          var parent = require("../../es/symbol");
          require("../../modules/esnext.symbol.async-dispose");
          require("../../modules/esnext.symbol.dispose");
          require("../../modules/esnext.symbol.observable");
          require("../../modules/esnext.symbol.pattern-match");
          // TODO: Remove from `core-js@4`
          require("../../modules/esnext.symbol.replace-all");

          module.exports = parent;
        },
        {
          "../../es/symbol": 53,
          "../../modules/esnext.symbol.async-dispose": 186,
          "../../modules/esnext.symbol.dispose": 187,
          "../../modules/esnext.symbol.observable": 188,
          "../../modules/esnext.symbol.pattern-match": 189,
          "../../modules/esnext.symbol.replace-all": 190,
        },
      ],
      61: [
        function (require, module, exports) {
          module.exports = function (it) {
            if (typeof it != "function") {
              throw TypeError(String(it) + " is not a function");
            }
            return it;
          };
        },
        {},
      ],
      62: [
        function (require, module, exports) {
          var isObject = require("../internals/is-object");

          module.exports = function (it) {
            if (!isObject(it) && it !== null) {
              throw TypeError("Can't set " + String(it) + " as a prototype");
            }
            return it;
          };
        },
        { "../internals/is-object": 110 },
      ],
      63: [
        function (require, module, exports) {
          module.exports = function () {
            /* empty */
          };
        },
        {},
      ],
      64: [
        function (require, module, exports) {
          var isObject = require("../internals/is-object");

          module.exports = function (it) {
            if (!isObject(it)) {
              throw TypeError(String(it) + " is not an object");
            }
            return it;
          };
        },
        { "../internals/is-object": 110 },
      ],
      65: [
        function (require, module, exports) {
          "use strict";
          var $forEach = require("../internals/array-iteration").forEach;
          var arrayMethodIsStrict = require("../internals/array-method-is-strict");
          var arrayMethodUsesToLength = require("../internals/array-method-uses-to-length");

          var STRICT_METHOD = arrayMethodIsStrict("forEach");
          var USES_TO_LENGTH = arrayMethodUsesToLength("forEach");

          // `Array.prototype.forEach` method implementation
          // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
          module.exports =
            !STRICT_METHOD || !USES_TO_LENGTH
              ? function forEach(callbackfn /* , thisArg */) {
                  return $forEach(
                    this,
                    callbackfn,
                    arguments.length > 1 ? arguments[1] : undefined
                  );
                }
              : [].forEach;
        },
        {
          "../internals/array-iteration": 68,
          "../internals/array-method-is-strict": 70,
          "../internals/array-method-uses-to-length": 71,
        },
      ],
      66: [
        function (require, module, exports) {
          "use strict";
          var bind = require("../internals/function-bind-context");
          var toObject = require("../internals/to-object");
          var callWithSafeIterationClosing = require("../internals/call-with-safe-iteration-closing");
          var isArrayIteratorMethod = require("../internals/is-array-iterator-method");
          var toLength = require("../internals/to-length");
          var createProperty = require("../internals/create-property");
          var getIteratorMethod = require("../internals/get-iterator-method");

          // `Array.from` method implementation
          // https://tc39.github.io/ecma262/#sec-array.from
          module.exports = function from(
            arrayLike /* , mapfn = undefined, thisArg = undefined */
          ) {
            var O = toObject(arrayLike);
            var C = typeof this == "function" ? this : Array;
            var argumentsLength = arguments.length;
            var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
            var mapping = mapfn !== undefined;
            var iteratorMethod = getIteratorMethod(O);
            var index = 0;
            var length, result, step, iterator, next, value;
            if (mapping)
              mapfn = bind(
                mapfn,
                argumentsLength > 2 ? arguments[2] : undefined,
                2
              );
            // if the target is not iterable or it's an array with the default iterator - use a simple case
            if (
              iteratorMethod != undefined &&
              !(C == Array && isArrayIteratorMethod(iteratorMethod))
            ) {
              iterator = iteratorMethod.call(O);
              next = iterator.next;
              result = new C();
              for (; !(step = next.call(iterator)).done; index++) {
                value = mapping
                  ? callWithSafeIterationClosing(
                      iterator,
                      mapfn,
                      [step.value, index],
                      true
                    )
                  : step.value;
                createProperty(result, index, value);
              }
            } else {
              length = toLength(O.length);
              result = new C(length);
              for (; length > index; index++) {
                value = mapping ? mapfn(O[index], index) : O[index];
                createProperty(result, index, value);
              }
            }
            result.length = index;
            return result;
          };
        },
        {
          "../internals/call-with-safe-iteration-closing": 74,
          "../internals/create-property": 82,
          "../internals/function-bind-context": 94,
          "../internals/get-iterator-method": 96,
          "../internals/is-array-iterator-method": 106,
          "../internals/to-length": 144,
          "../internals/to-object": 145,
        },
      ],
      67: [
        function (require, module, exports) {
          var toIndexedObject = require("../internals/to-indexed-object");
          var toLength = require("../internals/to-length");
          var toAbsoluteIndex = require("../internals/to-absolute-index");

          // `Array.prototype.{ indexOf, includes }` methods implementation
          var createMethod = function (IS_INCLUDES) {
            return function ($this, el, fromIndex) {
              var O = toIndexedObject($this);
              var length = toLength(O.length);
              var index = toAbsoluteIndex(fromIndex, length);
              var value;
              // Array#includes uses SameValueZero equality algorithm
              // eslint-disable-next-line no-self-compare
              if (IS_INCLUDES && el != el)
                while (length > index) {
                  value = O[index++];
                  // eslint-disable-next-line no-self-compare
                  if (value != value) return true;
                  // Array#indexOf ignores holes, Array#includes - not
                }
              else
                for (; length > index; index++) {
                  if ((IS_INCLUDES || index in O) && O[index] === el)
                    return IS_INCLUDES || index || 0;
                }
              return !IS_INCLUDES && -1;
            };
          };

          module.exports = {
            // `Array.prototype.includes` method
            // https://tc39.github.io/ecma262/#sec-array.prototype.includes
            includes: createMethod(true),
            // `Array.prototype.indexOf` method
            // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
            indexOf: createMethod(false),
          };
        },
        {
          "../internals/to-absolute-index": 141,
          "../internals/to-indexed-object": 142,
          "../internals/to-length": 144,
        },
      ],
      68: [
        function (require, module, exports) {
          var bind = require("../internals/function-bind-context");
          var IndexedObject = require("../internals/indexed-object");
          var toObject = require("../internals/to-object");
          var toLength = require("../internals/to-length");
          var arraySpeciesCreate = require("../internals/array-species-create");

          var push = [].push;

          // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
          var createMethod = function (TYPE) {
            var IS_MAP = TYPE == 1;
            var IS_FILTER = TYPE == 2;
            var IS_SOME = TYPE == 3;
            var IS_EVERY = TYPE == 4;
            var IS_FIND_INDEX = TYPE == 6;
            var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
            return function ($this, callbackfn, that, specificCreate) {
              var O = toObject($this);
              var self = IndexedObject(O);
              var boundFunction = bind(callbackfn, that, 3);
              var length = toLength(self.length);
              var index = 0;
              var create = specificCreate || arraySpeciesCreate;
              var target = IS_MAP
                ? create($this, length)
                : IS_FILTER
                ? create($this, 0)
                : undefined;
              var value, result;
              for (; length > index; index++)
                if (NO_HOLES || index in self) {
                  value = self[index];
                  result = boundFunction(value, index, O);
                  if (TYPE) {
                    if (IS_MAP) target[index] = result;
                    // map
                    else if (result)
                      switch (TYPE) {
                        case 3:
                          return true; // some
                        case 5:
                          return value; // find
                        case 6:
                          return index; // findIndex
                        case 2:
                          push.call(target, value); // filter
                      }
                    else if (IS_EVERY) return false; // every
                  }
                }
              return IS_FIND_INDEX
                ? -1
                : IS_SOME || IS_EVERY
                ? IS_EVERY
                : target;
            };
          };

          module.exports = {
            // `Array.prototype.forEach` method
            // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
            forEach: createMethod(0),
            // `Array.prototype.map` method
            // https://tc39.github.io/ecma262/#sec-array.prototype.map
            map: createMethod(1),
            // `Array.prototype.filter` method
            // https://tc39.github.io/ecma262/#sec-array.prototype.filter
            filter: createMethod(2),
            // `Array.prototype.some` method
            // https://tc39.github.io/ecma262/#sec-array.prototype.some
            some: createMethod(3),
            // `Array.prototype.every` method
            // https://tc39.github.io/ecma262/#sec-array.prototype.every
            every: createMethod(4),
            // `Array.prototype.find` method
            // https://tc39.github.io/ecma262/#sec-array.prototype.find
            find: createMethod(5),
            // `Array.prototype.findIndex` method
            // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
            findIndex: createMethod(6),
          };
        },
        {
          "../internals/array-species-create": 73,
          "../internals/function-bind-context": 94,
          "../internals/indexed-object": 103,
          "../internals/to-length": 144,
          "../internals/to-object": 145,
        },
      ],
      69: [
        function (require, module, exports) {
          var fails = require("../internals/fails");
          var wellKnownSymbol = require("../internals/well-known-symbol");
          var V8_VERSION = require("../internals/engine-v8-version");

          var SPECIES = wellKnownSymbol("species");

          module.exports = function (METHOD_NAME) {
            // We can't use this feature detection in V8 since it causes
            // deoptimization and serious performance degradation
            // https://github.com/zloirock/core-js/issues/677
            return (
              V8_VERSION >= 51 ||
              !fails(function () {
                var array = [];
                var constructor = (array.constructor = {});
                constructor[SPECIES] = function () {
                  return { foo: 1 };
                };
                return array[METHOD_NAME](Boolean).foo !== 1;
              })
            );
          };
        },
        {
          "../internals/engine-v8-version": 89,
          "../internals/fails": 93,
          "../internals/well-known-symbol": 151,
        },
      ],
      70: [
        function (require, module, exports) {
          "use strict";
          var fails = require("../internals/fails");

          module.exports = function (METHOD_NAME, argument) {
            var method = [][METHOD_NAME];
            return (
              !!method &&
              fails(function () {
                // eslint-disable-next-line no-useless-call,no-throw-literal
                method.call(
                  null,
                  argument ||
                    function () {
                      throw 1;
                    },
                  1
                );
              })
            );
          };
        },
        { "../internals/fails": 93 },
      ],
      71: [
        function (require, module, exports) {
          var DESCRIPTORS = require("../internals/descriptors");
          var fails = require("../internals/fails");
          var has = require("../internals/has");

          var defineProperty = Object.defineProperty;
          var cache = {};

          var thrower = function (it) {
            throw it;
          };

          module.exports = function (METHOD_NAME, options) {
            if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
            if (!options) options = {};
            var method = [][METHOD_NAME];
            var ACCESSORS = has(options, "ACCESSORS")
              ? options.ACCESSORS
              : false;
            var argument0 = has(options, 0) ? options[0] : thrower;
            var argument1 = has(options, 1) ? options[1] : undefined;

            return (cache[METHOD_NAME] =
              !!method &&
              !fails(function () {
                if (ACCESSORS && !DESCRIPTORS) return true;
                var O = { length: -1 };

                if (ACCESSORS)
                  defineProperty(O, 1, { enumerable: true, get: thrower });
                else O[1] = 1;

                method.call(O, argument0, argument1);
              }));
          };
        },
        {
          "../internals/descriptors": 85,
          "../internals/fails": 93,
          "../internals/has": 99,
        },
      ],
      72: [
        function (require, module, exports) {
          var aFunction = require("../internals/a-function");
          var toObject = require("../internals/to-object");
          var IndexedObject = require("../internals/indexed-object");
          var toLength = require("../internals/to-length");

          // `Array.prototype.{ reduce, reduceRight }` methods implementation
          var createMethod = function (IS_RIGHT) {
            return function (that, callbackfn, argumentsLength, memo) {
              aFunction(callbackfn);
              var O = toObject(that);
              var self = IndexedObject(O);
              var length = toLength(O.length);
              var index = IS_RIGHT ? length - 1 : 0;
              var i = IS_RIGHT ? -1 : 1;
              if (argumentsLength < 2)
                while (true) {
                  if (index in self) {
                    memo = self[index];
                    index += i;
                    break;
                  }
                  index += i;
                  if (IS_RIGHT ? index < 0 : length <= index) {
                    throw TypeError(
                      "Reduce of empty array with no initial value"
                    );
                  }
                }
              for (; IS_RIGHT ? index >= 0 : length > index; index += i)
                if (index in self) {
                  memo = callbackfn(memo, self[index], index, O);
                }
              return memo;
            };
          };

          module.exports = {
            // `Array.prototype.reduce` method
            // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
            left: createMethod(false),
            // `Array.prototype.reduceRight` method
            // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
            right: createMethod(true),
          };
        },
        {
          "../internals/a-function": 61,
          "../internals/indexed-object": 103,
          "../internals/to-length": 144,
          "../internals/to-object": 145,
        },
      ],
      73: [
        function (require, module, exports) {
          var isObject = require("../internals/is-object");
          var isArray = require("../internals/is-array");
          var wellKnownSymbol = require("../internals/well-known-symbol");

          var SPECIES = wellKnownSymbol("species");

          // `ArraySpeciesCreate` abstract operation
          // https://tc39.github.io/ecma262/#sec-arrayspeciescreate
          module.exports = function (originalArray, length) {
            var C;
            if (isArray(originalArray)) {
              C = originalArray.constructor;
              // cross-realm fallback
              if (
                typeof C == "function" &&
                (C === Array || isArray(C.prototype))
              )
                C = undefined;
              else if (isObject(C)) {
                C = C[SPECIES];
                if (C === null) C = undefined;
              }
            }
            return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
          };
        },
        {
          "../internals/is-array": 107,
          "../internals/is-object": 110,
          "../internals/well-known-symbol": 151,
        },
      ],
      74: [
        function (require, module, exports) {
          var anObject = require("../internals/an-object");

          // call something on iterator step with safe closing on error
          module.exports = function (iterator, fn, value, ENTRIES) {
            try {
              return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
              // 7.4.6 IteratorClose(iterator, completion)
            } catch (error) {
              var returnMethod = iterator["return"];
              if (returnMethod !== undefined)
                anObject(returnMethod.call(iterator));
              throw error;
            }
          };
        },
        { "../internals/an-object": 64 },
      ],
      75: [
        function (require, module, exports) {
          var wellKnownSymbol = require("../internals/well-known-symbol");

          var ITERATOR = wellKnownSymbol("iterator");
          var SAFE_CLOSING = false;

          try {
            var called = 0;
            var iteratorWithReturn = {
              next: function () {
                return { done: !!called++ };
              },
              return: function () {
                SAFE_CLOSING = true;
              },
            };
            iteratorWithReturn[ITERATOR] = function () {
              return this;
            };
            // eslint-disable-next-line no-throw-literal
            Array.from(iteratorWithReturn, function () {
              throw 2;
            });
          } catch (error) {
            /* empty */
          }

          module.exports = function (exec, SKIP_CLOSING) {
            if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
            var ITERATION_SUPPORT = false;
            try {
              var object = {};
              object[ITERATOR] = function () {
                return {
                  next: function () {
                    return { done: (ITERATION_SUPPORT = true) };
                  },
                };
              };
              exec(object);
            } catch (error) {
              /* empty */
            }
            return ITERATION_SUPPORT;
          };
        },
        { "../internals/well-known-symbol": 151 },
      ],
      76: [
        function (require, module, exports) {
          var toString = {}.toString;

          module.exports = function (it) {
            return toString.call(it).slice(8, -1);
          };
        },
        {},
      ],
      77: [
        function (require, module, exports) {
          var TO_STRING_TAG_SUPPORT = require("../internals/to-string-tag-support");
          var classofRaw = require("../internals/classof-raw");
          var wellKnownSymbol = require("../internals/well-known-symbol");

          var TO_STRING_TAG = wellKnownSymbol("toStringTag");
          // ES3 wrong here
          var CORRECT_ARGUMENTS =
            classofRaw(
              (function () {
                return arguments;
              })()
            ) == "Arguments";

          // fallback for IE11 Script Access Denied error
          var tryGet = function (it, key) {
            try {
              return it[key];
            } catch (error) {
              /* empty */
            }
          };

          // getting tag from ES6+ `Object.prototype.toString`
          module.exports = TO_STRING_TAG_SUPPORT
            ? classofRaw
            : function (it) {
                var O, tag, result;
                return it === undefined
                  ? "Undefined"
                  : it === null
                  ? "Null"
                  : // @@toStringTag case
                  typeof (tag = tryGet((O = Object(it)), TO_STRING_TAG)) ==
                    "string"
                  ? tag
                  : // builtinTag case
                  CORRECT_ARGUMENTS
                  ? classofRaw(O)
                  : // ES3 arguments fallback
                  (result = classofRaw(O)) == "Object" &&
                    typeof O.callee == "function"
                  ? "Arguments"
                  : result;
              };
        },
        {
          "../internals/classof-raw": 76,
          "../internals/to-string-tag-support": 147,
          "../internals/well-known-symbol": 151,
        },
      ],
      78: [
        function (require, module, exports) {
          var fails = require("../internals/fails");

          module.exports = !fails(function () {
            function F() {
              /* empty */
            }
            F.prototype.constructor = null;
            return Object.getPrototypeOf(new F()) !== F.prototype;
          });
        },
        { "../internals/fails": 93 },
      ],
      79: [
        function (require, module, exports) {
          "use strict";
          var IteratorPrototype =
            require("../internals/iterators-core").IteratorPrototype;
          var create = require("../internals/object-create");
          var createPropertyDescriptor = require("../internals/create-property-descriptor");
          var setToStringTag = require("../internals/set-to-string-tag");
          var Iterators = require("../internals/iterators");

          var returnThis = function () {
            return this;
          };

          module.exports = function (IteratorConstructor, NAME, next) {
            var TO_STRING_TAG = NAME + " Iterator";
            IteratorConstructor.prototype = create(IteratorPrototype, {
              next: createPropertyDescriptor(1, next),
            });
            setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
            Iterators[TO_STRING_TAG] = returnThis;
            return IteratorConstructor;
          };
        },
        {
          "../internals/create-property-descriptor": 81,
          "../internals/iterators": 113,
          "../internals/iterators-core": 112,
          "../internals/object-create": 117,
          "../internals/set-to-string-tag": 135,
        },
      ],
      80: [
        function (require, module, exports) {
          var DESCRIPTORS = require("../internals/descriptors");
          var definePropertyModule = require("../internals/object-define-property");
          var createPropertyDescriptor = require("../internals/create-property-descriptor");

          module.exports = DESCRIPTORS
            ? function (object, key, value) {
                return definePropertyModule.f(
                  object,
                  key,
                  createPropertyDescriptor(1, value)
                );
              }
            : function (object, key, value) {
                object[key] = value;
                return object;
              };
        },
        {
          "../internals/create-property-descriptor": 81,
          "../internals/descriptors": 85,
          "../internals/object-define-property": 119,
        },
      ],
      81: [
        function (require, module, exports) {
          module.exports = function (bitmap, value) {
            return {
              enumerable: !(bitmap & 1),
              configurable: !(bitmap & 2),
              writable: !(bitmap & 4),
              value: value,
            };
          };
        },
        {},
      ],
      82: [
        function (require, module, exports) {
          "use strict";
          var toPrimitive = require("../internals/to-primitive");
          var definePropertyModule = require("../internals/object-define-property");
          var createPropertyDescriptor = require("../internals/create-property-descriptor");

          module.exports = function (object, key, value) {
            var propertyKey = toPrimitive(key);
            if (propertyKey in object)
              definePropertyModule.f(
                object,
                propertyKey,
                createPropertyDescriptor(0, value)
              );
            else object[propertyKey] = value;
          };
        },
        {
          "../internals/create-property-descriptor": 81,
          "../internals/object-define-property": 119,
          "../internals/to-primitive": 146,
        },
      ],
      83: [
        function (require, module, exports) {
          "use strict";
          var $ = require("../internals/export");
          var createIteratorConstructor = require("../internals/create-iterator-constructor");
          var getPrototypeOf = require("../internals/object-get-prototype-of");
          var setPrototypeOf = require("../internals/object-set-prototype-of");
          var setToStringTag = require("../internals/set-to-string-tag");
          var createNonEnumerableProperty = require("../internals/create-non-enumerable-property");
          var redefine = require("../internals/redefine");
          var wellKnownSymbol = require("../internals/well-known-symbol");
          var IS_PURE = require("../internals/is-pure");
          var Iterators = require("../internals/iterators");
          var IteratorsCore = require("../internals/iterators-core");

          var IteratorPrototype = IteratorsCore.IteratorPrototype;
          var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
          var ITERATOR = wellKnownSymbol("iterator");
          var KEYS = "keys";
          var VALUES = "values";
          var ENTRIES = "entries";

          var returnThis = function () {
            return this;
          };

          module.exports = function (
            Iterable,
            NAME,
            IteratorConstructor,
            next,
            DEFAULT,
            IS_SET,
            FORCED
          ) {
            createIteratorConstructor(IteratorConstructor, NAME, next);

            var getIterationMethod = function (KIND) {
              if (KIND === DEFAULT && defaultIterator) return defaultIterator;
              if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype)
                return IterablePrototype[KIND];
              switch (KIND) {
                case KEYS:
                  return function keys() {
                    return new IteratorConstructor(this, KIND);
                  };
                case VALUES:
                  return function values() {
                    return new IteratorConstructor(this, KIND);
                  };
                case ENTRIES:
                  return function entries() {
                    return new IteratorConstructor(this, KIND);
                  };
              }
              return function () {
                return new IteratorConstructor(this);
              };
            };

            var TO_STRING_TAG = NAME + " Iterator";
            var INCORRECT_VALUES_NAME = false;
            var IterablePrototype = Iterable.prototype;
            var nativeIterator =
              IterablePrototype[ITERATOR] ||
              IterablePrototype["@@iterator"] ||
              (DEFAULT && IterablePrototype[DEFAULT]);
            var defaultIterator =
              (!BUGGY_SAFARI_ITERATORS && nativeIterator) ||
              getIterationMethod(DEFAULT);
            var anyNativeIterator =
              NAME == "Array"
                ? IterablePrototype.entries || nativeIterator
                : nativeIterator;
            var CurrentIteratorPrototype, methods, KEY;

            // fix native
            if (anyNativeIterator) {
              CurrentIteratorPrototype = getPrototypeOf(
                anyNativeIterator.call(new Iterable())
              );
              if (
                IteratorPrototype !== Object.prototype &&
                CurrentIteratorPrototype.next
              ) {
                if (
                  !IS_PURE &&
                  getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype
                ) {
                  if (setPrototypeOf) {
                    setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
                  } else if (
                    typeof CurrentIteratorPrototype[ITERATOR] != "function"
                  ) {
                    createNonEnumerableProperty(
                      CurrentIteratorPrototype,
                      ITERATOR,
                      returnThis
                    );
                  }
                }
                // Set @@toStringTag to native iterators
                setToStringTag(
                  CurrentIteratorPrototype,
                  TO_STRING_TAG,
                  true,
                  true
                );
                if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
              }
            }

            // fix Array#{values, @@iterator}.name in V8 / FF
            if (
              DEFAULT == VALUES &&
              nativeIterator &&
              nativeIterator.name !== VALUES
            ) {
              INCORRECT_VALUES_NAME = true;
              defaultIterator = function values() {
                return nativeIterator.call(this);
              };
            }

            // define iterator
            if (
              (!IS_PURE || FORCED) &&
              IterablePrototype[ITERATOR] !== defaultIterator
            ) {
              createNonEnumerableProperty(
                IterablePrototype,
                ITERATOR,
                defaultIterator
              );
            }
            Iterators[NAME] = defaultIterator;

            // export additional methods
            if (DEFAULT) {
              methods = {
                values: getIterationMethod(VALUES),
                keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
                entries: getIterationMethod(ENTRIES),
              };
              if (FORCED)
                for (KEY in methods) {
                  if (
                    BUGGY_SAFARI_ITERATORS ||
                    INCORRECT_VALUES_NAME ||
                    !(KEY in IterablePrototype)
                  ) {
                    redefine(IterablePrototype, KEY, methods[KEY]);
                  }
                }
              else
                $(
                  {
                    target: NAME,
                    proto: true,
                    forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME,
                  },
                  methods
                );
            }

            return methods;
          };
        },
        {
          "../internals/create-iterator-constructor": 79,
          "../internals/create-non-enumerable-property": 80,
          "../internals/export": 92,
          "../internals/is-pure": 111,
          "../internals/iterators": 113,
          "../internals/iterators-core": 112,
          "../internals/object-get-prototype-of": 124,
          "../internals/object-set-prototype-of": 128,
          "../internals/redefine": 131,
          "../internals/set-to-string-tag": 135,
          "../internals/well-known-symbol": 151,
        },
      ],
      84: [
        function (require, module, exports) {
          var path = require("../internals/path");
          var has = require("../internals/has");
          var wrappedWellKnownSymbolModule = require("../internals/well-known-symbol-wrapped");
          var defineProperty = require("../internals/object-define-property").f;

          module.exports = function (NAME) {
            var Symbol = path.Symbol || (path.Symbol = {});
            if (!has(Symbol, NAME))
              defineProperty(Symbol, NAME, {
                value: wrappedWellKnownSymbolModule.f(NAME),
              });
          };
        },
        {
          "../internals/has": 99,
          "../internals/object-define-property": 119,
          "../internals/path": 130,
          "../internals/well-known-symbol-wrapped": 150,
        },
      ],
      85: [
        function (require, module, exports) {
          var fails = require("../internals/fails");

          // Thank's IE8 for his funny defineProperty
          module.exports = !fails(function () {
            return (
              Object.defineProperty({}, 1, {
                get: function () {
                  return 7;
                },
              })[1] != 7
            );
          });
        },
        { "../internals/fails": 93 },
      ],
      86: [
        function (require, module, exports) {
          var global = require("../internals/global");
          var isObject = require("../internals/is-object");

          var document = global.document;
          // typeof document.createElement is 'object' in old IE
          var EXISTS = isObject(document) && isObject(document.createElement);

          module.exports = function (it) {
            return EXISTS ? document.createElement(it) : {};
          };
        },
        { "../internals/global": 98, "../internals/is-object": 110 },
      ],
      87: [
        function (require, module, exports) {
          // iterable DOM collections
          // flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
          module.exports = {
            CSSRuleList: 0,
            CSSStyleDeclaration: 0,
            CSSValueList: 0,
            ClientRectList: 0,
            DOMRectList: 0,
            DOMStringList: 0,
            DOMTokenList: 1,
            DataTransferItemList: 0,
            FileList: 0,
            HTMLAllCollection: 0,
            HTMLCollection: 0,
            HTMLFormElement: 0,
            HTMLSelectElement: 0,
            MediaList: 0,
            MimeTypeArray: 0,
            NamedNodeMap: 0,
            NodeList: 1,
            PaintRequestList: 0,
            Plugin: 0,
            PluginArray: 0,
            SVGLengthList: 0,
            SVGNumberList: 0,
            SVGPathSegList: 0,
            SVGPointList: 0,
            SVGStringList: 0,
            SVGTransformList: 0,
            SourceBufferList: 0,
            StyleSheetList: 0,
            TextTrackCueList: 0,
            TextTrackList: 0,
            TouchList: 0,
          };
        },
        {},
      ],
      88: [
        function (require, module, exports) {
          var getBuiltIn = require("../internals/get-built-in");

          module.exports = getBuiltIn("navigator", "userAgent") || "";
        },
        { "../internals/get-built-in": 95 },
      ],
      89: [
        function (require, module, exports) {
          var global = require("../internals/global");
          var userAgent = require("../internals/engine-user-agent");

          var process = global.process;
          var versions = process && process.versions;
          var v8 = versions && versions.v8;
          var match, version;

          if (v8) {
            match = v8.split(".");
            version = match[0] + match[1];
          } else if (userAgent) {
            match = userAgent.match(/Edge\/(\d+)/);
            if (!match || match[1] >= 74) {
              match = userAgent.match(/Chrome\/(\d+)/);
              if (match) version = match[1];
            }
          }

          module.exports = version && +version;
        },
        { "../internals/engine-user-agent": 88, "../internals/global": 98 },
      ],
      90: [
        function (require, module, exports) {
          var path = require("../internals/path");

          module.exports = function (CONSTRUCTOR) {
            return path[CONSTRUCTOR + "Prototype"];
          };
        },
        { "../internals/path": 130 },
      ],
      91: [
        function (require, module, exports) {
          // IE8- don't enum bug keys
          module.exports = [
            "constructor",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "toLocaleString",
            "toString",
            "valueOf",
          ];
        },
        {},
      ],
      92: [
        function (require, module, exports) {
          "use strict";
          var global = require("../internals/global");
          var getOwnPropertyDescriptor =
            require("../internals/object-get-own-property-descriptor").f;
          var isForced = require("../internals/is-forced");
          var path = require("../internals/path");
          var bind = require("../internals/function-bind-context");
          var createNonEnumerableProperty = require("../internals/create-non-enumerable-property");
          var has = require("../internals/has");

          var wrapConstructor = function (NativeConstructor) {
            var Wrapper = function (a, b, c) {
              if (this instanceof NativeConstructor) {
                switch (arguments.length) {
                  case 0:
                    return new NativeConstructor();
                  case 1:
                    return new NativeConstructor(a);
                  case 2:
                    return new NativeConstructor(a, b);
                }
                return new NativeConstructor(a, b, c);
              }
              return NativeConstructor.apply(this, arguments);
            };
            Wrapper.prototype = NativeConstructor.prototype;
            return Wrapper;
          };

          /*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
          module.exports = function (options, source) {
            var TARGET = options.target;
            var GLOBAL = options.global;
            var STATIC = options.stat;
            var PROTO = options.proto;

            var nativeSource = GLOBAL
              ? global
              : STATIC
              ? global[TARGET]
              : (global[TARGET] || {}).prototype;

            var target = GLOBAL ? path : path[TARGET] || (path[TARGET] = {});
            var targetPrototype = target.prototype;

            var FORCED, USE_NATIVE, VIRTUAL_PROTOTYPE;
            var key,
              sourceProperty,
              targetProperty,
              nativeProperty,
              resultProperty,
              descriptor;

            for (key in source) {
              FORCED = isForced(
                GLOBAL ? key : TARGET + (STATIC ? "." : "#") + key,
                options.forced
              );
              // contains in native
              USE_NATIVE = !FORCED && nativeSource && has(nativeSource, key);

              targetProperty = target[key];

              if (USE_NATIVE)
                if (options.noTargetGet) {
                  descriptor = getOwnPropertyDescriptor(nativeSource, key);
                  nativeProperty = descriptor && descriptor.value;
                } else nativeProperty = nativeSource[key];

              // export native or implementation
              sourceProperty =
                USE_NATIVE && nativeProperty ? nativeProperty : source[key];

              if (USE_NATIVE && typeof targetProperty === typeof sourceProperty)
                continue;

              // bind timers to global for call from export context
              if (options.bind && USE_NATIVE)
                resultProperty = bind(sourceProperty, global);
              // wrap global constructors for prevent changs in this version
              else if (options.wrap && USE_NATIVE)
                resultProperty = wrapConstructor(sourceProperty);
              // make static versions for prototype methods
              else if (PROTO && typeof sourceProperty == "function")
                resultProperty = bind(Function.call, sourceProperty);
              // default case
              else resultProperty = sourceProperty;

              // add a flag to not completely full polyfills
              if (
                options.sham ||
                (sourceProperty && sourceProperty.sham) ||
                (targetProperty && targetProperty.sham)
              ) {
                createNonEnumerableProperty(resultProperty, "sham", true);
              }

              target[key] = resultProperty;

              if (PROTO) {
                VIRTUAL_PROTOTYPE = TARGET + "Prototype";
                if (!has(path, VIRTUAL_PROTOTYPE)) {
                  createNonEnumerableProperty(path, VIRTUAL_PROTOTYPE, {});
                }
                // export virtual prototype methods
                path[VIRTUAL_PROTOTYPE][key] = sourceProperty;
                // export real prototype methods
                if (options.real && targetPrototype && !targetPrototype[key]) {
                  createNonEnumerableProperty(
                    targetPrototype,
                    key,
                    sourceProperty
                  );
                }
              }
            }
          };
        },
        {
          "../internals/create-non-enumerable-property": 80,
          "../internals/function-bind-context": 94,
          "../internals/global": 98,
          "../internals/has": 99,
          "../internals/is-forced": 108,
          "../internals/object-get-own-property-descriptor": 120,
          "../internals/path": 130,
        },
      ],
      93: [
        function (require, module, exports) {
          module.exports = function (exec) {
            try {
              return !!exec();
            } catch (error) {
              return true;
            }
          };
        },
        {},
      ],
      94: [
        function (require, module, exports) {
          var aFunction = require("../internals/a-function");

          // optional / simple context binding
          module.exports = function (fn, that, length) {
            aFunction(fn);
            if (that === undefined) return fn;
            switch (length) {
              case 0:
                return function () {
                  return fn.call(that);
                };
              case 1:
                return function (a) {
                  return fn.call(that, a);
                };
              case 2:
                return function (a, b) {
                  return fn.call(that, a, b);
                };
              case 3:
                return function (a, b, c) {
                  return fn.call(that, a, b, c);
                };
            }
            return function (/* ...args */) {
              return fn.apply(that, arguments);
            };
          };
        },
        { "../internals/a-function": 61 },
      ],
      95: [
        function (require, module, exports) {
          var path = require("../internals/path");
          var global = require("../internals/global");

          var aFunction = function (variable) {
            return typeof variable == "function" ? variable : undefined;
          };

          module.exports = function (namespace, method) {
            return arguments.length < 2
              ? aFunction(path[namespace]) || aFunction(global[namespace])
              : (path[namespace] && path[namespace][method]) ||
                  (global[namespace] && global[namespace][method]);
          };
        },
        { "../internals/global": 98, "../internals/path": 130 },
      ],
      96: [
        function (require, module, exports) {
          var classof = require("../internals/classof");
          var Iterators = require("../internals/iterators");
          var wellKnownSymbol = require("../internals/well-known-symbol");

          var ITERATOR = wellKnownSymbol("iterator");

          module.exports = function (it) {
            if (it != undefined)
              return it[ITERATOR] || it["@@iterator"] || Iterators[classof(it)];
          };
        },
        {
          "../internals/classof": 77,
          "../internals/iterators": 113,
          "../internals/well-known-symbol": 151,
        },
      ],
      97: [
        function (require, module, exports) {
          var anObject = require("../internals/an-object");
          var getIteratorMethod = require("../internals/get-iterator-method");

          module.exports = function (it) {
            var iteratorMethod = getIteratorMethod(it);
            if (typeof iteratorMethod != "function") {
              throw TypeError(String(it) + " is not iterable");
            }
            return anObject(iteratorMethod.call(it));
          };
        },
        {
          "../internals/an-object": 64,
          "../internals/get-iterator-method": 96,
        },
      ],
      98: [
        function (require, module, exports) {
          (function (global) {
            (function () {
              var check = function (it) {
                return it && it.Math == Math && it;
              };

              // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
              module.exports =
                // eslint-disable-next-line no-undef
                check(typeof globalThis == "object" && globalThis) ||
                check(typeof window == "object" && window) ||
                check(typeof self == "object" && self) ||
                check(typeof global == "object" && global) ||
                // eslint-disable-next-line no-new-func
                Function("return this")();
            }.call(this));
          }.call(
            this,
            typeof global !== "undefined"
              ? global
              : typeof self !== "undefined"
              ? self
              : typeof window !== "undefined"
              ? window
              : {}
          ));
        },
        {},
      ],
      99: [
        function (require, module, exports) {
          var hasOwnProperty = {}.hasOwnProperty;

          module.exports = function (it, key) {
            return hasOwnProperty.call(it, key);
          };
        },
        {},
      ],
      100: [
        function (require, module, exports) {
          module.exports = {};
        },
        {},
      ],
      101: [
        function (require, module, exports) {
          var getBuiltIn = require("../internals/get-built-in");

          module.exports = getBuiltIn("document", "documentElement");
        },
        { "../internals/get-built-in": 95 },
      ],
      102: [
        function (require, module, exports) {
          var DESCRIPTORS = require("../internals/descriptors");
          var fails = require("../internals/fails");
          var createElement = require("../internals/document-create-element");

          // Thank's IE8 for his funny defineProperty
          module.exports =
            !DESCRIPTORS &&
            !fails(function () {
              return (
                Object.defineProperty(createElement("div"), "a", {
                  get: function () {
                    return 7;
                  },
                }).a != 7
              );
            });
        },
        {
          "../internals/descriptors": 85,
          "../internals/document-create-element": 86,
          "../internals/fails": 93,
        },
      ],
      103: [
        function (require, module, exports) {
          var fails = require("../internals/fails");
          var classof = require("../internals/classof-raw");

          var split = "".split;

          // fallback for non-array-like ES3 and non-enumerable old V8 strings
          module.exports = fails(function () {
            // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
            // eslint-disable-next-line no-prototype-builtins
            return !Object("z").propertyIsEnumerable(0);
          })
            ? function (it) {
                return classof(it) == "String"
                  ? split.call(it, "")
                  : Object(it);
              }
            : Object;
        },
        { "../internals/classof-raw": 76, "../internals/fails": 93 },
      ],
      104: [
        function (require, module, exports) {
          var store = require("../internals/shared-store");

          var functionToString = Function.toString;

          // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
          if (typeof store.inspectSource != "function") {
            store.inspectSource = function (it) {
              return functionToString.call(it);
            };
          }

          module.exports = store.inspectSource;
        },
        { "../internals/shared-store": 137 },
      ],
      105: [
        function (require, module, exports) {
          var NATIVE_WEAK_MAP = require("../internals/native-weak-map");
          var global = require("../internals/global");
          var isObject = require("../internals/is-object");
          var createNonEnumerableProperty = require("../internals/create-non-enumerable-property");
          var objectHas = require("../internals/has");
          var sharedKey = require("../internals/shared-key");
          var hiddenKeys = require("../internals/hidden-keys");

          var WeakMap = global.WeakMap;
          var set, get, has;

          var enforce = function (it) {
            return has(it) ? get(it) : set(it, {});
          };

          var getterFor = function (TYPE) {
            return function (it) {
              var state;
              if (!isObject(it) || (state = get(it)).type !== TYPE) {
                throw TypeError("Incompatible receiver, " + TYPE + " required");
              }
              return state;
            };
          };

          if (NATIVE_WEAK_MAP) {
            var store = new WeakMap();
            var wmget = store.get;
            var wmhas = store.has;
            var wmset = store.set;
            set = function (it, metadata) {
              wmset.call(store, it, metadata);
              return metadata;
            };
            get = function (it) {
              return wmget.call(store, it) || {};
            };
            has = function (it) {
              return wmhas.call(store, it);
            };
          } else {
            var STATE = sharedKey("state");
            hiddenKeys[STATE] = true;
            set = function (it, metadata) {
              createNonEnumerableProperty(it, STATE, metadata);
              return metadata;
            };
            get = function (it) {
              return objectHas(it, STATE) ? it[STATE] : {};
            };
            has = function (it) {
              return objectHas(it, STATE);
            };
          }

          module.exports = {
            set: set,
            get: get,
            has: has,
            enforce: enforce,
            getterFor: getterFor,
          };
        },
        {
          "../internals/create-non-enumerable-property": 80,
          "../internals/global": 98,
          "../internals/has": 99,
          "../internals/hidden-keys": 100,
          "../internals/is-object": 110,
          "../internals/native-weak-map": 115,
          "../internals/shared-key": 136,
        },
      ],
      106: [
        function (require, module, exports) {
          var wellKnownSymbol = require("../internals/well-known-symbol");
          var Iterators = require("../internals/iterators");

          var ITERATOR = wellKnownSymbol("iterator");
          var ArrayPrototype = Array.prototype;

          // check on default Array iterator
          module.exports = function (it) {
            return (
              it !== undefined &&
              (Iterators.Array === it || ArrayPrototype[ITERATOR] === it)
            );
          };
        },
        {
          "../internals/iterators": 113,
          "../internals/well-known-symbol": 151,
        },
      ],
      107: [
        function (require, module, exports) {
          var classof = require("../internals/classof-raw");

          // `IsArray` abstract operation
          // https://tc39.github.io/ecma262/#sec-isarray
          module.exports =
            Array.isArray ||
            function isArray(arg) {
              return classof(arg) == "Array";
            };
        },
        { "../internals/classof-raw": 76 },
      ],
      108: [
        function (require, module, exports) {
          var fails = require("../internals/fails");

          var replacement = /#|\.prototype\./;

          var isForced = function (feature, detection) {
            var value = data[normalize(feature)];
            return value == POLYFILL
              ? true
              : value == NATIVE
              ? false
              : typeof detection == "function"
              ? fails(detection)
              : !!detection;
          };

          var normalize = (isForced.normalize = function (string) {
            return String(string).replace(replacement, ".").toLowerCase();
          });

          var data = (isForced.data = {});
          var NATIVE = (isForced.NATIVE = "N");
          var POLYFILL = (isForced.POLYFILL = "P");

          module.exports = isForced;
        },
        { "../internals/fails": 93 },
      ],
      109: [
        function (require, module, exports) {
          var classof = require("../internals/classof");
          var wellKnownSymbol = require("../internals/well-known-symbol");
          var Iterators = require("../internals/iterators");

          var ITERATOR = wellKnownSymbol("iterator");

          module.exports = function (it) {
            var O = Object(it);
            return (
              O[ITERATOR] !== undefined ||
              "@@iterator" in O ||
              // eslint-disable-next-line no-prototype-builtins
              Iterators.hasOwnProperty(classof(O))
            );
          };
        },
        {
          "../internals/classof": 77,
          "../internals/iterators": 113,
          "../internals/well-known-symbol": 151,
        },
      ],
      110: [
        function (require, module, exports) {
          module.exports = function (it) {
            return typeof it === "object"
              ? it !== null
              : typeof it === "function";
          };
        },
        {},
      ],
      111: [
        function (require, module, exports) {
          module.exports = true;
        },
        {},
      ],
      112: [
        function (require, module, exports) {
          "use strict";
          var getPrototypeOf = require("../internals/object-get-prototype-of");
          var createNonEnumerableProperty = require("../internals/create-non-enumerable-property");
          var has = require("../internals/has");
          var wellKnownSymbol = require("../internals/well-known-symbol");
          var IS_PURE = require("../internals/is-pure");

          var ITERATOR = wellKnownSymbol("iterator");
          var BUGGY_SAFARI_ITERATORS = false;

          var returnThis = function () {
            return this;
          };

          // `%IteratorPrototype%` object
          // https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
          var IteratorPrototype,
            PrototypeOfArrayIteratorPrototype,
            arrayIterator;

          if ([].keys) {
            arrayIterator = [].keys();
            // Safari 8 has buggy iterators w/o `next`
            if (!("next" in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
            else {
              PrototypeOfArrayIteratorPrototype = getPrototypeOf(
                getPrototypeOf(arrayIterator)
              );
              if (PrototypeOfArrayIteratorPrototype !== Object.prototype)
                IteratorPrototype = PrototypeOfArrayIteratorPrototype;
            }
          }

          if (IteratorPrototype == undefined) IteratorPrototype = {};

          // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
          if (!IS_PURE && !has(IteratorPrototype, ITERATOR)) {
            createNonEnumerableProperty(
              IteratorPrototype,
              ITERATOR,
              returnThis
            );
          }

          module.exports = {
            IteratorPrototype: IteratorPrototype,
            BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS,
          };
        },
        {
          "../internals/create-non-enumerable-property": 80,
          "../internals/has": 99,
          "../internals/is-pure": 111,
          "../internals/object-get-prototype-of": 124,
          "../internals/well-known-symbol": 151,
        },
      ],
      113: [
        function (require, module, exports) {
          arguments[4][100][0].apply(exports, arguments);
        },
        { dup: 100 },
      ],
      114: [
        function (require, module, exports) {
          var fails = require("../internals/fails");

          module.exports =
            !!Object.getOwnPropertySymbols &&
            !fails(function () {
              // Chrome 38 Symbol has incorrect toString conversion
              // eslint-disable-next-line no-undef
              return !String(Symbol());
            });
        },
        { "../internals/fails": 93 },
      ],
      115: [
        function (require, module, exports) {
          var global = require("../internals/global");
          var inspectSource = require("../internals/inspect-source");

          var WeakMap = global.WeakMap;

          module.exports =
            typeof WeakMap === "function" &&
            /native code/.test(inspectSource(WeakMap));
        },
        { "../internals/global": 98, "../internals/inspect-source": 104 },
      ],
      116: [
        function (require, module, exports) {
          var global = require("../internals/global");
          var trim = require("../internals/string-trim").trim;
          var whitespaces = require("../internals/whitespaces");

          var $parseInt = global.parseInt;
          var hex = /^[+-]?0[Xx]/;
          var FORCED =
            $parseInt(whitespaces + "08") !== 8 ||
            $parseInt(whitespaces + "0x16") !== 22;

          // `parseInt` method
          // https://tc39.github.io/ecma262/#sec-parseint-string-radix
          module.exports = FORCED
            ? function parseInt(string, radix) {
                var S = trim(String(string));
                return $parseInt(S, radix >>> 0 || (hex.test(S) ? 16 : 10));
              }
            : $parseInt;
        },
        {
          "../internals/global": 98,
          "../internals/string-trim": 140,
          "../internals/whitespaces": 152,
        },
      ],
      117: [
        function (require, module, exports) {
          var anObject = require("../internals/an-object");
          var defineProperties = require("../internals/object-define-properties");
          var enumBugKeys = require("../internals/enum-bug-keys");
          var hiddenKeys = require("../internals/hidden-keys");
          var html = require("../internals/html");
          var documentCreateElement = require("../internals/document-create-element");
          var sharedKey = require("../internals/shared-key");

          var GT = ">";
          var LT = "<";
          var PROTOTYPE = "prototype";
          var SCRIPT = "script";
          var IE_PROTO = sharedKey("IE_PROTO");

          var EmptyConstructor = function () {
            /* empty */
          };

          var scriptTag = function (content) {
            return LT + SCRIPT + GT + content + LT + "/" + SCRIPT + GT;
          };

          // Create object with fake `null` prototype: use ActiveX Object with cleared prototype
          var NullProtoObjectViaActiveX = function (activeXDocument) {
            activeXDocument.write(scriptTag(""));
            activeXDocument.close();
            var temp = activeXDocument.parentWindow.Object;
            activeXDocument = null; // avoid memory leak
            return temp;
          };

          // Create object with fake `null` prototype: use iframe Object with cleared prototype
          var NullProtoObjectViaIFrame = function () {
            // Thrash, waste and sodomy: IE GC bug
            var iframe = documentCreateElement("iframe");
            var JS = "java" + SCRIPT + ":";
            var iframeDocument;
            iframe.style.display = "none";
            html.appendChild(iframe);
            // https://github.com/zloirock/core-js/issues/475
            iframe.src = String(JS);
            iframeDocument = iframe.contentWindow.document;
            iframeDocument.open();
            iframeDocument.write(scriptTag("document.F=Object"));
            iframeDocument.close();
            return iframeDocument.F;
          };

          // Check for document.domain and active x support
          // No need to use active x approach when document.domain is not set
          // see https://github.com/es-shims/es5-shim/issues/150
          // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
          // avoid IE GC bug
          var activeXDocument;
          var NullProtoObject = function () {
            try {
              /* global ActiveXObject */
              activeXDocument =
                document.domain && new ActiveXObject("htmlfile");
            } catch (error) {
              /* ignore */
            }
            NullProtoObject = activeXDocument
              ? NullProtoObjectViaActiveX(activeXDocument)
              : NullProtoObjectViaIFrame();
            var length = enumBugKeys.length;
            while (length--)
              delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
            return NullProtoObject();
          };

          hiddenKeys[IE_PROTO] = true;

          // `Object.create` method
          // https://tc39.github.io/ecma262/#sec-object.create
          module.exports =
            Object.create ||
            function create(O, Properties) {
              var result;
              if (O !== null) {
                EmptyConstructor[PROTOTYPE] = anObject(O);
                result = new EmptyConstructor();
                EmptyConstructor[PROTOTYPE] = null;
                // add "__proto__" for Object.getPrototypeOf polyfill
                result[IE_PROTO] = O;
              } else result = NullProtoObject();
              return Properties === undefined
                ? result
                : defineProperties(result, Properties);
            };
        },
        {
          "../internals/an-object": 64,
          "../internals/document-create-element": 86,
          "../internals/enum-bug-keys": 91,
          "../internals/hidden-keys": 100,
          "../internals/html": 101,
          "../internals/object-define-properties": 118,
          "../internals/shared-key": 136,
        },
      ],
      118: [
        function (require, module, exports) {
          var DESCRIPTORS = require("../internals/descriptors");
          var definePropertyModule = require("../internals/object-define-property");
          var anObject = require("../internals/an-object");
          var objectKeys = require("../internals/object-keys");

          // `Object.defineProperties` method
          // https://tc39.github.io/ecma262/#sec-object.defineproperties
          module.exports = DESCRIPTORS
            ? Object.defineProperties
            : function defineProperties(O, Properties) {
                anObject(O);
                var keys = objectKeys(Properties);
                var length = keys.length;
                var index = 0;
                var key;
                while (length > index)
                  definePropertyModule.f(
                    O,
                    (key = keys[index++]),
                    Properties[key]
                  );
                return O;
              };
        },
        {
          "../internals/an-object": 64,
          "../internals/descriptors": 85,
          "../internals/object-define-property": 119,
          "../internals/object-keys": 126,
        },
      ],
      119: [
        function (require, module, exports) {
          var DESCRIPTORS = require("../internals/descriptors");
          var IE8_DOM_DEFINE = require("../internals/ie8-dom-define");
          var anObject = require("../internals/an-object");
          var toPrimitive = require("../internals/to-primitive");

          var nativeDefineProperty = Object.defineProperty;

          // `Object.defineProperty` method
          // https://tc39.github.io/ecma262/#sec-object.defineproperty
          exports.f = DESCRIPTORS
            ? nativeDefineProperty
            : function defineProperty(O, P, Attributes) {
                anObject(O);
                P = toPrimitive(P, true);
                anObject(Attributes);
                if (IE8_DOM_DEFINE)
                  try {
                    return nativeDefineProperty(O, P, Attributes);
                  } catch (error) {
                    /* empty */
                  }
                if ("get" in Attributes || "set" in Attributes)
                  throw TypeError("Accessors not supported");
                if ("value" in Attributes) O[P] = Attributes.value;
                return O;
              };
        },
        {
          "../internals/an-object": 64,
          "../internals/descriptors": 85,
          "../internals/ie8-dom-define": 102,
          "../internals/to-primitive": 146,
        },
      ],
      120: [
        function (require, module, exports) {
          var DESCRIPTORS = require("../internals/descriptors");
          var propertyIsEnumerableModule = require("../internals/object-property-is-enumerable");
          var createPropertyDescriptor = require("../internals/create-property-descriptor");
          var toIndexedObject = require("../internals/to-indexed-object");
          var toPrimitive = require("../internals/to-primitive");
          var has = require("../internals/has");
          var IE8_DOM_DEFINE = require("../internals/ie8-dom-define");

          var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

          // `Object.getOwnPropertyDescriptor` method
          // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
          exports.f = DESCRIPTORS
            ? nativeGetOwnPropertyDescriptor
            : function getOwnPropertyDescriptor(O, P) {
                O = toIndexedObject(O);
                P = toPrimitive(P, true);
                if (IE8_DOM_DEFINE)
                  try {
                    return nativeGetOwnPropertyDescriptor(O, P);
                  } catch (error) {
                    /* empty */
                  }
                if (has(O, P))
                  return createPropertyDescriptor(
                    !propertyIsEnumerableModule.f.call(O, P),
                    O[P]
                  );
              };
        },
        {
          "../internals/create-property-descriptor": 81,
          "../internals/descriptors": 85,
          "../internals/has": 99,
          "../internals/ie8-dom-define": 102,
          "../internals/object-property-is-enumerable": 127,
          "../internals/to-indexed-object": 142,
          "../internals/to-primitive": 146,
        },
      ],
      121: [
        function (require, module, exports) {
          var toIndexedObject = require("../internals/to-indexed-object");
          var nativeGetOwnPropertyNames =
            require("../internals/object-get-own-property-names").f;

          var toString = {}.toString;

          var windowNames =
            typeof window == "object" && window && Object.getOwnPropertyNames
              ? Object.getOwnPropertyNames(window)
              : [];

          var getWindowNames = function (it) {
            try {
              return nativeGetOwnPropertyNames(it);
            } catch (error) {
              return windowNames.slice();
            }
          };

          // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
          module.exports.f = function getOwnPropertyNames(it) {
            return windowNames && toString.call(it) == "[object Window]"
              ? getWindowNames(it)
              : nativeGetOwnPropertyNames(toIndexedObject(it));
          };
        },
        {
          "../internals/object-get-own-property-names": 122,
          "../internals/to-indexed-object": 142,
        },
      ],
      122: [
        function (require, module, exports) {
          var internalObjectKeys = require("../internals/object-keys-internal");
          var enumBugKeys = require("../internals/enum-bug-keys");

          var hiddenKeys = enumBugKeys.concat("length", "prototype");

          // `Object.getOwnPropertyNames` method
          // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
          exports.f =
            Object.getOwnPropertyNames ||
            function getOwnPropertyNames(O) {
              return internalObjectKeys(O, hiddenKeys);
            };
        },
        {
          "../internals/enum-bug-keys": 91,
          "../internals/object-keys-internal": 125,
        },
      ],
      123: [
        function (require, module, exports) {
          exports.f = Object.getOwnPropertySymbols;
        },
        {},
      ],
      124: [
        function (require, module, exports) {
          var has = require("../internals/has");
          var toObject = require("../internals/to-object");
          var sharedKey = require("../internals/shared-key");
          var CORRECT_PROTOTYPE_GETTER = require("../internals/correct-prototype-getter");

          var IE_PROTO = sharedKey("IE_PROTO");
          var ObjectPrototype = Object.prototype;

          // `Object.getPrototypeOf` method
          // https://tc39.github.io/ecma262/#sec-object.getprototypeof
          module.exports = CORRECT_PROTOTYPE_GETTER
            ? Object.getPrototypeOf
            : function (O) {
                O = toObject(O);
                if (has(O, IE_PROTO)) return O[IE_PROTO];
                if (
                  typeof O.constructor == "function" &&
                  O instanceof O.constructor
                ) {
                  return O.constructor.prototype;
                }
                return O instanceof Object ? ObjectPrototype : null;
              };
        },
        {
          "../internals/correct-prototype-getter": 78,
          "../internals/has": 99,
          "../internals/shared-key": 136,
          "../internals/to-object": 145,
        },
      ],
      125: [
        function (require, module, exports) {
          var has = require("../internals/has");
          var toIndexedObject = require("../internals/to-indexed-object");
          var indexOf = require("../internals/array-includes").indexOf;
          var hiddenKeys = require("../internals/hidden-keys");

          module.exports = function (object, names) {
            var O = toIndexedObject(object);
            var i = 0;
            var result = [];
            var key;
            for (key in O)
              !has(hiddenKeys, key) && has(O, key) && result.push(key);
            // Don't enum bug & hidden keys
            while (names.length > i)
              if (has(O, (key = names[i++]))) {
                ~indexOf(result, key) || result.push(key);
              }
            return result;
          };
        },
        {
          "../internals/array-includes": 67,
          "../internals/has": 99,
          "../internals/hidden-keys": 100,
          "../internals/to-indexed-object": 142,
        },
      ],
      126: [
        function (require, module, exports) {
          var internalObjectKeys = require("../internals/object-keys-internal");
          var enumBugKeys = require("../internals/enum-bug-keys");

          // `Object.keys` method
          // https://tc39.github.io/ecma262/#sec-object.keys
          module.exports =
            Object.keys ||
            function keys(O) {
              return internalObjectKeys(O, enumBugKeys);
            };
        },
        {
          "../internals/enum-bug-keys": 91,
          "../internals/object-keys-internal": 125,
        },
      ],
      127: [
        function (require, module, exports) {
          "use strict";
          var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
          var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

          // Nashorn ~ JDK8 bug
          var NASHORN_BUG =
            getOwnPropertyDescriptor &&
            !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

          // `Object.prototype.propertyIsEnumerable` method implementation
          // https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
          exports.f = NASHORN_BUG
            ? function propertyIsEnumerable(V) {
                var descriptor = getOwnPropertyDescriptor(this, V);
                return !!descriptor && descriptor.enumerable;
              }
            : nativePropertyIsEnumerable;
        },
        {},
      ],
      128: [
        function (require, module, exports) {
          var anObject = require("../internals/an-object");
          var aPossiblePrototype = require("../internals/a-possible-prototype");

          // `Object.setPrototypeOf` method
          // https://tc39.github.io/ecma262/#sec-object.setprototypeof
          // Works with __proto__ only. Old v8 can't work with null proto objects.
          /* eslint-disable no-proto */
          module.exports =
            Object.setPrototypeOf ||
            ("__proto__" in {}
              ? (function () {
                  var CORRECT_SETTER = false;
                  var test = {};
                  var setter;
                  try {
                    setter = Object.getOwnPropertyDescriptor(
                      Object.prototype,
                      "__proto__"
                    ).set;
                    setter.call(test, []);
                    CORRECT_SETTER = test instanceof Array;
                  } catch (error) {
                    /* empty */
                  }
                  return function setPrototypeOf(O, proto) {
                    anObject(O);
                    aPossiblePrototype(proto);
                    if (CORRECT_SETTER) setter.call(O, proto);
                    else O.__proto__ = proto;
                    return O;
                  };
                })()
              : undefined);
        },
        {
          "../internals/a-possible-prototype": 62,
          "../internals/an-object": 64,
        },
      ],
      129: [
        function (require, module, exports) {
          "use strict";
          var TO_STRING_TAG_SUPPORT = require("../internals/to-string-tag-support");
          var classof = require("../internals/classof");

          // `Object.prototype.toString` method implementation
          // https://tc39.github.io/ecma262/#sec-object.prototype.tostring
          module.exports = TO_STRING_TAG_SUPPORT
            ? {}.toString
            : function toString() {
                return "[object " + classof(this) + "]";
              };
        },
        {
          "../internals/classof": 77,
          "../internals/to-string-tag-support": 147,
        },
      ],
      130: [
        function (require, module, exports) {
          arguments[4][100][0].apply(exports, arguments);
        },
        { dup: 100 },
      ],
      131: [
        function (require, module, exports) {
          var createNonEnumerableProperty = require("../internals/create-non-enumerable-property");

          module.exports = function (target, key, value, options) {
            if (options && options.enumerable) target[key] = value;
            else createNonEnumerableProperty(target, key, value);
          };
        },
        { "../internals/create-non-enumerable-property": 80 },
      ],
      132: [
        function (require, module, exports) {
          "use strict";
          var anObject = require("../internals/an-object");

          // `RegExp.prototype.flags` getter implementation
          // https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
          module.exports = function () {
            var that = anObject(this);
            var result = "";
            if (that.global) result += "g";
            if (that.ignoreCase) result += "i";
            if (that.multiline) result += "m";
            if (that.dotAll) result += "s";
            if (that.unicode) result += "u";
            if (that.sticky) result += "y";
            return result;
          };
        },
        { "../internals/an-object": 64 },
      ],
      133: [
        function (require, module, exports) {
          // `RequireObjectCoercible` abstract operation
          // https://tc39.github.io/ecma262/#sec-requireobjectcoercible
          module.exports = function (it) {
            if (it == undefined) throw TypeError("Can't call method on " + it);
            return it;
          };
        },
        {},
      ],
      134: [
        function (require, module, exports) {
          var global = require("../internals/global");
          var createNonEnumerableProperty = require("../internals/create-non-enumerable-property");

          module.exports = function (key, value) {
            try {
              createNonEnumerableProperty(global, key, value);
            } catch (error) {
              global[key] = value;
            }
            return value;
          };
        },
        {
          "../internals/create-non-enumerable-property": 80,
          "../internals/global": 98,
        },
      ],
      135: [
        function (require, module, exports) {
          var TO_STRING_TAG_SUPPORT = require("../internals/to-string-tag-support");
          var defineProperty = require("../internals/object-define-property").f;
          var createNonEnumerableProperty = require("../internals/create-non-enumerable-property");
          var has = require("../internals/has");
          var toString = require("../internals/object-to-string");
          var wellKnownSymbol = require("../internals/well-known-symbol");

          var TO_STRING_TAG = wellKnownSymbol("toStringTag");

          module.exports = function (it, TAG, STATIC, SET_METHOD) {
            if (it) {
              var target = STATIC ? it : it.prototype;
              if (!has(target, TO_STRING_TAG)) {
                defineProperty(target, TO_STRING_TAG, {
                  configurable: true,
                  value: TAG,
                });
              }
              if (SET_METHOD && !TO_STRING_TAG_SUPPORT) {
                createNonEnumerableProperty(target, "toString", toString);
              }
            }
          };
        },
        {
          "../internals/create-non-enumerable-property": 80,
          "../internals/has": 99,
          "../internals/object-define-property": 119,
          "../internals/object-to-string": 129,
          "../internals/to-string-tag-support": 147,
          "../internals/well-known-symbol": 151,
        },
      ],
      136: [
        function (require, module, exports) {
          var shared = require("../internals/shared");
          var uid = require("../internals/uid");

          var keys = shared("keys");

          module.exports = function (key) {
            return keys[key] || (keys[key] = uid(key));
          };
        },
        { "../internals/shared": 138, "../internals/uid": 148 },
      ],
      137: [
        function (require, module, exports) {
          var global = require("../internals/global");
          var setGlobal = require("../internals/set-global");

          var SHARED = "__core-js_shared__";
          var store = global[SHARED] || setGlobal(SHARED, {});

          module.exports = store;
        },
        { "../internals/global": 98, "../internals/set-global": 134 },
      ],
      138: [
        function (require, module, exports) {
          var IS_PURE = require("../internals/is-pure");
          var store = require("../internals/shared-store");

          (module.exports = function (key, value) {
            return (
              store[key] || (store[key] = value !== undefined ? value : {})
            );
          })("versions", []).push({
            version: "3.6.4",
            mode: IS_PURE ? "pure" : "global",
            copyright: "© 2020 Denis Pushkarev (zloirock.ru)",
          });
        },
        { "../internals/is-pure": 111, "../internals/shared-store": 137 },
      ],
      139: [
        function (require, module, exports) {
          var toInteger = require("../internals/to-integer");
          var requireObjectCoercible = require("../internals/require-object-coercible");

          // `String.prototype.{ codePointAt, at }` methods implementation
          var createMethod = function (CONVERT_TO_STRING) {
            return function ($this, pos) {
              var S = String(requireObjectCoercible($this));
              var position = toInteger(pos);
              var size = S.length;
              var first, second;
              if (position < 0 || position >= size)
                return CONVERT_TO_STRING ? "" : undefined;
              first = S.charCodeAt(position);
              return first < 0xd800 ||
                first > 0xdbff ||
                position + 1 === size ||
                (second = S.charCodeAt(position + 1)) < 0xdc00 ||
                second > 0xdfff
                ? CONVERT_TO_STRING
                  ? S.charAt(position)
                  : first
                : CONVERT_TO_STRING
                ? S.slice(position, position + 2)
                : ((first - 0xd800) << 10) + (second - 0xdc00) + 0x10000;
            };
          };

          module.exports = {
            // `String.prototype.codePointAt` method
            // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
            codeAt: createMethod(false),
            // `String.prototype.at` method
            // https://github.com/mathiasbynens/String.prototype.at
            charAt: createMethod(true),
          };
        },
        {
          "../internals/require-object-coercible": 133,
          "../internals/to-integer": 143,
        },
      ],
      140: [
        function (require, module, exports) {
          var requireObjectCoercible = require("../internals/require-object-coercible");
          var whitespaces = require("../internals/whitespaces");

          var whitespace = "[" + whitespaces + "]";
          var ltrim = RegExp("^" + whitespace + whitespace + "*");
          var rtrim = RegExp(whitespace + whitespace + "*$");

          // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
          var createMethod = function (TYPE) {
            return function ($this) {
              var string = String(requireObjectCoercible($this));
              if (TYPE & 1) string = string.replace(ltrim, "");
              if (TYPE & 2) string = string.replace(rtrim, "");
              return string;
            };
          };

          module.exports = {
            // `String.prototype.{ trimLeft, trimStart }` methods
            // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
            start: createMethod(1),
            // `String.prototype.{ trimRight, trimEnd }` methods
            // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
            end: createMethod(2),
            // `String.prototype.trim` method
            // https://tc39.github.io/ecma262/#sec-string.prototype.trim
            trim: createMethod(3),
          };
        },
        {
          "../internals/require-object-coercible": 133,
          "../internals/whitespaces": 152,
        },
      ],
      141: [
        function (require, module, exports) {
          var toInteger = require("../internals/to-integer");

          var max = Math.max;
          var min = Math.min;

          // Helper for a popular repeating case of the spec:
          // Let integer be ? ToInteger(index).
          // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
          module.exports = function (index, length) {
            var integer = toInteger(index);
            return integer < 0
              ? max(integer + length, 0)
              : min(integer, length);
          };
        },
        { "../internals/to-integer": 143 },
      ],
      142: [
        function (require, module, exports) {
          // toObject with fallback for non-array-like ES3 strings
          var IndexedObject = require("../internals/indexed-object");
          var requireObjectCoercible = require("../internals/require-object-coercible");

          module.exports = function (it) {
            return IndexedObject(requireObjectCoercible(it));
          };
        },
        {
          "../internals/indexed-object": 103,
          "../internals/require-object-coercible": 133,
        },
      ],
      143: [
        function (require, module, exports) {
          var ceil = Math.ceil;
          var floor = Math.floor;

          // `ToInteger` abstract operation
          // https://tc39.github.io/ecma262/#sec-tointeger
          module.exports = function (argument) {
            return isNaN((argument = +argument))
              ? 0
              : (argument > 0 ? floor : ceil)(argument);
          };
        },
        {},
      ],
      144: [
        function (require, module, exports) {
          var toInteger = require("../internals/to-integer");

          var min = Math.min;

          // `ToLength` abstract operation
          // https://tc39.github.io/ecma262/#sec-tolength
          module.exports = function (argument) {
            return argument > 0
              ? min(toInteger(argument), 0x1fffffffffffff)
              : 0; // 2 ** 53 - 1 == 9007199254740991
          };
        },
        { "../internals/to-integer": 143 },
      ],
      145: [
        function (require, module, exports) {
          var requireObjectCoercible = require("../internals/require-object-coercible");

          // `ToObject` abstract operation
          // https://tc39.github.io/ecma262/#sec-toobject
          module.exports = function (argument) {
            return Object(requireObjectCoercible(argument));
          };
        },
        { "../internals/require-object-coercible": 133 },
      ],
      146: [
        function (require, module, exports) {
          var isObject = require("../internals/is-object");

          // `ToPrimitive` abstract operation
          // https://tc39.github.io/ecma262/#sec-toprimitive
          // instead of the ES6 spec version, we didn't implement @@toPrimitive case
          // and the second argument - flag - preferred type is a string
          module.exports = function (input, PREFERRED_STRING) {
            if (!isObject(input)) return input;
            var fn, val;
            if (
              PREFERRED_STRING &&
              typeof (fn = input.toString) == "function" &&
              !isObject((val = fn.call(input)))
            )
              return val;
            if (
              typeof (fn = input.valueOf) == "function" &&
              !isObject((val = fn.call(input)))
            )
              return val;
            if (
              !PREFERRED_STRING &&
              typeof (fn = input.toString) == "function" &&
              !isObject((val = fn.call(input)))
            )
              return val;
            throw TypeError("Can't convert object to primitive value");
          };
        },
        { "../internals/is-object": 110 },
      ],
      147: [
        function (require, module, exports) {
          var wellKnownSymbol = require("../internals/well-known-symbol");

          var TO_STRING_TAG = wellKnownSymbol("toStringTag");
          var test = {};

          test[TO_STRING_TAG] = "z";

          module.exports = String(test) === "[object z]";
        },
        { "../internals/well-known-symbol": 151 },
      ],
      148: [
        function (require, module, exports) {
          var id = 0;
          var postfix = Math.random();

          module.exports = function (key) {
            return (
              "Symbol(" +
              String(key === undefined ? "" : key) +
              ")_" +
              (++id + postfix).toString(36)
            );
          };
        },
        {},
      ],
      149: [
        function (require, module, exports) {
          var NATIVE_SYMBOL = require("../internals/native-symbol");

          module.exports =
            NATIVE_SYMBOL &&
            // eslint-disable-next-line no-undef
            !Symbol.sham &&
            // eslint-disable-next-line no-undef
            typeof Symbol.iterator == "symbol";
        },
        { "../internals/native-symbol": 114 },
      ],
      150: [
        function (require, module, exports) {
          var wellKnownSymbol = require("../internals/well-known-symbol");

          exports.f = wellKnownSymbol;
        },
        { "../internals/well-known-symbol": 151 },
      ],
      151: [
        function (require, module, exports) {
          var global = require("../internals/global");
          var shared = require("../internals/shared");
          var has = require("../internals/has");
          var uid = require("../internals/uid");
          var NATIVE_SYMBOL = require("../internals/native-symbol");
          var USE_SYMBOL_AS_UID = require("../internals/use-symbol-as-uid");

          var WellKnownSymbolsStore = shared("wks");
          var Symbol = global.Symbol;
          var createWellKnownSymbol = USE_SYMBOL_AS_UID
            ? Symbol
            : (Symbol && Symbol.withoutSetter) || uid;

          module.exports = function (name) {
            if (!has(WellKnownSymbolsStore, name)) {
              if (NATIVE_SYMBOL && has(Symbol, name))
                WellKnownSymbolsStore[name] = Symbol[name];
              else
                WellKnownSymbolsStore[name] = createWellKnownSymbol(
                  "Symbol." + name
                );
            }
            return WellKnownSymbolsStore[name];
          };
        },
        {
          "../internals/global": 98,
          "../internals/has": 99,
          "../internals/native-symbol": 114,
          "../internals/shared": 138,
          "../internals/uid": 148,
          "../internals/use-symbol-as-uid": 149,
        },
      ],
      152: [
        function (require, module, exports) {
          // a string of all valid unicode whitespaces
          // eslint-disable-next-line max-len
          module.exports =
            "\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
        },
        {},
      ],
      153: [
        function (require, module, exports) {
          "use strict";
          var $ = require("../internals/export");
          var fails = require("../internals/fails");
          var isArray = require("../internals/is-array");
          var isObject = require("../internals/is-object");
          var toObject = require("../internals/to-object");
          var toLength = require("../internals/to-length");
          var createProperty = require("../internals/create-property");
          var arraySpeciesCreate = require("../internals/array-species-create");
          var arrayMethodHasSpeciesSupport = require("../internals/array-method-has-species-support");
          var wellKnownSymbol = require("../internals/well-known-symbol");
          var V8_VERSION = require("../internals/engine-v8-version");

          var IS_CONCAT_SPREADABLE = wellKnownSymbol("isConcatSpreadable");
          var MAX_SAFE_INTEGER = 0x1fffffffffffff;
          var MAXIMUM_ALLOWED_INDEX_EXCEEDED = "Maximum allowed index exceeded";

          // We can't use this feature detection in V8 since it causes
          // deoptimization and serious performance degradation
          // https://github.com/zloirock/core-js/issues/679
          var IS_CONCAT_SPREADABLE_SUPPORT =
            V8_VERSION >= 51 ||
            !fails(function () {
              var array = [];
              array[IS_CONCAT_SPREADABLE] = false;
              return array.concat()[0] !== array;
            });

          var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("concat");

          var isConcatSpreadable = function (O) {
            if (!isObject(O)) return false;
            var spreadable = O[IS_CONCAT_SPREADABLE];
            return spreadable !== undefined ? !!spreadable : isArray(O);
          };

          var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

          // `Array.prototype.concat` method
          // https://tc39.github.io/ecma262/#sec-array.prototype.concat
          // with adding support of @@isConcatSpreadable and @@species
          $(
            { target: "Array", proto: true, forced: FORCED },
            {
              concat: function concat(arg) {
                // eslint-disable-line no-unused-vars
                var O = toObject(this);
                var A = arraySpeciesCreate(O, 0);
                var n = 0;
                var i, k, length, len, E;
                for (i = -1, length = arguments.length; i < length; i++) {
                  E = i === -1 ? O : arguments[i];
                  if (isConcatSpreadable(E)) {
                    len = toLength(E.length);
                    if (n + len > MAX_SAFE_INTEGER)
                      throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
                    for (k = 0; k < len; k++, n++)
                      if (k in E) createProperty(A, n, E[k]);
                  } else {
                    if (n >= MAX_SAFE_INTEGER)
                      throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
                    createProperty(A, n++, E);
                  }
                }
                A.length = n;
                return A;
              },
            }
          );
        },
        {
          "../internals/array-method-has-species-support": 69,
          "../internals/array-species-create": 73,
          "../internals/create-property": 82,
          "../internals/engine-v8-version": 89,
          "../internals/export": 92,
          "../internals/fails": 93,
          "../internals/is-array": 107,
          "../internals/is-object": 110,
          "../internals/to-length": 144,
          "../internals/to-object": 145,
          "../internals/well-known-symbol": 151,
        },
      ],
      154: [
        function (require, module, exports) {
          "use strict";
          var $ = require("../internals/export");
          var forEach = require("../internals/array-for-each");

          // `Array.prototype.forEach` method
          // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
          $(
            { target: "Array", proto: true, forced: [].forEach != forEach },
            {
              forEach: forEach,
            }
          );
        },
        { "../internals/array-for-each": 65, "../internals/export": 92 },
      ],
      155: [
        function (require, module, exports) {
          var $ = require("../internals/export");
          var from = require("../internals/array-from");
          var checkCorrectnessOfIteration = require("../internals/check-correctness-of-iteration");

          var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (
            iterable
          ) {
            Array.from(iterable);
          });

          // `Array.from` method
          // https://tc39.github.io/ecma262/#sec-array.from
          $(
            { target: "Array", stat: true, forced: INCORRECT_ITERATION },
            {
              from: from,
            }
          );
        },
        {
          "../internals/array-from": 66,
          "../internals/check-correctness-of-iteration": 75,
          "../internals/export": 92,
        },
      ],
      156: [
        function (require, module, exports) {
          "use strict";
          var $ = require("../internals/export");
          var $indexOf = require("../internals/array-includes").indexOf;
          var arrayMethodIsStrict = require("../internals/array-method-is-strict");
          var arrayMethodUsesToLength = require("../internals/array-method-uses-to-length");

          var nativeIndexOf = [].indexOf;

          var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
          var STRICT_METHOD = arrayMethodIsStrict("indexOf");
          var USES_TO_LENGTH = arrayMethodUsesToLength("indexOf", {
            ACCESSORS: true,
            1: 0,
          });

          // `Array.prototype.indexOf` method
          // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
          $(
            {
              target: "Array",
              proto: true,
              forced: NEGATIVE_ZERO || !STRICT_METHOD || !USES_TO_LENGTH,
            },
            {
              indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
                return NEGATIVE_ZERO
                  ? // convert -0 to +0
                    nativeIndexOf.apply(this, arguments) || 0
                  : $indexOf(
                      this,
                      searchElement,
                      arguments.length > 1 ? arguments[1] : undefined
                    );
              },
            }
          );
        },
        {
          "../internals/array-includes": 67,
          "../internals/array-method-is-strict": 70,
          "../internals/array-method-uses-to-length": 71,
          "../internals/export": 92,
        },
      ],
      157: [
        function (require, module, exports) {
          var $ = require("../internals/export");
          var isArray = require("../internals/is-array");

          // `Array.isArray` method
          // https://tc39.github.io/ecma262/#sec-array.isarray
          $(
            { target: "Array", stat: true },
            {
              isArray: isArray,
            }
          );
        },
        { "../internals/export": 92, "../internals/is-array": 107 },
      ],
      158: [
        function (require, module, exports) {
          "use strict";
          var toIndexedObject = require("../internals/to-indexed-object");
          var addToUnscopables = require("../internals/add-to-unscopables");
          var Iterators = require("../internals/iterators");
          var InternalStateModule = require("../internals/internal-state");
          var defineIterator = require("../internals/define-iterator");

          var ARRAY_ITERATOR = "Array Iterator";
          var setInternalState = InternalStateModule.set;
          var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

          // `Array.prototype.entries` method
          // https://tc39.github.io/ecma262/#sec-array.prototype.entries
          // `Array.prototype.keys` method
          // https://tc39.github.io/ecma262/#sec-array.prototype.keys
          // `Array.prototype.values` method
          // https://tc39.github.io/ecma262/#sec-array.prototype.values
          // `Array.prototype[@@iterator]` method
          // https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
          // `CreateArrayIterator` internal method
          // https://tc39.github.io/ecma262/#sec-createarrayiterator
          module.exports = defineIterator(
            Array,
            "Array",
            function (iterated, kind) {
              setInternalState(this, {
                type: ARRAY_ITERATOR,
                target: toIndexedObject(iterated), // target
                index: 0, // next index
                kind: kind, // kind
              });
              // `%ArrayIteratorPrototype%.next` method
              // https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
            },
            function () {
              var state = getInternalState(this);
              var target = state.target;
              var kind = state.kind;
              var index = state.index++;
              if (!target || index >= target.length) {
                state.target = undefined;
                return { value: undefined, done: true };
              }
              if (kind == "keys") return { value: index, done: false };
              if (kind == "values")
                return { value: target[index], done: false };
              return { value: [index, target[index]], done: false };
            },
            "values"
          );

          // argumentsList[@@iterator] is %ArrayProto_values%
          // https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
          // https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
          Iterators.Arguments = Iterators.Array;

          // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
          addToUnscopables("keys");
          addToUnscopables("values");
          addToUnscopables("entries");
        },
        {
          "../internals/add-to-unscopables": 63,
          "../internals/define-iterator": 83,
          "../internals/internal-state": 105,
          "../internals/iterators": 113,
          "../internals/to-indexed-object": 142,
        },
      ],
      159: [
        function (require, module, exports) {
          "use strict";
          var $ = require("../internals/export");
          var $map = require("../internals/array-iteration").map;
          var arrayMethodHasSpeciesSupport = require("../internals/array-method-has-species-support");
          var arrayMethodUsesToLength = require("../internals/array-method-uses-to-length");

          var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("map");
          // FF49- issue
          var USES_TO_LENGTH = arrayMethodUsesToLength("map");

          // `Array.prototype.map` method
          // https://tc39.github.io/ecma262/#sec-array.prototype.map
          // with adding support of @@species
          $(
            {
              target: "Array",
              proto: true,
              forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH,
            },
            {
              map: function map(callbackfn /* , thisArg */) {
                return $map(
                  this,
                  callbackfn,
                  arguments.length > 1 ? arguments[1] : undefined
                );
              },
            }
          );
        },
        {
          "../internals/array-iteration": 68,
          "../internals/array-method-has-species-support": 69,
          "../internals/array-method-uses-to-length": 71,
          "../internals/export": 92,
        },
      ],
      160: [
        function (require, module, exports) {
          "use strict";
          var $ = require("../internals/export");
          var $reduce = require("../internals/array-reduce").left;
          var arrayMethodIsStrict = require("../internals/array-method-is-strict");
          var arrayMethodUsesToLength = require("../internals/array-method-uses-to-length");

          var STRICT_METHOD = arrayMethodIsStrict("reduce");
          var USES_TO_LENGTH = arrayMethodUsesToLength("reduce", { 1: 0 });

          // `Array.prototype.reduce` method
          // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
          $(
            {
              target: "Array",
              proto: true,
              forced: !STRICT_METHOD || !USES_TO_LENGTH,
            },
            {
              reduce: function reduce(callbackfn /* , initialValue */) {
                return $reduce(
                  this,
                  callbackfn,
                  arguments.length,
                  arguments.length > 1 ? arguments[1] : undefined
                );
              },
            }
          );
        },
        {
          "../internals/array-method-is-strict": 70,
          "../internals/array-method-uses-to-length": 71,
          "../internals/array-reduce": 72,
          "../internals/export": 92,
        },
      ],
      161: [
        function (require, module, exports) {
          "use strict";
          var $ = require("../internals/export");
          var isObject = require("../internals/is-object");
          var isArray = require("../internals/is-array");
          var toAbsoluteIndex = require("../internals/to-absolute-index");
          var toLength = require("../internals/to-length");
          var toIndexedObject = require("../internals/to-indexed-object");
          var createProperty = require("../internals/create-property");
          var wellKnownSymbol = require("../internals/well-known-symbol");
          var arrayMethodHasSpeciesSupport = require("../internals/array-method-has-species-support");
          var arrayMethodUsesToLength = require("../internals/array-method-uses-to-length");

          var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("slice");
          var USES_TO_LENGTH = arrayMethodUsesToLength("slice", {
            ACCESSORS: true,
            0: 0,
            1: 2,
          });

          var SPECIES = wellKnownSymbol("species");
          var nativeSlice = [].slice;
          var max = Math.max;

          // `Array.prototype.slice` method
          // https://tc39.github.io/ecma262/#sec-array.prototype.slice
          // fallback for not array-like ES3 strings and DOM objects
          $(
            {
              target: "Array",
              proto: true,
              forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH,
            },
            {
              slice: function slice(start, end) {
                var O = toIndexedObject(this);
                var length = toLength(O.length);
                var k = toAbsoluteIndex(start, length);
                var fin = toAbsoluteIndex(
                  end === undefined ? length : end,
                  length
                );
                // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
                var Constructor, result, n;
                if (isArray(O)) {
                  Constructor = O.constructor;
                  // cross-realm fallback
                  if (
                    typeof Constructor == "function" &&
                    (Constructor === Array || isArray(Constructor.prototype))
                  ) {
                    Constructor = undefined;
                  } else if (isObject(Constructor)) {
                    Constructor = Constructor[SPECIES];
                    if (Constructor === null) Constructor = undefined;
                  }
                  if (Constructor === Array || Constructor === undefined) {
                    return nativeSlice.call(O, k, fin);
                  }
                }
                result = new (Constructor === undefined ? Array : Constructor)(
                  max(fin - k, 0)
                );
                for (n = 0; k < fin; k++, n++)
                  if (k in O) createProperty(result, n, O[k]);
                result.length = n;
                return result;
              },
            }
          );
        },
        {
          "../internals/array-method-has-species-support": 69,
          "../internals/array-method-uses-to-length": 71,
          "../internals/create-property": 82,
          "../internals/export": 92,
          "../internals/is-array": 107,
          "../internals/is-object": 110,
          "../internals/to-absolute-index": 141,
          "../internals/to-indexed-object": 142,
          "../internals/to-length": 144,
          "../internals/well-known-symbol": 151,
        },
      ],
      162: [
        function (require, module, exports) {
          "use strict";
          var $ = require("../internals/export");
          var aFunction = require("../internals/a-function");
          var toObject = require("../internals/to-object");
          var fails = require("../internals/fails");
          var arrayMethodIsStrict = require("../internals/array-method-is-strict");

          var test = [];
          var nativeSort = test.sort;

          // IE8-
          var FAILS_ON_UNDEFINED = fails(function () {
            test.sort(undefined);
          });
          // V8 bug
          var FAILS_ON_NULL = fails(function () {
            test.sort(null);
          });
          // Old WebKit
          var STRICT_METHOD = arrayMethodIsStrict("sort");

          var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD;

          // `Array.prototype.sort` method
          // https://tc39.github.io/ecma262/#sec-array.prototype.sort
          $(
            { target: "Array", proto: true, forced: FORCED },
            {
              sort: function sort(comparefn) {
                return comparefn === undefined
                  ? nativeSort.call(toObject(this))
                  : nativeSort.call(toObject(this), aFunction(comparefn));
              },
            }
          );
        },
        {
          "../internals/a-function": 61,
          "../internals/array-method-is-strict": 70,
          "../internals/export": 92,
          "../internals/fails": 93,
          "../internals/to-object": 145,
        },
      ],
      163: [
        function (require, module, exports) {
          var global = require("../internals/global");
          var setToStringTag = require("../internals/set-to-string-tag");

          // JSON[@@toStringTag] property
          // https://tc39.github.io/ecma262/#sec-json-@@tostringtag
          setToStringTag(global.JSON, "JSON", true);
        },
        { "../internals/global": 98, "../internals/set-to-string-tag": 135 },
      ],
      164: [
        function (require, module, exports) {
          var setToStringTag = require("../internals/set-to-string-tag");

          // Math[@@toStringTag] property
          // https://tc39.github.io/ecma262/#sec-math-@@tostringtag
          setToStringTag(Math, "Math", true);
        },
        { "../internals/set-to-string-tag": 135 },
      ],
      165: [
        function (require, module, exports) {
          var $ = require("../internals/export");
          var DESCRIPTORS = require("../internals/descriptors");
          var create = require("../internals/object-create");

          // `Object.create` method
          // https://tc39.github.io/ecma262/#sec-object.create
          $(
            { target: "Object", stat: true, sham: !DESCRIPTORS },
            {
              create: create,
            }
          );
        },
        {
          "../internals/descriptors": 85,
          "../internals/export": 92,
          "../internals/object-create": 117,
        },
      ],
      166: [
        function (require, module, exports) {
          var $ = require("../internals/export");
          var DESCRIPTORS = require("../internals/descriptors");
          var objectDefinePropertyModile = require("../internals/object-define-property");

          // `Object.defineProperty` method
          // https://tc39.github.io/ecma262/#sec-object.defineproperty
          $(
            {
              target: "Object",
              stat: true,
              forced: !DESCRIPTORS,
              sham: !DESCRIPTORS,
            },
            {
              defineProperty: objectDefinePropertyModile.f,
            }
          );
        },
        {
          "../internals/descriptors": 85,
          "../internals/export": 92,
          "../internals/object-define-property": 119,
        },
      ],
      167: [
        function (require, module, exports) {
          // empty
        },
        {},
      ],
      168: [
        function (require, module, exports) {
          var $ = require("../internals/export");
          var parseIntImplementation = require("../internals/number-parse-int");

          // `parseInt` method
          // https://tc39.github.io/ecma262/#sec-parseint-string-radix
          $(
            { global: true, forced: parseInt != parseIntImplementation },
            {
              parseInt: parseIntImplementation,
            }
          );
        },
        { "../internals/export": 92, "../internals/number-parse-int": 116 },
      ],
      169: [
        function (require, module, exports) {
          arguments[4][167][0].apply(exports, arguments);
        },
        { dup: 167 },
      ],
      170: [
        function (require, module, exports) {
          "use strict";
          var charAt = require("../internals/string-multibyte").charAt;
          var InternalStateModule = require("../internals/internal-state");
          var defineIterator = require("../internals/define-iterator");

          var STRING_ITERATOR = "String Iterator";
          var setInternalState = InternalStateModule.set;
          var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

          // `String.prototype[@@iterator]` method
          // https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
          defineIterator(
            String,
            "String",
            function (iterated) {
              setInternalState(this, {
                type: STRING_ITERATOR,
                string: String(iterated),
                index: 0,
              });
              // `%StringIteratorPrototype%.next` method
              // https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
            },
            function next() {
              var state = getInternalState(this);
              var string = state.string;
              var index = state.index;
              var point;
              if (index >= string.length)
                return { value: undefined, done: true };
              point = charAt(string, index);
              state.index += point.length;
              return { value: point, done: false };
            }
          );
        },
        {
          "../internals/define-iterator": 83,
          "../internals/internal-state": 105,
          "../internals/string-multibyte": 139,
        },
      ],
      171: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.asyncIterator` well-known symbol
          // https://tc39.github.io/ecma262/#sec-symbol.asynciterator
          defineWellKnownSymbol("asyncIterator");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      172: [
        function (require, module, exports) {
          arguments[4][167][0].apply(exports, arguments);
        },
        { dup: 167 },
      ],
      173: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.hasInstance` well-known symbol
          // https://tc39.github.io/ecma262/#sec-symbol.hasinstance
          defineWellKnownSymbol("hasInstance");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      174: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.isConcatSpreadable` well-known symbol
          // https://tc39.github.io/ecma262/#sec-symbol.isconcatspreadable
          defineWellKnownSymbol("isConcatSpreadable");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      175: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.iterator` well-known symbol
          // https://tc39.github.io/ecma262/#sec-symbol.iterator
          defineWellKnownSymbol("iterator");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      176: [
        function (require, module, exports) {
          "use strict";
          var $ = require("../internals/export");
          var global = require("../internals/global");
          var getBuiltIn = require("../internals/get-built-in");
          var IS_PURE = require("../internals/is-pure");
          var DESCRIPTORS = require("../internals/descriptors");
          var NATIVE_SYMBOL = require("../internals/native-symbol");
          var USE_SYMBOL_AS_UID = require("../internals/use-symbol-as-uid");
          var fails = require("../internals/fails");
          var has = require("../internals/has");
          var isArray = require("../internals/is-array");
          var isObject = require("../internals/is-object");
          var anObject = require("../internals/an-object");
          var toObject = require("../internals/to-object");
          var toIndexedObject = require("../internals/to-indexed-object");
          var toPrimitive = require("../internals/to-primitive");
          var createPropertyDescriptor = require("../internals/create-property-descriptor");
          var nativeObjectCreate = require("../internals/object-create");
          var objectKeys = require("../internals/object-keys");
          var getOwnPropertyNamesModule = require("../internals/object-get-own-property-names");
          var getOwnPropertyNamesExternal = require("../internals/object-get-own-property-names-external");
          var getOwnPropertySymbolsModule = require("../internals/object-get-own-property-symbols");
          var getOwnPropertyDescriptorModule = require("../internals/object-get-own-property-descriptor");
          var definePropertyModule = require("../internals/object-define-property");
          var propertyIsEnumerableModule = require("../internals/object-property-is-enumerable");
          var createNonEnumerableProperty = require("../internals/create-non-enumerable-property");
          var redefine = require("../internals/redefine");
          var shared = require("../internals/shared");
          var sharedKey = require("../internals/shared-key");
          var hiddenKeys = require("../internals/hidden-keys");
          var uid = require("../internals/uid");
          var wellKnownSymbol = require("../internals/well-known-symbol");
          var wrappedWellKnownSymbolModule = require("../internals/well-known-symbol-wrapped");
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");
          var setToStringTag = require("../internals/set-to-string-tag");
          var InternalStateModule = require("../internals/internal-state");
          var $forEach = require("../internals/array-iteration").forEach;

          var HIDDEN = sharedKey("hidden");
          var SYMBOL = "Symbol";
          var PROTOTYPE = "prototype";
          var TO_PRIMITIVE = wellKnownSymbol("toPrimitive");
          var setInternalState = InternalStateModule.set;
          var getInternalState = InternalStateModule.getterFor(SYMBOL);
          var ObjectPrototype = Object[PROTOTYPE];
          var $Symbol = global.Symbol;
          var $stringify = getBuiltIn("JSON", "stringify");
          var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
          var nativeDefineProperty = definePropertyModule.f;
          var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
          var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
          var AllSymbols = shared("symbols");
          var ObjectPrototypeSymbols = shared("op-symbols");
          var StringToSymbolRegistry = shared("string-to-symbol-registry");
          var SymbolToStringRegistry = shared("symbol-to-string-registry");
          var WellKnownSymbolsStore = shared("wks");
          var QObject = global.QObject;
          // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
          var USE_SETTER =
            !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

          // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
          var setSymbolDescriptor =
            DESCRIPTORS &&
            fails(function () {
              return (
                nativeObjectCreate(
                  nativeDefineProperty({}, "a", {
                    get: function () {
                      return nativeDefineProperty(this, "a", { value: 7 }).a;
                    },
                  })
                ).a != 7
              );
            })
              ? function (O, P, Attributes) {
                  var ObjectPrototypeDescriptor =
                    nativeGetOwnPropertyDescriptor(ObjectPrototype, P);
                  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
                  nativeDefineProperty(O, P, Attributes);
                  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
                    nativeDefineProperty(
                      ObjectPrototype,
                      P,
                      ObjectPrototypeDescriptor
                    );
                  }
                }
              : nativeDefineProperty;

          var wrap = function (tag, description) {
            var symbol = (AllSymbols[tag] = nativeObjectCreate(
              $Symbol[PROTOTYPE]
            ));
            setInternalState(symbol, {
              type: SYMBOL,
              tag: tag,
              description: description,
            });
            if (!DESCRIPTORS) symbol.description = description;
            return symbol;
          };

          var isSymbol = USE_SYMBOL_AS_UID
            ? function (it) {
                return typeof it == "symbol";
              }
            : function (it) {
                return Object(it) instanceof $Symbol;
              };

          var $defineProperty = function defineProperty(O, P, Attributes) {
            if (O === ObjectPrototype)
              $defineProperty(ObjectPrototypeSymbols, P, Attributes);
            anObject(O);
            var key = toPrimitive(P, true);
            anObject(Attributes);
            if (has(AllSymbols, key)) {
              if (!Attributes.enumerable) {
                if (!has(O, HIDDEN))
                  nativeDefineProperty(
                    O,
                    HIDDEN,
                    createPropertyDescriptor(1, {})
                  );
                O[HIDDEN][key] = true;
              } else {
                if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
                Attributes = nativeObjectCreate(Attributes, {
                  enumerable: createPropertyDescriptor(0, false),
                });
              }
              return setSymbolDescriptor(O, key, Attributes);
            }
            return nativeDefineProperty(O, key, Attributes);
          };

          var $defineProperties = function defineProperties(O, Properties) {
            anObject(O);
            var properties = toIndexedObject(Properties);
            var keys = objectKeys(properties).concat(
              $getOwnPropertySymbols(properties)
            );
            $forEach(keys, function (key) {
              if (!DESCRIPTORS || $propertyIsEnumerable.call(properties, key))
                $defineProperty(O, key, properties[key]);
            });
            return O;
          };

          var $create = function create(O, Properties) {
            return Properties === undefined
              ? nativeObjectCreate(O)
              : $defineProperties(nativeObjectCreate(O), Properties);
          };

          var $propertyIsEnumerable = function propertyIsEnumerable(V) {
            var P = toPrimitive(V, true);
            var enumerable = nativePropertyIsEnumerable.call(this, P);
            if (
              this === ObjectPrototype &&
              has(AllSymbols, P) &&
              !has(ObjectPrototypeSymbols, P)
            )
              return false;
            return enumerable ||
              !has(this, P) ||
              !has(AllSymbols, P) ||
              (has(this, HIDDEN) && this[HIDDEN][P])
              ? enumerable
              : true;
          };

          var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(
            O,
            P
          ) {
            var it = toIndexedObject(O);
            var key = toPrimitive(P, true);
            if (
              it === ObjectPrototype &&
              has(AllSymbols, key) &&
              !has(ObjectPrototypeSymbols, key)
            )
              return;
            var descriptor = nativeGetOwnPropertyDescriptor(it, key);
            if (
              descriptor &&
              has(AllSymbols, key) &&
              !(has(it, HIDDEN) && it[HIDDEN][key])
            ) {
              descriptor.enumerable = true;
            }
            return descriptor;
          };

          var $getOwnPropertyNames = function getOwnPropertyNames(O) {
            var names = nativeGetOwnPropertyNames(toIndexedObject(O));
            var result = [];
            $forEach(names, function (key) {
              if (!has(AllSymbols, key) && !has(hiddenKeys, key))
                result.push(key);
            });
            return result;
          };

          var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
            var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
            var names = nativeGetOwnPropertyNames(
              IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O)
            );
            var result = [];
            $forEach(names, function (key) {
              if (
                has(AllSymbols, key) &&
                (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype, key))
              ) {
                result.push(AllSymbols[key]);
              }
            });
            return result;
          };

          // `Symbol` constructor
          // https://tc39.github.io/ecma262/#sec-symbol-constructor
          if (!NATIVE_SYMBOL) {
            $Symbol = function Symbol() {
              if (this instanceof $Symbol)
                throw TypeError("Symbol is not a constructor");
              var description =
                !arguments.length || arguments[0] === undefined
                  ? undefined
                  : String(arguments[0]);
              var tag = uid(description);
              var setter = function (value) {
                if (this === ObjectPrototype)
                  setter.call(ObjectPrototypeSymbols, value);
                if (has(this, HIDDEN) && has(this[HIDDEN], tag))
                  this[HIDDEN][tag] = false;
                setSymbolDescriptor(
                  this,
                  tag,
                  createPropertyDescriptor(1, value)
                );
              };
              if (DESCRIPTORS && USE_SETTER)
                setSymbolDescriptor(ObjectPrototype, tag, {
                  configurable: true,
                  set: setter,
                });
              return wrap(tag, description);
            };

            redefine($Symbol[PROTOTYPE], "toString", function toString() {
              return getInternalState(this).tag;
            });

            redefine($Symbol, "withoutSetter", function (description) {
              return wrap(uid(description), description);
            });

            propertyIsEnumerableModule.f = $propertyIsEnumerable;
            definePropertyModule.f = $defineProperty;
            getOwnPropertyDescriptorModule.f = $getOwnPropertyDescriptor;
            getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f =
              $getOwnPropertyNames;
            getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;

            wrappedWellKnownSymbolModule.f = function (name) {
              return wrap(wellKnownSymbol(name), name);
            };

            if (DESCRIPTORS) {
              // https://github.com/tc39/proposal-Symbol-description
              nativeDefineProperty($Symbol[PROTOTYPE], "description", {
                configurable: true,
                get: function description() {
                  return getInternalState(this).description;
                },
              });
              if (!IS_PURE) {
                redefine(
                  ObjectPrototype,
                  "propertyIsEnumerable",
                  $propertyIsEnumerable,
                  { unsafe: true }
                );
              }
            }
          }

          $(
            {
              global: true,
              wrap: true,
              forced: !NATIVE_SYMBOL,
              sham: !NATIVE_SYMBOL,
            },
            {
              Symbol: $Symbol,
            }
          );

          $forEach(objectKeys(WellKnownSymbolsStore), function (name) {
            defineWellKnownSymbol(name);
          });

          $(
            { target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL },
            {
              // `Symbol.for` method
              // https://tc39.github.io/ecma262/#sec-symbol.for
              for: function (key) {
                var string = String(key);
                if (has(StringToSymbolRegistry, string))
                  return StringToSymbolRegistry[string];
                var symbol = $Symbol(string);
                StringToSymbolRegistry[string] = symbol;
                SymbolToStringRegistry[symbol] = string;
                return symbol;
              },
              // `Symbol.keyFor` method
              // https://tc39.github.io/ecma262/#sec-symbol.keyfor
              keyFor: function keyFor(sym) {
                if (!isSymbol(sym)) throw TypeError(sym + " is not a symbol");
                if (has(SymbolToStringRegistry, sym))
                  return SymbolToStringRegistry[sym];
              },
              useSetter: function () {
                USE_SETTER = true;
              },
              useSimple: function () {
                USE_SETTER = false;
              },
            }
          );

          $(
            {
              target: "Object",
              stat: true,
              forced: !NATIVE_SYMBOL,
              sham: !DESCRIPTORS,
            },
            {
              // `Object.create` method
              // https://tc39.github.io/ecma262/#sec-object.create
              create: $create,
              // `Object.defineProperty` method
              // https://tc39.github.io/ecma262/#sec-object.defineproperty
              defineProperty: $defineProperty,
              // `Object.defineProperties` method
              // https://tc39.github.io/ecma262/#sec-object.defineproperties
              defineProperties: $defineProperties,
              // `Object.getOwnPropertyDescriptor` method
              // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
              getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
            }
          );

          $(
            { target: "Object", stat: true, forced: !NATIVE_SYMBOL },
            {
              // `Object.getOwnPropertyNames` method
              // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
              getOwnPropertyNames: $getOwnPropertyNames,
              // `Object.getOwnPropertySymbols` method
              // https://tc39.github.io/ecma262/#sec-object.getownpropertysymbols
              getOwnPropertySymbols: $getOwnPropertySymbols,
            }
          );

          // Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
          // https://bugs.chromium.org/p/v8/issues/detail?id=3443
          $(
            {
              target: "Object",
              stat: true,
              forced: fails(function () {
                getOwnPropertySymbolsModule.f(1);
              }),
            },
            {
              getOwnPropertySymbols: function getOwnPropertySymbols(it) {
                return getOwnPropertySymbolsModule.f(toObject(it));
              },
            }
          );

          // `JSON.stringify` method behavior with symbols
          // https://tc39.github.io/ecma262/#sec-json.stringify
          if ($stringify) {
            var FORCED_JSON_STRINGIFY =
              !NATIVE_SYMBOL ||
              fails(function () {
                var symbol = $Symbol();
                // MS Edge converts symbol values to JSON as {}
                return (
                  $stringify([symbol]) != "[null]" ||
                  // WebKit converts symbol values to JSON as null
                  $stringify({ a: symbol }) != "{}" ||
                  // V8 throws on boxed symbols
                  $stringify(Object(symbol)) != "{}"
                );
              });

            $(
              { target: "JSON", stat: true, forced: FORCED_JSON_STRINGIFY },
              {
                // eslint-disable-next-line no-unused-vars
                stringify: function stringify(it, replacer, space) {
                  var args = [it];
                  var index = 1;
                  var $replacer;
                  while (arguments.length > index)
                    args.push(arguments[index++]);
                  $replacer = replacer;
                  if ((!isObject(replacer) && it === undefined) || isSymbol(it))
                    return; // IE8 returns string on undefined
                  if (!isArray(replacer))
                    replacer = function (key, value) {
                      if (typeof $replacer == "function")
                        value = $replacer.call(this, key, value);
                      if (!isSymbol(value)) return value;
                    };
                  args[1] = replacer;
                  return $stringify.apply(null, args);
                },
              }
            );
          }

          // `Symbol.prototype[@@toPrimitive]` method
          // https://tc39.github.io/ecma262/#sec-symbol.prototype-@@toprimitive
          if (!$Symbol[PROTOTYPE][TO_PRIMITIVE]) {
            createNonEnumerableProperty(
              $Symbol[PROTOTYPE],
              TO_PRIMITIVE,
              $Symbol[PROTOTYPE].valueOf
            );
          }
          // `Symbol.prototype[@@toStringTag]` property
          // https://tc39.github.io/ecma262/#sec-symbol.prototype-@@tostringtag
          setToStringTag($Symbol, SYMBOL);

          hiddenKeys[HIDDEN] = true;
        },
        {
          "../internals/an-object": 64,
          "../internals/array-iteration": 68,
          "../internals/create-non-enumerable-property": 80,
          "../internals/create-property-descriptor": 81,
          "../internals/define-well-known-symbol": 84,
          "../internals/descriptors": 85,
          "../internals/export": 92,
          "../internals/fails": 93,
          "../internals/get-built-in": 95,
          "../internals/global": 98,
          "../internals/has": 99,
          "../internals/hidden-keys": 100,
          "../internals/internal-state": 105,
          "../internals/is-array": 107,
          "../internals/is-object": 110,
          "../internals/is-pure": 111,
          "../internals/native-symbol": 114,
          "../internals/object-create": 117,
          "../internals/object-define-property": 119,
          "../internals/object-get-own-property-descriptor": 120,
          "../internals/object-get-own-property-names": 122,
          "../internals/object-get-own-property-names-external": 121,
          "../internals/object-get-own-property-symbols": 123,
          "../internals/object-keys": 126,
          "../internals/object-property-is-enumerable": 127,
          "../internals/redefine": 131,
          "../internals/set-to-string-tag": 135,
          "../internals/shared": 138,
          "../internals/shared-key": 136,
          "../internals/to-indexed-object": 142,
          "../internals/to-object": 145,
          "../internals/to-primitive": 146,
          "../internals/uid": 148,
          "../internals/use-symbol-as-uid": 149,
          "../internals/well-known-symbol": 151,
          "../internals/well-known-symbol-wrapped": 150,
        },
      ],
      177: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.matchAll` well-known symbol
          defineWellKnownSymbol("matchAll");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      178: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.match` well-known symbol
          // https://tc39.github.io/ecma262/#sec-symbol.match
          defineWellKnownSymbol("match");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      179: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.replace` well-known symbol
          // https://tc39.github.io/ecma262/#sec-symbol.replace
          defineWellKnownSymbol("replace");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      180: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.search` well-known symbol
          // https://tc39.github.io/ecma262/#sec-symbol.search
          defineWellKnownSymbol("search");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      181: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.species` well-known symbol
          // https://tc39.github.io/ecma262/#sec-symbol.species
          defineWellKnownSymbol("species");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      182: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.split` well-known symbol
          // https://tc39.github.io/ecma262/#sec-symbol.split
          defineWellKnownSymbol("split");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      183: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.toPrimitive` well-known symbol
          // https://tc39.github.io/ecma262/#sec-symbol.toprimitive
          defineWellKnownSymbol("toPrimitive");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      184: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.toStringTag` well-known symbol
          // https://tc39.github.io/ecma262/#sec-symbol.tostringtag
          defineWellKnownSymbol("toStringTag");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      185: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.unscopables` well-known symbol
          // https://tc39.github.io/ecma262/#sec-symbol.unscopables
          defineWellKnownSymbol("unscopables");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      186: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.asyncDispose` well-known symbol
          // https://github.com/tc39/proposal-using-statement
          defineWellKnownSymbol("asyncDispose");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      187: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.dispose` well-known symbol
          // https://github.com/tc39/proposal-using-statement
          defineWellKnownSymbol("dispose");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      188: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.observable` well-known symbol
          // https://github.com/tc39/proposal-observable
          defineWellKnownSymbol("observable");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      189: [
        function (require, module, exports) {
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          // `Symbol.patternMatch` well-known symbol
          // https://github.com/tc39/proposal-pattern-matching
          defineWellKnownSymbol("patternMatch");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      190: [
        function (require, module, exports) {
          // TODO: remove from `core-js@4`
          var defineWellKnownSymbol = require("../internals/define-well-known-symbol");

          defineWellKnownSymbol("replaceAll");
        },
        { "../internals/define-well-known-symbol": 84 },
      ],
      191: [
        function (require, module, exports) {
          require("./es.array.iterator");
          var DOMIterables = require("../internals/dom-iterables");
          var global = require("../internals/global");
          var classof = require("../internals/classof");
          var createNonEnumerableProperty = require("../internals/create-non-enumerable-property");
          var Iterators = require("../internals/iterators");
          var wellKnownSymbol = require("../internals/well-known-symbol");

          var TO_STRING_TAG = wellKnownSymbol("toStringTag");

          for (var COLLECTION_NAME in DOMIterables) {
            var Collection = global[COLLECTION_NAME];
            var CollectionPrototype = Collection && Collection.prototype;
            if (
              CollectionPrototype &&
              classof(CollectionPrototype) !== TO_STRING_TAG
            ) {
              createNonEnumerableProperty(
                CollectionPrototype,
                TO_STRING_TAG,
                COLLECTION_NAME
              );
            }
            Iterators[COLLECTION_NAME] = Iterators.Array;
          }
        },
        {
          "../internals/classof": 77,
          "../internals/create-non-enumerable-property": 80,
          "../internals/dom-iterables": 87,
          "../internals/global": 98,
          "../internals/iterators": 113,
          "../internals/well-known-symbol": 151,
          "./es.array.iterator": 158,
        },
      ],
      192: [
        function (require, module, exports) {
          arguments[4][54][0].apply(exports, arguments);
        },
        { "../../es/array/from": 33, dup: 54 },
      ],
      193: [
        function (require, module, exports) {
          arguments[4][55][0].apply(exports, arguments);
        },
        { "../../es/array/is-array": 34, dup: 55 },
      ],
      194: [
        function (require, module, exports) {
          var parent = require("../../../es/array/virtual/for-each");

          module.exports = parent;
        },
        { "../../../es/array/virtual/for-each": 36 },
      ],
      195: [
        function (require, module, exports) {
          var parent = require("../../es/instance/concat");

          module.exports = parent;
        },
        { "../../es/instance/concat": 42 },
      ],
      196: [
        function (require, module, exports) {
          var parent = require("../../es/instance/flags");

          module.exports = parent;
        },
        { "../../es/instance/flags": 43 },
      ],
      197: [
        function (require, module, exports) {
          require("../../modules/web.dom-collections.iterator");
          var forEach = require("../array/virtual/for-each");
          var classof = require("../../internals/classof");
          var ArrayPrototype = Array.prototype;

          var DOMIterables = {
            DOMTokenList: true,
            NodeList: true,
          };

          module.exports = function (it) {
            var own = it.forEach;
            return it === ArrayPrototype ||
              (it instanceof Array && own === ArrayPrototype.forEach) ||
              // eslint-disable-next-line no-prototype-builtins
              DOMIterables.hasOwnProperty(classof(it))
              ? forEach
              : own;
          };
        },
        {
          "../../internals/classof": 77,
          "../../modules/web.dom-collections.iterator": 191,
          "../array/virtual/for-each": 194,
        },
      ],
      198: [
        function (require, module, exports) {
          var parent = require("../../es/instance/index-of");

          module.exports = parent;
        },
        { "../../es/instance/index-of": 44 },
      ],
      199: [
        function (require, module, exports) {
          var parent = require("../../es/instance/map");

          module.exports = parent;
        },
        { "../../es/instance/map": 45 },
      ],
      200: [
        function (require, module, exports) {
          var parent = require("../../es/instance/reduce");

          module.exports = parent;
        },
        { "../../es/instance/reduce": 46 },
      ],
      201: [
        function (require, module, exports) {
          arguments[4][58][0].apply(exports, arguments);
        },
        { "../../es/instance/slice": 47, dup: 58 },
      ],
      202: [
        function (require, module, exports) {
          var parent = require("../../es/instance/sort");

          module.exports = parent;
        },
        { "../../es/instance/sort": 48 },
      ],
      203: [
        function (require, module, exports) {
          var parent = require("../../es/object/create");

          module.exports = parent;
        },
        { "../../es/object/create": 49 },
      ],
      204: [
        function (require, module, exports) {
          var parent = require("../../es/object/define-property");

          module.exports = parent;
        },
        { "../../es/object/define-property": 50 },
      ],
      205: [
        function (require, module, exports) {
          var parent = require("../es/parse-int");

          module.exports = parent;
        },
        { "../es/parse-int": 51 },
      ],
      206: [
        function (require, module, exports) {
          var parent = require("../../es/symbol");

          module.exports = parent;
        },
        { "../../es/symbol": 53 },
      ],
    },
    {},
    [3]
  )(3);
});

(function (XRegExp) {
  XRegExp.prepareLbPattern = function (pattern, flags) {
    var lbOpen, lbEndPos, lbInner;
    flags = flags || "";
    // Extract flags from a leading mode modifier, if present
    pattern = pattern.replace(/^\(\?([\w$]+)\)/, function ($0, $1) {
      flags += $1;
      return "";
    });
    if ((lbOpen = /^\(\?<([=!])/.exec(pattern))) {
      // Extract the lookbehind pattern. Allows nested groups, escaped parens, and unescaped parens within classes
      lbEndPos = XRegExp.matchRecursive(
        pattern,
        /\((?:[^()[\\]|\\.|\[(?:[^\\\]]|\\.)*])*/.source,
        "\\)",
        "s",
        {
          valueNames: [null, null, null, "right"],
          escapeChar: "\\",
        }
      )[0].end;
      lbInner = pattern.slice("(?<=".length, lbEndPos - 1);
    } else {
      throw new Error("lookbehind not at start of pattern");
    }
    return {
      lb: XRegExp("(?:" + lbInner + ")$(?!\\s)", flags.replace(/[gy]/g, "")), // $(?!\s) allows use of flag m
      lbType: lbOpen[1] === "=", // Positive or negative lookbehind
      main: XRegExp(pattern.slice(("(?<=)" + lbInner).length), flags),
    };
  }

})(XRegExp);


//  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.
// | .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
// | | ____    ____ | || |     ____     | || |  ____  ____  | || |     _____    | || |  _________   | |
// | ||_   \  /   _|| || |   .'    `.   | || | |_  _||_  _| | || |    |_   _|   | || | |_   ___  |  | |
// | |  |   \/   |  | || |  /  .--.  \  | || |   \ \  / /   | || |      | |     | || |   | |_  \_|  | |
// | |  | |\  /| |  | || |  | |    | |  | || |    > `' <    | || |      | |     | || |   |  _|  _   | |
// | | _| |_\/_| |_ | || |  \  `--'  /  | || |  _/ /'`\ \_  | || |     _| |_    | || |  _| |___/ |  | |
// | ||_____||_____|| || |   `.____.'   | || | |____||____| | || |    |_____|   | || | |_________|  | |
// | |              | || |              | || |              | || |              | || |              | |
// | '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
//  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'
//
// Don Muzquiz, ora pro nobis
//

// localStorage item name for OneLinkJS Translation Key
var TranslationKeyName = 'OneLinkJSTranslationKey';

//-----------------------------------------------------------------------------
function OneLinkJS_Translation()
//-----------------------------------------------------------------------------
{
	let tkey = localStorage.getItem(TranslationKeyName) || '';
	if (tkey)
	{
		let srcUrl = "https://www.onelink-edge.com/xapis/Pretranslate/" + tkey + '.js';
		let script = document.createElement("script");
		script.type = "text/javascript";
		script.src = srcUrl;
		document.head.appendChild(script);
	}
} // OneLinkJS_Translation

//-----------------------------------------------------------------------------
function OneLinkJS_SetLanguageKey(translationKey)
//-----------------------------------------------------------------------------
{
	localStorage.setItem(TranslationKeyName, translationKey);
	location.reload();
} // OneLinkJS_SetLanguageKey

//-----------------------------------------------------------------------------
function OneLinkJS_SetLanguageURL(translationKey, ltype, langURLCode)
//-----------------------------------------------------------------------------
{
	//OneLinkJS_SetLanguageURL(524F-32AA-A083-0EC1, "sudomain", "zhcn");
	localStorage.setItem(TranslationKeyName, translationKey);

	if (ltype =="subfolder")
	{
		(document.location = document.location.origin+"/"+langURLCode+document.location.pathname);
	}
	else if (ltype == "subdomain")
	{
		let srootdomain = (document.location.hostname.split(".").length== 2 ? document.location.hostname : document.location.hostname.split(".").slice(1,).join("."));
		(document.location = document.location.protocol+"//"+langURLCode+"."+srootdomain+document.location.pathname);
	}
	else
	{
		location.reload();
	}
} // OneLinkJS_SetLanguageURL


//some clients may not like having inline javascript in our template code, we should consider doing it this way
//window.addEventListener("load", document.querySelector("#OneLinkJS_languageSelector").onchange = function() { OneLinkJS_SetLanguageURL(this.value) } );


var moxie_dom_event = (function() {
    
    /*
      MoxieDOMEvent
      
      wait for dom realy ready
      calcs when the total changes list is effectively the same for a certain delta of time
      
    */
    
    //----------------------------------------------------------------------------
    // globals
    //----------------------------------------------------------------------------
    
    var g_oMoxieBaseClock;
    var g_oMoxieMutationTimer;
    
    var g_iMoxieBaseStartTime = 0;
    var g_iMoxieMutationStartTime = 0;
    
    var g_iMoxiePageMaxTime;
    var g_iMoxiePageMinTime = 250;
    var g_iMoxiePageDeltaTime = 500;
    
    var g_oMoxieDOMObserver;
    
    var g_oMoxieDOMChanges = [];
    
    var g_oMoxieEventTarget;
    
    var g_CurrentCallback;
    
    const g_oDOMObsConfig = { attributes: false, childList: true, subtree: true };
    
    //---------------------
    function IncSample()
    //---------------------
    {
	'use strict';
	//console.log("Sample time elapsed");
	let iMoxieElapsedMutationTime = Date.now() -g_iMoxieMutationStartTime;
	//console.log("Elapsed Mutation Time: " +iMoxieElapsedBaseTime);
	if (iMoxieElapsedMutationTime < g_iMoxiePageDeltaTime)
	{
	    //console.log('still mutating');
	    g_oMoxieMutationTimer = window.setTimeout(IncSample, g_iMoxiePageDeltaTime-iMoxieElapsedMutationTime);
	}
	else {
	    //console.log('done mutating');
	    //console.log(Date.now() -g_iMoxieBaseStartTime);
	    window.clearTimeout(g_oMoxieBaseClock);
	    g_oMoxieDOMObserver.disconnect();
	    g_iMoxieBaseStartTime = 0;
	    g_iMoxieMutationStartTime = 0;
	    g_oMoxieDOMChanges = [];
	    //console.log(g_CurrentCallback);
	    g_CurrentCallback();
	    g_CurrentCallback = null;
	}
    } // IncSample
    
    //-------------------
    function IncTime()
    //-------------------
    {
	'use strict';
	let iMoxieElapsedBaseTime = Date.now() - g_iMoxieBaseStartTime;
	//console.log("Elapsed Base Time: " +iMoxieElapsedBaseTime);
	if (iMoxieElapsedBaseTime < g_iMoxiePageMinTime)
	{
	    
	    g_oMoxieBaseClock = window.setTimeout(IncTime, g_iMoxiePageMinTime -iMoxieElapsedBaseTime);
	}
	else if (iMoxieElapsedBaseTime >= g_iMoxiePageMaxTime)
	{
	    //console.log('ran out of time');
	    window.clearTimeout(g_oMoxieMutationTimer);
	    window.localStorage.setItem('moxie_relaxation_time', 'Ran out of time!');
	    g_oMoxieDOMObserver.disconnect();
	    g_iMoxieBaseStartTime = 0;
	    g_iMoxieMutationStartTime = 0;
	    g_oMoxieDOMChanges = [];
	    try
	    {
		g_CurrentCallback();
	    }
	    catch(error)
	    {
	    }
	    g_CurrentCallback = null;
	}
	else if ((iMoxieElapsedBaseTime >= g_iMoxiePageMinTime) && !g_iMoxieMutationStartTime)
	{
	    g_iMoxieMutationStartTime = Date.now();
	    g_oMoxieMutationTimer = window.setTimeout(IncSample, g_iMoxiePageDeltaTime);
	    g_oMoxieBaseClock = window.setTimeout(IncTime, g_iMoxiePageMaxTime-iMoxieElapsedBaseTime);
	}
    } // IncTime
    
    //----------------------------
    function MoxieStopDOMWaiting()
    //----------------------------
    {
	'use strict';
	window.clearTimeout(g_oMoxieMutationTimer);
	window.clearTimeout(g_oMoxieBaseClock);
	g_oMoxieDOMObserver.disconnect();
	g_iMoxieBaseStartTime = 0;
	g_iMoxieMutationStartTime = 0;
	g_oMoxieDOMChanges = [];
	g_CurrentCallback = null;
    }//MoxieStopDOMWaiting
    
    //---------------------------------------
    function MoxieCheckMutation(oML, observer)
    //---------------------------------------
    {
	'use strict';
	//console.log(Date.now()-g_iMoxieBaseStartTime);
	//console.log('a mutation happened');
	//console.log(oML);
	if (g_iMoxieMutationStartTime)
	{
	    //console.log('in the time frame');
	    let bSigMut = false;
	    for (let j=0,lnj=oML.length; j<lnj; j++)
	    {
		//console.log(oML[j]);
		let oMutationRecord = oML[j];
		
		if (oMutationRecord.type == "childList")
		{
		    
		    if (oMutationRecord.addedNodes)
		    {
			let oAdded = oMutationRecord.addedNodes;
			for (let ik=0,ilnk=oAdded.length; ik<ilnk; ik++)
			{
			    if (!(oAdded[ik] in g_oMoxieDOMChanges))
			    {
				g_oMoxieDOMChanges.push(oAdded[ik]);
				bSigMut = true;
			    }
			}
		    }
		    if (oMutationRecord.removedNodes)
		    {
			let oRemoved = oMutationRecord.removedNodes;
			for (let ik=0,ilnk=oRemoved.length; ik<ilnk; ik++)
			{
			    if (!(oRemoved[ik] in g_oMoxieDOMChanges))
			    {
				g_oMoxieDOMChanges.push(oRemoved[ik]);
				bSigMut = true;
			    }
			}
		    }
		    
		}
	    }
	    if (bSigMut)
	    {
		window.clearTimeout(g_oMoxieMutationTimer);
		g_iMoxieMutationStartTime = Date.now();
		//console.log("Mutation Clock Restart: " + g_iMoxieMutationStartTime);
		g_oMoxieMutationTimer = window.setTimeout(IncSample, g_iMoxiePageDeltaTime);
		//console.log('and it was significant');
	    }
	}
    } // MoxieCheckMutation
    
    //---------------------------------
    function MoxieObserveDOM(oObsTarg)
    //---------------------------------
    {
	'use strict';
	g_oMoxieDOMObserver = new MutationObserver(MoxieCheckMutation);
	g_oMoxieDOMObserver.observe(oObsTarg, g_oDOMObsConfig);
	
	//console.log("Base Clock Start: " + g_iMoxieBaseStartTime);
	//console.log("Observing");
	g_oMoxieBaseClock = window.setTimeout(IncTime, g_iMoxiePageMinTime);
	//console.log("Window time start");
    } // MoxieObserveDOM
    
    
    //-------------------------------
    function MoxieWaitForReadyMainWindow(callback, maxwait)
    //-------------------------------
    {
	'use strict';
	let oObsNode = document.querySelector("html");
	//console.log('observe node');
	//console.log(oObsNode);
	window.localStorage.setItem('moxie_relaxation_time', "0");
	g_iMoxiePageMaxTime = maxwait;
	
	//console.log('nav time: ' + window.performance.timing.navigationStart);
	//g_iMoxieBaseStartTime =window.performance.timing.navigationStart;
	g_iMoxieBaseStartTime = Date.now();
	g_oMoxieEventTarget = document.querySelector('html');
	g_CurrentCallback = callback;
	//g_oMoxieEventTarget.addEventListener('MoxieCanHasDOMContent', g_CurrentCallback);
	//console.log('MOXIE listening!');
	if (document.readyState != "loading")
	{
	    MoxieObserveDOM(oObsNode);
	}
	else
	{
	    window.addEventListener('DOMContentLoaded', function (event){
		MoxieObserveDOM(oObsNode);
	    });
	}	
	
    }//MoxieWaitForReadyMainWindow
    
    //---------------------------------
    function MoxieWaitForReady(win, callback, maxwait, minwait, delta)
    //---------------------------------
    {
	'use strict';
	let oObsNode = win.document.querySelector("html");
	g_iMoxieBaseStartTime = Date.now();
	g_oMoxieEventTarget = document.querySelector('html');
	g_CurrentCallback = callback;
	g_iMoxiePageMaxTime = maxwait;
	g_iMoxiePageMinTime = minwait;
	g_iMoxiePageDeltaTime = delta;
	
	//console.log('new callback');
	//console.log(callback);
	
	if (win.document.readyState != "loading")
	{
	    //console.log('MOXIE listening to window!');
	    MoxieObserveDOM(oObsNode);
	}
	else
	{
	    win.addEventListener('DOMContentLoaded', function (event) {
		//console.log('MOXIE listening to window!');
		MoxieObserveDOM(oObsNode);
	    });
	}	
	
    }//WaitForReady
    
    //for test
    //-----------------------
    function MoxieTestEvent()
    //-----------------------
    {
	'use strict';
	window.localStorage.setItem('moxie_total_relaxation_time', Date.now() - window.performance.timing.navigationStart);
	window.localStorage.setItem('moxie_dom_relaxation_time', Date.now() - window.performance.timing.domContentLoadedEventEnd);
	window.localStorage.setItem('dom_relaxation_time', window.performance.timing.domContentLoadedEventEnd-window.performance.timing.navigationStart);
	window.localStorage.setItem('window_relaxation_time', window.performance.timing.domComplete-window.performance.timing.navigationStart);
    }//MoxieTestEvent

    return {MoxieWaitForReady: MoxieWaitForReady, MoxieWaitForReadyMainWindow: MoxieWaitForReadyMainWindow, MoxieStopDOMWaiting: MoxieStopDOMWaiting};
})();
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = moxie_dom_event;
//  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.
// | .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
// | | ____    ____ | || |     ____     | || |  ____  ____  | || |     _____    | || |  _________   | |
// | ||_   \  /   _|| || |   .'    `.   | || | |_  _||_  _| | || |    |_   _|   | || | |_   ___  |  | |
// | |  |   \/   |  | || |  /  .--.  \  | || |   \ \  / /   | || |      | |     | || |   | |_  \_|  | |
// | |  | |\  /| |  | || |  | |    | |  | || |    > `' <    | || |      | |     | || |   |  _|  _   | |
// | | _| |_\/_| |_ | || |  \  `--'  /  | || |  _/ /'`\ \_  | || |     _| |_    | || |  _| |___/ |  | |
// | ||_____||_____|| || |   `.____.'   | || | |____||____| | || |    |_____|   | || | |_________|  | |
// | |              | || |              | || |              | || |              | || |              | |
// | '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
//  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'
//
// Don Muzquiz, ora pro nobis
//
// Moxie Rules of Engagement (a Hippocratic Oath)
// 1. Do no harm to any web site I am injected into.
// 2. Whatever I do, do it fast.
// 3. Remember all who use me. Customer web sites, Tarantula, Chrome Extensions, ...
//

//-----------------------------------------------------------------------------
// global functions
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
function OneLinkTxNumber(sToken)
//-----------------------------------------------------------------------------
{
	// TODO: Logic for localizing numbers

	return sToken;
} // OneLinkTxNumber

//-----------------------------------------------------------------------------
function OneLinkTxDateTime(sToken)
//-----------------------------------------------------------------------------
{
	// TODO: Logic for localizing dates and times

	return sToken;
} // OneLinkTxDateTime

//-----------------------------------------------------------------------------
function OneLinkTxTimeZone(sToken)
//-----------------------------------------------------------------------------
{
	// TODO: Logic for localizing timezones

	return sToken;
} // OneLinkTxTimeZone

var OneLinkMoxieJS = (function() {
'use strict';

//-----------------------------------------------------------------------------
// globals
//-----------------------------------------------------------------------------

var g_MoxieVersion          = "2.12.2"; // <-- Update version number for every change
var g_XAPISToken            = null;
var g_XAPISTokenDate        = null;  // Date token last refreshed 
var g_XAPISTokenInterval    = 60000 * 15; // 15 minutes interval to get new token
var g_iDebugLevel           = 0;
var g_bIsOPE                = false;
var g_bIsGLNOW              = false;
var g_sSkeletonVersion      = "1";
var g_bInMigrateMode        = false;
var g_iMigrateToVersion     = 0;
var g_sMigrateTKey          = "";
var g_sGLNOWUser            = "";
var g_sOAuthToken           = "";
var g_bIsMultiDomain        = false;
var g_bContentBackfill      = false;
var g_bInitialized          = false;
var g_bPageDone             = false;
var g_OPEArray              = [];
var g_OPEAssetArray         = [];
var g_TranslateCallback     = null;
var g_TranslationRules      = null;
var g_bTruncateHash         = true;
var g_bEnableImages         = false;
var g_TruncateUrlsAt        = [];
var g_RemoveUrlParam        = [];
var g_ExcludedUris          = [];
var g_IncludedUris          = [];
var g_TargetConfig          = null;
var g_TranslationArray      = null;
var g_AssetTranslationArray = null;
var g_TargetCache           = {};
var g_bEnableAMI            = true;
var g_bForceAMI             = false;
var g_ApiStats              = [];
var g_MoxieObserver         = null;
var g_IntersectObserver     = null;
var g_IntersectSet          = new Set();
var g_MoxiePseudoObserver   = null;
var g_bDisableMoxiePseudoObserver = false;
var g_iDisableTimeoutID     = null;
var g_MoxieAssetObserver    = null;
var g_sMoxieLocation        = document.location.pathname + document.location.search;
var g_bInitDelayDone        = false;
var g_RulesInlineTags       = [];
var g_bKeepActiveElement    = true;
var g_RulesBlockTags        = [];
var g_LangSelectorTICs      = [];
var g_LangSelectorLabels    = null;
var g_NoAmiTICs             = [];
var g_NoTranslateTICs       = [];
var g_TranslateTICs         = [];
var g_IgnoreHiddenTICs      = [];
var g_NoImageTranslateTICs  = [];
var g_ImageTranslateTICs    = [];
var g_PseudoNoTranslateTICs = [];
var g_PseudoTranslateTICs   = [];
var g_SuppressMtTICs        = [];
var g_AutoDetectTICs        = [];
var g_DefaultAttrs          = ["title", "alt", "placeholder", "aria-label", "aria-roledescription", "aria-placeholder", "aria-valuetext"];
var g_TranslateAttrs        = [
		{
			"T":new RegExp(".*", 'i'),
			"I":new RegExp(".*", 'i'),
			"C":new RegExp(".*", 'i'),
			"attrs":g_DefaultAttrs
		}
	];
var g_NoTranslateAttrs      = [];
var g_AttrArray             = [...g_DefaultAttrs];
var g_TranslateInputValue   = [];
var g_NoTranslateInputValue = [];
var g_BlockHashArray        = [];
var g_OPEBlocksSeen         = [];
var g_OPEBlocksForSegments  = [];
var g_HttpRegex             = /^https?:/;
var g_WildcardRegex         = new RegExp(/.*/i);

// Numbers
//   123456
//   123,456
//   1,124 15
//   1 354,77
//   2.533,86
//   1 - 1/2
//   1.2.3.4.5
var g_NumStringRegEx       = /([^ \t`~!@#$%^&*()_=\[\]{}\|;:'",.<>/?€]*(?:\d+(?:(?:\.\d)|(?:,\d)|(?:-[\t ]*\d)|(?:\/[\t ]*\d)|(?:[\t ]+\d|[\t ]+-[\t ]*\d|[\t ]+\/[\t ]*\d))*)+[^ \t`~!@#$%^&*()_=\[\]{}\|;:'",.<>/?€]*)/g;
var g_NumRegEx             = /^[^ \t`~!@#$%^&*()_=\[\]{}\|;:'",.<>/?€]*(?:\d+(?:(?:\.\d)|(?:,\d)|(?:-[\t ]*\d)|(?:\/[\t ]*\d)|(?:[\t ]+\d|[\t ]+-[\t ]*\d|[\t ]+\/[\t ]*\d))*)+[^ \t`~!@#$%^&*()_=\[\]{}\|;:'",.<>/?€]*$/;

// Dates/Times
//   8/19/1990
//   8-19-1990
//   8/19/1990 12:00:16
//   3:30 AM 2/3/86
//   2020-06-16T16:07:03
//   2020-06-16 16:07:03

let g_DateTime1Regex   = /((?:\d{1,2}(?::\d{1,2})?[ \t]*(?:a\.?m\.?[ \t]*|p\.?m\.?\[ \t]*)?)?(?:(?:\d{4}|\d{2}|\d{1})\/\d{1,2}\/(?:\d{4}|\d{2}|\d{1})|(?:\d{4}|\d{2}|\d{1})-\d{1,2}-(?:\d{4}|\d{2}|\d{1}))(?:[ \tT]+\d+:*\d*:*\d*:*\d*(?:[ \t]*a\.?m\.?|[ \t]*p\.?m\.?)*|\d+[ \t]*(?:a\.?m\.?|p\.?m\.?)+){0,1})(?=\s|$|\.|\,|\!|\?|\()/gi;
let g_DateTime1Pattern = /^((?:\d{1,2}(?::\d{1,2})?[ \t]*(?:a\.?m\.?[ \t]*|p\.?m\.?\[ \t]*)?)?(?:(?:\d{4}|\d{2}|\d{1})\/\d{1,2}\/(?:\d{4}|\d{2}|\d{1})|(?:\d{4}|\d{2}|\d{1})-\d{1,2}-(?:\d{4}|\d{2}|\d{1}))(?:[ \tT]+\d+:*\d*:*\d*:*\d*(?:[ \t]*a\.?m\.?|[ \t]*p\.?m\.?)*|\d+[ \t]*(?:a\.?m\.?|p\.?m\.?)+){0,1})(?=\s|$|\.|\,|\!|\?|\()$/i;

// Dates/Times
//   9th of june, 1989
//   1st of august,1989 11:15 PM
//   2nd of Aug, 89
//   12:00:04 AM 3rd of Feb,89
//   9 june, 1989
//   7:30 9 june, 1999
let g_DateTime2Regex   = /((?:\d+:+\d+:*\d*:*\d*(?:[ \t]*a\.?m\.?|[ \t]*p\.?m\.?)*[ \t]*|\d+[ \t]*(?:a\.?m\.?|p\.?m\.?)+[ \t]*)?\d{1,2}(?:st|nd|rd|th)?[ \t]*(?:of)?[ \t]*(?:January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|Sep|October|Oct|November|Nov|December|Dec)(?:[ \t,]+(?:\d{4}|\d{2}))?(?:[ \tT]+(?:\d+:+\d*:*\d*:*\d*(?:[ \t]*a\.?m\.?|[ \t]*p\.?m\.?)*|\d+[ \t]*(?:a\.?m\.?|p\.?m\.?)+)+)*)(?=\s|$|\.|\,|\!|\?|\()/gi;
let g_DateTime2Pattern = /^(?:\d+:+\d+:*\d*:*\d*(?:[ \t]*a\.?m\.?|[ \t]*p\.?m\.?)*[ \t]*|\d+[ \t]*(?:a\.?m\.?|p\.?m\.?)+[ \t]*)?\d{1,2}(?:st|nd|rd|th)?[ \t]*(?:of)?[ \t]*(?:January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|Sep|October|Oct|November|Nov|December|Dec)(?:[ \t,]+(?:\d{4}|\d{2}))?(?:[ \tT]+(?:\d+:+\d*:*\d*:*\d*(?:[ \t]*a\.?m\.?|[ \t]*p\.?m\.?)*|\d+[ \t]*(?:a\.?m\.?|p\.?m\.?)+)+)*$/i;

// Dates/Times
//   august 1st,1989
//   Aug 2nd, 89
//   june 10th, 2020 10:14 PM
//   10:14 A.M. July 12, 1956
//   Aug 2, 89
//   august 1, 1989
let g_DateTime3Regex   = /((?:\d+:+\d+:*\d*:*\d*[ \t]*(?:a\.?m\.?|p\.?m\.?)*[ \t]*|\d+[ \t]*(?:a\.?m\.?|p\.?m\.?)+[ \t]*)?(?:January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|Sep|October|Oct|November|Nov|December|Dec)[ \t]+\d{1,2}(?:st|nd|rd|th)?(?:[ \t,]+(?:\d{4}|\d{2}))?(?:[ \tT]+(?:\d+:+\d*:*\d*:*\d*(?:[ \t]*a\.?m\.?|[ \t]*p\.?m\.?)*|\d+[ \t]*(?:a\.?m\.?|p\.?m\.?)+)+)*)(?=\s|$|\.|\,|\!|\?|\()/gi;
let g_DateTime3Pattern = /^(?:\d+:+\d+:*\d*:*\d*[ \t]*(?:a\.?m\.?|p\.?m\.?)*[ \t]*|\d+[ \t]*(?:a\.?m\.?|p\.?m\.?)+[ \t]*)?(?:January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|Sep|October|Oct|November|Nov|December|Dec)[ \t]+\d{1,2}(?:st|nd|rd|th)?(?:[ \t,]+(?:\d{4}|\d{2}))?(?:[ \tT]+(?:\d+:+\d*:*\d*:*\d*(?:[ \t]*a\.?m\.?|[ \t]*p\.?m\.?)*|\d+[ \t]*(?:a\.?m\.?|p\.?m\.?)+)+)*$/i;

// TIME ZONES
//   1300 GMT
//   13:00 GMT
//   11 am GMT
//   11AM GMT
//   7:00am GMT
//   7:00a.m. GMT
//   11:00 Atlantic Standard Time
let g_TimeZoneRegex   = /([\d:]+[ \t]*(?:[aA]\.?[mM]\.?|[pP]\.?[mM]\.?)?[ \t]*(?:ACDT|Australian Central Daylight Saving Time|ACST|Australian Central Standard Time|ACT|Acre Time|ASEAN Common Time|ACWST|Australian Central Western Standard Time|ADT|Atlantic Daylight Time|AEDT|Australian Eastern Daylight Saving Time|AEST|Australian Eastern Standard Time|AET|Australian Eastern Time|AFT|Afghanistan Time|AKDT|Alaska Daylight Time|AKST|Alaska Standard Time|ALMT|Alma-Ata Time|AMST|Amazon Summer Time|AMT|Amazon Time|Armenia Time|ANAT|Anadyr Time|AQTT|Aqtobe Time|ART|Argentina Time|AST|Arabia Standard Time|Atlantic Standard Time|AWST|Australian Western Standard Time|AZOST|Azores Summer Time|AZOT|Azores Standard Time|AZT|Azerbaijan Time|BDT|Brunei Time|BIOT|British Indian Ocean Time|BIT|Baker Island Time|BOT|Bolivia Time|BRST|Brasília Summer Time|BRT|Brasília Time|BST|Bangladesh Standard Time|Bougainville Standard Time|British Summer Time|BTT|Bhutan Time|CAT|Central Africa Time|CCT|Cocos Islands Time|CDT|Central Daylight Time|Cuba Daylight Time|CEST|Central European Summer Time|CET|Central European Time|CHADT|Chatham Daylight Time|CHAST|Chatham Standard Time|CHOT|Choibalsan Standard Time|CHOST|Choibalsan Summer Time|CHST|Chamorro Standard Time|CHUT|Chuuk Time|CIST|Clipperton Island Standard Time|CIT|Central Indonesia Time|CKT|Cook Island Time|CLST|Chile Summer Time|CLT|Chile Standard Time|COST|Colombia Summer Time|COT|Colombia Time|CST|Central Standard Time|China Standard Time|Cuba Standard Time|CT|China Time|CVT|Cape Verde Time|CWST|Central Western Standard Time|CXT|Christmas Island Time|DAVT|Davis Time|DDUT|Dumont d'Urville Time|DFT|EASST|Easter Island Summer Time|EAST|Easter Island Standard Time|EAT|East Africa Time|ECT|Eastern Caribbean Time|Ecuador Time|EDT|Eastern Daylight Time|EEST|Eastern European Summer Time|EET|Eastern European Time|EGST|Eastern Greenland Summer Time|EGT|Eastern Greenland Time|EIT|Eastern Indonesian Time|EST|Eastern Standard Time|FET|Further-eastern European Time|FJT|Fiji Time|FKST|Falkland Islands Summer Time|FKT|Falkland Islands Time|FNT|Fernando de Noronha Time|GALT|Galápagos Time|GAMT|Gambier Islands Time|GET|Georgia Standard Time|GFT|French Guiana Time|GILT|Gilbert Island Time|GIT|Gambier Island Time|GMT|Greenwich Mean Time|GST|South Georgia Time|South Sandwich Islands Time|Gulf Standard Time|GYT|Guyana Time|HDT|Hawaii–Aleutian Daylight Time|HAEC|Heure Avancée d'Europe Centrale|HST|Hawaii–Aleutian Standard Time|HKT|Hong Kong Time|HMT|Heard Time|McDonald Islands Time|HOVST|Hovd Summer Time|HOVT|Hovd Time|ICT|Indochina Time|IDLW|International Day Line West time zone|IDT|Israel Daylight Time|IOT|Indian Ocean Time|IRDT|Iran Daylight Time|IRKT|Irkutsk Time|IRST|Iran Standard Time|IST|Indian Standard Time|Irish Standard Time|Israel Standard Time|JST|Japan Standard Time|KALT|Kaliningrad Time|KGT|Kyrgyzstan Time|KOST|Kosrae Time|KRAT|Krasnoyarsk Time|KST|Korea Standard Time|LHST|Lord Howe Standard Time|Lord Howe Summer Time|LINT|Line Islands Time|MAGT|Magadan Time|MART|MIT|Marquesas Islands Time|MAWT|Mawson Station Time|MDT|Mountain Daylight Time|MET|Middle European Time|MEST|Middle European Summer Time|MHT|Marshall Islands Time|MIST|Macquarie Island Station Time|MMT|Myanmar Standard Time|MSK|Moscow Time|MST|Malaysia Standard Time|Mountain Standard Time|MUT|Mauritius Time|MVT|Maldives Time|MYT|Malaysia Time|NCT|New Caledonia Time|NDT|Newfoundland Daylight Time|NFT|Norfolk Island Time|NOVT|Novosibirsk Time|NPT|Nepal Time|NST|Newfoundland Standard Time|NT|Newfoundland Time|NUT|Niue Time|NZDT|New Zealand Daylight Time|NZST|New Zealand Standard Time|OMST|Omsk Time|ORAT|Oral Time|PDT|Pacific Daylight Time|PET|Peru Time|PETT|Kamchatka Time|PGT|Papua New Guinea Time|PHOT|Phoenix Island Time|PHT|Philippine Time|PKT|Pakistan Standard Time|PMDT|Saint Pierre Time|Miquelon Daylight Time|PMST|Miquelon Standard Time|PONT|Pohnpei Standard Time|PST|Pacific Standard Time|Philippine Standard Time|PYST|Paraguay Summer Time|PYT|Paraguay Time|RET|Réunion Time|ROTT|Rothera Research Station Time|SAKT|Sakhalin Island Time|SAMT|Samara Time|SAST|South African Standard Time|SBT|Solomon Islands Time|SCT|Seychelles Time|SDT|Samoa Daylight Time|SGT|Singapore Time|SLST|Sri Lanka Standard Time|SRET|Srednekolymsk Time|SRT|Suriname Time|SST|Samoa Standard Time|Singapore Standard Time|SYOT|Showa Station Time|TAHT|Tahiti Time|THA|Thailand Standard Time|TFT|French Southern Time|Antarctic Time|TJT|Tajikistan Time|TKT|Tokelau Time|TLT|Timor Leste Time|TMT|Turkmenistan Time|TRT|Turkey Time|TOT|Tonga Time|TVT|Tuvalu Time|ULAST|Ulaanbaatar Summer Time|ULAT|Ulaanbaatar Standard Time|UTC|Coordinated Universal Time|UYST|Uruguay Summer Time|UYT|Uruguay Standard Time|UZT|Uzbekistan Time|VET|Venezuelan Standard Time|VLAT|Vladivostok Time|VOLT|Volgograd Time|VOST|Vostok Station Time|VUT|Vanuatu Time|WAKT|Wake Island Time|WAST|West Africa Summer Time|WAT|West Africa Time|WEST|Western European Summer Time|WET|Western European Time|WIT|Western Indonesian Time|WGST|West Greenland Summer Time|WGT|West Greenland Time|WST|Western Standard Time|YAKT|Yakutsk Time|YEKT|Yekaterinburg Time))(?=\s|$|\.|\,|\!|\?|\()/g;
let g_TimeZonePattern = /^[\d:]+[ \t]*(?:[aA]\.?[mM]\.?|[pP]\.?[mM]\.?)?[ \t]*(?:ACDT|Australian Central Daylight Saving Time|ACST|Australian Central Standard Time|ACT|Acre Time|ASEAN Common Time|ACWST|Australian Central Western Standard Time|ADT|Atlantic Daylight Time|AEDT|Australian Eastern Daylight Saving Time|AEST|Australian Eastern Standard Time|AET|Australian Eastern Time|AFT|Afghanistan Time|AKDT|Alaska Daylight Time|AKST|Alaska Standard Time|ALMT|Alma-Ata Time|AMST|Amazon Summer Time|AMT|Amazon Time|Armenia Time|ANAT|Anadyr Time|AQTT|Aqtobe Time|ART|Argentina Time|AST|Arabia Standard Time|Atlantic Standard Time|AWST|Australian Western Standard Time|AZOST|Azores Summer Time|AZOT|Azores Standard Time|AZT|Azerbaijan Time|BDT|Brunei Time|BIOT|British Indian Ocean Time|BIT|Baker Island Time|BOT|Bolivia Time|BRST|Brasília Summer Time|BRT|Brasília Time|BST|Bangladesh Standard Time|Bougainville Standard Time|British Summer Time|BTT|Bhutan Time|CAT|Central Africa Time|CCT|Cocos Islands Time|CDT|Central Daylight Time|Cuba Daylight Time|CEST|Central European Summer Time|CET|Central European Time|CHADT|Chatham Daylight Time|CHAST|Chatham Standard Time|CHOT|Choibalsan Standard Time|CHOST|Choibalsan Summer Time|CHST|Chamorro Standard Time|CHUT|Chuuk Time|CIST|Clipperton Island Standard Time|CIT|Central Indonesia Time|CKT|Cook Island Time|CLST|Chile Summer Time|CLT|Chile Standard Time|COST|Colombia Summer Time|COT|Colombia Time|CST|Central Standard Time|China Standard Time|Cuba Standard Time|CT|China Time|CVT|Cape Verde Time|CWST|Central Western Standard Time|CXT|Christmas Island Time|DAVT|Davis Time|DDUT|Dumont d'Urville Time|DFT|EASST|Easter Island Summer Time|EAST|Easter Island Standard Time|EAT|East Africa Time|ECT|Eastern Caribbean Time|Ecuador Time|EDT|Eastern Daylight Time|EEST|Eastern European Summer Time|EET|Eastern European Time|EGST|Eastern Greenland Summer Time|EGT|Eastern Greenland Time|EIT|Eastern Indonesian Time|EST|Eastern Standard Time|FET|Further-eastern European Time|FJT|Fiji Time|FKST|Falkland Islands Summer Time|FKT|Falkland Islands Time|FNT|Fernando de Noronha Time|GALT|Galápagos Time|GAMT|Gambier Islands Time|GET|Georgia Standard Time|GFT|French Guiana Time|GILT|Gilbert Island Time|GIT|Gambier Island Time|GMT|Greenwich Mean Time|GST|South Georgia Time|South Sandwich Islands Time|Gulf Standard Time|GYT|Guyana Time|HDT|Hawaii–Aleutian Daylight Time|HAEC|Heure Avancée d'Europe Centrale|HST|Hawaii–Aleutian Standard Time|HKT|Hong Kong Time|HMT|Heard Time|McDonald Islands Time|HOVST|Hovd Summer Time|HOVT|Hovd Time|ICT|Indochina Time|IDLW|International Day Line West time zone|IDT|Israel Daylight Time|IOT|Indian Ocean Time|IRDT|Iran Daylight Time|IRKT|Irkutsk Time|IRST|Iran Standard Time|IST|Indian Standard Time|Irish Standard Time|Israel Standard Time|JST|Japan Standard Time|KALT|Kaliningrad Time|KGT|Kyrgyzstan Time|KOST|Kosrae Time|KRAT|Krasnoyarsk Time|KST|Korea Standard Time|LHST|Lord Howe Standard Time|Lord Howe Summer Time|LINT|Line Islands Time|MAGT|Magadan Time|MART|MIT|Marquesas Islands Time|MAWT|Mawson Station Time|MDT|Mountain Daylight Time|MET|Middle European Time|MEST|Middle European Summer Time|MHT|Marshall Islands Time|MIST|Macquarie Island Station Time|MMT|Myanmar Standard Time|MSK|Moscow Time|MST|Malaysia Standard Time|Mountain Standard Time|MUT|Mauritius Time|MVT|Maldives Time|MYT|Malaysia Time|NCT|New Caledonia Time|NDT|Newfoundland Daylight Time|NFT|Norfolk Island Time|NOVT|Novosibirsk Time|NPT|Nepal Time|NST|Newfoundland Standard Time|NT|Newfoundland Time|NUT|Niue Time|NZDT|New Zealand Daylight Time|NZST|New Zealand Standard Time|OMST|Omsk Time|ORAT|Oral Time|PDT|Pacific Daylight Time|PET|Peru Time|PETT|Kamchatka Time|PGT|Papua New Guinea Time|PHOT|Phoenix Island Time|PHT|Philippine Time|PKT|Pakistan Standard Time|PMDT|Saint Pierre Time|Miquelon Daylight Time|PMST|Miquelon Standard Time|PONT|Pohnpei Standard Time|PST|Pacific Standard Time|Philippine Standard Time|PYST|Paraguay Summer Time|PYT|Paraguay Time|RET|Réunion Time|ROTT|Rothera Research Station Time|SAKT|Sakhalin Island Time|SAMT|Samara Time|SAST|South African Standard Time|SBT|Solomon Islands Time|SCT|Seychelles Time|SDT|Samoa Daylight Time|SGT|Singapore Time|SLST|Sri Lanka Standard Time|SRET|Srednekolymsk Time|SRT|Suriname Time|SST|Samoa Standard Time|Singapore Standard Time|SYOT|Showa Station Time|TAHT|Tahiti Time|THA|Thailand Standard Time|TFT|French Southern Time|Antarctic Time|TJT|Tajikistan Time|TKT|Tokelau Time|TLT|Timor Leste Time|TMT|Turkmenistan Time|TRT|Turkey Time|TOT|Tonga Time|TVT|Tuvalu Time|ULAST|Ulaanbaatar Summer Time|ULAT|Ulaanbaatar Standard Time|UTC|Coordinated Universal Time|UYST|Uruguay Summer Time|UYT|Uruguay Standard Time|UZT|Uzbekistan Time|VET|Venezuelan Standard Time|VLAT|Vladivostok Time|VOLT|Volgograd Time|VOST|Vostok Station Time|VUT|Vanuatu Time|WAKT|Wake Island Time|WAST|West Africa Summer Time|WAT|West Africa Time|WEST|Western European Summer Time|WET|Western European Time|WIT|Western Indonesian Time|WGST|West Greenland Summer Time|WGT|West Greenland Time|WST|Western Standard Time|YAKT|Yakutsk Time|YEKT|Yekaterinburg Time)$/;

// TIME
//   12:00:19 AM
//   11:45
//   6 pm
let g_TimeRegex   = /(\d+:+\d+:*\d*:*\d*(?:[ \t]*a\.?m\.?|[ \t]*p\.?m\.?)*|\d+[ \t]*(?:a\.?m\.?|p\.?m\.?)+)(?=\s|$|\.|\,|\!|\?|\()/gi;
let g_TimePattern = /^\d+:+\d+:*\d*:*\d*(?:[ \t]*a\.?m\.?|[ \t]*p\.?m\.?)*|\d+[ \t]*(?:a\.?m\.?|p\.?m\.?)+$/i;

var g_HostRewrites         = [];
var g_sHtmlDir             = "";
var g_sHtmlLang            = "";
var g_NoHostRewritesTICs   = [];
var g_IframeNoTransTICS    = [];
var g_NoTokenizeTICS       = [];
var g_bTokenizeNumbers     = true;
var g_TokenizePatterns     = [];
var g_XDomTokenizePatterns = [];
var g_PosLookBehindCheck = /\(\?\<[=!]/;
var g_TokenizeCookies      = [];
var g_bTranslateInProgress = false;
var g_bAutoTransInProgress = false;
var g_bPretransInProgress  = false;
var g_TranslateObjQueue    = [];
var g_LocationArray        = [];
var g_DomObjsArray         = [];
var g_AutoDetLocationArray = [];
var g_AutoDetDomObjsArray  = [];
var g_PseudoObjMapping     = {};
var g_PseudoTransMapping   = {};
var g_PseudoObjCount       = 0;
var g_AssetRewrites        = [];
var g_bHideDynamicContent  = false;
var g_sDeploymentMethod    = ""; // domain, folder, query or cookie
var g_sDeploymentName      = ""; // lang
var g_DeploymentValues     = {}; // {"en":"English","es":"Español","fr":"Français"}
var g_sTxMethod            = "";
var g_sPretranslateMode    = "all";
var g_sCustomCss           = "";
var g_sCustomJs            = "";
var g_TxRequest            = {
		"text"    : [],
		"assets"  : []
	};
var g_TxNoStacks           = [];
var g_TxAutoDetect         = [];
var g_MigrateTxRequest     = {
		"text"    : []
	};
var g_MigrateTxNoStacks    = [];
var g_nMoxiePageStart      = 0;
var g_nAdaptiveDelayStart  = 0;
var g_bStatsActive         = false;
var g_bSendStats           = true;
var g_TranslatedText       = [];
var g_PreTransBlocksUsed   = [];
var g_StatsLocationsSent   = [];
var g_GlobalStats          = {
		"user_agent"                : navigator.userAgent,
		"language"                  : navigator.language,
		"languages"                 : navigator.languages,
		"walk_delay_mseconds"       : 0,
		"adaptive_walk_delay_usecs" : 0,
		"initial_page_usecs"        : 0,
		"num_mutation_events"       : 0,
		"pretrans_blocks_used"      : 0,
		"pretrans_blocks_total"     : 0,
		"page_blocks_total"         : 0,
		"ga_attempted"              : false,
		"ga_blocked"                : false 
	};

// determine if lookbehind regex is supported on this browser
let g_bSupportLookbehind = !IsIEOrSafari();

// Use a map to hold onto caches of queried elements & clear on mutations.
let g_oQueryCache = new Map();

let g_bThrottleDynamicContent = false;
let g_nThrottleDelayMsecs = 50;

//-----------------------------------------------------------------------------
function MoxieDebounce(func, wait, immediate) 
//-----------------------------------------------------------------------------
{
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() 
		{
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
} // MoxieDebounce

//-----------------------------------------------------------------------------
function DebugLog (iLevel, sText, obj1, obj2)
//-----------------------------------------------------------------------------
{
	try
	{
		if (iLevel <= g_iDebugLevel)
		{
			console.info(sText, obj1, obj2);
		}
	} catch (e) {}
} // DebugLog

//-----------------------------------------------------------------------------
function IsIEOrSafari() {
//-----------------------------------------------------------------------------
	var ua = window.navigator.userAgent;
	return (
		ua.indexOf("MSIE") !== -1 ||
		ua.indexOf("Trident/") !== -1 ||
		(ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1)
	);
} // IsIEOrSafari

//-----------------------------------------------------------------------------
function FNV1aHash (sText)
//-----------------------------------------------------------------------------
{
	try {
		fnvplus.useUTF8(true);
		let oHashedText = fnvplus.hash(sText, 64);
		return oHashedText.dec();
	} catch (e) {
		return "";
	}
} // FNV1aHash

//-----------------------------------------------------------------------------
function AddHideClass(obj)
//-----------------------------------------------------------------------------
{
	if (!g_bHideDynamicContent)
	{
		return;
	}

	DisablePseudoMutationObserver();

	try {
		if (obj.classList)
		{
			// most browsers
			obj.classList.add("onelinkjshide");
		}
		else
		{
			// older IE
			if (obj.className.indexOf("onelinkjshide") == -1)
			{
				if (obj.className != "")
				{
					obj.className += " ";
				}
				obj.className += "onelinkjshide";
			}
		}
	} catch (e) {}
} // AddHideClass

//-----------------------------------------------------------------------------
function DisablePseudoMutationObserver(oDocument) 
//-----------------------------------------------------------------------------
{
	if (g_iDisableTimeoutID == null) {
		g_bDisableMoxiePseudoObserver = true;
		g_iDisableTimeoutID = setTimeout(function()
		{
			g_bDisableMoxiePseudoObserver = false;
			g_iDisableTimeoutID = null;
		})
	}
} // DisablePseudoMutationObserver

//-----------------------------------------------------------------------------
function RemoveHideClasses(oDocument)
//-----------------------------------------------------------------------------
{
	if (!g_bHideDynamicContent)
	{
		return;
	}

	if (!oDocument)
	{
		oDocument = document;
	}

	DisablePseudoMutationObserver();

	let HideObjs = oDocument.querySelectorAll('*');
	for (let ii=0; ii <HideObjs.length; ++ii)
	{
		let obj = HideObjs[ii];
		try
		{
			if (obj.classList)
			{
				// most browsers
				obj.classList.remove("onelinkjshide");
			}
			else
			{
				// older IE
				if (obj.className.indexOf("onelinkjshide") !== -1)
				{
					let sClassList = obj.className.replace(/[ ]*onelinkjshide/, "");
					obj.className = sClassList;
				}
			}

			if (obj.shadowRoot)
			{
				RemoveHideClasses(obj.shadowRoot);
			}
			if (obj.tagName == "IFRAME")
			{
				try
				{
					const oIFrameDoc = MoxieGetIFrameDoc(obj);
					if (oIFrameDoc && oIFrameDoc.documentElement)
					{
						RemoveHideClasses(oIFrameDoc.documentElement);
					}
				} catch (e) {}
			}
		} catch (e) {}
	}

} // RemoveHideClasses

//-----------------------------------------------------------------------------
function ClassListContains (obj, sClassName)
//-----------------------------------------------------------------------------
{
	try {
		if (obj.classList)
		{
			// most browsers
			if (obj.classList.contains(sClassName))
			{
				return true;
			}
		}
		else
		{
			// older IE
			let ClassList = obj.className.split(" ");
			let iClassIdx = ClassList.indexOf(sClassName);
			return (iClassIdx >= 0);
		}
	} catch (e) {}

	return false;

} // ClassListContains

//-----------------------------------------------------------------------------
function MoxieNormalizeNodeValue(obj)
//-----------------------------------------------------------------------------
{
	let sNodeValue = obj.nodeValue;
	if (obj.moxiesrctext)
	{
		sNodeValue = obj.moxiesrctext;
	}

	let bIsWhiteSpacePre    = false;
	let bCollapseWhitespace = false;

	let oParent = obj.assignedSlot || obj.parentNode || obj.host;
	if (oParent && (oParent.nodeType === 1))
	{
		let oStyle = (window.getComputedStyle) ? window.getComputedStyle(oParent) : oParent.currentStyle;
		const sWhitespace = oStyle.whiteSpace;
		if (oStyle && ((sWhitespace == 'pre') || (sWhitespace == 'pre-wrap') || (sWhitespace == 'break-spaces')))
		{
			bIsWhiteSpacePre = true;
		}
		else if (oStyle && (sWhitespace == 'pre-line'))
		{
			bIsWhiteSpacePre = true;
			bCollapseWhitespace = true;
		}
	}

	if (bIsWhiteSpacePre)
	{
		// This text is preformatted.
		if (bCollapseWhitespace)
		{
			sNodeValue = sNodeValue.replace(/[\t ]+/g, " ");
		}
	}
	else
	{
		// Normalize white space
		sNodeValue = sNodeValue.replace(/[\r\n\t\f\v ]+/g, " ");
	}

	return {
		nodeValue: sNodeValue,
		bIsWhiteSpacePre: bIsWhiteSpacePre,
	}

} // MoxieNormalizeNodeValue

//-----------------------------------------------------------------------------
function MoxieTokenizeNumbers (sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect)
//-----------------------------------------------------------------------------
{
	let sPartialString = "";
	let bHasText = false;
	if (!g_bTokenizeNumbers || MatchNoTokenizeTIC(sTagStack, sIdStack, sClassStack, obj, "numbers" )) 
	{
		// skip numbers tokenization
		sPartialString = sText;
	} else 
	{
		let StringParts = sText.split(g_NumStringRegEx);

		for (let ii=0; ii < StringParts.length; ++ii)
		{
			let sVal = StringParts[ii];
			if (sVal !== "")
			{
				if (g_NumRegEx.test(sVal))
				{
					// Special case "1"
					if (sVal == "1")
					{
						sPartialString += sVal;
					}
					else
					{
						if (sPartialString != "")
						{
							// Before creating the ph token below,
							// create text or ph for the string parts that were not tokenized
							let iTransIndex = g_TranslatedText.indexOf(sPartialString);
							if (!bAutoDetect && (iTransIndex !== -1))
							{
								// This is translated text. Don't send this.

								TagCount.value += 1;

								let sourceItem = {};
								sourceItem.kind = "ph";
								sourceItem.id = TagCount.value.toString();

								let tagString = "ph:" + TagCount.value;
								DomObjs[tagString] = sPartialString;
								TextForHash.value += "{{tx}}";

								JliffArray.push(sourceItem);

								if (g_bInMigrateMode)
								{
									MigrateTagCount.value += 1;

									let migrateSourceItem = {};
									migrateSourceItem.kind = "ph";
									migrateSourceItem.id = MigrateTagCount.value.toString();

									MigrateJliffArray.push(migrateSourceItem);
								}

							} else
							{
								let sourceTextItem = {};

								sourceTextItem.text = sPartialString;
								TextForHash.value  += sPartialString;

								JliffArray.push(sourceTextItem);

								if (g_bInMigrateMode)
								{
									MigrateJliffArray.push(sourceTextItem);
								}

								let sEmptyCheck = sPartialString.trim();
								if (sEmptyCheck != "")
								{
									bHasText = true;
								}
							}

							sPartialString = "";
						}

						TagCount.value += 1;

						let sourceItem     = {};
						sourceItem.kind    = "ph";
						sourceItem.id      = TagCount.value.toString();
						sourceItem.type    = "other";
						sourceItem.subType = "mx:int";

						let tagString = "ph:" + TagCount.value;

						// localize sVal
						let sTxVal = sVal;
						try
						{
							sTxVal = OneLinkTxNumber(sVal);
						} catch (e) {
							console.error ("OneLinkTxNumber localization failed for", sVal, e);
							sTxVal = sVal;
						}

						if (sTxVal !== sVal)
						{
							// A token like this will NOT set the flag saying we have text to translate
							// But because the text for the token was changed (localized), it needs to go through /Translate, so upon response, we can replace text->trans_text
							bHasText = true;
						}

						if (g_bInMigrateMode)
						{
							MigrateTagCount.value += 1;

							let migrateSourceItem     = {};
							migrateSourceItem.kind    = "ph";
							migrateSourceItem.id      = MigrateTagCount.value.toString();
							migrateSourceItem.type    = "other";
							migrateSourceItem.subType = "mx:int";

							migrateSourceItem.disp  = 'number';
							migrateSourceItem.equiv = sTxVal;

							MigrateJliffArray.push(migrateSourceItem);
						}

						if (g_sSkeletonVersion == "2")
						{
							sourceItem.disp  = 'number';
							sourceItem.equiv = sTxVal;
						}
						else // g_sSkeletonVersion == "1" (default old style)
						{
							sourceItem.equiv = (TagCount.value+100).toString();
						}
						DomObjs[tagString] = sTxVal;  // Not a DOM object. This is the number value to be put back later.
						TextForHash.value += "{{n}}";

						JliffArray.push(sourceItem);
					}
				}
				else
				{
					sPartialString += sVal;
				}
			}
		}
	}

	// get the last text if any
	if (sPartialString != "")
	{
		let iTransIndex = g_TranslatedText.indexOf(sPartialString);
		if (!bAutoDetect && (iTransIndex !== -1))
		{
			// This is translated text. Don't send this.

			TagCount.value += 1;

			let sourceItem = {};
			sourceItem.kind = "ph";
			sourceItem.id = TagCount.value.toString();

			let tagString = "ph:" + TagCount.value;
			DomObjs[tagString] = sPartialString;
			TextForHash.value += "{{tx}}";

			JliffArray.push(sourceItem);

			if (g_bInMigrateMode)
			{
				MigrateTagCount.value += 1;

				let migrageSourceItem = {};
				migrageSourceItem.kind = "ph";
				migrageSourceItem.id = MigrateTagCount.value.toString();

				MigrateJliffArray.push(migrageSourceItem);
			}
		} else
		{
			let sourceTextItem  = {};

			sourceTextItem.text = sPartialString;
			TextForHash.value  += sPartialString;
			JliffArray.push(sourceTextItem);

			if (g_bInMigrateMode)
			{
				MigrateJliffArray.push(sourceTextItem);
			}

			let sEmptyCheck = sPartialString.trim();
			if (sEmptyCheck != "")
			{
				bHasText = true;
			}
		}
	}

	return bHasText;

} // MoxieTokenizeNumbers

//-----------------------------------------------------------------------------
function MoxieTokenizeTime (sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect)
//-----------------------------------------------------------------------------
{

	if (MatchNoTokenizeTIC(sTagStack, sIdStack, sClassStack, obj, "time" )) 
	{
		//skip to numbers tokenization
		return MoxieTokenizeNumbers(sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect);
	}

	let bHasText = false;

	let StringParts = sText.split(g_TimeRegex);
	for (let ii=0; ii < StringParts.length; ++ii)
	{
		let sVal = StringParts[ii];
		if (sVal && sVal !== "")
		{
			if (g_TimePattern.test(sVal))
			{
				TagCount.value += 1;

				let sourceItem  = {};
				sourceItem.kind = "ph";
				sourceItem.id = TagCount.value.toString();

				// special keys to indicate a token placeholder
				sourceItem.type    = "other";
				sourceItem.subType = "mx:token";

				// localize time value

				let sTxVal = sVal;
				try
				{
					sTxVal = OneLinkTxDateTime(sVal);
				} catch (e) {
					console.error ("OneLinkTxDateTime localization failed for", sVal, e);
					sTxVal = sVal;
				}

				if (sTxVal !== sVal)
				{
					// A token like this will NOT set the flag saying we have text to translate
					// But because the text for the token was changed (localized), it needs to go through /Translate, so upon response, we can replace text->trans_text
					bHasText = true;
				}

				let tagString = "ph:" + TagCount.value;

				if (g_bInMigrateMode)
				{
					MigrateTagCount.value += 1;

					let migrateSourceItem  = {};
					migrateSourceItem.kind = "ph";
					migrateSourceItem.id = MigrateTagCount.value.toString();

					migrateSourceItem.type    = "other";
					migrateSourceItem.subType = "mx:token";

					migrateSourceItem.disp  = 'time';
					migrateSourceItem.equiv = sTxVal;

					MigrateJliffArray.push(migrateSourceItem);
				}

				if (g_sSkeletonVersion == "2")
				{
					// we do not want any empty 'disp' properties: sourceItem.disp  = "";
					sourceItem.disp  = 'time';
					sourceItem.equiv = sTxVal;
				}
				DomObjs[tagString] = sTxVal;
				TextForHash.value += "{{dt}}";

				JliffArray.push(sourceItem);
			} else
			{
				if (g_bTokenizeNumbers)
				{
					if (MoxieTokenizeNumbers(sVal, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect))
					{
						bHasText = true;
					}
				}
				else
				{
					let iTransIndex = g_TranslatedText.indexOf(sVal);
					if (!bAutoDetect && (iTransIndex !== -1))
					{
						// This is translated text. Don't send this.

						TagCount.value += 1;

						let sourceItem = {};
						sourceItem.kind = "ph";
						sourceItem.id = TagCount.value.toString();

						let tagString = "ph:" + TagCount.value;
						DomObjs[tagString] = sVal;
						TextForHash.value += "{{tx}}";

						JliffArray.push(sourceItem);

						if (g_bInMigrateMode)
						{
							MigrateTagCount.value += 1;

							let migrateSourceItem = {};
							migrateSourceItem.kind = "ph";
							migrateSourceItem.id = MigrateTagCount.value.toString();

							MigrateJliffArray.push(migrateSourceItem);
						}
					} else
					{
						let sourceTextItem  = {};
						sourceTextItem.text = sVal;
						TextForHash.value  += sVal;
						JliffArray.push(sourceTextItem);

						if (g_bInMigrateMode)
						{
							MigrateJliffArray.push(sourceTextItem);
						}

						bHasText = true;
					}
				}
			}
		}
	}

	return bHasText;

} // MoxieTokenizeTime

//-----------------------------------------------------------------------------
function MoxieTokenizeTimeZone (sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect)
//-----------------------------------------------------------------------------
{

	if (MatchNoTokenizeTIC(sTagStack, sIdStack, sClassStack, obj, "timezones" )) 
	{
		//skip to time tokenization
		return MoxieTokenizeTime(sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect);
	}

	let bHasText = false;

	let StringParts = sText.split(g_TimeZoneRegex);
	for (let ii=0; ii < StringParts.length; ++ii)
	{
		let sVal = StringParts[ii];
		if (sVal && sVal !== "")
		{
			if (g_TimeZonePattern.test(sVal))
			{
				TagCount.value += 1;

				let sourceItem  = {};
				sourceItem.kind = "ph";
				sourceItem.id = TagCount.value.toString();

				// special keys to indicate a token placeholder
				sourceItem.type    = "other";
				sourceItem.subType = "mx:token";

				// localize timezone value
				let sTxVal = sVal;
				try
				{
					sTxVal = OneLinkTxTimeZone(sVal);
				} catch (e) {
					console.error ("OneLinkTxTimeZone localization failed for", sVal, e);
					sTxVal = sVal;
				}

				if (sTxVal !== sVal)
				{
					// A token like this will NOT set the flag saying we have text to translate
					// But because the text for the token was changed (localized), it needs to go through /Translate, so upon response, we can replace text->trans_text
					bHasText = true;
				}

				let tagString = "ph:" + TagCount.value;
				DomObjs[tagString] = sTxVal;

				if (g_bInMigrateMode)
				{
					MigrateTagCount.value += 1;

					let migrateSourceItem  = {};
					migrateSourceItem.kind = "ph";
					migrateSourceItem.id = MigrateTagCount.value.toString();

					migrateSourceItem.type    = "other";
					migrateSourceItem.subType = "mx:token";

					migrateSourceItem.disp  = 'timezone';
					migrateSourceItem.equiv = sTxVal;

					MigrateJliffArray.push(migrateSourceItem);
				}

				if (g_sSkeletonVersion == "2")
				{
					// we do not want any empty 'disp' properties: sourceItem.disp  = "";
					sourceItem.disp  = 'timezone';
					sourceItem.equiv = sTxVal;
				}
				TextForHash.value += "{{dt}}";

				JliffArray.push(sourceItem);
			} else
			{
				if (MoxieTokenizeTime (sVal, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect))
				{
					bHasText = true;
				}
			}
		}
	}

	return bHasText;

} // MoxieTokenizeTimeZone

//-----------------------------------------------------------------------------
function MoxieTokenizeDateTime3 (sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect)
//-----------------------------------------------------------------------------
{
	let bHasText = false;

	let StringParts = sText.split(g_DateTime3Regex);
	for (let ii=0; ii < StringParts.length; ++ii)
	{
		let sVal = StringParts[ii];
		if (sVal && sVal !== "")
		{
			if (g_DateTime3Pattern.test(sVal))
			{
				TagCount.value += 1;

				let sourceItem  = {};
				sourceItem.kind = "ph";
				sourceItem.id = TagCount.value.toString();

				// special keys to indicate a token placeholder
				sourceItem.type    = "other";
				sourceItem.subType = "mx:token";

				// localize date/time value
				let sTxVal = sVal;
				try
				{
					sTxVal = OneLinkTxDateTime(sVal);
				} catch (e) {
					console.error ("OneLinkTxDateTime localization failed for", sVal, e);
					sTxVal = sVal;
				}

				if (sTxVal !== sVal)
				{
					// A token like this will NOT set the flag saying we have text to translate
					// But because the text for the token was changed (localized), it needs to go through /Translate, so upon response, we can replace text->trans_text
					bHasText = true;
				}

				let tagString = "ph:" + TagCount.value;
				DomObjs[tagString] = sTxVal;

				if (g_bInMigrateMode)
				{
					MigrateTagCount.value += 1;

					let migrateSourceItem  = {};
					migrateSourceItem.kind = "ph";
					migrateSourceItem.id = MigrateTagCount.value.toString();

					migrateSourceItem.type    = "other";
					migrateSourceItem.subType = "mx:token";

					migrateSourceItem.disp  = 'date-time';
					migrateSourceItem.equiv = sTxVal;

					MigrateJliffArray.push(migrateSourceItem);
				}

				if (g_sSkeletonVersion == "2")
				{
					// we do not want any empty 'disp' properties: sourceItem.disp  = "";
					sourceItem.disp  = 'date-time';
					sourceItem.equiv = sTxVal;
				}
				TextForHash.value += "{{dt}}";

				JliffArray.push(sourceItem);
			} else
			{
				if (MoxieTokenizeTimeZone (sVal, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount,sTagStack, sIdStack, sClassStack, obj, bAutoDetect))
					{
					bHasText = true;
				}
			}
		}
	}

	return bHasText;

} // MoxieTokenizeDateTime3

//-----------------------------------------------------------------------------
function MoxieTokenizeDateTime2 (sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect)
//-----------------------------------------------------------------------------
{
	let bHasText = false;

	let StringParts = sText.split(g_DateTime2Regex);
	for (let ii=0; ii < StringParts.length; ++ii)
	{
		let sVal = StringParts[ii];
		if (sVal && sVal !== "")
		{
			if (g_DateTime2Pattern.test(sVal))
			{
				TagCount.value += 1;

				let sourceItem  = {};
				sourceItem.kind = "ph";
				sourceItem.id = TagCount.value.toString();

				// special keys to indicate a token placeholder
				sourceItem.type    = "other";
				sourceItem.subType = "mx:token";

				// localize date/time value
				let sTxVal = sVal;
				try
				{
					sTxVal = OneLinkTxDateTime(sVal);
				} catch (e) {
					console.error ("OneLinkTxDateTime localization failed for", sVal, e);
					sTxVal = sVal;
				}

				if (sTxVal !== sVal)
				{
					// A token like this will NOT set the flag saying we have text to translate
					// But because the text for the token was changed (localized), it needs to go through /Translate, so upon response, we can replace text->trans_text
					bHasText = true;
				}

				let tagString = "ph:" + TagCount.value;
				DomObjs[tagString] = sTxVal;

				if (g_bInMigrateMode)
				{
					MigrateTagCount.value += 1;

					let migrateSourceItem  = {};
					migrateSourceItem.kind = "ph";
					migrateSourceItem.id = MigrateTagCount.value.toString();

					migrateSourceItem.type    = "other";
					migrateSourceItem.subType = "mx:token";

					migrateSourceItem.disp  = 'date-time';
					migrateSourceItem.equiv = sTxVal;

					MigrateJliffArray.push(migrateSourceItem);
				}

				if (g_sSkeletonVersion == "2")
				{
					// we do not want any empty 'disp' properties: sourceItem.disp  = "";
					sourceItem.disp  = 'date-time';
					sourceItem.equiv = sTxVal;
				}
				TextForHash.value += "{{dt}}";

				JliffArray.push(sourceItem);
			} else
			{
				if (MoxieTokenizeDateTime3 (sVal, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect))
				{
					bHasText = true;
				}
			}
		}
	}

	return bHasText;

} // MoxieTokenizeDateTime2

//-----------------------------------------------------------------------------
function MoxieTokenizeDateTime (sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect)
//-----------------------------------------------------------------------------
{
	if (MatchNoTokenizeTIC(sTagStack, sIdStack, sClassStack, obj, "dates" )) 
	{
		//skip to timezone tokenization
		return MoxieTokenizeTimeZone(sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect);
	}

	let bHasText = false;

	let StringParts = sText.split(g_DateTime1Regex);
	for (let ii=0; ii < StringParts.length; ++ii)
	{
		let sVal = StringParts[ii];
		if (sVal && sVal !== "")
		{
			if (g_DateTime1Pattern.test(sVal))
			{
				TagCount.value += 1;

				let sourceItem  = {};
				sourceItem.kind = "ph";
				sourceItem.id = TagCount.value.toString();

				// special keys to indicate a token placeholder
				sourceItem.type    = "other";
				sourceItem.subType = "mx:token";

				// localize date/time value
				let sTxVal = sVal;
				try
				{
					sTxVal = OneLinkTxDateTime(sVal);
				} catch (e) {
					console.error ("OneLinkTxDateTime localization failed for", sVal, e);
					sTxVal = sVal;
				}

				if (sTxVal !== sVal)
				{
					// A token like this will NOT set the flag saying we have text to translate
					// But because the text for the token was changed (localized), it needs to go through /Translate, so upon response, we can replace text->trans_text
					bHasText = true;
				}

				let tagString = "ph:" + TagCount.value;
				DomObjs[tagString] = sTxVal;

				if (g_bInMigrateMode)
				{
					MigrateTagCount.value += 1;

					let migrateSourceItem  = {};
					migrateSourceItem.kind = "ph";
					migrateSourceItem.id = MigrateTagCount.value.toString();

					migrateSourceItem.type    = "other";
					migrateSourceItem.subType = "mx:token";

					migrateSourceItem.disp  = 'date-time';
					migrateSourceItem.equiv = sTxVal;

					MigrateJliffArray.push(migrateSourceItem);
				}

				if (g_sSkeletonVersion == "2")
				{
					// we do not want any empty 'disp' properties: sourceItem.disp  = "";
					sourceItem.disp  = 'date-time';
					sourceItem.equiv = sTxVal;
				}
				TextForHash.value += "{{dt}}";

				JliffArray.push(sourceItem);
			} else
			{
				if (MoxieTokenizeDateTime2 (sVal, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect))
				{
					bHasText = true;
				}
			}
		}
	}

	return bHasText;

} // MoxieTokenizeDateTime

//-----------------------------------------------------------------------------
function MoxieRegExpMatches(patterns, str, flags) 
//-----------------------------------------------------------------------------
{
	flags = flags || "g";
	let matches = [];

	for (let i = 0; i< patterns.length; i++) 
	{
		let sPattern = patterns[i];
		try
		{
			let bIsLookBack = g_PosLookBehindCheck.test(sPattern);
			if (bIsLookBack && !g_bSupportLookbehind) 
			{
				// since this browser doesn't support lookbehind, 
				// simulate using XRegExp
				let pos = 0, match, leftContext;
				let oLbPattern = XRegExp.prepareLbPattern(sPattern, flags);
				while (match = XRegExp.exec(str, oLbPattern.main, pos)) 
				{
					leftContext = str.slice(0, match.index);
					if (oLbPattern.lbType === oLbPattern.lb.test(leftContext)) 
					{
						matches.push(match);
						pos = match.index + (match[0].length || 1);
					} else 
					{
						pos = match.index + 1;
					}
				}
			}
			else
			{
				let tokenRegex = sPattern instanceof RegExp ? sPattern : new RegExp(sPattern, flags);
				let match = null;
				let iCurrentIdx = 0;
				while ((match = tokenRegex.exec(str)) &&
				       (tokenRegex.lastIndex > iCurrentIdx))
				{
					matches.push(match);
					iCurrentIdx = tokenRegex.lastIndex;
				}
			}
		} catch (e)
		{
			console.error ("OneLinkMoxieJS 'tokenize_patterns' RegExp rule not used", sPattern, e);
		}
	}

	matches.sort(function(m1, m2){
		if (m1.index < m2.index) return -1;
		if (m1.index > m2.index) return 1;
		return 0;
	});

	return matches;

} // MoxieRegExpMatches

//-----------------------------------------------------------------------------
function MoxieTokenizePattern (sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect)
//-----------------------------------------------------------------------------
{
	let bHasText = false;

	let AppliedTokenizePatterns = [];

	for (let ii=0; ii < g_TokenizePatterns.length; ++ii)
	{
		let TicObj = g_TokenizePatterns[ii];

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj))
		{
			let sRegExPattern = TicObj.patterns;
			if (sRegExPattern)
			{
				try
				{
					let bIsLookBack = g_PosLookBehindCheck.test(sRegExPattern);
					let SyntaxCheck =
						bIsLookBack && !g_bSupportLookbehind
							? XRegExp.prepareLbPattern(sRegExPattern, "g")
							: sRegExPattern instanceof RegExp
							? sRegExPattern
							: new RegExp(sRegExPattern, "g");
					AppliedTokenizePatterns.push(sRegExPattern);
				} catch (e)
				{
					console.error ("OneLinkMoxieJS 'tokenize_patterns' RegExp rule not used", sRegExPattern, e);
				}
			}
		}
	}

	if (AppliedTokenizePatterns.length)
	{
		try
		{
			let matches  = MoxieRegExpMatches(AppliedTokenizePatterns, sText);
			let RegexResult = null, iCurrentIdx = 0;

			while ((RegexResult = matches[0]) && ((RegexResult.index + RegexResult[0].length) > iCurrentIdx))
			{
				if (RegexResult.index > iCurrentIdx)
				{
					let sVal = sText.substring(iCurrentIdx, RegexResult.index);
					if (MoxieTokenizeDateTime(sVal, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect))
					{
						bHasText = true;
					}
				}
				TagCount.value += 1;

				let sourceItem  = {};
				sourceItem.kind = "ph";
				sourceItem.id = TagCount.value.toString();

				// special keys to indicate a token placeholder
				sourceItem.type    = "other";
				sourceItem.subType = "mx:token";

				if (g_bInMigrateMode)
				{
					MigrateTagCount.value += 1;

					let migrateSourceItem  = {};
					migrateSourceItem.kind = "ph";
					migrateSourceItem.id = MigrateTagCount.value.toString();

					migrateSourceItem.type    = "other";
					migrateSourceItem.subType = "mx:token";

					migrateSourceItem.disp  = 'custom-token';
					migrateSourceItem.equiv = RegexResult[0];

					MigrateJliffArray.push(migrateSourceItem);
				}

				if (g_sSkeletonVersion == "2")
				{
					// we do not want any empty 'disp' properties: sourceItem.disp  = "";
					sourceItem.disp  = 'custom-token';
					sourceItem.equiv = RegexResult[0];
				}

				let tagString = "ph:" + TagCount.value;
				DomObjs[tagString] = RegexResult[0];
				TextForHash.value += "{{t}}";

				JliffArray.push(sourceItem);

				iCurrentIdx  = RegexResult.index + RegexResult[0].length;
				matches.shift();
			}

			if (iCurrentIdx < sText.length)
			{
				let sVal = sText.substring(iCurrentIdx);
				if (MoxieTokenizeDateTime(sVal, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect))
				{
					bHasText = true;
				}
			}
		} catch (re)
		{
			console.error ("OneLinkMoxieJS error in 'tokenize_patterns' rule", re);
		}
	}
	else
	{
		if (MoxieTokenizeDateTime(sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect))
		{
			bHasText = true;
		}
	}

	return bHasText;

} // MoxieTokenizePattern

//-----------------------------------------------------------------------------
function MoxieTokenizeCookies (sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect)
//-----------------------------------------------------------------------------
{
	if (MatchNoTokenizeTIC(sTagStack, sIdStack, sClassStack, obj, "custom" )) 
	{
		//skip to datetime tokenization
		return MoxieTokenizeDateTime(sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect);
	}

	let bHasText = false;

	// Start with tokenizing Cookies
	// For text that was not tokenized, proceed into tokenizing Patterns and then into tokenizing Numbers

	let FromToMappings = {};
	let sPatternRegex  = "";

	for (let ii=0; ii < g_TokenizeCookies.length; ++ii)
	{
		let TicObj = g_TokenizeCookies[ii];

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj))
		{
			let sCookieFrom = TicObj.cookie_from;
			let sCookieTo   = TicObj.cookie_to;
			if (sCookieFrom && sCookieTo)
			{
				let sFromCookieVal = MoxieGetCookie(sCookieFrom);
				let sToCookieVal   = MoxieGetCookie(sCookieTo);

				if ((sFromCookieVal !== "") && (sToCookieVal !== ""))
				{
					FromToMappings[sFromCookieVal] = sToCookieVal;

					// Escape any special regex characters [\^$.|?*+(){}
					sFromCookieVal = sFromCookieVal.replace(/([\[\\\^\$\.\|\?\*\+\(\)\{\}])/g, "\\$1");

					// Delimiters for the string
					sFromCookieVal = "(?: |\\t|:|-|\\.|,|'|\"|^){1}" + sFromCookieVal + "(?: |\\t|:|-|\\.|,|'|\"|$){1}";

					if (sPatternRegex !== "")
					{
						sPatternRegex += "|";
					}
					sPatternRegex += sFromCookieVal;
				}
			}
		}
	}

	if (sPatternRegex !== "")
	{
		let sTokenString      = "(" + sPatternRegex + ")";
		let TokenStringRegex  = new RegExp(sTokenString, "g");
		let TokenPatternRegex = new RegExp(sPatternRegex);

		let CharRegex = new RegExp(/ |\t|:|-|\.|,|'|"/);

		let StringParts = sText.split(TokenStringRegex);
		for (let ii=0; ii < StringParts.length; ++ii)
		{
			let sVal = StringParts[ii];
			if (sVal && (sVal !== ""))
			{
				if (TokenPatternRegex.test(sVal))
				{
					let sBeginChar = sVal[0];
					let sEndChar   = sVal[sVal.length-1];

					let sAddToBegin = "";
					let sAddToEnd   = "";
					if (CharRegex.test(sEndChar))
					{
						sVal = sVal.substring(0, sVal.length-1);
						sAddToEnd = sEndChar;
					}
					if (CharRegex.test(sBeginChar))
					{
						sVal = sVal.substring(1);
						sAddToBegin = sBeginChar;
					}

					// Get the 'to' value this string will get replaced by
					let sMapToVal = FromToMappings[sVal];
					if (!sMapToVal)
					{
						// fail safe. if we didn't find the 'to' mapping, leave it as the original
						sMapToVal = sVal;
					}
					let sMappedVal = sAddToBegin + sMapToVal + sAddToEnd;

					TagCount.value += 1;

					let sourceItem  = {};
					sourceItem.kind = "ph";
					sourceItem.id = TagCount.value.toString();

					// special keys to indicate a token placeholder
					sourceItem.type    = "other";
					sourceItem.subType = "mx:token";

					if (g_bInMigrateMode)
					{
						MigrateTagCount.value += 1;

						let migrateSourceItem  = {};
						migrateSourceItem.kind = "ph";
						migrateSourceItem.id = MigrateTagCount.value.toString();

						migrateSourceItem.type    = "other";
						migrateSourceItem.subType = "mx:token";

						migrateSourceItem.disp  = 'custom-token';
						migrateSourceItem.equiv = sMappedVal;

						MigrateJliffArray.push(migrateSourceItem);
					}

					if (g_sSkeletonVersion == "2")
					{
						// we do not want any empty 'disp' properties: sourceItem.disp  = "";
						sourceItem.disp  = 'custom-token';
						sourceItem.equiv = sMappedVal;
					}

					let tagString = "ph:" + TagCount.value;
					DomObjs[tagString] = sMappedVal;
					TextForHash.value += "{{t}}";

					JliffArray.push(sourceItem);

					// Tokenization does not mean there is text for translation and normally wouldn't set bHasText to true
					// But in the case of cookies it needs to go through /Translate, so upon response, we can replace text->trans_text
					bHasText = true;
				} else
				{
					if (MoxieTokenizePattern (sVal, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect))
					{
						bHasText = true;
					}
				}
			}
		}
	}
	else
	{
		if (MoxieTokenizePattern (sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect))
		{
			bHasText = true;
		}
	}

	return bHasText;

} // MoxieTokenizeCookies

//-----------------------------------------------------------------------------
function TextToJliff (sText, Results, PhMapping, sTagStack, sIdStack, sClassStack)
//-----------------------------------------------------------------------------
{
	// PhMapping is AKA DomObjs

	let TextForHash       = {"value":""};
	let JliffArray        = [];
	let MigrateJliffArray = [];
	let TagCount          = {"value":0};
	let MigrateTagCount   = {"value":0};

	let obj = null; // There is no DOM object, only text

	let bAutoDetect = MatchAutoDetectTIC(sTagStack, sIdStack, sClassStack, obj);

	let bHadText = MoxieTokenizeCookies (sText, PhMapping, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, bAutoDetect);

	let sTextHash = "";
	if (bHadText)
	{
		sTextHash = FNV1aHash(TextForHash.value);
	}

	Results.push ({
		"source" : JliffArray,
		"block_hash" : sTextHash,
		"suppress_mt": false
	});

	// return true/false whether there was any translatable text
	return bHadText;
} // TextToJliff

//-----------------------------------------------------------------------------
function MoxieTokenize (sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect, oTokenContext)
//-----------------------------------------------------------------------------
{
	if (!oTokenContext || !oTokenContext.matches.length)
	{
		return MoxieTokenizeCookies(sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect)
	}

	let match = null;
	let bHasText = false;

	try
	{
		let iOriginalStart = oTokenContext.iCurrentIdx;
		let iLocalCurrent = iOriginalStart;
		let iBlockEndIdx = oTokenContext.iCurrentIdx + sText.length;

		while (match = oTokenContext.matches[0])
		{
			iLocalCurrent = oTokenContext.iCurrentIdx - iOriginalStart;

			if (iLocalCurrent >= sText.length) {
				// processed all of this child node text
				break;
			}

			if (match.start > iBlockEndIdx) 
			{
				// the next block token match is not in this child node
				// tokenize the rest of the child node text and return
				oTokenContext.iCurrentIdx = iBlockEndIdx + 1;
				let sVal = sText.substring(iLocalCurrent);
				return MoxieTokenizeCookies(sVal, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect);
			}

			let iLocalMatchStart = match.start - iOriginalStart;
			let iLocalMatchEnd = Math.min(sText.length, match.end - iOriginalStart);

			if (iLocalMatchStart > iLocalCurrent)
			{
				// there is a non match substring to be processed before match
				let sVal = sText.substring(iLocalCurrent, iLocalMatchStart);
				if (MoxieTokenizeCookies(sVal, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect))
				{
					bHasText = true;
				}
			}

			let tokenText = sText.substring(iLocalMatchStart, iLocalMatchEnd)
			TagCount.value += 1;

			let sourceItem  = {};
			sourceItem.kind = "ph";
			sourceItem.id = TagCount.value.toString();

			// special keys to indicate a token placeholder
			sourceItem.type    = "other";
			sourceItem.subType = "mx:token";

			if (g_bInMigrateMode)
			{
				MigrateTagCount.value += 1;

				let migrateSourceItem  = {};
				migrateSourceItem.kind = "ph";
				migrateSourceItem.id = MigrateTagCount.value.toString();

				migrateSourceItem.type    = "other";
				migrateSourceItem.subType = "mx:token";

				migrateSourceItem.disp  = 'custom-token';
				migrateSourceItem.equiv = tokenText;

				MigrateJliffArray.push(migrateSourceItem);
			}

			if (g_sSkeletonVersion == "2")
			{
				// we do not want any empty 'disp' properties: sourceItem.disp  = "";
				sourceItem.disp  = 'custom-token';
				sourceItem.equiv = tokenText;
			}

			let tagString = "ph:" + TagCount.value;
			DomObjs[tagString] = tokenText;
			TextForHash.value += "{{t}}";

			JliffArray.push(sourceItem);

			oTokenContext.iCurrentIdx += (iLocalMatchEnd - iLocalCurrent);
			iLocalCurrent = oTokenContext.iCurrentIdx - iOriginalStart;

			// remove this match if it has been processed
			if (oTokenContext.iCurrentIdx >= match.end)
			{
				oTokenContext.matches.shift(); 
			}
		}

		// there might be remaining text left to tokenize
		if (iLocalCurrent < sText.length - 1)
		{
			let sVal = sText.substring(iLocalCurrent);
			if (MoxieTokenizeCookies(sVal, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect))
			{
				bHasText = true;
			}
		}		
	} catch (re)
	{
		console.error ("OneLinkMoxieJS error in 'tokenize_patterns' rule", re);
	}

	return bHasText;
} // MoxieTokenize 

//-----------------------------------------------------------------------------
function MoxieBlockToText (obj) 
//-----------------------------------------------------------------------------
{
	if (obj.nodeType == 3/*TEXT*/)
	{
		return obj.nodeValue.replace(/[\r\n\t\f\v ]+/g, " ");
	} else
	{
		let text = "";
		for (let i = 0; i < obj.childNodes.length; i++)
		{
			let childObj = obj.childNodes[i];
			if (!IsNonText(childObj))
			{
				text += MoxieBlockToText(childObj);
			}
		}		
		return text;
	} 
} // MoxieBlockToText

//-----------------------------------------------------------------------------
function MoxieCheckForBlockToken (BlockObject, sTagStack, sIdStack, sClassStack)
//-----------------------------------------------------------------------------
{
	if (MatchNoTokenizeTIC(sTagStack, sIdStack, sClassStack, BlockObject, "custom" )) 
	{
		return null;
	} 

	let oTokenContext = null;
	let AppliedTokenizePatterns = [];

	for (let ii=0; ii < g_XDomTokenizePatterns.length; ++ii)
	{
		let TicObj = g_XDomTokenizePatterns[ii];

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, BlockObject))
		{
			let sRegExPattern = TicObj.patterns;
			if (sRegExPattern)
			{
				try
				{
					let bIsLookBack = g_PosLookBehindCheck.test(sRegExPattern);
					let SyntaxCheck = bIsLookBack && !g_bSupportLookbehind ? XRegExp.prepareLbPattern(sRegExPattern, "g") : new RegExp(sRegExPattern, "g");
					AppliedTokenizePatterns.push(sRegExPattern);
				} catch (e)
				{
					console.error ("OneLinkMoxieJS 'tokenize_patterns' RegExp rule not used", sRegExPattern, e);
				}
			}
		}
	}

	if (AppliedTokenizePatterns.length)
	{
		try
		{
			let sBlockText = MoxieBlockToText(BlockObject);

			if (!sBlockText) 
			{
				return null;
			}
			let matches  = MoxieRegExpMatches(AppliedTokenizePatterns, sBlockText);
			oTokenContext = {
				textLength: sBlockText.length,
				matches: [],
				iCurrentIdx: 0
			}

			for (let i = 0; i < matches.length; i++)
			{
				let match = matches[i];
				oTokenContext.matches.push(
					{
						start: match.index,
						end: match.index + match[0].length,
						text: match[0] 
					}
				);
			}
		} catch (re)
		{
			console.error ("OneLinkMoxieJS error in 'tokenize_patterns' rule", re);
		}
	}

	return oTokenContext;

} // MoxieCheckForBlockToken 

//---------------------------------------
function MoxieGetCookie (sCookieName)
//---------------------------------------
{
	let sCookiePattern = sCookieName + "=";
	let DecodedCookie = decodeURIComponent(document.cookie);
	let Cookies = DecodedCookie.split(';');
	for (let i = 0; i <Cookies.length; i++)
	{
		let sCookie = Cookies[i];
		while (sCookie.charAt(0) == ' ')
		{
			sCookie = sCookie.substring(1);
		}
		if (sCookie.indexOf(sCookiePattern) == 0)
		{
			return sCookie.substring(sCookiePattern.length, sCookie.length);
		}
	}
	return "";
} // MoxieGetCookie

//---------------------------------------
function MoxieGetIFrameDoc(obj)
//---------------------------------------
{
	if (!obj || (obj.tagName !== "IFRAME")) return null;
	if (obj.contentWindow && obj.contentWindow.document) return obj.contentWindow.document;
	if (obj.contentDocument) return obj.contentDocument;
	return null;
} // MoxieGetIFrameDoc

//-----------------------------------------------------------------------------
function MoxieHtmlToJliff (bOneLinkTx, sNoTxReason, obj, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, InnerHtmlAttrs, InnerHtmlPseudos, sTagStack, sIdStack, sClassStack, oTokenContext, bAutoDetect)
//-----------------------------------------------------------------------------
{
	let bHasText = false;
	if (obj.nodeType == 3)
	{
		// Text Node

		let sourceItem = {};

		// clear tag
		delete obj.moxiephtag;

		if (!bOneLinkTx)
		{
			// The "OneLinkNoTx" class is set. Do not translate this text. Create a placeholder for the JLIFF.

			// put the original text back
			if (obj.moxiesrctext && (obj.nodeValue == ""))
			{
				obj.nodeValue = obj.moxiesrctext;
			}

			TagCount.value += 1;

			sourceItem.kind = "ph";
			sourceItem.id = TagCount.value.toString();

			let tagString = "ph:" + TagCount.value;
			DomObjs[tagString] = obj;
			TextForHash.value += "{{ntx}}";

			obj.moxiephtag = "1";

			JliffArray.push(sourceItem);

			if (g_bInMigrateMode)
			{
				MigrateTagCount.value += 1;

				let migrateSourceItem = {};
				migrateSourceItem.kind = "ph";
				migrateSourceItem.id = MigrateTagCount.value.toString();
				MigrateJliffArray.push(migrateSourceItem);
			}

			DebugLog (2, "NO TRANSLATE for:", obj, sNoTxReason);

			if (g_bIsOPE)
			{
				let sEmptyCheck = obj.nodeValue.trim();
				if ((typeof HookNoTx === "function") &&
					(sEmptyCheck != "") &&
					(sIdStack.indexOf("OPE_open") == -1) &&
					(sIdStack.indexOf("ope-plugin") == -1) &&
					(sIdStack.indexOf("openotrans") == -1) &&
					(sClassStack.indexOf("OPE_object_tag") == -1) &&
					(sTagStack.indexOf("OPE-NOTX") == -1) &&
					(sTagStack.indexOf("OPE-HOOK") == -1) &&
					(sTagStack.indexOf("OPE-SPAN") == -1))
				{
					let oParent = obj.assignedSlot || obj.parentNode || obj.host;
					let iChildCount = 0;
					for (let ii = 0; ii < oParent.childNodes.length; ++ii)
					{
						let oChild = oParent.childNodes[ii];
						if (!IsNonText (oChild) && (oChild.nodeType != 8))
						{
							iChildCount++;
						}
					}

					if (iChildCount == 1)
					{
						// this text node is the only relevant child, hook the parent
						HookNoTx (oParent, sTagStack, sIdStack, sClassStack, sNoTxReason);
					}
					else
					{
						HookNoTx (obj, sTagStack, sIdStack, sClassStack, sNoTxReason);
					}
				}
			}

			return bHasText;
		}

		let sNodeValue = obj.nodeValue;
		if (obj.moxiesrctext)
		{
			sNodeValue = obj.moxiesrctext;
			bHasText = true;
		}

		let iTransIndex = g_TranslatedText.indexOf(sNodeValue);
		if ((!bAutoDetect && (iTransIndex !== -1)) || (sNodeValue === obj.moxietx))
		{
			// This is translated text. Don't send this.

			// put the original text back
			if (obj.moxiesrctext && (obj.nodeValue == ""))
			{
				obj.nodeValue = obj.moxiesrctext;
			}

			TagCount.value += 1;

			sourceItem.kind = "ph";
			sourceItem.id = TagCount.value.toString();

			let tagString = "ph:" + TagCount.value;
			DomObjs[tagString] = obj;
			TextForHash.value += "{{tx}}";

			obj.moxiephtag = "1";

			JliffArray.push(sourceItem);

			if (g_bInMigrateMode)
			{
				MigrateTagCount.value += 1;

				let migrateSourceItem = {};
				migrateSourceItem.kind = "ph";
				migrateSourceItem.id = MigrateTagCount.value.toString();

				MigrateJliffArray.push(migrateSourceItem);
			}

			return false; // bHasText
		}

		let oNormalized 		= MoxieNormalizeNodeValue(obj);
		let bIsWhiteSpacePre    = oNormalized.bIsWhiteSpacePre;
		let sNormalizedWS 		= oNormalized.nodeValue;

		if (bIsWhiteSpacePre)
		{
			if (MoxieTokenize(sNodeValue, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect))
			{
				bHasText = true;
			}
		}
		else
		{
			// Normalize white space
			if ((sNormalizedWS == " ") || (sNormalizedWS == ""))
			{
				// Empty white space

				TagCount.value += 1;

				sourceItem.kind = "ph";
				sourceItem.id = TagCount.value.toString();

				let tagString = "ph:" + TagCount.value;
				DomObjs[tagString] = obj;
				TextForHash.value += " ";

				obj.moxiephtag = "1";

				JliffArray.push(sourceItem);

				if (g_bInMigrateMode)
				{
					MigrateTagCount.value += 1;

					let migrateSourceItem = {};
					migrateSourceItem.kind = "ph";
					migrateSourceItem.id = MigrateTagCount.value.toString();
					MigrateJliffArray.push(migrateSourceItem);
				}

				if (oTokenContext)
				{
					oTokenContext.iCurrentIdx += sNormalizedWS.length;
				}

			}
			else
			{
				if (MoxieTokenize(sNormalizedWS, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect, oTokenContext))
				{
					bHasText = true;
				}
			}
		}
	}
	else if (obj.nodeType == 8)
	{
		// Comment Node

		TagCount.value += 1;

		let sourceItem = {};
		sourceItem.kind = "ph";
		sourceItem.id = TagCount.value.toString();
		JliffArray.push(sourceItem);

		if (g_bInMigrateMode)
		{
			MigrateTagCount.value += 1;

			let migrateSourceItem = {};
			migrateSourceItem.kind = "ph";
			migrateSourceItem.id = MigrateTagCount.value.toString();
			MigrateJliffArray.push(migrateSourceItem);
		}

		let tagString = "ph:" + TagCount.value;
		DomObjs[tagString] = obj;
		TextForHash.value += "<x></x>";
	}
	else
	{
		// 1 Element
		// 4 CDATASection
		// 5 EntityReference (Obsolete)
		// 7 ProcessingInstruction

		TagCount.value += 1;
		if (g_bInMigrateMode)
		{
			MigrateTagCount.value += 1;
		}

		if (IsNonText (obj))
		{
			let tagString = "ph:" + TagCount.value;

			let sourceItem = {};
			sourceItem.kind = "ph";
			sourceItem.id = TagCount.value.toString();
			JliffArray.push(sourceItem);

			if (g_bInMigrateMode)
			{
				let migrateSourceItem = {};
				migrateSourceItem.kind = "ph";
				migrateSourceItem.id = MigrateTagCount.value.toString();
				MigrateJliffArray.push(migrateSourceItem);
			}

			DomObjs[tagString] = obj;
			TextForHash.value += "<x></x>";
		}
		else if (obj.childNodes.length > 0)
		{
			if (bOneLinkTx)
			{
				if (obj.nodeType == 1)
				{
					for (let ii=0; ii < g_AttrArray.length; ++ii)
					{
						let sAttrVal = g_AttrArray[ii];
						let attrNode = obj.getAttributeNode(sAttrVal);
						if (attrNode != null)
						{
							let iTransIndex   = g_TranslatedText.indexOf(attrNode.value);
							let sNormalizedWS = attrNode.value.replace(/[\r\n\t\f\v ]+/g, " ");

							if ((sNormalizedWS !== "") && (sNormalizedWS !== " ") && (bAutoDetect || (iTransIndex === -1)) && (attrNode.value !== attrNode.moxietx))
							{
								if ( MatchTransAttrs(sTagStack, sIdStack, sClassStack, obj, sAttrVal, attrNode.value) &&
								    !MatchNoTransAttrs(sTagStack, sIdStack, sClassStack, obj, sAttrVal, attrNode.value))
								{
									InnerHtmlAttrs.attrnode.push(attrNode);
									InnerHtmlAttrs.text.push(sNormalizedWS);
									InnerHtmlAttrs.rollover.push(obj);
								}
							}
						}
					}
				}

				try
				{
					if ((obj.nodeType == 1) && (window.getComputedStyle))
					{
						if (!MatchPseudoNoTransTIC(sTagStack, sIdStack, sClassStack, obj) ||
						     MatchPseudoTransTIC(sTagStack, sIdStack, sClassStack, obj))
						{
							let oBeforePseudo = window.getComputedStyle(obj, "::before");
							let oAfterPseudo  = window.getComputedStyle(obj, "::after");

							let sBeforeContent = oBeforePseudo.getPropertyValue("content");
							let sAfterContent  = oAfterPseudo.getPropertyValue("content");

							if (sBeforeContent && (sBeforeContent != "none") && sBeforeContent.indexOf("\"") === 0)
							{
								// strip leading and trailing quotes which are included as part of the string
								sBeforeContent = sBeforeContent.replace(/^["']/, "");
								sBeforeContent = sBeforeContent.replace(/["']$/, "");

								let iTransIndex   = g_TranslatedText.indexOf(sBeforeContent);
								let sNormalizedWS = sBeforeContent.replace(/[\r\n\t\f\v ]+/g, " ");

								if ((sNormalizedWS !== "") && (sNormalizedWS !== " ") && (bAutoDetect || (iTransIndex === -1)) && MoxieIsPseudoOk(sNormalizedWS))
								{

									g_PseudoObjCount += 1;
									let sKey = "moxieclassb" + g_PseudoObjCount.toString();
									g_PseudoObjMapping[sKey] = obj;

									InnerHtmlPseudos.pseudokey.push(sKey);
									InnerHtmlPseudos.text.push(sNormalizedWS);
									InnerHtmlPseudos.rollover.push(sKey);
									g_MoxiePseudoObserver.observe(obj, { attributes: true, attributeFilter: ["class"] });
								}
							}
			
							if (sAfterContent && (sAfterContent != "none") && sAfterContent.indexOf("\"") === 0)
							{
								// strip leading and trailing quotes which are included as part of the string
								sAfterContent = sAfterContent.replace(/^["']/, "");
								sAfterContent = sAfterContent.replace(/["']$/, "");

								let iTransIndex   = g_TranslatedText.indexOf(sAfterContent);
								let sNormalizedWS = sAfterContent.replace(/[\r\n\t\f\v ]+/g, " ");

								if ((sNormalizedWS !== "") && (sNormalizedWS !== " ") && (bAutoDetect || (iTransIndex === -1)) && MoxieIsPseudoOk(sNormalizedWS))
								{
									g_PseudoObjCount += 1;
									let sKey = "moxieclassa" + g_PseudoObjCount.toString();
									g_PseudoObjMapping[sKey] = obj;

									InnerHtmlPseudos.pseudokey.push(sKey);
									InnerHtmlPseudos.text.push(sNormalizedWS);
									InnerHtmlPseudos.rollover.push(sKey);
									g_MoxiePseudoObserver.observe(obj, { attributes: true, attributeFilter: ["class"] });
								}
							}
						}
					}
				} catch (e) {
					console.warn("OneLinkMoxieJS error checking for pseudo-elements in", obj, e);
				}
			}

			let iMyTagCount = TagCount.value;
			let tagStringStart = "sc:" + iMyTagCount;

			let sourceItemSc = {};
			sourceItemSc.kind = "sc";
			sourceItemSc.id = iMyTagCount.toString();
			JliffArray.push(sourceItemSc);

			let iMyMigrageTagCount = MigrateTagCount.value;
			if (g_bInMigrateMode)
			{
				let migrateSourceItemSc = {};
				migrateSourceItemSc.kind = "sc";
				migrateSourceItemSc.id = iMyMigrageTagCount.toString();
				MigrateJliffArray.push(migrateSourceItemSc);
			}

			DomObjs[tagStringStart] = obj;
			TextForHash.value += "<x>";

			for (let i = 0; i < obj.childNodes.length; i++)
			{
				let childObj = obj.childNodes[i];

				let bChildOneLinkTx  = bOneLinkTx;
				let sChildNoTxReason = sNoTxReason;

				if (childObj.nodeType == 1/*ELEMENT*/)
				{
					let TranslateAttribute = childObj.getAttribute("translate");
					if (ClassListContains(childObj, "OneLinkTx"))
					{
						bChildOneLinkTx = true;
						sChildNoTxReason = "";
					}
					else if (ClassListContains(childObj, "OneLinkNoTx"))
					{
						bChildOneLinkTx = false;
						sChildNoTxReason = "(OneLinkNoTx)";
					}
					else if (ClassListContains(childObj, "notranslate"))
					{
						bChildOneLinkTx = false;
						sChildNoTxReason = "(notranslate)";
					}
					else if (TranslateAttribute === "no")
					{
						bChildOneLinkTx = false;
						sChildNoTxReason = "(attribute)";
					}
				}

				if (MoxieHtmlToJliff(bChildOneLinkTx, sChildNoTxReason, childObj, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, InnerHtmlAttrs, InnerHtmlPseudos, sTagStack, sIdStack, sClassStack, oTokenContext, bAutoDetect))
				{
					bHasText = true;
				}
			}

			let tagStringEnd = "ec:" + iMyTagCount;

			let sourceItemEc = {};
			sourceItemEc.kind = "ec";
			sourceItemEc.startRef = iMyTagCount.toString();

			if (g_bInMigrateMode)
			{
				let migrateSourceItemEc = {};
				migrateSourceItemEc.kind = "ec";
				migrateSourceItemEc.startRef = iMyMigrageTagCount.toString();

				MigrateTagCount.value += 1;
				migrateSourceItemEc.id = MigrateTagCount.value.toString();

				MigrateJliffArray.push(migrateSourceItemEc);
			}

			if (g_sSkeletonVersion == "2")
			{
				TagCount.value += 1;
				sourceItemEc.id = TagCount.value.toString();
			}

			JliffArray.push(sourceItemEc);

			DomObjs[tagStringEnd] = obj;
			TextForHash.value += "</x>";
		}
		else
		{
			let tagString = "ph:" + TagCount.value;

			let sourceItem = {};
			sourceItem.kind = "ph";
			sourceItem.id = TagCount.value.toString();
			JliffArray.push(sourceItem);

			if (g_bInMigrateMode)
			{
				let migrateSourceItem = {};
				migrateSourceItem.kind = "ph";
				migrateSourceItem.id = MigrateTagCount.value.toString();
				MigrateJliffArray.push(migrateSourceItem);
			}

			if (bOneLinkTx)
			{
				if (obj.nodeType == 1)
				{
					for (let ii=0; ii < g_AttrArray.length; ++ii)
					{
						let sAttrVal = g_AttrArray[ii];
						let attrNode = obj.getAttributeNode(sAttrVal);
						if (attrNode != null)
						{
							let iTransIndex   = g_TranslatedText.indexOf(attrNode.value);
							let sNormalizedWS = attrNode.value.replace(/[\r\n\t\f\v ]+/g, " ");

							if ((sNormalizedWS !== "") && (sNormalizedWS !== " ") && (bAutoDetect || (iTransIndex === -1)) && (attrNode.value !== attrNode.moxietx))
							{
								if ( MatchTransAttrs(sTagStack, sIdStack, sClassStack, obj, sAttrVal, attrNode.value) &&
								    !MatchNoTransAttrs(sTagStack, sIdStack, sClassStack, obj, sAttrVal, attrNode.value))
								{
									InnerHtmlAttrs.attrnode.push(attrNode);
									InnerHtmlAttrs.text.push(sNormalizedWS);
									InnerHtmlAttrs.rollover.push(obj);
								}
							}
						}
					}
				}

				try
				{
					if ((obj.nodeType == 1) && (window.getComputedStyle))
					{
						if (!MatchPseudoNoTransTIC(sTagStack, sIdStack, sClassStack, obj) ||
						     MatchPseudoTransTIC(sTagStack, sIdStack, sClassStack, obj))
						{
							let oBeforePseudo = window.getComputedStyle(obj, "::before");
							let oAfterPseudo  = window.getComputedStyle(obj, "::after");
			
							let sBeforeContent = oBeforePseudo.getPropertyValue("content");
							let sAfterContent  = oAfterPseudo.getPropertyValue("content");
			
							if (sBeforeContent && (sBeforeContent != "none")  && sBeforeContent.indexOf("\"") === 0)
							{
								// strip leading and trailing quotes which are included as part of the string
								sBeforeContent = sBeforeContent.replace(/^["']/, "");
								sBeforeContent = sBeforeContent.replace(/["']$/, "");

								let iTransIndex   = g_TranslatedText.indexOf(sBeforeContent);
								let sNormalizedWS = sBeforeContent.replace(/[\r\n\t\f\v ]+/g, " ");
			
								if ((sNormalizedWS !== "") && (sNormalizedWS !== " ") && (bAutoDetect || (iTransIndex === -1)) && MoxieIsPseudoOk(sNormalizedWS))
								{
									g_PseudoObjCount += 1;
									let sKey = "moxieclassb" + g_PseudoObjCount.toString();
									g_PseudoObjMapping[sKey] = obj;
			
									InnerHtmlPseudos.pseudokey.push(sKey);
									InnerHtmlPseudos.text.push(sNormalizedWS);
									InnerHtmlPseudos.rollover.push(sKey);
									g_MoxiePseudoObserver.observe(obj, { attributes: true, attributeFilter: ["class"] });
								}
							}
			
							if (sAfterContent && (sAfterContent != "none") && sAfterContent.indexOf("\"") === 0)
							{
								// strip leading and trailing quotes which are included as part of the string
								sAfterContent = sAfterContent.replace(/^["']/, "");
								sAfterContent = sAfterContent.replace(/["']$/, "");

								let iTransIndex   = g_TranslatedText.indexOf(sAfterContent);
								let sNormalizedWS = sAfterContent.replace(/[\r\n\t\f\v ]+/g, " ");
			
								if ((sNormalizedWS !== "") && (sNormalizedWS !== " ") && (bAutoDetect || (iTransIndex === -1)) && MoxieIsPseudoOk(sNormalizedWS))
								{
									g_PseudoObjCount += 1;
									let sKey = "moxieclassa" + g_PseudoObjCount.toString();
									g_PseudoObjMapping[sKey] = obj;
			
									InnerHtmlPseudos.pseudokey.push(sKey);
									InnerHtmlPseudos.text.push(sNormalizedWS);
									InnerHtmlPseudos.rollover.push(sKey);
									g_MoxiePseudoObserver.observe(obj, { attributes: true, attributeFilter: ["class"] });
								}
							}
						}
					}
				} catch (e) {
					console.warn("OneLinkMoxieJS error checking for pseudo-elements in", obj, e);
				}
			}

			TextForHash.value += "<x></x>";

			DomObjs[tagString] = obj;
		}
	}

	return bHasText;

} // MoxieHtmlToJliff

//-----------------------------------------------------------------------------
function MoxieBlockToJliff (bOneLinkTx, sNoTxReason, obj, DomObjs, TextForHash, JliffArray, MigrateJliffArray, InnerHtmlAttrs, InnerHtmlPseudos, sTagStack, sIdStack, sClassStack, bAutoDetect)
//-----------------------------------------------------------------------------
{
	// Convert this Moxie HTML block
	//  Click<a href="somewere.html> here</a><br> for more info!
	//
	// Into this
	// "source": [
	//     { "text": " Click" },
	//     { "id": "1", "kind": "sc" },
	//     { "text": " here" },
	//     { "startRef": "1", "kind": "ec" },
	//     { "id": "2", "kind": "ph" },
	//     { "text": " for more info!" }
	// ]
	//
	// DomObjs would be
	//  {
	//      "sc:1":<dom obj>,
	//      "ec:1":<dom obj>,
	//      "ph:2":<dom obj>
	//	}
	//
	//  we can later use the stored dom objects and reconstruct the html
	//    <a href="somewere.html>
	//    </a>
	//    <br>

	let bHasText = false;

	let TagCount        = {"value":0};
	let MigrateTagCount = {"value":0};

	let oTokenContext = MoxieCheckForBlockToken(obj, sTagStack, sIdStack, sClassStack);

	if (obj.childNodes.length > 0)
	{
		for (let i = 0; i < obj.childNodes.length; i++)
		{
			let childObj = obj.childNodes[i];

			let bChildOneLinkTx  = bOneLinkTx;
			let sChildNoTxReason = sNoTxReason;

			if (childObj.nodeType == 1/*ELEMENT*/)
			{
				let TranslateAttribute = childObj.getAttribute("translate");
				if (ClassListContains(childObj, "OneLinkTx"))
				{
					bChildOneLinkTx = true;
					sChildNoTxReason = "";
				}
				else if (ClassListContains(childObj, "OneLinkNoTx"))
				{
					bChildOneLinkTx = false;
					sChildNoTxReason = "(OneLinkNoTx)";
				}
				else if (ClassListContains(childObj, "notranslate"))
				{
					bChildOneLinkTx = false;
					sChildNoTxReason = "(notranslate)";
				}
				else if (TranslateAttribute === "no")
				{
					bChildOneLinkTx = false;
					sChildNoTxReason = "(attribute)";
				}
			}


			if (MoxieHtmlToJliff(bChildOneLinkTx, sChildNoTxReason, childObj, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, InnerHtmlAttrs, InnerHtmlPseudos, sTagStack, sIdStack, sClassStack, oTokenContext, bAutoDetect))
			{
				bHasText = true;
			}
		}
	}
	else
	{
		bHasText = MoxieHtmlToJliff(bOneLinkTx, sNoTxReason, obj, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, InnerHtmlAttrs, InnerHtmlPseudos, sTagStack, sIdStack, sClassStack, oTokenContext, bAutoDetect);
	}

	return bHasText;

} // MoxieBlockToJliff

//-----------------------------------------------------------------------------
function MoxieReplaceChildTextNodes(obj)
//-----------------------------------------------------------------------------
{
	if (!obj)
	{
		return;
	}

	if (obj.nodeType == 3 && obj.moxiesrctext && obj.nodeValue === '')  
	{
		obj.nodeValue = obj.moxiesrctext;
	} else if (obj.nodeType == 1 || obj.nodeType == 9 || obj.nodeType == 11)  
	{
		for (let i = 0; i < obj.childNodes.length; i++) 
		{
			let node = obj.childNodes[i];
			MoxieReplaceChildTextNodes(node);
		}
	}
} // MoxieReplaceChildTextNodes

//-----------------------------------------------------------------------------
function MoxieFoundText (bIsTranslation, bOneLinkTx, sNoTxReason, bAutoDetectLang, obj, oRollover, sObjType, sTagStack, sIdStack, sClassStack, sText)
//-----------------------------------------------------------------------------
{
	if (typeof sText !== "string")
	{
		return;
	}

	try
	{
		let sEmptyCheck = sText.trim();
		if ((sEmptyCheck != "") || (sObjType == "innerHTML"))
		{
			if (sObjType == "attribute")
			{
				if (!MatchTransAttrs(sTagStack, sIdStack, sClassStack, obj, obj.name, obj.value) ||
				     MatchNoTransAttrs(sTagStack, sIdStack, sClassStack, obj, obj.name, obj.value))
				{
					DebugLog (2, "TIC matches Attribute No Translate pattern. Not translating:", obj, "");
					return;
				}
			}

			let NoTransRule = {};

			if ( MatchNoTransTIC(sTagStack, sIdStack, sClassStack, obj, NoTransRule) &&
			    !MatchTransTIC(sTagStack, sIdStack, sClassStack, obj))
			{
				DebugLog (2, "TIC matches No Translate pattern. Not translating:", obj, NoTransRule.rule);

				if (g_bIsOPE)
				{
					if ((typeof HookNoTx === "function") &&
						(sIdStack.indexOf("OPE_open") == -1) &&
						(sIdStack.indexOf("ope-plugin") == -1) &&
						(sIdStack.indexOf("openotrans") == -1) &&
						(sClassStack.indexOf("OPE_object_tag") == -1) &&
						(sTagStack.indexOf("OPE-NOTX") == -1) &&
						(sTagStack.indexOf("OPE-HOOK") == -1) &&
						(sTagStack.indexOf("OPE-SPAN") == -1))
					{
						HookNoTx (obj, sTagStack, sIdStack, sClassStack, "(Configuration)", NoTransRule.rule);
					}
				}

				MoxieReplaceChildTextNodes(obj);

				return;
			}

			// "translate" rules override any OneLinkNoTx, notranslate or translate="no"
			if (!bOneLinkTx && MatchTransTIC(sTagStack, sIdStack, sClassStack, obj))
			{
				bOneLinkTx  = true;
				sNoTxReason = "";
			}

			let JliffArray = [];
			let MigrateJliffArray = [];
			let DomObjs = {};
			let TextForHash = {"value":""};
			let InnerHtmlAttrs = {
									"attrnode" : [],
									"text"     : [],
									"rollover" : []
								 };
			let InnerHtmlPseudos = {
									"pseudokey" : [],
									"text"      : [],
									"rollover"  : []
								 };

			// Generate JLIFF and object reference array from HTML

			let bAutoDetect = bAutoDetectLang || MatchAutoDetectTIC(sTagStack, sIdStack, sClassStack, obj);

			let bHadText = false;
			if (sObjType == "innerHTML")
			{
				bHadText = MoxieBlockToJliff(bOneLinkTx, sNoTxReason, obj, DomObjs, TextForHash, JliffArray, MigrateJliffArray, InnerHtmlAttrs, InnerHtmlPseudos, sTagStack, sIdStack, sClassStack, bAutoDetect);
			}
			else if (sObjType == "normal")
			{
				bHadText = MoxieBlockToJliff(bOneLinkTx, sNoTxReason, obj, DomObjs, TextForHash, JliffArray, MigrateJliffArray, InnerHtmlAttrs, InnerHtmlPseudos, sTagStack, sIdStack, sClassStack, bAutoDetect);
			}
			else if ((sObjType == "attribute") ||
					 (sObjType == "inputvalue") ||
					 (sObjType == "meta") ||
					 (sObjType == "pseudobefore") ||
					 (sObjType == "pseudoafter"))
			{
				if (!bAutoDetect)
				{
					let iTransIndex = g_TranslatedText.indexOf(sText);
					if (iTransIndex !== -1)
					{
						return;
					}
				}

				let TagCount        = {"value":0};
				let MigrateTagCount = {"value":0};
				bHadText = MoxieTokenize(sText, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetect);
			}

			// Did we actually have any text for translation
			if (bHadText)
			{
				DebugLog (2, "OneLinkMoxieJS found text for translation type:", sObjType, "");

				let sTextHash = FNV1aHash(TextForHash.value);

				let bWasPretranslated = false;

				if (bIsTranslation)
				{
					// record the hash seen
					if (g_BlockHashArray.indexOf(sTextHash) === -1)
					{
						g_BlockHashArray.push(sTextHash);
					}

					if (g_bIsOPE)
					{
						if (!bAutoDetect && (g_OPEBlocksSeen.indexOf(sTextHash) === -1))
						{
							g_OPEBlocksSeen.push(sTextHash);
							g_OPEBlocksForSegments.push(sTextHash);
						}
					}

					if (!bAutoDetect)
					{
						// Now check the pre-translation array for this hash
	
						// g_TranslationArray is a Map of JLIFF "target" arrays with the block hashes as the key names
						// Example: {
						//            "4839478745704896847":[
						//              {"kind": "sc", "id": "1"},
						//              {"text": "¡Hola amigo!"},
						//              {"kind": "ec", "startRef": "1"},
						//              {"kind": "sc", "id": "2"},
						//              {"text": " ¿Cómo estás?"}
						//              {"kind": "ec", "startRef": "2"},
						//            ],
						//            "7784781953345167553":[
						//              {"text": " Cerveza por favor "}
						//            ]
						//          }
						//
						// Referencing g_TranslationArray["4839478745704896847"] would give us the Array value
						// where (along with the DomObjs) we can reconstruct
						// <span>¡Hola amigo!</span><b> ¿Cómo estás?</b>
						try {
							if (g_TranslationArray)
							{
								let TargetElements = g_TranslationArray[sTextHash];
								if (TargetElements)
								{
									// substitute translation now
									if ((sObjType == "pseudobefore") || (sObjType == "pseudoafter"))
									{
										MoxieReplacePseudoElement (obj, TargetElements, DomObjs);
										DebugLog (2, "OneLinkMoxieJS pretranslated pseudo", sTextHash, obj);
									}
									else
									{
										MoxieReplaceLocation(obj, TargetElements, DomObjs);
										DebugLog (2, "OneLinkMoxieJS pretranslated", sTextHash, obj);
									}
									if (g_bStatsActive && g_bSendStats)
									{
										if (g_PreTransBlocksUsed.indexOf(sTextHash) === -1)
										{
											g_PreTransBlocksUsed.push(sTextHash);
										}
									}
									bWasPretranslated = true;
								}
							}
						} catch (e) {
							// No pre-translation array. Fall through to include this text in the TxRequest.
						}
	
						if (!bWasPretranslated && !g_bIsOPE && !g_bIsGLNOW)
						{
							let TargetElements = g_TargetCache[sTextHash];
							if (TargetElements)
							{
								// substitute translation now
								if ((sObjType == "pseudobefore") || (sObjType == "pseudoafter"))
								{
									MoxieReplacePseudoElement (obj, TargetElements, DomObjs);
									DebugLog (2, "OneLinkMoxieJS already have translation for pseudo", sTextHash, obj);
								}
								else
								{
									MoxieReplaceLocation(obj, TargetElements, DomObjs);
									DebugLog (2, "OneLinkMoxieJS already have translation for", sTextHash, obj);
								}
								bWasPretranslated = true;
							}
						}
					}
				}

				if (g_bInMigrateMode)
				{
					if (!bAutoDetect)
					{
						DebugLog (2, "OneLinkMoxieJS migrating data for translation", sTextHash, MigrateJliffArray);

						g_MigrateTxRequest.text.push ({
							"tag_stack" : sTagStack,
							"id_stack" : sIdStack,
							"class_stack" : sClassStack,
							"source" : MigrateJliffArray,
							"block_hash" : sTextHash
						});

						let bSuppressMt = MatchSuppressMtTIC(sTagStack, sIdStack, sClassStack, obj);
						g_MigrateTxNoStacks.push ({
							"source" : MigrateJliffArray,
							"block_hash" : sTextHash,
							"suppress_mt": bSuppressMt
						});
					}
				}

				if (!bWasPretranslated)
				{
					DebugLog (2, "OneLinkMoxieJS sending for translation", sTextHash, JliffArray);

					let bSuppressMt = MatchSuppressMtTIC(sTagStack, sIdStack, sClassStack, obj);
					if (bAutoDetect)
					{
						g_AutoDetLocationArray.push (obj);
						g_AutoDetDomObjsArray.push (DomObjs);
						g_TxAutoDetect.push ({
							"source" : JliffArray,
							"block_hash" : sTextHash,
							"suppress_mt": bSuppressMt
						});
					}
					else
					{
						g_LocationArray.push (obj);
						g_DomObjsArray.push (DomObjs);

						g_TxRequest.text.push ({
							"tag_stack" : sTagStack,
							"id_stack" : sIdStack,
							"class_stack" : sClassStack,
							"source" : JliffArray,
							"block_hash" : sTextHash
						});

						g_TxNoStacks.push ({
							"source" : JliffArray,
							"block_hash" : sTextHash,
							"suppress_mt": bSuppressMt
						});
					}

					if (g_bIsOPE && !bAutoDetect)
					{
						if ((sObjType == "pseudobefore") || (sObjType == "pseudoafter"))
						{
							let sPseudoTagStack = sTagStack;

							let sKeyIndex = obj.indexOf("moxieclassb");
							if (sKeyIndex !== -1)
							{
								sPseudoTagStack += "::before";
							} else
							{
								sPseudoTagStack += "::after";
							}
							let OPEObject = {
								"moxie_object" : obj,
								"source_object" : obj,
								"original_source" : sText,
								"original_target" : sText,
								"rollover_object" : oRollover,
								"block_hash" : sTextHash,
								"source" : JliffArray,
								"target" : JliffArray,
								"dom_objects" : DomObjs,
								"tag_stack" : sPseudoTagStack,
								"id_stack" : sIdStack,
								"class_stack" : sClassStack
							};
							g_OPEArray.push(OPEObject);
						}
						else
						{
							let OPEObject = {
								"moxie_object" : obj,
								"source_object" : obj.cloneNode ? obj.cloneNode(true) : obj,
								"rollover_object" : oRollover,
								"block_hash" : sTextHash,
								"source" : JliffArray,
								"target" : JliffArray,
								"dom_objects" : DomObjs,
								"tag_stack" : sTagStack,
								"id_stack" : sIdStack,
								"class_stack" : sClassStack
							};
							g_OPEArray.push(OPEObject);
						}
					}
				}
			}
			else
			{
				DebugLog (2, "OneLinkMoxieJS no text found for translation type:", sObjType, obj);
			}

			let bSuppressMtAttr = MatchSuppressMtTIC(sTagStack+":innerattr", sIdStack, sClassStack, obj);
			let bAutoDetectAttr = bAutoDetectLang || MatchAutoDetectTIC(sTagStack+":innerattr", sIdStack, sClassStack, obj);

			for (let ii=0; ii < InnerHtmlAttrs.attrnode.length; ++ii)
			{
				let oAttrNode = InnerHtmlAttrs.attrnode[ii];
				let sAttrText = InnerHtmlAttrs.text[ii];
				let oRollObj  = InnerHtmlAttrs.rollover[ii];

				let JliffAttrs        = [];
				let MigrateJliffAttrs = [];
				let AttrDomObjs       = {};
				let AttrTextForHash   = {"value":""};

				let TagCount        = {"value":0};
				let MigrateTagCount = {"value":0};
				let bAttrHadText = MoxieTokenize(sAttrText, AttrDomObjs, AttrTextForHash, JliffAttrs, MigrateJliffAttrs, TagCount, MigrateTagCount, sTagStack, sIdStack, sClassStack, obj, bAutoDetectAttr);

				if (bAttrHadText)
				{
					let sAttrTextHash = FNV1aHash(AttrTextForHash.value);

					let bWasPretranslated = false;

					if (bIsTranslation)
					{
						// record the hash seen
						if (g_BlockHashArray.indexOf(sAttrTextHash) === -1)
						{
							g_BlockHashArray.push(sAttrTextHash);
						}

						if (g_bIsOPE)
						{
							if (!bAutoDetectAttr && (g_OPEBlocksSeen.indexOf(sAttrTextHash) === -1))
							{
								g_OPEBlocksSeen.push(sAttrTextHash);
								g_OPEBlocksForSegments.push(sAttrTextHash);
							}
						}

						if (!bAutoDetectAttr)
						{
							// Now check the pre-translation array for this hash

							try {
								if (g_TranslationArray)
								{
									let TargetElements = g_TranslationArray[sAttrTextHash];
									if (TargetElements)
									{
										// substitute translation now
										MoxieReplaceLocation(oAttrNode, TargetElements, AttrDomObjs);
										DebugLog (2, "OneLinkMoxieJS pretranslated", sAttrTextHash, obj);
										if (g_bStatsActive && g_bSendStats)
										{
											if (g_PreTransBlocksUsed.indexOf(sAttrTextHash) === -1)
											{
												g_PreTransBlocksUsed.push(sAttrTextHash);
											}
										}
										bWasPretranslated = true;
									}
								}
							} catch (e) {
								// No pre-translation array. Fall through to include this text in the TxRequest.
							}

							if (!bWasPretranslated && !g_bIsOPE && !g_bIsGLNOW)
							{
								let TargetElements = g_TargetCache[sAttrTextHash];
								if (TargetElements)
								{
									// substitute translation now
									MoxieReplaceLocation(oAttrNode, TargetElements, AttrDomObjs);
									DebugLog (2, "OneLinkMoxieJS already have translation for", sAttrTextHash, obj);
									bWasPretranslated = true;
								}
							}
						}
					}

					if (g_bInMigrateMode && !bAutoDetectAttr)
					{
						DebugLog (2, "OneLinkMoxieJS migrating data for translation", sAttrTextHash, MigrateJliffAttrs);

						g_MigrateTxRequest.text.push ({
							"tag_stack" : sTagStack+":innerattr",
							"id_stack" : sIdStack,
							"class_stack" : sClassStack,
							"source" : MigrateJliffAttrs,
							"block_hash" : sAttrTextHash
						});

						g_MigrateTxNoStacks.push ({
							"source" : MigrateJliffAttrs,
							"block_hash" : sAttrTextHash,
							"suppress_mt": bSuppressMtAttr
						});
					}

					if (!bWasPretranslated)
					{
						DebugLog (2, "OneLinkMoxieJS sending inner attributes for translation", sAttrTextHash, JliffAttrs);

						if (bAutoDetectAttr)
						{
							g_AutoDetLocationArray.push (oAttrNode);
							g_AutoDetDomObjsArray.push (AttrDomObjs);
							g_TxAutoDetect.push ({
								"source" : JliffAttrs,
								"block_hash" : sAttrTextHash,
								"suppress_mt": bSuppressMtAttr
							});
						}
						else
						{
							g_LocationArray.push (oAttrNode);
							g_DomObjsArray.push (AttrDomObjs);

							g_TxRequest.text.push ({
								"tag_stack" : sTagStack+":innerattr",
								"id_stack" : sIdStack,
								"class_stack" : sClassStack,
								"source" : JliffAttrs,
								"block_hash" : sAttrTextHash
							});

							g_TxNoStacks.push ({
								"source" : JliffAttrs,
								"block_hash" : sAttrTextHash,
								"suppress_mt": bSuppressMtAttr
							});
						}

						if (g_bIsOPE && !bAutoDetectAttr)
						{
							let OPEObject = {
									"moxie_object" : oAttrNode,
	                                "source_object" : oAttrNode.cloneNode ? oAttrNode.cloneNode(true) : oAttrNode,
									"rollover_object" : oRollObj,
									"block_hash" : sAttrTextHash,
									"source" : JliffAttrs,
									"target" : JliffAttrs,
									"dom_objects" : AttrDomObjs,
									"tag_stack" : sTagStack+":innerattr",
									"id_stack" : sIdStack,
									"class_stack" : sClassStack
								};
							g_OPEArray.push(OPEObject);
						}
					}
				}
			}

			for (let ii=0; ii < InnerHtmlPseudos.pseudokey.length; ++ii)
			{
				let sPseudoKey  = InnerHtmlPseudos.pseudokey[ii];
				let sPseudoText = InnerHtmlPseudos.text[ii];
				let oRollObj    = InnerHtmlPseudos.rollover[ii];

				let JliffPseudos        = [];
				let MigrateJliffPseudos = [];
				let PseudoDomObjs       = {};
				let PseudoTextForHash   = {"value":""};

				let TagCount        = {"value":0};
				let MigrateTagCount = {"value":0};

				let sPseudoTagStack = sTagStack;

				let sKeyIndex = sPseudoKey.indexOf("moxieclassb");
				if (sKeyIndex !== -1)
				{
					sPseudoTagStack += "::before";
				} else
				{
					sPseudoTagStack += "::after";
				}

				let bAutoDetectPseudo = bAutoDetectLang || MatchAutoDetectTIC(sPseudoTagStack, sIdStack, sClassStack, obj);

				let bPseudoHadText = MoxieTokenize(sPseudoText, PseudoDomObjs, PseudoTextForHash, JliffPseudos, MigrateJliffPseudos, TagCount, MigrateTagCount, sPseudoTagStack, sIdStack, sClassStack, obj, bAutoDetectPseudo);

				if (bPseudoHadText)
				{
					let sPseudoTextHash = FNV1aHash(PseudoTextForHash.value);

					let bWasPretranslated = false;

					if (bIsTranslation)
					{
						// record the hash seen
						if (g_BlockHashArray.indexOf(sPseudoTextHash) === -1)
						{
							g_BlockHashArray.push(sPseudoTextHash);
						}

						if (g_bIsOPE)
						{
							if (!bAutoDetectPseudo && (g_OPEBlocksSeen.indexOf(sPseudoTextHash) === -1))
							{
								g_OPEBlocksSeen.push(sPseudoTextHash);
								g_OPEBlocksForSegments.push(sPseudoTextHash);
							}
						}

						if (!bAutoDetectPseudo)
						{
							// Now check the pre-translation array for this hash

							try {
								if (g_TranslationArray)
								{
									let TargetElements = g_TranslationArray[sPseudoTextHash];
									if (TargetElements)
									{
										// substitute translation now
										MoxieReplacePseudoElement (sPseudoKey, TargetElements, PseudoDomObjs);
										DebugLog (2, "OneLinkMoxieJS pretranslated pseudo", sPseudoTextHash, obj);
										if (g_bStatsActive && g_bSendStats)
										{
											if (g_PreTransBlocksUsed.indexOf(sPseudoTextHash) === -1)
											{
												g_PreTransBlocksUsed.push(sPseudoTextHash);
											}
										}
										bWasPretranslated = true;
									}
								}
							} catch (e) {
								// No pre-translation array. Fall through to include this text in the TxRequest.
							}

							if (!bWasPretranslated && !g_bIsOPE && !g_bIsGLNOW)
							{
								let TargetElements = g_TargetCache[sPseudoTextHash];
								if (TargetElements)
								{
									// substitute translation now
									MoxieReplacePseudoElement (sPseudoKey, TargetElements, PseudoDomObjs);
									DebugLog (2, "OneLinkMoxieJS already have translation for pseudo", sPseudoTextHash, obj);
									bWasPretranslated = true;
								}
							}
						}
					}

					if (g_bInMigrateMode)
					{
						if (!bAutoDetectPseudo)
						{
							DebugLog (2, "OneLinkMoxieJS migrating data for translation", sPseudoTextHash, MigrateJliffPseudos);

							g_MigrateTxRequest.text.push ({
								"tag_stack" : sPseudoTagStack,
								"id_stack" : sIdStack,
								"class_stack" : sClassStack,
								"source" : MigrateJliffPseudos,
								"block_hash" : sPseudoTextHash
							});

							let bSuppressMt = MatchSuppressMtTIC(sPseudoTagStack, sIdStack, sClassStack, obj);
							g_MigrateTxNoStacks.push ({
								"source" : MigrateJliffPseudos,
								"block_hash" : sPseudoTextHash,
								"suppress_mt": bSuppressMt
							});
						}
					}

					if (!bWasPretranslated)
					{
						DebugLog (2, "OneLinkMoxieJS sending inner pseudo for translation", sPseudoTextHash, JliffPseudos);

						let bSuppressMt = MatchSuppressMtTIC(sPseudoTagStack, sIdStack, sClassStack, obj);
						if (bAutoDetectPseudo)
						{
							g_AutoDetLocationArray.push (sPseudoKey);
							g_AutoDetDomObjsArray.push (PseudoDomObjs);
							g_TxAutoDetect.push ({
								"source" : JliffPseudos,
								"block_hash" : sPseudoTextHash,
								"suppress_mt": bSuppressMt
							});
						}
						else
						{
							g_LocationArray.push (sPseudoKey);
							g_DomObjsArray.push (PseudoDomObjs);

							g_TxRequest.text.push ({
								"tag_stack" : sPseudoTagStack,
								"id_stack" : sIdStack,
								"class_stack" : sClassStack,
								"source" : JliffPseudos,
								"block_hash" : sPseudoTextHash
							});

							g_TxNoStacks.push ({
								"source" : JliffPseudos,
								"block_hash" : sPseudoTextHash,
								"suppress_mt": bSuppressMt
							});
						}

						if (g_bIsOPE && !bAutoDetectPseudo)
						{
							let OPEObject = {
								"moxie_object" : obj,
								"source_object" : obj,
								"original_source" : sPseudoText,
								"original_target" : sPseudoText,
								"rollover_object" : oRollObj,
								"block_hash" : sPseudoTextHash,
								"source" : JliffPseudos,
								"target" : JliffPseudos,
								"dom_objects" : PseudoDomObjs,
								"tag_stack" : sPseudoTagStack,
								"id_stack" : sIdStack,
								"class_stack" : sClassStack
							};
							g_OPEArray.push(OPEObject);
						}
					}
				}
			}
		}
	} catch (e) {
		console.error("OneLinkMoxieJS error parsing content for object", obj, e);
	}

} // MoxieFoundText

//-----------------------------------------------------------------------------
function kstrin (sNeedle, sHaystack, sDelim/*=","*/) // dekaf.js
//-----------------------------------------------------------------------------
{
	if (!sDelim) {
		sDelim = ",";
	}

	try
	{
		let RegEx1 = new RegExp("^" + sNeedle + sDelim + "", "i");
		let RegEx2 = new RegExp("" + sDelim + sNeedle + "$", "i");
		let RegEx3 = new RegExp("" + sDelim + sNeedle + sDelim + "", "i");

		if ((sHaystack.toUpperCase() == sNeedle.toUpperCase()) ||
		    (sHaystack.match (RegEx1)) ||
		    (sHaystack.match (RegEx2)) ||
		    (sHaystack.match (RegEx3)))
		{
			return (true);
		}
	} catch (e) {}

	return (false);

} // kstrin

//-----------------------------------------------------------------------------
function MoxieIncludes (sNeedle, sHaystack, sDelim/*=","*/) 
//-----------------------------------------------------------------------------
{	
	if (!sDelim) {
		sDelim = ",";
	}

	try
	{ 
		return `${sDelim}${sHaystack}${sDelim}`.toUpperCase().includes(`${sDelim}${sNeedle}${sDelim}`.toUpperCase());
	} catch (e) {}

	return false;

} // MoxieIncludes

//-----------------------------------------------------------------------------
function MatchCSSSelector(TicObj, obj, bCheckParents = true)
//-----------------------------------------------------------------------------
{
	let bFound = false;
	try
	{
		let foundObjs;
		if (g_oQueryCache.has(TicObj.X)) 
		{
			foundObjs = g_oQueryCache.get(TicObj.X);
		} else 
		{
			foundObjs = document.querySelectorAll(TicObj.X);
			g_oQueryCache.set(TicObj.X, foundObjs); 
		}

		for (let i = 0; i < foundObjs.length; i++) 
		{
			if (foundObjs[i] === obj) 
			{
				bFound = true;
				break;
			}

			if (bCheckParents)
			{
				// check all parent nodes as well for a match
				let node = obj;

				while (node = node.assignedSlot || node.parentNode || node.host || node.ownerElement)
				{
					if (foundObjs[i] === node)
					{
						bFound = true;
						break;
					}
				}
			}
		}
	}
	catch (error)
	{
		console.error(
			"OneLinkMoxieJS error executing CSS query selector in TicObj",
			JSON.stringify(TicObj), error
		);
	}

	return bFound;
} // MatchCSSSelector

//-----------------------------------------------------------------------------
function MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj) 
//-----------------------------------------------------------------------------
{
	let bFound = false;

  	if (
		TicObj.T === g_WildcardRegex 
		&& TicObj.I === g_WildcardRegex
		&& TicObj.C === g_WildcardRegex) 
  	{
    	bFound = true;
  	}
	else if (TicObj.X && obj)
	{
		bFound = MatchCSSSelector(TicObj, obj);
	} 	
	else if (
		TicObj.T &&
		sClassStack.match(TicObj.C) &&
		sIdStack.match(TicObj.I) &&
		sTagStack.match(TicObj.T)
	)
	{
		bFound = true;
	}


	return bFound;

} // MatchUTICX

//-----------------------------------------------------------------------------
function MatchSetAsBlockTag(sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	let sTag = obj.tagName;
	for (let ii=0; ii < g_RulesBlockTags.length; ++ii)
	{
		let TicObj = g_RulesBlockTags[ii];
		let Tags  = TicObj.tags;
		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj) 
			&& MoxieIncludes(sTag, Tags))
		{
			return true;
		}
	}

	return false;

} // MatchSetAsBlockTag

//-----------------------------------------------------------------------------
function MatchSetAsInlineTag(sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	let sTag = obj.tagName;
	for (let ii=0; ii < g_RulesInlineTags.length; ++ii)
	{
		let TicObj = g_RulesInlineTags[ii];
		let Tags  = TicObj.tags;

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj) 
			&& MoxieIncludes(sTag, Tags))
		{
			return true;
		}
	}

	return false;

} // MatchSetAsInlineTag

//-----------------------------------------------------------------------------
function MatchLangSelectorTIC(sTagStack, sIdStack, sClassStack, Position, obj)
//-----------------------------------------------------------------------------
{   
	if (sTagStack && sIdStack && sClassStack)
	{
		for (let ii=0; ii < g_LangSelectorTICs.length; ++ii)
		{
			let TicObj = g_LangSelectorTICs[ii];

			if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj))
			{
				Position.pos = TicObj.pos;
				return true;
			}
		}
	}

	return false;
} // MatchLangSelectorTIC

//-----------------------------------------------------------------------------
function MatchNoTokenizeTIC(sTagStack, sIdStack, sClassStack,obj, sTokenizeType)
//-----------------------------------------------------------------------------
{
	if (sTagStack && sIdStack && sClassStack)
	{
		for (let ii=0; ii < g_NoTokenizeTICS.length; ++ii)
		{
			let TicObj = g_NoTokenizeTICS[ii];

			if (TicObj.type === sTokenizeType && 
				MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj))
			{
				return true;
			}
		}
	}

	return false;

} // MatchNoTokenizeTIC

//-----------------------------------------------------------------------------
function MatchNoAmiTIC(sTagStack, sIdStack, sClassStack)
//-----------------------------------------------------------------------------
{
	if (g_bForceAMI)
	{
		return false;
	}

	if (sTagStack && sIdStack && sClassStack)
	{
		for (let ii=0; ii < g_NoAmiTICs.length; ++ii)
		{
			let TicObj = g_NoAmiTICs[ii];

			// This match does not support the X in UTICX
			if (TicObj.X)
			{
				console.warn("OneLinkMoxieJS no_ami config property does not support the X in UTICX");
			}

			if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj))
			{
				return true;
			}
		}
	}

	return false;

} // MatchNoAmiTIC

//-----------------------------------------------------------------------------
function MatchNoReWriteTIC(sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	for (let ii=0; ii < g_NoHostRewritesTICs.length; ++ii)
	{
		let TicObj = g_NoHostRewritesTICs[ii];

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj))
		{
			return true;
		}
	}

	return false;

} // MatchNoReWriteTIC

//-----------------------------------------------------------------------------
function MatchIframeNoTrans(oIFrame)
//-----------------------------------------------------------------------------
{
	try 
	{
		for (let ii=0; ii < g_IframeNoTransTICS.length; ++ii)
		{
			let TicObj = g_IframeNoTransTICS[ii];
			let sToMatch = oIFrame.src;
	
			if (oIFrame.contentWindow 
				&& oIFrame.contentWindow.location 
				&& oIFrame.contentWindow.location.href
				&& oIFrame.contentWindow.location.href !== "about:blank")
			{
				sToMatch = oIFrame.contentWindow.location.href;
			}
	
			if (TicObj.location && sToMatch.match(TicObj.location))
			{
				return true
			}
	
		}	
	}
	catch (e)
	{
		console.warn("OneLinkMoxieJS cannot apply iframe_notrans rule", e);
	}

	return false;

} // MatchIframeNoTrans

//-----------------------------------------------------------------------------
function MatchSuppressMtTIC(sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	for (let ii=0; ii < g_SuppressMtTICs.length; ++ii)
	{
		let TicObj = g_SuppressMtTICs[ii];

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj))
		{
			return true;
		}
	}

	return false;

} // MatchSuppressMtTIC

//-----------------------------------------------------------------------------
function MatchAutoDetectTIC(sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	for (let ii=0; ii < g_AutoDetectTICs.length; ++ii)
	{
		let TicObj = g_AutoDetectTICs[ii];

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj))
		{
			return true;
		}
	}

	return false;

} // MatchAutoDetectTIC

//-----------------------------------------------------------------------------
function MatchPseudoNoTransTIC(sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	for (let ii=0; ii < g_PseudoNoTranslateTICs.length; ++ii)
	{
		let TicObj = g_PseudoNoTranslateTICs[ii];
		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj))
		{
			return true;
		}
	}

	return false;

} // MatchPseudoNoTransTIC

//-----------------------------------------------------------------------------
function MatchPseudoTransTIC(sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	for (let ii=0; ii < g_PseudoTranslateTICs.length; ++ii)
	{
		let TicObj = g_PseudoTranslateTICs[ii];
		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj))
		{
			return true;
		}
	}

	return false;

} // MatchPseudoTransTIC

//-----------------------------------------------------------------------------
function MatchNoTransTIC(sTagStack, sIdStack, sClassStack, obj, NoTransRule)
//-----------------------------------------------------------------------------
{
	for (let ii=0; ii < g_NoTranslateTICs.length; ++ii)
	{
		let TicObj = g_NoTranslateTICs[ii];

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj))
		{
			NoTransRule.rule = TicObj;
			return true;
		}
	}

	return false;

} // MatchNoTransTIC

//-----------------------------------------------------------------------------
function MatchTransTIC(sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	for (let ii=0; ii < g_TranslateTICs.length; ++ii)
	{
		let TicObj = g_TranslateTICs[ii];

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj)) 
		{
	  		return true;
		}
	}

	return false;

} // MatchTransTIC

//-----------------------------------------------------------------------------
function MatchIgnoreHiddenTIC(sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{	
	let bFound = false;
	for (let ii=0; ii < g_IgnoreHiddenTICs.length; ++ii)
	{
		let TicObj = g_IgnoreHiddenTICs[ii];

		if (!TicObj.X)
		{
			console.warn("The ignore_hidden config only supports X", TicObj);
			continue;
		}

		if (TicObj.X.indexOf(" ") === -1 && TicObj.X.indexOf(".") === 0) 
		{
			// optimization for matching on one class
			bFound = obj.classList.contains(TicObj.X.slice(1));
			if (bFound) break;
		}
		else 
		{
			bFound = MatchCSSSelector(TicObj, obj, false);
			if (bFound) break;
		}		
	}

	return bFound;

} // MatchIgnoreHiddenTIC

//-----------------------------------------------------------------------------
function MatchNoTransAttrs(sTagStack, sIdStack, sClassStack, obj, sAttr)
//-----------------------------------------------------------------------------
{
	for (let ii=0; ii < g_NoTranslateAttrs.length; ++ii)
	{
		let TicObj = g_NoTranslateAttrs[ii];
		let Attrs  = TicObj.attrs;

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj) && 			
			(Attrs.indexOf(sAttr) !== -1)) 
		{
	  		return true;
		}

	}

	return false;

} // MatchNoTransAttrs

//-----------------------------------------------------------------------------
function MatchTransAttrs(sTagStack, sIdStack, sClassStack, obj, sAttr)
//-----------------------------------------------------------------------------
{
	for (let ii=0; ii < g_TranslateAttrs.length; ++ii)
	{
		let TicObj = g_TranslateAttrs[ii];
		let Attrs  = TicObj.attrs;

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj) && 			
			(Attrs.indexOf(sAttr) !== -1)) 
		{
	  		return true;
		}
	}

	return false;

} // MatchTransAttrs

//-----------------------------------------------------------------------------
function MatchNoImageTransTIC(sTagStack, sIdStack, sClassStack, obj, NoImageTransRule)
//-----------------------------------------------------------------------------
{
	for (let ii=0; ii < g_NoImageTranslateTICs.length; ++ii)
	{
		let TicObj = g_NoImageTranslateTICs[ii];

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj))
		{
			NoImageTransRule.rule = TicObj;
			return true;
		}
	}

	return false;

} // MatchNoImageTransTIC

//-----------------------------------------------------------------------------
function MatchImageTransTIC(sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	for (let ii=0; ii < g_ImageTranslateTICs.length; ++ii)
	{
		let TicObj = g_ImageTranslateTICs[ii];

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj)) 
		{
	  		return true;
		}
	}

	return false;

} // MatchImageTransTIC

//-----------------------------------------------------------------------------
function MatchNoTransInputValue(sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	for (let ii=0; ii < g_NoTranslateInputValue.length; ++ii)
	{
		let TicObj = g_NoTranslateInputValue[ii];

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj)) 
		{
		  return true;
		}
	}

	return false;

} // MatchNoTransInputValue

//-----------------------------------------------------------------------------
function MatchTransInputValue(sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	for (let ii=0; ii < g_TranslateInputValue.length; ++ii)
	{
		let TicObj = g_TranslateInputValue[ii];

		if (MatchUTICX(sTagStack, sIdStack, sClassStack, TicObj, obj)) 
		{
		  return true;
		}
	}

	return false;

} // MatchTransInputValue


//-----------------------------------------------------------------------------
function IsNonText (obj)
//-----------------------------------------------------------------------------
{
	return (obj && obj.tagName && (obj.tagName != "") &&
		    MoxieIncludes (obj.tagName, "BASE,CDATA,LINK,NOSCRIPT,SCRIPT,STYLE,METER,PROGRESS"));

} // IsNonText

//-----------------------------------------------------------------------------
function IsBlockLevelTag (sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	return (obj && obj.tagName !== undefined && (obj.tagName != "") &&
		   ((MoxieIncludes (obj.tagName, "ADDRESS,APPLET,ARTICLE,ASIDE,BLOCKQUOTE,CANVAS,CAPTION,CENTER,DD,DETAILS,DIV,DL,DT,FIELDSET,FIGCAPTION,FIGURE,FOOTER,FORM,H1,H2,H3,H4,H5,H6,HEAD,HEADER,HGROUP,HR,IFRAME,INPUT,LABEL,LI,MAIN,MAP,MENU,MENUITEM,META,NAV,OBJECT,OL,OPTION,OPTGROUP,OUTPUT,P,PRE,SECTION,SELECT,SOURCE,SUMMARY,TABLE,TBODY,TD,TH,TEXTAREA,TFOOT,TITLE,TR,TRACK,UL,VIDEO")
		   	&& !MatchSetAsInlineTag(sTagStack, sIdStack, sClassStack, obj))
			|| MatchSetAsBlockTag(sTagStack, sIdStack, sClassStack, obj)));

} // IsBlockLevelTag

//-----------------------------------------------------------------------------
function IsInlineTag (sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	return (obj && obj.tagName && (obj.tagName != "") &&
		   ((MoxieIncludes (obj.tagName, "A,ABBR,ACRONYM,B,BDO,BIG,BR,BUTTON,CITE,CODE,DFN,EM,FONT,I,IMG,KBD,MARK,Q,SAMP,SMALL,SPAN,STRONG,SUB,SUP,TIME,TT,VAR,WBR")
		   	&& !MatchSetAsBlockTag(sTagStack, sIdStack, sClassStack, obj))
		    || MatchSetAsInlineTag(sTagStack, sIdStack, sClassStack, obj)));

} // IsInlineTag

//-----------------------------------------------------------------------------
function ElementContainsBlockLevelTag (sTagStack, sIdStack, sClassStack,obj)
//-----------------------------------------------------------------------------
{
	for (let ii = 0; ii < obj.childNodes.length; ++ii)
	{
		let childObj = obj.childNodes[ii];
		if (IsBlockLevelTag (sTagStack, sIdStack, sClassStack,childObj))
		{
			return (true); // short circuit logic to end recursion
		}
		else if (childObj && childObj.tagName && (!IsInlineTag (sTagStack, sIdStack, sClassStack, childObj)) && (!IsNonText (childObj)))
		{
			// if we don't recognize this tag, assume block-level
			return (true);
		}
		if (ElementContainsBlockLevelTag (sTagStack, sIdStack, sClassStack, childObj))
		{
			return (true);
		}
	}

	return (false); // exhausted all children, no block level tag children found

} // ElementContainsBlockLevelTag

//-----------------------------------------------------------------------------
function ElementContainsInlineTag (sTagStack, sIdStack, sClassStack, obj)
//-----------------------------------------------------------------------------
{
	for (let ii = 0; ii < obj.childNodes.length; ++ii) {
		if (IsInlineTag (sTagStack, sIdStack, sClassStack, obj.childNodes[ii])) {
			return (true); // short circuit logic to end recursion
		}
	}

	return (false); // exhausted all children, no inline tag children found

} // ElementContainsInlineTag

//-----------------------------------------------------------------------------
function MoxieFindAttrs (bIsTranslation, obj, bAutoDetect, sTagStack, sIdStack, sClassStack)
//-----------------------------------------------------------------------------
{
	if (!obj) {
		return;
	}

	if (obj.nodeType == 1/*ELEMENT*/)
	{
		if (obj.tagName == "META")
		{
			// META tag is special
			MoxieFindMetaAttrs (bIsTranslation, obj, bAutoDetect, sTagStack, sIdStack, sClassStack);
		}
		else
		{
			for (let ii=0; ii < g_AttrArray.length; ++ii)
			{
				let sAttrVal = g_AttrArray[ii];
				let attrNode = obj.getAttributeNode(sAttrVal);
				if (attrNode)
				{
					let sNormalizedWS = attrNode.value.replace(/[\r\n\t\f\v ]+/g, " ");

					if ((sNormalizedWS !== "") && (sNormalizedWS !== " ") && (attrNode.value !== attrNode.moxietx))
					{
						if ( MatchTransAttrs(sTagStack, sIdStack, sClassStack, obj, sAttrVal, attrNode.value) &&
						    !MatchNoTransAttrs(sTagStack, sIdStack, sClassStack, obj, sAttrVal, attrNode.value))
						{
							let sAttrTagStack = sTagStack;
							sAttrTagStack += ":" + sAttrVal;
							MoxieFoundText (bIsTranslation, true, "", bAutoDetect, attrNode, obj, "attribute", sAttrTagStack, sIdStack, sClassStack, sNormalizedWS);
						}
					}
				}
			}
		}
	}

} // MoxieFindAttrs

//-----------------------------------------------------------------------------
function MoxieFindInputValue (bIsTranslation, obj, bAutoDetect, sTagStack, sIdStack, sClassStack, sTranslateKey, sHost)
//-----------------------------------------------------------------------------
{
	if (!obj || (obj.tagName !== "INPUT" && obj.tagName !== "TEXTAREA")) 
	{
		return;
	}

	if ( MatchTransInputValue(sTagStack, sIdStack, sClassStack, obj, obj.value) &&
		!MatchNoTransInputValue(sTagStack, sIdStack, sClassStack, obj, obj.value))
	{
		let sInputValueTagStack = sTagStack;
		sInputValueTagStack += ":value";
		let attrNode = obj.getAttributeNode("value");
		if (!attrNode) 
		{
			// if the client JS created the input dynamically it might not have an attrNode
			// depending on how they did it
			obj.setAttribute("value", obj.value);
			attrNode = obj.getAttributeNode("value");
		}

		if (attrNode && (obj.value !== obj.moxietx))
		{
			MoxieFoundText (bIsTranslation, true, "", bAutoDetect, attrNode, obj, "inputvalue", sInputValueTagStack, sIdStack, sClassStack, obj.value);
		}

		if (bIsTranslation && !obj.moxieobserved) 
		{
			obj.moxieobserved = true;
			MoxieWatchInputValue(obj, sTranslateKey, sHost);
		}
	}
} // MoxieFindInputValue

//-----------------------------------------------------------------------------
function MoxieIsPseudoOk (sText)
//-----------------------------------------------------------------------------
{
	if (sText && sText.length > 2)
	{
		return true;
	}

	return false;

} // MoxieIsPseudoOk

//-----------------------------------------------------------------------------
function MoxieFindPseudoElements (bIsTranslation, obj, bAutoDetect, sTagStack, sIdStack, sClassStack)
//-----------------------------------------------------------------------------
{
	try
	{
		if (!obj || !window.getComputedStyle)
		{
			return;
		}
		if (obj.nodeType == 1)
		{
			if ( MatchPseudoNoTransTIC(sTagStack, sIdStack, sClassStack, obj) &&
			    !MatchPseudoTransTIC(sTagStack, sIdStack, sClassStack, obj))
			{
				return;
			}

			let oBeforePseudo = window.getComputedStyle(obj, "::before");
			let oAfterPseudo  = window.getComputedStyle(obj, "::after");

			let sBeforeContent = oBeforePseudo.getPropertyValue("content");
			let sAfterContent  = oAfterPseudo.getPropertyValue("content");

			// Looking for text that begin with a quote as others are built in values
			// https://developer.mozilla.org/en-US/docs/Web/CSS/content
			if (sBeforeContent && (sBeforeContent != "none") && sBeforeContent.indexOf("\"") === 0)
			{
				// strip leading and trailing quotes which are included as part of the string
				sBeforeContent = sBeforeContent.replace(/^["']/, "");
				sBeforeContent = sBeforeContent.replace(/["']$/, "");

				let sNormalizedWS = sBeforeContent.replace(/[\r\n\t\f\v ]+/g, " ");

				if ((sNormalizedWS !== "") && (sNormalizedWS !== " ") && MoxieIsPseudoOk(sNormalizedWS))
				{
					g_PseudoObjCount += 1;
					let sKey = "moxieclassb" + g_PseudoObjCount.toString();
					g_PseudoObjMapping[sKey] = obj;

					let sPseudoTagStack = sTagStack + "::before";
					MoxieFoundText (bIsTranslation, true, "", bAutoDetect, sKey, sKey, "pseudobefore", sPseudoTagStack, sIdStack, sClassStack, sNormalizedWS);
					g_MoxiePseudoObserver.observe(obj, { attributes: true, attributeFilter: ["class"] });
				}
			}

			if (sAfterContent && (sAfterContent != "none") && sAfterContent.indexOf("\"") === 0)
			{
				// strip leading and trailing quotes which are included as part of the string
				sAfterContent = sAfterContent.replace(/^["']/, "");
				sAfterContent = sAfterContent.replace(/["']$/, "");

				let sNormalizedWS = sAfterContent.replace(/[\r\n\t\f\v ]+/g, " ");

				if ((sNormalizedWS !== "") && (sNormalizedWS !== " ") && MoxieIsPseudoOk(sNormalizedWS))
				{
					g_PseudoObjCount += 1;
					let sKey = "moxieclassa" + g_PseudoObjCount.toString();
					g_PseudoObjMapping[sKey] = obj;

					let sPseudoTagStack = sTagStack + "::after";
					MoxieFoundText (bIsTranslation, true, "", bAutoDetect, sKey, sKey, "pseudoafter", sPseudoTagStack, sIdStack, sClassStack, sNormalizedWS);
					g_MoxiePseudoObserver.observe(obj, { attributes: true, attributeFilter: ["class"] });
				}
			}
		}
	} catch (e) {
		console.warn("OneLinkMoxieJS error checking for pseudo-elements in", obj);
	}
} // MoxieFindPseudoElements

//-----------------------------------------------------------------------------
function MoxieFindMetaAttrs (bIsTranslation, obj, bAutoDetect, sTagStack, sIdStack, sClassStack)
//-----------------------------------------------------------------------------
{
	if (!obj) {
		return;
	}

	if (obj.nodeType == 1/*ELEMENT*/)
	{
		let NameAttrNode = obj.getAttributeNode("name");
		if (NameAttrNode != null)
		{
			let sNameNodeValue = NameAttrNode.value.toLowerCase();
			if ((sNameNodeValue == "keywords")            ||
			    (sNameNodeValue == "description")         ||
			    (sNameNodeValue == "title")               ||
			    (sNameNodeValue == "twitter:description") ||
			    (sNameNodeValue == "twitter:title")       ||
			    (sNameNodeValue == "twitter:image:alt"))
			{
				let ContentAttrNode = obj.getAttributeNode("content");
				if (ContentAttrNode)
				{

					if (ContentAttrNode.value !== ContentAttrNode.moxietx)
					{
						let sAttrTagStack = sTagStack;
						sAttrTagStack += "." + sNameNodeValue;
						MoxieFoundText (bIsTranslation, true, "", bAutoDetect, ContentAttrNode, obj, "meta", sAttrTagStack, sIdStack, sClassStack, ContentAttrNode.value);
					}
				}
			}
		}

		let PropertyAttrNode = obj.getAttributeNode("property");
		if (PropertyAttrNode != null)
		{
			let sPropertyNodeValue = PropertyAttrNode.value.toLowerCase();
			if ((sPropertyNodeValue == "og:title") || (sPropertyNodeValue == "og:site_name") || (sPropertyNodeValue == "og:description"))
			{
				let ContentAttrNode = obj.getAttributeNode("content");
				if (ContentAttrNode)
				{
					let sNormalizedWS = ContentAttrNode.value.replace(/[\r\n\t\f\v ]+/g, " ");

					if ((sNormalizedWS !== "") && (sNormalizedWS !== " ") && (ContentAttrNode.value !== ContentAttrNode.moxietx))
					{
						let sAttrTagStack = sTagStack;
						sAttrTagStack += "." + sPropertyNodeValue;
						MoxieFoundText (bIsTranslation, true, "", bAutoDetect, ContentAttrNode, obj, "meta", sAttrTagStack, sIdStack, sClassStack, sNormalizedWS);
					}
				}
			}
		}
	}

} // MoxieFindMetaAttrs

//-----------------------------------------------------------------------------
function MoxieGetTICs (obj, TicValues)
//-----------------------------------------------------------------------------
{
	if ((obj == null) || (obj == document))
	{
		return;
	}

	if ((obj.nodeType == 11) && !obj.tagName)
	{
		obj.tagName = "#shadow-root";
	}

	TicValues.tag_stack = "/" + obj.tagName + TicValues.tag_stack;

	if (obj.nodeType == 1)
	{
		let sObjId = obj.getAttribute("id");
		if (sObjId != null)
		{
			TicValues.id_stack = sObjId + TicValues.id_stack;
		}

		let sObjClass = RemoveOneLinkClasses(obj, "onelinkjshide|OneLinkOPE(?:Tx)?");
		if (sObjClass != null)
		{
			TicValues.class_stack = sObjClass + TicValues.class_stack;
		}
	}

	TicValues.id_stack = "/" + TicValues.id_stack;
	TicValues.class_stack = "/" + TicValues.class_stack;

	let oParent = null;
	if (obj.nodeType == 11)
	{
		oParent = obj.host;
	}
	else if (obj.assignedSlot)
	{
		oParent = obj.assignedSlot;
	}
	else
	{
		oParent = obj.parentNode;
	}

	if (oParent)
	{
		MoxieGetTICs(oParent, TicValues);
	}

} // MoxieGetTICs

//-----------------------------------------------------------------------------
function FindLangSelectorObj (obj, Position, iLevel, sTagStack, sIdStack, sClassStack)
//-----------------------------------------------------------------------------
{
	// walk the dom looking for the first matching TIC
	// the walk logic here is exactly the same as MoxieWalkDOM

	if (g_LangSelectorTICs.length 
		&& g_LangSelectorTICs[0].X) 
	{
		return document.querySelector(g_LangSelectorTICs[0].X);
	} else if (!obj) 
	{
		return null;
	}
	else if (!iLevel)
	{
		iLevel      = 0;
		sTagStack   = "/";
		sIdStack    = "/";
		sClassStack = "/";
	}

	if (obj.nodeType == 3/*TEXT*/)
	{
		sTagStack += "TXT";
	}
	else
	{
		sTagStack += obj.tagName;
	}
	sTagStack += "/";

	if (obj.nodeType == 1/*ELEMENT*/)
	{
		let sObjId = obj.getAttribute("id");
		if (sObjId != null) {
			sIdStack += sObjId;
		}
	}
	sIdStack += "/";

	if (obj.nodeType == 1/*ELEMENT*/)
	{
		let sObjClass = RemoveOneLinkClasses(obj, "onelinkjshide|OneLinkOPE(?:Tx)?");
		if (sObjClass != null) {
			sClassStack += sObjClass;
		}
	}
	sClassStack += "/";

	if (MatchLangSelectorTIC(sTagStack, sIdStack, sClassStack, Position, obj))
	{
		return obj;
	}

	if ((obj.nodeType == 3/*TEXT*/) || IsNonText (obj))
	{
		return null;
	}
	else if (ElementContainsBlockLevelTag (sTagStack, sIdStack, sClassStack,obj))
	{
		if (obj.shadowRoot)
		{
			if (!obj.shadowRoot.tagName)
			{
				obj.shadowRoot.tagName = "#shadow-root";
			}
			return FindLangSelectorObj (obj.shadowRoot, Position, iLevel+1, sTagStack, sIdStack, sClassStack);
		}

		try {
			const oIFrameDoc = MoxieGetIFrameDoc(obj);
			if (oIFrameDoc && oIFrameDoc.documentElement)
			{
				return FindLangSelectorObj (oIFrameDoc.documentElement, Position, iLevel+1, sTagStack, sIdStack, sClassStack);
			}
		} catch (e) {}

		// loop through children:
		for (let ii = 0; ii < obj.childNodes.length; ++ii)
		{
			let oObjFound = FindLangSelectorObj (obj.childNodes[ii], Position, iLevel+1, sTagStack, sIdStack, sClassStack);
			if (oObjFound)
			{
				return oObjFound;
			}
		}
	}
	else
	{
		try {
			const oIFrameDoc = MoxieGetIFrameDoc(obj);
			if (oIFrameDoc && oIFrameDoc.documentElement)
			{
				return FindLangSelectorObj (oIFrameDoc.documentElement, Position, iLevel+1, sTagStack, sIdStack, sClassStack);
			}
		} catch (e) {}

		if (obj.shadowRoot)
		{
			if (!obj.shadowRoot.tagName)
			{
				obj.shadowRoot.tagName = "#shadow-root";
			}
			return FindLangSelectorObj (obj.shadowRoot, Position, iLevel+1, sTagStack, sIdStack, sClassStack);
		}
	}

	return null;

} // FindLangSelectorObj

//-----------------------------------------------------------------------------
function MoxieWalkDOM (bIsTranslation, bOneLinkTx, sNoTxReason, bAutoDetect, obj, bAssetsOnly, sTranslateKey, sHost, iLevel, sTagStack, sIdStack, sClassStack)
//-----------------------------------------------------------------------------
{
	// root call: MoxieWalkDOM (document.documentElement);

	if (!obj)
	{
		return; // done with this branch of tree
	}
	else if (obj.nodeType === 1 
		&& MatchIgnoreHiddenTIC(sTagStack, sIdStack, sClassStack, obj)
		&& !g_IntersectSet.has(obj)) 
	{
		// defer walking until the element is visible
		if (!obj.moxieintersect) MoxieWalkWhenVisible(obj, sTranslateKey, sHost);
		return;
	}
	else if (!iLevel)
	{
		iLevel    = 0;
		sTagStack = "/";
		sIdStack = "/";
		sClassStack = "/";

		let oParent = null;

		if ((obj.nodeType == 2/*ATTR*/) && obj.ownerElement)
		{
			oParent = obj.ownerElement;
		}
		else if ((obj.nodeType == 11/*FRAGMENT*/) && obj.host)
		{
			oParent = obj.host;
		}
		else if (obj.assignedSlot)
		{
			oParent = obj.assignedSlot;
		}
		else
		{
			oParent = obj.parentNode;
		}

		if (oParent && (oParent !== document))
		{
			// We're not starting at the top. Start off with the correct TIC Stacks
			let TicValues = {
				"tag_stack" : "/",
				"id_stack" : "/",
				"class_stack" : "/"
			};

			MoxieGetTICs(oParent, TicValues);

			sTagStack = TicValues.tag_stack;
			sIdStack = TicValues.id_stack;
			sClassStack = TicValues.class_stack;
		}

		let NoTxReason = {"reason":""};
		bOneLinkTx = GetOneLinkTxState(obj, NoTxReason);
		sNoTxReason = NoTxReason.reason;

		bAutoDetect = GetOneLinkAutoState(obj);

		DebugLog (1, "OneLinkMoxieJS starting DOM walk at", obj, "");
	}
	else if (obj.nodeType == 1/*ELEMENT*/)
	{
		let TranslateAttribute = obj.getAttribute("translate");
		if (ClassListContains(obj, "OneLinkTx"))
		{
			bOneLinkTx = true;
			sNoTxReason = "";
		}
		else if (ClassListContains(obj, "OneLinkNoTx"))
		{
			bOneLinkTx = false;
			sNoTxReason = "(OneLinkNoTx)";
		}
		else if (ClassListContains(obj, "notranslate"))
		{
			bOneLinkTx = false;
			sNoTxReason = "(notranslate)";
		}
		else if (TranslateAttribute === "no")
		{
			bOneLinkTx = false;
			sNoTxReason = "(attribute)";
		}

		if (ClassListContains(obj, "OneLinkAuto"))
		{
			bAutoDetect = true;
		}
	}

	if (obj.nodeType == 3/*TEXT*/)
	{
		sTagStack += "TXT";
	}
	else if (obj.nodeType == 2/*ATTR*/)
	{
		if (obj.ownerElement)
		{
			sTagStack += obj.ownerElement.tagName;
		}
		else
		{
			sTagStack += "OBJ";
		}
	}
	else
	{
		sTagStack += obj.tagName;
	}
	sTagStack += "/";

	if (obj.nodeType == 1/*ELEMENT*/)
	{
		let sObjId = obj.getAttribute("id");
		if (sObjId != null) {
			sIdStack += sObjId;
		}
	}
	sIdStack += "/";

	if (obj.nodeType == 1/*ELEMENT*/)
	{
		let sObjClass = RemoveOneLinkClasses(obj, "onelinkjshide|OneLinkOPE(?:Tx)?");
		if (sObjClass != null) {
			sClassStack += sObjClass;
		}
	}
	sClassStack += "/";

	if ((sIdStack.indexOf("OPE_open") != -1) ||
		(sIdStack.indexOf("ope-plugin") != -1) ||
		(sIdStack.indexOf("openotrans") != -1) ||
		(sClassStack.indexOf("OPE_object_tag") != -1) ||
		(sTagStack.indexOf("OPE-NOTX") != -1) ||
		(sTagStack.indexOf("OPE-HOOK") != -1) ||
		(sTagStack.indexOf("OPE-SPAN") != -1))
	{
		// This is the OPE drawer or notx object. Don't go in there.
		return;
	}

	if (obj.nodeType == 3/*TEXT*/)
	{
		if (!bAssetsOnly)
		{
			let sNodeValue = obj.nodeValue;
			if (obj.moxiesrctext)
			{
				sNodeValue = obj.moxiesrctext;
			}

			if (sNodeValue !== obj.moxietx)
			{
				MoxieFoundText (bIsTranslation, bOneLinkTx, sNoTxReason, bAutoDetect, obj, obj, "normal", sTagStack, sIdStack, sClassStack, sNodeValue);
			}
		}
	}
	else if (obj.nodeType == 2/*ATTR*/)
	{
		if (!bAssetsOnly)
		{
			let sNormalizedWS = obj.value.replace(/[\r\n\t\f\v ]+/g, " ");

			if ((sNormalizedWS !== "") && (sNormalizedWS !== " ") && (obj.value !== obj.moxietx))
			{
				let sAttrTagStack = sTagStack;
				sAttrTagStack += ":" + obj.name;
				MoxieFoundText (bIsTranslation, bOneLinkTx, sNoTxReason, bAutoDetect, obj, obj.ownerElement, "attribute", sAttrTagStack, sIdStack, sClassStack, sNormalizedWS);
			}
		}
	}
	else if (IsNonText (obj))
	{
		DebugLog (2, "OneLinkMoxieJS Not translating Non-Text Element type", obj, "");
	}
	else if (ElementContainsBlockLevelTag (sTagStack, sIdStack, sClassStack,obj))
	{
		if (bOneLinkTx)
		{
			if (!bAssetsOnly)
			{
				MoxieFindAttrs(bIsTranslation, obj, bAutoDetect, sTagStack, sIdStack, sClassStack);
				MoxieFindPseudoElements(bIsTranslation, obj, bAutoDetect, sTagStack, sIdStack, sClassStack);
			}
			if (obj.nodeType == 1/*ELEMENT*/)
			{
				ProcessImageAssets(bIsTranslation, obj, sTagStack, sIdStack, sClassStack, false, bAutoDetect);
			}
		}

		if (obj.shadowRoot)
		{
			if (!obj.shadowRoot.tagName)
			{
				obj.shadowRoot.tagName = "#shadow-root";
			}
			MoxieWalkDOM (bIsTranslation, bOneLinkTx, sNoTxReason, bAutoDetect, obj.shadowRoot, bAssetsOnly, sTranslateKey, sHost, iLevel+1, sTagStack, sIdStack, sClassStack);

			if (bIsTranslation && !obj.shadowRoot.moxieobserved)
			{
				let MutationAttrs = [...g_AttrArray];
				let config = { characterData: true, attributes: true, attributeFilter: MutationAttrs, childList: true, subtree: true };
				g_MoxieObserver.observe(obj.shadowRoot, config);

				obj.shadowRoot.moxieobserved = true;
			}
		}

		if (obj.assignedNodes)
		{
			let AssignedNodes = obj.assignedNodes();

			// loop through assigned nodes (they are not child nodes)
			for (let ii = 0; ii < AssignedNodes.length; ++ii)
			{
				MoxieWalkDOM (bIsTranslation, bOneLinkTx, sNoTxReason, bAutoDetect, AssignedNodes[ii], bAssetsOnly, sTranslateKey, sHost, iLevel+1, sTagStack, sIdStack, sClassStack);
			}
		}

		try {
			const oIFrameDoc = MoxieGetIFrameDoc(obj)
			if (oIFrameDoc && !MatchIframeNoTrans(obj))
			{
				MoxieWalkDOM (bIsTranslation, bOneLinkTx, sNoTxReason, bAutoDetect, oIFrameDoc.documentElement, bAssetsOnly, sTranslateKey, sHost, iLevel+1, sTagStack, sIdStack, sClassStack);

				if (bIsTranslation && !obj.moxieobserved)
				{
					try
					{
						obj.onload =
							function()
							{
								obj.moxieobserved = false;
								if (!MatchIframeNoTrans(obj))
								{
									MoxieTranslateIFrame(sTranslateKey, sHost, obj);
								}
							};
					} catch (e) {}

					let MutationAttrs = [...g_AttrArray];
					MutationAttrs.push("href");

					let config = { characterData: true, attributes: true, attributeFilter: MutationAttrs, childList: true, subtree: true };
					g_MoxieObserver.observe(oIFrameDoc, config);
					obj.moxieobserved = true;

					if (g_bHideDynamicContent)
					{
						let oStyle = document.createElement("style");
						oStyle.innerHTML = ".onelinkjshide {opacity:0 !important;filter:alpha(opacity=0) !important;}";
						oIFrameDoc.head.appendChild(oStyle);
					}

					MoxieWatchIframeForShadowRoot(obj);
				}
			}
		} catch (e) {}

		// loop through children:
		for (let ii = 0; ii < obj.childNodes.length; ++ii)
		{
			MoxieWalkDOM (bIsTranslation, bOneLinkTx, sNoTxReason, bAutoDetect, obj.childNodes[ii], bAssetsOnly, sTranslateKey, sHost, iLevel+1, sTagStack, sIdStack, sClassStack);
		}
	}
	else
	{
		if (bOneLinkTx)
		{
			if (obj.nodeType == 1/*ELEMENT*/)
			{
				ProcessImageAssets(bIsTranslation, obj, sTagStack, sIdStack, sClassStack, true, bAutoDetect);
			}
			if (!bAssetsOnly)
			{
				MoxieFindAttrs(bIsTranslation, obj, bAutoDetect, sTagStack, sIdStack, sClassStack);
				MoxieFindInputValue(bIsTranslation, obj, bAutoDetect, sTagStack, sIdStack, sClassStack, sTranslateKey, sHost);
				MoxieFindPseudoElements(bIsTranslation, obj, bAutoDetect, sTagStack, sIdStack, sClassStack);
			}
		}

		if (!bAssetsOnly)
		{
			MoxieFoundText (bIsTranslation, bOneLinkTx, sNoTxReason, bAutoDetect, obj, obj, "innerHTML", sTagStack, sIdStack, sClassStack, obj.innerHTML);
		}

		try {
			const oIFrameDoc = MoxieGetIFrameDoc(obj);
			if (oIFrameDoc && !MatchIframeNoTrans(obj))
			{
				MoxieWalkDOM (bIsTranslation, bOneLinkTx, sNoTxReason, bAutoDetect, oIFrameDoc.documentElement, bAssetsOnly, sTranslateKey, sHost, iLevel+1, sTagStack, sIdStack, sClassStack);

				if (bIsTranslation && !obj.moxieobserved)
				{
					try
					{
						obj.onload =
							function()
							{
								obj.moxieobserved = false;
								if (!MatchIframeNoTrans(obj))
								{
									MoxieTranslateIFrame(sTranslateKey, sHost, obj);
								}
							};
					} catch (e) {}

					let MutationAttrs = [...g_AttrArray];
					MutationAttrs.push("href");

					let config = { characterData: true, attributes: true, attributeFilter: MutationAttrs, childList: true, subtree: true };
					g_MoxieObserver.observe(oIFrameDoc, config);
					obj.moxieobserved = true;

					if (g_bHideDynamicContent)
					{
						let oStyle = document.createElement("style");
						oStyle.innerHTML = ".onelinkjshide {opacity:0 !important;filter:alpha(opacity=0) !important;}";
						oIFrameDoc.head.appendChild(oStyle);
					}

					MoxieWatchIframeForShadowRoot(obj);
				}
			}
		} catch (e) {}

		if (obj.shadowRoot)
		{
			if (!obj.shadowRoot.tagName)
			{
				obj.shadowRoot.tagName = "#shadow-root";
			}
			MoxieWalkDOM (bIsTranslation, bOneLinkTx, sNoTxReason, bAutoDetect, obj.shadowRoot, bAssetsOnly, sTranslateKey, sHost, iLevel+1, sTagStack, sIdStack, sClassStack);

			if (bIsTranslation && !obj.shadowRoot.moxieobserved)
			{
				let MutationAttrs = [...g_AttrArray];
				let config = { characterData: true, attributes: true, attributeFilter: MutationAttrs, childList: true, subtree: true };
				g_MoxieObserver.observe(obj.shadowRoot, config);

				obj.shadowRoot.moxieobserved = true;
			}
		}

		if (obj.assignedNodes)
		{
			let AssignedNodes = obj.assignedNodes();

			// loop through assigned nodes (they are not child nodes)
			for (let ii = 0; ii < AssignedNodes.length; ++ii)
			{
				MoxieWalkDOM (bIsTranslation, bOneLinkTx, sNoTxReason, bAutoDetect, AssignedNodes[ii], bAssetsOnly, sTranslateKey, sHost, iLevel+1, sTagStack, sIdStack, sClassStack);
			}
		}
	}

} // MoxieWalkDOM

//-----------------------------------------------------------------------------
function HideImage(obj)
//-----------------------------------------------------------------------------
{
	try
	{
		if (obj.classList)
		{
			obj.classList.add("onelinkjsimagehide");
		}
		else
		{
			if (obj.className.indexOf("onelinkjsimagehide") == -1)
			{
				if (obj.className != "")
				{
					obj.className += " ";
				}
				obj.className += "onelinkjsimagehide";
			}
		}
	} catch (e) {}

	obj.addEventListener('load', function() {
		ClassListRemove(obj, "onelinkjsimagehide");
	});
	obj.addEventListener('error', function() {
		// I think we get the 'load' event regardless of error or not, so I don't think we need this listener
		// Better safe than sorry (for now)
		ClassListRemove(obj, "onelinkjsimagehide");
	});

} // HideImage

//-----------------------------------------------------------------------------
function MoxieParseSrcAsset(bIsTranslation, obj, sTagStack, sIdStack, sClassStack, bAutoDetectLang)
//-----------------------------------------------------------------------------
{
	if (obj.src && !obj.src.startsWith("data:image"))
	{
		if (bIsTranslation)
		{
			if ((typeof obj.moxieAsset === "undefined") || (obj.moxieAsset !== obj.src))
			{
				let sSourceRef = obj.src;
				obj.moxieAsset = obj.src;

				let bAssetRewritten = false;
				for (let ii=0; (ii < g_AssetRewrites.length) && !bAssetRewritten; ++ii)
				{
					let sFrom = g_AssetRewrites[ii].from;
					let sTo   = g_AssetRewrites[ii].to;

					// escape any special regex characters
					sFrom = sFrom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

					let RegExPat = new RegExp(sFrom, "g");

					if (RegExPat.test(obj.src))
					{
						let sTargetRef = obj.src.replace(RegExPat, sTo);
						obj.src = sTargetRef;
						obj.moxieAsset = sTargetRef;

						HideImage(obj);

						bAssetRewritten = true;

						DebugLog (2, "OneLinkMoxieJS rewrote asset for rule", g_AssetRewrites[ii], obj);
					}
				}

				if (!bAssetRewritten)
				{
					if (g_AssetTranslationArray)
					{
						let sTransRef = g_AssetTranslationArray[obj.src];
						if (sTransRef)
						{
							obj.src = sTransRef;
							obj.moxieAsset = sTransRef;

							HideImage(obj);

							DebugLog (2, "OneLinkMoxieJS translated asset", sTransRef, obj);
						}
					}
				}

				if (g_bIsOPE)
				{
					let OPEAssetObject = {
							"moxie_object" : obj,
							"rollover_object" : obj,
							"source" : sSourceRef,
							"target" : obj.src
						};
					g_OPEAssetArray.push(OPEAssetObject);

					//if (typeof HookOPE === "function")
					//{
					//	HookOPE (g_OPEAssetArray.length-1, true);
					//}
				}
			}
		}
		else
		{
			let AssetData = {};
			AssetData.asset_name = obj.src;

			let oAltAttr = obj.getAttributeNode("alt");
			if (oAltAttr)
			{
				let sNormalizedWS = oAltAttr.value.replace(/[\r\n\t\f\v ]+/g, " ");
				if ((sNormalizedWS !== "") && (sNormalizedWS !== " "))
				{
					let sAttrTagStack = sTagStack;
					sAttrTagStack += ":alt";

					if ( MatchTransAttrs(sAttrTagStack, sIdStack, sClassStack, obj, "alt", oAltAttr.value) &&
					    !MatchNoTransAttrs(sAttrTagStack, sIdStack, sClassStack, obj, "alt", oAltAttr.value))
					{
						let JliffArray        = [];
						let MigrateJliffArray = [];
						let DomObjs           = {};
						let TextForHash       = {"value":""};
						let TagCount          = {"value":0};
						let MigrateTagCount   = {"value":0};

						let bAutoDetect = bAutoDetectLang || MatchAutoDetectTIC(sAttrTagStack, sIdStack, sClassStack, obj);

						let bHadText = MoxieTokenize(sNormalizedWS, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sAttrTagStack, sIdStack, sClassStack, obj, bAutoDetect);

						// Did we actually have any text for translation
						if (bHadText)
						{
							let sTextHash = FNV1aHash(TextForHash.value);
							AssetData.alt_block_hash = sTextHash;
						}
					}
				}
			}

			g_TxRequest.assets.push (AssetData);
		}
	}
} // MoxieParseSrcAsset

//-----------------------------------------------------------------------------
function MoxieParseSrcSetAsset(bIsTranslation, obj, sTagStack, sIdStack, sClassStack, bAutoDetectLang)
//-----------------------------------------------------------------------------
{
	if (obj.srcset)
	{
		let bHadPretranslations = false;
		let sTransSrcSet        = "";

		let ImgArray = obj.srcset.split(/,/g);
		for (let i = 0; i < ImgArray.length; i++)
		{
			let sImage = ImgArray[i];
			sImage = sImage.trim();

			let sSizeHint = "";
			let iSpace    = sImage.indexOf(" ");
			if (iSpace !== -1)
			{
				// remove size hint
				sSizeHint = sImage.substring(iSpace);
				sImage    = sImage.substring(0, iSpace);
			}

			try
			{
				// convert relative URLs to full URL

				if (!g_HttpRegex.test(sImage))
				{
					let FullUrlImage = new URL(sImage, document.location.href);
					sImage = FullUrlImage.href;
				}
			}
			catch (e) {}

			if (bIsTranslation)
			{
				if ((typeof obj.moxieAssetSet === "undefined") || (obj.moxieAssetSet !== obj.srcset))
				{
					let sTargetRef = sImage;

					let bAssetRewritten = false;
					for (let ii=0; (ii < g_AssetRewrites.length) && !bAssetRewritten; ++ii)
					{
						let sFrom = g_AssetRewrites[ii].from;
						let sTo   = g_AssetRewrites[ii].to;

						// escape any special regex characters
						sFrom = sFrom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

						let RegExPat = new RegExp(sFrom, "g");

						if (RegExPat.test(sImage))
						{
							sTargetRef = sImage.replace(RegExPat, sTo);
							if (sTransSrcSet !== "")
							{
								sTransSrcSet += ",";
							}
							sTransSrcSet += sTargetRef;
							sTransSrcSet += sSizeHint;

							let TransImgSet = obj.transimageset;
							if (typeof TransImgSet !== "undefined")
							{
								let iImgIndex = TransImgSet.indexOf(sTargetRef);
								if (iImgIndex === -1)
								{
									TransImgSet.push(sTargetRef);
								}
							}
							else
							{
								TransImgSet = [];
								TransImgSet.push(sTargetRef);
							}
							obj.transimageset = TransImgSet;

							bAssetRewritten = true;
							bHadPretranslations = true;

							DebugLog (2, "OneLinkMoxieJS rewrote srcset asset for rule", g_AssetRewrites[ii], obj);
						}
					}

					let bIsTranslatedImg = false;

					if (!bAssetRewritten)
					{
						let sTransAsset       = sImage;
						if (g_AssetTranslationArray)
						{
							let sTransRef = g_AssetTranslationArray[sImage];
							if (sTransRef)
							{
								sTransAsset = sTransRef;
								sTargetRef  = sTransRef;

								let TransImgSet = obj.transimageset;
								if (typeof TransImgSet !== "undefined")
								{
									let iImgIndex = TransImgSet.indexOf(sTransAsset);
									if (iImgIndex === -1)
									{
										TransImgSet.push(sTransAsset);
									}
								}
								else
								{
									TransImgSet = [];
									TransImgSet.push(sTransAsset);
								}
								obj.transimageset = TransImgSet;

								bHadPretranslations = true;

								DebugLog (2, "OneLinkMoxieJS translated srcset asset", sImage, obj);
							}
						}
						sTransAsset += sSizeHint;

						if (sTransSrcSet !== "")
						{
							sTransSrcSet += ",";
						}
						sTransSrcSet += sTransAsset;
					}

					if (g_bIsOPE && !bIsTranslatedImg)
					{
						let OPEAssetObject = {
								"moxie_object" : obj,
								"rollover_object" : obj,
								"source" : sImage,
								"target" : sTargetRef
							};
						g_OPEAssetArray.push(OPEAssetObject);

						//if (typeof HookOPE === "function")
						//{
						//	HookOPE (g_OPEAssetArray.length-1, true);
						//}
					}
				}
			}
			else
			{
				let AssetData = {};
				AssetData.asset_name = sImage;

				let oAltAttr = obj.getAttributeNode("alt");
				if (oAltAttr)
				{
					let sNormalizedWS = oAltAttr.value.replace(/[\r\n\t\f\v ]+/g, " ");
					if ((sNormalizedWS !== "") && (sNormalizedWS !== " "))
					{
						let sAttrTagStack = sTagStack;
						sAttrTagStack += ":alt";

						if ( MatchTransAttrs(sAttrTagStack, sIdStack, sClassStack, obj, "alt", oAltAttr.value) &&
						    !MatchNoTransAttrs(sAttrTagStack, sIdStack, sClassStack, obj, "alt", oAltAttr.value))
						{
							let JliffArray        = [];
							let MigrateJliffArray = [];
							let DomObjs           = {};
							let TextForHash       = {"value":""};
							let TagCount          = {"value":0};
							let MigrateTagCount   = {"value":0};

							let bAutoDetect = bAutoDetectLang || MatchAutoDetectTIC(sAttrTagStack, sIdStack, sClassStack, obj);

							let bHadText = MoxieTokenize(sNormalizedWS, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sAttrTagStack, sIdStack, sClassStack, obj, bAutoDetect);

							// Did we actually have any text for translation
							if (bHadText)
							{
								let sTextHash = FNV1aHash(TextForHash.value);
								AssetData.alt_block_hash = sTextHash;
							}
						}
					}
				}

				g_TxRequest.assets.push (AssetData);
			}
		}

		if (bIsTranslation)
		{
			if (bHadPretranslations)
			{
				obj.srcset = sTransSrcSet;
				obj.moxieAssetSet = sTransSrcSet;
			}
			else
			{
				obj.moxieAssetSet = obj.srcset;
			}
		}
	}
} // MoxieParseSrcSetAsset

//-----------------------------------------------------------------------------
function MoxieCheckIfImage (sLinkRef)
//-----------------------------------------------------------------------------
{
	let sImageName = "";
	let sImgType   = "";
	let sExtension = sLinkRef;

	let iHookIndex = sExtension.indexOf("?");
	if (iHookIndex != -1)
	{
		sExtension = sExtension.substring(0, iHookIndex);
	}

	let iSpaceIndex = sExtension.indexOf(" ");
	if (iSpaceIndex != -1)
	{
		sExtension = sExtension.substring(0, iSpaceIndex);
	}

	let iLastSlash = sExtension.lastIndexOf("/");
	if (iLastSlash != -1)
	{
		sExtension = sExtension.substring(iLastSlash);
	}

	let iPeriod = sExtension.lastIndexOf(".");
	if (iPeriod != -1)
	{
		sImgType = sExtension.substring(iPeriod + 1);
	}

	if (sImgType.match(/jpeg$/i) || sImgType.match(/jpg$/i) || sImgType.match(/jpe$/i) ||
		sImgType.match(/gif$/i)  || sImgType.match(/bmp$/i) || sImgType.match(/png$/i) ||
		sImgType.match(/ico$/i))
	{
		let iSpaceIndex = sLinkRef.indexOf(" ");
		if (iSpaceIndex != -1)
		{
			sLinkRef = sLinkRef.substring(0, iSpaceIndex);
		}
		sImageName = sLinkRef;
	}

	return sImageName;

} // MoxieCheckIfImage

//-----------------------------------------------------------------------------
function ProcessImageAssets(bIsTranslation, obj, sTagStack, sIdStack, sClassStack, bRecursive, bAutoDetectLang)
//-----------------------------------------------------------------------------
{
	// For Translation we are not capturing assets, we are applying any image translations from the pretranslate array
	// Assets never go through xapis /Translate
	// For Spider we are capturing the assets URLs

	if (!g_bEnableImages)
	{
		return;
	}

	let NoImageTransRule = {};
	if ( MatchNoImageTransTIC(sTagStack, sIdStack, sClassStack, obj, NoImageTransRule) &&
	    !MatchImageTransTIC(sTagStack, sIdStack, sClassStack, obj))
	{
		DebugLog (2, "OneLinkMoxieJS TIC matches No Image Translate pattern. Not caputuring images.", "", "");
		return;
	}

	try
	{
		let MutationAttrs = [];

		let sRef = "";

		let style = obj.currentStyle || window.getComputedStyle(obj);

		if (style && style.backgroundImage && (style.backgroundImage.startsWith("url")))
		{
			sRef = style.backgroundImage.slice(4, -1).replace(/["']/g, "");
			MutationAttrs.push("style");
		}
		else if (obj.style && obj.style.backgroundImage && (obj.style.backgroundImage.startsWith("url")))
		{
			sRef = obj.style.backgroundImage.slice(4, -1).replace(/["']/g, "");
			MutationAttrs.push("style");
		}

		if ((sRef.trim() != "") && (sRef != "about:blank"))
		{
			if (bIsTranslation)
			{
				if ((typeof obj.moxieAssetBg === "undefined") || (obj.moxieAssetBg !== sRef))
				{
					obj.moxieAssetBg = sRef;

					let bAssetRewritten = false;
					for (let ii=0; (ii < g_AssetRewrites.length) && !bAssetRewritten; ++ii)
					{
						let sFrom = g_AssetRewrites[ii].from;
						let sTo   = g_AssetRewrites[ii].to;

						// escape any special regex characters
						sFrom = sFrom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

						let RegExPat = new RegExp(sFrom, "g");

						if (RegExPat.test(sRef))
						{
							let sTargetRef = sRef.replace(RegExPat, sTo);
							obj.style.backgroundImage = 'url(' + sTargetRef + ')';
							obj.moxieAssetBg = sTargetRef;

							bAssetRewritten = true;
							DebugLog (2, "OneLinkMoxieJS rewrote asset for rule", g_AssetRewrites[ii], obj);
						}
					}

					if (!bAssetRewritten)
					{
						if (g_AssetTranslationArray)
						{
							let sTransRef = g_AssetTranslationArray[sRef];
							if (sTransRef)
							{
								obj.style.backgroundImage = 'url(' + sTransRef + ')';
								obj.moxieAssetBg = sTransRef;
								DebugLog (2, "OneLinkMoxieJS translated asset", sTransRef, obj);
							}
						}
					}

					if (g_bIsOPE)
					{
						let OPEAssetObject = {
							"moxie_object" : obj,
							"rollover_object" : obj,
							"source" : sRef,
							"target" : obj.moxieAssetBg
						};
						g_OPEAssetArray.push(OPEAssetObject);

						//if (typeof HookOPE === "function")
						//{
						//	HookOPE (g_OPEAssetArray.length-1, true);
						//}
					}
				}
			}
			else
			{
				let AssetData = {};
				AssetData.asset_name = sRef;

				let oAltAttr = obj.getAttributeNode("alt");
				if (oAltAttr)
				{
					let sNormalizedWS = oAltAttr.value.replace(/[\r\n\t\f\v ]+/g, " ");
					if ((sNormalizedWS !== "") && (sNormalizedWS !== " "))
					{
						let sAttrTagStack = sTagStack;
						sAttrTagStack += ":alt";

						if ( MatchTransAttrs(sAttrTagStack, sIdStack, sClassStack, obj, "alt", oAltAttr.value) &&
						    !MatchNoTransAttrs(sAttrTagStack, sIdStack, sClassStack, obj, "alt", oAltAttr.value))
						{
							let JliffArray        = [];
							let MigrateJliffArray = [];
							let DomObjs           = {};
							let TextForHash       = {"value":""};
							let TagCount          = {"value":0};
							let MigrateTagCount   = {"value":0};

							let bAutoDetect = bAutoDetectLang || MatchAutoDetectTIC(sAttrTagStack, sIdStack, sClassStack, obj);

							let bHadText = MoxieTokenize(sNormalizedWS, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sAttrTagStack, sIdStack, sClassStack, obj, bAutoDetect);

							// Did we actually have any text for translation
							if (bHadText)
							{
								let sTextHash = FNV1aHash(TextForHash.value);
								AssetData.alt_block_hash = sTextHash;
							}
						}
					}
				}

				g_TxRequest.assets.push (AssetData);
			}
		}

		if (obj.tagName == "IMG")
		{
			MoxieParseSrcAsset(bIsTranslation, obj, sTagStack, sIdStack, sClassStack, bAutoDetectLang);

			MoxieParseSrcSetAsset(bIsTranslation, obj, sTagStack, sIdStack, sClassStack, bAutoDetectLang);

			MutationAttrs.push("src");
			MutationAttrs.push("srcset");
		}
		else if (obj.tagName == "EMBED")
		{
			MoxieParseSrcAsset(bIsTranslation, obj, sTagStack, sIdStack, sClassStack, bAutoDetectLang);

			MutationAttrs.push("src");
		}
		else if ((obj.tagName == "SOURCE") && obj.srcset)
		{
			MoxieParseSrcSetAsset(bIsTranslation, obj, sTagStack, sIdStack, sClassStack, bAutoDetectLang);

			MutationAttrs.push("srcset");
		}

		if (g_bEnableImages && bIsTranslation && !obj.moxieassetobserved && (MutationAttrs.length > 0))
		{
			obj.moxieassetobserved = true;

			let AttrConfig = { characterData: false, attributes: true, attributeFilter: MutationAttrs, childList: false, subtree: false };
			g_MoxieAssetObserver.observe(obj, AttrConfig);
		}

		if (!bIsTranslation)
		{
			// Find other attributes that refer to images

			for (let i = 0; i < obj.attributes.length; i++)
			{
				let oAttrNode = obj.attributes[i];
				if (oAttrNode.specified)
				{
					if (!((obj.tagName == "IMG") && ((oAttrNode.name == "src") || (oAttrNode.name == "srcset"))) &&
						!((obj.tagName == "EMBED") && (oAttrNode.name == "src")) &&
						!((obj.tagName == "SOURCE") && (oAttrNode.name == "srcset")) &&
						(oAttrNode.name != "style"))
					{
						let sImageName = MoxieCheckIfImage(oAttrNode.value);
						if (sImageName != "")
						{
							let AssetData = {};
							AssetData.asset_name = sImageName;

							let oAltAttr = obj.getAttributeNode("alt");
							if (oAltAttr)
							{
								let sNormalizedWS = oAltAttr.value.replace(/[\r\n\t\f\v ]+/g, " ");
								if ((sNormalizedWS !== "") && (sNormalizedWS !== " "))
								{
									let sAttrTagStack = sTagStack;
									sAttrTagStack += ":alt";

									if ( MatchTransAttrs(sAttrTagStack, sIdStack, sClassStack, obj, "alt", oAltAttr.value) &&
									    !MatchNoTransAttrs(sAttrTagStack, sIdStack, sClassStack, obj, "alt", oAltAttr.value))
									{
										let JliffArray        = [];
										let MigrateJliffArray = [];
										let DomObjs           = {};
										let TextForHash       = {"value":""};
										let TagCount          = {"value":0};
										let MigrateTagCount   = {"value":0};

										let bAutoDetect = bAutoDetectLang || MatchAutoDetectTIC(sAttrTagStack, sIdStack, sClassStack, obj);

										let bHadText = MoxieTokenize(sNormalizedWS, DomObjs, TextForHash, JliffArray, MigrateJliffArray, TagCount, MigrateTagCount, sAttrTagStack, sIdStack, sClassStack, obj, bAutoDetect);

										// Did we actually have any text for translation
										if (bHadText)
										{
											let sTextHash = FNV1aHash(TextForHash.value);
											AssetData.alt_block_hash = sTextHash;
										}
									}
								}
							}
							g_TxRequest.assets.push (AssetData);
						}
					}
				}
			}
		}
	}
	catch (e) {
		console.error("OneLinkMoxieJS error processing image assets for", obj, e);
	}

	if (bRecursive)
	{
		for (let i = 0; i < obj.childNodes.length; i++)
		{
			let childObj = obj.childNodes[i];
			if (childObj.nodeType == 1)
			{
				ProcessImageAssets(bIsTranslation, childObj, sTagStack, sIdStack, sClassStack, bRecursive, bAutoDetectLang);
			}
		}
	}
} //  ProcessImageAssets

//-----------------------------------------------------------------------------
function MoxieReplaceLocation (obj, TargetElements, DomObjs)
//-----------------------------------------------------------------------------
{
	// Lists of text nodes on elements for re-use
	// {
	//   "1": [textnode1, textnode2, ...],
	//   "2": [textnode1, textnode2, ...],
	//   "3": [textnode1, textnode2, ...]
	// }
	let ObjTextNodeLists = {};

	let iTextNodeId = 1;

	// keep track of active element to reset
	let activeElement = document.activeElement;

	if ((obj.nodeType == 1) || (obj.nodeType == 11))
	{
		// Remove all children. We will reconstruct.

		// Track Text Nodes for re-use
		let TextNodeList = [];

		while (obj.firstChild)
		{
			if ((obj.firstChild.nodeType == 3/*TEXT*/) && (obj.firstChild.moxiephtag !== "1"))
			{
				TextNodeList.push(obj.firstChild);
			}
			obj.removeChild(obj.firstChild);
		}

		let sTextNodeId = iTextNodeId.toString();
		obj.moxietxtnodesid = sTextNodeId;
		ObjTextNodeLists[sTextNodeId] = TextNodeList;

		iTextNodeId++;
	}

	let bLastItemWasText = false;
	let LastTextItem     = null;

	let oCurrentParent = obj;

	let TextObjList = [];

	for (let ii=0; ii < TargetElements.length; ++ii)
	{
		let Item = TargetElements[ii];

		let bIsItemText = false;
		if (typeof Item.text !== "undefined")
		{
			bIsItemText = true;
		} else if (Item.kind && (Item.kind == "ph"))
		{
			let sKey    = Item.kind + ":" + Item.id;
			let DomItem = DomObjs[sKey];
			if (typeof DomItem === "string")
			{
				bIsItemText = true;
			}
		}

		if (bIsItemText)
		{
			// it's one of
			//   "text" jliff object
			//   "ph" for a token (subType=="mx:int" or subType=="mx:token")
			//   "ph" for already translated text

			let sText = "";

			if ((typeof Item.text !== "undefined"))
			{
				sText = Item.text;
			}
			else
			{
				let sKey = Item.kind + ":" + Item.id;
				let sTokenVal = DomObjs[sKey];
				if (typeof sTokenVal !== "undefined")
				{
					sText = sTokenVal;
					DebugLog (3, "OneLinkMoxieJS putting back 'ph' token", sTokenVal, "");
				}
				else
				{
					console.error ("OneLinkMoxieJS NOT REPLACING SEGMENT: CANNOT FIND NUMBER PLACEHOLDER", Item);
					continue;
				}
			}

			if (obj.nodeType == 2/*ATTR*/)
			{
				if ((obj.ownerElement.tagName === "INPUT" || obj.ownerElement.tagName === "TEXTAREA") && obj.name === "value") 
				{
					if (TextObjList.indexOf(obj.ownerElement) === -1)
					{
						TextObjList.push(obj.ownerElement);
					}

					if (bLastItemWasText)
					{
						// translation was of type inputvalue, set value properties on parent
						obj.ownerElement.moxietx += sText;
						obj.ownerElement.value   += sText;
					}
					else
					{
						bLastItemWasText = true;

						// translation was of type inputvalue, set value properties on parent
						obj.ownerElement.mxorigtx = obj.ownerElement.value;
						obj.ownerElement.moxietx = sText;
						obj.ownerElement.value   = sText;
					}
				}
				else
				{
					if (TextObjList.indexOf(obj) === -1)
					{
						TextObjList.push(obj);
					}

					if (bLastItemWasText)
					{
						obj.moxietx += sText;
						obj.value   += sText;
					}
					else
					{
						bLastItemWasText = true;

						obj.mxorigtx = obj.value.replace(/[\r\n\t\f\v ]+/g, " ");
						obj.moxietx  = sText;
						obj.value    = sText;
					}
				}
			}
			else
			{
				if (bLastItemWasText)
				{
					if (LastTextItem)
					{
						LastTextItem.moxietx += sText;
						if (g_bHideDynamicContent && (g_sTxMethod != "AMI") && (g_sTxMethod != "STATSONLY") && !g_bIsGLNOW)
						{
							LastTextItem.moxiesrctext += sText;
						}
						LastTextItem.nodeValue += sText;

						if (TextObjList.indexOf(LastTextItem) === -1)
						{
							TextObjList.push(LastTextItem);
						}
					}
				}
				else
				{
					bLastItemWasText = true;
					if (oCurrentParent.nodeType == 3/*TEXT*/)
					{
						oCurrentParent.moxietx = sText;
						if (g_bHideDynamicContent && (g_sTxMethod != "AMI") && (g_sTxMethod != "STATSONLY") && !g_bIsGLNOW)
						{
							oCurrentParent.moxiesrctext = sText;
						}
						LastTextItem = oCurrentParent;
						LastTextItem.mxorigtx = MoxieNormalizeNodeValue(LastTextItem).nodeValue;
						if (TextObjList.indexOf(LastTextItem) === -1)
						{
							TextObjList.push(LastTextItem);
						}					
						oCurrentParent.nodeValue = sText;						
					}
					else
					{
						let oTextNode = null;
						let sTextNodeId = oCurrentParent.moxietxtnodesid;
						if (sTextNodeId)
						{
							let TextNodeList = ObjTextNodeLists[sTextNodeId];
							if (TextNodeList && (TextNodeList.length > 0))
							{
								oTextNode = TextNodeList[0];
								TextNodeList.shift();
							}
						}

						if (oTextNode == null)
						{
							// Should only get here under special use cases
							oTextNode = document.createTextNode("");
						}

						oTextNode.moxietx = sText;
						LastTextItem = oTextNode;
						LastTextItem.mxorigtx = MoxieNormalizeNodeValue(LastTextItem).nodeValue;
						if (g_bHideDynamicContent && (g_sTxMethod != "AMI") && (g_sTxMethod != "STATSONLY") && !g_bIsGLNOW)
						{
							oTextNode.moxiesrctext = sText;
						}
						if (TextObjList.indexOf(LastTextItem) === -1)
						{
							TextObjList.push(LastTextItem);
						}					

						oTextNode.nodeValue = sText;
						oCurrentParent.appendChild(oTextNode);
					}
				}
			}
		}
		else if (Item.kind)
		{
			bLastItemWasText = false;

			let sKind = Item.kind;

			if (sKind == "ec")
			{
				oCurrentParent = oCurrentParent.parentNode;
			}
			else
			{
				let sKey = "";
				if (Item.id)
				{
					sKey = sKind + ":" + Item.id;
				}

				let DomObj = DomObjs[sKey];
				if (DomObj)
				{
					if (sKind == "ph")
					{
						oCurrentParent.appendChild(DomObj);
					}
					else if (sKind == "sc")
					{
						// Remove all children. We will reconstruct.

						// Track Text Nodes for re-use
						let TextNodeList = [];

						while (DomObj.firstChild)
						{
							if ((DomObj.firstChild.nodeType == 3/*TEXT*/) && (DomObj.firstChild.moxiephtag !== "1"))
							{
								TextNodeList.push(DomObj.firstChild);
							}
							DomObj.removeChild(DomObj.firstChild);
						}

						let sTextNodeId = iTextNodeId.toString();

						DomObj.moxietxtnodesid        = sTextNodeId;
						ObjTextNodeLists[sTextNodeId] = TextNodeList;

						iTextNodeId++;

						oCurrentParent.appendChild(DomObj);
						oCurrentParent = DomObj;
					}
				}
				else
				{
					console.error ("OneLinkMoxieJS NOT REPLACING SEGMENT: CANNOT FIND MAP KEY:", sKey, "IN:", JSON.stringify(Item));
					if (g_bKeepActiveElement && activeElement && (document.activeElement !== activeElement)) activeElement.focus();
					return;
				}
			}
		}
		else
		{
			console.error ("OneLinkMoxieJS NOT REPLACING SEGMENT: NO 'kind' SPECIFIED IN", JSON.stringify(Item));
			if (g_bKeepActiveElement && activeElement && (document.activeElement !== activeElement)) activeElement.focus();
			return;
		}
	}

	for (let i=0; i<TextObjList.length; i++)
	{
		let oTextObj = TextObjList[i];
		let iTransIndex = g_TranslatedText.indexOf(oTextObj.moxietx);
		if (oTextObj.mxorigtx !== oTextObj.moxietx && iTransIndex === -1)
		{
			g_TranslatedText.push(oTextObj.moxietx);
		}
	}

	if (g_bKeepActiveElement && activeElement && (document.activeElement !== activeElement)) activeElement.focus();

} // MoxieReplaceLocation

//-----------------------------------------------------------------------------
function MoxieReplacePseudoElement (sPseudoKey, TargetElements, DomObjs)
//-----------------------------------------------------------------------------
{
	let obj = g_PseudoObjMapping[sPseudoKey];

	let sTranslationText = "";

	if (typeof obj !== "undefined")
	{
		for (let ii=0; ii < TargetElements.length; ++ii)
		{
			let Item = TargetElements[ii];
			if ((typeof Item.text !== "undefined") || (Item.kind && (Item.kind == "ph") &&
				((Item.subtype && ((Item.subtype == "mx:int") || (Item.subtype == "mx:token"))) ||
				 (Item.subType && ((Item.subType == "mx:int") || (Item.subType == "mx:token"))))))
			{
				// it's a "text" jliff object or a "ph" placeholder for a token

				if ((typeof Item.text !== "undefined"))
				{
					sTranslationText += Item.text;
				}
				else
				{
					let sKey = Item.kind + ":" + Item.id;
					let sTokenVal = DomObjs[sKey];
					if (typeof sTokenVal !== "undefined")
					{
						sTranslationText += sTokenVal;
						DebugLog (3, "OneLinkMoxieJS putting back 'ph' token for pseudo element", sTokenVal, "");
					}
					else
					{
						console.error ("OneLinkMoxieJS NOT REPLACING TOKEN: CANNOT FIND PLACEHOLDER KEY:", sKey, "IN:", JSON.stringify(Item));
						continue;
					}
				}
			}
		}

		if (sTranslationText !== "")
		{
			let sInnerStyle = "";

			let sKeyIndex = sPseudoKey.indexOf("moxieclassb");
			if (sKeyIndex !== -1)
			{
				sInnerStyle = '::before { content: "' + sTranslationText + '" !important; }';
			} else
			{
				sInnerStyle = '::after { content: "' + sTranslationText + '" !important; }';
			}

			let sPseudoClass      = "";
			let sPseudoClassValue = g_PseudoTransMapping[sInnerStyle];
			if (typeof sPseudoClassValue !== "undefined")
			{
				if (ClassListContains(obj, sPseudoClassValue))
				{
					return;
				}

				sPseudoClass = sPseudoClassValue;
			} else
			{
				sPseudoClass = sPseudoKey;

				g_PseudoTransMapping[sInnerStyle] = sPseudoKey;

				let oStyle = document.createElement("style");
				oStyle.innerHTML = "." + sPseudoKey + sInnerStyle;
				document.head.appendChild(oStyle);
			}

			DisablePseudoMutationObserver();
			let sClass = obj.getAttribute("class");
			if (sClass)
			{
				obj.setAttribute("class", (sClass + " " + sPseudoClass));
			} else
			{
				obj.setAttribute("class", sPseudoClass);
			}

			if (sKeyIndex !== -1)
			{
				obj.moxiebeforeclass = sPseudoClass;
			} else 
			{
				obj.moxieafterclass = sPseudoClass;
			}

			let iTxtIndex = g_TranslatedText.indexOf(sTranslationText);
			if (iTxtIndex === -1)
			{
				g_TranslatedText.push(sTranslationText);
			}
		}
	}

	return sTranslationText;

} // MoxieReplacePseudoElement

//-----------------------------------------------------------------------------
function MoxieApplyTranslation (LocationArray, DomObjsArray, SourceArray, TargetArray, iOPEArrayIndex, bIgnoreOPE)
//-----------------------------------------------------------------------------
{
	// LocationArray[]  :: simple array of locations where the target text needs to be put back into
	// DomObjsArray[]   :: array of objects found within a Text Block (inline objects and text nodes)
	// TargetArray[]    :: simple array of strings to be put back into the DOM -or- an error message

	if (LocationArray.length != TargetArray.length)
	{
		console.error ("OneLinkMoxieJS location and target arrays have different lengths: LocationArray=", LocationArray.length, "TargetArray=", TargetArray.length);
		return;
	}

	if (SourceArray.length != TargetArray.length)
	{
		console.error ("OneLinkMoxieJS source and target arrays have different lengths: SourceArray=", SourceArray.length, "TargetArray=", TargetArray.length);
		return;
	}

	DebugLog (1, "OneLinkMoxieJS start to apply translations", "", "");

	for (let ii=0, iOPEIdx=iOPEArrayIndex; ii < LocationArray.length; ++ii, ++iOPEIdx)
	{
		let obj = LocationArray[ii];

		if (g_TranslateObjQueue.indexOf(obj) !== -1)
		{
			// This object is on the Queue for being translated
			// That means a DOM change occurred for this block while we were out for this translation
			// Throw this one away and let the Queue handle doing the translation again on the new block
			continue;
		}

		let TranslatedSegment = TargetArray[ii];
		let DomObjs           = DomObjsArray[ii];
		let TargetElements    = TranslatedSegment.target;

		if (TargetElements)
		{
			if (!g_bIsOPE && !g_bIsGLNOW)
			{
				let sBlockHash = SourceArray[ii].block_hash;
				if (sBlockHash)
				{
					g_TargetCache[sBlockHash] = TargetElements;
				}
			}

			try {
				let SourceElements = SourceArray[ii].source;
				if (typeof obj !== "object")
				{
					let sTargetTrans = MoxieReplacePseudoElement(obj, TargetElements, DomObjs);

					if (g_bIsOPE && !bIgnoreOPE)
					{
						let oOPEObject = g_OPEArray[iOPEIdx];
						if (oOPEObject != null)
						{
							oOPEObject.target          = TargetElements;
							oOPEObject.original_target = sTargetTrans;
							if (typeof HookOPE === "function")
							{
								HookOPE (iOPEIdx, false);
							}
						}
					}
				} else
				{
					MoxieReplaceLocation(obj, TargetElements, DomObjs);

					if (g_bIsOPE && !bIgnoreOPE)
					{
						let oOPEObject = g_OPEArray[iOPEIdx];
						if (oOPEObject != null)
						{
							oOPEObject.target = TargetElements;
							if (typeof HookOPE === "function")
							{
								HookOPE (iOPEIdx, false);
							}
						}
					}
				}
			} catch (e) {
				console.error("OneLinkMoxieJS error applying translations to", obj, e);
			}
		}
		else
		{
			console.error ("OneLinkMoxieJS NO TARGET FOUND FOR SEGMENT", JSON.stringify(TargetElements));
		}
	}

	DebugLog (1, "OneLinkMoxieJS apply translations done", "", "");

} // MoxieApplyTranslation

//-----------------------------------------------------------------------------
function MoxieProcessAjax (oXHR, LocationArray, DomObjsArray, SourceArray, iOPEArrayIndex, ApiStat, bIgnoreOPE)
//-----------------------------------------------------------------------------
{
	if ((oXHR.status < 200) || (oXHR.status > 299))
	{
		console.error ("OneLinkMoxieJS error from XAPIS HTTP-" + oXHR.status, oXHR.statusText, oXHR.responseText);
		return;
	}

	let oJSON = null;
	try
	{
		oJSON = JSON.parse(oXHR.responseText);
	}
	catch (e)
	{
		console.error ("OneLinkMoxieJS INVALID JSON FROM XAPIS", oXHR.responseText, e);
		return;
	}

	MoxieApplyTranslation (LocationArray, DomObjsArray, SourceArray, oJSON.text, iOPEArrayIndex, bIgnoreOPE);

} // MoxieProcessAjax

//-----------------------------------------------------------------------------
function MoxieProcessAmi (oXHR, sHost, sTranslateKey, SourceJliff)
//-----------------------------------------------------------------------------
{
	let oJSON = null;
	try
	{
		oJSON = JSON.parse(oXHR.responseText);
		let AmiArray = oJSON.ami;
		if (AmiArray)
		{
			let TextArray = [];

			for (let ii=0; ii < AmiArray.length; ++ii)
			{
				let sAmiHash = AmiArray[ii];

				let bFound = false;

				// Get object with sAmiHash from SourceJliff
				for (let jj=0; (jj < SourceJliff.length) && !bFound; ++jj)
				{
					let TextBlock  = SourceJliff[jj];
					let sBlockHash = TextBlock.block_hash;
					if (sBlockHash == sAmiHash)
					{
						let sTagStack   = TextBlock.tag_stack;
						let sIdStack    = TextBlock.id_stack;
						let sClassStack = TextBlock.class_stack;
						if (!MatchNoAmiTIC(sTagStack, sIdStack, sClassStack))
						{
							TextArray.push(TextBlock);
						}
						bFound = true;
					}
				}
			}

			if (TextArray.length > 0)
			{
				let sContextUrl = GetReferrer();
				let sUrlPath    = GetPath();
				let sOriginUrl  = document.location.origin + sUrlPath;

				let ContentPageTx = {
							"job_id"        : oJSON.ami_job_id,
							"backfill"      : g_bContentBackfill,
							"moxie_version" : g_MoxieVersion,
							"text"          : TextArray,
							"context_url"   : sContextUrl,
							"url"           : sOriginUrl,
							"status"        : "200"
							};

				DebugLog (3, "OneLinkMoxieJS sending AMI content to /ContentPage", ContentPageTx, "");

				k$jax ({
					url: sHost + "xapis/ContentPage/" + sTranslateKey, // note: no ?user_key=...
					method: "POST",
					data: ContentPageTx,
					contentType: "application/json",
					success: function (oXHR, oParms) {
						DebugLog (1, "OneLinkMoxieJS AMI /ContentPage success", "", "");
					},
					failure: function (oXHR, oParms) {
						DebugLog (1, "OneLinkMoxieJS error from /ContentPage HTTP-" + oXHR.status, oXHR.statusText, oXHR.responseText);
					},
					retry_status: [0],
					retry_count: 1
				});
			}
		}
	}
	catch (e)
	{
		console.error ("OneLinkMoxieJS error processing AMI", oXHR.responseText, e);
	}
} // MoxieProcessAmi

//-----------------------------------------------------------------------------
function MoxieSendStats (sTranslateKey, sHost, sLocation)
//-----------------------------------------------------------------------------
{
	if (g_bSendStats)
	{
		// Make sure we have a token to send stats
		if (MoxieXapisShouldRefreshToken()) 
		{
			MoxieXapisToken(sHost, function() 
			{
				MoxieSendStats(sTranslateKey, sHost, sLocation);
			});
			return;
		}
	
		try
		{
			let sUrlForHash = sLocation.toLowerCase();

			if (g_bIsMultiDomain)
			{
				sUrlForHash = "//" + document.location.hostname + sUrlForHash;
			}

			let sUrlHash = FNV1aHash(sUrlForHash);

			if (g_bIsGLNOW || g_StatsLocationsSent.indexOf(sUrlHash) === -1)
			{
				// stats for this url hasn't been sent yet

				g_GlobalStats.page_blocks_total    = g_BlockHashArray.length;
				g_GlobalStats.pretrans_blocks_used = g_PreTransBlocksUsed.length;

				if (g_TranslationArray)
				{
					try {
						g_GlobalStats.pretrans_blocks_total = Object.keys(g_TranslationArray).length;
					} catch (e) {}
				}

				let TranslateStats = {
						"usage"        : g_BlockHashArray,
						"global_stats" : g_GlobalStats,
						"api_stats"    : g_ApiStats
				};

				DebugLog (3, "OneLinkMoxieJS sending content to /TranslateStats", TranslateStats, "");

				k$jax ({
					url: sHost + "xapis/TranslateStats/" + sTranslateKey + "/" + sUrlHash, // note: no ?user_key=...
					method: "POST",
					data: TranslateStats,
					contentType: "application/json",
					requestHeaders: {"x-onelink-token": g_XAPISToken},
					success: function (oXHR, oParms) {
						DebugLog (1, "OneLinkMoxieJS AMI /TranslateStats success", "", "");
					},
					failure: function (oXHR, oParms) {
						DebugLog (1, "OneLinkMoxieJS error from /TranslateStats HTTP-" + oXHR.status, oXHR.statusText, oXHR.responseText);
					},
					retry_status: [0],
					retry_count: 1
				});

				// Clear stats data
				g_ApiStats           = [];
				g_PreTransBlocksUsed = [];

				g_GlobalStats.num_mutation_events = 0;
				g_GlobalStats.pretrans_blocks_used = 0;

				g_StatsLocationsSent.push(sUrlHash);
			}
		}
		catch (e)
		{
			console.error ("OneLinkMoxieJS error sending stats", e);
		}
	}
} // MoxieSendStats

//-----------------------------------------------------------------------------
function MoxieStartStatsTimer (sTranslateKey, sHost)
//-----------------------------------------------------------------------------
{
	g_bStatsActive = true;

	let sMoxieLocation = GetPath();

	try
	{
		let iTimerWait = 10000; // default 10 seconds
		if (g_TranslationRules)
		{
			iTimerWait = g_TranslationRules.stats_mseconds;
			if (typeof iTimerWait !== "number")
			{
				iTimerWait = 10000; // default 10 seconds
			}
		}
		try 
		{
			let cookieHost = MoxieGetCookie("moxie_xapis");
			if (cookieHost) 
			{
				sHost = cookieHost;
			} 
		}
		catch (error)
		{
			console.warn("OneLinkMoxieJS error reading cookie moxie_xapis", error)
		}
		
		setTimeout(MoxieSendStats, iTimerWait, sTranslateKey, sHost, sMoxieLocation);
		window.addEventListener('beforeunload', function() { MoxieLeavePage(sTranslateKey,sHost); }, false);
	}
	catch (e)
	{
		console.error ("OneLinkMoxieJS error setting stats timer", e);
	}
} // MoxieStartStatsTimer

//-----------------------------------------------------------------------------
function MoxieLeavePage (sTranslateKey, sHost)
//-----------------------------------------------------------------------------
{
	MoxieSendStats (sTranslateKey, sHost, g_sMoxieLocation);
} // MoxieLeavePage

//-----------------------------------------------------------------------------
function MoxieSetupTranslateRule(TICs, sRuleName, ruleArray, fCustomizeTic)
//-----------------------------------------------------------------------------
{
	if (TICs)
	{
		for (let ii=0; ii < TICs.length; ++ii)
		{
			let RuleObj = TICs[ii];

			let sRuleUrl = RuleObj.U;
			if (!sRuleUrl || (sRuleUrl == ""))
			{
				sRuleUrl = "U";
			}

			try
			{
				let RegExPat = new RegExp(sRuleUrl, 'i');
				if (sRuleUrl == "U" || g_sMoxieLocation.match(RegExPat))
				{
					if ((RuleObj.T || RuleObj.I || RuleObj.C) && RuleObj.X) 
					{
						console.warn("OneLinkMoxieJS will ignore the TIC part of UTICX for " + sRuleName + " rule since X CSS selector is provided", JSON.stringify(RuleObj));
					}

					if (RuleObj.X)
					{
						let TicPattern = {
							"X": RuleObj.X,
						};						
						
						if (fCustomizeTic) 
						{
							fCustomizeTic(RuleObj, TicPattern);
						}
						
						ruleArray.push(TicPattern);
					}
					else 
					{
						let sTagPattern   = RuleObj.T;
						let sIdPattern    = RuleObj.I;
						let sClassPattern = RuleObj.C;

						if (!sTagPattern || (sTagPattern == "") || (sTagPattern == "T"))
						{
							sTagPattern = ".*";
						}
						if (!sIdPattern || (sIdPattern == "") || (sIdPattern == "I"))
						{
							sIdPattern = ".*";
						}
						if (!sClassPattern || (sClassPattern == "") || (sClassPattern == "C"))
						{
							sClassPattern = ".*";
						}

						let sTagPatternRegEx   = sTagPattern === ".*" ? g_WildcardRegex : new RegExp(sTagPattern, 'i');
						let sIdPatternRegEx   = sIdPattern === ".*" ? g_WildcardRegex : new RegExp(sIdPattern, 'i');
						let sClassPatternRegEx   = sClassPattern === ".*" ? g_WildcardRegex : new RegExp(sClassPattern, 'i');

						let TicPattern = {
										"T": sTagPatternRegEx,
										"I": sIdPatternRegEx,
										"C": sClassPatternRegEx,
									};

						if (fCustomizeTic) 
						{
							fCustomizeTic(RuleObj, TicPattern);
						}

						ruleArray.push(TicPattern);
					}
				}
			} catch (e)
			{
				console.warn ("OneLinkMoxieJS invalid '" + sRuleName + "' rule", e);
			}
		}
	}
} // MoxieSetupTranslateRule

//-----------------------------------------------------------------------------
function MoxieSetupTranslateRules ()
//-----------------------------------------------------------------------------
{
	// clear any previous settings

	g_RulesInlineTags       = [];
	g_RulesBlockTags        = [];
	g_HostRewrites          = [];
	g_NoTranslateTICs       = [];
	g_TranslateTICs         = [];
	g_IgnoreHiddenTICs      = [];
	g_NoImageTranslateTICs  = [];
	g_ImageTranslateTICs    = [];
	g_PseudoNoTranslateTICs = [];
	g_PseudoTranslateTICs   = [];
	g_SuppressMtTICs        = [];
	g_AutoDetectTICs        = [];
	g_NoAmiTICs             = [];
	g_NoTokenizeTICS        = [];
	g_NoHostRewritesTICs    = [];
	g_IframeNoTransTICS     = [];
	g_LangSelectorTICs      = [];
	g_TokenizePatterns      = [];
	g_XDomTokenizePatterns  = [];
	g_TokenizeCookies       = [];
	g_TranslateAttrs        = [
		{
			"T":new RegExp(".*", 'i'),
			"I":new RegExp(".*", 'i'),
			"C":new RegExp(".*", 'i'),
			"attrs":g_DefaultAttrs
		}
	];
	g_NoTranslateAttrs      = [];
	g_AttrArray             = [...g_DefaultAttrs];
	g_TranslateInputValue   = [];
	g_NoTranslateInputValue = [];

	try {
		// set location for which we are settings the translation rules
		g_sMoxieLocation = GetPath();

		if (g_TranslationRules)
		{
			DebugLog (2, "OneLinkMoxieJS translation_rules", g_TranslationRules, "");

			// setup rules for block-tags overrides
			MoxieSetupTranslateRule(g_TranslationRules.set_as_block_tag, "set_as_block_tag", g_RulesBlockTags, function(RuleObj, TicPattern) {
				let sTagList = RuleObj.tags;
				if (!sTagList)
				{
					throw Error("Missing required tags property on 'set_as_block_tag' rule, e.g. 'A, SPAN' ");
				}
				TicPattern.tags = sTagList.toUpperCase();
			});

			// setup rules for inline-tags overrides
			MoxieSetupTranslateRule(g_TranslationRules.set_as_inline_tag, "set_as_inline_tag", g_RulesInlineTags, function(RuleObj, TicPattern) {
				let sTagList = RuleObj.tags;
				if (!sTagList)
				{
					throw Error("Missing required tags property on 'set_as_inline_tag' rule, e.g. 'TR,TD,CUSTOM-SECTION' ");
				}
				TicPattern.tags = sTagList.toUpperCase();
			});

			// setup rules for "NO Translation" UTICXs
			MoxieSetupTranslateRule(g_TranslationRules.no_translate, "no_translate", g_NoTranslateTICs);
			
			// setup rules for "Translation" UTICXs
			MoxieSetupTranslateRule(g_TranslationRules.translate, "translate", g_TranslateTICs);

			// setup rules for "Ignore Hidden" UTICXs
			MoxieSetupTranslateRule(g_TranslationRules.ignore_hidden, "ignore_hidden", g_IgnoreHiddenTICs);

			// setup rules for "Translation Attrs" UTICXs
			MoxieSetupTranslateRule(g_TranslationRules.translate_attributes, "translate_attributes", g_TranslateAttrs, function(RuleObj, TicPattern){
				let Attrs = RuleObj.attrs;
				for (let aa=0; aa < Attrs.length; ++aa)
				{
					let sAttr = Attrs[aa];
					if (g_AttrArray.indexOf(sAttr) == -1)
					{
						g_AttrArray.push(sAttr);
					}
				}
				TicPattern.attrs = Attrs;
			});
			
			// setup rules for "No Translation Attrs" UTICXs (overrides for "Translation Attrs")
			MoxieSetupTranslateRule(g_TranslationRules.no_translate_attributes, "no_translate_attributes", g_NoTranslateAttrs, function(RuleObj, TicPattern){
				let Attrs = RuleObj.attrs;
				TicPattern.attrs = Attrs;
			});

			// setup rules for "Translation InputValue" UTICXs
			MoxieSetupTranslateRule(g_TranslationRules.translate_inputvalue, "translate_inputvalue", g_TranslateInputValue);

			// setup rules for "No Translation InputValues" UTICXs (overrides for "Translation InputValues")
			MoxieSetupTranslateRule(g_TranslationRules.no_translate_inputvalue, "no_translate_inputvalue", g_NoTranslateInputValue);

			// setup rules for "Pseudo NO Translation" UTICXs
			MoxieSetupTranslateRule(g_TranslationRules.no_pseudo_translate, "no_pseudo_translate", g_PseudoNoTranslateTICs);

			// setup rules for "Pseudo Translation" UTICXs (overrides for "Pseudo No Translation")
			MoxieSetupTranslateRule(g_TranslationRules.pseudo_translate, "pseudo_translate", g_PseudoTranslateTICs);

			// setup rules for "NO Image Translation" UTICXs
			MoxieSetupTranslateRule(g_TranslationRules.no_image_translate, "no_image_translate", g_NoImageTranslateTICs);
			
			// setup rules for "Image Translation" UTICXs
			MoxieSetupTranslateRule(g_TranslationRules.image_translate, "image_translate", g_ImageTranslateTICs);
			
			// setup rules for "Suppress MT" UTICXs
			MoxieSetupTranslateRule(g_TranslationRules.suppress_mt, "suppress_mt", g_SuppressMtTICs);
			
			// setup rules for "Auto Detect Language" UTICXs
			MoxieSetupTranslateRule(g_TranslationRules.auto_detect, "auto_detect", g_AutoDetectTICs);
			
			// setup rules for "No Tokenize" UTICXs 
			MoxieSetupTranslateRule(g_TranslationRules.no_tokenize, "no_tokenize", g_NoTokenizeTICS, function(RuleObj, TicPattern){
				let TokenizeType = RuleObj.type;
				if (!TokenizeType)
				{
					throw Error("Missing type property. Valid values are custom|dates|timezones|time|numbers")
				}
				TicPattern.type = TokenizeType.toLowerCase();
			});
			
			// setup rules for "Tokenize Patterns" UTICXs 
			MoxieSetupTranslateRule(g_TranslationRules.tokenize_patterns, "tokenize_patterns", [], function(RuleObj, TicPattern){
				let sRegExPattern = RuleObj.patterns;

				if (sRegExPattern)
				{
					TicPattern.patterns = sRegExPattern;

					g_TokenizePatterns.push(TicPattern);
					g_XDomTokenizePatterns.push(TicPattern);
				}
				else
				{
					let sCookieFrom = RuleObj.cookie_from;
					let sCookieTo   = RuleObj.cookie_to;

					if (sCookieFrom && sCookieTo)
					{
						TicPattern.cookie_from = sCookieFrom;
						TicPattern.cookie_to   = sCookieTo;

						g_TokenizeCookies.push(TicPattern);
					}
				}
			});

			if (g_TranslationRules.language_selector_labels && (g_TranslationRules.language_selector_labels.length > 0))
			{
				g_LangSelectorLabels = [];

				for (let ii=0; ii < g_TranslationRules.language_selector_labels.length; ++ii)
				{
					let Label = g_TranslationRules.language_selector_labels[ii];
					let LabelArray = [];
					LabelArray.push(Object.keys(Label)[0]);
					LabelArray.push(Object.values(Label)[0]);

					g_LangSelectorLabels.push(LabelArray);
				}
			}
			// setup rules for "Language Selector injection" UTICXs 
			MoxieSetupTranslateRule(g_TranslationRules.language_selector, "language_selector", g_LangSelectorTICs, function(RuleObj, TicPattern){
				let sPosition = RuleObj.position;
				if (!sPosition)
				{
					sPosition = "last";
				}
				TicPattern.pos = sPosition;
			});
			if (g_TranslationRules.language_selector && (g_TranslationRules.language_selector.length > 0))
			{
				CreateLangSelector();
			}

			// setup rules for "IFRAME No Translation" UTICXs
			MoxieSetupTranslateRule(g_TranslationRules.iframe_notrans, "iframe_notrans", g_IframeNoTransTICS, function(RuleObj, TicPattern) {
				if (!RuleObj.location)
				{
					throw Error("Moxie iframe_notrans rule is missing location key with Regex for iframe to match")
				}
				TicPattern.location = new RegExp(RuleObj.location, "i");
			});
			
			// setup rules for "NO AMI" UTICs
			let NoAmiTICs = g_TranslationRules.no_ami;
			if (NoAmiTICs)
			{
				let sCurrentDomain = document.location.hostname;

				for (let sDomKey in NoAmiTICs)
				{
					if (NoAmiTICs.hasOwnProperty(sDomKey))
					{
						try
						{
							let DomRegExPat = new RegExp(sDomKey, 'i');
							if (sCurrentDomain.match(DomRegExPat))
							{
								let NoAmiObjs = NoAmiTICs[sDomKey];
								MoxieSetupTranslateRule(NoAmiObjs, "no_ami", g_NoAmiTICs)
							}
						} catch (e)
						{
							console.warn ("OneLinkMoxieJS invalid 'no_ami' rule", sDomKey, e);
						}
					}
				}
			}

			// setup rule for selective AMI, checking for selectively renabling via cookie
			let bSelectiveAMI = g_TranslationRules.ami_selective;
			if ( bSelectiveAMI === true && MoxieGetCookie("selective_ami") !== "true")
			{
				MoxieSetEnableAMI(false);
			}

			// setup rule for Tokenize Numbers
			let bTokenizeNumbers = g_TranslationRules.tokenize_numbers;
			if (typeof bTokenizeNumbers === "boolean")
			{
				g_bTokenizeNumbers = bTokenizeNumbers;
			}

			// setup rule for Hiding dynamic content when seen by mutation observer

			let bHideDynamicContent = g_TranslationRules.hide_dynamic_content;
			if (typeof bHideDynamicContent === "boolean")
			{
				g_bHideDynamicContent = bHideDynamicContent;
			}

			let bThrottleDynamicContent = g_TranslationRules.throttle_dynamic_content;
			if (typeof bThrottleDynamicContent === "boolean")
			{
				g_bThrottleDynamicContent = bThrottleDynamicContent;
			}

			let nThrottleDelayMsecs = g_TranslationRules.throttle_delay_msecs;
			if (typeof nThrottleDelayMsecs === "number")
			{
				g_nThrottleDelayMsecs = Math.min(nThrottleDelayMsecs, 5000);
			}

			// setup keep active element
			let bKeepActiveElement = g_TranslationRules.keep_active_element;
			if (typeof bKeepActiveElement === "boolean")
			{
				g_bKeepActiveElement = bKeepActiveElement;
			}
		}
		else
		{
			console.warn ("OneLinkMoxieJS no translation_rules defined");
		}

		// now add our default tokenization patterns to the list

		let CurlyPattern = {
			"T":new RegExp(".*", 'i'),
			"I":new RegExp(".*", 'i'),
			"C":new RegExp(".*", 'i'),
			"patterns": "{{[^}]*}}"
		};
		let NbspPattern = {
			"T":new RegExp(".*", 'i'),
			"I":new RegExp(".*", 'i'),
			"C":new RegExp(".*", 'i'),
			"patterns": "\\u00a0+"
		};
		let UrlPattern = {
			T: new RegExp(".*", "i"),
			I: new RegExp(".*", "i"),
			C: new RegExp(".*", "i"),
			patterns: /(?:(https?|s?ftp|file|mailto):\/\/){1}[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@%!\$&'\(\)\*\+,;=.]+/g,
		};

		// note: we do not include these default patterns in the g_XDomTokenizePatterns for cross dom tokenization
		g_TokenizePatterns.push(CurlyPattern);
		g_TokenizePatterns.push(NbspPattern);
		g_TokenizePatterns.push(UrlPattern);

		// setup rules for Target Config

		if (g_TargetConfig)
		{
			DebugLog (2, "OneLinkMoxieJS target_config", g_TargetConfig, "");

			let sDocDomain = document.location.hostname;

			let ConfigForDomain = g_TargetConfig[sDocDomain];
			if (ConfigForDomain)
			{
				// setup rules for Host Rewrites

				let HostRewrites = ConfigForDomain.host_rewrites;
				if (HostRewrites)
				{
					g_HostRewrites = HostRewrites;
				}

				// setup rules for override of Host Rewrites
				MoxieSetupTranslateRule(ConfigForDomain.no_host_rewrites, "no_host_rewrite", g_NoHostRewritesTICs);
			}

			let bSendStats = g_TargetConfig.send_stats;
			if (typeof bSendStats !== "undefined")
			{
				g_bSendStats = bSendStats;
			}

			let sHtmlDir = g_TargetConfig.html_dir;
			if (sHtmlDir)
			{
				g_sHtmlDir = sHtmlDir;
			}

			let sHtmlLang = g_TargetConfig.html_lang;
			if (sHtmlLang)
			{
				g_sHtmlLang = sHtmlLang;
			}

			let AssetRewrites = g_TargetConfig.asset_rewrites;
			if (AssetRewrites)
			{
				for (let ii=0; ii < AssetRewrites.length; ++ii)
				{
					let PatternObj = AssetRewrites[ii];

					let sFrom = PatternObj.from;
					let sTo   = PatternObj.to;

					if (sFrom && sTo)
					{
						let AssetPattern = {
							"from": sFrom,
							"to"  : sTo
							};

						g_AssetRewrites.push(AssetPattern);
					}
				}
			}

			let MigrateData = g_TargetConfig.migrate_data;
			if (MigrateData)
			{
				g_iMigrateToVersion = MigrateData.skeleton_version;
				g_sMigrateTKey      = MigrateData.translation_key;

				if (g_iMigrateToVersion != 2)
				{
					console.warn("Not Migrating Data. Only migration to version 2 is supported. target_config has:", g_iMigrateToVersion);
				}
				else if (!g_sMigrateTKey)
				{
					console.warn("Not Migrating Data. No translation_key was specified in the target_config");
				}
				else
				{
					g_bInMigrateMode = true;
				}
			}
		}
		else
		{
			DebugLog (2, "OneLinkMoxieJS no target_config rules defined", "", "");
		}
	} catch (e)
	{
		console.error ("OneLinkMoxieJS error setting up configuration rules", e);
	}

} // MoxieSetupTranslateRules

//-----------------------------------------------------------------------------
function ReFetchPretranslate(sTranslateKey, sHost, bRewriteLinks, bAssetsOnly, topObj)
//-----------------------------------------------------------------------------
{
	let bIsChromeExtension = document.querySelector("meta[name='moxieextension']");

	if ((g_sPretranslateMode == "off") || bIsChromeExtension)
	{
		ProcessTransObjQueue(sTranslateKey, sHost, bRewriteLinks, bAssetsOnly, topObj);
		return;
	}

	let sUrlLocation = OneLinkMoxieJS.GetPathForHash();

	var sUrlHash = OneLinkMoxieJS.FNV1aHash(sUrlLocation.toLowerCase());

	var ApiStat = {
		"api_name"         : "Pretranslate",
		"body_size_bytes"  : 0,
		"roundtrip_usecs"  : 0,
		"x_cache"          : "",
		"age"              : ""
	};

	g_bPretransInProgress = true;

	var nKjaxStart = window.performance.now();
	k$jax ({
		url: sHost + "xapis/Pretranslate/" + sTranslateKey + "/" + sUrlHash + "/" + g_sPretranslateMode + ".json",
		method: "GET",
		success: function (oXHR, oParms) {
			g_bPretransInProgress = false;
			try
			{
				let oJsonResponse     = JSON.parse(oXHR.responseText);
				let oTranslationArray = oJsonResponse.targets;
				let oTransAssetsArray = oJsonResponse.assets;

				OneLinkMoxieJS.MoxieSetTranslationArray(oTranslationArray);
				OneLinkMoxieJS.MoxieSetAssetArray(oTransAssetsArray);

				try
				{
					var nTime = (window.performance.now() - nKjaxStart) * 1000;
					ApiStat.roundtrip_usecs = Math.floor(nTime);
					var nResponseSize = 0;
					var sBody = oXHR.responseText;
					var c;
					for(var i=0;c=sBody.charCodeAt(i++);nResponseSize+=c>>11?3:c>>7?2:1){}
					ApiStat.body_size_bytes = nResponseSize;

					var HeadersList = oXHR.getAllResponseHeaders();
					var HeaderArray = HeadersList.trim().split(/[\r\n]+/);
					HeaderArray.forEach(function (line)
					{
						var HeaderParts = line.split(': ');
						var sHeader = HeaderParts.shift();
						if (sHeader == 'x-cache')
						{
							var sXCache = HeaderParts.join(': ');
							ApiStat.x_cache = sXCache;
						}
						if (sHeader == 'age')
						{
							var sAge = HeaderParts.join(': ');
							ApiStat.age = sAge;
						}
					});
				}
				catch (e) {}

				OneLinkMoxieJS.MoxieApiStatsPush(ApiStat);

				ProcessTransObjQueue(sTranslateKey, sHost, bRewriteLinks, bAssetsOnly, topObj);
			}
			catch (e)
			{
				console.warn("Error reading Pretranslate JSON:", e)
				ProcessTransObjQueue(sTranslateKey, sHost, bRewriteLinks, bAssetsOnly, topObj);
			}
		},
		failure: function (oXHR, oParms) {
			g_bPretransInProgress = false;
			ProcessTransObjQueue(sTranslateKey, sHost, bRewriteLinks, bAssetsOnly, topObj);
		},
		retry_count: 0
	});

} // ReFetchPretranslate

//-----------------------------------------------------------------------------
function ProcessTransObjQueue(sTranslateKey, sHost, bRewriteLinks, bAssetsOnly, topObj)
//-----------------------------------------------------------------------------
{
	// Starting position in global OPE Array for data from this translation request
	let iOPEArrayIndex = g_OPEArray.length;

	g_OPEBlocksForSegments = [];

	let bIsTranslation = true;
	let bOneLinkTx     = true;  // value is not relevant. MoxieWalkDom will calculate what it is.
	let bAutoDetect    = false; // value is not relevant. MoxieWalkDom will calculate what it is.

	const oWalkedSet = new Set();
	if (topObj)
	{
		MoxieWalkDOM (bIsTranslation, bOneLinkTx, "", bAutoDetect, topObj, bAssetsOnly, sTranslateKey, sHost);
		oWalkedSet.add(topObj);
	}

	for (let i=0; i<g_TranslateObjQueue.length; i++)
	{
		let oNextTopObj = g_TranslateObjQueue[i];
		if (oWalkedSet.has(oNextTopObj))
		{
			continue;
		}
		oWalkedSet.add(oNextTopObj);

		if (oNextTopObj.parentNode || oNextTopObj.assignedSlot ||
		    ((oNextTopObj.nodeType == 2/*ATTR*/) && oNextTopObj.ownerElement) ||
		    ((oNextTopObj.nodeType == 11/*FRAGMENT*/) && oNextTopObj.host))
		{
			// If it doesn't have a parent, it's not in the DOM anymore
			MoxieWalkDOM (bIsTranslation, bOneLinkTx, "", bAutoDetect, oNextTopObj, bAssetsOnly, sTranslateKey, sHost);
		}
	}
	g_TranslateObjQueue = [];

	if (g_bIsOPE)
	{
		if (g_OPEBlocksForSegments.length > 0)
		{
			if (typeof GetSegmentsOPE === "function")
			{
				GetSegmentsOPE(g_OPEBlocksForSegments);
			}
			g_OPEBlocksForSegments = [];
		}
	}

	MoxieXapisTranslate(sTranslateKey, sHost, iOPEArrayIndex, bRewriteLinks, bAssetsOnly);

} // ProcessTransObjQueue

//-----------------------------------------------------------------------------
function MoxieWatchForShadowRoot ()
//-----------------------------------------------------------------------------
{
	let MutationAttrs = [...g_AttrArray];
	let config = { characterData: true, attributes: true, attributeFilter: MutationAttrs, childList: true, subtree: true };

	let bIsChromeExtension = document.querySelector("meta[name='moxieextension']");
	if (bIsChromeExtension)
	{
		// Overriding the Prototype of HTMLElement won't work for Chrome Extensions
		// Content scripts in Chrome Extensions (which is what we are) operate in their own version of the DOM
		// Inject a <script> in the header that will override the Prototype in the real Document and fire a moxie-shadowroot Event
		// which we will listen for

		let oDocHead = document.querySelector('head');
		let oScript  = document.createElement("script");
		oScript.innerHTML="let attachShadowFunc = HTMLElement.prototype.attachShadow; HTMLElement.prototype.attachShadow = function(option) { let oShadowObj = attachShadowFunc.call(this, option); let event = new Event('moxie-shadowroot', {bubbles: true}); document.dispatchEvent(event); return oShadowObj; }";
		oDocHead.appendChild(oScript);

		document.addEventListener("moxie-shadowroot", function(event) {
			MoxieWatchShadowDOMS(document, config);
		});
	} else
	{
		let attachShadowFunc = HTMLElement.prototype.attachShadow;
		HTMLElement.prototype.attachShadow = function(option) {
			let oShadowObj = attachShadowFunc.call(this, option);
			g_MoxieObserver.observe(oShadowObj, config);
			oShadowObj.moxieobserved = true;

			if (g_bHideDynamicContent)
			{
				try
				{
					let oStyle = document.createElement("style");
					oStyle.innerHTML = ".onelinkjshide {opacity:0 !important;filter:alpha(opacity=0) !important;}";
					oShadowObj.appendChild(oStyle);
				} catch(e){}
			}

			return oShadowObj;
		};
	}

} // MoxieWatchForShadowRoot

//-----------------------------------------------------------------------------
function MoxieWatchIframeForShadowRoot (oIFrame)
//-----------------------------------------------------------------------------
{
	const oIFrameDoc = MoxieGetIFrameDoc(oIFrame);
	if (!oIFrameDoc)
	{
		return;
	}

	let MutationAttrs = [...g_AttrArray];
	let config = { characterData: true, attributes: true, attributeFilter: MutationAttrs, childList: true, subtree: true };

	let bIsChromeExtension = document.querySelector("meta[name='moxieextension']");
	if (bIsChromeExtension)
	{
		// Overriding the Prototype of HTMLElement won't work for Chrome Extensions
		// Content scripts in Chrome Extensions (which is what we are) operate in their own version of the DOM
		// Inject a <script> in the header that will override the Prototype in the real Document and fire a moxie-shadowroot Event
		// which we will listen for

		let oDocHead = oIFrameDoc.querySelector('head');
		let oScript  = oIFrameDoc.createElement("script");
		oScript.innerHTML="let attachShadowFunc = HTMLElement.prototype.attachShadow; HTMLElement.prototype.attachShadow = function(option) { let oShadowObj = attachShadowFunc.call(this, option); let event = new Event('moxie-shadowroot', {bubbles: true}); document.dispatchEvent(event); return oShadowObj; }";
		oDocHead.appendChild(oScript);

		oIFrameDoc.addEventListener("moxie-shadowroot", function() {
			MoxieWatchShadowDOMS(oIFrameDoc, config);
		});
	} else
	{
		let attachShadowFunc = oIFrame.contentWindow.HTMLElement.prototype.attachShadow;
		oIFrame.contentWindow.HTMLElement.prototype.attachShadow = function(option) {
			let oShadowObj = attachShadowFunc.call(this, option);
			g_MoxieObserver.observe(oShadowObj, config);
			oShadowObj.moxieobserved = true;

			if (g_bHideDynamicContent)
			{
				try
				{
					let oStyle = document.createElement("style");
					oStyle.innerHTML = ".onelinkjshide {opacity:0 !important;filter:alpha(opacity=0) !important;}";
					oShadowObj.appendChild(oStyle);
				} catch(e){}
			}

			return oShadowObj;
		};
	}

} // MoxieWatchIframeForShadowRoot

//-----------------------------------------------------------------------------
function IsPageInScope ()
//-----------------------------------------------------------------------------
{
	if (!g_ExcludedUris || (g_ExcludedUris.length == 0))
	{
		return true;
	}

	for (let i=0; i < g_ExcludedUris.length; i++)
	{
		let sExUriPattern = g_ExcludedUris[i];
		try
		{
			let ExcludeUriRegex = new RegExp(sExUriPattern);

			if (ExcludeUriRegex.test(g_sMoxieLocation))
			{
				// It was explicitly excluded.
				// Now see if there is an explicit include override

				if (g_IncludedUris)
				{
					for (let j=0; j < g_IncludedUris.length; j++)
					{
						let sIncUriPattern = g_IncludedUris[j];

						try
						{
							let IncludeUriRegex = new RegExp(sIncUriPattern);
							if (IncludeUriRegex.test(g_sMoxieLocation))
							{
								return true;
							}
						} catch (e)
						{
							console.error ("OneLinkMoxieJS error checking scope for include_uris", sIncUriPattern, e);
						}
					}
				}

				DebugLog (1, "OneLinkMoxieJS: Not translating page because of rule:", sExUriPattern, "");

				return false;
			}
		
		} catch (e)
		{
			console.error ("OneLinkMoxieJS error checking scope for exclude_uris", sExUriPattern, e);
		}
	}			

	return true;

} // IsPageInScope

function isQueryParamPresent(field) {
	var url = window.location.href;
	if (url.indexOf('?' + field + '=') != -1)
		return true;
	else if (url.indexOf('&' + field + '=') != -1)
		return true;
	return false;
}

//-----------------------------------------------------------------------------
function ClearTranslateData ()
//-----------------------------------------------------------------------------
{
	RemoveHideClasses();

	// Make sure stats is turned off
	g_bSendStats = false;

	document.documentElement.style.opacity=1;
	document.documentElement.style.filter='alpha(opacity=100)';

	g_TranslateObjQueue = [];

} // ClearTranslateData

//-----------------------------------------------------------------------------
function MoxieTranslate (sTranslateKey, sHost, topObj, bAssetsOnly)
//-----------------------------------------------------------------------------
{
	let bEntirePage   = !topObj;
	let bRewriteLinks = false;

	if (!sHost) {
		sHost = "https://api.onelink-preview.com/";
	}

	try 
	{
		let cookieHost = MoxieGetCookie("moxie_xapis");
		if (cookieHost) 
		{
			sHost = cookieHost;
		} 
	}
	catch (error)
	{
		DebugLog (0, "OneLinkMoxieJS error reading cookie moxie_xapis", error, "");
	}

	try 
	{
		let sRegExp = "[?&]moxiedebug=([^&]*)";

		let DebugRegex = new RegExp(sRegExp);

		let sDebugValue = document.location.search.match(DebugRegex);
		if (sDebugValue)
		{
			g_iDebugLevel = sDebugValue[1];
		}
		else
		{
			sDebugValue = MoxieGetCookie("moxiedebug");
			if (sDebugValue) 
			{
				g_iDebugLevel = sDebugValue;
			} 
		} 
	}
	catch (error)
	{
		DebugLog (0, "OneLinkMoxieJS error getting moxiedebug", error, "")
	}

	if (!bAssetsOnly)
	{
		bAssetsOnly = false;
	}

	if (bEntirePage)
	{
		if (!g_bIsOPE)
		{
			if (document.cookie.indexOf("opemoxieoverride=1") != -1)
			{
				// Note: don't set opacity here as this cookie implies OPE is going to take care of it all
				return;
			}

			if (document.cookie.indexOf("moxiepreview=1") != -1 
				|| isQueryParamPresent("moxiepreview") 
				|| document.cookie.indexOf("moxiepreviewurl") != -1
				|| isQueryParamPresent("moxiepreviewurl"))
			{
				// inject the preview version of moxie replacing this one
				let sPreviewScript = "https://api.onelink-preview.com/moxie.min.js";

				let sRegExp = "[?&]moxiepreviewurl=([^&]*)";
				let oRegex = new RegExp(sRegExp);
				let sUrlValue = document.location.search.match(oRegex);
				if (sUrlValue)
				{
					sPreviewScript = sUrlValue[1];
				} else if (MoxieGetCookie("moxiepreviewurl"))
				{
					sPreviewScript = MoxieGetCookie("moxiepreviewurl");
				}

				// Find existing injected Moxie
				let oMoxieJs = document.querySelector('script[src$="onelink-edge.com/moxie.min.js"]');
				if (oMoxieJs)
				{
					// Live customer site
					// Remove the existing Moxie and Pretranslate and inject Staging test version
					// create the script for the Moxie JS test version
					let oTestMoxieJs  = document.createElement("script");
					oTestMoxieJs.src  = sPreviewScript;
					oTestMoxieJs.type = "text/javascript";
					let sKey = oMoxieJs.dataset.oljs;
					if (sKey)
					{
						oTestMoxieJs.setAttribute("data-oljs", sKey);
					}
					oMoxieJs.parentNode.replaceChild(oTestMoxieJs, oMoxieJs);

					let oMoxiePretrans = document.querySelector('script[src*="xapis/Pretranslate"]');
					if (oMoxiePretrans)
					{
						// re-inject the existing Pretranslate
						let oNewPretrans  = document.createElement("script");
						oNewPretrans.src  = oMoxiePretrans.src;
						oNewPretrans.type = "text/javascript";
						let oMoxiePretransParent = oMoxiePretrans.parentNode;
						oMoxiePretransParent.removeChild(oMoxiePretrans);
						oMoxiePretransParent.appendChild(oNewPretrans);
					}

					// Return early because the same Pretranslate script will run again against moxie preview.
					// Note selector will not match in preview script, avoiding infinite loops.
					return;
				}      
			 }
		}

		let bIsAlreadyTranslated = document.querySelector("meta[name='moxietranslated']");
		if (bIsAlreadyTranslated)
		{
			if ((g_sTxMethod != "AMI") && (g_sTxMethod != "STATSONLY"))
			{
				console.error("Invalid request to translate an already translated page. Request denied.");
			}
			if (typeof g_TranslateCallback === "function")
			{
				g_TranslateCallback({"message":"Invalid request to translate an already translated page. Request denied."}, null);
			}
			document.documentElement.style.opacity=1;
			document.documentElement.style.filter='alpha(opacity=100)';

			g_bSendStats = false;

			return;
		}

		if (!g_bInitDelayDone)
		{
			ApplyCustomStyles();
			ApplyCustomJs();

			g_nMoxiePageStart = window.performance.now();

			g_bInitDelayDone = true;
			try
			{
				if (typeof g_TranslationRules.walk_delay_mseconds === "number")
				{
					// Fixed dom walk delay
					setTimeout(MoxieTranslate, g_TranslationRules.walk_delay_mseconds, sTranslateKey, sHost);
					g_GlobalStats.walk_delay_mseconds = g_TranslationRules.walk_delay_mseconds;
					return;
				}
				else if ((typeof g_TranslationRules.adaptive_walk_delay === "boolean") && g_TranslationRules.adaptive_walk_delay)
				{
					// Dynamic dom walk delay
					let iMaxDelay = g_TranslationRules.max_adaptive_delay_mseconds;
					if (typeof iMaxDelay !== "number")
					{
						iMaxDelay = 1000;
					}

					let MoxieTranslateCallBack = function() {MoxieTranslate(sTranslateKey, sHost);};

					g_nAdaptiveDelayStart = window.performance.now();
					moxie_dom_event.MoxieWaitForReadyMainWindow(MoxieTranslateCallBack, iMaxDelay);
					return;
				}
			}
			catch (e)
			{
			}
		}
		else if (g_nAdaptiveDelayStart != 0)
		{
			let nTime = (window.performance.now() - g_nAdaptiveDelayStart) * 1000;
			g_GlobalStats.adaptive_walk_delay_usecs = Math.floor(nTime);
		}

		bRewriteLinks = true;

		DebugLog (1, "OneLinkMoxieJS MoxieTranslate() parsing entire page for translate_key:", sTranslateKey, "");

		topObj = document.documentElement;

		MoxieSetupTranslateRules();

		let bPageInScope = IsPageInScope();
		if (!bPageInScope)
		{
			// This page is out of scope for this target config

			ClearTranslateData();

			if (typeof g_TranslateCallback === "function")
			{
				g_TranslateCallback({"message":"Page not in scope for project. Request denied."}, null);
			}
		}
		else
		{
			// disable Google from translating page
			document.documentElement.setAttribute("translate", "no"); 
			document.documentElement.classList.add("OneLinkTx");
		
			if ((g_sTxMethod != "AMI") && (g_sTxMethod != "STATSONLY") && !g_bIsGLNOW)
			{
				// Set meta data to indicate this page has been translated by Moxie
				let oMeta = document.createElement ("meta");
				oMeta.setAttribute("name", "moxietranslated");
				oMeta.setAttribute("content", "1");
				document.head.appendChild (oMeta);

				if (g_bHideDynamicContent)
				{
					try
					{
						let oStyle = document.createElement("style");
						oStyle.innerHTML = ".onelinkjshide {opacity:0 !important;filter:alpha(opacity=0) !important;}";
						document.head.appendChild(oStyle);
					} catch(e){}
				}

				try
				{
					let oStyle = document.createElement("style");
					oStyle.innerHTML = ".onelinkjsimagehide {opacity:0 !important;filter:alpha(opacity=0) !important;}";
					document.head.appendChild(oStyle);
				} catch(e){}
			}

			if (g_sHtmlDir != "")
			{
				document.documentElement.setAttribute("dir", g_sHtmlDir);
			}

			if (g_sHtmlLang != "")
			{
				document.documentElement.setAttribute("lang", g_sHtmlLang);
			}
		}

		if (!g_bInitialized)
		{
			if (bPageInScope)
			{
				MoxieRewriteMetaRefresh();
			}

			MoxieWatchDOM (sTranslateKey, sHost);

			MoxieWatchForShadowRoot();

			let Iframes = document.querySelectorAll("iframe");
			for (let i=0; i<Iframes.length; i++)
			{
				try
				{
					let oIFrame = Iframes[i];
					if (!MatchIframeNoTrans(oIFrame))
					{
						oIFrame.contentWindow.addEventListener("DOMContentLoaded", function(event) {
							if (event.isTrusted)
							{
								if (!MatchIframeNoTrans(oIFrame))
								{
									MoxieTranslateIFrame(sTranslateKey, sHost, oIFrame);
								}
							}
						});	
					}
				} catch (e) {}
			}

			g_bInitialized = true;
		}

		if (!bPageInScope)
		{
			return;
		}
	}

	if (!g_bTranslateInProgress && !g_bAutoTransInProgress && !g_bPretransInProgress)
	{
		let bIsTranslation = true;
		let bOneLinkTx     = true;  // value is not relevant. MoxieWalkDom will calculate what it is.
		let bAutoDetect    = false; // value is not relevant. MoxieWalkDom will calculate what it is.

		// Check if location changed via pushstate
		let sMoxieLocation = GetPath();

		let bUrlChanged = false;
		if (sMoxieLocation != g_sMoxieLocation)
		{
			bUrlChanged = true;

			if (g_bStatsActive)
			{
				MoxieSendStats (sTranslateKey, sHost, g_sMoxieLocation);
				g_bSendStats = true;
			}

			// re-parse Translation Rules
			// this will also reset global info like g_sMoxieLocation and g_bSendStats
			MoxieSetupTranslateRules();

			if (g_bStatsActive)
			{
				MoxieStartStatsTimer(sTranslateKey, sHost);
			}
		}

		let bPageInScope = IsPageInScope();
		if (!bPageInScope)
		{
			// This page is now out of scope for this target config

			ClearTranslateData();

			return;
		}

		if (bUrlChanged)
		{
			// Re-Fetch the Pretranslate JSON for the new URL
			ReFetchPretranslate(sTranslateKey, sHost, bRewriteLinks, bAssetsOnly, topObj);
		}
		else
		{
			ProcessTransObjQueue(sTranslateKey, sHost, bRewriteLinks, bAssetsOnly, topObj);
		}
	}
	else
	{
		// Only add object if it's not already on the list
		if (g_TranslateObjQueue.indexOf(topObj) === -1)
		{
			g_TranslateObjQueue.push(topObj);
		}
	}

} // MoxieTranslate

let g_fThrottledTranslate = MoxieDebounce(function(sTranslateKey, sHost, obj, bAssetsOnly = false) {
	MoxieTranslate(sTranslateKey, sHost, obj, bAssetsOnly);
}, g_nThrottleDelayMsecs);

//-----------------------------------------------------------------------------
function ProcessMigrateData(sHost)
//-----------------------------------------------------------------------------
{
	let sUrlForHash = GetPathForHash();
	let sUrlHash    = FNV1aHash(sUrlForHash.toLowerCase());

	k$jax ({
		url: sHost + "xapis/Pretranslate/" + g_sMigrateTKey + "/" + sUrlHash + "/all.json",
		method: "GET",
		success: function (oXHR, oParms) {
			DebugLog (1, "OneLinkMoxieJS Migrate Data /Pretranslate success", "", "");

			try
			{
				let oPretransResponse = JSON.parse(oXHR.responseText);
				let oPretranslationArray = oPretransResponse.targets;
				if (oPretranslationArray)
				{
					// Remove any block hashes that are in the Pretranlate Array

					let i = g_MigrateTxNoStacks.length;
					while (i--)
					{
						let TextBlock  = g_MigrateTxNoStacks[i];
						let sBlockHash = TextBlock.block_hash;
						let oFound = oPretranslationArray[sBlockHash];
						if (oFound)
						{
							g_MigrateTxNoStacks.splice(i, 1);
						}
					}

					let j = g_MigrateTxRequest.text.length;
					while (j--)
					{
						let TextBlock  = g_MigrateTxRequest.text[j];
						let sBlockHash = TextBlock.block_hash;
						let oFound = oPretranslationArray[sBlockHash];
						if (oFound)
						{
							g_MigrateTxRequest.text.splice(j, 1);
						}
					}
				}
			} catch (e)
			{
				DebugLog (1, "OneLinkMoxieJS Migrate Data /Pretranslate failure", e, "");
			}
			SendMigrateData(sHost, sUrlHash);
		},
		failure: function (oXHR, oParms) {

			DebugLog (1, "OneLinkMoxieJS Migrate Data /Pretranslate failure", "", "");
			SendMigrateData(sHost, sUrlHash);

		},
		retry_count: 0
	});

} // ProcessMigrateData

//-----------------------------------------------------------------------------
function SendMigrateData(sHost, sUrlHash)
//-----------------------------------------------------------------------------
{

	if (MoxieXapisShouldRefreshToken()) 
	{
		MoxieXapisToken(sHost, function() 
		{
			SendMigrateData(sHost, sUrlHash);
		});
		return;
	}

	let TxRequest = {
		"url"              : document.location.href,
		"content_url_hash" : sUrlHash,
		"text"             : g_MigrateTxNoStacks
	};

	let ContentPageData = g_MigrateTxRequest.text;

	g_MigrateTxRequest = {
		"text" : []
	};
	g_MigrateTxNoStacks = [];

	if (g_bEnableAMI && (ContentPageData.length > 0))
	{
		k$jax ({
			url: sHost + "xapis/Translate/" + g_sMigrateTKey,
			method: "POST",
			data: TxRequest,
			contentType: "application/json",
			requestHeaders: {"x-onelink-token": g_XAPISToken},
			success: function (oXHR, oParms) {
				DebugLog (1, "OneLinkMoxieJS Migrate Data /Translate success", "", "");
	
				try
				{
					let oJSON = JSON.parse(oXHR.responseText);

					let AmiArray = oJSON.ami;
					if (AmiArray)
					{
						let TextArray = [];

						for (let ii=0; ii < AmiArray.length; ++ii)
						{
							let sAmiHash = AmiArray[ii];

							let bFound = false;

							// Get object with sAmiHash from ContentPageData
							for (let jj=0; (jj < ContentPageData.length) && !bFound; ++jj)
							{
								let TextBlock  = ContentPageData[jj];
								let sBlockHash = TextBlock.block_hash;
								if (sBlockHash == sAmiHash)
								{
									let sTagStack   = TextBlock.tag_stack;
									let sIdStack    = TextBlock.id_stack;
									let sClassStack = TextBlock.class_stack;
									if (!MatchNoAmiTIC(sTagStack, sIdStack, sClassStack))
									{
										TextArray.push(TextBlock);
									}
									bFound = true;
								}
							}
						}

						if (TextArray.length > 0)
						{
							let sContextUrl = GetReferrer();
							let sUrlPath    = GetPath();
							let sOriginUrl  = document.location.origin + sUrlPath;
	
							let ContentPageTx = {
										"job_id"        : oJSON.ami_job_id,
										"moxie_version" : g_MoxieVersion,
										"text"          : TextArray,
										"context_url"   : sContextUrl,
										"url"           : sOriginUrl,
										"status"        : "200"
										};
	
							DebugLog (3, "OneLinkMoxieJS Migrate Data content to /ContentPage", ContentPageTx, "");
	
							k$jax ({
								url: sHost + "xapis/ContentPage/" + g_sMigrateTKey,
								method: "POST",
								data: ContentPageTx,
								contentType: "application/json",
								success: function (oXHR, oParms) {
									DebugLog (1, "OneLinkMoxieJS Migrate Data /ContentPage success", "", "");
								},
								failure: function (oXHR, oParms) {
									DebugLog (1, "OneLinkMoxieJS Migrate Data from /ContentPage HTTP-" + oXHR.status, oXHR.statusText, oXHR.responseText);
								},
								retry_status: [0],
								retry_count: 1
							});
						}
					}
				}
				catch (e)
				{
					console.error ("OneLinkMoxieJS error processing AMI", oXHR.responseText, e);
				}
			},
			failure: function (oXHR, oParms) {
	
				DebugLog (1, "OneLinkMoxieJS Migrate Data /Translate failure", "", "");
	
			},
			retry_status: [0],
			retry_count: 5,
			retry_min_msecs: 1,
			retry_max_msecs: 20
		});
	}
} // SendMigrateData

//-----------------------------------------------------------------------------
function XapisAutoDetectTranslate(sTranslateKey, sHost, iOPEArrayIndex, bAssetsOnly)
//-----------------------------------------------------------------------------
{
	if (MoxieXapisShouldRefreshToken()) 
	{
		MoxieXapisToken(sHost, function() 
		{
			XapisAutoDetectTranslate(sTranslateKey, sHost, iOPEArrayIndex, bAssetsOnly);
		});
		return;
	}

	// Copy global data from DOM walking into local arrays for /Translate call

	let LocationArray  = g_AutoDetLocationArray;
	let DomObjsArray   = g_AutoDetDomObjsArray;

	let sUrlForHash = GetPathForHash();
	let sUrlHash    = FNV1aHash(sUrlForHash.toLowerCase());

	let TxRequest     = {
			"url"              : document.location.href,
			"content_url_hash" : sUrlHash, 
			"text"             : g_TxAutoDetect
		};

	DebugLog (3, "OneLinkMoxieJS Auto Detect content found for /Translate", TxRequest, "");

	// Clear global data for the next set of DOM walking

	g_TxAutoDetect  = [];
	g_AutoDetLocationArray = [];
	g_AutoDetDomObjsArray  = [];

	g_bAutoTransInProgress = true;

	let nRequestSize = 0;
	if (g_bStatsActive && g_bSendStats)
	{
		try {
			// calculate size of request body in bytes
			let sBody = JSON.stringify(TxRequest);
			let c;
			for(let i=0;c=sBody.charCodeAt(i++);nRequestSize+=c>>11?3:c>>7?2:1){}
		} catch (e) {}
	}

	let ApiStat = {
				    "api_name"         : "Translate",
				    "body_size_bytes"  : nRequestSize,
				    "roundtrip_usecs"  : 0,
				    "processing_usecs" : 0
				  };

	DebugLog (1, "OneLinkMoxieJS calling /Translate for Auto Detect", "", "");

	let bIsTranslation = true;
	let bOneLinkTx     = true;  // value is not relevant. MoxieWalkDom will calculate what it is.
	let bAutoDetect    = false; // value is not relevant. MoxieWalkDom will calculate what it is.

	let nKjaxStart = window.performance.now();

	k$jax ({
		url: sHost + "xapis/Translate/" + sTranslateKey + "?auto_detect=1",
		method: "POST",
		data: TxRequest,
		requestHeaders: {"x-onelink-token": g_XAPISToken},
		contentType: "application/json",
		success: function (oXHR, oParms) {
			g_bAutoTransInProgress = false;

			if (g_bStatsActive && g_bSendStats)
			{
				try {
					let nTime = (window.performance.now() - nKjaxStart) * 1000;
					ApiStat.roundtrip_usecs = Math.floor(nTime);
				} catch (e) {}
			}

			DebugLog (1, "OneLinkMoxieJS Auto Detect /Translate success", "", "");

			let nTxStart = window.performance.now();
			MoxieProcessAjax (oXHR, LocationArray, DomObjsArray, TxRequest.text, iOPEArrayIndex, ApiStat, true);
			let nTime = (window.performance.now() - nTxStart) * 1000;

			if (!g_bTranslateInProgress)
			{
				document.documentElement.style.opacity=1;
				document.documentElement.style.filter='alpha(opacity=100)';
			}

			if (g_bStatsActive && g_bSendStats)
			{
				try {
					let nTime = (window.performance.now() - nTxStart) * 1000;
					ApiStat.processing_usecs = Math.floor(nTime);
					g_ApiStats.push(ApiStat);
				} catch (e) {}
			}

			// If normal /Translate is in progress, it will handle the queue when it's done
			if (!g_bTranslateInProgress && !g_bPretransInProgress)
			{
				if (g_TranslateObjQueue.length > 0)
				{
					DebugLog (1, "OneLinkMoxieJS walking queued DOM objects", "", "");

					// Check if location changed via pushstate
					let sMoxieLocation = GetPath();

					let bUrlChanged = false;
					if (sMoxieLocation != g_sMoxieLocation)
					{
						bUrlChanged = true;

						if (g_bStatsActive)
						{
							MoxieSendStats (sTranslateKey, sHost, g_sMoxieLocation);
							g_bSendStats = true;
						}

						// re-parse Translation Rules
						// this will also reset global info like g_sMoxieLocation and g_bSendStats
						MoxieSetupTranslateRules();

						if (g_bStatsActive)
						{
							MoxieStartStatsTimer(sTranslateKey, sHost);
						}
					}

					let bPageInScope = IsPageInScope();
					if (!bPageInScope)
					{
						// This page is now out of scope for this target config

						ClearTranslateData();

						return;
					}

					if (bUrlChanged)
					{
						// Re-Fetch the Pretranslate JSON for the new URL
						ReFetchPretranslate(sTranslateKey, sHost, false, bAssetsOnly);
					}
					else
					{
						ProcessTransObjQueue(sTranslateKey, sHost, false, bAssetsOnly);
					}
				}
				else
				{
					RemoveHideClasses();
				}
			}
		},
		failure: function (oXHR, oParms) {
			g_bAutoTransInProgress = false;

			if (g_bStatsActive && g_bSendStats)
			{
				try {
					let nTime = (window.performance.now() - nKjaxStart) * 1000;
					ApiStat.roundtrip_usecs = Math.floor(nTime);
					g_ApiStats.push(ApiStat);
				} catch (e) {}
			}

			DebugLog (1, "OneLinkMoxieJS Auto Detect /Translate failure", "", "");

			// If normal /Translate is in progress, it will handle the queue when it's done
			if (!g_bTranslateInProgress && !g_bPretransInProgress)
			{
				document.documentElement.style.opacity=1;
				document.documentElement.style.filter='alpha(opacity=100)';

				if (g_TranslateObjQueue.length > 0)
				{
					DebugLog (1, "OneLinkMoxieJS walking queued DOM objects", "", "");

					// Check if location changed via pushstate
					let sMoxieLocation = GetPath();

					let bUrlChanged = false;
					if (sMoxieLocation != g_sMoxieLocation)
					{
						bUrlChanged = true;

						if (g_bStatsActive)
						{
							MoxieSendStats (sTranslateKey, sHost, g_sMoxieLocation);
							g_bSendStats = true;
						}

						// re-parse Translation Rules
						// this will also reset global info like g_sMoxieLocation and g_bSendStats
						MoxieSetupTranslateRules();

						if (g_bStatsActive)
						{
							MoxieStartStatsTimer(sTranslateKey, sHost);
						}
					}

					let bPageInScope = IsPageInScope();
					if (!bPageInScope)
					{
						// This page is now out of scope for this target config

						ClearTranslateData();

						return;
					}

					if (bUrlChanged)
					{
						// Re-Fetch the Pretranslate JSON for the new URL
						ReFetchPretranslate(sTranslateKey, sHost, false, bAssetsOnly);
					}
					else
					{
						ProcessTransObjQueue(sTranslateKey, sHost, false, bAssetsOnly);
					}
				}
				else
				{
					RemoveHideClasses();
				}
			}
		},
		retry_status: [0],
		retry_count: 1,
		retry_min_msecs: 1,
		retry_max_msecs: 20
	});

} // XapisAutoDetectTranslate

//-----------------------------------------------------------------------------
function MoxieXapisShouldRefreshToken()
//-----------------------------------------------------------------------------
{

	if (!g_XAPISToken || !g_XAPISTokenDate || (new Date() >= new Date(g_XAPISTokenDate.getTime() + g_XAPISTokenInterval)))
	{
		return true;
	}
	return false;
}

//-----------------------------------------------------------------------------
function MoxieXapisToken(sHost, callback)
//-----------------------------------------------------------------------------
{
	g_XAPISTokenDate = new Date();

	k$jax ({
		url: sHost + "xapis/Token/",
		method: "POST",
		contentType: "application/json",
		success: function MoxieXapisTokenSuccess(oXHR)
		{
			if ((oXHR.status < 200) || (oXHR.status > 299))
			{
				console.error ("OneLinkMoxieJS error from XAPIS /Token HTTP-" + oXHR.status, oXHR.statusText, oXHR.responseText);
				return;
			}
		
			let oJSON = null;
			try
			{
				oJSON = JSON.parse(oXHR.responseText);
			}
			catch (e)
			{
				console.error ("OneLinkMoxieJS INVALID JSON FROM XAPIS", oXHR.responseText, e);
				return;
			}
			g_XAPISToken = oJSON.token;
			callback && callback();
		},
		failure: function MoxieXapisTokenFailure()
		{
			DebugLog (1, "OneLinkMoxieJS /Token failure", "", "");
		},
		retry_status: [0],
		retry_count: 5,
		retry_min_msecs: 1,
		retry_max_msecs: 20
	});
} // MoxieXapisToken

//-----------------------------------------------------------------------------
function MoxieXapisTranslate(sTranslateKey, sHost, iOPEArrayIndex, bRewriteLinks, bAssetsOnly)
//-----------------------------------------------------------------------------
{
	if (MoxieXapisShouldRefreshToken()) 
	{
		MoxieXapisToken(sHost, function() 
		{
			MoxieXapisTranslate(sTranslateKey, sHost, iOPEArrayIndex, bRewriteLinks, bAssetsOnly);
		});
		return;
	}
	
	if (g_TxAutoDetect.length > 0)
	{
		XapisAutoDetectTranslate (sTranslateKey, sHost, iOPEArrayIndex, bAssetsOnly);
	}

	if (g_TxRequest.text.length == 0)
	{
		g_bTranslateInProgress = false;

		if (!g_bAutoTransInProgress)
		{
			document.documentElement.style.opacity=1;
			document.documentElement.style.filter='alpha(opacity=100)';

			RemoveHideClasses();
		}

		if (g_nMoxiePageStart != 0)
		{
			let nTime = (window.performance.now() - g_nMoxiePageStart) * 1000;
			g_GlobalStats.initial_page_usecs = Math.floor(nTime);
			g_nMoxiePageStart = 0;
		}
		if (bRewriteLinks) {
			MoxieRewriteLinks(0);
		}

		MoxiePageDone();

		DebugLog (1, "OneLinkMoxieJS no content found for Standard /Translate", g_TxNoStacks, "");

		if (g_bInMigrateMode)
		{
			ProcessMigrateData(sHost);
		}

		return;
	}

	if (g_bInMigrateMode)
	{
		ProcessMigrateData(sHost);
	}

	// Copy global data from DOM walking into local arrays for /Translate call

	let LocationArray  = g_LocationArray;
	let DomObjsArray   = g_DomObjsArray;

	let sUrlForHash = GetPathForHash();
	let sUrlHash    = FNV1aHash(sUrlForHash.toLowerCase());

	let TxRequest     = {
			"url"              : document.location.href,
			"content_url_hash" : sUrlHash, 
			"text"             : g_TxNoStacks
		};
	let TxRequestText = g_TxRequest.text;

	DebugLog (3, "OneLinkMoxieJS content found for /Translate", TxRequest, "");

	let oRequestHeaders = {"x-onelink-token": g_XAPISToken};

	if (g_bIsGLNOW)
	{
		TxRequest.user_key = g_sGLNOWUser;
		oRequestHeaders["Authorization"] =  "Bearer " + g_sOAuthToken;
	}

	// Clear global data for the next set of DOM walking

	g_LocationArray   = [];
	g_DomObjsArray    = [];
	g_TxRequest       = {
			"text"    : [],
			"assets"  : []
		};
	g_TxNoStacks      = [];

	g_bTranslateInProgress = true;

	let bIsTranslation = true;
	let bOneLinkTx     = true;  // value is not relevant. MoxieWalkDom will calculate what it is.
	let bAutoDetect    = false; // value is not relevant. MoxieWalkDom will calculate what it is.

	let nRequestSize = 0;
	if (g_bStatsActive && g_bSendStats)
	{
		try {
			// calculate size of request body in bytes
			let sBody = JSON.stringify(TxRequest);
			let c;
			for(let i=0;c=sBody.charCodeAt(i++);nRequestSize+=c>>11?3:c>>7?2:1){}
		} catch (e) {}
	}

	if (g_sTxMethod == "STATSONLY")
	{
		g_bTranslateInProgress = false;

		if (!g_bAutoTransInProgress)
		{
			document.documentElement.style.opacity=1;
			document.documentElement.style.filter='alpha(opacity=100)';
		}

		if (g_nMoxiePageStart != 0)
		{
			let nTime = (window.performance.now() - g_nMoxiePageStart) * 1000;
			g_GlobalStats.initial_page_usecs = Math.floor(nTime);
			g_nMoxiePageStart = 0;
		}

		// If /Translate for Auto Detect is in progress, it will handle the queue when it's done
		if (!g_bAutoTransInProgress && !g_bPretransInProgress)
		{
			if (g_TranslateObjQueue.length > 0)
			{
				// Check if location changed via pushstate
				let sMoxieLocation = GetPath();

				let bUrlChanged = false;
				if (sMoxieLocation != g_sMoxieLocation)
				{
					bUrlChanged = true;

					if (g_bStatsActive)
					{
						MoxieSendStats (sTranslateKey, sHost, g_sMoxieLocation);
						g_bSendStats = true;
					}

					// re-parse Translation Rules
					// this will also reset global info like g_sMoxieLocation and g_bSendStats
					MoxieSetupTranslateRules();

					if (g_bStatsActive)
					{
						MoxieStartStatsTimer(sTranslateKey, sHost);
					}
				}

				let bPageInScope = IsPageInScope();
				if (!bPageInScope)
				{
					// This page is now out of scope for this target config

					ClearTranslateData();

					return;
				}

				if (bUrlChanged)
				{
					// Re-Fetch the Pretranslate JSON for the new URL
					ReFetchPretranslate(sTranslateKey, sHost, false, bAssetsOnly);
				}
				else
				{
					ProcessTransObjQueue(sTranslateKey, sHost, false, bAssetsOnly);
				}
			}
			else
			{
				RemoveHideClasses();
			}
		}

		if (bRewriteLinks) {
			MoxieRewriteLinks(0);
		}

		MoxiePageDone();

		return;
	}

	let ApiStat = {
				    "api_name"         : "Translate",
				    "body_size_bytes"  : nRequestSize,
				    "roundtrip_usecs"  : 0,
				    "processing_usecs" : 0
				  };

	let sStagingParam = "";
	if (g_bIsOPE)
	{
		sStagingParam = "?is_staging=1";
	}

	let nKjaxStart = window.performance.now();

	DebugLog (1, "OneLinkMoxieJS calling /Translate", "", "");

	k$jax ({
		url: sHost + "xapis/Translate/" + sTranslateKey + sStagingParam,
		method: "POST",
		requestHeaders: oRequestHeaders,
		data: TxRequest,
		contentType: "application/json",
		complete: g_TranslateCallback,
		success: function (oXHR, oParms) {
			if (g_bStatsActive && g_bSendStats)
			{
				try {
					let nTime = (window.performance.now() - nKjaxStart) * 1000;
					ApiStat.roundtrip_usecs = Math.floor(nTime);
				} catch (e) {}
			}

			DebugLog (1, "OneLinkMoxieJS /Translate success", "", "");

			// don't bother applying any targets if translation_method is AMI (treated as S2T)
			if (g_sTxMethod != "AMI")
			{
				let nTxStart = window.performance.now();
				MoxieProcessAjax (oXHR, LocationArray, DomObjsArray, TxRequest.text, iOPEArrayIndex, ApiStat, false);
				let nTime = (window.performance.now() - nTxStart) * 1000;

				if (g_bStatsActive && g_bSendStats)
				{
					try {
						ApiStat.processing_usecs = Math.floor(nTime);
						g_ApiStats.push(ApiStat);
					} catch (e) {}
				}
			}

			if (!g_bAutoTransInProgress)
			{
				document.documentElement.style.opacity=1;
				document.documentElement.style.filter='alpha(opacity=100)';
			}

			if (g_nMoxiePageStart != 0)
			{
				let nTime = (window.performance.now() - g_nMoxiePageStart) * 1000;
				g_GlobalStats.initial_page_usecs = Math.floor(nTime);
				g_nMoxiePageStart = 0;
			}

			MoxiePageDone();

			if (g_bEnableAMI)
			{
				MoxieProcessAmi(oXHR, sHost, sTranslateKey, TxRequestText); // DebugRemoveTag (special tag for chrome extension)
			}

			g_bTranslateInProgress = false;

			// If /Translate for Auto Detect is in progress, it will handle the queue when it's done
			if (!g_bAutoTransInProgress && !g_bPretransInProgress)
			{
				if (g_TranslateObjQueue.length > 0)
				{
					DebugLog (1, "OneLinkMoxieJS walking queued DOM objects", "", "");

					// Check if location changed via pushstate
					let sMoxieLocation = GetPath();

					let bUrlChanged = false;
					if (sMoxieLocation != g_sMoxieLocation)
					{
						bUrlChanged = true;

						if (g_bStatsActive)
						{
							MoxieSendStats (sTranslateKey, sHost, g_sMoxieLocation);
							g_bSendStats = true;
						}

						// re-parse Translation Rules
						// this will also reset global info like g_sMoxieLocation and g_bSendStats
						MoxieSetupTranslateRules();

						if (g_bStatsActive)
						{
							MoxieStartStatsTimer(sTranslateKey, sHost);
						}
					}

					let bPageInScope = IsPageInScope();
					if (!bPageInScope)
					{
						// This page is now out of scope for this target config

						ClearTranslateData();

						return;
					}

					if (bUrlChanged)
					{
						// Re-Fetch the Pretranslate JSON for the new URL
						ReFetchPretranslate(sTranslateKey, sHost, false, bAssetsOnly);
					}
					else
					{
						ProcessTransObjQueue(sTranslateKey, sHost, false, bAssetsOnly);
					}
				}
				else
				{
					RemoveHideClasses();
				}
			}

			if (bRewriteLinks) {
				MoxieRewriteLinks(0);
			}
		},
		failure: function (oXHR, oParms) {
			if (g_bStatsActive && g_bSendStats)
			{
				try {
					let nTime = (window.performance.now() - nKjaxStart) * 1000;
					ApiStat.roundtrip_usecs = Math.floor(nTime);
					g_ApiStats.push(ApiStat);
				} catch (e) {}
			}

			if (!g_bAutoTransInProgress)
			{
				document.documentElement.style.opacity=1;
				document.documentElement.style.filter='alpha(opacity=100)';
			}

			if (g_nMoxiePageStart != 0)
			{
				let nTime = (window.performance.now() - g_nMoxiePageStart) * 1000;
				g_GlobalStats.initial_page_usecs = Math.floor(nTime);
				g_nMoxiePageStart = 0;
			}

			MoxiePageDone();

			DebugLog (1, "OneLinkMoxieJS /Translate failure", "", "");

			g_bTranslateInProgress = false;

			if (g_bIsOPE)
			{
				// Show Error Message in OPE Mode
				if (OPEEditor && (typeof OPEEditor.ShowServerError === "function"))
				{
					OPEEditor.ShowServerError(oXHR.responseText);
				}
			}

			// If /Translate for Auto Detect is in progress, it will handle the queue when it's done
			if (!g_bAutoTransInProgress && !g_bPretransInProgress)
			{
				if (g_TranslateObjQueue.length > 0)
				{
					DebugLog (1, "OneLinkMoxieJS walking queued DOM objects", "", "");

					// Check if location changed via pushstate
					let sMoxieLocation = GetPath();

					let bUrlChanged = false;
					if (sMoxieLocation != g_sMoxieLocation)
					{
						bUrlChanged = true;

						if (g_bStatsActive)
						{
							MoxieSendStats (sTranslateKey, sHost, g_sMoxieLocation);
							g_bSendStats = true;
						}

						// re-parse Translation Rules
						// this will also reset global info like g_sMoxieLocation and g_bSendStats
						MoxieSetupTranslateRules();

						if (g_bStatsActive)
						{
							MoxieStartStatsTimer(sTranslateKey, sHost);
						}
					}

					let bPageInScope = IsPageInScope();
					if (!bPageInScope)
					{
						// This page is now out of scope for this target config

						ClearTranslateData();

						return;
					}

					if (bUrlChanged)
					{
						// Re-Fetch the Pretranslate JSON for the new URL
						ReFetchPretranslate(sTranslateKey, sHost, false, bAssetsOnly);
					}
					else
					{
						ProcessTransObjQueue(sTranslateKey, sHost, false, bAssetsOnly);
					}
				}
				else
				{
					RemoveHideClasses();
				}
			}

			if (bRewriteLinks) {
				MoxieRewriteLinks(0);
			}
		},
		retry_status: [0],
		retry_count: 5,
		retry_min_msecs: 1,
		retry_max_msecs: 20
	});

} // MoxieXapisTranslate

//-----------------------------------------------------------------------------
function MoxieTranslateIFrame (sTranslateKey, sHost, oIFrame)
//-----------------------------------------------------------------------------
{
	try
	{
		const oIFrameDoc = MoxieGetIFrameDoc(oIFrame);
		if (!oIFrameDoc) return;

		if (!oIFrame.moxieobserved)
		{
			oIFrame.moxieobserved = true;

			let MutationAttrs = [...g_AttrArray];
			MutationAttrs.push("href");

			let config = { characterData: true, attributes: true, attributeFilter: MutationAttrs, childList: true, subtree: true };
			g_MoxieObserver.observe(oIFrameDoc, config);

			MoxieWatchIframeForShadowRoot(oIFrame);
		}

		if (g_bHideDynamicContent)
		{
			try
			{
				let oStyle = document.createElement("style");
				oStyle.innerHTML = ".onelinkjshide {opacity:0 !important;filter:alpha(opacity=0) !important;}";
				oIFrameDoc.head.appendChild(oStyle);
			} catch(e){}
		}

		MoxieTranslate(sTranslateKey, sHost, oIFrameDoc.documentElement);
	} catch (e)
	{
	}

} // MoxieTranslateIFrame

//-----------------------------------------------------------------------------
function MoxiePageDone ()
//-----------------------------------------------------------------------------
{
	if (!g_bPageDone)
	{
		g_bPageDone = true;

		try
		{
			if (typeof OneLinkTxDone === "function")
			{
				OneLinkTxDone ();
			}

			let bIsChromeExtension = document.querySelector("meta[name='moxieextension']");

			if (!bIsChromeExtension) 
			{
				// detect if the user has blocked Google Analytics
				let bGoogleAnalytics = typeof gtag === 'function' || typeof ga === 'function';
				// if the user installs the Google opt out https://chrome.google.com/webstore/detail/google-analytics-opt-ou
				let bUserOptedOut = typeof _gaUserPrefs !== "undefined"  && typeof _gaUserPrefs.ioo !== "undefined";

				// see if the scripts for GA are on the page
				let scripts = Array.from(document.querySelectorAll("script"));
				let bHasGoogleScript = Boolean(scripts.find((node)=> node.src && (node.src.indexOf("google-analytics") !== -1 || node.src.indexOf("googletagmanager") !== -1)));
	
				if (bHasGoogleScript)
				{
					g_GlobalStats.ga_attempted = true;
				}

				// user opts out, ad block, or cookie block
				if (bUserOptedOut || (bHasGoogleScript && !bGoogleAnalytics) || (bGoogleAnalytics && !MoxieGetCookie("_ga"))) 
				{
					g_GlobalStats.ga_blocked = true;
				}
				else if (typeof gtag === "function")
				{
					// call google tag event for the language
					gtag('event', document.documentElement.lang, {'event_category': 'OneLink Localization'});
				}
				else if (typeof ga === "function")
				{
					// call google analytics event for the language
					// TODO - test/confirm (I "think" this is right)
					ga('send', 'event', 'OneLink Localization', 'document.documentElement.lang');
				}
		
			}
		} catch (e)
		{
		}
	}
} // MoxiePageDone

//-----------------------------------------------------------------------------
function GetOneLinkTxState (obj, NoTxReason)
//-----------------------------------------------------------------------------
{
	if (obj.nodeType == 1/*ELEMENT*/)
	{
		let TranslateAttribute = obj.getAttribute("translate");
		if (ClassListContains(obj, "OneLinkTx"))
		{
			NoTxReason.reason = "";
			return true;
		}
		else if (ClassListContains(obj, "OneLinkNoTx"))
		{
			NoTxReason.reason = "(OneLinkNoTx)";
			return false;
		}
		else if (ClassListContains(obj, "notranslate"))
		{
			NoTxReason.reason = "(notranslate)";
			return false;
		}
		else if (TranslateAttribute === "no")
		{
			NoTxReason.reason = "(attribute)";
			return false;
		}
	}

	let oParent = null;
	if (obj.nodeType == 11)
	{
		oParent = obj.host;
	}
	else if (obj.nodeType == 2)
	{
		oParent = obj.ownerElement;
	}
	else if (obj.assignedSlot)
	{
		oParent = obj.assignedSlot;
	}
	else
	{
		oParent = obj.parentNode;
	}
	while (oParent != null)
	{
		if (oParent.nodeType == 1/*ELEMENT*/)
		{
			let TranslateAttribute = oParent.getAttribute("translate");
			if (ClassListContains(oParent, "OneLinkTx"))
			{
				NoTxReason.reason = "";
				return true;
			}
			else if (ClassListContains(oParent, "OneLinkNoTx"))
			{
				NoTxReason.reason = "(OneLinkNoTx)";
				return false;
			}
			else if (ClassListContains(oParent, "notranslate"))
			{
				NoTxReason.reason = "(notranslate)";
				return false;
			}
			else if (TranslateAttribute === "no")
			{
				NoTxReason.reason = "(attribute)";
				return false;
			}
		}
		if (oParent.nodeType == 11)
		{
			oParent = oParent.host;
		}
		else if (oParent.assignedSlot)
		{
			oParent = oParent.assignedSlot;
		}
		else
		{
			oParent = oParent.parentNode;
		}
	}
	return true;

} // GetOneLinkTxState

//-----------------------------------------------------------------------------
function GetOneLinkAutoState (obj)
//-----------------------------------------------------------------------------
{
	if (obj.nodeType == 1/*ELEMENT*/)
	{
		if (ClassListContains(obj, "OneLinkAuto"))
		{
			return true;
		}
	}

	let oParent = null;
	if (obj.nodeType == 11)
	{
		oParent = obj.host;
	}
	else if (obj.nodeType == 2)
	{
		oParent = obj.ownerElement;
	}
	else if (obj.assignedSlot)
	{
		oParent = obj.assignedSlot;
	}
	else
	{
		oParent = obj.parentNode;
	}

	while (oParent != null)
	{
		if (oParent.nodeType == 1/*ELEMENT*/)
		{
			if (ClassListContains(oParent, "OneLinkAuto"))
			{
				return true;
			}
		}
		if (oParent.nodeType == 11)
		{
			oParent = oParent.host;
		}
		else if (oParent.assignedSlot)
		{
			oParent = oParent.assignedSlot;
		}
		else
		{
			oParent = oParent.parentNode;
		}
	}
	return false;

} // GetOneLinkAutoState

//-----------------------------------------------------------------------------
function MoxieReverseWalkDOM (obj, sTagStack, sIdStack, sClassStack)
//-----------------------------------------------------------------------------
{
	if (!sTagStack) 
	{
		sTagStack = "/";
		sIdStack = "/";
		sClassStack = "/";

		let oParent = null;

		if ((obj.nodeType == 2/*ATTR*/) && obj.ownerElement)
		{
			oParent = obj.ownerElement;
		}
		else if ((obj.nodeType == 11/*FRAGMENT*/) && obj.host)
		{
			oParent = obj.host;
		}
		else if (obj.assignedSlot)
		{
			oParent = obj.assignedSlot;
		}
		else
		{
			oParent = obj.parentNode;
		}

		if (oParent && (oParent !== document))
		{
			// We're not starting at the top. Start off with the correct TIC Stacks
			let TicValues = {
				"tag_stack" : "/",
				"id_stack" : "/",
				"class_stack" : "/"
			};

			MoxieGetTICs(oParent, TicValues);

			sTagStack = TicValues.tag_stack;
			sIdStack = TicValues.id_stack;
			sClassStack = TicValues.class_stack;
		}

		if (obj.nodeType == 3/*TEXT*/)
		{
			sTagStack += "TXT";
		}
		else if (obj.nodeType == 2/*ATTR*/)
		{
			if (obj.ownerElement)
			{
				sTagStack += obj.ownerElement.tagName;
			}
			else
			{
				sTagStack += "OBJ";
			}
		}
		else
		{
			sTagStack += obj.tagName;
		}
		sTagStack += "/";

		if (obj.nodeType == 1/*ELEMENT*/)
		{
			let sObjId = obj.getAttribute("id");
			if (sObjId != null) {
				sIdStack += sObjId;
			}
		}
		sIdStack += "/";

		if (obj.nodeType == 1/*ELEMENT*/)
		{
			let sObjClass = RemoveOneLinkClasses(obj, "onelinkjshide|OneLinkOPE(?:Tx)?");
			if (sObjClass != null) {
				sClassStack += sObjClass;
			}
		}
		sClassStack += "/";
	}

	// Note that we treat shadow roots and slots as Blocks
	// So here we always look at obj.parentNode and do NOT look at obj.assignedSlot or obj.host
	// Our logic in MoxieReplaceLocation cannot handle and reconstruct a block translation that would contain
	// a shadow-root or assignedSlot since they are NOT parent/child relationships

	if (obj.assignedSlot)
	{
		// this is in a slot, just return obj
		return obj;
	}

	let BlockObj = obj;

	let oParent = obj.parentNode;
	if (oParent)
	{
		if (!ElementContainsBlockLevelTag (sTagStack, sIdStack, sClassStack, oParent)
			&& oParent.nodeType !== 11)
		{
			BlockObj = MoxieReverseWalkDOM(oParent, sTagStack, sIdStack, sClassStack);
		}
		else if (oParent.nodeType == 11)
		{
			BlockObj = oParent;
		}
	}

	return BlockObj;

} // MoxieReverseWalkDOM

//-----------------------------------------------------------------------------
function ClassListRemove(element, className)
//-----------------------------------------------------------------------------
{
	if (element.classList) 
	{
		element.classList.remove(className);
	} else
	{
		element.className = element.className.replace( new RegExp('(?:^|\\s)'+ className +'(?!\\S)') ,'');
	}
} // ClassListRemove

//-----------------------------------------------------------------------------
function RemoveOneLinkClasses(obj, className = "onelinkjshide") 
//-----------------------------------------------------------------------------
{
	try
	{
		return obj.getAttribute("class") 
			? obj.getAttribute("class").replace( new RegExp('(?:^|\\s)'+ className +'(?!\\S)') ,'') 
			: null;
	} catch (error) {
		console.warn("Error in RemoveOneLinkClasses while removing className", className, obj);
		console.warn(error);
	}
} // RemoveOneLinkClasses

//-----------------------------------------------------------------------------
function InsideNonText (obj)
//-----------------------------------------------------------------------------
{
	if ((obj == null) || (obj == document))
	{
		return false;
	}

	if (IsNonText (obj))
	{
		return true;
	}

	let oParent = null;
	if (obj.nodeType == 11)
	{
		oParent = obj.host;
	}
	else if (obj.assignedSlot)
	{
		oParent = obj.assignedSlot;
	}
	else
	{
		oParent = obj.parentNode;
	}

	if (oParent)
	{
		return InsideNonText(oParent);
	}

	return false;

} // InsideNonText

//-----------------------------------------------------------------------------
function MoxieWalkWhenVisible(obj, sTranslateKey, sHost) 
//-----------------------------------------------------------------------------
{
	if (!g_IntersectObserver) 
	{
		g_IntersectObserver = new IntersectionObserver(function(entries)
		{
			for (let entry of entries)
			{
				if (entry.isIntersecting) 
				{
					g_IntersectSet.add(entry.target);
					if (g_TranslateObjQueue.indexOf(entry.target) === -1) 
					{
						g_TranslateObjQueue.push(entry.target);
					}
				} else if (g_IntersectSet.has(entry.target)) 
				{
					g_IntersectSet.delete(entry.target);
				}
			}

			if (g_TranslateObjQueue.length) 
			{
				let translateFunc = g_bThrottleDynamicContent ? g_fThrottledTranslate : MoxieTranslate;
				translateFunc(sTranslateKey, sHost, g_TranslateObjQueue[0]);
			}

		}, {threshold: 1.0});
	}

	g_IntersectObserver.observe(obj);
	obj.moxieintersect = true;

} // MoxieWalkWhenVisible


//-----------------------------------------------------------------------------
function MoxieWatchDOM (sTranslateKey, sHost)
//-----------------------------------------------------------------------------
{
	if (g_MoxieObserver) {
		return; // already watching
	}

	DebugLog (1, "OneLinkMoxieJS setting up MutationObservers", "", "");

	if (g_bEnableImages)
	{
		g_MoxieAssetObserver = new MutationObserver(function(mutations)
			{
				g_oQueryCache.clear();
				mutations.forEach(function(mutation)
				{
					let obj = mutation.target;
					if (obj)
					{
						let sAttr = mutation.attributeName;

						if (sAttr == "style")
						{
							MoxieTranslate(sTranslateKey, sHost, obj, true);
						}
						else if ((sAttr == "src") || (sAttr == "srcset"))
						{
							// We do not need to call MoxieTranslate() here, although that would work too
							// "src" and "srcset" attribute changes are images and are replaced/translated via the pretanslate array
							// Assets never go through xapis /Translate

							// Find the correct TIC Stacks so the No Translate rules can be checked
							let TicValues = {
								"tag_stack" : "/",
								"id_stack" : "/",
								"class_stack" : "/"
							};

							MoxieGetTICs(obj, TicValues);

							let bAutoDetect = GetOneLinkAutoState(obj) || MatchAutoDetectTIC(TicValues.tag_stack, TicValues.id_stack, TicValues.class_stack, obj);

							ProcessImageAssets(true, obj, TicValues.tag_stack, TicValues.id_stack, TicValues.class_stack, false, bAutoDetect);
						}
					}
				});
			});
	}

	g_MoxieObserver = new MutationObserver(function(mutations)
		{
			g_oQueryCache.clear();
			mutations.forEach(function(mutation)
			{
				if (mutation.type == "childList")
				{
					for (let i = 0; i < mutation.addedNodes.length; i++)
					{
						let oNewObject = mutation.addedNodes[i];
						if (oNewObject.nodeType == 1)
						{
							if (InsideNonText(oNewObject))
							{
								continue;
							}

							if (g_bIsOPE && oNewObject.classList.contains("OPE_object_tag"))
							{
								continue;
							}

							// Note we don't check the class stack for 'OPE_object_tag' like the other places because we don't have stacks here.
							// We could get them, but we don't need to. MoxieWalkDOM will check the stacks and drop this block if it's OPE.
							if ((oNewObject.id == "OPE_open") ||
								(oNewObject.id == "ope-plugin") ||
								(oNewObject.id == "openotrans") ||
								(oNewObject.tagName == "OPE-NOTX") ||
								(oNewObject.tagName == "OPE-HOOK") ||
								(oNewObject.tagName == "OPE-SPAN"))
							{
								continue;
							}

							if (g_HostRewrites.length > 0)
							{
								let sHref = oNewObject.getAttribute("href");
								if (sHref)
								{
									MoxieRewriteLink(oNewObject);
								} else
								{
									let LinkObjs = oNewObject.querySelectorAll("[href]");
									for (let j=0; j<LinkObjs.length; j++)
									{
										MoxieRewriteLink(LinkObjs[j]);
									}
								}
							}

							if ((oNewObject.parentNode || oNewObject.assignedSlot || oNewObject.host) && !IsNonText (oNewObject))
							{
								if ((g_sTxMethod != "AMI") && (g_sTxMethod != "STATSONLY") && !g_bIsGLNOW)
								{
									AddHideClass(oNewObject);
								}

								if (g_bStatsActive && g_bSendStats)
								{
									g_GlobalStats.num_mutation_events += 1;
								}

								if (oNewObject.tagName == "IFRAME" && !MatchIframeNoTrans(oNewObject))
								{
									MoxieTranslateIFrame(sTranslateKey, sHost, oNewObject);

									let moxieOrigOnload = oNewObject.onload;
									oNewObject.onload =
										function()
										{
											if (moxieOrigOnload) moxieOrigOnload();
											oNewObject.moxieobserved = false;
											if (!MatchIframeNoTrans(oNewObject))
											{
												MoxieTranslateIFrame(sTranslateKey, sHost, oNewObject);
											}
										};
								}
								else
								{
									let BlockObject = MoxieReverseWalkDOM(oNewObject);
									// Only add object if it's not already on the list 
									if (g_TranslateObjQueue.indexOf(BlockObject) === -1)
									{    
										g_TranslateObjQueue.push(BlockObject);
									}
								}

								let MutationAttrs = [...g_AttrArray];
								let config = { characterData: true, attributes: true, attributeFilter: MutationAttrs, childList: true, subtree: true };
								MoxieWatchShadowDOMS(oNewObject, config);
							
							}
						}
						else if (oNewObject.nodeType == 3)
						{
							let sEmptyCheck = oNewObject.nodeValue.trim();
							if (sEmptyCheck != "")
							{
								if (oNewObject.nodeValue !== oNewObject.moxietx)
								{
									let oParent = oNewObject.assignedSlot || oNewObject.parentNode || oNewObject.host;
									if (oParent && !InsideNonText (oParent))
									{
										if (g_bIsOPE && oParent.classList.contains("OPE_object_tag"))
										{
											continue; // for
										}

										let NoTxReason = {"reason":""};
										let bOneLinkTx = GetOneLinkTxState(oNewObject, NoTxReason);
										if (bOneLinkTx)
										{
											if (!oNewObject.moxiesrctext || (oNewObject.nodeValue !== oNewObject.moxiesrctext))
											{
												if (g_bHideDynamicContent && (g_sTxMethod != "AMI") && (g_sTxMethod != "STATSONLY") && !g_bIsGLNOW)
												{
													oNewObject.moxiesrctext = oNewObject.nodeValue;
													oNewObject.nodeValue = "";
												}

												if (g_bStatsActive && g_bSendStats)
												{
													g_GlobalStats.num_mutation_events += 1;
												}

												let BlockObject = MoxieReverseWalkDOM(oNewObject);
												// Only add object if it's not already on the list 
												if (g_TranslateObjQueue.indexOf(BlockObject) === -1)
												{    
													g_TranslateObjQueue.push(BlockObject);
												}
											}
										}
										else
										{
											DebugLog (2, "NO TRANSLATE for:", oNewObject, NoTxReason.reason);

											if (g_bIsOPE)
											{
												let sTagStack = "/";
												let sIdStack = "/";
												let sClassStack = "/";

												if (oParent !== document)
												{
													let TicValues = {
														"tag_stack" : "/",
														"id_stack" : "/",
														"class_stack" : "/"
													};

													MoxieGetTICs(oParent, TicValues);

													sTagStack = TicValues.tag_stack;
													sIdStack = TicValues.id_stack;
													sClassStack = TicValues.class_stack;
												}

												sTagStack += "TXT/";
												sIdStack += "/";
												sClassStack += "/";

												if ((typeof HookNoTx === "function") &&
													(sIdStack.indexOf("OPE_open") == -1) &&
													(sIdStack.indexOf("ope-plugin") == -1) &&
													(sIdStack.indexOf("openotrans") == -1) &&
													(sClassStack.indexOf("OPE_object_tag") == -1) &&
													(sTagStack.indexOf("OPE-NOTX") == -1) &&
													(sTagStack.indexOf("OPE-HOOK") == -1) &&
		 											(sTagStack.indexOf("OPE-SPAN") == -1))
												{
													let iChildCount = 0;
													for (let ii = 0; ii < oParent.childNodes.length; ++ii)
													{
														let oChild = oParent.childNodes[ii];
														if (!IsNonText (oChild) && (oChild.nodeType != 8))
														{
															iChildCount++;
														}
													}

													if (iChildCount == 1)
													{
														// this text node is the only relevant child, hook the parent
														HookNoTx (oParent, sTagStack, sIdStack, sClassStack, NoTxReason.reason);
													}
													else
													{
														HookNoTx (oNewObject, sTagStack, sIdStack, sClassStack, NoTxReason.reason);
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
				else if (mutation.type == "characterData")
				{
					let oNewObject = mutation.target;
					if (oNewObject)
					{
						if (oNewObject.nodeType == 3)
						{
							let sEmptyCheck = oNewObject.nodeValue.trim();
							if (sEmptyCheck != "")
							{
								if (oNewObject.nodeValue !== oNewObject.moxietx)
								{
									let oParent = oNewObject.assignedSlot || oNewObject.parentNode || oNewObject.host;
									if (oParent && !InsideNonText (oParent))
									{
										if (!g_bIsOPE || !oParent.classList.contains("OPE_object_tag"))
										{
											let NoTxReason = {"reason":""};
											let bOneLinkTx = GetOneLinkTxState(oNewObject, NoTxReason);
											if (bOneLinkTx)
											{
												if (!oNewObject.moxiesrctext || (oNewObject.nodeValue !== oNewObject.moxiesrctext))
												{
													if (g_bHideDynamicContent && (g_sTxMethod != "AMI") && (g_sTxMethod != "STATSONLY") && !g_bIsGLNOW)
													{
														oNewObject.moxiesrctext = oNewObject.nodeValue;
														oNewObject.nodeValue = "";
													}

													if (g_bStatsActive && g_bSendStats)
													{
														g_GlobalStats.num_mutation_events += 1;
													}

													let BlockObject = MoxieReverseWalkDOM(oNewObject);
													// Only add object if it's not already on the list 
													if (g_TranslateObjQueue.indexOf(BlockObject) === -1)
													{    
														g_TranslateObjQueue.push(BlockObject);
													}
												}
											}
											else
											{
												DebugLog (2, "NO TRANSLATE for:", oNewObject, NoTxReason.reason);
	
												if (g_bIsOPE)
												{
													let sTagStack = "/";
													let sIdStack = "/";
													let sClassStack = "/";
	
													if (oParent !== document)
													{
														let TicValues = {
															"tag_stack" : "/",
															"id_stack" : "/",
															"class_stack" : "/"
														};
	
														MoxieGetTICs(oParent, TicValues);
	
														sTagStack = TicValues.tag_stack;
														sIdStack = TicValues.id_stack;
														sClassStack = TicValues.class_stack;
													}
	
													sTagStack += "TXT/";
													sIdStack += "/";
													sClassStack += "/";
	
													if ((typeof HookNoTx === "function") &&
														(sIdStack.indexOf("OPE_open") == -1) &&
														(sIdStack.indexOf("ope-plugin") == -1) &&
														(sIdStack.indexOf("openotrans") == -1) &&
														(sClassStack.indexOf("OPE_object_tag") == -1) &&
														(sTagStack.indexOf("OPE-NOTX") == -1) &&
														(sTagStack.indexOf("OPE-HOOK") == -1) &&
			 											(sTagStack.indexOf("OPE-SPAN") == -1))
													{
														let iChildCount = 0;
														for (let ii = 0; ii < oParent.childNodes.length; ++ii)
														{
															let oChild = oParent.childNodes[ii];
															if (!IsNonText (oChild) && (oChild.nodeType != 8))
															{
																iChildCount++;
															}
														}
	
														if (iChildCount == 1)
														{
															// this text node is the only relevant child, hook the parent
															HookNoTx (oParent, sTagStack, sIdStack, sClassStack, NoTxReason.reason);
														}
														else
														{
															HookNoTx (oNewObject, sTagStack, sIdStack, sClassStack, NoTxReason.reason);
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
				else if (mutation.type == "attributes")
				{
					let obj = mutation.target;
					if (obj && (obj.nodeType == 1))
					{
						let sAttr = mutation.attributeName;

						if (sAttr == "href")
						{
							MoxieRewriteLink(obj);
						}
						else
						{
							if (g_AttrArray.indexOf(sAttr) !== -1) // IE bug. It ignores the filter below and gives us all attributes.
							{
								let NoTxReason = {"reason":""};
								let bOneLinkTx = GetOneLinkTxState(obj, NoTxReason);
								if (bOneLinkTx)
								{
									let attrNode = obj.getAttributeNode(sAttr);
									if (attrNode)
									{
										if (attrNode.value !== attrNode.moxietx)
										{
											if (g_bStatsActive && g_bSendStats)
											{
												g_GlobalStats.num_mutation_events += 1;
											}

											// Only add attr node if it's not already on the list 
											if (g_TranslateObjQueue.indexOf(attrNode) === -1)
											{    
												g_TranslateObjQueue.push(attrNode);
											}
										}
									}
								}
							}
						}
					}
				}
			});

			if (g_TranslateObjQueue.length) 
			{
				let translateFunc = g_bThrottleDynamicContent ? g_fThrottledTranslate : MoxieTranslate;
				translateFunc(sTranslateKey, sHost, g_TranslateObjQueue[0]);
			}
		});

	let MutationAttrs = [...g_AttrArray];
	MutationAttrs.push("href");

	let config = { characterData: true, attributes: true, attributeFilter: MutationAttrs, childList: true, subtree: true };
	g_MoxieObserver.observe(document, config);

	g_MoxiePseudoObserver = new MutationObserver(function(mutations)
	{
		g_oQueryCache.clear();
		if (g_bDisableMoxiePseudoObserver) {
			// these are not customer pseudo class changes but internal.
			// ignore
			return;
		}

		mutations.forEach(function(mutation)
		{
			if (mutation.type == "attributes")
			{
				let obj = mutation.target;
				if (obj)
				{

					let sAttr = mutation.attributeName;

					if (sAttr !== "class")
					{
						return;
					}


					// If our moxie pseudo element classes are present, 
					// remove them, and re-translate to determine if we still need them.
					if (obj.moxiebeforeclass && ClassListContains(obj, obj.moxiebeforeclass))
					{
						DisablePseudoMutationObserver();
						ClassListRemove(obj, obj.moxiebeforeclass);
					}

					if (obj.moxieafterclass && ClassListContains(obj, obj.moxieafterclass))
					{
						DisablePseudoMutationObserver();
						ClassListRemove(obj, obj.moxieafterclass);
					}

					setTimeout(function() {
						let nearestBlockObject = MoxieReverseWalkDOM(obj);
						MoxieTranslate(sTranslateKey, sHost, nearestBlockObject);							
					});


				}
			}
		});
	});



	let Iframes = document.querySelectorAll("iframe");
	for (let i=0; i<Iframes.length; i++)
	{
		try
		{
			let oIFrame = Iframes[i];
			let oIFrameDoc = MoxieGetIFrameDoc(oIFrame);
			if (oIFrameDoc && !MatchIframeNoTrans(oIFrame))
			{
				if (!oIFrame.moxieobserved)
				{
					oIFrame.moxieobserved = true;

					g_MoxieObserver.observe(oIFrameDoc, config);

					try
					{
							oIFrame.onload =
							function()
							{
								oIFrame.moxieobserved = false;
								if (!MatchIframeNoTrans(oIFrame))
								{
									MoxieTranslateIFrame(sTranslateKey, sHost, oIFrame);
								}
							};
					} catch (e) {}

					if (g_bHideDynamicContent)
					{
						let oStyle = document.createElement("style");
						oStyle.innerHTML = ".onelinkjshide {opacity:0 !important;filter:alpha(opacity=0) !important;}";
						oIFrameDoc.head.appendChild(oStyle);
					}

					MoxieWatchIframeForShadowRoot(oIFrame);
				}
			}
		} catch (e)
		{
		}
	}

	MoxieWatchShadowDOMS(document, config);

} // MoxieWatchDOM

//-----------------------------------------------------------------------------
function MoxieWatchShadowDOMS (obj, config)
//-----------------------------------------------------------------------------
{
	if (obj.shadowRoot != null)
	{
		if (!obj.shadowRoot.moxieobserved)
		{
			g_MoxieObserver.observe(obj.shadowRoot, config);
			obj.shadowRoot.moxieobserved = true;
		}
	}
	for (let i = 0; i < obj.childNodes.length; i++)
	{
		let childObj = obj.childNodes[i];
		if (childObj.nodeType == 1)
		{
			MoxieWatchShadowDOMS(childObj, config);
		}
	}

} // MoxieWatchShadowDOMS

//-----------------------------------------------------------------------------
function MoxieWatchInputValue (obj, sTranslateKey, sHost)
//-----------------------------------------------------------------------------
{
	let property = "value";
	let elementPrototype = Object.getPrototypeOf(obj);
	if (elementPrototype.hasOwnProperty(property)) 
	{
		let descriptor = Object.getOwnPropertyDescriptor(
			elementPrototype,
			property
		);
		Object.defineProperty(obj, property, 
		{
			get: function () {
				return descriptor.get.apply(this, arguments);
			},
			set: function () 
			{
				let oldValue = this[property];
				descriptor.set.apply(this, arguments);
				if (obj.value !== obj.moxietx)
				{
					MoxieTranslate(sTranslateKey, sHost, obj);
				}
				let newValue = this[property];
				return newValue;
			},
		});
	}

	obj.addEventListener("change", function(){
		MoxieTranslate(sTranslateKey, sHost, obj);
	});

} // MoxieWatchInputValue

//-----------------------------------------------------------------------------
function MoxieRewriteLinks(iCount)
//-----------------------------------------------------------------------------
{
	let LinksArray = document.links;
	let i = LinksArray.length;
	while (i--)
	{
		let obj = LinksArray[i];
		MoxieRewriteLink(obj);
	}

	// Set timer to re-run Link Rewrites a few more times
	if (iCount < 5)
	{
		let iTime = (iCount == 0) ? 1000 : (1000 * iCount);
		setTimeout(MoxieRewriteLinks, iTime, iCount+1);
	}

} // MoxieRewriteLinks

//-----------------------------------------------------------------------------
function MoxieRewriteLink(obj)
//-----------------------------------------------------------------------------
{
	if (!obj || (g_HostRewrites.length == 0)) {
		return;
	}

	try
	{
		let sHref = obj.getAttribute("href");

		if (sHref && (sHref != ""))
		{
			let TicValues = {
				"tag_stack" : "/",
				"id_stack" : "/",
				"class_stack" : "/"
			};

			for (let ii=0; ii < g_HostRewrites.length; ++ii)
			{
				let RewriteRule = g_HostRewrites[ii];

				let sFromRegex = RewriteRule.from;
				let sToValue   = RewriteRule.to;

				if (sFromRegex && sToValue)
				{
					let ToRegEx = new RegExp(sToValue);
					if (sHref.match(ToRegEx))
					{
						// It already matches this "to" value
						break;
					}

					let re   = new RegExp(sFromRegex);
					let sNew = sHref.replace(re, sToValue);

					if (sNew != sHref)
					{
						// Get the TIC Stacks for this object

						TicValues.tag_stack   = "/";
						TicValues.id_stack    = "/";
						TicValues.class_stack = "/";

						MoxieGetTICs(obj, TicValues);

						// See if this matches a no_host_rewrites rule
						if (MatchNoReWriteTIC(TicValues.tag_stack, TicValues.id_stack, TicValues.class_stack, obj))
						{
							DebugLog (2, "TIC matches No Host Rewrites pattern. Not re-writing link", obj, "");
							return;
						}

						obj.setAttribute ("href", sNew);
						break;
					}
				}
			}
		}
	}
	catch (e) {
		return;
	}

} // MoxieRewriteLink

//-----------------------------------------------------------------------------
function MoxieRewriteMetaRefresh()
//-----------------------------------------------------------------------------
{
	if (g_HostRewrites.length == 0) {
		return;
	}

	try
	{
		let oRefreshMeta = document.querySelector("meta[http-equiv='refresh' i]");

		if (oRefreshMeta)
		{
			let sContent = oRefreshMeta.getAttribute("content");

			if (sContent && sContent != "")
			{
				for (let ii=0; ii < g_HostRewrites.length; ++ii)
				{
					let RewriteRule = g_HostRewrites[ii];

					let sFromRegex = RewriteRule.from;
					let sToValue   = RewriteRule.to;

					if (sFromRegex && sToValue)
					{
						let ToRegEx = new RegExp(sToValue);
						if (sContent.match(ToRegEx))
						{
							// It already matches this "to" value
							break;
						}

						let re   = new RegExp(sFromRegex);
						let sNew = sContent.replace(re, sToValue);

						if (sNew != sContent)
						{
							oRefreshMeta.setAttribute ("content", sNew);
							break;
						}
					}
				}
			}
		}
	}
	catch (e) {
		return;
	}

} // MoxieRewriteMetaRefresh

//-----------------------------------------------------------------------------
function ApplyCustomStyles ()
//-----------------------------------------------------------------------------
{
	if (g_sCustomCss != "")
	{
		let oStyle = document.createElement ("style");
		oStyle.innerHTML = g_sCustomCss;
		document.head.appendChild (oStyle);
	}
} // ApplyCustomStyles

//-----------------------------------------------------------------------------
function ApplyCustomJs ()
//-----------------------------------------------------------------------------
{
	if (g_sCustomJs != "")
	{
		let oScript = document.createElement ("script");
		oScript.innerHTML = g_sCustomJs;
		document.head.appendChild (oScript);
	}
} // ApplyCustomJs

//-----------------------------------------------------------------------------
function MoxieCustomStyles (sBlock)
//-----------------------------------------------------------------------------
{
	if (typeof sBlock === "string")
	{
		let sEmptyCheck = sBlock.trim();
		if (sEmptyCheck != "")
		{
			g_sCustomCss = sBlock;
		}
	}

} // MoxieCustomStyles

//-----------------------------------------------------------------------------
function MoxieCustomJs (sBlock)
//-----------------------------------------------------------------------------
{
	if (typeof sBlock === "string")
	{
		let sEmptyCheck = sBlock.trim();
		if (sEmptyCheck != "")
		{
			g_sCustomJs = sBlock;
		}
	}

} // MoxieCustomJs

// Public functions to set configurations and data

//-----------------------------------------------------------------------------
function GetPath()
//-----------------------------------------------------------------------------
{
	let sLocation = document.location.pathname + document.location.search;

	if (!g_bTruncateHash)
	{
		sLocation = document.location.pathname + document.location.search + document.location.hash;
	}

	sLocation = AdjustPath(sLocation);

	return sLocation;

} // GetPath

//-----------------------------------------------------------------------------
function GetPathForHash()
//-----------------------------------------------------------------------------
{
	let sLocation = GetPath();

	if (g_bIsMultiDomain)
	{
		sLocation = "//" + document.location.hostname + sLocation;
	}

	return sLocation;

} // GetPathForHash

//-----------------------------------------------------------------------------
function GetReferrer()
//-----------------------------------------------------------------------------
{
	let sLocation = document.referrer ? document.referrer : "";

	if (sLocation == "")
	{
		return sLocation;
	}

	if (g_bTruncateHash)
	{
		let iHashIndex = sLocation.indexOf("#");
		if (iHashIndex !== -1)
		{
			sLocation = sLocation.substring(0, iHashIndex);
		}
	}

	sLocation = AdjustPath(sLocation);

	return sLocation;
	//	return sLocation.toLowerCase();

} // GetReferrer

//-----------------------------------------------------------------------------
function AdjustPath(sPath)
//-----------------------------------------------------------------------------
{
	try
	{
		for (let kk=0; kk < g_TruncateUrlsAt.length; ++kk)
		{
			let sTruncatePattern = g_TruncateUrlsAt[kk];
			// make sure it truncates to the end of the line.
			sTruncatePattern += ".*"; 

			let RegEx1 = new RegExp(sTruncatePattern);
			if (RegEx1.test(sPath)) 
			{
				sPath = sPath.replace(RegEx1, "");
			}
		}

		if ((sPath.indexOf("onelinkjs_staging") !== -1) && (g_RemoveUrlParam.indexOf("onelinkjs_staging") === -1))
		{
			g_RemoveUrlParam.push("onelinkjs_staging");
		}

		if ((sPath.indexOf("moxiepreview") !== -1) && (g_RemoveUrlParam.indexOf("moxiepreview") === -1))
		{
			g_RemoveUrlParam.push("moxiepreview");
		}

		if ((sPath.indexOf("moxiepreviewurl") !== -1) && (g_RemoveUrlParam.indexOf("moxiepreviewurl") === -1))
		{
			g_RemoveUrlParam.push("moxiepreviewurl");
		}

		if ((sPath.indexOf("moxiedebug") !== -1) && (g_RemoveUrlParam.indexOf("moxiedebug") === -1))
		{
			g_RemoveUrlParam.push("moxiedebug");
		}

		if (g_RemoveUrlParam.length > 0)
		{
			let UrlParts = sPath.split("?");
		
			if (UrlParts.length > 1)
			{
				let sUrlBase   = UrlParts[0];
				let sNewParams = ""; 

				let sParamList = UrlParts.length === 2 ? UrlParts[1] : UrlParts.slice(1).join('?');
			
				let sHashTag   = "";
			
				let iHashIdx = sParamList.indexOf("#");
				if (iHashIdx !== -1)
				{
					sHashTag   = sParamList.substring(iHashIdx);
					sParamList = sParamList.substring(0, iHashIdx);
				}
			 
				let aParams = sParamList.split("&");
				for (let ii=0; ii < aParams.length; ++ii)
				{
					let sParam = aParams[ii];
					let aParam = sParam.split("=");
					if (aParam.length > 1)
					{
						let sName  = aParam[0];
						let sValue = aParam.length == 2 ? aParam[1] : aParam.slice(1).join('=');
						if (g_RemoveUrlParam.indexOf(sName) === -1)
						{
							if (sNewParams == "")
							{
								sNewParams += "?";
							} else
							{
								sNewParams += "&";
							}
							sNewParams += sName + "=" + sValue;
						}
					} else if (aParam.length == 1)
					{                   
						if (g_RemoveUrlParam.indexOf(aParam[0]) === -1)
						{
							if (sNewParams == "")
							{
								sNewParams += "?";
							} else
							{
								sNewParams += "&";
							}
							sNewParams += aParam[0];
						}
					}
				}

				sPath = sUrlBase + sNewParams + sHashTag;
			}
		}
	} catch (e) {}

	return sPath;

} // AdjustPath

// ============================================================================
// Methods to inject language selector based on deployment methods of config
// ============================================================================

//-----------------------------------------------------------------------------
function LangSelected()
//-----------------------------------------------------------------------------
{
	var sLangSelection = document.getElementById("OLJSLanguageSelector").value;
	if (sLangSelection)
	{
		if (g_sDeploymentMethod == "domain")
		{
			// Domain method

			// If the method values are a list "de.example.com,de-de.example.com" just use the first one in the list

			sLangSelection = sLangSelection.replace(/,.*/, '');

			document.location.host = sLangSelection;
		}
		else if (g_sDeploymentMethod == "folder")
		{
			// Folder method

			// If the method values are a list "/de/,/de-de/" just use the first one in the list
			sLangSelection = sLangSelection.replace(/,.*/, '');

			for (let sLangValue in g_DeploymentValues)
			{
				// escape characters that could be in a path that have special regex meaning
				// at the end, replace commas with OR to become a RegExp of the values
				//
				// /de/,/de-de/,/de.foo$/,/de+foo*/
				//   becomes
				// /de/|/de-de/|/de\.foo\$/|/de\+foo\*/
				//
				let sRegExp = sLangValue.replace(/[.]/g, "\\.").replace(/[*]/g, "\\*").replace(/[$]/g, "\\$").replace(/[+]/g, "\\+").replace(/,/g, "|");

				let DeploymentValueRegExp = new RegExp(sRegExp);

				if (document.location.pathname.match(DeploymentValueRegExp))
				{
					if (sLangSelection == "oljs_default")
					{
						document.location.pathname = document.location.pathname.replace(DeploymentValueRegExp, "/");
					}
					else
					{
						document.location.pathname = document.location.pathname.replace(DeploymentValueRegExp, sLangSelection);
					}

					return;
				}
			}

			// didn't find a lang value in the path. add the requested lang selection to the beginning of the path.
			if (sLangSelection != "oljs_default")
			{
				document.location.pathname = document.location.pathname.replace("/", sLangSelection);
			}
		}
		else if (g_sDeploymentMethod == "query")
		{
			// Query method

			let sEmptyCheck = g_sDeploymentName.trim();
			if (sEmptyCheck != "")
			{
				let sParamList  = document.location.search.substring(1);
				let sNewParams  = "";
				let bWasUpdated = false;
				let aParams = sParamList.split("&");
				for (let ii=0; ii < aParams.length; ++ii)
				{
					let sParam = aParams[ii];
					let aParam = sParam.split("=");
					if (aParam.length == 2)
					{
						let sName  = aParam[0];
						let sValue = aParam[1];

						if (sName == g_sDeploymentName)
						{
							if (sLangSelection != "oljs_default")
							{
								if (sNewParams == "")
								{
									sNewParams += "?";
								} else
								{
									sNewParams += "&";
								}
								sNewParams += sName + "=" + sLangSelection;
							}
							bWasUpdated = true;
						}
						else
						{
							if (sNewParams == "")
							{
								sNewParams += "?";
							} else
							{
								sNewParams += "&";
							}
							sNewParams += sName + "=" + sValue;
						}
					}
				}
				if (!bWasUpdated && (sLangSelection != "oljs_default"))
				{
					if (sNewParams == "")
					{
						sNewParams += "?";
					} else
					{
						sNewParams += "&";
					}
					sNewParams += g_sDeploymentName + "=" + sLangSelection;
				}
				document.location.search = sNewParams;
			}
			else
			{
				console.warn("OneLinkMoxieJS: The deployment name is not set on this language for the deployment query method");
			}
		}
		else if (g_sDeploymentMethod == "cookie")
		{
			// Cookie method

			let sEmptyCheck = g_sDeploymentName.trim();
			if (sEmptyCheck != "")
			{
				if (sLangSelection != "oljs_default")
				{
					document.cookie = g_sDeploymentName + "=" + sLangSelection;
				}
				else
				{
					try
					{
						document.cookie = g_sDeploymentName + "=" + sLangSelection + "; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
					} catch (e)
					{
						document.cookie = g_sDeploymentName + "=" + sLangSelection;
					}
				}

				document.location.reload();
			}
			else
			{
				console.warn("OneLinkMoxieJS: The deployment name is not set on this language for the deployment cookie method");
			}
		}
	}
} // LangSelected

//-----------------------------------------------------------------------------
function InsertLangSelector(obj, sPosition)
//-----------------------------------------------------------------------------
{
	if (obj)
	{
		let sCurrentLang = "";
		if (g_sDeploymentMethod == "domain")
		{
			sCurrentLang = document.location.host;
		}
		else if (g_sDeploymentMethod == "folder")
		{
			for (let sLangValue in g_DeploymentValues)
			{
				if (document.location.pathname.indexOf(sLangValue) != -1)
				{
					sCurrentLang = sLangValue;
					break;
				}
			}
		}
		else if (g_sDeploymentMethod == "query")
		{
			let sParamList = document.location.search.substring(1);
			let aParams    = sParamList.split("&");
			for (let ii=0; ii < aParams.length; ++ii)
			{
				let sParam = aParams[ii];
				let aParam = sParam.split("=");
				if (aParam.length == 2)
				{
					let sName  = aParam[0];
					let sValue = aParam[1];

					if (sName == g_sDeploymentName)
					{
						sCurrentLang = sValue;
					}
				}
			}
		}
		else if (g_sDeploymentMethod == "cookie")
		{
			sCurrentLang = MoxieGetCookie(g_sDeploymentName);
		}
		else
		{
			return;
		}

		let oSelect = document.createElement("select");

		oSelect.id        = "OLJSLanguageSelector";
		oSelect.className = "OneLinkNoTx OLJS-language-selector";

		let bSelectedOption = false;
		let bDefaultExists  = false;

		if (!g_LangSelectorLabels)
		{
			g_LangSelectorLabels = Object.entries(g_DeploymentValues).sort((a,b) => (a[1] < b[1]) ? -1 : (a[1] > b[1]) ? 1 : 0);
		}

		for (let i=0; i < g_LangSelectorLabels.length; i++)
		{
			let LangValue  = g_LangSelectorLabels[i];
			let sLangValue = LangValue[0];
			let sLangName  = LangValue[1];

			let oOption = document.createElement("option");

			oOption.value = sLangValue;
			oOption.innerHTML = sLangName;
			oSelect.appendChild(oOption);

			if (((sCurrentLang != "") && (sLangValue == sCurrentLang)) ||
				((sCurrentLang == "") && (sLangValue == "oljs_default")))
			{
				oSelect.value   = sLangValue;
				bSelectedOption = true;
			}

			if (sLangValue == "oljs_default")
			{
				bDefaultExists = true;
			}
		}

		if (!bSelectedOption && bDefaultExists)
		{
			oSelect.value = "oljs_default";
		}

		oSelect.onchange = function() {OneLinkMoxieJS.LangSelected();};

		if (sPosition == "first")
		{
			let oSibling = obj.firstChild;

			obj.insertBefore(oSelect, oSibling);
		}
		else // "last"
		{
			obj.appendChild(oSelect);
		}
	}
} // InsertLangSelector

//-----------------------------------------------------------------------------
function CreateLangSelector(iNumTimes)
//-----------------------------------------------------------------------------
{
	if (!iNumTimes)
	{
		iNumTimes = 30;
	}

	try
	{
		// removed any existing language selector that may have been created

		let oExistingSelector = document.getElementById("OLJSLanguageSelector");
		if (oExistingSelector)
		{
			oExistingSelector.parentNode.removeChild(oExistingSelector);
		}
	} catch (e)
	{
	}

	try
	{
		let Position = {};
		let obj = FindLangSelectorObj (document.documentElement, Position);

		if (obj)
		{
			InsertLangSelector(obj, Position.pos);
		} else
		{
			iNumTimes--;
			if (iNumTimes > 0)
			{
				setTimeout(CreateLangSelector, 1000, iNumTimes);
			}
		}
	} catch (e)
	{
		console.warn("OneLinkMoxieJS error creating Language Selector", e);
	}

} // CreateLangSelector

// ============================================================================
// Methods to set/get config or data
// ============================================================================

//-----------------------------------------------------------------------------
function MoxieSetIsOPE(bIsOPE)
//-----------------------------------------------------------------------------
{
	g_bIsOPE = bIsOPE;
} // MoxieSetIsOPE

//-----------------------------------------------------------------------------
function MoxieSetIsGLNOW(bIsGLNOW)
//-----------------------------------------------------------------------------
{
	g_bIsGLNOW = bIsGLNOW;
} // MoxieSetIsGLNOW

//-----------------------------------------------------------------------------
function MoxieSetGLNOWUser(sGLNOWUser)
//-----------------------------------------------------------------------------
{
	g_sGLNOWUser = sGLNOWUser;
} // MoxieSetGLNOWUser

//-----------------------------------------------------------------------------
function MoxieSetGLNOWAuthToken(sOAuthToken)
//-----------------------------------------------------------------------------
{
	g_sOAuthToken = sOAuthToken;
} // MoxieSetGLNOWAuthToken

//-----------------------------------------------------------------------------
function MoxieSetTranslationRules(TranslationRules)
//-----------------------------------------------------------------------------
{
	g_TranslationRules = TranslationRules;
} // MoxieSetTranslationRules

//-----------------------------------------------------------------------------
function MoxieSetTruncateHash(bTruncateHash)
//-----------------------------------------------------------------------------
{
	if (typeof bTruncateHash === "boolean")
	{
		g_bTruncateHash = bTruncateHash;
	}
} // MoxieSetTruncateHash

//-----------------------------------------------------------------------------
function EnableImages(bEnableImages)
//-----------------------------------------------------------------------------
{
	if (typeof bEnableImages === "boolean")
	{
		g_bEnableImages = bEnableImages;
	}
} // EnableImages

//-----------------------------------------------------------------------------
function MoxieSetTruncateUrlsAt(TruncateUrlsAt)
//-----------------------------------------------------------------------------
{
	if (Array.isArray(TruncateUrlsAt))
	{
		g_TruncateUrlsAt = TruncateUrlsAt;
	}
} // MoxieSetTruncateUrlsAt

//-----------------------------------------------------------------------------
function MoxieSetRemoveUrlParam(RemoveUrlParam)
//-----------------------------------------------------------------------------
{
	if (Array.isArray(RemoveUrlParam))
	{
		g_RemoveUrlParam = RemoveUrlParam;
	}
} // MoxieSetRemoveUrlParam

//-----------------------------------------------------------------------------
function MoxieSetExcludedUris(ExcludedUris)
//-----------------------------------------------------------------------------
{
	if (Array.isArray(ExcludedUris))
	{
		g_ExcludedUris = ExcludedUris;
	}
} // MoxieSetExcludedUris

//-----------------------------------------------------------------------------
function MoxieSetIncludedUris(IncludedUris)
//-----------------------------------------------------------------------------
{
	if (Array.isArray(IncludedUris))
	{
		g_IncludedUris = IncludedUris;
	}
} // MoxieSetIncludedUris

//-----------------------------------------------------------------------------
function MoxieSetTargetConfig(TargetConfig)
//-----------------------------------------------------------------------------
{
	g_TargetConfig = TargetConfig;
} // MoxieSetTargetConfig

//-----------------------------------------------------------------------------
function MoxieSetTranslationArray(TranslationArray)
//-----------------------------------------------------------------------------
{
	g_TranslationArray = TranslationArray;
} // MoxieSetTranslationArray

//-----------------------------------------------------------------------------
function MoxieSetAssetArray(AssetTranslationArray)
//-----------------------------------------------------------------------------
{
	g_AssetTranslationArray = AssetTranslationArray;
} // MoxieSetAssetArray

//-----------------------------------------------------------------------------
function MoxieSetTranslationMethod(sTxMethod)
//-----------------------------------------------------------------------------
{
	g_sTxMethod = sTxMethod;
} // MoxieSetTranslationMethod

//-----------------------------------------------------------------------------
function SetPretranslateMode(sPretranslateMode)
//-----------------------------------------------------------------------------
{
	g_sPretranslateMode = sPretranslateMode;
} // SetPretranslateMode

//-----------------------------------------------------------------------------
function SetDeploymentMethod(sDeploymentMethod)
//-----------------------------------------------------------------------------
{
	g_sDeploymentMethod = sDeploymentMethod;
} // SetDeploymentMethod

//-----------------------------------------------------------------------------
function SetDeploymentName(sDeploymentName)
//-----------------------------------------------------------------------------
{
	g_sDeploymentName = sDeploymentName;
} // SetDeploymentName

//-----------------------------------------------------------------------------
function SetDeploymentValues(DeploymentValues)
//-----------------------------------------------------------------------------
{
	g_DeploymentValues = DeploymentValues;
} // SetDeploymentValues

//-----------------------------------------------------------------------------
function MoxieSetEnableAMI(bEnableAMI)
//-----------------------------------------------------------------------------
{
	g_bEnableAMI = bEnableAMI;
} // MoxieSetEnableAMI

//-----------------------------------------------------------------------------
function ForceAMI(bForceAMI)
//-----------------------------------------------------------------------------
{
	g_bForceAMI = bForceAMI;
} // ForceAMI

//-----------------------------------------------------------------------------
function MoxieSetIsMultiDomain(bIsMultiDomain)
//-----------------------------------------------------------------------------
{
	if (typeof bIsMultiDomain === "boolean")
	{
		g_bIsMultiDomain = bIsMultiDomain;
	}
} // MoxieSetIsMultiDomain

//-----------------------------------------------------------------------------
function MoxieSetContentBackfill(bContentBackfill)
//-----------------------------------------------------------------------------
{
	g_bContentBackfill = bContentBackfill;
} // MoxieSetContentBackfill

//-----------------------------------------------------------------------------
function MoxieApiStatsPush(ApiStat)
//-----------------------------------------------------------------------------
{
	g_ApiStats.push(ApiStat);
} // MoxieApiStatsPush

//-----------------------------------------------------------------------------
function SetTranslateCallback(CallbackFunction)
//-----------------------------------------------------------------------------
{
	g_TranslateCallback = CallbackFunction;
} // SetTranslateCallback

//-----------------------------------------------------------------------------
function SetSkeletonVersion(sSkeletonVersion)
//-----------------------------------------------------------------------------
{
	g_sSkeletonVersion = sSkeletonVersion;
} // SetSkeletonVersion

//-----------------------------------------------------------------------------
function ClearMoxieTx(obj)
//-----------------------------------------------------------------------------
{
	for (let ii = 0; ii < obj.childNodes.length; ++ii)
	{
		let childObj = obj.childNodes[ii];
		if (childObj.nodeType == 3)
		{
			if (childObj.moxietx)
			{
				delete childObj.moxietx;
			}
		}
		else if (childObj.nodeType == 1)
		{
			for (let i = 0; i < childObj.attributes.length; i++)
			{
				let oAttrNode = childObj.attributes[i];
				if (oAttrNode.moxietx)
				{
					delete oAttrNode.moxietx;
				}
			}
		}

		if (childObj.shadowRoot)
		{
			ClearMoxieTx(childObj.shadowRoot);
		}

		if (childObj.tagName == "IFRAME")
		{
			try
			{
				const oIFrameDoc = MoxieGetIFrameDoc(childObj);
				if (oIFrameDoc && oIFrameDoc.documentElement)
				{
					ClearMoxieTx(oIFrameDoc.documentElement);
				}
			} catch(e) {}
		}
		else
		{
			ClearMoxieTx(childObj);
		}
	}
} // ClearMoxieTx

//-----------------------------------------------------------------------------
function ClearTranslatedText()
//-----------------------------------------------------------------------------
{
	try
	{
		g_TranslatedText = [];

		ClearMoxieTx(document.documentElement);

	} catch(e) {}

} // ClearTranslatedText

return {
	MoxieTranslate            : MoxieTranslate,
	MoxieSetupTranslateRules  : MoxieSetupTranslateRules,
	MoxieStartStatsTimer      : MoxieStartStatsTimer,
	MoxieWalkDOM              : MoxieWalkDOM,
	MoxieCheckIfImage         : MoxieCheckIfImage,
	MoxieReplaceLocation      : MoxieReplaceLocation,
	MoxieReplacePseudoElement : MoxieReplacePseudoElement,
	MoxieCustomStyles         : MoxieCustomStyles,
	MoxieCustomJs             : MoxieCustomJs,
	MoxieSetIsOPE             : MoxieSetIsOPE,
	MoxieSetIsGLNOW           : MoxieSetIsGLNOW,
	MoxieSetGLNOWUser         : MoxieSetGLNOWUser,
	MoxieSetGLNOWAuthToken    : MoxieSetGLNOWAuthToken,
	MoxieSetIsMultiDomain     : MoxieSetIsMultiDomain,
	MoxieSetContentBackfill   : MoxieSetContentBackfill,
	MoxieSetTranslationRules  : MoxieSetTranslationRules,
	MoxieSetTruncateHash      : MoxieSetTruncateHash,
	MoxieSetTruncateUrlsAt    : MoxieSetTruncateUrlsAt,
	MoxieSetRemoveUrlParam    : MoxieSetRemoveUrlParam,
	MoxieSetExcludedUris      : MoxieSetExcludedUris,
	MoxieSetIncludedUris      : MoxieSetIncludedUris,
	MoxieSetTargetConfig      : MoxieSetTargetConfig,
	MoxieSetTranslationArray  : MoxieSetTranslationArray,
	MoxieSetAssetArray        : MoxieSetAssetArray,
	MoxieSetTranslationMethod : MoxieSetTranslationMethod,
	SetPretranslateMode       : SetPretranslateMode,
	MoxieSetEnableAMI         : MoxieSetEnableAMI,
	ForceAMI                  : ForceAMI,
	MoxieApiStatsPush         : MoxieApiStatsPush,
	MoxieReverseWalkDOM       : MoxieReverseWalkDOM,
	SetDeploymentMethod       : SetDeploymentMethod,
	SetDeploymentName         : SetDeploymentName,
	SetDeploymentValues       : SetDeploymentValues,
	SetSkeletonVersion        : SetSkeletonVersion,
	SetTranslateCallback      : SetTranslateCallback,
	TextToJliff               : TextToJliff,
	EnableImages              : EnableImages,
	LangSelected              : LangSelected,
	IsPageInScope             : IsPageInScope,
	GetOneLinkTxState         : GetOneLinkTxState,
	ClearTranslatedText       : ClearTranslatedText,
	GetPath                   : GetPath,
	GetPathForHash            : GetPathForHash,
	IsNonText                 : IsNonText,
	FNV1aHash                 : FNV1aHash,
	kstrin                    : kstrin,
	g_MoxieVersion            : g_MoxieVersion,
	g_sHtmlLang               : g_sHtmlLang,
	g_TxRequest               : g_TxRequest,
	g_AttrArray               : g_AttrArray,
	g_OPEArray                : g_OPEArray,
	g_OPEAssetArray           : g_OPEAssetArray
};

})(); 
//  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.
// | .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
// | | ____    ____ | || |     ____     | || |  ____  ____  | || |     _____    | || |  _________   | |
// | ||_   \  /   _|| || |   .'    `.   | || | |_  _||_  _| | || |    |_   _|   | || | |_   ___  |  | |
// | |  |   \/   |  | || |  /  .--.  \  | || |   \ \  / /   | || |      | |     | || |   | |_  \_|  | |
// | |  | |\  /| |  | || |  | |    | |  | || |    > `' <    | || |      | |     | || |   |  _|  _   | |
// | | _| |_\/_| |_ | || |  \  `--'  /  | || |  _/ /'`\ \_  | || |     _| |_    | || |  _| |___/ |  | |
// | ||_____||_____|| || |   `.____.'   | || | |____||____| | || |    |_____|   | || | |_________|  | |
// | |              | || |              | || |              | || |              | || |              | |
// | '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
//  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'
//
// Don Muzquiz, ora pro nobis
//
// Moxie Rules of Engagement (a Hippocratic Oath)
// 1. Do no harm to any web site I am injected into.
// 2. Whatever I do, do it fast.
// 3. Remember all who use me. Customer web sites, Tarantula, Chrome Extensions, ...
//

//-----------------------------------------------------------------------------
// globals
//-----------------------------------------------------------------------------

var g_TranslationKey = "";

var OneLinkMoxiePretranslate = (function() {
'use strict';

let oMoxieJs = document.querySelector('script[data-oljs]');
if (oMoxieJs)
{
	let sKey = oMoxieJs.dataset.oljs;
	if (sKey)
	{
		let sSrc = oMoxieJs.getAttribute("src");
		if (sSrc)
		{
			let HostRegex = /https?:\/\/.*\//;
			let XapisHost = sSrc.match(HostRegex);

			if (XapisHost && (XapisHost.length > 0))
			{
				XapisHost = XapisHost[0];
			}

			// Allow XAPIS host to be overriden
			try 
			{
				let cookieXApisHost = GetLangCookie("moxie_xapis");
				if (cookieXApisHost) 
				{
					XapisHost = cookieXApisHost;
				} 
			}
			catch (error)
			{
				console.warn("Error reading cookie moxie_xapis", error)
			}

			if (XapisHost && (XapisHost.length > 0))
			{
				if (document.readyState == "loading")
				{
					document.documentElement.style.opacity=0;
					document.documentElement.style.filter='alpha(opacity=0)';
				}

				PreTrans(sKey, XapisHost);
			}
		}
	}
}

//-----------------------------------------------------------------------------
function ResetOpacity()
//-----------------------------------------------------------------------------
{
	document.documentElement.style.opacity=1;
	document.documentElement.style.filter='alpha(opacity=100)';
} // ResetOpacity

//-----------------------------------------------------------------------------
function PreTrans(sKey, sXapisHost)
//-----------------------------------------------------------------------------
{
	k$jax ({
		url: sXapisHost + "xapis/PretranslateConfig/" + sKey + ".json",
		method: "GET",
		success: function (oXHR, oParms) {
			try
			{
				let oConfigInfo = JSON.parse(oXHR.responseText);
	
				ProcessPretrans(sXapisHost, oConfigInfo);
			}
			catch (e)
			{
				console.warn ("OneLinkJS: Pretranslate config error");
				ResetOpacity();
			}
		},
		failure: function (oXHR, oParms) {
			console.warn ("OneLinkJS: Pretranslate failed");
			ResetOpacity();
		},
		retry_count: 0
	});

} // PreTrans

//-----------------------------------------------------------------------------
function GetLangCookie (sCookieName)
//-----------------------------------------------------------------------------
{
	let Cookies = document.cookie.split(';');
	for (let i = 0; i <Cookies.length; i++)
	{
		let Cookie = Cookies[i].split("=");

		if (sCookieName == Cookie[0].trim())
		{
			return decodeURIComponent(Cookie[1]);
		}
	}
	return "";
} // GetLangCookie

//-----------------------------------------------------------------------------
function GetLangQuery (sQueryName)
//-----------------------------------------------------------------------------
{
	let sRegExp = "[?&]" + sQueryName + "=([^&]*)";

	let QueryRegex = new RegExp(sRegExp);

	let sValue = document.location.search.match(QueryRegex);
	if (sValue)
	{
		return decodeURIComponent(sValue[1]);
	}

	return "";

} // GetLangQuery

//-----------------------------------------------------------------------------
function GetLangFolder (LangKeys)
//-----------------------------------------------------------------------------
{
	for (let sLangValue in LangKeys)
	{
		// escape characters that could be in a path that have special regex meaning
		// at the end, replace commas with OR to become a RegExp of the values
		//
		// /de/,/de-de/,/de.foo$/,/de+foo*/
		//   becomes
		// /de/|/de-de/|/de\.foo\$/|/de\+foo\*/
		//
		let sRegExp = sLangValue.replace(/[.]/g, "\\.").replace(/[*]/g, "\\*").replace(/[$]/g, "\\$").replace(/[+]/g, "\\+").replace(/,/g, "|");

		let DeploymentValueRegExp = new RegExp(sRegExp);

		if (document.location.pathname.match(DeploymentValueRegExp))
		{
			return sLangValue;
		}
	}

	return "";

} // GetLangFolder

//-----------------------------------------------------------------------------
function GetLangDomain (LangKeys)
//-----------------------------------------------------------------------------
{
	for (let sLangValue in LangKeys)
	{
		// escape characters that could be in a domain that have special regex meaning
		// at the end, replace commas with OR to become a RegExp of the values
		//
		// example.com,de.example.com,de-de.example.com
		//   becomes
		// example\.com|de\.example\.com|de-de\.example\.com
		//
		let sRegExp = sLangValue.replace(/[.]/g, "\\.").replace(/,/g, "|");

		let DeploymentValueRegExp = new RegExp(sRegExp);

		if (document.domain.match(DeploymentValueRegExp))
		{
			return sLangValue;
		}
	}

	return "";

} // GetLangDomain

//-----------------------------------------------------------------------------
function ProcessPretrans(sXapisHost, oConfigInfo)
//-----------------------------------------------------------------------------
{
	let sDeploymentMethod = oConfigInfo.deployment_method;
	let sDeploymentName   = oConfigInfo.deployment_name;
	let oDeploymentValues = oConfigInfo.deployment_values;

	// if there is a 'config' this is a single TKEY
	// otherwise it's a list of langs/TKEYs (deployment_method is being used)
	let oConfigData = oConfigInfo.config;

	if (!oConfigData)
	{
		let sLang = "";

		try
		{
			if (sDeploymentMethod == "cookie")
			{
				sLang = GetLangCookie(sDeploymentName);
			}
			else if (sDeploymentMethod == "query")
			{
				sLang = GetLangQuery(sDeploymentName);
			}
			else if (sDeploymentMethod == "folder")
			{
				sLang = GetLangFolder(oDeploymentValues);
			}
			else if (sDeploymentMethod == "domain")
			{
				sLang = GetLangDomain(oDeploymentValues);
			}
			else
			{
				console.warn("OneLinkJS: Deployment Method '" + sDeploymentMethod + "' not supported.");
				ResetOpacity();
				return;
			}
		} catch (e)
		{
			console.warn("OneLinkJS: Could not identify language for deployment method '" + sDeploymentMethod + "'.");
			ResetOpacity();
			return;
		}

		if (sLang != "")
		{
			oConfigData = oConfigInfo[sLang];
			if (!oConfigData)
			{
				oConfigData = oConfigInfo["oljs_default"];
				if (oConfigData)
				{
					console.info("OneLinkJS: '" + sLang + "' is not defined for any of the languages. Using oljs_default language.");
				}
				else
				{
					console.info("OneLinkJS: '" + sLang + "' is not defined for any of the languages. No oljs_default language is set.");
					ResetOpacity();
					return;
				}
			}
		}
		else
		{
			oConfigData = oConfigInfo["oljs_default"];
			if (oConfigData)
			{
				console.info("OneLinkJS: No language identified from " + sDeploymentMethod + " deployment method. Using oljs_default language.");
			}
			else
			{
				console.info("OneLinkJS: No language identified from " + sDeploymentMethod + " deployment method. No oljs_default language is set.");
				ResetOpacity();
				return;
			}
		}
	}

	OneLinkMoxieJS.SetDeploymentMethod(sDeploymentMethod);

	OneLinkMoxieJS.SetDeploymentName(sDeploymentName);

	OneLinkMoxieJS.SetDeploymentValues(oDeploymentValues);

	let sTranslationKey = oConfigData.translation_key;

	g_TranslationKey = sTranslationKey;

	let oTargetConfig = oConfigData.target_config;
	OneLinkMoxieJS.MoxieSetTargetConfig(oTargetConfig);

	let oTranslationRules = oConfigData.translation_rules;
	OneLinkMoxieJS.MoxieSetTranslationRules(oTranslationRules);

	let bTruncateUrlHash = oConfigData.truncate_url_hash;
	OneLinkMoxieJS.MoxieSetTruncateHash(bTruncateUrlHash);

	let bIsMultiDomain = oConfigData.is_multi_domain;
	OneLinkMoxieJS.MoxieSetIsMultiDomain(bIsMultiDomain);

	let oTruncateUrlsAt = oConfigData.truncate_urls_at;
	OneLinkMoxieJS.MoxieSetTruncateUrlsAt(oTruncateUrlsAt);

	let bEnableImages = oConfigData.enable_images;
	OneLinkMoxieJS.EnableImages(bEnableImages);

	let oRemoveUrlParam = oConfigData.remove_url_param;
	OneLinkMoxieJS.MoxieSetRemoveUrlParam(oRemoveUrlParam);

	let oExcludeUris = oConfigData.exclude_uris;
	OneLinkMoxieJS.MoxieSetExcludedUris(oExcludeUris);

	let oIncludeUris = oConfigData.include_uris;
	OneLinkMoxieJS.MoxieSetIncludedUris(oIncludeUris);

	let sSkeletonVersion = oConfigData.skeleton_version;
	OneLinkMoxieJS.SetSkeletonVersion(sSkeletonVersion);
	
	let sTxMethods = oConfigData.translation_methods;
	OneLinkMoxieJS.MoxieSetTranslationMethod(sTxMethods);

	if (sTxMethods == "S2T")
	{
		ResetOpacity();
		return;
	}

	if ((sTxMethods == "AMI") || (sTxMethods == "STATSONLY"))
	{
		ResetOpacity();
	}

	let sCustomCssHex = "";
	let sCustomJsHex  = "";
	if (document.location.search.indexOf("onelinkjs_staging=1") != -1)
	{
		sCustomCssHex = oConfigData.staging_custom_css;
		sCustomJsHex  = oConfigData.staging_custom_js;
	}
	else
	{
		sCustomCssHex = oConfigData.custom_css;
		sCustomJsHex  = oConfigData.custom_js;
	}
	
	let sPretransMode = oConfigData.pretrans_mode;
	OneLinkMoxieJS.SetPretranslateMode(sPretransMode);
	if (sPretransMode == "off")
	{
		ApplyCustomJsCss(sCustomCssHex, sCustomJsHex);

		MoxieStart(sXapisHost, sTranslationKey);
	}
	else
	{
		let sUrlLocation = OneLinkMoxieJS.GetPathForHash();

		var sUrlHash = OneLinkMoxieJS.FNV1aHash(sUrlLocation.toLowerCase());
	
		var ApiStat = {
			"api_name"         : "Pretranslate",
			"body_size_bytes"  : 0,
			"roundtrip_usecs"  : 0,
			"x_cache"          : "",
			"age"              : ""
		};

		var nKjaxStart = window.performance.now();
		k$jax ({
			url: sXapisHost + "xapis/Pretranslate/" + sTranslationKey + "/" + sUrlHash + "/" + sPretransMode + ".json",
			method: "GET",
			success: function (oXHR, oParms) {
				try
				{
					let oJsonResponse     = JSON.parse(oXHR.responseText);
					let oTranslationArray = oJsonResponse.targets;
					let oTransAssetsArray = oJsonResponse.assets;

					OneLinkMoxieJS.MoxieSetTranslationArray(oTranslationArray);
					OneLinkMoxieJS.MoxieSetAssetArray(oTransAssetsArray);

					try
					{
						var nTime = (window.performance.now() - nKjaxStart) * 1000;
						ApiStat.roundtrip_usecs = Math.floor(nTime);
						var nResponseSize = 0;
						var sBody = oXHR.responseText;
						var c;
						for(var i=0;c=sBody.charCodeAt(i++);nResponseSize+=c>>11?3:c>>7?2:1){}
						ApiStat.body_size_bytes = nResponseSize;

						var HeadersList = oXHR.getAllResponseHeaders();
						var HeaderArray = HeadersList.trim().split(/[\r\n]+/);
						HeaderArray.forEach(function (line)
						{
							var HeaderParts = line.split(': ');
							var sHeader = HeaderParts.shift();
							if (sHeader == 'x-cache')
							{
								var sXCache = HeaderParts.join(': ');
								ApiStat.x_cache = sXCache;
							}
							if (sHeader == 'age')
							{
								var sAge = HeaderParts.join(': ');
								ApiStat.age = sAge;
							}
						});
					}
					catch (e) {}

					OneLinkMoxieJS.MoxieApiStatsPush(ApiStat);

					MoxieStart(sXapisHost, sTranslationKey);
				}
				catch (e)
				{
					console.warn("Error reading Pretranslate JSON:", e)
					MoxieStart(sXapisHost, sTranslationKey);
				}
			},
			failure: function (oXHR, oParms) {
				MoxieStart(sXapisHost, sTranslationKey);
			},
			retry_count: 0
		});

		ApplyCustomJsCss(sCustomCssHex, sCustomJsHex);
	}

} // ProcessPretrans

//-----------------------------------------------------------------------------
function UnHex (sInput)
//-----------------------------------------------------------------------------
{
	if (!sInput)
	{
		return null;
	}
	else if (sInput == "")
	{
		return "";
	}

	try
	{
		return decodeURIComponent(sInput.replace(/(..)/g,'%$1'));
	} catch(e) {}

	return null;
} // UnHex

//-----------------------------------------------------------------------------
function ApplyCustomJsCss(sCustomCssHex, sCustomJsHex)
//-----------------------------------------------------------------------------
{
	try
	{
		let sCustomJs  = UnHex(sCustomJsHex);
		OneLinkMoxieJS.MoxieCustomJs (sCustomJs);
	} catch (e)
	{
		console.warn("OneLinkJS: to apply the custom JS: " + e);
	}

	try
	{
		let sCustomCss = UnHex(sCustomCssHex);
		OneLinkMoxieJS.MoxieCustomStyles (sCustomCss);
	} catch (e)
	{
		console.warn("OneLinkJS: to apply the custom CSS: " + e);
	}
} // ApplyCustomJsCss

//-----------------------------------------------------------------------------
function MoxieStart(sXapisHost, sTranslationKey)
//-----------------------------------------------------------------------------
{
	try
	{
		if (document.readyState != "loading")
		{
			OneLinkMoxieJS.MoxieTranslate (sTranslationKey, sXapisHost);
			OneLinkMoxieJS.MoxieStartStatsTimer (sTranslationKey, sXapisHost);
		}
		else
		{
			document.addEventListener ("DOMContentLoaded", function(event) {
				if (event.isTrusted)
				{
					OneLinkMoxieJS.MoxieTranslate (sTranslationKey, sXapisHost);
					OneLinkMoxieJS.MoxieStartStatsTimer (sTranslationKey, sXapisHost);
				}
				else
				{
					ResetOpacity();
				}
			});
		}
	}
	catch (e)
	{
		ResetOpacity();
	}
} // MoxieStart

})();

