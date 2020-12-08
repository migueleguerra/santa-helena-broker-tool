const MIN_PERCENTAGE = 20;

// Used for computing numbers in the form
let financialProjection;

function populateSlots() {
  const lotesSelector = getField("lotes");

  // lotes is defined in data/lotes.json
  for (let lote of lotes) {
    const option = document.createElement("option");
    option.value = JSON.stringify(lote);
    option.innerHTML = lote.unit;
    lotesSelector.appendChild(option);
  }

  lotesSelector.dispatchEvent(new Event("change"));
}

document.addEventListener("DOMContentLoaded", () => {
  financialProjection = new FinancialProjection();
  populateSlots();
});

function onSlotChange(lote) {
  financialProjection.lote = JSON.parse(lote);

  getField("total_area").innerHTML = numberToCurrency(
    financialProjection.lote.total_area
  );
  getField("price").innerHTML = numberToCurrency(
    financialProjection.lote.price
  );
  getField("m2-price").innerHTML = numberToCurrency(
    financialProjection.lote.m2_price
  );
  getField("front").innerHTML = financialProjection.lote.front;
  getField("deep").innerHTML = financialProjection.lote.deep;
  getField("status").innerHTML = financialProjection.lote.status;

  disableFields(financialProjection.lote.status);
  financialProjection.compute();
}

function disableFields(status) {
  const statusSold = "Vendido";
  const statusSeparated = "Separado";
  const bar = "-";
  const isDisabled =
    status === statusSold || status === bar || status === statusSeparated;

  getField("status").style =
    status === statusSold ? "color: darkred" : "color: #44392D";
  getField("status").style =
    status === statusSeparated ? "color: darkblue" : "color: #44392D";

  getField("down-payment-percentage").disabled = isDisabled ? true : false;
  getField("down-payment-price").disabled = isDisabled ? true : false;
  getField("monthly-percentage").disabled = isDisabled ? true : false;
  getField("monthly-price").disabled = isDisabled ? true : false;
  getField("monthly-payments-price").disabled = isDisabled ? true : false;
  //getField("btn-pdf").disabled = isDisabled ? true : false;
  getField("btn-clean").disabled = isDisabled ? true : false;
}

function onDownPaymentPercentageBlur() {
  getField(
    "down-payment-percentage"
  ).value = financialProjection.validatePercentage(
    getField("down-payment-percentage").value,
    10,
    100
  );

  const min =
    getField("down-payment-percentage").value - MIN_PERCENTAGE >= 0
      ? 0
      : MIN_PERCENTAGE - getField("down-payment-percentage").value;

  getField("monthly-percentage").value = financialProjection.validatePercentage(
    getField("monthly-percentage").value,
    min,
    100 - getField("down-payment-percentage").value
  );

  evaluateForm();
}

function onDownPaymentPriceBlur() {
  const downPaymentPrice = getFieldValueAsNumber("down-payment-price");
  financialProjection.downPaymentPrice = downPaymentPrice;
  getField("down-payment-percentage").value =
    (100 * downPaymentPrice) / financialProjection.lote.price;

  onDownPaymentPercentageBlur();
}

function onMonthlyPercentageBlur() {
  getField("monthly-percentage").value = financialProjection.validatePercentage(
    getField("monthly-percentage").value,
    0,
    90
  );

  const min =
    Number(getField("monthly-percentage").value) +
      Number(getField("down-payment-percentage").value) >=
    MIN_PERCENTAGE
      ? 0
      : MIN_PERCENTAGE - getField("monthly-percentage").value;

  getField(
    "down-payment-percentage"
  ).value = financialProjection.validatePercentage(
    getField("down-payment-percentage").value,
    min,
    100 - getField("monthly-percentage").value
  );

  evaluateForm();
}

function onMonthlyPriceBlur() {
  getField("monthly-percentage").value =
    (100 * getFieldValueAsNumber("monthly-price")) /
    financialProjection.lote.price;

  onMonthlyPercentageBlur();
}

function onMonthlyPaymentsPriceBlur() {
  getField("monthly-price").value =
    getFieldValueAsNumber("monthly-payments-price") *
    getFieldValueAsNumber("monthly-payments");

  onMonthlyPriceBlur();
}

function evaluateForm() {
  financialProjection.evaluateForm(
    Number(getField("down-payment-percentage").value),
    Number(getField("monthly-percentage").value)
  );
}
