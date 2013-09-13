/*
    Main player entity
*/
game.playerEntity = me.ObjectEntity.extend({
    "init" : function(x, y, settings) {
        this.parent(x, y, settings);
        this.setVelocity(2.4, 9);
        this.updateColRect(3, 10, 4, 24);
        this.collidable = true;
        this.invincible = false;
        this.jamControls = false;
        this.flipped = false;
        this.climbing = false;
        this.collideFlag = false;
        
        //animation
        this.renderable.addAnimation("idle", [0]);
        this.renderable.addAnimation("walk", [0, 1]);
        this.renderable.addAnimation("jump", [1]);
        this.renderable.addAnimation("climb", [2, 3]);
    },
    "update" : function() {
        //if climbing and space pressed, don't climb
        if (this.climbing && me.input.isKeyPressed("jump")) {
            this.climbing = false;
        }
        
        //movement
        if (!this.jamControls && !me.state.current().paused) {
            if (me.input.isKeyPressed("right") && !this.climbing) {
                this.flipX(false);
                this.flipped = false;
                this.vel.x=3 * me.timer.tick;
            }
            else if (me.input.isKeyPressed("left") && !this.climbing) {
                this.flipX(true);
                this.flipped = true;
                this.vel.x=-3 * me.timer.tick;
            }
            else {
                this.vel.x = 0;
            }
            if (me.input.isKeyPressed("jump") && !this.climbing) {
                if (!this.jumping && !this.falling) {
                    me.audio.play("jump");
                    this.vel.y = -this.maxVel.y * me.timer.tick;
                    this.jumping = true;
                }
            }
        }
        //disable gravity if climbing
        if (this.climbing) {
            this.gravity = 0;
        } else {
            this.gravity = 0.98;
        }
        
        //set animations
        if (this.vel.x !=0) this.renderable.setCurrentAnimation("walk");
        if (this.vel.x === 0)this.renderable.setCurrentAnimation("idle");
        if (this.vel.y !=0)this.renderable.setCurrentAnimation("jump");
        if (this.climbing){
            this.renderable.animationpause = false;
            this.renderable.setCurrentAnimation("climb");
        }
        if (this.climbing && this.vel.y===0) this.renderable.animationpause = true;
        
        //If jammed and on floor, don't move any more
        if (this.jamControls && !this.jumping && !this.falling) this.vel.x = 0; 
        
        //Collision detection
        var res = me.game.collide(this, true);
        if (res[0] && res[0].obj.type === me.game.ENEMY_OBJECT && !this.collideFlag) {
            //If hit by enemy, knock back and grant temp invincibility
            if (!this.invincible) {
                me.audio.play("hit");
                this.collideFlag = true;
                this.jamControls = true;
                this.invincible = true;
                this.climbing = false;
                this.renderable.setCurrentAnimation("jump");
                if (this.flipped)this.vel.x += 8*me.timer.tick;
                if (!this.flipped)this.vel.x += -8*me.timer.tick;
                this.vel.y = -6*me.timer.tick;
                this.jumping = true;
                setTimeout(function(){this.jamControls = false;}.bind(this), 1500);
                this.renderable.flicker(180, function(){this.invincible=false;}.bind(this));
            }
        } else this.collideFlag = false;
        //Ladders
        if (res[0] && res[0].obj.type === "ladder") {
            if (me.input.isKeyPressed("climb") && !me.state.current().paused && !this.jamControls) {
                this.pos.x = res[0].obj.pos.x;
                this.jumping = true;
                this.climbing = true;
                this.vel.y = -1.5*me.timer.tick;
            }
            if (me.input.isKeyPressed("climbdown")) {
                this.pos.x = res[0].obj.pos.x;
                this.jumping = true;
                this.climbing = true;
                this.vel.y = 1.5*me.timer.tick;
            }
            if (this.climbing && (!me.input.isKeyPressed("climb") && !me.input.isKeyPressed("climbdown"))) {
                this.vel.y = 0;
            }
        } else this.climbing = false;
        
         if (!me.state.current().paused) {
            this.parent();
            this.updateMovement();
            return true;
        } else return false;
    }
})

/*
    Sausage
*/
game.sausageEntity = me.CollectableEntity.extend({
    "init" : function(x, y, settings) {
        this.parent(x, y, settings);
        this.pos.x+=2;
        this.renderable.addAnimation("idle", [0, 1, 2, 3, 4, 3, 2, 1], 4);
        this.renderable.setCurrentAnimation("idle");
    },
    "update" : function() {
        if (!me.state.current().paused) this.parent();
    },
    "onCollision" : function() {
        me.audio.play("sausage", false, null, 0.7);
        me.state.current().score+=75;
        this.collidable = false;
        me.game.remove(this);
    },
    "onDestroyEvent" : function() {
        me.state.current().eatTime+=0.25;
    }
})

