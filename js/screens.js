game.preLoadScreen = me.ScreenObject.extend({
    "init" : function() {
        this.parent(true);
        this.font = new me.Font("arcade", 12, "#FFFF00", "center");
    },    
    "draw" : function(context) {
        this.font.draw(context, "COOKING SAUSAGES, PLEASE WAIT", 128, 160);
    }
})

game.titleScreen = me.ScreenObject.extend({
    "init" : function() { 
        this.parent(true);
        this.font = new me.Font("arcade", 12, "#FFFFFF");
        this.title = null;
    },
    "onResetEvent" : function() {
        if (this.title===null) {
            this.title = me.loader.getImage("title");
        }
        if (!localStorage.hiScore) {
            localStorage.hiScore = 0;
        } else game.hiScore = localStorage.hiScore;
        me.input.bindKey(me.input.KEY.SPACE, "space", true);
    },
    "update" : function() {
        if (me.input.isKeyPressed("space")) {
            me.state.change(me.state.PLAY);
            }
        return true;
    },
    "draw" : function(context) {
        context.drawImage(this.title, 0, 0);
        this.font.draw(context, "HI-SCORE: "+game.hiScore, 0, 0);
    },
    "onDestroyEvent" : function() {
        me.input.unbindKey(me.input.KEY.SPACE);
    }
});

game.playScreen = me.ScreenObject.extend({
    "init" : function() {
        this.parent(true);
    },
    "onResetEvent" : function() {
        me.levelDirector.loadLevel("main");
        me.game.addHUD(0, 0, 256, 320);
        me.game.HUD.addItem("score", new game.score(150, 0));
        me.game.HUD.addItem("time", new game.hud(0, 0));
        me.game.sort();
        
        //the important 10 second rule!
        //this.gameTime = 10.0;
        this.eatTime = 0.0;
        this.score = 0;
        
        //Start paused, set timeout to start game
        this.paused = true;
        this.cameraY = 1280;
        
        //bind keys
        me.input.bindKey(me.input.KEY.SPACE, "jump", true);
        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP, "climb");
        me.input.bindKey(me.input.KEY.DOWN, "climbdown");
        
        this.getReady();
    },
    "update" : function() {
        //Take away from timer
        if (!this.paused && this.eatTime<=0 && this.gameTime>0) this.gameTime-=me.timer.tick/me.sys.fps;
        if (this.gameTime<0) this.gameTime=0;
        //Also take away from the eating timer
        if (!this.paused && this.eatTime>0) this.eatTime-=me.timer.tick/me.sys.fps;
        if (this.eatTime<0) this.eatTime=0;
        //Move camera to tweenable cameraY variable
        me.game.viewport.reset(0, this.cameraY);
        
        //set HUD value
        me.game.HUD.setItemValue("time", "Time left: " + this.gameTime.toFixed(2));
        me.game.HUD.setItemValue("score", "Score: " + this.score);
        
        if (this.gameTime<=0) this.gameOver(false);
        return true;
    },
    "onDestroyEvent" : function() {
        me.input.unbindKey(me.input.KEY.SPACE);
        me.input.unbindKey(me.input.KEY.LEFT);
        me.input.unbindKey(me.input.KEY.RIGHT);
        me.input.unbindKey(me.input.KEY.UP);
        me.input.unbindKey(me.input.KEY.DOWN);
        me.game.HUD.removeItem("score");
        me.game.HUD.removeItem("time");
        me.game.HUD.removeItem("ready");
    },
    "getReady" : function() {
        this.gameTime = 10.0;
        me.game.HUD.addItem("ready", new game.readyText("READY!"));
        me.game.sort();
        setTimeout(this.startLevel.bind(this), 1000);
    },
    "startLevel" : function() {
        me.audio.play("gobbler", true, null, 0.4);
        me.game.HUD.removeItem("ready");
        me.game.sort();
        this.paused = false;
    },
    "endLevel" : function() {
        this.score+=Math.round(this.gameTime*100);
        me.game.HUD.addItem("ready", new game.readyText("WELL DONE!"));
        me.audio.stop("gobbler");
        this.tween = new me.Tween(this).to({cameraY : this.cameraY-256}, 1500).onComplete(this.getReady);
        this.paused = true;
        setTimeout(function() {
            this.tween.start();
            me.game.HUD.removeItem("ready");
        }.bind(this), 1500);
    },
    "gameOver" : function(success) {
        if (!this.paused) {
            this.paused = true;
            me.audio.stop("gobbler");
            if (success) {
                me.game.HUD.addItem("ready", new game.readyText("CONGRATULATIONS!"));
                this.score+=Math.round(this.gameTime*100);
            } else me.game.HUD.addItem("ready", new game.readyText("GAME OVER!"));
            me.game.sort();
            if (this.score>localStorage.hiScore) localStorage.hiScore = this.score;
            setTimeout(this.titleScreen.bind(this), 1500);
        }
        
    },
    "titleScreen" : function() {
        me.state.change(me.state.MENU);
    }
    
});