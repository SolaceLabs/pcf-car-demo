// Global 'namespace' for the game.
var MyGame = {};

(function(MyGame, undefined) {
    'use strict';

    // This state loads the assets for the loading bar and sets
    // some options, then loads the game state that preloads game assets.
    MyGame.Init = function(game) {};

    MyGame.Init.prototype = {
        create: create,
        init: init,
        preload: preload,
        update: update,
        enterIncorrectOrientation: enterIncorrectOrientation,
        leaveIncorrectOrientation: leaveIncorrectOrientation

    };
    
    function create() {
    };

    function init() {
        // Set to single pointer input.
        this.input.maxPointers = 1;
        // Uncomment to disable automatic pause when game loses focus.
        //this.stage.disableVisibilityChange = true;

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        if (!this.game.device.desktop) {
            this.scale.forceOrientation(true, false); // Landscape
            this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
        }
        this.scale.refresh();
    }

    function preload() {
        // Load images for use in Loader state.
        this.load.image('loadingBar', 'assets/images/loading-bar.png');
        this.load.image('loadingBarBg', 'assets/images/loading-bar-bg.png');
    }

    function update() {
        this.state.start('Loader');
    }

    function enterIncorrectOrientation() {
        MyGame.isOriented = false;
        // Show something to the user to have them re-orient.

        if(!this.game.device.desktop){
          document.getElementById("orientation").style.display="block";
          this.game.paused = true;
        }
    }

    function leaveIncorrectOrientation() {
        MyGame.isOriented = true;
        // Get back to the game!

        if(!this.game.device.desktop){
          document.getElementById("orientation").style.display="none";
          this.game.paused = false;
        }
    }
})(MyGame);

