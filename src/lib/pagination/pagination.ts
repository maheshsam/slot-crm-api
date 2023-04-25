import { IPaginationLinks, IPaginationMeta, IPaginationPayload } from "./pagination-option.interface";

export class Pagination<PaginationObject> {
	constructor(
		/**
		 * associated meta information (e.g., counts)
		 */
		public readonly payload: IPaginationPayload,
		/**
		 * a list of items to be returned
		 */
		public readonly data: PaginationObject[],
		/**
		 * associated links
		 */
		// public readonly links?: IPaginationLinks,
	) {}
}
