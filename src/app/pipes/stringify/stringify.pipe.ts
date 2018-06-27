import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'stringify'})
export class StringifyPipe implements PipeTransform {
	transform(value: any, args?: any): string {
		return JSON.stringify(value);
	}
}
