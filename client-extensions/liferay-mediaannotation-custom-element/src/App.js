/* global Liferay */

import VideoAnnotation from "./components/annotation/video/VideoAnnotation";
import {ClayIconSpriteContext} from '@clayui/icon';
import FileBrowser from "./components/file-browser/FileBrowser";
import {ClayModalProvider} from "@clayui/modal";

function App() {
    return (
        <ClayIconSpriteContext.Provider value={Liferay.Icons.spritemap}>
            <ClayModalProvider>
                <VideoAnnotation></VideoAnnotation>
            </ClayModalProvider>
        </ClayIconSpriteContext.Provider>
    );
}

export default App;
