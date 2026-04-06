import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.css']
})
export class ImageModalComponent implements OnChanges {
  @Input() images: string[] = [];
  @Output() close = new EventEmitter<void>();
  @ViewChild('modalContent') modalContent?: ElementRef;
  @Input() title: string = '';


  currentImageIndex: number = 0;
  private _initialIndex: number = 0;

  @Input()
  set initialIndex(index: number) {
    this._initialIndex = index;
    this.currentImageIndex = index;
  }

  get initialIndex(): number {
    return this._initialIndex;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialIndex']) {
      this.currentImageIndex = this.initialIndex;
    }
  }

  closeModal() {
    this.close.emit();
  }

  changeImage(step: number) {
    const imgElement = this.modalContent?.nativeElement.querySelector('.full-image');
    if (imgElement) {
      imgElement.classList.add('fade-out');

      setTimeout(() => {
        this.currentImageIndex = (this.currentImageIndex + step + this.images.length) % this.images.length;
        imgElement.classList.remove('fade-out');
      }, 300);
    }
  }

  getCurrentImage(): string {
    return this.images[this.currentImageIndex];
  }

  toggleFullScreen(event: MouseEvent) {
    event.stopPropagation();

    if (this.modalContent && this.modalContent.nativeElement) {
      const elem = this.modalContent.nativeElement;

      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  }
}
