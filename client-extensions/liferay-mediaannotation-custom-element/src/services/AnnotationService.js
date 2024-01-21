
import {config} from "../util/constants";
import {request} from "../util/request";


export function postAnnotation(assetId,data,selectedCoordinates,annotationWindowWidth,annotationWindowHeight)
{
    let normalizedData = {
        assetID: assetId,
        title:data.title,
        annotation:data.remark,
        color:data.color,
        annotationXCoordinate:selectedCoordinates.clientX,
        annotationYCoordinate:selectedCoordinates.clientY,
        windowWidth:annotationWindowWidth,
        windowHeight:annotationWindowHeight,
        timeSeconds:data.progress

    }
    return request({
        data: normalizedData,
        method: 'post',
        url: `${config.annotationApi}`,
    });
}

export async function updateAnnotation(assetId, annotation,annotationWindowWidth,annotationWindowHeight) {
    let normalizedData = {
        assetID: assetId,
        title:annotation.note.label,
        annotation:annotation.note.remark,
        color:annotation.color
    }
    return request({
        data: normalizedData,
        method: 'patch',
        url: `${config.annotationApi}/${annotation.id}`,
    });
}

export async function deleteAnnotation(annotation) {
    return request({
        method: 'delete',
        url: `${config.annotationApi}/${annotation.id}`,
    });
}

export async function getAnnotations(assetId) {
    return request({
        url: `${config.annotationApi}?page=0&filter=assetID eq ${assetId}`,
    });
}
