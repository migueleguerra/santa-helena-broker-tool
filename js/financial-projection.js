const MONTHLY_PAYMENTS = 11;
const ANNUAL_INTEREST_RATE_UNDER_80 = 0.045 / 12;
const ANNUAL_INTEREST_RATE_OVER_OR_EQUAL_80 = 0.055 / 12;

class FinancialProjection {
  constructor() {
    this.lote = {};

    this.resetValues();
    this.setFields();
  }

  validatePercentage(percentage, min, max) {
    if (percentage < min) {
      return min;
    } else if (percentage > max) {
      return max;
    }

    return percentage;
  }

  evaluateForm(newDownPaymentPercentage, newMonthlyPercentage) {
    let letsCompute = false;

    if (
      roundDecimals(newDownPaymentPercentage) !=
      this.downPaymentPercentageRounded
    ) {
      this.downPaymentPercentage = newDownPaymentPercentage;
      letsCompute = true;
    }

    if (roundDecimals(newMonthlyPercentage) != this.monthlyPercentageRounded) {
      this.monthlyPercentage = newMonthlyPercentage;
      letsCompute = true;
    }

    if (letsCompute) {
      financialProjection.compute();
    } else {
      this.setFields();
    }
  }

  compute() {
    if (this.lote.unit == 0) {
      this.resetValues();
    }

    // Descuento
    this.discountPercentage =
      Number(
        this.calculateDiscountPercentage(
          this.lote.price,
          this.downPaymentPercentage / 100,
          this.monthlyPercentage / 100
        )
      ) + 2 || 0;
    this.discountPrice = this.getPrice(this.discountPercentage);

    // Enganche
    this.downPaymentPrice =
      (this.lote.price - this.discountPrice) *
      (this.downPaymentPercentage / 100);

    // Mensualidad
    this.monthlyPrice =
      (this.lote.price - this.discountPrice) * (this.monthlyPercentage / 100);

    // Mensualidades
    this.monthlyPaymentPrice =
      this.monthlyPrice == 0 ? 0 : this.monthlyPrice / this.monthlyPayment;

    // Escrituración
    this.deedPercentage =
      100 - (this.downPaymentPercentage + this.monthlyPercentage);
    this.deedPrice =
      this.lote.price -
      this.discountPrice -
      (this.downPaymentPrice + this.monthlyPrice);

    // Precio final
    this.finalPrice = this.lote.price - this.discountPrice;

    // Precio m2 final
    this.finalM2Price =
      this.lote.m2_price - this.lote.m2_price * (this.discountPercentage / 100);

    displayDownPaymentTable(this.monthlyPrice, this.monthlyPaymentPrice);

    this.calculateRoundedPercentages();
    this.setFields();
  }

  calculateRoundedPercentages() {
    this.downPaymentPercentageRounded = roundDecimals(
      this.downPaymentPercentage
    );
    this.monthlyPercentageRounded = roundDecimals(this.monthlyPercentage);
    this.deedPercentageRounded = roundDecimals(this.deedPercentage);
    this.discountPercentageRounded = roundDecimals(this.discountPercentage);
  }

  setFields() {
    getField("down-payment-percentage").value = numberWithCommas(
      this.downPaymentPercentageRounded
    );
    getField("down-payment-price").value = numberToCurrency(
      this.downPaymentPrice
    );

    getField("monthly-percentage").value = numberWithCommas(
      this.monthlyPercentageRounded
    );
    getField("monthly-price").value = numberToCurrency(this.monthlyPrice);

    getField("monthly-payments-price").value = numberToCurrency(
      this.monthlyPaymentPrice
    );

    getField("deed-percentage").value = numberWithCommas(
      this.deedPercentageRounded
    );
    getField("deed-price").value = numberToCurrency(this.deedPrice);

    getField("discount-percentage").value = numberWithCommas(
      this.discountPercentageRounded
    );
    getField("discount-price").value = numberToCurrency(this.discountPrice);

    getField("final-price").value = numberToCurrency(this.finalPrice);
    getField("final-m2-price").value = numberToCurrency(this.finalM2Price);
  }

  resetValues() {
    this.downPaymentPrice = 0;
    this.downPaymentPercentage = 10;
    this.downPaymentPercentageRounded = 0;

    this.monthlyPrice = 0;
    this.monthlyPercentage = 10;
    this.monthlyPercentageRounded = 0;

    this.monthlyPaymentPrice = 0;
    this.monthlyPayment = MONTHLY_PAYMENTS;

    this.deedPrice = 0;
    this.deedPercentage = 0;
    this.deedPercentageRounded = 0;

    this.discountPrice = 0;
    this.discountPercentage = 0;
    this.discountPercentageRounded = 0;

    this.finalPrice = 0;
    this.finalM2Price = 0;
  }

  calculateDiscountPercentage(
    unitValue,
    downPaymentPercentage,
    monthlyPercentage
  ) {
    const annualInterestRate =
      downPaymentPercentage + monthlyPercentage < 0.8
        ? ANNUAL_INTEREST_RATE_UNDER_80
        : ANNUAL_INTEREST_RATE_OVER_OR_EQUAL_80;

    const baseScenario = this.baseScenario(unitValue, annualInterestRate);
    const chosenScenario = this.chosenScenario(
      unitValue,
      downPaymentPercentage,
      monthlyPercentage,
      annualInterestRate
    );

    return (Math.abs(baseScenario - chosenScenario) / unitValue) * 100;
  }

  baseScenario(unitValue, annualInterestRate) {
    const downPaymentPercentage = 0.1;
    const monthlyPercentage = 0.1;
    const monthlyEquation = (unitValue * monthlyPercentage) / MONTHLY_PAYMENTS;

    let finalBalance = unitValue - unitValue * downPaymentPercentage;
    let initialBalance = unitValue;
    let monthlyInterest = 0;

    for (let i = 0; i <= MONTHLY_PAYMENTS; i++) {
      monthlyInterest +=
        ((initialBalance + finalBalance) / 2) * annualInterestRate;
      initialBalance = finalBalance;
      finalBalance = initialBalance - monthlyEquation;
    }

    return monthlyInterest;
  }

  chosenScenario(
    unitValue,
    downPaymentPercentage,
    monthlyPercentage,
    annualInterestRate
  ) {
    const monthlyDownPayment =
      (unitValue * monthlyPercentage) / MONTHLY_PAYMENTS;

    let initialBalance = unitValue;
    let finalBalance = initialBalance - initialBalance * downPaymentPercentage;
    let monthlyInterest = 0;

    for (let i = 0; i <= MONTHLY_PAYMENTS; i++) {
      monthlyInterest +=
        ((initialBalance + finalBalance) / 2) * annualInterestRate;
      initialBalance = finalBalance;
      finalBalance -= monthlyDownPayment;
    }

    return monthlyInterest;
  }

  getPrice(percentage) {
    return (percentage / 100) * this.lote.price;
  }
}
