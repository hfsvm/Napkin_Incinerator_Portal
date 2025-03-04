import { Component } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import { logoNegative, sygnet } from '../../icons/brand';
import { navItems } from './_nav';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent {

  constructor(private router: Router) {
    this.titleSubscribe();
    this.router.events.subscribe(() => {
      this.activeItem = this.router.url;  // ✅ Track Active Route
    });
  }

  public logoNegative = logoNegative;
  public sygnet = sygnet;

  public title!: string;
  public navItems = navItems;
  public activeItem: string = '';  // ✅ Track Active Sidebar Item

  public perfectScrollbarConfig = {
    suppressScrollX: true
  };

  titleSubscribe() {
    this.router.events.pipe(
      filter(event => event instanceof ActivationEnd && !event.snapshot.firstChild),
      map(value => {
        const activatedRoute = <ActivatedRoute><unknown>value;
        return activatedRoute.snapshot?.data?.['title'] ?? null;
      })
    ).subscribe((title: string | null) => {
      this.title = title ?? 'Title';
    });
  }
}
