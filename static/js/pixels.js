var canvas = document.getElementById('canvas1');
var context = canvas.getContext('2d');

//context.fillStyle="black";
//context.fillRect(0,0,canvas.width,canvas.height);

var imd = context.createImageData(canvas.width, canvas.height);
//var arr = context.getImageData(0, 0, canvas.width, canvas.height);
var p = imd.data;

//var R2 = 800;
//var cx = 100, cy = 100;

//var lx = 100, ly=100, lz=200;

//var ambientLight = 0.1;
//var coeffDist = 0.0000000015;
//var c3 = 0.02;
//var c9 = 0.1;

function intersect(s,r){
    var dist = sub(s[0],r[0]);
    var B = dot(r[1],dist);
    var D = B*B - dot(dist,dist) + s[1]*s[1];
    if (D <0) return false;
    var t0 = B - Math.sqrt(D);
    var t1 = B + Math.sqrt(D);
    var retvalue = false;
    var t = Infinity;
    if ((t0>0.1) && (t0<t)){
	var t = t0;
	retvalue=true;
    }
    if ((t1>0.1) && (t1<t)){
	var t = t1;
	retvalue=true;
    }
    if(retvalue) return add(r[0],scale(r[1],t));
    return false;
}

function intersectSegm(s,segm){
    var AB = sub(segm[1],segm[0]);
    var l = norm(AB);
    var ray = [segm[0],normalise(AB)];
    var inter = intersect(s,ray);
    var l2 = norm(sub(inter,segm[0]));
    return l2<l;
}

function intersects(ss,r){
    var dmin = Infinity, d, smin;
    var inter, mininter;
    for(var i = 0; i<ss.length; ++i){
	var s = ss[i];
	inter = intersect(s,r);
	if(!inter) continue;
	d = norm(sub(r[0],inter));
	if(d<dmin){
	    dmin = d;
	    mininter = inter;
	    smin = s;
	}
    }
    if(dmin == Infinity) return false;
    return [smin,mininter];
}

function intersectsSegm(ss,seg){
    for(var i = 0; i<ss.length; ++i){
	var s = ss[i];
	if(intersectSegm(s,seg)) return true;
    }
    return false;
}

function add(x,y){
    return [x[0]+y[0],x[1]+y[1],x[2]+y[2]];
}

function sub(x,y){
    return [x[0]-y[0],x[1]-y[1],x[2]-y[2]];
}

function dot(x,y){
    return x[0]*y[0]+x[1]*y[1]+x[2]*y[2];
}

function scale(x,a){
    return [x[0]*a,x[1]*a,x[2]*a];
}

function normalise(x){
    n = norm(x);
    return [x[0]/n,x[1]/n,x[2]/n];
}

function norm(x){
    return Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]);
}

w = canvas.width;
h = canvas.height;

d0=Date.now();
//newImage.data=arr.data;
//for(var i=0;i<I*J*4;i+=4){
//    newImage.data[i]=0;
//    newImage.data[i+1]=0;
//    newImage.data[i+2]=0;
//    newImage.data[i+3]=255;
//}
    
    
//beginI = Math.round(cx-Math.sqrt(R2))-1;
//endI = Math.round(cx+Math.sqrt(R2))+1;
//beginJ = Math.round(cy-Math.sqrt(R2))-1;
//endJ = Math.round(cy+Math.sqrt(R2))+1;
//for(var i = 0; i < I; ++i){
//    for(var j = 0; j < J; ++j){
//	for(var c = 0; c<3; ++c){
//	    var idx = (i*J+j)*4+c
//	    if((i-cx)*(i-cx)+(j-cy)*(j-cy)<R2){
//		x=i-cx;
//		y=j-cy;
//		r2=x*x+y*y;
//		z2=R2-r2;
//		svect = [x,y,Math.sqrt(z2)];
//		lvect = sub([lx,ly,lz],svect);
//		d=norm(lvect);
//		light = scalar(normalise(svect),normalise(lvect));
//		li = Math.max(light,0)/(coeffDist*d*d*d+1);
//		light = li + c3*li*li*li + c9*li*li*li*li*li*li*li*li*li;
//		light = (light+ambientLight)/(1+ambientLight);
//		//light = Math.round(R2 - (i-cx)*(i-cx)-(j-cy)*(j-cy))
//		newImage.data[idx] = light*255;
//	    }
//	}
//	newImage.data[idx+1] = 255;
//	
//    }
//}

