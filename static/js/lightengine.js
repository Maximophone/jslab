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

//USE ARROWS TO ZOOM IN/OUT
//Press D to toggle light orbiting
//Press R for Random light colors
//Press W for White lights
//Hover spheres with your mouse to set their color to white



var i,j,k;
var focalLength=1000;
var RNODE = 50;
var mouseControl=false;
var orbit=true;
processing.translate(200,200);

var sort2 = function(values)
{
    //Credit goes to mtrn for this sorting trick
    var v = [], l=values.length;
    for(i=0;i<l;i++)
    {
        v[i]=(floor(values[i]*1e3)<<10)+i;
    }
    v=processing.sort(v,l);
    for(i=0;i<l;i++)
    {
        v[i]=v[i]&0x3ff;
    }
    return v;
};

var mesh = function(name,nodes,rotation)
{
    this.name=name;
    this.nodes = nodes;
    this.originNodes=[];
    this.timer=0;
    this.rotation=rotation;    

    this.initialize = function()
    {
        for(i=0;i<this.nodes.length;i++)
        {
            this.originNodes[i]=[];
            this.originNodes[i][0]=this.nodes[i][0];
            this.originNodes[i][1]=this.nodes[i][1];
            this.originNodes[i][2]=this.nodes[i][2];
        }

    };    

    this.orbit = function()
    {
        for(i=0;i<this.nodes.length;i++)
        {
        this.rotation[0]+=0.1;
        this.rotation[1]+=0.2;
        //this.rotation[2]+=0.2;
        }
    };    

    this.oscillate = function()
    {
        for(i=0;i<this.nodes.length;i++)
        {
            this.nodes[i][0]=this.originNodes[i][0]+abs(this.originNodes[i][0])*this.originNodes[i][0]*cos(3*this.timer)/1500;
            this.nodes[i][1]=this.originNodes[i][1]+abs(this.originNodes[i][1])*this.originNodes[i][1]*cos(3*this.timer)/1500;
            this.nodes[i][2]=this.originNodes[i][2]+abs(this.originNodes[i][2])*this.originNodes[i][2]*cos(3*this.timer)/1500;            
        }
    };

    this.update = function()
    {
        if(this.name==="nodes")
        {
            this.oscillate();
        }
        else if(this.name==="lights" & orbit)
        {
            this.orbit();
        }        
        this.timer++;
    };
};

