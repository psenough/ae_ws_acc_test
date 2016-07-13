
navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

function thisthing() {
	
	var acc = document.getElementById('acc');
	if (!acc) {
		acc = document.createElement('div');
		acc.setAttribute('id','acc');
		acc.setAttribute('class','acc');
		document.body.appendChild(acc);
	}
	
	connectWebSockets();
	
	//setTimeout(calculate_buttons_position, 200);
	
	//request_ping();
	
	//setInterval(recheck_ping, max_timeout);
}

var obj = {};
obj.websockets = 'ws://192.168.6.66:3001';
obj.ws = null;
obj.timeout = false;

var msg = 'connecting...';

me = this; // strange javascript convention

// put onmessage function in setTimeout to get around ios websocket crash
//this.socket.onmessage = function(evt) { setTimeout(function() {me.onMessageHandler(evt);}, 0); };

connectWebSockets = function() {

	//var obj = this;

	console.log("attempt to connect");
	this.timeout = false;

	obj.ws = new WebSocket(obj.websockets);        

	obj.ws.onopen = function() {
		console.log("opened socket");
		obj.ws.send("hello world! wazzup?");
		//alert('opened');
	};

	obj.ws.onmessage = function(evt) {
		setTimeout(function() {
			console.log(evt.data);
			//alert(evt.data);
			msg = evt.data;
		}); 
		
		
		//console.log('motion: ' + res['motionIndex'] + ' ' + res['zoneId'] + ' ' + res['order'] + ' ' + res['pixelInMotion'] + ' ' + res['velSum']);
		/*if (evt.data == 'welcome') {
			console.log('connected!!');
			return;
		}
		
		var res = JSON.parse(evt.data);
		if (res) {
			//console.log('motion: ' + res['motionIndex'] + ' ' + res['zoneId'] + ' ' + res['order'] + ' ' + res['pixelInMotion'] + ' ' + res['velSum']);
			var signal = 0;
			switch(res['zoneId']) {
				case '1':
					switch(res['order']) {
						case 'Left':
							//console.log('before:' + obj.leftPaddle.velY);
							obj.leftPaddle.updateVelY(obj.leftPaddle.MaxVelocity);
							//console.log('after:' + obj.leftPaddle.velY);
							obj.leftPerson.goLeft();
						break;
						case 'Right':
							obj.leftPaddle.updateVelY(-obj.leftPaddle.MaxVelocity);
							obj.leftPerson.goRight();
						break;
						case 'None':
							obj.leftPerson.goCenter();
						break;
					}
				break;
				case '2':
					switch(res['order']) {
						case 'Left':
							obj.rightPaddle.updateVelY(-obj.leftPaddle.MaxVelocity);
							obj.rightPerson.goLeft();
						break;
						case 'Right':
							obj.rightPaddle.updateVelY(obj.leftPaddle.MaxVelocity);
							obj.rightPerson.goRight();
						break;
						case 'None':
							obj.rightPerson.goCenter();
						break;
					}
				break;
				default:
					console.log('wtf');
				break;
			}
		}*/
	};

	obj.ws.onclose = function() {
		console.log("closed socket");
		if (!obj.timeout) obj.timeout = setTimeout(function(){connectWebSockets()},5000);
		//alert('closed');
	};

	obj.ws.onerror = function() {
		console.log("error on socket");
		if (!obj.timeout) obj.timeout = setTimeout(function(){connectWebSockets()},5000);
		//alert('error');
	};
}


if(window.DeviceMotionEvent){
  window.addEventListener("devicemotion", motion, false);
}else{
  console.log("DeviceMotionEvent is not supported");
}

function motion(event) {
	console.log(event);
// event.accelerationIncludingGravity.x
// event.accelerationIncludingGravity.y
// event.accelerationIncludingGravity.z
	var dom = document.getElementById('acc');
	if (dom) {
		dom.innerHTML = msg + ' banana: ' + event.accelerationIncludingGravity.x + ' ' + event.accelerationIncludingGravity.y + ' ' + event.accelerationIncludingGravity.z;
	}
}

window.onload = function(){
	thisthing();
}

/*window.onresize = function(){
	calculate_buttons_position();
}*/

document.addEventListener("keydown", keyDownTextField, false);

function keyDownTextField(e) {
	var keyCode = e.keyCode;
	console.log(keyCode);
}

document.ontouchmove = function(event){
	event.preventDefault();
}