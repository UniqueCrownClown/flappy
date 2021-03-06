var canvas, ctx;
var width, height, birdPos;
var sky, land, bird, pipe, pipeUp, pipeDown, scoreBoard, ready, splash;
var dist, birdY, birdF, birdN, birdV;
var animation, death, deathAnim;
var pipes = [], pipesDir = [], pipeSt, pipeNumber;
var score, maxScore;
var dropSpeed;
var flashlight_switch = false, hidden_switch = false;
var mode, delta;
var isSpecial;// 是否特殊模式
var wechat = false;
var playend = false, playdata = [];
var wxData;

var clearCanvas = function(){
	ctx.fillStyle = '#4EC0CA';
	ctx.fillRect(0, 0, width, height);
}

var loadImages = function(){
	var imgNumber = 9, imgComplete = 0;
	var onImgLoad = function(){
		imgComplete++;
		if(imgComplete == imgNumber){
			death = 1;
			dist = 0;
			birdY = (height - 112) / 2;
			birdF = 0;
			birdN = 0;
			birdV = 0;
			birdPos = width * 0.35;
			score = 0;
			pipeSt = 0;
			pipeNumber = 10;
			pipes = [];
			pipesDir = [];
			for(var i = 0; i < 10; ++i){
				pipes.push(Math.floor(Math.random() * (height - 300 - delta) + 10));
				pipesDir.push((Math.random() > 0.5));
			}
			drawCanvas();
		}
	}

	sky = new Image();
	sky.src = 'images/sky.png';
	sky.onload = onImgLoad;
	
	land = new Image();
	land.src = 'images/land.png';
	land.onload = onImgLoad;
	
	bird = new Image();
	bird.src = 'images/bird2.png';
	bird.onload = onImgLoad;
	
	pipe = new Image();
	pipe.src = 'images/pipe.png';
	pipe.onload = onImgLoad;
	
	pipeUp = new Image();
	pipeUp.src = 'images/pipe-up.png';
	pipeUp.onload = onImgLoad;
	
	pipeDown = new Image();
	pipeDown.src = 'images/pipe-down.png';
	pipeDown.onload = onImgLoad;
	
	scoreBoard = new Image();
	scoreBoard.src = 'images/scoreboard.png';
	scoreBoard.onload = onImgLoad;
	
	ready = new Image();
	ready.src = 'images/replay.png';
	ready.onload = onImgLoad;
	
	splash = new Image();
	splash.src = 'images/splash.png';
	splash.onload = onImgLoad;
}

function is_touch_device() {  
  try {  
    document.createEvent("TouchEvent");  
    return true;  
  } catch (e) {  
    return false;  
  }  
}

var initCanvas = function(){
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext('2d');
	canvas.width = width = window.innerWidth;
	canvas.height = height = window.innerHeight;
	if(is_touch_device()){
		canvas.addEventListener("touchend", function(e) { e.preventDefault(); }, false);
        canvas.addEventListener("touchstart", function(e) {
	        	jump();
            e.preventDefault();
        }, false);
	}
	else
		canvas.onmousedown = jump;
	window.onkeydown = jump;
	FastClick.attach(canvas);
	loadImages();
}

var deathAnimation = function(){
	if(splash){
		ctx.drawImage(splash, width / 2 - 94, height / 2 - 54);
		splash = undefined;
	}
	else {
        ctx.drawImage(scoreBoard, width / 2 - 118, height / 2 - 54);
        playend = true;
        playdata = [mode, score];
        if(window.window.WeixinApi && window.WeixinJSBridge) {
            //alert("您在 " + ["easy", "normal", "hard"][mode] + " 模式中取得 " + score + " 分，右上角分享成绩到朋友圈吧~");
        }
    }
	ctx.drawImage(ready, width / 2 - 57, height / 2 + 10);
	maxScore = Math.max(maxScore, score);
}

var drawSky = function(){
	var totWidth = 0;
	while(totWidth < width){
		ctx.drawImage(sky, totWidth, height - 221);
		totWidth += sky.width;
	}
}

