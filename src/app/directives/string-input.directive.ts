import { Directive, ElementRef, HostListener  } from '@angular/core';

@Directive({
  selector: '[appStringInput]'
})
export class StringInputDirective {

    @HostListener('input', ['$event'])
    onInputChange(event: KeyboardEvent) {
      const input = event.target as HTMLInputElement;
      const sanitized = input.value.replace(/[^a-zA-Z]*/g, '');
      input.value = sanitized;
    }
  
    // @HostListener('paste', ['$event'])
    // onPaste(event: ClipboardEvent) {
    //   event.preventDefault();
    //   const input = event.target as HTMLInputElement;
    //   input.value = '';
    // }

}
