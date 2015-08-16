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
  var pow = Math.pow;
  var round = Math.round;

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

//2D Physics Engine v2
// by Maxime Fournes

//PRESS E FOR EDIT MODE
//PRESS DEL TO DELETE A NODE
//PRESS SPACE TO PRINT AND SHARE YOUR CREATION AS A SPIN-OFF!

//PISTONS ADDED : try to build a robot ;)
//GRID ADDED : You can now build more precise contraptions using the grid




/*******************************
 * Insert the printed code here :
 * ******************************/

var vn = [
[50,50,1,true],
[54.93518752860138,195.02447068467305,1,false],
[55.477442666679224,259.0570264677549,1,false],
[74.42196354148707,280.0606483598989,1,false],
[34.47683538492598,278.003648694357,1,false],
[300,20,1,true],
[344.69139283546485,42.434932761888426,1,false],
[277.5789459933855,64.6981370367201,1,false],
[322.2673708683847,87.12456510340483,1,false],
[333.9999999999975,347.00000000000273,1,true],
[383.99999999998045,347.00000000000273,1,true],
[383.996766820893,296.99626639778603,1,false],
[333.9964463652554,297.0353856026075,1,false],
[333.9540393439191,247.0497221751264,1,false],
[383.95435812133553,246.9922148851547,1,false],
[333.8917368942535,197.0619105851507,1,false],
[383.8920569656161,196.98673631507612,1,false],
[333.80371709243826,147.0546705033878,1,false],
[383.8109896395271,146.98680203423288,1,false],
[233.75196629502574,127.27782031736318,1,false],
[149.00493854477585,252.6490342681676,1,false]
];
var vs = [
[true,0,1,true,0.05],
[false,1,2,undefined,undefined],
[false,2,3,undefined,undefined],
[false,3,4,undefined,undefined],
[false,2,4,undefined,undefined],
[false,5,6,undefined,undefined],
[false,5,7,undefined,undefined],
[false,6,7,undefined,undefined],
[false,7,8,undefined,undefined],
[false,8,6,undefined,undefined],
[false,9,11,undefined,undefined],
[false,9,12,undefined,undefined],
[false,10,11,undefined,undefined],
[false,12,11,undefined,undefined],
[false,12,13,undefined,undefined],
[false,12,14,undefined,undefined],
[false,11,14,undefined,undefined],
[false,13,14,undefined,undefined],
[false,13,15,undefined,undefined],
[false,13,16,undefined,undefined],
[false,14,16,undefined,undefined],
[false,15,16,undefined,undefined],
[false,15,19,undefined,undefined],
[false,17,19,undefined,undefined],
[false,17,18,undefined,undefined],
[false,15,17,undefined,undefined],
[false,15,18,undefined,undefined],
[false,16,18,undefined,undefined],
[false,19,20,undefined,undefined]
];

/*********************************
 * 
 * ******************************/

var i,j,k;
var RNODE=6;
var GRAVITY = 9;
var FRICTION = 0;
var PAUSE = false;
var EDIT = false;
var DEBUG = false;
var DELTAT = 0.01;
var ELASTIC=false;
var preMsrl=false;
var msrl=false;
var lastKeyPressed=0;
var keyIsPressed = false;
var GRID = false;
var GRIDSTEP=10;
processing.frameRate(30);

//var createString = false;

var checkMouseReleased = function()
{
    if(preMsrl)
    {
        preMsrl=false;
        msrl=true;
        return;
    }
    msrl=false;
};

var normalize = function(X)
{
    var r = sqrt(X[0]*X[0]+X[1]*X[1]);
    return [X[0]/r,X[1]/r];
};

var dXY = function(n1,n2)
{    
    return sqrt(processing.sq(n1.x-n2.x) + processing.sq(n1.y-n2.y) ) ;
};

var getClosestFromGrid = function(x)
{
    return round(x/GRIDSTEP)*GRIDSTEP;
};

var maxV= function(v)
{
    var M=v[0], index=0;
    for(var p=1;p<v.length;p++)
    {
        if(v[p]>M)
        {
            M=v[p];
            index=p;
        }
    }
    return [M,index];
};

