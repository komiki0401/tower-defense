import { Battle } from './engine.js';
import { UNITS, STAGE } from './config.js';
import { drawCat, catsReady } from './cats.js';
await catsReady;
const $=id=>document.getElementById(id), b=new Battle(), canvas=$('game'), c=canvas.getContext('2d');
$('money').parentElement.querySelector('small').textContent=` / ${STAGE.maxMoney}`;
document.querySelector('.wallet > span:last-child').textContent=`+${STAGE.income} / 秒`;
for(const side of ['ally','enemy']) $(`${side}-meter`).max=STAGE.castleHP;
let w=1000,h=370,camera=0,paused=false,last=0,drag=null;
const scale=()=>Math.max(w/STAGE.width,.58);
function clamp(){camera=Math.max(0,Math.min(STAGE.width-w/scale(),camera));}
function resize(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;c.setTransform(d,0,0,d,0,0);clamp();}
window.addEventListener('resize',resize);resize();
const buttons=STAGE.unlocks.map((type,i)=>{const u=UNITS[type],el=document.createElement('button');el.className='unit-button';el.style.setProperty('--unit-color',u.color);el.innerHTML=`<span class="shortcut">0${i+1}</span><canvas class="unit-icon" width="100" height="100" aria-hidden="true"></canvas><span><span class="unit-name">${u.name}</span><span class="unit-role">${u.role}</span><span class="unit-cost">◆ ${u.cost}</span><span class="unit-state"></span></span><span class="cooldown"></span>`;drawCat(el.querySelector('.unit-icon').getContext('2d'),type,50,96,96);el.title=`HP ${u.hp} / 攻撃 ${u.attack} / 射程 ${u.range} / 速度 ${u.speed} / 攻撃間隔 ${u.interval}秒`;el.onclick=()=>{if(!paused)b.spawn(type);};$('unit-buttons').append(el);return {el,type};});
const time=t=>`${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`;
function overlay(){const r=b.result;$('overlay').hidden=!paused&&!r;$('result-label').textContent=r?(r==='victory'?'VICTORY / STAGE CLEAR':'DEFEAT / TRY AGAIN'):'BATTLE PAUSED';$('result-title').textContent=r?(r==='victory'?'夜明けは、あなたのもの。':'灯は、まだ消えない。'):'ひと息つこう。';$('result-text').textContent=r?(r==='victory'?`宵影の城を攻略しました。戦闘時間 ${time(b.time)}`:'まんぷく猫と魔法猫を組み合わせて、もう一度。'):'準備ができたら、前線に戻ろう。';$('resume').hidden=!!r;$('pause').disabled=!!r;$('pause').textContent=paused?'再開':'一時停止';}
function toggle(){if(!b.result){paused=!paused;overlay();}}
$('pause').onclick=toggle;$('resume').onclick=toggle;$('restart').onclick=()=>{b.reset();paused=false;camera=0;overlay();};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!b.result){paused=true;overlay();}});
canvas.onpointerdown=e=>{drag={x:e.clientX,camera};canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(drag){camera=drag.camera-(e.clientX-drag.x)/scale();clamp();}};canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
window.onkeydown=e=>{if(e.repeat||/INPUT|TEXTAREA/.test(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();toggle();}if(!paused&&['1','2','3'].includes(e.key))b.spawn(STAGE.unlocks[+e.key-1]);if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();camera+=e.key==='ArrowRight'?100:-100;clamp();}};
function rect(x,y,a,d,color){c.fillStyle=color;c.fillRect(x,y,a,d);}
function circle(x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
function poly(p,color){c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function castle(x,y,enemy){c.save();c.translate(x,y);const stone=enemy?'#63525e':'#70877b',light=enemy?'#f29c86':'#f5d28d';rect(-39,-77,78,77,stone);for(const t of [-52,25]){rect(t,-98,27,98,stone);for(let i=0;i<3;i++)rect(t+i*10,-106,7,12,stone);}poly([[-27,-78],[0,-112],[27,-78]],enemy?'#795969':'#45645e');rect(-2,-142,3,31,'#b4b59c');poly([[0,-142],[31,-135],[0,-125]],light);c.fillStyle='#1b3036';c.beginPath();c.roundRect(-13,-39,26,40,[13,13,0,0]);c.fill();rect(-42,-75,7,14,light);rect(35,-75,7,14,light);circle(0,-68,7,light);rect(-57,0,114,8,stone);c.restore();}
function unit(u,y){
  const dir=u.side==='ally'?1:-1,s=Math.min(1,u.age/.25),step=Math.sin(u.age*10)*1.5;
  c.save();c.translate(u.x,y);c.scale(s*dir,s);
  // Enemy cats face left and carry the warm dusk tint of their castle.
  if(u.side==='enemy')c.filter='sepia(.35) hue-rotate(320deg)';
  if(u.flash)c.globalAlpha=.65;
  drawCat(c,u.type,0,step,96);
  c.restore();
  const barY=y-(u.type==='archer'?99:u.type==='guard'?93:76);
  rect(u.x-15,barY,30,3,'#132b32');
  rect(u.x-15,barY,30*Math.max(0,u.hp/u.maxHP),3,u.side==='ally'?'#a7d8b1':'#e5a092');
}
function draw(){const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#233b48');sky.addColorStop(.65,'#657669');sky.addColorStop(1,'#243e3b');c.fillStyle=sky;c.fillRect(0,0,w,h);circle(w*.64,85,29,'#e6d5a71c');circle(w*.64,85,20,'#e5d9ae60');for(let i=0;i<3;i++){const p=[[0,h]];for(let x=-100;x<=w+100;x+=60)p.push([x,140+i*38+Math.sin(x*.007+i*2+camera*.0005)*28]);p.push([w,h]);poly(p,['#344f51','#3d5951','#49614d'][i]);}const s=scale(),y=h-62;c.save();c.translate(-camera*s,0);c.scale(s,1);rect(0,y,STAGE.width,h-y,'#293f38');rect(0,y,STAGE.width,3,'#8a94704d');for(let i=0;i<80;i++)rect(i*23+7,y+15+(i*17)%38,2+i%3,2,'#72906940');castle(75,y,false);castle(STAGE.width-75,y,true);for(const u of b.units)unit(u,y);for(const e of b.effects){const p=1-e.life/e.maxLife;c.globalAlpha=1-p;if(e.kind==='hit'){c.fillStyle='#fff0c7';c.font='bold 17px system-ui';c.textAlign='center';c.fillText(e.value,e.x,y-83-p*35);circle(e.x,y-32,3+p*9,'#ffe9a9');}if(e.kind==='death')for(let i=0;i<7;i++){const a=i*Math.PI*2/7;rect(e.x+Math.cos(a)*p*35,y-30+Math.sin(a)*p*35,4,4,e.side==='ally'?'#d6dbad':'#e0a093');}if(e.kind==='arrow'){const x=e.x+(e.to-e.x)*p;circle(x,y-37,9,'#b3b0ff44');circle(x,y-37,4,'#eee2ff');poly([[x,y-47],[x+3,y-37],[x,y-27],[x-3,y-37]],'#ffdfa0');}c.globalAlpha=1;}c.restore();if(w/s<STAGE.width){const x=w/2-50;rect(x,h-15,100,3,'#102b32');rect(x+camera/STAGE.width*100,h-16,w/s/STAGE.width*100,5,'#bac7a1');}}
function ui(){$('money').textContent=Math.floor(b.money);$('clock').textContent=time(b.time);for(const side of ['ally','enemy']){$(`${side}-hp`).textContent=`${Math.ceil(b.castles[side])} / ${STAGE.castleHP}`;$(`${side}-meter`).value=b.castles[side];}$('enemy-count').textContent=`敵出撃まで ${Math.ceil(b.spawnTimer)}秒 · 敵 ${b.units.filter(u=>u.side==='enemy').length}体`;for(const {el,type} of buttons){const cd=b.cooldowns[type]||0;el.disabled=paused||!!b.result||b.money<UNITS[type].cost||cd>0;el.querySelector('.cooldown').style.width=`${cd/UNITS[type].cooldown*100}%`;el.querySelector('.unit-state').textContent=cd>0?`${cd.toFixed(1)}秒`:b.money<UNITS[type].cost?'資金待ち':'出撃可能';}}
function frame(now){const dt=last?(now-last)/1000:0;last=now;if(!paused){const previous=b.result;b.update(dt);if(previous!==b.result)overlay();}draw();ui();requestAnimationFrame(frame);}requestAnimationFrame(frame);
