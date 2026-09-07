# Node.js 웹 게시판 서비스

> Node.js(Express)와 MySQL 기반의 **웹 게시판 서비스** 프로젝트입니다.

---

## 기술 스택

- **Backend**: Node.js, Express, Passport.js (Local Auth), Bcrypt
- **Database**: MySQL 8.0+
- **Frontend**: EJS (Server-Side Rendering), Bootstrap, CSS

---

## 주요 기능

- **회원 인증**: 회원가입/로그인(세션), 계정 찾기 및 비밀번호 재설정
- **게시판 및 댓글**: 게시글 페이징 및 검색, 본문 및 댓글 CRUD
- **보안 및 접근 제어**: Bcrypt 단방향 암호화, 타인 게시글·댓글 제어 시 비인가 접근 차단

---

## 실행 가이드

### 1. 패키지 설치 및 DB 초기화
```bash
# 의존성 일괄 설치
npm run install:all

# MySQL 데이터베이스 및 테이블 초기화
mysql -u root -p < schema.sql
```

### 2. 서버 실행
```bash
# 웹 서버 실행 (http://localhost:50005)
npm run start:web
```
