/* global Liferay */

import axios from 'axios';

export function request(config) {
    return new Promise((resolve, reject) => {
        axios
            .request({
                headers: {
                    'x-csrf-token': Liferay.authToken,
                },
                method: 'get',
                ...config,
            })
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
