import {User} from '../../entity/User';

export const hasPermission = (
	loggedInUser: User,
	permission: string,
): boolean => {
	return loggedInUser.roles.some(item => item.permissions.some(el => el.name === permission) || loggedInUser.permissions?.some(el => el.name === permission));
    // return loggedInUser.permissions?.some(el => el.name === permission)
	//  || loggedInUser.roles?.permissions?.some(el => el.name === permission);
}