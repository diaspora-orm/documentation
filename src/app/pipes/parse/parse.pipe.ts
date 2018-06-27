import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'parse'})
export class ParsePipe implements PipeTransform {
	transform(value: string, args?: any): any {
		return JSON.parse(value);
	}
}
