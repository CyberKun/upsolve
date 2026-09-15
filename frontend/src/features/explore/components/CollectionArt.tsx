import { ArrowUpRight, Check, Code2 } from 'lucide-react';
import type { Illustration } from '../products';

// Decorative vector artwork: inherits palette colors and needs no image downloads.
export function CollectionArt({ kind, hero = false }: { kind: Illustration; hero?: boolean }) {
  return <div aria-hidden="true" className={`collection-art ${hero ? 'collection-art-hero' : ''}`}>
    <div className="art-orbit" />
    <div className="art-disc" />
    {kind === 'blocks' || kind === 'steps' ? <div className={`art-blocks ${kind === 'steps' ? 'art-steps' : ''}`}>
      <span className="art-block"><Code2 size={42} strokeWidth={1.4} /></span>
      <span className="art-block"><Check size={44} strokeWidth={1.6} /></span>
      <span className="art-block"><ArrowUpRight size={46} strokeWidth={1.6} /></span>
    </div> : <svg viewBox="0 0 320 260" className="art-svg" fill="none">
      {kind === 'tree' ? <>
        <path d="M160 48 72 130 112 214M160 48 246 130 208 214M72 130 32 214M246 130 290 214" stroke="currentColor" strokeWidth="5" className="text-art-line" />
        {[[160,48],[72,130],[246,130],[112,214],[32,214],[208,214],[290,214]].map(([cx,cy], i) => <circle key={i} cx={cx} cy={cy} r={i < 3 ? 24 : 17} className={i % 2 ? 'fill-art-solid stroke-art-line' : 'fill-art-soft stroke-art-line'} strokeWidth="3" />)}
      </> : kind === 'grid' ? <g transform="translate(160 135) rotate(-14)">
        {[-1,0,1].flatMap(x => [-1,0,1].map(y => <rect key={`${x}-${y}`} x={x*67-27} y={y*67-27} width="55" height="55" rx="14" strokeWidth="2" className={x === y ? 'fill-art-solid stroke-art-line' : 'fill-art-soft stroke-art-line'} />))}
      </g> : kind === 'orbit' ? <>
        <circle cx="160" cy="130" r="94" strokeWidth="22" className="stroke-art-soft" />
        <circle cx="160" cy="130" r="58" strokeWidth="25" className="stroke-art-solid" />
        <circle cx="160" cy="130" r="22" className="fill-art-line" />
        <path d="m206 84 57-57m-35 0h35v35" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" className="stroke-art-line" />
      </> : <>
        <path d="M105 55h110v59c0 78-110 78-110 0V55Z" className="fill-art-solid stroke-art-line" strokeWidth="4" />
        <path d="M105 70H77v25c0 28 18 40 38 40m100-65h28v25c0 28-18 40-38 40M160 173v40m-42 10h84" className="stroke-art-line" strokeWidth="10" strokeLinecap="round" />
        <path d="m160 78 10 20 23 3-17 16 4 23-20-11-20 11 4-23-17-16 23-3Z" className="fill-art-soft" />
      </>}
    </svg>}
    {hero && <><span className="art-note art-note-top"><span className="size-2 rounded-full bg-success" /> A little progress, every day.</span><span className="art-note art-note-bottom"><Check size={17} className="text-success" /> One more idea unlocked.</span></>}
  </div>;
}