(function(MyGame, undefined) {
    'use strict';

    MyGame.Game = function(game) {
        this.ready = false;
    };

    MyGame.Game.prototype = {
        generateID: generateID,
        create: create,
        update: update,
        logTap: logTap,
        setDrag: setDrag,
        tapStart: tapStart,
        tapStop: tapStop,
        fixit: fixit,
        onDragStop: onDragStop,
        setTapZone: setTapZone,
        zoneInputEnable: zoneInputEnable,
        helpHandler: helpHandler,
        guiHandler: guiHandler,
        showNameGui: showNameGui
    };

    function generateID() {
      var d = new Date().getTime();
      if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
          d += performance.now(); //use high-precision timer if available
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }

    function create() {
      this.isMoving = false;
      this.isAccelerating = false;
      this.isOnTransition = false;

      this.maxBgVelocity = 8;
      this.bgVelocity = 0;
      this.bgVelocityStep = 0.2;

      this.maxRotateVelocity = 0.4;
      this.rotateVel = 0;
      this.rotateVelStep = 0.01;
      this.drivingLoopSound = this.game.add.audio( 'driving_loop', 1);
      var loopData = this.cache.getSound('driving_loop');
      var startGap = 0;
      var endGap = 0;
      this.loopByMarker = false;
      if (loopData.url=="assets/audio/driving_loop4.m4a"){
        startGap = 0.033;
        endGap = 1.978;
        this.drivingLoopSound.addMarker('loop', startGap, endGap-startGap);
        this.loopByMarker = true;
        console.log('marker');
      }
            
      this.audio = this.game.add.audioSprite('audiosprite');
      this.audio.allowMultiple = true;
      var offset = 0.049;
      this.audio.sounds['driving'].markers["driving"].loop = true;
      this.audio.sounds['driving'].markers["driving"].start += offset;
      this.audio.sounds['driving'].markers["driving"].duration -= offset;
      this.audio.sounds['driving'].markers["driving"].durationMS -= offset*1000
            
      this.background = this.game.add.tileSprite(0, -200, this.game.width, 400, 'spritesheet', 'bg cropped');
      this.background.scale.set(2.4);

      this.car = new Car(this.game, this.game.world.centerX, this.game.world.centerY+50, null);
      
      this.logo = this.game.add.sprite(this.game.world.width-15, this.game.world.height-20, 'spritesheet', 'solace-logo');
      this.logo.anchor.set(1);
      this.logo.scale.set( 0.5);
      
      this.startButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY+280, 'spritesheet', this.fixit, this, 'fix-it-button-up','fix-it-button-up', 'fix-it-button-down');
      this.startButton.anchor.set( 0.5);
      this.startButton.scale.set( 1.5);
      this.startButton.inputEnabled = true;
      this.startButton.visible = false;
      
      this.helpButton = this.game.add.sprite(this.game.world.width-100, 100, 'spritesheet', 'tutorial');
      this.helpButton.anchor.set(0.5);
      this.helpButton.inputEnabled = true;
      this.helpButton.events.onInputDown.add(this.helpHandler, this);
      
      this.tutorial = new Tutorial(this.game, 0, 0, this.helpHandler, this);
      this.isFirstTutorial = true;
      
      this.zonePoints = {
        'REAR_TIRE': [
          {x: 208.69565217391303 , y: 443.4782608695652 }, {x: 135.17391304347825 , y: 620.8695652173913 },
          {x: 427.82608695652175 , y: 629.5652173913044 }, {x: 354.7826086956522 , y: 445.2173913043478 }
        ],
        'FRONT_TIRE': [
          {x: 899.1304347826086 , y: 438.2608695652174 }, {x: 846.9565217391304 , y: 613.9130434782609 },
          {x: 1149.5652173913043 , y: 619.1304347826086 }, {x: 1071.304347826087 , y: 462 }
        ],
        'ENGINE': [
          {x: 881.7391304347826 , y: 330 },  {x: 1210.4347826086955 , y: 535 },
          {x: 1262.6086956521738 , y: 200.04347826086956 }, {x: 1020.8695652173913 , y: 255.65217391304347 }
        ],
        'LIGHT': [
          {x: 38.26086956521739 , y: 219.39130434782606 }, {x: 43.47826086956522 , y: 561.7391304347826 },
          {x: 286.95652173913044 , y: 344.3478260869565 }, {x: 175.65217391304347 , y: 219.1304347826087 }
        ],
      }

      this.rearWheelZone = this.setTapZone('REAR_TIRE');
      this.frontWheelZone = this.setTapZone('FRONT_TIRE');
      this.engineZone = this.setTapZone('ENGINE');
      this.lightZone = this.setTapZone('LIGHT');
      this.zoneInputEnable(false);
      this.helpButton.inputEnabled = false;
      
      this.audio.play('idle');
      this.tapStart();
      this.game.time.events.add(1400, function() {
        this.showNameGui();
        this.helpButton.inputEnabled = true;
      }, this);
      
      var carId = generateID();

        var hostname = "tcp.apps.pcfdemo.solacemessaging.net";
        var port = 50977;
        var clientId = carId;
        var userName = "v005.cu000045";
        var passWord = "26f6a46c-5616-4bb5-bf3c-a8305ab047b4";

        // Create an MQTT client instance
        var client = new Paho.MQTT.Client(hostname, port, clientId);

        // set callback handlers
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;

       var options = {
          invocationContext: {host : hostname, port: port, path: "", clientId: clientId},
          cleanSession: true,
          onSuccess: onConnect,
          onFailure: onFail
        };

        options.userName = userName;
        options.password = passWord;

        // connect the MQTT client
        client.connect(options);
        console.log('Connecting...');

        // called when the client connects
        function onConnect(context) {
          console.log("Connected");
        }

        function onFail(context) {
          console.log("Failed to connect");
        }

        // called when the client loses its connection
        function onConnectionLost(responseObject) {
          if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:"+responseObject.errorMessage);
          }
        }

        // called when a message arrives
        function onMessageArrived(message) {
          console.log("onMessageArrived:"+message.payloadString);
        }

      this.apiClient = new APIclient(carId, client);
    }
    
    function showNameGui() {
      var that = this;
      swal({
          title: "Please enter your name", 
          type: "input",
          showCancelButton: false,
          closeOnConfirm: false,
          closeOnCancel: false,
          confirmButtonText: "Start!",
          animation: "slide-from-top",
          inputPlaceholder: "Enter your Name...",
          confirmButtonColor: "#ED7D31",
          allowEscapeKey: false,
          allowOutsideClick: false
        },
        function(inputValue){
          if (inputValue === false){ 
            return false;
          }
          
          if (inputValue === "") {
            swal.showInputError("You need to write your name!");
            return false
          }
          that.guiHandler(inputValue); 
          swal.close();
        }
      );
    }

    function guiHandler(name) {
      this.apiClient.newCar(name);
      this.helpHandler();
    }
    
    function helpHandler() {
      var isInputEnabled = true;
      if(this.tutorial.isHidden){
          this.tutorial.show();
          isInputEnabled = false;
      }
      else{
        if (this.isFirstTutorial){
          this.isFirstTutorial = false;
          this.tapStart();
        }
      }
      
      this.zoneInputEnable(isInputEnabled);
      
    }
    
    function zoneInputEnable(isInputEnabled) {
      this.rearWheelZone.inputEnabled = isInputEnabled;
      this.frontWheelZone.inputEnabled = isInputEnabled;
      this.engineZone.inputEnabled = isInputEnabled;
      this.lightZone.inputEnabled = isInputEnabled;
    }
    
    function setTapZone(key) {
      var points = this.zonePoints[key];
      var poly = new Phaser.Polygon();
      var graphics = this.game.add.graphics(0, 0);
      var phaserPoints = []
      for (var i = 0; i <= points.length-1; i++) {
        phaserPoints.push(new Phaser.Point(points[i].x, points[i].y));
      }
        
      poly.setTo(phaserPoints);
      graphics.beginFill(0xFF33ff, 0);
      graphics.drawPolygon(poly.points);
      graphics.endFill();
      graphics.inputEnabled = true;
      graphics.events.onInputDown.add(this.tapStop, this);
      graphics.faultKey = key;
      
      return graphics;
    }
    
    function setDrag(sprite) {
      sprite.inputEnabled = true;
      sprite.input.enableDrag();
      sprite.events.onDragStop.add(this.onDragStop, this);
    }

    function onDragStop(sprite, pointer) {
        var result = sprite.key + " dropped at x:" + sprite.x + " y: " + sprite.y;
        console.log(result);
    }
    
    function fixit(){
      this.apiClient.clearFault();
      this.tapStart();
    }
    
    function tapStart(){
      if (this.isOnTransition){
        return true;
      }
          
      if (!this.isMoving){
        this.car.startMove();
        this.isMoving = true;
        this.isAccelerating = true;
        this.isOnTransition = true;
        this.startButton.visible = false;
        
        this.audio.play('idle-to-drive');
        this.audio.stop('idle');
        this.game.time.events.add(500, function() {
            if (this.loopByMarker){
                this.drivingLoopSound.play('loop', 0, 1, true);
            }
            else {
                this.drivingLoopSound.loopFull();
            }            
        }, this);
      }
    }
    
    function tapStop(sprite, pointer){
      if (this.isOnTransition){
        return true;
      }

      if (this.isMoving){
        this.car.endMove(sprite.faultKey);
        this.apiClient.newFault(sprite.faultKey);
        
        if (sprite.faultKey=='REAR_TIRE' || sprite.faultKey=='FRONT_TIRE'){ 
          this.audio.play('flat-tire'); 
          this.game.time.events.add(500, function() {
            this.audio.play('flat-deflate'); 
          }, this);
        }
        if (sprite.faultKey=='ENGINE'){ this.audio.play('car-dying'); }
        if (sprite.faultKey=='LIGHT'){ this.audio.play('glass-shatter_1'); }
        
        this.isAccelerating = false;
        this.isOnTransition = true;
        
        this.audio.play('drive-slow-to-idle');
        this.drivingLoopSound.stop();
        this.audio.play('idle');
      }
    }

    function update() {
      // bg & rotation incremental movement
      if (this.isOnTransition && this.isAccelerating){
        if (this.bgVelocity>=this.maxBgVelocity){
          this.bgVelocity = this.maxBgVelocity;
          this.isOnTransition = false;

          this.rotateVel = this.maxRotateVelocity;
        }
        else{
          this.bgVelocity += this.bgVelocityStep;

          this.rotateVel += this.rotateVelStep;
        }
      }

      if (this.isOnTransition && !this.isAccelerating){
        if (this.bgVelocity<=0){
          this.bgVelocity = 0;
          this.isOnTransition = false;
          this.isMoving = false;

          this.rotateVel = 0;

          this.car.stopMove();
          this.game.time.events.add(700, function() {
            this.startButton.visible = true;
          }, this);
        }
        else{
          this.bgVelocity -= this.bgVelocityStep;

          this.rotateVel -= this.rotateVelStep;
        }
      }

      if (this.isMoving){
          this.background.tilePosition.x = this.background.tilePosition.x - this.bgVelocity;
          this.car.fwheel.fcap.rotation += this.rotateVel;
          this.car.rwheel.rcap.rotation += this.rotateVel; 
      }
    }

    function render(){
      this.game.debug.text(this.game.time.fps || '--', 300, 300, "#00ff00", '36px Courier');
      var pos = this.game.input.activePointer.position;
      this.game.debug.text("x:" + pos.x.toFixed(2) + " y:" + pos.y.toFixed(2), 120, 180, "#000000", '30px Courier');
    }
    
    function logTap(pointer) {
      console.log(  '{x: '+ pointer.x  + ' , y: '+ pointer.y  + ' }');
    }  

})(MyGame);

