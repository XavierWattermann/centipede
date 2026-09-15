Xavier Wattermann - CEG6500 - Lab 1

Description:

4 shapes include in `lab1.js`:

Shape 1 - Triangle - Color: Yellow; Not Filled in (`gl.LINE_LOOP` was used)
 - This is the only shape that has <=4 vertices. 

Shape 2 - [shape name / description] - Color: __

Shape 3 - [shape name / description] - Color: __




Lab 1 Instructions:

Instructions
Lab 1: Creating Three Shapes in 2D

Write a WebGL application that will display three different 2D shapes on your canvas together, with one color for each shape. The JavaScript libraries you must use are webgl-utils.js, initShaders.js and MV.js from Angel &amp; Shreiner (these are shared in the starter Code.zip file with Module 02 Creating a WebGL Application).

Preparatory Material: Code covered in class in Module 02 Creating a WebGL Application. You can also use code covered in from Module 03 Shaders, however, that is not strictly necessary to complete the assignment.

Store your HTML and JS code in lab1.html and lab1.js respectively.

Requirements:
1) Only one of the shapes can have 4 vertices or lesser (i.e. &lt;=4 ), the rest should have more than 4 vertices, i.e. 4+.
2) One shape must be an ellipse. You can use one of the following equations for the ellipse. They are very minor alterations to the equations for the circle discussed in class:

Either: ((x-a)^2)/c^2 + ((y-b)^2)/d^2 = 1

Or: x = c cos(theta) + a
&nbsp; &nbsp; y = d sin(theta) + b

The above equations are in the general form. You should make sure that your ellipse fits within the clipspace. This would need you to figure out values for c, d, a, and b that make the ellipse fit in the clipspace. The values of c and d should NOT BE THE SAME: if they are the same, you get a circle.

3) One of the three shapes should be drawn using LINE_LOOP or LINE_STRIP, i.e., should not be filled. Another shape must be drawn using TRIANGLE_FAN or TRIANGLE_STRIP. The remaining shape can be drawn as you like.

4) Provide your name with your description in a README.txt file for the lab. This is required.

5) Submit a single zip file with all your code and your README. Your zip file folder unzipped have the following structure:


FirstName_LastName
---README.ext
---Common
------webgl-utils.js
------initShaders.js
------MV.js
---lab1
------lab1.js
------lab1.html

Put your name as a comment at the top line of the lab1.js file.

Scoring Rubric: Total - 10 points

1) Each shape drawn correctly is 2 points. If you do not have an ellipse, you will lose 2 points. If more than one shape has 4 or less vertices (i.e. <=4), you will lose 2 points.
2) The ellipse should have more than 5 vertices (but a good ellipse has several).
3) Description in the README.txt file is worth 2 points.
4) Each shape should have a different color. One color per shape gets you 2 points.