var node = function(x,y,mass,isFixed,name)
{
    this.x=x;
    this.y=y;
    this.lastX=x;
    this.lastY=y;
    this.mass=mass;
    this.speed=[0,0];
    this.stringsIndex=[];
    this.isFixed=isFixed;
    this.name=name;
    this.force=[0,this.mass*GRAVITY];
    this.isSelected=false;
    this.isHovered=false;
    
    this.addString = function(index)
    {
        this.stringsIndex.push(index);
    };
    
    this.checkHover = function()
    {
        if(abs(processing.mouseX-this.x)<RNODE+1 & abs(processing.mouseY-this.y)<RNODE+1)
        {
            this.isHovered=true;
        }
        else
        {
            this.isHovered=false;
        }
        return this.isHovered;
    };
    
    this.selectMove = function()
    {

        if(this.isSelected){
            //console.log(processing.pmouseX-mouseX);
            this.x+=(processing.mouseX-processing.pmouseX)*DELTAT;
            this.y+=(processing.mouseY-processing.pmouseY)*DELTAT;
            this.lastX=this.x;
            this.lastY=this.y;
        }
    };
    
    this.move = function(V)
    {
        if(this.isFixed | this.isSelected){
            return;
        }
        this.x+=V[0];
        this.y+=V[1];
    };
    
    this.box = function()
    {
        if(this.x>400)
        {
       this.x=400;
        }
        if(this.y>400)
        {
       this.y=400;
    this.x -= (this.x - this.lastX + this.force[0]);
        }
        if(this.x<0)
        {
       this.x=0;
        }
        if(this.y<0)
        {
       this.y=0;
        }
    };
    
    this.edit = function()
    {
        
    };
    
    this.update = function(index)
    {
        this.name=index;
        this.box();
        this.checkHover();
        //this.selectMove();
        
        if(this.isFixed | this.isSelected){
            return;
        }
        
        this.force=[0,0];
        
        this.force[1]+=this.mass*GRAVITY;
        this.force[0]-=FRICTION*abs(this.x - this.lastX)*(this.x-this.lastX);
        this.force[1]-=FRICTION*abs(this.y-this.lastY)*(this.y-this.lastY);
        
        var a = [];
        a[0]=this.force[0]/this.mass;
        a[1]=this.force[1]/this.mass;

        var x = this.x;
        var y = this.y;
        
        this.x+=x-this.lastX+a[0]*DELTAT*DELTAT;
        this.y+=y-this.lastY+a[1]*DELTAT*DELTAT;

        this.lastX=x;
        this.lastY=y;
        
        
    };
    
    this.draw= function() {
        processing.strokeWeight(1);
        processing.stroke(84, 84, 84);
        if(this.isFixed){
            processing.fill(255, 252, 252);
        }
        else{
        processing.fill(196, 196, 196);
        }
        processing.ellipse(this.x,this.y,RNODE,RNODE);
        //processing.text(this.name,this.x+5,this.y+5);
        
        if(this.isHovered)
        {
            processing.noFill();
            processing.stroke(252, 252, 252);
            processing.ellipse(this.x,this.y,RNODE+2,RNODE+2);
        }
        
        if(this.isSelected)
        {
            processing.noFill();
            processing.stroke(255, 0, 0);
            processing.ellipse(this.x,this.y,RNODE+2,RNODE+2);
        }

    };
};

var string = function(nodeA,nodeB)
{
    this.nodeA=nodeA;
    this.nodeB=nodeB;
    
    this.getLength =function()
    {
      return dXY(this.nodeA,this.nodeB);
    };
    
    this.originLength=this.getLength();
    
    this.checkHover = function()
    {
   
    };
    
    this.update=function()
    {
        this.currentLength=this.getLength();
        
        var elongation = this.currentLength-this.originLength;

        var direction = [],moveA=[],moveB=[];
        direction[0]=this.nodeB.x-this.nodeA.x;
        direction[1]=this.nodeB.y-this.nodeA.y;
        
        direction=normalize(direction);
        moveA[0]=direction[0]*elongation/2;
        moveA[1]=direction[1]*elongation/2;
        moveB[0]=-direction[0]*elongation/2;
        moveB[1]=-direction[1]*elongation/2;
        
        this.nodeA.move(moveA);
        this.nodeB.move(moveB);
                
    };
    
    this.draw= function() {
        var elongation = this.currentLength-this.originLength;
        processing.stroke(41+8*abs(elongation), 41, 41);
        processing.strokeWeight(2);
        //fill(54, 54, 54);
        processing.line(this.nodeA.x,this.nodeA.y,this.nodeB.x,this.nodeB.y);
    };
};

