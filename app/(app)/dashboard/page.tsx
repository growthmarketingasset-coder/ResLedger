import { createServerClient } from '@/lib/supabase/server'
import StatsCard from '@/components/ui/StatsCard'
import {
  ActivityBarChart, ImpactDonut, KnowledgeGaps,
  NotReviewedList, HighPotentialList, WeeklyReport,
} from '@/components/dashboard/DashboardWidgets'
import {
  BookOpen, Link2, FileText, Wrench, Lightbulb,
  Pin, TrendingUp, Clock, ArrowRight, Brain,
  Zap, AlertTriangle, BarChart3, Target, PlayCircle, BookMarked,
} from 'lucide-react'
import DashboardGreeting from '@/components/dashboard/DashboardGreeting'
import Link from 'next/link'
import { formatRelative, ENTRY_TYPE_LABELS, IMPACT_CONFIG } from '@/lib/utils'

const TYPE_CONFIG: Record<string, { dot: string; pill: string; pillText: string }> = {
  learning:    { dot: '#8f81f6', pill: 'rgba(124,108,242,0.10)', pillText: '#d7d2ff' },
  resource:    { dot: '#c2bbff', pill: 'rgba(124,108,242,0.14)', pillText: '#f3f1ff' },
  template:    { dot: '#7c6cf2', pill: 'rgba(124,108,242,0.08)', pillText: '#c7c0ff' },
  tool:        { dot: '#aaa1fb', pill: 'rgba(124,108,242,0.08)', pillText: '#d7d2ff' },
  idea:        { dot: '#9488f6', pill: 'rgba(124,108,242,0.08)', pillText: '#c7c0ff' },
  ai_strategy: { dot: '#f3f1ff', pill: 'rgba(124,108,242,0.16)', pillText: '#f3f1ff' },
}

