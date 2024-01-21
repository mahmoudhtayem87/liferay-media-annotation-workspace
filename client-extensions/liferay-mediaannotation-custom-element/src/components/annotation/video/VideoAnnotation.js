/* global Liferay */

import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import ClayPanel from '@clayui/panel';
import ClayList from '@clayui/list';
import {Button, Icon, ModalContext, Text, VerticalBar} from '@clayui/core';
import * as d3 from 'd3';
import {
    annotation,
    annotationBadge,
    annotationCalloutElbow
} from 'd3-svg-annotation';

import './VideoAnnotation.css';
import NewAnnotation from "./new-annotation/NewAnnotation";
import EditAnnotation from "./edit-annotation/EditAnnotation";
import ClayPanelHeader from "@clayui/panel/lib/Header";
import {
    deleteAnnotation, getAnnotations,
    postAnnotation,
    updateAnnotation,
} from "../../../services/AnnotationService";
import FileBrowser from "../../file-browser/FileBrowser";
import AnnotationTranscript from "./annotation-transcript/AnnotationTranscript";

const ANNOTATION_WIDTH = 650;

const ANNOTATION_HEIGHT = 550;

const ANNOTATION_WINDOW = 1;

const supportedVideoMIMETypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/theora',
    'video/x-matroska',
    'video/3gpp',
    'video/quicktime',
    'video/avi',
    'video/x-msvideo',
    'video/x-flv',
    'video/x-ms-wmv',
    'video/vnd.rn-realvideo'
];

