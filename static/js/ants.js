// Simple way to attach js code to the canvas is by using a function
function sketchProc(processing) {

  processing.width = 400;
  processing.height = 400;

  var sqrt = Math.sqrt;
  var log = Math.log;
  var exp = Math.exp;
  var abs = Math.abs;
  var min = Math.min;
  var max = Math.max;
  var floor = Math.floor;

  var cos = function(x){
    return Math.cos(x/180*Math.PI);
  };

  var sin = function(x){
    return Math.sin(x/180*Math.PI);
  };

  var atan = function(x){
    return Math.atan(x)/Math.PI*180;
  };

  var random = function(x){
    return x*Math.random();
  };

/*ANTS SIMULATOR
by Maxime Fournes

v0.4 : NEW UPDATE IS OUT ! Check the changelog !

Use the arrows to move around and the slider to zoom in/out.
Click anywhere to create food. 
Press P to pause the simulation.
Try to put food far away from the nest and observe what happens.
Carefull : don't forget to feed your ants or they will starve to death !

Try and play around with the following variables :
*/
var nAnts = 10; //NUMBER OF ANTS AT START
var ageing=true; //Will ants die of ageing? true=yes,false=no
var LifeExpectancy = 15000; //Life expectancy, 1000=1min
var HungerThreshold = 2000; //Time before hunger, 1000=1min
var InitialFoodNest = 10; //Initial amount of food in the nest

var debugMode=false; //Toggle debug mode. Handle with care ;)
//NEW : Press D to enter debug mode

/*
Enjoy, and please vote up if you like it ! Votes will motivate me to go on with developping this program ;)

Also please report bugs and feel free to suggest features you'd like me to add in the Tips and Feedback section.

NEXT UPDATE : Predators !

Planned updates :
-Memory of paths and stuff
-Pheromones -> DONE
-Predators and Preys
-Competition with an other nest
-Ants birth and death depending on food levels in the nest
-More complex and realistic behaviour
-Add obstacles

Version history :

v0.4
Baby ants are in !!
This was a big update in terms of coding so I thought it deserved a new version number. Here are all the changes that occured:

    -Ants now get bigger as they grow up. They are born as         tiny babies and take approximately 30 seconds before getting to their final size;

    -Hail to the Queen ! The Queen is a new entity that will give birth to new ants if it is provided with enough food. When healthy its birthrate will increase. When starving its birthrate will decrease. Be carefull, if the queen dies your nest is doomed !

    -Queen status is displayed in the top-right of the screen
    
    -The code have been cleaned up a bit and commented



v0.35
Ants now have a memory !
An ant that has found food will now remember its position ! In addition to being a more natural behaviour it will allow me to decrease greatly the number of pheromones released hence improve the program's performance !
A pause mode has also been added, that you can access by pressing "P".

v0.34
Finalised the hunger system.
Feed your ants if you want them to live !
When hungry, ants will come back to nest to feed, if no food is in the nest they will start starving. Starving ants become less productive as they do more and more goings and comings to the nest in the hope to get food.
Ants will get hungry after 1min without food, they will starve after 3min and die after 5min !

v0.335
Added hunger management for ants. This feature is still bugged. A new version is coming soon to fix it.

v0.33
Ants are not immortal any more !
Ants will die because of ageing. When an ant is dead it will slowly decompose before being definitely removed from the board.
Ageing can be toggled on/off via the variable "ageing".

v0.32
Added a debug mode accessible by setting the variable debugMode to "true".
Changed maximum unzoom to 5 and default unzoom to 2.

v0.31
Added a new behavioural mode : exploration. Some ants will explore the surroundings while most of them guard the nest.

v0.3
Added Pheromones !
When carrying food, ants now emit pheromones on their way back to nest. Inactive ants will follow peromones all the way to the food.

v0.21
Food now disappears when eaten.

v0.2 :
Added food :
When finding food the ants will gather as much as they can carry and take it back to the nest.

v0.1 :
The ants follow by default a realistic random walk.
Added a nest and a zoom function.

*/
processing.frameRate(30);

//Global variables
var r1=2, r2=1;
var limX = 1000, limY = 1000;
var currentScale = 2;
var maxScale = 5;
var translateX=200, translateY=200;
var sliderPress=false;
var Decomposition = 1000;
var drawPheromones = true;
var pause = false;
var QUEENMAXBIRTHRATE=0.005;
var BIRTHRATESTEP = QUEENMAXBIRTHRATE/8000;

var FOODMIN = 50;
var FOODVARIABLE = 100;

var mouseIsPressed = false;


//This zoom slider design is from Peter Collingridge :
//https://www.khanacademy.org/cs/prime-density-spiral/1125572

var drawSlider = function(x, y) {    
    var width = 100;
    processing.strokeWeight(1);
    processing.fill(71, 71, 71);
    
    processing.rect(x, y, width, 3, 4);
    processing.stroke(160, 160, 160);
    processing.line(x + 1, y, x + width - 2, y);

    processing.fill(180, 180, 180);
    processing.stroke(50, 50, 50);
    var proportion = (currentScale - 0.5) / (maxScale - 0.5);
    var buttonX = x + width * (1 - proportion) - 5;
    
    processing.rect(buttonX, y-7, 10, 16, 3);
    processing.line(buttonX + 3, y - 2, buttonX + 7, y - 2);
    processing.line(buttonX + 3, y + 1, buttonX + 7, y + 1);
    processing.line(buttonX + 3, y + 4, buttonX + 7, y + 4);
    
    // Handle mouse events
    if (mouseIsPressed) {
        // Drag slider for scale
        if (processing.mouseX > x && processing.mouseX < x + width &&
            processing.mouseY > y - 7 && processing.mouseY < y + 9) {
            sliderPress=true;
            proportion = (width + x - processing.mouseX) / width;
            currentScale = 0.5 + proportion * (maxScale - 0.5);
        }
    }
};


//Returns the distance between a point and the origin (the euclidian norm of the vector)
var distance = function(x,y)
{
    return sqrt(x*x + y*y);
};

//Generates a random sample from a normal distribution
var snorm=function(m,s)
{
 var s1;
 var s2;
 
 var x1 = random(1000000)/1000000;
 var x2 = random(1000000)/1000000;
 
 s1=m+s*sqrt(-2*log(x1))*cos(360*x2);

 
 return s1;
};

//Generates a random sample from a lognormal distribution
var slognorm = function(m,s)
{
    
    return exp(snorm(log(m)+s*s,log(1+s*s/m/m)));
    
};

//Finds the angle for the coordinates (x,y)
var angleFind = function(x,y)
{
    if(x>0)
    {
        return atan(y/x);
    }
    else
    {
        return 180 - atan(-y/x);
    }
    
};

//translates an angle in the interval [-180,180]
var translateAngle = function(x)
{
    if(x<-180)
    {
        return x - 360;
    }
    else if(x>180)
    {
        return x - 360;
    }
    else
    {
        return x;
    }
};

//Returns the sign of x
var sign = function(x)
{
    if(x===0)
    {
        return 1;
    }
    else
    {
        return x/abs(x);
    }
};

/* ///////////////////////////////
//////////////////////////////////
//////////////////////////////////
//////////////////////////////////

OBJECTS

//////////////////////////////////
//////////////////////////////////
//////////////////////////////////
///////////////////////////////// */

var pheromone = function(x,y,d)
{
    this.x = x;
    this.y = y;
    this.t = 10*sqrt(d);
    
    //True if the pheromone must disappear in the next frame
    this.isOut = function()
    {
        if(this.t<=0)
        {
            return true;
        }
        else
        {
            return false;
        }
    };
    
    this.update = function()
    {
        this.t--;
    };
    
    this.draw = function() 
    {
         processing.noStroke();
         processing.fill(255, 204, 0);
         processing.ellipse(x,y,2,2);
         processing.stroke(0);
         
         if(debugMode)
         {
            processing.fill(255, 204, 0);
            processing.rect(x,y,10,10);
         }
    };
};

var food = function(x,y,q)
{
    this.quantity = q;
    this.x=x;
    this.y=y;
    
    //Removes a quantity q of food from the food element
    this.removeQuantity = function(q)
    {
        if(this.quantity>q)
        {
            this.quantity -= q;
        }
        else
        {
            q = this.quantity;
            this.quantity = 0;
        }  
    return q;
    };
    
    //true when the quantity reaches 0
    this.isEmpty = function()
    {
        if(this.quantity <= 0)
        {
            return true;
        }
        else
        {
            return false;
        }
    };
    
    this.draw = function() 
    {
        processing.fill(0, 92, 25);
        processing.ellipse(this.x,this.y,2*sqrt(abs(this.quantity)+1),2*sqrt(abs(this.quantity)+1));
    };
    
};

/***********************************************************
 * 
 * 
 * 
 * 
 *              QUEEN
 * 
 * 
 * 
 * 
 * 
 * *********************************************************/

var queen = function()
{
    this.hunger = 0;
    this.hungerThreshold = snorm(HungerThreshold/2,HungerThreshold/20);
    this.starveThreshold = this.hungerThreshold * 6;
    this.starveDeathThreshold = this.hungerThreshold * 11;
    this.birthRate = QUEENMAXBIRTHRATE/10;
    this.dead = false;
    this.isStarving = false;
    this.isHungry = false;
    this.mode="breeding";
    
    this.checkState = function()
    {
        this.isHungry=false;
        this.isStarving=false;
        if(this.hunger>this.hungerThreshold)
        {
            this.isHungry=true;
        }
        if(this.hunger>this.starveThreshold)
        {
            this.isStarving=true;
        }
        if(this.hunger>this.starveDeathThreshold)
        {
            this.kill();
        }
    };
    
    this.getState = function()
    {
        if(this.dead){return "Dead";}
        if(this.mode==="eating"){return "Eating";}
        if(this.isStarving){return "Starving";}
        if(this.isHungry){return "Hungry";}
        if(this.mode==="breeding"){return "Breeding";}
    };
    
    this.kill = function()
    {
        this.dead = true;
        this.mode = "dead";
    };
    
    this.updateBirthRate = function()
    {
        if(!this.isHungry)
        {
            this.birthRate = min(this.birthRate + BIRTHRATESTEP, QUEENMAXBIRTHRATE);
        }
        else if (this.isStarving)
        {
            this.birthRate = max(this.birthRate - BIRTHRATESTEP, -QUEENMAXBIRTHRATE);
        }
    };
    
     this.checkHunger = function(nest)
    {        
        if(this.isHungry)
        {
            if(nest.foodQuantity>0)
            {
                this.mode = "eating";
            }
        }
        else if(this.hunger<=0 | nest.foodQuantity <=0)
        {
            this.mode = "breeding";
        }
    };
    
    this.eat = function(nest)
    {
        var q = 0.02;
        if(nest.foodQuantity >= q)
        {
            nest.foodQuantity-=q;
            this.hunger-=q*this.hungerThreshold;
        }
        else
        {
            this.hunger-=nest.foodQuantity*this.hungerThreshold;
            nest.foodQuantity = 0;
        }
        
    };
    
    this.checkBirth = function()
    {
        
        if(random(10000)/10000<this.birthRate && !this.isHungry)
        {
            return true;
        }
        
        return false;
    };
    
    this.update = function(world)
    {
        if(!this.dead)
        {
        this.hunger++;
        
        this.checkState();
        this.checkHunger(world.nest);
        this.updateBirthRate();
        }
        
        switch(this.mode)
        {
       
            case "breeding":
                
                if(this.checkBirth()){world.birth();}

            break;
            
            case "eating":
                
                this.eat(world.nest);
                
            break;
            
            case "dead":
                
            break;
       
        }
        
        
        
    };
    
};

var nest = function()
{
    this.size=2;
    this.foodQuantity = InitialFoodNest;
    this.queen = new queen();
    
    //Add the quantity q of food in the nest
    this.addFood = function(q)
    {
        this.foodQuantity+=q;
    };
    
    this.draw = function() 
    {
        processing.noStroke();
        processing.fill(204, 204, 204);
        processing.ellipse(0,0,this.size*20,this.size*20);
         
        processing.fill(189, 189, 189);
        processing.ellipse(0,0,this.size*18,this.size*18);

        processing.fill(105, 105, 105);
        processing.ellipse(0,0,this.size*16,this.size*16);
         
        processing.fill(74, 73, 74);
        processing.ellipse(0,0,this.size*14,this.size*14);

        processing.fill(0, 0, 0);
        processing.ellipse(0,0,this.size*10,this.size*10);

        processing.stroke(0);
    };
    
};

/*/////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
ANT
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
////////////////////////////////////////////// */

var ant = function(x,y,size,angle,speed)
{
    
    this.x = x;
    this.y = y;
    this.size = size;
    this.angle=angle % 360;
    this.speed=speed;
    this.maxSpeed=2;
    this.deltaSpeed=1; //useless at the moment
    this.deltaAngle=0; 
    this.mode = "RW"; // RW = Random Walk
    this.aim = [random(limX)-limX/2,random(limY)-limY/2];
    this.memoryAim = [0,0];
    this.foodQuantity = 0;
    this.foodCapacity = 5;
    this.gatheringRate = 0.25*this.size;
    this.viewRadius = 150; 
    this.viewAngle = 170;
    this.smellRadius = 300;
    this.carryFood = false;
    this.dead = false;
    this.timer = 0;
    this.lifeExpectancy = LifeExpectancy;
    this.decomposition = Decomposition;
    this.decomposed = false;
    this.doomDate = max(0,3/4*LifeExpectancy + snorm(1/4*LifeExpectancy,LifeExpectancy/5));
    this.hunger = 0;
    this.hungerThreshold = snorm(HungerThreshold,HungerThreshold/10);
    this.starveThreshold = 3*this.hungerThreshold;
    this.starveDeathThreshold = 5*this.hungerThreshold;
    this.memoryFoodNest = InitialFoodNest;
    this.isStarving=false;
    this.isHungry=false;
    
    //returns true when the ant is decomposed. The entity will then be deleted
    this.isDecomposed = function()
    {
        return this.decomposed;
    };
    
    //updates the position of the ant when tracking an object at position xt,yt
    this.trackStep = function(xt,yt)
    {
   
   var r, thetaTrack;
   
   //distance between the ant and the aim
   var d = sqrt((this.x-xt)*(this.x-xt)+(this.y-yt)*(this.y-yt)); 
   
   //angle between the direction of the ant and the aim
   thetaTrack = translateAngle(angleFind(xt-this.x,yt-this.y)-this.angle);

//Decrease speed if the ant gets close to its aim
if(d<25 && this.mode !== "RW" && this.mode !== "trackPheromone")
{
    r=d/20*this.speed*this.deltaSpeed;
}
else 
{
    r=abs(snorm(4,1))*this.speed*this.deltaSpeed;
}
   
   //Calculates the angle to add to current ant direction
   this.deltaAngle=min(abs(thetaTrack),10)*sign(thetaTrack);
   
   //Calculate new angle and new position
   this.angle = (this.angle + this.deltaAngle) % 360 ;
   this.x=this.x + r*cos(this.angle);
   this.y=this.y + r*sin(this.angle);
   
   
   
    };

    //Release a pheromone at ant's position
    this.emitPheromone = function(pheromoneMap,d)
    {
        pheromoneMap.push(new pheromone(this.x, this.y,d));
    };

    //Determine if there is food in the ant's view field and if so, returns the id of the closest piece of food. If not, returns -1
    this.checkFood = function(foodmap)
    {
        var eligibleFood = [];
        var noFood = true;
        var thetaTrack = 0, d=0;
        for(var i = 0;i < foodmap.length;i++)
        {
            thetaTrack = translateAngle(angleFind(foodmap[i].x-this.x,foodmap[i].y-this.y)-this.angle) % 360;
            d=distance(foodmap[i].x-this.x,foodmap[i].y-this.y);
           
            if( (d < this.viewRadius && abs(thetaTrack) < this.viewAngle/2))
            {
                noFood = false;
                eligibleFood.push([d,i]);
            }
   
        }
       
        if(noFood)
        {
       return -1;
        }
        else
        {

            var dmin = 100000, imin = 0;
            for(i = 0;i < eligibleFood.length;i++)
            {
                if(eligibleFood[i][1]<dmin)
                {
                    dmin = eligibleFood[i][0];
                    imin = eligibleFood[i][1];
                }
            }
            return imin;
        }
   
   
    };
    
    this.checkPheromone = function(pheromoneMap)
    {
        var eligiblePheromone = [];
        var noPheromone = true;
        var d=0, d1 = 0;
        for(var i = 0;i < pheromoneMap.length;i++)
        {
            d=distance(pheromoneMap[i].x-this.x,pheromoneMap[i].y-this.y);
            d1 = distance(pheromoneMap[i].x,pheromoneMap[i].y);
           
            if(d < this.smellRadius && d1 > distance(this.x,this.y) )
            {
                noPheromone = false;
                eligiblePheromone.push([d1,i]);
            }
   
        }
       
        if(noPheromone)
        {
            return -1;
        }
        else
        {

            var dmax = 0, imax = 0;
            for(i = 0;i < eligiblePheromone.length;i++)
            {
                if(eligiblePheromone[i][1]>dmax)
                {
                    dmax = eligiblePheromone[i][0];
                    imax = eligiblePheromone[i][1];
                }
            }
            return imax;
        }
   
   
    };
    
    this.foodGather = function(food)
    {
        var q = this.gatheringRate;
        q=food.removeQuantity(q);
        this.foodQuantity+=q;
    };
    
    //Check death by ageing
    this.checkDeath = function()
    {
        if(this.timer>=this.doomDate)
        {
            this.dead=true;
            this.mode="dead";
        }
    };
    
    this.kill = function()
    {
        this.dead=true;
        this.mode="dead";
    };
    
    this.checkHunger = function()
    {
        var threshold = 0.999;
        var threshold2 = 1- (1-threshold)*10;
        this.isHungry=false;
        this.iStarving=false;
        
        if(this.hunger>this.hungerThreshold)
        {
            this.isHungry=true;
            if((this.memoryFoodNest > 0 | random(10000)/10000>threshold) && (this.mode==="RW" | this.mode ==="explore" |this.mode === "memoryWalk"))
            {
                this.mode="feeding";
            }
            
        }
        
        if(this.hunger>this.starveThreshold)
        {
            this.isStarving=true;
            if((this.memoryFoodNest > 0 | random(10000)/10000>threshold2))
            {
                this.mode="feeding";
            }
            
        }
        
        if(this.hunger>this.starveDeathThreshold)
        {
            this.kill();
        }
    };
    
    this.eat = function(nest)
    {
        var q = 0.02*this.size;
        if(nest.foodQuantity >= q)
        {
            nest.foodQuantity-=q;
            this.hunger-=q*this.hungerThreshold;
        }
        else
        {
            this.hunger-=nest.foodQuantity*this.hungerThreshold;
            nest.foodQuantity = 0;
        }
        
    };

/*////////////////////////////////////////////////////
///////////////////////////////////////////////////// 
/////////////////////////////////////////////////////  
/////////////////////////////////////////////////////  
    ANTS UPDATE
/////////////////////////////////////////////////////  
/////////////////////////////////////////////////////  
/////////////////////////////////////////////////////    
//////////////////////////////////////////////////////    */
    
    
    this.update = function(foodmap,pheromoneMap,nest,world)
    {
        //println(this.mode);
        this.timer++;
        this.hunger++;
        if(ageing){this.checkDeath();}
        if(!this.dead){this.checkHunger();}
        
        var threshold = 0.9;
        var cf = this.checkFood(foodmap);
        var cp = this.checkPheromone(pheromoneMap);

        if(cf > -1 && (this.mode === "RW" | this.mode === "trackPheromone" | this.mode === "explore" | this.mode === "memoryWalk" | this.mode==="feeding"))
        {
            this.mode = "trackFood";
            this.aim = [foodmap[cf].x,foodmap[cf].y];
        }
        else if(cp > -1 && (this.mode === "RW" | this.mode === "trackPheromone" | this.mode === "explore"))
        {
            this.mode = "trackPheromone";
            this.aim = [pheromoneMap[cp].x,pheromoneMap[cp].y];
        }

   
        var d=distance(this.x-this.aim[0],this.y-this.aim[1]);
   
        switch (this.mode)
        {     
            case "RW":
            if(random(1000)/1000>threshold | d < 5)
            {
                this.aim = [random(limX)-limX/2,random(limY)-limY/2];
            }
            this.trackStep(this.aim[0],this.aim[1]);
            
            if(random(1000)/1000>0.999)
            {
                this.mode = "explore";
            }
            
            break;
                   
        
            case "explore":
            if(random(1000)/1000>threshold | d < 5)
            {
                this.aim = [this.aim[0]+random(limX)-limX/2,this.aim[1]+random(limY)-limY/2];
            }
            this.trackStep(this.aim[0],this.aim[1]);
            if(random(1000)/1000>0.998)
            {
                this.mode = "RW";
            }
            break;
           
           
            case "trackFood":
            this.trackStep(this.aim[0],this.aim[1]);
            if(cf>-1 && d<20)
            {
                this.foodGather(foodmap[cf]);
            }    
            if(this.foodQuantity>this.foodCapacity*this.size | cf === -1)
            {
                if(cf>-1)
                {
                    this.memoryAim = [this.aim[0],this.aim[1]];
                }
                else
                {
                    this.memoryAim = [0,0];
                }
                this.mode = "BN";
            }
            break;
        
        
            case "trackPheromone":
            this.trackStep(this.aim[0],this.aim[1]);
            if(cp===-1)
            {
                this.mode = "explore";
            }
            break;
            
            
            case "BN": //Back to Nest
            this.aim = [0,0];
            this.trackStep(this.aim[0],this.aim[1]);
            if(random(10000)>max(10000-(distance(this.x,this.y)),9875))
            {
                this.emitPheromone(pheromoneMap,distance(this.x,this.y));
            }
            if(this.foodQuantity>0)
            {
                this.carryFood=true;
            }
            else
            {
                this.carryFood=false;
                this.mode="RW";
            }
            if(distance(this.x-this.aim[0],this.y - this.aim[1])<10 && this.foodQuantity>0)
            {
                nest.addFood(this.foodQuantity);
                this.foodQuantity = 0;
                this.carryFood = false;
                this.memoryFoodNest = nest.foodQuantity;
                if(this.memoryAim === [0,0])
                {
                    this.mode = "RW";
                }
                else
                {
                    this.mode="memoryWalk";
                }
                
            }
            break;
            
            case "feeding":
                //println(this.memoryAim);
                this.aim = [0,0];
                this.trackStep(this.aim[0],this.aim[1]);
                
                if(distance(this.x-this.aim[0],this.y - this.aim[1])<10)
                {      
                    if(this.hunger >0)
                    {
                        this.eat(nest);
                        
                    }
                    if(this.memoryAim === [0,0])
                    {
                        if(this.hunger <= 0)
                        {
                            this.mode="RW";
                        }
                        if(nest.foodQuantity === 0 )
                        {
                            this.mode="explore";
                        }
                    }
                    else if (this.hunger <= 0 | nest.foodQuantity === 0)
                    {
                        this.mode="memoryWalk";
                    }
                    this.memoryFoodNest = nest.foodQuantity;
                }
            
            
                
            break;
            
            case "memoryWalk":
                
                this.trackStep(this.memoryAim[0],this.memoryAim[1]);
                
                if(distance(this.memoryAim[0]-this.x,this.memoryAim[1]-this.y)<40)
                {
                    this.memoryAim=[0,0];
                    this.mode="explore";
                }
                
                
            break;
            
            case "dead":
                
                this.decomposition--;
                
                if(this.decomposition===0)
                {
                    this.decomposed = true;
                }
                
                break;
            
   }
   

    };
    
    this.draw = function() {
        
        var antSize=min(this.size,0.2+this.timer*this.size/LifeExpectancy*20);
        
        processing.translate(this.x,this.y);
        processing.rotate(this.angle*Math.PI/180);
        if(this.carryFood)
        {
            processing.fill(0, 92, 25);
            processing.ellipse(2*antSize*r1*2,0,2*antSize*r1,2*antSize*r1);
        }
        
        processing.fill(84, 56, 17);
        processing.ellipse(-2*antSize*r1,0,2*antSize*r1*this.decomposition/Decomposition,2*antSize*r2*1.5*this.decomposition/Decomposition);
        processing.ellipse(0, 0,2*antSize*r1*this.decomposition/Decomposition,2*antSize*r2*this.decomposition/Decomposition);
        processing.ellipse(2*antSize*r1,0,2*antSize*r1*this.decomposition/Decomposition,2*antSize*r2*1.2*this.decomposition/Decomposition);
        
        processing.line(2*antSize*r1,0,2*antSize*r1*2,2*antSize);
        processing.line(2*antSize*r1,0,2*antSize*r1*2,-2*antSize);
        
        
        if(debugMode)
        {
            switch(this.mode)
            {
                case "RW":
                    processing.fill(194, 255, 197,100);
                    break;
                case "explore":
                    processing.fill(0, 255, 0,100);
                    break;
                case "trackFood":
                    processing.fill(255, 0, 0,100);
                    break;
                case "trackPheromone":
                    processing.fill(255, 255, 0,100);
                    break;
                case "BN":
                    processing.fill(0, 0, 255,100);
                    break;
                case "feeding":
                    processing.fill(255, 0, 255,100);
                    break;
                case "memoryWalk":
                    processing.fill(0, 255, 255, 100);
                    break;
                case "dead":
                    processing.fill(0, 0, 0,100);
                    break;
                    
            }
            processing.rect(-10,0,20,10);
            if(this.isStarving)
            {
                processing.fill(255, 0, 0,200);
                processing.ellipse(0,-7,5,5);
            }
        }
        
        processing.rotate(-this.angle*Math.PI/180);
        processing.translate(-this.x,-this.y);
        
    };
    
};

var world = function(ants)
{
    this.ants = ants;
    this.nest = new nest();
    this.foodmap = [];
    this.pheromoneMap = [];
    this.nDead=0;
    
    this.birth = function()
    {
        this.ants.push(new ant(0,0,slognorm(1,0.5),random(360),slognorm(1,0.5)));
    };
    
    this.update = function()
    {
        var i;
        this.nDead=0;

        this.nest.queen.update(this);
        
        for(i=0; i<this.ants.length; i++)
        {
            if(this.ants[i].mode==="dead"){this.nDead++;}
            this.ants[i].update(this.foodmap, this.pheromoneMap, this.nest,this);

            if(this.ants[i].isDecomposed())
            {
                delete this.ants[i];
                this.ants.splice(i,1);
            }
        }
        for(i=this.foodmap.length-1; i>-1; i--)
        {
            if(this.foodmap[i].isEmpty())
            {
                delete this.foodmap[i];
                this.foodmap.splice(i,1);
            }
        }
        for(i=this.pheromoneMap.length-1; i>-1; i--)
        {
            this.pheromoneMap[i].update();
            if(this.pheromoneMap[i].isOut())
            {
                delete this.pheromoneMap[i];
                this.pheromoneMap.splice(i,1);
            }
        }
    
    };
    
    this.draw = function() 
    {
        this.nest.draw();
        var i =0;
        
        for(i = 0; i<this.pheromoneMap.length; i++)
        {
            this.pheromoneMap[i].draw();
        }
        for(i = 0; i<this.foodmap.length; i++)
        {
            this.foodmap[i].draw();
        }
        for(i=0; i<this.ants.length; i++)
        {
            this.ants[i].draw();
        } 
   
         
         
    };
    
};

var ants =[];

for(var i=0; i<nAnts; i++)
{
    ants[ants.length] = new ant(0,0,0.5+slognorm(1,0.5),random(360),slognorm(1,0.5));
}

var world = new world(ants);

var timer=0;

var draw = function() {

     /*if(keyPressed)
     {
        println(processing.keyCode);
     }*/
     processing.background(255, 255, 255);
     processing.translate(translateX,translateY);
     processing.scale(1/currentScale,1/currentScale);
     
     
     if(!pause){world.update();timer++;}
     world.draw();
     
     processing.fill(255, 0, 0);

     
     
     
     processing.resetMatrix();
     
     drawSlider(280,380);
     processing.fill(0, 0, 0);
     processing.text("Food in Nest : "+floor(world.nest.foodQuantity),20,385);
     processing.text("Number of Ants : "+(world.ants.length-world.nDead),20,20);
     processing.text("Queen Status : "+world.nest.queen.getState(),240,20);
     if(debugMode)
     {
        processing.fill(51, 0, 255);
      processing.text("Queen Hunger : "+world.nest.queen.hunger,240,40);   
      processing.text("Queen BRate : "+world.nest.queen.birthRate,240,60);   
     }
     processing.fill(255, 0, 0);
     if(debugMode){processing.text(timer,180,385);}
     if(pause){processing.textSize(20); processing.fill(255,0,0);processing.text("Simulation Paused",120,100);processing.textSize(12);}
     
};

var keyReleased = function() {

    
    if (processing.keyCode === processing.UP) 
    {
        translateY += 50;
    } 
    else if (processing.keyCode === processing.DOWN) 
    {
        translateY -= 50;
    } 
    else if (processing.keyCode === processing.LEFT) 
    {
        translateX += 50;
    } 
    else if (processing.keyCode === processing.RIGHT) 
    {
        translateX -= 50;
    }
    else if (processing.keyCode === 68)
    {
        if(debugMode){debugMode=false;}
        else{debugMode=true;}
    }
    else if (processing.keyCode === 80)
    {
        if(pause){pause=false;}
        else{pause=true;}
    }
    
};

var mousePressed = function()
{
  mouseIsPressed = true;
};

var mouseReleased = function() {
    mouseIsPressed = false;
    if(sliderPress)
    {
        sliderPress=false;
    }
    else
    {
        world.foodmap.push(new food((processing.mouseX-translateX)*currentScale,(processing.mouseY-translateY)*currentScale, random(FOODVARIABLE)+FOODMIN));
    }
};

  // Override draw function, by default it will be called 60 times per second
  processing.keyReleased = keyReleased;
  processing.mousePressed = mousePressed;
  processing.mouseReleased = mouseReleased;
  processing.draw = draw;
  
}

var canvas = document.getElementById("canvas1");
// attaching the sketchProc function to the canvas
var p = new Processing(canvas, sketchProc);
// p.exit(); to detach it