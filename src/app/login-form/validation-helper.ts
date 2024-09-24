export class ValidationHelper {

  public static getInputSmallTextElement(inputEl: HTMLInputElement): HTMLElement {
    const labelEl = inputEl.closest("label") as HTMLLabelElement;
    return labelEl.querySelector(
      ".invalid-text"
    ) as HTMLElement
  }

  public static setInputRequiredState(inputEl: HTMLInputElement, invalidInputSmallText: HTMLElement): void {

    invalidInputSmallText.textContent = "Required field!";
    inputEl.setAttribute('aria-invalid', 'true');
    inputEl.setAttribute('aria-describedby', invalidInputSmallText.id);
  }

  public static setInputPatternMismatchState(inputEl: HTMLInputElement, invalidInputSmallText: HTMLElement): void {

    invalidInputSmallText.textContent = "Wrong email format!";
    inputEl.setAttribute('aria-invalid', 'true');
    inputEl.setAttribute('aria-describedby', invalidInputSmallText.id);
  }

  public static setInputTooShortValueState(inputEl: HTMLInputElement, invalidInputSmallText: HTMLElement): void {

    invalidInputSmallText.textContent = "Password must be at least 6 digits long!";
    inputEl.setAttribute('aria-invalid', 'true');
    inputEl.setAttribute('aria-describedby', invalidInputSmallText.id);
  }

  public static setInputPasswordMismatchState(inputEl: HTMLInputElement): void {

    const invalidInputSmallText = ValidationHelper.getInputSmallTextElement(inputEl);
    invalidInputSmallText.textContent = "Confirmation password must match the password!";

    inputEl.setAttribute('aria-invalid', 'true');
    inputEl.setAttribute('aria-describedby', invalidInputSmallText.id);
    inputEl.setCustomValidity('valuesNotMatch');
  }

  public static setInputValidState(inputEl: HTMLInputElement): void {
    const invalidInputSmallText = ValidationHelper.getInputSmallTextElement(inputEl);

    invalidInputSmallText.textContent = "";

    inputEl.setAttribute('aria-invalid', 'false');
    inputEl.removeAttribute('aria-describedby');
    inputEl.setCustomValidity('');
  }
}
