import { mount } from 'svelte'
import './app.css'
import 'beercss/dist/cdn/beer.min.css'
import 'beercss/dist/cdn/beer.min.js'
import 'material-dynamic-colors/dist/cdn/material-dynamic-colors.min.js'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
