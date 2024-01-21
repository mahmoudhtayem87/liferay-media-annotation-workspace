import React, {useCallback, useEffect, useState} from "react";
import {getFiles, getRootFiles, getRootFolders, getSubfolders} from "../../services/FileService";
import ClayIcon from "@clayui/icon";
import './FileBrowser.css';
import {ClayCardWithHorizontal} from "@clayui/card";
import ClayToolbar from "@clayui/toolbar";
import  {ClayButtonWithIcon} from '@clayui/button';

const FileBrowser = ({onFileSelect,supportedVideoMIMETypes}) => {

    const [isLoading, setIsLoading] = useState(false);

    const [folders, setFolders] = useState(null);

    const [files, setFiles] = useState(null);

    const [navigation, setNavigation] = useState([{id:0,title:'Root'}]);

    const handleGoToFolder = useCallback((index)=>{

        const updatedNavigationStack = navigation.slice(0, index+1);

        setNavigation(prevState => updatedNavigationStack);

    },[navigation])

    const handleGoBack = useCallback(()=>{

        const updatedNavigationStack = navigation.slice(0, -1);

        setNavigation(prevState => updatedNavigationStack);

    },[navigation])

    const handleGoHome = useCallback(()=>{
        setNavigation(prevState => [{id:0,title:'Root'}]);
    },[navigation])

    const openFolder = useCallback((folder)=>{

        setNavigation(prev=>[...prev,{id:folder.id,title:folder.name}]);

    },[navigation])

    const handleFileSelect = (file)=>{

        onFileSelect(file);

    }

    useEffect(() => {

        const loadFilesAndFolders = async () => {
            let currentFolder = navigation[navigation.length-1];

            setIsLoading(true);

            let folders =currentFolder.id === 0? await getRootFolders() : await getSubfolders(currentFolder.id);

            let files =currentFolder.id === 0? await getRootFiles() : await getFiles(currentFolder.id);

            files = files.items.filter(file => supportedVideoMIMETypes.includes(file.encodingFormat.toLowerCase()));

            setFolders(pre=>folders.items);

            setFiles(pre=>files);

            setIsLoading(false);
        }

        loadFilesAndFolders();

    }, [navigation]);



    return (
        <div className={'container min-height-400'}>
            <ClayToolbar>
                <ClayToolbar.Nav>
                    <ClayToolbar.Item className="text-left" expand>
                        <ClayToolbar.Section>
                            <ClayIcon symbol="documents-and-media mr-2" />
                            <label className="component-title">
                                <ol className="breadcrumb">
                                    {navigation.map((item,index)=>
                                        <li className={index === navigation.length-1?'breadcrumb-item active' :'breadcrumb-item'}>
                                            <a className="breadcrumb-link" onClick={()=>{
                                                handleGoToFolder(index)
                                            }} title="Home">
                                                <span className="breadcrumb-text-truncate">{item.title}</span>
                                            </a>
                                        </li>
                                    )}
                                </ol>
                            </label>

                        </ClayToolbar.Section>
                    </ClayToolbar.Item>
                    <ClayToolbar.Item>
                        <ClayToolbar.Section>
                            {navigation.length > 1 &&
                                <ClayButtonWithIcon
                                    aria-label="Back"
                                    symbol="undo"
                                    title="Back"
                                    displayType="unstyled"
                                    className={'mr-2'}
                                    size={'sm'}
                                    onClick={handleGoBack}/>
                            }

                            <ClayButtonWithIcon
                                aria-label="Root Folder"
                                symbol="home"
                                displayType="unstyled"
                                size={'sm'}
                                className={'mr-2'}
                                title="Root Folder"
                                onClick={handleGoHome}
                            />
                        </ClayToolbar.Section>
                    </ClayToolbar.Item>
                </ClayToolbar.Nav>
            </ClayToolbar>
            <div className="file-browser mt-2">
                {folders && (
                    folders.map(folder =>
                        <ClayCardWithHorizontal
                            className={'element'}
                            onClick={() => {
                                openFolder(folder)
                            }}
                            title={folder.name}
                        />
                    ))}
                {files && (
                    files.map(file =>
                        <ClayCardWithHorizontal
                            className={'element'}
                            onClick={() => {
                                handleFileSelect(file);
                            }}
                            title={file.title} symbol={'video'}
                        />

                    )
                )}
            </div>
        </div>
    );
}

export default FileBrowser;
