export class FileDownloader {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static exportAsJson(data: any, fileName: string): void {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data),
    )}`;
    this.downloadAsFile(
      dataStr,
      fileName.endsWith('.json') ? fileName : `${fileName}.json`,
    );
  }

  private static downloadAsFile(
    data: string,
    fileNameWithEnding: string,
  ): void {
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.style.display = 'none';
    dlAnchorElem.setAttribute('href', data);
    dlAnchorElem.setAttribute('download', fileNameWithEnding);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    document.body.removeChild(dlAnchorElem);
  }
}
