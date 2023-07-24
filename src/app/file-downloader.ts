export class FileDownloader {
  static exportAsJson(data: any, fileName: string): void {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data)
    )}`;
    this.downloadAsFile(
      dataStr,
      fileName.endsWith('.json') ? fileName : `${fileName}.json`
    );
  }

  static exportAsCsv(data: any, fileName: string): void {
    const dataStr = `data:text/csv;charset=utf-8,${this.toCsv(data)}`;
    this.downloadAsFile(
      dataStr,
      fileName.endsWith('.csv') ? fileName : `${fileName}.csv`
    );
  }

  private static downloadAsFile(
    data: string,
    fileNameWithEnding: string
  ): void {
    const dlAnchorElem = document.getElementById('downloadAnchorElem');
    if (!dlAnchorElem) throw Error('Download element not found');
    dlAnchorElem.setAttribute('href', data);
    dlAnchorElem.setAttribute('download', fileNameWithEnding);
    dlAnchorElem.click();
  }

  private static toCsv(data: any): string {
    const csvRows = [];

    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }
}
