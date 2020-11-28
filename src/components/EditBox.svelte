<svelte:head>
	<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
	<script src="https://cdn.quilljs.com/1.3.6/quill.js" on:load={quillLoaded}></script>
</svelte:head>

<script>
    import { getContext } from 'svelte';
    export let onCancel = () => {};
    export let onOK = () => {};
    export let initialComments, initialChapter, initialTags, initialDateTime, showDateTime;
  
    const { close } = getContext('simple-modal');
      
    let insert;
    let comments = initialComments;
    let chapter = initialChapter;
    let tags = initialTags;
    let dateTime = initialDateTime;
    let onChange = () => {};
      
    function _onCancel() {
        onCancel();
        close();
    }
      
    function _onOK() {
        comments = quill.root.innerHTML.split("<script")[0].split("javascript:")[0]; // paranoia
        onOK({comments:comments, insert:insert, chapter:chapter, tags:tags, dateTime:dateTime});
        close();
    }
    
    $: onChange(comments, insert)

    let quill;
    let quillReady = false;

    let mounted = false;
    import { onMount } from 'svelte';
    onMount(async () => {
		mounted = true;
		if (quillReady) {
				loadQuill();
		}
  });

	function quillLoaded() {
			quillReady = true;
			if (mounted) {
					loadQuill();
			}
	}
    
    function loadQuill() {
		quill = new Quill('#quill-container', {
			modules: {
				toolbar: [
					['bold', 'italic'],
					['link', 'blockquote'],
					[{ list: 'ordered' }, { list: 'bullet' }],
				],
			},
			placeholder: 'Add commentary',
			theme: 'snow'
        });
        quill.focus();
    }
</script>
  
  <style>
      #quill-container {
		min-height: 12rem;
      }
      .buttons {
        display: flex;
        justify-content: space-between;
      }
      .commentsLabel {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .insertAfter {
        display: flex;
        font-size:small;
        font-style:italic;
      }
      .chapterAndTags {
        display:flex;
        justify-content: space-between;
        margin: 10px 0px;
      }
  </style>
  
    <h3>Add/edit comments, chapter, and tags</h3>

    <div class="commentsLabel">
        <label for="quill-container">Comments</label>
        <span class="insertAfter">
            <input type=checkbox bind:checked={insert}>Insert after this item, as a separate timeline entry
        </span>
    </div>
    <div id="quill-container">{@html comments}</div>
    {#if showDateTime}
      <div class="dateAndTime">
        <label for="dateTime">Date/time (ISO 8601 or YYYY-MM-DD HH:MM:SS)</label>
        <input id="dateTime" type="text" placeholder="1934-09-21 13:45:00" size=30 bind:value={dateTime}/>
      </div>
    {/if}
    <div class="chapterAndTags">
        <label for="chapter">Chapter</label>
        <input id="chapter" type="text" size=30 bind:value={chapter}/>
        <span class="spacer">&nbsp;</span>
        <label for="tags">Tags</label>
        <input id="tags" type="text" size=30 bind:value={tags}/>
    </div>
    
    <div class="buttons">
        <button on:click={_onCancel}>
            Cancel
        </button>
        <button on:click={_onOK}>
            OK
        </button>
    </div>