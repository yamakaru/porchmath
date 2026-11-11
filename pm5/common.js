/* shared by the 2026-11-11 calculators: show/hide by unit (data-uu) and 3-significant-figure display */
function UV(){document.querySelectorAll('.calc [data-uu]').forEach(function(e){e.hidden=+e.getAttribute('data-uu')!=MT})}
function S3(x){var a=Math.abs(x),d=a>=100?0:a>=10?1:a>=1?2:3;return F(x,0,d)}
function INT(id,o){var x=N(id,o);if(!ERR&&Math.floor(x)!==x){FE($(id),'I');ERR=1;return NaN}return x}
EM.I='Enter a whole number';
