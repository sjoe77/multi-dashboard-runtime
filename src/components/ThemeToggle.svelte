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
    // Beer CSS theme system uses data attributes, not classes
    document.documentElement.setAttribute('data-theme', theme);
  }
  
  function toggleTheme() {
    isDarkMode = !isDarkMode;
    const newTheme = isDarkMode ? 'dark' : 'light';
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Apply Beer CSS theme
    applyTheme(newTheme);
  }
</script>

<!-- Beer CSS Theme Toggle Button -->
<button class="transparent circle" on:click={toggleTheme} aria-label="Toggle theme">
  <i>{isDarkMode ? 'dark_mode' : 'light_mode'}</i>
</button>