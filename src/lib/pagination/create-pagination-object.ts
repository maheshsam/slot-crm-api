import { Pagination } from "./pagination";
import { IPaginationLinks, IPaginationMeta, IPaginationPayload } from "./pagination-option.interface";

/**
 * It takes an array of items, a total number of items, the current page, the limit, and an optional
 * route, and returns a pagination object
 * @param {T[]} items - The items to be paginated.
 * @param {number} totalItems - The total number of items in the database.
 * @param {number} currentPage - The current page number
 * @param {number} limit - The number of items to return per page.
 * @param {string} [route] - The route to the endpoint.
 * @returns A new instance of the Pagination class.
 */
export const createPaginationObject = <T>(
	items: T[],
	totalItems: number,
	currentPage: number,
	limit: number,
): Pagination<T> => {
	const totalPages = Math.ceil(totalItems / limit);

    const paginationNumericLinks: IPaginationLinks[] = [];
    // for(let i = 1; i <= totalPages; i++){
    //     paginationNumericLinks.push({"url":`{\/?page=${i}}`,"label":String(i),"active": currentPage == i ? true : false,"page":i});
    // }

    let paginationStartPageNumber = 1;
    if(currentPage > 4){
        paginationStartPageNumber = Number(currentPage) - 2;
    }
    let paginationEndPageNumber = totalPages;
    if(totalPages > 4){
        if((paginationStartPageNumber + 5) < totalPages){
            paginationEndPageNumber = Number(paginationStartPageNumber) + 5;
        }else{
            paginationEndPageNumber = totalPages;
            paginationStartPageNumber = paginationEndPageNumber - 5;
        }
    }
    for(let i = paginationStartPageNumber; i <= paginationEndPageNumber; i++){
        paginationNumericLinks.push({"url":`{\/?page=${i}}`,"label":String(i),"active": currentPage == i ? true : false,"page":i});
    }

	const paginationlinks: IPaginationLinks[] = [
        {"url":"\/?page=1","label":"&laquo; First","active":false,"page":1},
        ...paginationNumericLinks,
        {"url":`{\/?page=${totalPages}}`,"label":"Last &raquo;","active":false,"page":totalPages}
    ];

	const meta: IPaginationMeta = {
        page: currentPage,
        first_page_url: "\/?page=1",
        // from: currentPage == 1 ? 1 : (limit * (currentPage-1)) + 1,
        from: (limit * (currentPage-1)) + 1,
        last_page: totalPages,
        next_page_url: `{\/?page=${totalPages <= currentPage ? currentPage : currentPage + 1 }}`,
        items_per_page: limit,
        prev_page_url: `{\/?page=${currentPage > 1 ? currentPage - 1 : currentPage}}`,
        to: totalItems < limit * currentPage ? totalItems : limit * currentPage,
        total: totalItems,
        links: paginationlinks
	};

    const payload: IPaginationPayload = {
        pagination: meta
    }

	return new Pagination(payload, items);
};