var drawLand = function(){
	var totWidth = -dist;
	while(totWidth < width){
		ctx.drawImage(land, totWidth, height - 112);
		totWidth += land.width;
	}
	dist = dist + 2;
	var tmp = Math.floor(dist - width * 0.65) % 220;
	if(dist >= width * 0.65 && Math.abs(tmp) <= 1){
		score++;
		// testtest start
		if (score === 20) {
			// special模式,20分的时候,中止游戏
			clearInterval(animation);
			death = 1;
			cavToggle(0,0);
			const text =  `
			god: Congratulations,my lovely dancing princess,you overcome difficulties 
			and fly through the pipes successfully.now i can fulfill your dreams.what do you really want?</br>
			momo: i want love,happiness and freedom.but i do not know what things can make me achieve them.<br/>
			god: Um...all you should do is to slow down and enjoy right now.<br/>
			momo: oh,just like this?</br>
			god: Um...and cherish the people around you </br>
			momo: god,can you tell me what love is?</br>
			god: my treasure.Love is You!!!</br>
			`;
			ContentControl("Last words",text,"back");
		}
		// testtest end
	}
}

var drawPipe = function(x, y){
	ctx.drawImage(pipe, x, 0, pipe.width, y);
	ctx.drawImage(pipeDown, x, y);
	ctx.drawImage(pipe, x, y + 168 + delta, pipe.width, height - 112);
	ctx.drawImage(pipeUp, x, y + 144 + delta);
	if(x < birdPos + 32 && x + 50 > birdPos && (birdY < y + 22 || birdY + 22 > y + 144 + delta)){
		clearInterval(animation);
		death = 1;
	}
	else if(x + 40 < 0){
		pipeSt++;
		pipeNumber++;
		pipes.push(Math.floor(Math.random() * (height - 300 - delta) + 10));
		pipesDir.push((Math.random() > 0.5));
	}
	
}

var drawBird = function(){
//	ctx.translate(width * 0.35 + 17, birdY + 12);
//	var deg = -Math.atan(birdV / 2) / 3.14159;
//	ctx.rotate(deg);
	// ctx.drawImage(bird, 0, birdN * 24, bird.width, bird.height / 4, birdPos, birdY, bird.width, bird.height / 4);
	ctx.drawImage(bird, 0, 0, bird.width, bird.height, birdPos, birdY, bird.width, bird.height);
//	ctx.rotate(-deg);
//	ctx.translate(-width * 0.35 - 17, -birdY - 12);
	birdF = (birdF + 1) % 6;
	if(birdF % 6 == 0)
		birdN = (birdN + 1) % 4;
	birdY -= birdV;
	birdV -= dropSpeed;
	if(birdY + 138 > height){
		clearInterval(animation);
		death = 1;
	}
	if(death)
		deathAnimation();
}

var drawScore = function(){
	ctx.font = '20px "Press Start 2P"';
	ctx.lineWidth = 5;
    ctx.strokeStyle = '#fff';
	ctx.fillStyle = '#000';
	var txt = "" + score;
	ctx.strokeText(txt, (width - ctx.measureText(txt).width) / 2, height * 0.15);
	ctx.fillText(txt, (width - ctx.measureText(txt).width) / 2, height * 0.15);
}

var drawShadow = function() {
	var left_shadow = "linear, " + ((width * 0.35 - 170) / width * 100.) + "% 0, " + ((width * 0.35 + 60) / width * 100.) + "% 0, from(black), to(rgba(0,0,0,0))";
	var right_shadow = "linear, " + ((width * 0.35 + 190) / width * 100.) + "% 0, " + ((width * 0.35 - 30) / width * 100.) + "% 0, from(black), to(rgba(0,0,0,0))";
	var grd = ctx.createLinearGradient(width * 0.35 - 170, 0, width * 0.35 + 60, 0);
	grd.addColorStop(0, "black");
	grd.addColorStop(1, "rgba(0, 0, 0, 0)");
	ctx.fillStyle = grd;
	ctx.fillRect((width * 0.35 - 170), 0, 230, height);
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, (width * 0.35 - 170), height);
	grd = ctx.createLinearGradient(width * 0.35 - 30, 0, width * 0.35 + 190, 0);
	grd.addColorStop(0, "rgba(0, 0, 0, 0)");
	grd.addColorStop(1, "black");
	ctx.fillStyle = grd;
	ctx.fillRect((width * 0.35 - 30), 0, 220, height);
	ctx.fillStyle = "black";
	ctx.fillRect(width * 0.35 + 190, 0, width * 0.65 - 190, height);
}

