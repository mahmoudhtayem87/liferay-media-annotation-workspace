import ClayPanel from "@clayui/panel";
import React from "react";
import {useFormik} from "formik";
import ClayPanelHeader from "@clayui/panel/lib/Header";

const NewAnnotation = ({onSubmit,onClose}) => {

    const {values, errors, handleChange, handleSubmit, touched, resetForm} =
        useFormik({
            initialValues: {
                title: '',
                remark: '',
                color: '#00eb7d'
            }, validate: (values) => {
                const errors = {};
                if (!values.title) {
                    errors.title = "Required";
                }
                if (!values.remark) {
                    errors.remark = "Required";
                }
                if (!values.color) {
                    errors.color = "Required";
                }
                return errors;
            },
            onSubmit: values => {
                onSubmit(values);
                resetForm();
            }
        })

    return (
        <ClayPanel   className={'m-0 border'} displayType="secondary">
            <ClayPanelHeader className={'border'}>
                New Annotation
            </ClayPanelHeader>
            <ClayPanel.Body>
                <form onSubmit={handleSubmit}>
                    <div class={(errors.title && touched.title) ? "form-group has-error" : "form-group"}>
                        <label htmlFor="title">Annotation Title</label>
                        <input
                            value={values.title}
                            onChange={handleChange}
                            id="title"
                            placeholder="Enter annotation title"
                            className={'form-control'}
                        />
                        {errors.title && touched.title &&
                            <div className="form-feedback-item mt-1">
                                {errors.title}
                            </div>
                        }
                    </div>
                    <div className={(errors.remark && touched.remark) ? "form-group has-error" : "form-group"}>
                        <label htmlFor="remark">Annotation</label>
                        <textarea
                            value={values.remark}
                            rows={5}
                            onChange={handleChange}
                            id="remark"
                            placeholder="Enter annotation"
                            className={'form-control'}
                        /> {errors.remark && touched.remark &&
                        <div className="form-feedback-item mt-1">
                            {errors.remark}
                        </div>
                    }
                    </div>
                    <div className={(errors.color && touched.color) ? "form-group has-error" : "form-group"}>
                        <label htmlFor="color">Annotation color</label>
                        <input
                            value={values.color}
                            onChange={handleChange}
                            id="color"
                            type="color"
                            placeholder="Enter annotation title"
                            className={'form-control'}
                        />
                        {errors.color && touched.color &&
                            <div className="form-feedback-item mt-1">
                                {errors.color}
                            </div>
                        }
                    </div>
                    <div style={{ display: 'flex',justifyContent:'space-between' }}>
                        <button onClick={()=>{onClose()}} className={'btn btn-danger'} type="button">Close</button>
                        <button className={'btn btn-primary'} type="submit">Submit</button>
                    </div>
                </form>
            </ClayPanel.Body>
        </ClayPanel>
    )
}

export default NewAnnotation;
