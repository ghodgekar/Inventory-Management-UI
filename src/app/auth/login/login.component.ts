import { Component, OnInit } from '@angular/core';
import { FormGroup,  FormBuilder,  Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/master/login.service';
import { ParameterService } from 'src/app/services/master/parameter.service';
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
  
  constructor(private fb: FormBuilder, private parameterService: ParameterService, private loginService:LoginService, private route: Router) {
    this.createForm();
  }
  
  createForm() {
    this.loginForm = this.fb.group({
      financial_year: [''],
      user_code: ['', Validators.required ],
      user_pass: ['', Validators.required ],
      company: [''],
      location: ['' ]
    });
  }

  ngOnInit(): void {
    this.parameterService.codeList('DEF_COMP').subscribe((res:any) => {
      this.loginForm.patchValue({
        company: res.data[0].param_value
      })
    })
    this.parameterService.codeList('DEF_LOC').subscribe((res:any) => {
      this.loginForm.patchValue({
        location: res.data[0].param_value
      })
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loginService.login(this.loginForm.value).subscribe(res => {
      this.route.navigateByUrl('/dashboard')
    })
  }

  onReset(): void {
    this.submitted = false;
    this.loginForm.reset();
  }

}
