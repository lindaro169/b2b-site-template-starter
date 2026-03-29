type ExcelScalar = string | number | boolean | null;

type ExcelJsWorksheet = {
  columns?: Array<{ header?: string; key?: string; width?: number }>;
  addRows(rows: Array<Record<string, ExcelScalar>>): void;
  eachRow(callback: (row: ExcelJsRow, rowNumber: number) => void): void;
  getRow(index: number): ExcelJsRow;
};

type ExcelJsRow = {
  eachCell(
    options: { includeEmpty: boolean },
    callback: (cell: { value: unknown }, colNumber: number) => void
  ): void;
  getCell(index: number): { value: unknown };
};

type ExcelJsWorkbook = {
  worksheets: ExcelJsWorksheet[];
  addWorksheet(name: string): ExcelJsWorksheet;
  xlsx: {
    load(data: Buffer | Uint8Array | ArrayBuffer): Promise<void>;
    writeBuffer(): Promise<Buffer | Uint8Array | ArrayBuffer>;
  };
};

type ExcelJsModule = {
  Workbook: new () => ExcelJsWorkbook;
};

export const SUPPORTED_EXCEL_EXTENSIONS = ['.xlsx'] as const;

let excelJsModule: ExcelJsModule | null = null;

async function getExcelJs(): Promise<ExcelJsModule> {
  if (!excelJsModule) {
    const mod = await import('exceljs');
    excelJsModule =
      ((mod as unknown as { default?: ExcelJsModule }).default ??
        (mod as unknown as ExcelJsModule));
  }

  return excelJsModule;
}

function toBuffer(input: Buffer | Uint8Array | ArrayBuffer): Buffer {
  if (Buffer.isBuffer(input)) {
    return input;
  }

  if (input instanceof Uint8Array) {
    return Buffer.from(input);
  }

  return Buffer.from(input);
}

function normalizeExcelCellValue(value: unknown): string | number | boolean | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    const richTextValue = value as {
      text?: string;
      hyperlink?: string;
      richText?: Array<{ text?: string }>;
      result?: unknown;
      formula?: string;
    };

    if (Array.isArray(richTextValue.richText)) {
      return richTextValue.richText.map((item) => item.text || '').join('');
    }

    if (typeof richTextValue.text === 'string' && richTextValue.text.trim().length > 0) {
      return richTextValue.text;
    }

    if (typeof richTextValue.hyperlink === 'string') {
      return richTextValue.text || richTextValue.hyperlink;
    }

    if ('result' in richTextValue) {
      return normalizeExcelCellValue(richTextValue.result);
    }
  }

  return String(value);
}

export function isSupportedExcelFileName(fileName: string): boolean {
  const normalizedFileName = fileName.trim().toLowerCase();
  return SUPPORTED_EXCEL_EXTENSIONS.some((extension) => normalizedFileName.endsWith(extension));
}

export async function readFirstWorksheetRows(
  input: Buffer | Uint8Array | ArrayBuffer
): Promise<Array<Record<string, unknown>>> {
  const ExcelJS = await getExcelJs();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(toBuffer(input));

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return [];
  }

  const headerRow = worksheet.getRow(1);
  const headers = new Map<number, string>();

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const header = normalizeExcelCellValue(cell.value);
    const normalizedHeader = typeof header === 'string' ? header.trim() : String(header ?? '').trim();

    if (normalizedHeader) {
      headers.set(colNumber, normalizedHeader);
    }
  });

  const rows: Array<Record<string, unknown>> = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const record: Record<string, unknown> = {};
    let hasValues = false;

    for (const [colNumber, header] of headers.entries()) {
      const normalizedValue = normalizeExcelCellValue(row.getCell(colNumber).value);

      if (
        normalizedValue !== undefined &&
        !(typeof normalizedValue === 'string' && normalizedValue.trim().length === 0)
      ) {
        hasValues = true;
      }

      record[header] = normalizedValue ?? '';
    }

    if (hasValues) {
      rows.push(record);
    }
  });

  return rows;
}

export interface ExcelSheetColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelSheetDefinition {
  name: string;
  columns: ExcelSheetColumn[];
  rows: Array<Record<string, ExcelScalar>>;
}

export async function createWorkbookBuffer(
  sheets: ExcelSheetDefinition[]
): Promise<Buffer> {
  const ExcelJS = await getExcelJs();
  const workbook = new ExcelJS.Workbook();

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(sheet.name);
    worksheet.columns = sheet.columns.map((column) => ({
      header: column.header,
      key: column.key,
      width: column.width,
    }));
    worksheet.addRows(sheet.rows);
  }

  const output = await workbook.xlsx.writeBuffer();
  return toBuffer(output);
}
