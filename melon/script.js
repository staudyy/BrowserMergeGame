// SETTINGS

// TODO
// Mass multiplier setting
// colored balls or pictures
// Make toggle skin (bud obrazky alebo len cisla a farby)
// Add music (make it toggleable)
// Pause menu (not only home button, prevent accidental exits)
// Maybe ball spawn chances
// Make game ratio scale without game line (so ratio works for actual game area)
// Make scaling fair for portrait and landscape
// Make scaling on resize accurate ingame as well

const REWARD_SCORE = 5000  //DISABLED
const REWARD_LINK = "/?code=som_uplny_zavislak"

let DEF_DIAMETERS = [40, 45, 70, 100, 130, 160, 200, 240, 270, 310, 370];  //Ball sizes in px DONE
let MAX_N = DEF_DIAMETERS.length;  //Max ball lvl that can exist (atm cant be higher than diameters.length) DONE
let POSSIBLE_BALL_SPAWN = [1, 2, 3, 4, 5];  //Possible ball level spawn ([all levels]) DONE
var SPAWN_DELAY = 400;  //Min delay between ball spawns (ms) (def: 200)
var QUEUE_LENGTH = 4;  // Next: Queue length
var LOSE_TIME = 2000  // How long it takes to lose (ms)

// to engine
var DEF_GRAVITY = 0.8
var DEF_GRAVITY_X = 0
var BOUNCINESS = 0.3
var FRICTION = 0
var FRICTION_STATIC = 0
var FRICTION_AIR = 0.001
var RESTING = 0.2  //autism jednotka proste cim menej tym presnejsie bounces default: 4
var POSITION_ITER = 15  //makes stacking more stable, default: 6

// Colors
const BG_COLOR = 0xd1812c
const PADDING_COLOR = 0xd12317
const BUTTON_COLOR = 0x4f0204
const BUTTON_HOVER_COLOR = 0x8f0104

// Changeable
var GAME_SIDES_RATIO = 0.6  // 0.5;  WIDTH : HEIGHT (1 = square) -> WIDTH == 0.5*HEIGHT


const PADDING_TOP_RATIO = 1/20
const PADDING_BOTTOM_RATIO = 1/15
const PADDING_SIDES_RATIO = 1/20

//Calculate needed constants
//need recount
let DPR
let WIDTH
let HEIGHT

let SCALE_RATIO

let FIXED_PADDING_TOP
let FIXED_PADDING_BOTTOM
let FIXED_PADDING_SIDE

let MIN_GAME_WIDTH
let MIN_GAME_HEIGHT


let PADDING_TOP
let PADDING_BOTTOM
let PADDING_SIDE

let GAME_WIDTH
let GAME_HEIGHT

let GAME_SCALE_RATIO

let MAX_QUEUE_HEIGHT
let GAME_LINE_HEIGHT
let FRUIT_SPAWN_PADDING

let DIAMETERS
let GRAVITY
let GRAVITY_X

let FONT
let COLORS

function recount_scaleable() {
    // Part 1 of calculations
    DPR = window.devicePixelRatio
    WIDTH = window.innerWidth * DPR
    HEIGHT = window.innerHeight * DPR

    SCALE_RATIO = HEIGHT / 1000

    FIXED_PADDING_TOP = HEIGHT * PADDING_TOP_RATIO
    FIXED_PADDING_BOTTOM = HEIGHT * PADDING_BOTTOM_RATIO
    FIXED_PADDING_SIDE = WIDTH * (PADDING_SIDES_RATIO / 2)

    MIN_GAME_WIDTH = WIDTH - 2 * FIXED_PADDING_SIDE
    MIN_GAME_HEIGHT = HEIGHT - FIXED_PADDING_TOP - FIXED_PADDING_BOTTOM

    // Game ratio stuff
    if (MIN_GAME_WIDTH >= GAME_SIDES_RATIO * MIN_GAME_HEIGHT) {  //Too wide
        PADDING_TOP = FIXED_PADDING_TOP
        PADDING_BOTTOM = FIXED_PADDING_BOTTOM
        PADDING_SIDE = FIXED_PADDING_SIDE + (MIN_GAME_WIDTH - GAME_SIDES_RATIO * MIN_GAME_HEIGHT) / 2
    
    } else {  //Too high (WIDTH < RATIO*HEIGHT)
        PADDING_TOP = FIXED_PADDING_TOP + (MIN_GAME_HEIGHT - MIN_GAME_WIDTH / GAME_SIDES_RATIO) / 2
        PADDING_BOTTOM = FIXED_PADDING_BOTTOM + (MIN_GAME_HEIGHT - MIN_GAME_WIDTH / GAME_SIDES_RATIO) / 2
        PADDING_SIDE = FIXED_PADDING_SIDE
    }
    
    GAME_WIDTH = WIDTH - 2 * PADDING_SIDE
    GAME_HEIGHT = HEIGHT - PADDING_TOP - PADDING_BOTTOM
    
    GAME_SCALE_RATIO = GAME_HEIGHT / 1000
    
    MAX_QUEUE_HEIGHT = 55 * SCALE_RATIO
    GAME_LINE_HEIGHT = PADDING_TOP + GAME_SCALE_RATIO * 150
    FRUIT_SPAWN_PADDING = 10 * GAME_SCALE_RATIO

    // Diameters
    DIAMETERS = []
    for (i in DEF_DIAMETERS) {
        DIAMETERS[i] = DEF_DIAMETERS[i] * GAME_SCALE_RATIO
    }

    // Colors
    COLORS = []
    for (let i = 0; i < DIAMETERS.length; i++) {
        COLORS.push(getRandomColor())
    }

    // Gravity
    GRAVITY = DEF_GRAVITY*GAME_SCALE_RATIO
    GRAVITY_X = DEF_GRAVITY_X*GAME_SCALE_RATIO

    // Font
    FONT = {
        fontSize: 25*SCALE_RATIO,
        fontFamily: 'LocalComicSans, Comic Sans MS, Comic Sans, Verdana, serif',
        color: "white"
    }
}