var lightEngine = function(mesh,light,position,rotation,colors,lightMesh)
{
    this.mesh = mesh;
    this.lightMesh=lightMesh;
    this.colors = colors;
    this.projectedNodes=[];
    this.light = light;
    this.orderNodes=[];    
    this.rotation=rotation;
    this.position=position;
    this.mouseOver = [];   

this.norm2=function(X)
{
    return sqrt(X[0]*X[0]+X[1]*X[1]);
};

this.norm3=function(X)
{
    return sqrt(X[0]*X[0]+X[1]*X[1]+X[2]*X[2]);
};

this.rZ = function(X,angle) //rotate around Z
{
    return [
        X[0]*cos(angle) - X[1]*sin(angle),
        X[1]*cos(angle) + X[0]*sin(angle),
        X[2]
        ];
};

this.rX = function(X,angle) //rotate around X
{
    return [
        X[0],
        X[1]*cos(angle) - X[2]*sin(angle),
        X[2]*cos(angle) + X[1]*sin(angle)
        ];
};

this.rY = function(X,angle) //rotate around Y
{
    return [
        X[2]*cos(angle) - X[0]*sin(angle),
        X[1],
        X[0]*cos(angle) + X[2]*sin(angle)
        ];
};

this.rXYZ = function(vPosition,vAngles)
{
    return this.rY(this.rX(this.rZ(vPosition,vAngles[2]),vAngles[0]),vAngles[1]);
};

this.tXYZ=function(vPosition,vTranslation)
{
    var x = vPosition[0] + vTranslation[0];
    var y = vPosition[1] + vTranslation[1];
    var z = vPosition[2] + vTranslation[2];
    return [x,y,z];
};

this.projectNodes=function()
{
    var l1 = this.mesh.nodes.length,l2 = this.lightMesh.nodes.length;
    for(i=0;i<l1;i++)
    {
this.projectedNodes[i]=this.tXYZ(this.rXYZ(this.mesh.nodes[i],this.mesh.rotation),this.position);
    }
    for(i=l1;i<l1+l2;i++)
    {
        this.projectedNodes[i]=this.tXYZ(this.rXYZ(this.lightMesh.nodes[i-l1],this.lightMesh.rotation),this.position);
    }
};

this.sortNodes=function()
{
    var l1 = this.mesh.nodes.length,l2 = this.lightMesh.nodes.length, v1=[];
    for(i=0;i<l1;i++)
    {
        v1[i]=-this.projectedNodes[i][2];
    }
    for(i=l1;i<l1+l2;i++)
    {
        v1[i]=-this.projectedNodes[i][2];
    }
    this.orderNodes=sort2(v1);    
};

this.calculateLight = function(position,light,node)
{
    var diff = [];
    diff[0]=position[0]-node[0];
    diff[1]=position[1]-node[1];
    diff[2]=position[2]-node[2];   

    var lr = light >>> 16 & 0xff;
    var lg = light >>> 8 & 0xff;
    var lb = light & 0xff;    

    var r = 3000000/(pow( this.norm3(diff),3))*lr/255;
    var g = 3000000/(pow( this.norm3(diff),3))*lg/255;
    var b = 3000000/(pow( this.norm3(diff),3))*lb/255;

    return [r,g,b];
};

this.mouseControls = function()
{
    this.mesh.rotation[1]+=-processing.pmouseX+processing.mouseX;
    this.mesh.rotation[2]+=processing.pmouseY-processing.mouseY;
};

this.checkMouseOver = function()
{
    var r, l1 =this.mesh.nodes.length, l2 =this.lightMesh.nodes.length;
    for(i=0;i<l1+l2;i++)
    {
        var k = l1+l2-this.orderNodes[i]-1;
        var scale = focalLength/(this.projectedNodes[k][2]+focalLength);
        r = sqrt(processing.sq(this.projectedNodes[k][0]*scale-(processing.mouseX-200))+processing.sq(this.projectedNodes[k][1]*scale-(processing.mouseY-200)));   

        this.mouseOver[k]=r<(RNODE/2);
        try{
        if(this.mouseOver[k]){
            //console.log("nodeX: "+this.projectedNodes[k][0]);
            //console.log("mouseX: "+ (mouseX-200));
            //break;            
        }
        }catch(err)
        {
            console.log(err);
        }
    }        

};

this.actionMouseOver = function()
{
    for(i=0;i<this.mesh.nodes.length;i++)
    {
        if(this.mouseOver[i])
        {
            this.colors[i]=0xffffff;
        }
    }
};

this.update=function()
{
    try{
    this.mesh.update();
    this.lightMesh.update();
    this.projectNodes();  
    this.sortNodes();
    this.checkMouseOver();
}catch(err){
    console.log(err);
}    
    if(mouseControl){
        this.mouseControls();
    }
    else
    {
        try{
this.actionMouseOver();
}catch(err){
    console.log(err);
}
    }   

};

this.drawNode=function(currentNode)
{
    var l1=this.mesh.nodes.length;
    var scale=focalLength/(focalLength+this.projectedNodes[currentNode][2]);
    processing.noStroke();
    var r = this.colors[currentNode] >>> 16 & 0xff;
    var g = this.colors[currentNode] >>> 8 & 0xff;
    var b = this.colors[currentNode] & 0xff;
    var intensity=[0,0,0],temp;
    for(j=0;j<this.lightMesh.nodes.length;j++)
    {
        temp=this.calculateLight(this.projectedNodes[currentNode],this.light[j],this.projectedNodes[j+l1]);
        intensity[0]+=temp[0];
        intensity[1]+=temp[1];
        intensity[2]+=temp[2];
    }

    processing.fill(r*min(intensity[0],1),g*min(intensity[1],1),b*min(intensity[2],1));
    
    processing.ellipse(this.projectedNodes[currentNode][0]*scale,this.projectedNodes[currentNode][1]*scale,RNODE*scale,RNODE*scale);
    processing.fill(0, 0, 0);
    //text(currentNode,this.projectedNodes[currentNode][0]*scale,this.projectedNodes[currentNode][1]*scale);

    

};



this.drawLight = function(index)
{
    var l1=this.mesh.nodes.length;
    var scale =focalLength/(focalLength+this.projectedNodes[index+l1][2]);
    var ray =30;
    var r = this.light[index] >>> 16 & 0xff;
    var g = this.light[index] >>> 8 & 0xff;
    var b = this.light[index] & 0xff;
    for(j=0;j<ray;j++)
    {
        var t =0;
        processing.fill(r+t, g+t, b+t,255*pow((j/ray),3));
        processing.ellipse(this.projectedNodes[index+l1][0]*scale,this.projectedNodes[index+l1][1]*scale,(ray-j)*scale,(ray-j)*scale);
    }
};

this.draw= function() {   

    var l1 = this.mesh.nodes.length,l2 = this.lightMesh.nodes.length;
    for(i=0;i<l1+l2;i++)
    {
        var currentNode=this.orderNodes[i];
        if(currentNode<l1){
        this.drawNode(currentNode);     
        }
        else
        {
            this.drawLight(currentNode-l1);   
        }
    }    
};    
};



