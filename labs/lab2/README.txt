Xavier Wattermann - CEG6500 - Lab 2

Description:





TODO (Delete This):
 - Change shape (can't use the square; use octagon from lab 1)




================================================================================================================================================================================================

Lab 2: Animation and Interaction

Preparatory Material: Code covered in class up to and including 04 Animation and Interactions

In this lab, you will write a WebGL application that demonstrates animation and interactions from the user. In particular, you will implement a moving shape that satisfies the following criteria:
1) The shape is a polygon with more than 4 vertices.
2) The shape starts at the origin, and starts moving along the x-axis to the right. The rate of animation is your choice.
3) You use the keys ‘a’, ’d’, ‘w’, or ’s’ to change the direction of motion of the shape: 
- The ‘a’ key makes the shape move to the left, 
- the ‘d’ key makes the shape move to the right,
- the ‘w’ key makes the shape move up, 
- the ’s’ key makes the shape move down.
4) You use two buttons, ‘Increase’ and ‘Decrease’ to change the speed of motion of the shape. The ‘Increase’ button increases the speed, and the ‘Decrease’ button reduces the speed. The amount by which you make the animation faster or slower is your choice.
5) You use a mouse click makes the shape jump to the location of the mouse click and keep moving along the direction it was moving. For instance, if the shape was moving to the right, and you clicked the location (10, 10) on a canvas of size 512 x 512, then your shape should start moving to the right from location (10, 10).
6) You have a button called ‘StartRotate’ to rotate the shape and ’StopRotate’ to stop the shape’s rotation. When you press ‘StopRotate’, the shape should preserve its rotation (i.e., not reset to the original orientation you started out with). The direction of rotation (counter-clockwise or clock-wise) and the speed of rotation (fast, slow, medium-paced) is up to you.
7) You should have a README.txt file containing the description of your implementations.

The attached .mp4 video shows a guide as to what the end result will look like for a few interactions with an animated square. Your polygon MUST have more than 4 vertices (see the scoring rubric).

Hint: You may find the following variables useful:
1) stepX and stepY: used to change the shape location over frames (i.e. in the animation) and through mouse clicks.
2) stepScale: used to speed up or slow down the animation.
3) directionX and directionY: used to specify the direction of motion of the shape (negative could mean left or up, positive could mean right or down).
4) rotateFlag: used to start or stop a rotation.

5) Submit a single zip file with all your code and your README. Your zip file folder unzipped have the following structure:

FirstName_LastName
---README.ext
---Common
------webgl-utils.js
------initShaders.js
------MV.js
---lab2
------lab2.js
------lab2.html


Scoring Rubric: Total - 10 points
1) 1 point for the animation of a polygon with more than 4 vertices (shape should keep moving).
2) 4 points for direction change using ‘a’, ’s’, ‘d’, and ‘w’.
3) 1.5 points for increasing and decreasing the speed.
4) 1 point for making the shape jump using mouse clicks.
5) 1.5 points for rotate and stop rotate.
6) 1 point for a concise description in the README.txt on how you implemented each interaction.
