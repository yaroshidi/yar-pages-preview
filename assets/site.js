/* yar.website inner pages: shared motion + behaviour. Mirrors the approved home page. */
addEventListener('DOMContentLoaded',()=>{
const root=document.documentElement;
const STATIC=/static/.test(location.search)||matchMedia('(prefers-reduced-motion: reduce)').matches;
if(STATIC)root.classList.add('static');
const mobile=matchMedia('(max-width:900px)').matches;
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];

/* text splitting, screen readers get the plain text */
const splitChars=el=>{const label=el.textContent.replace(/\s+/g,' ').trim();
  const walk=node=>{for(const n of [...node.childNodes]){
    if(n.nodeType===3){const f=document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.appendChild(document.createTextNode(' '));return}
        const sw=document.createElement('span');sw.className='sw';for(const ch of w){const c=document.createElement('span');c.className='sc';c.textContent=ch;sw.appendChild(c)}f.appendChild(sw)});
      n.replaceWith(f)}else if(n.nodeType===1&&n.tagName!=='BR')walk(n)}};
  const vis=document.createElement('span');vis.setAttribute('aria-hidden','true');vis.style.display='contents';
  while(el.firstChild)vis.appendChild(el.firstChild);walk(vis);
  const sr=document.createElement('span');sr.className='sr';sr.textContent=label;el.append(sr,vis);return $$('.sc',vis)};
const rollify=el=>{const tn=[...el.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(!tn)return;
  const txt=tn.textContent.trim(),r=document.createElement('span');r.className='roll';r.setAttribute('aria-hidden','true');
  [...txt].forEach((ch,i)=>{const c=document.createElement('span');c.className='c';c.style.setProperty('--i',i);c.textContent=ch;r.appendChild(c)});
  const sr=document.createElement('span');sr.className='sr';sr.textContent=txt;tn.replaceWith(r,sr)};
$$('.hdr .pill,#menuClose,.mlink .t,.btn .t,.chip2 .t').forEach(rollify);

/* menu */
const menu=$('#menu'),veil=$('#veil'),mb=$('#menuBtn');let lenis;
$$('#menu nav a,#menu .chip,#menu .meta>div').forEach((a,i)=>a.style.setProperty('--i',i));
const here=document.body.dataset.nav;$$('#menu nav a').forEach(a=>{if(a.dataset.k===here)a.setAttribute('aria-current','page')});
const setMenu=o=>{if(menu.classList.contains('open')===o)return;menu.classList.toggle('open',o);veil.classList.toggle('on',o);mb.setAttribute('aria-expanded',o);
  if(lenis)o?lenis.stop():lenis.start();if(o)setTimeout(()=>$('#menuClose').focus({preventScroll:true}),60);else mb.focus({preventScroll:true})};
mb.onclick=()=>setMenu(true);$('#menuClose').onclick=()=>setMenu(false);veil.onclick=()=>setMenu(false);
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);
  if(e.key==='Tab'&&menu.classList.contains('open')){const f=$$('#menu a,#menu button'),a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});

/* Dubai clock(s) */
const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dubai',hour:'2-digit',minute:'2-digit'});
const tick=()=>$$('[data-clock]').forEach(c=>c.textContent=fmt.format(new Date()));tick();setInterval(tick,20000);

