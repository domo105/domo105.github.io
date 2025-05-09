class Game extends Phaser.Scene {
    constructor() {
        super("game");

        this.my = {sprite: {}, text: {}};

        this.my.sprite.bullet = [];
        this.my.sprite.enemies = [];   
        this.my.sprite.enemyBullets = [];
        this.maxBullets = 10;
        this.numEnemies = 10;
        this.cooldownTime = 15;
        this.onCooldown = 0;        
        
        this.timer = 0;
        this.enemyCounter = 0;
        this.myScore = 0; 
        this.currentLevel = 1;
        this.frequency = 480;
        this.gameOver = false;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.atlasXML("objs", "spritesheet_objects.png", "spritesheet_objects.xml");

        this.load.image("cloudPuff1", "cloud1.png");
        this.load.image("cloudPuff2", "cloud2.png");

        this.load.image("snail1", "snail.png");
        this.load.image("snail2", "snail_walk.png");
        this.load.image("rat1", "mouse.png");
        this.load.image("rat2", "mouse_walk.png");
        this.load.image("bat1", "bat.png");
        this.load.image("bat2", "bat_fly.png");

        this.load.image("hpOutline", "crosshair_red_large.png");
        this.load.image("hpInner", "crosshair_red_small.png");
        this.load.image("hpLose", "crosshair_white_small.png");

        this.load.image("projectile", "worm_hit.png");

        this.load.image("background", "bg_wood.png");
        this.load.image("floor", "curtain_straight.png");


        this.load.audio("enemyDefeat", "explosionCrunch_004.ogg");
        this.load.audio("playerShot", "laserSmall_000.ogg");
        this.load.audio("enemyShot", "laserRetro_003.ogg");
        this.load.audio("playerHit", "explosionCrunch_002.ogg");
    }

    create() {
        let my = this.my;
        
        my.sprite.bg = this.add.sprite(game.config.width/2-500, game.config.height/2,"background");
        my.sprite.bg.setScale((game.config.height)/250);
        my.sprite.bg2 = this.add.sprite(game.config.width/2+100, game.config.height/2,"background");
        my.sprite.bg2.setScale((game.config.height)/250);
        my.sprite.bg2.flipX = true;

        this.anims.create({key: "snailAnim",frames: [{ key: "snail1" },{ key: "snail2" }],frameRate: 5, repeat: -1,hideOnComplete: false});
        this.anims.create({key: "ratAnim",frames: [{ key: "rat1" },{ key: "rat2" }],frameRate: 5, repeat: -1,hideOnComplete: false});
        this.anims.create({key: "batAnim",frames: [{ key: "bat1" },{ key: "bat2" }],frameRate: 10, repeat: -1,hideOnComplete: false});

        my.sprite.floor1 = this.add.sprite(game.config.width/2, 70,"floor");
        my.sprite.floor1.displayHeight = 20;
        my.sprite.floor1.displayWidth = game.config.width;
        my.sprite.floor1.tint = 0x00ffff;

        my.sprite.floor2 = this.add.sprite(game.config.width/2, 170,"floor");
        my.sprite.floor2.displayHeight = 20;
        my.sprite.floor2.displayWidth = game.config.width;

        my.sprite.floor3 = this.add.sprite(game.config.width/2, 270,"floor");
        my.sprite.floor3.displayHeight = 20;
        my.sprite.floor3.displayWidth = game.config.width;

        my.sprite.floor4 = this.add.sprite(game.config.width/2, 370,"floor");
        my.sprite.floor4.displayHeight = 20;
        my.sprite.floor4.displayWidth = game.config.width;


        my.sprite.player = this.add.sprite(game.config.width/2, game.config.height - 40, "objs", "rifle.png");
        my.sprite.player.setScale(0.5);
        my.sprite.player.health = 3;

        for(let i = 0; i < 3; i++){
            my.sprite.enemyBullets.push(this.add.sprite(0,0,"projectile"));
            my.sprite.enemyBullets[i].visible = false;
            my.sprite.enemyBullets[i].xSpeed = 0;
            my.sprite.enemyBullets[i].ySpeed = 2;
            my.sprite.enemyBullets[i].size = 0.25;
            my.sprite.enemyBullets[i].index = i;
        }
        

        //my.sprite.test1 = this.add.sprite(0,0,"hpLose");

        for (let i = 0; i < this.numEnemies; i++) {
            
            if(i < 4){
                my.sprite.enemies.push(
                    this.add.sprite(i%2 * (game.config.width - 20), 50 + 100 * (i % 4), "snail1").play("snailAnim")
                );
                my.sprite.enemies[i].type = 0;
                my.sprite.enemies[i].xMagnitude = 2;
                my.sprite.enemies[i].ySpeed = 0;
                my.sprite.enemies[i].scorePoints = 1;
            }else if(i < 7){
                my.sprite.enemies.push(
                    this.add.sprite(i%2 * (game.config.width - 20), 50 + 100 * (i % 4), "rat1").play("ratAnim")
                );
                my.sprite.enemies[i].type = 1;
                my.sprite.enemies[i].xMagnitude = 4;
                my.sprite.enemies[i].ySpeed = 0;
                my.sprite.enemies[i].scorePoints = 2;
            }else{
                my.sprite.enemies.push(
                    this.add.sprite(i%2 * (game.config.width - 20), 50 + 100 * (i % 4), "bat1").play("batAnim")
                );
                my.sprite.enemies[i].type = 2;
                my.sprite.enemies[i].xMagnitude = 3;
                my.sprite.enemies[i].ySpeed = 3;
                my.sprite.enemies[i].scorePoints = 3;
            }
            my.sprite.enemies[i].origY = 50 + 100 * (i % 4);
            my.sprite.enemies[i].flipX = ((i+1)%2);
            my.sprite.enemies[i].xSpeed = (i%2*-2 + 1) * my.sprite.enemies[i].xMagnitude;

            my.sprite.enemies[i].setScale(0.5);
            my.sprite.enemies[i].isActive = false;
            my.sprite.enemies[i].visible = false;
        }

        this.anims.create({
            key: "puff",
            frames: [
                { key: "cloudPuff1" },
                { key: "cloudPuff2" },
            ],
            frameRate: 20, 
            repeat: 5,
            hideOnComplete: true
        });

        my.sprite.hpout1 = this.add.sprite(50, game.config.height - 50, "hpOutline");
        my.sprite.hpout1.setScale(1.25);
        my.sprite.hpin1 = this.add.sprite(50, game.config.height - 50, "hpInner");

        my.sprite.hpout2 = this.add.sprite(100, game.config.height - 50, "hpOutline");
        my.sprite.hpout2.setScale(1.25);
        my.sprite.hpin2 = this.add.sprite(100, game.config.height - 50, "hpInner");

        my.sprite.hpout3 = this.add.sprite(150, game.config.height - 50, "hpOutline");
        my.sprite.hpout3.setScale(1.25);
        my.sprite.hpin3 = this.add.sprite(150, game.config.height - 50, "hpInner");

        this.anims.create({
            key: "loseHealth",
            frames: [
                { key: "hpInner" },
                { key: "hpLose" },
            ],
            frameRate: 6, 
            repeat: 2,
            hideOnComplete: true
        });

        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.reset = this.input.keyboard.addKey("L");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.playerSpeed = 7;
        this.bulletSpeed = 12;

        document.getElementById('description').innerHTML = '<h2>Gallery Shooter</h2><br>A: left // D: right // Space: shoot'

        my.text.score = this.add.text(30, game.config.height - 140, "Score " + this.myScore, {
            fontFamily: 'Times, serif',
            fontSize: 48,
            wordWrap: {
                width: 290
            }
        });

        my.text.gameOver1 = this.add.text(game.config.width / 2 - 220, game.config.height / 2 - 100, "GAME OVER", {
            fontFamily: 'Times, serif', fontSize: 80,
            wordWrap: {width: 900}
        });
        my.text.gameOver1.visible = false;
        my.text.gameOver2 = this.add.text(game.config.width / 2 - 240, game.config.height / 2, "Press L key to restart", {
            fontFamily: 'Times, serif', fontSize: 60,
            wordWrap: {width: 900}
        });
        my.text.gameOver2.visible = false;

        my.text.newLevelStart = this.add.text(game.config.width / 2 - 160, 20, "New Level!", {
            fontFamily: 'Times, serif', fontSize: 60,
            wordWrap: {width: 900}
        });
        my.text.newLevelStart.visible = false;

        my.text.levelName = this.add.text(10, 5, "Cave " + this.currentLevel, {
            fontFamily: 'Times, serif',
            fontSize: 24,
            wordWrap: {
                width: 90
            }
        });

    }

    update() {
        let my = this.my;
        if(!this.gameOver){
            this.onCooldown += 1;
            this.timer += 1;

            if (this.left.isDown) { 
                if (my.sprite.player.x-30 > (my.sprite.player.displayWidth/2)) {
                    my.sprite.player.x -= this.playerSpeed;
                }
            }

            if (this.right.isDown) {
                if (my.sprite.player.x-30 < (game.config.width - (my.sprite.player.displayWidth/2))) {
                    my.sprite.player.x += this.playerSpeed;
                }
            }


            if (Phaser.Input.Keyboard.JustDown(this.space)) {
                if (my.sprite.bullet.length < this.maxBullets && this.onCooldown >= this.cooldownTime) {
                    my.sprite.bullet.push(this.add.sprite(
                        my.sprite.player.x-30, my.sprite.player.y-(my.sprite.player.displayHeight/2)+5, "objs", "shot_grey_large.png")
                    );
                    this.sound.play("playerShot", {  volume: 1 });
                    this.onCooldown = 0;
                }
            }

            if(this.timer >= 40 && this.timer <= 50){
                my.text.newLevelStart.visible = false;
            }

            my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));

            
            for (let bullet of my.sprite.bullet) {
                for (let enemy of my.sprite.enemies){
                    if(enemy.isActive){
                        if (this.collides(enemy, bullet)) {
                            
                            this.puff = this.add.sprite(enemy.x, enemy.y, "cloudPuff2").setScale(0.25).play("puff");
                            
                            bullet.y = -100;
                            enemy.visible = false;
                            enemy.isActive = false;
                            enemy.x = -100;
                            
                            this.myScore += enemy.scorePoints;
                            this.updateScore();

                            this.sound.play("enemyDefeat", {
                                volume: 1   
                            });

                            this.puff.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                                enemy.x = 32;
                            }, this);

                        }
                    }

                }
            }

            for (let enemy of my.sprite.enemies){
                if(enemy.isActive){
                    enemy.x += enemy.xSpeed;
                    enemy.y += enemy.ySpeed;
                    
                    if(enemy.type == 2){
                        
                        if(enemy.y > enemy.origY + 40 || enemy.y < enemy.origY - 40){
                            enemy.ySpeed = -enemy.ySpeed;
                            if(enemy.x < 30){
                                enemy.xSpeed = -enemy.xSpeed;
                                enemy.flipX = !enemy.flipX;
                                enemy.x = 32;
                            }else if(enemy.x > game.config.width - 30){
                                enemy.xSpeed = -enemy.xSpeed;
                                enemy.flipX = !enemy.flipX;
                                enemy.x = game.config.width - 32;
                            }

                        }
                        
                    }else{
                        if(enemy.x < 30){
                            enemy.xSpeed = -enemy.xSpeed;
                            enemy.flipX = !enemy.flipX;
                            enemy.x = 32;
                        }else if(enemy.x > game.config.width - 30){
                            enemy.xSpeed = -enemy.xSpeed;
                            enemy.flipX = !enemy.flipX;
                            enemy.x = game.config.width - 32;
                        }
                    }
                }
            }

            for (let bullet of my.sprite.bullet) {
                bullet.y -= this.bulletSpeed;
            }

            if(this.enemyCounter > this.numEnemies){
                this.enemyCounter = 0;
            }
            if(this.timer%(this.frequency/3) == 0){
                this.enemyCounter += 1;
                while(my.sprite.enemies[this.enemyCounter].isActive && this.enemyCounter <= this.numEnemies){
                    this.enemyCounter += 1;
                }
                my.sprite.enemies[this.enemyCounter].isActive = true;
                my.sprite.enemies[this.enemyCounter].visible = true;
            }

            if(this.timer >= 2000){
                this.currentLevel += 1;
                this.myScore += 10;
                this.updateScore();
                my.text.newLevelStart.visible = true;
                this.newLevel();
            }

            for (let enemyBullet of my.sprite.enemyBullets){
                if(!enemyBullet.visible && (this.timer % ((this.frequency * 2 / 3) + (enemyBullet.index * 30)) == 0 || this.timer % ((this.frequency * 4 / 3) + (enemyBullet.index * 30)) == 0) && (enemyBullet.index == 0 || this.timer > 400)){
                    this.randEnemy = Math.round(Math.random() * this.numEnemies);
                    this.whilecount = 0;
                    while(!my.sprite.enemies[this.randEnemy].isActive && this.whilecount <= this.numEnemies){
                        this.whilecount += 1;
                        this.randEnemy += 1;
                        if(this.randEnemy >= this.numEnemies){
                            this.randEnemy = 0;
                        }
                    }
                    if(this.whilecount < this.numEnemies){
                        enemyBullet.visible = true;
                        enemyBullet.x = my.sprite.enemies[this.randEnemy].x;
                        enemyBullet.y = my.sprite.enemies[this.randEnemy].y;
                        this.sound.play("enemyShot", {  volume: 0.8 });
                        //enemyBullet.xSpeed = (my.sprite.player.x - enemyBullet.x) / 100;
                        //enemyBullet.ySpeed = (my.sprite.player.y - enemyBullet.y) / 100;
                    }
                }


                if(enemyBullet.visible){
                    enemyBullet.x += enemyBullet.xSpeed;
                    enemyBullet.y += enemyBullet.ySpeed;
                    enemyBullet.size += 0.003;
                    enemyBullet.setScale(enemyBullet.size);
                    if(enemyBullet.x < 0 || enemyBullet.y < 0 || enemyBullet.x > game.config.width || enemyBullet.y > game.config.height){
                        enemyBullet.visible = false;
                        enemyBullet.size = 0.25;
                    }

                    if(this.collides(enemyBullet, my.sprite.player)){
                        my.sprite.player.health -= 1;
                        this.sound.play("playerHit", {  volume: 0.8 });
                        this.updateHealth(my.sprite.player.health + 1);
                        enemyBullet.visible = false;
                        enemyBullet.size = 0.25;
                    }
                }

                
            }



        }else{
            if (Phaser.Input.Keyboard.JustDown(this.reset)) {
                this.resetGame();
            }
        }

        //my.sprite.test1.x = my.sprite.enemyBullet.x;
        //my.sprite.test1.y = my.sprite.enemyBullet.y;

    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2) - 10) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2) - 10) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
        my.text.levelName.setText("Cave " + this.currentLevel);
    }

    resetGame(){
        this.myScore = 0;
        this.currentLevel = 1;
        this.gameOver = false;
        this.my.text.gameOver1.visible = false;
        this.my.text.gameOver2.visible = false;
        this.updateScore();
        this.newLevel();
    }

    newLevel() {
        this.my.sprite.player.health = 3;
        this.updateHealth(3);
        this.enemyCounter = 0;
        this.timer = 0;
        let counter = 0;
        for (let enemy of this.my.sprite.enemies){
            enemy.visible = false;
            enemy.isActive = false;
            enemy.xSpeed = (counter%2*-2 + 1) * enemy.xMagnitude;
            enemy.flipX = ((counter+1)%2);
            enemy.x = counter % 2 * (game.config.width - 20);
            enemy.y = enemy.origY;

            counter += 1;
        }
        for (let enemyBullet of this.my.sprite.enemyBullets){
            enemyBullet.visible = false;
            enemyBullet.size = 0.25;
        }

    }

    updateHealth(oldHealth){
        if(oldHealth > 2 && this.my.sprite.player.health <= 2){
            this.my.sprite.hpin3.visible = false;
            this.hploss3 = this.add.sprite(this.my.sprite.hpin3.x, this.my.sprite.hpin3.y, "hpInner").play("loseHealth");
        }
        if(oldHealth > 1 && this.my.sprite.player.health <= 1){
            this.my.sprite.hpin2.visible = false;
            this.hploss2 = this.add.sprite(this.my.sprite.hpin2.x, this.my.sprite.hpin2.y, "hpInner").play("loseHealth");
        }
        if(oldHealth > 0 && this.my.sprite.player.health <= 0){
            this.my.sprite.hpin1.visible = false;
            this.hploss1 = this.add.sprite(this.my.sprite.hpin1.x, this.my.sprite.hpin1.y, "hpInner").play("loseHealth");
            this.gameOver = true;
            this.my.text.gameOver1.visible = true;
            this.my.text.gameOver2.visible = true;
        }
        if(this.my.sprite.player.health >= 3){
            this.my.sprite.hpin1.visible = true;
            this.my.sprite.hpin2.visible = true;
            this.my.sprite.hpin3.visible = true;
        }
    }

}
         