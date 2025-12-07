# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important References

- **프로젝트 목표.md**: 프로젝트의 비전, 핵심 기능, 기술 요구사항, 향후 확장 계획이 정리되어 있음. 새로운 기능 개발이나 수정 시 반드시 참고할 것.

## Project Overview

재정 타임라인 (Finance Timeline) - 연도/월별 재정 흐름을 타임라인 형식으로 시각화하는 웹 애플리케이션

## Tech Stack

- React 18 + TypeScript
- Vite (빌드 도구)
- Tailwind CSS (다크 모드 UI)
- Firebase (Authentication, Firestore)
- date-fns (날짜 처리)
- lucide-react (아이콘)
- uuid (고유 ID 생성)
- gh-pages (GitHub Pages 배포)

## Commands

```bash
cd life-plan-app

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# GitHub Pages 배포
npm run deploy
```

## Deployment Workflow (필수)

**모든 코드 변경 후 반드시 다음 단계를 수행:**

1. **Git 커밋 & 푸시**
   ```bash
   cd life-plan-app
   git add -A
   git commit -m "변경 내용 설명"
   git push origin main
   ```

2. **자동 배포**
   ```bash
   npm run deploy
   ```

- 변경사항은 항상 git에 푸시하고 GitHub Pages에 자동 배포
- 배포 URL: https://yongwoo-ahn.github.io/plan-my-life/

## Architecture

```
life-plan-app/
├── src/
│   ├── components/
│   │   ├── layout/      # Sidebar, Header
│   │   ├── timeline/    # MonthBlock, YearBlock, TransactionForm
│   │   └── loans/       # LoanForm
│   ├── pages/           # TimelinePage, LoansPage, SummaryPage, SettingsPage
│   ├── store/           # AppContext, useStore (상태 관리)
│   ├── types/           # Transaction, Loan, Category 등 타입 정의
│   └── App.tsx          # 메인 앱 컴포넌트
```

## State Management

- `useStore` 훅: localStorage 기반 상태 관리
- `AppContext`: 전역 상태 공유를 위한 React Context
- 데이터는 `finance-timeline-data` 키로 localStorage에 저장

## Key Types

- `Transaction`: 거래 (수입/지출, 금액, 카테고리, 반복 설정)
- `Loan`: 대출 (원금, 이자율, 상환방식, 기간)
- `LoanPayment`: 월별 대출 상환 내역
- `Asset`: 자산 (부동산, 자동차, 예금, 투자 등)
- `LifeEvent`: 인생 이벤트 (주거, 계약, 커리어, 가족 등)
- `TransactionType`: 'income' | 'expense'
- `RecurrenceType`: 'once' | 'monthly' | 'yearly'
- `RepaymentType`: 'equal_principal_interest' | 'equal_principal' | 'bullet'
- `AssetCategory`: 'real_estate' | 'vehicle' | 'savings' | 'investment' | 'other_asset'

## Key Features

- **타임라인 뷰**: 월별/연도별 거래 내역을 시간순으로 표시
- **무한 스크롤**: 스크롤하면 더 많은 월/년도 자동 로드
- **반복 거래**: 매월/매년 반복되는 고정 수입/지출 자동 계산
- **대출 관리**:
  - 3가지 상환 방식 지원 (원리금균등, 원금균등, 만기일시)
  - 상환 계획 자동 계산 및 타임라인 표시
  - 이자만 지출로 계산 (원금은 제외)
- **자산 관리**:
  - 부동산, 자동차, 예금/적금, 투자, 기타 자산 관리
  - 취득가 vs 현재 가치 비교
  - 순자산 계산 (총 자산 - 총 부채)
- **이벤트 관리**: 인생의 중요 일정 기록
- **월별 요약**: 수입, 지출(대출 이자 포함), 잔액 집계
- **연간 통계**: 연간 재정 현황 및 카테고리별 분석
- **장기 재정 전망**: 5년~30년 단위 예상 수입/지출
- **클라우드 동기화**: Google 로그인 시 Firestore 자동 저장 (1초 debounce)