recount_scaleable()


function windowResize() {
    // recount disabled cuz nechcem forcovat restart
    // recount_scaleable()
    game.scale.setGameSize(WIDTH, HEIGHT)
    game.scale.displaySize.resize(WIDTH, HEIGHT);

    // game.scene.scenes.forEach((scene) => {
    //     const key = scene.scene.key;
    //     game.scene.stop(key);
    // })
    // game.scene.start('Menu');
}

function randint(start, stop) {
    return Math.floor(Math.random() * (stop - start + 1)) + start;
}

function getRandomColor() {
    var letters = '23456789ABCD';
    var color = '0x';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}



class NumberInput {
    constructor (scene, x, y, width, height, min=null, max=null, step="any") {
        this.input_object = scene.add.dom(x, y).createFromHTML(this.getInputString(width, height, step))
        if (min != null) {
            this.setMin(min)
        }
        if (max != null) {
            this.setMax(max)
        }
    }

    setMin(value) {
        this.input_object.getChildByName("myInput").min = value
    }

    setMax(value) {
        this.input_object.getChildByName("myInput").max = value
    }

    getInputString(width, height, step) {
        return `
            <input type="number" name="myInput" placeholder="Value" step="${step}" style="${this.getInputStyle(width, height)}"/>
        `
    }

    getInputStyle(width, height) {
        return `
                font-size: ${FONT.fontSize}px;
                width: ${width}px;
                height: ${height}px;
                padding: 0px;
                text-indent: 10px;
        `
        .replace(/\s+/g, '') // Remove whitespaces
    }

    getVal() {
        let html_obj = this.input_object.getChildByName("myInput")
        if(html_obj.value != "") {
            return Number(html_obj.value)
        } else {
            return null
        }
    }

    setVal(value) {
        let html_obj = this.input_object.getChildByName("myInput")
        html_obj.value = value
    }

    destroy() {
        this.input_object.destroy()
    }
}


class MyScene extends Phaser.Scene {
    constructor(arg) {
        super(arg)
    }

    create_button(x, y, width, height, text, callback, color=BUTTON_COLOR, hover_color=BUTTON_HOVER_COLOR) {
        this.add.rectangle(x, y, width, height, color)
        .setInteractive({cursor: "pointer"})
        .on('pointerup', () => callback.call(this))
        .on('pointerover', function() {this.setFillStyle(hover_color)})
        .on('pointerout', function() {this.setFillStyle(color)});
        
        this.add.text(x, y, text, FONT).setOrigin(0.5)
    }

    create_input(x, y, width, height, min=null, max=null, step="any") {
        return new NumberInput(this, x, y, width, height, min, max, step)
    }
}


class Menu extends MyScene {
    constructor () {
        super("Menu")
    }

