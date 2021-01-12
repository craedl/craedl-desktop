import { ChangeDetectorRef } from '@angular/core';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { NgZone } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';

/**
 * Authenticate the user with their API token.
 */
@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss', '../app.component.scss']
})
export class AuthenticationComponent implements OnInit {

  /** Validation errors for display. */
  errors: { [key: string]: string };
  /** Authentication form. */
  form: FormGroup;
  /** Indicates if authentication response has been received. */
  recvResponse: boolean = false;
  /** Token length used for validation. */
  tokenLength: number = 40;

  /**
   * Constructor for AuthenticationComponent.
   */
  constructor(
    /** Change detector. */
    private cdf: ChangeDetectorRef,
    /** Form builder. */
    private formBuilder: FormBuilder,
    /** Application router. */
    private router: Router,
    /** Angular zone. */
    private zone: NgZone,
  ) { }

  /**
   * Initialize the form and attempt initial authentication.
   */
  ngOnInit(): void {
    this.authenticate();
    this.form = this.formBuilder.group({
      'token': ['', [
        Validators.required,
        Validators.minLength(this.tokenLength),
        Validators.maxLength(this.tokenLength),
      ]],
    });
    this.errors = {
      length: `Token must be ${this.tokenLength} characters`,
      required: 'Token is required',
    };
  }

  /**
   * Run the python authenticate script.
   */
  authenticate(): void {
    this.zone.runOutsideAngular(() => {
      var python = window.require('child_process').spawn('python', [
        window.require('path').join(
          window.require('electron').remote.app.getAppPath(),
          'assets/python/authenticate.py'
        )
      ]);
      python.stdout.on('data', data => {
        this.zone.run(() => {
          this.recvResponse = true;
          this.router.navigate(['/sync']);
        });
      });
      python.stderr.on('data', data => {
        this.zone.run(() => {
          this.recvResponse = true;
          this.cdf.detectChanges();
          if (this.form.get('token').value) {
            let container: HTMLDivElement = <HTMLDivElement>
              document.getElementById('auth-container');
            let parElement: HTMLParagraphElement = document.createElement('p');
            parElement.setAttribute('id', 'invalid-token');
            parElement.innerText = 'Token is invalid';
            parElement.style.color = '#f44336';
            parElement.style.marginTop = '40px';
            container.appendChild(parElement);
          }
        });
      });
    });
  }

  /**
   * Clear the invalid token message upon focusing on the token field.
   */
  clearInvalidToken(): void {
    let parElement: HTMLParagraphElement = <HTMLParagraphElement>
      document.getElementById('invalid-token');
    if (parElement) {
      parElement.remove();
    }
  }

  /**
   * Run the python configure script.
   */
  configure(): void {
    this.recvResponse = false;
    this.zone.runOutsideAngular(() => {
      var python = window.require('child_process').spawn('python', [
        window.require('path').join(
          window.require('electron').remote.app.getAppPath(),
          'assets/python/configure.py'
        ),
        this.form.get('token').value
      ]);
      python.stdout.on('data', data => {
        this.zone.run(() => {
          this.authenticate();
        });
      });
      python.stderr.on('data', data => {
        this.zone.run(() => {
          this.recvResponse = true;
        });
      });
    });
  }

}
