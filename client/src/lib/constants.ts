export const DATABASE_DIALECTS = [
  { value: 'oracle', label: 'Oracle' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'sqlserver', label: 'SQL Server' },
  { value: 'mariadb', label: 'MariaDB' },
] as const;

export const EXAMPLE_QUERIES = [
  {
    text: "구매 금액이 가장 높은 상위 5명의 고객을 보여주세요",
    dialect: "oracle",
  },
  {
    text: "재고가 10개 미만인 모든 제품을 조회하세요",
    dialect: "oracle",
  },
  {
    text: "2023년 각 월별 평균 주문 금액을 구하세요",
    dialect: "oracle",
  },
  {
    text: "30일 이상 로그인하지 않은 사용자를 찾아주세요",
    dialect: "oracle",
  },
  {
    text: "제품 카테고리별 총 매출을 보여주세요",
    dialect: "oracle",
  },
] as const;

export const SAMPLE_SCHEMA = {
  tables: [
    {
      name: "users",
      columns: [
        { name: "id", type: "int", primary: true },
        { name: "email", type: "varchar(255)", unique: true },
        { name: "first_name", type: "varchar(100)" },
        { name: "last_name", type: "varchar(100)" },
        { name: "created_at", type: "timestamp" },
        { name: "updated_at", type: "timestamp" },
      ],
    },
    {
      name: "orders",
      columns: [
        { name: "id", type: "int", primary: true },
        { name: "user_id", type: "int", foreign: "users.id" },
        { name: "total_amount", type: "decimal(10,2)" },
        { name: "status", type: "varchar(50)" },
        { name: "created_at", type: "timestamp" },
      ],
    },
    {
      name: "products",
      columns: [
        { name: "id", type: "int", primary: true },
        { name: "name", type: "varchar(255)" },
        { name: "price", type: "decimal(10,2)" },
        { name: "inventory", type: "int" },
        { name: "category", type: "varchar(100)" },
      ],
    },
  ],
};

export const WEBSOCKET_MESSAGE_TYPES = {
  GENERATE_SQL: 'generate_sql',
  EXECUTE_QUERY: 'execute_query',
  EXPLAIN_SQL: 'explain_sql',
  SQL_GENERATED: 'sql_generated',
  QUERY_EXECUTED: 'query_executed',
  SQL_EXPLAINED: 'sql_explained',
  ERROR: 'error',
} as const;