    create () {
        this.add.text(Math.floor(WIDTH/2), 80*SCALE_RATIO, "Merge Game", FONT)
        .setOrigin(0.5)
        .setFontSize(65*SCALE_RATIO)
        .setWordWrapWidth(WIDTH)

        this.create_button(WIDTH/2, HEIGHT/2 - 60*SCALE_RATIO, 200*SCALE_RATIO, 95*SCALE_RATIO, "PLAY", function(){
            this.scene.start("Game")
        })

        this.create_button(WIDTH/2, HEIGHT/2 + 60*SCALE_RATIO, 200*SCALE_RATIO, 95*SCALE_RATIO, "SETTINGS", function(){
            this.scene.start("Settings")
        })

        this.add.text(Math.floor(WIDTH/2), HEIGHT - 100*SCALE_RATIO, "-Highly customizable!\n-Optimized for mobile devices in portrait orientation.\n-After resizing the page reload it to fix visual issues", FONT)
        .setOrigin(0.5)
        .setFontSize(22*SCALE_RATIO)
        .setWordWrapWidth(WIDTH - 70*SCALE_RATIO)
    }
}

class Settings extends MyScene {
    constructor() {
        super("Settings")
    }

    create () {
        function save_data() {
            for (let i = 0; i < settings_setup.length; i++) {
                if (settings_setup[i].input.getVal() != null) {
                    window[settings_setup[i].name] = settings_setup[i].input.getVal()
                }
            }
            recount_scaleable()
        }

        this.add.text(Math.floor(WIDTH/2), 50*SCALE_RATIO, "Settings", FONT).setOrigin(0.5).setFontSize(45*SCALE_RATIO)
        this.add.text(WIDTH - WIDTH/6, 75*SCALE_RATIO, "*Changing these might make the game unplayable :)", FONT)
        .setOrigin(0.5)
        .setFontSize(15*SCALE_RATIO)
        .setWordWrapWidth(WIDTH/4)

        this.create_button(80*SCALE_RATIO, 45*SCALE_RATIO, 130*SCALE_RATIO, 55*SCALE_RATIO, "Home", function(){
            save_data()
            this.scene.start("Menu")
        })

        this.create_button(140*SCALE_RATIO, 125*SCALE_RATIO, 250*SCALE_RATIO, 55*SCALE_RATIO, "Ball Settings", function(){
            // this.scene.pause("Settings")
            // this.scene.launch("DiameterSettings")
            save_data()
            this.scene.start("DiameterSettings")
        })


        let settings_setup = [
            {
                name: "SPAWN_DELAY",
                val: SPAWN_DELAY,
                text: "Spawn Delay",
                input: null
            },
            {
                name: "QUEUE_LENGTH",
                val: QUEUE_LENGTH,
                text: "Queue Length",
                input: null
            },
            {
                name: "LOSE_TIME",
                val: LOSE_TIME,
                text: "Time required above line to lose",
                input: null
            },
            {
                name: "DEF_GRAVITY",
                val: DEF_GRAVITY,
                text: "Gravity (vertical)",
                input: null
            },
            {
                name: "DEF_GRAVITY_X",
                val: DEF_GRAVITY_X,
                text: "Gravity (horizontal)",
                input: null
            },
            {
                name: "BOUNCINESS",
                val: BOUNCINESS,
                text: "Bounciness",
                input: null
            },
            {
                name: "FRICTION",
                val: FRICTION,
                text: "Friction",
                input: null
            },
            {
                name: "FRICTION_STATIC",
                val: FRICTION_STATIC,
                text: "Static Friction (force required for an object to start moving)",
                input: null
            },
            {
                name: "FRICTION_AIR",
                val: FRICTION_AIR,
                text: "Air Friction",
                input: null
            },
            {
                name: "GAME_SIDES_RATIO",
                val: GAME_SIDES_RATIO,
                text: "Game area sides ratio (Width/Height)",
                input: null
            },
            {
                name: "RESTING",
                val: RESTING,
                text: "ADVANCED: Resting Threshold",
                input: null
            },
            {
                name: "POSITION_ITER",
                val: POSITION_ITER,
                text: "ADVANCED: Position Iterations",
                input: null
            }
        ]
        const OFFSET = 65
        for (let i = 0; i < settings_setup.length; i++) {
            this.add.text(10*SCALE_RATIO, 200*SCALE_RATIO + i * (OFFSET*SCALE_RATIO), settings_setup[i].text, FONT)
            .setWordWrapWidth(WIDTH/2)
            .setFontSize(18*SCALE_RATIO)
            .setOrigin(0, 0.5)

            settings_setup[i].input = this.create_input(WIDTH / 2 + 50*SCALE_RATIO, 200*SCALE_RATIO + i * (OFFSET*SCALE_RATIO), 82*SCALE_RATIO, 42*SCALE_RATIO)
            settings_setup[i].input.setVal(settings_setup[i].val)
            this.add.line(0, 0, 10*SCALE_RATIO, 235*SCALE_RATIO + i * (OFFSET*SCALE_RATIO), WIDTH - 10*SCALE_RATIO, 235*SCALE_RATIO + i * (OFFSET*SCALE_RATIO), 0xffffff)
            .setOrigin(0)
        }


    }
}

