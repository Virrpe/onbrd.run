var be=Object.defineProperty;var ge=(t,e,n)=>e in t?be(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var X=(t,e,n)=>ge(t,typeof e!="symbol"?e+"":e,n);function F(){}function pe(t){return t()}function oe(){return Object.create(null)}function Y(t){t.forEach(pe)}function _e(t){return typeof t=="function"}function ye(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}function ve(t){return Object.keys(t).length===0}function a(t,e){t.appendChild(e)}function A(t,e,n){t.insertBefore(e,n||null)}function S(t){t.parentNode&&t.parentNode.removeChild(t)}function ee(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function v(t){return document.createElement(t)}function w(t){return document.createTextNode(t)}function T(){return w(" ")}function xe(){return w("")}function H(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function x(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function ke(t){return Array.from(t.childNodes)}function I(t,e){e=""+e,t.data!==e&&(t.data=e)}function W(t,e,n){t.classList.toggle(e,!!n)}let V;function q(t){V=t}function $e(){if(!V)throw new Error("Function called outside component initialization");return V}function we(t){$e().$$.on_mount.push(t)}const j=[],re=[];let M=[];const ie=[],Ce=Promise.resolve();let te=!1;function Se(){te||(te=!0,Ce.then(he))}function ne(t){M.push(t)}const Z=new Set;let U=0;function he(){if(U!==0)return;const t=V;do{try{for(;U<j.length;){const e=j[U];U++,q(e),Te(e.$$)}}catch(e){throw j.length=0,U=0,e}for(q(null),j.length=0,U=0;re.length;)re.pop()();for(let e=0;e<M.length;e+=1){const n=M[e];Z.has(n)||(Z.add(n),n())}M.length=0}while(j.length);for(;ie.length;)ie.pop()();te=!1,Z.clear(),q(t)}function Te(t){if(t.fragment!==null){t.update(),Y(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(ne)}}function Ae(t){const e=[],n=[];M.forEach(o=>t.indexOf(o)===-1?e.push(o):n.push(o)),n.forEach(o=>o()),M=e}const Ee=new Set;function Oe(t,e){t&&t.i&&(Ee.delete(t),t.i(e))}function P(t){return(t==null?void 0:t.length)!==void 0?t:Array.from(t)}function Re(t,e,n){const{fragment:o,after_update:r}=t.$$;o&&o.m(e,n),ne(()=>{const i=t.$$.on_mount.map(pe).filter(_e);t.$$.on_destroy?t.$$.on_destroy.push(...i):Y(i),t.$$.on_mount=[]}),r.forEach(ne)}function De(t,e){const n=t.$$;n.fragment!==null&&(Ae(n.after_update),Y(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Ie(t,e){t.$$.dirty[0]===-1&&(j.push(t),Se(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function Le(t,e,n,o,r,i,l=null,g=[-1]){const _=V;q(t);const d=t.$$={fragment:null,ctx:[],props:i,update:F,not_equal:r,bound:oe(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(_?_.$$.context:[])),callbacks:oe(),dirty:g,skip_bound:!1,root:e.target||_.$$.root};l&&l(d.root);let y=!1;if(d.ctx=n?n(t,e.props||{},(p,k,...m)=>{const s=m.length?m[0]:k;return d.ctx&&r(d.ctx[p],d.ctx[p]=s)&&(!d.skip_bound&&d.bound[p]&&d.bound[p](s),y&&Ie(t,p)),k}):[],d.update(),y=!0,Y(d.before_update),d.fragment=o?o(d.ctx):!1,e.target){if(e.hydrate){const p=ke(e.target);d.fragment&&d.fragment.l(p),p.forEach(S)}else d.fragment&&d.fragment.c();e.intro&&Oe(t.$$.fragment),Re(t,e.target,e.anchor),he()}q(_)}class Be{constructor(){X(this,"$$");X(this,"$$set")}$destroy(){De(this,1),this.$destroy=F}$on(e,n){if(!_e(n))return F;const o=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return o.push(n),()=>{const r=o.indexOf(n);r!==-1&&o.splice(r,1)}}$set(e){this.$$set&&!ve(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const Fe="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(Fe);function Ne(t){const{url:e,timestamp:n,scores:o,heuristics:r,recommendations:i,rules:l,benchmark:g,pageHost:_,createdAt:d}=t,y="1.0.1",p=n||d,k=p?new Date(p).toISOString().slice(0,16).replace("T"," "):new Date().toISOString().slice(0,16).replace("T"," "),m=_||(e?new URL(e).hostname:"unknown"),s=(g==null?void 0:g.percentile)!=null?`Top ${g.percentile}% of ${g.count} peers (median ${g.median})`:"Benchmark unavailable (offline or consent off)";return`<!DOCTYPE html>
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
    <p><strong>Audit Date:</strong> ${new Date(n||d||Date.now()).toLocaleString()}</p>
    <p><strong>Overall Score:</strong> <span class="score ${o.overall>=80?"":o.overall>=60?"score-medium":"score-bad"}">${o.overall}/100</span></p>
    <p><strong>Benchmark:</strong> ${s}</p>
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
  ${i.map(c=>{const u=l==null?void 0:l.find($=>$.id===c.heuristic),b=u!=null&&u.confidence&&u.confidence!=="high"?` <em>(confidence: ${u.confidence})</em>`:"";return`
    <div class="recommendation priority-${c.priority}">
      <h4>${c.heuristic} (${c.priority} priority)${b}</h4>
      <p><strong>Issue:</strong> ${c.description}</p>
      <p><strong>Fix:</strong> ${c.fix}</p>
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
${i.map(c=>`- **${c.heuristic}** (${c.priority} priority): ${c.description}`).join(`
`)}

### Recommended Fixes:
${i.map(c=>`- **${c.heuristic}**: ${c.fix}`).join(`
`)}

### Next Steps:
1. Address high priority issues first
2. Test changes with users
3. Re-run audit to verify improvements
    </div>
  </div>

  <footer style="margin-top: 24px; padding-top: 8px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: small;">
    Generated by Onbrd — v${y} — ${k} — ${m} — onbrd.run
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
</html>`}function le(t,e,n){const o=t.slice();return o[14]=e[n],o}function se(t,e,n){const o=t.slice();return o[17]=e[n],o}function ce(t,e,n){const o=t.slice();return o[20]=e[n],o}function de(t){let e,n,o;function r(){return t[12](t[20])}return{c(){e=v("button"),e.textContent=`${t[20]}`,x(e,"class","px-2 py-1 rounded-full border hover:bg-gray-50"),W(e,"bg-teal-100",t[1]===t[20])},m(i,l){A(i,e,l),n||(o=H(e,"click",r),n=!0)},p(i,l){t=i,l&2&&W(e,"bg-teal-100",t[1]===t[20])},d(i){i&&S(e),n=!1,o()}}}function ae(t){let e,n,o;function r(){return t[13](t[17])}return{c(){e=v("button"),e.textContent=`${t[17]}`,x(e,"class","px-2 py-1 rounded-full border hover:bg-gray-50"),W(e,"bg-teal-100",t[2]===t[17])},m(i,l){A(i,e,l),n||(o=H(e,"click",r),n=!0)},p(i,l){t=i,l&4&&W(e,"bg-teal-100",t[2]===t[17])},d(i){i&&S(e),n=!1,o()}}}function ue(t){let e,n,o,r,i,l,g,_;function d(s,c){return s[3]?je:Ue}let y=d(t),p=y(t),k=P(t[5].slice(0,3)),m=[];for(let s=0;s<k.length;s+=1)m[s]=fe(le(t,k,s));return{c(){e=v("div"),n=w(t[4]),o=T(),p.c(),r=T(),i=v("div"),l=v("div"),l.textContent="Fix these to improve",g=T(),_=v("ul");for(let s=0;s<m.length;s+=1)m[s].c();x(e,"class","mb-2 text-lg font-semibold"),x(l,"class","text-xs uppercase text-gray-400 mb-1"),x(_,"class","list-disc pl-5 space-y-1"),x(i,"class","mt-3")},m(s,c){A(s,e,c),a(e,n),A(s,o,c),p.m(s,c),A(s,r,c),A(s,i,c),a(i,l),a(i,g),a(i,_);for(let u=0;u<m.length;u+=1)m[u]&&m[u].m(_,null)},p(s,c){if(c&16&&I(n,s[4]),y===(y=d(s))&&p?p.p(s,c):(p.d(1),p=y(s),p&&(p.c(),p.m(r.parentNode,r))),c&32){k=P(s[5].slice(0,3));let u;for(u=0;u<k.length;u+=1){const b=le(s,k,u);m[u]?m[u].p(b,c):(m[u]=fe(b),m[u].c(),m[u].m(_,null))}for(;u<m.length;u+=1)m[u].d(1);m.length=k.length}},d(s){s&&(S(e),S(o),S(r),S(i)),p.d(s),ee(m,s)}}}function Ue(t){let e;return{c(){e=v("div"),e.textContent="Benchmark offline",x(e,"class","text-xs text-gray-500")},m(n,o){A(n,e,o)},p:F,d(n){n&&S(e)}}}function je(t){let e;function n(i,l){return i[3].count&&i[3].count>=200&&i[3].percentile!==void 0?Pe:He}let o=n(t),r=o(t);return{c(){r.c(),e=xe()},m(i,l){r.m(i,l),A(i,e,l)},p(i,l){o===(o=n(i))&&r?r.p(i,l):(r.d(1),r=o(i),r&&(r.c(),r.m(e.parentNode,e)))},d(i){i&&S(e),r.d(i)}}}function He(t){let e;return{c(){e=v("div"),e.textContent="Benchmark building…",x(e,"class","text-xs text-gray-500")},m(n,o){A(n,e,o)},p:F,d(n){n&&S(e)}}}function Pe(t){let e,n,o=t[3].percentile+"",r,i,l=t[3].count+"",g,_,d=t[3].median+"",y,p,k,m,s;return{c(){e=v("div"),n=w("Top "),r=w(o),i=w("% of "),g=w(l),_=w(" peers (median "),y=w(d),p=w(") • "),k=w(t[2]),m=w(" • "),s=w(t[1]),x(e,"class","text-xs text-gray-600")},m(c,u){A(c,e,u),a(e,n),a(e,r),a(e,i),a(e,g),a(e,_),a(e,y),a(e,p),a(e,k),a(e,m),a(e,s)},p(c,u){u&8&&o!==(o=c[3].percentile+"")&&I(r,o),u&8&&l!==(l=c[3].count+"")&&I(g,l),u&8&&d!==(d=c[3].median+"")&&I(y,d),u&4&&I(k,c[2]),u&2&&I(s,c[1])},d(c){c&&S(e)}}}function fe(t){let e,n,o=t[14].id+"",r,i,l=t[14].fix+"",g;return{c(){e=v("li"),n=v("span"),r=w(o),i=w(" — "),g=w(l),x(n,"class","font-medium")},m(_,d){A(_,e,d),a(e,n),a(n,r),a(e,i),a(e,g)},p(_,d){d&32&&o!==(o=_[14].id+"")&&I(r,o),d&32&&l!==(l=_[14].fix+"")&&I(g,l)},d(_){_&&S(e)}}}function Me(t){let e,n,o,r,i,l,g,_,d,y,p,k,m,s,c,u,b,$,R,G,L,K,B,N,J=P(["desktop","mobile"]),E=[];for(let h=0;h<2;h+=1)E[h]=de(ce(t,J,h));let Q=P(["global","saas","ecommerce","content"]),O=[];for(let h=0;h<4;h+=1)O[h]=ae(se(t,Q,h));let C=t[4]!==null&&ue(t);return{c(){e=v("div"),n=v("h1"),n.textContent="Onbrd",o=T(),r=v("div"),i=v("label"),l=v("input"),g=T(),_=v("span"),_.textContent="Share anonymous benchmarks",d=T(),y=v("div"),p=v("div"),p.textContent="Device",k=T();for(let h=0;h<2;h+=1)E[h].c();m=T(),s=v("div"),c=v("div"),c.textContent="Cohort",u=T();for(let h=0;h<4;h+=1)O[h].c();b=T(),$=v("div"),R=v("button"),R.textContent="Run Audit",G=T(),L=v("button"),L.textContent="Export HTML",K=T(),C&&C.c(),x(n,"class","text-xl font-bold mb-2"),x(l,"type","checkbox"),x(i,"class","inline-flex items-center gap-1"),x(r,"class","mb-3 flex items-center gap-2"),x(p,"class","text-xs text-gray-500"),x(y,"class","mb-3 flex flex-wrap gap-2"),x(c,"class","text-xs text-gray-500"),x(s,"class","mb-4 flex flex-wrap gap-2"),x(R,"class","flex-1 py-2 rounded-xl bg-teal-500 text-white font-medium"),x(L,"class","px-3 rounded-xl border"),x($,"class","flex gap-2 mb-3"),x(e,"class","p-4 w-[360px] text-sm")},m(h,D){A(h,e,D),a(e,n),a(e,o),a(e,r),a(r,i),a(i,l),l.checked=t[0],a(i,g),a(i,_),a(e,d),a(e,y),a(y,p),a(y,k);for(let f=0;f<2;f+=1)E[f]&&E[f].m(y,null);a(e,m),a(e,s),a(s,c),a(s,u);for(let f=0;f<4;f+=1)O[f]&&O[f].m(s,null);a(e,b),a(e,$),a($,R),a($,G),a($,L),a(e,K),C&&C.m(e,null),B||(N=[H(l,"change",t[11]),H(l,"change",t[6]),H(R,"click",t[9]),H(L,"click",t[10])],B=!0)},p(h,[D]){if(D&1&&(l.checked=h[0]),D&130){J=P(["desktop","mobile"]);let f;for(f=0;f<2;f+=1){const z=ce(h,J,f);E[f]?E[f].p(z,D):(E[f]=de(z),E[f].c(),E[f].m(y,null))}for(;f<2;f+=1)E[f].d(1)}if(D&260){Q=P(["global","saas","ecommerce","content"]);let f;for(f=0;f<4;f+=1){const z=se(h,Q,f);O[f]?O[f].p(z,D):(O[f]=ae(z),O[f].c(),O[f].m(s,null))}for(;f<4;f+=1)O[f].d(1)}h[4]!==null?C?C.p(h,D):(C=ue(h),C.c(),C.m(e,null)):C&&(C.d(1),C=null)},i:F,o:F,d(h){h&&S(e),ee(E,h),ee(O,h),C&&C.d(),B=!1,Y(N)}}}function ze(t=new Date){const e=n=>n.toString().padStart(2,"0");return`${t.getFullYear()}${e(t.getMonth()+1)}${e(t.getDate())}${e(t.getHours())}${e(t.getMinutes())}`}function qe(t,e,n){let o=!1,r="desktop",i="global",l=null,g=null,_=[];we(async()=>{const b=await chrome.storage.sync.get({telemetry_opt_in:!1,onbrd_device:"desktop",onbrd_cohort:"global"});n(0,o=b.telemetry_opt_in),n(1,r=b.onbrd_device),n(2,i=b.onbrd_cohort)});function d(){chrome.storage.sync.set({telemetry_opt_in:o,onbrd_device:r,onbrd_cohort:i})}function y(b){n(1,r=b),d()}function p(b){n(2,i=b),d()}async function k(){const b=await chrome.runtime.sendMessage({type:"ONBRD_RUN_AUDIT_ACTIVE_TAB",device:r,cohort:i});if(b!=null&&b.error){console.error(b.error);return}const{audit:$,benchmark:R}=b??{};n(4,g=($==null?void 0:$.score)??null),n(5,_=($==null?void 0:$.topFixes)??[]),n(3,l=o?R??null:null)}async function m(){const[{url:b}]=await chrome.tabs.query({active:!0,currentWindow:!0}),$=(b||"").replace(/^https?:\/\//,"").replace(/^www\./,"").split(/[/?#]/)[0]||"site",R={url:b||"https://example.com",timestamp:new Date().toISOString(),scores:g?{overall:g,h_cta_above_fold:0,h_steps_count:0,h_copy_clarity:0,h_trust_markers:0,h_perceived_signup_speed:0}:{overall:0,h_cta_above_fold:0,h_steps_count:0,h_copy_clarity:0,h_trust_markers:0,h_perceived_signup_speed:0},heuristics:{h_cta_above_fold:{detected:!1,position:0,element:"div"},h_steps_count:{total:0,forms:0,screens:0},h_copy_clarity:{avg_sentence_length:0,passive_voice_ratio:0,jargon_density:0},h_trust_markers:{total:0,testimonials:0,security_badges:0,customer_logos:0},h_perceived_signup_speed:{estimated_seconds:0,form_fields:0,required_fields:0}},recommendations:_.map(N=>({heuristic:N.id,priority:"high",description:N.fix,fix:N.fix})),benchmark:l||void 0,pageHost:$,createdAt:new Date().toISOString()},G=Ne(R),L=new Blob([G],{type:"text/html"}),K=`onboarding-audit-${$}-${ze()}.html`,B=document.createElement("a");B.href=URL.createObjectURL(L),B.download=K,B.click()}function s(){o=this.checked,n(0,o)}return[o,r,i,l,g,_,d,y,p,k,m,s,b=>y(b),b=>p(b)]}class Ve extends Be{constructor(e){super(),Le(this,e,qe,Me,ye,{})}}const me=document.getElementById("app");if(!me)throw new Error("Popup root #app missing");new Ve({target:me});
