
# Browser Merge Game
A game about stacking and merging balls.
This is a browser game inspired by a popular game called *Suika Game*, with lots of customizability. You can change the way the entire game behaves in virtually any way you want. You can change how bouncy the balls are, how big they are, how many there are and so much more!

## Settings
Negative values result in funny behavior, I could have disabled them, but I find them fun to play around with :)

**Spawn Delay** – How long you have to wait until you can drop another ball (in miliseconds.)

**Queue Length** – How many balls are in the queue.

**Time required above line to lose** – How long does a ball have to stay above the line for the game to end (in milliseconds.) The timer starts only after the ball is fairly stationary.

**Gravity (vertical)** – Vertical gravity strength.

**Gravity (horizontal)** – Horizontal gravity strength.

**Bounciness** – Bounciness of the balls on a scale 0 – 1. 0 disables bouncing and 1 makes the balls perfectly bouncy. Numbers that aren't between 0 and 1 do not crash the game, but they have unexpected results. Numbers smaller than 0 make the balls kind of stick together, and numbers higher than 1 make the balls gain energy (momentum) at every bounce.

**Friction** – The friction the balls have between the walls and each other.

**Static Friction** – If an object (a ball) is stationary it requires more force for it to start moving. Static Friction changes this property.

**Air Friction** – The friction between the balls and air.

**Game area sides ratio (Width/Height)** – The aspect ratio of the actual game as a number. If for example you would want an aspect ratio of 1:2, you would have to divide 1/2 = 0.5. Change this setting to this number.

**ADVANCED: Resting Threshold** – Changes ball bouncing behavior. When its smaller the bounces are more accurate.

**ADVANCED: Position Iterations** – How many times per second is the position of every object updated. Changes the stacking behavior. Smaller numbers make the stacking more stable, but the balls kind of start overlapping. Higher numbers fix the overlapping issue, but it in turn makes the stacking more chaotic and the balls vibrate more. Sadly stacking in my game is not perfect due to the limitations of the physics engine I used.
