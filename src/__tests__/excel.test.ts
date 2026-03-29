import { describe, expect, it } from 'vitest';
import {
  createWorkbookBuffer,
  isSupportedExcelFileName,
  readFirstWorksheetRows,
} from '@/lib/excel';

describe('excel helpers', () => {
  it('writes and reads xlsx rows consistently', async () => {
    const buffer = await createWorkbookBuffer([
      {
        name: '产品数据',
        columns: [
          { header: '产品名称', key: '产品名称', width: 20 },
          { header: '价格', key: '价格', width: 12 },
          { header: '库存', key: '库存', width: 10 },
        ],
        rows: [
          {
            '产品名称': '示例产品',
            '价格': 12.5,
            '库存': 8,
          },
        ],
      },
    ]);

    const rows = await readFirstWorksheetRows(buffer);

    expect(rows).toEqual([
      {
        '产品名称': '示例产品',
        '价格': 12.5,
        '库存': 8,
      },
    ]);
  });

  it('only treats .xlsx as a supported excel upload', () => {
    expect(isSupportedExcelFileName('products.xlsx')).toBe(true);
    expect(isSupportedExcelFileName('products.xls')).toBe(false);
    expect(isSupportedExcelFileName('products.csv')).toBe(false);
  });
});
