/*  
 * Image Manager Extended                 2.0.12
 * @package                 JCE
 * @url                     http://www.joomlacontenteditor.net
 * @copyright               Copyright (C) 2006 - 2012 Ryan Demmer. All rights reserved
 * @license                 GNU/GPL Version 2 - http://www.gnu.org/licenses/gpl-2.0.html
 * @date                    03 December 2012
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * NOTE : Javascript files have been compressed for speed and can be uncompressed using http://jsbeautifier.org/
 */
(function($){$.support.canvas=!!document.createElement('canvas').getContext;$.widget("ui.canvas",{stack:[],options:{},_create:function(){this.canvas=document.createElement('canvas');this.context=this.canvas.getContext('2d');this.draw();},getContext:function(){return this.context;},getCanvas:function(){return this.canvas;},setSize:function(w,h){$.extend(this.options,{width:w,height:h});this.draw();},draw:function(el){el=el||$(this.element).get(0);this.save();var w=this.options.width||el.width,h=this.options.height||el.height;$(this.canvas).attr({width:w,height:h});this.context.drawImage(el,0,0,w,h);},copy:function(){return $(this.canvas).clone().get(0);},clone:function(){var copy=this.copy();copy.getContext('2d').drawImage(this.canvas,0,0);return copy;},clear:function(){var ctx=this.context;var w=$(this.element).width(),h=$(this.element).height();if(ctx){ctx.clearRect(0,0,w,h);}},resize:function(w,h,save){var ctx=this.context;w=parseInt(w),h=parseInt(h);var cw=this.canvas.width,ch=this.canvas.height;if(ctx){if(save){this.save();}
var copy=this.copy();$(copy).attr({width:w,height:h});copy.getContext('2d').drawImage(this.canvas,0,0,w,h);$(this.canvas,copy).attr({width:w,height:h});ctx.drawImage(copy,0,0);}},crop:function(w,h,x,y,save){var ctx=this.context;w=parseInt(w),h=parseInt(h),x=parseInt(x),y=parseInt(y);if(ctx){if(save){this.save();}
if(x<0)
x=0;if(x>this.canvas.width-1){x=this.canvas.width-1;}
if(y<0)
y=0;if(y>this.canvas.height-1){y=this.canvas.height-1;}
if(w<1)
w=1;if(x+w>this.canvas.width){w=this.canvas.width-x;}
if(h<1)
h=1;if(y+h>this.canvas.height){h=this.canvas.height-y;}
var copy=this.copy();copy.getContext('2d').drawImage(this.canvas,0,0);$(this.canvas).attr({width:w,height:h});ctx.drawImage(copy,x,y,w,h,0,0,w,h);}},rotate:function(angle,save){var ctx=this.context,w=this.canvas.width,h=this.canvas.height,cw,ch;if(angle<0){angle=angle+360;}
switch(angle){case 90:case 270:cw=h;ch=w;break;case 180:cw=w;ch=h;break;}
if(ctx){if(save){this.save();}
var copy=this.clone();$(this.canvas).attr({width:cw,height:ch});ctx.translate(cw/2,ch/2);ctx.rotate(angle*Math.PI/180);ctx.drawImage(copy,-w/2,-h/2);}},flip:function(axis,save){var ctx=this.context,w=this.canvas.width,h=this.canvas.height;if(ctx){if(save){this.save();}
var copy=this.copy();copy.getContext('2d').drawImage(this.canvas,0,0,w,h,0,0,w,h);ctx.clearRect(0,0,w,h);$(this.canvas).attr({width:w,height:h});if(axis=="horizontal"){ctx.scale(-1,1);ctx.drawImage(copy,-w,0,w,h);}else{ctx.scale(1,-1);ctx.drawImage(copy,0,-h,w,h);}}},greyscale:function(save){var ctx=this.context,w=this.canvas.width,h=this.canvas.height;if(save){this.save();}
var imgData=ctx.getImageData(0,0,w,h);var data=imgData.data;for(var i=0,len=data.length;i<len;i+=4){var v=0.34*data[i]+0.5*data[i+1]+0.16*data[i+2];data[i]=v;data[i+1]=v;data[i+2]=v;}
ctx.putImageData(imgData,0,0);},colorize:function(values,save){var ctx=this.context,w=this.canvas.width,h=this.canvas.height;if(save){this.save();}
var imgData=ctx.getImageData(0,0,w,h);var data=imgData.data;function diff(dif,dest,src){return(dif*dest+(1-dif)*src);}
var amount=values.shift();var color=values.shift();amount=Math.max(0,Math.min(1,amount/100));if(!color){color='#FFFFFF';}
if($.type(color,'string')){color=this.toRGBArray(color);}
for(var i=0,len=data.length;i<len;i+=4){var r=data[i];var g=data[i+1];var b=data[i+2];data[i]=diff(amount,color[0],r);data[i+1]=diff(amount,color[1],g);data[i+2]=diff(amount,color[2],b);}
ctx.putImageData(imgData,0,0);},sepia:function(amount,save){var ctx=this.context,w=this.canvas.width,h=this.canvas.height;if(save){this.save();}
amount=amount||100;var imgData=ctx.getImageData(0,0,w,h);var data=imgData.data;function diff(dif,dest,src){return(dif*dest+(1-dif)*src);}
amount=Math.max(0,Math.min(1,amount/100));for(var i=0,len=data.length;i<len;i+=4){var r=data[i];var g=data[i+1];var b=data[i+2];data[i]=diff(amount,(r*0.393+g*0.769+b*0.189),r);data[i+1]=diff(amount,(r*0.349+g*0.686+b*0.168),g);data[i+2]=diff(amount,(r*0.272+g*0.534+b*0.131),b);}
ctx.putImageData(imgData,0,0);},invert:function(save){var ctx=this.context,w=this.canvas.width,h=this.canvas.height;if(save){this.save();}
var imgData=ctx.getImageData(0,0,w,h);var data=imgData.data;for(var i=0,len=data.length;i<len;i+=4){data[i]=255-data[i];data[i+1]=255-data[i+1];data[i+2]=255-data[i+2];}
ctx.putImageData(imgData,0,0);},threshold:function(threshold,save){var ctx=this.context,w=this.canvas.width,h=this.canvas.height;if(save){this.save();}
var imgData=ctx.getImageData(0,0,w,h);var data=imgData.data;threshold=(parseInt(threshold)||128)*3;for(var i=0,len=data.length;i<len;i+=4){var v=data[i]+data[i+1]+data[i+2]>=threshold?255:0;data[i]=v;data[i+1]=v;data[i+2]=v;}
ctx.putImageData(imgData,0,0);},brightness:function(amount,save){var ctx=this.context,w=this.canvas.width,h=this.canvas.height;amount=1+Math.min(100,Math.max(-100,amount))/100;if(save){this.save();}
var imgData=ctx.getImageData(0,0,w,h);var data=imgData.data;for(var i=0,len=data.length;i<len;i+=4){var r=data[i];var g=data[i+1];var b=data[i+2];data[i]=Math.max(0,Math.min(255,r*amount));data[i+1]=Math.max(0,Math.min(255,g*amount));data[i+2]=Math.max(0,Math.min(255,b*amount));}
ctx.putImageData(imgData,0,0);},contrast:function(amount,save){var ctx=this.context,w=this.canvas.width,h=this.canvas.height;amount=Math.max(-100,Math.min(100,amount));var factor=1;if(amount>0){factor=1+(amount/100);}else{factor=(100-Math.abs(amount))/100;}
if(save){this.save();}
var imgData=ctx.getImageData(0,0,w,h);var data=imgData.data;function n(x){return Math.max(0,Math.min(255,x));}
for(var i=0,len=data.length;i<len;i+=4){var r=data[i];var g=data[i+1];var b=data[i+2];data[i]=n(factor*(r-128)+128);data[i+1]=n(factor*(g-128)+128);data[i+2]=n(factor*(b-128)+128);}
ctx.putImageData(imgData,0,0);},saturate:function(v,save){var ctx=this.context,w=this.canvas.width,h=this.canvas.height;v=parseFloat(v)/100;v=Math.max(-1,Math.min(1,v));if(save){this.save();}
var imgData=ctx.getImageData(0,0,w,h);var data=imgData.data;for(var i=0,len=data.length;i<len;i+=4){var r=data[i];var g=data[i+1];var b=data[i+2];var average=(r+g+b)/3;data[i]+=Math.round((r-average)*v);data[i+1]+=Math.round((g-average)*v);data[i+2]+=Math.round((b-average)*v);}
ctx.putImageData(imgData,0,0);},desaturate:function(v,save){this.saturate(v*-1,save);},save:function(){var ctx=this.context,w=this.canvas.width,h=this.canvas.height;this.stack.push({width:w,height:h,data:ctx.getImageData(0,0,w,h)});},restore:function(){var ctx=this.context,img=$(this.element).get(0);ctx.restore();ctx.drawImage(img,0,0);},undo:function(){var ctx=this.context,img=$(this.element).get(0);var props=this.stack.pop();$(this.canvas).attr({width:props.width,height:props.height});if(props.data){ctx.putImageData(props.data,0,0);}else{this.restore();}},load:function(){var ctx=this.context;var w=this.canvas.width,h=this.canvas.height;var data=ctx.getImageData(0,0,w,h);ctx.clearRect(0,0,w,h);ctx.putImageData(data,0,0);},getMime:function(s){var mime='image/jpeg';var ext=$.String.getExt(s);switch(ext){case'jpg':case'jpeg':mime='image/jpeg';break;case'png':mime='image/png';break;case'bmp':mime='image/bmp';break;}
return mime;},output:function(mime,quality){mime=mime||this.getMime($(this.element).get(0).src);quality=parseInt(quality)||100;quality=Math.max(Math.min(quality,100),10);quality=quality/100;this.load();if(quality<1){try{return this.canvas.toDataURL(mime,quality);}catch(e){return this.canvas.toDataURL(mime);}}else{return this.canvas.toDataURL(mime);}
return null;},remove:function(){$(this.canvas).remove();this.destroy();}});})(jQuery);