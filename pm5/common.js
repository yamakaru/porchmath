/* shared by the 2026-11-11 calculators: show/hide by unit (data-uu) and 3-significant-figure display */
function UV(){document.querySelectorAll('.calc [data-uu]').forEach(function(e){e.hidden=+e.getAttribute('data-uu')!=MT})}
function S3(x){var a=Math.abs(x),d=a>=100?0:a>=10?1:a>=1?2:3;return F(x,0,d)}
function INT(id,o){var x=N(id,o);if(!ERR&&Math.floor(x)!==x){FE($(id),'I');ERR=1;return NaN}return x}
EM.I='Enter a whole number';
/* T11-04: locale number format inside an (already translated) message, and metric-first area pairs. No new strings. */
function LN(s){return s.replace(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+/g,function(m){var d=(m.split('.')[1]||'').length;return F(+m.replace(/,/g,''),d,d)})}
function MF(s){return MT?s.replace(/([\d.,]+) ft² \(([\d.,]+) m²\)/g,'$2 m² ($1 ft²)'):s}
