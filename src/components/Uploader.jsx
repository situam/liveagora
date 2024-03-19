import { useRef, useState } from 'react'
import { pb } from '../services/pocketbase'
import { FileDrop } from 'react-file-drop'
import { formatBytes } from '../util/utils'
import './Uploader.css'

export const Uploader = ({onUploaded, isVisible, onClose}) => {
  const fileInputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [numUploaded, setNumUploaded] = useState(0)
  const [total, setTotal] = useState(1)

  const onSubmit = async (e) => {
    e.preventDefault()

    setTotal(files.length)
    setIsUploading(true)
    console.log("[Uploader] onSubmit", files)

    let nUploaded = 0 

    await Promise.all(
      Array.from(files).map(async (file) => {
        if (file.type.includes('image')) {
          if (file.size > 5242880 * 2) {
            alert('image upload rejected (file > 10MB)')
            return
          }

          const res = await fetch(`${import.meta.env.VITE_APP_URL}/.netlify/functions/getImageUploadUrl`);
          if (res.status !== 200) {
            alert(await res.json())
            throw new Error("getUploadUrl failed");
          }

          const data = await res.json();
          const { id, uploadURL } = data.result;

          const formData = new FormData()
          formData.append("file", file, file.name);

          const res2 = await fetch(uploadURL, {
            method: 'post',
            body: formData,
          });

          if (res2.status !== 200) {
            throw new Error("Upload failed");
          }

          onUploaded('image', {link: `https://imagedelivery.net/B7Du2acbdC64cz50SK5nLg/${id}/public`}, nUploaded++)
          setNumUploaded(nUploaded)
        }

        if (file.type.includes('video')) {
          if (file.size > 200000000) {
            alert('image upload rejected (file > 200MB)')
            return
          }

          const res = await fetch(`${import.meta.env.VITE_APP_URL}/.netlify/functions/getVideoUploadUrl`);
          if (res.status !== 200) {
            alert(await res.json())
            throw new Error("getUploadUrl failed");
          }

          const data = await res.json();
          const { uid, uploadURL } = data.result;

          const formData = new FormData()
          formData.append("file", file, file.name);

          const res2 = await fetch(uploadURL, {
            method: 'post',
            body: formData,
          });

          if (res2.status !== 200) {
            throw new Error("Upload failed");
          }
          
          onUploaded('video', {hls: `https://customer-zfntyssyigsp3hnq.cloudflarestream.com/${uid}/manifest/video.m3u8`}, nUploaded++)
          setNumUploaded(nUploaded)

          // TODO: subscribe to webhook notification when processing complete (ready to stream)
          // see https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/
        }

        if (file.type.includes('sound')) {
          alert('not implemented yet')
          /*
          const formData = new FormData()
          formData.append("file", file, file.name);
          const record = await pb.collection('sounds').create(formData);

          let urlOptions = {}
          url = pb.getFileUrl(record, record[type], urlOptions)  

          onUploaded('sound', {link: url}, nUploaded++)
          setNumUploaded(nUploaded)
          */
        }
      }
    ))

    onClose()
  }
  
  const onFileInputChange = (event) => {
    const { files } = event.target;
    setFiles(files)
  }

  const onTargetClick = (e) => {
    e.preventDefault()
    fileInputRef.current.click()
  }

  const onDrop = (files, event) => {
    event.preventDefault();
    //console.log(files)
    setFiles(files)
  }

  return (
    <>
      {
        isVisible &&
        <div onClick={e => e.stopPropagation()}>
          <form onSubmit={onSubmit}>
            <FileDrop onTargetClick={onTargetClick} onDrop={onDrop}>
              { files.length>0 ?
                  Array.from(files).map(({name, size, type}, idx)=>
                  <div key={idx}>
                    <pre>{name}</pre>
                    <pre>{type}, {formatBytes(size)}</pre>
                  </div>)
                :
                <><button>select an image/video/mp3</button>or drag and drop here (size limit 5 mb)</>
              }
            </FileDrop>
            <input style={{display:'none'}} onChange={onFileInputChange} ref={fileInputRef} type="file" name="file" accept="image/*,video/*,audio/mpeg" multiple="multiple"/>
            {
              isUploading ?
                <pre>Uploading... ({numUploaded}/{total})</pre>
              :
                <>
                  {files.length>0 && <button type="submit">upload</button>}
                  <button className="btn-secondary" onClick={onClose}>cancel</button>
                </>
            }
          </form>
        </div>
      }
    </>
  )
}
