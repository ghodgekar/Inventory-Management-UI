import { Directive, ElementRef, HostListener  } from '@angular/core';

@Directive({
  selector: '[appSkipSpecialCharInput]'
})
export class SkipSpecialCharInputDirective {

    @HostListener('input', ['$event'])
    onInputChange(event: KeyboardEvent) {
      const input = event.target as HTMLInputElement;
      const sanitized = input.value.replace(/[^[a-zA-Z0-9_-]]*/g, '');
      input.value = sanitized;
    }

}