class DiameterSettings extends MyScene {
    constructor() {
        super("DiameterSettings")
    }

    create() {
        this.input.setDefaultCursor('');
        this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000).setOrigin(0).setAlpha(0.8)

        this.add.text(15*SCALE_RATIO, 95*SCALE_RATIO, "Add, remove and set the diameter of each ball", FONT)
        .setWordWrapWidth(WIDTH - 30*SCALE_RATIO)

        this.add.text(15*SCALE_RATIO, 165*SCALE_RATIO, "Green = Ball can spawn, change by clicking on the numbers", FONT).setColor("#32cf17")
        .setWordWrapWidth(WIDTH - 30*SCALE_RATIO)

        // Load existing balls
        let x = 80*SCALE_RATIO
        let y = 250*SCALE_RATIO
        let tiles = []
        for (let i=0; i < DEF_DIAMETERS.length; i++) {
            let clickable = this.add.rectangle(x, y + 20*SCALE_RATIO, 80*SCALE_RATIO, 40*SCALE_RATIO)
            clickable.index = i
            clickable.setInteractive({cursor: "pointer"})
            .on('pointerup', function () {
                let j = Number(this.index)
                tiles[j].spawnable = !tiles[j].spawnable
                if (tiles[j].spawnable) {
                    this.setFillStyle(0x32cf17)
                } else {
                    this.setFillStyle(0xf24b3f)
                }
            })

            let spawnable
            if (POSSIBLE_BALL_SPAWN.includes(i+1)) {
                clickable.setFillStyle(0x32cf17)
                spawnable = true
            } else {
                clickable.setFillStyle(0xf24b3f)
                spawnable = false
            }

            let text = this.add.text(x, y, i+1, FONT).setOrigin(0.5, 0)
            let input = this.create_input(x, y + 50*SCALE_RATIO, 80*SCALE_RATIO, 35*SCALE_RATIO)
            input.setVal(DEF_DIAMETERS[i])

            tiles.push({
                clickable: clickable,
                text: text,
                input: input,
                spawnable: spawnable
            })

            x += 120*SCALE_RATIO
            if (x > WIDTH - 80*SCALE_RATIO) {
                x = 80*SCALE_RATIO
                y += 120*SCALE_RATIO
            }
        }

        // Add ball
        this.create_button(WIDTH - 50*SCALE_RATIO, 40*SCALE_RATIO, 55*SCALE_RATIO, 55*SCALE_RATIO, "+", function(){
            let i = tiles.length

            let clickable = this.add.rectangle(x, y + 20*SCALE_RATIO, 80*SCALE_RATIO, 40*SCALE_RATIO)
            clickable.index = i
            clickable.setInteractive({cursor: "pointer"})
            .on('pointerup', function () {
                let j = Number(this.index)
                tiles[j].spawnable = !tiles[j].spawnable
                if (tiles[j].spawnable) {
                    this.setFillStyle(0x32cf17)
                } else {
                    this.setFillStyle(0xf24b3f)
                }
            })

            let spawnable
            if (POSSIBLE_BALL_SPAWN.includes(i+1)) {
                clickable.setFillStyle(0x32cf17)
                spawnable = true
            } else {
                clickable.setFillStyle(0xf24b3f)
                spawnable = false
            }

            let text = this.add.text(x, y, i+1, FONT).setOrigin(0)
            let input = this.create_input(x, y + 50*SCALE_RATIO, 80*SCALE_RATIO, 30*SCALE_RATIO)
            input.setVal(100)

            tiles.push({
                clickable: clickable,
                text: text,
                input: input,
                spawnable: spawnable
            })

            x += 120*SCALE_RATIO
            if (x > WIDTH - 80*SCALE_RATIO) {
                x = 80*SCALE_RATIO
                y += 120*SCALE_RATIO
            }
        })

        // Remove ball
        this.create_button(WIDTH - 120*SCALE_RATIO, 40*SCALE_RATIO, 55*SCALE_RATIO, 55*SCALE_RATIO, "-", function(){
            if (tiles.length <= 1) {
                return
            }
            let tile = tiles.pop()
            tile.clickable.destroy()
            tile.input.destroy()
            tile.text.destroy()

            x -= 120*SCALE_RATIO
            if (x < 80*SCALE_RATIO - 5) {  //-5 because of floating point error
                x = 80*SCALE_RATIO + Math.floor((WIDTH - 2*80*SCALE_RATIO) / (120*SCALE_RATIO))*120*SCALE_RATIO
                y -= 120*SCALE_RATIO
            }
        })

