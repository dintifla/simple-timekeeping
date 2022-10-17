export function showSnackbar(text: string) {
  const snackbar = document.getElementById("snackbar");
  if (!snackbar) throw Error("Snackbar not found");
  snackbar.innerText = text;

  snackbar.className = "show";

  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
}
