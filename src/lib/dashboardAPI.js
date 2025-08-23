// Save/Load API for dashboard persistence
// In production, this would be a backend service

export async function saveDashboard(dashboardName, pageName, svelteCode) {
  try {
    // Compile the code first to check for errors
    const { compileSvelte } = await import('./compileSvelte.js');
    const result = await compileSvelte(svelteCode, `${pageName}.svelte`);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // In dev mode, save to localStorage (simulating S3/filesystem)
    const storageKey = `dashboard_${dashboardName}_${pageName}`;
    const dashboardData = {
      source: svelteCode,
      compiled: result.code,
      warnings: result.warnings,
      lastModified: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(dashboardData));
    
    return { 
      success: true, 
      warnings: result.warnings,
      message: `Saved ${dashboardName}/${pageName}` 
    };
    
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export async function loadDashboard(dashboardName, pageName) {
  const storageKey = `dashboard_${dashboardName}_${pageName}`;
  const stored = localStorage.getItem(storageKey);
  
  if (!stored) {
    return { success: false, error: 'Dashboard not found' };
  }
  
  try {
    const data = JSON.parse(stored);
    return { 
      success: true, 
      source: data.source,
      compiled: data.compiled,
      lastModified: data.lastModified
    };
  } catch (error) {
    return { success: false, error: 'Failed to parse dashboard data' };
  }
}

export function listDashboards() {
  // In production, this would scan the actual filesystem or query an API
  // For now, return a hardcoded structure that matches our dashboard files
  
  // Also check localStorage for any saved dashboards
  const dashboards = {
    "sales": ["Overview"],
    "marketing": ["Overview"], 
    "operations": ["Overview"],
    "claims": ["Overview"]
  };
  
  // Add any additional dashboards from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('dashboard_')) {
      const parts = key.replace('dashboard_', '').split('_');
      if (parts.length >= 2) {
        const dashboardName = parts[0];
        const pageName = parts.slice(1).join('_');
        
        if (!dashboards[dashboardName]) {
          dashboards[dashboardName] = [];
        }
        if (!dashboards[dashboardName].includes(pageName)) {
          dashboards[dashboardName].push(pageName);
        }
      }
    }
  }
  
  return dashboards;
}