        // Save and exit
        this.create_button(140*SCALE_RATIO, 40*SCALE_RATIO, 250*SCALE_RATIO, 55*SCALE_RATIO, "Save", function(){
            DEF_DIAMETERS = []
            for (let tile of tiles) {
                let val = tile.input.getVal()
                if (val == null) {
                    DEF_DIAMETERS.push(100)
                } else if (val > WIDTH - 2*PADDING_SIDE) {
                    DEF_DIAMETERS.push(Math.round(GAME_WIDTH/ GAME_SCALE_RATIO))
                } else {
                    DEF_DIAMETERS.push(val)
                }
            }
            recount_scaleable()

            //Fix Max_N
            MAX_N = DEF_DIAMETERS.length

            //Save possible ball spawn
            POSSIBLE_BALL_SPAWN = []
            for (let i=0; i < tiles.length; i++) {
                if (tiles[i].spawnable) {
                    POSSIBLE_BALL_SPAWN.push(i+1)
                }
            }

            //Check if none can spawn and enable the first one
            if (POSSIBLE_BALL_SPAWN.length == 0) [
                POSSIBLE_BALL_SPAWN = [1]
            ]
            
            // this.scene.resume("Settings")
            // this.scene.stop("DiameterSettings")
            this.scene.start("Settings")
        })
    }

}

class LoseOverlay extends MyScene {
    constructor() {
        super("LoseOverlay")
    }

    create(args) {
        this.add.rectangle(WIDTH/2, HEIGHT/2, 250*SCALE_RATIO, 300*SCALE_RATIO, PADDING_COLOR).setAlpha(0.7)
        
        this.add.text(WIDTH/2, HEIGHT/2 - 100*SCALE_RATIO, "Game Over", FONT).setOrigin(0.5).setFontSize(40*SCALE_RATIO)
        this.add.text(WIDTH/2, HEIGHT/2 - 40*SCALE_RATIO, "Score: " + args.score, FONT).setOrigin(0.5)

        this.create_button(WIDTH/2, HEIGHT/2 + 30*SCALE_RATIO, 150*SCALE_RATIO, 55*SCALE_RATIO, "Menu", function() {
            game.scene.stop("Game")
            this.scene.start("Menu")
        })

        this.create_button(WIDTH/2, HEIGHT/2 + 100*SCALE_RATIO, 150*SCALE_RATIO, 55*SCALE_RATIO, "Restart", function() {
            this.scene.start("Game")
        })

        // if (args.score >= REWARD_SCORE) {
        if (false) {
        // if (true) {
            this.add.rectangle(WIDTH/2, HEIGHT/2 + 280*SCALE_RATIO, 350*SCALE_RATIO, 240*SCALE_RATIO, PADDING_COLOR).setAlpha(0.7)
            this.add.text(WIDTH/2, HEIGHT/2 + 240*SCALE_RATIO, "Wow získala si väčšie skóre ako " + REWARD_SCORE + '.\nKódik je: "som uplny zavislak"', FONT)
            .setOrigin(0.5)
            .setWordWrapWidth(320*SCALE_RATIO)
            this.create_button(WIDTH/2, HEIGHT/2 + 350*SCALE_RATIO, 150*SCALE_RATIO, 55*SCALE_RATIO, "Main page", function() {
                window.location.href = REWARD_LINK;
            })
        }
    }
}

class GameScene extends MyScene {
    constructor () {
        super("Game")

        this.LOSE_TIMER_OBJ;
        this.GUIDE_LINE;
        this.balls = [];
        this.score_text;
        this.score = 0;
        this.queue_text;
        this.queue = [];
        this.current_ball;
        this.spawn_timer;
        this.default_ball;
    }

    reset_variables() {
        //set gravity
        this.matter.world.setGravity(GRAVITY_X, GRAVITY)

        this.LOSE_TIMER_OBJ = {
            delay: LOSE_TIME,
            callback: this.game_over_callback,
            args: this
        }

        this.GUIDE_LINE;
        this.balls = [];
        this.score_text;
        this.score = 0;
        this.queue_text;
        this.queue = [];
        this.current_ball;
        this.spawn_timer;

        this.default_ball = {
            label: 'Body',
            shape: {
                type: 'circle'
                // radius: 25
                // maxSides: 25
            },
            chamfer: null,
        
            isStatic: false,
            isSensor: false,
            isSleeping: false,
            ignoreGravity: false,
            ignorePointer: false,
        
            sleepThreshold: 60,
            density: 0.001,
            restitution: BOUNCINESS, // 0
            friction: FRICTION, // 0.1
            frictionStatic: FRICTION_STATIC, // 0.5
            frictionAir: FRICTION_AIR, // 0.01
        
            inertia: Infinity,
        
            force: { x: 0, y: 0 },
            angle: 0,
            torque: 0,
        
            collisionFilter: {
                group: 0,
                category: 0x0001,
                mask: 0xFFFFFFFF,
            },
        
            // parts: [],
        
            // plugin: {
            //     attractors: [
            //         (function(bodyA, bodyB) { return {x, y}}),
            //     ]
            // },
        
            slop: 0.05,
        
            timeScale: 1
        }
    }
    
