# 📌 팀 프로젝트 그라운드 룰 (Ground Rules)

팀원 간 일관된 개발 스타일과 원활한 협업을 위해 아래 규칙을 준수합니다.

---

## 1. 🏷️ 명명 규칙 (Naming Convention)

### Backend (Java)
- **camelCase** 사용
- 예시:
  ```java
  productName
  createdAt
  orderStatus
  ```

### Database (DB)
- **snake_case** 사용
- 예시:
  ```sql
  product_name
  created_at
  order_status
  ```

---

## 2. 🌐 URL 및 라우팅 구조

### Backend API
- 모든 API 경로는 **`/api`** 로 시작
- 예시:
  ```text
  /api/products
  /api/orders
  /api/cart
  ```

### Frontend Routing
- 일반 사용자 화면 경로는 **`/`** 로 시작
- 예시:
  ```text
  /products
  /orders
  /cart
  ```

---

## 3. 🏗️ 프로젝트 아키텍처 및 패키지 구조

### 기본 구조
- 패키지는 **도메인 기반 (Domain-driven)** 으로 구성

예시:

```text
domain/
 ├─ user/
 ├─ product/
 ├─ order/
 ├─ quote/
```

### 공통(Global) 요소 분리
다음과 같은 공통 요소는 도메인 밖에서 관리

- Exception Handler
- Security
- Config
- Util
- Constants

예시:

```text
global/
 ├─ config/
 ├─ security/
 ├─ exception/
 └─ util/
```

---

## 4. 🤝 팀 협업 및 소통 규칙

### 공용 변경 사항 공유 필수
다음 항목 변경 시 **반드시 카카오톡 단톡방에 공유 후 반영**

- 공용 DB Schema 변경
- 공통 코드 수정
- API 스펙 변경
- 공통 Enum 변경

예시 공유 방식:

```text
[공유]
- orders 테이블 status 컬럼 추가
- enum ORDER_STATUS에 CANCELED 추가
- backend pull 받아주세요
```

---

## 5. 🌱 Git 협업 규칙

### Commit Message Convention

```text
feat     : 기능 추가
fix      : 버그 수정
refactor : 리팩토링
docs     : 문서 수정
style    : 포맷팅
chore    : 기타 설정
```

예시:

```bash
feat: 장바구니 상품 추가 API 구현
fix: 주문 상태 enum 매핑 오류 수정
docs: ground rules 문서 추가
```

---

## 6. ⚠️ 기타

- main 브랜치 직접 push 지양
- PR 또는 팀원 공유 후 merge
- 공용 DB 데이터 삭제/DDL 변경 시 반드시 공유