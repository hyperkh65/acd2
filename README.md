# Aidic v1.3 (Tools + Models Hub)

검색 중심 허브(“지금 필요한 AI를 찾기”)를 목표로 만든 Next.js + Neon + Prisma 프로젝트입니다.

## 포함 기능
- Tools + Models 디렉토리
- 홈 상단 고정 검색 + 자동완성
- NEW(72h), Trending(24h)
- 상세페이지(저장, 대체추천/비교표)
- 자연어 검색(/search)
- 컬렉션 공유 링크(/c/[token])
- /admin 수동 업데이트 + Vercel Cron 자동 업데이트
- Toolify 스캔 + GPT 요약 (신규만)

## 1) 환경변수
`.env.local` (로컬) 또는 Vercel Environment Variables에 추가:

- DATABASE_URL
- OPENAI_API_KEY
- ADMIN_PASSWORD
- CRON_TOKEN
- SITE_URL (선택)

`.env.example` 참고.

## 2) 로컬 실행
```bash
npm i
npx prisma migrate dev
npm run dev
```

## 3) 배포
- GitHub에 push
- Vercel Import
- Environment Variables 등록
- Deploy

Cron은 `vercel.json`에 6시간 간격으로 설정됨.

## 주의
- OPENAI_API_KEY / DATABASE_URL는 절대 Git에 올리지 마세요.
- Toolify/Futurepedia 구조가 바뀌면 fetcher 셀렉터를 조정해야 할 수 있습니다.
