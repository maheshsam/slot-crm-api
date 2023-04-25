export interface IPaginationOptions {
	/**
	 * the amount of items to be requested per page
	 */
	limit: number | string;
	/**
	 * the page that is requested
	 */
	page: number | string;
	/**
	 * a babasesic route for generating links (i.e., WITHOUT query params)
	 */
	route?: string;
}

export interface IPaginationPayload {
	/**
	 * the amount of items to be requested per page
	 */
	pagination: IPaginationMeta;
}

export interface IPaginationMeta {
	// /**
	//  * the amount of items on this specific page
	//  */
	// itemCount: number;
	// /**
	//  * the total amount of items
	//  */
	// totalItems: number;
	// /**
	//  * the amount of items that were requested per page
	//  */
	// itemsPerPage: number;
	// /**
	//  * the total amount of pages in this paginator
	//  */
	// totalPages: number;
	// /**
	//  * the current page this paginator "points" to
	//  */
	// currentPage: number;
    page: number;
    first_page_url: string;
    from: number,
    last_page: number;
    next_page_url: string;
    items_per_page: number;
    prev_page_url: string;
    to: number;
    total: number;
    links: IPaginationLinks[];
}

export interface IPaginationLinks {
	// /**
	//  * a link to the "first" page
	//  */
	// first?: string;
	// /**
	//  * a link to the "previous" page
	//  */
	// previous?: string;
	// /**
	//  * a link to the "next" page
	//  */
	// next?: string;
	// /**
	//  * a link to the "last" page
	//  */
	// last?: string;
    url: string;
    label: string;
    active:boolean;
    page:number;
}
