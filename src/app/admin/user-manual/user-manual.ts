import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-user-manual',
  imports: [CommonModule],
  templateUrl: './user-manual.html',
  styleUrl: './user-manual.css',
})
export class UserManual {
  readonly pdfUrl = '/User%20Manual.pdf';
  readonly pdfViewerUrl: SafeResourceUrl;

  constructor(sanitizer: DomSanitizer) {
    this.pdfViewerUrl = sanitizer.bypassSecurityTrustResourceUrl(this.pdfUrl);
  }
}
