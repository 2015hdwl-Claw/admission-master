// 產學攜手合作計畫專班 — 深入分析頁面
// 資料來源：技專校院招生策略委員會 https://www.techadmi.edu.tw/edutype_list.php?type=1&type2=comi14
// 115學年度 共 40 校 120 個專班 5,345 個招生名額

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import programsData from '@/data/industry-academia-programs.json'

interface Program {
  school_id: number
  school_name: string
  pid: string
  program_name: string
  detail_url: string
  school_name_display: string
  program_name_display: string
  quota: string
  schedule: string
  remarks: string
  partner_companies: string
  class_schedule: string
  partner_companies_list: string[]
  brochure_url: string
  school_recruit_url: string
  region: string
  industry: string
  quota_num: number
  companies_clean: string[]
  schedule_type: string
  eligibility_type: string
  company_industry: string
  exam_criteria?: string
  required_departments?: string[]
  partner_high_schools?: string
}

const ALL_REGIONS = ['全部', '台北', '新北', '桃園', '新竹', '苗栗', '台中', '彰化', '南投', '雲林', '嘉義', '台南', '高雄', '屏東', '宜蘭']
const ALL_INDUSTRIES = ['全部', '餐旅觀光業', '精密機械業', '汽車業', '半導體業', '電子製造業', '資訊科技業', '電機空調業', '設計業', '商業管理業', '智慧製造業', '鋼鐵金屬業', '農業食品業', '建築營造業', '美容業', '醫療照護業', '其他產業']

const PROGRAM_MODES = [
  { mode: '3+4', label: '技高 3 年 + 四技 4 年', desc: '七年一貫，取得學士學位' },
  { mode: '3+2', label: '技高 3 年 + 二專 2 年', desc: '五年取得副學士' },
  { mode: '3+2+2', label: '技高 + 二專 + 二技', desc: '七年取得學士' },
  { mode: '1+3+4', label: '國中 + 技高 + 四技', desc: '八年一貫培育' },
  { mode: '0+4', label: '四技在職進修', desc: '29 歲以下國人皆可報考' },
  { mode: '2+2N', label: '二專日間 + 二技進修', desc: '兼顧就業與升學' },
]

const programs = programsData as unknown as Program[]
const programsWithBrochure = programs.filter(p => p.brochure_url && p.brochure_url.length > 0)
const totalQuota = programsWithBrochure.reduce((s, p) => s + p.quota_num, 0)
const uniqueSchools = new Set(programsWithBrochure.map(p => p.school_name)).size

const eligibilityColor = (type: string) => {
  if (type === '限合作技高專班學生') return 'bg-red-50 text-red-600 border-red-100'
  if (type === '高中職畢業可報名' || type === '開放所有高中職生報名') return 'bg-green-50 text-green-600 border-green-100'
  if (type === '合作技高優先，缺額開放他校') return 'bg-amber-50 text-amber-600 border-amber-100'
  return 'bg-gray-50 text-gray-600 border-gray-100'
}

