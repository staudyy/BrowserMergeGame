// SETTINGS

let DIAMETERS = [40, 50, 70, 100, 130, 180, 225, 270, 333];  //Ball sizes in px
const MAX_N = DIAMETERS.length;  //Max ball lvl that can exist (atm cant be higher than diameters.length)
const POSSIBLE_BALL_SPAWN = [0, 4];  //Possible ball level spawn ([from, to])
const SPAWN_DELAY = 500;  //Min delay between ball spawns (ms)
const QUEUE_LENGTH = 5;  // Next: Queue length
const LOSE_TIME = 2000

// to engine
const GRAVITY = 1
const BOUNCINESS = 0.3
const FRICTION = 0
const FRICTION_STATIC = 0
const FRICTION_AIR = 0.001
const RESTING = 0.2  //autism jednotka proste cim menej tym presnejsie bounces
const POSITION_ITER = 50

// Colors
const BG_COLOR = 0xd1812c
const PADDING_COLOR = 0xd12317

// Maybe not changeable
// const WIDTH = 600
// const HEIGHT = 1000
const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight

const SCALE_RATIO = HEIGHT / 1000
const MAX_QUEUE_SIZE = 50 * SCALE_RATIO

const PADDING_TOP = Math.max(50 * SCALE_RATIO, (50 * SCALE_RATIO) + (HEIGHT - WIDTH * 2) / 2)
const PADDING_BOTTOM = MAX_QUEUE_SIZE + 25 * SCALE_RATIO
const PADDING_SIDE = Math.max((WIDTH - HEIGHT / 2) / 2, 0)
const GAME_LINE_HEIGHT = PADDING_TOP + SCALE_RATIO * 150
const FRUIT_SPAWN_PADDING = 10 * SCALE_RATIO

const LOSE_TIMER_OBJ = {
    delay: LOSE_TIME,
    callback: game_over
}

const FONT = {
    fontSize: 25*SCALE_RATIO,
    fontFamily: 'Comic Sans MS, Verdana, serif'
}

for (i in DIAMETERS) {
    DIAMETERS[i] = DIAMETERS[i] * SCALE_RATIO
}

// Globals
let default_scene;
let balls = [];
let score_text;
let score = 0;
let queue_text;
let queue = [];
let current_ball;


function randint(start, stop) {
    return Math.floor(Math.random() * (stop - start + 1)) + start;
}


function preload ()
{
    this.load.image('ball0', 'assets/ball.png');
    this.load.image('ball1', 'assets/ball2.png');
    this.load.image('ball2', 'assets/ball3.png');
    this.load.image('ball3', 'assets/ball4.png');
    this.load.image('ball4', 'assets/ball5.png');

    this.load.image('big_ball', 'assets/big_ball.png');
    default_scene = this
}

