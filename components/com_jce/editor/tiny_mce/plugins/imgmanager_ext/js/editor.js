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
(function($){function getRatio(o){function gcd(a,b){return(b==0)?a:gcd(b,a%b);}
var r=gcd(o.width,o.height);return(o.width/r)/(o.height/r);};var EditorDialog={stack:[],settings:{resize_quality:80,save:$.noop,canvasResize:false},_setLoader:function(){var $loader=$('<div class="loading" />').appendTo('#editor-image');var $canvas=$('canvas','#editor-image');$('div.slider','#editor_effects').slider('disable');this.working=true;},_removeLoader:function(){$('div.loading','#editor-image').remove();$('div.slider','#editor_effects').slider('enable');this.working=false;},init:function(){var self=this;$.Plugin.init();$('#editor').removeClass('offleft');$(window).bind('resize',function(){self._resizeWin();});this.src=tinyMCEPopup.getWindowArg('src');$.extend(this.settings,{width:tinyMCEPopup.getWindowArg('width'),height:tinyMCEPopup.getWindowArg('height'),save:tinyMCEPopup.getWindowArg('save'),canvasResize:tinyMCEPopup.getWindowArg('canvasResize')});$('#editor-image').css({height:$('body').height()-$('#transform-tools').outerHeight(true)-40,width:Math.min(Math.max(640,Math.min(this.settings.width,1024)),$('body').width()-335)});$('div.ui-tabs-panel','#tabs').height($('#editor-image').outerHeight()-$('ul.ui-tabs-nav','#tabs').outerHeight()-50);this._setLoader();var img=new Image();$(img).attr('src',this._loadImage($.Plugin.getURI()+this.src)).one('load',function(){$(img).data('width',img.width).data('height',img.height).appendTo('#editor-image').hide();$(img).canvas({width:img.width,height:img.height});$($(img).canvas('getCanvas')).insertAfter(img);self.position();self._createToolBox();self._createFX();$('div.loading','#editor-image').remove();});$('#transform_tab').accordion({collapsible:true,active:false,autoHeight:false,changestart:function(e,ui){var action=$(ui.newHeader).data('action');self.reset(true);if(action){self._initTransform(action);}}});$('#tabs').tabs({'select':function(){self.reset(true);$('#transform_tab').accordion('activate',false);self._resetFX();}});$('button.save','#editor').button({disabled:true,icons:{primary:"ui-icon-circle-check"}}).click(function(e){self.save();e.preventDefault();});$('button.revert','#editor').button({disabled:true,icons:{primary:"ui-icon-circle-arrow-w"}}).click(function(e){self.revert(e);e.preventDefault();});$('button.undo','#editor').button({disabled:true,icons:{primary:"ui-icon-arrowreturnthick-1-w"}}).click(function(e){self.undo(e);e.preventDefault();});$('button.apply','#editor').button({icons:{primary:"ui-icon-check"}}).click(function(e){self.apply($(this).data('function'));e.preventDefault();});$('button.reset','#editor').button({disabled:true,icons:{primary:"ui-icon-closethick"}}).click(function(e){self._resetTransform($(this).data('function'));e.preventDefault();});},_createImageSlider:function(){var self=this,$img=$('img','#editor-image'),canvas=$img.canvas('getCanvas');var cw=$(canvas).width();var ch=$(canvas).height();var iw=$img.data('width');var ih=$img.data('height');if(iw==cw&&ih==ch){$('div.ui-tabs-panel','#tabs').height($('div.ui-tabs-panel','#tabs').height()+30);return;}
var wd=(iw-cw)/100;var hd=(ih-ch)/100;var pw=$('#editor-image').width(),ph=$('#editor-image').height();$('#editor_image_slider').show().slider({min:1,max:100,step:1,start:function(){self.reset();$(canvas).css('position','static');},slide:function(event,ui){var nw=cw+ui.value*wd;var nh=ch+ui.value*hd;$(canvas).css({'width':nw,'height':nh,'top':(ph-nh)/2,'left':(pw-nw)/2});if(ui.value===0){$(canvas).css('position','relative');}}});},_createToolBox:function(){var self=this,$img=$('img','#editor-image'),canvas=$img.canvas('getCanvas');var iw=canvas.width;var ih=canvas.height;var sw=$(canvas).width();var sh=$(canvas).height();$('#crop_presets option, #resize_presets option').each(function(){var v=$(this).val();if(v&&/[0-9]+x[0-9]+/.test(v)){v=v.split('x');var w=parseFloat(v[0]),h=parseFloat(v[1]);if(w>=$img.data('width')&&h>=$img.data('height')){$(this).remove();}}});$('#resize_presets').change(function(){var v=$(this).val();if(v){v=v.split('x');var w=parseFloat($.trim(v[0])),h=parseFloat($.trim(v[1]));$('#resize_width').val(w).data('tmp',w);$('#resize_height').val(h).data('tmp',h);var ratio=$('span.checkbox','#resize_constrain').is('.checked')?w/h:false;$(canvas).resize('setRatio',ratio);$(canvas).resize('setSize',w,h);}});$('#resize_presets').prepend('<option value="'+iw+'x'+ih+'" selected="selected">'+iw+' x '+ih+' ('+tinyMCEPopup.getLang('imgmanager_ext_dlg.original','Original')+')</option>');if(iw>sw&&ih>sh){$('#resize_presets').prepend('<option value="'+sw+'x'+sh+'" selected="selected">'+sw+' x '+sh+' ('+tinyMCEPopup.getLang('imgmanager_ext_dlg.display','Display')+')</option>');}
$('#resize_width').val(sw).data('tmp',sw).change(function(){var w=$(this).val(),$height=$('#resize_height');if($('span.checkbox','#resize_constrain').hasClass('checked')){var tw=$(this).data('tmp'),h=$height.val();var temp=((h/tw)*w).toFixed(0);$height.val(temp).data('tmp',temp);}
$(this).data('tmp',w);var ratio=$('span.checkbox','#resize_constrain').is('.checked')?w/$height.val():false;$(canvas).resize('setRatio',ratio);$(canvas).resize('setSize',w,$height.val());});$('#resize_height').val(sh).data('tmp',sh).change(function(){var h=$(this).val(),$width=$('#resize_width');if($('span.checkbox','#resize_constrain').hasClass('checked')){var th=$(this).data('tmp'),w=$width.val();var temp=((w/th)*h).toFixed(0);$width.val(temp).data('tmp',temp);}
$(this).data('tmp',h);var ratio=$('span.checkbox','#resize_constrain').is('.checked')?$width.val()/h:false;$(canvas).resize('setRatio',ratio);$(canvas).resize('setSize',$width.val(),h);});$('span.checkbox','#resize_constrain').click(function(){$(this).toggleClass('checked');var ratio=$(this).hasClass('checked')?({width:$('#resize_width').val(),height:$('#resize_height').val()}):false;$(canvas).resize('setConstrain',ratio);});$('#crop_constrain').click(function(){$(this).toggleClass('checked');if($(this).is(':checked')){$('#crop_presets').change();}else{$(canvas).crop('setConstrain',false);}});$('#crop_presets').change(function(){var img=$img.get(0);var v=$(this).val();var s={width:img.width,height:img.height};$.extend(s,$(canvas).crop('getArea'));if(v.indexOf(':')!=-1){var r=v.split(':'),r1=parseInt($.trim(r[0])),r2=parseInt($.trim(r[1]));var ratio=r1/r2;if(r2>r1){ratio=r2/r1;}
if(s.width>s.height){if(r2>r1){ratio=r2/r1;}
s.height=Math.round(s.width/ratio);}else{s.width=Math.round(s.height/ratio);}}else{v=v.split('x');s.width=parseInt($.trim(v[0])),s.height=parseInt($.trim(v[1]));var ratio=s.width/s.height;}
if($('#crop_constrain').is(':checked')){$(canvas).crop('setRatio',ratio);}
$(canvas).crop('setArea',s);});if(iw>sw&&ih>sh){$('#crop_presets').prepend('<option value="'+sw+'x'+sh+'" selected="selected">'+sw+' x '+sh+' ('+tinyMCEPopup.getLang('imgmanager_ext_dlg.display','Display')+')</option>');}
$('#crop_presets').prepend('<option value="'+iw+'x'+ih+'" selected="selected">'+iw+' x '+ih+' ('+tinyMCEPopup.getLang('imgmanager_ext_dlg.original','Original')+')</option>');$('#transform-crop-cancel').click(function(){self.reset();});var dim=$.Plugin.sizeToFit($img.get(0),{width:85,height:85});$.each([90,-90],function(i,v){var rotate=$img.clone().attr(dim).appendTo('#rotate_flip').hide().wrap('<div/>').after('<span class="label">'+tinyMCEPopup.getLang('imgmanager_ext_dlg.'+v,v)+'</span>');$(rotate).canvas(dim).canvas('rotate',v);var canvas=$(rotate).canvas('getCanvas');$(canvas).insertAfter(rotate).click(function(){self.apply('rotate',v);$(rotate).canvas('rotate',v);});});$.each(['vertical','horizontal'],function(i,v){var flip=$img.clone().attr(dim).appendTo('#rotate_flip').hide().wrap('<div/>').after('<span class="label">'+tinyMCEPopup.getLang('imgmanager_ext_dlg.'+v,v)+'</span>');$(flip).canvas(dim).canvas('flip',v);var canvas=$(flip).canvas('getCanvas');$(canvas).insertAfter(flip).click(function(){self.apply('flip',v);$(flip).canvas('flip',v);});});},_createFX:function(){var self=this,$img=$('img','#editor-image');$('#editor_effects').empty();if($.support.canvas){var dim=$.Plugin.sizeToFit($img.get(0),{width:70,height:70});$.each({'lighten':{amount:10,preview:50,fn:'brightness'},'darken':{amount:-10,preview:-50,fn:'brightness'},'desaturate':{amount:-10,preview:-50,fn:'saturate'},'saturate':{amount:10,preview:50,fn:'saturate'}},function(k,v){var fx=$img.clone().attr(dim).appendTo('#editor_effects').wrap('<div class="editor_effect"/>').after('<span class="label">'+tinyMCEPopup.getLang('imgmanager_ext_dlg.'+k,k)+'</span>');$(fx).canvas(dim).canvas(v.fn,v.preview);var canvas=$(fx).canvas('getCanvas');var controls=$('<div class="editor_effect_unit"><span class="minus">&#45;</span><span class="plus">&#43;</span><span class="unit"/></div>').hide().insertAfter(fx);var dragging=false,startPos=0;$(canvas).insertAfter(fx).click(function(){self.apply(v.fn,v.amount);$('div.editor_effect_unit','#editor_effects').not(controls).data('unit',0).hide();$('div.editor_effect','#editor_effects').data('state',0);var x=$(controls).data('unit')+1;$(controls).data('unit',x).show().children('span.unit').html(x);});$(fx).next('canvas').add(controls).hover(function(){$('span.minus, span.plus',$(controls)).show();},function(){$('span.minus, span.plus',$(controls)).hide();});$(controls).data('unit',0).children('span.minus').click(function(e){var x=$(controls).data('unit');if(x>0){if(e.pageX&&e.pageY){self.undo();}
x=x-1;$(this).siblings('span.unit').html(x);}
if(x==0){$(controls).hide();}
$(controls).data('unit',x);});$(controls).children('span.plus').click(function(){self.apply(v.fn,v.amount);var x=$(controls).data('unit')+1;$(this).siblings('span.unit').html(x);$(controls).data('unit',x);});});$('<hr/>').appendTo('#editor_effects');$.each(['greyscale','sepia','invert','threshold'],function(i,v){var fx=$img.clone().attr(dim).appendTo('#editor_effects').wrap('<div class="editor_effect"/>').after('<span class="label">'+tinyMCEPopup.getLang('imgmanager_ext_dlg.'+v,v)+'</span>');$(fx).canvas(dim).canvas(v);var canvas=$(fx).canvas('getCanvas');var $p=$(fx).parent('div.editor_effect');$p.data('state',0);$(canvas).insertAfter(fx).click(function(){$('div.editor_effect_unit','#editor_effects').data('unit',0).hide();$('div.editor_effect','#editor_effects').not($p).data('state',0);var s=$p.data('state');if(s==0){self.apply(v);s=1;}else{self.undo();s=0;}
$p.data('state',s);});});}},_resetFX:function(){$('div.editor_effect_unit','#editor_effects').data('unit',0).hide();$('div.editor_effect','#editor_effects').data('state',0);},_resizeWin:function(){},_initTransform:function(fn){var self=this;var img=$('img','#editor-image').get(0);var canvas=$(img).canvas('getCanvas');this.position();switch(fn){case'resize':$(canvas).resize({width:canvas.width,height:canvas.height,ratio:$('span.checkbox','#resize_constrain').is('.checked')?getRatio(canvas):false,resize:function(e,size){$('#resize_width').val(size.width);$('#resize_height').val(size.height);},stop:function(){$('#resize_reset').button('enable');}});break;case'crop':$(canvas).crop({width:canvas.width,height:canvas.height,ratio:$('#crop_constrain').is(':checked')?getRatio(canvas):false,clone:$(img).canvas('clone'),stop:function(){$('#crop_reset').button('enable');}});break;case'rotate':break;}},_resetTransform:function(fn){var img=$('img','#editor-image').get(0),canvas=$(img).canvas('getCanvas');switch(fn){case'resize':this.position();if($.data(canvas,'resize')){$(canvas).resize("reset");}
$('#resize_reset').button('disable');var w=$(canvas).width()||canvas.width;var h=$(canvas).height()||canvas.height;$('#resize_width').val(w).data('tmp',w);$('#resize_height').val(h).data('tmp',h);$('#resize_presets').val($('#resize_presets option:first').val());break;case'crop':if($.data(canvas,'crop')){$(canvas).crop("reset");}
$('#crop_reset').button('disable');$('#crop_presets').val($('#crop_presets option:first').val());break;case'rotate':break;}},undo:function(e){this.stack.pop();$('img','#editor-image').canvas('undo');if(!this.stack.length){$('button.undo').button('disable');$('button.revert').button('disable');$('button.save').button('disable');}
this.position();if(e){$('div.editor_effect_unit:visible span.minus','#editor_effects').click();}},revert:function(e){var $img=$('img','#editor-image');$img.canvas('clear').canvas('draw',$img.get(0)).canvas('setSize',$img.width(),$img.height());this.stack=[];$('button.undo').button('disable');$('button.revert').button('disable');$('button.save').button('disable');this.position();if(e){this._resetFX();}},reset:function(rw){var self=this,$img=$('img','#editor-image'),canvas=$img.canvas('getCanvas');$.each(['resize','crop','rotate'],function(i,fn){self._resetTransform(fn);});if(rw){if($.data(canvas,'resize')){$(canvas).resize("remove");}
if($.data(canvas,'crop')){$(canvas).crop("remove");}
if($.data(canvas,'rotate')){$(canvas).rotate("remove");}}
this.position();},position:function(){var self=this,$img=$('img','#editor-image'),canvas=$img.canvas('getCanvas');var pw=$('#editor-image').width(),ph=$('#editor-image').height();var pct=10;$(canvas).css({width:'',height:''});if(canvas.width>canvas.height){while($(canvas).width()>pw){$(canvas).width(pw-(pw/100*pct));pct+=10;}
$(canvas).height('');}else{while($(canvas).height()>ph){$(canvas).height(ph-(ph/100*pct));pct+=10;}
$(canvas).width('');}
var ch=$(canvas).height()||canvas.height;$(canvas).css({'top':(ph-ch)/2});},_apply:function(k,v){var self=this,$img=$('img','#editor-image'),canvas=$img.canvas('getCanvas');this._setLoader();var name=$.String.basename(self.src);var data=$img.canvas('output',self.getMime(name));$.JSON.request('applyEdit',{'json':[k,v],'data':data},function(o){if(o&&o.data){var img=new Image();img.onload=function(){$img.canvas('option',{width:this.width,height:this.height}).canvas('draw',this);self._removeLoader();self.position();self.reset(true);};img.src=o.data;}else{self._removeLoader();}});},apply:function(){var self=this,$img=$('img','#editor-image'),canvas=$img.canvas('getCanvas'),reset=true;var args=$.makeArray(arguments);var fn=args.shift();var args=args;switch(fn){case'resize':var w=$('#resize_width').val();var h=$('#resize_height').val();if(this.settings.canvasResize){$img.canvas('resize',w,h,true);self.position();}else{this._apply('resize',{width:w,height:h});reset=false;}
args=[w,h];break;case'crop':var s=$(canvas).crop('getArea');if(this.settings.canvasResize){$img.canvas('crop',s.width,s.height,s.x,s.y,true);$img.canvas('resize',s.cw,s.ch);}else{this._apply('crop',s);}
args=[s.width,s.height,s.x,s.y];$('#transform_tab').accordion('activate',false);self.position();break;case'rotate':$img.canvas('rotate',args[0],true);self.position();break;case'flip':$img.canvas('flip',args[0],true);self.position();break;case'desaturate':case'saturate':case'blur':case'brightness':$img.canvas(fn,args[0],true);break;case'threshold':$img.canvas(fn,128,true);break;case'sepia':$img.canvas(fn,100,true);break;case'greyscale':case'invert':case'halftone':$img.canvas(fn,true);break;}
this.stack.push({task:fn,args:args});$('button.undo').button('enable');$('button.revert').button('enable');$('button.save').button('enable');if(reset){this.reset(true);}},getMime:function(s){var mime='image/jpeg';var ext=$.String.getExt(s);switch(ext){case'jpg':case'jpeg':mime='image/jpeg';break;case'png':mime='image/png';break;case'bmp':mime='image/bmp';break;}
return mime;},save:function(name){var self=this,$img=$('img','#editor-image'),canvas=$img.canvas('getCanvas');if(!this.stack.length){return;}
var extras='';extras+='<div class="row">'+' <label for="image_quality">'+tinyMCEPopup.getLang('imgmanager_ext_dlg.quality','Quality')+'</label>'+' <div id="image_quality_slider" class="slider"></div>'+' <input type="text" id="image_quality" value="100" class="quality" /> %'+'</div>';var name=$.String.basename(this.src);name=$.String.stripExt(name);var ext=$.String.getExt(this.src);$.Dialog.prompt(tinyMCEPopup.getLang('imgmanager_ext_dlg.save_image','Save Image'),{text:tinyMCEPopup.getLang('dlg.name','Name'),elements:extras,height:180,value:name,onOpen:function(){$('#image_quality_slider').slider({min:10,step:10,slide:function(event,ui){$('#image_quality').val(ui.value);},value:100});},confirm:function(name){var quality=$('#image_quality').val()||100;$('<div/>').appendTo('#editor-image').addClass('loading').css($(canvas).position()).css({width:$(canvas).width(),height:$(canvas).height()});name=(name+'.'+ext)||$.String.basename(self.src);var data=$img.canvas('output',self.getMime(name),quality);$.JSON.request('saveEdit',{'json':[self.src,name,self.stack],'data':data},function(o){$('div.loading','#editor-image').remove();if(o.error&&o.error.length){$.Dialog.alert(o.error);}
if(o.files){self.src=o.files[0];}
$(self.image).attr('src',self._loadImage($.Plugin.getURI()+self.src)).load(function(){self._createFX();$(this).canvas('remove').canvas();});var s=self.settings;s.save.apply(s.scope||self,[self.src]);self.stack=[];$('button.undo').button('disable');$('button.revert').button('disable');$('button.save').button('disable');});$(this).dialog('close');}});},_loadImage:function(src){return src+'?'+new Date().getTime();}};window.EditorDialog=EditorDialog;})(jQuery);