import React, {useCallback, useRef} from "react";
import ClayPanel from "@clayui/panel";
import ClayToolbar from "@clayui/toolbar";
import ClayIcon from "@clayui/icon";
import ClayButton, { ClayButtonWithIcon } from "@clayui/button";
import {Document, Page, Text, View, StyleSheet, BlobProvider} from "@react-pdf/renderer";
import "./AnnotationTranscript.css";

const styles = StyleSheet.create({
    page: {
        flexDirection: "row",
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        textAlign: "center",
        marginBottom: 10,
    },
    table: {
        display: "table",
        width: "auto",
        borderStyle: "solid",
        borderColor: "#b2b2b2",
        borderWidth: 1,
        borderRightWidth: 1, // Ensure all borders are visible
        borderBottomWidth: 1, // Ensure all borders are visible
    },

    tableCell: {
        padding: 5,
        fontSize: 12,
        width: '25%',
        textAlign: "left",
        borderWidth: 1, // Ensure all borders are visible
        borderStyle: "solid",
        borderColor: "#b2b2b2",
        wordWrap: "break-word"
    },
    tableCellId: {
        padding: 5,
        fontSize: 12,
        width: '10%',
        textAlign: "left",
        borderWidth: 1, // Ensure all borders are visible
        borderStyle: "solid",
        borderColor: "#b2b2b2",
        wordWrap: "break-word"
    },
    tableCellTime: {
        padding: 5,
        fontSize: 12,
        width: '15%',
        textAlign: "left",
        borderWidth: 1, // Ensure all borders are visible
        borderStyle: "solid",
        borderColor: "#b2b2b2",
        wordWrap: "break-word"
    },
    tableCellTitle: {
        padding: 5,
        fontSize: 12,
        width: '20%',
        textAlign: "left",
        borderWidth: 1, // Ensure all borders are visible
        borderStyle: "solid",
        borderColor: "#b2b2b2",
        wordWrap: "break-word"
    },
    tableCellRemark: {
        padding: 5,
        fontSize: 12,
        width: '55%',
        textAlign: "left",
        borderWidth: 1, // Ensure all borders are visible
        borderStyle: "solid",
        borderColor: "#b2b2b2",
        wordWrap: "break-word"
    },
    tableRow: {
        display: "flex", // Change here
        flexDirection:"row"
    }
});

const PdfDocument = ({ annotations }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text style={styles.title}>Annotations Table</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCellId}>ID</Text>
                        <Text style={styles.tableCellTime}>Time(s)</Text>
                        <Text style={styles.tableCellTitle}>Title</Text>
                        <Text style={styles.tableCellRemark}>Remark</Text>
                    </View>
                    {annotations.sort((a, b) => a.progress - b.progress).map((row, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={styles.tableCellId}>{index+1}</Text>
                            <Text style={styles.tableCellTime}>{row.meta.progress}</Text>
                            <Text style={styles.tableCellTitle}>{row.note.label}</Text>
                            <Text style={styles.tableCellRemark}>{row.note.remark}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </Page>
    </Document>
);

const AnnotationTranscript = ({ annotations, height, width, onClose }) => {
    const pdfRef = useRef();

    const handlePrint = useCallback(() => {
        document.getElementById('print-doc').click()
    },[pdfRef]);

    return (
        <ClayPanel className={"m-0 border bg-white w-100"} displayType="secondary">
            <ClayPanel.Body>
                <ClayToolbar>
                    <ClayToolbar.Nav>
                        <ClayToolbar.Item className="text-left" expand>
                            <ClayToolbar.Section>
                                <ClayIcon symbol="documents-and-media mr-2" />
                                <label className="component-title">{"Print Annotations"}</label>

                            </ClayToolbar.Section>
                        </ClayToolbar.Item>
                        <ClayToolbar.Item>
                            <ClayToolbar.Section>
                                <ClayButtonWithIcon
                                    aria-label="Download"
                                    symbol="download"
                                    title="Download"
                                    displayType="unstyled"
                                    size={'sm'}
                                    onClick={handlePrint}/>
                                <ClayButtonWithIcon
                                    aria-label="Close"
                                    symbol="times"
                                    title="Close"
                                    displayType="unstyled"
                                    size={'sm'}
                                    onClick={()=>{
                                        onClose();
                                    }}/>
                            </ClayToolbar.Section>
                        </ClayToolbar.Item>
                    </ClayToolbar.Nav>
                </ClayToolbar>
                <div className="mt-2">
                    <div
                        className={"annotation-print-container"}
                        style={{ height: height - 50, overflow: "scroll" }}
                    >
                        <BlobProvider document={<PdfDocument annotations={annotations} />} targetRef={pdfRef}>
                            {({ blob, url, loading, error }) => (
                                <>
                                    <button style={{display:'none'}} id={'print-doc'} onClick={() => {
                                        const link = document.createElement("a");
                                        link.href = url;
                                        link.download = "annotations.pdf";
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}>print</button>
                                    <PdfDocument annotations={annotations} ref={pdfRef} />
                                </>
                            )}
                        </BlobProvider>
                    </div>
                </div>
            </ClayPanel.Body>
        </ClayPanel>
    );
};

export default AnnotationTranscript;
