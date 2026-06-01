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

// 過濾只顯示有招生簡章的科系
const programs = programsData as unknown as Program[]

// 過濾只顯示有招生簡章的科系
const programsWithBrochure = programs.filter(p => p.brochure_url && p.brochure_url.length > 0)

// Stats
const totalQuota = programsWithBrochure.reduce((s, p) => s + p.quota_num, 0)
const uniqueSchools = new Set(programsWithBrochure.map(p => p.school_name)).size

export default function IndustryAcademiaPage() {
  const [filterIndustry, setFilterIndustry] = useState('全部')
  const [filterRegion, setFilterRegion] = useState('全部')
  const [searchText, setSearchText] = useState('')
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])
  const [showComparePanel, setShowComparePanel] = useState(false)

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
    // NCUT uses their web portal, open directly
    if (url.includes('industry.ncut.edu.tw')) return url
    // For PDFs that force download, use Google Docs Viewer
    if (url.endsWith('.pdf') || url.includes('.pdf')) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
    }
    return url
  }

  // 從 remarks 提取科系限制
  const extractRequiredDepartments = (remarks: string): string[] | null => {
    if (!remarks) return null

    const deptPatterns = [
      /機械群|機械科|機械加工科|機電科|控制科|資訊科|電機科|電子科|資電類|冷凍空調科|電機空調科|車輛工程系|能源與冷凍空調工程系|電子工程系|工業設計系|電機與機械科技學系|智慧機電整合應用|家具木工|木工|設計群|建築科|動力機械群|電機與電子群|汽車修護|車體板金|電子.*丙級|室內配線|工業配線/g,
    ]

    const found = new Set<string>()
    for (const pattern of deptPatterns) {
      const matches = remarks.match(pattern)
      if (matches) {
        matches.forEach(m => found.add(m))
      }
    }

    return found.size > 0 ? Array.from(found) : null
  }

  const getEligibilityDisplay = (p: Program): string => {
    const display = p.eligibility_type
    const requiredDepts = p.required_departments || extractRequiredDepartments(p.remarks || '')

    if (!requiredDepts || requiredDepts.length === 0) {
      return display
    }

    const deptsStr = requiredDepts.slice(0, 3).join('、')
    const hasMore = requiredDepts.length > 3

    return `${display}${hasMore ? `（${deptsStr}...）` : `（${deptsStr}）`}`
  }

  // Group by school for summary view
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
      <div className="bg-white/90 border-b border-amber-200 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/pathways" className="text-amber-600 hover:text-amber-800 transition text-sm font-medium">
            ← 返回升學管道總覽
          </Link>
          <div className="flex items-center gap-3">
            <p className="text-amber-600 font-semibold text-sm">產學攜手合作計畫 2.0 <span className="text-xs text-gray-500 ml-1">(僅顯示有簡章專班)</span></p>
            {selectedForCompare.length > 0 && (
              <button
                onClick={() => setShowComparePanel(!showComparePanel)}
                className="px-3 py-1 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition"
              >
                比較 {selectedForCompare.length} 個專班
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4 px-4 py-2 bg-amber-100 rounded-full">
            <p className="text-amber-700 font-semibold text-sm">邊讀書邊工作，企業陪你一起成長</p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">產學攜手合作計畫</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            教育部、經濟部、勞動部共同推動，整合雙軌訓練旗艦計畫、產學訓合作訓練計畫及就業導向專班。
            透過技高與科大銜接，在學期間進入企業工作、賺取薪資。
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{uniqueSchools}</div>
              <div className="text-xs text-gray-500">招生學校</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{programsWithBrochure.length}</div>
              <div className="text-xs text-gray-500">專班數</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{totalQuota.toLocaleString()}</div>
              <div className="text-xs text-gray-500">招生名額</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            資料來源：技專校院招生策略委員會 • 僅顯示已公布招生簡章之專班
          </div>
        </div>

        {/* 學制說明 */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            六種學制模式
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROGRAM_MODES.map(pm => (
              <div key={pm.mode} className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">{pm.mode}</span>
                <div className="font-medium text-gray-900 text-sm mt-2">{pm.label}</div>
                <p className="text-xs text-gray-600 mt-1">{pm.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 補助與福利 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-10 border border-green-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">就讀補助與福利</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 rounded-xl p-4">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-bold text-gray-900 mb-1">助學金補助</div>
              <p className="text-sm text-gray-600">家庭年所得未逾 70 萬元，每學年補助 4 萬元</p>
            </div>
            <div className="bg-white/80 rounded-xl p-4">
              <div className="text-2xl mb-2">🎓</div>
              <div className="font-bold text-gray-900 mb-1">學雜費減免</div>
              <p className="text-sm text-gray-600">私科大農林漁牧工等重點領域享公立學雜費標準</p>
            </div>
            <div className="bg-white/80 rounded-xl p-4">
              <div className="text-2xl mb-2">💼</div>
              <div className="font-bold text-gray-900 mb-1">實習薪資</div>
              <p className="text-sm text-gray-600">配合合作企業前往工作（實習），依規定領取薪資</p>
            </div>
          </div>
        </div>

        {/* 招生學校查詢 */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            115 學年度招生學校與科系
          </h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="搜尋學校、科系、企業..."
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 min-w-[200px]"
            />
            <select
              value={filterRegion}
              onChange={e => setFilterRegion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:ring-2 focus:ring-amber-500"
            >
              {ALL_REGIONS.map(r => (
                <option key={r} value={r}>{r === '全部' ? '全部地區' : r}</option>
              ))}
            </select>
            <select
              value={filterIndustry}
              onChange={e => setFilterIndustry(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:ring-2 focus:ring-amber-500"
            >
              {ALL_INDUSTRIES.map(i => (
                <option key={i} value={i}>{i === '全部' ? '全部產業' : i}</option>
              ))}
            </select>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            共 {filtered.length} 個專班 · {schoolGroups.length} 所學校 · 招生 {filteredQuota.toLocaleString()} 名
          </p>

          {/* School Groups */}
          <div className="space-y-6">
            {schoolGroups.map(([schoolName, schoolPrograms]) => {
              const schoolQuota = schoolPrograms.reduce((s, p) => s + p.quota_num, 0)
              const region = schoolPrograms[0]?.region || ''
              const industries = [...new Set(schoolPrograms.map(p => p.company_industry))]
              const brochureUrl = schoolPrograms.find(p => p.brochure_url)?.brochure_url
              const recruitUrl = schoolPrograms.find(p => p.school_recruit_url)?.school_recruit_url

              return (
                <div key={schoolName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* School Header */}
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
                          {schoolName.replace(/國立|私立|科技大學|技術學院|大學|商業/g, '').charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{schoolName}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{region}</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-amber-600">{schoolPrograms.length} 個專班</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-500">招生 {schoolQuota} 名</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {industries.map(ind => (
                              <span key={ind} className="px-1.5 py-0.5 text-[10px] bg-white text-gray-600 rounded border border-gray-200">{ind}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
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
                    </div>
                  </div>

                  {/* Programs Table */}
                  <div className="overflow-x-auto">
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
                          <th className="p-3 text-center font-medium w-28">招生簡章</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schoolPrograms.map(p => {
                          const isSelected = selectedForCompare.includes(p.pid)
                          return (
                            <tr key={p.pid} className={`border-t border-gray-100 hover:bg-gray-50 ${isSelected ? 'bg-amber-50' : ''}`}>
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleCompare(p.pid)}
                                  className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                />
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
                                {p.companies_clean && p.companies_clean.length > 0 ? (
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
                                <span className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full whitespace-nowrap">{p.schedule_type}</span>
                              </td>
                              <td className="p-3 text-center">
                                <div className="space-y-1">
                                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${
                                    p.eligibility_type === '限合作技高專班學生' ? 'bg-red-50 text-red-600' :
                                    p.eligibility_type === '開放所有高中職生報名' ? 'bg-green-50 text-green-600' :
                                    p.eligibility_type === '合作技高優先，缺額開放他校' ? 'bg-amber-50 text-amber-600' :
                                    'bg-gray-50 text-gray-600'
                                  }`}>{p.eligibility_type}</span>
                                  {(() => {
                                    const depts = extractRequiredDepartments(p.remarks || '')
                                    if (!depts || depts.length === 0) return null
                                    return (
                                      <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded truncate max-w-[120px]" title={depts.join('、')}>
                                        科系: {depts.join('、')}
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
                                  <a href={getBrochureViewerUrl(p.brochure_url)} target="_blank" rel="noopener noreferrer" className="inline-block px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium">
                                    查看簡章
                                  </a>
                                ) : (
                                  <a href={p.detail_url} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:text-amber-800 font-medium underline">
                                    詳情 →
                                  </a>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowComparePanel(false)}>
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">專班比較 ({selectedPrograms.length} 個)</h2>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedForCompare([])} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                    清除全部
                  </button>
                  <button onClick={() => setShowComparePanel(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-amber-50 text-xs text-gray-700">
                        <th className="p-3 text-left font-medium sticky left-0 bg-amber-50 z-10">比較項目</th>
                        {selectedPrograms.map(p => (
                          <th key={p.pid} className="p-3 text-left font-medium min-w-[200px]">
                            {p.school_name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium text-gray-900 sticky left-0 bg-white z-10">專班名稱</td>
                        {selectedPrograms.map(p => (
                          <td key={p.pid} className="p-3 text-xs text-gray-700">{p.program_name_display || p.program_name}</td>
                        ))}
                      </tr>
                      <tr className="border-b bg-gray-50">
                        <td className="p-3 font-medium text-gray-900 sticky left-0 bg-gray-50 z-10">招生名額</td>
                        {selectedPrograms.map(p => (
                          <td key={p.pid} className="p-3 text-xs text-gray-700 font-bold text-amber-600">{p.quota_num} 名</td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium text-gray-900 sticky left-0 bg-white z-10">產業類別</td>
                        {selectedPrograms.map(p => (
                          <td key={p.pid} className="p-3 text-xs text-gray-700">{p.company_industry}</td>
                        ))}
                      </tr>
                      <tr className="border-b bg-gray-50">
                        <td className="p-3 font-medium text-gray-900 sticky left-0 bg-gray-50 z-10">上課方式</td>
                        {selectedPrograms.map(p => (
                          <td key={p.pid} className="p-3 text-xs text-gray-700">{p.schedule_type}</td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium text-gray-900 sticky left-0 bg-white z-10">報名資格</td>
                        {selectedPrograms.map(p => (
                          <td key={p.pid} className="p-3 text-xs text-gray-700">
                            <div className="space-y-1">
                              <span className={`inline-block px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${
                                p.eligibility_type === '限合作技高專班學生' ? 'bg-red-50 text-red-600' :
                                p.eligibility_type === '開放所有高中職生報名' ? 'bg-green-50 text-green-600' :
                                p.eligibility_type === '合作技高優先，缺額開放他校' ? 'bg-amber-50 text-amber-600' :
                                'bg-gray-50 text-gray-600'
                              }`}>{p.eligibility_type}</span>
                              {(() => {
                                const depts = extractRequiredDepartments(p.remarks || '')
                                if (!depts || depts.length === 0) return null
                                return (
                                  <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                    科系: {depts.join('、')}
                                  </div>
                                )
                              })()}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b bg-gray-50">
                        <td className="p-3 font-medium text-gray-900 sticky left-0 bg-gray-50 z-10">合作企業</td>
                        {selectedPrograms.map(p => (
                          <td key={p.pid} className="p-3 text-xs text-gray-700">
                            {p.companies_clean && p.companies_clean.length > 0 ? (
                              <div className="space-y-1">
                                {p.companies_clean.map((c, i) => (
                                  <div key={i} className="text-xs">{c}</div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">見簡章</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium text-gray-900 sticky left-0 bg-white z-10">考試科目</td>
                        {selectedPrograms.map(p => (
                          <td key={p.pid} className="p-3 text-xs text-gray-700">
                            {p.exam_criteria ? (
                              <div className="space-y-0.5">
                                {p.exam_criteria.split('＋').map((item, i) => (
                                  <div key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px]">{item.trim()}</div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">見簡章</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b bg-gray-50">
                        <td className="p-3 font-medium text-gray-900 sticky left-0 bg-gray-50 z-10">招生簡章</td>
                        {selectedPrograms.map(p => (
                          <td key={p.pid} className="p-3 text-xs">
                            {p.brochure_url ? (
                              <a href={getBrochureViewerUrl(p.brochure_url)} target="_blank" rel="noopener noreferrer" className="inline-block px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium">
                                查看簡章
                              </a>
                            ) : (
                              <a href={p.detail_url} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:text-amber-800 font-medium underline">
                                詳情 →
                              </a>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 升學建議 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">選擇產學專班的 3 個關鍵問題</h2>
          <div className="space-y-4">
            {[
              { q: '你是否確定想在這個產業工作？', a: '產學專班會直接進入合作企業工作，建議先確認你對該產業有興趣。' },
              { q: '你能否兼顧工作和學業？', a: '需要配合企業工作時間，上課和實習交替進行，時間管理很重要。' },
              { q: '合作企業是否符合你的職涯規劃？', a: '先了解合作企業的行業地位、工作內容和發展前景。' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</div>
                <div>
                  <div className="font-bold text-gray-900">{item.q}</div>
                  <p className="text-sm text-gray-600 mt-1">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source & CTA */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">查詢更多招生資訊</h2>
          <p className="mb-6 text-amber-100">資料以技專校院招生策略委員會公告為準</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="https://www.techadmi.edu.tw/edutype_list.php?type=1&type2=comi14" target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-amber-600 rounded-lg font-semibold hover:bg-gray-100 transition">
              招策會官方查詢 →
            </a>
            <Link href="/pathways" className="px-6 py-3 bg-amber-700 text-white rounded-lg font-semibold hover:bg-amber-800 transition">
              返回升學管道總覽
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>資料來源：技專校院招生策略委員會 115 學年度產學攜手合作計畫專班招生</p>
          <p>更新日期：2026-06-01 · 招生名額與合作企業以各校簡章公告為準</p>
        </div>
      </main>
    </div>
  )
}
