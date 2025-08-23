<script>
  import { onMount } from 'svelte';
  
  let isDarkMode = false;
  
  // Load theme preference from localStorage
  onMount(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    isDarkMode = savedTheme === 'dark';
    applyTheme(savedTheme);
  });
  
  function applyTheme(theme) {
    const htmlElement = document.documentElement;
    
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }
  
  function toggleTheme() {
    console.log('Toggle clicked! Current:', isDarkMode);
    isDarkMode = !isDarkMode;
    const newTheme = isDarkMode ? 'dark' : 'light';
    console.log('New theme:', newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Apply theme
    applyTheme(newTheme);
    
    console.log('Theme applied, classes:', document.documentElement.classList.toString());
  }
</script>

<div class="theme-toggle-container">
  <label class="switch icon">
    <input type="checkbox" bind:checked={isDarkMode} on:change={toggleTheme} />
    <span>
      <i class="material-icons">{isDarkMode ? 'dark_mode' : 'light_mode'}</i>
    </span>
  </label>
</div>

<style>
  .theme-toggle-container {
    display: inline-flex;
    align-items: center;
  }
  
  /* Beer CSS overrides for icon positioning */
  .switch.icon span i {
    font-size: 20px;
    line-height: 1;
    color: var(--on-surface-color);
  }
</style>