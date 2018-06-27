import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'pairs'})
export class PairsPipe implements PipeTransform {
	transform(value: {[key: string]: any}, args: string[]): {key: string, value: any}[] {
		const pairs = [];
		for (const key in value) {
			if (value.hasOwnProperty(key)) {
				pairs.push({key: key, value: value[key]});
			}
		}
		return pairs;
	}
}