    preload ()
    {
        this.reset_variables()
    }

    create ()
    {
        // Fix sudden stop of bouncing
        Phaser.Physics.Matter.Matter.Resolver._restingThresh = RESTING; // default is 4

        //Make stacking more stable
        this.matter.world.engine.positionIterations = POSITION_ITER;  // default is 6

        // Set world bounds
        this.matter.world.setBounds(PADDING_SIDE, 0, WIDTH - PADDING_SIDE*2, HEIGHT - PADDING_BOTTOM, 1500);
        // this.matter.world.setBounds(0, 0, 800, 600, 500);

        // Create guiding line
        this.GUIDE_LINE = this.add.rectangle(0, PADDING_TOP + FRUIT_SPAWN_PADDING, 2*GAME_SCALE_RATIO, GAME_HEIGHT, 0xffffff).setOrigin(0.5, 0)

        // Create top and bottom rectangles
        this.add.rectangle(0, 0, WIDTH, PADDING_TOP, PADDING_COLOR).setOrigin(0)
        this.add.rectangle(0, HEIGHT - PADDING_BOTTOM, WIDTH, HEIGHT, PADDING_COLOR).setOrigin(0)
        
        // Create game line
        this.add.rectangle(0, GAME_LINE_HEIGHT, WIDTH, 4*GAME_SCALE_RATIO, PADDING_COLOR).setOrigin(0)

        // Create side rectangles
        this.add.rectangle(0, 0, PADDING_SIDE, HEIGHT, PADDING_COLOR).setOrigin(0)
        this.add.rectangle(WIDTH - PADDING_SIDE, 0, PADDING_SIDE, HEIGHT, PADDING_COLOR).setOrigin(0)

        // Create timer for spawn delay
        this.spawn_timer = this.time.addEvent({
            delay: SPAWN_DELAY,
            startAt: SPAWN_DELAY
        });

        // Create a home button
        this.create_button(WIDTH - Math.max(PADDING_SIDE, 10*SCALE_RATIO) - 60*SCALE_RATIO, 25*SCALE_RATIO, 120*SCALE_RATIO, 40*SCALE_RATIO, "Home", function(){
            this.scene.start("Menu")
        })

        // Create score text object
        this.score_text = this.add.text(Math.max(10*SCALE_RATIO, PADDING_SIDE), 25*SCALE_RATIO, "Score: 0", FONT)
        .setOrigin(0, 0.5)

        // Create Next queue object
        this.queue_text = this.add.text(Math.max(10*SCALE_RATIO, PADDING_SIDE) + 30*SCALE_RATIO, HEIGHT - PADDING_BOTTOM/2, "Next:", FONT)
        .setOrigin(0.5)

        // Fill queue
        for (let i = 0; i < QUEUE_LENGTH; i++) {
            const ball_lvl = POSSIBLE_BALL_SPAWN[randint(0, POSSIBLE_BALL_SPAWN.length-1)] - 1
            this.queue.push(this.create_queue_ball(Math.max(10*SCALE_RATIO, PADDING_SIDE) + 100*SCALE_RATIO + i * (MAX_QUEUE_HEIGHT + 8*SCALE_RATIO), HEIGHT - PADDING_BOTTOM/2, ball_lvl))
        }

        // Create current ball
        const ball_lvl = POSSIBLE_BALL_SPAWN[randint(0, POSSIBLE_BALL_SPAWN.length-1)] - 1
        this.current_ball = this.create_dumb_ball(0, DIAMETERS[ball_lvl] / 2 + PADDING_TOP + FRUIT_SPAWN_PADDING, ball_lvl, DIAMETERS[ball_lvl])

        // this.input.on("pointerdown", function (pointer) {
        //     document.querySelector("body").requestFullscreen()
        //     window.screen.orientation.lock("portrait-primary");
        // }, this)

        this.input.on('pointerup', function (pointer) {
            if (this.spawn_timer.getRemaining() > 0) {
                return
            }

            // Reset spawn delay timer
            this.spawn_timer.reset({delay: SPAWN_DELAY})

            // Pop from queue
            let old_queue_obj = this.queue.shift()

            // Shift queue on display
            for (let ball of this.queue) {
                for (let attr of Object.values(ball.objects)) {
                    attr.setPosition(attr.x - (MAX_QUEUE_HEIGHT + 8*SCALE_RATIO), attr.y)
                }
            }

            // Add new ball to queue
            const ball_lvl = POSSIBLE_BALL_SPAWN[randint(0, POSSIBLE_BALL_SPAWN.length-1)] - 1
            this.queue.push(this.create_queue_ball(Math.max(10*SCALE_RATIO, PADDING_SIDE) + 100*SCALE_RATIO + (QUEUE_LENGTH - 1) * (MAX_QUEUE_HEIGHT + 8*SCALE_RATIO), HEIGHT - PADDING_BOTTOM/2, ball_lvl))

            // Destroy first ball in queue on display
            for (let attr of Object.values(old_queue_obj.objects)) {
                attr.destroy()
            }

            //Create new current ball
            const new_current_ball = this.create_dumb_ball(0, DIAMETERS[old_queue_obj.n] / 2 + PADDING_TOP + FRUIT_SPAWN_PADDING, old_queue_obj.n, DIAMETERS[old_queue_obj.n])

            // Create physics ball
            let new_x
            if (pointer.x < DIAMETERS[this.current_ball.n] / 2 + PADDING_SIDE) {
                new_x = DIAMETERS[this.current_ball.n] / 2 + PADDING_SIDE
            } else if (pointer.x > WIDTH - DIAMETERS[this.current_ball.n] / 2 - PADDING_SIDE){
                new_x = WIDTH - DIAMETERS[this.current_ball.n] / 2 - PADDING_SIDE
            } else {
                new_x = pointer.x
            }
            this.create_ball(new_x, DIAMETERS[this.current_ball.n] / 2 + PADDING_TOP + FRUIT_SPAWN_PADDING, this.current_ball.n)

            // Destroy current ball
            for (let attr of Object.values(this.current_ball.objects)) {
                attr.destroy()
            }

            // Assign new current ball
            this.current_ball = new_current_ball

        }, this);

        this.matter.world.on("collisionstart", function (event, _, __) {
            let bodyA
            let bodyB
            for (let i = 0; i < event.pairs.length; i++) {
                if (event.pairs[i].bodyA.gameObject != null && event.pairs[i].bodyB.gameObject != null) {
                    if (event.pairs[i].bodyA.gameObject.my_n == event.pairs[i].bodyB.gameObject.my_n) {
                        bodyA = event.pairs[i].bodyA
                        bodyB = event.pairs[i].bodyB
                    }
                }
            }

            if (bodyA != null) {
                let x = (bodyA.position.x + bodyB.position.x) / 2;
                let y = (bodyA.position.y + bodyB.position.y) / 2;

                this.scene.create_ball(x, y, bodyA.gameObject.my_n + 1);
                this.scene.add_score(bodyA.gameObject.my_n);

                for (let i = 0; i < this.scene.balls.length; i++) {
                    if (this.scene.balls[i].ball === bodyA.gameObject || this.scene.balls[i].ball === bodyB.gameObject) {
                        let del = this.scene.balls.splice(i, 1)
                        for (let attr of Object.values(del[0].attr)) {
                            attr.destroy()
                        }
                        del[0].timer.remove()
                        i--
                    }
                }

                bodyA.gameObject.destroy();
                bodyB.gameObject.destroy();

            }
        });
    }