var drawHidden = function() {
	ctx.fillStyle = "black";
	ctx.fillRect(width * 0.35, 30, 300, height - 180);
}

var drawCanvas = function(){
	clearCanvas();
	drawSky();
	for(var i = pipeSt; i < pipeNumber; ++i){
		// testtest start
		// const upText = "treasure";
		const downText= "momofighting";
		ctx.fillStyle = '#b2cf87';
		ctx.fillText(i<12?downText[i]:"", width - dist + i * 220 + 10, pipes[i] + 50);
		ctx.fillText(i<12?downText[i]:"", width - dist + i * 220 + 10, pipes[i] + 144 + delta);
		// testtest end
		drawPipe(width - dist + i * 220, pipes[i]);
		if(mode == 2){
			if(pipesDir[i]){
				if(pipes[i] + 1 > height - 300){
					pipesDir[i] = !pipesDir[i];
					pipes[i] -= 1;
				}
				else
					pipes[i] += 1;
			}
			else{
				if(pipes[i] - 1 < 10){
					pipesDir[i] = !pipesDir[i];
					pipes[i] += 1;
				}
				else
					pipes[i] -= 1;
			}
		}
	}
	drawLand();
	if(flashlight_switch)
		drawShadow();
	else if(hidden_switch)
		drawHidden();
	drawBird();
	drawScore();
}

var anim = function(){
	animation = setInterval(drawCanvas, 1000 / 60);
}

var jump = function(){
	if(death){
		dist = 0;
		birdY = (height - 112) / 2;
		birdF = 0;
		birdN = 0;
		birdV = 0;
		death = 0;
		score = 0;
		birdPos = width * 0.35;
		pipeSt = 0;
		pipeNumber = 10;
		pipes = [];
		pipesDir = [];
		for(var i = 0; i < 10; ++i){
			pipes.push(Math.floor(Math.random() * (height - 300 - delta) + 10));
			pipesDir.push((Math.random() > 0.5));
		}
		anim();
	}
	if(mode == 0)
		birdV = 6;
	else if(mode == 1)
		birdV = 6;
	else
		birdV = 6;
}

var special, easy, normal, hard;
function specialMode() {
	isSpecial = true;
	special.style["box-shadow"] = "0 0 0 2px #165CF3";
	easy.style["box-shadow"] = "";
	normal.style["box-shadow"] = "";
	hard.style["box-shadow"] = "";
	clearInterval(animation);
	dropSpeed = 0.3;
	mode = 0;
	delta = 100;
	initCanvas();
}

function easyMode(){
	isSpecial = false;
	special.style["box-shadow"] = "";
	easy.style["box-shadow"] = "0 0 0 2px #165CF3";
	normal.style["box-shadow"] = "";
	hard.style["box-shadow"] = "";
	clearInterval(animation);
	dropSpeed = 0.3;
	mode = 0;
	delta = 100;
	initCanvas();
}

function normalMode(){
	isSpecial = false;
	special.style["box-shadow"] = "";
	easy.style["box-shadow"] = "";
	normal.style["box-shadow"] = "0 0 0 2px #165CF3";
	hard.style["box-shadow"] = "";
	clearInterval(animation);
	dropSpeed = 0.3;
	mode = 1;
	delta = 0;
	initCanvas();
}

function hardMode(){
	isSpecial = false;
	easy.style["box-shadow"] = "";
	normal.style["box-shadow"] = "";
	hard.style["box-shadow"] = "0 0 0 2px #165CF3";
	clearInterval(animation);
	dropSpeed = 0.3;
	mode = 2;
	delta = 0;
	initCanvas();
}

function flashlight(){
	document.getElementById("flashlight").style.background = ["red", "rgba(255, 255, 255, 0.6)"][+flashlight_switch];
	flashlight_switch ^= 1;
}

function hidden(){
	document.getElementById("hidden").style.background = ["red", "rgba(255, 255, 255, 0.6)"][+hidden_switch];
	hidden_switch ^= 1;
}