(function(MyGame, undefined) {
    'use strict';

    // This state loads all the game assets while displaying
    // "Loading..." text and a loading bar to show progress.
    MyGame.Loader = function(game) {
        this.ready = false;
    };

    MyGame.Loader.prototype = {
        preload: preload,
        create: create,
        update: update
    };

    function preload() {
        var fontStyle = {
            font: '24px sans-serif',
            fill: '#7edcfc'
        };

        this.game.time.advancedTiming = true;

        // A somewhat contrived example of using objects.
        this.loadingBar = new MyGame.LoadingBar(this.game);
        this.load.setPreloadSprite(this.loadingBar.bar);

        // Changing the fontStyle will require adjustment to the location here.
        this.loadingText = this.add.text(this.world.centerX, this.world.centerY - 30, 'Loading...', fontStyle);
        this.loadingText.anchor.setTo(0.5, 0.5);

        // Make your loading bar any color!
        // this.loadingBar.background.tint = 0x7edcfc;
        this.loadingBar.background.tint = 0x88D7F7;
        this.loadingBar.bar.tint = 0xdcfc7e;

        this.load.audio('driving_loop', ['assets/audio/driving_loop4.ogg', 'assets/audio/driving_loop4.m4a', ] );
        this.load.audiosprite('audiosprite', ['assets/audio/audioSprite.ogg', 'assets/audio/audioSprite.m4a'], 'assets/audio/audioSprite.json');
        this.load.atlasJSONHash( 'spritesheet', 'assets/images/spritesheet.png', 'assets/images/spritesheet.json');
    }

    function create() {
        this.loadingBar.bar.cropEnabled = false;
    }

    function update() {
        // Make sure audio is decoded before moving on to the next state.
        if (this.cache.isSoundDecoded('audiosprite') && this.ready === false) {
           this.ready = true;
        }
        if (this.ready === true) {
            this.state.start('Game');
        }
    }
})(MyGame);