    update ()
    {
        for (let i = 0; i < this.balls.length; i++) {
            let x = this.balls[i].ball.x
            let y = this.balls[i].ball.y
            let diameter = this.balls[i].ball.my_diameter

            if (this.balls[i].ball.my_n + 1 < 10) {
                this.balls[i].attr.text.setPosition(x - diameter/4, y - diameter/3)
            } else {
                this.balls[i].attr.text.setPosition(x - diameter/3, y - diameter/3.7)
            }
            // this.balls[i].attr.text.setPosition(x, y)

            this.balls[i].attr.outline.setPosition(x, y)

            if (this.balls[i].ball.getBottomCenter().y < GAME_LINE_HEIGHT) {
                if (Math.abs(this.balls[i].ball.body.velocity.x) < 2 && Math.abs(this.balls[i].ball.body.velocity.y) < 2) {
                    this.balls[i].timer.paused = false
                }
            } else if (!this.balls[i].timer.paused) {
                this.balls[i].timer.paused = true
                this.balls[i].timer.reset(this.LOSE_TIMER_OBJ)
            }
        }

        let current_x
        if (this.input.x < DIAMETERS[this.current_ball.n] / 2 + PADDING_SIDE) {
            current_x = DIAMETERS[this.current_ball.n] / 2 + PADDING_SIDE
        } else if (this.input.x > WIDTH - DIAMETERS[this.current_ball.n] / 2 - PADDING_SIDE){
            current_x = WIDTH - DIAMETERS[this.current_ball.n] / 2 - PADDING_SIDE
        } else {
            current_x = this.input.x
        }
        this.current_ball.objects.outline.setPosition(current_x, this.current_ball.objects.outline.y)
        this.current_ball.objects.ball.setPosition(current_x, this.current_ball.objects.ball.y)
        

        if (this.current_ball.n + 1 < 10) {
            this.current_ball.objects.text.setPosition(current_x - this.current_ball.diameter/4, this.current_ball.objects.text.y)
        } else {
            this.current_ball.objects.text.setPosition(current_x - this.current_ball.diameter/3, this.current_ball.objects.text.y)
        }
        // this.current_ball.objects.text.setPosition(current_x, this.current_ball.objects.text.y)


        this.GUIDE_LINE.setPosition(current_x, this.GUIDE_LINE.y)
    };



