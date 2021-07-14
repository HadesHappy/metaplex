import React from 'react';
import { Form, Input, Button, Upload } from 'antd'
import './index.less'

export const ArtistAlleyForm = () => {
  const { TextArea } = Input;

  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
  };

  const handleFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <div className='artist-alley-container'>
      <div className={ 'title' }> Submit your original artwork to be featured by Todd MacFarlane</div>
      <Form
        layout='vertical'
        onFinish={ onFinish }
        className='artist-alley-form'
      >
        <Form.Item
          name='name'
          label='Your Name'
        >
          <Input placeholder='Enter your name' className='input-content'/>
        </Form.Item>

        <Form.Item
          name='email'
          label='Your Email Address'
        >
          <Input placeholder='name@email.com' className='input-content'/>
        </Form.Item>

        <Form.Item
          name='url'
          label='Link to your portfolio'
        >
          <Input placeholder='Enter a link to your portfolio' className='input-content'/>
        </Form.Item>

        <Form.Item label='Upload artwork (optional)'>
          <Form.Item name='dragger' valuePropName='fileList' getValueFromEvent={ handleFile } className='dragger'>
            <Upload.Dragger name='files' action='/upload.do' >
              <p className='ant-upload-text'>Upload files here</p>
              <p className='ant-upload-hint'>Drag and drop, or click to browse</p>
            </Upload.Dragger>
          </Form.Item>
        </Form.Item>

        <Form.Item
          name='message'
          label='Anything else to add?'
        >
          <TextArea rows={4} placeholder='Max 500 characters' className='input-content'/>
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit' className='form-button'>
            SUBMIT
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
