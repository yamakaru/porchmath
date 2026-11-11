"""1200x630 Open Graph image for PorchMath (F3). Text is brand name + tagline only (not translated)."""
from PIL import Image,ImageDraw,ImageFont
W,H=1200,630;im=Image.new("RGB",(W,H));d=ImageDraw.Draw(im)
for y in range(H):  # #0f766e -> slightly darker teal
    t=y/H;d.line([(0,y),(W,y)],fill=(int(15-5*t),int(118-28*t),int(110-22*t)))
# logo (scaled from the 32px header SVG: teal tile, white house, amber band)
s=5;x0,y0=90,170
mask=Image.new("L",(32*s,32*s),0);ImageDraw.Draw(mask).rounded_rectangle([0,0,32*s-1,32*s-1],9*s,fill=255)
lg2=Image.new("RGB",(32*s,32*s),(20,184,166));g=ImageDraw.Draw(lg2)
for i in range(64*s):  # diagonal gradient #14b8a6 -> #0f766e
    t=min(1,i/(64*s));g.line([(i,0),(0,i)],fill=(int(20-5*t),int(184-66*t),int(166-56*t)),width=2)
im.paste(lg2,(x0,y0),mask);d=ImageDraw.Draw(im)
P=lambda x,y:(x0+x*s,y0+y*s)
d.line([P(5,15.5),P(16,7),P(27,15.5)],fill="white",width=int(2.6*s),joint="curve")
d.polygon([P(8.5,15),P(23.5,15),P(23.5,25),P(8.5,25)],fill="white")
d.rounded_rectangle([P(7,17.5),P(25,19.7)],s,fill=(245,158,11))
for x in (11,16,21):d.line([P(x,19.7),P(x,25)],fill=(15,118,110),width=int(1.6*s))
B=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",96);R=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",40)
d.text((290,180),"Porch",font=B,fill="white");d.text((290+d.textlength("Porch",font=B),180),"Math",font=B,fill=(253,230,138))
d.text((294,310),"Home-improvement calculators",font=R,fill=(204,251,241))
im.save("dist/og.png",optimize=True)
