# 📌 Node.js Community Board & Mobile REST API

> Node.js(Express)와 MySQL 기반의 **웹 커뮤니티 게시판** 및 **모바일 REST API 백엔드** 프로젝트입니다.  
> 레거시 코드베이스를 **최신 ES6+(`async/await`)**, **중앙화된 Connection Pool**, **보안 강화** 아키텍처로 리팩토링했습니다.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express, Passport.js (Local Auth), Bcrypt
- **Database**: MySQL 8.0+ / 9.0+ (Connection Pool)
- **Frontend**: EJS (Server-Side Rendering), Bootstrap, CSS
- **Testing**: Postman API Contract Testing

---

## ⚡ Key Features

- **웹 서비스 (`:50005`)**: 회원가입/로그인(Passport 세션), 아이디/비밀번호 찾기·재설정, 게시글 페이징 & 검색, 댓글 CRUD
- **모바일 API (`:55555`)**: 모바일 앱 연동용 회원 인증 및 게시글/댓글 RESTful JSON API
- **보안 & 권한 제어**: Bcrypt 비밀번호 단방향 암호화, 타인 게시글/댓글 수정·삭제 차단 (403 Forbidden)

---

## 🎯 Refactoring Highlights

1. **비동기 현대화**: ES5 콜백 지옥(Callback Hell) 및 `var`를 `async/await` 및 `const/let`으로 전면 전환
2. **DB 풀링 최적화**: 개별 라우터 커넥션 생성을 중앙 Connection Pool로 단일화하여 연결 누수 방지
3. **안정성 검증**: 기존 Web/Mobile API 시나리오에 대해 **100% 회귀 테스트 통과**

---

## 🚀 Quick Start

### 1. 패키지 설치 & DB 생성
```bash
# 의존성 일괄 설치
npm run install:all

# MySQL 데이터베이스 & 테이블 초기화
mysql -u root -p < schema.sql
```

### 2. 서버 실행
```bash
# 웹 서버 실행 (http://localhost:50005)
npm run start:web

# 모바일 API 서버 실행 (http://localhost:55555)
npm run start:mobile
```
