declare module '*.svg' {
  import * as React from 'react'
  const SVG: React.VFC<React.SVGProps<SVGSVGElement> & { title?: string }>
  export default SVG
}
