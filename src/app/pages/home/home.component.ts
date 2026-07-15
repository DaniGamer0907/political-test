import { Component } from '@angular/core';

import { LandingComponent } from '../../components/landing/landing.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [LandingComponent],
  template: `
    <app-landing />
  `,
  styles: [],
})
export class HomeComponent {}