/*
    HUD
*/
game.hud = me.HUD_Item.extend({
    "init" : function(x, y) {
        this.parent(x, y);
        this.font = new me.Font("arcade", 8, "#FFFFFF");
    },
    "update" : function() {
        this.parent();
    },
    "draw" : function(context, x, y) {
        context.fillStyle = "#000000";
        context.fillRect(0,0,256,8);
        this.font.draw (context, this.value, this.pos.x +x, this.pos.y +y);
        this.parent(context, x, y)
    }
})

game.score = me.HUD_Item.extend({
    "init" : function(x, y) {
        this.parent(x, y);
        this.font = new me.Font("arcade", 8, "#FFFFFF");
    },
    "update" : function() {
        this.parent();
    },
    "draw" : function(context, x, y) {
        this.parent(context, x, y)
        this.font.draw (context, this.value, this.pos.x +x, this.pos.y +y);
    }
})

game.readyText = me.HUD_Item.extend({
    "init" : function(writeString) {
        this.writeString = writeString;
        this.font = new me.Font("arcade", 12, "#FFFF00", "center");
        this.parent(128,160);
    },
    "update" : function() {
        this.parent();
    },
    "draw" : function(context, x, y) {
        context.fillStyle = "#000000";
        context.fillRect(0,157,256,16);
        this.font.draw (context, this.writeString, this.pos.x +x, this.pos.y +y -1)
        this.parent(context, x, y)
    }
})

game.enemyEntity = me.ObjectEntity.extend({
    "init" : function(x, y, settings) {
        this.parent(x, y, settings);
        this.type = me.game.ENEMY_OBJECT;
        this.gravity = 0;
        this.flipped = false;
        if (settings.flipped) this.flipX(true);
        if (settings.updown) {
            this.startY = y;
            this.pos.x+=3;
            this.endY = y + settings.height - settings.spriteheight;
            this.updown = true;
        }
        else {
            this.startX = x;
            this.endX = x + settings.width - settings.spritewidth;
            this.updown = false;
        }
        if (settings.image === "wasp") this.updateColRect(2,4,2,4);
        if (settings.image === "dog") this.updateColRect(2,20,-1,0)
        
        if (settings.startotherside) {
            if (!settings.updown) {
                this.flipX(false);
                this.flipped = true;
                this.pos.x = this.endX;
            } else {
                this.flipped = true;
                this.pos.y = this.endY;
            }
        }
        
        this.speed = settings.speed;
    },
    "update" : function() {
        
        if (!this.updown) {
            if (!this.flipped) {
                this.vel.x=this.speed * me.timer.tick
                this.flipX(false);
                if (this.pos.x>=this.endX) {
                    this.pos.x = this.endX;
                    this.flipped = true;
                }
            }else{
                this.flipX(true);
                this.vel.x=-this.speed * me.timer.tick;
                if (this.pos.x<=this.startX) {
                    this.pos.x = this.startX;
                    this.flipped = false;
                }
            }
        }
        else {
            if (!this.flipped) {
                this.vel.y=this.speed * me.timer.tick
                if (this.pos.y>=this.endY) {
                    this.pos.y = this.endY;
                    this.flipped = true;
                }
            }else{
                this.vel.y=-this.speed * me.timer.tick;
                if (this.pos.y<=this.startY) {
                    this.pos.y = this.startY;
                    this.flipped = false;
                }
            }
        }
        
        
        if (!me.state.current().paused) {
            this.parent();
            this.updateMovement();
            return true;
        } else return false;
        
    }
})

game.ladderEntity = me.ObjectEntity.extend({
    "init" : function(x, y, settings) {
        this.parent(x, y, settings);
        this.type = "ladder";
    }
})

game.endEntity = me.ObjectEntity.extend({
    "init" : function(x, y, settings) {
        this.parent(x, y,settings);
        this.collidable = true;
        this.type = "levelEnd";
    },
    "onCollision" : function() {
        this.collidable = false;
        me.state.current().endLevel();
        me.game.remove(this);
    }
})

game.gameEndEntity = me.ObjectEntity.extend({
    "init" : function(x, y, settings) {
        this.parent(x, y,settings);
        this.collidable = true;
        this.type = "levelEnd";
    },
    "onCollision" : function() {
        this.collidable = false;
        me.state.current().score+=9999;
        me.state.current().gameOver(true);
    }
})