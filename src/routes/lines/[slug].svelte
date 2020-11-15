<script context="module" lang="ts">
	export async function preload({ params }) {
		// the `slug` parameter is available because
		// this file is called [slug].svelte
		const res = await this.fetch(`lines/${params.slug}.json`);
		const data = await res.json();

		if (res.status === 200) {
			return { post: data };
		} else {
			this.error(res.status, data.message);
		}
	}
</script>

<script lang="ts">
	export let post: { slug: string; title: string, html: any };
</script>

<style>

.text{
  display: var(--textDisplay, inline-flex);
  font-size: var(--textFontSize, 1rem);
}

.time{
  display: var(--timeDisplay, inline-flex);
  padding: var(--timePadding, .25rem 1.25rem .25rem);
  background-color: var(--timeBackgroundColor, #f0f0f0);

  font-size: var(--timeFontSize, .75rem);
  font-weight: var(--timeFontWeight, 700);
  text-transform: var(--timeTextTransform, uppercase);
  color: var(--timeColor, currentColor);
}

.time__month{
  margin-left: var(--timelineMounthMarginLeft, .25em);
}

/* card component */

.card{
  padding: var(--timelineCardPadding, 1.5rem 1.5rem 1.25rem);
  border-radius: var(--timelineCardBorderRadius, 2px);
  border-left: var(--timelineCardBorderLeftWidth, 3px) solid var(--timelineCardBorderLeftColor, var(--uiTimelineMainColor));
  box-shadow: var(--timelineCardBoxShadow, 0 1px 3px 0 rgba(0, 0, 0, .12), 0 1px 2px 0 rgba(0, 0, 0, .24));
  background-color: var(--timelineCardBackgroundColor, #fff);
}

.card__content{
  margin-top: var(--cardContentMarginTop, .5rem);
}

.card__title{
  --rTitleMarginTop: var(--cardTitleMarginTop, 1rem);
  font-size: var(--cardTitleFontSize, 1.25rem);
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

.timeline__year{
  margin-bottom: 1.25rem; /* 1 */
  --timePadding: var(--timelineYearPadding, .5rem 1.5rem);
  --timeColor: var(--uiTimelineSecondaryColor);
  --timeBackgroundColor: var(--uiTimelineMainColor);
  --timeFontWeight: var(--timelineYearFontWeight, 400);
}

.timeline__cards{
  display: var(--timeloneCardsDisplay, grid);
  grid-row-gap: var(--timeloneCardsGap, 1.5rem);
  overflow: hidden;
  padding-top: .25rem; /* 1 */
  padding-bottom: .25rem; /* 1 */
}

.timeline__card{
  position: relative;
  margin-left: var(--timelineCardLineGap, 1rem);
}

.timeline__card::before{
  content: "";
  width: 100%;
  height: var(--timelineCardLineWidth, 2px);
  background-color: var(--timelineCardLineBackgroundColor, var(--uiTimelineMainColor));

  position: absolute;
  top: var(--timelineCardLineTop, 1rem);
  left: -50%;
  z-index: -1;
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
	<title>{post.title}</title>
</svelte:head>

  <div class="page">
	<div class="timeline">
	  <div class="timeline__group">
		<span class="timeline__year time" aria-hidden="true">2008</span>
		<div class="timeline__cards">
		  <div class="timeline__card card">
			<header class="card__header">
			  <time class="time" datetime="2008-02-02">
				<span class="time__day">2</span>
				<span class="time__month">Feb</span>
			  </time>
			</header>
			<div class="card__content">
			  <p>Attends the Philadelphia Museum School of Industrial Art. Studies design with Alexey Brodovitch, art director at Harper's Bazaar, and works as his assistant.</p>
			</div>
		  </div>
		  <div class="timeline__card card">
			<header class="card__header">
			  <time class="time" datetime="2008-09-01">
				<span class="time__day">1</span>
				<span class="time__month">Sept</span>
			  </time>
			  <h3 class="card__title r-title">The part of my life in University of Pennsylvania</h3>
			</header>
			<div class="card__content">
			  <p>Started from University of Pennsylvania. This is an important stage of my career. Here I worked in the local magazine. The experience greatly affected me</p>
			</div>
		  </div>
		</div>
	  </div>
	  <div class="timeline__group">
		<span class="timeline__year time" aria-hidden="true">2014</span>
		<div class="timeline__cards">
		  <div class="timeline__card card">
			<header class="card__header">
			  <time class="time" datetime="2008-07-14">
				<span class="time__day">14</span>
				<span class="time__month">Jul</span>
			  </time>
			</header>
			<div class="card__content">
			  <p>Travels to France, Italy, Spain, and Peru. After completing fashion editorial in Lima, prolongs stay to make portraits of local people in a daylight studio</p>
			</div>
		  </div>
		</div>
	  </div>
	  <div class="timeline__group">
		<span class="timeline__year time" aria-hidden="true">2016</span>
		<div class="timeline__cards">
		  <div class="timeline__card card">
			<header class="card__header">
			  <time class="time" datetime="2008-08-18">
				<span class="time__day">28</span>
				<span class="time__month">Aug</span>
			  </time>          
			</header>
			<div class="card__content">
			  <p>Upon moving to Brooklyn that summer, I began photographing weddings in Chicago</p>
			</div>
		  </div>
		</div>
	  </div>
	</div>
  </div>
