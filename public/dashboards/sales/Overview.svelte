<Toggle name="showCharts" label="Show Charts" value="true" />

<BarChart 
  title="Monthly Sales Performance" 
  x="month"
  y="sales"
  data={[
    {month:"Jan", sales:100},
    {month:"Feb", sales:145},
    {month:"Mar", sales:180},
    {month:"Apr", sales:220},
    {month:"May", sales:195},
    {month:"Jun", sales:250},
    {month:"Jul", sales:280},
    {month:"Aug", sales:310},
    {month:"Sep", sales:275},
    {month:"Oct", sales:320},
    {month:"Nov", sales:290},
    {month:"Dec", sales:350}
  ]}
/>

<LineChart
  title="Sales Growth Trend"
  x="quarter"
  y="growth"
  data={[
    {quarter:"Q1", growth:12},
    {quarter:"Q2", growth:18},
    {quarter:"Q3", growth:15},
    {quarter:"Q4", growth:25}
  ]}
/>

<PieChart
  title="Sales by Region"
  category="region"
  value="revenue"
  data={[
    {region:"North", revenue:450000},
    {region:"South", revenue:320000},
    {region:"East", revenue:280000},
    {region:"West", revenue:380000}
  ]}
/>

<Filter 
  title="Region Filter" 
  type="dropdown" 
  options={[
    {label: "North America", value: "NA"},
    {label: "Europe", value: "EU"}, 
    {label: "Asia Pacific", value: "APAC"}
  ]}
/>
