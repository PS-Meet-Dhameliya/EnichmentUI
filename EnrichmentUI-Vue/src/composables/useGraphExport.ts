/**
 * Graph export utilities
 * Allows exporting the graph as PNG or SVG
 */

import { useGraphStore } from '@/stores/graphStore'
import { useToast } from '@/composables/useToast'

export function useGraphExport() {
  const graphStore = useGraphStore()
  const { success, error } = useToast()

  const exportAsPNG = async (canvas: HTMLCanvasElement, filename = 'graph.png') => {
    try {
      // Create a link to download
      const link = document.createElement('a')
      link.download = filename
      link.href = canvas.toDataURL('image/png')
      link.click()
      success('Graph exported as PNG')
    } catch (err) {
      error('Failed to export graph as PNG')
      console.error(err)
    }
  }

  const exportAsSVG = (filename = 'graph.svg') => {
    try {
      // Create SVG representation
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', '1000')
      svg.setAttribute('height', '1000')
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

      // Add background
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      bg.setAttribute('width', '100%')
      bg.setAttribute('height', '100%')
      bg.setAttribute('fill', 'hsl(222 47% 6%)')
      svg.appendChild(bg)

      // Add nodes and links
      graphStore.nodes.forEach(node => {
        if (node.x !== undefined && node.y !== undefined) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
          circle.setAttribute('cx', node.x.toString())
          circle.setAttribute('cy', node.y.toString())
          circle.setAttribute('r', '10')
          circle.setAttribute('fill', graphStore.entityColors[node.type] || '#888')
          svg.appendChild(circle)

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          text.setAttribute('x', node.x.toString())
          text.setAttribute('y', (node.y + 20).toString())
          text.setAttribute('fill', '#e2e8f0')
          text.setAttribute('font-size', '12')
          text.setAttribute('text-anchor', 'middle')
          text.textContent = node.label
          svg.appendChild(text)
        }
      })

      // Convert to blob and download
      const svgData = new XMLSerializer().serializeToString(svg)
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = filename
      link.href = url
      link.click()
      URL.revokeObjectURL(url)

      success('Graph exported as SVG')
    } catch (err) {
      error('Failed to export graph as SVG')
      console.error(err)
    }
  }

  return {
    exportAsPNG,
    exportAsSVG
  }
}