(function(MyGame, undefined) {
    'use strict';

    // Create the Phaser game instance.
    MyGame.game = new Phaser.Game(1280, 720, Phaser.AUTO);

    // Set anything that needs to be accesible across states here.
    MyGame.isOriented = false;

    // Add states.
    MyGame.game.state.add('Init', MyGame.Init, true); // Auto start this state
    MyGame.game.state.add('Loader', MyGame.Loader);
    // Add additional states here. 
    MyGame.game.state.add('Game', MyGame.Game);
})(MyGame);

var APIclient = function (id, client) {
  this.id = id;
  this.driverName = null;
  this.client = client;
  
  // set in index.html
  this.urlbase = URL_API_CAR_GAME;
  
  var that = this;
  $(window).on("beforeunload", function(e) {
    that.removeCar();
  });
};

APIclient.prototype.newCar = function(name){
  this.driverName = name;

  // /car/new/<car ID>/<driver name>
  var url = this.urlbase + '/new/' + this.id + '/' + name;
  this.makeCall(url);
}

APIclient.prototype.newFault = function(key){
  this.driverName = name;

  // /car/fault/<car ID>/<fault type>
  var url = this.urlbase + '/fault/' + this.id + '/' + key;
  this.makeCall(url);
}

APIclient.prototype.clearFault = function(){

  // /car/clear/<car ID>
  var url = this.urlbase + '/clear/' + this.id;
  this.makeCall(url);
}

APIclient.prototype.removeCar = function(){

  // /car/remove/<car ID>
  if (this.id!=null){
    var url = this.urlbase + '/remove/' + this.id;
    this.makeCall(url);
  }
}

APIclient.prototype.makeCall = function(url){
    var message = new Paho.MQTT.Message(" ");
    message.destinationName = url;
    this.client.send(message);
}

/*

   1.   New car:
   /car/new/<car ID>/<driver name>
   
   where <car ID> is the phone user provided name of the car
   
   2.	Create fault in car:
   /car/fault/<car ID>/<fault type>
   
   where <fault type> can be one of FRONT_TIRE, REAR_TIRE, LIGHT, ENGINE
   
   3.	Clear fault (all faults will be cleared):
   /car/clear/<car ID>
   
   4.	Remove car from demo:
   /car/remove/<car ID>

*/

