import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { DataApi, IDownloadableFile } from '../../data-api.service';

@Component({
  selector: 'app-downloadable-files',
  imports: [CommonModule],
  templateUrl: './downloadable-files.html',
  styleUrl: './downloadable-files.css',
})
export class DownloadableFiles {
  private api = inject(DataApi);

  files = signal<IDownloadableFile[]>([]);
  selectedFile = signal<File | null>(null);
  loading = signal(true);
  uploading = signal(false);
  deleting = signal<string | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
    this.error.set(null);
  }

  async upload(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;

    try {
      this.uploading.set(true);
      this.error.set(null);
      const uploaded = await firstValueFrom(this.api.uploadDownloadableFile(file));
      this.files.update((files) => [uploaded, ...files]);
      this.selectedFile.set(null);
    } catch (error: any) {
      this.error.set(error?.error?.message || 'Unable to upload the file.');
    } finally {
      this.uploading.set(false);
    }
  }

  async deleteFile(file: IDownloadableFile): Promise<void> {
    if (!confirm(`Delete ${file.name}?`)) return;

    try {
      this.deleting.set(file.name);
      this.error.set(null);
      await firstValueFrom(this.api.deleteDownloadableFile(file.name));
      this.files.update((files) => files.filter((item) => item.name !== file.name));
    } catch (error: any) {
      this.error.set(error?.error?.message || 'Unable to delete the file.');
    } finally {
      this.deleting.set(null);
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private load(): void {
    this.loading.set(true);
    this.api.getDownloadableFiles().subscribe({
      next: (files) => {
        this.files.set(files);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error?.error?.message || 'Unable to load files.');
        this.loading.set(false);
      },
    });
  }
}