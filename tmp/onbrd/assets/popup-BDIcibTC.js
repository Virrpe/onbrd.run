var bt=Object.defineProperty;var _t=(t,e,n)=>e in t?bt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var G=(t,e,n)=>_t(t,typeof e!="symbol"?e+"":e,n);function T(){}function ft(t){return t()}function it(){return Object.create(null)}function B(t){t.forEach(ft)}function pt(t){return typeof t=="function"}function xt(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}function vt(t){return Object.keys(t).length===0}function c(t,e){t.appendChild(e)}function O(t,e,n){t.insertBefore(e,n||null)}function A(t){t.parentNode&&t.parentNode.removeChild(t)}function ht(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function f(t){return document.createElement(t)}function j(t){return document.createTextNode(t)}function w(){return j(" ")}function X(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function p(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function yt(t){return Array.from(t.childNodes)}function $t(t,e){e=""+e,t.data!==e&&(t.data=e)}let Q;function N(t){Q=t}const L=[],st=[];let P=[];const ct=[],kt=Promise.resolve();let W=!1;function wt(){W||(W=!0,kt.then(mt))}function J(t){P.push(t)}const K=new Set;let D=0;function mt(){if(D!==0)return;const t=Q;do{try{for(;D<L.length;){const e=L[D];D++,N(e),Ct(e.$$)}}catch(e){throw L.length=0,D=0,e}for(N(null),L.length=0,D=0;st.length;)st.pop()();for(let e=0;e<P.length;e+=1){const n=P[e];K.has(n)||(K.add(n),n())}P.length=0}while(L.length);for(;ct.length;)ct.pop()();W=!1,K.clear(),N(t)}function Ct(t){if(t.fragment!==null){t.update(),B(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(J)}}function At(t){const e=[],n=[];P.forEach(o=>t.indexOf(o)===-1?e.push(o):n.push(o)),n.forEach(o=>o()),P=e}const Tt=new Set;function Ot(t,e){t&&t.i&&(Tt.delete(t),t.i(e))}function z(t){return(t==null?void 0:t.length)!==void 0?t:Array.from(t)}function St(t,e,n){const{fragment:o,after_update:r}=t.$$;o&&o.m(e,n),J(()=>{const s=t.$$.on_mount.map(ft).filter(pt);t.$$.on_destroy?t.$$.on_destroy.push(...s):B(s),t.$$.on_mount=[]}),r.forEach(J)}function Rt(t,e){const n=t.$$;n.fragment!==null&&(At(n.after_update),B(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Et(t,e){t.$$.dirty[0]===-1&&(L.push(t),wt(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function It(t,e,n,o,r,s,i=null,u=[-1]){const v=Q;N(t);const l=t.$$={fragment:null,ctx:[],props:s,update:T,not_equal:r,bound:it(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(v?v.$$.context:[])),callbacks:it(),dirty:u,skip_bound:!1,root:e.target||v.$$.root};i&&i(l.root);let x=!1;if(l.ctx=n?n(t,e.props||{},(d,m,...y)=>{const h=y.length?y[0]:m;return l.ctx&&r(l.ctx[d],l.ctx[d]=h)&&(!l.skip_bound&&l.bound[d]&&l.bound[d](h),x&&Et(t,d)),m}):[],l.update(),x=!0,B(l.before_update),l.fragment=o?o(l.ctx):!1,e.target){if(e.hydrate){const d=yt(e.target);l.fragment&&l.fragment.l(d),d.forEach(A)}else l.fragment&&l.fragment.c();e.intro&&Ot(t.$$.fragment),St(t,e.target,e.anchor),mt()}N(v)}class Ut{constructor(){G(this,"$$");G(this,"$$set")}$destroy(){Rt(this,1),this.$destroy=T}$on(e,n){if(!pt(n))return T;const o=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return o.push(n),()=>{const r=o.indexOf(n);r!==-1&&o.splice(r,1)}}$set(e){this.$$set&&!vt(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const Dt="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(Dt);function Lt(t){const{url:e,timestamp:n,scores:o,heuristics:r,recommendations:s,rules:i,benchmark:u,pageHost:v,createdAt:l}=t,x="1.0.1",d=n||l,m=d?new Date(d).toISOString().slice(0,16).replace("T"," "):new Date().toISOString().slice(0,16).replace("T"," "),y=v||(e?new URL(e).hostname:"unknown"),h=(u==null?void 0:u.percentile)!=null?`Top ${u.percentile}% of ${u.count} peers (median ${u.median})`:"Benchmark unavailable (offline or consent off)";return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Audit Report - ${e}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .header {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .score-card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .score {
      font-size: 2em;
      font-weight: bold;
      color: #28a745;
    }
    .score-bad {
      color: #dc3545;
    }
    .score-medium {
      color: #ffc107;
    }
    .recommendation {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .priority-high {
      border-left: 4px solid #dc3545;
    }
    .priority-medium {
      border-left: 4px solid #ffc107;
    }
    .priority-low {
      border-left: 4px solid #28a745;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    .copy-to-ticket {
      background: #e3f2fd;
      border: 1px solid #2196f3;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    .copy-button {
      background: #2196f3;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .copy-button:hover {
      background: #1976d2;
    }
    .ticket-content {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-top: 10px;
      font-family: monospace;
      font-size: 14px;
      white-space: pre-wrap;
    }
    .heuristic-id {
      font-family: monospace;
      font-size: 12px;
      color: #666;
      background: #f8f9fa;
      padding: 2px 6px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Onboarding Audit Report</h1>
    <p><strong>URL:</strong> ${e}</p>
    <p><strong>Audit Date:</strong> ${new Date(n||l||Date.now()).toLocaleString()}</p>
    <p><strong>Overall Score:</strong> <span class="score ${o.overall>=80?"":o.overall>=60?"score-medium":"score-bad"}">${o.overall}/100</span></p>
    <p><strong>Benchmark:</strong> ${h}</p>
  </div>

  <h2>Heuristic Analysis</h2>
  <table>
    <thead>
      <tr>
        <th>Heuristic</th>
        <th>Score</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          CTA Above Fold
          <div class="heuristic-id">H-CTA-ABOVE-FOLD</div>
        </td>
        <td>${o.h_cta_above_fold}/100</td>
        <td>${r.h_cta_above_fold.detected?"Primary CTA detected above fold":"No CTA found above 600px"}</td>
      </tr>
      <tr>
        <td>
          Steps Count
          <div class="heuristic-id">H-STEPS-COUNT</div>
        </td>
        <td>${o.h_steps_count}/100</td>
        <td>${r.h_steps_count.total} total steps (${r.h_steps_count.forms} forms, ${r.h_steps_count.screens} screens)</td>
      </tr>
      <tr>
        <td>
          Copy Clarity
          <div class="heuristic-id">H-COPY-CLARITY</div>
        </td>
        <td>${o.h_copy_clarity}/100</td>
        <td>Avg sentence: ${r.h_copy_clarity.avg_sentence_length} words, ${r.h_copy_clarity.passive_voice_ratio}% passive voice, ${r.h_copy_clarity.jargon_density}% jargon</td>
      </tr>
      <tr>
        <td>
          Trust Markers
          <div class="heuristic-id">H-TRUST-MARKERS</div>
        </td>
        <td>${o.h_trust_markers}/100</td>
        <td>${r.h_trust_markers.total} trust signals (${r.h_trust_markers.testimonials} testimonials, ${r.h_trust_markers.security_badges} security badges, ${r.h_trust_markers.customer_logos} logos)</td>
      </tr>
      <tr>
        <td>
          Signup Speed
          <div class="heuristic-id">H-PERCEIVED-SIGNUP-SPEED</div>
        </td>
        <td>${o.h_perceived_signup_speed}/100</td>
        <td>~${r.h_perceived_signup_speed.estimated_seconds}s completion (${r.h_perceived_signup_speed.form_fields} fields, ${r.h_perceived_signup_speed.required_fields} required)</td>
      </tr>
    </tbody>
  </table>

  <h2>Recommendations</h2>
  ${s.map(b=>{const $=i==null?void 0:i.find(S=>S.id===b.heuristic),H=$!=null&&$.confidence&&$.confidence!=="high"?` <em>(confidence: ${$.confidence})</em>`:"";return`
    <div class="recommendation priority-${b.priority}">
      <h4>${b.heuristic} (${b.priority} priority)${H}</h4>
      <p><strong>Issue:</strong> ${b.description}</p>
      <p><strong>Fix:</strong> ${b.fix}</p>
    </div>
  `}).join("")}

  <div class="copy-to-ticket">
    <h3>Copy to Ticket</h3>
    <p>Click the button below to copy a formatted summary for your project management tool:</p>
    <button class="copy-button" onclick="copyTicketContent()">Copy Ticket Content</button>
    <div class="ticket-content" id="ticketContent">
## Onboarding Audit Results

**URL:** ${e}
**Overall Score:** ${o.overall}/100
**Audit Date:** ${new Date(n).toLocaleString()}

### Issues Found:
${s.map(b=>`- **${b.heuristic}** (${b.priority} priority): ${b.description}`).join(`
`)}

### Recommended Fixes:
${s.map(b=>`- **${b.heuristic}**: ${b.fix}`).join(`
`)}

### Next Steps:
1. Address high priority issues first
2. Test changes with users
3. Re-run audit to verify improvements
    </div>
  </div>

  <footer style="margin-top: 24px; padding-top: 8px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: small;">
    Generated by Onbrd — v${x} — ${m} — ${y} — onbrd.run
  </footer>

  <script>
    function copyTicketContent() {
      const content = document.getElementById('ticketContent').textContent;
      navigator.clipboard.writeText(content).then(() => {
        const button = document.querySelector('.copy-button');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard. Please copy manually.');
      });
    }
  <\/script>
</body>
</html>`}function lt(t,e,n){const o=t.slice();return o[7]=e[n],o}function dt(t,e,n){const o=t.slice();return o[10]=e[n],o}function Pt(t){let e;return{c(){e=j("benchmark offline")},m(n,o){O(n,e,o)},p:T,d(n){n&&A(e)}}}function jt(t){let e,n;return{c(){e=j("vs. benchmark "),n=j(t[1])},m(o,r){O(o,e,r),O(o,n,r)},p(o,r){r&2&&$t(n,o[1])},d(o){o&&(A(e),A(n))}}}function Ft(t){let e,n=z(t[7].tags),o=[];for(let r=0;r<n.length;r+=1)o[r]=at(dt(t,n,r));return{c(){e=f("div");for(let r=0;r<o.length;r+=1)o[r].c();p(e,"class","mt-1 flex flex-wrap gap-1")},m(r,s){O(r,e,s);for(let i=0;i<o.length;i+=1)o[i]&&o[i].m(e,null)},p(r,s){if(s&8){n=z(r[7].tags);let i;for(i=0;i<n.length;i+=1){const u=dt(r,n,i);o[i]?o[i].p(u,s):(o[i]=at(u),o[i].c(),o[i].m(e,null))}for(;i<o.length;i+=1)o[i].d(1);o.length=n.length}},d(r){r&&A(e),ht(o,r)}}}function at(t){let e,n=t[10]+"",o;return{c(){e=f("span"),o=j(n),p(e,"class","tag "+(t[10]==="UX"?"alt":""))},m(r,s){O(r,e,s),c(e,o)},p:T,d(r){r&&A(e)}}}function ut(t){let e,n,o,r,s=t[7].tags&&Ft(t);return{c(){e=f("li"),n=f("div"),n.textContent=`${t[7].fix}`,o=w(),s&&s.c(),r=w(),p(n,"class","font-medium"),p(e,"class","text-sm")},m(i,u){O(i,e,u),c(e,n),c(e,o),s&&s.m(e,null),c(e,r)},p(i,u){i[7].tags&&s.p(i,u)},d(i){i&&A(e),s&&s.d()}}}function Nt(t){let e,n,o,r,s,i,u,v,l,x,d,m,y,h,b,$,H,S,R,E,Z,q,tt,I,M,et,F,Y,nt;function ot(a,C){return a[1]?jt:Pt}let V=ot(t),k=V(t),U=z(t[3]),_=[];for(let a=0;a<U.length;a+=1)_[a]=ut(lt(t,U,a));return{c(){e=f("div"),n=f("div"),o=f("div"),r=f("div"),r.innerHTML='<div class="h1">Onbrd</div> <div class="sub">Onboarding Audit AI</div>',s=w(),i=f("div"),u=f("div"),u.textContent=`${Bt}`,v=w(),l=f("div"),k.c(),x=w(),d=f("div"),m=f("button"),m.textContent="Run Audit",y=w(),h=f("button"),b=j("Export HTML"),H=w(),S=f("div"),R=f("label"),E=f("input"),Z=w(),q=f("span"),q.textContent="Opt-in to telemetry to improve Onbrd",tt=w(),I=f("div"),M=f("div"),M.textContent="Top recommendations:",et=w(),F=f("ul");for(let a=0;a<_.length;a+=1)_[a].c();p(u,"class","text-5xl font-bold text-[color:var(--ink-900)]"),p(l,"class","text-sm text-slate-600"),p(i,"class","text-right"),p(o,"class","flex justify-between items-start"),p(m,"type","button"),p(m,"class","btn flex-1"),p(h,"type","button"),p(h,"class","btn-secondary flex-1"),h.disabled=$=!t[0],p(d,"class","flex gap-2 mb-3"),p(E,"type","checkbox"),p(R,"class","flex items-center gap-2 text-sm"),p(S,"class","mt-4 pt-4 border-t border-slate-200"),p(n,"class","card"),p(M,"class","text-sm font-medium mb-3"),p(F,"class","space-y-3"),p(I,"class","card"),p(e,"class","p-4 space-y-4")},m(a,C){O(a,e,C),c(e,n),c(n,o),c(o,r),c(o,s),c(o,i),c(i,u),c(i,v),c(i,l),k.m(l,null),c(n,x),c(n,d),c(d,m),c(d,y),c(d,h),c(h,b),c(n,H),c(n,S),c(S,R),c(R,E),E.checked=t[2],c(R,Z),c(R,q),c(e,tt),c(e,I),c(I,M),c(I,et),c(I,F);for(let g=0;g<_.length;g+=1)_[g]&&_[g].m(F,null);Y||(nt=[X(m,"click",t[4]),X(h,"click",t[5]),X(E,"change",t[6])],Y=!0)},p(a,[C]){if(V===(V=ot(a))&&k?k.p(a,C):(k.d(1),k=V(a),k&&(k.c(),k.m(l,null))),C&1&&$!==($=!a[0])&&(h.disabled=$),C&4&&(E.checked=a[2]),C&8){U=z(a[3]);let g;for(g=0;g<U.length;g+=1){const rt=lt(a,U,g);_[g]?_[g].p(rt,C):(_[g]=ut(rt),_[g].c(),_[g].m(F,null))}for(;g<_.length;g+=1)_[g].d(1);_.length=U.length}},i:T,o:T,d(a){a&&A(e),k.d(),ht(_,a),Y=!1,B(nt)}}}let Bt=88;function Ht(t=new Date){const e=n=>String(n).padStart(2,"0");return t.getFullYear()+e(t.getMonth()+1)+e(t.getDate())+e(t.getHours())+e(t.getMinutes())}async function Mt(){return new Promise((t,e)=>{chrome.tabs.query({active:!0,currentWindow:!0},n=>{var r;const o=(r=n==null?void 0:n[0])==null?void 0:r.id;if(o!=null)return t(o);e(new Error("No active tab"))})})}async function Vt(t){await chrome.scripting.executeScript({target:{tabId:t},files:["assets/content.js"]})}async function zt(t){return new Promise(e=>{try{chrome.tabs.sendMessage(t,{type:"ONBRD_RUN_AUDIT"},n=>e(n))}catch(n){e({error:n.message})}})}function qt(t,e,n){let o=null,r=null,s=!1;const i=[{id:"A-CTA-ABOVE-FOLD",fix:"Move your main signup CTA above the fold.",tags:["UX","Conversion"]},{id:"T-SOCIAL-PROOF",fix:"Add logos/testimonials near the CTA.",tags:["Trust"]},{id:"AC-SIGNUP-FRICTION",fix:"Ask ≤3 fields in the first step.",tags:["UX","Form"]}];async function u(){try{const x=await Mt(),d=await new Promise(y=>{chrome.runtime.sendMessage({type:"ONBRD_RUN_AUDIT_ACTIVE_TAB"},h=>y(h))});if(d&&d.audit){n(0,o=d.audit),n(1,r=d.benchmark??null);return}await Vt(x);const m=await zt(x);m&&m.audit?(n(0,o=m.audit),n(1,r=m.benchmark??null)):(console.error("Run audit failed",m||chrome.runtime.lastError),alert("Onbrd: failed to run audit on this page."))}catch(x){console.error("runAudit error",x,chrome.runtime.lastError),alert("Onbrd: no active tab or injection blocked.")}}function v(){const d=`onboarding-audit-${(location.hostname||"local").replace(/^https?:\/\//,"").replace(/^www\./,"").trim()||"local"}-${Ht()}.html`,m=Lt(o),y=new Blob([m],{type:"text/html;charset=utf-8"}),h=document.createElement("a");h.href=URL.createObjectURL(y),h.download=d,h.click(),URL.revokeObjectURL(h.href)}function l(){s=this.checked,n(2,s)}return[o,r,s,i,u,v,l]}class Yt extends Ut{constructor(e){super(),It(this,e,qt,Nt,xt,{})}}const gt=document.getElementById("app");if(!gt)throw new Error("Popup root #app missing");new Yt({target:gt});
