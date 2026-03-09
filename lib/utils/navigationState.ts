/**
 * Navigation State Preservation Utilities
 * 
 * These utilities help preserve pagination and scroll state when navigating
 * between list views and detail/edit views.
 * 
 * Example Usage:
 * 
 * 1. From a paginated list, navigate to edit:
 *    ```tsx
 *    const currentPage = 4
 *    const editUrl = buildEditUrl('/admin/items/123/edit', {
 *      page: currentPage,
 *      tab: 'details',
 *      filter: 'active'
 *    })
 *    router.push(editUrl)
 *    // Result: /admin/items/123/edit?page=4&tab=details&filter=active
 *    ```
 * 
 * 2. From edit page, return to list with preserved state:
 *    ```tsx
 *    const searchParams = useSearchParams()
 *    const returnState = extractReturnState(searchParams, ['page', 'tab', 'filter'])
 *    
 *    const handleBack = () => {
 *      const listUrl = buildReturnUrl('/admin/items', returnState)
 *      router.push(listUrl)
 *      // Returns to: /admin/items?page=4&tab=details&filter=active
 *    }
 *    ```
 * 
 * 3. Or use returnUrl pattern (recommended for complex navigation):
 *    ```tsx
 *    // From list:
 *    const returnUrl = encodeURIComponent(`/admin/items?page=${currentPage}`)
 *    router.push(`/admin/items/123/edit?returnUrl=${returnUrl}`)
 *    
 *    // From edit:
 *    const returnUrl = searchParams.get('returnUrl')
 *    if (returnUrl) {
 *      router.push(returnUrl)
 *    }
 *    ```
 */

/**
 * Builds an edit/detail URL with state parameters for returning to the list.
 * 
 * @param baseUrl - The edit/detail page URL (e.g., '/admin/chapters/123/edit')
 * @param state - State to preserve (e.g., { page: 4, tab: 'steps', filter: 'published' })
 * @returns URL with state parameters (e.g., '/admin/chapters/123/edit?page=4&tab=steps')
 */
export function buildEditUrl(baseUrl: string, state: Record<string, string | number | boolean | null | undefined>): string {
  const params = new URLSearchParams()
  
  for (const [key, value] of Object.entries(state)) {
    if (value != null && value !== '') {
      params.set(key, String(value))
    }
  }
  
  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

/**
 * Builds a return URL with a returnUrl parameter (recommended for complex flows).
 * 
 * @param editUrl - The edit/detail page URL
 * @param returnUrl - The full URL to return to (will be encoded)
 * @returns URL with returnUrl parameter
 */
export function buildEditUrlWithReturn(editUrl: string, returnUrl: string): string {
  const separator = editUrl.includes('?') ? '&' : '?'
  return `${editUrl}${separator}returnUrl=${encodeURIComponent(returnUrl)}`
}

/**
 * Extracts navigation state from URL search params.
 * 
 * @param searchParams - URLSearchParams from useSearchParams()
 * @param keys - Keys to extract (e.g., ['page', 'tab', 'filter'])
 * @returns Object with extracted values
 */
export function extractReturnState(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  keys: string[]
): Record<string, string> {
  const state: Record<string, string> = {}
  
  for (const key of keys) {
    const value = searchParams.get(key)
    if (value != null) {
      state[key] = value
    }
  }
  
  return state
}

/**
 * Builds a return/list URL with preserved state.
 * 
 * @param baseUrl - The list page URL (e.g., '/admin/chapters')
 * @param state - State to restore (e.g., { page: '4', tab: 'steps' })
 * @returns URL with state parameters
 */
export function buildReturnUrl(baseUrl: string, state: Record<string, string | number | null | undefined>): string {
  const params = new URLSearchParams()
  
  for (const [key, value] of Object.entries(state)) {
    if (value != null && value !== '') {
      params.set(key, String(value))
    }
  }
  
  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

/**
 * Hook-style helper for managing return navigation (use in edit pages).
 * 
 * @example
 * ```tsx
 * const searchParams = useSearchParams()
 * const returnNav = useReturnNavigation(searchParams, '/admin/chapters')
 * 
 * // Option 1: Use explicit returnUrl if provided
 * if (returnNav.returnUrl) {
 *   router.push(returnNav.returnUrl)
 * }
 * 
 * // Option 2: Build URL from extracted state
 * router.push(returnNav.buildUrl({ page: '4', tab: 'steps' }))
 * ```
 */
export function useReturnNavigation(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  defaultReturnUrl: string
) {
  const returnUrl = searchParams.get('returnUrl')
  
  return {
    returnUrl,
    hasReturnUrl: !!returnUrl,
    extractState: (keys: string[]) => extractReturnState(searchParams, keys),
    buildUrl: (state: Record<string, string | number | null | undefined>) => 
      buildReturnUrl(defaultReturnUrl, state),
  }
}

/**
 * Type-safe pagination state helpers
 */
export interface PaginationState {
  page: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function extractPaginationState(searchParams: URLSearchParams | ReadonlyURLSearchParams): PaginationState {
  return {
    page: parseInt(searchParams.get('page') || '1', 10),
    pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
  }
}

export function buildPaginationUrl(baseUrl: string, state: Partial<PaginationState>): string {
  return buildReturnUrl(baseUrl, {
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  })
}