function create ()
{
    // Fix sudden stop of bouncing
    Phaser.Physics.Matter.Matter.Resolver._restingThresh = RESTING; // default is 4

    //Make stacking more stable
    this.matter.world.engine.positionIterations = POSITION_ITER;  // default is 6

    // Set world bounds
    // this.matter.world.setBounds(PADDING_SIDE, PADDING_TOP, WIDTH - PADDING_SIDE*2, HEIGHT - PADDING_BOTTOM - PADDING_TOP, 500);
    this.matter.world.setBounds(PADDING_SIDE, 0, WIDTH - PADDING_SIDE*2, HEIGHT - PADDING_BOTTOM, 500);
    // this.matter.world.setBounds(0, 0, 800, 600, 500);

    // Create top and bottom rectangles
    this.add.rectangle(0, 0, WIDTH, PADDING_TOP, PADDING_COLOR).setOrigin(0)
    this.add.rectangle(0, HEIGHT - PADDING_BOTTOM, WIDTH, HEIGHT, PADDING_COLOR).setOrigin(0)
    
    // Create game line
    this.add.rectangle(0, GAME_LINE_HEIGHT, WIDTH, 5, PADDING_COLOR).setOrigin(0)

    // Create side rectangles
    this.add.rectangle(0, 0, PADDING_SIDE, HEIGHT, PADDING_COLOR).setOrigin(0)
    this.add.rectangle(WIDTH - PADDING_SIDE, 0, WIDTH, HEIGHT, PADDING_COLOR).setOrigin(0)

    // Create timer for spawn delay
    spawn_timer = this.time.addEvent({
        delay: SPAWN_DELAY
    });

    // Create score text object
    score_text = this.add.text(20, 10, "Score: 0", FONT)

    // Create Next queue object
    queue_text = this.add.text(40*SCALE_RATIO, HEIGHT - PADDING_BOTTOM/2, "Next:", FONT).setOrigin(0.5)

    // Fill queue
    for (let i = 0; i < QUEUE_LENGTH; i++) {
        const ball_lvl = randint(POSSIBLE_BALL_SPAWN[0], POSSIBLE_BALL_SPAWN[1])
        queue.push(create_queue_ball(100*SCALE_RATIO + i * (MAX_QUEUE_SIZE + 10), HEIGHT - PADDING_BOTTOM/2, ball_lvl))
    }

    // Create current ball
    const ball_lvl = randint(POSSIBLE_BALL_SPAWN[0], POSSIBLE_BALL_SPAWN[1])
    current_ball = create_dumb_ball(0, DIAMETERS[ball_lvl] / 2 + PADDING_TOP + FRUIT_SPAWN_PADDING, ball_lvl, DIAMETERS[ball_lvl])

    // this.input.on("pointerdown", function (pointer) {
    //     document.querySelector("body").requestFullscreen()
    //     window.screen.orientation.lock("portrait-primary");
    // }, this)

    this.input.on('pointerup', function (pointer) {
        if (spawn_timer.getRemaining() > 0) {
            return
        }

        // Reset spawn delay timer
        spawn_timer.reset({delay: SPAWN_DELAY})

        // Pop from queue
        let old_queue_obj = queue.shift()

        // Shift queue on display
        for (let ball of queue) {
            for (let attr of Object.values(ball.objects)) {
                attr.setPosition(attr.x - (MAX_QUEUE_SIZE + 10), attr.y)
            }
        }

        // Add new ball to queue
        const ball_lvl = randint(POSSIBLE_BALL_SPAWN[0], POSSIBLE_BALL_SPAWN[1])
        queue.push(create_queue_ball(100*SCALE_RATIO + (QUEUE_LENGTH - 1) * (MAX_QUEUE_SIZE + 10), HEIGHT - PADDING_BOTTOM/2, ball_lvl))

        // Destroy first ball in queue on display
        for (let attr of Object.values(old_queue_obj.objects)) {
            attr.destroy()
        }

        //Create new current ball
        const new_current_ball = create_dumb_ball(0, DIAMETERS[old_queue_obj.n] / 2 + PADDING_TOP + FRUIT_SPAWN_PADDING, old_queue_obj.n, DIAMETERS[old_queue_obj.n])

        // Create physics ball
        let new_x
        if (pointer.x < DIAMETERS[current_ball.n] / 2 + PADDING_SIDE) {
            new_x = DIAMETERS[current_ball.n] / 2 + PADDING_SIDE
        } else if (pointer.x > WIDTH - DIAMETERS[current_ball.n] / 2 - PADDING_SIDE){
            new_x = WIDTH - DIAMETERS[current_ball.n] / 2 - PADDING_SIDE
        } else {
            new_x = pointer.x
        }
        create_ball(new_x, DIAMETERS[current_ball.n] / 2 + PADDING_TOP + FRUIT_SPAWN_PADDING, current_ball.n)

        // Destroy current ball
        for (let attr of Object.values(current_ball.objects)) {
            attr.destroy()
        }

        // Assign new current ball
        current_ball = new_current_ball

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
            create_ball(x, y, bodyA.gameObject.my_n + 1);

            add_score(bodyA.gameObject.my_n);

            for (let i = 0; i < balls.length; i++) {
                if (balls[i].ball === bodyA.gameObject || balls[i].ball === bodyB.gameObject) {
                    let del = balls.splice(i, 1)
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

function update ()
{
    for (let i = 0; i < balls.length; i++) {
        let x = balls[i].ball.x
        let y = balls[i].ball.y
        let diameter = balls[i].ball.my_diameter
        balls[i].attr.text.setPosition(x - diameter/4, y - diameter/3)
        balls[i].attr.outline.setPosition(x, y)

        if (balls[i].ball.getBottomCenter().y < GAME_LINE_HEIGHT) {
            if (Math.abs(balls[i].ball.body.velocity.x) < 2 && Math.abs(balls[i].ball.body.velocity.y) < 2) {
                console.log("yeppers")
                balls[i].timer.paused = false
            }
        } else if (!balls[i].timer.paused) {
            balls[i].timer.paused = true
            balls[i].timer.reset(LOSE_TIMER_OBJ)
        }
    }

    let current_x
    if (default_scene.input.x < DIAMETERS[current_ball.n] / 2 + PADDING_SIDE) {
        current_x = DIAMETERS[current_ball.n] / 2 + PADDING_SIDE
    } else if (default_scene.input.x > WIDTH - DIAMETERS[current_ball.n] / 2 - PADDING_SIDE){
        current_x = WIDTH - DIAMETERS[current_ball.n] / 2 - PADDING_SIDE
    } else {
        current_x = default_scene.input.x
    }
    current_ball.objects.outline.setPosition(current_x, current_ball.objects.outline.y)
    current_ball.objects.ball.setPosition(current_x, current_ball.objects.ball.y)
    current_ball.objects.text.setPosition(current_x - current_ball.diameter/4, current_ball.objects.text.y)
};

function create_ball(x, y, n) {
    if (n >= MAX_N) {
        return
    }
    let diameter = DIAMETERS[n]

    let newBallObj = default_ball
    newBallObj.shape.radius = diameter / 2

    let ball_obj = default_scene.add.sprite(x, y, "big_ball")
    ball_obj.scale = diameter / 1000
    // let ball_obj = default_scene.add.circle(x, y, diameter / 2, 0x1e9ceb)

    let text = default_scene.add.text(0, 0, n+1, {fontSize: diameter / 1.2})

    let outline = default_scene.add.circle(0, 0, diameter / 2, 0xffffff, 0)
    outline.setStrokeStyle(1, 0x000000)

    let physics_ball = default_scene.matter.add.gameObject(ball_obj, newBallObj)
    physics_ball.my_n = n
    physics_ball.my_diameter = diameter

    timer = default_scene.time.addEvent(LOSE_TIMER_OBJ);
    timer.paused = true;

    balls.push({
        ball: physics_ball,
        timer: timer,
        attr: {
            text: text, 
            outline: outline
        }
    });
}

function create_dumb_ball(x, y, n, diameter) {
    let ball_obj = default_scene.add.sprite(x, y, "big_ball")
    ball_obj.scale = diameter / 1000

    let text = default_scene.add.text(x - diameter/4, y - diameter/3, n+1, {fontSize: diameter / 1.2})

    let outline = default_scene.add.circle(x, y, diameter / 2, 0xffffff, 0)
    outline.setStrokeStyle(1, 0x000000)

    return ({
        n: n,
        diameter: diameter,
        objects: {
            ball: ball_obj,
            text: text, 
            outline: outline}
    });
}

function create_queue_ball(x, y, n) {
    let diameter = Math.min(DIAMETERS[n], MAX_QUEUE_SIZE)
    return create_dumb_ball(x, y, n, diameter)
}

function add_score(n) {
    score += 10*((n+1)*2)
    score_text.setText("Score: " + score)
}

function game_over() {
    console.log("you lose")
    default_scene.add.text(WIDTH/2, HEIGHT/2, "Game Over", FONT).setOrigin(0.5)
    default_scene.scene.pause()
}

let config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: BG_COLOR,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'matter',
        matter: {
            enableSleeping: false,
            gravity: { y: GRAVITY },
            debug: false,
        }
    }
};

const default_ball = {
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

// Phaser stuff
let game = new Phaser.Game(config);
let spawn_timer