import ExcelJS from 'exceljs';
import { Result } from './result';
import templateUrl from '../assets/Rangliste_leer.xlsx';

// The template lays the three categories out side by side as 5-column blocks:
//   Rang | Startnummer | Name | Rennzeit | Rückstand
// Row 10 holds the block title ("Rangliste …") and the "Bergzeitfahren <year>"
// subtitle, row 12 the column headers, and data starts at row 13.
const DATA_START_ROW = 13;

// 1-based index of the first column ("Rang") of each category block.
const CATEGORY_START_COLUMN: { [category: string]: number } = {
  Male: 1, // A–E
  Female: 6, // F–J
  'E-Bike': 11, // K–O
};

// Cells holding the "Bergzeitfahren <year>" subtitle for each block.
const YEAR_TITLE_CELLS = ['D10', 'I10', 'N10'];

/** Maps a result to the five cell values written into a template block row. */
export function resultToRowValues(
  result: Result,
): [number | string, number, string, string | number, string] {
  return [
    result.rank,
    result.numberPlate,
    result.name,
    result.result,
    result.delay,
  ];
}

/** Replaces a four-digit year in the subtitle text with the given year. */
export function updateYearInTitle(value: string, year: number): string {
  return value.replace(/\d{4}/, String(year));
}

/**
 * Fills the Excel template with the calculated results per category, updates the
 * year in the title cells and triggers a download of `Rangliste_<year>.xlsx`.
 */
export async function exportRanglisteAsExcel(results: {
  [category: string]: Result[];
}): Promise<void> {
  const currentYear = new Date().getFullYear();

  const response = await fetch(templateUrl);
  const templateBuffer = await response.arrayBuffer();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(templateBuffer);
  const sheet = workbook.worksheets[0];

  for (const cellRef of YEAR_TITLE_CELLS) {
    const cell = sheet.getCell(cellRef);
    if (typeof cell.value === 'string') {
      cell.value = updateYearInTitle(cell.value, currentYear);
    }
  }

  for (const [category, categoryResults] of Object.entries(results)) {
    const startColumn = CATEGORY_START_COLUMN[category];
    if (startColumn === undefined) continue;

    categoryResults.forEach((result, index) => {
      const rowValues = resultToRowValues(result);
      rowValues.forEach((value, offset) => {
        sheet.getCell(DATA_START_ROW + index, startColumn + offset).value =
          value;
      });
    });
  }

  const outputBuffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([outputBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, `Rangliste_${currentYear}.xlsx`);
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
