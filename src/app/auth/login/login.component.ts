import { Component, OnInit } from '@angular/core';
import { FormGroup,  FormBuilder,  Validators, AbstractControl } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  submitted: boolean = false;
  logo_img:string=environment.img_url+'company-logo.png'
  
  constructor(private fb: FormBuilder) {
    this.createForm();
  }
  
  createForm() {
    this.loginForm = this.fb.group({
      financial_year: ['', Validators.required ],
      user_code: ['', Validators.required ],
      password: ['', Validators.required ],
      company: ['', Validators.required ],
      location: ['', Validators.required ]
    });
  }

  ngOnInit(): void {
  }

  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    console.log(JSON.stringify(this.loginForm.value, null, 2));
  }

  onReset(): void {
    this.submitted = false;
    this.loginForm.reset();
  }

}
