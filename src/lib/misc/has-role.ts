import {User} from '../../entity/User';

export const hasRole = (
	loggedInUser: User,
	role: string,
): boolean => {
    return loggedInUser.roles?.some(el => el.name === role);
}

export const hasSuperRole = (
	loggedInUser: User,
): boolean => {
	return loggedInUser.roles?.some(el => el.is_super === true);
}