function SectionTitle({ children, icon: Icon, extra }: { children: React.ReactNode; icon: any; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-soft)' }}>
          <Icon size={14} style={{ color: 'var(--accent-500)' }} />
        </div>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{children}</h2>
      </div>
      {extra}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  const [
    { count: learningsCount }, { count: resourcesCount }, { count: templatesCount },
    { count: toolsCount }, { count: ideasCount }, { count: aiStratCount },
    { count: workshopCount }, { count: caseStudyCount },
  ] = await Promise.all([
    supabase.from('learnings').select('*',{count:'exact',head:true}).eq('user_id',user.id).eq('is_archived',false),
    supabase.from('resources').select('*',{count:'exact',head:true}).eq('user_id',user.id).eq('is_archived',false),
    supabase.from('templates').select('*',{count:'exact',head:true}).eq('user_id',user.id).eq('is_archived',false),
    supabase.from('tools').select('*',{count:'exact',head:true}).eq('user_id',user.id).eq('is_archived',false),
    supabase.from('ideas').select('*',{count:'exact',head:true}).eq('user_id',user.id).eq('is_archived',false),
    supabase.from('ai_strategies').select('*',{count:'exact',head:true}).eq('user_id',user.id).eq('is_archived',false),
    supabase.from('workshop_videos').select('*',{count:'exact',head:true}).eq('user_id',user.id).eq('is_archived',false),
    supabase.from('case_studies').select('*',{count:'exact',head:true}).eq('user_id',user.id).eq('is_archived',false),
  ])
  const total = (learningsCount??0)+(resourcesCount??0)+(templatesCount??0)+(toolsCount??0)+(ideasCount??0)+(aiStratCount??0)+(workshopCount??0)+(caseStudyCount??0)

  const [pL,pR,pId,pAI] = await Promise.all([
    supabase.from('learnings').select('id,title,created_at').eq('user_id',user.id).eq('is_pinned',true).eq('is_archived',false).limit(3),
    supabase.from('resources').select('id,title,created_at').eq('user_id',user.id).eq('is_pinned',true).eq('is_archived',false).limit(3),
    supabase.from('ideas').select('id,title,created_at').eq('user_id',user.id).eq('is_pinned',true).eq('is_archived',false).limit(2),
    supabase.from('ai_strategies').select('id,title,created_at').eq('user_id',user.id).eq('is_pinned',true).eq('is_archived',false).limit(2),
  ])
  const pinned = [
    ...(pL.data||[]).map(x=>({...x,type:'learning',href:`/learnings/${x.id}`})),
    ...(pR.data||[]).map(x=>({...x,type:'resource',href:`/resources/${x.id}`})),
    ...(pId.data||[]).map(x=>({...x,type:'idea',href:`/ideas/${x.id}`})),
    ...(pAI.data||[]).map(x=>({...x,type:'ai_strategy',href:`/ai-strategy/${x.id}`})),
  ]

  const [rL,rR,rId,rAI] = await Promise.all([
    supabase.from('learnings').select('id,title,created_at,summary').eq('user_id',user.id).eq('is_archived',false).order('created_at',{ascending:false}).limit(3),
    supabase.from('resources').select('id,title,created_at,description').eq('user_id',user.id).eq('is_archived',false).order('created_at',{ascending:false}).limit(3),
    supabase.from('ideas').select('id,title,created_at,description').eq('user_id',user.id).eq('is_archived',false).order('created_at',{ascending:false}).limit(2),
    supabase.from('ai_strategies').select('id,title,created_at,objective').eq('user_id',user.id).eq('is_archived',false).order('created_at',{ascending:false}).limit(2),
  ])
  const recent = [
    ...(rL.data||[]).map(x=>({...x,desc:x.summary,type:'learning',href:`/learnings/${x.id}`})),
    ...(rR.data||[]).map(x=>({...x,desc:x.description,type:'resource',href:`/resources/${x.id}`})),
    ...(rId.data||[]).map(x=>({...x,desc:x.description,type:'idea',href:`/ideas/${x.id}`})),
    ...(rAI.data||[]).map(x=>({...x,desc:x.objective,type:'ai_strategy',href:`/ai-strategy/${x.id}`})),
  ].sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,6)

  const [hL,hR,hId,hAI] = await Promise.all([
    supabase.from('learnings').select('id,title,impact_level').eq('user_id',user.id).eq('is_archived',false).in('impact_level',['high','game_changing']).limit(4),
    supabase.from('resources').select('id,title,impact_level').eq('user_id',user.id).eq('is_archived',false).in('impact_level',['high','game_changing']).limit(3),
    supabase.from('ideas').select('id,title,impact_level').eq('user_id',user.id).eq('is_archived',false).in('impact_level',['high','game_changing']).limit(3),
    supabase.from('ai_strategies').select('id,title,impact_level').eq('user_id',user.id).eq('is_archived',false).in('impact_level',['high','game_changing']).limit(2),
  ])
  const highPotential = [
    ...(hL.data||[]).map(x=>({...x,type:'learning',tableKey:'learnings'})),
    ...(hR.data||[]).map(x=>({...x,type:'resource',tableKey:'resources'})),
    ...(hId.data||[]).map(x=>({...x,type:'idea',tableKey:'ideas'})),
    ...(hAI.data||[]).map(x=>({...x,type:'ai_strategy',tableKey:'ai_strategies'})),
  ].slice(0,6)

  const [nrL,nrR,nrId] = await Promise.all([
    supabase.from('learnings').select('id,title,created_at').eq('user_id',user.id).eq('is_archived',false).eq('is_reviewed',false).order('created_at',{ascending:true}).limit(3),
    supabase.from('resources').select('id,title,created_at').eq('user_id',user.id).eq('is_archived',false).eq('is_reviewed',false).order('created_at',{ascending:true}).limit(2),
    supabase.from('ideas').select('id,title,created_at').eq('user_id',user.id).eq('is_archived',false).eq('is_reviewed',false).order('created_at',{ascending:true}).limit(2),
  ])
  const notReviewed = [
    ...(nrL.data||[]).map(x=>({...x,type:'learning',tableKey:'learnings'})),
    ...(nrR.data||[]).map(x=>({...x,type:'resource',tableKey:'resources'})),
    ...(nrId.data||[]).map(x=>({...x,type:'idea',tableKey:'ideas'})),
  ].sort((a,b)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime()).slice(0,5)
  const {count:notReviewedCount} = await supabase.from('learnings').select('*',{count:'exact',head:true}).eq('user_id',user.id).eq('is_archived',false).eq('is_reviewed',false)

  const {data:allLR} = await supabase.from('learnings').select('impact_level').eq('user_id',user.id).eq('is_archived',false)
  const ic = {low:0,medium:0,high:0,game_changing:0}
  allLR?.forEach(r=>{if(r.impact_level&&ic[r.impact_level as keyof typeof ic]!==undefined) ic[r.impact_level as keyof typeof ic]++})
  const impactSlices=[
    {level:'game_changing',count:ic.game_changing,color:'#f3f1ff'},
    {level:'high',count:ic.high,color:'#c7c0ff'},
    {level:'medium',count:ic.medium,color:'#aaa1fb'},
    {level:'low',count:ic.low,color:'#98a1b2'},
  ]
  const impactTotal=Object.values(ic).reduce((a,b)=>a+b,0)

  const days7=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(6-i))
    return{label:d.toLocaleDateString('en-US',{weekday:'short'}).slice(0,2),date:d.toISOString().split('T')[0],learnings:0,resources:0}
  })
  const {data:actL} = await supabase.from('learnings').select('created_at').eq('user_id',user.id).gte('created_at',days7[0].date)
  const {data:actR} = await supabase.from('resources').select('created_at').eq('user_id',user.id).gte('created_at',days7[0].date)
  actL?.forEach(r=>{const d=days7.find(x=>x.date===r.created_at.split('T')[0]);if(d)d.learnings++})
  actR?.forEach(r=>{const d=days7.find(x=>x.date===r.created_at.split('T')[0]);if(d)d.resources++})

  const {data:indL} = await supabase.from('learnings').select('industry').eq('user_id',user.id).eq('is_archived',false).not('industry','is',null)
  const {data:indR} = await supabase.from('resources').select('industry').eq('user_id',user.id).eq('is_archived',false).not('industry','is',null)
  const indMap: Record<string,number>={}
  ;[...(indL||[]),...(indR||[])].forEach(r=>{if(r.industry)indMap[r.industry]=(indMap[r.industry]||0)+1})
  const gapData=Object.entries(indMap).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([industry,count])=>({industry,count,maxCount:0}))

  const weekAgoISO=new Date(Date.now()-7*86400000).toISOString()
  const [{count:wL},{count:wR},{count:wId},{count:wRev},{count:wHigh}] = await Promise.all([
    supabase.from('learnings').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',weekAgoISO),
    supabase.from('resources').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',weekAgoISO),
    supabase.from('ideas').select('*',{count:'exact',head:true}).eq('user_id',user.id).gte('created_at',weekAgoISO),
    supabase.from('learnings').select('*',{count:'exact',head:true}).eq('user_id',user.id).eq('is_reviewed',true).gte('updated_at',weekAgoISO),
    supabase.from('learnings').select('*',{count:'exact',head:true}).eq('user_id',user.id).in('impact_level',['high','game_changing']).gte('created_at',weekAgoISO),
  ])
  const weeklyStats={newEntries:(wL??0)+(wR??0)+(wId??0),newLearnings:wL??0,newResources:wR??0,newIdeas:wId??0,reviewed:wRev??0,highImpact:wHigh??0,streak:days7.filter(d=>d.learnings+d.resources>0).length}

  const emailName=(profile?.full_name?.trim() || user.email?.split('@')[0])??'there'
  const P={background:'var(--bg-card)',border:'1px solid var(--border-subtle)',boxShadow:'var(--shadow-card)'}

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6">
      <DashboardGreeting emailName={emailName} total={total} notReviewedCount={notReviewedCount ?? 0} />

      {/* Hero */}
      <div className="mb-5 rounded-2xl p-4 sm:p-5 relative overflow-hidden" style={{background:'linear-gradient(180deg, rgba(124,108,242,0.14) 0%, rgba(26,29,36,1) 46%)',border:'1px solid rgba(124,108,242,0.16)',boxShadow:'var(--shadow-card)'}}>
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-50" style={{background:'radial-gradient(circle, rgba(124,108,242,0.26) 0%, transparent 68%)',transform:'translate(30%,-30%)'}}/>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] mb-1" style={{fontSize:'10px', color:'var(--text-faint)'}}>Total Knowledge</p>
            <p className="text-4xl sm:text-5xl font-bold tabular-nums" style={{letterSpacing:'-0.04em', color:'var(--text-primary)'}}>{total}</p>
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 w-full sm:w-auto">
            {[{label:'Learnings',count:learningsCount??0,href:'/learnings'},{label:'Resources',count:resourcesCount??0,href:'/resources'},{label:'Ideas',count:ideasCount??0,href:'/ideas'},{label:'AI Strategy',count:aiStratCount??0,href:'/ai-strategy'}].map(s=>(
              <Link key={s.href} href={s.href} className="min-w-0">
                <div className="text-center px-3 py-2 rounded-xl transition-all hover:bg-[rgba(255,255,255,0.06)] h-full" style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.04)'}}>
                  <p className="text-xl font-bold tabular-nums" style={{ color:'var(--text-primary)' }}>{s.count}</p>
                  <p className="text-xs font-medium whitespace-nowrap" style={{ color:'var(--text-muted)' }}>{s.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 6-stat grid */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        {[
          {label:'Learnings',count:learningsCount??0,href:'/learnings',icon:<BookOpen size={17} style={{color:'var(--accent-400)'}}/>,gradient:'linear-gradient(180deg, rgba(124,108,242,0.12), rgba(124,108,242,0.04))'},
          {label:'Resources',count:resourcesCount??0,href:'/resources',icon:<Link2 size={17} style={{color:'var(--accent-400)'}}/>,gradient:'linear-gradient(180deg, rgba(124,108,242,0.12), rgba(124,108,242,0.04))'},
          {label:'Templates',count:templatesCount??0,href:'/templates',icon:<FileText size={17} style={{color:'var(--accent-400)'}}/>,gradient:'linear-gradient(180deg, rgba(124,108,242,0.12), rgba(124,108,242,0.04))'},
          {label:'Tools',count:toolsCount??0,href:'/tools',icon:<Wrench size={17} style={{color:'var(--accent-400)'}}/>,gradient:'linear-gradient(180deg, rgba(124,108,242,0.12), rgba(124,108,242,0.04))'},
          {label:'Ideas',count:ideasCount??0,href:'/ideas',icon:<Lightbulb size={17} style={{color:'var(--accent-400)'}}/>,gradient:'linear-gradient(180deg, rgba(124,108,242,0.12), rgba(124,108,242,0.04))'},
          {label:'AI Strategy',count:aiStratCount??0,href:'/ai-strategy',icon:<Brain size={17} style={{color:'var(--accent-400)'}}/>,gradient:'linear-gradient(180deg, rgba(124,108,242,0.12), rgba(124,108,242,0.04))'},
          {label:'Workshops',count:workshopCount??0,href:'/workshop-videos',icon:<PlayCircle size={17} style={{color:'var(--accent-400)'}}/>,gradient:'linear-gradient(180deg, rgba(124,108,242,0.12), rgba(124,108,242,0.04))'},
          {label:'Case Studies',count:caseStudyCount??0,href:'/case-studies',icon:<BookMarked size={17} style={{color:'var(--accent-400)'}}/>,gradient:'linear-gradient(180deg, rgba(124,108,242,0.12), rgba(124,108,242,0.04))'},
        ].map(s=>(
          <Link key={s.href} href={s.href}><StatsCard label={s.label} value={s.count} icon={s.icon} gradient={s.gradient}/></Link>
        ))}
      </div>

      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 gap-4 mb-4 items-stretch xl:grid-cols-3 xl:auto-rows-fr">
        <div className="interactive-card relative rounded-2xl overflow-hidden h-full xl:min-h-[360px]" style={P}>
          <SectionTitle icon={BarChart3}>Activity (7 days)</SectionTitle>
          <div className="p-4 sm:p-5 h-full"><ActivityBarChart data={days7}/></div>
        </div>

        <div className="interactive-card relative rounded-2xl overflow-hidden h-full xl:min-h-[360px]" style={P}>
          <SectionTitle icon={Target}>Impact Distribution</SectionTitle>
          <div className="p-4 sm:p-5 h-full flex items-center justify-center"><ImpactDonut slices={impactSlices} total={impactTotal}/></div>
        </div>

        <div className="h-full xl:min-h-[360px]">
          <WeeklyReport stats={weeklyStats} userName={emailName}/>
        </div>

        <div className="interactive-card relative rounded-2xl overflow-hidden xl:col-span-2 h-full" style={P}>
          <SectionTitle icon={Zap} extra={<span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:'rgba(124,108,242,0.12)',color:'var(--accent-400)'}}>{highPotential.length}</span>}>High Potential</SectionTitle>
          <div className="p-4 sm:p-5"><HighPotentialList items={highPotential}/></div>
        </div>

        <div className="interactive-card relative rounded-2xl overflow-hidden h-full" style={P}>
          <SectionTitle icon={AlertTriangle} extra={(notReviewedCount??0)>0?<span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:'rgba(124,108,242,0.12)',color:'var(--accent-400)'}}>{notReviewedCount}</span>:null}>Not Reviewed</SectionTitle>
          <div className="p-4 sm:p-5"><NotReviewedList items={notReviewed}/></div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 auto-rows-fr">
        {/* Recently added */}
        <div className="interactive-card relative rounded-2xl overflow-hidden h-full" style={P}>
          <SectionTitle icon={Clock}>Recently Added</SectionTitle>
          <div className="p-4 sm:p-5 h-full flex flex-col">
            {recent.length===0?(
              <div className="text-center py-8"><TrendingUp size={20} className="mx-auto mb-2" style={{color:'var(--text-faint)'}}/><p className="text-xs" style={{color:'var(--text-muted)'}}>Nothing yet. Start adding entries!</p></div>
            ):(
              <div className="space-y-1 flex-1">
                {recent.map(item=>{
                  const cfg=TYPE_CONFIG[item.type]||TYPE_CONFIG.learning
                  return(
                    <Link key={`${item.type}-${item.id}`} href={item.href}>
                      <div
                        className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl transition-all group hover:bg-[rgba(255,255,255,0.03)]"
                        style={{ background: 'transparent' }}
                      >
                        <div className="mt-1 w-2 h-2 rounded-full shrink-0" style={{background:cfg.dot}}/>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{background:cfg.pill,color:cfg.pillText}}>{ENTRY_TYPE_LABELS[item.type]}</span>
                            <span className="text-xs ml-auto shrink-0" style={{color:'var(--text-muted)'}}>{formatRelative(item.created_at)}</span>
                          </div>
                          <p className="text-sm font-medium truncate group-hover:text-[var(--accent-400)] transition-colors" style={{color:'var(--text-primary)'}}>{item.title}</p>
                          {item.desc&&<p className="text-xs truncate mt-0.5" style={{color:'var(--text-muted)'}}>{item.desc}</p>}
                        </div>
                        <ArrowRight size={11} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{color:'var(--accent-500)'}}/>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pinned */}
        <div className="interactive-card relative rounded-2xl overflow-hidden h-full" style={P}>
          <SectionTitle icon={Pin} extra={<span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:'rgba(124,108,242,0.10)',color:'var(--accent-400)'}}>{pinned.length}</span>}>Pinned</SectionTitle>
          <div className="p-4 sm:p-5 h-full flex flex-col">
            {pinned.length===0?(
              <div className="text-center py-8"><Pin size={20} className="mx-auto mb-2" style={{color:'var(--text-faint)'}}/><p className="text-xs" style={{color:'var(--text-muted)'}}>Pin entries to see them here</p></div>
            ):(
              <div className="space-y-1 flex-1">
                {pinned.map(item=>{
                  const cfg=TYPE_CONFIG[item.type]||TYPE_CONFIG.learning
                  return(
                    <Link key={`${item.type}-${item.id}`} href={item.href}>
                      <div
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group hover:bg-[rgba(255,255,255,0.03)]"
                        style={{ background: 'transparent' }}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{background:cfg.dot}}/>
                        <span className="text-sm font-medium truncate flex-1 group-hover:text-[var(--accent-400)] transition-colors" style={{color:'var(--text-primary)'}}>{item.title}</span>
                        <span className="text-xs shrink-0" style={{color:'var(--text-muted)'}}>{formatRelative(item.created_at)}</span>
                        <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{color:'var(--accent-500)'}}/>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Knowledge Gaps */}
        <div className="interactive-card relative rounded-2xl overflow-hidden h-full" style={P}>
          <SectionTitle icon={BarChart3}>Knowledge by Industry</SectionTitle>
          <div className="p-4 sm:p-5 h-full flex flex-col">
            <KnowledgeGaps gaps={gapData} totalIndustries={Object.keys(indMap).length}/>
            {gapData.length===0&&<p className="text-xs text-center mt-2" style={{color:'var(--text-muted)'}}>Tag entries with industries to see coverage gaps</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
