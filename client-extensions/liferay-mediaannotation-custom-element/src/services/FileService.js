/* global Liferay */
import {request} from "../util/request";
import {config} from "../util/constants";

export async function getRootFolders() {
    return request({
        url: `${config.folderApi}/sites/${Liferay.ThemeDisplay.getScopeGroupId()}/document-folders?page=0`,
    });
}

export async function getRootFiles() {
    return request({
        url: `${config.folderApi}/sites/${Liferay.ThemeDisplay.getScopeGroupId()}/documents?page=0`,
    });
}

export async function getFiles(parentFolderId) {
    return request({
        url: `${config.folderApi}/document-folders/${parentFolderId}/documents?page=0`,
    });
}

export async function getSubfolders(parentFolderId) {
    return request({
        url: `${config.folderApi}/document-folders/${parentFolderId}/document-folders?page=0`,
    });
}
