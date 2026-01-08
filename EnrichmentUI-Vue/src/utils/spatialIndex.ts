/**
 * QuadTree spatial index for efficient hit detection
 * Reduces O(n) node checks to O(log n) for large graphs
 */

export interface SpatialItem {
  x: number
  y: number
  [key: string]: unknown
}

interface Boundary {
  x: number
  y: number
  width: number
  height: number
}

export class QuadTree<T extends SpatialItem> {
  private boundary: Boundary
  private capacity = 4
  private items: T[] = []
  private divided = false
  private northeast?: QuadTree<T>
  private northwest?: QuadTree<T>
  private southeast?: QuadTree<T>
  private southwest?: QuadTree<T>

  constructor(boundary: Boundary) {
    this.boundary = boundary
  }

  insert(item: T): boolean {
    if (!this.contains(item)) return false

    if (this.items.length < this.capacity && !this.divided) {
      this.items.push(item)
      return true
    }

    if (!this.divided) {
      this.subdivide()
    }

    return (
      this.northeast!.insert(item) ||
      this.northwest!.insert(item) ||
      this.southeast!.insert(item) ||
      this.southwest!.insert(item)
    )
  }

  query(range: Boundary): T[] {
    const found: T[] = []

    if (!this.intersects(range)) return found

    for (const item of this.items) {
      if (this.inRange(item, range)) {
        found.push(item)
      }
    }

    if (this.divided) {
      found.push(...this.northeast!.query(range))
      found.push(...this.northwest!.query(range))
      found.push(...this.southeast!.query(range))
      found.push(...this.southwest!.query(range))
    }

    return found
  }

  clear(): void {
    this.items = []
    this.divided = false
    this.northeast = undefined
    this.northwest = undefined
    this.southeast = undefined
    this.southwest = undefined
  }

  private contains(item: T): boolean {
    return (
      item.x >= this.boundary.x &&
      item.x < this.boundary.x + this.boundary.width &&
      item.y >= this.boundary.y &&
      item.y < this.boundary.y + this.boundary.height
    )
  }

  private intersects(range: Boundary): boolean {
    return !(
      range.x > this.boundary.x + this.boundary.width ||
      range.x + range.width < this.boundary.x ||
      range.y > this.boundary.y + this.boundary.height ||
      range.y + range.height < this.boundary.y
    )
  }

  private inRange(item: T, range: Boundary): boolean {
    return (
      item.x >= range.x &&
      item.x < range.x + range.width &&
      item.y >= range.y &&
      item.y < range.y + range.height
    )
  }

  private subdivide(): void {
    const { x, y, width, height } = this.boundary
    const halfWidth = width / 2
    const halfHeight = height / 2

    this.northeast = new QuadTree({ 
      x: x + halfWidth, 
      y, 
      width: halfWidth, 
      height: halfHeight 
    })
    this.northwest = new QuadTree({ 
      x, 
      y, 
      width: halfWidth, 
      height: halfHeight 
    })
    this.southeast = new QuadTree({ 
      x: x + halfWidth, 
      y: y + halfHeight, 
      width: halfWidth, 
      height: halfHeight 
    })
    this.southwest = new QuadTree({ 
      x, 
      y: y + halfHeight, 
      width: halfWidth, 
      height: halfHeight 
    })

    this.divided = true
  }
}