/* code copy */
$$('.code button[data-copy]').forEach(b=>b.onclick=()=>{const t=b.closest('.code').querySelector('code').innerText;
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy',1600)}).catch(()=>{})});

/* answers hub filter */
const fb=$$('.filters button');fb.forEach(b=>b.onclick=()=>{fb.forEach(x=>x.setAttribute('aria-pressed',x===b));const g=b.dataset.g;
  $$('.qlist li').forEach(li=>li.hidden=!(g==='all'||li.dataset.g===g));window.ScrollTrigger&&ScrollTrigger.refresh()});

/* project list: floating preview follows the cursor */
const peek=$('#peek');if(peek&&!mobile){const im=$('img',peek);let x=0,y=0,tx=0,ty=0,on=false;
  $$('.plist li[data-img]').forEach(li=>{li.addEventListener('mouseenter',()=>{im.src=li.dataset.img;peek.classList.add('on');on=true});li.addEventListener('mouseleave',()=>{peek.classList.remove('on');on=false})});
  addEventListener('pointermove',e=>{tx=e.clientX+170;ty=e.clientY},{passive:true});
  const loop=()=>{x+=(tx-x)*.14;y+=(ty-y)*.14;peek.style.left=x+'px';peek.style.top=y+'px';requestAnimationFrame(loop)};loop()}

/* statement words */
$$('.statement').forEach(st=>{st.innerHTML=st.textContent.trim().split(/\s+/).map(w=>`<span class="w">${w}</span>`).join(' ')});
if(STATIC){$$('.statement .w').forEach(w=>w.style.opacity=1)}

const cur=$('#cur');
if(STATIC||!window.gsap){root.classList.add('static');$$('.statement .w').forEach(w=>w.style.opacity=1);cur&&cur.remove();return}
gsap.registerPlugin(ScrollTrigger);
lenis=new Lenis({duration:1.15,smoothWheel:true});window.__lenis=lenis;lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);

/* header tucks while reading down, returns on the way up */
const hdr=$('.hdr');let hY=scrollY,hT=false;
const hdrTo=t=>{if(t===hT)return;hT=t;gsap.to(hdr,{yPercent:t?-150:0,duration:t?.55:.8,ease:t?'power3.in':'expo.out',overwrite:'auto'})};
addEventListener('scroll',()=>{const y=scrollY,d=y-hY;if(Math.abs(d)<6&&y>80)return;hY=y;hdrTo(d>0&&y>innerHeight*.8&&!menu.classList.contains('open')&&!hdr.contains(document.activeElement))},{passive:true});
hdr.addEventListener('focusin',()=>hdrTo(false));

/* intro: grey curtain with the Y, lifts in blinds onto the page */
const h1=$('.phero h1,.qa h1,.art-hero h1,.cs-hero h1,.ix h1');
const h1c=h1?splitChars(h1):[];if(h1)h1.classList.remove('split');
gsap.set(h1c,{opacity:0,filter:'blur(14px)',yPercent:28});
const intro=()=>{const tl=gsap.timeline();
  tl.fromTo('.hdr',{opacity:0,y:-18},{opacity:1,y:0,duration:1.1,ease:'expo.out'},.1)
    .to(h1c,{opacity:1,filter:'blur(0px)',yPercent:0,duration:1.05,ease:'expo.out',stagger:{each:.02,from:'random'},clearProps:'filter'},0)
    .fromTo('.intro-rv',{opacity:0,y:24},{opacity:1,y:0,duration:1.2,ease:'expo.out',stagger:.08},.45)};
if(cur){const bars=$$('i',cur);root.classList.add('loading');lenis.stop();
  gsap.timeline({onComplete:()=>{cur.remove();root.classList.remove('loading');lenis.start();ScrollTrigger.refresh()}})
   .fromTo('.cur .cy',{opacity:0,scale:.8},{opacity:1,scale:1,duration:.45,ease:'power2.out'})
   .to('.cur .cy,.cur .cl',{opacity:0,duration:.25},'+=.25')
   .to(bars,{scaleY:0,duration:.6,ease:'power3.inOut',stagger:{each:.035,from:'end'}},'<.05')
   .add(intro,'<.25')}
else intro();

/* display headings: letters arrive blurred, random order */
$$('.split').forEach(h=>{const c=splitChars(h);gsap.set(c,{opacity:0,filter:'blur(10px)',yPercent:24});
  gsap.to(c,{opacity:1,filter:'blur(0px)',yPercent:0,duration:.95,ease:'expo.out',stagger:{each:.018,from:'random'},clearProps:'filter',scrollTrigger:{trigger:h,start:'top 88%',once:true}})});
/* generic reveals */
$$('.rv').forEach(el=>gsap.fromTo(el,{opacity:0,y:28},{opacity:1,y:0,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
/* statement word scrub */
$$('.statement').forEach(st=>gsap.to($$('.w',st),{opacity:1,stagger:.06,ease:'none',scrollTrigger:{trigger:st,start:'top 80%',end:'bottom 45%',scrub:true}}));
/* blinds */
$$('.blinds').forEach(b=>gsap.to(b.children,{scaleY:1,ease:'none',stagger:{each:.07,from:'end'},scrollTrigger:{trigger:b,start:'top 92%',end:'bottom 30%',scrub:.6}}));
/* header flips over light sections */
$$('.light').forEach(s=>ScrollTrigger.create({trigger:s,start:'top 44px',end:'bottom 44px',toggleClass:{targets:'.hdr',className:'lite'}}));
/* image reveal masks */
$$('.mask[data-rv],.browser[data-rv]').forEach(m=>{const img=$('img,video',m);
  gsap.fromTo(m,{clipPath:mobile?'inset(10% 8% 10% 8% round 4px)':'inset(16% 14% 16% 14% round 4px)'},{clipPath:'inset(0% 0% 0% 0% round 4px)',ease:'none',scrollTrigger:{trigger:m,start:'top 96%',end:'top 45%',scrub:true}});
  img&&gsap.fromTo(img,{scale:1.22},{scale:1,ease:'none',scrollTrigger:{trigger:m,start:'top 96%',end:'bottom 30%',scrub:true}})});
/* outline numbers drift */
$$('.part .num,.phero .ghost').forEach(n=>gsap.fromTo(n,{yPercent:18},{yPercent:-12,ease:'none',scrollTrigger:{trigger:n,start:'top bottom',end:'bottom top',scrub:true}}));
/* services index follows the reading position */
const idx=$$('.parts .idx li');if(idx.length)$$('.part').forEach((p,i)=>ScrollTrigger.create({trigger:p,start:'top 55%',end:'bottom 55%',onToggle:s=>{if(s.isActive)idx.forEach((l,k)=>l.classList.toggle('on',k===i))}}));
$$('.parts .idx a').forEach(a=>a.onclick=e=>{e.preventDefault();lenis.scrollTo(a.getAttribute('href'),{offset:-110})});
/* pricing rail draws */
$$('.track>div').forEach(r=>gsap.fromTo(r,{'--p':0},{'--p':1,ease:'none',scrollTrigger:{trigger:r,start:'top 85%',end:'top 45%',scrub:true}}));
/* timeline lines draw */
$$('.tl li').forEach(li=>gsap.fromTo(li,{'--p':0},{'--p':1,ease:'none',scrollTrigger:{trigger:li,start:'top 85%',end:'top 55%',scrub:true}}));
/* article progress + toc */
const art=$('.prose');if(art){const pb=$('.prog');ScrollTrigger.create({trigger:art,start:'top 70%',end:'bottom 60%',onUpdate:s=>pb.style.transform=`scaleX(${s.progress})`});
  const tl=$$('.toc li');$$('.prose h2').forEach((h,i)=>ScrollTrigger.create({trigger:h,start:'top 40%',endTrigger:$$('.prose h2')[i+1]||art,end:'top 40%',onToggle:s=>{if(s.isActive)tl.forEach((l,k)=>l.classList.toggle('on',k===i))}}));
  $$('.toc a').forEach(a=>a.onclick=e=>{e.preventDefault();lenis.scrollTo(a.getAttribute('href'),{offset:-100})})}
/* footer wordmark rises */
gsap.fromTo('#word',{clipPath:'inset(0% 0% 100% 0%)',yPercent:35},{clipPath:'inset(0% 0% 0% 0%)',yPercent:0,ease:'none',scrollTrigger:{trigger:'.foot',start:'top 55%',end:'bottom bottom',scrub:true}});
/* marquee */
const tr=$('#track');if(tr){let mx=0,dir=1;const half=()=>tr.scrollWidth/2;gsap.ticker.add(()=>{const v=lenis.velocity||0;if(Math.abs(v)>.5)dir+=((v>0?1:-1)-dir)*.08;mx-=(0.6+Math.abs(v)*.35)*dir;if(-mx>half())mx+=half();if(mx>0)mx-=half();tr.style.transform=`translate3d(${mx}px,0,0)`})}
$$('a[href^="#"]').forEach(a=>{if(a.closest('.toc,.parts'))return;a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();lenis.scrollTo(t,{offset:-100})}})});
ScrollTrigger.refresh();
});
