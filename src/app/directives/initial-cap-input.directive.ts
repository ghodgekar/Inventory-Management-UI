import { Directive, ElementRef, HostListener  } from '@angular/core';

@Directive({
  selector: '[appInitialCapInput]'
})
export class InitialCapInputDirective {

  @HostListener('input', ['$event'])
  onInputChange(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\b\w/g, first => first.toLocaleUpperCase());
    input.value = sanitized;
  }

}
