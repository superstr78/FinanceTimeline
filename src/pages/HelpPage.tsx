import { useState } from 'react';
import {
  Calendar,
  Receipt,
  Flag,
  Landmark,
  LayoutDashboard,
  Settings,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Repeat,
  Cloud,
  Smartphone,
  HelpCircle,
  Building2,
} from 'lucide-react';

interface HelpSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: {
    subtitle: string;
    content: string;
  }[];
}

const helpSections: HelpSection[] = [
  {
    id: 'timeline',
    icon: <Calendar className="w-5 h-5" />,
    title: '타임라인',
    description: '월별/연도별로 수입, 지출, 이벤트를 한눈에 확인할 수 있는 메인 화면입니다.',
    details: [
      {
        subtitle: '월별 보기',
        content: '각 월의 수입, 지출, 대출 상환 내역을 날짜순으로 확인할 수 있습니다. 상단에는 해당 월의 총 수입, 총 지출, 순수익이 표시됩니다.',
      },
      {
        subtitle: '연도별 보기',
        content: '12개월을 한 화면에서 요약해서 볼 수 있습니다. 각 월을 클릭하면 상세 내역을 확인할 수 있고, 하단의 막대 그래프로 월별 추이를 파악할 수 있습니다.',
      },
      {
        subtitle: '오늘 버튼',
        content: '상단의 "오늘" 버튼을 누르면 현재 날짜가 있는 월로 바로 이동합니다.',
      },
      {
        subtitle: '항목 수정/삭제',
        content: '타임라인의 항목을 클릭하면 수정할 수 있고, 오른쪽의 휴지통 아이콘으로 삭제할 수 있습니다.',
      },
    ],
  },
  {
    id: 'transactions',
    icon: <Receipt className="w-5 h-5" />,
    title: '수입/지출',
    description: '정기적인 수입과 지출을 등록하고 관리하는 페이지입니다.',
    details: [
      {
        subtitle: '수입 등록',
        content: '월급, 부수입, 이자 수입 등 다양한 수입을 등록할 수 있습니다. 매월 반복되는 수입은 "반복" 옵션을 "매월"로 설정하세요.',
      },
      {
        subtitle: '지출 등록',
        content: '고정 지출(월세, 보험료, 구독료 등)과 일회성 지출을 구분하여 등록할 수 있습니다.',
      },
      {
        subtitle: '반복 설정',
        content: '"한 번만", "매월", "매년" 중 선택할 수 있습니다. 반복 거래는 종료일을 설정하지 않으면 무기한 반복됩니다.',
      },
      {
        subtitle: '카테고리',
        content: '수입은 급여, 부수입, 이자 등으로, 지출은 주거, 식비, 교통, 통신, 보험, 구독 등 다양한 카테고리로 분류할 수 있습니다.',
      },
    ],
  },
  {
    id: 'events',
    icon: <Flag className="w-5 h-5" />,
    title: '이벤트',
    description: '인생의 중요한 일정과 이벤트를 기록하는 페이지입니다.',
    details: [
      {
        subtitle: '이벤트 종류',
        content: '주거(이사, 전세 만기), 계약(갱신, 만료), 커리어(이직, 승진), 가족(결혼, 출산), 교육(입학, 졸업) 등을 기록할 수 있습니다.',
      },
      {
        subtitle: '중요 표시',
        content: '특히 중요한 이벤트는 별표로 표시할 수 있습니다. 중요 이벤트는 타임라인에서 강조되어 표시됩니다.',
      },
      {
        subtitle: '색상 구분',
        content: '7가지 색상 중 선택하여 이벤트를 시각적으로 구분할 수 있습니다.',
      },
      {
        subtitle: '활용 팁',
        content: '전세 만기일, 보험 갱신일, 자동차 검사일 등 잊기 쉬운 일정을 미리 등록해두면 유용합니다.',
      },
    ],
  },
  {
    id: 'loans',
    icon: <Landmark className="w-5 h-5" />,
    title: '대출 관리',
    description: '대출을 등록하면 상환 계획이 자동으로 계산되어 타임라인에 표시됩니다.',
    details: [
      {
        subtitle: '상환 방식',
        content: '• 원리금균등: 매월 동일한 금액 상환 (원금+이자)\n• 원금균등: 원금은 동일, 이자는 점점 감소\n• 만기일시: 매월 이자만, 만기에 원금 일시 상환',
      },
      {
        subtitle: '이자 계산',
        content: '대출 이자는 자동으로 지출에 포함됩니다. 원금 상환분은 지출이 아닌 부채 감소로 처리되어 순수익 계산에서 제외됩니다.',
      },
      {
        subtitle: '상환 일정',
        content: '설정한 상환일에 맞춰 매월 타임라인에 상환 내역이 자동으로 표시됩니다.',
      },
      {
        subtitle: '예상 월 상환액',
        content: '대출 등록 시 예상 월 상환액을 미리 확인할 수 있어 상환 계획을 세우는 데 도움이 됩니다.',
      },
    ],
  },
  {
    id: 'assets',
    icon: <Building2 className="w-5 h-5" />,
    title: '자산 관리',
    description: '부동산, 자동차, 예금 등 보유 자산을 등록하고 순자산을 계산합니다.',
    details: [
      {
        subtitle: '자산 카테고리',
        content: '• 부동산: 아파트, 주택, 토지 등\n• 자동차: 승용차, SUV 등\n• 예금/적금: 은행 예금, 적금 등\n• 투자: 주식, 펀드, ETF 등\n• 기타 자산: 귀금속, 예술품 등',
      },
      {
        subtitle: '취득가 vs 현재 가치',
        content: '취득가(구매 가격)와 현재 가치(시가)를 별도로 입력하여 자산 가치 변동을 추적할 수 있습니다.',
      },
      {
        subtitle: '순자산 계산',
        content: '순자산 = 총 자산 - 총 부채(대출 잔액). 요약 페이지에서 순자산 현황을 확인할 수 있습니다.',
      },
      {
        subtitle: '활용 팁',
        content: '부동산 시세가 변동되면 현재 가치를 업데이트하여 실시간 순자산을 파악하세요.',
      },
    ],
  },
  {
    id: 'summary',
    icon: <LayoutDashboard className="w-5 h-5" />,
    title: '요약',
    description: '연도별 재정 현황을 요약해서 보여주는 페이지입니다.',
    details: [
      {
        subtitle: '연간 요약',
        content: '해당 연도의 총 수입, 총 지출, 순수익을 한눈에 확인할 수 있습니다.',
      },
      {
        subtitle: '월별 현황',
        content: '막대 그래프로 각 월의 수입과 지출을 비교할 수 있어 재정 흐름을 파악하기 좋습니다.',
      },
      {
        subtitle: '지출 카테고리',
        content: '어떤 카테고리에서 지출이 많은지 TOP 5를 확인할 수 있습니다.',
      },
      {
        subtitle: '스크롤',
        content: '아래로 스크롤하면 이전 연도의 요약도 확인할 수 있습니다.',
      },
    ],
  },
  {
    id: 'settings',
    icon: <Settings className="w-5 h-5" />,
    title: '설정',
    description: '계정 연동, 데이터 백업 및 복원을 관리하는 페이지입니다.',
    details: [
      {
        subtitle: 'Google 계정 연동',
        content: 'Google 계정으로 로그인하면 여러 기기에서 동일한 데이터를 사용할 수 있습니다. 데이터는 자동으로 클라우드에 저장됩니다.',
      },
      {
        subtitle: '데이터 내보내기',
        content: '모든 데이터를 JSON 파일로 저장하여 백업할 수 있습니다. 정기적으로 백업하는 것을 권장합니다.',
      },
      {
        subtitle: '데이터 가져오기',
        content: '이전에 백업한 JSON 파일에서 데이터를 복원할 수 있습니다.',
      },
      {
        subtitle: '데이터 초기화',
        content: '모든 데이터를 삭제하고 처음 상태로 되돌립니다. 이 작업은 되돌릴 수 없으니 주의하세요.',
      },
    ],
  },
];

