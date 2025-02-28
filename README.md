# ✨ 프로젝트명: We Band

## 초기 세팅 및 명령어 정리
1. **의존성 설치**
- ***yarn install*** - 패키지 의존성 설치
- ***yarn add 패키지명*** - 새로운 패키지 추가
- ***yarn remove 패키지명*** - 패키지 제거
- ***yarn dev*** - 개발환경 실행 (자동 재시작 Nodemon)
- ***yarn start:dev*** - 개발환경 실행
- ***yarn start:prod*** - 배포환경 실행

2. **환경변수 세팅**
루트에 환경변수 파일 생성 & 환경변수 파일 내용 노션 **We Band/총괄보드/백엔드 개발/환경변수 정리/** 에서 확인 가능
- ***.env*** - 전체 환경 변수 (공통된 환경 변수 설정)
- ***.env.dev*** - 개발용 환경 변수 
- ***.env.prod*** - 배포용 환경 변수

3. **Prisma 세팅**
- ***yarn prisma init*** - Prisma를 사용하기 위한 초기 설정을 생성
- ***yarn prisma db push*** - schema.prisma 파일에 정의된 설정값을 **실제 데이터베이스**에 반영(push) (데이터베이스 구조를 변경하거나 새로운 테이블을 생성)
- ***yarn prisma generate*** - Prisma Client를 생성하거나 업데이트. schema.prisma 파일에 변경 사항이 생겼거나, 데이터베이스 구조가 변경되었을 때, 이 명령어를 사용해 Prisma Client를 최신 상태로 유지

**서비스 소개:**  
추후 작성

---

## 📌 Git Commit 규칙
- **feat** - 새로운 기능 추가
- **fix** - 버그 수정
- **refactor** - 코드 리팩토링 (기능 변경 없이 구조 개선)
- **style** - 코드 포맷팅, 세미콜론 누락 등 (비즈니스 로직에 영향이 없는 변경)
- **test** - 테스트 추가 또는 수정
- **docs** - 문서 추가 및 수정
- **chore** - 빌드 작업, 패키지 관리 등

---


## 👨‍👩‍👧‍👦 팀원

---

## 📌 기술 스택 (Tech Stack)
- **언어**: Node.js
- **프레임워크**: Express.js
- **DB ORM**: Prisma 
- **데이터베이스**: MySQL
- **인증**: JWT, Kakao OAuth
- **기타**: 환경 변수 관리 (`dotenv`, `cross-env`)

---

## 📌 주요 기능 (Key Features)

추후 작성

---

## 📂 프로젝트 구조 (간략화)

```
│── src
│   ├── controllers/   # 비즈니스 로직
│   ├── routes/        # API 라우팅
│   ├── middlewares/   # 인증 및 기타 미들웨어
│   ├── config/        # 환경 설정
│   ├── services/      # 비즈니스 로직 설정
│   └── app.js         # Express 설정
│── .env               # 환경 변수 파일
│── package.json       # 프로젝트 의존성 및 설정
```

---