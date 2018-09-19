---
layout: default
title: Events in Diaspora
description: Events
inMenu: true
toc: true
---

# Events in Diaspora

Diaspora rellies, for many functionnalities, on event emitters. Entities, sets (and later models) are event emitters, and listening those events allow you to customize Diaspora's behavior.

## Lifecycle events

Lifecycle events are events applied on *Entities* and *Sets*, and may be used as pre or post operation hooks. You can check the documentation of [SequentialEvents](https://gerkindev.github.io/SequentialEvent.js/) for informations about events functions. You'll find bellow all events callbacks that are triggered on *Entities* and *Sets*:

<div class="tabs" markdown="1">
<div class="tab" data-ref="all-events" markdown="1">

### All events

![All events](/assets/content/guides/lifecycle_events_all.svg)

</div>
<div class="tab" data-ref="persist" markdown="1">

### Persist

![Persist](/assets/content/guides/lifecycle_events_persist.svg)

</div>
<div class="tab" data-ref="fetch" markdown="1">

### Fetch

![Fetch](/assets/content/guides/lifecycle_events_fetch.svg)

</div>
<div class="tab" data-ref="destroy" markdown="1">

### Destroy

![Destroy](/assets/content/guides/lifecycle_events_destroy.svg)

</div>
</div>

To configure lifecycle events when creating your model, you can do as follow:

```ts
const PhoneBook = Diaspora.declareModel( 'PhoneBook', {
	sources:         /* ... */,
	attributes:      /* ... */,
	lifecycleEvents: {
		beforePersist: function( dataSoureName ){
			console.log( `Trying to persist ${this.toObject()} in data source ${ dataSoureName }` );
		},
		afterPersist:  /* ... */,
		/* All events described above can be bound here */
	}
} );
```