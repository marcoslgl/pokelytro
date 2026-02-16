import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-about',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  private fb = inject(FormBuilder);

  submitted = signal(false);

  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    reason: ['', Validators.required],
    urgency: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
    terms: [false, Validators.requiredTrue],
  });

  readonly ctrl = {
    name: this.contactForm.get('name')!,
    email: this.contactForm.get('email')!,
    reason: this.contactForm.get('reason')!,
    urgency: this.contactForm.get('urgency')!,
    message: this.contactForm.get('message')!,
    terms: this.contactForm.get('terms')!,
  };

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.submitted.set(true);
    this.contactForm.reset();
  }
}
