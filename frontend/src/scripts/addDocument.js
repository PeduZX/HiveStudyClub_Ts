function btnCliclick() {
  let btnClick = document.getElementById("btn-add-document");
  let inputAddDocument = document.getElementById("input-add-document");
  let inputSubmit = document.getElementById("input-submit");

  btnClick.classList.toggle("active");

  if (btnClick.classList.contains("active")) {
    inputAddDocument.style.display = "inline";
    inputAddDocument.style.padding = "1rem";
  } else {
    inputAddDocument.style.display = "none";
    inputAddDocument.style.padding = "0";
  }

  inputAddDocument.addEventListener("change", function () {
    if (inputAddDocument.files.length > 0) {
      
      const nomeArquivo = inputAddDocument.files[0].name;
      inputSubmit.value = ` ${nomeArquivo}`;
    }
  });
}