var Car = function(game, x, y, frame) {
  Phaser.Sprite.call(this, game, x, y, 'spritesheet', 'null');

  this.anchor.set(0.5, 0.5);
  this.scale.set(1.6);
  this.game.add.existing(this);

  this.lastFaultKey = '';
  
  // initialize your prefab here
  this.carContainer = this.game.add.sprite(0,0,'spritesheet', 'null');
  this.carContainer.anchor.set(0.5);
  this.addChild(this.carContainer);

  this.shadow = this.game.add.sprite(0, 124, 'spritesheet', 'shadow');
  this.shadow.anchor.set(0.5);
  this.addChild(this.shadow);

  // INNER CAR
  this.belt = this.game.add.sprite(-95, -50, 'spritesheet', 'seatbelt');
  this.belt.anchor.set(0.5);
  this.carContainer.addChild(this.belt);

  this.man = this.game.add.sprite(-80, -70, 'spritesheet', 'man/man0001');
  this.man.anchor.set(0.5);
  this.carContainer.addChild(this.man);
  var manframes = Phaser.Animation.generateFrameNames('man/man', 1, 6, '', 4);
  this.man.animations.add('drive', manframes, 10, true);
  var sadframes = Phaser.Animation.generateFrameNames('man sad/sad man resized', 1, 6, '', 4);
  this.man.animations.add('sad', sadframes, 10, false);

  this.hands = this.game.add.sprite(-4, -43, 'spritesheet', 'hands/hands0001');
  this.hands.anchor.set(0.5);
  this.carContainer.addChild(this.hands);
  var handframes = Phaser.Animation.generateFrameNames('hands/hands', 1, 9, '', 4);
  this.hands.animations.add('drive', handframes, 10, true);

  // CAR
  this.smoke = this.game.add.sprite(198, -86, 'spritesheet', 'smoke intro/smokeintro0001');
  this.smoke.anchor.set(0.5);
  this.carContainer.addChild(this.smoke);
  var introframes = Phaser.Animation.generateFrameNames('smoke intro/smokeintro', 1, 12, '', 4);
  var introAnim = this.smoke.animations.add('intro', introframes, 25, false);
  var loopframes = Phaser.Animation.generateFrameNames('smoke loop/smoke', 1, 15, '', 3);
  this.smoke.animations.add('loop', loopframes, 25, true);
  introAnim.onComplete.add(function() {
    this.smoke.play('loop');
  }, this);

  this.smoke.visible = false;

  this.car = this.game.add.sprite(0,0,'spritesheet', 'car_brake_light');
  this.car.anchor.set(0.5);
  this.carContainer.addChild(this.car);

  this.carOk = this.game.add.sprite(-this.car.width*0.5, -this.car.height*0.5, 'spritesheet', 'car_cropped');
  this.car.addChild(this.carOk);

  this.lights = this.game.add.sprite(-338, 50, 'spritesheet', 'broken light/glass0001');
  this.lights.anchor.set(0.5);
  this.addChild(this.lights);
  var lightsframes = Phaser.Animation.generateFrameNames('broken light/glass000', 1, 4, '', 0);
  this.lights.animations.add('broke', lightsframes, 10, false);
  this.lights.visible = false;

  this.wheelY = 68;
  this.fwheel = this.game.add.sprite(219, this.wheelY, 'spritesheet', 'tire/tire normal');
  this.fwheel.anchor.set(0.5);
  this.addChild(this.fwheel);
  var wheelframes = Phaser.Animation.generateFrameNames('tire/tire_flat', 1, 4, '', 4);
  this.fwheel.animations.add('broke', wheelframes, 16, false);

  this.fwheel.fcap = this.game.add.sprite(0, 0, 'spritesheet', 'tire/hubcap');
  this.fwheel.fcap.anchor.set(0.5);
  this.fwheel.addChild(this.fwheel.fcap);

  this.rwheel = this.game.add.sprite(-224, this.wheelY, 'spritesheet', 'tire/tire normal');
  this.rwheel.anchor.set(0.5);
  this.addChild(this.rwheel);
  this.rwheel.animations.add('broke', wheelframes, 16, false);

  this.rwheel.rcap = this.game.add.sprite(0, 0, 'spritesheet', 'tire/hubcap');
  this.rwheel.rcap.anchor.set(0.5);
  this.rwheel.addChild(this.rwheel.rcap);
};