function gameLoad() {
	maxScore = 0;
	dropSpeed = 0.3;
	mode = 0;
	delta = 100;
	isSpecial = true;
	initCanvas();
	special = document.getElementById("special");
	special.onclick = specialMode;
	easy = document.getElementById("easy");
    easy.onclick = easyMode;
	normal = document.getElementById("normal");
    normal.onclick = normalMode;
	hard = document.getElementById("hard");
    hard.onclick = hardMode;
	document.getElementById("flashlight").onclick = flashlight;
	//document.getElementById("hidden").onclick = hidden;
	window.onresize = function() {
		canvas.width = width = window.innerWidth;
		canvas.height = height = window.innerHeight;
		drawCanvas();
	}
}

function cavToggle(width,height) {
	canvas.width = width;
	canvas.height = height;
}

function ContentControl (title,text,fnText) {
	document.getElementById("special").style.display = "none";
	document.getElementById("easy").style.display = "none";
	document.getElementById("normal").style.display = "none";
	document.getElementById("hard").style.display = "none";
	document.getElementById("flashlight").style.display = "none";
	var h3 = document.createElement("h3");
	var p = document.createElement("p");
	var btn = document.createElement("Button");
	h3.innerText = title;
	p.innerHTML = text;
	btn.innerText = fnText;
	document.body.appendChild(h3);
	document.body.appendChild(p);
	document.body.appendChild(btn);
	btn.onclick = function(){
		document.getElementById("special").style.display = "inline-block";
		document.getElementById("easy").style.display = "inline-block";
		document.getElementById("normal").style.display = "inline-block";
		document.getElementById("hard").style.display = "inline-block";
		document.getElementById("flashlight").style.display = "block";
		h3.remove();
		p.remove();
		btn.remove();
		gameLoad();
	};
}

window.onload = function(){
    //document.addEventListener("touchend", function(e) { e.preventDefault(); }, false);
    // mode = 0;
    // score = 0;
    playdata = [0, 0];
    if(window.window.WeixinApi || window.WeixinJSBridge) {
        wechat = true;
        WeixinApi.ready(function(Api) {

            wxData = {
                "appId": "",
                "imgUrl" : 'http://shud.in/flappybird/images/logo.png',
                "imgWidth": '200',
                "imgHeight": '200',
                "link" : 'http://shud.in/flappybird',
                "desc" : 'Easy / Normal / Hard 三种难度, Flappy Bird 网页版',
                "title" : "Flappy Bird"
            };

            var wxCallbacks = {
                ready : function() {
                    wxData["title"] = 'Flappy Bird';
                    if(flashlight_switch)
                        wxData["desc"] = '我刚刚开启 flashlight, 在 ' + ["easy", "normal", "hard"][playdata[0]] + ' 下取得 ' + playdata[1] + ' 分, 你也来试试吧！';
                    else
                        wxData["desc"] = '我刚刚在 ' + ["easy", "normal", "hard"][playdata[0]] + ' 下取得 ' + playdata[1] + ' 分, 你也来试试吧！';
                },
                cancel : function(resp) {
                },
                fail : function(resp) {
                    alert("分享失败 > <");
                },
                confirm : function(resp) {
                    alert("分享成功 XD");
                },
                all : function(resp,shareTo) {
                }
            };

            // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
            Api.shareToFriend(wxData, wxCallbacks);

            // 点击分享到朋友圈，会执行下面这个代码
            Api.shareToTimeline(wxData, wxCallbacks);

            // 点击分享到腾讯微博，会执行下面这个代码
            Api.shareToWeibo(wxData, wxCallbacks);

            // iOS上，可以直接调用这个API进行分享，一句话搞定
            Api.generalShare(wxData, wxCallbacks);
        });
    }
	const text = `it should be a interesting things.
	it s my pleasure that if this can give you some encouragement.
	i ever said that it would have the next version when i am boring and have free time.
	i think that this time has come.(smile and cry emotion)
	the first version is the song from yujiayun which called with you.
	the second version is a small game which called flappy bird. 
	let us start the journey with this small game...
	A long long time ago, there is a pretty genie which called momo.
	as a dancing and flying princess,she wants to know what the love is. 
	she dreams to fly through the forest to chase her happiness and freedom.
	Legend has it that when she arrives,the god will help her get what she wants. 
	But before that,
	there are many pipes which stop her advance.
	what she should do is to fly through by not hit the pipes.
	so as a lovely genie,have a rest when you are tried of the study and boring life,
	go go go ...`;
	ContentControl("introduction",text,"Start Journey");
}
