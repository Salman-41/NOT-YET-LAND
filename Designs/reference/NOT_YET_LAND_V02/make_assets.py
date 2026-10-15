import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import zoom, gaussian_filter
from pathlib import Path
P=Path('/mnt/data/NOT_YET_LAND_V02/assets'); rng=np.random.default_rng(27)
W,H=1750,1250
YY,XX=np.mgrid[0:H,0:W].astype(np.float32)
x=(XX-W*.52)/(W*.44);y=(YY-H*.49)/(H*.48)

def fractal(seed):
 r=np.random.default_rng(seed); out=np.zeros((H,W),np.float32)
 for res,amp in [(4,.60),(8,.32),(17,.18),(35,.095),(82,.048),(168,.028),(430,.014)]:
  im=r.normal(0,1,(int(res*H/W)+2,res)).astype(np.float32)
  v=zoom(im,(H/im.shape[0], W/im.shape[1]),order=3)
  v=v[:H,:W];v=(v-v.mean())/(v.std()+1e-5)
  out+=v*amp
 return out

def curve_mask(points, width=8):
 layer=Image.new('L',(W,H));dr=ImageDraw.Draw(layer)
 dr.line(points, fill=255,width=width,joint='curve')
 for a,b in points: dr.ellipse((a-width//2,b-width//2,a+width//2,b+width//2),fill=255)
 return np.asarray(layer).astype(np.float32)/255

specs=[
 ('kilauea',41,(65,78,74),(15,25,27),(255,111,45),'flow'),
 ('reykjanes',81,(79,88,84),(17,26,30),(255,129,53),'fissure'),
 ('st-helens',129,(112,115,115),(21,28,30),(229,194,157),'crater'),
 ('etna',223,(84,89,97),(22,24,31),(255,106,43),'strata'),
 ('tajogaite',315,(83,81,73),(23,27,29),(248,147,78),'coast'),
 ('vesuvius',408,(109,97,80),(25,28,30),(243,152,82),'cone'),
]
for name,seed,lit,dark,hot,kind in specs:
 n=fractal(seed)
 r=np.sqrt((x*.94)**2+(y*1.4)**2)
 theta=np.arctan2(y,x)
 if kind=='fissure':
  z=0.42*n + 0.32*np.sin(7*x+2*np.sin(y*7))+0.08*np.sin(35*x)
 elif kind=='coast': z=.50*n + .18*np.cos(3*x+3*y) + .65*np.tanh((x+y*.4+.7)*3)
 else:
  peak= 1.2*np.exp(-r**2/(.5 if kind=='strata' else .39))
  bowl= -1.70*np.exp(-((r-(.22 if kind!='st-helens' else .3))/.115)**2)
  if kind=='st-helens': bowl+=-.95*np.exp(-((x+.08)**2/.13+(y+.52)**2/.29))
  if kind=='kilauea': peak*=.46
  z=.60*n + peak + bowl +.11*np.sin(15*theta+6*r)
 z=gaussian_filter(z,1.1)
 gy,gx=np.gradient(z)
 shade=np.clip((-.55*gx-.8*gy +.38)/(np.sqrt(gx*gx+gy*gy+.38)), -.9,1.5)
 rough=np.clip((z-z.min())/(z.max()-z.min()),0,1)
 colors=np.zeros((H,W,3),np.float32)
 for c in range(3):
  colors[:,:,c]=(dark[c]+(lit[c]-dark[c])*(.33+.52*rough))*(.57+.71*shade)
 # texture and metallic lighting
 colors+=((n-.1)*5)[:,:,None]
 if kind=='st-helens':
  snow=(z>np.quantile(z,.81)).astype(float); snow=gaussian_filter(snow,5)
  colors=colors*(1-snow[:,:,None]*.67)+np.array([176,183,183])[None,None,:]*snow[:,:,None]*.67
 if kind=='coast':
  water= np.clip((-.70-x-y*.42)*2,0,1);water=gaussian_filter(water,10)
  colors=colors*(1-water[:,:,None]) + np.array([19,38,42])[None,None,:]*water[:,:,None]
 # fissure/lava channels schematically modeled, always marked illustrative in UI
 paths={
  'kilauea':[[(1040,350),(1005,460),(1080,555),(980,670),(1100,760),(970,900),(1050,1085)],[(1080,555),(1240,630),(1300,710),(1480,825)]],
  'reykjanes':[[(960,45),(928,205),(1050,350),(905,470),(1035,620),(900,780),(1000,950),(910,1190)],[(1050,350),(1180,400),(1310,520)]],
  'st-helens':[],
  'etna':[[(900,545),(1120,600),(1250,700),(1380,950)],[(915,500),(760,630),(630,830)]],
  'tajogaite':[[(965,520),(1015,680),(1130,790),(1210,940),(1440,1150)]],
  'vesuvius':[[(880,540),(920,640),(1040,725),(1120,890)]],
 }[name]
 mask=np.zeros((H,W),np.float32)
 for pts in paths: mask=np.maximum(mask,curve_mask(pts, 7 if kind!='fissure' else 10))
 if mask.max():
  core=gaussian_filter(mask,1.8);halo=gaussian_filter(mask,27)
  colors+= halo[:,:,None]*np.array([90,26,6])[None,None,:]
  colors=colors*(1-core[:,:,None]*.9)+np.array(hot)[None,None,:]*core[:,:,None]*.9
  colors+=gaussian_filter(mask,7)[:,:,None]*np.array([80,35,10])
 if kind=='st-helens':
  p=np.exp(-((r-.29)/.042)**2)
  colors=colors*(1-p[:,:,None]*.23)+np.array([182,181,170])[None,None,:]*p[:,:,None]*.23
 # low key shadow falloff around edges
 edge=np.clip(1-.55*((x*.8)**2+(y*.8)**2),.3,1)
 colors*=edge[:,:,None]
 grain=rng.normal(0,2,(H,W,1)); colors=np.uint8(np.clip(colors+grain,0,255))
 img=Image.fromarray(colors,'RGB').resize((1400,1000),Image.Resampling.LANCZOS)
 img.save(P/f'{name}.webp','WEBP',quality=86,method=6)
 # detail second crop
 img.crop((190,80,1190,850)).resize((980,760),Image.Resampling.LANCZOS).save(P/f'{name}-detail.webp','WEBP',quality=82)
 print(name,round((P/f'{name}.webp').stat().st_size/1024),'KB')
# grain overlay
noise=np.random.default_rng(88).integers(0,255,(260,260),dtype=np.uint8)
a=Image.fromarray(noise,'L');a.putalpha(a.point(lambda x: 35))
a.save(P/'noise.png')
