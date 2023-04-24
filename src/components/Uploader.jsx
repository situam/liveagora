import { useRef, useState } from 'react'
import { pb } from '../services/pocketbase'
import { FileDrop } from 'react-file-drop'
import { formatBytes } from '../util/utils'
import './Uploader.css'

export const Uploader = ({onUploaded, isVisible, onClose}) => {
  const fileInputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()

    if(files[0].size > 5242880 * 2){
      alert("Upload rejected (file > 10 MB)")
      return
    }

    const formData = new FormData()

    let type // also the name of the field in pocketbase
    let collection

    if (files[0].type.includes('video')) {
      type = 'video'
      collection='videos'
    }
    if (files[0].type.includes('image')) {
      type = 'image'
      collection = 'images'
    }
    if (files[0].type.includes('audio')) {
      type = 'sound'
      collection = 'sounds'
    }

    formData.append(type, files[0])

    setIsUploading(true)
    //try {
    let url
      if (type=='image') {
        const res = await fetch("./.netlify/functions/getUploadUrl");
        const data = await res.json();
        const { id, uploadURL } = data.result;
        
        if (!uploadURL) {
          throw new Error("No upload url");
        }
        const imageFormData = new FormData()
        imageFormData.append("file", files[0], files[0].name);

        const res2 = await fetch(uploadURL, {
          method: 'post',
          body: imageFormData,
        });
        console.log("2️⃣", res2.status);
        if (res2.status !== 200) {
          throw new Error("Upload failed");
        }
        url = `https://imagedelivery.net/B7Du2acbdC64cz50SK5nLg/${id}/public`

      } else {
        const record = await pb.collection(collection).create(formData);

        let urlOptions = {}
        if (type == 'image' && !files[0].type.includes('gif')) {
          urlOptions = {'thumb': '0x480'}
        }
  
        url = pb.getFileUrl(record, record[type], urlOptions)  
      }
   
      onUploaded(url, type)
      onClose()
    //} catch (e) {
    //  setIsUploading(false)
    //  setFiles([])
    //  alert(`Oh no! An error occurred: ${JSON.stringify(e)}`)
    //}
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
            <input style={{display:'none'}} onChange={onFileInputChange} ref={fileInputRef} type="file" name="file" accept="image/*,video/*,audio/mpeg" />
            {
              isUploading ?
                <pre>Uploading...</pre>
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