var piston = function(nodeA,nodeB,isAutomatic,frequency)
{
    this.nodeA=nodeA;
    this.nodeB=nodeB;
    this.isAutomatic = isAutomatic;
    this.frequency = frequency;
    this.timer = 0;
    
    this.getLength =function()
    {
      return dXY(this.nodeA,this.nodeB);
    };
    
    this.originLength=this.getLength();
    this.expansion = 0;
    
    this.checkHover = function()
    {
   
    };
    
    this.getExpansion = function()
    {
        return this.originLength/3*sin(this.timer*this.frequency);
    };
    
    this.update=function()
    {
        this.timer++;
        if(this.isAutomatic)
        {
            this.expansion = this.getExpansion();
        }  
        this.currentLength=this.getLength();
        
        var elongation = this.currentLength-(this.originLength+this.expansion);

        var direction = [],moveA=[],moveB=[];
        direction[0]=this.nodeB.x-this.nodeA.x;
        direction[1]=this.nodeB.y-this.nodeA.y;
        
        direction=normalize(direction);
        moveA[0]=direction[0]*elongation/2;
        moveA[1]=direction[1]*elongation/2;
        moveB[0]=-direction[0]*elongation/2;
        moveB[1]=-direction[1]*elongation/2;
        
        this.nodeA.move(moveA);
        this.nodeB.move(moveB);
                
    };
    
    this.draw= function() {
        var elongation = this.currentLength-(this.originLength+this.expansion);
        processing.stroke(150+8*abs(elongation), 150, 150);
        processing.strokeWeight(2);
        processing.line(this.nodeA.x,this.nodeA.y,this.nodeB.x,this.nodeB.y);
        processing.stroke(41+8*abs(elongation), 41, 41);
        processing.strokeWeight(4);
        processing.line(this.nodeA.x,this.nodeA.y,this.nodeA.x+(this.nodeB.x-this.nodeA.x)/dXY(this.nodeA,this.nodeB)*this.originLength*2/3,this.nodeA.y+(this.nodeB.y-this.nodeA.y)/dXY(this.nodeA,this.nodeB)*this.originLength*2/3);
    };
};

var world = function(nodes,strings)
{
    this.nodes=nodes;
    this.strings=strings;
    this.selectedNode=0;
    this.hoveredNode=0;
    this.hoveredIndex=0;
    this.hoveredString=0;
    this.selectMode=false;
    this.editMode=false;
            
    this.checkKeyPressed = function(key)
    {
       return keyIsPressed & lastKeyPressed === key;
    };
    
    this.print = function()
    {
        console.log("var vn = [");
        var vn=[], vs=[];
        var ln=this.nodes.length;
        var ls=this.strings.length;
        for(k=0;k<ln;k++)
        {
            console.log("["+this.nodes[k].x+","+this.nodes[k].y+","+this.nodes[k].mass+","+this.nodes[k].isFixed+"]"+((k<ln-1)?",":""));
        }
        console.log("];");
        console.log("var vs = [");
        for(k=0;k<ls;k++)
        {
            var string = this.strings[k];
            console.log("["+(typeof string.frequency !== "undefined")+","+string.nodeA.name+","+string.nodeB.name+","+string.isAutomatic+","+string.frequency+"]"+((k<ls-1)?",":""));
        }
        
        console.log("];");
    };
    
    this.load = function(vn,vs)
    {
        for(i=0;i<vn.length;i++)
        {
            this.nodes[i]=new node(vn[i][0],vn[i][1],vn[i][2],vn[i][3],i);
        }
        for(i=0;i<vs.length;i++)
        {
            var nodeA = this.nodes[vs[i][1]];
            var nodeB = this.nodes[vs[i][2]];
            this.strings[i]=vs[i][0]?new piston(nodeA,nodeB,vs[i][3],vs[i][4]):new string(nodeA,nodeB);
        }
        for(i=0;i<vs.length;i++)
    {
        this.strings[i].nodeA.addString(i);
        this.strings[i].nodeB.addString(i);
        
    }
    };
    
    this.edit = function()
    {
        if(msrl)
        {
        var posx=GRID?getClosestFromGrid(processing.mouseX):processing.mouseX;
        var posy=GRID?getClosestFromGrid(processing.mouseY):processing.mouseY;
            if(this.selectedNode!==0 & this.hoveredNode === 0)
            {
                var newNode=new node(posx,posy,20,this.checkKeyPressed(17),this.nodes.length);
                if(this.checkKeyPressed(80))
                {
               var newPiston = new piston(this.selectedNode,newNode,true,0.05);
                this.strings.push(newPiston); 
                }
                else{
                var newString = new string(this.selectedNode,newNode);                 
                this.strings.push(newString);  
                }
                this.nodes.push(newNode);  
                this.selectedNode=newNode;
            }
            else if(this.selectedNode!==0 & this.hoveredNode !== 0)
            {
                if(this.checkKeyPressed(80))
                {
               var newPiston = new piston(this.selectedNode,this.hoveredNode,true,0.05);
                this.strings.push(newPiston); 
                }
                else{
                var newString = new string(this.selectedNode,this.hoveredNode);
                this.strings.push(newString); 
                }
                this.selectedNode=this.hoveredNode;
            }
            else if(this.hoveredNode === 0)
            {

                var newNode=new node(posx,posy,20,this.checkKeyPressed(17),this.nodes.length);
                this.nodes.push(newNode); 
                this.selectedNode=newNode;
            }
        }
    };

    
    this.checkHover = function()
    {
        this.hoveredNode=0; this.hoveredString=0;
        var ln=this.nodes.length, ls = this.strings.length;
        
        for(i=0;i<ls;i++)
        {
            if(this.strings[i].checkHover())
            {
                this.hoveredString=this.strings[i];
            }
        }
        for(i=0;i<ln;i++)
        {
            if(this.nodes[i].checkHover())
            {
                this.hoveredNode=this.nodes[i];
                this.hoveredIndex=i;
            }
        }
    };
    
    this.deleteNode = function(indexNode)
    {
        var name = this.nodes[indexNode].name;
        var ls = this.strings.length;

        for(k=0;k<ls;k++)
        {
            if(this.strings[k].nodeA.name===name | this.strings[k].nodeB.name===name)
            {
                delete this.strings[k];
                this.strings.splice(k,1);
                k--;
                ls--;
            }
        }

        delete this.nodes[indexNode];
        this.nodes.splice(indexNode,1);
    };
    
    this.checkSelect = function()
    {

        var ln=this.nodes.length;
      
        for(i=0;i<ln;i++) //Unselect every node except the selected one
        {
            if(this.selectedNode!==0 & this.nodes[i].name!==this.selectedNode.name)
            {
            this.nodes[i].isSelected=false;
            }
        }
        
        
            if(this.hoveredNode!==0 & this.hoveredNode!==this.selectedNode & msrl)
            {
                if(this.checkKeyPressed(127))
                {
               this.deleteNode(this.hoveredIndex);
                }
                else{
                this.hoveredNode.isSelected=true;
                this.selectedNode=this.hoveredNode;
                }
            }
            else if (msrl)
            {
                this.selectedNode.isSelected=false;
                this.selectedNode=0;
            }

    };
    
    this.update = function()
    {
        
        if(!this.editMode){            
            var ln=this.nodes.length, ls = this.strings.length;
            if(this.selectedNode!==0){
                this.selectedNode.selectMove([processing.mouseX,processing.mouseY]);   
            }
            for(i=0;i<ln;i++)
            {
                this.nodes[i].update(i);
            }
            for(i=0;i<ls;i++)
            {
               this.strings[i].update();
            }
            }
        else
        {
            this.edit();
        }
        this.checkHover();
        this.checkSelect();
        
    };
    
    this.draw= function() {
        if(GRID)
        {
            processing.stroke(158, 158, 158);
            for(i=0;i<400/GRIDSTEP;i++){for(j=0;j<400/GRIDSTEP+1;j++){
                processing.point(i*GRIDSTEP,j*GRIDSTEP);
            }}
        }
        
        var ln=this.nodes.length, ls = this.strings.length;
        
        for(i=0;i<ls;i++)
        {
            this.strings[i].draw();
        }
        
        for(i=0;i<ln;i++)
        {
            this.nodes[i].draw();
        }
        
        if(this.editMode)
        {
            processing.fill(102, 94, 0);
            processing.textAlign(processing.CENTER,processing.CENTER);
            processing.text("EDIT MODE ON",200,20);
            processing.text("CLICK TO ADD NODES",200,35);
            processing.text("PRESS CTRL FOR FIXED NODES",200,50);
            processing.text("PRESS P FOR PISTONS",200,65);
            processing.text("PRESS G TO TOGGLE THE GRID",200,80);
        }
    };
};

