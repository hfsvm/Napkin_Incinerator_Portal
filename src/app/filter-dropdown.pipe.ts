import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterDropdown'
})
export class FilterDropdownPipe implements PipeTransform {

  transform(options: any[], searchText: string): any[] {
    if (!searchText) return options;

    searchText = searchText.toLowerCase();

    return options.filter(option => {
      // If option is an object, check for a property like `name`, `machineId`, etc.
      const optionValue = typeof option === 'object' ? option.name || option.machineId || option.value : option;

      // Handle case where option is an object, and we safely convert it to string
      return optionValue && optionValue.toString().toLowerCase().includes(searchText);
    });
  }
}
