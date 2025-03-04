import { Component, HostBinding } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import { logoNegative, sygnet } from '../../icons/brand';
import { navItems } from './_nav';

@Component({
  selector: 'app-email',
  templateUrl: './email-layout.component.html'
})
export class EmailLayoutComponent {

  constructor(
    private router: Router
  ) {
    this.titleSubscribe();
  }

  @HostBinding('class.c-app') cAppClass = true;

  public logoNegative = logoNegative;
  public sygnet = sygnet;

  public title!: string;

  public navItems = navItems;

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
