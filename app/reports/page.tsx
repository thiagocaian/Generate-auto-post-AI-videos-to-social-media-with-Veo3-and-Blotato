'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

type Stats = {
  jobs: { total: number; active: number; completed: number; pipelineValue: number }
  invoices: { total: number; totalBilled: number; totalPaid: number; outstanding: number }
  quotes: { total: number; approved: number; totalValue: number; conversionRate: number }
  marketing: { total: number; published: number; totalReach: number; totalLikes: number }
}

type InventoryItem = { name: string; sku: string; current: number; minimum: number; location: string }
type CategoryValue = { category: string; value: number }

type Inventory = {
  totalItems: number
  totalValue: number
  lowStockCount: number
  lowStockItems: InventoryItem[]
  byCategory: CategoryValue[]
  healthScore: number
}

type ReportData = {
  stats: Stats
  inventory: Inventory
  aiInsights: string | null
  aiPowered: boolean
  period: string
  company: string
}

function fmt(n: number) {
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'k'
  return '$' + n.toFixed(0)
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 12, padding: '20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#AAAAAA' }}>{sub}</div>}
    </div>
  )
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#666' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{value}</span>
      </div>
      <div style={{ height: 6, background: '#F0F0F0', borderRadius: 99 }}>
        <div style={{ height: 6, width: pct + '%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function AiInsightsBox({ insights, aiPowered }: { insights: string[]; aiPowered: boolean }) {
  return (
    <div style={{ background: '#1A1A1A', borderRadius: 12, padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#886cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>AI Insights</span>
        {aiPowered
          ? <span style={{ fontSize: 10, background: '#886cff', color: '#fff', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>CLAUDE AI</span>
          : <span style={{ fontSize: 10, background: '#333', color: '#888', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>LOCAL ANALYSIS</span>
        }
      </div>
      {insights.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {insights.map((ins, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: '#886cff', fontSize: 16, lineHeight: 1, marginTop: 1 }}>›</span>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{ins}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          No insights available yet. Add data to generate analysis.
        </p>
      )}
    </div>
  )
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [period, setPeriod] = useState('month')
  const [tab, setTab] = useState<'business' | 'estoque'>('estoque')
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/reports?period=${period}`)
      .then(r => r.json())
      .then((d: ReportData) => {
        setData(d)
        if (d.aiInsights) {
          try { setInsights(JSON.parse(d.aiInsights)) } catch { setInsights([]) }
        } else {
          const s = d.stats
          const inv = d.inventory
          const local: string[] = []
          if (inv?.lowStockCount > 0) local.push(`${inv.lowStockCount} item(s) abaixo do estoque mínimo — reposição urgente necessária.`)
          if (inv?.totalValue > 0) local.push(`Valor total em estoque: ${fmt(inv.totalValue)}. Monitore a rotatividade para evitar capital parado.`)
          if (s.invoices.outstanding > 0) local.push(`${fmt(s.invoices.outstanding)} em faturas pendentes. Faça follow-up com clientes.`)
          if (s.jobs.completed > 0) local.push(`${s.jobs.completed} jobs concluídos com ${fmt(s.jobs.pipelineValue)} em pipeline.`)
          setInsights(local.slice(0, 3))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period])

  const periods = [
    { key: 'week', label: 'Esta Semana' },
    { key: 'month', label: 'Este Mês' },
    { key: 'quarter', label: 'Este Trimestre' },
  ]

  const inv = data?.inventory

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F8F8' }}>
      <Sidebar active="reports" />
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Reports</h1>
            <p style={{ fontSize: 13, color: '#AAAAAA', margin: '4px 0 0' }}>{data?.company || '...'} — Visão geral do negócio</p>
          </div>
          <div style={{ display: 'flex', gap: 6, background: '#EBEBEB', borderRadius: 10, padding: 4 }}>
            {periods.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: period === p.key ? '#1A1A1A' : 'transparent',
                  color: period === p.key ? '#fff' : '#666', transition: 'all 0.15s' }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #EBEBEB' }}>
          {[{ key: 'estoque', label: 'Gestão de Estoque' }, { key: 'business', label: 'Negócio' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as 'business' | 'estoque')}
              style={{ padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: tab === t.key ? '#1A1A1A' : '#AAAAAA',
                borderBottom: tab === t.key ? '2px solid #1A1A1A' : '2px solid transparent',
                marginBottom: -2, transition: 'all 0.15s' }}>
              {t.label}
              {t.key === 'estoque' && inv?.lowStockCount ? (
                <span style={{ marginLeft: 8, fontSize: 10, background: '#FF4444', color: '#fff', padding: '2px 6px', borderRadius: 99, fontWeight: 700 }}>
                  {inv.lowStockCount}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #EBEBEB', borderTopColor: '#1A1A1A', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: '#AAAAAA', fontSize: 13 }}>Carregando dados...</p>
            </div>
          </div>
        ) : data ? (
          <>
            {/* ===== ESTOQUE TAB ===== */}
            {tab === 'estoque' && inv && (
              <>
                {/* KPIs estoque */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                  <KpiCard label="Total de Itens" value={String(inv.totalItems)} sub="SKUs cadastrados" color="#1A1A1A" />
                  <KpiCard label="Valor em Estoque" value={fmt(inv.totalValue)} sub="Inventário atual" color="#1A1A1A" />
                  <KpiCard label="Saúde do Estoque" value={inv.healthScore + '%'} sub={`${inv.totalItems - inv.lowStockCount} itens OK`} color={inv.healthScore >= 80 ? '#22C55E' : '#F59E0B'} />
                  <KpiCard label="Itens Críticos" value={String(inv.lowStockCount)} sub="Abaixo do mínimo" color={inv.lowStockCount > 0 ? '#FF4444' : '#22C55E'} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                  {/* Alertas de estoque baixo */}
                  <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 12, padding: '20px 24px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 16 }}>
                      Alertas de Estoque Crítico
                    </div>
                    {inv.lowStockItems.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: '#22C55E', fontSize: 13 }}>
                        <span>✓</span> Todos os itens estão acima do mínimo
                      </div>
                    ) : inv.lowStockItems.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#FFF5F5', borderRadius: 8, marginBottom: 8, border: '1px solid #FFE0E0' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{item.sku} · {item.location}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#FF4444' }}>{item.current}</div>
                          <div style={{ fontSize: 11, color: '#999' }}>mín: {item.minimum}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Por categoria */}
                  <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 12, padding: '20px 24px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 16 }}>Valor por Categoria</div>
                    {inv.byCategory.map((cat, i) => (
                      <MiniBar key={i} label={cat.category} value={Math.round(cat.value)} max={inv.totalValue} color={['#1A1A1A','#886cff','#22C55E','#F59E0B','#3498DB','#E74C3C'][i % 6]} />
                    ))}
                  </div>
                </div>

                <AiInsightsBox insights={insights} aiPowered={data.aiPowered} />
              </>
            )}

            {/* ===== BUSINESS TAB ===== */}
            {tab === 'business' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                  <KpiCard label="Pipeline Value" value={fmt(data.stats.jobs.pipelineValue)} sub={`${data.stats.jobs.total} jobs total`} color="#1A1A1A" />
                  <KpiCard label="Total Faturado" value={fmt(data.stats.invoices.totalBilled)} sub={`${fmt(data.stats.invoices.outstanding)} pendente`} color="#1A1A1A" />
                  <KpiCard label="Conversão Cotações" value={data.stats.quotes.conversionRate + '%'} sub={`${data.stats.quotes.approved}/${data.stats.quotes.total} aprovadas`} color={data.stats.quotes.conversionRate >= 50 ? '#22C55E' : '#F59E0B'} />
                  <KpiCard label="Alcance Posts" value={data.stats.marketing.totalReach.toLocaleString()} sub={`${data.stats.marketing.published} publicados`} color="#886cff" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                  <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 12, padding: '20px 24px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 18 }}>Jobs & Receita</div>
                    <MiniBar label="Jobs Ativos" value={data.stats.jobs.active} max={data.stats.jobs.total || 1} color="#1A1A1A" />
                    <MiniBar label="Jobs Concluídos" value={data.stats.jobs.completed} max={data.stats.jobs.total || 1} color="#22C55E" />
                    <div style={{ borderTop: '1px solid #F0F0F0', margin: '16px 0' }} />
                    <MiniBar label="Faturas Pagas" value={data.stats.invoices.totalPaid} max={data.stats.invoices.totalBilled || 1} color="#22C55E" />
                    <MiniBar label="Pendentes" value={data.stats.invoices.outstanding} max={data.stats.invoices.totalBilled || 1} color="#F59E0B" />
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 12, padding: '20px 24px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 18 }}>Marketing</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      {[{ label: 'Posts Criados', value: data.stats.marketing.total }, { label: 'Publicados', value: data.stats.marketing.published },
                        { label: 'Alcance Total', value: data.stats.marketing.totalReach }, { label: 'Total Likes', value: data.stats.marketing.totalLikes }]
                        .map(m => (
                          <div key={m.label} style={{ background: '#F8F8F8', borderRadius: 8, padding: '12px 14px' }}>
                            <div style={{ fontSize: 11, color: '#AAAAAA', marginBottom: 4 }}>{m.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A' }}>{m.value.toLocaleString()}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <AiInsightsBox insights={insights} aiPowered={data.aiPowered} />
              </>
            )}
          </>
        ) : (
          <p style={{ color: '#AAAAAA' }}>Falha ao carregar dados do relatório.</p>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