const VideoAnnotation = ({annotationWindowWidth = ANNOTATION_WIDTH,annotationWindowHeight = ANNOTATION_HEIGHT,url = 'http://localhost:8080/documents/d/guest/sample-5s'}) => {
    const chartRef = useRef(null);

    const playerRef = useRef(null);

    const [modalState, dispatchModal] = useContext(ModalContext);

    const [isPrintingTranscript,setIsPrintingTranscript] = useState(false)

    const [progress, setProgress] = useState(0);

    const [isMuted, setIsMuted] = useState(true);

    const [videoDuration,setVideoDuration] = useState(null);

    const [selectedAnnotation,setSelectedAnnotation] = useState(null);

    const [selectedCoordinates,setSelectedCoordinate] = useState(null);

    const [isEditOrCreate, setIsEditOrCreate] = useState(false);

    const [isEdit, setIsEdit] = useState(false);

    const [isCreate, setIsCreate] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);

    const [isVideoEnded, setIsVideoEnded] = useState(false);

    const [points, setPoints] = useState([]);

    const [asset,setAsset] = useState(0);

    const reset = ()=>{

        setIsEditOrCreate(false);

        setSelectedAnnotation(null);

        setIsCreate(false);

        setPoints([]);

        setIsEdit(false);

        setIsPlaying(false);

        setIsVideoEnded(false);

        setSelectedCoordinate(null);

        setProgress(0);

    }
    const handleAnnotationClick = useCallback((event, d) => {
        let e = event.target;
        let boundingSVG = e.getBoundingClientRect();
        // 'event' is the D3 event object, 'd' is the data associated with the annotation
        // You can perform actions based on the clicked annotation here
        event.stopPropagation();

    }, [])

    const handleReplay = useCallback(() => {
        if (playerRef) {
            playerRef.current.currentTime = 0;
            setIsPlaying(true);
            playerRef.current.play();
        }
    }, [playerRef])

    const handleSelectAnnotation = useCallback((point) => {
        if (playerRef) {
            playerRef.current.pause();
            playerRef.current.currentTime = point.meta.progress;
            handleProgress();
        }

    }, [playerRef, isPlaying])

    const handleEnded = () => {
        setIsPlaying(false);
    };

    const handleProgress = useCallback(() => {
        if (playerRef.current) {
            const progress = Number(playerRef.current.currentTime).toFixed(4);
            setProgress(prev=> parseFloat(progress));
            const minProgress = progress - ANNOTATION_WINDOW;
            const maxProgress = progress + ANNOTATION_WINDOW;
            let currentPoints = points.filter(
                annotation => annotation.meta.progress >= minProgress && annotation.meta.progress <= maxProgress
            );
            renderAnnotations(currentPoints);
        }
    }, [playerRef, points])

    const handleSliderChange = useCallback((event)=>{
        if (playerRef && playerRef.current) {
            const value = parseFloat(event.target.value);
            if (!isNaN(value) && isFinite(value)) {
                playerRef.current.currentTime = value;
            }
        }

    },[playerRef])
    const handlePlayAction = useCallback(() => {
        if (playerRef) {
            if (isPlaying) {
                playerRef.current.pause()
                setIsPlaying(false);
            } else {
                playerRef.current.play();
                setIsPlaying(true);
            }

        }
    }, [playerRef, isPlaying])

    const handleRewindAction = useCallback(() => {
        if (playerRef) {
            const video = playerRef.current;
            video.pause();
            video.currentTime = video.currentTime >= 5?video.currentTime - 5: 0;
            video.play()
        }
    }, [playerRef])

    const handleStopAction = useCallback(() => {
        if (playerRef) {
            const video = playerRef.current;
            video.currentTime = 0;
            setIsPlaying(false);
            video.pause();
        }
    }, [playerRef])

    const handleFastForwardAction = useCallback(() => {
        if (playerRef) {
            const video = playerRef.current;
            video.pause();
            video.currentTime = video.currentTime + 5 < video.duration?video.currentTime + 5: video.duration;
            video.play();
        }
    }, [playerRef])

    const handleVideoMetaLoaded = useCallback(()=>{
        if (playerRef) {
            setVideoDuration(prev=>playerRef.current.duration)
        }

    },[playerRef])

    const handleCloseFileBrowser = ()=>{

        setIsEditOrCreate(false);

        setSelectedCoordinate(null);

        setIsCreate(false);

        setIsEdit(false);

        modalState.onClose(true);

    }

    const handleFileSelect = (file)=>{

        setAsset(file);

        handleCloseFileBrowser();

    }

    const handleClose = ()=>{

        setIsEditOrCreate(false);

        setSelectedCoordinate(null);

        setIsCreate(false);

        setIsEdit(false);

    }

    const handleSvgClick = useCallback((event)=>{
        if (!isEditOrCreate)
        {
            playerRef.current?.pause();

            setIsPlaying(false);

            if (!isVideoEnded)
            {
                setIsEditOrCreate(true);

                setIsCreate(true);

                const svg = chartRef.current;

                const svgRect = svg.getBoundingClientRect();

                const point = svg.createSVGPoint();

                point.x = event.clientX;

                point.y = event.clientY;

                const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

                const coordinate = {
                    clientX: svgPoint.x,
                    clientY: svgPoint.y,
                }

                setSelectedCoordinate(coordinate);
            }
        }
    },[playerRef, isVideoEnded,isEditOrCreate])

    const handleNewAnnotationSubmit = useCallback((data)=>{

        data['progress'] = Number(playerRef.current.currentTime).toFixed(4);

        postAnnotation(asset.id,data,selectedCoordinates,annotationWindowWidth,annotationWindowHeight).then((result)=>{
            data['id']= result.id;
            addNewAnnotation(data,selectedCoordinates);
            handleClose();
        });


    },[selectedCoordinates,playerRef,asset]);

    const handleOpenTranscript = () => {
        setIsPrintingTranscript(true);
    }

    const handleCloseFile = ()=>{

        reset();

        setAsset(null);

    }

    const handleVideoLoadError = (error)=>{

        console.log('')

        Liferay.Util.openToast({title:'Error',message:'Your browser does not support this video format!',type:'danger'})

        reset();

        setAsset(null);

    }

    const toggleMute = useCallback(() => {
        setIsMuted(!isMuted);
    },[isMuted]);

    const handleOpenEdit = useCallback((annotation)=>{

        setSelectedAnnotation(annotation);

        setIsEditOrCreate(true);

        setIsEdit(true);

    },[])

    const handleDelete = useCallback((annotation)=>{

        deleteAnnotation(annotation).then(()=>{

            const updatedData = points.filter(item => Number(item.id) !== Number(annotation.id));

            setPoints(updatedData);
        });

    },[points])

    const handleEditSubmit = useCallback((annotation)=>{

        updateAnnotation(asset.id,annotation,annotationWindowWidth,annotationWindowHeight).then(result=>{

            const updatedData = points.map(item =>
                Number(item.id) === Number(annotation.id) ? { ...annotation } : item
            );

            setPoints(updatedData);

        })

    },[points])

    const addNewAnnotation = useCallback((data,event) => {

        if (!isVideoEnded) {

            setIsPlaying(false);

            playerRef.current.pause();

            const progress = Number(playerRef.current.currentTime).toFixed(4);

            const x = event.clientX;

            const y = event.clientY;

            setPoints((prev) => [{
                id: data.id,
                meta: {progress: progress},
                note: {label: data.title, remark: data.remark},
                x: x ,
                y: y ,
                color: data.color,
                dy: 50,
                dx: 100,
                type: annotationCalloutElbow,
                connector: {end: "arrow", type: "circle"}
            }, ...prev]);

        }
    }, [points, playerRef, isVideoEnded,chartRef]);

    const renderAnnotations = useCallback((points) => {
        const svg = d3
            .select(chartRef.current)
            .attr('width', annotationWindowWidth)
            .attr('height', annotationWindowHeight);

        const makeAnnotations = annotation()
            .annotations(points.map((d) => [
                {
                    ...d,
                    x: d.x,
                    y: d.y,
                    note: {...d.note, title: '', label: d.note.label},
                    connector: {end: 'arrow'},
                },
                {
                    type: annotationBadge,
                    color: d.color,
                    x: d.x,
                    y: d.y,
                    r: 100, // Adjust the radius as needed
                },
            ]).flat());

        svg.call(makeAnnotations);

        svg.selectAll('.annotation').on('click', handleAnnotationClick);


    }, [])

    const handleOpenFileBrowser = () => {
        dispatchModal({
            payload: {
                body:<FileBrowser onClose={handleCloseFileBrowser} supportedVideoMIMETypes={supportedVideoMIMETypes} onFileSelect={handleFileSelect}></FileBrowser>,
                header: 'File Browser',
                size: 'lg',
            },
            type: 'OPEN',
        });
    };

    useEffect(() => {
        handleProgress();
    }, [points])
    useEffect(() => {

        reset();

        if (asset)
        {
            getAnnotations(asset.id).then(data=>{
                if (data.totalCount > 0) {

                    let loadedPoints = data.items.map(item=> {

                        const svgRect = chartRef.current.getBoundingClientRect();

                        const progress = item.timeSeconds;

                        const x = item.annotationXCoordinate;

                        const y = item.annotationYCoordinate;

                        return {
                            id: item.id,
                            meta: {progress: progress},
                            note: {label: item.title, remark: item.annotation},
                            x: x,
                            y: y,
                            color: item.color,
                            dy: 50,
                            dx: 100,
                            type: annotationCalloutElbow,
                            connector: {end: "arrow", type: "circle"}
                        }
                    });

                    setPoints(loadedPoints);

                }else{

                    renderAnnotations([]);

                }
            });
        }

        return () => {
        };

    }, [chartRef,asset]); // Run the effect only once on mount

    return (
        <div>
            {isPrintingTranscript && (
                <div className={'file-browser-container'}>
                    <AnnotationTranscript onClose={()=>{setIsPrintingTranscript(false)}} annotations={points} width={annotationWindowWidth - 100} height={annotationWindowHeight} className={'m-auto'}></AnnotationTranscript>
                </div>
            )}
            <div className={'layout-container bg-dark'}>
                <div className={'player-controls'}>
                    <VerticalBar absolute={true}>
                        <VerticalBar.Bar>
                            {!asset && (
                                <VerticalBar.Item divider>
                                    <Button  aria-label="Select Video File" title="Select Video File" onClick={handleOpenFileBrowser} displayType={null}>
                                        <Icon symbol={'documents-and-media'}/>
                                    </Button>
                                </VerticalBar.Item>
                            )}

                            {asset && (
                                <VerticalBar.Item divider>
                                    <Button  aria-label="Close Video File" title="Close Video File" onClick={handleCloseFile} displayType={null}>
                                        <Icon symbol={'times'}/>
                                    </Button>
                                </VerticalBar.Item>
                            )}

                            <VerticalBar.Item divider>
                                <Button disabled={isEditOrCreate || !asset} aria-label="Print" title="Print" onClick={handleOpenTranscript} displayType={null}>
                                    <Icon symbol={'print'}/>
                                </Button>
                            </VerticalBar.Item>

                            <VerticalBar.Item divider>
                                <Button className={isMuted ? 'active' : ''} disabled={isEditOrCreate || !asset} aria-label={isMuted ? 'Unmute' : 'Mute'} title={isMuted ? 'Unmute' : 'Mute'} onClick={toggleMute} displayType={null}>
                                    <Icon symbol='audio'/>
                                </Button>
                            </VerticalBar.Item>

                            <VerticalBar.Item divider>
                                <Button disabled={isEditOrCreate || !asset} aria-label="Play / Pause" title="Play / Pause" onClick={handlePlayAction} displayType={null}>
                                    <Icon symbol={isPlaying ? 'pause' : 'play'}/>
                                </Button>
                            </VerticalBar.Item>

                            <VerticalBar.Item>
                                <Button disabled={isEditOrCreate || !asset} aria-label="Rewind" title="Rewind" onClick={handleRewindAction} displayType={null}>
                                    <Icon symbol={'angle-double-left'}/>
                                </Button>
                            </VerticalBar.Item>

                            <VerticalBar.Item>
                                <Button disabled={isEditOrCreate || !asset} aria-label="Stop" title="Stop" onClick={handleStopAction} displayType={null}>
                                    <Icon symbol={'square'}/>
                                </Button>
                            </VerticalBar.Item>

                            <VerticalBar.Item>
                                <Button disabled={isEditOrCreate || !asset} aria-label="Fast Forward" title="Fast Forward" onClick={handleFastForwardAction} displayType={null}>
                                    <Icon symbol={'angle-double-right'}/>
                                </Button>
                            </VerticalBar.Item>


                            <VerticalBar.Item>
                                <Button disabled={isEditOrCreate || !asset} aria-label="Replay" title="Replay" onClick={handleReplay} displayType={null}>
                                    <Icon symbol="reply"/>
                                </Button>
                            </VerticalBar.Item>

                        </VerticalBar.Bar>
                    </VerticalBar>
                </div>
                <div className={'content-col'}>
                    <div className={'annotation-main-container'}>
                        <div className={'annotation-container'}
                             style={{width: annotationWindowWidth, height: (annotationWindowHeight + 50), position: 'relative'}}>
                            {
                                asset && (
                                    <video
                                        onError={handleVideoLoadError}
                                        ref={playerRef}
                                        controls={false}
                                        autoPlay={false}
                                        width={annotationWindowWidth}
                                        height={annotationWindowHeight}
                                        onTimeUpdate={handleProgress}
                                        onLoadedMetadata={handleVideoMetaLoaded}
                                        onEnded={handleEnded}
                                        muted={isMuted}
                                    >
                                        <source src={asset.contentUrl} type={asset.encodingFormat}/>
                                        Your browser does not support this video format!.
                                    </video>
                                )
                            }
                            {asset && (
                                <svg style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    overflow:'visible',
                                    width: annotationWindowWidth,
                                    height: annotationWindowHeight,
                                }} onClick={handleSvgClick} ref={chartRef}>
                                    <rect order={-1} width={annotationWindowWidth} height={annotationWindowHeight} fill={'transparent'}
                                          color={'transparent'}></rect>
                                </svg>
                            )}

                            {isEditOrCreate && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    overflow:'visible',
                                    width: annotationWindowWidth,
                                    height: annotationWindowHeight,
                                }} className={'svg-block'}>
                                    <Text className={'m-auto'} size={4}>Create / Edit Annotation</Text>
                                </div>
                            )}
                            {!asset && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    overflow:'visible',
                                    width: annotationWindowWidth,
                                    height: annotationWindowHeight,
                                }} className={'no-file-selected'}>
                                    <Text className={'m-auto'} size={4}>Please select a video to annotate [ <Icon symbol={'documents-and-media'}/> ]</Text>
                                </div>
                            )}
                        </div>
                        <div className={'video-progress-bar'}>
                            {asset &&  videoDuration && (
                                <input
                                    type="range"
                                    step={0.0001}
                                    min="0"
                                    title={progress}
                                    aria-label={progress}
                                    max={videoDuration}
                                    value={progress}
                                    onLoadedMetadata={handleVideoMetaLoaded}
                                    onChange={handleSliderChange}
                                    className="slider"
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div className={'panel-col p-2'}>
                    <div className={'bg-white'}>
                        {isEditOrCreate && isEdit && selectedAnnotation && <EditAnnotation annotation={selectedAnnotation} onSubmit={handleEditSubmit} onClose={handleClose}></EditAnnotation>}
                        {isEditOrCreate && isCreate && selectedCoordinates && <NewAnnotation onSubmit={handleNewAnnotationSubmit} onClose={handleClose}></NewAnnotation>}
                        {!isEditOrCreate && (
                            <ClayPanel className={'m-0'} displayType="secondary"
                                       style={{height: annotationWindowHeight + 50}}>
                                <ClayPanelHeader className={'border'}>
                                    Annotations
                                </ClayPanelHeader>
                                <ClayPanel.Body>
                                    <div className={'annotations-list'} style={{maxHeight: `${annotationWindowHeight + 50}px`}}>
                                        <ClayList showQuickActionsOnHover>
                                            {points.map(point =>
                                                <ClayList.Item className={'item'} flex>
                                                    <ClayList.ItemField expand>
                                                        <ClayList.ItemTitle>
                                                            <div className={'annotation-list-item-title-container'}>
                                                                <div className={'annotation-list-item-title'}>
                                                                    <a className={'annotation-handle'} onClick={() => {
                                                                        handleSelectAnnotation(point);
                                                                    }}>
                                                                        {point.note.label}
                                                                    </a>
                                                                </div>
                                                                <div className={'annotation-list-item-time'}>
                                                                    <Text size={2} truncate>
                                                                        {Number(point.meta.progress).toFixed(2)}s
                                                                    </Text>
                                                                </div>
                                                            </div>
                                                        </ClayList.ItemTitle>
                                                        <ClayList.ItemText>
                                                            <Text size={2} truncate>
                                                                {point.note.remark}
                                                            </Text>
                                                        </ClayList.ItemText>
                                                    </ClayList.ItemField>
                                                    <ClayList.ItemField>
                                                        <ClayList.QuickActionMenu>
                                                            <ClayList.QuickActionMenu.Item
                                                                aria-label="Edit"
                                                                title="Edit"
                                                                onClick={() => handleOpenEdit(point)}
                                                                symbol="pencil"
                                                            />
                                                            <ClayList.QuickActionMenu.Item
                                                                aria-label="Delete"
                                                                title="Delete"
                                                                onClick={() => handleDelete(point)}
                                                                symbol="trash"
                                                            />
                                                        </ClayList.QuickActionMenu>
                                                    </ClayList.ItemField>
                                                </ClayList.Item>
                                            )}
                                        </ClayList>
                                    </div>
                                </ClayPanel.Body>
                            </ClayPanel>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VideoAnnotation;
