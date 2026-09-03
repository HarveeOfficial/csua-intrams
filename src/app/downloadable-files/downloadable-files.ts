import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataApi, IDownloadableFile } from '../data-api.service';

@Component({
  selector: 'app-public-downloadable-files',
  imports: [CommonModule],
  templateUrl: './downloadable-files.html',
  styleUrl: './downloadable-files.css',
})
export class DownloadableFiles {
  private api = inject(DataApi);

  files = signal<IDownloadableFile[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.api.getDownloadableFiles().subscribe({
      next: (files) => {
        this.files.set(files);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Downloads are unavailable right now. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}