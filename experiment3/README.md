## Experiment 3 - Alternate Worlds

In this project I sought to create two different procedurally generated worlds.
Using p5.js, I created a 32x32 grid of tiles that utilized Kacper Woźniak's 
pico-8 tileset. My first creation was a dungeon generator that creates dungeons
with discrete rooms and connecting corridors. I sought to imitate Rogue's (1980)
rectangular dungeon rooms and rigid hallways while expanding on the scale and
variety of outputs. Every room, except for those partially offscreen, are connected
to each other. The rooms are connected by starting at the first generated room and
then walking to the nearest point on the nearest room. Each room is only visited 
once and every room must be visited. Then, doors are placed at the connection point
between rooms.
The second world I created was a canyon environment inspired by the deserts of Colorado
and Arizona. I started by creating a river that cuts across the landscape. Then I added
curvature to the river by using quadratic interpolation to each point in the line representing
the river. One alternative that could yield interesting results would be through the use of a 
trigonometric function to create the snake-like bends seen in many of these rivers. After 
creating the river, I added mud along the bank and placed shrubs randomly in tiles adjacent to
mud tiles. From here, I placed thickets of trees. To do this, I randomly selected shrub tiles and
then added a tree tile. These tree tiles were "seeds" from which I would perform a breadth first
search of nearby tiles. At each neighboring tile, I would randomly choose whether to place a tree.
If a tree was placed, then all of the neighboors of that node would be added to the stack of nodes
to explore. Lastly, I added the canyon walls by offsetting two lines from the river's centerline,
which I stored when generating the river to avoid having to calculate it. I then used perlin noise
with a threshold value to errode the canyone wall to make it appear more natural.

###Credits:
Kacper Woźniak's Micro Tileset - Overworld & Dungeon [https://thkaspar.itch.io/micro-tileset-overworld-dungeon]