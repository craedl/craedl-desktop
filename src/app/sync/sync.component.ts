import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { NgZone } from '@angular/core';
import { OnInit } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { Validators } from '@angular/forms';

/**
 * Sync a directory with Craedl.
 */
@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.scss', '../app.component.scss']
})
export class SyncComponent implements OnInit {

  /** Validation errors for display. */
  errors: { [key: string]: string };
  /** Sync form. */
  form: FormGroup;
  /** Indicates if sync response has been received. */
  recvResponse: boolean = true;
  /** Validator for urls. */
  urlValidator: ValidatorFn = Validators.pattern(
    // from https://gist.github.com/dperini/729294
    "^" +
    // protocol identifier (optional)
    // short syntax // still required
    "(?:(?:(?:https?|ftp):)?\\/\\/)" +
    // user:pass BasicAuth (optional)
    "(?:\\S+(?::\\S*)?@)?" +
    "(?:" +
      // IP address exclusion
      // private & local networks
      "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
      "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
      "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
      // IP address dotted notation octets
      // excludes loopback network 0.0.0.0
      // excludes reserved space >= 224.0.0.0
      // excludes network & broadcast addresses
      // (first & last IP address of each class)
      "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
      "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
      "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
    "|" +
      // host & domain names, may end with dot
      // can be replaced by a shortest alternative
      // (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
      "(?:" +
        "(?:" +
          "[a-z0-9\\u00a1-\\uffff]" +
          "[a-z0-9\\u00a1-\\uffff_-]{0,62}" +
        ")?" +
        "[a-z0-9\\u00a1-\\uffff]\\." +
      ")+" +
      // TLD identifier name, may end with dot
      "(?:[a-z\\u00a1-\\uffff]{2,}\\.?)" +
    ")" +
    // port number (optional)
    "(?::\\d{2,5})?" +
    // resource path (optional)
    "(?:[/?#]\\S*)?"
  );

  /**
   * Constructor for SyncComponent.
   */
  constructor(
    /** Form builder. */
    private formBuilder: FormBuilder,
    /** Angular zone. */
    private zone: NgZone,
  ) { }

  /**
   * Initialize the form and errors.
   */
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      'path': ['', [
        Validators.required,
      ]],
      'url': ['', [
        Validators.required,
        this.urlValidator,
      ]],
    });
    this.errors = {
      pathRequired: 'Local path is required',
      urlRequired: 'Craedl URL is required',
      urlPattern: 'Must be a valid URL',
    };
  }

  /**
   * Append a message to the output log.
   *
   * @param {string} message The message to append.
   * @param {string} color The color of the message. Defaults to black.
   */
  appendToLog(message: string, color: string = 'black'): void {
    let logContainer: HTMLDivElement = <HTMLDivElement>
      document.getElementById('log-container');
    let parElement: HTMLParagraphElement = document.createElement('p');
    parElement.innerHTML = '<span style="font-weight: bold;">' +
      new Date().toLocaleString() + '</span>: ' +
      '<span style="color: ' + color + ';">' + message + '</span>';
    parElement.style.textAlign = 'left';
    parElement.style.marginBottom = '0px';
    parElement.style.whiteSpace = 'pre-wrap';
    logContainer.appendChild(parElement);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  /**
   * Open the file browser and enter the chosen directory into the local path
   * field upon selection.
   */
  chooseDirectory(): void {
    window.require('electron').remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    }).then(result => {
      if (result.filePaths.length) {
        this.form.get('path').setValue(result.filePaths[0]);
      }
    });
  }

  /**
   * Run the python sync script.
   */
  sync(): void {
    this.recvResponse = false;
    let path: string = this.form.get('path').value;
    this.appendToLog('Syncing ' + path);
    this.zone.runOutsideAngular(() => {
      var python = window.require('child_process').execFile(
        window.require('path').join(
          window.require('electron').remote.app.getAppPath(),
          'assets/exe/main'
        ),
        [
          'sync',
          path,
          this.form.get('url').value
        ]
      );
      python.stdout.on('data', data => {
        this.zone.run(() => {
          data = data.toString('utf8');
          if (data === 'success\n' || data === 'success\r\n') {
            this.recvResponse = true;
            this.appendToLog('Sync successful!', '#228b22');
          } else {
            this.appendToLog(data);
          }
        });
      });
      python.stderr.on('data', data => {
        this.zone.run(() => {
          this.recvResponse = true;
          this.appendToLog('Sync failed:\n' +
            data.toString('utf8'), '#f44336');
        });
      });
    });
  }

}