var current=0, vNodes=[];

var I=4,J=4,K=4;

for(i=0;i<I;i++){for(j=0;j<J;j++){for(k=0;k<K;k++){

var x=i*60-(I-1)*60/2;
var y=j*60-(J-1)*60/2;
var z=k*60-(K-1)*60/2;

var r = sqrt(x*x+y*y+z*z);
    
if(r<300 & r>250 |1)
{    
    vNodes[current]=[x,y,z];
    current++;   
}

}}}   

    var colors = [];

    for(i=0;i<vNodes.length;i++)
    {
        colors[i]=random(0xffffff);
        //colors[i]=0xffffff;
    }

    var li=[[0xff0000],[0x00ff00],[0x0000ff],[0xffffff],[0xffff00],[0xff00ff],[0x00ffff],[0x000000]];

    var vLi=[];
    vLi[0]=[-150,-150,-150];
    vLi[1]=[150,150,-150];
    vLi[2]=[150,-150,-150];
    vLi[3]=[-150,150,-150];
    vLi[4]=[-150,150,150];
    vLi[5]=[-150,-150,150];
    vLi[6]=[150,-150,150];
    vLi[7]=[150,150,150];    

    var m = new mesh("nodes",vNodes,[-20,-40,0]);
    m.initialize();
    var lm = new mesh("lights",vLi,[0,0,0]);
    lm.initialize();
    var e = new lightEngine(m,li,[0,0,300],[0,0,0],colors,lm);
    

var draw= function() {
    processing.background(203, 242, 241);

    e.update();
    e.draw();
};



var keyPressed = function()
{
    //console.log(processing.keyCode);
    if(processing.keyCode===68)
    {
        orbit^=1;
    }
    else if(processing.keyCode===processing.UP)
    {
        e.position[2]-=20;
    }
    else if(processing.keyCode===processing.DOWN)
    {
        e.position[2]+=20;
    }
    else if(processing.keyCode===82)
    {
        /*console.log(0xff);
        console.log((0xff<<8)-0xff);
        console.log(0xff<<16);*/
        e.light[0]=random(0xff)+(random(0xff)<<8)+(random(0xff)<<16);
        e.light[1]=random(0xff)+(random(0xff)<<8)+(random(0xff)<<16);
        e.light[2]=random(0xff)+(random(0xff)<<8)+(random(0xff)<<16);
        e.light[3]=random(0xff)+(random(0xff)<<8)+(random(0xff)<<16);
        e.light[4]=random(0xff)+(random(0xff)<<8)+(random(0xff)<<16);
        e.light[5]=random(0xff)+(random(0xff)<<8)+(random(0xff)<<16);
        e.light[6]=random(0xff)+(random(0xff)<<8)+(random(0xff)<<16);
        e.light[7]=random(0xff)+(random(0xff)<<8)+(random(0xff)<<16);
    }
    else if(processing.keyCode===87)
    {
        e.light[0]=0x000000;
        e.light[1]=0x000000;
        e.light[2]=0xffffff;
        e.light[3]=0xffffff;
        e.light[4]=0x000000;
        e.light[5]=0xffffff;
        e.light[6]=0x000000;
        e.light[7]=0xffffff;
    }
};

var mousePressed=function()
{
    mouseControl^=1;
};

  // Override draw function, by default it will be called 60 times per second
  processing.keyPressed = keyPressed;
  processing.mousePressed = mousePressed;
  processing.draw = draw;
  
}

var canvas = document.getElementById("canvas1");
// attaching the sketchProc function to the canvas
var p = new Processing(canvas, sketchProc);
// p.exit(); to detach it