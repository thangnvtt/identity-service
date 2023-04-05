const PAGE = 1
const PAGE_SIZE = 10

export class FindManyQuery {
	page?: number = PAGE
	pageSize?: number = PAGE_SIZE

	constructor(page?: number, pageSize?: number) {
		this.page = page || PAGE
		this.pageSize = pageSize || PAGE_SIZE
	}
}

export interface UserQuery extends FindManyQuery {
	orders?: string[]

	id?: string

	ids?: string[] | string

	walletAddress?: string[] | string

	email?: string

	status?: string

	signedInFrom?: number

	signedInTo?: number

	signedUpFrom?: number

	signedUpTo?: number

	defaultAddress?: string[] | string

	identifiers?: string[] | string

	isAdmin?: boolean
}
