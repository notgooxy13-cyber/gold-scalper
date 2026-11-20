const $=id=>document.getElementById(id);
const state={running:false,tf:"M1",price:2350,base:2350,prices:[],balance:10000,startBalance:10000,history:[],ticks:0,timer:null};
for(let i=0;i<60;i++){state.price+= (Math.random()-.5)*1.3;state.prices.push(state.price)}
state.base=state.price;
function avg(a,n){const s=a.slice(-n);return s.reduce((x,y)=>x+y,0)/Math.max(1,s.length)}
function ema(a,n){if(!a.length)return 0;let k=2/(n+1),v=a[0];for(let x of a.slice(1))v=x*k+v*(1-k);return v}
function rsi(a){if(a.length<15)return 50;let up=0,dn=0;for(let i=a.length-14;i<a.length;i++){let d=a[i]-a[i-1];if(d>0)up+=d;else dn-=d}if(!dn)return 100;return 100-100/(1+up/dn)}
function atr(a){if(a.length<15)return 0;let ranges=[];for(let i=a.length-14;i<a.length;i++)ranges.push(Math.abs(a[i]-a[i-1]));return avg(ranges,14)}
function fmt(v){return v.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
function draw(){const c=$("chart"),ctx=c.getContext("2d"),w=c.clientWidth,h=c.clientHeight,dpr=devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
 for(let j=1;j<4;j++){ctx.strokeStyle="#26364d";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,h*j/4);ctx.lineTo(w,h*j/4);ctx.stroke()}
 let a=state.prices.slice(-48),lo=Math.min(...a)-1.5,hi=Math.max(...a)+1.5,xStep=w/(a.length-1);
 ctx.beginPath();a.forEach((p,i)=>{let x=i*xStep,y=h-(p-lo)/(hi-lo)*h;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle="#f4c45e";ctx.lineWidth=2;ctx.stroke();
 let y=h-(state.price-lo)/(hi-lo)*h;ctx.setLineDash([4,4]);ctx.strokeStyle="#6e819d";ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();ctx.setLineDash([]);
}
function render(){let p=state.price,prev=state.prices.at(-2)||p,delta=p-state.base; $("price").textContent=fmt(p);$("change").textContent=(delta>=0?"+":"")+fmt(delta)+" ("+(delta/state.base*100).toFixed(2)+"%)";$("change").style.color=delta>=0?"#38d39f":"#ff7185";
 let e9=ema(state.prices,9),e21=ema(state.prices,21),rv=rsi(state.prices),av=atr(state.prices);
 $("ema9").textContent=fmt(e9);$("ema21").textContent=fmt(e21);$("rsi").textContent=rv.toFixed(1);$("atr").textContent=av.toFixed(3);
 let sig="WAIT",txt="Belum ada kondisi indikator yang searah",cls="neutral";
 if(e9>e21&&rv>50&&rv<70){sig="BUY";txt="EMA 9 di atas EMA 21; RSI berada di area tengah";cls="buy"}
 else if(e9<e21&&rv<50&&rv>30){sig="SELL";txt="EMA 9 di bawah EMA 21; RSI berada di area tengah";cls="sell"}
 $("signalText").textContent=txt;$("signalBadge").textContent=sig;$("signalBadge").className="signal-badge "+cls;
 $("balance").textContent="$"+fmt(state.balance);$("equity").textContent="$"+fmt(state.balance);let pl=state.balance-state.startBalance;$("pnl").textContent=(pl>=0?"+$":"-$")+fmt(Math.abs(pl));$("pnl").style.color=pl>=0?"#38d39f":"#ff7185";
 $("chartTime").textContent=state.tf;draw();renderHistory();
}
function tick(){let vol=state.tf==="M1"?.75:1.25;state.price=Math.max(100,state.price+(Math.random()-.49)*vol);state.prices.push(state.price);if(state.prices.length>120)state.prices.shift();state.ticks++;
 if(state.ticks%8===0){let e9=ema(state.prices,9),e21=ema(state.prices,21),rv=rsi(state.prices);if((e9>e21&&rv>52)||(e9<e21&&rv<48)){let direction=e9>e21?1:-1;let simulated=direction*(Math.random()*.8-.35);let result=simulated*10;state.balance+=result;state.history.unshift({side:direction>0?"BUY":"SELL",result,price:state.price});state.history=state.history.slice(0,8)}}
 render();
}
function renderHistory(){let el=$("history");if(!state.history.length){el.className="history empty";el.textContent="Belum ada aktivitas simulasi.";return}el.className="history";el.innerHTML=state.history.map(x=>`<div class="history-item"><span>${x.side} • ${fmt(x.price)}</span><strong style="color:${x.result>=0?"#38d39f":"#ff7185"}">${x.result>=0?"+":"-"}$${fmt(Math.abs(x.result))}</strong></div>`).join("")}
$("startBtn").onclick=()=>{if(!state.running){state.running=true;state.timer=setInterval(tick,state.tf==="M1"?1200:1800)}};
$("pauseBtn").onclick=()=>{state.running=false;clearInterval(state.timer)};
$("resetBtn").onclick=()=>{clearInterval(state.timer);state.running=false;state.balance=state.startBalance;state.history=[];state.ticks=0;state.base=state.price;render()};
document.querySelectorAll(".tf").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tf").forEach(x=>x.classList.remove("active"));b.classList.add("active");state.tf=b.dataset.tf;if(state.running){clearInterval(state.timer);state.timer=setInterval(tick,state.tf==="M1"?1200:1800)}render()});
window.addEventListener("resize",draw);render();
if("serviceWorker" in navigator && location.protocol!=="file:"){navigator.serviceWorker.register("./sw.js").catch(()=>{})}
