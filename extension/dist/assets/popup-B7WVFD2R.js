var be=Object.defineProperty;var ge=(t,e,n)=>e in t?be(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var X=(t,e,n)=>ge(t,typeof e!="symbol"?e+"":e,n);function H(){}function pe(t){return t()}function oe(){return Object.create(null)}function G(t){t.forEach(pe)}function he(t){return typeof t=="function"}function ve(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}function ye(t){return Object.keys(t).length===0}function a(t,e){t.appendChild(e)}function A(t,e,n){t.insertBefore(e,n||null)}function S(t){t.parentNode&&t.parentNode.removeChild(t)}function ee(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function y(t){return document.createElement(t)}function w(t){return document.createTextNode(t)}function T(){return w(" ")}function ke(){return w("")}function P(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function k(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function xe(t){return Array.from(t.childNodes)}function I(t,e){e=""+e,t.data!==e&&(t.data=e)}function L(t,e,n){t.classList.toggle(e,!!n)}let Y;function V(t){Y=t}function $e(){if(!Y)throw new Error("Function called outside component initialization");return Y}function we(t){$e().$$.on_mount.push(t)}const j=[],ie=[];let z=[];const re=[],Ce=Promise.resolve();let te=!1;function Se(){te||(te=!0,Ce.then(_e))}function ne(t){z.push(t)}const Z=new Set;let U=0;function _e(){if(U!==0)return;const t=Y;do{try{for(;U<j.length;){const e=j[U];U++,V(e),Te(e.$$)}}catch(e){throw j.length=0,U=0,e}for(V(null),j.length=0,U=0;ie.length;)ie.pop()();for(let e=0;e<z.length;e+=1){const n=z[e];Z.has(n)||(Z.add(n),n())}z.length=0}while(j.length);for(;re.length;)re.pop()();te=!1,Z.clear(),V(t)}function Te(t){if(t.fragment!==null){t.update(),G(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(ne)}}function Ae(t){const e=[],n=[];z.forEach(o=>t.indexOf(o)===-1?e.push(o):n.push(o)),n.forEach(o=>o()),z=e}const Ee=new Set;function Oe(t,e){t&&t.i&&(Ee.delete(t),t.i(e))}function M(t){return(t==null?void 0:t.length)!==void 0?t:Array.from(t)}function Re(t,e,n){const{fragment:o,after_update:i}=t.$$;o&&o.m(e,n),ne(()=>{const r=t.$$.on_mount.map(pe).filter(he);t.$$.on_destroy?t.$$.on_destroy.push(...r):G(r),t.$$.on_mount=[]}),i.forEach(ne)}function De(t,e){const n=t.$$;n.fragment!==null&&(Ae(n.after_update),G(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Ie(t,e){t.$$.dirty[0]===-1&&(j.push(t),Se(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function Le(t,e,n,o,i,r,s=null,g=[-1]){const h=Y;V(t);const d=t.$$={fragment:null,ctx:[],props:r,update:H,not_equal:i,bound:oe(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(h?h.$$.context:[])),callbacks:oe(),dirty:g,skip_bound:!1,root:e.target||h.$$.root};s&&s(d.root);let v=!1;if(d.ctx=n?n(t,e.props||{},(p,x,...m)=>{const l=m.length?m[0]:x;return d.ctx&&i(d.ctx[p],d.ctx[p]=l)&&(!d.skip_bound&&d.bound[p]&&d.bound[p](l),v&&Ie(t,p)),x}):[],d.update(),v=!0,G(d.before_update),d.fragment=o?o(d.ctx):!1,e.target){if(e.hydrate){const p=xe(e.target);d.fragment&&d.fragment.l(p),p.forEach(S)}else d.fragment&&d.fragment.c();e.intro&&Oe(t.$$.fragment),Re(t,e.target,e.anchor),_e()}V(h)}class Be{constructor(){X(this,"$$");X(this,"$$set")}$destroy(){De(this,1),this.$destroy=H}$on(e,n){if(!he(n))return H;const o=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return o.push(n),()=>{const i=o.indexOf(n);i!==-1&&o.splice(i,1)}}$set(e){this.$$set&&!ye(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const Fe="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(Fe);function He(t){const{url:e,timestamp:n,scores:o,heuristics:i,recommendations:r,rules:s,benchmark:g,pageHost:h,createdAt:d}=t,v="1.0.1",p=n||d,x=p?new Date(p).toISOString().slice(0,16).replace("T"," "):new Date().toISOString().slice(0,16).replace("T"," "),m=h||(e?new URL(e).hostname:"unknown"),l=(g==null?void 0:g.percentile)!=null?`Top ${g.percentile}% of ${g.count} peers (median ${g.median})`:"Benchmark unavailable (offline or consent off)";return`<!DOCTYPE html>
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
    <p><strong>Benchmark:</strong> ${l}</p>
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
        <td>${i.h_cta_above_fold.detected?"Primary CTA detected above fold":"No CTA found above 600px"}</td>
      </tr>
      <tr>
        <td>
          Steps Count
          <div class="heuristic-id">H-STEPS-COUNT</div>
        </td>
        <td>${o.h_steps_count}/100</td>
        <td>${i.h_steps_count.total} total steps (${i.h_steps_count.forms} forms, ${i.h_steps_count.screens} screens)</td>
      </tr>
      <tr>
        <td>
          Copy Clarity
          <div class="heuristic-id">H-COPY-CLARITY</div>
        </td>
        <td>${o.h_copy_clarity}/100</td>
        <td>Avg sentence: ${i.h_copy_clarity.avg_sentence_length} words, ${i.h_copy_clarity.passive_voice_ratio}% passive voice, ${i.h_copy_clarity.jargon_density}% jargon</td>
      </tr>
      <tr>
        <td>
          Trust Markers
          <div class="heuristic-id">H-TRUST-MARKERS</div>
        </td>
        <td>${o.h_trust_markers}/100</td>
        <td>${i.h_trust_markers.total} trust signals (${i.h_trust_markers.testimonials} testimonials, ${i.h_trust_markers.security_badges} security badges, ${i.h_trust_markers.customer_logos} logos)</td>
      </tr>
      <tr>
        <td>
          Signup Speed
          <div class="heuristic-id">H-PERCEIVED-SIGNUP-SPEED</div>
        </td>
        <td>${o.h_perceived_signup_speed}/100</td>
        <td>~${i.h_perceived_signup_speed.estimated_seconds}s completion (${i.h_perceived_signup_speed.form_fields} fields, ${i.h_perceived_signup_speed.required_fields} required)</td>
      </tr>
    </tbody>
  </table>

  <h2>Recommendations</h2>
  ${r.map(c=>{const u=s==null?void 0:s.find($=>$.id===c.heuristic),b=u!=null&&u.confidence&&u.confidence!=="high"?` <em>(confidence: ${u.confidence})</em>`:"";return`
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
${r.map(c=>`- **${c.heuristic}** (${c.priority} priority): ${c.description}`).join(`
`)}

### Recommended Fixes:
${r.map(c=>`- **${c.heuristic}**: ${c.fix}`).join(`
`)}

### Next Steps:
1. Address high priority issues first
2. Test changes with users
3. Re-run audit to verify improvements
    </div>
  </div>

  <footer style="margin-top: 24px; padding-top: 8px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: small;">
    Generated by Onbrd — v${v} — ${x} — ${m} — onbrd.run
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
</html>`}function se(t,e,n){const o=t.slice();return o[14]=e[n],o}function le(t,e,n){const o=t.slice();return o[17]=e[n],o}function ce(t,e,n){const o=t.slice();return o[20]=e[n],o}function de(t){let e,n,o;function i(){return t[12](t[20])}return{c(){e=y("button"),e.textContent=`${t[20]}`,k(e,"class","chip"),L(e,"bg-brand-100",t[1]===t[20]),L(e,"text-brand-800",t[1]===t[20])},m(r,s){A(r,e,s),n||(o=P(e,"click",i),n=!0)},p(r,s){t=r,s&2&&L(e,"bg-brand-100",t[1]===t[20]),s&2&&L(e,"text-brand-800",t[1]===t[20])},d(r){r&&S(e),n=!1,o()}}}function ae(t){let e,n,o;function i(){return t[13](t[17])}return{c(){e=y("button"),e.textContent=`${t[17]}`,k(e,"class","chip"),L(e,"bg-brand-100",t[2]===t[17]),L(e,"text-brand-800",t[2]===t[17])},m(r,s){A(r,e,s),n||(o=P(e,"click",i),n=!0)},p(r,s){t=r,s&4&&L(e,"bg-brand-100",t[2]===t[17]),s&4&&L(e,"text-brand-800",t[2]===t[17])},d(r){r&&S(e),n=!1,o()}}}function ue(t){let e,n,o,i,r,s,g,h;function d(l,c){return l[3]?Ue:Ne}let v=d(t),p=v(t),x=M(t[5].slice(0,3)),m=[];for(let l=0;l<x.length;l+=1)m[l]=fe(se(t,x,l));return{c(){e=y("div"),n=w(t[4]),o=T(),p.c(),i=T(),r=y("div"),s=y("div"),s.textContent="Fix these to improve",g=T(),h=y("ul");for(let l=0;l<m.length;l+=1)m[l].c();k(e,"class","mb-2 text-lg font-semibold"),k(s,"class","text-xs uppercase text-gray-400 mb-1"),k(h,"class","list-disc pl-5 space-y-1"),k(r,"class","mt-3")},m(l,c){A(l,e,c),a(e,n),A(l,o,c),p.m(l,c),A(l,i,c),A(l,r,c),a(r,s),a(r,g),a(r,h);for(let u=0;u<m.length;u+=1)m[u]&&m[u].m(h,null)},p(l,c){if(c&16&&I(n,l[4]),v===(v=d(l))&&p?p.p(l,c):(p.d(1),p=v(l),p&&(p.c(),p.m(i.parentNode,i))),c&32){x=M(l[5].slice(0,3));let u;for(u=0;u<x.length;u+=1){const b=se(l,x,u);m[u]?m[u].p(b,c):(m[u]=fe(b),m[u].c(),m[u].m(h,null))}for(;u<m.length;u+=1)m[u].d(1);m.length=x.length}},d(l){l&&(S(e),S(o),S(i),S(r)),p.d(l),ee(m,l)}}}function Ne(t){let e;return{c(){e=y("div"),e.textContent="Benchmark offline",k(e,"class","text-xs text-gray-500")},m(n,o){A(n,e,o)},p:H,d(n){n&&S(e)}}}function Ue(t){let e;function n(r,s){return r[3].count&&r[3].count>=200&&r[3].percentile!==void 0?Pe:je}let o=n(t),i=o(t);return{c(){i.c(),e=ke()},m(r,s){i.m(r,s),A(r,e,s)},p(r,s){o===(o=n(r))&&i?i.p(r,s):(i.d(1),i=o(r),i&&(i.c(),i.m(e.parentNode,e)))},d(r){r&&S(e),i.d(r)}}}function je(t){let e;return{c(){e=y("div"),e.textContent="Benchmark building…",k(e,"class","text-xs text-gray-500")},m(n,o){A(n,e,o)},p:H,d(n){n&&S(e)}}}function Pe(t){let e,n,o=t[3].percentile+"",i,r,s=t[3].count+"",g,h,d=t[3].median+"",v,p,x,m,l;return{c(){e=y("div"),n=w("Top "),i=w(o),r=w("% of "),g=w(s),h=w(" peers (median "),v=w(d),p=w(") • "),x=w(t[2]),m=w(" • "),l=w(t[1]),k(e,"class","text-xs text-gray-600")},m(c,u){A(c,e,u),a(e,n),a(e,i),a(e,r),a(e,g),a(e,h),a(e,v),a(e,p),a(e,x),a(e,m),a(e,l)},p(c,u){u&8&&o!==(o=c[3].percentile+"")&&I(i,o),u&8&&s!==(s=c[3].count+"")&&I(g,s),u&8&&d!==(d=c[3].median+"")&&I(v,d),u&4&&I(x,c[2]),u&2&&I(l,c[1])},d(c){c&&S(e)}}}function fe(t){let e,n,o=t[14].id+"",i,r,s=t[14].fix+"",g;return{c(){e=y("li"),n=y("span"),i=w(o),r=w(" — "),g=w(s),k(n,"class","font-medium")},m(h,d){A(h,e,d),a(e,n),a(n,i),a(e,r),a(e,g)},p(h,d){d&32&&o!==(o=h[14].id+"")&&I(i,o),d&32&&s!==(s=h[14].fix+"")&&I(g,s)},d(h){h&&S(e)}}}function Me(t){let e,n,o,i,r,s,g,h,d,v,p,x,m,l,c,u,b,$,R,K,B,W,F,N,J=M(["desktop","mobile"]),E=[];for(let _=0;_<2;_+=1)E[_]=de(ce(t,J,_));let Q=M(["global","saas","ecommerce","content"]),O=[];for(let _=0;_<4;_+=1)O[_]=ae(le(t,Q,_));let C=t[4]!==null&&ue(t);return{c(){e=y("div"),n=y("header"),n.innerHTML='<img src="./../../icons/icon16.png" width="20" height="20" alt="Onbrd"/> <h1 class="font-brand text-sm tracking-tight text-ink-900">Onbrd</h1>',o=T(),i=y("div"),r=y("label"),s=y("input"),g=T(),h=y("span"),h.textContent="Share anonymous benchmarks",d=T(),v=y("div"),p=y("div"),p.textContent="Device",x=T();for(let _=0;_<2;_+=1)E[_].c();m=T(),l=y("div"),c=y("div"),c.textContent="Cohort",u=T();for(let _=0;_<4;_+=1)O[_].c();b=T(),$=y("div"),R=y("button"),R.textContent="Run Audit",K=T(),B=y("button"),B.textContent="Export HTML",W=T(),C&&C.c(),k(n,"class","flex items-center gap-2 mb-3"),k(s,"type","checkbox"),k(r,"class","inline-flex items-center gap-1"),k(i,"class","mb-3 flex items-center gap-2"),k(p,"class","text-xs text-ink-500"),k(v,"class","mb-3 flex flex-wrap gap-2"),k(c,"class","text-xs text-ink-500"),k(l,"class","mb-4 flex flex-wrap gap-2"),k(R,"class","btn-primary flex-1"),k(B,"class","chip"),k($,"class","flex gap-2 mb-3"),k(e,"class","p-4 w-[360px] text-sm")},m(_,D){A(_,e,D),a(e,n),a(e,o),a(e,i),a(i,r),a(r,s),s.checked=t[0],a(r,g),a(r,h),a(e,d),a(e,v),a(v,p),a(v,x);for(let f=0;f<2;f+=1)E[f]&&E[f].m(v,null);a(e,m),a(e,l),a(l,c),a(l,u);for(let f=0;f<4;f+=1)O[f]&&O[f].m(l,null);a(e,b),a(e,$),a($,R),a($,K),a($,B),a(e,W),C&&C.m(e,null),F||(N=[P(s,"change",t[11]),P(s,"change",t[6]),P(R,"click",t[9]),P(B,"click",t[10])],F=!0)},p(_,[D]){if(D&1&&(s.checked=_[0]),D&130){J=M(["desktop","mobile"]);let f;for(f=0;f<2;f+=1){const q=ce(_,J,f);E[f]?E[f].p(q,D):(E[f]=de(q),E[f].c(),E[f].m(v,null))}for(;f<2;f+=1)E[f].d(1)}if(D&260){Q=M(["global","saas","ecommerce","content"]);let f;for(f=0;f<4;f+=1){const q=le(_,Q,f);O[f]?O[f].p(q,D):(O[f]=ae(q),O[f].c(),O[f].m(l,null))}for(;f<4;f+=1)O[f].d(1)}_[4]!==null?C?C.p(_,D):(C=ue(_),C.c(),C.m(e,null)):C&&(C.d(1),C=null)},i:H,o:H,d(_){_&&S(e),ee(E,_),ee(O,_),C&&C.d(),F=!1,G(N)}}}function ze(t=new Date){const e=n=>n.toString().padStart(2,"0");return`${t.getFullYear()}${e(t.getMonth()+1)}${e(t.getDate())}${e(t.getHours())}${e(t.getMinutes())}`}function qe(t,e,n){let o=!1,i="desktop",r="global",s=null,g=null,h=[];we(async()=>{const b=await chrome.storage.sync.get({telemetry_opt_in:!1,onbrd_device:"desktop",onbrd_cohort:"global"});n(0,o=b.telemetry_opt_in),n(1,i=b.onbrd_device),n(2,r=b.onbrd_cohort)});function d(){chrome.storage.sync.set({telemetry_opt_in:o,onbrd_device:i,onbrd_cohort:r})}function v(b){n(1,i=b),d()}function p(b){n(2,r=b),d()}async function x(){const b=await chrome.runtime.sendMessage({type:"ONBRD_RUN_AUDIT_ACTIVE_TAB",device:i,cohort:r});if(b!=null&&b.error){console.error(b.error);return}const{audit:$,benchmark:R}=b??{};n(4,g=($==null?void 0:$.score)??null),n(5,h=($==null?void 0:$.topFixes)??[]),n(3,s=o?R??null:null)}async function m(){const[{url:b}]=await chrome.tabs.query({active:!0,currentWindow:!0}),$=(b||"").replace(/^https?:\/\//,"").replace(/^www\./,"").split(/[/?#]/)[0]||"site",R={url:b||"https://example.com",timestamp:new Date().toISOString(),scores:g?{overall:g,h_cta_above_fold:0,h_steps_count:0,h_copy_clarity:0,h_trust_markers:0,h_perceived_signup_speed:0}:{overall:0,h_cta_above_fold:0,h_steps_count:0,h_copy_clarity:0,h_trust_markers:0,h_perceived_signup_speed:0},heuristics:{h_cta_above_fold:{detected:!1,position:0,element:"div"},h_steps_count:{total:0,forms:0,screens:0},h_copy_clarity:{avg_sentence_length:0,passive_voice_ratio:0,jargon_density:0},h_trust_markers:{total:0,testimonials:0,security_badges:0,customer_logos:0},h_perceived_signup_speed:{estimated_seconds:0,form_fields:0,required_fields:0}},recommendations:h.map(N=>({heuristic:N.id,priority:"high",description:N.fix,fix:N.fix})),benchmark:s||void 0,pageHost:$,createdAt:new Date().toISOString()},K=He(R),B=new Blob([K],{type:"text/html"}),W=`onboarding-audit-${$}-${ze()}.html`,F=document.createElement("a");F.href=URL.createObjectURL(B),F.download=W,F.click()}function l(){o=this.checked,n(0,o)}return[o,i,r,s,g,h,d,v,p,x,m,l,b=>v(b),b=>p(b)]}class Ve extends Be{constructor(e){super(),Le(this,e,qe,Me,ve,{})}}const me=document.getElementById("app");if(!me)throw new Error("Popup root #app missing");new Ve({target:me});
