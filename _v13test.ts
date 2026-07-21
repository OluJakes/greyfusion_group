import { computeOverview, topDownloads, diagnostics, trafficByDay } from "./src/lib/analytics";
import { effectivePermissions, PERMISSIONS, ROLE_PERMISSIONS } from "./src/lib/rbac-constants";
import { buildCertificatePdf, buildZip, crc32, decodeDataUrl, slugify } from "./src/lib/compliance-docs";
import { writeFileSync } from "node:fs";
let pass=0, fail=0;
const A=(n:string,c:boolean)=>{ if(c){pass++;console.log("  ✓ "+n)} else {fail++;console.log("  ✗ FAIL: "+n)} };
const near=(a:number,b:number,e=0.001)=>Math.abs(a-b)<=e;
const now=new Date();
const ev=(t:string,p:string,s:string,mins:number,meta:string|null=null)=>({eventType:t,path:p,sessionId:s,metadata:meta,createdAt:new Date(now.getTime()-mins*60000)});
const events=[
  ev("PAGE_VIEW","/","s1",5), ev("PAGE_VIEW","/energy","s1",4),
  ev("PAGE_VIEW","/","s2",3),
  ev("PAGE_VIEW","/compliance","s3",2), ev("PAGE_VIEW","/compliance","s3",1),
  ev("DOWNLOAD","/compliance","s3",1,JSON.stringify({title:"CAC Certificate"})),
  ev("DOWNLOAD","/compliance","s2",2,JSON.stringify({title:"CAC Certificate"})),
  ev("DOWNLOAD","/compliance","s1",2,JSON.stringify({title:"Full Bid Pack"})),
  ev("FORM_SUBMIT","/contact","s2",1),
];
console.log("Analytics:");
const ov=computeOverview(events);
A("total visits = 5", ov.totalVisits===5);
A("unique visitors = 3", ov.uniqueVisitors===3);
A("downloads = 3", ov.downloads===3);
A("form submits = 1", ov.formSubmits===1);
A("bounce rate = 1/3", near(ov.bounceRate,1/3));
const dl=topDownloads(events,5);
A("top download CAC x2", dl[0].title==="CAC Certificate" && dl[0].count===2);
A("bid pack x1", dl.some(d=>d.title==="Full Bid Pack" && d.count===1));
A("diagnostics headline", diagnostics(events).headline.length>10);
A("trafficByDay 7 buckets", trafficByDay(events,7).length===7);
console.log("\nRBAC:");
A("super = all", effectivePermissions("SUPER_ADMIN",[]).length===PERMISSIONS.length);
A("auditor = view only", JSON.stringify(effectivePermissions("AUDITOR",[]))===JSON.stringify(["VIEW_ANALYTICS"]));
A("editor default 5", effectivePermissions("EDITOR",[]).length===ROLE_PERMISSIONS.EDITOR.length);
A("explicit overrides", JSON.stringify(effectivePermissions("EDITOR",["MANAGE_COMPLIANCE"]))===JSON.stringify(["MANAGE_COMPLIANCE"]));
A("invalid filtered -> role default", effectivePermissions("EDITOR",["BOGUS"]).length===ROLE_PERMISSIONS.EDITOR.length);
console.log("\nCompliance docs:");
const pdf=buildCertificatePdf({title:"FIRS Tax Clearance (TCC)",authority:"FIRS",licenseNumber:"TCC/123"});
A("PDF header", pdf.subarray(0,8).toString("latin1")==="%PDF-1.4");
A("PDF trailer", pdf.toString("latin1").trimEnd().endsWith("%%EOF"));
A("PDF embeds title", pdf.toString("latin1").includes("FIRS Tax Clearance"));
A("crc32 hello", crc32(Buffer.from("hello"))===0x3610a686);
A("slugify", slugify("FIRS Tax Clearance (TCC)")==="firs-tax-clearance-tcc");
const dec=decodeDataUrl("data:application/pdf;base64,"+pdf.toString("base64"));
A("decodeDataUrl round-trips", !!dec && dec.buffer.equals(pdf) && dec.contentType==="application/pdf");
const zip=buildZip([{name:"cac.txt",data:Buffer.from("hello world")},{name:"firs.pdf",data:pdf}]);
A("zip sig", zip.subarray(0,4).toString("hex")==="504b0304");
A("zip EOCD", zip.subarray(zip.length-22,zip.length-18).toString("hex")==="504b0506");
writeFileSync("/tmp/gf_bidpack.zip", zip);
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