    create_ball(x, y, n) {
        if (n >= MAX_N) {
            return
        }
        let diameter = DIAMETERS[n]
    
        let newBallObj = this.default_ball
        newBallObj.shape.radius = diameter / 2
    
        // let ball_obj = this.add.sprite(x, y, "big_ball")
        // ball_obj.scale = diameter / 1000
        let ball_obj = this.add.circle(x, y, diameter / 2, COLORS[n])
        // let ball_obj = this.add.circle(x, y, diameter / 2, 0x1e9ceb)
    

        let fontSize
        if (n+1 >= 10) {
            fontSize = diameter / 1.6
        } else {
            fontSize = diameter / 1.2
        }
        let text = this.add.text(0, 0, n+1, {fontSize: fontSize})
        .setLetterSpacing(-10)
        // .setOrigin(0.5)
    
        let outline = this.add.circle(0, 0, diameter / 2, 0xffffff, 0)
        outline.setStrokeStyle(1*GAME_SCALE_RATIO, 0x000000)

        let physics_ball = this.matter.add.gameObject(ball_obj, newBallObj)
        // physics_ball.setMass(1)
        physics_ball.my_n = n
        physics_ball.my_diameter = diameter
    
        let timer = this.time.addEvent(this.LOSE_TIMER_OBJ);
        timer.paused = true;
    
        this.balls.push({
            ball: physics_ball,
            timer: timer,
            attr: {
                text: text, 
                outline: outline
            }
        });
    }
    
    create_dumb_ball(x, y, n, diameter) {
        // let ball_obj = this.add.sprite(x, y, "big_ball")
        // ball_obj.scale = diameter / 1000
        let ball_obj = this.add.circle(x, y, diameter / 2, COLORS[n])
    
        let fontSize
        let text
        if (n + 1 < 10) {
            fontSize = diameter / 1.2
            text = this.add.text(x - diameter/4, y - diameter/3, n+1, {fontSize: fontSize}).setLetterSpacing(-10)
        } else {
            fontSize = diameter / 1.6
            text = this.add.text(x - diameter/3, y - diameter/3.7, n+1, {fontSize: fontSize}).setLetterSpacing(-10)
        }
        // text = this.add.text(x, y, n+1, {fontSize: fontSize})
        // .setLetterSpacing(-10)
        // .setOrigin(0.5)
    
        let outline = this.add.circle(x, y, diameter / 2, 0xffffff, 0)
        outline.setStrokeStyle(1*GAME_SCALE_RATIO, 0x000000)
    
        return ({
            n: n,
            diameter: diameter,
            objects: {
                ball: ball_obj,
                text: text, 
                outline: outline}
        });
    }
    
    create_queue_ball(x, y, n) {
        // let diameter = Math.min(DIAMETERS[n], MAX_QUEUE_SIZE)
        let diameter = MAX_QUEUE_HEIGHT
        return this.create_dumb_ball(x, y, n, diameter)
    }
    
    add_score(n) {
        this.score += DEF_DIAMETERS[n] / 10
        this.score_text.setText("Score: " + Math.floor(this.score))
    }
    
    game_over_callback() {
        this.args.game_over()
    }

    game_over() {
        this.scene.pause()
        this.scene.launch("LoseOverlay", {score: Math.floor(this.score)})
    }

}


let config = {
    type: Phaser.AUTO,
    parent: "game",
    backgroundColor: BG_COLOR,
    scene: [Menu, GameScene, LoseOverlay, Settings, DiameterSettings],
    physics: {
        default: 'matter',
        matter: {
            enableSleeping: false,
            gravity: { y: GRAVITY },
            debug: false,
        }
    },
    dom: {
        createContainer: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        width: WIDTH,
        height: HEIGHT,
    }
};

// Phaser stuff
let game = new Phaser.Game(config);


window.addEventListener("resize", function (event) {
    windowResize()
})