<script context="module" lang="ts">
	export async function preload({ params }) {
		// the `slug` parameter is available because this file is called [slug].svelte
		const res = await this.fetch(`lines/${params.slug}.json`);
		// const data = await res.json();
		let mock = { title : "Test Timeline", entries: [
			{
				id: 1,
				group: "2008",
				label: "2 Feb",
				title: "",
				content: "Attends the Philadelphia Museum School of Industrial Art. Studies design with Alexey Brodovitch, art director at Harper's Bazaar, and works as his assistant."
			},
			{
				id: 2,
				group: "2008",
				label: "1 Sept",
				title: "The part of my life in University of Pennsylvania",
				content: "Started from University of Pennsylvania. This is an important stage of my career. Here I worked in the local magazine. The experience greatly affected me."
			},
			{
				id: 3,
				group: "2014",
				label: "July",
				title: "",
				content: "Travels to France, Italy, Spain, and Peru. After completing fashion editorial in Lima, prolongs stay to make portraits of local people in a daylight studio."
			},
			{
				id: 4,
				group: "2016",
				label: "August",
				title: "",
				content: "Upon moving to Brooklyn that summer, I began photographing weddings in Chicago."
			},
		]};
		const data = mock;

		if (res.status === 200) {
			return { line: data };
		} else {
			this.error(res.status, data.message);
		}
	}
</script>

<script lang="ts">
import type { parse } from "path";
import {flip} from 'svelte/animate';
let hovering = -1;

export let line: { title: string, entries: [{string: any }]};

const drop = (event, target) => {
    event.dataTransfer.dropEffect = 'move'; 
    const start = parseInt(event.dataTransfer.getData("text/plain"));
    const newTracklist = line.entries;

    if (start < target) {
      newTracklist.splice(target + 1, 0, newTracklist[start]);
      newTracklist.splice(start, 1);
    } else {
      newTracklist.splice(target, 0, newTracklist[start]);
      newTracklist.splice(start + 1, 1);
    }
    line.entries = newTracklist
    hovering = null
  }

  const dragstart = (event, i) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    const start = i;
    event.dataTransfer.setData('text/plain', start);
  }
</script>

<style>

/* card component */

.card{
  padding: var(--timelineCardPadding, 1.5rem 1.5rem 1.25rem);
  border-radius: var(--timelineCardBorderRadius, 2px);
  border-left: var(--timelineCardBorderLeftWidth, 3px) solid var(--timelineCardBorderLeftColor, var(--uiTimelineMainColor));
  box-shadow: var(--timelineCardBoxShadow, 0 1px 3px 0 rgba(0, 0, 0, .12), 0 1px 2px 0 rgba(0, 0, 0, .24));
  background-color: var(--timelineCardBackgroundColor, #fff);
}

.card_title{
  --rTitleMarginTop: var(--cardTitleMarginTop, 1rem);
  font-size: var(--cardTitleFontSize, 1.25rem);
  margin-top: var(--rTitleMarginTop, 0) !important;
  margin-bottom: var(--rTitleMarginBottom, 0) !important;
}

.card_content{
  margin-top: var(--cardContentMarginTop, .5rem);
}

.label{
  display: var(--timeDisplay, inline-flex);
  padding: var(--timePadding, .25rem 1.25rem .25rem);
  background-color: var(--timeBackgroundColor, #f0f0f0);

  font-size: var(--timeFontSize, .75rem);
  font-weight: var(--timeFontWeight, 700);
  text-transform: var(--timeTextTransform, uppercase);
  color: var(--timeColor, currentColor);
}


/* timeline */

.timeline{
  display: var(--timelineDisplay, grid);
  grid-row-gap: var(--timelineGroupsGap, 2rem);
  --uiTimelineMainColor: var(--timelineMainColor, #222);
  --uiTimelineSecondaryColor: var(--timelineSecondaryColor, #fff);

  border-left: var(--timelineLineWidth, 3px) solid var(--timelineLineBackgroundColor, var(--uiTimelineMainColor));
  padding-top: 1rem;
  padding-bottom: 1.5rem;
  --timelineMainColor: #4557bb;
}

.timeline_year{
  margin-bottom: 1.25rem; /* 1 */
  --timePadding: var(--timelineYearPadding, .5rem 1.5rem);
  --timeColor: var(--uiTimelineSecondaryColor);
  --timeBackgroundColor: var(--uiTimelineMainColor);
  --timeFontWeight: var(--timelineYearFontWeight, 400);
}

.timeline_cards{
  display: var(--timeloneCardsDisplay, grid);
  grid-row-gap: var(--timeloneCardsGap, 1.5rem);
  overflow: hidden;
  padding-top: .25rem; /* 1 */
  padding-bottom: .25rem; /* 1 */
}

.timeline_card{
  position: relative;
  margin-left: var(--timelineCardLineGap, 1rem);
}

.timeline_card::before{
  content: "";
  width: 3%;
  height: var(--timelineCardLineWidth, 2px);
  background-color: var(--timelineCardLineBackgroundColor, var(--uiTimelineMainColor));

  position: absolute;
  top: var(--timelineCardLineTop, 1rem);
  left: -3%;
}

p{
  margin-top: 0;
  margin-bottom: 1rem;
  line-height: 1.5;
}

p:last-child{
  margin-bottom: 0;
}

.page{
  max-width: 47rem;
  padding: 1rem 2rem 3rem;
  margin-left: auto;
  margin-right: auto;
}

</style>

<svelte:head>
	<title>{line.title}</title>
</svelte:head>

  <div class="page">
	<div class="timeline">
		<div class="timeline_cards">
			{#each line.entries as entry, i (entry.id)}
				<div class="timeline_card card"
					animate:flip
					draggable={true}
					on:dragstart={event => dragstart(event, i)}
					on:drop|preventDefault={event => drop(event, i)}
					ondragover="return false"
					on:dragenter={() => hovering = i}
					class:is-active={hovering === i}
				>
					<header class="card_header">
						<div class="label">{entry.label}</div>
						<h3 class="card_title r-title">{entry.title}</h3>
					</header>
					<div class="card_content">
						<p>{entry.content}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
  </div>
