// Concept UI study from measured Sanabi UI traits. No extracted game pixels are copied.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writePNG, hex } from '../../scripts/lib-png.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'ui-game');
fs.mkdirSync(out, { recursive: true });
const C = {
  void: '#001d23', deep: '#002929', panel: '#004646', rail: '#005b5b',
  muted: '#007575', cyan: '#00f3f2', cyanDim: '#00b2b2',
  amber: '#ffca58', white: '#e7ffff', disabled: '#527b7d',
};
function canvas(w, h) { return { w, h, px: Buffer.alloc(w * h * 4) }; }
function dot(im, x, y, color, alpha = 255) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= im.w || y >= im.h) return;
  const k = (y * im.w + x) * 4, [r,g,b] = hex(color);
  const a = alpha / 255, old = im.px[k+3] / 255, mix = a + old * (1-a);
  if (!mix) return;
  im.px[k] = Math.round((r*a + im.px[k]*old*(1-a))/mix);
  im.px[k+1] = Math.round((g*a + im.px[k+1]*old*(1-a))/mix);
  im.px[k+2] = Math.round((b*a + im.px[k+2]*old*(1-a))/mix);
  im.px[k+3] = Math.round(mix*255);
}
function rect(im, x, y, w, h, color, alpha = 255) {
  for (let j = Math.max(0,y); j < Math.min(im.h,y+h); j++)
    for (let i = Math.max(0,x); i < Math.min(im.w,x+w); i++) dot(im,i,j,color,alpha);
}
function line(im,x0,y0,x1,y1,color,alpha=255) {
  let dx=Math.abs(x1-x0), sx=x0<x1?1:-1, dy=-Math.abs(y1-y0), sy=y0<y1?1:-1, e=dx+dy;
  while(true){dot(im,x0,y0,color,alpha);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}
}
function chamfer(im,x,y,w,h,c,color,alpha=255){
  for(let j=0;j<h;j++){
    const inset=Math.max(0,c-j,j-(h-c-1));
    rect(im,x+inset,y+j,w-2*inset,1,color,alpha);
  }
}
function frame(im,x,y,w,h,c,outer,inner,fill){
  chamfer(im,x,y,w,h,c,outer);
  chamfer(im,x+2,y+2,w-4,h-4,Math.max(0,c-2),fill);
  chamfer(im,x+7,y+7,w-14,h-14,Math.max(0,c-7),inner);
  chamfer(im,x+8,y+8,w-16,h-16,Math.max(0,c-8),fill);
}
function tech(im,x,y,w,h,bright=C.cyan){
  line(im,x+24,y+4,x+w-24,y+4,C.rail);
  line(im,x+4,y+22,x+4,y+h-22,C.rail);
  line(im,x+w-5,y+22,x+w-5,y+h-22,C.rail);
  rect(im,x+25,y+3,30,3,bright);
  rect(im,x+w-58,y+3,23,3,bright);
  rect(im,x+14,y+h-7,34,2,C.cyanDim);
  rect(im,x+w-52,y+h-7,38,2,C.cyanDim);
  for(let i=0;i<5;i++) rect(im,x+68+i*9,y+h-7,4,2,C.muted);
}
function save(id,im){writePNG(path.join(out,id+'.png'),im.w,im.h,im.px);}

function button(id,kind){
  const im=canvas(320,88), selected=kind==='selected', pressed=kind==='pressed', disabled=kind==='disabled', accent=kind==='accent';
  const x=6,y=7,w=308,h=73,c=13;
  const border=disabled?C.disabled:accent?C.amber:C.cyan;
  const fill=selected?'#007c82':pressed?'#00343b':C.deep;
  chamfer(im,x,y,w,h,c,border,disabled?120:255);
  chamfer(im,x+2,y+2,w-4,h-4,c-2,fill,disabled?225:255);
  rect(im,x+28,y+6,disabled?62:96,3,border,disabled?85:210);
  rect(im,x+w-84,y+h-9,58,2,border,disabled?75:185);
  rect(im,x+12,y+25,3,22,border,disabled?70:210);
  rect(im,x+w-15,y+25,3,22,border,disabled?70:210);
  for(let i=0;i<4;i++) rect(im,x+29+i*10,y+h-9,5,2,C.muted);
  if(selected){rect(im,x+w-38,y+13,20,5,C.white);rect(im,x+w-38,y+22,12,2,C.white);}
  if(pressed){rect(im,x+23,y+12,w-46,2,C.void);rect(im,x+23,y+h-14,w-46,2,C.cyanDim);}
  if(accent){rect(im,x+20,y+12,54,3,C.amber);rect(im,x+w-72,y+12,35,3,C.amber);}
  save(id,im);
}
button('btn_primary_normal','normal');
button('btn_primary_selected','selected');
button('btn_primary_pressed','pressed');
button('btn_primary_disabled','disabled');
button('btn_accent_normal','accent');