Car.prototype = Object.create(Phaser.Sprite.prototype);
Car.prototype.constructor = Car;

Car.prototype.startMove = function() {
  this.hands.play('drive');
  this.man.play('drive');
  this.game.add.tween(this.carContainer).to({y: this.carContainer.y+2}, 600, Phaser.Easing.Linear.None, true, 0, -1, true);
  this.game.add.tween(this.shadow.scale).to({x: 1.02}, 600, Phaser.Easing.Linear.None, true, 0, -1, true);

  this.carOk.visible = true;
  this.lights.visible = false;
  this.smoke.visible = false;

  this.game.tweens.removeFrom(this.fwheel);
  this.game.tweens.removeFrom(this.rwheel);
  this.fwheel.y = this.wheelY;
  this.rwheel.y = this.wheelY;

  this.fwheel.loadTexture('spritesheet', 'tire/tire normal');
  this.rwheel.loadTexture('spritesheet', 'tire/tire normal');
};

Car.prototype.endMove = function(key) {
  this.game.tweens.removeFrom(this.carContainer);
  this.car.y = 0;
  this.game.tweens.removeFrom(this.fwheel);
  this.fwheel.rotation = 0;
  this.game.tweens.removeFrom(this.rwheel);
  this.rwheel.rotation = 0;
  this.game.tweens.removeFrom(this.shadow.scale);
  this.shadow.scale.x = 1;

  this.carContainer.y = 0;

  this.hands.animations.stop();
  this.man.play('sad');
  this.lastFaultKey = key;
  
  if (key=='FRONT_TIRE'){
    var wheelTween = this.game.add.tween(this.fwheel).to({y: this.fwheel.y+5}, 100, Phaser.Easing.Linear.None, true, 0, 6, false);
  }
  if (key=='REAR_TIRE'){
    var wheelTween = this.game.add.tween(this.rwheel).to({y: this.rwheel.y+5}, 100, Phaser.Easing.Linear.None, true, 0, 6, false);
  }
  
  if (key=='LIGHT'){
    this.lights.visible = true;
    this.lights.play('broke');
    this.carOk.visible = false;
  }
  
  if (key=='ENGINE'){
    this.smoke.visible = true;
    this.smoke.play('intro');
  }

};

Car.prototype.stopMove = function() {
  this.game.tweens.removeFrom(this.fwheel);
  this.game.tweens.removeFrom(this.rwheel);
  
  var faultyWheel = null;
  if (this.lastFaultKey=='REAR_TIRE'){
    faultyWheel = this.rwheel;
  }
  if (this.lastFaultKey=='FRONT_TIRE'){
    faultyWheel = this.fwheel;
  }
  if (faultyWheel!=null){
    faultyWheel.y = this.wheelY;
    faultyWheel.play('broke');
    faultyWheel.rotation = 0;
    this.game.add.tween(faultyWheel).to({y: faultyWheel.y+5}, 200, Phaser.Easing.Linear.None, true);    
  }

}

var Foo = function(game, x, y, frame) {
  Phaser.Sprite.call(this, game, x, y, frame);

  this.anchor.set(0.5, 0.5);
  this.game.add.existing(this);
};

Foo.prototype = Object.create(Phaser.Sprite.prototype);
Foo.prototype.constructor = Foo;

Foo.prototype.update = function() {
};

(function(MyGame, undefined) {
    'use strict';

    MyGame.LoadingBar = function(game, parent) {
        Phaser.Group.call(this, game, parent);

        // Images loaded by MyGame.Init
        this.background = game.add.sprite(game.world.centerX, game.world.centerY, 'loadingBarBg');
        this.background.anchor.setTo(0.5, 0.5);
        this.add(this.background);

        // Left to right loading bar
        this.bar = game.add.sprite(game.world.centerX - 175, game.world.centerY - 16, 'loadingBar');

        this.add(this.bar);
    };

    MyGame.LoadingBar.prototype = Object.create(Phaser.Group.prototype);
    MyGame.LoadingBar.prototype.constructor = MyGame.LoadingBar;
})(MyGame);

