import { Directive, ElementRef, HostListener  } from '@angular/core';

@Directive({
  selector: '[appAllCapInput]'
})
export class AllCapInputDirective {

    @HostListener('input', ['$event'])
    onInputChange(event: KeyboardEvent) {
      const input = event.target as HTMLInputElement;
      const sanitized = input.value.toUpperCase();
      input.value = sanitized;
    }

}
