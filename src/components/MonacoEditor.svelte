<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  
  export let value = '';
  export let language = 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let monacoElement;
  let mounted = false;
  let initialized = false;
  
  onMount(async () => {
    // console.log('🌟 MonacoEditor Svelte: onMount called');
    mounted = true;
    
    // Wait for element to be in the DOM and properly sized
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    if (monacoElement && !initialized) {
      console.log('🔗 MonacoEditor Svelte: Initializing custom element');
      console.log('📐 Svelte wrapper dimensions:', {
        elementWidth: monacoElement.offsetWidth,
        elementHeight: monacoElement.offsetHeight,
        parentWidth: monacoElement.parentElement?.offsetWidth,
        parentHeight: monacoElement.parentElement?.offsetHeight
      });
      
      initialized = true;
      
      // Listen for changes from the custom element
      monacoElement.addEventListener('monaco-change', (event) => {
        console.log('📝 Monaco change event received:', event.detail.value.substring(0, 50) + '...');
        value = event.detail.value;
        dispatch('change', { value });
      });
      
      // Set initial value and language after element is ready
      setTimeout(() => {
        if (monacoElement) {
          console.log('⚙️ Setting initial value and language');
          monacoElement.value = value;
          monacoElement.setAttribute('language', language);
        }
      }, 100);
    }
  });
  
  // Reactive updates - only after initialization
  $: if (initialized && monacoElement && monacoElement.value !== value) {
    monacoElement.value = value;
  }
  
  $: if (initialized && monacoElement) {
    monacoElement.setAttribute('language', language);
  }
  
  onDestroy(() => {
    initialized = false;
  });
</script>

<monaco-editor 
  bind:this={monacoElement}
  style="width: 100%; height: 100%;"
></monaco-editor>

<style>
  monaco-editor {
    display: block;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
</style>