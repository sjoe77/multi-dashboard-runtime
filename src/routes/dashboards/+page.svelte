<script>
  import { listDashboards } from '../../lib/dashboardAPI.js';
  
  let dashboards = listDashboards();
</script>

<div class="dashboard-landing">
  <header class="header">
    <h1>📊 Dashboard Runtime</h1>
    <p>Select a dashboard to view or edit</p>
  </header>
  
  <div class="dashboard-grid">
    {#each Object.entries(dashboards) as [dashboardName, pages]}
      <div class="dashboard-tile">
        <div class="tile-header">
          <h3>{dashboardName}</h3>
          <div class="tile-actions">
            <a href="/dashboards/{dashboardName}" class="view-btn">👁️ View</a>
            <a href="/dashboards/{dashboardName}/edit" class="edit-btn">🔧 Edit</a>
          </div>
        </div>
        <div class="tile-content">
          <p>{pages.length} page{pages.length === 1 ? '' : 's'}</p>
          <div class="page-list">
            {#each pages as page}
              <span class="page-tag">{page}</span>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .dashboard-landing {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
  }

  .header {
    text-align: center;
    color: white;
    margin-bottom: 3rem;
  }

  .header h1 {
    font-size: 3rem;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }

  .header p {
    font-size: 1.2rem;
    margin: 1rem 0 0 0;
    opacity: 0.9;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-tile {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .dashboard-tile:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0,0,0,0.15);
  }

  .tile-header {
    padding: 1.5rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .tile-header h3 {
    margin: 0 0 1rem 0;
    color: #2d3748;
    font-size: 1.5rem;
    text-transform: capitalize;
  }

  .tile-actions {
    display: flex;
    gap: 0.5rem;
  }

  .view-btn, .edit-btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .view-btn {
    background: #3182ce;
    color: white;
  }

  .view-btn:hover {
    background: #2c5aa0;
  }

  .edit-btn {
    background: #38a169;
    color: white;
  }

  .edit-btn:hover {
    background: #2f855a;
  }

  .tile-content {
    padding: 1.5rem;
  }

  .tile-content p {
    margin: 0 0 1rem 0;
    color: #718096;
    font-size: 0.9rem;
  }

  .page-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .page-tag {
    background: #edf2f7;
    color: #4a5568;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }
</style>
