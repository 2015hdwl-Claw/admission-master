import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Sample department data (in production, this would come from a database)
const departments: Record<string, any> = {
  'electrical-engineering': {
    name: '電機工程學系',
    description: '電機工程是現代科技的基礎，涵蓋通訊、控制、電腦、半導體等領域。',
    requirements: [
      '數學、物理基礎堅實',
      '邏輯思考能力強',
      '對新技術有濃厚興趣'
    ],
    careerPaths: [
      '半導體工程師',
      '通訊工程師',
      '軟體工程師'
    ],
    applicationTips: [
      '展現數理能力：數學、物理競賽成績',
      '程式設計經驗：APP 開發、網頁設計'
    ]
  }
};

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const department = departments[params.slug];
  
  if (!department) {
    return {
      title: '科系資訊找不到 | 升學大師',
    };
  }

  return {
    title: `${department.name} | 申請入學指南 - 升學大師`,
    description: department.description,
  };
}

export default function DepartmentPage({ params }: Props) {
  const department = departments[params.slug];
  
  if (!department) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-sm text-gray-600 mb-4">
          <a href="/guide" className="hover:text-indigo-600">申請指南</a>
          {' > '}
          <span className="text-gray-900">{department.name}</span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {department.name}
          </h1>
          <p className="text-lg text-gray-700">{department.description}</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">學科要求</h2>
          <ul className="space-y-3">
            {department.requirements.map((req: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-indigo-600 mr-3">•</span>
                <span className="text-gray-700">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">就業方向</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {department.careerPaths.map((path: string, index: number) => (
              <div key={index} className="bg-indigo-50 rounded-lg p-3">
                <span className="text-indigo-900 font-medium">{path}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">深入了解你的申請竞争力</h2>
          <a href="/analyze" className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 transition-colors">
            開始免費分析
          </a>
        </div>
      </div>
    </div>
  );
}
