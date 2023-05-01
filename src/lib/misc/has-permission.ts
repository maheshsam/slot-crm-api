import {User} from '../../entity/User';

export const hasPermission = (
	loggedInUser: User,
	permission: string,
): boolean => {
    return loggedInUser.permissions?.some(el => el.name === permission);
}