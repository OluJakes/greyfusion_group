import { mapWooProduct, mapCategory, stripHtml, type WooProduct } from "./src/lib/cron/intavaltoMap";
import { sizeEss, nearestStandardInverter, aggregateLoad, APPLIANCES } from "./src/lib/ess";
import { estimateSmartHome, buildWhatsAppMessage, buildWhatsAppUrl, SMART_HOME_WHATSAPP } from "./src/lib/smarthome";

let pass=0, fail=0;
const A=(n:string,c:boolean)=>{ if(c){pass++;console.log("  ✓ "+n)} else {fail++;console.log("  ✗ FAIL: "+n)} };
const near=(a:number,b:number,e=0.01)=>Math.abs(a-b)<=e;

// ---- Real WooCommerce fixtures captured from the live Store API ----
const leak: WooProduct = {
  id:5291, name:"Aqara Water Leak Sensor T1", slug:"aqara-water-leak-sensor-t1",
  short_description:"<p>The Aqara Water Leak Sensor T1 detects water leaks and flooding and monitors the status of the water leaks.</p>",
  prices:{ price:"4961320", currency_minor_unit:2, currency_code:"NGN" },
  is_in_stock:true, low_stock_remaining:null,
  categories:[{id:194,name:"Safety and Security",slug:"safety-and-security"},{id:203,name:"Alarm &amp; Motion Sensors",slug:"alarm-motion-sensors"}],
  images:[{src:"https://intavaltoretail.com/wp-content/uploads/2026/07/Aqara_water_leak_sensor-1.webp",alt:"",name:"leak1"},{src:"https://intavaltoretail.com/wp-content/uploads/2026/07/Aqara_Water_Leak_Sensor.webp",alt:"",name:"leak2"}],
};
const climate: WooProduct = {
  id:5288, name:"Aqara Climate Sensor W100", slug:"aqara-climate-sensor-w100",
  short_description:"<p>A high-precision sensor with a 3.4-inch LCD screen.</p>",
  prices:{ price:"10638940", currency_minor_unit:2 }, is_in_stock:true, low_stock_remaining:null,
  categories:[{id:194,name:"Safety and Security",slug:"safety-and-security"}],
  images:[{src:"https://intavaltoretail.com/wp-content/uploads/2026/07/AqaraclimatesensorW100_1.webp"}],
};

const m = mapWooProduct(leak)!;
console.log("Intavalto WooCommerce mapper:");
A("price 4961320 (minor 2) -> ₦49,613", m.priceNGN===49613);
A("slug namespaced intavalto-*", m.slug==="intavalto-aqara-water-leak-sensor-t1");
A("category -> smart-home (sensor/security)", m.category==="smart-home");
A("in-stock, null low-stock -> default 20", m.stock===20);
A("2 images extracted, main first", m.images.length===2 && m.images[0].url.includes("intavaltoretail.com/wp-content"));
A("summary HTML stripped", m.summary.includes("detects water leaks") && !m.summary.includes("<p>"));
A("climate price 10638940 -> ₦106,389", mapWooProduct(climate)!.priceNGN===106389);
A("out-of-stock -> 0", mapWooProduct({...leak, is_in_stock:false})!.stock===0);
A("category solar keyword", mapCategory({id:1,name:"Mono Solar Panel 550W",slug:"x"})==="solar");
A("category inverter keyword", mapCategory({id:1,name:"5kVA Hybrid Inverter",slug:"x"})==="inverters");
A("category electronics keyword", mapCategory({id:1,name:"Gaming Laptop 16GB",slug:"x"})==="electronics");
A("null on missing slug", mapWooProduct({id:1,name:"x",slug:""})===null);
A("stripHtml entities", stripHtml("A &amp; B &#8358;100")==="A & B ₦100");

console.log("\nPro ESS sizing:");
const s = sizeEss({dailyKwh:10, peakKw:1, autonomyDays:1});
A("battery = 10/(0.8*0.92) ≈ 13.587 kWh", near(s.batteryKwh,13.5870,0.001));
A("pv = 10/(4.85*0.78) ≈ 2.643 kWp", near(s.pvKwp,2.6434,0.001));
A("inverter kVA = 1*1.25/0.85 ≈ 1.4706", near(s.inverterKva,1.4706,0.001));
A("standard inverter -> 3 kVA", s.inverterStandardKva===3);
A("daily generation ≈ daily demand (10)", near(s.dailyGenKwh,10,0.01));
A("autonomy hours ≈ 26.09", near(s.autonomyHours,26.087,0.01));
A("nearestStandardInverter(9)=10", nearestStandardInverter(9)===10);
A("nearestStandardInverter(55)=75", nearestStandardInverter(55)===75);
A("nearestStandardInverter(120)=125", nearestStandardInverter(120)===125);
A("zero load -> zero sizing", sizeEss({dailyKwh:0,peakKw:0,autonomyDays:1}).batteryKwh===0);
// aggregateLoad: only a 1.2kW AC for 6h, qty 1
const rows = Object.fromEntries(APPLIANCES.map(a=>[a.key,{included:a.key==="ac",qty:1,hours:6}]));
const agg = aggregateLoad(rows);
A("aggregateLoad AC 1.2kW*6h -> 7.2 kWh, 1.2 kW peak", near(agg.dailyKwh,7.2) && near(agg.peakKw,1.2));

console.log("\nSmart Home configurator + WhatsApp:");
const est = estimateSmartHome("duplex",4,["lighting","cctv","access"]);
A("estimate duplex(6.85M)+4*450k+1.2M+1.6M+950k = 12,400,000", est===12_400_000);
const msg = buildWhatsAppMessage({propertyLabel:"Duplex",zoneCount:4,moduleLabels:["Automated Lighting","CCTV AI Telemetry"],estimatedCost:est,clientPhone:"08031112222"});
A("message contains property + estimate ₦", msg.includes("Duplex") && msg.includes("₦12,400,000"));
const url = buildWhatsAppUrl(msg);
A("wa.me targets 2348092024484", url.startsWith(`https://wa.me/${SMART_HOME_WHATSAPP}?text=`) && SMART_HOME_WHATSAPP==="2348092024484");
A("URL text is properly encoded & reversible", decodeURIComponent(url.split("?text=")[1])===msg && url.includes("%0A"));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