//spheres = [[[50,50,50],20,[0.5,0.5,0,0.5,0.8,7]],[[200,200,200],100,[0.1,0.2,1,0.4,0.8,7]],[[300,300,50],60,[0.6,0.3,0.3,0.7,0.8,7]]];
//lights = [[[0,0,0],[1,1,1]],[[h,0,100],[1,1,1]],[[0,w,-100],[1,1,1]]];

spheres = [
    [[100,100,100],50,[0,1,0,0.9,0.8,7]],
    [[100,200,100],50,[0,0,1,0.3,0.8,7]],
    [[200,150,100],50,[1,0,0,0.6,0.8,7]]
];
lights = [
    [[2*h/3,0,100],[1,0.5,1]],
    [[150,150,-100],[1,1,1]],
    [[h,2*w,300],[0.5,1,0.5]]
];

dscreen = -1000.;
rmax = 10;
phong = false;

for(var i=0; i<h; ++i){
    for(var j=0; j<w; ++j){
	var ray=[[i,j,dscreen],[0.,0.,1.]];
	var currentRay = ray.slice(0);
	var lr=0, lg=0, lb=0;
	var cr=1;
	for(var rstep = 0; rstep<rmax; ++rstep){
	    var inter = intersects(spheres,currentRay);
	    if(!inter) break;
	    var s = inter[0];
	    var inter = inter[1];
	    var ns = normalise(sub(inter,s[0]));
	    for(var li=0; li<lights.length; ++li){
		var l = lights[li];
		var posl = l[0];
		if(intersectsSegm(spheres,[inter,posl])){
		    continue;
		}
		var ns = normalise(sub(inter,s[0]));
		var ldir = normalise(sub(posl,inter));
		var specTerm = 0;
		if(phong)
		{
		    var reflet = 2*dot(ldir,ns);
		    var phongDir = sub(ldir,scale(ns,reflet));
		    var phongTerm = Math.max(dot(phongDir,currentRay[1]),0);
		    phongTerm = s[2][4]*Math.pow(phongTerm,s[2][5])*cr;
		    specTerm = phongTerm;
		}
		else
		{
		    var blinnDir = sub(ldir,currentRay[1]);
		    var temp = Math.sqrt(dot(blinnDir,blinnDir));
		    if(temp !=0)
		    {
			blinnDir = scale(blinnDir,(1./temp));
			var blinnTerm = Math.max(dot(blinnDir,ns),0.);
			blinnTerm = s[2][4]*Math.pow(blinnTerm,s[2][5]*4)*cr;
			specTerm = blinnTerm;
		    }
		}
		var angl = dot(normalise(sub(posl,inter)),ns);
		if(angl<=0) continue;
		var lambr = s[2][0]*angl;
		var lambg = s[2][1]*angl;
		var lambb = s[2][2]*angl;
		lr += l[1][0]*lambr*cr;
		lg += l[1][1]*lambg*cr;
		lb += l[1][2]*lambb*cr;
		lr += l[1][0]*specTerm;
		lg += l[1][1]*specTerm;
		lb += l[1][2]*specTerm;
	    }
	    if(s[2][3]==0) break;
	    cr*=s[2][3];
	    currentRay[0]=inter.slice(0);
	    currentRay[1]=sub(currentRay[1],scale(ns,2*dot(currentRay[1],ns)));
	}

	p[i*h*4 + j*4] = Math.min(1,lr)*255;
	p[i*h*4 + j*4 + 1] = Math.min(1,lg)*255;
	p[i*h*4 + j*4 + 2] = Math.min(1,lb)*255;
	p[i*h*4 + j*4 + 3] = 255;
    }
}

		

d1 = Date.now();
console.log(d1-d0);


//context.clearRect(0, 0, canvas.width, canvas.height);
context.putImageData(imd, 0, 0);
