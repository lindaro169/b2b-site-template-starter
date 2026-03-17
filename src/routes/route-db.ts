export type RouteRow = Record<string, unknown>;

export type SelectQuery<T extends RouteRow = RouteRow> = Promise<T[]> & {
  where(condition: unknown): SelectQuery<T>;
  limit(count: number): Promise<T[]>;
};

export interface RouteDb<T extends RouteRow = RouteRow> {
  select(): { from(table: unknown): SelectQuery<T> };
  insert(table: unknown): {
    values(values: RouteRow | RouteRow[]): {
      returning(): Promise<T[]>;
    };
  };
  update(table: unknown): {
    set(values: RouteRow): {
      where(condition: unknown): {
        returning(): Promise<T[]>;
      };
    };
  };
  delete(table: unknown): {
    where(condition: unknown): {
      returning(): Promise<T[]>;
    };
  };
}