const tips = [
  {
    icon: <Repeat className="w-4 h-4" />,
    title: '반복 거래 활용하기',
    content: '월급, 월세, 구독료 등 매월 반복되는 거래는 한 번만 등록하면 자동으로 매월 반영됩니다.',
  },
  {
    icon: <TrendingUp className="w-4 h-4" />,
    title: '수입 먼저 등록하기',
    content: '월급 등 고정 수입을 먼저 등록하면 지출 계획을 세우기 쉬워집니다.',
  },
  {
    icon: <TrendingDown className="w-4 h-4" />,
    title: '고정 지출 파악하기',
    content: '월세, 보험료, 구독료 등 고정 지출을 모두 등록하면 실제 가용 금액을 파악할 수 있습니다.',
  },
  {
    icon: <Cloud className="w-4 h-4" />,
    title: '클라우드 동기화',
    content: 'Google 계정으로 로그인하면 핸드폰과 컴퓨터에서 동일한 데이터를 확인할 수 있습니다.',
  },
  {
    icon: <Smartphone className="w-4 h-4" />,
    title: '홈 화면에 추가',
    content: '모바일에서 브라우저 메뉴의 "홈 화면에 추가"를 선택하면 앱처럼 사용할 수 있습니다.',
  },
];

export function HelpPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('timeline');

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="max-w-2xl space-y-4 lg:space-y-6">
      {/* 소개 */}
      <div className="card !p-4 lg:!p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark-100">플랜마이라이프 사용 가이드</h2>
            <p className="text-sm text-dark-400">나의 인생을 설계하는 방법</p>
          </div>
        </div>
        <p className="text-sm text-dark-300 leading-relaxed">
          플랜마이라이프는 수입, 지출, 대출, 중요 이벤트를 타임라인 형식으로 관리하여
          미래의 재정 상황을 미리 파악할 수 있게 도와주는 앱입니다.
        </p>
      </div>

      {/* 기능별 도움말 */}
      <div className="card !p-0 overflow-hidden">
        <h3 className="text-base lg:text-lg font-semibold text-dark-100 p-4 lg:p-6 pb-2 lg:pb-3">
          기능별 안내
        </h3>
        <div className="divide-y divide-dark-800">
          {helpSections.map((section) => (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 p-4 lg:p-5 hover:bg-dark-800/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-dark-300 flex-shrink-0">
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-dark-100 text-sm lg:text-base">{section.title}</h4>
                  <p className="text-xs lg:text-sm text-dark-400 truncate">{section.description}</p>
                </div>
                {expandedSection === section.id ? (
                  <ChevronUp className="w-5 h-5 text-dark-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-dark-400 flex-shrink-0" />
                )}
              </button>

              {expandedSection === section.id && (
                <div className="px-4 lg:px-5 pb-4 lg:pb-5 space-y-3">
                  {section.details.map((detail, index) => (
                    <div key={index} className="p-3 lg:p-4 bg-dark-800/50 rounded-xl">
                      <h5 className="font-medium text-violet-400 text-sm mb-1.5">{detail.subtitle}</h5>
                      <p className="text-xs lg:text-sm text-dark-300 whitespace-pre-line leading-relaxed">
                        {detail.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 활용 팁 */}
      <div className="card !p-4 lg:!p-6">
        <h3 className="text-base lg:text-lg font-semibold text-dark-100 mb-3 lg:mb-4">
          💡 활용 팁
        </h3>
        <div className="space-y-2 lg:space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-dark-800/50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                {tip.icon}
              </div>
              <div>
                <h4 className="font-medium text-dark-100 text-sm mb-0.5">{tip.title}</h4>
                <p className="text-xs text-dark-400">{tip.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 문의 */}
      <div className="card !p-4 lg:!p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <p className="text-sm text-dark-300 text-center">
          추가 문의사항이 있으시면 언제든 연락주세요
        </p>
        <p className="text-xs text-dark-500 text-center mt-2">
          Made by 이용우
        </p>
      </div>
    </div>
  );
}
