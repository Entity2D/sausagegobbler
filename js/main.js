var game = {
    "hiScore" : 0,
    "onload" : function () {
        
        //init video
        if (!me.video.init("screen", 256, 320, true, 2.0)) {
            alert("Your browser doesn't like this game. Get a new browser.");
            return;
        }
        
        //init audio
        me.audio.init("mp3,ogg");
        
        //Frame interpolation
        me.sys.interpolation = true;
        
        //Custom preloader
        me.state.set(me.state.LOADING, new game.preLoadScreen);
        
        //Loader callback
        me.loader.onload = this.loaded.bind(this);
        
        //Preloader
        me.loader.preload(game.assets);
        
        //Change state to loader
        me.state.change(me.state.LOADING);
    },
    
    "loaded" : function () {
        //set states
        me.state.set(me.state.MENU, new game.titleScreen());
        me.state.set(me.state.PLAY, new game.playScreen());
        
        //add entites to entity pool
        me.entityPool.add("mainPlayer", game.playerEntity);
        me.entityPool.add("sausage", game.sausageEntity);
        me.entityPool.add("dog", game.enemyEntity);
        me.entityPool.add("wasp", game.enemyEntity);
        me.entityPool.add("ladder", game.ladderEntity);
        me.entityPool.add("levelend", game.endEntity);
        me.entityPool.add("gameend", game.gameEndEntity);
        
        //load the game
        me.state.change(me.state.MENU);
    }
};