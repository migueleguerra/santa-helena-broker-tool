const SH_PASSWORD = "carza2020";

function cleanForm() {
  financialProjection.resetValues();

  let slotSelector = getField("lotes");
  slotSelector.value = JSON.stringify(
    lotes[slotSelector.options.selectedIndex]
  );

  slotSelector.dispatchEvent(new Event("change"));
}

function enter() {
  const password = getField("password-enter").value;

  if (password !== undefined && password != "" && password === SH_PASSWORD) {
    setDate();
    getField("broker").textContent = getField("broker-enter").value;
    getField("client").textContent = getField("client-enter").value;
    getField("email").textContent = getField("email-enter").value;
    getField("tel").textContent = getField("tel-enter").value;

    getField("popup").style = "visibility: hidden";
    return;
  }

  showErrorMsg("La contraseña es incorrecta.");
}

function showMap() {
  window.location.href = "#popup-map";
}
