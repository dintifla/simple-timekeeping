export class HTMLFactory {
  public static makeButton(
    text: string,
    className: string,
    // eslint-disable-next-line no-unused-vars
    onclick: (e: Event) => void,
    id?: string
  ): HTMLButtonElement {
    const button = document.createElement("button");
    if (id) button.id = id;
    button.innerText = text;
    button.className = className;
    button.onclick = onclick;
    return button;
  }

  public static makeInvisibleDownloadElement(id: string): HTMLAnchorElement {
    const downloadElement = document.createElement("a");
    downloadElement.id = id;
    downloadElement.style.display = "none";
    return downloadElement;
  }

  public static makeTextInput(
    id: string,
    // eslint-disable-next-line no-unused-vars
    onchange: (e: Event) => void
  ): HTMLInputElement {
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.id = id;
    input.onchange = onchange;
    return input;
  }

  public static makeJsonFileInput(
    label: string,
    id: string,
    onchange?: () => void
  ): HTMLElement {
    const input = document.createElement("input");
    input.type = "file";
    input.id = id;
    input.accept = ".json";
    if (onchange) input.onchange = onchange;
    const inputLabel = document.createElement("label");
    inputLabel.innerText = label;
    inputLabel.htmlFor = input.id;
    const container = document.createElement("div");
    container.appendChild(inputLabel);
    container.appendChild(input);
    return container;
  }

  public static makeSelect(
    label: string,
    id: string,
    className: string,
    selectOptions: string[],
    onchange: () => void
  ): HTMLElement {
    const select = document.createElement("select");
    select.id = id;
    select.className = className;
    selectOptions.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.innerText = opt;
      select.appendChild(option);
    });
    select.onchange = onchange;
    const selectLabel = document.createElement("label");
    selectLabel.innerText = label;
    selectLabel.htmlFor = select.id;

    const container = document.createElement("div");
    container.appendChild(selectLabel);
    container.appendChild(select);
    return container;
  }
}