{
  const im=canvas(384,384);frame(im,6,6,372,372,18,C.cyanDim,C.rail,C.deep);tech(im,6,6,372,372);
  rect(im,26,32,128,3,C.cyanDim);rect(im,26,42,68,2,C.muted);
  rect(im,24,340,336,1,C.rail);for(let i=0;i<8;i++)rect(im,28+i*18,347,9,2,C.muted);
  save('panel_frame',im);
}
{
  const im=canvas(512,640);frame(im,6,6,500,628,22,C.cyanDim,C.rail,C.deep);tech(im,6,6,500,628);
  rect(im,28,72,456,1,C.rail);rect(im,28,526,456,1,C.rail);
  rect(im,28,552,56,4,C.amber);rect(im,92,552,112,2,C.muted);
  for(let i=0;i<6;i++)rect(im,30+i*14,599,7,2,C.muted);
  save('popup_bg',im);
}
{
  const im=canvas(256,320);frame(im,5,5,246,310,16,C.cyanDim,C.rail,C.panel);tech(im,5,5,246,310);
  rect(im,24,34,208,1,C.muted);rect(im,24,55,38,3,C.cyan);
  rect(im,24,252,208,1,C.rail);rect(im,24,265,73,3,C.cyanDim);
  for(let i=0;i<7;i++)rect(im,25+i*29,290,18,2,C.rail);
  save('chapter_card',im);
}
{
  const track=canvas(320,44);chamfer(track,3,5,314,31,7,C.cyan);chamfer(track,5,7,310,27,5,C.deep);
  rect(track,13,13,293,15,C.void);for(let i=0;i<16;i++)rect(track,15+i*18,36,8,2,C.rail);
  save('bar_track',track);
  const fill=canvas(320,44);chamfer(fill,9,11,238,19,3,C.cyan);rect(fill,236,11,11,19,C.amber);
  for(let i=1;i<13;i++)rect(fill,9+i*18,13,2,15,C.deep,190);
  save('bar_fill',fill);
}
{
  const im=canvas(96,96);frame(im,3,3,90,90,11,C.cyanDim,C.rail,C.deep);
  rect(im,13,76,32,3,C.cyan);rect(im,72,13,10,3,C.amber);
  for(let i=0;i<4;i++)rect(im,13+i*8,14,4,2,C.rail);
  save('skill_slot',im);
}

const assets=[
  ['btn_primary_normal',320,88,[28,28,28,28]],['btn_primary_selected',320,88,[28,28,28,28]],
  ['btn_primary_pressed',320,88,[28,28,28,28]],['btn_primary_disabled',320,88,[28,28,28,28]],
  ['btn_accent_normal',320,88,[28,28,28,28]],['panel_frame',384,384,[30,30,30,30]],
  ['popup_bg',512,640,[34,34,34,34]],['chapter_card',256,320,null],
  ['bar_track',320,44,null],['bar_fill',320,44,null],['skill_slot',96,96,null],
].map(([id,width,height,nineSlice])=>({id,file:`${id}.png`,width,height,pivot:[0.5,0.5],nineSlice,status:'concept'}));
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({
  version:1,generatedAt:new Date().toISOString(),status:'concept',generator:'../game-ui-gen.mjs',
  referenceProject:'D:/00.project/GameGogo/out_sanabi_final/sanabi_sprites/UI',
  referenceFiles:['UI_UI_IngameMenu_SelectBox.png','UI_UI_ChapterSelect_Chapter1_Box_Select_1.png','UI_UI_DummyBossHP.png'],
  sourceUsage:'Visual measurement only. No source pixels or game files included.',
  palette:C,assets,
  qa:{visual:'pending human review',smallScreen:'pending',engineIntegration:'not tested',accessibility:'not tested'},
},null,2)+'\n');
console.log(`Generated ${assets.length} concept PNGs in ${out}`);