var Tutorial = function(game, x, y, hideCallback, hideCallbackcontext) {
  Phaser.Sprite.call(this, game, x, y, 'spritesheet', 'null');
  this.anchor.set(0.5, 0.5);
  this.game.add.existing(this);

  this.hideCallback = hideCallback;
  this.hideCallbackcontext = hideCallbackcontext;
  
  // initialize your prefab here
  this.bg = this.game.add.graphics(0, 0);
  this.bg.beginFill(0x000000, 0.5);
  this.bg.drawRect(0, 0, this.game.width, this.game.height);
  this.bg.alpha = 0;
  this.bg.endFill();
  this.bg.inputEnabled = true;
  this.bg.events.onInputDown.add(this.hide, this);
  
  this.panel = this.game.add.graphics(0, 0);
  this.panel.beginFill(0xFFFFFF, 0.9);
  var xmargin = 200;
  var ymargin = 100;
  this.panel.drawRoundedRect(xmargin, ymargin, this.game.width-xmargin*2, this.game.height-ymargin*2, 10);
  this.panel.alpha = 0;
  this.panel.endFill();
  this.panel.inputEnabled = true;
  this.panel.events.onInputDown.add(this.hide, this);

  this.title = this.game.add.text(this.panel.width*0.5+200, 190, 'Tap One of the Targets',
      { font: "56px sans-serif", fill: "#333333 ", align: "center" });
  this.title.anchor.set(0.5,0.5);
  this.panel.addChild(this.title);
  
  this.car = new Car(this.game, 0, 0, null);
  this.car.scale.set(0.8);
  this.panel.addChild(this.car);
  this.car.reset(this.panel.width*0.5+200, this.panel.height*0.5+100);
  this.car.shadow.visible = false;
  
  this.startButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY+190, 'spritesheet', this.hide, this, 'fix-it-button-up','fix-it-button-up', 'fix-it-button-down');
  this.startButton.anchor.set( 0.5);
  this.startButton.scale.set( 1);
  this.startButton.inputEnabled = true;
  this.panel.addChild(this.startButton);
  this.startButton.visible = false;
  
  this.closeButton = this.game.add.sprite(1078, 108, 'spritesheet', 'close');
  this.closeButton.anchor.set(0.5);
  this.closeButton.scale.set(0.7);
  this.panel.addChild(this.closeButton);
  
  this.targets = [ 
    {x: 460.8695652173913 , y: 430 },
    {x: 380 , y: 330 },
    {x: 850.7826086956521 , y: 325 },
    {x: 815.6521739130435 , y: 430 } 
  ];
  
  this.target1 = this.createTarget(this.targets[0]);
  this.target2 = this.createTarget(this.targets[1]);
  this.target3 = this.createTarget(this.targets[2]);
  this.target4 = this.createTarget(this.targets[3]);
  
  this.hand = this.game.add.sprite(this.panel.width*0.5, this.panel.height*0.5, 'spritesheet', 'hand');
  this.hand.anchor.set(0.5,0);
  this.hand.scale.set(0.7);
  this.hand.alpha = 0;
  this.panel.addChild(this.hand);
  
  this.bg.visible = false;
  this.panel.visible = false;
  this.isHidden = true;
  
  this.tweenTime = 500;
  this.waitTime = 300;
  this.waitTime2 = 150;
  this.scaleGapTime = 150;
  
  this.t1time = 1700;
  this.t2time = 2500;
  this.t3time = 3300;
  this.t4time = 4100;
};

Tutorial.prototype = Object.create(Phaser.Sprite.prototype);
Tutorial.prototype.constructor = Tutorial;

Tutorial.prototype.createTarget = function(point) {
  var target = this.game.add.sprite(point.x, point.y, 'spritesheet', 'hand');
  target.anchor.set(0.5);
  var pulseframes = Phaser.Animation.generateFrameNames('target cycle/target test', 1, 13, '', 4);
  target.animations.add('pulse', pulseframes, 10, true);
  
  var sparkframes = Phaser.Animation.generateFrameNames('spark/target test', 14, 16, '', 4);
  sparkframes.push('null');
  target.animations.add('spark', sparkframes, 10, false);
  
  this.panel.addChild(target);
  
  return target;
};

Tutorial.prototype.show = function() {
  this.bg.visible = true;
  this.panel.visible = true;
  this.game.add.tween(this.bg).to({alpha: 0.85}, 900, Phaser.Easing.Linear.None, true);
  this.game.add.tween(this.panel).to({alpha: 0.95}, 600,  Phaser.Easing.Cubic.In, true);
  
  this.animHand();
  this.isHidden = false;
  
  this.bg.inputEnabled = false;
  this.panel.inputEnabled = false;
  this.startButton.inputEnabled = false;
  this.game.time.events.add(800, function() {
    this.bg.inputEnabled = true;
    this.panel.inputEnabled = true;
    this.startButton.inputEnabled = true;
  }, this);
};