var w = new world([],[]);
w.load(vn,vs);

var draw= function() {
    
    if(!PAUSE)
    {
    processing.background(223, 240, 239);
    for(var t=0;t<1/DELTAT;t++)
    {
        checkMouseReleased();
        if(EDIT)
        {
            w.edit();
        }
        else
        {
            w.update();
        }
    }
    

    w.draw();
    
    }
};

var currentNode;

var keyPressed = function()
{
    //console.log(processing.keyCode);
    if(processing.keyCode === 68)
    {
        PAUSE^=1;
    }
    else if(processing.keyCode === 69)
    {
        w.editMode^=1;
        //createString=false;
    }
    else if(processing.keyCode === 32)
    {
        w.print();
        //createString=false;
    }
    else if(processing.keyCode === 71)
    {
        GRID^=1;
        //createString=false;
    }
    keyIsPressed = true;
    lastKeyPressed = processing.keyCode;
};

var keyReleased = function()
{
    keyIsPressed = false;
};

var mouseReleased = function()
{
    preMsrl=true;

};

  // Override draw function, by default it will be called 60 times per second
  processing.keyPressed = keyPressed;
  processing.keyReleased = keyReleased;
  processing.mouseReleased = mouseReleased;
  processing.draw = draw;
  
}

var canvas = document.getElementById("canvas1");
// attaching the sketchProc function to the canvas
var p = new Processing(canvas, sketchProc);
// p.exit(); to detach it