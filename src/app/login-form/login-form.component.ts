import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {combineLatest, debounceTime, fromEvent, map, Observable} from "rxjs";
import {ValidationHelper} from "./validation-helper";

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent implements OnInit {

  infoMessage = '';
  emailRegexp = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).source;

  emailInput: HTMLInputElement = {} as HTMLInputElement;
  emailChange$: Observable<InputEvent> = new Observable<InputEvent>();

  passwordInput: HTMLInputElement = {} as HTMLInputElement;
  passwordChange$: Observable<InputEvent> = new Observable<InputEvent>();

  confirmPasswordInput: HTMLInputElement = {} as HTMLInputElement;
  confirmPasswordChange$: Observable<InputEvent> = new Observable<InputEvent>();

  submitButton: HTMLButtonElement = {} as HTMLButtonElement;
  submit$: Observable<MouseEvent> = new Observable<MouseEvent>();

  resetButton: HTMLButtonElement = {} as HTMLButtonElement;
  reset$: Observable<MouseEvent> = new Observable<MouseEvent>();

  formValidityChange$: Observable<InputEvent[]> = new Observable<InputEvent[]>();

  touchedInputsSet: Set<string> = new Set<string>();

  ngOnInit(): void {
    this.initHTMLElements();

    this.initObservables();

    this.initValueChangeSubscription();

    this.submit$.subscribe(() => {
      const email = this.emailInput.value;
      const password = this.passwordInput.value;
      const passwordConfirm = this.confirmPasswordInput.value;

      console.log("Form data: ", {email, password, passwordConfirm});

      this.infoMessage = 'Sending data...';
      setTimeout(() => this.infoMessage = '', 4000);

      this.resetForm();
    });

    this.reset$.subscribe(() => {
      this.resetForm();
    });

  }

  private initHTMLElements(): void {
    this.emailInput = document.getElementById("email") as HTMLInputElement;
    this.passwordInput = document.getElementById("password") as HTMLInputElement;
    this.confirmPasswordInput = document.getElementById("confirm_password") as HTMLInputElement;
    this.submitButton = document.getElementById("submit_btn") as HTMLButtonElement;
    this.resetButton = document.getElementById("reset_btn") as HTMLButtonElement;
  }

  private initObservables(): void {
    this.emailChange$ = fromEvent<InputEvent>(this.emailInput, "input");
    this.passwordChange$ = fromEvent<InputEvent>(this.passwordInput, "input");
    this.confirmPasswordChange$ = fromEvent<InputEvent>(this.confirmPasswordInput, "input");
    this.submit$ = fromEvent<MouseEvent>(this.submitButton, "click");
    this.reset$ = fromEvent<MouseEvent>(this.resetButton, "click");
  }

  private initValueChangeSubscription(): void {
    this.emailChange$
      .subscribe(email => {
        this.storeInputTouchedState(this.emailInput);
        this.validateEmailInput();
      });

    this.passwordChange$
      .subscribe(password => {
        this.storeInputTouchedState(this.passwordInput);
        this.validatePasswordInput();
      });

    this.confirmPasswordChange$
      .subscribe(confirmPassword => {
        this.storeInputTouchedState(this.confirmPasswordInput);
        this.validateConfirmPasswordInput();
      });

    this.formValidityChange$ = combineLatest([this.emailChange$, this.passwordChange$, this.confirmPasswordChange$]);

    // Subscribe to form changes & manage button behaviour
    this.formValidityChange$
      .pipe(
        debounceTime(300),
        map(
          ([emailEvent,
             passwordEvent,
             confirmPasswordEvent]) =>
            [emailEvent.target, passwordEvent.target, confirmPasswordEvent.target] as [
              HTMLInputElement,
              HTMLInputElement,
              HTMLInputElement
            ]
        ),
        map(
          ([emailInput, passwordInput, confirmPasswordInput]) => {
            // return form validity state
            return emailInput.validity.valid && passwordInput.validity.valid && confirmPasswordInput.validity.valid;
          }
        )
      )
      .subscribe((formIsValid: boolean) => {
        // manage buttons state
        if (this.touchedInputsSet.size) this.resetButton.removeAttribute("disabled");

        if (formIsValid) {
          this.submitButton.removeAttribute("disabled");
        } else {
          this.submitButton.setAttribute("disabled", "true");
        }
      });
  }

  resetForm() {
    // reset form to clear all values
    const form = document.getElementById("login_form") as HTMLFormElement;
    form.reset();
    this.touchedInputsSet.clear();

    // manually restore all input validations to initial state
    ValidationHelper.setInputValidState(this.emailInput);
    this.emailInput.removeAttribute('aria-invalid');

    ValidationHelper.setInputValidState(this.passwordInput);
    this.passwordInput.removeAttribute('aria-invalid');

    ValidationHelper.setInputValidState(this.confirmPasswordInput);
    this.confirmPasswordInput.removeAttribute('aria-invalid');

    // disable buttons
    this.resetButton.setAttribute("disabled", "true");
    this.submitButton.setAttribute("disabled", "true");
  }

  private storeInputTouchedState(input: HTMLInputElement) {
    // check input touched & update touchedInputsSet
    if (input.value === input.defaultValue) {
      this.touchedInputsSet.delete(input.id);
    } else {
      this.touchedInputsSet.add(input.id);
    }
  }

  private validateEmailInput() {
    const invalidInputSmallText = ValidationHelper.getInputSmallTextElement(this.emailInput);

    // check for required validation & set invalid input state
    if (this.emailInput.validity.valueMissing) {
      ValidationHelper.setInputRequiredState(this.emailInput, invalidInputSmallText);
      return;
    }

    // check for pattern validation & set invalid input state
    if (this.emailInput.validity.patternMismatch) {
      ValidationHelper.setInputPatternMismatchState(this.emailInput, invalidInputSmallText);
      return;
    }

    // set valid input state if all checks passed
    if (this.emailInput.validity.valid) {
      ValidationHelper.setInputValidState(this.emailInput);
    }
  }

  private validatePasswordInput() {
    const invalidInputSmallText = ValidationHelper.getInputSmallTextElement(this.passwordInput);

    // check for required validation & set invalid input state
    if (this.passwordInput.validity.valueMissing) {
      ValidationHelper.setInputRequiredState(this.passwordInput, invalidInputSmallText);
      return;
    }

    // check for min length validation & set invalid input state
    if (this.passwordInput.validity.tooShort) {
      ValidationHelper.setInputTooShortValueState(this.passwordInput, invalidInputSmallText)
      return;
    }

    // check for passwords equality & set invalid state for both password inputs
    if (this.passwordInput.value && this.confirmPasswordInput.value) {
      this.checkPasswordsNotEqual();
    }

    // set valid input state if all checks passed
    if (this.passwordInput.validity.valid) {
      this.passwordInput.setCustomValidity('');
      ValidationHelper.setInputValidState(this.passwordInput);
    }
  }

  private validateConfirmPasswordInput() {
    const invalidInputSmallText = ValidationHelper.getInputSmallTextElement(this.confirmPasswordInput);

    // check for required validation & set invalid input state
    if (this.confirmPasswordInput.validity.valueMissing) {
      ValidationHelper.setInputRequiredState(this.confirmPasswordInput, invalidInputSmallText);
      return;
    }

    // check for min length validation & set invalid input state
    if (this.confirmPasswordInput.validity.tooShort) {
      ValidationHelper.setInputTooShortValueState(this.confirmPasswordInput, invalidInputSmallText)
      return;
    }

    // check for passwords equality & set invalid state for both password inputs
    if (this.confirmPasswordInput.value && this.passwordInput.value) {
      this.checkPasswordsNotEqual();
    }

    // set valid input state if all checks passed
    if (this.confirmPasswordInput.validity.valid) {
      this.confirmPasswordInput.setCustomValidity('');
      ValidationHelper.setInputValidState(this.confirmPasswordInput);
    }
  }

  private checkPasswordsNotEqual(): void {

    if (this.passwordInput.value !== this.confirmPasswordInput.value) {
      ValidationHelper.setInputPasswordMismatchState(this.passwordInput);
      ValidationHelper.setInputPasswordMismatchState(this.confirmPasswordInput);
    } else {
      ValidationHelper.setInputValidState(this.passwordInput);
      ValidationHelper.setInputValidState(this.confirmPasswordInput);
    }
  }

}
