type ComparisonOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte";

type OrderDirection = "asc" | "desc";

type BuiltQuery = {
  query: `SELECT ${string} FROM ${string}`;
  params: unknown[];
};

export class QueryBuilder<
  T extends object,
  Selected extends keyof T & string = keyof T & string,
> {
  private selectedFields: Selected[] | null = null;
  private readonly filters: Array<{
    field: string;
    operator: ComparisonOperator;
    value: unknown;
  }> = [];
  private ordering: { field: string; direction: OrderDirection } | null = null;
  private limitCount: number | null = null;

  select<K extends keyof T & string>(
    ...fields: readonly K[]
  ): QueryBuilder<T, K> {
    const next = new QueryBuilder<T, K>();
    next.selectedFields = [...fields];
    next.filters.push(...this.filters);
    next.ordering = this.ordering;
    next.limitCount = this.limitCount;
    return next;
  }

  where<K extends Selected>(
    field: K,
    operator: ComparisonOperator,
    value: T[K],
  ): this {
    this.filters.push({
      field,
      operator,
      value,
    });
    return this;
  }

  orderBy<K extends Selected>(field: K, direction: OrderDirection): this {
    this.ordering = { field, direction };
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  build(): BuiltQuery {
    const columns =
      this.selectedFields && this.selectedFields.length > 0
        ? this.selectedFields.join(", ")
        : "*";

    const params: unknown[] = [];
    const clauses = this.filters.map((filter) => {
      params.push(filter.value);
      return `${filter.field} ${sqlOperator(filter.operator)} $${params.length}`;
    });

    const whereClause =
      clauses.length > 0 ? ` WHERE ${clauses.join(" AND ")}` : "";
    const orderClause = this.ordering
      ? ` ORDER BY ${this.ordering.field} ${this.ordering.direction.toUpperCase()}`
      : "";
    const limitClause =
      this.limitCount === null
        ? ""
        : (() => {
            params.push(this.limitCount);
            return ` LIMIT $${params.length}`;
          })();

    const query: BuiltQuery["query"] =
      `SELECT ${columns} FROM jobs${whereClause}${orderClause}${limitClause}`;

    return { query, params };
  }
}

function sqlOperator(operator: ComparisonOperator): string {
  switch (operator) {
    case "eq":
      return "=";
    case "neq":
      return "<>";
    case "gt":
      return ">";
    case "gte":
      return ">=";
    case "lt":
      return "<";
    case "lte":
      return "<=";
  }
}