export default function IndustryAcademiaPage() {
  const [filterIndustry, setFilterIndustry] = useState('全部')
  const [filterRegion, setFilterRegion] = useState('全部')
  const [searchText, setSearchText] = useState('')
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])
  const [showComparePanel, setShowComparePanel] = useState(false)
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return programsWithBrochure.filter(p => {
      if (filterIndustry !== '全部' && p.company_industry !== filterIndustry) return false
      if (filterRegion !== '全部' && p.region !== filterRegion) return false
      if (searchText) {
        const q = searchText.toLowerCase()
        const searchable = `${p.school_name} ${p.program_name} ${p.partner_companies_list?.join(' ') ?? ''} ${p.industry} ${p.region}`.toLowerCase()
        if (!searchable.includes(q)) return false
      }
      return true
    })
  }, [filterIndustry, filterRegion, searchText])

  const filteredQuota = filtered.reduce((s, p) => s + p.quota_num, 0)

  const toggleCompare = (pid: string) => {
    if (selectedForCompare.includes(pid)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== pid))
    } else {
      if (selectedForCompare.length >= 5) {
        alert('最多只能比較 5 個專班')
        return
      }
      setSelectedForCompare([...selectedForCompare, pid])
    }
  }

  const selectedPrograms = programsWithBrochure.filter(p => selectedForCompare.includes(p.pid))

  const getBrochureViewerUrl = (url: string) => {
    if (!url) return ''
    if (url.endsWith('.pdf') || url.includes('.pdf')) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
    }
    return url
  }

  const extractRequiredDepartments = (remarks: string): string[] | null => {
    if (!remarks) return null
    const deptPatterns = [
      /機械群|機械科|機械加工科|機電科|控制科|資訊科|電機科|電子科|資電類|冷凍空調科|電機空調科|車輛工程系|能源與冷凍空調工程系|電子工程系|工業設計系|電機與機械科技學系|智慧機電整合應用|家具木工|木工|設計群|建築科|動力機械群|電機與電子群|汽車修護|車體板金|電子.*丙級|室內配線|工業配線/g,
    ]
    const found = new Set<string>()
    for (const pattern of deptPatterns) {
      const matches = remarks.match(pattern)
      if (matches) matches.forEach(m => found.add(m))
    }
    return found.size > 0 ? Array.from(found) : null
  }

  const schoolGroups = useMemo(() => {
    const map = new Map<string, Program[]>()
    for (const p of filtered) {
      if (!map.has(p.school_name)) map.set(p.school_name, [])
      map.get(p.school_name)!.push(p)
    }
    return Array.from(map.entries()).sort((a, b) => b[1].reduce((s, p) => s + p.quota_num, 0) - a[1].reduce((s, p) => s + p.quota_num, 0))
  }, [filtered])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/90 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Link href="/pathways" className="text-amber-600 hover:text-amber-800 transition text-sm font-medium">
            ← 返回升學管道總覽
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-amber-600 font-semibold text-sm">產學攜手合作計畫 2.0</span>
            {selectedForCompare.length > 0 && (
              <button
                onClick={() => setShowComparePanel(!showComparePanel)}
                className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition"
              >
                比較 {selectedForCompare.length} 個專班
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-block mb-3 px-4 py-1.5 bg-amber-100 rounded-full">
            <p className="text-amber-700 font-semibold text-sm">邊讀書邊工作，企業陪你一起成長</p>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">產學攜手合作計畫</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2">
            教育部、經濟部、勞動部共同推動，整合雙軌訓練旗艦計畫、產學訓合作訓練計畫及就業導向專班。
            透過技高與科大銜接，在學期間進入企業工作、賺取薪資。
          </p>
          <div className="flex justify-center gap-6 sm:gap-8 mt-5">
            {[
              { value: uniqueSchools, label: '招生學校' },
              { value: programsWithBrochure.length, label: '專班數' },
              { value: totalQuota.toLocaleString(), label: '招生名額' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-amber-600">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-400">
            資料來源：技專校院招生策略委員會 • 僅顯示已公布招生簡章之專班
          </div>
        </div>

        {/* 學制說明 */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            六種學制模式
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PROGRAM_MODES.map(pm => (
              <div key={pm.mode} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-amber-100">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs sm:text-sm font-bold">{pm.mode}</span>
                <div className="font-medium text-gray-900 text-xs sm:text-sm mt-2">{pm.label}</div>
                <p className="text-[11px] sm:text-xs text-gray-600 mt-1">{pm.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 補助與福利 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 mb-8 sm:mb-10 border border-green-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">就讀補助與福利</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: '💰', title: '助學金補助', desc: '家庭年所得未逾 70 萬元，每學年補助 4 萬元' },
              { icon: '🎓', title: '學雜費減免', desc: '私科大農林漁牧工等重點領域享公立學雜費標準' },
              { icon: '💼', title: '實習薪資', desc: '配合合作企業前往工作（實習），依規定領取薪資' },
            ].map(item => (
              <div key={item.title} className="bg-white/80 rounded-xl p-4">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{item.title}</div>
                <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 招生學校查詢 */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            115 學年度招生學校與科系
          </h2>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="搜尋學校、科系、企業..."
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full sm:min-w-[200px]"
            />
            <div className="flex gap-2">
              <select
                value={filterRegion}
                onChange={e => setFilterRegion(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:ring-2 focus:ring-amber-500"
              >
                {ALL_REGIONS.map(r => (
                  <option key={r} value={r}>{r === '全部' ? '全部地區' : r}</option>
                ))}
              </select>
              <select
                value={filterIndustry}
                onChange={e => setFilterIndustry(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:ring-2 focus:ring-amber-500"
              >
                {ALL_INDUSTRIES.map(i => (
                  <option key={i} value={i}>{i === '全部' ? '全部產業' : i}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            共 {filtered.length} 個專班 · {schoolGroups.length} 所學校 · 招生 {filteredQuota.toLocaleString()} 名
          </p>

          {/* School Groups */}
          <div className="space-y-4 sm:space-y-6">
            {schoolGroups.map(([schoolName, schoolPrograms]) => {
              const schoolQuota = schoolPrograms.reduce((s, p) => s + p.quota_num, 0)
              const region = schoolPrograms[0]?.region || ''
              const industries = [...new Set(schoolPrograms.map(p => p.company_industry))]
              const brochureUrl = schoolPrograms.find(p => p.brochure_url)?.brochure_url
              const recruitUrl = schoolPrograms.find(p => p.school_recruit_url)?.school_recruit_url
              const isExpanded = expandedSchool === schoolName || schoolPrograms.length <= 2

              return (
                <div key={schoolName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* School Header */}
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-base sm:text-lg font-bold shrink-0">
                          {schoolName.replace(/國立|私立|科技大學|技術學院|大學|商業/g, '').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 text-base sm:text-lg truncate">{schoolName}</div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-xs text-gray-500">{region}</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-amber-600">{schoolPrograms.length} 個專班</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-500">招生 {schoolQuota} 名</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {industries.slice(0, 3).map(ind => (
                              <span key={ind} className="px-1.5 py-0.5 text-[10px] bg-white text-gray-600 rounded border border-gray-200">{ind}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:flex items-center gap-2">
                          {recruitUrl && (
                            <a href={recruitUrl} target="_blank" rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                              招生網站 →
                            </a>
                          )}
                          {brochureUrl && (
                            <a href={getBrochureViewerUrl(brochureUrl)} target="_blank" rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition">
                              查看簡章
                            </a>
                          )}
                        </div>
                        {schoolPrograms.length > 2 && (
                          <button
                            onClick={() => setExpandedSchool(isExpanded ? null : schoolName)}
                            className="sm:hidden px-3 py-1.5 text-xs font-medium text-amber-600 border border-amber-200 rounded-lg"
                          >
                            {isExpanded ? '收合' : `展開 ${schoolPrograms.length} 系`}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Mobile action buttons */}
                    <div className="flex sm:hidden gap-2 mt-2">
                      {recruitUrl && (
                        <a href={recruitUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-center">
                          招生網站 →
                        </a>
                      )}
                      {brochureUrl && (
                        <a href={getBrochureViewerUrl(brochureUrl)} target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2 text-xs font-medium bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition text-center">
                          查看簡章
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-xs text-gray-500">
                          <th className="p-3 text-center font-medium w-12">比較</th>
                          <th className="p-3 text-left font-medium min-w-[180px]">科系/專班</th>
                          <th className="p-3 text-center font-medium w-16">名額</th>
                          <th className="p-3 text-center font-medium w-28">產業</th>
                          <th className="p-3 text-left font-medium min-w-[160px]">合作企業</th>
                          <th className="p-3 text-center font-medium w-36">上課方式</th>
                          <th className="p-3 text-center font-medium w-40">報名資格</th>
                          <th className="p-3 text-center font-medium w-32">考試科目</th>
                          <th className="p-3 text-center font-medium w-28">簡章</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schoolPrograms.map(p => (
                          <ProgramRow key={p.pid} p={p} isSelected={selectedForCompare.includes(p.pid)} onToggle={toggleCompare} getBrochureUrl={getBrochureViewerUrl} extractDepts={extractRequiredDepartments} />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tablet/Mobile: Cards */}
                  <div className="md:hidden">
                    {(isExpanded ? schoolPrograms : schoolPrograms.slice(0, 2)).map(p => (
                      <ProgramCard key={p.pid} p={p} isSelected={selectedForCompare.includes(p.pid)} onToggle={toggleCompare} getBrochureUrl={getBrochureViewerUrl} extractDepts={extractRequiredDepartments} />
                    ))}
                    {!isExpanded && schoolPrograms.length > 2 && (
                      <button
                        onClick={() => setExpandedSchool(schoolName)}
                        className="w-full py-3 text-sm text-amber-600 hover:bg-amber-50 transition border-t border-gray-100"
                      >
                        展開全部 {schoolPrograms.length} 個專班 ▼
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">🔍</p>
              <p>目前篩選條件下沒有符合的專班</p>
              <p className="text-sm mt-1">請嘗試調整篩選條件</p>
            </div>
          )}
        </div>

        {/* 比較面板 */}
        {showComparePanel && selectedPrograms.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={() => setShowComparePanel(false)}>
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-6xl sm:max-h-[90vh] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">專班比較 ({selectedPrograms.length})</h2>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedForCompare([])} className="px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-900">
                    清除
                  </button>
                  <button onClick={() => setShowComparePanel(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-sm">
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="bg-amber-50 text-xs text-gray-700">
                        <th className="p-2 sm:p-3 text-left font-medium sticky left-0 bg-amber-50 z-10 min-w-[80px]">比較項目</th>
                        {selectedPrograms.map(p => (
                          <th key={p.pid} className="p-2 sm:p-3 text-left font-medium min-w-[150px] sm:min-w-[200px]">
                            <div className="font-bold text-gray-900">{p.school_name}</div>
                            <div className="text-[11px] font-normal text-gray-500 mt-0.5">{p.program_name_display || p.program_name}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: '招生名額', render: (p: Program) => <span className="font-bold text-amber-600">{p.quota_num} 名</span> },
                        { label: '產業類別', render: (p: Program) => <span>{p.company_industry}</span> },
                        { label: '上課方式', render: (p: Program) => <span className="text-xs">{p.schedule_type}</span> },
                        { label: '報名資格', render: (p: Program) => (
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${eligibilityColor(p.eligibility_type)}`}>{p.eligibility_type}</span>
                            {p.required_departments && p.required_departments.length > 0 && (
                              <div className="text-[11px] text-amber-700">{p.required_departments.join('、')}</div>
                            )}
                          </div>
                        )},
                        { label: '合作企業', render: (p: Program) => (
                          p.companies_clean?.length > 0 ? (
                            <div className="text-xs space-y-0.5">
                              {p.companies_clean.slice(0, 5).map((c, i) => <div key={i}>{c}</div>)}
                              {p.companies_clean.length > 5 && <div className="text-gray-400">+{p.companies_clean.length - 5} 家</div>}
                            </div>
                          ) : <span className="text-gray-400 text-xs">見簡章</span>
                        )},
                        { label: '考試科目', render: (p: Program) => (
                          p.exam_criteria ? (
                            <div className="space-y-0.5">
                              {p.exam_criteria.split('+').map((item, i) => (
                                <div key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px]">{item.trim()}</div>
                              ))}
                            </div>
                          ) : <span className="text-gray-400 text-xs">見簡章</span>
                        )},
                        { label: '招生簡章', render: (p: Program) => (
                          p.brochure_url ? (
                            <a href={getBrochureViewerUrl(p.brochure_url)} target="_blank" rel="noopener noreferrer"
                              className="inline-block px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium">
                              查看簡章
                            </a>
                          ) : null
                        )},
                      ].map((row, i) => (
                        <tr key={row.label} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                          <td className="p-2 sm:p-3 font-medium text-gray-900 text-xs sticky left-0 bg-inherit z-10">{row.label}</td>
                          {selectedPrograms.map(p => (
                            <td key={p.pid} className="p-2 sm:p-3 text-xs text-gray-700">{row.render(p)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 升學建議 */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-indigo-100 mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">選擇產學專班的 3 個關鍵問題</h2>
          <div className="space-y-3">
            {[
              { q: '你是否確定想在這個產業工作？', a: '產學專班會直接進入合作企業工作，建議先確認你對該產業有興趣。' },
              { q: '你能否兼顧工作和學業？', a: '需要配合企業工作時間，上課和實習交替進行，時間管理很重要。' },
              { q: '合作企業是否符合你的職涯規劃？', a: '先了解合作企業的行業地位、工作內容和發展前景。' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</div>
                <div>
                  <div className="font-bold text-gray-900 text-sm sm:text-base">{item.q}</div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 sm:p-8 text-white text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">查詢更多招生資訊</h2>
          <p className="mb-5 text-amber-100 text-sm sm:text-base">資料以技專校院招生策略委員會公告為準</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a href="https://www.techadmi.edu.tw/edutype_list.php?type=1&type2=comi14" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white text-amber-600 rounded-lg font-semibold hover:bg-gray-100 transition text-sm">
              招策會官方查詢 →
            </a>
            <Link href="/pathways" className="px-5 py-2.5 bg-amber-700 text-white rounded-lg font-semibold hover:bg-amber-800 transition text-sm">
              返回升學管道總覽
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>資料來源：技專校院招生策略委員會 115 學年度產學攜手合作計畫專班招生</p>
          <p>更新日期：2026-06-04 · 招生名額與合作企業以各校簡章公告為準</p>
        </div>
      </main>
    </div>
  )
}

/* Desktop table row */
function ProgramRow({ p, isSelected, onToggle, getBrochureUrl, extractDepts }: {
  p: Program; isSelected: boolean; onToggle: (pid: string) => void; getBrochureUrl: (url: string) => string; extractDepts: (r: string) => string[] | null
}) {
  return (
    <tr className={`border-t border-gray-100 hover:bg-gray-50 ${isSelected ? 'bg-amber-50' : ''}`}>
      <td className="p-3 text-center">
        <input type="checkbox" checked={isSelected} onChange={() => onToggle(p.pid)}
          className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer" />
      </td>
      <td className="p-3">
        <div className="font-medium text-gray-900 text-xs leading-tight">{p.program_name_display || p.program_name}</div>
      </td>
      <td className="p-3 text-center">
        <span className="font-bold text-amber-600">{p.quota_num}</span>
      </td>
      <td className="p-3 text-center">
        <span className="text-xs text-gray-600">{p.company_industry}</span>
      </td>
      <td className="p-3">
        {p.companies_clean?.length > 0 ? (
          <div className="space-y-0.5">
            {p.companies_clean.slice(0, 2).map((c, i) => (
              <div key={i} className="text-xs text-gray-700 truncate" title={c}>{c}</div>
            ))}
            {p.companies_clean.length > 2 && (
              <div className="text-xs text-gray-400">+{p.companies_clean.length - 2} 家</div>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">見簡章</span>
        )}
      </td>
      <td className="p-3 text-center">
        <span className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full whitespace-nowrap max-w-[140px] truncate" title={p.schedule_type}>{p.schedule_type}</span>
      </td>
      <td className="p-3 text-center">
        <div className="space-y-1">
          <span className={`inline-block px-2 py-0.5 text-xs rounded-full border whitespace-nowrap ${eligibilityColor(p.eligibility_type)}`}>{p.eligibility_type}</span>
          {(() => {
            const depts = p.required_departments || extractDepts(p.remarks || '')
            if (!depts || depts.length === 0) return null
            return (
              <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded truncate max-w-[140px]" title={depts.join('、')}>
                限: {depts.join('、')}
              </div>
            )
          })()}
        </div>
      </td>
      <td className="p-3 text-center">
        {p.exam_criteria ? (
          <div className="text-xs text-gray-600">{p.exam_criteria}</div>
        ) : (
          <span className="text-xs text-gray-400">見簡章</span>
        )}
      </td>
      <td className="p-3 text-center">
        {p.brochure_url ? (
          <a href={getBrochureUrl(p.brochure_url)} target="_blank" rel="noopener noreferrer"
            className="inline-block px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium">
            簡章
          </a>
        ) : (
          <a href={p.detail_url} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:text-amber-800 font-medium underline">
            詳情 →
          </a>
        )}
      </td>
    </tr>
  )
}

/* Mobile/Tablet card */
function ProgramCard({ p, isSelected, onToggle, getBrochureUrl, extractDepts }: {
  p: Program; isSelected: boolean; onToggle: (pid: string) => void; getBrochureUrl: (url: string) => string; extractDepts: (r: string) => string[] | null
}) {
  return (
    <div className={`border-t border-gray-100 p-3 sm:p-4 ${isSelected ? 'bg-amber-50' : ''}`}>
      {/* Program name + quota */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 text-sm leading-snug">{p.program_name_display || p.program_name}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-amber-600">{p.quota_num} 名</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">{p.company_industry}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={isSelected} onChange={() => onToggle(p.pid)}
              className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer" />
            <span className="text-[11px] text-gray-400">比較</span>
          </label>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {/* 上課方式 */}
        <div>
          <div className="text-gray-400 text-[11px] mb-0.5">上課方式</div>
          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[11px]">{p.schedule_type}</span>
        </div>
        {/* 報名資格 */}
        <div>
          <div className="text-gray-400 text-[11px] mb-0.5">報名資格</div>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] border ${eligibilityColor(p.eligibility_type)}`}>{p.eligibility_type}</span>
          {p.required_departments && p.required_departments.length > 0 && (
            <div className="text-[10px] text-amber-700 mt-0.5">限: {p.required_departments.join('、')}</div>
          )}
        </div>
        {/* 考試科目 */}
        <div>
          <div className="text-gray-400 text-[11px] mb-0.5">考試科目</div>
          <div className="text-gray-700">{p.exam_criteria || '見簡章'}</div>
        </div>
        {/* 合作企業 */}
        <div>
          <div className="text-gray-400 text-[11px] mb-0.5">合作企業</div>
          {p.companies_clean?.length > 0 ? (
            <div className="text-gray-700 truncate" title={p.companies_clean.join('、')}>
              {p.companies_clean[0]}
              {p.companies_clean.length > 1 && <span className="text-gray-400"> +{p.companies_clean.length - 1}家</span>}
            </div>
          ) : (
            <span className="text-gray-400">見簡章</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2">
        {p.brochure_url && (
          <a href={getBrochureUrl(p.brochure_url)} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition">
            查看簡章
          </a>
        )}
      </div>
    </div>
  )
}
