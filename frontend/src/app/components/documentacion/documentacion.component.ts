import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-documentacion',
  templateUrl: './documentacion.component.html',
  styleUrl: './documentacion.component.css'
})
export class DocumentacionComponent {
  currentSection: string = 'section1';
  expandedSections: Set<string> = new Set(['section1']); // Inicializa con la primera sección expandida
  @ViewChild('divText', { static: false }) divText!: ElementRef;

  ngAfterViewInit() {
    this.divText.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
  }

  onScroll() {
    const sections = this.divText.nativeElement.querySelectorAll('div[id^="section"], div[id^="subSection"], div[id^="subSubSection"]');
    let current = '';

    sections.forEach((section: HTMLElement) => {
      const sectionTop = section.getBoundingClientRect().top - this.divText.nativeElement.getBoundingClientRect().top;
      if (sectionTop <= 50 && sectionTop >= 0) {
        current = section.getAttribute('id') || '';
      }
    });

    if (current) {
      this.currentSection = current;
      this.updateExpandedSections(current);
    }
  }

  scrollToSection(section: string) {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    this.updateExpandedSections(section);
  }

  updateExpandedSections(section: string) {
    const mainSection = section.includes('_') ? section.split('_')[0] : section;

    if (!section.includes('_')) {
      this.expandedSections.clear();
      this.expandedSections.add(mainSection);
    } else {
      this.expandedSections.add(mainSection);
    }
  }
}