Tutorial.prototype.hide = function() {
  if (this.isHidden){
    return;
  }
  
  this.game.add.tween(this.bg).to({alpha: 0}, 900, Phaser.Easing.Linear.None, true);
  this.game.add.tween(this.panel).to({alpha: 0}, 600,  Phaser.Easing.Cubic.In, true);
  
  this.game.tweens.removeFrom(this.hand);
  this.game.tweens.removeFrom(this.hand.scale);
  this.game.time.events.remove(this.hand.t1Timer);
  this.game.time.events.remove(this.hand.t2Timer);
  this.game.time.events.remove(this.hand.t3Timer);
  this.game.time.events.remove(this.hand.t4Timer);
  this.game.time.events.remove(this.target1.sparkTimer);
  this.game.time.events.remove(this.target2.sparkTimer);
  this.game.time.events.remove(this.target3.sparkTimer);
  this.game.time.events.remove(this.target4.sparkTimer);
  
  this.hideCallback.call(this.hideCallbackcontext);
  this.isHidden = true;
  
  this.game.time.events.add(800, function() {
    this.bg.visible = false;
    this.panel.visible = false;
  }, this);
  
};

Tutorial.prototype.animHand = function() {
  this.game.tweens.removeFrom(this.hand);
  this.game.tweens.removeFrom(this.hand.scale);

  var t1 = this.targets[0];
  var t2 = this.targets[1];
  var t3 = this.targets[2];
  var t4 = this.targets[3];
  
  // hand animation
  var initial = {x: this.game.world.centerX, y: this.game.world.centerY+100};
  this.hand.reset(initial.x, initial.y);
  this.hand.alpha = 0;
  var foo =  this.game.add.tween(this.hand).to({alpha: 1}, this.tweenTime)
  .to({x: t1.x+15, y: t1.y}, this.tweenTime, Phaser.Easing.Linear.None, false, this.waitTime+this.waitTime2)
  .to({x: t2.x+15, y: t2.y}, this.tweenTime, Phaser.Easing.Linear.None, false, this.waitTime+this.waitTime2)
  .to({x: t3.x+15, y: t3.y}, this.tweenTime, Phaser.Easing.Linear.None, false, this.waitTime)
  .to({x: t4.x+15, y: t4.y}, this.tweenTime, Phaser.Easing.Linear.None, false, this.waitTime)
  .to({alpha: 0}, this.tweenTime, Phaser.Easing.Linear.None, false, this.waitTime).loop().start();
  
  this.scaleAnimHand();
  this.animTargets();
  
  foo.onLoop.add(function(){
    this.scaleAnimHand();
    this.animTargets();
  }, this);
};

Tutorial.prototype.scaleAnimHand = function() {
  this.hand.scale.set(1);
  
  this.game.add.tween(this.hand.scale);
  this.game.time.events.remove(this.hand.t1Timer);
  this.game.time.events.remove(this.hand.t2Timer);
  this.game.time.events.remove(this.hand.t3Timer);
  this.game.time.events.remove(this.hand.t4Timer);
  
  this.hand.t1Timer = this.addTapTween(this.hand, this.t1time);
  this.hand.t2Timer = this.addTapTween(this.hand, this.t2time);
  this.hand.t3Timer = this.addTapTween(this.hand, this.t3time);
  this.hand.t4Timer = this.addTapTween(this.hand, this.t4time);
}

Tutorial.prototype.addTapTween = function(hand, time) {
  var downScale = 0.7;
  var tweenTimer = this.game.time.events.add(time, function() {
    this.game.add.tween(hand.scale)  
    .to({x: downScale, y: downScale}, this.tweenTime*0.5-this.scaleGapTime, Phaser.Easing.Linear.None, true, 0, 0, true)
  }, this);
  return tweenTimer;
}

Tutorial.prototype.animTargets = function() {
  this.addSparkTimer(this.target1, this.t1time+50);
  this.addSparkTimer(this.target2, this.t2time+50);
  this.addSparkTimer(this.target3, this.t3time+50);
  this.addSparkTimer(this.target4, this.t4time+50);
}

Tutorial.prototype.addSparkTimer = function(target, time) {
  this.game.time.events.remove(target.sparkTimer);
  target.play('pulse');
  target.sparkTimer = this.game.time.events.add(time, function() {
    target.play('spark');
  }, this);
}
