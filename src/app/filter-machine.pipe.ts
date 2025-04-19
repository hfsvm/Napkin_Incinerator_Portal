import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterMachine'
})
export class FilterMachinePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
