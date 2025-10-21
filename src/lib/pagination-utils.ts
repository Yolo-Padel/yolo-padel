/**
 * Generate page numbers for pagination with smart logic
 * @param currentPage - The current active page
 * @param totalPages - Total number of pages
 * @param maxVisible - Maximum number of page numbers to show (default: 6)
 * @returns Array of page numbers and ellipsis strings
 */
export function generatePageNumbers(
  currentPage: number, 
  totalPages: number, 
  maxVisible: number = 6
): (number | string)[] {
  const pages: (number | string)[] = []
  
  if (totalPages <= maxVisible) {
    // If total pages <= maxVisible, show all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // If total pages > maxVisible, show smart pagination
    if (currentPage <= 3) {
      // Show first 4 pages + ... + last page
      for (let i = 1; i <= 4; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Show first page + ... + last 4 pages
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page + ... + current-1, current, current+1 + ... + last page
      pages.push(1)
      pages.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    }
  }
  
  return pages
}

/**
 * Calculate pagination info
 * @param currentPage - Current page number
 * @param totalItems - Total number of items
 * @param pageSize - Number of items per page
 * @returns Object with pagination information
 */
export function calculatePaginationInfo(
  currentPage: number,
  totalItems: number,
  pageSize: number
) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const pageSafe = Math.min(currentPage, totalPages)
  const startIndex = (pageSafe - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  
  return {
    totalPages,
    pageSafe,
    startIndex,
    endIndex,
    hasNextPage: pageSafe < totalPages,
    hasPreviousPage: pageSafe > 1,
    showingStart: startIndex + 1,
    showingEnd: endIndex,
    totalItems
  }
}

/**
 * Get paginated data from an array
 * @param data - Array of data to paginate
 * @param currentPage - Current page number
 * @param pageSize - Number of items per page
 * @returns Paginated array
 */
export function getPaginatedData<T>(
  data: T[],
  currentPage: number,
  pageSize: number
): T[] {
  const { startIndex, endIndex } = calculatePaginationInfo(currentPage, data.length, pageSize)
  return data.slice(startIndex, endIndex)
}
