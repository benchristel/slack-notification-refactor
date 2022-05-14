// @flow
import * as React from "react"
import "./App.css"
import "./notifications"
import {test, expect, is} from "@benchristel/taste"

export function App(): React.Node {
  return <div class="App">
    <h1>{greet("world")}</h1>
  </div>
}

function greet(name: string): string {
  return `Hello, ${name}!`
}
